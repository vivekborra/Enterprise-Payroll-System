package com.payroll.dto.response;

import com.payroll.enums.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class EmployeeResponse {
    private UUID id;
    private String employeeCode;
    private String name;
    private String email;
    private String phone;
    private String address;
    private Department department;
    private String designation;
    private EmploymentType employmentType;
    private LocalDate joiningDate;
    private LocalDate dateOfBirth;
    private String panNumber;
    private String uanNumber;
    private String bankAccountNumber;
    private String bankIfsc;
    private String bankName;
    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal specialAllowance;
    private BigDecimal transportAllowance;
    private BigDecimal medicalAllowance;
    private BigDecimal bonus;
    private BigDecimal grossSalary;
    private TaxRegime taxRegime;
    private BigDecimal pfContributionPercentage;
    private int sickLeaveBalance;
    private int casualLeaveBalance;
    private int paidLeaveBalance;
    private String profilePictureUrl;
    private boolean active;
    private LocalDateTime createdAt;
}
