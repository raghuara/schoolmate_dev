import React, { useState } from 'react';
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
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const today = new Date().toISOString().split('T')[0];

// User Type: Super Admin | Admin | Staff | Teacher
const USER_TYPE_CONFIG = {
    'Super Admin': { color: '#7C3AED', bg: '#F5F3FF' },
    'Admin':       { color: '#1D4ED8', bg: '#EFF6FF' },
    'Staff':       { color: '#0891B2', bg: '#F0F9FA' },
    'Teacher':     { color: '#059669', bg: '#F0FDF4' },
};

// Role: Teaching Staff | Non Teaching Staff | Supporting Staff
const ROLE_CONFIG = {
    'Teaching Staff':     { color: '#6D28D9', bg: '#EDE9FE' },
    'Non Teaching Staff': { color: '#0891B2', bg: '#F0F9FA' },
    'Supporting Staff':   { color: '#EA580C', bg: '#FFF7ED' },
};

const staffList = [
    { id: 1, staffId: 'ST001', name: 'Sarah Jenkins', userType: 'Teacher',     role: 'Teaching Staff',     avatar: 'SJ' },
    { id: 2, staffId: 'ST002', name: 'David Ross',    userType: 'Staff',        role: 'Non Teaching Staff', avatar: 'DR' },
    { id: 3, staffId: 'ST003', name: 'Nivetha Arjun', userType: 'Teacher',     role: 'Teaching Staff',     avatar: 'NA' },
    { id: 4, staffId: 'ST004', name: 'John Doe',      userType: 'Teacher',     role: 'Teaching Staff',     avatar: 'JD' },
    { id: 5, staffId: 'ST005', name: 'Priya Sharma',  userType: 'Teacher',     role: 'Teaching Staff',     avatar: 'PS' },
    { id: 6, staffId: 'ST006', name: 'Ramesh Kumar',  userType: 'Admin',       role: 'Non Teaching Staff', avatar: 'RK' },
    { id: 7, staffId: 'ST007', name: 'Anjali Mehta',  userType: 'Super Admin', role: 'Teaching Staff',     avatar: 'AM' },
    { id: 8, staffId: 'ST008', name: 'Vikram Nair',   userType: 'Staff',       role: 'Supporting Staff',   avatar: 'VN' },
];

const STATUS_OPTIONS = [
    { value: 'Present', color: '#22C55E' },
    { value: 'Absent', color: '#DC2626' },
    { value: 'Late', color: '#F97316' },
    { value: 'On Leave', color: '#3B82F6' },
];

const initLoginTimes = () => {
    const init = {};
    staffList.forEach(s => { init[s.id] = ''; });
    return init;
};

