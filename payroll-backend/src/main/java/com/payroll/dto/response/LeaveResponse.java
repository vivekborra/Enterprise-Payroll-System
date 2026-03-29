package com.payroll.dto.response;

import com.payroll.enums.LeaveStatus;
import com.payroll.enums.LeaveType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class LeaveResponse {
    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String employeeCode;
    private String department;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private int totalDays;
    private String reason;
    private LeaveStatus status;
    private String rejectionReason;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private LocalDateTime appliedAt;
}
