package com.payroll.repository;

import com.payroll.entity.Payroll;
import com.payroll.enums.PayrollStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, UUID> {
    Optional<Payroll> findByEmployeeIdAndMonthAndYear(UUID employeeId, int month, int year);

    List<Payroll> findByEmployeeId(UUID employeeId, Pageable pageable);

    List<Payroll> findByMonthAndYear(int month, int year);

    Page<Payroll> findByMonthAndYear(int month, int year, Pageable pageable);

    List<Payroll> findByMonthAndYearAndStatus(int month, int year, PayrollStatus status);

    @Query("SELECT SUM(p.netSalary) FROM Payroll p WHERE p.month = :month AND p.year = :year AND p.status != 'FAILED'")
    BigDecimal sumNetSalaryByMonthAndYear(int month, int year);

    @Query("SELECT SUM(p.grossSalary) FROM Payroll p WHERE p.year = :year AND p.status != 'FAILED'")
    BigDecimal sumGrossSalaryByYear(int year);
}
