import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Avatar
} from '@mui/material';
import {
  People, EventNote, AccountBalanceWallet, TrendingUp,
  BarChart as BarChartIcon, PieChart as PieChartIcon
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <Card sx={{
    background: '#161b27',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 3,
    transition: 'transform 0.2s',
    '&:hover': { transform: 'translateY(-2px)' },
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography fontSize={12} color="rgba(255,255,255,0.5)" mb={0.5}>{title}</Typography>
          <Typography fontSize={26} fontWeight={800} color="white">{value}</Typography>
          {subtitle && <Typography fontSize={12} color="rgba(255,255,255,0.4)" mt={0.5}>{subtitle}</Typography>}
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, background: `${color}20` }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 24 } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const COLORS = ['#667eea', '#4ade80', '#f59e0b', '#f87171', '#60a5fa', '#a78bfa', '#34d399', '#fb923c', '#e879f9', '#38bdf8'];

export default function HrDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, leavesRes] = await Promise.all([
          api.get('/hr/dashboard'),
          api.get('/hr/leaves?status=PENDING&size=5'),
        ]);
        setDashboard(dashRes.data.data);
        setPendingLeaves(leavesRes.data.data?.content || []);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fmt = (n) => n
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 }).format(n)
    : '₹0';

  const deptData = dashboard?.departmentCounts
    ? Object.entries(dashboard.departmentCounts).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k.replace('_', ' '), value: v }))
    : [];

  const handleApprove = async (id) => {
    try {
      await api.patch(`/hr/leaves/${id}/approve`);
      toast.success('Leave approved');
      setPendingLeaves(prev => prev.filter(l => l.id !== id));
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/hr/leaves/${id}/reject`, { reason: 'Not approved' });
      toast.error('Leave rejected');
      setPendingLeaves(prev => prev.filter(l => l.id !== id));
    } catch { toast.error('Failed to reject'); }
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1,2,3,4].map(i => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rounded" height={130} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      <Typography fontSize={22} fontWeight={800} color="white" mb={3}>
        HR Admin Dashboard
      </Typography>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Total Employees"
            value={dashboard?.totalEmployees || 0}
            subtitle={`${dashboard?.activeEmployees || 0} active`}
            icon={<People />}
            color="#667eea"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Pending Leaves"
            value={dashboard?.pendingLeaves || 0}
            subtitle="Awaiting approval"
            icon={<EventNote />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Monthly Payroll"
            value={fmt(dashboard?.totalPayrollThisMonth)}
            subtitle="Net this month"
            icon={<AccountBalanceWallet />}
            color="#4ade80"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Annual Payroll"
            value={fmt(dashboard?.totalPayrollThisYear)}
            subtitle="Gross this year"
            icon={<TrendingUp />}
            color="#a78bfa"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Department Distribution */}
        <Grid item xs={12} md={5}>
          <Card sx={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PieChartIcon sx={{ color: '#a78bfa', fontSize: 20 }} />
                <Typography fontSize={15} fontWeight={700} color="white">Department Distribution</Typography>
              </Box>
              {deptData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      dataKey="value" paddingAngle={3}>
                      {deptData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                    <Legend formatter={(v) => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5, color: 'rgba(255,255,255,0.3)' }}>
                  <People sx={{ fontSize: 48, mb: 1 }} />
                  <Typography fontSize={14}>No employee data</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Leave Requests */}
        <Grid item xs={12} md={7}>
          <Card sx={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventNote sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <Typography fontSize={15} fontWeight={700} color="white">Pending Leave Requests</Typography>
                </Box>
                {dashboard?.pendingLeaves > 5 && (
                  <Chip label={`+${dashboard.pendingLeaves - 5} more`} size="small"
                    sx={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', height: 22, fontSize: 11 }} />
                )}
              </Box>
              {pendingLeaves.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5, color: 'rgba(255,255,255,0.3)' }}>
                  <EventNote sx={{ fontSize: 48, mb: 1 }} />
                  <Typography>No pending leave requests</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {['Employee', 'Type', 'Days', 'Actions'].map(h => (
                          <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, border: 'none', pb: 1 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingLeaves.map((leave) => (
                        <TableRow key={leave.id} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.04)' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 30, height: 30, fontSize: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                                {leave.employeeName?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography fontSize={13} color="white" fontWeight={500}>{leave.employeeName}</Typography>
                                <Typography fontSize={11} color="rgba(255,255,255,0.4)">{leave.employeeCode}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={leave.leaveType} size="small" sx={{
                              height: 20, fontSize: 10,
                              background: leave.leaveType === 'SICK' ? 'rgba(248,113,113,0.15)' : 'rgba(96,165,250,0.15)',
                              color: leave.leaveType === 'SICK' ? '#f87171' : '#60a5fa',
                            }} />
                          </TableCell>
                          <TableCell>
                            <Typography fontSize={13} color="white">{leave.totalDays}d</Typography>
                            <Typography fontSize={10} color="rgba(255,255,255,0.3)">
                              {leave.startDate} → {leave.endDate}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.8 }}>
                              <Button size="small" variant="contained"
                                onClick={() => handleApprove(leave.id)}
                                sx={{ minWidth: 0, px: 1.5, py: 0.3, fontSize: 11, background: '#4ade80', color: '#000', '&:hover': { background: '#22c55e' } }}>
                                ✓
                              </Button>
                              <Button size="small" variant="contained"
                                onClick={() => handleReject(leave.id)}
                                sx={{ minWidth: 0, px: 1.5, py: 0.3, fontSize: 11, background: '#f87171', color: '#000', '&:hover': { background: '#ef4444' } }}>
                                ✗
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
