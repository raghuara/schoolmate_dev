import React from 'react';
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
    Autocomplete,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';

export default function DefaultersTab({
    selectedGradeId,
    handleGradeChange,
    reminderModal,
    setReminderModal,
    reminderMsg,
    setReminderMsg,
    reminderType,
    setReminderType,
    reminderStudent,
    setReminderStudent,
}) {
    const grades = useSelector(selectGrades);

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography sx={{ fontSize: '18px', fontWeight: '600' }}>
                                    Fee Defaulters List
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        size="small"
                                        placeholder="Search student..."
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ fontSize: 18 }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ width: '250px' }}
                                    />
                                    <FormControl size="small" sx={{ minWidth: 150 }}>

                                        <Autocomplete
                                            disablePortal
                                            options={grades}
                                            getOptionLabel={(option) => option.sign}
                                            value={grades.find((item) => item.id === selectedGradeId) || null}
                                            onChange={(event, newValue) => {
                                                handleGradeChange(newValue);
                                            }}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            sx={{ width: "150px" }}
                                            PaperComponent={(props) => (
                                                <Paper
                                                    {...props}
                                                    style={{
                                                        ...props.style,
                                                        maxHeight: "150px",
                                                        backgroundColor: "#000",
                                                        color: "#fff",
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
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        sx: {
                                                            paddingRight: 0,
                                                            height: "37px",
                                                            fontSize: "13px",
                                                            fontWeight: "600",
                                                        },
                                                    }}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        sx={{
                                            textTransform: 'none',
                                            bgcolor: '#DC2626',
                                            '&:hover': { bgcolor: '#B91C1C' }
                                        }}
                                    >
                                        Export
                                    </Button>
                                </Box>
                            </Box>

                            {/* Summary Cards */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid size={{ xs: 12, sm: 4, md: 3, lg: 4 }}>
                                    <Box sx={{ p: 2, bgcolor: '#FEE2E2', borderRadius: '8px', border: '1px solid #DC2626' }}>
                                        <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                            Total Defaulters
                                        </Typography>
                                        <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#DC2626' }}>
                                            119
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                            9.6% of total students
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4, md: 3, lg: 4 }}>
                                    <Box sx={{ p: 2, bgcolor: '#FFF7ED', borderRadius: '8px', border: '1px solid #F97316' }}>
                                        <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                            Total Pending
                                        </Typography>
                                        <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#F97316' }}>
                                            ₹12.5L
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                            Avg ₹10,504 per student
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4, md: 3, lg: 4 }}>
                                    <Box sx={{ p: 2, bgcolor: '#FFEDD5', borderRadius: '8px', border: '1px solid #EA580C' }}>
                                        <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                            Overdue
                                        </Typography>
                                        <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#EA580C' }}>
                                            38
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                            Amount: ₹3.25L
                                        </Typography>
                                    </Box>
                                </Grid>

                            </Grid>
                            <Box sx={{ display: 'flex', justifyContent: "end", pb: 1 }}>
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
                                        boxShadow: "none",
                                        '&:hover': {
                                            bgcolor: '#F0F0FF',
                                            borderColor: '#6366F1',
                                        }
                                    }}
                                >
                                    Send Reminder to All
                                </Button>
                            </Box>
                            <TableContainer sx={{ maxHeight: 500 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Student Details</TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Grade</TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Pending Amount</TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Fee Type</TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Due Date</TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Days Overdue</TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Contact</TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {[
                                            { id: 'ST001', name: 'Rahul Sharma', grade: 'Grade 5-A', amount: 15000, type: 'School Fee', dueDate: '2025-12-15', daysOverdue: 46, contact: '+91 98765 43210', priority: 'High' },
                                            { id: 'ST002', name: 'Priya Patel', grade: 'Grade 3-B', amount: 8500, type: 'Transport Fee', dueDate: '2026-01-05', daysOverdue: 25, contact: '+91 98765 43211', priority: 'Medium' },
                                            { id: 'ST003', name: 'Amit Kumar', grade: 'Grade 8-C', amount: 12000, type: 'School Fee', dueDate: '2025-11-30', daysOverdue: 61, contact: '+91 98765 43212', priority: 'High' },
                                            { id: 'ST004', name: 'Sneha Reddy', grade: 'Grade 2-A', amount: 6500, type: 'ECA Fee', dueDate: '2026-01-10', daysOverdue: 20, contact: '+91 98765 43213', priority: 'Low' },
                                            { id: 'ST005', name: 'Arjun Singh', grade: 'Grade 10-B', amount: 18000, type: 'School Fee', dueDate: '2025-12-20', daysOverdue: 41, contact: '+91 98765 43214', priority: 'High' },
                                            { id: 'ST006', name: 'Kavya Nair', grade: 'Grade 6-A', amount: 9500, type: 'Transport Fee', dueDate: '2026-01-01', daysOverdue: 29, contact: '+91 98765 43215', priority: 'Medium' },
                                            { id: 'ST007', name: 'Rohan Gupta', grade: 'Grade 4-C', amount: 11000, type: 'School Fee', dueDate: '2025-12-10', daysOverdue: 51, contact: '+91 98765 43216', priority: 'High' },
                                            { id: 'ST008', name: 'Ananya Das', grade: 'Grade 7-B', amount: 7200, type: 'Additional Fee', dueDate: '2026-01-15', daysOverdue: 15, contact: '+91 98765 43217', priority: 'Low' },
                                        ].map((student, index) => (
                                            <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                        {student.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                        ID: {student.id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '12px' }}>
                                                        {student.grade}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '700', color: '#DC2626' }}>
                                                        ₹{student.amount.toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '11px' }}>
                                                        {student.type}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '11px' }}>
                                                        {student.dueDate}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
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
                                                            height: '20px'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '11px', color: '#0891B2' }}>
                                                        {student.contact}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<NotificationsActiveIcon sx={{ fontSize: '12px !important' }} />}
                                                        onClick={() => {
                                                            setReminderMsg('');
                                                            setReminderStudent({ name: student.name, grade: student.grade });
                                                            setReminderModal(true);
                                                        }}
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontSize: '10px',
                                                            borderColor: '#6366F1',
                                                            color: '#6366F1',
                                                            '&:hover': {
                                                                bgcolor: '#F0F0FF',
                                                                borderColor: '#6366F1',
                                                            }
                                                        }}
                                                    >
                                                        Remind
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
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
                {/* Header */}
                <DialogTitle sx={{ p: 0 }}>
                    <Box sx={{
                        background: 'linear-gradient(135deg, #6366F115, #6366F105)',
                        borderBottom: '3px solid #6366F1',
                        px: 3, py: 2.5,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                width: 40, height: 40, borderRadius: '10px',
                                bgcolor: '#6366F115', border: '1px solid #6366F130',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <NotificationsActiveIcon sx={{ color: '#6366F1', fontSize: 22 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '17px', fontWeight: '800', color: '#1a1a1a' }}>
                                    {reminderStudent ? `Send Reminder to ${reminderStudent.name}` : 'Send Reminder to All Defaulters'}
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#888', mt: 0.2 }}>
                                    {reminderStudent ? `${reminderStudent.grade} · Individual reminder` : '119 students will receive this reminder'}
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
                                'Dear Parent, your child\'s fee is pending. Please pay at the earliest.',
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
                                        '&:hover': { bgcolor: '#6366F115', color: '#6366F1' }
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
                                    '&.Mui-focused fieldset': { borderColor: '#6366F1' }
                                }
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
                            '&:hover': { bgcolor: '#F5F5F5' }
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
                            '&.Mui-disabled': { bgcolor: '#E0E0E0', color: '#aaa' }
                        }}
                    >
                        {reminderStudent ? `Send via ${reminderType}` : `Send to All via ${reminderType}`}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
