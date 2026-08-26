import React, { useState } from 'react';
import { Box, List, ListItem, ListItemText, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useDispatch, useSelector } from 'react-redux';
import { closeMainMenu } from '../../Redux/Slices/MainMenuSlice';
import { closeSubmenu } from '../../Redux/Slices/SubMenuController';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';
import { selectCommunicationActivePaths, selectAcademicsActivePaths } from '../../Redux/Slices/PathSlice';
import { findSubMenuPermissions } from '../../Redux/Slices/AuthSlice';

function SubMenuPage({active}) {
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const canViewComm = (subMenu) => (findSubMenuPermissions(user.permissions, "communication", subMenu) || {}).view === "Y";

    const communicationMenuItems = [
        ...(canViewComm("dashboard") ? [{ path: '/dashboardmenu/com-dashboard', label: 'Dashboard' }] : []),
        ...(canViewComm("news") ? [{ path: '/dashboardmenu/news', label: 'News' }] : []),
        ...(canViewComm("message") ? [{ path: '/dashboardmenu/messages', label: 'Messages' }] : []),
        ...(canViewComm("circular") ? [{ path: '/dashboardmenu/circulars', label: 'Circulars' }] : []),
        { path: '/dashboardmenu/consentforms', label: 'Consent Forms' },
        ...(canViewComm("contactdetails") ? [{ path: '/dashboardmenu/contact', label: 'Contact Details' }] : []),
        ...(canViewComm("schoolcalender") ? [{ path: '/dashboardmenu/schoolcalendar', label: 'School Calendar' }] : []),
        ...(canViewComm("birthdaypost") ? [{ path: '/dashboardmenu/birthday-post', label: 'Birthday Post' }] : []),
        ...(canViewComm("feedback") ? [{ path: '/dashboardmenu/feedback', label: 'Feedback' }] : []),
        ...((findSubMenuPermissions(user.permissions, "communication", "notification") || {}).create === "Y" ? [{ path: '/dashboardmenu/notification', label: 'Notification' }] : []),
        { path: '/dashboardmenu/chats', label: 'Chats' },
    ];

    // Academics reuses the existing "communication > *" permission keys - the
    // split is a display grouping, so no backend change is needed.
    const academicsMenuItems = [
        ...(canViewComm("timetable") ? [{ path: '/dashboardmenu/timetables', label: 'Timetables' }] : []),
        ...(canViewComm("homework") ? [{ path: '/dashboardmenu/homework', label: 'Homework' }] : []),
        ...(canViewComm("examtimetable") ? [{ path: '/dashboardmenu/examtimetables', label: 'Exam Timetables' }] : []),
        ...(canViewComm("studymaterial") ? [{ path: '/dashboardmenu/studymaterials', label: 'Study Materials' }] : []),
        ...(canViewComm("marks") ? [{ path: '/dashboardmenu/marks', label: 'Marks' }] : []),
        ...(canViewComm("attendance") ? [{ path: '/dashboardmenu/attendance', label: 'Attendance' }] : []),
        // Online Quiz - ungated until the backend adds a permission key for it.
        // Swap to canViewComm("onlinequiz") once the key exists in the login response.
        { path: '/dashboardmenu/assessment/online-quiz', label: 'Online Quiz' },
    ];

    const transportMenuItems = [
        { path: '/dashboardmenu/news', label: 'bus'},
        { path: '/dashboardmenu/messages', label: 'car'},
        { path: '/dashboardmenu/circulars', label: 'location'},
        { path: '/dashboardmenu/consentforms', label: ' Forms'},
    ];

    const extraMenuItems = [
    ];

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const theme = useTheme();
   
    const isActive = (path) => location.pathname.includes(path);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const websiteSettings = useSelector(selectWebsiteSettings);
    const communicationActivePaths = useSelector(selectCommunicationActivePaths)
    const academicsActivePaths = useSelector(selectAcademicsActivePaths)
    const isCommunicationPathActive = () => communicationActivePaths.some(path => isActive(path));
    const isAcademicsPathActive = () => academicsActivePaths.some(path => isActive(path));

    const handleMenuClick = (menu) => {
        if (!isMobile) {
            navigate(`/dashboardmenu/${menu}`);
        }
        else {
            navigate(`/dashboardmenu/${menu}`);
            dispatch(closeMainMenu());
            dispatch(closeSubmenu());
        }

    };

    const menuItems = (() => {
        if (active === "academics" || isAcademicsPathActive()) {
            return academicsMenuItems;
        }
        if (active === "communication" || isCommunicationPathActive()) {
            return communicationMenuItems;
        }
        return extraMenuItems;
    })();
    
    return (
        <Box
            sx={{
                backgroundColor: '#fff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                transition: 'width 0.3s ease-in-out',
            }}
        >
            <List sx={{ width: '100%' }}>
                {/* <Typography sx={{ fontWeight: "600", pl: 3, fontSize: "16px" }}>
                    Communication
                </Typography> */}

                {/* Render Menu Items */}
                {menuItems.map(({ path, label, count }) => (
                    <ListItem key={path} onClick={() => handleMenuClick(path.replace('/dashboardmenu/', ''))} sx={{
                        borderRadius: 2, paddingTop: '5px',
                        paddingBottom: '5px',
                    }}>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: "center",
                                alignItems: 'center',
                                paddingTop: '0px',
                                paddingBottom: '0px',
                                borderRadius: '5px',
                                width: '100%',
                                boxShadow: isActive(path) ? '1px 1px 2px 0.5px rgba(0, 0, 0, 0.4)' : 'inherit',
                                backgroundColor: isActive(path) ? websiteSettings.mainColor : 'inherit',
                                color: isActive(path) ? websiteSettings.textColor : '#ababab',
                                position: 'relative',
                                '&:hover': { backgroundColor: isActive(path) ? "" : websiteSettings.lightColor, color: isActive(path) ? websiteSettings.textColor : "#000" },
                                cursor: "pointer"
                            }}
                        >
                            <Box
                                sx={{
                                    width: '5px',
                                    backgroundColor: isActive(path) ? websiteSettings.darkColor : 'inherit',
                                    height: '100%',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    borderTopLeftRadius: '5px',
                                    borderBottomLeftRadius: '5px',
                                }}
                            />
                            <ListItemText>
                                <Typography sx={{ pl: 2, fontSize: '15px' }}>
                                    {label}
                                </Typography>
                            </ListItemText>
                            <Box pr={1} sx={{ paddingTop: "2px" }}>
                                <KeyboardArrowRightIcon />
                            </Box>
                        </Box>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default SubMenuPage;
