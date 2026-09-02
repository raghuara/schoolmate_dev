import React, { useEffect, useState } from 'react';
import {
  Box, IconButton, useMediaQuery, useTheme, Typography, Dialog, DialogActions,
  Button, Tooltip, tooltipClasses, Autocomplete, TextField, Avatar, Badge, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Popover,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

import { toggleMainMenu } from '../../Redux/Slices/MainMenuSlice';
import productLogo from '../../Images/Login/SchoolMate Logo.png';
import { closeSubmenu } from '../../Redux/Slices/SubMenuController';
import { logout, hasMainMenuAccess } from '../../Redux/Slices/AuthSlice';
import { selectChatUnreadTotal } from '../../Redux/Slices/chatSlice';
import { DashboardUsers } from '../../Api/Api';
import { fetchComplaintNotifications } from '../ComplaintsComps/complaintsDetailApi';
import {
  fetchAcademicYearConfig,
  setSelectedAcademicYear,
  selectAcademicYear,
  selectAcademicYearOptions,
  selectAcademicYearMeta,
} from '../../Redux/Slices/academicYearSlice';

const HEADER_HEIGHT = 60;

const SUPPORT = {
  email: 'hello@araschoolmate.com',
  phone: '+91 81100 151152',
  hours: 'Monday to Friday, 10:00 AM - 6:00 PM',
};


/* Complaint alerts for the signed-in user.

   The bell previously showed three hardcoded examples. They are gone: an alert that is not
   real is worse than an empty bell, because it invites someone to act on it. Complaints is
   the only module with a notifications endpoint today, so that is what the bell carries —
   as other modules gain one, they join the same list.

   Every failure is silent. A header that throws takes down every screen behind it, and a
   missed notification is not worth that risk. */
const toBellRow = (n) => ({
  id: `complaint-${n.id}`,
  icon: SupportAgentOutlinedIcon,
  color: '#D97706',
  bg: '#FFFBEB',
  title: n.title,
  body: n.body,
  time: n.at ? new Date(n.at).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '',
  unread: n.unread,
  complaintToken: n.complaintToken,
});

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'black',
    color: 'white',
    fontSize: '0.8rem',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'black',
  },
});

