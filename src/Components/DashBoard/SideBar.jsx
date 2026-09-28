import React, { useEffect, useState } from 'react';
import { Drawer, Button, Typography, Box, List, ListItem, ListItemText, ListItemIcon, useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Tooltip, styled, tooltipClasses } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../App.css';
import '../../Css/Style.css';
import '../../Css/Page.css';
import '../../Css/OverWrite.css';
import SubMenuPage from './SubMenu';
import axios from 'axios';
import { fetchgroups } from '../../Api/Api';
import { selectChatUnreadTotal, setChatUnreadTotal } from '../../Redux/Slices/chatSlice';
import SnackBar from '../SnackBar';
import { useDispatch, useSelector } from 'react-redux';
import { closeSubmenu, openSubmenu } from '../../Redux/Slices/SubMenuController';
import { closeMainMenu } from '../../Redux/Slices/MainMenuSlice';
import { selectCommunicationActivePaths, selectAcademicsActivePaths, selectMyProjectsActivePaths } from '../../Redux/Slices/PathSlice';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';
import { selectVersion } from '../../Redux/Slices/versionSlice';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import { logout, findSubMenuPermissions, hasMainMenuAccess } from '../../Redux/Slices/AuthSlice';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import DirectionsBusOutlinedIcon from '@mui/icons-material/DirectionsBusOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { setSidebar, toggleSidebar } from '../../Redux/Slices/sidebarSlice';
import AppScrollbar from '../AppScrollbar';
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

/* A detail route belongs to the same sub menu as the list it opened from, so the
   sub menu has to stay open on /dashboardmenu/books/12 as well as
   /dashboardmenu/books. Matching on a segment boundary keeps that from spilling
   onto an unrelated path that merely starts with the same letters. */
const matchesActivePath = (paths, pathname) =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

