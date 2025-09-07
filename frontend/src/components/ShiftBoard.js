import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { 
  PlayArrow, 
  Refresh, 
  Info,
  ClearAll,
  Warning
} from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ShiftBoard = () => {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('2025-09-07');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchShifts();
  }, [selectedWeek, selectedDepartment]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showSnackbar('Error fetching employees', 'error');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      showSnackbar('Error fetching departments', 'error');
    }
  };

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedWeek) params.append('weekStart', selectedWeek);
      if (selectedDepartment) params.append('department', selectedDepartment);
      
      console.log('Fetching shifts with params:', params.toString());
      const response = await axios.get(`${API_BASE_URL}/shifts?${params}`);
      console.log('Fetched shifts:', response.data);
      setShifts(response.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      showSnackbar('Error fetching shifts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAllocate = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/allocate-shifts`, {
        weekStart: selectedWeek
      });
      await fetchShifts();
      showSnackbar('Shifts allocated successfully!', 'success');
    } catch (error) {
      console.error('Error allocating shifts:', error);
      showSnackbar('Error allocating shifts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAllShifts = async () => {
    try {
      setLoading(true);
      
      console.log('Resetting shifts for week:', selectedWeek);
      
      const weekStartDate = new Date(selectedWeek);
      const shiftsToDelete = shifts.filter(shift => {
        const shiftWeekStart = new Date(shift.weekStart);
        return shiftWeekStart.toDateString() === weekStartDate.toDateString();
      });
      
      console.log('Shifts to delete:', shiftsToDelete);
      
      const deletePromises = shiftsToDelete.map(shift => 
        axios.delete(`${API_BASE_URL}/shifts/${shift._id}`)
      );
      
      await Promise.all(deletePromises);
      
      await fetchShifts();
      showSnackbar(`All shifts cleared successfully! (${shiftsToDelete.length} shifts removed)`, 'success');
    } catch (error) {
      console.error('Error resetting shifts:', error);
      console.error('Error details:', error.response?.data);
      showSnackbar(`Error resetting shifts: ${error.response?.data?.error || error.message}`, 'error');
    } finally {
      setLoading(false);
      setShowResetDialog(false);
    }
  };

  const handleDragStart = (e, employee) => {
    e.dataTransfer.setData('application/json', JSON.stringify(employee));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, day) => {
    e.preventDefault();
    setDragOverColumn(day);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, day) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    try {
      const employeeData = JSON.parse(e.dataTransfer.getData('application/json'));
      console.log('Dropped employee:', employeeData);
      console.log('Target day:', day);
      console.log('Selected week:', selectedWeek);
      
      const shiftTime = employeeData[day];
      if (!shiftTime || shiftTime === 'Off') {
        showSnackbar(`${employeeData.Employee} is not available on ${day}`, 'warning');
        return;
      }

      const [startTime, endTime] = shiftTime.split(' - ');
      
      const shiftData = {
        employeeId: employeeData._id,
        employeeName: employeeData.Employee,
        department: 'General',
        role: employeeData.Competencies[0] || 'General',
        day: day,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        weekStart: new Date(selectedWeek),
        status: 'allocated'
      };
      
      console.log('Creating shift with data:', shiftData);
      
      const response = await axios.post(`${API_BASE_URL}/shifts`, shiftData);
      console.log('Shift created:', response.data);
      
      await fetchShifts();
      showSnackbar(`${employeeData.Employee} assigned to ${day}`, 'success');
    } catch (error) {
      console.error('Error creating shift:', error);
      showSnackbar('Error assigning shift', 'error');
    }
  };

  const handleRemoveShift = async (shiftId) => {
    try {
      await axios.delete(`${API_BASE_URL}/shifts/${shiftId}`);
      await fetchShifts();
      showSnackbar('Shift removed successfully', 'success');
    } catch (error) {
      console.error('Error removing shift:', error);
      showSnackbar('Error removing shift', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getShiftsForDay = (day) => {
    const weekStartDate = new Date(selectedWeek);
    return shifts.filter(shift => {
      const shiftWeekStart = new Date(shift.weekStart);
      const isSameWeek = shiftWeekStart.toDateString() === weekStartDate.toDateString();
      const isSameDay = shift.day === day;
      return isSameDay && isSameWeek;
    });
  };

  const getUnassignedEmployees = () => {
    return employees.filter(emp => {
      if (emp.Status !== 'Active') return false;
      
      const weekStartDate = new Date(selectedWeek);
      const employeeShifts = shifts.filter(shift => {
        const shiftWeekStart = new Date(shift.weekStart);
        return shiftWeekStart.toDateString() === weekStartDate.toDateString() && 
               shift.employeeId === emp._id;
      });
      
      const availableDays = days.filter(day => {
        const availability = emp[day];
        return availability && availability !== 'Off';
      });
      
      return employeeShifts.length < availableDays.length;
    });
  };

  const getEmployeeAvailability = (employee, day) => {
    const availability = employee[day];
    if (!availability || availability === 'Off') return null;
    return availability;
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <Box sx={{ 
      fontFamily: "'Segoe UI', sans-serif",
      background: 'linear-gradient(to right, #BDF7EE, #94BEB8)',
      margin: 0,
      padding: { xs: '10px', sm: '20px' },
      minHeight: '100vh'
    }}>
      <Typography variant="h4" sx={{
        textAlign: 'center',
        color: '#007a68',
        fontWeight: 600,
        mb: 3,
        fontSize: { xs: '24px', sm: '32px' }
      }}>
        Shift Allocation Board
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 2,
        mb: 3,
        flexWrap: 'wrap'
      }}>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 180 } }} size="small">
          <InputLabel>Department</InputLabel>
          <Select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            sx={{
              height: 44,
              borderRadius: 2
            }}
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.name} value={dept.name}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ 
          display: 'flex', 
          gap: 1.5,
          alignItems: 'center'
        }}>
          <Tooltip title="Automatically allocate shifts based on employee availability">
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlayArrow />}
              onClick={handleAutoAllocate}
              disabled={loading}
              sx={{ 
                minWidth: 160,
                height: 44,
                borderRadius: 2,
                backgroundColor: '#007a68',
                '&:hover': {
                  backgroundColor: '#005a4a',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(0, 122, 104, 0.3)',
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }}
            >
              {loading ? 'Allocating...' : 'Auto Allocate'}
            </Button>
          </Tooltip>
          <Tooltip title="Refresh shift data">
            <IconButton
              onClick={fetchShifts}
              disabled={loading}
              sx={{ 
                border: '1.5px solid #007a68',
                borderRadius: 2,
                width: 44,
                height: 44,
                color: '#007a68',
                '&:hover': {
                  backgroundColor: 'rgba(0, 122, 104, 0.08)',
                }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear all shifts for this week">
            <Button
              variant="outlined"
              startIcon={<ClearAll />}
              onClick={() => setShowResetDialog(true)}
              disabled={loading || shifts.length === 0}
              sx={{ 
                minWidth: 140,
                height: 44,
                borderRadius: 2,
                borderColor: '#dc3545',
                color: '#dc3545',
                '&:hover': {
                  backgroundColor: 'rgba(220, 53, 69, 0.08)',
                  borderColor: '#c82333',
                  color: '#c82333'
                },
                '&:disabled': {
                  borderColor: 'rgba(220, 53, 69, 0.3)',
                  color: 'rgba(220, 53, 69, 0.3)'
                }
              }}
            >
              Reset All
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        padding: '10px',
        '&::-webkit-scrollbar': {
          height: 8,
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0,122,104,0.1)',
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,122,104,0.3)',
          borderRadius: 4,
          '&:hover': {
            background: 'rgba(0,122,104,0.5)',
          },
        },
      }}>
        <Box sx={{
          backgroundColor: '#007a68',
          borderRadius: '10px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          flex: '0 0 200px',
          minWidth: '200px',
          padding: '10px'
        }}>
          <Typography variant="h6" sx={{
            textAlign: 'center',
            color: '#ffffff',
            marginBottom: '10px',
            fontWeight: 600,
            fontSize: '18px'
          }}>
            Unassigned
          </Typography>
          <Box sx={{ minHeight: '100px' }}>
            {getUnassignedEmployees().map((employee) => (
              <Box
                key={employee._id}
                sx={{
                  backgroundColor: '#A8F1E7',
                  borderRadius: '8px',
                  padding: '8px',
                  margin: '5px 0',
                  cursor: 'move',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    backgroundColor: '#4EB1A2'
                  }
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, employee)}
              >
                <Typography variant="body2" sx={{ 
                  fontWeight: 500,
                  color: '#333',
                  fontSize: '14px',
                  lineHeight: 1.2
                }}>
                  {employee.Employee}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: '#666', 
                  display: 'block',
                  fontSize: '12px',
                  mt: 0.5
                }}>
                  {employee.Department} • {employee.Type}
                </Typography>
                {employee.Competencies && employee.Competencies.length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="caption" sx={{ 
                      color: '#007a68',
                      fontSize: '10px',
                      fontWeight: 500
                    }}>
                      {employee.Competencies[0]}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {days.map((day) => (
          <Box
            key={day}
            sx={{
              backgroundColor: '#007a68',
              borderRadius: '10px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              flex: '0 0 200px',
              minWidth: '200px',
              padding: '10px',
              border: dragOverColumn === day ? '2px dashed rgba(255,255,255,0.8)' : 'none',
              transition: 'border 0.2s ease'
            }}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, day)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, day)}
          >
            <Typography variant="h6" sx={{
              textAlign: 'center',
              color: '#ffffff',
              marginBottom: '10px',
              fontWeight: 600,
              fontSize: '18px'
            }}>
              {day}
            </Typography>
            <Box sx={{ minHeight: '100px' }}>
              {getShiftsForDay(day).map((shift) => (
                <Box
                  key={shift._id}
                  sx={{
                    backgroundColor: '#A8F1E7',
                    borderRadius: '8px',
                    padding: '8px',
                    margin: '5px 0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      backgroundColor: '#4EB1A2'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500,
                        color: '#333',
                        fontSize: '14px',
                        lineHeight: 1.2
                      }}>
                        {shift.employeeName}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#666', 
                        display: 'block',
                        fontSize: '12px',
                        mt: 0.5
                      }}>
                        {shift.startTime} - {shift.endTime}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#666', 
                        display: 'block',
                        fontSize: '12px'
                      }}>
                        {shift.role}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveShift(shift._id)}
                      sx={{ 
                        color: '#c53030',
                        fontSize: '16px',
                        p: 0.5,
                        '&:hover': {
                          backgroundColor: 'rgba(197, 48, 48, 0.1)'
                        }
                      }}
                    >
                      ×
                    </IconButton>
                  </Box>
                </Box>
              ))}
              {getShiftsForDay(day).length === 0 && (
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  fontSize: '12px',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  display: 'block',
                  mt: 2
                }}>
                  Drop employees here
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>


      {shifts.length === 0 && (
        <Alert 
          severity="info" 
          sx={{ 
            mt: 3,
            borderRadius: 2,
            backgroundColor: 'rgba(0,122,104,0.1)',
            border: '1px solid rgba(0,122,104,0.2)',
            '& .MuiAlert-message': {
              color: '#007a68',
              fontWeight: 500
            }
          }}
          icon={<Info />}
        >
          No shifts allocated for this week. Click "Auto Allocate" to automatically assign shifts based on employee availability.
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
      >
        <DialogTitle id="reset-dialog-title" sx={{ color: '#dc3545' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ color: '#dc3545' }} />
            Confirm Reset All Shifts
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-dialog-description">
            Are you sure you want to clear all shift allocations for the week starting {selectedWeek}?
            <br /><br />
            <strong>This action cannot be undone.</strong> All manually assigned and auto-allocated shifts will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowResetDialog(false)}
            disabled={loading}
            sx={{ color: '#6c757d' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleResetAllShifts}
            disabled={loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ClearAll />}
            sx={{ 
              backgroundColor: '#dc3545',
              '&:hover': {
                backgroundColor: '#c82333'
              },
              '&:disabled': {
                backgroundColor: 'rgba(220, 53, 69, 0.3)'
              }
            }}
          >
            {loading ? 'Clearing...' : 'Clear All Shifts'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftBoard;