import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Zoom,
  Tooltip,
  Avatar,
  Divider,
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Person, 
  Work, 
  LocationOn, 
  SupervisorAccount,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    Employee: '',
    Status: 'Active',
    WorkingSite: '',
    Type: 'Permanent',
    Department: '',
    Supervisor: '',
    Monday: '',
    Tuesday: '',
    Wednesday: '',
    Thursday: '',
    Friday: '',
    Competencies: []
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await axios.put(`${API_BASE_URL}/employees/${editingEmployee._id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/employees`, formData);
      }
      fetchEmployees();
      handleClose();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData(employee);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingEmployee(null);
    setFormData({
      Employee: '',
      Status: 'Active',
      WorkingSite: '',
      Type: 'Permanent',
      Department: '',
      Supervisor: '',
      Monday: '',
      Tuesday: '',
      Wednesday: '',
      Thursday: '',
      Friday: '',
      Competencies: []
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompetencyChange = (competency) => {
    const competencies = formData.Competencies.includes(competency)
      ? formData.Competencies.filter(c => c !== competency)
      : [...formData.Competencies, competency];
    setFormData(prev => ({ ...prev, Competencies: competencies }));
  };

  const allCompetencies = ['Receiving', 'Packing', 'Inventory Management', 'Stock Auditing', 'Forklift Operation', 'Labeling', 'Shipping'];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', md: 'center' }, 
            gap: 2,
            mb: 3 
          }}>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #007a68, #4EB1A2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}>
                Employee Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage employee information, schedules, and competencies
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #007a68, #4EB1A2)',
                boxShadow: '0 4px 12px rgba(0, 122, 104, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #005a4a, #3a9b8a)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0, 122, 104, 0.4)',
                }
              }}
            >
              Add Employee
            </Button>
          </Box>
        </Box>
      </Fade>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {employees.map((employee, index) => (
          <Grid item xs={12} sm={6} md={4} key={employee._id}>
            <Zoom in timeout={800 + index * 100}>
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,122,104,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 122, 104, 0.15)',
                  border: '1px solid rgba(0,122,104,0.2)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        bgcolor: 'primary.main', 
                        mr: 2,
                        width: 40,
                        height: 40,
                        fontSize: '16px',
                        fontWeight: 600
                      }}>
                        {employee.Employee.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {employee.Employee}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {employee.Type} • {employee.Department}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit Employee">
                        <IconButton 
                          onClick={() => handleEdit(employee)} 
                          size="small"
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              background: 'rgba(0,122,104,0.1)',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Employee">
                        <IconButton 
                          onClick={() => handleDelete(employee._id)} 
                          size="small"
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              background: 'rgba(255,59,48,0.1)',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={employee.Status === 'Active' ? <CheckCircle /> : <Cancel />}
                      label={employee.Status}
                      color={employee.Status === 'Active' ? 'success' : 'default'}
                      size="small"
                      sx={{ 
                        fontWeight: 500,
                        '& .MuiChip-icon': {
                          fontSize: '16px'
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {employee.WorkingSite}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SupervisorAccount sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {employee.Supervisor}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Competencies
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {employee.Competencies.map((comp) => (
                      <Chip 
                        key={comp} 
                        label={comp} 
                        size="small" 
                        variant="outlined"
                        sx={{
                          fontSize: '0.7rem',
                          height: 24,
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          '&:hover': {
                            background: 'rgba(0,122,104,0.1)'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={formData.Employee}
                  onChange={(e) => handleInputChange('Employee', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.Status}
                    onChange={(e) => handleInputChange('Status', e.target.value)}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Deactive">Deactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Working Site"
                  value={formData.WorkingSite}
                  onChange={(e) => handleInputChange('WorkingSite', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.Type}
                    onChange={(e) => handleInputChange('Type', e.target.value)}
                  >
                    <MenuItem value="Permanent">Permanent</MenuItem>
                    <MenuItem value="Part time">Part time</MenuItem>
                    <MenuItem value="Casual">Casual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={formData.Department}
                    onChange={(e) => handleInputChange('Department', e.target.value)}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.name} value={dept.name}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Supervisor"
                  value={formData.Supervisor}
                  onChange={(e) => handleInputChange('Supervisor', e.target.value)}
                />
              </Grid>
              
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <Grid item xs={12} sm={6} key={day}>
                  <TextField
                    fullWidth
                    label={day}
                    value={formData[day]}
                    onChange={(e) => handleInputChange(day, e.target.value)}
                    placeholder="e.g., 8.00 am - 4.00 pm"
                  />
                </Grid>
              ))}
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Competencies
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {allCompetencies.map((comp) => (
                    <Chip
                      key={comp}
                      label={comp}
                      onClick={() => handleCompetencyChange(comp)}
                      color={formData.Competencies.includes(comp) ? 'primary' : 'default'}
                      variant={formData.Competencies.includes(comp) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingEmployee ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EmployeeManagement;
