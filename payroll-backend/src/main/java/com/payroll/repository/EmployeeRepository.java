package com.payroll.repository;

import com.payroll.entity.Employee;
import com.payroll.enums.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    Optional<Employee> findByUserId(UUID userId);
    Optional<Employee> findByEmployeeCode(String employeeCode);
    boolean existsByEmployeeCode(String employeeCode);

    @Query("SELECT e FROM Employee e JOIN e.user u WHERE " +
           "(:department IS NULL OR e.department = :department) AND " +
           "(:search IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.designation) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Employee> findByDepartmentAndSearch(Department department, String search, Pageable pageable);

    long countByDepartment(Department department);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.user.active = true")
    long countActiveEmployees();
}
