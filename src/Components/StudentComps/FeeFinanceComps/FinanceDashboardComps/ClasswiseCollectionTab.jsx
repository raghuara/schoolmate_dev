import React, { useState, useEffect } from 'react';
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
    CircularProgress,
} from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { classWiseCollection } from '../../../../Api/Api';
import axios from 'axios';

const token = "123";

const GRADE_COLORS = [
    '#FF6B35', '#004E89', '#7C3AED', '#22C55E', '#F97316',
    '#0891B2', '#E91E63', '#8B5CF6', '#EA580C', '#14B8A6',
    '#2563EB', '#D97706', '#059669',
];

export default function ClasswiseCollectionTab({ selectedYear }) {
    const grades = useSelector(selectGrades);
    const [isLoading, setIsLoading] = useState(false);
    const [classwiseData, setClasswiseData] = useState([]);
    const [selectedFeeType, setSelectedFeeType] = useState('School Fee');
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [classwiseModal, setClasswiseModal] = useState({ open: false, grade: '', color: '', defaulters: [], totalDefaulters: 0, totalPendingDisplay: '₹0' });
    const [defaulterSearch, setDefaulterSearch] = useState('');

    const handleGradeChange = (newValue) => {
        setSelectedGradeId(newValue ? newValue.id : null);
    };

    useEffect(() => {
        fetchOverviewData();
    }, [selectedYear, selectedFeeType]);

    const fetchOverviewData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(classWiseCollection, {
                params: { year: selectedYear, FeeType: selectedFeeType },
                headers: { Authorization: `Bearer ${token}` },
            });
            setClasswiseData(res.data.data.grades || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Client-side grade filter
    const selectedGrade = grades.find((g) => g.id === selectedGradeId);
    const displayedData = selectedGrade
        ? classwiseData.filter(
              (item) =>
                  item.gradeDisplay === selectedGrade.sign ||
                  item.grade === selectedGrade.sign
          )
        : classwiseData;

    // Filtered defaulters in the modal
    const filteredDefaulters = (classwiseModal.defaulters || []).filter(
        (d) =>
            d.rollNumber.toLowerCase().includes(defaulterSearch.toLowerCase()) ||
            d.name.toLowerCase().includes(defaulterSearch.toLowerCase())
    );

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
                                                                    height: '33px',
                                                                    fontSize: '13px',
                                                                    fontWeight: '600',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </Box>
                                </Box>

                                {isLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                        <CircularProgress size={36} />
                                    </Box>
                                ) : displayedData.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 8 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#999' }}>
                                            No data available
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Grid container spacing={2}>
                                        {displayedData.map((item, index) => {
                                            const color = GRADE_COLORS[index % GRADE_COLORS.length];
                                            const collectionRate = Number(item.collectionRate) || 0;
                                            return (
                                                <Grid key={item.grade} size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                                    <Card
                                                        sx={{
                                                            boxShadow: 'none',
                                                            border: `1px solid ${color}`,
                                                            borderRadius: '8px',
                                                            bgcolor: `${color}08`,
                                                            transition: 'transform 0.2s',
                                                            '&:hover': {
                                                                transform: 'translateY(-4px)',
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                            },
                                                        }}
                                                    >
                                                        <CardContent>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                                <Box>
                                                                    <Typography sx={{ fontSize: '20px', fontWeight: '700', color, mb: 0.5 }}>
                                                                        {item.gradeDisplay}
                                                                    </Typography>
                                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                                                        {item.sectionsCount} Section{item.sectionsCount !== 1 ? 's' : ''} • {item.studentsCount} Student{item.studentsCount !== 1 ? 's' : ''}
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{ textAlign: 'right' }}>
                                                                    <Typography sx={{ fontSize: '24px', fontWeight: '700', color }}>
                                                                        {item.collectionRateDisplay}
                                                                    </Typography>
                                                                    <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                                        Collection Rate
                                                                    </Typography>
                                                                </Box>
                                                            </Box>

                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={Math.min(collectionRate, 100)}
                                                                sx={{
                                                                    height: 8,
                                                                    borderRadius: 4,
                                                                    bgcolor: '#E8E8E8',
                                                                    mb: 2,
                                                                    '& .MuiLinearProgress-bar': {
                                                                        bgcolor: color,
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
                                                                            {item.collectedDisplay}
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>
                                                                <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                                                                    <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderRadius: '6px' }}>
                                                                        <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                                            Pending
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#F97316' }}>
                                                                            {item.pendingDisplay}
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>
                                                            </Grid>

                                                            <Divider sx={{ my: 1.5 }} />

                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <PendingActionsIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                                                        {item.defaultersCount} Defaulter{item.defaultersCount !== 1 ? 's' : ''}
                                                                    </Typography>
                                                                </Box>
                                                                <Button
                                                                    size="small"
                                                                    onClick={() => {
                                                                        setDefaulterSearch('');
                                                                        setClasswiseModal({
                                                                            open: true,
                                                                            grade: item.gradeDisplay,
                                                                            color,
                                                                            defaulters: item.defaultersSummary.items,
                                                                            totalDefaulters: item.defaultersSummary.totalDefaulters,
                                                                            totalPendingDisplay: item.defaultersSummary.totalPendingDisplay,
                                                                        });
                                                                    }}
                                                                    sx={{
                                                                        textTransform: 'none',
                                                                        fontSize: '11px',
                                                                        color,
                                                                        fontWeight: '600',
                                                                        border: `1px solid ${color}40`,
                                                                        borderRadius: '6px',
                                                                        px: 1.5,
                                                                        '&:hover': { bgcolor: `${color}15` },
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
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Defaulters Modal */}
            <Dialog
                open={classwiseModal.open}
                onClose={() => setClasswiseModal((p) => ({ ...p, open: false }))}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
            >
                {/* Dialog Header */}
                <DialogTitle sx={{ p: 0 }}>
                    <Box
                        sx={{
                            background: `linear-gradient(135deg, ${classwiseModal.color}15, ${classwiseModal.color}05)`,
                            borderBottom: `3px solid ${classwiseModal.color}`,
                            px: 3,
                            py: 2.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                        }}
                    >
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: classwiseModal.color,
                                    }}
                                />
                                <Typography sx={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a' }}>
                                    {classwiseModal.grade} — Defaulters
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '12px', color: '#888' }}>
                                {classwiseModal.totalDefaulters || 0} student{(classwiseModal.totalDefaulters || 0) !== 1 ? 's' : ''} with pending fees
                            </Typography>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={() => setClasswiseModal((p) => ({ ...p, open: false }))}
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
                                    ),
                                },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '13px' },
                            }}
                        />
                    </Box>

                    {/* Summary Strip */}
                    <Box sx={{ display: 'flex', gap: 0, borderBottom: '1px solid #F0F0F0' }}>
                        {[
                            { label: 'Total Defaulters', value: classwiseModal.totalDefaulters || 0, color: classwiseModal.color },
                            { label: 'Total Pending', value: classwiseModal.totalPendingDisplay || '₹0', color: '#F97316' },
                        ].map((s, i) => (
                            <Box
                                key={i}
                                sx={{
                                    flex: 1,
                                    px: 2.5,
                                    py: 1.5,
                                    borderRight: i === 0 ? '1px solid #F0F0F0' : 'none',
                                    bgcolor: '#FAFAFA',
                                }}
                            >
                                <Typography sx={{ fontSize: '10px', color: '#888' }}>{s.label}</Typography>
                                <Typography sx={{ fontSize: '16px', fontWeight: '800', color: s.color }}>
                                    {s.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Table Header */}
                    <Box sx={{ display: 'flex', px: 2.5, py: 1, bgcolor: '#F7F8FA', borderBottom: '1px solid #EFEFEF' }}>
                        <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#888', width: '35%' }}>
                            ROLL NO. & NAME
                        </Typography>
                        <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#888', width: '25%', textAlign: 'center' }}>
                            SECTION
                        </Typography>
                        <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#888', width: '20%', textAlign: 'center' }}>
                            FEE TYPE
                        </Typography>
                        <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#888', width: '20%', textAlign: 'right' }}>
                            PENDING
                        </Typography>
                    </Box>

                    {/* Defaulter List */}
                    <Box
                        sx={{
                            maxHeight: 340,
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': { width: '4px' },
                            '&::-webkit-scrollbar-thumb': { bgcolor: '#D0D0D0', borderRadius: '10px' },
                        }}
                    >
                        {filteredDefaulters.map((d, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    px: 2.5,
                                    py: 1.5,
                                    borderBottom: '1px solid #F8F8F8',
                                    '&:hover': { bgcolor: `${classwiseModal.color}08` },
                                    transition: '0.15s',
                                }}
                            >
                                {/* Roll + Name */}
                                <Box sx={{ width: '35%', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                    <Box
                                        sx={{
                                            bgcolor: `${classwiseModal.color}15`,
                                            border: `1px solid ${classwiseModal.color}40`,
                                            borderRadius: '6px',
                                            px: 1,
                                            py: 0.3,
                                        }}
                                    >
                                        <Typography sx={{ fontSize: '11px', fontWeight: '700', color: classwiseModal.color }}>
                                            {d.rollNumber}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                        {d.name || '—'}
                                    </Typography>
                                </Box>
                                {/* Section */}
                                <Box sx={{ width: '25%', textAlign: 'center' }}>
                                    <Typography sx={{ fontSize: '12px', color: '#555' }}>{d.section}</Typography>
                                </Box>
                                {/* Fee Type */}
                                <Box sx={{ width: '20%', textAlign: 'center' }}>
                                    <Chip
                                        label={d.feeType}
                                        size="small"
                                        sx={{
                                            fontSize: '10px',
                                            height: '20px',
                                            bgcolor: '#F0F4FF',
                                            color: '#3457D5',
                                            fontWeight: '600',
                                        }}
                                    />
                                </Box>
                                {/* Pending */}
                                <Box sx={{ width: '20%', textAlign: 'right' }}>
                                    <Typography sx={{ fontSize: '13px', fontWeight: '700', color: '#DC2626' }}>
                                        {d.pendingDisplay}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                        {filteredDefaulters.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 5 }}>
                                <Typography sx={{ fontSize: '13px', color: '#999' }}>No results found</Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #F0F0F0', bgcolor: '#FAFAFA' }}>
                    <Button
                        onClick={() => setClasswiseModal((p) => ({ ...p, open: false }))}
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            bgcolor: classwiseModal.color,
                            fontSize: '13px',
                            '&:hover': { bgcolor: classwiseModal.color, opacity: 0.9 },
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
