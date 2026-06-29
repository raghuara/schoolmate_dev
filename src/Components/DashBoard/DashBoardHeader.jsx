import React, { useEffect, useState } from 'react';
import { Box, IconButton, useMediaQuery, useTheme, Typography, Dialog, DialogContent, DialogActions, Button, Tooltip, tooltipClasses, Autocomplete, TextField } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMainMenu } from '../../Redux/Slices/MainMenuSlice';
import productLogo from '../../Images/Login/SchoolMate Logo.png';
import { closeSubmenu } from '../../Redux/Slices/SubMenuController';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../Redux/Slices/AuthSlice';
import { styled } from '@mui/system';
import {
  fetchAcademicYearConfig,
  setSelectedAcademicYear,
  selectAcademicYear,
  selectAcademicYearOptions,
  selectAcademicYearMeta,
} from '../../Redux/Slices/academicYearSlice';

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'black',
    color: 'white',
    fontSize: '0.875rem',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'black',
  },
});

const HintTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#4A6CF7',
    color: '#fff',
    fontSize: '0.8rem',
    maxWidth: 230,
    padding: '10px 14px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(74,108,247,0.45)',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#4A6CF7',
  },
});

function DashbrdHeader() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMainMenuOpen = useSelector((state) => state.menu.isMainMenuOpen);
  const websiteSettings = useSelector(selectWebsiteSettings);
  const selectedAcademicYear = useSelector(selectAcademicYear);
  const academicYearOptions = useSelector(selectAcademicYearOptions);
  const academicYearMeta = useSelector(selectAcademicYearMeta);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [chatHint, setChatHint] = useState(false);
  const [chatHover, setChatHover] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setChatHint(true), 600);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!chatHint) return;
    const hide = () => setChatHint(false);
    const timer = setTimeout(() => {
      window.addEventListener('click', hide, { once: true });
    }, 100);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', hide);
    };
  }, [chatHint]);

  const academicYearWindowLabel = (() => {
    if (!selectedAcademicYear || !academicYearMeta?.startMonthName || !academicYearMeta?.endMonthName) {
      return '';
    }
    const parts = String(selectedAcademicYear).split('-').map((s) => Number(s.trim()));
    if (parts.length === 1 && Number.isFinite(parts[0])) {
      return `${academicYearMeta.startMonthName} ${parts[0]} → ${academicYearMeta.endMonthName} ${parts[0]}`;
    }
    if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
      return `${academicYearMeta.startMonthName} ${parts[0]} → ${academicYearMeta.endMonthName} ${parts[1]}`;
    }
    return '';
  })();

  useEffect(() => {
    dispatch(fetchAcademicYearConfig());
  }, [dispatch]);

  const handleToggleSidebar = () => {
    dispatch(toggleMainMenu());
    dispatch(closeSubmenu());
  };

  const handleLogoutClick = () => {
    setOpenDrawer(true);
  };

  const handleCancel = () => {
    setOpenDrawer(false);
  };

  const handleConfirmLogout = () => {
    setOpenDrawer(false);
    navigate("/");
    dispatch(logout());
  };

  return (
    <Box
      component="header"
      sx={{
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1201,
        borderBottom: "1px solid #ddd",
        pl: 1,
        pr: 2
      }}
    >
      <Box sx={{ display: "flex", alignItems: 'center' }}>
        <Box sx={{ height: "60px", display: "flex", alignItems: "center", pl: 2 }}>
          <img src={productLogo} width={"150px"} alt="logo" />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        {academicYearOptions && academicYearOptions.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Autocomplete
              size="small"
              disableClearable
              options={academicYearOptions}
              sx={{ width: '170px' }}
              value={selectedAcademicYear && academicYearOptions.includes(selectedAcademicYear) ? selectedAcademicYear : null}
              onChange={(_, newValue) => newValue && dispatch(setSelectedAcademicYear(newValue))}
              renderInput={(params) => (
                <TextField
                  placeholder="Select Academic Year"
                  {...params}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '5px',
                      fontSize: 14,
                      height: 35,
                    },
                    '& .MuiOutlinedInput-input': {
                      textAlign: 'center',
                      fontWeight: '600',
                    },
                  }}
                />
              )}
            />
            {academicYearWindowLabel && (
              <CustomTooltip
                title={
                  <Box sx={{ px: 0.5, py: 0.3 }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#FCBE3A', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>
                      Academic Year Window
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                      {academicYearWindowLabel}
                    </Typography>
                  </Box>
                }
                arrow
                placement="bottom"
              >
                <IconButton size="small" sx={{ p: 0.3 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: '#555' }} />
                </IconButton>
              </CustomTooltip>
            )}
          </Box>
        )}

        {isMobile && (
          <IconButton onClick={handleToggleSidebar}>
            {isMainMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        )}

        <HintTooltip
          open={chatHint}
          arrow
          placement="bottom-end"
          title={
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.3 }}>
                💬 New! Staff Chat
              </Typography>
              <Typography sx={{ fontSize: 11.5, lineHeight: 1.35, color: 'rgba(255,255,255,0.9)' }}>
                Message your staff and teams right here. Tap to open.
              </Typography>
            </Box>
          }
        >
          <CustomTooltip
            title={"Chats"}
            arrow
            placement="bottom"
            open={chatHover && !chatHint}
            disableHoverListener
          >
            <IconButton
              onClick={() => {
                setChatHint(false);
                navigate("/dashboardmenu/chats");
              }}
              onMouseEnter={() => setChatHover(true)}
              onMouseLeave={() => setChatHover(false)}
              sx={{
                backgroundColor: "#4A6CF7",
                width: 40,
                height: 40,
                animation: 'chatPulse 1.6s ease-in-out infinite',
                "&:hover": { backgroundColor: "#3a59d6" },
                '@keyframes chatPulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(74,108,247,0.5)' },
                  '70%': { boxShadow: '0 0 0 9px rgba(74,108,247,0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(74,108,247,0)' },
                },
              }}
            >
              <ForumRoundedIcon sx={{ fontSize: "20px", color: "#fff" }} />
            </IconButton>
          </CustomTooltip>
        </HintTooltip>

        <CustomTooltip title={"Logout"} arrow placement="right-start">
          <IconButton
            onClick={handleLogoutClick}
            sx={{
              backgroundColor: "#000",
              "&:hover": {
                backgroundColor: "#333"
              }
            }}
          >
            <LogoutIcon style={{ color: "#fff", fontSize: "16px" }} />
          </IconButton>
        </CustomTooltip>
      </Box>

      <Dialog
        open={openDrawer}
        onClose={handleCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        sx={{ backgroundColor: "rgba(255, 253, 247, 0.5)", "& .MuiDialog-paper": { borderRadius: "10px" } }}

      >
        <Box sx={{ backgroundColor: "#000", color: "#fff", display: "flex", p: 2, }}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <LogoutIcon style={{ fontSize: "6rem" }} />
          </Box>
          <Box>

            <DialogContent >
              <Typography id="logout-dialog-title">Are You Sure,</Typography>
              <Typography sx={{ color: "#fff", fontSize: "2rem", fontWeight: "700", padding: "0", margin: "0" }} id="logout-dialog-description">
                Want to Logout
              </Typography>
            </DialogContent>
            <DialogActions sx={{ display: "flex", justifyContent: "center", marginTop: "-20px" }}>

              <Button sx={{ backgroundColor: "#000", color: "#fff", border: "1px solid #fff", fontWeight: "700", fontSize: "16px", paddingTop: "0px", paddingBottom: "0px", textTransform: "none", borderRadius: "20px" }} onClick={handleCancel} variant='outlined' color="primary">
                Cancel
              </Button>
              <Button variant='contained' onClick={handleConfirmLogout} sx={{ backgroundColor: "#FCBE3A", color: "#000", fontWeight: "700", fontSize: "16px", paddingTop: "0px", paddingBottom: "0px", textTransform: "none", borderRadius: "20px" }} autoFocus>
                Logout
              </Button>

            </DialogActions>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}

export default DashbrdHeader;