import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Card, CardContent, Typography, Grid, Avatar,
  Divider, Chip, Stack, LinearProgress, IconButton, Tooltip,
  List, ListItem, ListItemText, ListItemIcon,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button
} from '@mui/material';
import {
  Email, Phone, LocationOn, CalendarToday, Badge,
  Business, Work, AccountBalance, PrivacyTip, Edit
} from '@mui/icons-material';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ phone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/employee/profile');
      setProfile(data.data);
      setForm({
        phone: data.data.phone || '',
        address: data.data.address || '',
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      await api.put('/employee/profile', form);
      toast.success('Profile updated');
      setOpen(false);
      fetchProfile();
    } catch {
      toast.error('Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LinearProgress sx={{ background: 'rgba(102,126,234,0.1)', '& .MuiLinearProgress-bar': { background: '#667eea' } }} />;

  const sections = [
    {
      title: 'Contact Information',
      icon: <Phone sx={{ color: '#667eea' }} />,
      items: [
        { label: 'Email', value: user?.email, icon: <Email /> },
        { label: 'Phone', value: profile?.phone || 'Not provided', icon: <Phone /> },
        { label: 'Current Address', value: profile?.address || 'Not provided', icon: <LocationOn /> },
      ]
    },
    {
      title: 'Employment Details',
      icon: <Business sx={{ color: '#4ade80' }} />,
      items: [
        { label: 'Employee ID', value: profile?.employeeCode, icon: <Badge /> },
        { label: 'Department', value: profile?.department, icon: <Business /> },
        { label: 'Designation', value: profile?.designation, icon: <Work /> },
        { label: 'Joining Date', value: profile?.joiningDate, icon: <CalendarToday /> },
        { label: 'Type', value: profile?.employmentType, icon: <Work /> },
      ]
    },
    {
      title: 'Financial & Banking',
      icon: <AccountBalance sx={{ color: '#fbbf24' }} />,
      items: [
        { label: 'Bank Name', value: profile?.bankName, icon: <AccountBalance /> },
        { label: 'A/C Number', value: profile?.bankAccountNumber, icon: <PrivacyTip /> },
        { label: 'IFSC Code', value: profile?.bankIfsc, icon: <AccountBalance /> },
        { label: 'Tax Regime', value: `${profile?.taxRegime} REGIME`, icon: <PrivacyTip /> },
      ]
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{
            width: 100, height: 100, fontSize: 32, fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: '4px solid rgba(255,255,255,0.08)'
          }}>
            {user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={900} color="white">{user?.name}</Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip label={user?.role} size="small" sx={{ background: 'rgba(102,126,234,0.2)', color: '#a78bfa', fontWeight: 600 }} />
              <Chip label={profile?.employeeCode} size="small" variant="outlined" sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }} />
            </Stack>
          </Box>
        </Box>
        <Tooltip title="Edit Profile">
          <IconButton onClick={() => setOpen(true)} sx={{ background: 'rgba(255,255,255,0.05)', color: 'white', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
            <Edit />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {sections.map((section, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Card sx={{
              background: '#161b27', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 4, height: '100%',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-5px)', borderColor: 'rgba(102,126,234,0.3)' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  {section.icon}
                  <Typography fontSize={15} fontWeight={700} color="white">{section.title}</Typography>
                </Box>
                <List disablePadding>
                  {section.items.map((item, i) => (
                    <ListItem key={i} disablePadding sx={{ mb: 2.5 }}>
                      <ListItemIcon sx={{ minWidth: 36, color: 'rgba(255,255,255,0.25)' }}>
                        {React.cloneElement(item.icon, { fontSize: 'small' })}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.value || 'N/A'}
                        primaryTypographyProps={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}
                        secondaryTypographyProps={{ fontSize: 14, color: 'white', fontWeight: 500, mt: 0.2 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>Edit Personal Info</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            sx={{ mb: 3, mt: 1 }}
            InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
            inputProps={{ style: { color: 'white' } }}
          />
          <TextField
            fullWidth
            label="Home Address"
            multiline rows={3}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
            inputProps={{ style: { color: 'white' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'none' }}>Cancel</Button>
          <Button
            onClick={handleUpdate}
            disabled={submitting}
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            {submitting ? 'Updating...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
