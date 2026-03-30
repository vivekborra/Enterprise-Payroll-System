import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress, Chip, Tooltip
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
      background: '#09090b',
      backgroundImage: 'linear-gradient(rgba(9, 9, 11, 0.7), rgba(9, 9, 11, 0.7)), url("/bg-login.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
    }}>
      {/* Background Animated Blobs */}
      <Box sx={{
        position: 'absolute',
        top: '15%',
        left: '10%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'blob 25s infinite alternate',
        zIndex: 0,
        '@keyframes blob': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '100%': { transform: 'translate(100px, 100px) scale(1.2)' },
        }
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '45vw',
        height: '45vw',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        filter: 'blur(100px)',
        animation: 'blob2 30s infinite alternate-reverse',
        zIndex: 0,
        '@keyframes blob2': {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '100%': { transform: 'translate(-150px, -50px) rotate(180deg)' },
        }
      }} />

      {/* Geometric Mesh Overlay */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        opacity: 0.03,
        backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)',
        backgroundSize: '30px 30px',
        zIndex: 0,
      }} />

      <Card sx={{
        width: '100%',
        maxWidth: 440,
        background: 'rgba(24,24,27,0.7)',
        backdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 6,
        boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
        zIndex: 1,
        position: 'relative',
      }}>
        <CardContent sx={{ p: 5 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box sx={{
              display: 'inline-flex',
              p: 2,
              borderRadius: 3.5,
              background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
              boxShadow: '0 10px 25px -10px #7c3aed',
              mb: 3,
            }}>
              <AccountBalance sx={{ fontSize: 36, color: '#fff' }} />
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
              Contact HR or Admin to create your account.
            </Typography>
          </Box>

          {/* Demo Credentials */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="rgba(255,255,255,0.4)" display="block" mb={1.5}>
              Quick Demo Access (Click to fill)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Tooltip title="admin@payroll.com / Admin@123" arrow>
                <Chip
                  label="Admin Demo"
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
              </Tooltip>
              <Tooltip title="hr@payroll.com / Hr@12345" arrow>
                <Chip
                  label="HR Demo"
                  onClick={() => fillDemo('hr')}
                  size="small"
                  sx={{
                    pointer: 'cursor',
                    background: 'rgba(132,204,22,0.15)',
                    color: '#86efac',
                    border: '1px solid rgba(132,204,22,0.25)',
                    '&:hover': { background: 'rgba(132,204,22,0.25)' },
                  }}
                />
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
