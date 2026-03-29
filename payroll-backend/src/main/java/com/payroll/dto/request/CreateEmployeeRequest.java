package com.payroll.dto.request;

import com.payroll.enums.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateEmployeeRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String phone;
    private String address;

    @NotNull(message = "Department is required")
    private Department department;

    @NotBlank(message = "Designation is required")
    private String designation;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    private LocalDate dateOfBirth;
    private String panNumber;
    private String uanNumber;
    private String bankAccountNumber;
    private String bankIfsc;
    private String bankName;

    @NotNull(message = "Basic salary is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Basic salary must be positive")
    private BigDecimal basicSalary;

    private BigDecimal hra;
    private BigDecimal specialAllowance;
    private BigDecimal transportAllowance;
    private BigDecimal medicalAllowance;
    private BigDecimal bonus;

    @NotNull(message = "Tax regime is required")
    private TaxRegime taxRegime;

    private BigDecimal pfContributionPercentage;
}
