import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
// @ts-ignore
import RestaurantIcon from '@mui/icons-material/Restaurant';
// @ts-ignore
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// @ts-ignore
import PeopleIcon from '@mui/icons-material/People';
// @ts-ignore
import InventoryIcon from '@mui/icons-material/Inventory';
// @ts-ignore
import MenuIcon from '@mui/icons-material/Menu';
// @ts-ignore
import Drawer from '@mui/material/Drawer';
// @ts-ignore
import List from '@mui/material/List';
// @ts-ignore
import ListItem from '@mui/material/ListItem';
// @ts-ignore
import ListItemIcon from '@mui/material/ListItemIcon';
// @ts-ignore
import ListItemText from '@mui/material/ListItemText';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <RestaurantIcon />, path: '/' },
    { text: 'Orders', icon: <ShoppingCartIcon />, path: '/orders' },
    { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
    { text: 'Stock', icon: <InventoryIcon />, path: '/stock' },
  ];

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const renderMobileMenu = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
      PaperProps={{
        sx: {
          width: 240,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            component={RouterLink}
            to={item.path}
            key={item.text}
            onClick={toggleDrawer(false)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  const renderDesktopMenu = () => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {menuItems.map((item) => (
        <Button
          key={item.text}
          color="inherit"
          component={RouterLink}
          to={item.path}
          startIcon={item.icon}
          sx={{
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              width: location.pathname === item.path ? '100%' : '0%',
              height: '2px',
              backgroundColor: 'white',
              transform: 'translateX(-50%)',
              transition: 'width 0.3s ease',
            },
            '&:hover::after': {
              width: '100%',
            },
          }}
        >
          {item.text}
        </Button>
      ))}
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <RestaurantIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Restaurant Management
        </Typography>
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            {renderMobileMenu()}
          </>
        ) : (
          renderDesktopMenu()
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 