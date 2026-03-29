import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, LinearProgress, Skeleton, Stack, Avatar
} from '@mui/material';
import { Download, PictureAsPdf, AccountBalanceWallet } from '@mui/icons-material';
import api from '../api/axios';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function PayrollPage() {
  const { user } = useSelector((s) => s.auth);
  const [payrolls, setPayrolls] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/employee/payroll?size=12');
        const list = data.data?.content || [];
        setPayrolls(list);
        if (list.length > 0) setSelected(list[0]);
      } catch { toast.error('Failed to load payroll'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const fmt = (n) => n
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
    : '₹0.00';

  const downloadPayslip = (payroll) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 12, 41);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYROLL PRO', 15, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Enterprise Payroll & Tax Processing System', 15, 26);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYSLIP', 160, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${MONTHS[payroll.month - 1]} ${payroll.year}`, 165, 30);

    // Employee Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE DETAILS', 15, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const empDetails = [
      ['Name', payroll.employeeName, 'Employee Code', payroll.employeeCode],
      ['Department', payroll.department, 'Designation', payroll.designation],
      ['Tax Regime', payroll.taxRegime, 'Working Days', `${payroll.workingDays}`],
      ['Paid Days', `${payroll.paidDays}`, 'LOP Days', `${payroll.lossOfPayDays}`],
    ];
    autoTable(doc, {
      startY: 60, body: empDetails, theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', fillColor: [245, 245, 245] }, 2: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
    });

    const tableY = doc.lastAutoTable.finalY + 10;

    // Earnings & Deductions side by side
    const earnings = [
      ['Basic Salary', fmt(payroll.basicSalary)],
      ['HRA', fmt(payroll.hra)],
      ['Special Allowance', fmt(payroll.specialAllowance)],
      ['Transport Allowance', fmt(payroll.transportAllowance)],
      ['Medical Allowance', fmt(payroll.medicalAllowance)],
      ['Bonus', fmt(payroll.bonus)],
    ];
    const deductions = [
      ['Provident Fund (PF)', fmt(payroll.pfDeduction)],
      ['Income Tax (TDS)', fmt(payroll.incomeTaxTds)],
      ['Professional Tax', fmt(payroll.professionalTax)],
      ['Other Deductions', fmt(payroll.otherDeductions)],
      ['', ''],
      ['', ''],
    ];

    doc.setFont('helvetica', 'bold');
    doc.text('EARNINGS', 15, tableY);
    doc.text('DEDUCTIONS', 110, tableY);
    doc.setFont('helvetica', 'normal');

    autoTable(doc, {
      startY: tableY + 4,
      tableWidth: 88,
      body: earnings,
      foot: [['GROSS SALARY', fmt(payroll.grossSalary)]],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      footStyles: { fontStyle: 'bold', fillColor: [48, 43, 99], textColor: [255, 255, 255] },
    });

    autoTable(doc, {
      startY: tableY + 4,
      margin: { left: 110 },
      body: deductions,
      foot: [['TOTAL DEDUCTIONS', fmt(payroll.totalDeductions)]],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      footStyles: { fontStyle: 'bold', fillColor: [180, 50, 50], textColor: [255, 255, 255] },
    });

    // Net Salary
    const netY = doc.lastAutoTable.finalY + 8;
    doc.setFillColor(15, 12, 41);
    doc.roundedRect(15, netY, 180, 18, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('NET SALARY (Take Home)', 25, netY + 12);
    doc.text(fmt(payroll.netSalary), 155, netY + 12);

    // Tax Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const taxY = netY + 28;
    doc.text(`Annual Taxable Income: ${fmt(payroll.annualTaxableIncome)}  |  Annual Tax Liability: ${fmt(payroll.annualTaxLiability)}  |  Regime: ${payroll.taxRegime}`, 15, taxY);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This is a computer generated payslip and does not require signature.', 15, 285);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 150, 285);

    doc.save(`Payslip_${payroll.employeeCode}_${MONTHS[payroll.month - 1]}_${payroll.year}.pdf`);
    toast.success('Payslip downloaded!');
  };

  if (loading) {
    return <Skeleton variant="rounded" height={400} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }} />;
  }

  if (payrolls.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10, color: 'rgba(255,255,255,0.3)' }}>
        <AccountBalanceWallet sx={{ fontSize: 72, mb: 2 }} />
        <Typography fontSize={18} fontWeight={600} color="rgba(255,255,255,0.5)">No payroll records yet</Typography>
        <Typography fontSize={14} mt={1}>Your payslips will appear here once payroll is processed</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography fontSize={20} fontWeight={800} color="white" mb={3}>My Payslips</Typography>

      <Grid container spacing={3}>
        {/* Month List */}
        <Grid item xs={12} md={3}>
          <Card sx={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography fontSize={12} color="rgba(255,255,255,0.4)" fontWeight={600} mb={2}>
                PAYSLIP HISTORY
              </Typography>
              {payrolls.map((p) => (
                <Box
                  key={p.id}
                  onClick={() => setSelected(p)}
                  sx={{
                    px: 2, py: 1.5, borderRadius: 2, mb: 0.8, cursor: 'pointer',
                    background: selected?.id === p.id
                      ? 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))'
                      : 'rgba(255,255,255,0.03)',
                    border: selected?.id === p.id ? '1px solid rgba(102,126,234,0.3)' : '1px solid transparent',
                    '&:hover': { background: 'rgba(255,255,255,0.06)' },
                    transition: 'all 0.2s',
                  }}
                >
                  <Typography fontSize={13} fontWeight={600} color="white">
                    {MONTHS[p.month - 1]} {p.year}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography fontSize={11} color="rgba(255,255,255,0.4)">
                      Net: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 0 }).format(p.netSalary)}
                    </Typography>
                    <Chip label={p.status} size="small" sx={{
                      height: 18, fontSize: 9,
                      background: p.status === 'PAID' ? 'rgba(74,222,128,0.15)' : 'rgba(102,126,234,0.15)',
                      color: p.status === 'PAID' ? '#4ade80' : '#a78bfa',
                    }} />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Payslip Detail */}
        {selected && (
          <Grid item xs={12} md={9}>
            <Card sx={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                  <Box>
                    <Typography fontSize={11} color="rgba(255,255,255,0.4)" mb={0.5}>PAYSLIP FOR</Typography>
                    <Typography fontSize={22} fontWeight={800} color="white">
                      {MONTHS[selected.month - 1]} {selected.year}
                    </Typography>
                    <Chip label={selected.status} size="small" sx={{ mt: 1, background: 'rgba(74,222,128,0.15)', color: '#4ade80' }} />
                  </Box>
                  <Button
                    startIcon={<Download />}
                    variant="contained"
                    onClick={() => downloadPayslip(selected)}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: 2, textTransform: 'none', fontWeight: 600,
                    }}
                  >
                    Download PDF
                  </Button>
                </Box>

                {/* Working Days */}
                <Box sx={{
                  p: 2.5, borderRadius: 2,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  mb: 3,
                  display: 'flex',
                  gap: 4,
                }}>
                  {[
                    { label: 'Working Days', value: selected.workingDays },
                    { label: 'Paid Days', value: selected.paidDays },
                    { label: 'LOP Days', value: selected.lossOfPayDays },
                    { label: 'Tax Regime', value: selected.taxRegime },
                  ].map((item) => (
                    <Box key={item.label}>
                      <Typography fontSize={11} color="rgba(255,255,255,0.4)">{item.label}</Typography>
                      <Typography fontSize={18} fontWeight={700} color="white">{item.value}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* Earnings & Deductions */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography fontSize={12} fontWeight={700} color="rgba(255,255,255,0.4)" mb={2}>EARNINGS</Typography>
                    {[
                      { label: 'Basic Salary', value: selected.basicSalary },
                      { label: 'HRA', value: selected.hra },
                      { label: 'Special Allowance', value: selected.specialAllowance },
                      { label: 'Transport Allowance', value: selected.transportAllowance },
                      { label: 'Medical Allowance', value: selected.medicalAllowance },
                      { label: 'Bonus', value: selected.bonus },
                    ].map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.2, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <Typography fontSize={13} color="rgba(255,255,255,0.65)">{item.label}</Typography>
                        <Typography fontSize={13} fontWeight={600} color="white">{fmt(item.value)}</Typography>
                      </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, mt: 1, borderRadius: 2, px: 2, background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.2)' }}>
                      <Typography fontWeight={700} color="#a78bfa">Gross Salary</Typography>
                      <Typography fontWeight={800} color="white" fontSize={16}>{fmt(selected.grossSalary)}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography fontSize={12} fontWeight={700} color="rgba(255,255,255,0.4)" mb={2}>DEDUCTIONS</Typography>
                    {[
                      { label: 'Provident Fund (PF)', value: selected.pfDeduction },
                      { label: 'Income Tax (TDS)', value: selected.incomeTaxTds },
                      { label: 'Professional Tax', value: selected.professionalTax },
                      { label: 'Other Deductions', value: selected.otherDeductions },
                    ].map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.2, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <Typography fontSize={13} color="rgba(255,255,255,0.65)">{item.label}</Typography>
                        <Typography fontSize={13} fontWeight={600} color="#f87171">{fmt(item.value)}</Typography>
                      </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, mt: 1, borderRadius: 2, px: 2, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
                      <Typography fontWeight={700} color="#f87171">Total Deductions</Typography>
                      <Typography fontWeight={800} color="#f87171" fontSize={16}>{fmt(selected.totalDeductions)}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Net Salary */}
                <Box sx={{
                  mt: 3, p: 3, borderRadius: 3,
                  background: 'linear-gradient(135deg, #0f0c29, #302b63)',
                  border: '1px solid rgba(102,126,234,0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Box>
                    <Typography fontSize={12} color="rgba(255,255,255,0.5)" mb={0.5}>NET SALARY (Take Home)</Typography>
                    <Typography fontSize={32} fontWeight={800} color="white">{fmt(selected.netSalary)}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography fontSize={11} color="rgba(255,255,255,0.4)">Annual Tax Liability</Typography>
                    <Typography fontSize={16} fontWeight={700} color="#f87171">{fmt(selected.annualTaxLiability)}</Typography>
                    <Typography fontSize={11} color="rgba(255,255,255,0.4)" mt={0.5}>Taxable Income: {fmt(selected.annualTaxableIncome)}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