function SideBarPage({ mobileOpen, setMobileOpen }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState(false);
  const user = useSelector((state) => state.auth);
  const rollNumber = user.rollNumber
  // Sent to the chat endpoint as a parameter only - it never decides access.
  const userType = user.userType
  const userName = user.name
  const token = "123"

  // Menu visibility comes from the login response, never from userType.
  // A tab shows when its main menu grants at least one "Y" anywhere inside it.
  // A main menu the response leaves out means no access, so lower privileged
  // users simply do not receive those menus.
  const mainMenus = user.permissions?.mainMenus || [];
  // Nothing loaded yet (old session, permissions still in flight) - show
  // everything rather than blanking the whole sidebar.
  const rbacReady = mainMenus.length > 0;
  const menuExists = (mainMenu) => mainMenus.some((m) => m.mainMenu === mainMenu);
  const canMenu = (mainMenu) => !rbacReady || hasMainMenuAccess(user.permissions, mainMenu);

  // Any "Y" on a single sub menu.
  const canSub = (mainMenu, subMenu) => {
    const perms = findSubMenuPermissions(user.permissions, mainMenu, subMenu);
    return !!perms && Object.values(perms).some((v) => v === "Y");
  };
  const canAnySub = (mainMenu, subMenus) =>
    !rbacReady || subMenus.some((sm) => canSub(mainMenu, sm));

  // Communication and Academics are two tabs over one "communication" main
  // menu, so each one checks only the sub menus it actually opens.
  const COMMUNICATION_SUBMENUS = [
    ["dashboard", "com-dashboard"],
    ["news", "news"],
    ["message", "messages"],
    ["circular", "circulars"],
    ["contactdetails", "contact"],
    ["schoolcalender", "schoolcalendar"],
    ["events", "events"],
    ["birthdaypost", "birthday-post"],
    ["feedback", "feedback"],
  ];
  const ACADEMICS_SUBMENUS = [
    ["timetable", "timetables"],
    ["homework", "homework"],
    ["examtimetable", "examtimetables"],
    ["studymaterial", "studymaterials"],
    ["marks", "marks"],
    ["attendance", "attendance"],
  ];

  // Land on the first screen this user can actually open.
  const communicationLandingPath =
    (COMMUNICATION_SUBMENUS.find(([sm]) => canSub("communication", sm)) || [null, "consentforms"])[1];
  const academicsLandingPath =
    (ACADEMICS_SUBMENUS.find(([sm]) => canSub("communication", sm)) || [null, "assessment/online-quiz"])[1];

  const canProfile = canMenu("profilemanagement");
  const canCommunication = canAnySub("communication", COMMUNICATION_SUBMENUS.map(([sm]) => sm));
  const canAcademics = canAnySub("communication", ACADEMICS_SUBMENUS.map(([sm]) => sm));
  const canFee = canMenu("feeandfinance");
  const canLeave = canMenu("leaveandpayroll");
  const canTransport = canMenu("transport");
  const canMyProjects = canMenu("myprojects");
  const canAccessControl = canMenu("accesscontrol");
  // The login response carries no "approvals" main menu yet, so this tab stays
  // reachable until one arrives. Every other tab is strict.
  const canApprovals = menuExists("approvals") ? canMenu("approvals") : true;
  const canComplaints = menuExists("complaints") ? canMenu("complaints") : true;
  const showSupportSection = canComplaints;
  // The "Manage" heading only earns its place when something sits under it.
  const showManageSection = canMyProjects || canApprovals || canAccessControl;
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
  const [selectedMenu, setSelectedMenu] = useState(null);
  const isActive = (path) => location.pathname.includes(path);
  // Strict match for Fee & Finance — avoids substring collision with /dashboardmenu/feedback
  const isFeeActive =
    location.pathname === '/dashboardmenu/fee' ||
    location.pathname.startsWith('/dashboardmenu/fee/');
  const communicationActivePaths = useSelector(selectCommunicationActivePaths)
  const academicsActivePaths = useSelector(selectAcademicsActivePaths)
  const myProjectsActivePaths = useSelector(selectMyProjectsActivePaths)
  const isCommunicationPathActive = () => communicationActivePaths.some(path => isActive(path));
  const isAcademicsPathActive = () => academicsActivePaths.some(path => isActive(path));
  const isMyProjectsPathActive = () => myProjectsActivePaths.some(path => isActive(path));
  const websiteSettings = useSelector(selectWebsiteSettings);
  const version = useSelector(selectVersion);
  const [selectedActive, setSelectedActive] = useState('');

  const isExpanded = useSelector((state) => state.sidebar.isExpanded);
  const chatUnread = useSelector(selectChatUnreadTotal);


  const refreshChatUnread = () => {
    if (!rollNumber) return;
    axios
      .get(fetchgroups, { params: { rollNumber, userType }, headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const total = (res.data?.groups || []).reduce((sum, g) => sum + (g.unreadCount || 0), 0);
        dispatch(setChatUnreadTotal(total));
      })
      .catch(() => { });
  };

  useEffect(() => {
    refreshChatUnread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollNumber, userType]);

  useEffect(() => {
    if (location.pathname !== '/dashboardmenu/chats') refreshChatUnread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) {
      if (
        matchesActivePath(communicationActivePaths, location.pathname) ||
        matchesActivePath(academicsActivePaths, location.pathname)
      ) {
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
      sx={{
        backgroundColor: websiteSettings.backgroundColor,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        transition: 'width 0.3s ease-in-out',
        overflow: 'hidden',
        borderTop: '1px solid #ccc',
      }}
    >

      {/* {isLoading &&
                <Loader />} */}
      <SnackBar open={open} status={status} color={color} message={message} />

      <AppScrollbar
        style={{ flex: 1, minHeight: 0, paddingBottom: '12px' }}
      >
        <List sx={{ width: '100%' }}>

          {/* Dashboard Tab */}
          <ListItem onClick={() => handleMenuClickOne('dashboard')} sx={{ borderRadius: 2, px: 3, paddingTop: '6px', paddingBottom: isExpanded ? '2px' : '9px' }}>

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
                  <DashboardOutlinedIcon style={{ fontSize: 20, color: isActive('/dashboardmenu/dashboard') ? websiteSettings.textColor : '#6B7280' }} />
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText>
                    <Typography className="activeSidebarText" sx={{ fontSize: "15px", color: isActive('/dashboardmenu/dashboard') ? websiteSettings.textColor : '#000' }}>
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
          {canProfile && (
            <ListItem onClick={() => handleMenuClickOne('profile')} sx={{ borderRadius: 2, px: 3, paddingTop: '6px', paddingBottom: isExpanded ? '2px' : '9px' }}>
              <CustomTooltip title={isExpanded ? "" : "Profile Management"} arrow placement="right-start">
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: "center",
                    alignItems: 'center',
                    paddingTop: '1px',
                    paddingBottom: '1px',
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
                    <ManageAccountsOutlinedIcon style={{ fontSize: 20, color: isActive('/dashboardmenu/profile') ? websiteSettings.textColor : '#6B7280', }} />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText>
                      <Typography className="activeSidebarText" sx={{ fontSize: "15px", color: isActive('/dashboardmenu/profile') ? websiteSettings.textColor : '#000' }}>
                        Profile Management
                      </Typography>
                    </ListItemText>
                  )}
                </Box>
              </CustomTooltip>
            </ListItem>
          )}

          {/* Communication Tab */}
          {version.LITE && canCommunication && (
            <ListItem onClick={() => handleMenuClick('communication', 'com-dashboard', communicationLandingPath)} sx={{ borderRadius: 2, px: 3, paddingTop: '6px', paddingBottom: isExpanded ? '2px' : '9px' }}>
              <CustomTooltip title={isExpanded ? "" : "Communication"} arrow placement="right-start">
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: "center",
                    alignItems: 'center',
                    paddingTop: '1px',
                    paddingBottom: '1px',
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
                    <ForumOutlinedIcon style={{ fontSize: 20, color: isCommunicationPathActive() ? websiteSettings.textColor : '#6B7280', }} />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText >
                      <Typography sx={{ color: isCommunicationPathActive() ? websiteSettings.textColor : '#000' }}>Communication</Typography>
                    </ListItemText>
                  )}
                  {chatUnread > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: isExpanded ? '50%' : '-8px',
                        right: isExpanded ? '10px' : '-22px',
                        transform: isExpanded ? 'translateY(-50%)' : 'none',
                        minWidth: '19px',
                        height: '19px',
                        padding: '0 6px',
                        borderRadius: '10px',
                        backgroundColor: '#1A1A1A',
                        color: '#fff',
                        border: !isExpanded ? '2px solid #fff' : 'none',
                        boxShadow: !isExpanded ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        lineHeight: 1,
                        zIndex: 2,
                      }}
                    >
                      {chatUnread > 99 ? '99+' : chatUnread}
                    </Box>
                  )}
                </Box>
              </CustomTooltip>
            </ListItem>
          )}


          {/* Academics Tab */}
          {version.LITE && canAcademics && (
            <ListItem onClick={() => handleMenuClick('academics', 'timetables', academicsLandingPath)} sx={{ borderRadius: 2, px: 3, paddingTop: '6px', paddingBottom: isExpanded ? '2px' : '9px' }}>
              <CustomTooltip title={isExpanded ? "" : "Academics"} arrow placement="right-start">
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: "center",
                    alignItems: 'center',
                    paddingTop: '1px',
                    paddingBottom: '1px',
                    borderRadius: '5px',
                    boxShadow: isAcademicsPathActive() ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                    width: '100%',
                    backgroundColor: isAcademicsPathActive() ? websiteSettings.mainColor : 'inherit',
                    color: isAcademicsPathActive() ? websiteSettings.textColor : '#000',
                    position: 'relative',
                    cursor: "pointer",
                    '&:hover': {
                      backgroundColor: !isAcademicsPathActive() ? websiteSettings.lightColor : 'none',
                    }
                  }}
                >
                  {isExpanded && (
                    <Box
                      sx={{
                        width: '5px',
                        backgroundColor: isAcademicsPathActive() ? websiteSettings.darkColor : 'inherit',
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
                    <AutoStoriesOutlinedIcon style={{ fontSize: 20, color: isAcademicsPathActive() ? websiteSettings.textColor : '#6B7280' }} />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText>
                      <Typography className="activeSidebarText" sx={{ fontSize: "15px", color: isAcademicsPathActive() ? websiteSettings.textColor : '#000' }}>
                        Academics
                      </Typography>
                    </ListItemText>
                  )}
                </Box>
              </CustomTooltip>
            </ListItem>
          )}

          <Box px={3}>
            <hr style={{ border: "none", borderTop: "1px solid #e8dec9", margin: "6px 0" }} />
          </Box>

          {isExpanded ?
            <Box px={5}>
              <Typography className="activeSidebarText" sx={{ fontWeight: "700", fontSize: "12px", letterSpacing: "0.04em" }}>
                ERP
              </Typography>
            </Box>
            :
            <Box px={2} sx={{ py: 0.6 }}>
              <Typography className="activeSidebarText" sx={{ fontWeight: "600", fontSize: "11px", textAlign: "center", color: "#9a8e70" }}>
                ERP
              </Typography>
            </Box>
          }

          {/* Fee  Tab */}
          {version.PRO && canFee && (
            <ListItem onClick={() => handleMenuClickOne('fee')} sx={{ borderRadius: 2, px: 3, paddingTop: '6px', paddingBottom: isExpanded ? '2px' : '9px' }}>
              <CustomTooltip title={isExpanded ? "" : "Fee & Finance"} arrow placement="right-start">
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: "center",
                    alignItems: 'center',
                    paddingTop: '1px',
                    paddingBottom: '1px',
                    borderRadius: '5px',
                    boxShadow: isFeeActive ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                    width: '100%',
                    backgroundColor: isFeeActive ? websiteSettings.mainColor : 'inherit',
                    color: isFeeActive ? websiteSettings.textColor : '#000',
                    position: 'relative',
                    '&:hover': { backgroundColor: 'none' },
                    cursor: "pointer",
                    '&:hover': {
                      backgroundColor: !isFeeActive ? websiteSettings.lightColor : 'none',
                    }
                  }}
                >
                  {isExpanded && (
                    <Box
                      sx={{
                        width: '5px',
                        backgroundColor: isFeeActive ? websiteSettings.darkColor : 'inherit',
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
                    <PaymentsOutlinedIcon style={{ fontSize: 20, color: isFeeActive ? websiteSettings.textColor : '#6B7280', }} />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText>
                      <Typography className="activeSidebarText" sx={{ fontSize: "15px", color: isFeeActive ? websiteSettings.textColor : '#000' }}>
                        Fee & Finance
                      </Typography>
                    </ListItemText>
                  )}
                </Box>
              </CustomTooltip>
            </ListItem>
          )}

          {/* Leave Tab */}
          {version.PRO && canLeave && (
            <ListItem onClick={() => handleMenuClickOne('leave')} sx={{ borderRadius: 2, px: 3, paddingTop: '6px', paddingBottom: isExpanded ? '2px' : '9px' }}>
              <CustomTooltip title={isExpanded ? "" : "Leave & Payroll"} arrow placement="right-start">
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: "center",
                    alignItems: 'center',
                    paddingTop: '1px',
                    paddingBottom: '1px',
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
                    <BadgeOutlinedIcon style={{ fontSize: 20, color: isActive('/dashboardmenu/leave') ? websiteSettings.textColor : '#6B7280', }} />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText>
                      <Typography className="activeSidebarText" sx={{ fontSize: "15px", color: isActive('/dashboardmenu/leave') ? websiteSettings.textColor : '#000' }}>
                        Leave & Payroll
                      </Typography>
                    </ListItemText>
                  )}
                </Box>
              </CustomTooltip>
            </ListItem>
          )}

          {/* Transport Tab */}
          {(version.PRO || version.PLUS) && canTransport && (
            <ListItem onClick={() => handleMenuClickOne('transport')} sx={{ borderRadius: 2, px: 3, paddingTop: '6px', paddingBottom: isExpanded ? '2px' : '9px' }}>
              <CustomTooltip title={isExpanded ? "" : "Transport"} arrow placement="right-start">
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: "center",
                    alignItems: 'center',
                    paddingTop: '1px',
                    paddingBottom: '1px',
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
                    <DirectionsBusOutlinedIcon style={{ fontSize: 20, color: isActive('/dashboardmenu/transport') ? websiteSettings.textColor : '#6B7280', }} />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText>
                      <Typography className="activeSidebarText" sx={{ fontSize: "15px", color: isActive('/dashboardmenu/transport') ? websiteSettings.textColor : '#000' }}>
                        Transport
                      </Typography>
                    </ListItemText>
                  )}
                </Box>
              </CustomTooltip>
            </ListItem>
          )}

          {/* ERP Tab */}
          <ListItem
            onClick={() => !isDisabled && handleMenuClickOne('erp')}
            sx={{
              borderRadius: 2,
              px: 3,
              paddingTop: '6px',
              paddingBottom: isExpanded ? '2px' : '9px',
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
                <Inventory2OutlinedIcon
                  style={{
                    fontSize: 20,
                    color: isDisabled
                      ? '#6B7280' // Disabled icon color
                      : isActive('/dashboardmenu/erp')
                        ? websiteSettings.textColor
                        : '#6B7280',
                  }}
                />
              </ListItemIcon>
              {isExpanded && (
                <ListItemText>
                  <Typography
                    className="activeSidebarText"
                    sx={{
                      fontSize: "15px",
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
          {/* ERP Tab */}
          <ListItem
            onClick={() => !isDisabled && handleMenuClickOne('erp')}
            sx={{
              borderRadius: 2,
              px: 3,
              paddingTop: '6px',
              paddingBottom: isExpanded ? '2px' : '9px',
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
                    ? 'none'
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
                <CategoryOutlinedIcon
                  style={{
                    fontSize: 20,
                    color: isDisabled
                      ? '#6B7280' // Disabled icon color
                      : isActive('/dashboardmenu/erp')
                        ? websiteSettings.textColor
                        : '#6B7280',
                  }}
                />
              </ListItemIcon>
              {isExpanded && (
                <ListItemText>
                  <Typography
                    className="activeSidebarText"
                    sx={{
                      fontSize: "15px",
                      color: isDisabled
                        ? '#000' // Disabled text color
                        : isActive('/dashboardmenu/erp')
                          ? websiteSettings.textColor
                          : '#000',
                    }}
                  >
                    Assets
                  </Typography>
                </ListItemText>
              )}
            </Box>
          </ListItem>

          {/* Assets Tab
          <ListItem onClick={() => handleMenuClickOne('asset')} sx={{ borderRadius: 2, px: 3, paddingTop: '6px', paddingBottom: isExpanded ? '2px' : '9px' }}>
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
                  <CategoryOutlinedIcon style={{ fontSize: 20, color: isActive('/dashboardmenu/asset') ? websiteSettings.textColor : '#6B7280', }} />
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText>
                    <Typography className="activeSidebarText" sx={{ fontSize: "15px", color: isActive('/dashboardmenu/asset') ? websiteSettings.textColor : '#000' }}>
                      Assets
                    </Typography>
                  </ListItemText>
                )}
              </Box>
            </CustomTooltip>
          </ListItem> */}


          {showSupportSection &&
            <Box>
              <Box px={3}>
                <hr style={{ border: "none", borderTop: "1px solid #e8dec9", margin: "6px 0" }} />
              </Box>

              {isExpanded ?
                <Box px={5}>
                  <Typography className="activeSidebarText" sx={{ fontWeight: "700", fontSize: "12px", letterSpacing: "0.04em" }}>
                    Support
                  </Typography>
                </Box>
                :
                <Box px={2} sx={{ py: 0.6 }}>
                  <Typography className="activeSidebarText" sx={{ fontWeight: "600", fontSize: "11px", textAlign: "center", color: "#9a8e70" }}>
                    Support
                  </Typography>
                </Box>
              }
            </Box>
          }

          {/* Complaints Tab */}
          {version.LITE && canComplaints && (
            <ListItem onClick={() => handleMenuClickOne('complaints')} sx={{ borderRadius: 2, px: 3, paddingTop: '6px', paddingBottom: isExpanded ? '2px' : '9px' }}>
              <CustomTooltip title={isExpanded ? "" : "Complaints"} arrow placement="right-start">
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: "center",
                    alignItems: 'center',
                    paddingTop: '1px',
                    paddingBottom: '1px',
                    borderRadius: '5px',
                    boxShadow: isActive('/dashboardmenu/complaints') ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                    width: '100%',
                    backgroundColor: isActive('/dashboardmenu/complaints') ? websiteSettings.mainColor : 'inherit',
                    color: isActive('/dashboardmenu/complaints') ? websiteSettings.textColor : '#000',
                    position: 'relative',
                    cursor: "pointer",
                    '&:hover': {
                      backgroundColor: !isActive('/dashboardmenu/complaints') ? websiteSettings.lightColor : 'none',
                    }
                  }}
                >
                  {isExpanded && (
                    <Box
                      sx={{
                        width: '5px',
                        backgroundColor: isActive('/dashboardmenu/complaints') ? websiteSettings.darkColor : 'inherit',
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
                    <SupportAgentOutlinedIcon style={{ fontSize: 20, color: isActive('/dashboardmenu/complaints') ? websiteSettings.textColor : '#6B7280', }} />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText>
                      <Typography className="activeSidebarText" sx={{ fontSize: "15px", color: isActive('/dashboardmenu/complaints') ? websiteSettings.textColor : '#000' }}>
                        Complaints
                      </Typography>
                    </ListItemText>
                  )}
                </Box>
              </CustomTooltip>
            </ListItem>
          )}

          <Box sx={{ backgroundColor: websiteSettings.backgroundColor }}>
            <Box px={3}>
              <hr style={{ border: "none", borderTop: "1px solid #e8dec9", margin: "6px 0" }} />
            </Box>

            {showManageSection &&
              <Box>
                {isExpanded ?
                  <Box px={5}>
                    <Typography className="activeSidebarText" sx={{ fontWeight: "700", fontSize: "12px", letterSpacing: "0.04em" }}>
                      Manage
                    </Typography>
                  </Box>
                  :
                  <Box px={2} sx={{ py: 0.6 }}>
                    <Typography className="activeSidebarText" sx={{ fontWeight: "600", fontSize: "11px", textAlign: "center", color: "#9a8e70" }}>
                      Manage
                    </Typography>
                  </Box>
                }
              </Box>
            }

            {/* My Project Tab */}
            {version.LITE && canMyProjects && (
              <ListItem onClick={() => handleMenuClickOne('myprojects')} sx={{ borderRadius: 2, px: 3, paddingTop: '6px', paddingBottom: isExpanded ? '2px' : '9px' }}>
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
                      <FolderOutlinedIcon style={{ fontSize: 20, color: isMyProjectsPathActive() ? websiteSettings.textColor : '#6B7280', }} />
                    </ListItemIcon>
                    {isExpanded && (
                      <ListItemText>
                        <Typography className="activeSidebarText" sx={{ fontSize: "15px", color: isMyProjectsPathActive() ? websiteSettings.textColor : '#000' }}>
                          My Projects
                        </Typography>
                      </ListItemText>
                    )}

                  </Box>
                </CustomTooltip>
              </ListItem>
            )}
            {/* Approvals Tab */}

            {canApprovals && (
              <ListItem onClick={() => handleMenuClickOne('approvals')} sx={{ borderRadius: 2, px: 3, paddingTop: '6px', paddingBottom: isExpanded ? '2px' : '9px' }}>
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
                      <FactCheckOutlinedIcon style={{ fontSize: 20, color: isActive('/dashboardmenu/approvals') ? websiteSettings.textColor : '#6B7280', }} />
                    </ListItemIcon>
                    {isExpanded && (
                      <ListItemText>
                        <Typography className="activeSidebarText" sx={{ fontSize: "15px", color: isActive('/dashboardmenu/approvals') ? websiteSettings.textColor : '#000' }}>
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

            {canAccessControl && (
              <ListItem onClick={() => handleMenuClickOne('access')} sx={{ borderRadius: 2, px: 3, paddingTop: '6px', paddingBottom: isExpanded ? '2px' : '9px' }}>
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
                      <VpnKeyOutlinedIcon style={{ fontSize: 20, color: isActive('/dashboardmenu/access') ? websiteSettings.textColor : '#6B7280', }} />
                    </ListItemIcon>
                    {isExpanded && (
                      <ListItemText>
                        <Typography className="activeSidebarText" sx={{ fontSize: "15px", color: isActive('/dashboardmenu/access') ? websiteSettings.textColor : '#000' }}>
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
      </AppScrollbar>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar collapse / expand handle - sits on the sidebar's right edge */}
      {/* Sidebar collapse / expand handle */}
      {!isMobileOrTablet &&
        location.pathname !== "/dashboardmenu/student/information/create" &&
        location.pathname !== "/dashboardmenu/student/information/viewinfo" &&
        location.pathname !== "/dashboardmenu/student/information/edit" && (

          <Box
            sx={{
              position: "fixed",
              top: "108px",
              left: isExpanded ? "260px" : "80px",
              transform: "translateX(-50%)",
              // above the drawer paper, below dialogs/menus - 1400 put it over every backdrop
              zIndex: (theme) => theme.zIndex.drawer + 1,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              transition: "left 0.3s ease-in-out",
            }}
          >
            <Box
              onClick={handleToggleSidebar}
              sx={{
                width: 27,
                height: 31,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FFFDF7",
                border: `1px solid ${websiteSettings.mainColor}`,
                borderRadius: "6px",
                boxShadow:
                  "0 2px 6px rgba(0, 0, 0, 0.08)",
                cursor: "pointer",
                color: "#4B4B4B",
                "&:hover": {
                  backgroundColor:
                    websiteSettings.lightColor,

                  color:
                    websiteSettings.darkColor,

                  boxShadow:
                    "0 3px 9px rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              {isExpanded ? (
                <KeyboardDoubleArrowLeftIcon
                  sx={{
                    fontSize: 19,
                  }}
                />
              ) : (
                <KeyboardDoubleArrowRightIcon
                  sx={{
                    fontSize: 19,
                  }}
                />
              )}
            </Box>
          </Box>
        )}

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
            height: isMobile ? '100vh' : 'calc(100vh - 60px)',
            boxSizing: 'border-box',
            border: "none",
            bgcolor: websiteSettings.backgroundColor,
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
            overflow: 'hidden',
          },
        }}
        anchor="left"
      >
        {isSubmenuOpen && (
          <AppScrollbar style={{ width: '100%', height: '100%' }}>
            <SubMenuPage active={selectedActive} />
          </AppScrollbar>
        )}
      </Drawer>
    </Box>
  );
}

export default SideBarPage;
