import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'EMPLOYEE_NOT_FOUND') {
      setError('Your profile is being set up. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // In a real app, this would call your auth API
    // For now, we'll simulate with a mock token
    // The actual auth should be handled by your auth system
    try {
      // Mock login - replace with actual auth API call
      const mockToken = 'mock-jwt-token'; // This should come from your auth API
      login(mockToken);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            HR Management System
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Government HR Portal
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </form>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Note: Authentication is handled by the external auth system.
            This is a placeholder login form.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
