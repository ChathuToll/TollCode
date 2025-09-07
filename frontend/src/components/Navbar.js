import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip, Fade } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Dashboard, 
  People, 
  Assessment, 
  TrendingUp, 
  BarChart 
} from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Shift Board', path: '/', icon: Dashboard },
    { label: 'Employees', path: '/employees', icon: People },
    { label: 'Summary', path: '/weekly-summary', icon: Assessment },
    { label: 'Daily Counts', path: '/daily-counts', icon: TrendingUp },
    { label: 'Dashboard', path: '/weekly-dashboard', icon: BarChart },
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 122, 104, 0.1)',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
        <Fade in timeout={600}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #007a68, #4EB1A2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>
                TR
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #007a68, #4EB1A2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '18px', md: '20px' }
              }}
            >
              Toll Roster
            </Typography>
          </Box>
        </Fade>
        
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, md: 1 },
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Fade in timeout={800 + index * 100} key={item.path}>
                <Button
                  onClick={() => navigate(item.path)}
                  sx={{
                    minWidth: { xs: 'auto', md: 120 },
                    px: { xs: 1, md: 2 },
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: { xs: '12px', md: '14px' },
                    color: isActive ? '#007a68' : '#666',
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(0,122,104,0.1), rgba(78,177,162,0.1))' 
                      : 'transparent',
                    border: isActive 
                      ? '1px solid rgba(0,122,104,0.2)' 
                      : '1px solid transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(0,122,104,0.08), rgba(78,177,162,0.08))',
                      border: '1px solid rgba(0,122,104,0.15)',
                      transform: 'translateY(-1px)',
                      color: '#007a68'
                    },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <Icon sx={{ fontSize: { xs: 16, md: 18 } }} />
                  <Typography sx={{ 
                    display: { xs: 'none', sm: 'block' },
                    fontSize: 'inherit',
                    fontWeight: 'inherit'
                  }}>
                    {item.label}
                  </Typography>
                  {isActive && (
                    <Chip 
                      size="small" 
                      label="Active" 
                      sx={{ 
                        ml: 1,
                        height: 16,
                        fontSize: '10px',
                        background: '#007a68',
                        color: 'white',
                        display: { xs: 'none', md: 'flex' }
                      }} 
                    />
                  )}
                </Button>
              </Fade>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
