package com.payroll.repository;

import com.payroll.entity.Leave;
import com.payroll.enums.LeaveStatus;
import com.payroll.enums.LeaveType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, UUID> {
    Page<Leave> findByEmployeeId(UUID employeeId, Pageable pageable);

    Page<Leave> findByStatus(LeaveStatus status, Pageable pageable);

    List<Leave> findByEmployeeIdAndStatus(UUID employeeId, LeaveStatus status);

    @Query("SELECT l FROM Leave l WHERE l.employee.id = :employeeId AND " +
           "l.status = 'APPROVED' AND " +
           "(l.startDate BETWEEN :startDate AND :endDate OR l.endDate BETWEEN :startDate AND :endDate)")
    List<Leave> findApprovedLeavesBetweenDates(UUID employeeId, LocalDate startDate, LocalDate endDate);

    long countByStatus(LeaveStatus status);

    @Query("SELECT COUNT(l) FROM Leave l WHERE l.employee.id = :employeeId AND " +
           "l.leaveType = :leaveType AND l.status = 'APPROVED' AND " +
           "YEAR(l.startDate) = :year")
    long countApprovedLeavesByTypeAndYear(UUID employeeId, LeaveType leaveType, int year);
}
