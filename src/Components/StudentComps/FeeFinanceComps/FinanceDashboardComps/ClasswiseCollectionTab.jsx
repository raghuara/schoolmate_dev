import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    TextField,
    InputAdornment,
    LinearProgress,
    Button,
    MenuItem,
    Autocomplete,
    Paper,
    Chip,
    IconButton,
    Dialog,
    DialogContent,
    DialogActions,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { classWiseCollection } from '../../../../Api/Api';
import axios from 'axios';
import {
    DASH, RADIUS, KPI_TONES, Panel, SolidStatCard, EmptyNote,
} from '../../../DashBoardComps/dashboardTheme';

const token = "123";

const FEE_TYPES = ['School Fee', 'Transport Fee', 'ECA Fee', 'Additional Fee'];

// A grade's colour says how its collection is going, not which grade it is -
// that way the grid can be read at a glance for the ones falling behind.
const rateTone = (rate) => {
    if (rate >= 90) return { color: DASH.green, bg: DASH.greenLight, border: '#BBF7D0', label: 'On track' };
    if (rate >= 70) return { color: DASH.cyan, bg: DASH.cyanLight, border: '#A5F3FC', label: 'Fair' };
    if (rate >= 50) return { color: DASH.amber, bg: DASH.amberLight, border: '#FDE68A', label: 'Behind' };
    return { color: DASH.red, bg: DASH.redLight, border: '#FECACA', label: 'Critical' };
};

const fieldSx = (width) => ({
    width,
    '& .MuiOutlinedInput-root': {
        height: 32,
        fontSize: '12.5px',
        fontWeight: 600,
        borderRadius: RADIUS,
        bgcolor: '#fff',
        '& fieldset': { borderColor: DASH.line },
        '&:hover fieldset': { borderColor: '#9AA3AF' },
        '&.Mui-focused fieldset': { borderColor: DASH.primary, borderWidth: '1px' },
    },
});

const TH = ({ children, align }) => (
    <TableCell
        align={align}
        sx={{
            bgcolor: DASH.surface,
            borderBottom: `1px solid ${DASH.line}`,
            color: DASH.muted,
            fontSize: '10.5px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            py: 1,
            whiteSpace: 'nowrap',
        }}
    >
        {children}
    </TableCell>
);

const TD = ({ children, align }) => (
    <TableCell align={align} sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, py: 1 }}>
        {children}
    </TableCell>
);

