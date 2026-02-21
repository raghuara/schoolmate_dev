import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Select,
    MenuItem,
    Radio,
    RadioGroup,
    FormControlLabel,
    TextField,
    InputAdornment,
    Switch,
    Tooltip,
    CircularProgress,
    Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import { getAttendanceTeacherBefor, postAttendanceTeachers, updateTeachersAttendance } from '../../Api/Api';
import SnackBar from '../SnackBar';

const today = new Date().toISOString().split('T')[0];
const token = "123";

// ── Display configs ────────────────────────────────────────────────────────────
const USER_TYPE_CONFIG = {
    'Teacher':     { color: '#059669', bg: '#F0FDF4' },
    'Staff':       { color: '#0891B2', bg: '#F0F9FA' },
    'Admin':       { color: '#1D4ED8', bg: '#EFF6FF' },
    'Super Admin': { color: '#7C3AED', bg: '#F5F3FF' },
};

const ROLE_CONFIG = {
    'Teaching Staff':     { color: '#6D28D9', bg: '#EDE9FE' },
    'Non Teaching Staff': { color: '#0891B2', bg: '#F0F9FA' },
    'Supporting Staff':   { color: '#EA580C', bg: '#FFF7ED' },
};

// API userType (lowercase) → UI display label
const USER_TYPE_DISPLAY = {
    'teacher':    'Teacher',
    'staff':      'Staff',
    'admin':      'Admin',
    'superadmin': 'Super Admin',
};

// API userType → Role category shown in the Role column
const ROLE_FROM_USER_TYPE = {
    'teacher':    'Teaching Staff',
    'staff':      'Supporting Staff',
    'admin':      'Non Teaching Staff',
    'superadmin': 'Non Teaching Staff',
};

// API status string → UI status label
const STATUS_API_TO_UI = {
    'present': 'Present',
    'absent':  'Absent',
    'late':    'Late',
    'leave':   'On Leave',
};

// UI status label → API status string for POST/PUT body
const STATUS_UI_TO_API = {
    'Present':  'present',
    'Absent':   'absent',
    'Late':     'late',
    'On Leave': 'leave',
};

// UI label → API userType (lowercase) for POST body
const UI_TO_API_USER_TYPE = {
    'Teacher':     'teacher',
    'Staff':       'staff',
    'Admin':       'admin',
    'Super Admin': 'superadmin',
};

// UI label → subUserType for POST body
const UI_TO_SUB_USER_TYPE = {
    'Teacher':     'teaching',
    'Staff':       'supporting',
    'Admin':       'nonteaching',
    'Super Admin': 'nonteaching',
};

// User types to fetch in parallel
const FETCH_USER_TYPES = ['teacher', 'staff', 'admin'];

const STATUS_OPTIONS = [
    { value: 'Present',  color: '#22C55E' },
    { value: 'Absent',   color: '#DC2626' },
    { value: 'Late',     color: '#F97316' },
    { value: 'On Leave', color: '#3B82F6' },
];

