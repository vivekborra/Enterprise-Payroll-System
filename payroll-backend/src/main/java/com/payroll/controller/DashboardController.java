package com.payroll.controller;

import com.payroll.dto.response.ApiResponse;
import com.payroll.dto.response.DashboardResponse;
import com.payroll.entity.User;
import com.payroll.enums.*;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Analytics and Dashboard APIs")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveRepository leaveRepository;
    private final PayrollRepository payrollRepository;

    @GetMapping("/hr/dashboard")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Get HR Admin dashboard analytics")
    public ResponseEntity<ApiResponse<DashboardResponse>> getHrDashboard() {
        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countActiveEmployees();
        long pendingLeaves = leaveRepository.countByStatus(LeaveStatus.PENDING);
        long approvedLeaves = leaveRepository.countByStatus(LeaveStatus.APPROVED);

        BigDecimal totalPayroll = payrollRepository.sumNetSalaryByMonthAndYear(month, year);
        BigDecimal yearlyPayroll = payrollRepository.sumGrossSalaryByYear(year);

        Map<String, Long> deptCounts = new HashMap<>();
        for (Department dept : Department.values()) {
            deptCounts.put(dept.name(), employeeRepository.countByDepartment(dept));
        }

        DashboardResponse response = DashboardResponse.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .pendingLeaves(pendingLeaves)
                .approvedLeavesThisMonth(approvedLeaves)
                .totalPayrollThisMonth(totalPayroll != null ? totalPayroll : BigDecimal.ZERO)
                .totalPayrollThisYear(yearlyPayroll != null ? yearlyPayroll : BigDecimal.ZERO)
                .departmentCounts(deptCounts)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/employee/dashboard")
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR','ADMIN')")
    @Operation(summary = "Get employee dashboard data")
    public ResponseEntity<ApiResponse<DashboardResponse>> getEmployeeDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        var employeeOpt = employeeRepository.findByUserId(user.getId());
        if (employeeOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(DashboardResponse.builder().build()));
        }
        var employee = employeeOpt.get();

        LocalDate now = LocalDate.now();
        var payrollOpt = payrollRepository.findByEmployeeIdAndMonthAndYear(
                employee.getId(), now.getMonthValue(), now.getYear());

        DashboardResponse response = DashboardResponse.builder()
                .sickLeaveBalance(employee.getSickLeaveBalance())
                .casualLeaveBalance(employee.getCasualLeaveBalance())
                .paidLeaveBalance(employee.getPaidLeaveBalance())
                .currentMonthGross(payrollOpt.map(p -> p.getGrossSalary()).orElse(BigDecimal.ZERO))
                .currentMonthDeductions(payrollOpt.map(p -> p.getTotalDeductions()).orElse(BigDecimal.ZERO))
                .currentMonthNet(payrollOpt.map(p -> p.getNetSalary()).orElse(BigDecimal.ZERO))
                .workingDaysThisMonth(payrollOpt.map(p -> p.getWorkingDays()).orElse(0))
                .presentDaysThisMonth(payrollOpt.map(p -> p.getPaidDays().intValue()).orElse(0))
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
