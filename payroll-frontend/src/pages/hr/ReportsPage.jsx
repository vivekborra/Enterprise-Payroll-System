import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Chip, LinearProgress, Stack, TextField, MenuItem
} from '@mui/material';
import {
  Assessment, Download, Description, InsertDriveFile,
  FilterList, Refresh, AccountBalance, People, AttachMoney
} from '@mui/icons-material';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { id: 'EMPLOYEE', label: 'Employee Directory', icon: <People />, color: '#667eea' },
  { id: 'PAYROLL', label: 'Monthly Payroll Summary', icon: <AccountBalance />, color: '#764ba2' },
  { id: 'TAX', label: 'Annual Tax Projections', icon: <Assessment />, color: '#f59e0b' },
  { id: 'LEAVE', label: 'Leave Utilization Report', icon: <Description />, color: '#4ade80' },
];

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const handleDownload = async (type) => {
    setLoading(true);
    try {
      const url = type === 'EMPLOYEE' 
        ? '/hr/reports/employees/csv'
        : `/hr/reports/payroll/csv?month=${month}&year=${year}`;
      
      const response = await api.get(url, { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${type}_Report_${month}_${year}.csv`;
      link.click();
      
      toast.success(`${type} Report downloaded!`);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography fontSize={22} fontWeight={800} color="white">System Reports</Typography>
          <Typography fontSize={13} color="rgba(255,255,255,0.4)">Download organization-wide data and insights</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
              select
              size="small"
              label="Month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              sx={{ minWidth: 100, '& .MuiOutlinedInput-root': { color: 'white', borderRadius: 2 } }}
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
          >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <MenuItem key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</MenuItem>
              ))}
          </TextField>
          <TextField
              select
              size="small"
              label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              sx={{ minWidth: 100, '& .MuiOutlinedInput-root': { color: 'white', borderRadius: 2 } }}
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
          >
              {[2023, 2024, 2025].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

      <Grid container spacing={3}>
        {REPORT_TYPES.map((report) => (
          <Grid item xs={12} sm={6} md={3} key={report.id}>
            <Card sx={{
              background: '#161b27',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 3,
              transition: 'transform 0.2s, background 0.2s',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-5px)',
                background: 'rgba(255,255,255,0.03)',
                borderColor: report.color,
              },
            }} onClick={() => handleDownload(report.id)}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{
                  p: 2,
                  borderRadius: '50%',
                  background: `${report.color}20`,
                  color: report.color,
                  display: 'inline-flex',
                  mb: 2
                }}>
                  {React.cloneElement(report.icon, { fontSize: 'large' })}
                </Box>
                <Typography fontSize={15} fontWeight={700} color="white" mb={1}>
                  {report.label}
                </Typography>
                <Typography fontSize={12} color="rgba(255,255,255,0.4)" mb={2.5}>
                  Generate comprehensive {report.id.toLowerCase()} data in CSV format.
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Download />}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                    textTransform: 'none',
                    borderRadius: 2,
                    fontSize: 12,
                    '&:hover': { borderColor: report.color, color: report.color }
                  }}
                >
                  Download CSV
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 5 }}>
        <Typography fontSize={16} fontWeight={700} color="white" mb={3}>Recent Downloads</Typography>
        <Card sx={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Report Name', 'Parameters', 'Format', 'Status', 'Date'].map(h => (
                    <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, borderColor: 'rgba(255,255,255,0.05)' }}>
                      {h.toUpperCase()}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { name: 'Employee Directory', params: 'Active Employees', format: 'CSV', status: 'Generated', date: 'Just now' },
                  { name: 'Payroll Summary', params: 'Mar 2026', format: 'PDF', status: 'Completed', date: '2 hours ago' },
                  { name: 'Tax Projections', params: 'FY 2025-26', format: 'CSV', status: 'Cached', date: 'Yesterday' },
                ].map((row, i) => (
                  <TableRow key={i} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.04)' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <InsertDriveFile sx={{ color: '#a78bfa', fontSize: 18 }} />
                        <Typography fontSize={13} fontWeight={600} color="white">{row.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography fontSize={12} color="rgba(255,255,255,0.5)">{row.params}</Typography></TableCell>
                    <TableCell><Chip label={row.format} size="small" sx={{ height: 20, fontSize: 10, background: 'rgba(102,126,234,0.1)', color: '#667eea' }} /></TableCell>
                    <TableCell><Chip label={row.status} size="small" variant="outlined" sx={{ height: 20, fontSize: 10, color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)' }} /></TableCell>
                    <TableCell><Typography fontSize={12} color="rgba(255,255,255,0.3)">{row.date}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Box>
  );
}
