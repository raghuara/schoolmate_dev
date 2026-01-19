import React, { useState } from 'react';
import { Box, IconButton, useMediaQuery, useTheme, Typography, Dialog, DialogContent, DialogActions, Button, Tooltip, tooltipClasses } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMainMenu } from '../../Redux/Slices/MainMenuSlice';
import productLogo from '../../Images/Login/SchoolMate Logo.png';
import { closeSubmenu } from '../../Redux/Slices/SubMenuController';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../Redux/Slices/AuthSlice';
import { styled } from '@mui/system';

function DashbrdHeader() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMainMenuOpen = useSelector((state) => state.menu.isMainMenuOpen);
  const websiteSettings = useSelector(selectWebsiteSettings);
  const [openDrawer, setOpenDrawer] = useState(false);

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

  const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))
  ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: 'black',
      color: 'white',
      fontSize: '0.875rem',
    },
    [`& .${tooltipClasses.arrow}`]: {
      color: 'black',
    },
  });


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
      {isMobile && (
        <IconButton onClick={handleToggleSidebar}>
          {isMainMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      )}

      <CustomTooltip title={"Logout"} arrow placement="right-start">
        <IconButton
          onClick={handleLogoutClick}
          sx={{

            // position:"absolute",
            //  bottom: userType === "teacher" ? "-190%" : "none",
            backgroundColor: "#000",
            "&:hover": {
              backgroundColor: "#000"
            }
          }}
        >
          <LogoutIcon style={{ color: "#fff", fontSize: "16px" }} />
        </IconButton>
      </CustomTooltip>

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
