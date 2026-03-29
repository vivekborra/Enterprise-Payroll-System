package com.payroll.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class DashboardResponse {
    // Common
    private long totalEmployees;
    private long activeEmployees;
    // HR Dashboard
    private long pendingLeaves;
    private long approvedLeavesThisMonth;
    private BigDecimal totalPayrollThisMonth;
    private BigDecimal totalPayrollThisYear;
    private Map<String, Long> departmentCounts;
    private Map<String, BigDecimal> monthlyPayrollTrend;
    // Employee Dashboard
    private BigDecimal currentMonthGross;
    private BigDecimal currentMonthDeductions;
    private BigDecimal currentMonthNet;
    private int casualLeaveBalance;
    private int sickLeaveBalance;
    private int paidLeaveBalance;
    private int workingDaysThisMonth;
    private int presentDaysThisMonth;
}
