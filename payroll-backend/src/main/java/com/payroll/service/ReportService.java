package com.payroll.service;

import com.payroll.entity.Payroll;
import com.payroll.repository.PayrollRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final PayrollRepository payrollRepository;

    public byte[] generateMonthlyPayrollCsv(int month, int year) throws IOException {
        List<Payroll> payrolls = payrollRepository.findByMonthAndYear(month, year);
        
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVPrinter csvPrinter = new CSVPrinter(new OutputStreamWriter(out), 
                CSVFormat.DEFAULT.builder()
                        .setHeader("Employee Code", "Name", "Department", "Gross Salary", "Net Salary", "Tax", "PF", "Professional Tax")
                        .build())) {

            for (Payroll p : payrolls) {
                csvPrinter.printRecord(
                        p.getEmployee().getEmployeeCode(),
                        p.getEmployee().getUser().getName(),
                        p.getEmployee().getDepartment(),
                        p.getGrossSalary(),
                        p.getNetSalary(),
                        p.getIncomeTaxTds(),
                        p.getPfDeduction(),
                        p.getProfessionalTax()
                );
            }
            csvPrinter.flush();
        }
        return out.toByteArray();
    }

    public byte[] generateMonthlyPayrollPdf(int month, int year) throws DocumentException {
        List<Payroll> payrolls = payrollRepository.findByMonthAndYear(month, year);
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        
        document.open();
        
        // Add Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.DARK_GRAY);
        Paragraph title = new Paragraph("Organization Payroll Summary - " + month + "/" + year, titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        PdfPTable table = new PdfPTable(8);
        table.setWidthPercentage(100);
        String[] headers = {"Code", "Name", "Dept", "Gross", "Net", "Tax", "PF", "Prof. Tax"};
        
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            table.addCell(cell);
        }

        for (Payroll p : payrolls) {
            table.addCell(p.getEmployee().getEmployeeCode());
            table.addCell(p.getEmployee().getUser().getName());
            table.addCell(p.getEmployee().getDepartment().name());
            table.addCell(p.getGrossSalary().toString());
            table.addCell(p.getNetSalary().toString());
            table.addCell(p.getIncomeTaxTds().toString());
            table.addCell(p.getPfDeduction().toString());
            table.addCell(p.getProfessionalTax().toString());
        }

        document.add(table);
        document.close();
        
        return out.toByteArray();
    }
}
