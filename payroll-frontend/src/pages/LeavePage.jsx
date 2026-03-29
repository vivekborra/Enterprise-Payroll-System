import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Chip, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, IconButton, Tooltip, Pagination, Stack, LinearProgress
} from '@mui/material';
import { Add, EventNote, Cancel, CheckCircle, HourglassEmpty, Block } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from '../api/axios';
import toast from 'react-hot-toast';

const LEAVE_TYPES = ['SICK', 'CASUAL', 'PAID', 'MATERNITY', 'PATERNITY', 'COMPENSATORY', 'BEREAVEMENT'];

const STATUS_CONFIG = {
  PENDING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: <HourglassEmpty sx={{ fontSize: 14 }} /> },
  APPROVED: { color: '#4ade80', bg: 'rgba(74,222,128,0.15)', icon: <CheckCircle sx={{ fontSize: 14 }} /> },
  REJECTED: { color: '#f87171', bg: 'rgba(248,113,113,0.15)', icon: <Block sx={{ fontSize: 14 }} /> },
  CANCELLED: { color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)', icon: <Cancel sx={{ fontSize: 14 }} /> },
};

export default function LeavePage() {
  const { user } = useSelector((s) => s.auth);
  const isHr = user?.role === 'HR' || user?.role === 'ADMIN';
  const [leaves, setLeaves] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    leaveType: 'CASUAL',
    startDate: null,
    endDate: null,
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const url = isHr
        ? `/hr/leaves?page=${page - 1}&size=10${filter ? `&status=${filter}` : ''}`
        : `/employee/leaves?page=${page - 1}&size=10`;
      const { data } = await api.get(url);
      setLeaves(data.data?.content || []);
      setTotalPages(data.data?.totalPages || 1);
    } catch { toast.error('Failed to load leaves'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, [page, filter]);

  const handleApply = async () => {
    if (!form.startDate || !form.endDate) return toast.error('Select dates');
    setSubmitting(true);
    try {
      await api.post('/employee/leaves', {
        ...form,
        startDate: form.startDate.format('YYYY-MM-DD'),
        endDate: form.endDate.format('YYYY-MM-DD'),
      });
      toast.success('Leave applied!');
      setOpen(false);
      fetchLeaves();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to apply'); }
    finally { setSubmitting(false); }
  };

  const handleApprove = async (id) => {
    try { await api.patch(`/hr/leaves/${id}/approve`); toast.success('Approved'); fetchLeaves(); }
    catch { toast.error('Failed'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try { await api.patch(`/hr/leaves/${id}/reject`, { reason }); toast.success('Rejected'); fetchLeaves(); }
    catch { toast.error('Failed'); }
  };

  const handleCancel = async (id) => {
    try { await api.delete(`/employee/leaves/${id}/cancel`); toast.success('Cancelled'); fetchLeaves(); }
    catch { toast.error('Failed'); }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography fontSize={20} fontWeight={800} color="white">
              {isHr ? 'Leave Requests' : 'My Leaves'}
            </Typography>
            <Typography fontSize={13} color="rgba(255,255,255,0.4)">
              {isHr ? 'Manage employee leave applications' : 'Apply and track your leave requests'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {isHr && (
              <TextField
                select
                size="small"
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: 2, color: 'white', background: 'rgba(255,255,255,0.05)' } }}
                InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
                label="Filter Status"
              >
                <MenuItem value="">All</MenuItem>
                {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            )}
            {!isHr && (
              <Button
                startIcon={<Add />}
                variant="contained"
                onClick={() => setOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Apply Leave
              </Button>
            )}
          </Box>
        </Box>

        <Card sx={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3 }}>
          {loading && <LinearProgress sx={{ borderRadius: '12px 12px 0 0', background: 'rgba(102,126,234,0.2)', '& .MuiLinearProgress-bar': { background: '#667eea' } }} />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {(isHr ? ['Employee', 'Type', 'Period', 'Days', 'Status', 'Applied', 'Actions']
                         : ['Type', 'Period', 'Days', 'Reason', 'Status', 'Action']).map(h => (
                    <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, borderColor: 'rgba(255,255,255,0.05)', py: 2 }}>
                      {h.toUpperCase()}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, border: 'none', color: 'rgba(255,255,255,0.3)' }}>
                      <EventNote sx={{ fontSize: 48, mb: 1 }} />
                      <Typography>No leave requests found</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {leaves.map((leave) => {
                  const cfg = STATUS_CONFIG[leave.status] || STATUS_CONFIG.CANCELLED;
                  return (
                    <TableRow key={leave.id} sx={{
                      '& td': { borderColor: 'rgba(255,255,255,0.04)', py: 2 },
                      '&:hover': { background: 'rgba(255,255,255,0.02)' },
                    }}>
                      {isHr && (
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: 13, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                              {leave.employeeName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography fontSize={13} fontWeight={600} color="white">{leave.employeeName}</Typography>
                              <Typography fontSize={11} color="rgba(255,255,255,0.4)">{leave.department}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip label={leave.leaveType} size="small" sx={{
                          height: 22, fontSize: 11,
                          background: 'rgba(102,126,234,0.15)',
                          color: '#a78bfa',
                        }} />
                      </TableCell>
                      <TableCell>
                        <Typography fontSize={12} color="white">{leave.startDate}</Typography>
                        <Typography fontSize={11} color="rgba(255,255,255,0.4)">→ {leave.endDate}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontSize={13} fontWeight={700} color="white">{leave.totalDays}</Typography>
                      </TableCell>
                      {!isHr && (
                        <TableCell>
                          <Typography fontSize={12} color="rgba(255,255,255,0.6)" noWrap sx={{ maxWidth: 150 }}>
                            {leave.reason || '-'}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
                          <Typography fontSize={12} color={cfg.color} fontWeight={600}>{leave.status}</Typography>
                        </Box>
                      </TableCell>
                      {isHr && (
                        <TableCell>
                          <Typography fontSize={11} color="rgba(255,255,255,0.35)">{leave.appliedAt?.split('T')[0]}</Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        {isHr && leave.status === 'PENDING' && (
                          <Box sx={{ display: 'flex', gap: 0.8 }}>
                            <Button size="small" onClick={() => handleApprove(leave.id)}
                              sx={{ minWidth: 0, px: 1.5, py: 0.4, fontSize: 11, background: 'rgba(74,222,128,0.15)', color: '#4ade80', borderRadius: 1.5, '&:hover': { background: 'rgba(74,222,128,0.25)' } }}>
                              Approve
                            </Button>
                            <Button size="small" onClick={() => handleReject(leave.id)}
                              sx={{ minWidth: 0, px: 1.5, py: 0.4, fontSize: 11, background: 'rgba(248,113,113,0.15)', color: '#f87171', borderRadius: 1.5, '&:hover': { background: 'rgba(248,113,113,0.25)' } }}>
                              Reject
                            </Button>
                          </Box>
                        )}
                        {!isHr && leave.status === 'PENDING' && (
                          <Tooltip title="Cancel Leave">
                            <IconButton size="small" onClick={() => handleCancel(leave.id)} sx={{ color: '#f87171' }}>
                              <Cancel sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)}
                sx={{ '& .MuiPaginationItem-root': { color: 'rgba(255,255,255,0.5)', '&.Mui-selected': { background: '#667eea', color: 'white' } } }} />
            </Box>
          )}
        </Card>

        {/* Apply Leave Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}>
          <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>Apply for Leave</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <TextField
              select
              fullWidth
              label="Leave Type"
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              sx={{ mb: 2.5, mt: 1 }}
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
              inputProps={{ style: { color: 'white' } }}
            >
              {LEAVE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <Stack direction="row" spacing={2} sx={{ mb: 2.5 }}>
              <DatePicker
                label="Start Date"
                value={form.startDate}
                onChange={(v) => setForm({ ...form, startDate: v })}
                slotProps={{ textField: { fullWidth: true, InputLabelProps: { style: { color: 'rgba(255,255,255,0.5)' } }, inputProps: { style: { color: 'white' } } } }}
              />
              <DatePicker
                label="End Date"
                value={form.endDate}
                onChange={(v) => setForm({ ...form, endDate: v })}
                slotProps={{ textField: { fullWidth: true, InputLabelProps: { style: { color: 'rgba(255,255,255,0.5)' } }, inputProps: { style: { color: 'white' } } } }}
              />
            </Stack>
            <TextField
              fullWidth
              label="Reason (Optional)"
              multiline rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
              inputProps={{ style: { color: 'white' } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'none' }}>Cancel</Button>
            <Button
              onClick={handleApply}
              disabled={submitting}
              variant="contained"
              sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
            >
              {submitting ? 'Applying...' : 'Apply Leave'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