const iconButtonSx = {
  width: 38,
  height: 38,
  borderRadius: '5px',
  color: '#4B5563',
  border: '1px solid #E5E7EB',
  '&:hover': { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
};

const initialsOf = (value) =>
  String(value || '')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

function DashbrdHeader() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));

  const isMainMenuOpen = useSelector((state) => state.menu.isMainMenuOpen);
  const auth = useSelector((state) => state.auth);
  const chatUnread = useSelector(selectChatUnreadTotal);
  const selectedAcademicYear = useSelector(selectAcademicYear);
  const academicYearOptions = useSelector(selectAcademicYearOptions);
  const academicYearMeta = useSelector(selectAcademicYearMeta);

  const canOpenSettings = hasMainMenuAccess(auth.permissions, 'accesscontrol');

  const [userDetails, setUserDetails] = useState({});
  const [imageError, setImageError] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifyAnchor, setNotifyAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    dispatch(fetchAcademicYearConfig());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    fetchComplaintNotifications({ page: 1, pageSize: 50 })
      .then((result) => {
        if (cancelled || !result.ok) return;
        setNotifications(result.rows.map(toBellRow));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await axios.get(DashboardUsers, {
          params: { rollNumber: auth.rollNumber, userType: auth.userType },
          headers: { Authorization: `Bearer 123` },
        });
        if (active) setUserDetails(res.data.userDetails || {});
      } catch (error) {
        if (active) setUserDetails({});
      }
    };
    if (auth.rollNumber) load();
    return () => { active = false; };
  }, [auth.rollNumber, auth.userType]);

  const displayName = userDetails.username || auth.name || 'User';
  const displayType = userDetails.usertype || auth.userType || '';

  const academicYearWindowLabel = (() => {
    if (!selectedAcademicYear || !academicYearMeta?.startMonthName || !academicYearMeta?.endMonthName) {
      return '';
    }
    const parts = String(selectedAcademicYear).split('-').map((s) => Number(s.trim()));
    if (parts.length === 1 && Number.isFinite(parts[0])) {
      return `${academicYearMeta.startMonthName} ${parts[0]} - ${academicYearMeta.endMonthName} ${parts[0]}`;
    }
    if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
      return `${academicYearMeta.startMonthName} ${parts[0]} - ${academicYearMeta.endMonthName} ${parts[1]}`;
    }
    return '';
  })();

  const handleToggleSidebar = () => {
    dispatch(toggleMainMenu());
    dispatch(closeSubmenu());
  };

  const goProfile = () => {
    setProfileAnchor(null);
    navigate('/dashboardmenu/view-profile');
  };

  const goSettings = () => {
    setProfileAnchor(null);
    navigate('/dashboardmenu/access');
  };

  const openHelp = () => {
    setProfileAnchor(null);
    setHelpOpen(true);
  };

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const handleConfirmLogout = () => {
    setLogoutOpen(false);
    navigate('/');
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
        height: `${HEADER_HEIGHT}px`,
        zIndex: 1201,
        borderBottom: '1px solid #E5E7EB',
        pl: { xs: 1.5, md: 3 },
        pr: { xs: 1.5, md: 2 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <img src={productLogo} width="150px" alt="SchoolMate" style={{ display: 'block' }} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, md: 1.2 } }}>
        {academicYearOptions && academicYearOptions.length > 0 && (
          <CustomTooltip
            title={academicYearWindowLabel ? `Academic year window: ${academicYearWindowLabel}` : ''}
            arrow
            placement="bottom"
          >
            <Autocomplete
              size="small"
              disableClearable
              options={academicYearOptions}
              sx={{ width: isCompact ? 130 : 168 }}
              value={
                selectedAcademicYear && academicYearOptions.includes(selectedAcademicYear)
                  ? selectedAcademicYear
                  : null
              }
              onChange={(_, newValue) => newValue && dispatch(setSelectedAcademicYear(newValue))}
              renderInput={(params) => (
                <TextField
                  placeholder="Academic Year"
                  {...params}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '5px',
                      fontSize: 13.5,
                      height: 38,
                      backgroundColor: '#F9FAFB',
                      '& fieldset': { borderColor: '#E5E7EB' },
                      '&:hover fieldset': { borderColor: '#D1D5DB' },
                    },
                    '& .MuiOutlinedInput-input': { textAlign: 'center', fontWeight: 600 },
                  }}
                />
              )}
            />
          </CustomTooltip>
        )}

        {isMobile && (
          <IconButton onClick={handleToggleSidebar} sx={iconButtonSx}>
            {isMainMenuOpen ? <CloseIcon sx={{ fontSize: 20 }} /> : <MenuIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        )}

        <CustomTooltip title="Notifications" arrow placement="bottom">
          <IconButton onClick={(e) => setNotifyAnchor(e.currentTarget)} sx={iconButtonSx}>
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{ '& .MuiBadge-badge': { fontSize: 9.5, height: 16, minWidth: 16, fontWeight: 700 } }}
            >
              <NotificationsNoneRoundedIcon sx={{ fontSize: 21 }} />
            </Badge>
          </IconButton>
        </CustomTooltip>

        <CustomTooltip title="Chats" arrow placement="bottom">
          <IconButton onClick={() => navigate('/dashboardmenu/chats')} sx={iconButtonSx}>
            <Badge
              badgeContent={chatUnread}
              color="error"
              sx={{ '& .MuiBadge-badge': { fontSize: 9.5, height: 16, minWidth: 16, fontWeight: 700 } }}
            >
              <ForumRoundedIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </CustomTooltip>

        <CustomTooltip title="Help & Support" arrow placement="bottom">
          <IconButton onClick={() => setHelpOpen(true)} sx={iconButtonSx}>
            <HelpOutlineRoundedIcon sx={{ fontSize: 21 }} />
          </IconButton>
        </CustomTooltip>

        <Box sx={{ width: '1px', height: 26, bgcolor: '#E5E7EB', mx: { xs: 0.2, md: 0.6 } }} />

        <Box
          onClick={(e) => setProfileAnchor(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pl: 0.5,
            pr: 0.8,
            py: 0.5,
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': { backgroundColor: '#F3F4F6' },
          }}
        >
          <Avatar
            src={!imageError && userDetails.filepath ? userDetails.filepath : undefined}
            onError={() => setImageError(true)}
            sx={{
              width: 34,
              height: 34,
              fontSize: 13,
              fontWeight: 700,
              bgcolor: '#FCBE3A',
              color: '#000',
            }}
          >
            {initialsOf(displayName)}
          </Avatar>
          {!isCompact && (
            <Box sx={{ minWidth: 0, maxWidth: 150 }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#111827',
                  lineHeight: 1.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#6B7280', lineHeight: 1.25 }}>
                {displayType}
              </Typography>
            </Box>
          )}
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 19, color: '#9CA3AF' }} />
        </Box>
      </Box>

      <Popover
        open={Boolean(notifyAnchor)}
        anchorEl={notifyAnchor}
        onClose={() => setNotifyAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 340,
              borderRadius: '5px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 8px 28px rgba(17,24,39,0.12)',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.4, borderBottom: '1px solid #F3F4F6' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              onClick={markAllRead}
              sx={{ textTransform: 'none', fontSize: 12, fontWeight: 700, color: '#4A6CF7', minWidth: 0, p: 0.3 }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Box sx={{ maxHeight: 340, overflowY: 'auto' }}>
          {notifications.length === 0 && (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <NotificationsNoneRoundedIcon sx={{ fontSize: 34, color: '#D1D5DB' }} />
              <Typography sx={{ fontSize: 13, color: '#6B7280', mt: 0.5 }}>
                You are all caught up
              </Typography>
            </Box>
          )}
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <Box
                key={n.id}
                sx={{
                  display: 'flex',
                  gap: 1.3,
                  px: 2,
                  py: 1.4,
                  cursor: 'pointer',
                  borderBottom: '1px solid #F9FAFB',
                  bgcolor: n.unread ? '#FAFAFF' : '#fff',
                  '&:hover': { bgcolor: '#F3F4F6' },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '5px',
                    bgcolor: n.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 18, color: n.color }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {n.title}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>
                    {n.body}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#9CA3AF', mt: 0.3 }}>
                    {n.time}
                  </Typography>
                </Box>
                {n.unread && (
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#EF4444', mt: 0.7, flexShrink: 0 }} />
                )}
              </Box>
            );
          })}
        </Box>
      </Popover>

      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 250,
              borderRadius: '5px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 8px 28px rgba(17,24,39,0.12)',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.3, px: 2, py: 1.6 }}>
          <Avatar
            src={!imageError && userDetails.filepath ? userDetails.filepath : undefined}
            sx={{ width: 40, height: 40, fontSize: 14, fontWeight: 700, bgcolor: '#FCBE3A', color: '#000' }}
          >
            {initialsOf(displayName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>
              {displayType}
            </Typography>
            {auth.rollNumber && (
              <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>
                {auth.rollNumber}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider />

        <MenuItem onClick={goProfile} sx={{ py: 1.1 }}>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <PersonOutlineRoundedIcon sx={{ fontSize: 19, color: '#4B5563' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 13.5, color: '#111827' }}>
            My Profile
          </ListItemText>
        </MenuItem>

        {canOpenSettings && (
          <MenuItem onClick={goSettings} sx={{ py: 1.1 }}>
            <ListItemIcon sx={{ minWidth: 34 }}>
              <SettingsOutlinedIcon sx={{ fontSize: 19, color: '#4B5563' }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13.5, color: '#111827' }}>
              Settings
            </ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={openHelp} sx={{ py: 1.1 }}>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <HelpOutlineRoundedIcon sx={{ fontSize: 19, color: '#4B5563' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 13.5, color: '#111827' }}>
            Help & Support
          </ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => { setProfileAnchor(null); setLogoutOpen(true); }}
          sx={{ py: 1.1, '&:hover': { bgcolor: '#FEF2F2' } }}
        >
          <ListItemIcon sx={{ minWidth: 34 }}>
            <LogoutIcon sx={{ fontSize: 18, color: '#DC2626' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 13.5, fontWeight: 600, color: '#DC2626' }}>
            Logout
          </ListItemText>
        </MenuItem>
      </Menu>

      <HelpCenterDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />

      <Dialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: '5px', width: 380, maxWidth: '92vw' } } }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 1, textAlign: 'center' }}>
          <Box
            sx={{
              width: 52, height: 52, borderRadius: '50%', bgcolor: '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5,
            }}
          >
            <LogoutIcon sx={{ fontSize: 24, color: '#DC2626' }} />
          </Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
            Log out of SchoolMate?
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#6B7280', mt: 0.6 }}>
            You will need to sign in again to continue.
          </Typography>
        </Box>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={() => setLogoutOpen(false)}
            fullWidth
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '5px', color: '#111827', border: '1px solid #E5E7EB', py: 0.9 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLogout}
            fullWidth
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '5px', bgcolor: '#DC2626', boxShadow: 'none', py: 0.9, '&:hover': { bgcolor: '#B91C1C' } }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DashbrdHeader;
