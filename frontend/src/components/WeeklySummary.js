import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const WeeklySummary = () => {
  const [shifts, setShifts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('2025-09-07');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchShifts();
  }, [selectedWeek, selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchShifts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWeek) params.append('weekStart', selectedWeek);
      if (selectedDepartment) params.append('department', selectedDepartment);
      
      const response = await axios.get(`${API_BASE_URL}/shifts?${params}`);
      setShifts(response.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const getShiftsForDay = (day) => {
    return shifts.filter(shift => shift.day === day);
  };

  const getShiftsForDepartment = (department) => {
    return shifts.filter(shift => shift.department === department);
  };

  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split('.');
    let hour24 = parseInt(hours);
    
    if (period === 'pm' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'am' && hour24 === 12) {
      hour24 = 0;
    }
    
    return hour24 + (parseInt(minutes) / 60);
  };

  const getTotalHoursForDay = (day) => {
    const dayShifts = getShiftsForDay(day);
    return dayShifts.reduce((total, shift) => {
      const startHour = parseTime(shift.startTime);
      const endHour = parseTime(shift.endTime);
      const hours = endHour - startHour;
      return total + hours;
    }, 0);
  };

  const getTotalHoursForDepartment = (department) => {
    const deptShifts = getShiftsForDepartment(department);
    return deptShifts.reduce((total, shift) => {
      const startHour = parseTime(shift.startTime);
      const endHour = parseTime(shift.endTime);
      const hours = endHour - startHour;
      return total + hours;
    }, 0);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Weekly Shift Summary</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.name} value={dept.name}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchShifts}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Daily Summary
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell>Total Shifts</TableCell>
                    <TableCell>Total Hours</TableCell>
                    <TableCell>Department Breakdown</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {days.map((day) => {
                    const dayShifts = getShiftsForDay(day);
                    const totalHours = getTotalHoursForDay(day);
                    
                    return (
                      <TableRow key={day}>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {day}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={dayShifts.length} color="primary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">
                            {totalHours.toFixed(1)} hours
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {departments.map((dept) => {
                              const deptShifts = dayShifts.filter(s => s.department === dept.name);
                              if (deptShifts.length > 0) {
                                return (
                                  <Chip
                                    key={dept.name}
                                    label={`${dept.name}: ${deptShifts.length}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                );
                              }
                              return null;
                            })}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Department Summary
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell>Total Shifts</TableCell>
                    <TableCell>Total Hours</TableCell>
                    <TableCell>Roles</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.map((department) => {
                    const deptShifts = getShiftsForDepartment(department.name);
                    const totalHours = getTotalHoursForDepartment(department.name);
                    const roles = [...new Set(deptShifts.map(s => s.role))];
                    
                    return (
                      <TableRow key={department.name}>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {department.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={deptShifts.length} color="secondary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">
                            {totalHours.toFixed(1)} hours
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {roles.map((role) => (
                              <Chip
                                key={role}
                                label={role}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detailed Shift List
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Day</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shifts.map((shift) => {
                    const startHour = parseTime(shift.startTime);
                    const endHour = parseTime(shift.endTime);
                    const hours = endHour - startHour;
                    
                    return (
                      <TableRow key={shift._id}>
                        <TableCell>{shift.employeeName}</TableCell>
                        <TableCell>
                          <Chip label={shift.department} size="small" />
                        </TableCell>
                        <TableCell>{shift.role}</TableCell>
                        <TableCell>{shift.day}</TableCell>
                        <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                        <TableCell>{hours.toFixed(1)}h</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WeeklySummary;
