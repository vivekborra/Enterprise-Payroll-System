package com.payroll.controller;

import com.payroll.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Payroll Export and Analytics APIs")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/hr/reports/employees/csv")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Export employee directory to CSV")
    public ResponseEntity<byte[]> exportEmployeesCsv() {
        try {
            byte[] data = reportService.generateEmployeeCsv();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employees_report.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/hr/reports/payroll/csv")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Export monthly payroll to CSV")
    public ResponseEntity<byte[]> exportCsv(@RequestParam int month, @RequestParam int year) {
        try {
            byte[] data = reportService.generateMonthlyPayrollCsv(month, year);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=payroll_" + month + "_" + year + ".csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/hr/reports/payroll/pdf")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    @Operation(summary = "Export monthly payroll to PDF")
    public ResponseEntity<byte[]> exportPdf(@RequestParam int month, @RequestParam int year) {
        try {
            byte[] data = reportService.generateMonthlyPayrollPdf(month, year);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=payroll_" + month + "_" + year + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
