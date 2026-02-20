import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { defaulters } from '../../../../Api/Api';
import axios from 'axios';

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

export default function DefaultersTab({ selectedYear }) {
    const grades = useSelector(selectGrades);

    const [isLoading, setIsLoading] = useState(false);
    const [defaultersData, setDefaultersData] = useState(null);
    const [selectedFeeType, setSelectedFeeType] = useState('School Fee');
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [searchText, setSearchText] = useState('');

    // Reminder modal state
    const [reminderModal, setReminderModal] = useState(false);
    const [reminderMsg, setReminderMsg] = useState('');
    const [reminderType, setReminderType] = useState('SMS');
    const [reminderStudent, setReminderStudent] = useState(null);

    const selectedGrade = grades.find((g) => g.id === selectedGradeId);
    const selectedGradeSign = selectedGrade?.sign || null;

    useEffect(() => {
        fetchDefaultersData();
    }, [selectedYear, selectedFeeType, selectedGradeId]);

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

    const handleGradeChange = (newValue) => {
        setSelectedGradeId(newValue ? newValue.id : null);
    };

    const filteredDefaulters = (defaultersData?.defaulters || []).filter((d) =>
        d.name.toLowerCase().includes(searchText.toLowerCase()) ||
        d.rollNumber.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                        <CardContent>
                            {/* Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                                <Typography sx={{ fontSize: '18px', fontWeight: '600' }}>
                                    Fee Defaulters List
                                </Typography>
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

                            {/* Summary Cards */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid size={{ xs: 12, sm: 4, lg: 4 }}>
                                    <Box sx={{ p: 2, bgcolor: '#FEE2E2', borderRadius: '8px', border: '1px solid #DC2626' }}>
                                        <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>Total Defaulters</Typography>
                                        <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#DC2626' }}>
                                            {defaultersData?.totalDefaulters ?? '—'}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                            {defaultersData?.defaultersPercentage != null
                                                ? `${defaultersData.defaultersPercentage}% of ${defaultersData.totalStudents} students`
                                                : '—'}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4, lg: 4 }}>
                                    <Box sx={{ p: 2, bgcolor: '#FFF7ED', borderRadius: '8px', border: '1px solid #F97316' }}>
                                        <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>Total Pending</Typography>
                                        <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#F97316' }}>
                                            {defaultersData?.totalPending != null ? formatAmount(defaultersData.totalPending) : '—'}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                            {defaultersData?.avgPendingPerStudent != null
                                                ? `Avg ${formatAmount(defaultersData.avgPendingPerStudent)} per student`
                                                : '—'}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4, lg: 4 }}>
                                    <Box sx={{ p: 2, bgcolor: '#FFEDD5', borderRadius: '8px', border: '1px solid #EA580C' }}>
                                        <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>Overdue</Typography>
                                        <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#EA580C' }}>
                                            {defaultersData?.overdueCount ?? '—'}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                            {defaultersData?.overdueAmount != null
                                                ? `Amount: ${formatAmount(defaultersData.overdueAmount)}`
                                                : '—'}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Send to All button */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pb: 1 }}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<NotificationsActiveIcon />}
                                    onClick={() => { setReminderMsg(''); setReminderStudent(null); setReminderModal(true); }}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '12px',
                                        bgcolor: '#fff',
                                        border: '1px solid #6366F1',
                                        color: '#6366F1',
                                        boxShadow: 'none',
                                        '&:hover': { bgcolor: '#F0F0FF', borderColor: '#6366F1' },
                                    }}
                                >
                                    Send Reminder to All
                                </Button>
                            </Box>

                            {/* Table */}
                            {isLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress size={36} />
                                </Box>
                            ) : (
                                <TableContainer sx={{ maxHeight: 500 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                {['Student Details', 'Grade & Section', 'Pending Amount', 'Fee Type', 'Due Date', 'Days Overdue', 'Action'].map((h) => (
                                                    <TableCell key={h} sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>
                                                        {h}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredDefaulters.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} align="center">
                                                        <Typography sx={{ fontSize: '13px', color: '#999', py: 4 }}>
                                                            {isLoading ? '' : 'No defaulters found'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredDefaulters.map((student, index) => (
                                                    <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                                        {/* Student Details */}
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                                {student.name || '—'}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                                {student.rollNumber}
                                                            </Typography>
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
                                                        {/* Action */}
                                                        <TableCell>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                startIcon={<NotificationsActiveIcon sx={{ fontSize: '12px !important' }} />}
                                                                onClick={() => {
                                                                    setReminderMsg('');
                                                                    setReminderStudent({ name: student.name, grade: student.grade, section: student.section });
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
                                                                Remind
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
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
                                        : `${defaultersData?.totalDefaulters ?? 0} students will receive this reminder`}
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
                    {/* Quick Templates */}
                    <Box sx={{ px: 3, pt: 2, pb: 1 }}>
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
                    <Box sx={{ px: 3, pt: 1, pb: 2.5 }}>
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
                        disabled={reminderMsg.trim().length === 0}
                        startIcon={<SendIcon />}
                        sx={{
                            textTransform: 'none', borderRadius: '8px',
                            bgcolor: '#6366F1', fontWeight: '600', px: 3,
                            '&:hover': { bgcolor: '#4F46E5' },
                            '&.Mui-disabled': { bgcolor: '#E0E0E0', color: '#aaa' },
                        }}
                    >
                        {reminderStudent ? `Send via ${reminderType}` : `Send to All via ${reminderType}`}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
