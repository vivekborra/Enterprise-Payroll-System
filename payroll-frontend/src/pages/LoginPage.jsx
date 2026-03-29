import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress, Chip
} from '@mui/material';
import { Visibility, VisibilityOff, AccountBalance, Lock, Email } from '@mui/icons-material';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      const role = result.payload.role;
      navigate(role === 'EMPLOYEE' ? '/employee/dashboard' : '/hr/dashboard');
    }
  };

  const fillDemo = (type) => {
    if (type === 'admin') setForm({ email: 'admin@payroll.com', password: 'Admin@123' });
    else setForm({ email: 'hr@payroll.com', password: 'Hr@12345' });
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
    }}>
      <Card sx={{
        width: '100%',
        maxWidth: 440,
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 4,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <CardContent sx={{ p: 5 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              display: 'inline-flex',
              p: 2,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              mb: 2,
            }}>
              <AccountBalance sx={{ fontSize: 40, color: '#fff' }} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="white" letterSpacing={-0.5}>
              PayrollPro
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.5)" mt={0.5}>
              Enterprise Payroll & Tax System
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'rgba(255,255,255,0.5)' }} />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.6)' } }}
              inputProps={{ style: { color: 'white' } }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'rgba(255,255,255,0.5)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                      {showPass
                        ? <VisibilityOff sx={{ color: 'rgba(255,255,255,0.5)' }} />
                        : <Visibility sx={{ color: 'rgba(255,255,255,0.5)' }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.6)' } }}
              inputProps={{ style: { color: 'white' } }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                fontWeight: 700,
                fontSize: 16,
                textTransform: 'none',
                '&:hover': { background: 'linear-gradient(135deg, #5a6fd6, #6a4097)' },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="rgba(255,255,255,0.4)">
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
                Sign Up
              </Link>
            </Typography>
          </Box>

          {/* Demo Credentials */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="rgba(255,255,255,0.4)" display="block" mb={1.5}>
              Demo Credentials
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip
                label="Admin Login"
                onClick={() => fillDemo('admin')}
                size="small"
                sx={{
                  cursor: 'pointer',
                  background: 'rgba(103,126,234,0.2)',
                  color: '#a78bfa',
                  border: '1px solid rgba(103,126,234,0.3)',
                  '&:hover': { background: 'rgba(103,126,234,0.35)' },
                }}
              />
              <Chip
                label="HR Login"
                onClick={() => fillDemo('hr')}
                size="small"
                sx={{
                  cursor: 'pointer',
                  background: 'rgba(132,204,22,0.15)',
                  color: '#86efac',
                  border: '1px solid rgba(132,204,22,0.25)',
                  '&:hover': { background: 'rgba(132,204,22,0.25)' },
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
