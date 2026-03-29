package com.payroll.controller;

import com.payroll.dto.request.CreateEmployeeRequest;
import com.payroll.dto.response.ApiResponse;
import com.payroll.dto.response.EmployeeResponse;
import com.payroll.entity.User;
import com.payroll.enums.Department;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.UserRepository;
import com.payroll.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Employee Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final UserRepository userRepository;

    @PostMapping("/hr/employees")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Create a new employee (HR/Admin only)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = getUser(userDetails);
        EmployeeResponse response = employeeService.createEmployee(request, admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Employee created", response));
    }

    @GetMapping("/hr/employees")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Get all employees with filtering and pagination")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> getAllEmployees(
            @RequestParam(required = false) Department department,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<EmployeeResponse> employees = employeeService.getAllEmployees(department, search, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @GetMapping("/hr/employees/{id}")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployee(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getEmployee(id)));
    }

    @PutMapping("/hr/employees/{id}")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Update employee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable UUID id,
            @Valid @RequestBody CreateEmployeeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Employee updated", employeeService.updateEmployee(id, request, admin)));
    }

    @DeleteMapping("/hr/employees/{id}")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Deactivate employee")
    public ResponseEntity<ApiResponse<Void>> deactivateEmployee(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = getUser(userDetails);
        employeeService.deactivateEmployee(id, admin);
        return ResponseEntity.ok(ApiResponse.success("Employee deactivated", null));
    }

    @GetMapping("/employee/profile")
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR','ADMIN')")
    @Operation(summary = "Get my employee profile")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(employeeService.getEmployeeByUserId(user.getId())));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
