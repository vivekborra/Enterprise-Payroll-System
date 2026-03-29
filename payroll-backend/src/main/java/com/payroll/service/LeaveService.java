package com.payroll.service;

import com.payroll.dto.request.LeaveRequest;
import com.payroll.dto.response.LeaveResponse;
import com.payroll.entity.Employee;
import com.payroll.entity.Leave;
import com.payroll.entity.User;
import com.payroll.enums.LeaveStatus;
import com.payroll.enums.LeaveType;
import com.payroll.exception.BusinessException;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final EmailService emailService;
    private final AuditService auditService;

    @Transactional
    public LeaveResponse applyLeave(UUID userId, LeaveRequest request) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("End date must be after start date");
        }
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Cannot apply leave for past dates");
        }

        int totalDays = calculateWorkingDays(request.getStartDate(), request.getEndDate());
        if (totalDays == 0) {
            throw new BusinessException("Leave duration must be at least 1 working day");
        }

        validateLeaveBalance(employee, request.getLeaveType(), totalDays);

        Leave leave = Leave.builder()
                .employee(employee)
                .leaveType(request.getLeaveType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(totalDays)
                .reason(request.getReason())
                .status(LeaveStatus.PENDING)
                .build();
        leave = leaveRepository.save(leave);

        emailService.sendLeaveApplicationNotification(employee, leave);
        return mapToResponse(leave);
    }

    @Transactional
    public LeaveResponse approveLeave(UUID leaveId, User approver) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave", "id", leaveId));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("Only PENDING leaves can be approved");
        }

        deductLeaveBalance(leave.getEmployee(), leave.getLeaveType(), leave.getTotalDays());
        leave.setStatus(LeaveStatus.APPROVED);
        leave.setApprovedBy(approver);
        leave.setApprovedAt(LocalDateTime.now());
        leaveRepository.save(leave);

        emailService.sendLeaveApprovalNotification(leave.getEmployee(), leave, true, null);
        auditService.log(approver, "APPROVE_LEAVE", "Leave", leaveId.toString(),
                "Approved leave for: " + leave.getEmployee().getUser().getName(), null, null);
        return mapToResponse(leave);
    }

    @Transactional
    public LeaveResponse rejectLeave(UUID leaveId, String reason, User approver) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave", "id", leaveId));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("Only PENDING leaves can be rejected");
        }

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setRejectionReason(reason);
        leave.setApprovedBy(approver);
        leave.setApprovedAt(LocalDateTime.now());
        leaveRepository.save(leave);

        emailService.sendLeaveApprovalNotification(leave.getEmployee(), leave, false, reason);
        auditService.log(approver, "REJECT_LEAVE", "Leave", leaveId.toString(),
                "Rejected leave for: " + leave.getEmployee().getUser().getName(), null, null);
        return mapToResponse(leave);
    }

    @Transactional
    public LeaveResponse cancelLeave(UUID leaveId, UUID userId) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave", "id", leaveId));

        if (!leave.getEmployee().getUser().getId().equals(userId)) {
            throw new BusinessException("You can only cancel your own leaves");
        }
        if (leave.getStatus() == LeaveStatus.CANCELLED) {
            throw new BusinessException("Leave is already cancelled");
        }
        if (leave.getStatus() == LeaveStatus.APPROVED && !leave.getStartDate().isAfter(LocalDate.now())) {
            throw new BusinessException("Cannot cancel an ongoing or past approved leave");
        }

        // Restore balance if was approved
        if (leave.getStatus() == LeaveStatus.APPROVED) {
            restoreLeaveBalance(leave.getEmployee(), leave.getLeaveType(), leave.getTotalDays());
        }
        leave.setStatus(LeaveStatus.CANCELLED);
        return mapToResponse(leaveRepository.save(leave));
    }

    @Transactional(readOnly = true)
    public Page<LeaveResponse> getEmployeeLeaves(UUID userId, Pageable pageable) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
        return leaveRepository.findByEmployeeId(employee.getId(), pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<LeaveResponse> getAllLeaves(LeaveStatus status, Pageable pageable) {
        if (status != null) {
            return leaveRepository.findByStatus(status, pageable).map(this::mapToResponse);
        }
        return leaveRepository.findAll(pageable).map(this::mapToResponse);
    }

    private int calculateWorkingDays(LocalDate start, LocalDate end) {
        int days = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            DayOfWeek day = current.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                days++;
            }
            current = current.plusDays(1);
        }
        return days;
    }

    private void validateLeaveBalance(Employee employee, LeaveType type, int days) {
        int balance = switch (type) {
            case SICK -> employee.getSickLeaveBalance();
            case CASUAL -> employee.getCasualLeaveBalance();
            case PAID -> employee.getPaidLeaveBalance();
            default -> Integer.MAX_VALUE;
        };
        if (days > balance) {
            throw new BusinessException("Insufficient " + type.name() + " leave balance. Available: " + balance + " days");
        }
    }

    private void deductLeaveBalance(Employee employee, LeaveType type, int days) {
        switch (type) {
            case SICK -> employee.setSickLeaveBalance(employee.getSickLeaveBalance() - days);
            case CASUAL -> employee.setCasualLeaveBalance(employee.getCasualLeaveBalance() - days);
            case PAID -> employee.setPaidLeaveBalance(employee.getPaidLeaveBalance() - days);
            default -> {} // No deduction for other types
        }
        employeeRepository.save(employee);
    }

    private void restoreLeaveBalance(Employee employee, LeaveType type, int days) {
        switch (type) {
            case SICK -> employee.setSickLeaveBalance(employee.getSickLeaveBalance() + days);
            case CASUAL -> employee.setCasualLeaveBalance(employee.getCasualLeaveBalance() + days);
            case PAID -> employee.setPaidLeaveBalance(employee.getPaidLeaveBalance() + days);
            default -> {}
        }
        employeeRepository.save(employee);
    }

    public LeaveResponse mapToResponse(Leave l) {
        return LeaveResponse.builder()
                .id(l.getId())
                .employeeId(l.getEmployee().getId())
                .employeeName(l.getEmployee().getUser().getName())
                .employeeCode(l.getEmployee().getEmployeeCode())
                .department(l.getEmployee().getDepartment().name())
                .leaveType(l.getLeaveType())
                .startDate(l.getStartDate())
                .endDate(l.getEndDate())
                .totalDays(l.getTotalDays())
                .reason(l.getReason())
                .status(l.getStatus())
                .rejectionReason(l.getRejectionReason())
                .approvedByName(l.getApprovedBy() != null ? l.getApprovedBy().getName() : null)
                .approvedAt(l.getApprovedAt())
                .appliedAt(l.getCreatedAt())
                .build();
    }
}
