package com.payroll.service;

import com.payroll.entity.Employee;
import com.payroll.entity.Leave;
import com.payroll.entity.Payroll;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.text.NumberFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.company.name}")
    private String companyName;

    @Async
    public void sendLeaveApplicationNotification(Employee employee, Leave leave) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(employee.getUser().getEmail());
            helper.setSubject("[" + companyName + "] Leave Application Received");
            helper.setText(buildLeaveAppliedHtml(employee, leave), true);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send leave application email: {}", e.getMessage());
        }
    }

    @Async
    public void sendLeaveApprovalNotification(Employee employee, Leave leave, boolean approved, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(employee.getUser().getEmail());
            helper.setSubject("[" + companyName + "] Leave " + (approved ? "Approved" : "Rejected"));
            helper.setText(buildLeaveStatusHtml(employee, leave, approved, reason), true);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send leave status email: {}", e.getMessage());
        }
    }

    @Async
    public void sendSalaryCreditNotification(Employee employee, Payroll payroll) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(employee.getUser().getEmail());
            helper.setSubject("[" + companyName + "] Salary Credited - " + getMonthName(payroll.getMonth()) + " " + payroll.getYear());
            helper.setText(buildSalaryCreditHtml(employee, payroll), true);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send salary credit email: {}", e.getMessage());
        }
    }

    private String buildLeaveAppliedHtml(Employee employee, Leave leave) {
        return """
                <html><body style='font-family:Arial,sans-serif;'>
                <h2>Leave Application Received</h2>
                <p>Dear %s,</p>
                <p>Your leave application has been received and is pending approval.</p>
                <table border='1' cellpadding='8' cellspacing='0'>
                    <tr><td><b>Leave Type</b></td><td>%s</td></tr>
                    <tr><td><b>From</b></td><td>%s</td></tr>
                    <tr><td><b>To</b></td><td>%s</td></tr>
                    <tr><td><b>Total Days</b></td><td>%d</td></tr>
                    <tr><td><b>Status</b></td><td>PENDING</td></tr>
                </table>
                <p>Regards,<br>%s HR Team</p>
                </body></html>
                """.formatted(
                employee.getUser().getName(),
                leave.getLeaveType().name(),
                leave.getStartDate(),
                leave.getEndDate(),
                leave.getTotalDays(),
                companyName
        );
    }

    private String buildLeaveStatusHtml(Employee employee, Leave leave, boolean approved, String reason) {
        String status = approved ? "<span style='color:green'>APPROVED</span>" : "<span style='color:red'>REJECTED</span>";
        return """
                <html><body style='font-family:Arial,sans-serif;'>
                <h2>Leave %s</h2>
                <p>Dear %s,</p>
                <p>Your leave request has been %s.</p>
                <table border='1' cellpadding='8' cellspacing='0'>
                    <tr><td><b>Leave Type</b></td><td>%s</td></tr>
                    <tr><td><b>From</b></td><td>%s</td></tr>
                    <tr><td><b>To</b></td><td>%s</td></tr>
                    <tr><td><b>Status</b></td><td>%s</td></tr>
                    %s
                </table>
                <p>Regards,<br>%s HR Team</p>
                </body></html>
                """.formatted(
                approved ? "Approved" : "Rejected",
                employee.getUser().getName(),
                approved ? "approved" : "rejected",
                leave.getLeaveType().name(),
                leave.getStartDate(),
                leave.getEndDate(),
                status,
                (reason != null ? "<tr><td><b>Reason</b></td><td>" + reason + "</td></tr>" : ""),
                companyName
        );
    }

    private String buildSalaryCreditHtml(Employee employee, Payroll payroll) {
        NumberFormat fmt = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        return """
                <html><body style='font-family:Arial,sans-serif;'>
                <h2>Salary Credited - %s %d</h2>
                <p>Dear %s,</p>
                <p>Your salary for %s %d has been processed.</p>
                <table border='1' cellpadding='8' cellspacing='0'>
                    <tr><td><b>Gross Salary</b></td><td>%s</td></tr>
                    <tr><td><b>PF Deduction</b></td><td>%s</td></tr>
                    <tr><td><b>Income Tax (TDS)</b></td><td>%s</td></tr>
                    <tr><td><b>Professional Tax</b></td><td>%s</td></tr>
                    <tr><td><b>Total Deductions</b></td><td>%s</td></tr>
                    <tr style='background:#e8f5e9'><td><b>Net Salary</b></td><td><b>%s</b></td></tr>
                </table>
                <p>Regards,<br>%s Finance Team</p>
                </body></html>
                """.formatted(
                getMonthName(payroll.getMonth()), payroll.getYear(),
                employee.getUser().getName(),
                getMonthName(payroll.getMonth()), payroll.getYear(),
                fmt.format(payroll.getGrossSalary()),
                fmt.format(payroll.getPfDeduction()),
                fmt.format(payroll.getIncomeTaxTds()),
                fmt.format(payroll.getProfessionalTax()),
                fmt.format(payroll.getTotalDeductions()),
                fmt.format(payroll.getNetSalary()),
                companyName
        );
    }

    private String getMonthName(int month) {
        return java.time.Month.of(month).getDisplayName(java.time.format.TextStyle.FULL, Locale.ENGLISH);
    }
}
