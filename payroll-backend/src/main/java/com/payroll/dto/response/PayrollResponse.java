package com.payroll.dto.response;

import com.payroll.enums.PayrollStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class PayrollResponse {
    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String employeeCode;
    private String department;
    private String designation;
    private int month;
    private int year;
    private int workingDays;
    private BigDecimal paidDays;
    private BigDecimal lossOfPayDays;
    // Earnings
    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal specialAllowance;
    private BigDecimal transportAllowance;
    private BigDecimal medicalAllowance;
    private BigDecimal bonus;
    private BigDecimal grossSalary;
    // Deductions
    private BigDecimal pfDeduction;
    private BigDecimal professionalTax;
    private BigDecimal incomeTaxTds;
    private BigDecimal otherDeductions;
    private BigDecimal totalDeductions;
    private BigDecimal netSalary;
    // Tax
    private BigDecimal annualTaxableIncome;
    private BigDecimal annualTaxLiability;
    private String taxRegime;
    private PayrollStatus status;
    private String payslipUrl;
}
