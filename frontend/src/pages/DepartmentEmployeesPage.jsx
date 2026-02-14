import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  AppBar,
  Toolbar,
  Button,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const DepartmentEmployeesPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartmentEmployees();
  }, []);

  const fetchDepartmentEmployees = async () => {
    try {
      setError('');
      // Backend determines current department based on authenticated department head
      const response = await api.get('/api/departments/my/employees');
      const payload = response.data;

      if (payload?.data?.employees) {
        setEmployees(payload.data.employees);
      } else {
        setEmployees([]);
      }

      if (payload?.message && !payload.data?.employees?.length) {
        setError(payload.message);
      }
    } catch (error) {
      console.error('Error fetching department employees:', error);
      setError('Failed to load department employees');
      setEmployees([]);
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

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            HR Management System - Department Employees
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
        <Typography variant="h4" component="h1" gutterBottom>
          Department Employees
        </Typography>

        {error && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Position</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No employees assigned to this department yet
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.email}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.phone || 'Not provided'}</TableCell>
                    <TableCell>
                      <Chip label={emp.role} size="small" />
                    </TableCell>
                    <TableCell>
                      {emp.position || 'Not set'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
};

export default DepartmentEmployeesPage;
