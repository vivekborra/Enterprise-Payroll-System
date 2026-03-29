package com.payroll.controller;

import com.payroll.dto.response.ApiResponse;
import com.payroll.dto.response.PayrollResponse;
import com.payroll.entity.Employee;
import com.payroll.entity.User;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.UserRepository;
import com.payroll.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Payroll", description = "Payroll Processing APIs")
@SecurityRequirement(name = "bearerAuth")
public class PayrollController {

    private final PayrollService payrollService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    @PostMapping("/hr/payroll/process")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Process monthly payroll for all employees")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> processPayroll(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().monthValue}") int month,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().year}") int year,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = getUser(userDetails);
        List<PayrollResponse> results = payrollService.processMonthlyPayroll(month, year, admin);
        return ResponseEntity.ok(ApiResponse.success("Payroll processed for " + results.size() + " employees", results));
    }

    @PostMapping("/hr/payroll/process/{employeeId}")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Process payroll for a specific employee")
    public ResponseEntity<ApiResponse<PayrollResponse>> processEmployeePayroll(
            @PathVariable UUID employeeId,
            @RequestParam int month,
            @RequestParam int year,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = getUser(userDetails);
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        PayrollResponse response = payrollService.processEmployeePayroll(employee, month, year, admin);
        return ResponseEntity.ok(ApiResponse.success("Payroll processed", response));
    }

    @GetMapping("/employee/payroll")
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR','ADMIN')")
    @Operation(summary = "Get my payroll history")
    public ResponseEntity<ApiResponse<Page<PayrollResponse>>> getMyPayrolls(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Page<PayrollResponse> payrolls = payrollService.getEmployeePayrolls(user.getId(),
                PageRequest.of(page, size, Sort.by("year", "month").descending()));
        return ResponseEntity.ok(ApiResponse.success(payrolls));
    }

    @GetMapping("/employee/payroll/{month}/{year}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR','ADMIN')")
    @Operation(summary = "Get payroll for specific month")
    public ResponseEntity<ApiResponse<PayrollResponse>> getMonthlyPayroll(
            @PathVariable int month,
            @PathVariable int year,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(payrollService.getEmployeeMonthlyPayroll(user.getId(), month, year)));
    }

    @GetMapping("/hr/payroll/{payrollId}")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Get payroll by ID")
    public ResponseEntity<ApiResponse<PayrollResponse>> getPayroll(@PathVariable UUID payrollId) {
        return ResponseEntity.ok(ApiResponse.success(payrollService.getPayroll(payrollId)));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
