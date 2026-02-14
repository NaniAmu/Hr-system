import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  AppBar,
  Toolbar
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const isDepartmentHead = user?.role === 'DEPARTMENT_HEAD' || user?.role === 'HEAD';

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            HR Management System
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {isSuperAdmin && (
            <>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <BusinessIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                      <Typography variant="h5" component="h2">
                        Departments
                      </Typography>
                    </Box>
                    <Typography color="text.secondary">
                      Manage departments, assign department heads, and activate/deactivate departments.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate('/departments')}>
                      Manage Departments
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <PeopleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                      <Typography variant="h5" component="h2">
                        Employees
                      </Typography>
                    </Box>
                    <Typography color="text.secondary">
                      Create employees, assign departments, link user accounts, and manage employee records.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate('/employees')}>
                      Manage Employees
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </>
          )}

          {isDepartmentHead && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <GroupIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" component="h2">
                      Department Employees
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    View employees under your department, their workload scores, and profiles.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate('/department-employees')}>
                    View Department Employees
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard;