export default function ClasswiseCollectionTab({ selectedYear }) {
    const grades = useSelector(selectGrades);
    const [isLoading, setIsLoading] = useState(false);
    const [classwiseData, setClasswiseData] = useState([]);
    const [selectedFeeType, setSelectedFeeType] = useState('School Fee');
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [classwiseModal, setClasswiseModal] = useState({ open: false, grade: '', tone: rateTone(100), defaulters: [], totalDefaulters: 0, totalPendingDisplay: '₹0' });
    const [defaulterSearch, setDefaulterSearch] = useState('');

    const handleGradeChange = (newValue) => {
        setSelectedGradeId(newValue ? newValue.id : null);
    };

    useEffect(() => {
        fetchOverviewData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYear, selectedFeeType]);

    const fetchOverviewData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(classWiseCollection, {
                params: { year: selectedYear, feeType: selectedFeeType },
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

    // Roll-ups across whatever grades are on screen. Counts and rates only -
    // the money arrives pre-formatted per grade, so it is not summed here.
    const totalStudents = displayedData.reduce((sum, g) => sum + (Number(g.studentsCount) || 0), 0);
    const totalDefaulters = displayedData.reduce((sum, g) => sum + (Number(g.defaultersCount) || 0), 0);
    const avgRate = displayedData.length
        ? displayedData.reduce((sum, g) => sum + (Number(g.collectionRate) || 0), 0) / displayedData.length
        : 0;

    const cards = [
        {
            label: selectedGrade ? 'Grade' : 'Grades',
            value: displayedData.length,
            note: `${selectedFeeType} this year`,
            tone: KPI_TONES.orange,
        },
        {
            label: 'Students',
            value: totalStudents.toLocaleString(),
            note: 'Across the grades shown',
            tone: KPI_TONES.blue,
        },
        {
            label: 'Avg Collection Rate',
            value: `${avgRate.toFixed(1)}%`,
            note: 'Mean across the grades shown',
            tone: KPI_TONES.green,
        },
        {
            label: 'Defaulters',
            value: totalDefaulters.toLocaleString(),
            note: 'Students with pending fees',
            tone: KPI_TONES.pink,
        },
    ];

    return (
        <>
            <Box>
                {/* ── Collection at a glance ── */}
                <Grid container spacing={2} sx={{ mb: 2, alignItems: 'stretch' }}>
                    {cards.map((card) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }} key={card.label}>
                            <SolidStatCard
                                label={card.label}
                                value={isLoading ? <Skeleton width={90} height={28} /> : card.value}
                                note={isLoading ? '' : card.note}
                                tone={card.tone}
                            />
                        </Grid>
                    ))}
                </Grid>

                <Panel
                    title="Grade-wise Fee Collection"
                    subtitle={
                        isLoading
                            ? 'Loading grades…'
                            : `${displayedData.length} grade${displayedData.length === 1 ? '' : 's'} · ${selectedFeeType}`
                    }
                    accent={DASH.primary}
                    right={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <TextField
                                select
                                size="small"
                                value={selectedFeeType}
                                onChange={(e) => setSelectedFeeType(e.target.value)}
                                sx={fieldSx(160)}
                            >
                                {FEE_TYPES.map((t) => (
                                    <MenuItem key={t} value={t} sx={{ fontSize: '12.5px' }}>{t}</MenuItem>
                                ))}
                            </TextField>

                            <Autocomplete
                                disablePortal
                                options={grades}
                                getOptionLabel={(option) => option.sign}
                                value={grades.find((item) => item.id === selectedGradeId) || null}
                                onChange={(event, newValue) => handleGradeChange(newValue)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                PaperComponent={(props) => (
                                    <Paper
                                        {...props}
                                        style={{ ...props.style, maxHeight: '150px', backgroundColor: '#000', color: '#fff' }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} className="classdropdownOptions">
                                        {option.sign}
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="All classes"
                                        sx={fieldSx(150)}
                                        slotProps={{
                                            input: { ...params.InputProps, sx: { paddingRight: 0, height: 32, fontSize: '12.5px', fontWeight: 600 } },
                                        }}
                                    />
                                )}
                            />
                        </Box>
                    }
                    bodySx={{ p: 1.8 }}
                >
                    {isLoading ? (
                        <Grid container spacing={1.8}>
                            {[0, 1, 2, 3].map((i) => (
                                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} key={i}>
                                    <Skeleton variant="rounded" height={186} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : displayedData.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <SchoolIcon sx={{ fontSize: 40, color: DASH.line }} />
                            <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: DASH.ink, mt: 1 }}>
                                No collection data for this view
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: DASH.muted, mt: 0.4 }}>
                                Try another fee type, or clear the class filter.
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={1.8}>
                            {displayedData.map((item) => {
                                const rate = Number(item.collectionRate) || 0;
                                const tone = rateTone(rate);
                                return (
                                    <Grid key={item.grade} size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: 'flex' }}>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                overflow: 'hidden',
                                                width: '100%',
                                                p: 1.8,
                                                pl: 2.1,
                                                borderRadius: RADIUS,
                                                border: `1px solid ${DASH.line}`,
                                                bgcolor: '#fff',
                                                transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
                                                '&::before': { content: '""', position: 'absolute', left: 0, top: 0, height: '100%', width: 3, bgcolor: tone.color },
                                                '&:hover': { transform: 'translateY(-2px)', borderColor: `${tone.color}66`, boxShadow: '0 6px 18px rgba(17,24,39,0.09)' },
                                            }}
                                        >
                                            {/* Identity + rate */}
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.4 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                                                    <Box
                                                        sx={{
                                                            minWidth: 40, height: 40, px: 0.8, borderRadius: RADIUS,
                                                            bgcolor: tone.bg, border: `1px solid ${tone.border}`, color: tone.color,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '14px', fontWeight: 800, flexShrink: 0,
                                                        }}
                                                    >
                                                        {item.gradeDisplay}
                                                    </Box>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: DASH.ink, lineHeight: 1.25 }} noWrap>
                                                            Grade {item.gradeDisplay}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '11px', color: DASH.faint }} noWrap>
                                                            {item.sectionsCount} section{item.sectionsCount !== 1 ? 's' : ''} · {item.studentsCount} student{item.studentsCount !== 1 ? 's' : ''}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: DASH.ink, lineHeight: 1 }}>
                                                        {item.collectionRateDisplay}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: DASH.faint, mt: 0.4 }}>
                                                        Collected
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <LinearProgress
                                                variant="determinate"
                                                value={Math.min(rate, 100)}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: RADIUS,
                                                    bgcolor: DASH.lineSoft,
                                                    mb: 1.4,
                                                    '& .MuiLinearProgress-bar': { bgcolor: tone.color, borderRadius: RADIUS },
                                                }}
                                            />

                                            {/* Money split */}
                                            <Box sx={{ display: 'flex', gap: 1, mb: 1.4 }}>
                                                <Box sx={{ flex: 1, px: 1.2, py: 1, borderRadius: RADIUS, bgcolor: DASH.greenLight, border: '1px solid #BBF7D0' }}>
                                                    <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: DASH.green }}>
                                                        Collected
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '14.5px', fontWeight: 700, color: DASH.ink, mt: 0.2 }} noWrap>
                                                        {item.collectedDisplay}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ flex: 1, px: 1.2, py: 1, borderRadius: RADIUS, bgcolor: DASH.amberLight, border: '1px solid #FDE68A' }}>
                                                    <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#B45309' }}>
                                                        Pending
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '14.5px', fontWeight: 700, color: DASH.ink, mt: 0.2 }} noWrap>
                                                        {item.pendingDisplay}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Who is behind */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pt: 1.2, borderTop: `1px solid ${DASH.lineSoft}` }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0 }}>
                                                    <PendingActionsIcon sx={{ fontSize: 15, color: item.defaultersCount > 0 ? DASH.red : DASH.faint }} />
                                                    <Typography sx={{ fontSize: '11.5px', color: DASH.muted }} noWrap>
                                                        {item.defaultersCount} defaulter{item.defaultersCount !== 1 ? 's' : ''}
                                                    </Typography>
                                                    <Chip
                                                        label={tone.label}
                                                        size="small"
                                                        sx={{
                                                            ml: 0.4, height: 19, borderRadius: RADIUS,
                                                            bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`,
                                                            fontSize: '10px', fontWeight: 700,
                                                        }}
                                                    />
                                                </Box>
                                                <Button
                                                    size="small"
                                                    disabled={!item.defaultersSummary?.items?.length}
                                                    onClick={() => {
                                                        setDefaulterSearch('');
                                                        setClasswiseModal({
                                                            open: true,
                                                            grade: item.gradeDisplay,
                                                            tone,
                                                            defaulters: item.defaultersSummary.items,
                                                            totalDefaulters: item.defaultersSummary.totalDefaulters,
                                                            totalPendingDisplay: item.defaultersSummary.totalPendingDisplay,
                                                        });
                                                    }}
                                                    sx={{
                                                        textTransform: 'none', fontSize: '11.5px', fontWeight: 700,
                                                        color: tone.color, bgcolor: '#fff',
                                                        border: `1px solid ${tone.color}40`, borderRadius: RADIUS,
                                                        height: 28, px: 1.4, flexShrink: 0,
                                                        '&:hover': { bgcolor: tone.bg, borderColor: tone.color },
                                                        '&.Mui-disabled': { color: DASH.faint, borderColor: DASH.lineSoft },
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </Panel>
            </Box>

            {/* ── Defaulters for one grade ── */}
            <Dialog
                open={classwiseModal.open}
                onClose={() => setClasswiseModal((p) => ({ ...p, open: false }))}
                maxWidth="sm"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: '12px', overflow: 'hidden' } } }}
            >
                <Box sx={{ height: 3, bgcolor: classwiseModal.tone.color }} />

                <Box sx={{ px: 2, py: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                        <Box
                            sx={{
                                minWidth: 34, height: 34, px: 0.8, borderRadius: RADIUS,
                                bgcolor: classwiseModal.tone.bg, border: `1px solid ${classwiseModal.tone.border}`,
                                color: classwiseModal.tone.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '13px', fontWeight: 800, flexShrink: 0,
                            }}
                        >
                            {classwiseModal.grade}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                Grade {classwiseModal.grade} defaulters
                            </Typography>
                            <Typography sx={{ fontSize: '11.5px', color: DASH.muted, mt: 0.2 }}>
                                {classwiseModal.totalDefaulters || 0} student{(classwiseModal.totalDefaulters || 0) !== 1 ? 's' : ''} with pending fees
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={() => setClasswiseModal((p) => ({ ...p, open: false }))}>
                        <CloseIcon sx={{ fontSize: 18, color: DASH.muted }} />
                    </IconButton>
                </Box>

                <DialogContent sx={{ p: 0 }}>
                    {/* Totals + search */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.4, bgcolor: DASH.surface, borderTop: `1px solid ${DASH.line}`, borderBottom: `1px solid ${DASH.line}`, flexWrap: 'wrap' }}>
                        <Box>
                            <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: DASH.muted }}>
                                Defaulters
                            </Typography>
                            <Typography sx={{ fontSize: '16px', fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                {classwiseModal.totalDefaulters || 0}
                            </Typography>
                        </Box>
                        <Box sx={{ width: '1px', alignSelf: 'stretch', bgcolor: DASH.line }} />
                        <Box>
                            <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: DASH.muted }}>
                                Total Pending
                            </Typography>
                            <Typography sx={{ fontSize: '16px', fontWeight: 700, color: DASH.red, lineHeight: 1.2 }}>
                                {classwiseModal.totalPendingDisplay || '₹0'}
                            </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <TextField
                            size="small"
                            placeholder="Search roll no. or name…"
                            value={defaulterSearch}
                            onChange={(e) => setDefaulterSearch(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{
                                width: { xs: '100%', sm: 220 },
                                '& .MuiOutlinedInput-root': {
                                    height: 32, fontSize: '12.5px', borderRadius: RADIUS, bgcolor: '#fff',
                                    '& fieldset': { borderColor: DASH.line },
                                    '&:hover fieldset': { borderColor: '#9AA3AF' },
                                    '&.Mui-focused fieldset': { borderColor: classwiseModal.tone.color, borderWidth: '1px' },
                                },
                            }}
                        />
                    </Box>

                    <TableContainer sx={{ maxHeight: 360 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TH>Student</TH>
                                    <TH>Section</TH>
                                    <TH>Fee Type</TH>
                                    <TH align="right">Pending</TH>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredDefaulters.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ borderBottom: 'none' }}>
                                            <EmptyNote
                                                text={
                                                    (classwiseModal.defaulters || []).length === 0
                                                        ? 'No defaulters in this grade.'
                                                        : `No student matches “${defaulterSearch}”.`
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDefaulters.map((d, i) => (
                                        <TableRow
                                            key={i}
                                            sx={{ transition: 'background-color 0.15s', '&:hover': { bgcolor: DASH.surface } }}
                                        >
                                            <TD>
                                                <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: DASH.ink }}>
                                                    {d.name || '—'}
                                                </Typography>
                                                <Typography sx={{ fontSize: '10.5px', color: DASH.faint }}>
                                                    {d.rollNumber}
                                                </Typography>
                                            </TD>
                                            <TD>
                                                <Typography sx={{ fontSize: '12px', color: DASH.muted }}>{d.section}</Typography>
                                            </TD>
                                            <TD>
                                                <Chip
                                                    label={d.feeType}
                                                    size="small"
                                                    sx={{
                                                        height: 20, borderRadius: RADIUS,
                                                        bgcolor: DASH.blueLight, color: DASH.blue,
                                                        fontSize: '10.5px', fontWeight: 700,
                                                    }}
                                                />
                                            </TD>
                                            <TD align="right">
                                                <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: DASH.red, whiteSpace: 'nowrap' }}>
                                                    {d.pendingDisplay}
                                                </Typography>
                                            </TD>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>

                <DialogActions sx={{ px: 2, py: 1.4, borderTop: `1px solid ${DASH.line}` }}>
                    <Button
                        onClick={() => setClasswiseModal((p) => ({ ...p, open: false }))}
                        sx={{
                            textTransform: 'none', fontSize: '12.5px', fontWeight: 700,
                            color: DASH.text, bgcolor: '#fff',
                            border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
                            px: 2, height: 34,
                            '&:hover': { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