export default function AddStaffAttendancePage() {
    const [attendanceDate, setAttendanceDate] = useState(today);
    const [userTypeFilter, setUserTypeFilter] = useState('Teacher');
    const [searchText, setSearchText] = useState('');

    // Dynamic staff list from API
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    // Per-userType attendance added flag: { 'Teacher': true, 'Staff': false, ... }
    const [isAttendanceAddedMap, setIsAttendanceAddedMap] = useState({});

    // Skip userTypeFilter effect on initial mount (fetchStaffList already handles all types)
    const isMounted = useRef(false);

    const [attendanceMarks, setAttendanceMarks] = useState({});
    const [loginTimes, setLoginTimes] = useState({});
    const [sameTimeEnabled, setSameTimeEnabled] = useState(false);
    const [globalTime, setGlobalTime] = useState('');

    // SnackBar state
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const showSnack = (msg, success) => {
        setMessage(msg);
        setOpen(true);
        setColor(success);
        setStatus(success);
    };

    // ── Fetch staff list ───────────────────────────────────────────────────────

    // Helper: map one API result item to a staff object
    const mapStaffItem = (item) => {
        const apiUType = item.userType?.toLowerCase() || '';
        // Extract "HH:MM" from "DD-MM-YYYY HH:MM", or '' if absent
        const existingTime = item.dateTime ? (item.dateTime.split(' ')[1] || '') : '';
        return {
            id: item.rollNumber,
            rollNumber: item.rollNumber,
            name: item.name,
            userType: USER_TYPE_DISPLAY[apiUType] || item.userType,
            role: ROLE_FROM_USER_TYPE[apiUType] || 'Non Teaching Staff',
            avatar: item.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
            filePath: item.filePath || '',
            existingStatus: item.status || '',
            existingTime,
        };
    };

    // Fetch ALL user types in parallel (called on date change)
    const fetchStaffList = async (date) => {
        setLoading(true);
        const [year, month, day] = date.split('-');
        const formattedDate = `${day}-${month}-${year}`;

        try {
            const results = await Promise.allSettled(
                FETCH_USER_TYPES.map(uType =>
                    axios.get(getAttendanceTeacherBefor, {
                        params: { Date: formattedDate, UserType: uType },
                        headers: { Authorization: `Bearer ${token}` },
                    })
                )
            );

            const allStaff = [];
            const addedMap = {};

            results.forEach((result, i) => {
                const uiType = USER_TYPE_DISPLAY[FETCH_USER_TYPES[i]];
                if (result.status === 'fulfilled' && !result.value.data.error) {
                    const { details = [], isAttendanceAdded: flag } = result.value.data;
                    addedMap[uiType] = flag === 'Y';
                    details.forEach(item => allStaff.push(mapStaffItem(item)));
                } else {
                    addedMap[uiType] = false;
                }
            });

            setStaffList(allStaff);
            setIsAttendanceAddedMap(addedMap);

            const marks = {};
            const times = {};
            allStaff.forEach(s => {
                marks[s.id] = STATUS_API_TO_UI[s.existingStatus.toLowerCase()] || 'Present';
                times[s.id] = s.existingTime;
            });
            setAttendanceMarks(marks);
            setLoginTimes(times);
        } catch {
            showSnack('Failed to load staff list', false);
        } finally {
            setLoading(false);
        }
    };

    // Fetch a SINGLE user type (called on userTypeFilter change)
    const fetchUserType = async (date, uiType) => {
        const apiUType = UI_TO_API_USER_TYPE[uiType] || uiType.toLowerCase();
        setLoading(true);
        const [year, month, day] = date.split('-');
        const formattedDate = `${day}-${month}-${year}`;

        try {
            const res = await axios.get(getAttendanceTeacherBefor, {
                params: { Date: formattedDate, UserType: apiUType },
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.data.error) {
                const { details = [], isAttendanceAdded: flag } = res.data;
                const newStaff = details.map(item => mapStaffItem(item));

                // Replace only this userType's entries in the master list
                setStaffList(prev => [
                    ...prev.filter(s => s.userType !== uiType),
                    ...newStaff,
                ]);

                setIsAttendanceAddedMap(prev => ({ ...prev, [uiType]: flag === 'Y' }));

                // Reset marks and times for the refreshed staff
                setAttendanceMarks(prev => {
                    const updated = { ...prev };
                    newStaff.forEach(s => {
                        updated[s.id] = STATUS_API_TO_UI[s.existingStatus.toLowerCase()] || 'Present';
                    });
                    return updated;
                });
                setLoginTimes(prev => {
                    const updated = { ...prev };
                    newStaff.forEach(s => { updated[s.id] = s.existingTime; });
                    return updated;
                });
            }
        } catch {
            showSnack('Failed to reload staff data', false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        isMounted.current = false; // reset on date change so filter effect skips next cycle
        fetchStaffList(attendanceDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attendanceDate]);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        fetchUserType(attendanceDate, userTypeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userTypeFilter]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    // Only Present and Late require a visible login time in the UI
    const needsLoginTime = (staffId) => {
        const s = attendanceMarks[staffId];
        return s === 'Present' || s === 'Late';
    };

    const handleMarkChange = (staffId, value) => {
        setAttendanceMarks(prev => ({ ...prev, [staffId]: value }));
    };

    const handleLoginTimeChange = (staffId, value) => {
        setLoginTimes(prev => ({ ...prev, [staffId]: value }));
    };

    const handleGlobalTimeChange = (value) => {
        setGlobalTime(value);
        setLoginTimes(prev => {
            const updated = { ...prev };
            staffList.forEach(s => { if (needsLoginTime(s.id)) updated[s.id] = value; });
            return updated;
        });
    };

    // Fill Present / Late staff login time fields with the current clock time (one-shot)
    const handleFillCurrentTime = () => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hh}:${mm}`;
        setLoginTimes(prev => {
            const updated = { ...prev };
            staffList.forEach(s => { if (needsLoginTime(s.id)) updated[s.id] = currentTime; });
            return updated;
        });
    };

    const handleSameTimeToggle = (enabled) => {
        setSameTimeEnabled(enabled);
        if (enabled && globalTime) {
            setLoginTimes(prev => {
                const updated = { ...prev };
                staffList.forEach(s => { if (needsLoginTime(s.id)) updated[s.id] = globalTime; });
                return updated;
            });
        }
        if (!enabled) setGlobalTime('');
    };

    const handleSaveAttendance = async () => {
        // Only Present / Late staff require login time
        const missing = filteredStaff.filter(s => needsLoginTime(s.id) && !loginTimes[s.id]);
        if (missing.length > 0) {
            showSnack(`Login time is required for Present / Late staff. ${missing.length} member${missing.length > 1 ? 's' : ''} missing.`, false);
            return;
        }

        const [year, month, day] = attendanceDate.split('-');
        const datePart = `${day}-${month}-${year}`;

        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hh}:${mm}`;

        const details = filteredStaff.map(s => {
            const status = STATUS_UI_TO_API[attendanceMarks[s.id]] || 'present';
            // Absent / On Leave → send 00:00; Present / Late → use recorded or current time
            const time = needsLoginTime(s.id) ? (loginTimes[s.id] || currentTime) : '00:00';
            return {
                rollNumber: s.rollNumber,
                dateTime: `${datePart} ${time}`,
                status,
            };
        });

        const body = {
            userType: UI_TO_API_USER_TYPE[userTypeFilter] || userTypeFilter.toLowerCase(),
            details,
        };

        const isCurrentTypeAdded = isAttendanceAddedMap[userTypeFilter] || false;

        try {
            if (isCurrentTypeAdded) {
                await axios.put(updateTeachersAttendance, body, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post(postAttendanceTeachers, body, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            showSnack(isCurrentTypeAdded ? 'Attendance updated successfully!' : 'Attendance saved successfully!', true);
            setIsAttendanceAddedMap(prev => ({ ...prev, [userTypeFilter]: true }));
        } catch (error) {
            showSnack(error?.response?.data?.message || 'Failed to save attendance', false);
        }
    };

    // ── Derived values ────────────────────────────────────────────────────────

    const userTypes = Object.keys(USER_TYPE_CONFIG);

    const filteredStaff = staffList.filter(s => {
        const matchUserType = s.userType === userTypeFilter;
        const matchSearch =
            s.name.toLowerCase().includes(searchText.toLowerCase()) ||
            s.id.toString().toLowerCase().includes(searchText.toLowerCase());
        return matchUserType && matchSearch;
    });

    const counts = {
        present: filteredStaff.filter(s => attendanceMarks[s.id] === 'Present').length,
        absent:  filteredStaff.filter(s => attendanceMarks[s.id] === 'Absent').length,
        late:    filteredStaff.filter(s => attendanceMarks[s.id] === 'Late').length,
        onLeave: filteredStaff.filter(s => attendanceMarks[s.id] === 'On Leave').length,
    };

    const isCurrentTypeAdded = isAttendanceAddedMap[userTypeFilter] || false;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Box>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            {/* Sub-header */}
            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                mb: 2.5, pb: 2, borderBottom: '1px solid #F0F0F0',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: '10px', bgcolor: '#E8F5E9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <PeopleIcon sx={{ color: '#22C55E', fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>
                            Mark Staff Attendance
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#888' }}>
                            {attendanceDate === today ? 'Marking for today' : `Marking for ${attendanceDate}`}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {/* Date picker */}
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.8,
                        bgcolor: '#fff', border: '1.5px solid #22C55E', borderRadius: '8px', px: 1.5, py: 0.5,
                    }}>
                        <EventIcon sx={{ fontSize: 16, color: '#22C55E' }} />
                        <TextField
                            type="date"
                            size="small"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            variant="standard"
                            sx={{ width: '130px' }}
                            slotProps={{
                                input: {
                                    disableUnderline: true,
                                    style: { fontSize: '13px', fontWeight: '600', color: '#22C55E' },
                                },
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Already-added banner */}
            {isCurrentTypeAdded && (
                <Alert
                    icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                    severity="success"
                    sx={{ mb: 2, fontSize: '13px', borderRadius: '8px' }}
                >
                    Attendance has already been marked for <strong>{userTypeFilter}</strong> on this date. Your changes will update the existing record.
                </Alert>
            )}

            {/* Summary counters */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {[
                    { label: 'Present',  count: counts.present,  color: '#22C55E', bg: '#F0FDF4', border: '#22C55E' },
                    { label: 'Absent',   count: counts.absent,   color: '#DC2626', bg: '#FEF2F2', border: '#DC2626' },
                    { label: 'Late',     count: counts.late,     color: '#F97316', bg: '#FFF7ED', border: '#F97316' },
                    { label: 'On Leave', count: counts.onLeave,  color: '#3B82F6', bg: '#EFF6FF', border: '#3B82F6' },
                ].map((item) => (
                    <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }} key={item.label}>
                        <Card sx={{
                            boxShadow: 'none', border: `1px solid ${item.border}`,
                            borderRadius: '4px', bgcolor: item.bg,
                        }}>
                            <CardContent sx={{ py: '12px !important' }}>
                                <Typography sx={{ fontSize: '11px', color: '#666' }}>{item.label}</Typography>
                                <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a' }}>
                                    {item.count}
                                </Typography>
                                <Typography sx={{ fontSize: '10px', color: item.color, fontWeight: '600' }}>
                                    {staffList.length > 0
                                        ? ((item.count / staffList.length) * 100).toFixed(0)
                                        : 0}% of staff
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Filters */}
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5,
                px: 2, py: 1.2, bgcolor: '#F8FAFC', border: '1px solid #E8EFF5',
                borderRadius: '8px', flexWrap: 'wrap',
            }}>
                <TextField
                    size="small"
                    placeholder="Search staff name or ID..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 17, color: '#aaa' }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{ width: '230px', bgcolor: '#fff', borderRadius: '6px' }}
                />
                <Select
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 160, bgcolor: '#fff', fontSize: '13px', borderRadius: '6px' }}
                >
                    {userTypes.map(type => (
                        <MenuItem key={type} value={type} sx={{ fontSize: '13px' }}>
                            {type}
                        </MenuItem>
                    ))}
                </Select>
                <Typography sx={{ fontSize: '12px', color: '#888', ml: 'auto' }}>
                    {loading ? 'Loading…' : `${filteredStaff.length} staff member${filteredStaff.length !== 1 ? 's' : ''}`}
                </Typography>
            </Box>

            {/* Login Time Control Bar */}
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 2, mb: 1.5,
                px: 2, py: 1.2,
                bgcolor: sameTimeEnabled ? '#F0FDF4' : '#FAFAFA',
                border: `1px solid ${sameTimeEnabled ? '#86EFAC' : '#E8E8E8'}`,
                borderRadius: '8px',
                transition: 'all 0.25s ease',
                flexWrap: 'wrap',
            }}>
                {/* Left: icon + label */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                        width: 30, height: 30, borderRadius: '8px',
                        bgcolor: sameTimeEnabled ? '#DCFCE7' : '#F0F0F0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background-color 0.25s',
                    }}>
                        <AccessTimeIcon sx={{
                            fontSize: 17,
                            color: sameTimeEnabled ? '#22C55E' : '#999',
                            transition: 'color 0.25s',
                        }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', lineHeight: 1.2 }}>
                            Login Time
                        </Typography>
                        <Typography sx={{ fontSize: '10px', color: '#888' }}>
                            Record check-in time for staff
                        </Typography>
                    </Box>
                </Box>

                {/* Divider */}
                <Box sx={{ width: '1px', height: 32, bgcolor: '#E0E0E0', mx: 0.5 }} />

                {/* Toggle: Apply same time to all */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Switch
                        checked={sameTimeEnabled}
                        onChange={(e) => handleSameTimeToggle(e.target.checked)}
                        size="small"
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#22C55E' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#22C55E' },
                        }}
                    />
                    <Typography sx={{ fontSize: '12px', fontWeight: '600', color: sameTimeEnabled ? '#22C55E' : '#555' }}>
                        Apply same time to all
                    </Typography>
                    <Tooltip
                        title="Enable to set one login time for all staff at once. Disable to edit each staff individually."
                        placement="top"
                        arrow
                    >
                        <InfoOutlinedIcon sx={{ fontSize: 15, color: '#bbb', cursor: 'help', ml: 0.3 }} />
                    </Tooltip>
                </Box>

                {/* Right side: always show "Use Current Time" + context-dependent extras */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', flexWrap: 'wrap' }}>
                    {/* One-shot: fill all Present/Late fields with current clock time */}
                    <Tooltip
                        title="Sets current time in all Present / Late login fields. You can edit individually after."
                        placement="top"
                        arrow
                    >
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={handleFillCurrentTime}
                            startIcon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                            sx={{
                                textTransform: 'none', fontSize: '12px', fontWeight: '600',
                                borderColor: '#22C55E', color: '#22C55E', borderRadius: '6px',
                                px: 1.5, py: 0.5,
                                '&:hover': { bgcolor: '#F0FDF4', borderColor: '#16A34A', color: '#16A34A' },
                            }}
                        >
                            Use Current Time
                        </Button>
                    </Tooltip>

                    <Box sx={{ width: '1px', height: 24, bgcolor: '#E0E0E0' }} />

                    {sameTimeEnabled ? (
                        <>
                            <Typography sx={{ fontSize: '12px', color: '#555', fontWeight: '500', whiteSpace: 'nowrap' }}>
                                Set time for all:
                            </Typography>
                            <TextField
                                type="time"
                                size="small"
                                value={globalTime}
                                onChange={(e) => handleGlobalTimeChange(e.target.value)}
                                placeholder="HH:MM"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccessTimeIcon sx={{ fontSize: 15, color: '#22C55E' }} />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                sx={{
                                    width: '155px', 
                                    bgcolor: '#fff',
                                    borderRadius: '6px',
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '13px', fontWeight: '600',
                                        '& fieldset': { borderColor: '#22C55E' },
                                        '&:hover fieldset': { borderColor: '#16A34A' },
                                        '&.Mui-focused fieldset': { borderColor: '#16A34A' },
                                    },
                                }}
                            />
                            {globalTime && (
                                <Chip
                                    label={`Applied to ${staffList.length} staff`}
                                    size="small"
                                    sx={{
                                        bgcolor: '#DCFCE7', color: '#16A34A',
                                        fontWeight: '600', fontSize: '10px', height: '22px',
                                    }}
                                />
                            )}
                        </>
                    ) : (
                        <Typography sx={{ fontSize: '11px', color: '#aaa', fontStyle: 'italic' }}>
                            Edit each staff's time individually in the table
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Attendance Table */}
            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                        <CircularProgress size={32} sx={{ color: '#22C55E' }} />
                        <Typography sx={{ ml: 2, fontSize: '13px', color: '#888' }}>
                            Loading staff list…
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                    <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase', width: 50 }}>
                                        S.No
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                        Staff Member
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                        User Type
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                        Attendance
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', minWidth: 140 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <AccessTimeIcon sx={{ fontSize: 13, color: sameTimeEnabled ? '#22C55E' : '#666' }} />
                                            <Typography sx={{
                                                fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
                                                color: sameTimeEnabled ? '#22C55E' : '#666',
                                            }}>
                                                Login Time
                                            </Typography>
                                            {sameTimeEnabled && (
                                                <Chip label="Synced" size="small" sx={{
                                                    fontSize: '9px', height: '16px', bgcolor: '#DCFCE7',
                                                    color: '#16A34A', fontWeight: '700', ml: 0.3,
                                                }} />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                        Status
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStaff.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography sx={{ fontSize: '13px', color: '#999', py: 3 }}>
                                                {staffList.length === 0 ? 'No staff data available for this date' : 'No staff found'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStaff.map((staff, idx) => {
                                        const mark = attendanceMarks[staff.id] || 'Present';
                                        const loginTime = loginTimes[staff.id] || '';
                                        const statusColor = mark === 'Present' ? '#22C55E' : mark === 'Absent' ? '#DC2626' : mark === 'Late' ? '#F97316' : '#3B82F6';
                                        const statusBg    = mark === 'Present' ? '#DCFCE7' : mark === 'Absent' ? '#FEE2E2' : mark === 'Late' ? '#FFF7ED' : '#DBEAFE';
                                        const timeDisabled = sameTimeEnabled;

                                        return (
                                            <TableRow
                                                key={staff.id}
                                                sx={{ '&:hover': { bgcolor: '#F9FAFB' }, borderBottom: '1px solid #F0F0F0' }}
                                            >
                                                {/* S.No */}
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>
                                                        {idx + 1}
                                                    </Typography>
                                                </TableCell>

                                                {/* Staff Member */}
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                        <Avatar
                                                            src={staff.filePath || undefined}
                                                            sx={{ width: 34, height: 34, bgcolor: '#1976d2', fontSize: '12px', fontWeight: '700' }}
                                                        >
                                                            {staff.avatar}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                                                {staff.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#999' }}>
                                                                {staff.rollNumber}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {/* User Type */}
                                                <TableCell>
                                                    <Chip
                                                        label={staff.userType}
                                                        size="small"
                                                        sx={{
                                                            fontSize: '10px', height: '20px', fontWeight: '600',
                                                            bgcolor: USER_TYPE_CONFIG[staff.userType]?.bg ?? '#F5F5F5',
                                                            color: USER_TYPE_CONFIG[staff.userType]?.color ?? '#555',
                                                        }}
                                                    />
                                                </TableCell>

                                                {/* Attendance Radio */}
                                                <TableCell>
                                                    <RadioGroup
                                                        row
                                                        value={mark}
                                                        onChange={(e) => handleMarkChange(staff.id, e.target.value)}
                                                        sx={{ gap: 0.5, flexWrap: 'wrap' }}
                                                    >
                                                        {STATUS_OPTIONS.map(opt => (
                                                            <FormControlLabel
                                                                key={opt.value}
                                                                value={opt.value}
                                                                control={
                                                                    <Radio
                                                                        size="small"
                                                                        sx={{
                                                                            p: 0.3,
                                                                            color: '#ccc',
                                                                            '&.Mui-checked': { color: opt.color },
                                                                        }}
                                                                    />
                                                                }
                                                                label={
                                                                    <Typography sx={{
                                                                        fontSize: '12px',
                                                                        color: mark === opt.value ? opt.color : '#666',
                                                                        fontWeight: mark === opt.value ? '600' : '400',
                                                                    }}>
                                                                        {opt.value}
                                                                    </Typography>
                                                                }
                                                                sx={{ mr: 1, ml: 0 }}
                                                            />
                                                        ))}
                                                    </RadioGroup>
                                                </TableCell>

                                                {/* Login Time — required for Present / Late only */}
                                                <TableCell>
                                                    {!needsLoginTime(staff.id) ? (
                                                        // Absent / On Leave — no login time needed
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                                            <Box sx={{
                                                                width: 6, height: 6, borderRadius: '50%',
                                                                bgcolor: mark === 'Absent' ? '#DC2626' : '#3B82F6',
                                                            }} />
                                                            <Typography sx={{
                                                                fontSize: '11px', fontStyle: 'italic', fontWeight: '500',
                                                                color: mark === 'Absent' ? '#DC2626' : '#3B82F6',
                                                            }}>
                                                                {mark === 'Absent' ? 'Not applicable' : 'On leave'}
                                                            </Typography>
                                                        </Box>
                                                    ) : (() => {
                                                        const isLate   = mark === 'Late';
                                                        const activeColor  = isLate ? '#F97316' : '#22C55E';
                                                        const activeBg     = isLate ? '#FFF7ED' : '#F0FDF4';
                                                        const activeBorder = isLate ? '#FED7AA' : '#86EFAC';
                                                        const isEmpty = !loginTime;
                                                        return (
                                                            <Tooltip
                                                                title={timeDisabled ? 'Controlled by "Apply same time to all" — disable the toggle to edit individually' : ''}
                                                                placement="top"
                                                                arrow
                                                                disableHoverListener={!timeDisabled}
                                                            >
                                                                <span>
                                                                    <TextField
                                                                        type="time"
                                                                        size="small"
                                                                        value={loginTime}
                                                                        disabled={timeDisabled}
                                                                        onChange={(e) => handleLoginTimeChange(staff.id, e.target.value)}
                                                                        slotProps={{
                                                                            input: {
                                                                                startAdornment: (
                                                                                    <InputAdornment position="start">
                                                                                        <AccessTimeIcon sx={{
                                                                                            fontSize: 14,
                                                                                            color: isEmpty ? '#f87171' : activeColor,
                                                                                        }} />
                                                                                    </InputAdornment>
                                                                                ),
                                                                            },
                                                                        }}
                                                                        sx={{
                                                                            width: '130px',
                                                                            '& .MuiOutlinedInput-root': {
                                                                                fontSize: '12px', fontWeight: '600',
                                                                                bgcolor: timeDisabled ? activeBg : '#fff',
                                                                                '& fieldset': {
                                                                                    borderColor: isEmpty ? '#FCA5A5' : (timeDisabled ? activeBorder : activeColor),
                                                                                    borderWidth: isEmpty ? '1.5px' : '1px',
                                                                                },
                                                                                '&:hover fieldset': {
                                                                                    borderColor: isEmpty ? '#f87171' : (timeDisabled ? activeBorder : activeColor),
                                                                                },
                                                                                '&.Mui-focused fieldset': { borderColor: activeColor },
                                                                                '&.Mui-disabled': {
                                                                                    bgcolor: activeBg,
                                                                                    '& input': {
                                                                                        color: activeColor,
                                                                                        WebkitTextFillColor: activeColor,
                                                                                        fontWeight: '700',
                                                                                    },
                                                                                },
                                                                            },
                                                                        }}
                                                                    />
                                                                </span>
                                                            </Tooltip>
                                                        );
                                                    })()}
                                                </TableCell>

                                                {/* Status chip */}
                                                <TableCell>
                                                    <Chip
                                                        label={mark}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: statusBg, color: statusColor,
                                                            fontWeight: '700', fontSize: '10px', height: '22px',
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Footer */}
                {!loading && (
                    <Box sx={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        px: 2, py: 1.5, borderTop: '1px solid #F0F0F0', bgcolor: '#FAFAFA',
                    }}>
                        <Typography sx={{ fontSize: '12px', color: '#888' }}>
                            Total: {filteredStaff.length} staff members
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveAttendance}
                            disabled={staffList.length === 0}
                            sx={{
                                textTransform: 'none', fontSize: '13px', fontWeight: '600',
                                bgcolor: isCurrentTypeAdded ? '#1D4ED8' : '#22C55E',
                                borderRadius: '8px', px: 3,
                                '&:hover': { bgcolor: isCurrentTypeAdded ? '#1E40AF' : '#16A34A' },
                            }}
                        >
                            {isCurrentTypeAdded ? 'Update Attendance' : 'Save Attendance'}
                        </Button>
                    </Box>
                )}
            </Card>
        </Box>
    );
}
