import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Chip,
  Button,
  AppBar,
  Toolbar,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const EmployeeProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/api/hr/employees/${id}`);
      setEmployee(response.data.data);
    } catch (error) {
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return (
      <>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              HR Management System
            </Typography>
            <Button color="inherit" onClick={() => navigate('/')}>
              Dashboard
            </Button>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h5">Employee not found</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            HR Management System - Employee Profile
          </Typography>
          <Button color="inherit" onClick={() => navigate('/employees')}>
            Back to Employees
          </Button>
          <Button color="inherit" onClick={() => navigate('/')}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Employee Profile
        </Typography>

        <Paper sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Full Name
              </Typography>
              <Typography variant="h6" gutterBottom>
                {employee.fullName}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="h6" gutterBottom>
                {employee.email}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="h6" gutterBottom>
                {employee.phone || 'Not provided'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Job Title
              </Typography>
              <Typography variant="h6" gutterBottom>
                {employee.jobTitle}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Department
              </Typography>
              <Typography variant="h6" gutterBottom>
                {employee.department_name || 'Unassigned'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Role Type
              </Typography>
              <Typography variant="h6" gutterBottom>
                {employee.roleType}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Employment Status
              </Typography>
              <Box>
                <Chip
                  label={employee.employmentStatus}
                  color={employee.employmentStatus === 'ACTIVE' ? 'success' : 'default'}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Workload Score
              </Typography>
              <Typography variant="h6" gutterBottom>
                {employee.workloadScore}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                User ID (Linked)
              </Typography>
              <Typography variant="h6" gutterBottom>
                {employee.userId || 'Not linked'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(employee.createdAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default EmployeeProfilePage;
