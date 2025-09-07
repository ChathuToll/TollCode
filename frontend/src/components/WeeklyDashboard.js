import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@mui/material';
import { Refresh, BarChart } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const WeeklyDashboard = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('2025-09-07');

  useEffect(() => {
    fetchDepartments();
    fetchDashboardData();
  }, [selectedWeek]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weekly-dashboard?weekStart=${selectedWeek}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getDepartmentData = (department) => {
    return dashboardData.filter(emp => emp.department === department);
  };

  const getTotalHoursForDepartment = (department) => {
    return getDepartmentData(department).reduce((total, emp) => total + (emp.totalHours || 0), 0);
  };

  const getRoleSummary = () => {
    const roleSummary = {};
    dashboardData.forEach(emp => {
      if (emp.roles && typeof emp.roles === 'object') {
        Object.keys(emp.roles).forEach(role => {
          if (!roleSummary[role]) {
            roleSummary[role] = 0;
          }
          roleSummary[role] += (emp.roles[role] || 0);
        });
      }
    });
    return roleSummary;
  };

  const roleSummary = getRoleSummary();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Weekly Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchDashboardData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Department Overview
            </Typography>
            <Grid container spacing={2}>
              {departments.map((department) => {
                const deptData = getDepartmentData(department.name);
                const totalHours = getTotalHoursForDepartment(department.name);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={department.name}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {department.name}
                        </Typography>
                        <Typography variant="h4" color="primary" gutterBottom>
                          {(totalHours || 0).toFixed(1)}h
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {deptData.length} employees
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Required: {department.requiredStaff} staff
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={`${deptData.length}/${department.requiredStaff}`}
                            color={deptData.length >= department.requiredStaff ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Role Summary
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(roleSummary).map(([role, hours]) => (
                <Grid item xs={12} sm={6} md={3} key={role}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {role}
                      </Typography>
                      <Typography variant="h5" color="secondary">
                        {(hours || 0).toFixed(1)}h
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Employee Hours Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Total Hours</TableCell>
                    <TableCell>Roles & Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.map((emp, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {emp.employeeName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={emp.department} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" color="primary">
                          {(emp.totalHours || 0).toFixed(1)}h
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {emp.roles && typeof emp.roles === 'object' ? Object.entries(emp.roles).map(([role, hours]) => (
                            <Chip
                              key={role}
                              label={`${role}: ${(hours || 0).toFixed(1)}h`}
                              size="small"
                              variant="outlined"
                            />
                          )) : (
                            <Typography variant="caption" color="text.secondary">
                              No roles assigned
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Summary Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Employees
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {dashboardData.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Hours
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {dashboardData.reduce((total, emp) => total + (emp.totalHours || 0), 0).toFixed(1)}h
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Average Hours/Employee
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {dashboardData.length > 0 ? (dashboardData.reduce((total, emp) => total + (emp.totalHours || 0), 0) / dashboardData.length).toFixed(1) : 0}h
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Active Roles
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {Object.keys(roleSummary).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {dashboardData.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No data available for the selected week. Make sure shifts have been allocated.
        </Alert>
      )}
    </Box>
  );
};

export default WeeklyDashboard;
