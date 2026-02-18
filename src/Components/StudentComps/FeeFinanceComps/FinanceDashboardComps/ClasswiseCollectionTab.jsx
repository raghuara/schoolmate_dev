import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    TextField,
    InputAdornment,
    LinearProgress,
    Divider,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    Paper,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';

// Mock data for defaulters by grade
const defaultersByGrade = {
    'Grade 1': [
        { rollNo: 'T0001', name: 'Aganya Sharma', pending: 12000, feeType: 'School Fee' },
        { rollNo: 'T0002', name: 'Aarav Mehta', pending: 8500, feeType: 'Transport Fee' },
        { rollNo: 'T0003', name: 'Bhavya Nair', pending: 15000, feeType: 'School Fee' },
        { rollNo: 'T0004', name: 'Chetan Reddy', pending: 6000, feeType: 'ECA Fee' },
        { rollNo: 'T0005', name: 'Diya Pillai', pending: 10000, feeType: 'School Fee' },
    ],
    'Grade 2': [
        { rollNo: 'T0021', name: 'Esha Kumar', pending: 14000, feeType: 'School Fee' },
        { rollNo: 'T0022', name: 'Farhan Ali', pending: 9000, feeType: 'Transport Fee' },
        { rollNo: 'T0023', name: 'Gayatri Iyer', pending: 11000, feeType: 'School Fee' },
        { rollNo: 'T0024', name: 'Harsh Verma', pending: 7500, feeType: 'Additional Fee' },
        { rollNo: 'T0025', name: 'Isha Patel', pending: 13000, feeType: 'School Fee' },
    ],
    'Grade 3': [
        { rollNo: 'T0041', name: 'Jatin Gupta', pending: 9500, feeType: 'School Fee' },
        { rollNo: 'T0042', name: 'Kavya Singh', pending: 6500, feeType: 'ECA Fee' },
        { rollNo: 'T0043', name: 'Lakshmi Rao', pending: 12500, feeType: 'School Fee' },
    ],
    'Grade 4': [
        { rollNo: 'T0061', name: 'Manav Joshi', pending: 10500, feeType: 'School Fee' },
        { rollNo: 'T0062', name: 'Nisha Bose', pending: 8000, feeType: 'Transport Fee' },
        { rollNo: 'T0063', name: 'Om Prakash', pending: 14500, feeType: 'School Fee' },
        { rollNo: 'T0064', name: 'Pooja Desai', pending: 5500, feeType: 'Additional Fee' },
    ],
    'Grade 5': [
        { rollNo: 'T0081', name: 'Rahul Saxena', pending: 11000, feeType: 'School Fee' },
        { rollNo: 'T0082', name: 'Sneha Kapoor', pending: 7000, feeType: 'Transport Fee' },
    ],
    'Grade 6': [
        { rollNo: 'T0101', name: 'Tanvi Mishra', pending: 13500, feeType: 'School Fee' },
        { rollNo: 'T0102', name: 'Uday Chandra', pending: 9000, feeType: 'ECA Fee' },
        { rollNo: 'T0103', name: 'Vansh Tiwari', pending: 15000, feeType: 'School Fee' },
        { rollNo: 'T0104', name: 'Waqar Ahmed', pending: 6000, feeType: 'Additional Fee' },
        { rollNo: 'T0105', name: 'Xena Fernandez', pending: 10000, feeType: 'School Fee' },
    ],
    'Grade 7': [
        { rollNo: 'T0121', name: 'Yash Malhotra', pending: 12000, feeType: 'School Fee' },
        { rollNo: 'T0122', name: 'Zara Khan', pending: 8500, feeType: 'Transport Fee' },
        { rollNo: 'T0123', name: 'Arjun Das', pending: 11500, feeType: 'School Fee' },
    ],
    'Grade 8': [
        { rollNo: 'T0141', name: 'Bhumi Agarwal', pending: 14000, feeType: 'School Fee' },
        { rollNo: 'T0142', name: 'Chirag Soni', pending: 9500, feeType: 'ECA Fee' },
        { rollNo: 'T0143', name: 'Deepa Menon', pending: 7500, feeType: 'Additional Fee' },
    ],
    'Grade 9': [
        { rollNo: 'T0161', name: 'Ekta Bansal', pending: 16000, feeType: 'School Fee' },
        { rollNo: 'T0162', name: 'Farida Sheikh', pending: 11000, feeType: 'Transport Fee' },
        { rollNo: 'T0163', name: 'Gaurav Luthra', pending: 13000, feeType: 'School Fee' },
        { rollNo: 'T0164', name: 'Hema Suresh', pending: 8000, feeType: 'Additional Fee' },
    ],
    'Grade 10': [
        { rollNo: 'T0181', name: 'Ishaan Trivedi', pending: 15000, feeType: 'School Fee' },
        { rollNo: 'T0182', name: 'Jyoti Pandey', pending: 10000, feeType: 'Transport Fee' },
        { rollNo: 'T0183', name: 'Kiran Nambiar', pending: 12500, feeType: 'School Fee' },
    ],
};

