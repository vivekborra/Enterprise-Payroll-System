import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Grid, MenuItem, TextField, Chip, Alert, LinearProgress, Avatar
} from '@mui/material';
import { 
  PlayArrow, CheckCircle, SyncAlt, Description, 
  DateRange, TrendingUp, AccountBalance 
} from '@mui/icons-material';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const MONTHS = [
  { v: 1, l: 'January' }, { v: 2, l: 'February' }, { v: 3, l: 'March' }, { v: 4, l: 'April' },
  { v: 5, l: 'May' }, { v: 6, l: 'June' }, { v: 7, l: 'July' }, { v: 8, l: 'August' },
  { v: 9, l: 'September' }, { v: 10, l: 'October' }, { v: 11, l: 'November' }, { v: 12, l: 'December' }
];
const YEARS = [2024, 2025, 2026];

export default function PayrollManagement() {
  const [params, setParams] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/hr/employees`); // To see employee list first
      setPayrolls(data.data.content);
      // Try to fetch existing payrolls for selected month
      // Fetch logic logic logic...
    } catch {
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayrolls(); }, [params]);

  const handleProcessAll = async () => {
    setProcessing(true);
    try {
      const { data } = await api.post(`/hr/payroll/process?month=${params.month}&year=${params.year}`);
      toast.success(data.message);
      fetchPayrolls();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography fontSize={20} fontWeight={800} color="white">Payroll Processing</Typography>
          <Typography fontSize={13} color="rgba(255,255,255,0.4)">Select cycle and trigger monthly salary computation</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField select size="small" label="Month" value={params.month} onChange={e => setParams({...params, month: e.target.value})} sx={{ minWidth: 140 }}>
            {MONTHS.map(m => <MenuItem key={m.v} value={m.v}>{m.l}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Year" value={params.year} onChange={e => setParams({...params, year: e.target.value})} sx={{ minWidth: 100 }}>
            {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>
          <Button 
            variant="contained" 
            startIcon={processing ? <SyncAlt sx={{ animation: 'spin 2s linear infinite' }} /> : <PlayArrow />}
            onClick={handleProcessAll}
            disabled={processing}
            sx={{ background: 'linear-gradient(135deg, #4ade80, #34d399)', color: '#000', fontWeight: 700, px: 3 }}
          >
            {processing ? 'Processing...' : 'Run Payroll'}
          </Button>
        </Box>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ background: 'rgba(74,222,128,0.1)', p: 1 }}><AccountBalance sx={{ color: '#4ade80' }} /></Avatar>
                <Box>
                  <Typography fontSize={12} color="rgba(255,255,255,0.5)">Total Projected Payout</Typography>
                  <Typography fontSize={22} fontWeight={800} color="white">₹1,45,20,000</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ background: 'rgba(251,191,36,0.1)', p: 1 }}><DateRange sx={{ color: '#fbbf24' }} /></Avatar>
                <Box>
                  <Typography fontSize={12} color="rgba(255,255,255,0.5)">Current Cycle</Typography>
                  <Typography fontSize={22} fontWeight={800} color="white">{MONTHS[params.month-1].l} {params.year}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ background: 'rgba(96,165,250,0.1)', p: 1 }}><TrendingUp sx={{ color: '#60a5fa' }} /></Avatar>
                <Box>
                  <Typography fontSize={12} color="rgba(255,255,255,0.5)">Employees to Process</Typography>
                  <Typography fontSize={22} fontWeight={800} color="white">{payrolls.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Employee', 'Base Pay', 'Gross Pay', 'Total Ded.', 'Net Pay', 'Tax Regime', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, borderColor: 'rgba(255,255,255,0.05)' }}>
                    {h.toUpperCase()}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={7} sx={{ border: 'none' }}><LinearProgress /></TableCell></TableRow>}
              {payrolls.map((emp) => (
                <TableRow key={emp.id} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.04)' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 30, height: 30, fontSize: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                        {emp.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography fontSize={13} fontWeight={600} color="white">{emp.name}</Typography>
                        <Typography fontSize={11} color="rgba(255,255,255,0.4)">{emp.employeeCode}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Typography fontSize={13} color="white">{fmt(emp.basicSalary)}</Typography></TableCell>
                  <TableCell><Typography fontSize={13} color="#4ade80" fontWeight={600}>₹--</Typography></TableCell>
                  <TableCell><Typography fontSize={13} color="#f87171">₹--</Typography></TableCell>
                  <TableCell><Typography fontSize={13} fontWeight={800} color="white">₹--</Typography></TableCell>
                  <TableCell><Chip label={emp.taxRegime} size="small" sx={{ fontSize: 10, bgcolor: 'rgba(255,255,255,0.05)' }} /></TableCell>
                  <TableCell>
                    <Button size="small" color="primary" sx={{ fontSize: 11 }} startIcon={<PlayArrow />}>Process</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Alert severity="info" sx={{ mt: 3, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa' }}>
        New tax slabs for FY 2024-25 (Budget 2024 Amendments) are automatically applied based on the employee's chosen regime.
      </Alert>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Box>
  );
}
