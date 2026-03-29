package com.payroll.controller;

import com.payroll.dto.request.LeaveRequest;
import com.payroll.dto.response.ApiResponse;
import com.payroll.dto.response.LeaveResponse;
import com.payroll.entity.User;
import com.payroll.enums.LeaveStatus;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.UserRepository;
import com.payroll.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Leave Management", description = "Leave Application and Approval APIs")
@SecurityRequirement(name = "bearerAuth")
public class LeaveController {

    private final LeaveService leaveService;
    private final UserRepository userRepository;

    @PostMapping("/employee/leaves")
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR','ADMIN')")
    @Operation(summary = "Apply for leave")
    public ResponseEntity<ApiResponse<LeaveResponse>> applyLeave(
            @Valid @RequestBody LeaveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Leave applied successfully", leaveService.applyLeave(user.getId(), request)));
    }

    @GetMapping("/employee/leaves")
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR','ADMIN')")
    @Operation(summary = "Get my leave history")
    public ResponseEntity<ApiResponse<Page<LeaveResponse>>> getMyLeaves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Page<LeaveResponse> leaves = leaveService.getEmployeeLeaves(user.getId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @DeleteMapping("/employee/leaves/{leaveId}/cancel")
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR','ADMIN')")
    @Operation(summary = "Cancel a leave request")
    public ResponseEntity<ApiResponse<LeaveResponse>> cancelLeave(
            @PathVariable UUID leaveId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Leave cancelled", leaveService.cancelLeave(leaveId, user.getId())));
    }

    @GetMapping("/hr/leaves")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Get all leave requests (HR/Admin)")
    public ResponseEntity<ApiResponse<Page<LeaveResponse>>> getAllLeaves(
            @RequestParam(required = false) LeaveStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<LeaveResponse> leaves = leaveService.getAllLeaves(status,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @PatchMapping("/hr/leaves/{leaveId}/approve")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Approve a leave request")
    public ResponseEntity<ApiResponse<LeaveResponse>> approveLeave(
            @PathVariable UUID leaveId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User approver = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Leave approved", leaveService.approveLeave(leaveId, approver)));
    }

    @PatchMapping("/hr/leaves/{leaveId}/reject")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Reject a leave request")
    public ResponseEntity<ApiResponse<LeaveResponse>> rejectLeave(
            @PathVariable UUID leaveId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User approver = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Leave rejected",
                leaveService.rejectLeave(leaveId, body.get("reason"), approver)));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
