import { Box } from '@mui/material';
import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBarPage from './SideBar';
import DashbrdHeader from './DashBoardHeader';

const HEADER_HEIGHT = 60;

export default function DashBoardLayout() {
  return (
    /*
       The shell is exactly one viewport tall and never scrolls, so the window
       scrollbar can not appear next to the fixed header or the sidebar. The
       padding at the top is the space the fixed header sits in.
    */
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        pt: `${HEADER_HEIGHT}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundColor: '#F6F6F8',
      }}
    >
      <DashbrdHeader />

      <SideBarPage />

      {/* The only scroller in the app shell - pages scroll inside this box. */}
      <Box
        component='main'
        id='app-scroll-container'
        sx={{
          flexGrow: 1,
          minWidth: 0,
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: '#F6F6F8',
          transition: 'width 0.3s ease-in-out',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
