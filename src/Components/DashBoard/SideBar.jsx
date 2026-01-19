import React, { useEffect, useState } from 'react';
import { Drawer, Button, Typography, Box, List, ListItem, ListItemText, ListItemIcon, useMediaQuery, useTheme, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Tooltip, styled, tooltipClasses } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../App.css';
import '../../Css/Style.css';
import '../../Css/Page.css';
import '../../Css/OverWrite.css';
import SubMenuPage from './SubMenu';
import axios from 'axios';
import { DashboardUsers } from '../../Api/Api';
import SnackBar from '../SnackBar';
import { useDispatch, useSelector } from 'react-redux';
import { closeSubmenu, openSubmenu } from '../../Redux/Slices/SubMenuController';
import { closeMainMenu } from '../../Redux/Slices/MainMenuSlice';
import { selectCommunicationActivePaths, selectMyProjectsActivePaths } from '../../Redux/Slices/PathSlice';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';
import HubIcon from '@mui/icons-material/Hub';
import LockResetIcon from '@mui/icons-material/LockReset';
import KeyIcon from '@mui/icons-material/Key';
import { logout } from '../../Redux/Slices/AuthSlice';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import DirectionsBusFilledIcon from '@mui/icons-material/DirectionsBusFilled';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import RealEstateAgentIcon from '@mui/icons-material/RealEstateAgent';
import { setSidebar, toggleSidebar } from '../../Redux/Slices/sidebarSlice';