export default function ClasswiseCollectionTab({
    selectedFeeType,
    setSelectedFeeType,
    selectedGradeId,
    handleGradeChange,
    classwiseModal,
    setClasswiseModal,
    defaulterSearch,
    setDefaulterSearch,
}) {
    const grades = useSelector(selectGrades);

    return (
        <>
            <Box>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                        <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
                                    <Typography sx={{ fontSize: '18px', fontWeight: '600' }}>
                                        Grade-wise Fee Collection Status
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <FormControl size="small" sx={{ minWidth: 180 }}>
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
                                        <FormControl size="small" sx={{ minWidth: 180 }}>
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
                                                                height: "33px",
                                                                fontSize: "13px",
                                                                fontWeight: "600",
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </Box>
                                </Box>

                                <Grid container spacing={2}>
                                    {[
                                        { grade: 'Grade 1', sections: 3, students: 135, collected: 6750000, total: 8100000, pending: 15, color: '#FF6B35' },
                                        { grade: 'Grade 2', sections: 3, students: 142, collected: 7100000, total: 8520000, pending: 22, color: '#004E89' },
                                        { grade: 'Grade 3', sections: 4, students: 156, collected: 7800000, total: 9360000, pending: 8, color: '#7C3AED' },
                                        { grade: 'Grade 4', sections: 4, students: 148, collected: 7400000, total: 8880000, pending: 12, color: '#22C55E' },
                                        { grade: 'Grade 5', sections: 3, students: 128, collected: 6400000, total: 7680000, pending: 5, color: '#F97316' },
                                        { grade: 'Grade 6', sections: 4, students: 152, collected: 7600000, total: 9120000, pending: 18, color: '#0891B2' },
                                        { grade: 'Grade 7', sections: 3, students: 138, collected: 6900000, total: 8280000, pending: 11, color: '#E91E63' },
                                        { grade: 'Grade 8', sections: 3, students: 125, collected: 6250000, total: 7500000, pending: 9, color: '#8B5CF6' },
                                        { grade: 'Grade 9', sections: 2, students: 98, collected: 4900000, total: 5880000, pending: 13, color: '#EA580C' },
                                        { grade: 'Grade 10', sections: 2, students: 85, collected: 4250000, total: 5100000, pending: 6, color: '#14B8A6' },
                                    ].map((item, index) => {
                                        const collectionRate = (item.collected / item.total) * 100;
                                        return (
                                            <Grid key={index} size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                                <Card
                                                    sx={{
                                                        boxShadow: 'none',
                                                        border: `1px solid ${item.color}`,
                                                        borderRadius: '8px',
                                                        bgcolor: `${item.color}08`,
                                                        transition: 'transform 0.2s',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        }
                                                    }}
                                                >
                                                    <CardContent>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                            <Box>
                                                                <Typography sx={{ fontSize: '20px', fontWeight: '700', color: item.color, mb: 0.5 }}>
                                                                    {item.grade}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                                                    {item.sections} Sections • {item.students} Students
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ textAlign: 'right' }}>
                                                                <Typography sx={{ fontSize: '24px', fontWeight: '700', color: item.color }}>
                                                                    {collectionRate.toFixed(1)}%
                                                                </Typography>
                                                                <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                                    Collection Rate
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={collectionRate}
                                                            sx={{
                                                                height: 8,
                                                                borderRadius: 4,
                                                                bgcolor: '#E8E8E8',
                                                                mb: 2,
                                                                '& .MuiLinearProgress-bar': {
                                                                    bgcolor: item.color,
                                                                    borderRadius: 4,
                                                                },
                                                            }}
                                                        />

                                                        <Grid container spacing={2}>
                                                            <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                                                                <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderRadius: '6px' }}>
                                                                    <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                                        Collected
                                                                    </Typography>
                                                                    <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#22C55E' }}>
                                                                        ₹{(item.collected / 100000).toFixed(1)}L
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                                                                <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderRadius: '6px' }}>
                                                                    <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                                        Pending
                                                                    </Typography>
                                                                    <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#F97316' }}>
                                                                        ₹{((item.total - item.collected) / 100000).toFixed(1)}L
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>

                                                        <Divider sx={{ my: 1.5 }} />

                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <PendingActionsIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                                                                <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                                                    {item.pending} Defaulters
                                                                </Typography>
                                                            </Box>
                                                            <Button
                                                                size="small"
                                                                onClick={() => {
                                                                    setDefaulterSearch('');
                                                                    setClasswiseModal({
                                                                        open: true,
                                                                        grade: item.grade,
                                                                        color: item.color,
                                                                        defaulters: defaultersByGrade[item.grade] || []
                                                                    });
                                                                }}
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontSize: '11px',
                                                                    color: item.color,
                                                                    fontWeight: '600',
                                                                    border: `1px solid ${item.color}40`,
                                                                    borderRadius: '6px',
                                                                    px: 1.5,
                                                                    '&:hover': { bgcolor: `${item.color}15` }
                                                                }}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Defaulters Modal */}
            <Dialog
                open={classwiseModal.open}
                onClose={() => setClasswiseModal(p => ({ ...p, open: false }))}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
            >
                {/* Dialog Header */}
                <DialogTitle sx={{ p: 0 }}>
                    <Box sx={{
                        background: `linear-gradient(135deg, ${classwiseModal.color}15, ${classwiseModal.color}05)`,
                        borderBottom: `3px solid ${classwiseModal.color}`,
                        px: 3, py: 2.5,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                    }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Box sx={{
                                    width: 10, height: 10, borderRadius: '50%',
                                    bgcolor: classwiseModal.color
                                }} />
                                <Typography sx={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a' }}>
                                    {classwiseModal.grade} — Defaulters
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '12px', color: '#888' }}>
                                {classwiseModal.defaulters.length} student{classwiseModal.defaulters.length !== 1 ? 's' : ''} with pending fees
                            </Typography>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={() => setClasswiseModal(p => ({ ...p, open: false }))}
                            sx={{ bgcolor: '#F5F5F5', '&:hover': { bgcolor: '#EBEBEB' } }}
                        >
                            <CancelIcon sx={{ fontSize: 18, color: '#666' }} />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {/* Search Bar */}
                    <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: '1px solid #F0F0F0' }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by roll no. or name..."
                            value={defaulterSearch}
                            onChange={(e) => setDefaulterSearch(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 18, color: '#999' }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '13px' }
                            }}
                        />
                    </Box>

                    {/* Summary Strip */}
                    <Box sx={{ display: 'flex', gap: 0, borderBottom: '1px solid #F0F0F0' }}>
                        {[
                            { label: 'Total Defaulters', value: classwiseModal.defaulters.length, color: classwiseModal.color },
                            { label: 'Total Pending', value: `₹${classwiseModal.defaulters.reduce((s, d) => s + d.pending, 0).toLocaleString()}`, color: '#F97316' },
                        ].map((s, i) => (
                            <Box key={i} sx={{ flex: 1, px: 2.5, py: 1.5, borderRight: i === 0 ? '1px solid #F0F0F0' : 'none', bgcolor: '#FAFAFA' }}>
                                <Typography sx={{ fontSize: '10px', color: '#888' }}>{s.label}</Typography>
                                <Typography sx={{ fontSize: '16px', fontWeight: '800', color: s.color }}>{s.value}</Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Table Header */}
                    <Box sx={{ display: 'flex', px: 2.5, py: 1, bgcolor: '#F7F8FA', borderBottom: '1px solid #EFEFEF' }}>
                        <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#888', width: '35%' }}>ROLL NO. & NAME</Typography>
                        <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#888', width: '35%', textAlign: 'center' }}>FEE TYPE</Typography>
                        <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#888', width: '30%', textAlign: 'right' }}>PENDING</Typography>
                    </Box>

                    {/* Defaulter List */}
                    <Box sx={{
                        maxHeight: 340, overflowY: 'auto',
                        '&::-webkit-scrollbar': { width: '4px' },
                        '&::-webkit-scrollbar-thumb': { bgcolor: '#D0D0D0', borderRadius: '10px' },
                    }}>
                        {classwiseModal.defaulters
                            .filter(d =>
                                d.rollNo.toLowerCase().includes(defaulterSearch.toLowerCase()) ||
                                d.name.toLowerCase().includes(defaulterSearch.toLowerCase())
                            )
                            .map((d, i) => (
                                <Box key={i} sx={{
                                    display: 'flex', alignItems: 'center',
                                    px: 2.5, py: 1.5,
                                    borderBottom: '1px solid #F8F8F8',
                                    '&:hover': { bgcolor: `${classwiseModal.color}08` },
                                    transition: '0.15s'
                                }}>
                                    {/* Roll + Name */}
                                    <Box sx={{ width: '35%', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                        <Box sx={{
                                            bgcolor: `${classwiseModal.color}15`,
                                            border: `1px solid ${classwiseModal.color}40`,
                                            borderRadius: '6px', px: 1, py: 0.3
                                        }}>
                                            <Typography sx={{ fontSize: '11px', fontWeight: '700', color: classwiseModal.color }}>
                                                {d.rollNo}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                            {d.name}
                                        </Typography>
                                    </Box>
                                    {/* Fee Type */}
                                    <Box sx={{ width: '35%', textAlign: 'center' }}>
                                        <Chip
                                            label={selectedFeeType !== 'all' ? selectedFeeType : d.feeType}
                                            size="small"
                                            sx={{ fontSize: '10px', height: '20px', bgcolor: '#F0F4FF', color: '#3457D5', fontWeight: '600' }}
                                        />
                                    </Box>
                                    {/* Pending */}
                                    <Box sx={{ width: '30%', textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: '13px', fontWeight: '700', color: '#DC2626' }}>
                                            ₹{d.pending.toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))
                        }
                        {classwiseModal.defaulters.filter(d =>
                            d.rollNo.toLowerCase().includes(defaulterSearch.toLowerCase()) ||
                            d.name.toLowerCase().includes(defaulterSearch.toLowerCase())
                        ).length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 5 }}>
                                    <Typography sx={{ fontSize: '13px', color: '#999' }}>No results found</Typography>
                                </Box>
                            )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #F0F0F0', bgcolor: '#FAFAFA' }}>
                    <Button
                        onClick={() => setClasswiseModal(p => ({ ...p, open: false }))}
                        variant="contained"
                        sx={{
                            textTransform: 'none', borderRadius: '8px',
                            bgcolor: classwiseModal.color, fontSize: '13px',
                            '&:hover': { bgcolor: classwiseModal.color, opacity: 0.9 }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
