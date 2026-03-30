package com.payroll.service;

import com.payroll.dto.request.CreateEmployeeRequest;
import com.payroll.dto.response.EmployeeResponse;
import com.payroll.entity.Employee;
import com.payroll.entity.User;
import com.payroll.enums.Role;
import com.payroll.exception.BusinessException;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.UserRepository;
import com.payroll.enums.Department;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional
    public EmployeeResponse createEmployee(CreateEmployeeRequest req, User adminUser) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BusinessException("Email already in use: " + req.getEmail());
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.EMPLOYEE)
                .active(true)
                .build();
        user = userRepository.save(user);

        String empCode = generateEmployeeCode();
        Employee employee = Employee.builder()
                .employeeCode(empCode)
                .phone(req.getPhone())
                .address(req.getAddress())
                .department(req.getDepartment())
                .designation(req.getDesignation())
                .employmentType(req.getEmploymentType())
                .joiningDate(req.getJoiningDate())
                .dateOfBirth(req.getDateOfBirth())
                .panNumber(req.getPanNumber())
                .uanNumber(req.getUanNumber())
                .bankAccountNumber(req.getBankAccountNumber())
                .bankIfsc(req.getBankIfsc())
                .bankName(req.getBankName())
                .basicSalary(req.getBasicSalary())
                .hra(req.getHra() != null ? req.getHra() : BigDecimal.ZERO)
                .specialAllowance(req.getSpecialAllowance() != null ? req.getSpecialAllowance() : BigDecimal.ZERO)
                .transportAllowance(req.getTransportAllowance() != null ? req.getTransportAllowance() : BigDecimal.ZERO)
                .medicalAllowance(req.getMedicalAllowance() != null ? req.getMedicalAllowance() : BigDecimal.ZERO)
                .bonus(req.getBonus() != null ? req.getBonus() : BigDecimal.ZERO)
                .taxRegime(req.getTaxRegime())
                .pfContributionPercentage(req.getPfContributionPercentage() != null ?
                        req.getPfContributionPercentage() : new BigDecimal("12.00"))
                .user(user)
                .build();
        employee = employeeRepository.save(employee);

        auditService.log(adminUser, "CREATE_EMPLOYEE", "Employee", employee.getId().toString(),
                "Created employee: " + req.getName(), null, null);
        log.info("Employee created: {} ({})", req.getName(), empCode);

        return mapToResponse(employee);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployee(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return mapToResponse(employee);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeByUserId(UUID userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user: " + userId));
        return mapToResponse(employee);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getAllEmployees(Department department, String search, Pageable pageable) {
        return employeeRepository.findByDepartmentAndSearch(department, search, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public EmployeeResponse updateEmployee(UUID employeeId, CreateEmployeeRequest req, User adminUser) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        employee.setPhone(req.getPhone());
        employee.setAddress(req.getAddress());
        employee.setDepartment(req.getDepartment());
        employee.setDesignation(req.getDesignation());
        employee.setEmploymentType(req.getEmploymentType());
        employee.setBasicSalary(req.getBasicSalary());
        employee.setHra(req.getHra() != null ? req.getHra() : BigDecimal.ZERO);
        employee.setSpecialAllowance(req.getSpecialAllowance() != null ? req.getSpecialAllowance() : BigDecimal.ZERO);
        employee.setTransportAllowance(req.getTransportAllowance() != null ? req.getTransportAllowance() : BigDecimal.ZERO);
        employee.setMedicalAllowance(req.getMedicalAllowance() != null ? req.getMedicalAllowance() : BigDecimal.ZERO);
        employee.setBonus(req.getBonus() != null ? req.getBonus() : BigDecimal.ZERO);
        employee.setTaxRegime(req.getTaxRegime());

        // Update user name if changed
        User user = employee.getUser();
        user.setName(req.getName());
        userRepository.save(user);

        employee = employeeRepository.save(employee);
        auditService.log(adminUser, "UPDATE_EMPLOYEE", "Employee", employeeId.toString(),
                "Updated employee: " + employee.getUser().getName(), null, null);

        return mapToResponse(employee);
    }

    @Transactional
    public void deactivateEmployee(UUID employeeId, User adminUser) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        User user = employee.getUser();
        user.setActive(false);
        userRepository.save(user);
        auditService.log(adminUser, "DEACTIVATE_EMPLOYEE", "Employee", employeeId.toString(),
                "Deactivated employee: " + user.getName(), null, null);
    }

    @Transactional
    public void createDefaultEmployee(User user) {
        String empCode = generateEmployeeCode();
        Employee employee = Employee.builder()
                .employeeCode(empCode)
                .department(Department.ENGINEERING)
                .designation("Employee")
                .employmentType(com.payroll.enums.EmploymentType.FULL_TIME)
                .joiningDate(LocalDate.now())
                .basicSalary(new BigDecimal("25000"))
                .hra(BigDecimal.ZERO)
                .specialAllowance(BigDecimal.ZERO)
                .transportAllowance(BigDecimal.ZERO)
                .medicalAllowance(BigDecimal.ZERO)
                .bonus(BigDecimal.ZERO)
                .taxRegime(com.payroll.enums.TaxRegime.NEW)
                .pfContributionPercentage(new BigDecimal("12.00"))
                .sickLeaveBalance(12)
                .casualLeaveBalance(12)
                .paidLeaveBalance(15)
                .user(user)
                .build();
        employeeRepository.save(employee);
        log.info("Default employee profile created for user: {} ({})", user.getEmail(), empCode);
    }

    @Transactional
    public EmployeeResponse updateMyProfile(UUID userId, java.util.Map<String, String> updates) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        if (updates.containsKey("phone")) {
            employee.setPhone(updates.get("phone"));
        }
        if (updates.containsKey("address")) {
            employee.setAddress(updates.get("address"));
        }

        employee = employeeRepository.save(employee);
        auditService.log(employee.getUser(), "UPDATE_PROFILE", "Employee", employee.getId().toString(),
                "User updated personal info", null, null);
        return mapToResponse(employee);
    }

    private String generateEmployeeCode() {
        String prefix = "EMP" + LocalDate.now().format(DateTimeFormatter.ofPattern("yy"));
        long count = employeeRepository.count() + 1;
        return prefix + String.format("%04d", count);
    }

    public EmployeeResponse mapToResponse(Employee e) {
        BigDecimal grossSalary = e.getBasicSalary()
                .add(e.getHra())
                .add(e.getSpecialAllowance())
                .add(e.getTransportAllowance())
                .add(e.getMedicalAllowance())
                .add(e.getBonus());

        return EmployeeResponse.builder()
                .id(e.getId())
                .employeeCode(e.getEmployeeCode())
                .name(e.getUser().getName())
                .email(e.getUser().getEmail())
                .phone(e.getPhone())
                .address(e.getAddress())
                .department(e.getDepartment())
                .designation(e.getDesignation())
                .employmentType(e.getEmploymentType())
                .joiningDate(e.getJoiningDate())
                .dateOfBirth(e.getDateOfBirth())
                .panNumber(e.getPanNumber())
                .uanNumber(e.getUanNumber())
                .bankAccountNumber(e.getBankAccountNumber())
                .bankIfsc(e.getBankIfsc())
                .bankName(e.getBankName())
                .basicSalary(e.getBasicSalary())
                .hra(e.getHra())
                .specialAllowance(e.getSpecialAllowance())
                .transportAllowance(e.getTransportAllowance())
                .medicalAllowance(e.getMedicalAllowance())
                .bonus(e.getBonus())
                .grossSalary(grossSalary)
                .taxRegime(e.getTaxRegime())
                .pfContributionPercentage(e.getPfContributionPercentage())
                .sickLeaveBalance(e.getSickLeaveBalance())
                .casualLeaveBalance(e.getCasualLeaveBalance())
                .paidLeaveBalance(e.getPaidLeaveBalance())
                .profilePictureUrl(e.getProfilePictureUrl())
                .active(e.getUser().isActive())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
