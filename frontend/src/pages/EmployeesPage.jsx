import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

const EmployeesPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    fullName: '',
    email: '',
    phone: '',
    departmentId: '',
    jobTitle: '',
    roleType: 'EMPLOYEE',
    employmentStatus: 'ACTIVE',
    workloadScore: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/hr/employees');
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/api/hr/departments');
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      await api.post('/api/hr/employees', formData);
      setOpenDialog(false);
      setFormData({
        userId: '',
        fullName: '',
        email: '',
        phone: '',
        departmentId: '',
        jobTitle: '',
        roleType: 'EMPLOYEE',
        employmentStatus: 'ACTIVE',
        workloadScore: 0
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error creating employee:', error);
      alert(error.response?.data?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            HR Management System - Employees
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Employees Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create Employee
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Job Title</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Workload</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.fullName}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department_name || 'Unassigned'}</TableCell>
                  <TableCell>{emp.jobTitle}</TableCell>
                  <TableCell>{emp.roleType}</TableCell>
                  <TableCell>
                    <Chip
                      label={emp.employmentStatus}
                      color={emp.employmentStatus === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{emp.workloadScore}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/employees/${emp.id}`)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Employee</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="User ID (for linking)"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              margin="normal"
              helperText="Link to external user account (optional)"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                label="Department"
              >
                <MenuItem value="">None</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Job Title"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role Type</InputLabel>
              <Select
                value={formData.roleType}
                onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                label="Role Type"
              >
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="HEAD">Head</MenuItem>
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Employment Status</InputLabel>
              <Select
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                label="Employment Status"
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} variant="contained" disabled={loading}>
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default EmployeesPage;
