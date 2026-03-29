import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, Typography, LinearProgress,
  Skeleton, Avatar, Chip, Stack
} from '@mui/material';
import {
  TrendingUp, AccountBalanceWallet, EventAvailable, EventBusy,
  WorkHistory, MonetizationOn, TrendingDown
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, subtitle, icon, gradient, trend }) => (
  <Card sx={{
    background: gradient || 'linear-gradient(135deg, #1a1f2e, #1e2436)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 3,
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' },
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography fontSize={12} color="rgba(255,255,255,0.5)" fontWeight={500} mb={0.5}>
            {title}
          </Typography>
          <Typography fontSize={28} fontWeight={800} color="white">
            {value}
          </Typography>
          {subtitle && (
            <Typography fontSize={12} color="rgba(255,255,255,0.4)" mt={0.5}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{
          p: 1.5,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.08)',
          display: 'flex',
        }}>
          {icon}
        </Box>
      </Box>
      {trend !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrendingUp sx={{ fontSize: 14, color: '#4ade80' }} />
          <Typography fontSize={12} color="#4ade80">{trend}% this month</Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const LeaveCard = ({ label, balance, total, color }) => {
  const pct = Math.round((balance / total) * 100);
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
        <Typography fontSize={13} color="rgba(255,255,255,0.7)">{label}</Typography>
        <Typography fontSize={13} fontWeight={700} color="white">{balance}/{total}</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 6,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.08)',
          '& .MuiLinearProgress-bar': { background: color, borderRadius: 3 },
        }}
      />
    </Box>
  );
};

export default function EmployeeDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, profileRes, payrollRes] = await Promise.all([
          api.get('/employee/dashboard'),
          api.get('/employee/profile'),
          api.get('/employee/payroll?size=6'),
        ]);
        setDashboard(dashRes.data.data);
        setProfile(profileRes.data.data);
        setPayrolls(payrollRes.data.data?.content || []);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fmt = (n) => n
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
    : '₹0';

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = payrolls.map(p => ({
    month: months[p.month - 1],
    gross: parseFloat(p.grossSalary || 0),
    net: parseFloat(p.netSalary || 0),
    deductions: parseFloat(p.totalDeductions || 0),
  })).reverse();

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1,2,3,4].map(i => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rounded" height={140} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      {/* Welcome */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            width: 52, height: 52, fontSize: 20, fontWeight: 700,
          }}>
            {user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography fontSize={22} fontWeight={800} color="white">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </Typography>
            <Stack direction="row" spacing={1} mt={0.5}>
              {profile?.employeeCode && (
                <Chip label={profile.employeeCode} size="small" sx={{ background: 'rgba(102,126,234,0.2)', color: '#a78bfa', height: 22, fontSize: 11 }} />
              )}
              {profile?.designation && (
                <Chip label={profile.designation} size="small" sx={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', height: 22, fontSize: 11 }} />
              )}
              {profile?.department && (
                <Chip label={profile.department} size="small" sx={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', height: 22, fontSize: 11 }} />
              )}
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Gross Salary"
            value={fmt(dashboard?.currentMonthGross)}
            subtitle="This month"
            icon={<MonetizationOn sx={{ color: '#a78bfa', fontSize: 22 }} />}
            trend={2.4}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Net Salary"
            value={fmt(dashboard?.currentMonthNet)}
            subtitle="After all deductions"
            icon={<AccountBalanceWallet sx={{ color: '#4ade80', fontSize: 22 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Deductions"
            value={fmt(dashboard?.currentMonthDeductions)}
            subtitle="PF + Tax + PT"
            icon={<TrendingDown sx={{ color: '#f87171', fontSize: 22 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Present Days"
            value={`${dashboard?.presentDaysThisMonth || 0}/${dashboard?.workingDaysThisMonth || 0}`}
            subtitle="Working days this month"
            icon={<WorkHistory sx={{ color: '#60a5fa', fontSize: 22 }} />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Salary Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{
            background: '#161b27',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 3,
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography fontSize={15} fontWeight={700} color="white" mb={3}>
                Salary Trend (Last 6 Months)
              </Typography>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }}
                      formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']}
                    />
                    <Area type="monotone" dataKey="gross" name="Gross" stroke="#667eea" fill="url(#grossGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="net" name="Net" stroke="#4ade80" fill="url(#netGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6, color: 'rgba(255,255,255,0.3)' }}>
                  <AccountBalanceWallet sx={{ fontSize: 48, mb: 1 }} />
                  <Typography>No payroll data yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Balance */}
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: '#161b27',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 3,
            height: '100%',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography fontSize={15} fontWeight={700} color="white" mb={3}>
                Leave Balance
              </Typography>
              <LeaveCard label="Casual Leave" balance={dashboard?.casualLeaveBalance || 0} total={12} color="#667eea" />
              <LeaveCard label="Sick Leave" balance={dashboard?.sickLeaveBalance || 0} total={12} color="#f59e0b" />
              <LeaveCard label="Paid Leave" balance={dashboard?.paidLeaveBalance || 0} total={15} color="#4ade80" />

              <Box sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                background: 'rgba(102,126,234,0.1)',
                border: '1px solid rgba(102,126,234,0.2)',
              }}>
                <Typography fontSize={12} color="rgba(255,255,255,0.5)" mb={0.5}>Tax Regime</Typography>
                <Typography fontSize={14} fontWeight={700} color="#a78bfa">
                  {profile?.taxRegime || 'NEW'} REGIME
                </Typography>
                <Typography fontSize={11} color="rgba(255,255,255,0.4)" mt={0.5}>
                  Annual Tax: {fmt(payrolls[0]?.annualTaxLiability)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