export default function AddAttendancePage() {
    const [attendanceDate, setAttendanceDate] = useState(today);
    const [userTypeFilter, setUserTypeFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');
    const [searchText, setSearchText] = useState('');
    const [attendanceMarks, setAttendanceMarks] = useState(() => {
        const init = {};
        staffList.forEach(s => { init[s.id] = 'Present'; });
        return init;
    });

    // Login time state
    const [loginTimes, setLoginTimes] = useState(initLoginTimes);
    const [sameTimeEnabled, setSameTimeEnabled] = useState(false);
    const [globalTime, setGlobalTime] = useState('');

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleMarkChange = (staffId, value) => {
        setAttendanceMarks(prev => ({ ...prev, [staffId]: value }));
        // Clear login time when marked Absent or On Leave — no check-in applies
        if (value === 'Absent' || value === 'On Leave') {
            setLoginTimes(prev => ({ ...prev, [staffId]: '' }));
        }
    };

    const handleLoginTimeChange = (staffId, value) => {
        setLoginTimes(prev => ({ ...prev, [staffId]: value }));
    };

    // Only Present/Late staff have a login time — Absent/On Leave are skipped
    const canHaveLoginTime = (staffId) => {
        const status = attendanceMarks[staffId];
        return status === 'Present' || status === 'Late';
    };

    // When global time input changes → push to Present/Late staff only
    const handleGlobalTimeChange = (value) => {
        setGlobalTime(value);
        setLoginTimes(prev => {
            const updated = { ...prev };
            staffList.forEach(s => {
                if (canHaveLoginTime(s.id)) updated[s.id] = value;
            });
            return updated;
        });
    };

    // Toggle "same time" mode
    const handleSameTimeToggle = (enabled) => {
        setSameTimeEnabled(enabled);
        if (enabled && globalTime) {
            // Push current globalTime to Present/Late staff only
            setLoginTimes(prev => {
                const updated = { ...prev };
                staffList.forEach(s => {
                    if (canHaveLoginTime(s.id)) updated[s.id] = globalTime;
                });
                return updated;
            });
        }
        if (!enabled) {
            setGlobalTime('');
        }
    };

    const handleSaveAttendance = () => {
        const payload = staffList.map(s => ({
            staffId: s.staffId,
            userType: s.userType,
            status: attendanceMarks[s.id],
            loginTime: loginTimes[s.id] || null,
        }));
        console.log('Saving attendance:', { date: attendanceDate, records: payload });
        // TODO: API call
    };

    // ── Derived values ────────────────────────────────────────────────────────

    const userTypes = Object.keys(USER_TYPE_CONFIG);

    const filteredStaff = staffList.filter(s => {
        const matchUserType = userTypeFilter === 'All' || s.userType === userTypeFilter;
        const matchRole = roleFilter === 'All' || s.role === roleFilter;
        const matchSearch =
            s.name.toLowerCase().includes(searchText.toLowerCase()) ||
            s.staffId.toLowerCase().includes(searchText.toLowerCase());
        return matchUserType && matchRole && matchSearch;
    });

    const counts = {
        present: Object.values(attendanceMarks).filter(v => v === 'Present').length,
        absent: Object.values(attendanceMarks).filter(v => v === 'Absent').length,
        late: Object.values(attendanceMarks).filter(v => v === 'Late').length,
        onLeave: Object.values(attendanceMarks).filter(v => v === 'On Leave').length,
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Box>
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

            {/* Summary counters */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {[
                    { label: 'Present', count: counts.present, color: '#22C55E', bg: '#F0FDF4', border: '#22C55E' },
                    { label: 'Absent', count: counts.absent, color: '#DC2626', bg: '#FEF2F2', border: '#DC2626' },
                    { label: 'Late', count: counts.late, color: '#F97316', bg: '#FFF7ED', border: '#F97316' },
                    { label: 'On Leave', count: counts.onLeave, color: '#3B82F6', bg: '#EFF6FF', border: '#3B82F6' },
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
                                    {((item.count / staffList.length) * 100).toFixed(0)}% of staff
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
                    <MenuItem value="All" sx={{ fontSize: '13px' }}>All User Types</MenuItem>
                    {userTypes.map(type => (
                        <MenuItem key={type} value={type} sx={{ fontSize: '13px' }}>
                            {type}
                        </MenuItem>
                    ))}
                </Select>
                <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 140, bgcolor: '#fff', fontSize: '13px', borderRadius: '6px' }}
                >
                    <MenuItem value="All" sx={{ fontSize: '13px' }}>All Category</MenuItem>
                    <MenuItem value="Teaching Staff" sx={{ fontSize: '13px' }}>Teaching Staff</MenuItem>
                    <MenuItem value="Non Teaching Staff" sx={{ fontSize: '13px' }}>Non Teaching Staff</MenuItem>
                    <MenuItem value="Supporting Staff" sx={{ fontSize: '13px' }}>Supporting Staff</MenuItem>
                </Select>
                <Typography sx={{ fontSize: '12px', color: '#888', ml: 'auto' }}>
                    {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
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

                {/* Global time input — shown only when toggle is ON */}
                {sameTimeEnabled && (
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        ml: { xs: 0, sm: 'auto' },
                        flexWrap: 'wrap',
                    }}>
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
                    </Box>
                )}

                {/* Hint when toggle is OFF */}
                {!sameTimeEnabled && (
                    <Typography sx={{ fontSize: '11px', color: '#aaa', ml: 'auto', fontStyle: 'italic' }}>
                        Edit each staff's time individually in the table
                    </Typography>
                )}
            </Box>

            {/* Attendance Table */}
            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
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
                                    Role
                                </TableCell>
                                <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                    Attendance
                                </TableCell>
                                {/* Login Time column header */}
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
                                            No staff found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStaff.map((staff, idx) => {
                                    const mark = attendanceMarks[staff.id];
                                    const loginTime = loginTimes[staff.id];
                                    const statusColor = mark === 'Present' ? '#22C55E' : mark === 'Absent' ? '#DC2626' : mark === 'Late' ? '#F97316' : '#3B82F6';
                                    const statusBg = mark === 'Present' ? '#DCFCE7' : mark === 'Absent' ? '#FEE2E2' : mark === 'Late' ? '#FFF7ED' : '#DBEAFE';
                                    const timeDisabled = sameTimeEnabled;

                                    return (
                                        <TableRow
                                            key={staff.id}
                                            sx={{
                                                '&:hover': { bgcolor: '#F9FAFB' },
                                                borderBottom: '1px solid #F0F0F0',
                                            }}
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
                                                    <Avatar sx={{ width: 34, height: 34, bgcolor: '#1976d2', fontSize: '12px', fontWeight: '700' }}>
                                                        {staff.avatar}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                                            {staff.name}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '10px', color: '#999' }}>
                                                            {staff.staffId}
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

                                            {/* Role */}
                                            <TableCell>
                                                <Chip
                                                    label={staff.role}
                                                    size="small"
                                                    sx={{
                                                        fontSize: '10px', height: '20px', fontWeight: '600',
                                                        bgcolor: ROLE_CONFIG[staff.role]?.bg ?? '#F5F5F5',
                                                        color: ROLE_CONFIG[staff.role]?.color ?? '#555',
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

                                            {/* Login Time */}
                                            <TableCell>
                                                {(mark === 'Absent' || mark === 'On Leave') ? (
                                                    // No login time for Absent / On Leave
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                                        <Box sx={{
                                                            width: 6, height: 6, borderRadius: '50%',
                                                            bgcolor: mark === 'Absent' ? '#DC2626' : '#3B82F6',
                                                        }} />
                                                        <Typography sx={{
                                                            fontSize: '11px', color: mark === 'Absent' ? '#DC2626' : '#3B82F6',
                                                            fontWeight: '500', fontStyle: 'italic',
                                                        }}>
                                                            {mark === 'Absent' ? 'Not applicable' : 'On leave'}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    // Present → green, Late → orange
                                                    (() => {
                                                        const isLate = mark === 'Late';
                                                        const activeColor = isLate ? '#F97316' : '#22C55E';
                                                        const activeBg   = isLate ? '#FFF7ED' : '#F0FDF4';
                                                        const activeBorder = isLate ? '#FED7AA' : '#86EFAC';
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
                                                                                            color: timeDisabled || loginTime ? activeColor : '#bbb',
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
                                                                                    borderColor: timeDisabled ? activeBorder : (loginTime ? activeColor : '#E0E0E0'),
                                                                                },
                                                                                '&:hover fieldset': {
                                                                                    borderColor: timeDisabled ? activeBorder : activeColor,
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
                                                    })()
                                                )}
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

                {/* Footer */}
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
                        sx={{
                            textTransform: 'none', fontSize: '13px', fontWeight: '600',
                            bgcolor: '#22C55E', borderRadius: '8px', px: 3,
                            '&:hover': { bgcolor: '#16A34A' },
                        }}
                    >
                        Save Attendance
                    </Button>
                </Box>
            </Card>
        </Box>
    );
}
