import { Box, Grid, IconButton, Typography, Chip, Divider, Button, TextField, Autocomplete, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';
import Loader from '../../Loader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import axios from 'axios';
import { fetchAllSubjects, fetchSubjectsByID, getExamsByGradeId, updatePrimaryAndSecondarySubjects } from '../../../Api/Api';
import { selectGrades } from '../../../Redux/Slices/DropdownController';
import SnackBar from '../../SnackBar';

export default function SubjectCreatePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const user = useSelector((state) => state.auth);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const rollNumber = user.rollNumber;
    const userType = user.userType;
    const token = "123";
    const grades = useSelector(selectGrades);

    const [allSubjectData, setAllSubjectData] = useState([]);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedExam, setSelectedExam] = useState([]);
    const [selectedExamValue, setSelectedExamValue] = useState("");
    const [primarySubjects, setPrimarySubjects] = useState("");
    const [secondarySubjects, setSecondarySubjects] = useState("");
    const [primaryInput, setPrimaryInput] = useState("");
    const [secondaryInput, setSecondaryInput] = useState("");
    const [openConfirm, setOpenConfirm] = useState(false);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const handleAddPrimary = () => {
        if (primaryInput.trim() !== "") {
            setPrimarySubjects([...primarySubjects, primaryInput.trim()]);
            setPrimaryInput("");
        }
    };

    const handleAddSecondary = () => {
        if (secondaryInput.trim() !== "") {
            setSecondarySubjects([...secondarySubjects, secondaryInput.trim()]);
            setSecondaryInput("");
        }
    };

    const handleReset = () => {
        setPrimarySubjects([]);
        setSecondarySubjects([]);
    };

    const handleOpenConfirm = () => setOpenConfirm(true);
    const handleCloseConfirm = () => setOpenConfirm(false);

    const handleConfirmSave = async () => {
        setOpenConfirm(false);
        await handleSave();
    };

    useEffect(() => {
        fetchAllExam();
    }, []);

    const fetchAllExam = async () => {
        setIsLoading(true);
        try {
            await axios.get(fetchAllSubjects, {
                params: { RollNumber: rollNumber, UserType: userType },
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (grades.length > 0 && selectedGradeId === null) {
            setSelectedGradeId(grades[0].id);
        }
    }, [grades]);

    useEffect(() => {
        fetchSelectedExam();
    }, [selectedGradeId]);

    const fetchSelectedExam = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getExamsByGradeId, {
                params: { gradeId: selectedGradeId },
                headers: { Authorization: `Bearer ${token}` },
            });
            const exams = res.data.exams || [];
            setSelectedExam(exams);
            setSelectedExamValue(exams.length > 0 ? exams[0] : "");
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedGradeId) {
            fetchSelectedSubjects();
        }
    }, [selectedGradeId]);

    const fetchSelectedSubjects = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(fetchSubjectsByID, {
                params: { gradeId: selectedGradeId },
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllSubjectData(res.data);
            if (res.data?.exams?.length > 0) {
                setSelectedExamValue(res.data.exams[0].exam);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedExamData = allSubjectData?.exams?.find(
        (exam) => exam.exam === selectedExamValue
    );

    const mergedExamData = {
        primarySubjects: [
            ...(selectedExamData?.primarySubjects || []),
            ...primarySubjects,
        ],
        secondarySubjects: [
            ...(selectedExamData?.secondarySubjects || []),
            ...secondarySubjects,
        ],
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const sendData = {
                gradeID: String(selectedGradeId),
                exam: selectedExamValue || "",
                ...mergedExamData,
            };
            await axios.post(updatePrimaryAndSecondarySubjects, sendData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOpen(true); setColor(true); setStatus(true);
            setMessage("Updated successfully");
            await fetchSelectedSubjects();
            setPrimarySubjects([]);
            setSecondarySubjects([]);
        } catch (error) {
            const apiMessage = error.response?.data?.message || "An unexpected error occurred.";
            setMessage(apiMessage);
            setOpen(true); setColor(false); setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            {/* Header */}
            <Box sx={{ backgroundColor: '#f2f2f2', p: 1.5, borderRadius: '10px 10px 10px 0px', borderBottom: '1px solid #ddd' }}>
                <Grid container alignItems="center">
                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton sx={{ width: 27, height: 27 }} onClick={() => navigate(-1)}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 600, fontSize: '20px' }}>Create Subject</Typography>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    {/* Left panel — Form */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            bgcolor: '#fff',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            height: '75vh',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            {/* Panel header */}
                            <Box sx={{ bgcolor: '#f8f8f8', px: 2, py: 1.5, borderBottom: '1px solid #e8e8e8' }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>Subject Details</Typography>
                                <Typography sx={{ fontSize: '12px', color: '#888' }}>Select class & exam, then add subjects</Typography>
                            </Box>

                            <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
                                <Grid container spacing={2}>
                                    {/* Select Class */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                            Select Class
                                        </Typography>
                                        <Autocomplete
                                            size="small"
                                            options={grades}
                                            getOptionLabel={(option) => option.sign}
                                            value={grades.find((g) => g.id === selectedGradeId) || null}
                                            onChange={(event, newValue) => {
                                                setSelectedGradeId(newValue?.id || null);
                                                setPrimarySubjects([]);
                                                setSecondarySubjects([]);
                                            }}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            renderInput={(params) => (
                                                <TextField {...params} variant="outlined" size="small" />
                                            )}
                                        />
                                    </Grid>

                                    {/* Select Exam */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                            Select Exam
                                        </Typography>
                                        <Autocomplete
                                            size="small"
                                            options={selectedExam}
                                            value={selectedExamValue || ""}
                                            onChange={(event, newValue) => {
                                                setSelectedExamValue(newValue);
                                                setPrimarySubjects([]);
                                                setSecondarySubjects([]);
                                            }}
                                            renderInput={(params) => (
                                                <TextField {...params} variant="outlined" size="small" />
                                            )}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Divider />
                                    </Grid>

                                    {/* Primary Subjects */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                            Primary Subjects
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                placeholder="e.g. Mathematics, Science"
                                                value={primaryInput}
                                                slotProps={{ input: { inputProps: { maxLength: 50 } } }}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^[A-Za-z0-9 ]*$/.test(value)) setPrimaryInput(value);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && primaryInput.trim()) handleAddPrimary();
                                                }}
                                            />
                                            <Button
                                                variant="contained"
                                                disabled={!primaryInput.trim()}
                                                onClick={handleAddPrimary}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: '8px',
                                                    bgcolor: '#1976D2',
                                                    '&:hover': { bgcolor: '#1565C0' },
                                                    whiteSpace: 'nowrap',
                                                    minWidth: '70px',
                                                }}
                                            >
                                                Add
                                            </Button>
                                        </Box>

                                        {/* Added primary subject chips */}
                                        {Array.isArray(primarySubjects) && primarySubjects.length > 0 && (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7, mt: 1, p: 1.5, border: '1px solid #e8e8e8', borderRadius: '8px', bgcolor: '#fafafa' }}>
                                                {primarySubjects.map((sub, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={sub}
                                                        size="small"
                                                        onDelete={() => setPrimarySubjects(primarySubjects.filter((_, i) => i !== idx))}
                                                        deleteIcon={<CloseIcon sx={{ fontSize: '12px !important' }} />}
                                                        sx={{
                                                            bgcolor: '#DBEFFE',
                                                            color: '#1565C0',
                                                            fontWeight: 600,
                                                            fontSize: '12px',
                                                            height: '26px',
                                                            border: '1px solid #1976D233',
                                                            '& .MuiChip-deleteIcon': { color: '#999', '&:hover': { color: '#e53935' } },
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    </Grid>

                                    {/* Secondary Subjects */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                            Secondary Subjects
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                placeholder="e.g. Drawing, Music"
                                                value={secondaryInput}
                                                slotProps={{ input: { inputProps: { maxLength: 50 } } }}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^[A-Za-z0-9 ]*$/.test(value)) setSecondaryInput(value);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && secondaryInput.trim()) handleAddSecondary();
                                                }}
                                            />
                                            <Button
                                                variant="contained"
                                                disabled={!secondaryInput.trim()}
                                                onClick={handleAddSecondary}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: '8px',
                                                    bgcolor: '#388E3C',
                                                    '&:hover': { bgcolor: '#2E7D32' },
                                                    whiteSpace: 'nowrap',
                                                    minWidth: '70px',
                                                }}
                                            >
                                                Add
                                            </Button>
                                        </Box>

                                        {/* Added secondary subject chips */}
                                        {Array.isArray(secondarySubjects) && secondarySubjects.length > 0 && (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7, mt: 1, p: 1.5, border: '1px solid #e8e8e8', borderRadius: '8px', bgcolor: '#fafafa' }}>
                                                {secondarySubjects.map((sub, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={sub}
                                                        size="small"
                                                        onDelete={() => setSecondarySubjects(secondarySubjects.filter((_, i) => i !== idx))}
                                                        deleteIcon={<CloseIcon sx={{ fontSize: '12px !important' }} />}
                                                        sx={{
                                                            bgcolor: '#D9F0DB',
                                                            color: '#2E7D32',
                                                            fontWeight: 600,
                                                            fontSize: '12px',
                                                            height: '26px',
                                                            border: '1px solid #388E3C33',
                                                            '& .MuiChip-deleteIcon': { color: '#999', '&:hover': { color: '#e53935' } },
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Panel footer — actions */}
                            <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button
                                    onClick={handleReset}
                                    sx={{ textTransform: 'none', color: '#555', borderRadius: '20px', border: '1px solid #ddd' }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleOpenConfirm}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '20px',
                                        bgcolor: websiteSettings.mainColor,
                                        '&:hover': { bgcolor: websiteSettings.mainColor, opacity: 0.9 },
                                        px: 3,
                                    }}
                                >
                                    Save
                                </Button>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right panel — Live Preview */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            bgcolor: '#fff',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            height: '75vh',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            {/* Panel header */}
                            <Box sx={{ bgcolor: '#f8f8f8', px: 2, py: 1.5, borderBottom: '1px solid #e8e8e8' }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>Live Preview</Typography>
                                <Typography sx={{ fontSize: '12px', color: '#888' }}>Subjects update as you add them</Typography>
                            </Box>

                            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                                <TableContainer>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ bgcolor: '#faf6fc', fontWeight: 700, fontSize: '12px', textAlign: 'center', borderRight: '1px solid #e0e0e0', width: '50px' }}>
                                                    S.No
                                                </TableCell>
                                                <TableCell sx={{ bgcolor: '#faf6fc', fontWeight: 700, fontSize: '12px', textAlign: 'center', borderRight: '1px solid #e0e0e0' }}>
                                                    Primary Subject
                                                </TableCell>
                                                <TableCell sx={{ bgcolor: '#faf6fc', fontWeight: 700, fontSize: '12px', textAlign: 'center' }}>
                                                    Secondary Subject
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(() => {
                                                const maxLength = Math.max(
                                                    mergedExamData.primarySubjects.length,
                                                    mergedExamData.secondarySubjects.length
                                                );

                                                if (maxLength === 0) {
                                                    return (
                                                        <TableRow>
                                                            <TableCell colSpan={3} sx={{ textAlign: 'center', color: '#bbb', fontSize: '13px', fontStyle: 'italic', py: 4 }}>
                                                                No subjects added yet
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }

                                                return Array.from({ length: maxLength }).map((_, idx) => (
                                                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                                                        <TableCell sx={{ textAlign: 'center', fontWeight: 600, fontSize: '13px', borderRight: '1px solid #e0e0e0' }}>
                                                            {idx + 1}
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: 'center', fontSize: '13px', borderRight: '1px solid #e0e0e0' }}>
                                                            {mergedExamData.primarySubjects[idx] ? (
                                                                <Chip label={mergedExamData.primarySubjects[idx]} size="small"
                                                                    sx={{ bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 600, fontSize: '12px', height: '24px' }}
                                                                />
                                                            ) : '-'}
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: 'center', fontSize: '13px' }}>
                                                            {mergedExamData.secondarySubjects[idx] ? (
                                                                <Chip label={mergedExamData.secondarySubjects[idx]} size="small"
                                                                    sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: '12px', height: '24px' }}
                                                                />
                                                            ) : '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                ));
                                            })()}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Confirm Save Dialog */}
            <Dialog open={openConfirm} onClose={handleCloseConfirm} maxWidth="xs" fullWidth>
                <Box sx={{ bgcolor: '#f2f2f2', px: 2.5, py: 1.5, borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReportProblemOutlinedIcon sx={{ color: '#FF9800', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>Confirm Save</Typography>
                </Box>
                <DialogContent sx={{ pt: 2, pb: 1 }}>
                    <DialogContentText sx={{ fontSize: '14px', color: '#555' }}>
                        Please review before saving. Once you save, you will not be able to edit or delete these subjects.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2, pt: 1 }}>
                    <Button onClick={handleCloseConfirm}
                        sx={{ textTransform: 'none', color: '#555', borderRadius: '20px', border: '1px solid #ddd' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmSave}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '20px',
                            bgcolor: websiteSettings.mainColor,
                            '&:hover': { bgcolor: websiteSettings.mainColor, opacity: 0.9 },
                            px: 3,
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
