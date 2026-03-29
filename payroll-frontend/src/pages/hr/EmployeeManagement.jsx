import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, IconButton, Tooltip, Pagination, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, MenuItem, Chip, LinearProgress
} from '@mui/material';
import {
  Add, Edit, Delete, Search, FilterList, PersonAdd,
  Badge, Email, Business, Work
} from '@mui/icons-material';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['ENGINEERING', 'HUMAN_RESOURCES', 'FINANCE', 'MARKETING', 'SALES', 'OPERATIONS', 'LEGAL', 'PRODUCT', 'DESIGN', 'CUSTOMER_SUPPORT'];
const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'];
const TAX_REGIMES = ['NEW', 'OLD'];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [form, setForm] = useState({
    name: '', email: '', password: 'Password@123',
    phone: '', address: '', department: 'ENGINEERING',
    designation: '', employmentType: 'FULL_TIME',
    joiningDate: new Date().toISOString().split('T')[0],
    basicSalary: 0, hra: 0, specialAllowance: 0,
    taxRegime: 'NEW'
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/hr/employees?page=${page - 1}&size=10&search=${search}`);
      setEmployees(data.data.content);
      setTotalPages(data.data.totalPages);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(), 500);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleSubmit = async () => {
    try {
      if (editId) {
        await api.put(`/hr/employees/${editId}`, form);
        toast.success('Employee updated');
      } else {
        await api.post('/hr/employees', form);
        toast.success('Employee added');
      }
      setOpen(false);
      fetchEmployees();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = (emp) => {
    setEditId(emp.id);
    setForm({
      ...emp,
      name: emp.name,
      email: emp.email,
      password: '', // Don't send password back
    });
    setOpen(true);
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this employee?')) return;
    try {
      await api.delete(`/hr/employees/${id}`);
      toast.success('Employee deactivated');
      fetchEmployees();
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography fontSize={20} fontWeight={800} color="white">Employee Directory</Typography>
          <Typography fontSize={13} color="rgba(255,255,255,0.4)">Manage corporate workforce and salary structures</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => { setEditId(null); setOpen(true); }}
          sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Add Employee
        </Button>
      </Box>

      <Card sx={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name, code, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'rgba(255,255,255,0.3)', mr: 1 }} />,
              sx: { borderRadius: 2, background: 'rgba(255,255,255,0.03)', color: 'white' }
            }}
          />
        </CardContent>
      </Card>

      <Card sx={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3 }}>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Employee', 'Department', 'Designation', 'Joining Date', 'Salary (Monthly)', 'Status', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, borderColor: 'rgba(255,255,255,0.05)' }}>
                    {h.toUpperCase()}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.04)' }, '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>{emp.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography fontSize={13} fontWeight={600} color="white">{emp.name}</Typography>
                        <Typography fontSize={11} color="rgba(255,255,255,0.4)">{emp.employeeCode}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={emp.department} size="small" sx={{ fontSize: 10, background: 'rgba(102,126,234,0.1)', color: '#a78bfa' }} />
                  </TableCell>
                  <TableCell>
                    <Typography fontSize={13} color="rgba(255,255,255,0.7)">{emp.designation}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize={12} color="rgba(255,255,255,0.5)">{emp.joiningDate}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize={13} fontWeight={700} color="white">₹{emp.basicSalary.toLocaleString()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={emp.active ? 'Active' : 'Inactive'} 
                      size="small" 
                      sx={{ 
                        height: 20, fontSize: 10,
                        background: emp.active ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                        color: emp.active ? '#4ade80' : '#f87171' 
                      }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Edit Profile">
                        <IconButton size="small" onClick={() => handleEdit(emp)} sx={{ color: '#60a5fa' }}><Edit fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Deactivate">
                        <IconButton size="small" onClick={() => handleDeactivate(emp.id)} sx={{ color: '#f87171' }}><Delete fontSize="small" /></IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} />
        </Box>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: 'white' }}>{editId ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField fullWidth label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} disabled={editId} />
            </Grid>
            {!editId && (
              <Grid item xs={6}>
                <TextField fullWidth label="Initial Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </Grid>
            )}
            <Grid item xs={6}>
              <TextField select fullWidth label="Department" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Designation" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Tax Regime" value={form.taxRegime} onChange={e => setForm({...form, taxRegime: e.target.value})}>
                {TAX_REGIMES.map(r => <MenuItem key={r} value={r}>{r} REGIME</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth type="number" label="Basic Salary" value={form.basicSalary} onChange={e => setForm({...form, basicSalary: e.target.value})} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth type="number" label="HRA" value={form.hra} onChange={e => setForm({...form, hra: e.target.value})} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth type="number" label="Allowance" value={form.specialAllowance} onChange={e => setForm({...form, specialAllowance: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'gray' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save Employee</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
