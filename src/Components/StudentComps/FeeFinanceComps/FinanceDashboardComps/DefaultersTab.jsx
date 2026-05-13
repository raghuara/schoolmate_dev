import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Tooltip,
    Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InboxIcon from '@mui/icons-material/Inbox';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { defaulters, sendFeeReminder, getLastFeeReminder } from '../../../../Api/Api';
import axios from 'axios';
import SnackBar from '../../../SnackBar';

const token = "123";

const formatAmount = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString()}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
    });
};

const formatRelative = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
};

const getReminderColor = (dateStr) => {
    if (!dateStr) return { bg: '#F5F5F5', color: '#999', border: '#E0E0E0' };
    const diffDays = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return { bg: '#F0FDF4', color: '#16A34A', border: '#86EFAC' };
    if (diffDays <= 7) return { bg: '#FEF3C7', color: '#CA8A04', border: '#FDE68A' };
    return { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' };
};

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
};

const avatarColors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];
const getAvatarColor = (str) => {
    if (!str) return avatarColors[0];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
};

export default function DefaultersTab({ selectedYear }) {
    const grades = useSelector(selectGrades);
    const auth = useSelector((state) => state.auth);

    const [isLoading, setIsLoading] = useState(false);
    const [defaultersData, setDefaultersData] = useState(null);
    const [lastRemindersData, setLastRemindersData] = useState(null);
    const [selectedFeeType, setSelectedFeeType] = useState('School Fee');
    const [selectedGradeId, setSelectedGradeId] = useState(grades?.[0]?.id || null);
    const [searchText, setSearchText] = useState('');

    // Snackbar state
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');

    // Reminder modal state
    const [reminderModal, setReminderModal] = useState(false);
    const [reminderHeadline, setReminderHeadline] = useState('');
    const [reminderMsg, setReminderMsg] = useState('');
    const [reminderSending, setReminderSending] = useState(false);
    const [reminderStudent, setReminderStudent] = useState(null);

    // Reminder history modal
    const [historyModal, setHistoryModal] = useState(false);

    const selectedGrade = grades.find((g) => g.id === selectedGradeId);
    const selectedGradeSign = selectedGrade?.sign || null;

    useEffect(() => {
        fetchDefaultersData();
    }, [selectedYear, selectedFeeType, selectedGradeId]);

    useEffect(() => {
        fetchLastReminders();
    }, []);

    const fetchDefaultersData = async () => {
        setIsLoading(true);
        try {
            const params = { year: selectedYear, FeeType: selectedFeeType };
            if (selectedGradeSign) params.Grade = selectedGradeSign;
            const res = await axios.get(defaulters, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            setDefaultersData(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLastReminders = async () => {
        try {
            const res = await axios.get(getLastFeeReminder, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLastRemindersData(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    // Map: rollNumber -> latest reminder { sentDate, headLine, reminderMessage }
    const lastReminderMap = useMemo(() => {
        const map = {};
        if (!lastRemindersData?.data) return map;
        lastRemindersData.data.forEach((r) => {
            const sent = new Date(r.sentDate);
            (r.rollNumbers || []).forEach((roll) => {
                if (!map[roll] || new Date(map[roll].sentDate) < sent) {
                    map[roll] = {
                        sentDate: r.sentDate,
                        headLine: r.headLine,
                        reminderMessage: r.reminderMessage,
                    };
                }
            });
        });
        return map;
    }, [lastRemindersData]);

    // Reminders sent in last 7 days count
    const recentRemindersCount = useMemo(() => {
        if (!lastRemindersData?.data) return 0;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentRolls = new Set();
        lastRemindersData.data.forEach((r) => {
            if (new Date(r.sentDate) >= sevenDaysAgo) {
                (r.rollNumbers || []).forEach((roll) => recentRolls.add(roll));
            }
        });
        return recentRolls.size;
    }, [lastRemindersData]);

    const handleGradeChange = (newValue) => {
        setSelectedGradeId(newValue ? newValue.id : null);
    };

    const filteredDefaulters = (defaultersData?.defaulters || []).filter((d) =>
        d.name.toLowerCase().includes(searchText.toLowerCase()) ||
        d.rollNumber.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleSendReminder = async () => {
        if (!reminderMsg.trim()) return;
        if (!reminderHeadline.trim()) {
            setSnackMessage('Please enter a headline for the reminder');
            setSnackOpen(true); setSnackColor(false); setSnackStatus(false);
            return;
        }

        const rollNumbers = reminderStudent
            ? [reminderStudent.rollNumber]
            : filteredDefaulters.map((d) => d.rollNumber);

        if (rollNumbers.length === 0) {
            setSnackMessage('No students to send reminder');
            setSnackOpen(true); setSnackColor(false); setSnackStatus(false);
            return;
        }

        const payload = {
            headLine: reminderHeadline.trim(),
            message: reminderMsg.trim(),
            rollNumbers,
            postedByRollNumber: auth?.rollNumber || '',
            postedByUserType: auth?.userType || 'superadmin',
        };

        setReminderSending(true);
        try {
            const res = await axios.post(sendFeeReminder, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.data.error === false || res.status === 200) {
                setSnackMessage(
                    reminderStudent
                        ? `Reminder sent to ${reminderStudent.name}`
                        : `Reminder sent to ${rollNumbers.length} student${rollNumbers.length !== 1 ? 's' : ''}`
                );
                setSnackOpen(true); setSnackColor(true); setSnackStatus(true);
                setReminderModal(false);
                setReminderMsg('');
                setReminderHeadline('');
                setReminderStudent(null);
                fetchLastReminders();
            } else {
                throw new Error(res.data.message || 'Failed to send reminder');
            }
        } catch (error) {
            setSnackMessage(error.response?.data?.message || error.message || 'Failed to send reminder');
            setSnackOpen(true); setSnackColor(false); setSnackStatus(false);
        } finally {
            setReminderSending(false);
        }
    };

    const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, '').trim();

    return (
        <Box>
            <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '12px', bgcolor: '#FFFFFF' }}>
                        <CardContent>
                            {/* Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                                <Box>
                                    <Typography sx={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>
                                        Fee Defaulters List
                                    </Typography>
                                    <Typography sx={{ fontSize: '12px', color: '#888', mt: 0.3 }}>
                                        Track pending fees and send reminders to students & parents
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <TextField
                                        size="small"
                                        placeholder="Search student..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ fontSize: 18 }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={{ width: '220px' }}
                                    />
                                    <FormControl size="small" sx={{ minWidth: 160 }}>
                                        <InputLabel>Fee Type</InputLabel>
                                        <Select
                                            value={selectedFeeType}
                                            onChange={(e) => setSelectedFeeType(e.target.value)}
                                            label="Fee Type"
                                        >
                                            <MenuItem value="School Fee">School Fee</MenuItem>
                                            <MenuItem value="Transport Fee">Transport Fee</MenuItem>
                                            <MenuItem value="ECA Fee">ECA Fee</MenuItem>
                                            <MenuItem value="Additional Fee">Additional Fee</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Autocomplete
                                        disablePortal
                                        options={grades}
                                        getOptionLabel={(option) => option.sign}
                                        value={grades.find((item) => item.id === selectedGradeId) || null}
                                        onChange={(event, newValue) => handleGradeChange(newValue)}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        sx={{ width: '150px' }}
                                        PaperComponent={(props) => (
                                            <Paper
                                                {...props}
                                                style={{
                                                    ...props.style,
                                                    maxHeight: '150px',
                                                    backgroundColor: '#000',
                                                    color: '#fff',
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props} className="classdropdownOptions">
                                                {option.sign}
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                placeholder="Select Class"
                                                {...params}
                                                fullWidth
                                                slotProps={{
                                                    input: {
                                                        ...params.InputProps,
                                                        sx: {
                                                            paddingRight: 0,
                                                            height: '37px',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                        },
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        sx={{
                                            textTransform: 'none',
                                            bgcolor: '#DC2626',
                                            '&:hover': { bgcolor: '#B91C1C' },
                                        }}
                                    >
                                        Export
                                    </Button>
                                </Box>
                            </Box>

                            {/* Summary Cards - now 4 cards including reminders */}
                            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                    <Box sx={{
                                        p: 2, bgcolor: '#FEF2F2', borderRadius: '12px',
                                        border: '1px solid #FECACA', position: 'relative', overflow: 'hidden',
                                    }}>
                                        <Box sx={{
                                            position: 'absolute', top: 12, right: 12,
                                            width: 36, height: 36, borderRadius: '10px',
                                            bgcolor: '#DC262615', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <PeopleAltIcon sx={{ color: '#DC2626', fontSize: 20 }} />
                                        </Box>
                                        <Typography sx={{ fontSize: '11px', color: '#888', mb: 0.5, fontWeight: 600, letterSpacing: '0.4px' }}>
                                            TOTAL DEFAULTERS
                                        </Typography>
                                        <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#DC2626', lineHeight: 1.2 }}>
                                            {defaultersData?.totalDefaulters ?? '—'}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#666', mt: 0.4 }}>
                                            {defaultersData?.defaultersPercentage != null
                                                ? `${defaultersData.defaultersPercentage}% of ${defaultersData.totalStudents} students`
                                                : '—'}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                    <Box sx={{
                                        p: 2, bgcolor: '#FFF7ED', borderRadius: '12px',
                                        border: '1px solid #FED7AA', position: 'relative', overflow: 'hidden',
                                    }}>
                                        <Box sx={{
                                            position: 'absolute', top: 12, right: 12,
                                            width: 36, height: 36, borderRadius: '10px',
                                            bgcolor: '#F9731615', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <AttachMoneyIcon sx={{ color: '#F97316', fontSize: 20 }} />
                                        </Box>
                                        <Typography sx={{ fontSize: '11px', color: '#888', mb: 0.5, fontWeight: 600, letterSpacing: '0.4px' }}>
                                            TOTAL PENDING
                                        </Typography>
                                        <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#F97316', lineHeight: 1.2 }}>
                                            {defaultersData?.totalPending != null ? formatAmount(defaultersData.totalPending) : '—'}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#666', mt: 0.4 }}>
                                            {defaultersData?.avgPendingPerStudent != null
                                                ? `Avg ${formatAmount(defaultersData.avgPendingPerStudent)} per student`
                                                : '—'}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                    <Box sx={{
                                        p: 2, bgcolor: '#FFEDD5', borderRadius: '12px',
                                        border: '1px solid #FDBA74', position: 'relative', overflow: 'hidden',
                                    }}>
                                        <Box sx={{
                                            position: 'absolute', top: 12, right: 12,
                                            width: 36, height: 36, borderRadius: '10px',
                                            bgcolor: '#EA580C15', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <ErrorOutlineIcon sx={{ color: '#EA580C', fontSize: 20 }} />
                                        </Box>
                                        <Typography sx={{ fontSize: '11px', color: '#888', mb: 0.5, fontWeight: 600, letterSpacing: '0.4px' }}>
                                            OVERDUE
                                        </Typography>
                                        <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#EA580C', lineHeight: 1.2 }}>
                                            {defaultersData?.overdueCount ?? '—'}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#666', mt: 0.4 }}>
                                            {defaultersData?.overdueAmount != null
                                                ? `Amount: ${formatAmount(defaultersData.overdueAmount)}`
                                                : '—'}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                    <Box
                                        onClick={() => setHistoryModal(true)}
                                        sx={{
                                            p: 2, bgcolor: '#EEF2FF', borderRadius: '12px',
                                            border: '1px solid #C7D2FE', position: 'relative', overflow: 'hidden',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(99,102,241,0.15)' },
                                        }}
                                    >
                                        <Box sx={{
                                            position: 'absolute', top: 12, right: 12,
                                            width: 36, height: 36, borderRadius: '10px',
                                            bgcolor: '#6366F115', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <HistoryIcon sx={{ color: '#6366F1', fontSize: 20 }} />
                                        </Box>
                                        <Typography sx={{ fontSize: '11px', color: '#888', mb: 0.5, fontWeight: 600, letterSpacing: '0.4px' }}>
                                            REMINDED (LAST 7 DAYS)
                                        </Typography>
                                        <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#6366F1', lineHeight: 1.2 }}>
                                            {recentRemindersCount}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#6366F1', mt: 0.4, fontWeight: 600 }}>
                                            View history →
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Send to All button */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
                                <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                    Showing <strong>{filteredDefaulters.length}</strong> of {defaultersData?.defaulters?.length || 0} defaulters
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<HistoryIcon />}
                                        onClick={() => setHistoryModal(true)}
                                        sx={{
                                            textTransform: 'none',
                                            fontSize: '12px',
                                            borderColor: '#E0E0E0',
                                            color: '#666',
                                            '&:hover': { bgcolor: '#F5F5F5', borderColor: '#BDBDBD' },
                                        }}
                                    >
                                        Reminder History
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<NotificationsActiveIcon />}
                                        onClick={() => { setReminderHeadline(`${selectedFeeType} Reminder`); setReminderMsg(''); setReminderStudent(null); setReminderModal(true); }}
                                        sx={{
                                            textTransform: 'none',
                                            fontSize: '12px',
                                            bgcolor: '#6366F1',
                                            color: '#fff',
                                            boxShadow: 'none',
                                            '&:hover': { bgcolor: '#4F46E5' },
                                        }}
                                    >
                                        Send Reminder to All
                                    </Button>
                                </Box>
                            </Box>

                            {/* Table */}
                            {isLoading ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 1.5 }}>
                                    <CircularProgress size={36} sx={{ color: '#6366F1' }} />
                                    <Typography sx={{ fontSize: '12px', color: '#888' }}>Loading defaulters...</Typography>
                                </Box>
                            ) : (
                                <TableContainer sx={{ maxHeight: 500, border: '1px solid #F0F0F0', borderRadius: '8px' }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                {['Student Details', 'Grade & Section', 'Pending Amount', 'Fee Type', 'Due Date', 'Days Overdue', 'Last Reminded', 'Action'].map((h) => (
                                                    <TableCell key={h} sx={{ fontWeight: '700', fontSize: '11px', bgcolor: '#FAFAFA', color: '#555', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                                                        {h}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredDefaulters.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} align="center" sx={{ borderBottom: 'none' }}>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5, gap: 1 }}>
                                                            <InboxIcon sx={{ fontSize: 48, color: '#D0D0D0' }} />
                                                            <Typography sx={{ fontSize: '14px', color: '#888', fontWeight: 600 }}>
                                                                No defaulters found
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '12px', color: '#AAA' }}>
                                                                {searchText ? 'Try adjusting your search' : 'All students are up to date with payments'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredDefaulters.map((student, index) => {
                                                    const lastReminder = lastReminderMap[student.rollNumber];
                                                    const reminderColors = getReminderColor(lastReminder?.sentDate);
                                                    return (
                                                        <TableRow key={index} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                                                            {/* Student Details */}
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                                    <Avatar sx={{
                                                                        width: 34, height: 34,
                                                                        bgcolor: getAvatarColor(student.name),
                                                                        fontSize: '12px', fontWeight: 700,
                                                                    }}>
                                                                        {getInitials(student.name)}
                                                                    </Avatar>
                                                                    <Box>
                                                                        <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>
                                                                            {student.name || '—'}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: '10px', color: '#888' }}>
                                                                            #{student.rollNumber}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </TableCell>
                                                            {/* Grade & Section */}
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: '12px' }}>
                                                                    {student.grade}
                                                                    {student.section ? ` — ${student.section}` : ''}
                                                                </Typography>
                                                            </TableCell>
                                                            {/* Pending Amount */}
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: '13px', fontWeight: '700', color: '#DC2626' }}>
                                                                    ₹{student.pendingAmount.toLocaleString()}
                                                                </Typography>
                                                            </TableCell>
                                                            {/* Fee Type */}
                                                            <TableCell>
                                                                <Chip
                                                                    label={student.feeType}
                                                                    size="small"
                                                                    sx={{ fontSize: '10px', height: '20px', bgcolor: '#F0F4FF', color: '#3457D5', fontWeight: '600' }}
                                                                />
                                                            </TableCell>
                                                            {/* Due Date */}
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: '11px' }}>
                                                                    {formatDate(student.dueDate)}
                                                                </Typography>
                                                            </TableCell>
                                                            {/* Days Overdue */}
                                                            <TableCell>
                                                                {student.daysOverdue > 0 ? (
                                                                    <Chip
                                                                        label={`${student.daysOverdue} days`}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor:
                                                                                student.daysOverdue > 45 ? '#FEE2E2' :
                                                                                    student.daysOverdue > 30 ? '#FED7AA' :
                                                                                        '#FEF3C7',
                                                                            color:
                                                                                student.daysOverdue > 45 ? '#DC2626' :
                                                                                    student.daysOverdue > 30 ? '#EA580C' :
                                                                                        '#F59E0B',
                                                                            fontWeight: '600',
                                                                            fontSize: '10px',
                                                                            height: '20px',
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Chip
                                                                        label="Not overdue"
                                                                        size="small"
                                                                        sx={{ bgcolor: '#F0FDF4', color: '#22C55E', fontWeight: '600', fontSize: '10px', height: '20px' }}
                                                                    />
                                                                )}
                                                            </TableCell>
                                                            {/* Last Reminded */}
                                                            <TableCell>
                                                                {lastReminder ? (
                                                                    <Tooltip
                                                                        arrow
                                                                        title={
                                                                            <Box sx={{ p: 0.5 }}>
                                                                                <Typography sx={{ fontSize: '11px', fontWeight: 700, mb: 0.4 }}>
                                                                                    {lastReminder.headLine}
                                                                                </Typography>
                                                                                <Typography sx={{ fontSize: '10px', mb: 0.6, opacity: 0.85 }}>
                                                                                    {stripHtml(lastReminder.reminderMessage).slice(0, 120)}
                                                                                    {stripHtml(lastReminder.reminderMessage).length > 120 ? '...' : ''}
                                                                                </Typography>
                                                                                <Typography sx={{ fontSize: '10px', opacity: 0.7 }}>
                                                                                    Sent: {formatDateTime(lastReminder.sentDate)}
                                                                                </Typography>
                                                                            </Box>
                                                                        }
                                                                    >
                                                                        <Box sx={{
                                                                            display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                                            px: 1, py: 0.4, borderRadius: '6px',
                                                                            bgcolor: reminderColors.bg,
                                                                            border: `1px solid ${reminderColors.border}`,
                                                                            cursor: 'help',
                                                                        }}>
                                                                            <AccessTimeIcon sx={{ fontSize: 11, color: reminderColors.color }} />
                                                                            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: reminderColors.color }}>
                                                                                {formatRelative(lastReminder.sentDate)}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Tooltip>
                                                                ) : (
                                                                    <Chip
                                                                        label="Never"
                                                                        size="small"
                                                                        sx={{ bgcolor: '#F5F5F5', color: '#999', fontWeight: '600', fontSize: '10px', height: '20px' }}
                                                                    />
                                                                )}
                                                            </TableCell>
                                                            {/* Action */}
                                                            <TableCell>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    startIcon={<NotificationsActiveIcon sx={{ fontSize: '12px !important' }} />}
                                                                    onClick={() => {
                                                                        setReminderHeadline(`${selectedFeeType} Reminder`);
                                                                        setReminderMsg('');
                                                                        setReminderStudent({ name: student.name, rollNumber: student.rollNumber, grade: student.grade, section: student.section });
                                                                        setReminderModal(true);
                                                                    }}
                                                                    sx={{
                                                                        textTransform: 'none',
                                                                        fontSize: '10px',
                                                                        borderColor: '#6366F1',
                                                                        color: '#6366F1',
                                                                        '&:hover': { bgcolor: '#F0F0FF', borderColor: '#6366F1' },
                                                                    }}
                                                                >
                                                                    {lastReminder ? 'Remind Again' : 'Remind'}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Send Reminder Dialog */}
            <Dialog
                open={reminderModal}
                onClose={() => setReminderModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ p: 0 }}>
                    <Box sx={{
                        background: 'linear-gradient(135deg, #6366F115, #6366F105)',
                        borderBottom: '3px solid #6366F1',
                        px: 3, py: 2.5,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                width: 40, height: 40, borderRadius: '10px',
                                bgcolor: '#6366F115', border: '1px solid #6366F130',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <NotificationsActiveIcon sx={{ color: '#6366F1', fontSize: 22 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '17px', fontWeight: '800', color: '#1a1a1a' }}>
                                    {reminderStudent
                                        ? `Send Reminder to ${reminderStudent.name || 'Student'}`
                                        : 'Send Reminder to All Defaulters'}
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#888', mt: 0.2 }}>
                                    {reminderStudent
                                        ? `${reminderStudent.grade}${reminderStudent.section ? ` — ${reminderStudent.section}` : ''} · Individual reminder`
                                        : `${filteredDefaulters.length} students will receive this reminder`}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={() => setReminderModal(false)}
                            sx={{ bgcolor: '#F5F5F5', '&:hover': { bgcolor: '#EBEBEB' } }}
                        >
                            <CancelIcon sx={{ fontSize: 18, color: '#666' }} />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {/* Last reminder info banner if exists for individual student */}
                    {reminderStudent && lastReminderMap[reminderStudent.rollNumber] && (
                        <Box sx={{
                            mx: 3, mt: 2, mb: 0,
                            display: 'flex', alignItems: 'center', gap: 1,
                            bgcolor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px',
                            px: 1.5, py: 1,
                        }}>
                            <AccessTimeIcon sx={{ fontSize: 14, color: '#EA580C' }} />
                            <Typography sx={{ fontSize: '11px', color: '#9A3412' }}>
                                Last reminder sent <strong>{formatRelative(lastReminderMap[reminderStudent.rollNumber].sentDate)}</strong>
                                {' '}on {formatDateTime(lastReminderMap[reminderStudent.rollNumber].sentDate)}
                            </Typography>
                        </Box>
                    )}

                    {/* Headline */}
                    <Box sx={{ px: 3, pt: 2, pb: 1 }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#555', mb: 1, letterSpacing: '0.4px' }}>
                            HEADLINE
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="e.g. School Fee Reminder"
                            value={reminderHeadline}
                            onChange={(e) => setReminderHeadline(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px', fontSize: '13px',
                                    '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                                },
                            }}
                        />
                    </Box>

                    {/* Quick Templates */}
                    <Box sx={{ px: 3, pt: 1.5, pb: 1 }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#555', mb: 1.2, letterSpacing: '0.4px' }}>
                            QUICK TEMPLATES
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {[
                                "Dear Parent, your child's fee is pending. Please pay at the earliest.",
                                'Reminder: Fee due date has passed. Kindly clear dues to avoid late charges.',
                                'This is a gentle reminder to pay the pending school fee immediately.',
                            ].map((tpl, i) => (
                                <Chip
                                    key={i}
                                    label={`Template ${i + 1}`}
                                    size="small"
                                    onClick={() => setReminderMsg(tpl)}
                                    sx={{
                                        fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                                        bgcolor: reminderMsg === tpl ? '#6366F115' : '#F5F5F5',
                                        color: reminderMsg === tpl ? '#6366F1' : '#666',
                                        border: reminderMsg === tpl ? '1px solid #6366F140' : '1px solid #E8E8E8',
                                        '&:hover': { bgcolor: '#6366F115', color: '#6366F1' },
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Message Box */}
                    <Box sx={{ px: 3, pt: 1, pb: 1.5 }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#555', mb: 1, letterSpacing: '0.4px' }}>
                            MESSAGE
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Type your reminder message here..."
                            value={reminderMsg}
                            onChange={(e) => setReminderMsg(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px', fontSize: '13px',
                                    '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                                },
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.8 }}>
                            <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                {reminderMsg.length === 0 ? 'Write a message or pick a template above' : `${reminderMsg.length} characters`}
                            </Typography>
                            {reminderMsg.length > 0 && (
                                <Typography
                                    onClick={() => setReminderMsg('')}
                                    sx={{ fontSize: '11px', color: '#DC2626', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Clear
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Delivery info note */}
                    <Box sx={{ mx: 3, mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1.2, bgcolor: '#F0F4FF', border: '1px solid #C7D2FE', borderRadius: '8px', px: 2, py: 1.5 }}>
                        <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: '1px' }}>
                            <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>i</Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#4338CA', mb: 0.3 }}>
                                Where will this message appear?
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#5B6FA6', lineHeight: 1.6 }}>
                                This message will be delivered directly to the <strong>student's login inbox</strong> (Messages section). The student and their parent will see it the next time they log in to SchoolMate.
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F0F0F0', bgcolor: '#FAFAFA', gap: 1 }}>
                    <Button
                        onClick={() => setReminderModal(false)}
                        sx={{
                            textTransform: 'none', borderRadius: '8px',
                            color: '#666', border: '1px solid #E0E0E0',
                            '&:hover': { bgcolor: '#F5F5F5' },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={reminderMsg.trim().length === 0 || reminderHeadline.trim().length === 0 || reminderSending}
                        startIcon={reminderSending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SendIcon />}
                        onClick={handleSendReminder}
                        sx={{
                            textTransform: 'none', borderRadius: '8px',
                            bgcolor: '#6366F1', fontWeight: '600', px: 3,
                            '&:hover': { bgcolor: '#4F46E5' },
                            '&.Mui-disabled': { bgcolor: '#E0E0E0', color: '#aaa' },
                        }}
                    >
                        {reminderSending ? 'Sending...' : reminderStudent ? 'Send' : 'Send to All'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reminder History Dialog */}
            <Dialog
                open={historyModal}
                onClose={() => setHistoryModal(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ p: 0 }}>
                    <Box sx={{
                        background: 'linear-gradient(135deg, #6366F115, #6366F105)',
                        borderBottom: '3px solid #6366F1',
                        px: 3, py: 2.5,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                width: 40, height: 40, borderRadius: '10px',
                                bgcolor: '#6366F115', border: '1px solid #6366F130',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <HistoryIcon sx={{ color: '#6366F1', fontSize: 22 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '17px', fontWeight: '800', color: '#1a1a1a' }}>
                                    Reminder History
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#888', mt: 0.2 }}>
                                    {lastRemindersData?.totalRecords ?? 0} reminders sent
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={() => setHistoryModal(false)}
                            sx={{ bgcolor: '#F5F5F5', '&:hover': { bgcolor: '#EBEBEB' } }}
                        >
                            <CancelIcon sx={{ fontSize: 18, color: '#666' }} />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0, maxHeight: 500 }}>
                    {!lastRemindersData?.data || lastRemindersData.data.length === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1 }}>
                            <InboxIcon sx={{ fontSize: 56, color: '#D0D0D0' }} />
                            <Typography sx={{ fontSize: '14px', color: '#888', fontWeight: 600 }}>
                                No reminders sent yet
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ p: 2 }}>
                            {lastRemindersData.data.map((item, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        p: 2, mb: 1.5,
                                        border: '1px solid #E8E8E8',
                                        borderRadius: '10px',
                                        bgcolor: '#FAFAFA',
                                        '&:hover': { bgcolor: '#F5F5F5', borderColor: '#C7D2FE' },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                                                {item.headLine}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                                                <Chip
                                                    icon={<PeopleAltIcon sx={{ fontSize: '12px !important' }} />}
                                                    label={`${item.totalStudents} student${item.totalStudents !== 1 ? 's' : ''}`}
                                                    size="small"
                                                    sx={{ fontSize: '10px', height: '20px', bgcolor: '#EEF2FF', color: '#6366F1', fontWeight: 600 }}
                                                />
                                                <Chip
                                                    icon={<AccessTimeIcon sx={{ fontSize: '12px !important' }} />}
                                                    label={formatRelative(item.sentDate)}
                                                    size="small"
                                                    sx={{ fontSize: '10px', height: '20px', bgcolor: '#F5F5F5', color: '#666', fontWeight: 600 }}
                                                />
                                                <Typography sx={{ fontSize: '10px', color: '#999' }}>
                                                    {formatDateTime(item.sentDate)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <CheckCircleOutlineIcon sx={{ color: '#16A34A', fontSize: 18 }} />
                                    </Box>
                                    <Typography sx={{ fontSize: '12px', color: '#555', lineHeight: 1.5, mb: 1 }}>
                                        {stripHtml(item.reminderMessage)}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(item.rollNumbers || []).slice(0, 8).map((roll, i) => (
                                            <Chip
                                                key={i}
                                                label={`#${roll}`}
                                                size="small"
                                                sx={{ fontSize: '9px', height: '18px', bgcolor: '#fff', border: '1px solid #E0E0E0', color: '#666' }}
                                            />
                                        ))}
                                        {item.rollNumbers?.length > 8 && (
                                            <Chip
                                                label={`+${item.rollNumbers.length - 8} more`}
                                                size="small"
                                                sx={{ fontSize: '9px', height: '18px', bgcolor: '#EEF2FF', color: '#6366F1', fontWeight: 600 }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F0F0F0', bgcolor: '#FAFAFA' }}>
                    <Button
                        onClick={() => setHistoryModal(false)}
                        variant="contained"
                        sx={{
                            textTransform: 'none', borderRadius: '8px',
                            bgcolor: '#6366F1', fontWeight: '600', px: 3,
                            '&:hover': { bgcolor: '#4F46E5' },
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