function SideBarPage({ mobileOpen, setMobileOpen }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState(false);
  const user = useSelector((state) => state.auth);
  const rollNumber = user.rollNumber
  const userType = user.userType
  const userName = user.name
  const token = "123"
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(false);
  const [color, setColor] = useState(false);
  const [message, setMessage] = useState('');
  // const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmenuOpen = useSelector(state => state.submenu.isSubmenuOpen);
  const dispatch = useDispatch();
  const isMainMenuOpen = useSelector((state) => state.menu.isMainMenuOpen);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(window.innerWidth <= 768);
  const [newsDetails, setnewsDetails] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const isActive = (path) => location.pathname.includes(path);
  const communicationActivePaths = useSelector(selectCommunicationActivePaths)
  const myProjectsActivePaths = useSelector(selectMyProjectsActivePaths)
  const isCommunicationPathActive = () => communicationActivePaths.some(path => isActive(path));
  const isMyProjectsPathActive = () => myProjectsActivePaths.some(path => isActive(path));
  const websiteSettings = useSelector(selectWebsiteSettings);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedActive, setSelectedActive] = useState('');
  const [imageError, setImageError] = useState(false);
  
  const isExpanded = useSelector((state) => state.sidebar.isExpanded);
  
  useEffect(() => {
    if (!isMobile) {
      if (communicationActivePaths.includes(location.pathname)) {
        dispatch(setSidebar(false));
        dispatch(openSubmenu());
      } else if (
        (location.pathname === "/dashboardmenu/student/information/create" || location.pathname === "/dashboardmenu/student/information/viewinfo" || location.pathname === "/dashboardmenu/student/information/edit") && window.innerWidth < 1450
      ) {
        dispatch(setSidebar(false));
      } else {
        dispatch(closeSubmenu());
        dispatch(setSidebar(true));
      }
    } else {
      dispatch(closeSubmenu());
    }

  }, [location.pathname, dispatch]);

  useEffect(() => {
    fetchDashboardUsers()
  }, [])

  const fetchDashboardUsers = async () => {
    setIsLoading(true)
    try {
      const res = await axios.get(DashboardUsers, {
        params: {
          RollNumber: rollNumber,
          UserType: userType,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setnewsDetails(res.data.userDetails);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchNewsData()
  }, [])

  const fetchNewsData = async () => {
    setIsLoading(true)
    try {
      const res = await axios.get(DashboardUsers, {
        params: {
          RollNumber: rollNumber,
          UserType: userType,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setnewsDetails(res.data.userDetails);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false)
    }
  };


  const handleEditProfile = () => {
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobileOrTabletView = window.innerWidth <= 900;
      setIsMobileOrTablet(isMobileOrTabletView);

      if (isMobileOrTabletView) {
        dispatch(setSidebar(false));
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMenuClickOne = (menu) => {

    if (!isMobile) {
      navigate(`/dashboardmenu/${menu}`);
    }
    else {
      navigate(`/dashboardmenu/${menu}`);
      dispatch(closeMainMenu());
      dispatch(closeSubmenu());
    }
  };

  const handleMenuClick = (selectedValue, menu, path) => {
    setSelectedActive(selectedValue)
    setUnreadCount(0);
    setSelectedMenu(selectedValue)
    if (!isMobile) {
      dispatch(openSubmenu());
      navigate(`/dashboardmenu/${path}`);
      dispatch(setSidebar(false));
    }
    else {
      dispatch(openSubmenu());
    }
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

  const isDisabled = true;

  const drawer = (

    <Box
      className="custom-scrollbar"
      sx={{
        backgroundColor: websiteSettings.backgroundColor,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: isExpanded ? 260 : 80,
        transition: 'width 0.3s ease-in-out',
        overflow: 'hidden',
      }}
    >

      {/* {isLoading &&
                <Loader />} */}
      <SnackBar open={open} status={status} color={color} message={message} />
      <Box sx={{ px: 3, pt: 2, borderTop: "1px solid #ccc", borderRight: "1px solid #ccc", flexShrink: 0, }}>
        {isExpanded ? (
          <>
            <Box sx={{ position: "relative", backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #ccc", p: 2 }}>

              {/* <CustomTooltip title="Edit Profile" arrow placement="right-start">
                <IconButton onClick={handleEditProfile} sx={{
                  position: 'absolute',
                  top: 12,
                  right: 20,
                  color: '#777',
                }}>
                  <img src={EditProfileIcon} alt='profile edit' width={20} sx={{ color: '#777', fontSize: '20px' }} />
                </IconButton>
              </CustomTooltip> */}
              <CustomTooltip title="Shrink" arrow placement="right-start">
                <IconButton onClick={handleToggleSidebar} sx={{ position: "absolute", top: "-3px", left: "-4px" }}>
                  {isExpanded ? <ArrowBackIosNewIcon sx={{ color: '#777', fontSize: '20px' }} /> : <ArrowForwardIosIcon sx={{ color: '#777', fontSize: '20px' }} />}
                </IconButton>
              </CustomTooltip>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {!imageError && newsDetails.filepath ? (
                    <img
                      src={newsDetails.filepath}
                      width={50}
                      alt="profile"
                      style={{ borderRadius: "50%", }}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <AccountCircleIcon sx={{ fontSize: 30, color: "rgba(0, 0, 0, 0.7)" }} />
                  )}
                </Box>
                <Box sx={{ pl: 1, pt: 0.5, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontSize: "11px" }}
                  >
                    Welcome Back!
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "15px",
                      lineHeight: 1.3,
                      color: "text.primary",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {newsDetails.username}
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "12px",
                      color: "text.secondary",
                      textTransform: "capitalize"
                    }}
                  >
                    {newsDetails.usertype}
                  </Typography>
                </Box>

              </Box>

            </Box>
          </>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", px: 2, pt: 2, pb: 6 }}>
            {!imageError && newsDetails.filepath ? (
              <img
                src={newsDetails.filepath}
                width={35}
                alt="profile"
                style={{ borderRadius: "50%", marginLeft: "10px" }}
                onError={() => setImageError(true)}
              />
            ) : (
              <AccountCircleIcon sx={{ fontSize: 35, color: '#777', ml: "10px" }} />
            )}
            {!isMobileOrTablet &&
              (location.pathname !== "/dashboardmenu/student/information/create" &&
                location.pathname !== "/dashboardmenu/student/information/viewinfo" &&
                location.pathname !== "/dashboardmenu/student/information/edit") && (
                <CustomTooltip title="Expand" arrow placement="right-start">
                  <IconButton onClick={handleToggleSidebar} sx={{ marginTop: "0px" }}>
                    <ArrowForwardIosIcon sx={{ color: '#777', fontSize: '16px', }} />
                  </IconButton>
                </CustomTooltip>
              )}
          </Box>
        )}
      </Box>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          pb: 8,
        }}
      >
        <List sx={{ width: '100%' }}>

          {/* Dashboard Tab */}
          <ListItem onClick={() => handleMenuClickOne('dashboard')} sx={{ borderRadius: 2, px: 3, paddingTop: '3px', paddingBottom: '3px' }}>

            <CustomTooltip title={isExpanded ? "" : "Dashboard"} arrow placement="right-start">
              <Box
                sx={{
                  display: 'flex',
                  mt: 1,
                  justifyContent: "center",
                  alignItems: 'center',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  boxShadow: isActive('/dashboardmenu/dashboard') ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                  borderRadius: '5px',
                  width: '100%',
                  backgroundColor: isActive('/dashboardmenu/dashboard') ? websiteSettings.mainColor : 'inherit',
                  color: isActive('/dashboardmenu/dashboard') ? websiteSettings.textColor : '#000',
                  position: 'relative',
                  cursor: "pointer",
                  '&:hover': {
                    backgroundColor: !isActive('/dashboardmenu/dashboard') ? websiteSettings.lightColor : 'none',
                  }
                }}
              >
                {isExpanded && (
                  <Box
                    sx={{
                      width: '5px',
                      backgroundColor: isActive('/dashboardmenu/dashboard') ? websiteSettings.darkColor : 'inherit',
                      height: '100%',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      borderTopLeftRadius: '5px',
                      borderBottomLeftRadius: '5px',
                    }}
                  />
                )}
                <ListItemIcon sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <DashboardIcon style={{ color: isActive('/dashboardmenu/dashboard') ? websiteSettings.textColor : 'rgba(0, 0, 0, 0.7)' }} />
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText>
                    <Typography className="activeSidebarText" sx={{ color: isActive('/dashboardmenu/dashboard') ? websiteSettings.textColor : '#000' }}>
                      Dashboard
                    </Typography>
                  </ListItemText>
                )}
                {/* Notification Badge */}
                {/* {isExpanded ? (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    minWidth: '16px',
                    height: '16px',
                    backgroundColor: '#fff',
                    color: '#000',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '3px',
                  }}
                >
                  10
                </Box>
              ) : (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: '18px',
                    height: '18px',
                    backgroundImage: 'linear-gradient(180deg, #FBAE4E 0%, #EB8200 100%)',
                    color: '#fff',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  3
                </Box>)} */}
              </Box>
            </CustomTooltip>
          </ListItem>

          {/* Profile Tab */}
          <ListItem onClick={() => handleMenuClickOne('profile')} sx={{ borderRadius: 2, px: 3, paddingTop: '3px', paddingBottom: '3px' }}>
            <CustomTooltip title={isExpanded ? "" : "Profile Management"} arrow placement="right-start">
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: "center",
                  alignItems: 'center',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  borderRadius: '5px',
                  boxShadow: isActive('/dashboardmenu/profile') ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                  width: '100%',
                  backgroundColor: isActive('/dashboardmenu/profile') ? websiteSettings.mainColor : 'inherit',
                  color: isActive('/dashboardmenu/profile') ? websiteSettings.textColor : '#000',
                  position: 'relative',
                  '&:hover': { backgroundColor: 'none' },
                  cursor: "pointer",
                  '&:hover': {
                    backgroundColor: !isActive('/dashboardmenu/profile') ? websiteSettings.lightColor : 'none',
                  }
                }}
              >
                {isExpanded && (
                  <Box
                    sx={{
                      width: '5px',
                      backgroundColor: isActive('/dashboardmenu/profile') ? websiteSettings.darkColor : 'inherit',
                      height: '100%',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      borderTopLeftRadius: '5px',
                      borderBottomLeftRadius: '5px',
                    }}
                  />
                )}
                <ListItemIcon sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                  <ManageAccountsIcon style={{ color: isActive('/dashboardmenu/profile') ? websiteSettings.textColor : 'rgba(0, 0, 0, 0.7)', }} />
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText>
                    <Typography className="activeSidebarText" sx={{ color: isActive('/dashboardmenu/profile') ? websiteSettings.textColor : '#000' }}>
                      Profile Management
                    </Typography>
                  </ListItemText>
                )}
              </Box>
            </CustomTooltip>
          </ListItem>

          {/* Communication Tab */}
          <ListItem onClick={() => handleMenuClick('communication', 'news', 'news')} sx={{ borderRadius: 2, px: 3, paddingTop: '3px', paddingBottom: '3px' }}>
            <CustomTooltip title={isExpanded ? "" : "Communication"} arrow placement="right-start">
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: "center",
                  alignItems: 'center',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  borderRadius: '5px',
                  boxShadow: isCommunicationPathActive() ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                  width: '100%',
                  backgroundColor:
                    isCommunicationPathActive() ? websiteSettings.mainColor : 'inherit',
                  position: 'relative',
                  '&:hover': { backgroundColor: 'none' },
                  cursor: "pointer",
                  '&:hover': {
                    backgroundColor: !isCommunicationPathActive() ? websiteSettings.lightColor : 'none',
                  }
                }}
              >
                {isExpanded && (
                  <Box
                    sx={{
                      width: '5px',
                      backgroundColor:
                        isCommunicationPathActive() ? websiteSettings.darkColor : 'inherit',
                      height: '100%',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      borderTopLeftRadius: '5px',
                      borderBottomLeftRadius: '5px',
                    }}
                  />
                )}
                <ListItemIcon sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <HubIcon style={{ color: isCommunicationPathActive() ? websiteSettings.textColor : 'rgba(0, 0, 0, 0.7)', }} />
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText >
                    <Typography sx={{ color: isCommunicationPathActive() ? websiteSettings.textColor : '#000' }}>Communication</Typography>
                  </ListItemText>
                )}
                {isExpanded && unreadCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      minWidth: '16px',
                      height: '16px',
                      backgroundColor: isCommunicationPathActive() ? '#fff' : websiteSettings.darkColor,
                      color: isCommunicationPathActive() ? '#000' : websiteSettings.textColor,
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      padding: '3px',
                    }}
                  >
                    {unreadCount}
                  </Box>
                )}
              </Box>
            </CustomTooltip>
          </ListItem>
          <Box px={3}>
            <hr style={{ color: "#fff" }} />
          </Box>
          {isExpanded ?
            <Box px={5}>
              <Typography className="activeSidebarText" sx={{ fontWeight: "600", fontSize: "15px" }}>
                ERP
              </Typography>
            </Box>
            :
            <Box px={2}>

              <Typography className="activeSidebarText" sx={{ fontWeight: "600", fontSize: "12px", textAlign: "center" }}>
                ERP
              </Typography>
            </Box>
          }

          {/* Fee  Tab */}
          <ListItem onClick={() => handleMenuClickOne('fee')} sx={{ borderRadius: 2, px: 3, paddingTop: '3px', paddingBottom: '3px' }}>
            <CustomTooltip title={isExpanded ? "" : "Fee & Finance"} arrow placement="right-start">
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: "center",
                  alignItems: 'center',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  borderRadius: '5px',
                  boxShadow: isActive('/dashboardmenu/fee') ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                  width: '100%',
                  backgroundColor: isActive('/dashboardmenu/fee') ? websiteSettings.mainColor : 'inherit',
                  color: isActive('/dashboardmenu/fee') ? websiteSettings.textColor : '#000',
                  position: 'relative',
                  '&:hover': { backgroundColor: 'none' },
                  cursor: "pointer",
                  '&:hover': {
                    backgroundColor: !isActive('/dashboardmenu/fee') ? websiteSettings.lightColor : 'none',
                  }
                }}
              >
                {isExpanded && (
                  <Box
                    sx={{
                      width: '5px',
                      backgroundColor: isActive('/dashboardmenu/fee') ? websiteSettings.darkColor : 'inherit',
                      height: '100%',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      borderTopLeftRadius: '5px',
                      borderBottomLeftRadius: '5px',
                    }}
                  />
                )}
                <ListItemIcon sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                  <AssuredWorkloadIcon style={{ color: isActive('/dashboardmenu/fee') ? websiteSettings.textColor : 'rgba(0, 0, 0, 0.7)', }} />
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText>
                    <Typography className="activeSidebarText" sx={{ color: isActive('/dashboardmenu/fee') ? websiteSettings.textColor : '#000' }}>
                      Fee & Finance
                    </Typography>
                  </ListItemText>
                )}
              </Box>
            </CustomTooltip>
          </ListItem>

          {/* Leave Tab */}
          <ListItem onClick={() => handleMenuClickOne('leave')} sx={{ borderRadius: 2, px: 3, paddingTop: '3px', paddingBottom: '3px' }}>
            <CustomTooltip title={isExpanded ? "" : "Leave & Attendance"} arrow placement="right-start">
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: "center",
                  alignItems: 'center',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  borderRadius: '5px',
                  boxShadow: isActive('/dashboardmenu/leave') ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                  width: '100%',
                  backgroundColor: isActive('/dashboardmenu/leave') ? websiteSettings.mainColor : 'inherit',
                  color: isActive('/dashboardmenu/leave') ? websiteSettings.textColor : '#000',
                  position: 'relative',
                  '&:hover': { backgroundColor: 'none' },
                  cursor: "pointer",
                  '&:hover': {
                    backgroundColor: !isActive('/dashboardmenu/leave') ? websiteSettings.lightColor : 'none',
                  }
                }}
              >
                {isExpanded && (
                  <Box
                    sx={{
                      width: '5px',
                      backgroundColor: isActive('/dashboardmenu/leave') ? websiteSettings.darkColor : 'inherit',
                      height: '100%',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      borderTopLeftRadius: '5px',
                      borderBottomLeftRadius: '5px',
                    }}
                  />
                )}
                <ListItemIcon sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                  <EditCalendarIcon style={{ color: isActive('/dashboardmenu/leave') ? websiteSettings.textColor : 'rgba(0, 0, 0, 0.7)', }} />
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText>
                    <Typography className="activeSidebarText" sx={{ color: isActive('/dashboardmenu/leave') ? websiteSettings.textColor : '#000' }}>
                      Leave & Attendance
                    </Typography>
                  </ListItemText>
                )}
              </Box>
            </CustomTooltip>
          </ListItem>

          {/* Transport Tab */}
          <ListItem onClick={() => handleMenuClickOne('transport')} sx={{ borderRadius: 2, px: 3, paddingTop: '3px', paddingBottom: '3px' }}>
            <CustomTooltip title={isExpanded ? "" : "Transport"} arrow placement="right-start">
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: "center",
                  alignItems: 'center',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  borderRadius: '5px',
                  boxShadow: isActive('/dashboardmenu/transport') ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                  width: '100%',
                  backgroundColor: isActive('/dashboardmenu/transport') ? websiteSettings.mainColor : 'inherit',
                  color: isActive('/dashboardmenu/transport') ? websiteSettings.textColor : '#000',
                  position: 'relative',
                  '&:hover': { backgroundColor: 'none' },
                  cursor: "pointer",
                  '&:hover': {
                    backgroundColor: !isActive('/dashboardmenu/transport') ? websiteSettings.lightColor : 'none',
                  }
                }}
              >
                {isExpanded && (
                  <Box
                    sx={{
                      width: '5px',
                      backgroundColor: isActive('/dashboardmenu/transport') ? websiteSettings.darkColor : 'inherit',
                      height: '100%',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      borderTopLeftRadius: '5px',
                      borderBottomLeftRadius: '5px',
                    }}
                  />
                )}
                <ListItemIcon sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                  <DirectionsBusFilledIcon style={{ color: isActive('/dashboardmenu/transport') ? websiteSettings.textColor : 'rgba(0, 0, 0, 0.7)', }} />
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText>
                    <Typography className="activeSidebarText" sx={{ color: isActive('/dashboardmenu/transport') ? websiteSettings.textColor : '#000' }}>
                      Transport
                    </Typography>
                  </ListItemText>
                )}
              </Box>
            </CustomTooltip>
          </ListItem>

          {/* ERP Tab */}
          <ListItem
            onClick={() => !isDisabled && handleMenuClickOne('erp')}
            sx={{
              borderRadius: 2,
              px: 3,
              paddingTop: '3px',
              paddingBottom: '3px',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.5 : 1,
              pointerEvents: isDisabled ? 'none' : 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: '2px',
                paddingBottom: '2px',
                borderRadius: '5px',
                boxShadow: isActive('/dashboardmenu/erp') && !isDisabled ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                width: '100%',
                backgroundColor: isDisabled
                  ? ''
                  : isActive('/dashboardmenu/erp')
                    ? websiteSettings.mainColor
                    : 'inherit',
                color: isDisabled
                  ? '#A0A0A0'
                  : isActive('/dashboardmenu/erp')
                    ? websiteSettings.textColor
                    : '#000',
                position: 'relative',
                '&:hover': {
                  backgroundColor: isDisabled
                    ? 'none' // Prevent hover styles when disabled
                    : !isActive('/dashboardmenu/erp')
                      ? websiteSettings.lightColor
                      : 'none',
                },
              }}
            >
              {isExpanded && (
                <Box
                  sx={{
                    width: '5px',
                    backgroundColor: isDisabled
                      ? 'transparent' // No indicator when disabled
                      : isActive('/dashboardmenu/erp')
                        ? websiteSettings.darkColor
                        : 'inherit',
                    height: '100%',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    borderTopLeftRadius: '5px',
                    borderBottomLeftRadius: '5px',
                  }}
                />
              )}
              <ListItemIcon
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Inventory2Icon
                  style={{
                    color: isDisabled
                      ? '#000' // Disabled icon color
                      : isActive('/dashboardmenu/erp')
                        ? websiteSettings.textColor
                        : '#000',
                  }}
                />
              </ListItemIcon>
              {isExpanded && (
                <ListItemText>
                  <Typography
                    className="activeSidebarText"
                    sx={{
                      color: isDisabled
                        ? '#000' // Disabled text color
                        : isActive('/dashboardmenu/erp')
                          ? websiteSettings.textColor
                          : '#000',
                    }}
                  >
                    Inventory
                  </Typography>
                </ListItemText>
              )}
            </Box>
          </ListItem>

          {/* Assets Tab */}
          <ListItem onClick={() => handleMenuClickOne('asset')} sx={{ borderRadius: 2, px: 3, paddingTop: '3px', paddingBottom: '3px' }}>
            <CustomTooltip title={isExpanded ? "" : "Assets"} arrow placement="right-start">
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: "center",
                  alignItems: 'center',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  borderRadius: '5px',
                  boxShadow: isActive('/dashboardmenu/asset') ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                  width: '100%',
                  backgroundColor: isActive('/dashboardmenu/asset') ? websiteSettings.mainColor : 'inherit',
                  color: isActive('/dashboardmenu/asset') ? websiteSettings.textColor : '#000',
                  position: 'relative',
                  '&:hover': { backgroundColor: 'none' },
                  cursor: "pointer",
                  '&:hover': {
                    backgroundColor: !isActive('/dashboardmenu/asset') ? websiteSettings.lightColor : 'none',
                  }
                }}
              >
                {isExpanded && (
                  <Box
                    sx={{
                      width: '5px',
                      backgroundColor: isActive('/dashboardmenu/asset') ? websiteSettings.darkColor : 'inherit',
                      height: '100%',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      borderTopLeftRadius: '5px',
                      borderBottomLeftRadius: '5px',
                    }}
                  />
                )}
                <ListItemIcon sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                  <RealEstateAgentIcon style={{ color: isActive('/dashboardmenu/asset') ? websiteSettings.textColor : 'rgba(0, 0, 0, 0.7)', }} />
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText>
                    <Typography className="activeSidebarText" sx={{ color: isActive('/dashboardmenu/asset') ? websiteSettings.textColor : '#000' }}>
                      Assets
                    </Typography>
                  </ListItemText>
                )}
              </Box>
            </CustomTooltip>
          </ListItem>


          <Box sx={{ backgroundColor: websiteSettings.backgroundColor }}>
            <Box px={3}>
              <hr style={{ color: "#fff" }} />
            </Box>

            {userType !== "teacher" &&
              <Box>
                {isExpanded ?
                  <Box px={5}>
                    <Typography className="activeSidebarText" sx={{ fontWeight: "600", fontSize: "15px" }}>
                      Manage
                    </Typography>
                  </Box>
                  :
                  <Box px={2}>

                    <Typography className="activeSidebarText" sx={{ fontWeight: "600", fontSize: "12px" }}>
                      Manage
                    </Typography>
                  </Box>
                }
              </Box>
            }

            {/* Approvals Tab */}

            {(userType === "superadmin" || userType === "admin") && (
              <ListItem onClick={() => handleMenuClickOne('myprojects')} sx={{ borderRadius: 2, px: 3, paddingTop: '3px', paddingBottom: '3px' }}>
                <CustomTooltip title={isExpanded ? "" : "My Projects"} arrow placement="right-start">
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: "center",
                      alignItems: 'center',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      borderRadius: '5px',
                      boxShadow: isMyProjectsPathActive() ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                      width: '100%',
                      backgroundColor: isMyProjectsPathActive() ? websiteSettings.mainColor : 'inherit',
                      color: isMyProjectsPathActive() ? websiteSettings.textColor : '#000',
                      position: 'relative',
                      '&:hover': { backgroundColor: 'none' },
                      cursor: "pointer",
                      '&:hover': {
                        backgroundColor: !isMyProjectsPathActive() ? websiteSettings.lightColor : 'none',
                      }
                    }}
                  >
                    {isExpanded && (
                      <Box
                        sx={{
                          width: '5px',
                          backgroundColor: isMyProjectsPathActive() ? websiteSettings.darkColor : 'inherit',
                          height: '100%',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          borderTopLeftRadius: '5px',
                          borderBottomLeftRadius: '5px',
                        }}
                      />
                    )}
                    <ListItemIcon sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                      <FolderCopyIcon style={{ color: isMyProjectsPathActive() ? websiteSettings.textColor : 'rgba(0, 0, 0, 0.7)', }} />
                    </ListItemIcon>
                    {isExpanded && (
                      <ListItemText>
                        <Typography className="activeSidebarText" sx={{ color: isMyProjectsPathActive() ? websiteSettings.textColor : '#000' }}>
                          My Projects
                        </Typography>
                      </ListItemText>
                    )}

                  </Box>
                </CustomTooltip>
              </ListItem>
            )}
            {/* Approvals Tab */}

            {(userType === "superadmin" || userType === "admin") && (
              <ListItem onClick={() => handleMenuClickOne('approvals')} sx={{ borderRadius: 2, px: 3, paddingTop: '3px', paddingBottom: '3px' }}>
                <CustomTooltip title={isExpanded ? "" : "Approvals"} arrow placement="right-start">
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: "center",
                      alignItems: 'center',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      borderRadius: '5px',
                      boxShadow: isActive('/dashboardmenu/approvals') ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                      width: '100%',
                      backgroundColor: isActive('/dashboardmenu/approvals') ? websiteSettings.mainColor : 'inherit',
                      color: isActive('/dashboardmenu/approvals') ? websiteSettings.textColor : '#000',
                      position: 'relative',
                      '&:hover': { backgroundColor: 'none' },
                      cursor: "pointer",
                      '&:hover': {
                        backgroundColor: !isActive('/dashboardmenu/approvals') ? websiteSettings.lightColor : 'none',
                      }
                    }}
                  >
                    {isExpanded && (
                      <Box
                        sx={{
                          width: '5px',
                          backgroundColor: isActive('/dashboardmenu/approvals') ? websiteSettings.darkColor : 'inherit',
                          height: '100%',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          borderTopLeftRadius: '5px',
                          borderBottomLeftRadius: '5px',
                        }}
                      />
                    )}
                    <ListItemIcon sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                      < LockResetIcon style={{ color: isActive('/dashboardmenu/approvals') ? websiteSettings.textColor : 'rgba(0, 0, 0, 0.7)', }} />
                    </ListItemIcon>
                    {isExpanded && (
                      <ListItemText>
                        <Typography className="activeSidebarText" sx={{ color: isActive('/dashboardmenu/approvals') ? websiteSettings.textColor : '#000' }}>
                          Approvals
                        </Typography>
                      </ListItemText>
                    )}

                    {/* {isExpanded && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        minWidth: '16px',
                        height: '16px',
                        backgroundColor: isActive('/dashboardmenu/approvals') ? '#fff' : websiteSettings.darkColor,
                        color: isActive('/dashboardmenu/approvals') ? '#000' : websiteSettings.textColor,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: '3px',
                      }}
                    >
                      10
                    </Box>
                  )} */}
                  </Box>
                </CustomTooltip>
              </ListItem>
            )}

            {(userType === "superadmin" || userType === "admin" || userType === "staff") && (
              <ListItem onClick={() => handleMenuClickOne('access')} sx={{ borderRadius: 2, px: 3, paddingTop: '3px', paddingBottom: '3px' }}>
                <CustomTooltip title={isExpanded ? "" : "Access Control"} arrow placement="right-start">
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: "center",
                      alignItems: 'center',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      borderRadius: '5px',
                      boxShadow: isActive('/dashboardmenu/access') ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                      width: '100%',
                      backgroundColor: isActive('/dashboardmenu/access') ? websiteSettings.mainColor : 'inherit',
                      color: isActive('/dashboardmenu/access') ? websiteSettings.textColor : '#000',
                      position: 'relative',
                      '&:hover': { backgroundColor: 'none' },
                      cursor: "pointer",
                      '&:hover': {
                        backgroundColor: !isActive('/dashboardmenu/access') ? websiteSettings.lightColor : 'none',
                      }
                    }}
                  >
                    {isExpanded && (
                      <Box
                        sx={{
                          width: '5px',
                          backgroundColor: isActive('/dashboardmenu/access') ? websiteSettings.darkColor : 'inherit',
                          height: '100%',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          borderTopLeftRadius: '5px',
                          borderBottomLeftRadius: '5px',
                        }}
                      />
                    )}
                    <ListItemIcon sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                      <KeyIcon style={{ color: isActive('/dashboardmenu/access') ? websiteSettings.textColor : 'rgba(0, 0, 0, 0.7)', }} />
                    </ListItemIcon>
                    {isExpanded && (
                      <ListItemText>
                        <Typography className="activeSidebarText" sx={{ color: isActive('/dashboardmenu/access') ? websiteSettings.textColor : '#000' }}>
                          Access Control
                        </Typography>
                      </ListItemText>
                    )}
                  </Box>
                </CustomTooltip>
              </ListItem>
            )}
          </Box>

          {/* <Box sx={{ display: "flex", justifyContent: "center", backgroundColor: websiteSettings.backgroundColor }}>
          {isExpanded ?

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={handleLogoutClick}
                variant="contained"
                sx={{
                  backgroundColor: "#000",
                  borderRadius: "20px",
                  textTransform: "none",
                  paddingTop: "1px",
                  paddingBottom: "1px",
                  px: 3,
                  mt:3
                }}
              >
                Logout
              </Button>
            </Box>


            :
            <IconButton
              onClick={handleLogoutClick}
              sx={{
                mt: 4,
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
          }

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
        </Box> */}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Main Sidebar */}
      <Drawer
        open={isMobile ? isMainMenuOpen : true}
        variant='persistent'
        // ModalProps={{
        //   keepMounted: true,
        // }}
        sx={{
          display: 'block',
          width: isMobile ? 0 : isExpanded ? 260 : 80,
          transition: 'width 0.3s ease-in-out',
          flexShrink: 0,
          border: "none",
          '& .MuiDrawer-paper': {
            width: isMobile ? 80 : isExpanded ? 260 : 80,
            marginTop: isMobile ? 0 : "60px",
            boxSizing: 'border-box',
            border: "none",
            bgcolor: '#fff',
            // boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
            transition: 'width 0.3s ease-in-out',

          },
        }}
        anchor="left"
      >
        {drawer}
      </Drawer>

      {/* Submenu Sidebar */}
      <Drawer
        open
        variant="persistent"
        sx={{
          width: isMobile ? '0px' : isSubmenuOpen ? '220px' : '0px',
          transition: 'width 0.3s ease-in-out',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isSubmenuOpen ? '220px' : '0px',
            marginTop: isMobile ? 0 : '60px',
            marginLeft: isExpanded ? '259px' : '79px',
            transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
            boxSizing: 'border-box',
            bgcolor: '#fff',
            border: "1px solid #eaeaea",
            borderRight: isMobile ? "none" : "",
            borderLeft: isMobile ? "none" : "",
            borderRadius: "5px 5px 0px 0px",
            display: 'flex',
            height: 'calc(100vh - 60px)',
            overflow: 'auto',
          },
        }}
        anchor="left"
      >
        {isSubmenuOpen && <SubMenuPage active={selectedActive} />}
      </Drawer>
    </Box>
  );
}

export default SideBarPage;
