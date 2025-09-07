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
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import { Refresh, TrendingUp, TrendingDown } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const DailyCounts = () => {
  const [counts, setCounts] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2025-09-09');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchCounts();
  }, [selectedDate, selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchCounts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedDepartment) params.append('department', selectedDepartment);
      
      const response = await axios.get(`${API_BASE_URL}/daily-counts?${params}`);
      setCounts(response.data);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const getStatusColor = (allocated, target) => {
    if (allocated >= target) return 'success';
    if (allocated >= target * 0.9) return 'warning';
    return 'error';
  };

  const getStatusIcon = (allocated, target) => {
    if (allocated >= target) return <TrendingUp />;
    return <TrendingDown />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Daily Head Count</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            type="date"
            label="Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
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
            onClick={fetchCounts}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {counts && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Head Count Summary
                  </Typography>
                  {getStatusIcon(counts.allocatedCount, counts.targetCount)}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h3" color="primary">
                    {counts.allocatedCount}
                  </Typography>
                  <Typography variant="h3" color="text.secondary">
                    / {counts.targetCount}
                  </Typography>
                </Box>
                
                <Typography variant="body1" gutterBottom>
                  Target: {counts.targetCount} heads
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`${counts.percentage}% of target`}
                    color={getStatusColor(counts.allocatedCount, counts.targetCount)}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${counts.difference > 0 ? '+' : ''}${counts.difference} difference`}
                    color={counts.difference >= 0 ? 'success' : 'error'}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status Analysis
                </Typography>
                
                {counts.allocatedCount >= counts.targetCount ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Target achieved! Allocated staff meets or exceeds the target of {counts.targetCount}.
                  </Alert>
                ) : counts.allocatedCount >= counts.targetCount * 0.9 ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Near target. Only {counts.targetCount - counts.allocatedCount} more staff needed to reach target.
                  </Alert>
                ) : (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Below target. Need {counts.targetCount - counts.allocatedCount} more staff to reach target.
                  </Alert>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  {selectedDepartment ? `Department: ${selectedDepartment}` : 'All Departments'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(selectedDate).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Department Breakdown
              </Typography>
              <Grid container spacing={2}>
                {departments.map((department) => (
                  <Grid item xs={12} sm={6} md={4} key={department.name}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {department.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Required Staff: {department.requiredStaff}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Roles: {department.roles.join(', ')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {!counts && (
        <Alert severity="info">
          Select a date to view daily head count information.
        </Alert>
      )}
    </Box>
  );
};

export default DailyCounts;
