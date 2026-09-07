import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider, Card, CardContent, IconButton, Chip, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import WcIcon from '@mui/icons-material/Wc';
import CakeIcon from '@mui/icons-material/Cake';
import WorkIcon from '@mui/icons-material/Work';
import CategoryIcon from '@mui/icons-material/Category';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FindStaffManagementDetails } from '../../Api/Api';
import SnackBar from '../SnackBar';
import { DASH, RADIUS } from '../DashBoardComps/dashboardTheme';

const COLORS = {
    teal:   { main: DASH.cyan,   bg: DASH.cyanLight },
    green:  { main: DASH.green,  bg: DASH.greenLight },
    orange: { main: DASH.amber,  bg: DASH.amberLight },
    pink:   { main: DASH.pink,   bg: DASH.pinkLight },
    purple: { main: DASH.violet, bg: DASH.violetLight },
};

const userTypeColor = {
    superadmin: COLORS.purple,
    admin:      COLORS.teal,
    staff:      COLORS.orange,
    teacher:    COLORS.green,
};

export default function ViewProfilePage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const { rollNumber, userType } = user;
    const token = "123";

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [staffInfo, setStaffInfo] = useState(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        fetchStaffDetails();
    }, []);

    const fetchStaffDetails = async () => {
        try {
            const res = await axios.get(FindStaffManagementDetails, {
                params: { rollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.staffinfo && res.data.staffinfo.length > 0) {
                setStaffInfo(res.data.staffinfo[0]);
            }
        } catch (error) {
            console.log(error);
            setMessage("Failed to load profile details");
            setOpen(true); setColor(false); setStatus(false);
        }
    };

    const typeColors = userTypeColor[userType] || { main: DASH.muted, bg: DASH.lineSoft };
    const displayName = staffInfo?.staffNameInEnglish || '—';
    const designation = staffInfo?.staffDesignation || null;

    // Reusable chip row — label left, value right (matches existing ViewStaffDetails pattern)
    const ChipRow = ({ label, value, icon: Icon, iconColor }) => (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            my: 0.8,
            px: 1.6,
            py: 1.1,
            borderRadius: RADIUS,
            backgroundColor: DASH.surface,
            border: `1px solid ${DASH.line}`,
            transition: 'background-color .2s ease, border-color .2s ease',
            '&:hover': {
                backgroundColor: '#fff',
                borderColor: DASH.faint,
            },
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {Icon && <Icon sx={{ fontSize: 17, color: iconColor || DASH.faint }} />}
                <Typography sx={{ fontSize: '12.5px', color: DASH.muted, fontWeight: 500 }}>
                    {label}
                </Typography>
            </Box>
            <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: DASH.ink, textAlign: 'right', ml: 1.5 }}>
                {value || '—'}
            </Typography>
        </Box>
    );

    return (
        <Box sx={{
            px: { xs: 1.5, md: 3 },
            pt: { xs: 1.5, md: 2 },
            pb: 4,
            height: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: DASH.canvas,
        }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            {/* Header — matches PayrollOverview / LeaveAttendanceMainPage pattern */}
            <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ width: 28, height: 28 }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: DASH.ink }} />
                </IconButton>
                <Box sx={{ ml: 1 }}>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                        My Profile
                    </Typography>
                    <Typography sx={{ fontSize: '11.5px', color: DASH.muted, whiteSpace: 'nowrap' }}>
                        Logged-in user details and information
                    </Typography>
                </Box>
            </Box>

            {/* Scrollable content */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <Grid container spacing={2.5}>

                    {/* ── Left column: Profile card ── */}
                    <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                        <Card sx={{
                            borderRadius: '10px',
                            overflow: 'visible',
                            border: `1px solid ${DASH.line}`,
                            boxShadow: '0 1px 3px rgba(16,24,40,0.06)',
                            bgcolor: '#fff',
                        }}>
                            {/* Banner */}
                            <Box sx={{
                                height: 96,
                                backgroundColor: typeColors.main,
                                borderRadius: '10px 10px 0 0',
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                <Box sx={{
                                    position: 'absolute', top: -15, right: -15,
                                    width: 90, height: 90, borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.14)',
                                }} />
                                <Box sx={{
                                    position: 'absolute', bottom: -20, left: 20,
                                    width: 60, height: 60, borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.14)',
                                }} />
                            </Box>

                            {/* Avatar — overlapping banner */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: '-52px', position: 'relative', zIndex: 2 }}>
                                <Box sx={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    border: '4px solid #fff',
                                    boxShadow: '0 2px 8px rgba(16,24,40,0.10)',
                                    overflow: 'hidden',
                                    bgcolor: typeColors.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {!imageError && staffInfo?.staffPassportSizePhotofilepath ? (
                                        <img
                                            src={staffInfo.staffPassportSizePhotofilepath}
                                            alt="profile"
                                            width={100}
                                            height={100}
                                            style={{ objectFit: 'cover' }}
                                            onError={() => setImageError(true)}
                                        />
                                    ) : (
                                        <AccountCircleIcon sx={{ fontSize: 70, color: typeColors.main }} />
                                    )}
                                </Box>
                            </Box>

                            {/* Name + chips */}
                            <Box sx={{ textAlign: 'center', px: 2, pt: 1.5, pb: 3 }}>
                                <Typography sx={{ fontSize: '17px', fontWeight: 700, color: DASH.ink, lineHeight: 1.3 }}>
                                    {displayName}
                                </Typography>
                                {designation && (
                                    <Typography sx={{ fontSize: '12px', color: DASH.muted, mt: 0.5, mb: 1.2 }}>
                                        {designation}
                                    </Typography>
                                )}
                                <Box sx={{ display: 'flex', gap: 1, mt: designation ? 0 : 1.2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <Chip
                                        label={userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : '—'}
                                        size="small"
                                        sx={{
                                            bgcolor: typeColors.bg,
                                            color: typeColors.main,
                                            fontWeight: 700,
                                            fontSize: '11px',
                                            border: `1px solid ${typeColors.main}3D`,
                                        }}
                                    />
                                    {staffInfo?.staffCategory && (
                                        <Chip
                                            label={staffInfo.staffCategory.charAt(0).toUpperCase() + staffInfo.staffCategory.slice(1)}
                                            size="small"
                                            sx={{
                                                bgcolor: '#fff',
                                                color: DASH.text,
                                                fontWeight: 600,
                                                fontSize: '11px',
                                                border: `1px solid ${DASH.line}`,
                                            }}
                                        />
                                    )}
                                </Box>

                                <Divider sx={{ my: 2, borderColor: DASH.lineSoft }} />

                                {/* Roll number highlight */}
                                <Box sx={{
                                    bgcolor: DASH.surface,
                                    border: `1px solid ${DASH.line}`,
                                    borderRadius: RADIUS,
                                    py: 1.2,
                                    px: 2,
                                }}>
                                    <Typography sx={{ fontSize: '10px', color: DASH.faint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Roll Number
                                    </Typography>
                                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: DASH.ink, fontFamily: 'monospace', mt: 0.4 }}>
                                        {staffInfo?.staffRollNumber || rollNumber || '—'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>

                    {/* ── Right column: info sections ── */}
                    <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                            {/* Personal Information */}
                            <Card sx={{
                                borderRadius: '10px',
                                border: `1px solid ${DASH.line}`,
                                boxShadow: '0 1px 3px rgba(16,24,40,0.06)',
                                bgcolor: '#fff',
                            }}>
                                <CardContent sx={{ p: '20px !important' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <Box sx={{
                                            width: 30, height: 30, borderRadius: RADIUS,
                                            bgcolor: COLORS.pink.bg,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <PersonIcon sx={{ fontSize: 18, color: COLORS.pink.main }} />
                                        </Box>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: DASH.ink }}>
                                            Personal Information
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 1, borderColor: DASH.lineSoft }} />
                                    <ChipRow
                                        label="Full Name"
                                        value={staffInfo?.staffNameInEnglish}
                                        icon={PersonIcon}
                                        iconColor={COLORS.teal.main}
                                    />
                                    <ChipRow
                                        label="Date of Birth"
                                        value={staffInfo?.dateOfBirth}
                                        icon={CakeIcon}
                                        iconColor={COLORS.orange.main}
                                    />
                                    <ChipRow
                                        label="Gender"
                                        value={staffInfo?.gender}
                                        icon={WcIcon}
                                        iconColor={COLORS.pink.main}
                                    />
                                </CardContent>
                            </Card>

                            {/* Professional Information */}
                            <Card sx={{
                                borderRadius: '10px',
                                border: `1px solid ${DASH.line}`,
                                boxShadow: '0 1px 3px rgba(16,24,40,0.06)',
                                bgcolor: '#fff',
                            }}>
                                <CardContent sx={{ p: '20px !important' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <Box sx={{
                                            width: 30, height: 30, borderRadius: RADIUS,
                                            bgcolor: COLORS.teal.bg,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <WorkIcon sx={{ fontSize: 18, color: COLORS.teal.main }} />
                                        </Box>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: DASH.ink }}>
                                            Professional Information
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 1, borderColor: DASH.lineSoft }} />
                                    <ChipRow
                                        label="Staff Category"
                                        value={staffInfo?.staffCategory
                                            ? staffInfo.staffCategory.charAt(0).toUpperCase() + staffInfo.staffCategory.slice(1)
                                            : null}
                                        icon={CategoryIcon}
                                        iconColor={COLORS.purple.main}
                                    />
                                    <ChipRow
                                        label="Designation"
                                        value={staffInfo?.staffDesignation}
                                        icon={WorkIcon}
                                        iconColor={COLORS.green.main}
                                    />
                                    <ChipRow
                                        label="User Type"
                                        value={userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : null}
                                        icon={AdminPanelSettingsIcon}
                                        iconColor={typeColors.main}
                                    />
                                    <ChipRow
                                        label="Roll Number"
                                        value={staffInfo?.staffRollNumber || rollNumber}
                                        icon={BadgeIcon}
                                        iconColor={COLORS.teal.main}
                                    />
                                </CardContent>
                            </Card>

                        </Box>
                    </Grid>

                </Grid>
            </Box>
        </Box>
    );
}
