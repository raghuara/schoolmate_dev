import { Box } from '@mui/material';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideBarPage from './SideBar';
import { useTheme } from '@emotion/react';
import DashbrdHeader from './DashBoardHeader';
import { useDispatch, useSelector } from 'react-redux';

export default function DashBoardLayout() {
  // const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const dispatch = useDispatch();
  const isMainMenuOpen = useSelector((state) => state.menu.isMainMenuOpen);

  return (
    <Box component='div' sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden', backgroundColor: "#fff" }}>
      
      <SideBarPage  isMainMenuOpen={() => dispatch(isMainMenuOpen())}  />
      
      <Box component='main' sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Box 
          sx={{
            position: 'fixed',
            top: 0,
            marginLeft:"0",
            left: isMainMenuOpen ? '100%' : '0px', 
            width: `calc(100% - ${isMainMenuOpen ? '260px' : '0px'})`,
            zIndex: 10,
            transition: 'left 0.3s ease-in-out, width 0.3s ease-in-out',
          }}
        >
          <DashbrdHeader  isMainMenuOpen={() => dispatch(isMainMenuOpen())} />
        </Box>
        <Box 
          sx={{
            marginTop: '60px',
            minHeight: 'calc(100vh - 60px)',
            backgroundColor:"#F6F6F8"
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
