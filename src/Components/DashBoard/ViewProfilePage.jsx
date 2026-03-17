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

const COLORS = {
    teal:   { main: '#0891B2', bg: '#F0F9FA' },
    green:  { main: '#22C55E', bg: '#F1F8F4' },
    orange: { main: '#F97316', bg: '#FFF8F0' },
    pink:   { main: '#E91E63', bg: '#FFF0F5' },
    purple: { main: '#7C3AED', bg: '#EDE9FE' },
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
                params: { RollNumber: rollNumber },
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

    const typeColors = userTypeColor[userType] || { main: '#64748B', bg: '#F1F5F9' };
    const displayName = staffInfo?.staffNameInEnglish || '—';
    const designation = staffInfo?.staffDesignation || null;

    // Reusable chip row — label left, value right (matches existing ViewStaffDetails pattern)
    const ChipRow = ({ label, value, icon: Icon, iconColor }) => (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            my: 1,
            px: 2,
            py: 1.2,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            border: '1px solid #e0e0e0',
            transition: 'all 0.2s ease',
            '&:hover': {
                transform: 'translateX(4px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                borderColor: '#bdbdbd',
            },
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {Icon && <Icon sx={{ fontSize: 17, color: iconColor || '#888' }} />}
                <Typography sx={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>
                    {label}
                </Typography>
            </Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                {value || '—'}
            </Typography>
        </Box>
    );

    return (
        <Box sx={{
            border: '1px solid #ccc',
            borderRadius: '20px',
            p: 2,
            height: '86vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FAFAFA',
        }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            {/* Header — matches PayrollOverview / LeaveAttendanceMainPage pattern */}
            <Box sx={{ flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <IconButton onClick={() => navigate(-1)} size="small">
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
                            My Profile
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#888', mt: 0.2 }}>
                            Logged-in user details and information
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
            </Box>

            {/* Scrollable content */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <Grid container spacing={2.5}>

                    {/* ── Left column: Profile card ── */}
                    <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                        <Card sx={{
                            borderRadius: '16px',
                            overflow: 'visible',
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                            bgcolor: '#fff',
                        }}>
                            {/* Banner */}
                            <Box sx={{
                                height: 110,
                                background: 'linear-gradient(135deg, #0891B2 0%, #0e7490 60%, #164e63 100%)',
                                borderRadius: '16px 16px 0 0',
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                <Box sx={{
                                    position: 'absolute', top: -15, right: -15,
                                    width: 90, height: 90, borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.07)',
                                }} />
                                <Box sx={{
                                    position: 'absolute', bottom: -20, left: 20,
                                    width: 60, height: 60, borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.07)',
                                }} />
                            </Box>

                            {/* Avatar — overlapping banner */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: '-52px', position: 'relative', zIndex: 2 }}>
                                <Box sx={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    border: '4px solid #fff',
                                    boxShadow: '0 4px 16px rgba(8,145,178,0.2)',
                                    overflow: 'hidden',
                                    bgcolor: '#F0F9FA',
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
                                        <AccountCircleIcon sx={{ fontSize: 70, color: '#0891B2' }} />
                                    )}
                                </Box>
                            </Box>

                            {/* Name + chips */}
                            <Box sx={{ textAlign: 'center', px: 2, pt: 1.5, pb: 3 }}>
                                <Typography sx={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', lineHeight: 1.3 }}>
                                    {displayName}
                                </Typography>
                                {designation && (
                                    <Typography sx={{ fontSize: '12px', color: '#888', mt: 0.5, mb: 1.2 }}>
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
                                            border: `1px solid ${typeColors.main}44`,
                                        }}
                                    />
                                    {staffInfo?.staffCategory && (
                                        <Chip
                                            label={staffInfo.staffCategory.charAt(0).toUpperCase() + staffInfo.staffCategory.slice(1)}
                                            size="small"
                                            sx={{
                                                bgcolor: COLORS.purple.bg,
                                                color: COLORS.purple.main,
                                                fontWeight: 600,
                                                fontSize: '11px',
                                                border: `1px solid ${COLORS.purple.main}44`,
                                            }}
                                        />
                                    )}
                                </Box>

                                <Divider sx={{ my: 2, borderColor: '#f0f0f0' }} />

                                {/* Roll number highlight */}
                                <Box sx={{
                                    bgcolor: COLORS.teal.bg,
                                    border: `1px solid ${COLORS.teal.main}33`,
                                    borderRadius: '10px',
                                    py: 1.2,
                                    px: 2,
                                }}>
                                    <Typography sx={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Roll Number
                                    </Typography>
                                    <Typography sx={{ fontSize: '16px', fontWeight: 800, color: COLORS.teal.main, mt: 0.3 }}>
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
                                borderRadius: '16px',
                                border: '1px solid #e0e0e0',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                                bgcolor: '#fff',
                            }}>
                                <CardContent sx={{ p: '20px !important' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <Box sx={{
                                            width: 32, height: 32, borderRadius: '8px',
                                            bgcolor: COLORS.pink.bg,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <PersonIcon sx={{ fontSize: 18, color: COLORS.pink.main }} />
                                        </Box>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>
                                            Personal Information
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 1, borderColor: '#f0f0f0' }} />
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
                                borderRadius: '16px',
                                border: '1px solid #e0e0e0',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                                bgcolor: '#fff',
                            }}>
                                <CardContent sx={{ p: '20px !important' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <Box sx={{
                                            width: 32, height: 32, borderRadius: '8px',
                                            bgcolor: COLORS.teal.bg,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <WorkIcon sx={{ fontSize: 18, color: COLORS.teal.main }} />
                                        </Box>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>
                                            Professional Information
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 1, borderColor: '#f0f0f0' }} />
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
