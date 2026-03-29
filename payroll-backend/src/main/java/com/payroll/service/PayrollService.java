package com.payroll.service;

import com.payroll.dto.response.PayrollResponse;
import com.payroll.entity.Employee;
import com.payroll.entity.Leave;
import com.payroll.entity.Payroll;
import com.payroll.entity.TaxSlab;
import com.payroll.entity.User;
import com.payroll.enums.LeaveStatus;
import com.payroll.enums.PayrollStatus;
import com.payroll.enums.TaxRegime;
import com.payroll.exception.BusinessException;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveRepository leaveRepository;
    private final TaxSlabRepository taxSlabRepository;
    private final EmailService emailService;
    private final AuditService auditService;

    private static final String CURRENT_FY = "2024-25";

    @Transactional
    public List<PayrollResponse> processMonthlyPayroll(int month, int year, User admin) {
        List<Employee> employees = employeeRepository.findAll();
        return employees.stream()
                .filter(e -> e.getUser().isActive())
                .map(employee -> {
                    try {
                        return processEmployeePayroll(employee, month, year, admin);
                    } catch (Exception ex) {
                        log.error("Failed payroll for employee {}: {}", employee.getEmployeeCode(), ex.getMessage());
                        return null;
                    }
                })
                .filter(p -> p != null)
                .toList();
    }

    @Transactional
    public PayrollResponse processEmployeePayroll(Employee employee, int month, int year, User admin) {
        // Check if already processed
        payrollRepository.findByEmployeeIdAndMonthAndYear(employee.getId(), month, year)
                .ifPresent(existing -> {
                    if (existing.getStatus() == PayrollStatus.PROCESSED || existing.getStatus() == PayrollStatus.PAID) {
                        throw new BusinessException("Payroll already processed for " + employee.getEmployeeCode());
                    }
                });

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        int totalWorkingDays = calculateWorkingDays(startDate, endDate);

        // Calculate loss of pay days from unapproved leaves
        List<Leave> approvedLeaves = leaveRepository.findApprovedLeavesBetweenDates(
                employee.getId(), startDate, endDate);
        int leaveDays = approvedLeaves.stream().mapToInt(Leave::getTotalDays).sum();
        // Leaves within balance don't cause LOP
        int lopDays = Math.max(0, leaveDays - (employee.getCasualLeaveBalance() + employee.getSickLeaveBalance()));

        BigDecimal paidDays = BigDecimal.valueOf(totalWorkingDays - lopDays);
        BigDecimal lopDaysBd = BigDecimal.valueOf(lopDays);

        // Prorate salary
        BigDecimal dailyFactor = paidDays.divide(BigDecimal.valueOf(totalWorkingDays), 6, RoundingMode.HALF_UP);

        BigDecimal basic = employee.getBasicSalary().multiply(dailyFactor).setScale(2, RoundingMode.HALF_UP);
        BigDecimal hra = employee.getHra().multiply(dailyFactor).setScale(2, RoundingMode.HALF_UP);
        BigDecimal special = employee.getSpecialAllowance().multiply(dailyFactor).setScale(2, RoundingMode.HALF_UP);
        BigDecimal transport = employee.getTransportAllowance().multiply(dailyFactor).setScale(2, RoundingMode.HALF_UP);
        BigDecimal medical = employee.getMedicalAllowance().multiply(dailyFactor).setScale(2, RoundingMode.HALF_UP);
        BigDecimal bonus = employee.getBonus().multiply(dailyFactor).setScale(2, RoundingMode.HALF_UP);

        BigDecimal grossSalary = basic.add(hra).add(special).add(transport).add(medical).add(bonus);

        // PF Deduction (12% of basic, capped at 15000 basic)
        BigDecimal pfBase = basic.min(new BigDecimal("15000"));
        BigDecimal pfDeduction = pfBase.multiply(employee.getPfContributionPercentage())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        // Professional Tax (state-wise, simple slab)
        BigDecimal professionalTax = calculateProfessionalTax(grossSalary);

        // Income Tax TDS
        BigDecimal annualGross = grossSalary.multiply(new BigDecimal("12"));
        BigDecimal annualTax = calculateIncomeTax(annualGross, employee.getTaxRegime());
        BigDecimal monthlyTds = annualTax.divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);

        BigDecimal totalDeductions = pfDeduction.add(professionalTax).add(monthlyTds);
        BigDecimal netSalary = grossSalary.subtract(totalDeductions);

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .month(month)
                .year(year)
                .workingDays(totalWorkingDays)
                .paidDays(paidDays)
                .lossOfPayDays(lopDaysBd)
                .basicSalary(basic)
                .hra(hra)
                .specialAllowance(special)
                .transportAllowance(transport)
                .medicalAllowance(medical)
                .bonus(bonus)
                .grossSalary(grossSalary)
                .pfDeduction(pfDeduction)
                .professionalTax(professionalTax)
                .incomeTaxTds(monthlyTds)
                .totalDeductions(totalDeductions)
                .netSalary(netSalary)
                .annualTaxableIncome(annualGross)
                .annualTaxLiability(annualTax)
                .taxRegime(employee.getTaxRegime().name())
                .status(PayrollStatus.PROCESSED)
                .processedBy(admin)
                .build();

        payroll = payrollRepository.save(payroll);
        emailService.sendSalaryCreditNotification(employee, payroll);
        auditService.log(admin, "PROCESS_PAYROLL", "Payroll", payroll.getId().toString(),
                "Processed payroll for " + employee.getEmployeeCode() + " - " + month + "/" + year, null, null);

        return mapToResponse(payroll);
    }

    /**
     * Indian New Regime Tax Slabs (FY 2024-25):
     * 0-3L: 0%, 3-7L: 5%, 7-10L: 10%, 10-12L: 15%, 12-15L: 20%, 15L+: 30%
     * With standard deduction of 75,000
     *
     * Old Regime:
     * 0-2.5L: 0%, 2.5-5L: 5%, 5-10L: 20%, 10L+: 30%
     * With standard deduction of 50,000
     */
    private BigDecimal calculateIncomeTax(BigDecimal annualGross, TaxRegime regime) {
        BigDecimal taxableIncome;
        BigDecimal tax = BigDecimal.ZERO;

        if (regime == TaxRegime.NEW) {
            BigDecimal standardDeduction = new BigDecimal("75000");
            taxableIncome = annualGross.subtract(standardDeduction);
            if (taxableIncome.compareTo(BigDecimal.ZERO) < 0) taxableIncome = BigDecimal.ZERO;

            // Rebate under 87A for new regime (taxable income <= 7L)
            if (taxableIncome.compareTo(new BigDecimal("700000")) <= 0) {
                return BigDecimal.ZERO;
            }

            tax = calculateNewRegimeTax(taxableIncome);
        } else {
            BigDecimal standardDeduction = new BigDecimal("50000");
            taxableIncome = annualGross.subtract(standardDeduction);
            if (taxableIncome.compareTo(BigDecimal.ZERO) < 0) taxableIncome = BigDecimal.ZERO;

            // Rebate under 87A for old regime (taxable income <= 5L)
            if (taxableIncome.compareTo(new BigDecimal("500000")) <= 0) {
                return BigDecimal.ZERO;
            }

            tax = calculateOldRegimeTax(taxableIncome);
        }

        // Add 4% Health & Education Cess
        BigDecimal cess = tax.multiply(new BigDecimal("0.04")).setScale(2, RoundingMode.HALF_UP);
        return tax.add(cess).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateNewRegimeTax(BigDecimal income) {
        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal[][] slabs = {
            {new BigDecimal("300000"), new BigDecimal("0")},
            {new BigDecimal("700000"), new BigDecimal("0.05")},
            {new BigDecimal("1000000"), new BigDecimal("0.10")},
            {new BigDecimal("1200000"), new BigDecimal("0.15")},
            {new BigDecimal("1500000"), new BigDecimal("0.20")},
            {null, new BigDecimal("0.30")}
        };
        tax = applySlabs(income, slabs);
        // Surcharge
        if (income.compareTo(new BigDecimal("5000000")) > 0) {
            tax = tax.multiply(new BigDecimal("1.10"));
        } else if (income.compareTo(new BigDecimal("2000000")) > 0) {
            tax = tax.multiply(new BigDecimal("1.15"));
        }
        return tax.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateOldRegimeTax(BigDecimal income) {
        BigDecimal[][] slabs = {
            {new BigDecimal("250000"), new BigDecimal("0")},
            {new BigDecimal("500000"), new BigDecimal("0.05")},
            {new BigDecimal("1000000"), new BigDecimal("0.20")},
            {null, new BigDecimal("0.30")}
        };
        return applySlabs(income, slabs).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal applySlabs(BigDecimal income, BigDecimal[][] slabs) {
        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal remaining = income;
        BigDecimal prevLimit = BigDecimal.ZERO;

        for (BigDecimal[] slab : slabs) {
            BigDecimal limit = slab[0];
            BigDecimal rate = slab[1];

            if (limit == null) {
                tax = tax.add(remaining.multiply(rate));
                break;
            }
            BigDecimal slabAmount = limit.subtract(prevLimit);
            if (remaining.compareTo(slabAmount) <= 0) {
                tax = tax.add(remaining.multiply(rate));
                break;
            } else {
                tax = tax.add(slabAmount.multiply(rate));
                remaining = remaining.subtract(slabAmount);
            }
            prevLimit = limit;
        }
        return tax;
    }

    private BigDecimal calculateProfessionalTax(BigDecimal monthlyGross) {
        // Karnataka PT slabs (common reference)
        if (monthlyGross.compareTo(new BigDecimal("15000")) >= 0) {
            return new BigDecimal("200");
        } else if (monthlyGross.compareTo(new BigDecimal("10000")) >= 0) {
            return new BigDecimal("150");
        } else if (monthlyGross.compareTo(new BigDecimal("7500")) >= 0) {
            return new BigDecimal("75");
        }
        return BigDecimal.ZERO;
    }

    private int calculateWorkingDays(LocalDate start, LocalDate end) {
        int days = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            DayOfWeek dow = current.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                days++;
            }
            current = current.plusDays(1);
        }
        return days;
    }

    @Transactional(readOnly = true)
    public Page<PayrollResponse> getEmployeePayrolls(UUID userId, Pageable pageable) {
        Employee emp = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
        return payrollRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public PayrollResponse getPayroll(UUID payrollId) {
        return payrollRepository.findById(payrollId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", payrollId));
    }

    @Transactional(readOnly = true)
    public PayrollResponse getEmployeeMonthlyPayroll(UUID userId, int month, int year) {
        Employee emp = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
        return payrollRepository.findByEmployeeIdAndMonthAndYear(emp.getId(), month, year)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found for the given month/year"));
    }

    public PayrollResponse mapToResponse(Payroll p) {
        return PayrollResponse.builder()
                .id(p.getId())
                .employeeId(p.getEmployee().getId())
                .employeeName(p.getEmployee().getUser().getName())
                .employeeCode(p.getEmployee().getEmployeeCode())
                .department(p.getEmployee().getDepartment().name())
                .designation(p.getEmployee().getDesignation())
                .month(p.getMonth())
                .year(p.getYear())
                .workingDays(p.getWorkingDays())
                .paidDays(p.getPaidDays())
                .lossOfPayDays(p.getLossOfPayDays())
                .basicSalary(p.getBasicSalary())
                .hra(p.getHra())
                .specialAllowance(p.getSpecialAllowance())
                .transportAllowance(p.getTransportAllowance())
                .medicalAllowance(p.getMedicalAllowance())
                .bonus(p.getBonus())
                .grossSalary(p.getGrossSalary())
                .pfDeduction(p.getPfDeduction())
                .professionalTax(p.getProfessionalTax())
                .incomeTaxTds(p.getIncomeTaxTds())
                .otherDeductions(p.getOtherDeductions())
                .totalDeductions(p.getTotalDeductions())
                .netSalary(p.getNetSalary())
                .annualTaxableIncome(p.getAnnualTaxableIncome())
                .annualTaxLiability(p.getAnnualTaxLiability())
                .taxRegime(p.getTaxRegime())
                .status(p.getStatus())
                .payslipUrl(p.getPayslipUrl())
                .build();
    }
}
