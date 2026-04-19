import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { Button, Card, FormControlLabel, Grid, IconButton, InputAdornment, Switch, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import NotesIcon from '@mui/icons-material/Notes';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import axios from 'axios';
import {
    postSchoolFeeConcession,
    postEcaFeeConcession,
    postAdditionalFeeConcession,
    postTransportFeeConcession,
    findStudentSchoolFeesBilling,
    findStudentEcaFeesBilling,
    findStudentAdditionalFeesBilling,
    findStudentTransportFeesBilling,
    getUserConcessionDetails,
} from '../../../../Api/Api';

const feeTabs = [
    "School Fee",
    "Transport Fee",
    "ECA Fee",
    "Additional Fee",
];

export default function SpecialConcession() {
    const navigate = useNavigate()
    const location = useLocation();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const token = "123";
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const { selectedTab, rollNumber, selectedYear } = location.state || {};

    const [tabValue, setTabValue] = useState(selectedTab || 0);
    const [rows, setRows] = useState([]);
    const [allFeeData, setAllFeeData] = useState({ 0: [], 1: [], 2: [], 3: [] });

    const [concessionCategory, setConcessionCategory] = useState('');
    const [recommendedBy, setRecommendedBy] = useState('');
    const [recommendationReason, setRecommendationReason] = useState('');
    const [isIndividual, setIsIndividual] = useState(false);

    const getFeeName = (row, tab) => {
        if (tab === 1) {
            return row.place || "-";
        } else if (tab === 2) {
            return `${row.activityName || "-"} - ${row.activityCategory || "-"}`;
        } else if (tab === 3) {
            return row.feeName || "-";
        }
        return row.feeDetails || row.feeName || "-";
    };

    const getActualFeeAmount = (row) => {
        const fee = parseFloat(row.feeAmount || row.amount || 0);
        const existingConcession = parseFloat(row.concessionAmount || 0);
        return fee + existingConcession;
    };

    const isFeePaid = (item) => {
        const actualAmount = getActualFeeAmount(item);
        if (actualAmount <= 0) return true;
        const paid = parseFloat(item.paidAmount ?? item.amountPaid ?? item.paid ?? 0);
        if (paid > 0) return true;
        if (item.status === 'Paid' || item.status === 'Partial' || item.isPaid === true) return true;
        return false;
    };

    const buildRows = (tab, feeData) => {
        const data = feeData?.[tab] || [];
        return data
            .filter((item) => !isFeePaid(item))
            .map((item) => {
                const actualAmount = getActualFeeAmount(item);
                return {
                    ...item,
                    displayName: getFeeName(item, tab),
                    displayAmount: actualAmount,
                    concessionPercent: "",
                    concessionAmount: "",
                    finalFee: actualAmount,
                    rowCategory: "",
                    rowRecommendedBy: "",
                    rowReason: "",
                };
            });
    };

    // Fetch all 4 fee types fresh on mount
    useEffect(() => {
        if (!rollNumber || !selectedYear) return;
        fetchAllFeeData();
    }, [rollNumber, selectedYear]);

    const fetchAllFeeData = async () => {
        setIsLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const params = { RollNumber: rollNumber, Year: selectedYear };

            const [schoolRes, transportRes, ecaRes, additionalRes] = await Promise.allSettled([
                axios.get(findStudentSchoolFeesBilling, { params, headers }),
                axios.get(findStudentTransportFeesBilling, { params, headers }),
                axios.get(findStudentEcaFeesBilling, { params, headers }),
                axios.get(findStudentAdditionalFeesBilling, { params, headers }),
            ]);

            const fetchedData = {
                0: schoolRes.status === 'fulfilled'
                    ? (schoolRes.value.data?.data?.feesElements || [])
                    : [],
                1: transportRes.status === 'fulfilled'
                    ? (transportRes.value.data?.data?.feesElements || [])
                    : [],
                2: ecaRes.status === 'fulfilled'
                    ? (ecaRes.value.data?.data?.feesElements || [])
                    : [],
                3: additionalRes.status === 'fulfilled'
                    ? (additionalRes.value.data?.data?.feesElements || [])
                    : [],
            };

            setAllFeeData(fetchedData);
            setRows(buildRows(tabValue, fetchedData));
        } catch (error) {
            console.error("Error fetching fee data for special concession:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const newRows = buildRows(tabValue, allFeeData);
        setRows(newRows);
        if (rollNumber && selectedYear) {
            fetchExistingConcessions(newRows);
        }
    }, [tabValue, allFeeData]);

    const fetchExistingConcessions = async (currentRows) => {
        try {
            const res = await axios.get(getUserConcessionDetails, {
                params: {
                    rollNumber,
                    year: selectedYear,
                    feeType: feeTabs[tabValue],
                },
                headers: { Authorization: `Bearer ${token}` },
            });

            const concessions = res.data?.data?.data;
            if (!concessions || !Array.isArray(concessions) || concessions.length === 0) return;

            const concessionMap = {};
            concessions.forEach(c => {
                concessionMap[c.feeElementId] = c.concessionAmount;
            });

            const updatedRows = currentRows.map(row => {
                const existingAmount = concessionMap[row.id];
                if (existingAmount !== undefined && existingAmount > 0) {
                    const amount = parseFloat(row.displayAmount);
                    const concessionAmount = parseFloat(existingAmount);
                    const percent = amount > 0 ? ((concessionAmount / amount) * 100).toFixed(2) : '0';
                    return {
                        ...row,
                        concessionAmount: String(concessionAmount),
                        concessionPercent: percent,
                        finalFee: Math.round(amount - concessionAmount),
                    };
                }
                return row;
            });
            setRows(updatedRows);
        } catch {
            // No existing concessions — rows stay as default
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleChange = (index, field, value) => {
        const updatedRows = [...rows];
        let row = { ...updatedRows[index] };
        const amount = parseFloat(row.displayAmount);

        if (field === "percent") {
            const percent = Math.min(parseFloat(value) || 0, 100);
            const concessionAmount = Math.round((amount * percent) / 100);
            row.concessionPercent = parseFloat(value) > 100 ? '100' : value;
            row.concessionAmount = concessionAmount;
            row.finalFee = Math.round(amount - concessionAmount);
        } else if (field === "amount") {
            const concessionAmount = Math.min(parseFloat(value) || 0, amount);
            const percent = ((concessionAmount / amount) * 100).toFixed(2);
            row.concessionAmount = parseFloat(value) > amount ? String(amount) : value;
            row.concessionPercent = percent;
            row.finalFee = Math.round(amount - concessionAmount);
        } else if (field === "rowCategory") {
            row.rowCategory = value;
        } else if (field === "rowRecommendedBy") {
            row.rowRecommendedBy = value;
        } else if (field === "rowReason") {
            row.rowReason = value;
        }

        updatedRows[index] = row;
        setRows(updatedRows);
    };

    const handleResetAll = () => {
        setRows(buildRows(tabValue, allFeeData));
    };

    const totalAmount = rows.reduce((sum, r) => sum + parseFloat(r.finalFee || r.displayAmount || 0), 0);

    const handleApplyConcession = async () => {
        const rowsWithConcession = rows.filter(r => parseFloat(r.concessionAmount) > 0);
        if (rowsWithConcession.length === 0) {
            setMessage("Please enter concession amount for at least one fee item");
            setStatus(false);
            setColor(false);
            setOpen(true);
            return;
        }

        // rollNumber is used as concessionBy (the student identifier)
        const concessionBy = rollNumber || "";

        const getRowDetails = (row) => {
            if (isIndividual) {
                return {
                    concessionCategory: row.rowCategory || '',
                    recommendedBy: row.rowRecommendedBy || '',
                    recommendationReason: row.rowReason || '',
                };
            }
            return {
                concessionCategory,
                recommendedBy,
                recommendationReason,
            };
        };

        let concessionElements = [];

        if (tabValue === 0) {
            concessionElements = rowsWithConcession.map(row => ({
                primeSchoolFeesID: row.primeSchoolFeesID,
                feesElementID: row.id,
                concessionAmount: parseFloat(row.concessionAmount),
                concessionBy,
                ...getRowDetails(row),
            }));
        } else if (tabValue === 1) {
            concessionElements = rowsWithConcession.map(row => ({
                feesElementID: row.id,
                concessionAmount: parseFloat(row.concessionAmount),
                concessionBy,
                ...getRowDetails(row),
            }));
        } else if (tabValue === 2) {
            concessionElements = rowsWithConcession.map(row => ({
                ecaFeesID: row.ecaFeesID,
                feesElementID: row.id,
                concessionAmount: parseFloat(row.concessionAmount),
                concessionBy,
                ...getRowDetails(row),
            }));
        } else if (tabValue === 3) {
            concessionElements = rowsWithConcession.map(row => ({
                additionalFeesID: row.additionalFeesID,
                feesElementID: row.id,
                concessionAmount: parseFloat(row.concessionAmount),
                concessionBy,
                ...getRowDetails(row),
            }));
        }

        const payload = { concessionElements };

        const apiEndpointMap = {
            0: postSchoolFeeConcession,
            1: postTransportFeeConcession,
            2: postEcaFeeConcession,
            3: postAdditionalFeeConcession,
        };
        const apiEndpoint = apiEndpointMap[tabValue];

        setIsLoading(true);
        try {
            const res = await axios.post(apiEndpoint, payload, {
                params: { RollNumber: rollNumber, Year: selectedYear },
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.data.success || res.status === 200) {
                setMessage("Concession applied successfully!");
                setStatus(true);
                setColor(true);
                setOpen(true);
                // Refresh data after applying concession
                fetchAllFeeData();
                setConcessionCategory('');
                setRecommendedBy('');
                setRecommendationReason('');
            } else {
                throw new Error(res.data.message || 'Failed to apply concession');
            }
        } catch (error) {
            console.error("Error applying concession:", error);
            setMessage(error.response?.data?.message || error.message || 'Failed to apply concession');
            setStatus(false);
            setColor(false);
            setOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ width: "100%", }}>
                <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
                {isLoading && <Loader />}
                <Box sx={{ position: "fixed", backgroundColor: "#f2f2f2", px: 2, py: 1.5, borderBottom: "1px solid #ddd", mb: 0.13, zIndex: "1200", width: "100%" }}>
                    <Grid container>
                        <Grid size={{ xs: 12, sm: 12, md: 3, lg: 3 }} sx={{ display: "flex", alignItems: "center" }}>
                            <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px', }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                            </IconButton>
                            <Typography sx={{ fontWeight: "600", fontSize: "19px" }} >Apply special concession</Typography>
                        </Grid>
                        <Grid
                            size={{ xs: 12, sm: 12, md: 6, lg: 6 }}
                            sx={{
                                display: "flex",
                                justifyContent: "start",
                            }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                variant="scrollable"
                                slotProps={{
                                    indicator: {
                                        sx: { display: "none" },
                                    },
                                }}
                                sx={{
                                    backgroundColor: "#fff",
                                    minHeight: "10px",
                                    borderRadius: "50px",
                                    border: "1px solid rgba(0,0,0,0.1)",
                                    "& .MuiTabs-flexContainer": {
                                        justifyContent: "center",
                                    },
                                    "& .MuiTab-root": {
                                        textTransform: "none",
                                        fontSize: "13px",
                                        color: "#555",
                                        fontWeight: "bold",
                                        minWidth: 0,
                                        minHeight: "30px",
                                        height: "30px",
                                        px: 2,
                                        m: 0.8,
                                    },
                                    "& .Mui-selected": {
                                        color: `${websiteSettings.textColor} !important`,
                                        bgcolor: websiteSettings.mainColor,
                                        borderRadius: "50px",
                                        boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                                        border: "1px solid rgba(0,0,0,0.1)",
                                    },
                                }}
                            >
                                {feeTabs.map((label, idx) => (
                                    <Tab key={idx} label={label} />
                                ))}
                            </Tabs>
                        </Grid>
                    </Grid>
                </Box>
                
                <Box sx={{
                    px: 2, pb: 2, pt: "68px", minHeight: "72vh",
                }}>

                    <Card sx={{ mt: 2, mb: 1, border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: 'none', backgroundColor: '#fff' }}>
                        {/* Card header */}
                        <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFA', borderRadius: '12px 12px 0 0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 28, height: 28, borderRadius: '8px', backgroundColor: `${websiteSettings.mainColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <NotesIcon sx={{ fontSize: 16, color: websiteSettings.mainColor }} />
                                </Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                                    Concession Details
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: '#9CA3AF', ml: 0.5 }}>
                                    — {isIndividual ? 'Enter details for each fee separately in the table below' : 'Fill in the details below before applying concession'}
                                </Typography>
                            </Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        size="small"
                                        checked={isIndividual}
                                        onChange={(e) => setIsIndividual(e.target.checked)}
                                        sx={{
                                            "& .MuiSwitch-switchBase.Mui-checked": { color: websiteSettings.mainColor },
                                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: websiteSettings.mainColor },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                                        Separate Details per Fee
                                    </Typography>
                                }
                                sx={{ m: 0 }}
                            />
                        </Box>

                        {/* Fields — shown only when common details mode */}
                        {!isIndividual && (
                        <Grid container spacing={2} sx={{ px: 2.5, py: 2 }} alignItems="flex-end">
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CategoryIcon sx={{ fontSize: 14, color: websiteSettings.mainColor }} />
                                    Concession Category
                                </Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    placeholder="e.g. Merit, Staff Ward, SC/ST..."
                                    value={concessionCategory}
                                    onChange={(e) => setConcessionCategory(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CategoryIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: 40, borderRadius: '8px', fontSize: 13, backgroundColor: '#F9FAFB',
                                            '& fieldset': { borderColor: '#E5E7EB' },
                                            '&:hover fieldset': { borderColor: websiteSettings.mainColor },
                                            '&.Mui-focused fieldset': { borderColor: websiteSettings.mainColor },
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <PersonIcon sx={{ fontSize: 14, color: websiteSettings.mainColor }} />
                                    Recommended By
                                </Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    placeholder="e.g. Principal, Class Teacher..."
                                    value={recommendedBy}
                                    onChange={(e) => setRecommendedBy(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: 40, borderRadius: '8px', fontSize: 13, backgroundColor: '#F9FAFB',
                                            '& fieldset': { borderColor: '#E5E7EB' },
                                            '&:hover fieldset': { borderColor: websiteSettings.mainColor },
                                            '&.Mui-focused fieldset': { borderColor: websiteSettings.mainColor },
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <NotesIcon sx={{ fontSize: 14, color: websiteSettings.mainColor }} />
                                    Recommendation Reason
                                </Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    placeholder="Brief reason for granting this concession..."
                                    value={recommendationReason}
                                    onChange={(e) => setRecommendationReason(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <NotesIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: 40, borderRadius: '8px', fontSize: 13, backgroundColor: '#F9FAFB',
                                            '& fieldset': { borderColor: '#E5E7EB' },
                                            '&:hover fieldset': { borderColor: websiteSettings.mainColor },
                                            '&.Mui-focused fieldset': { borderColor: websiteSettings.mainColor },
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        )}
                    </Card>
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: websiteSettings.mainColor, py: 1, width: "fit-content", px: 4, borderTopLeftRadius: "5px", borderTopRightRadius: "5px", mt: 2 }}>
                        <Typography sx={{ color: websiteSettings.textColor }}>Concession {feeTabs[tabValue]} Detail</Typography>
                    </Box>
                    <TableContainer
                        sx={{
                            border: "1px solid #E601542A",
                            boxShadow: "none",
                            backgroundColor: "#fff",
                        }}
                    >
                        <Table stickyHeader sx={{ width: "100%" }}>
                            <TableHead>
                                <TableRow>
                                    {[
                                        "S.No",
                                        "Fee Details",
                                        "Fee Amount",
                                        "Concession %",
                                        "Concession Amount",
                                        "Final Fee Amount",
                                        ...(isIndividual ? ["Category", "Recommended By", "Reason"] : []),
                                    ].map((header, index) => (
                                        <TableCell
                                            key={index}
                                            sx={{
                                                borderRight: 1,
                                                borderColor: "#E601542A",
                                                textAlign: "center",
                                                backgroundColor: "#B05DD03A",
                                                fontWeight: 600,
                                                fontSize: 14,
                                                color: "#000",
                                            }}
                                        >
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isIndividual ? 9 : 6} sx={{ textAlign: "center", py: 6 }}>
                                            <Typography sx={{ fontSize: "14px", color: "#94a3b8" }}>
                                                No fee records available for concession
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row, rowIndex) => (
                                        <TableRow
                                            key={rowIndex}
                                            sx={{
                                                cursor: "pointer",
                                                backgroundColor: "transparent",
                                                "&:hover": { backgroundColor: "#fafafa" },
                                                transition: "background-color 0.2s ease",
                                            }}
                                        >
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E601542A",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: 14, color: "#333" }}>
                                                    {rowIndex + 1}
                                                </Typography>
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E601542A",
                                                    textAlign: "center",
                                                }}
                                            >
                                                {row.displayName}
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E601542A",
                                                    textAlign: "center",
                                                }}
                                            >
                                                ₹ {row.displayAmount}
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E601542A",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <TextField
                                                    variant="outlined"
                                                    size="small"
                                                    value={row.concessionPercent}
                                                    onChange={(e) =>
                                                        handleChange(rowIndex, "percent", e.target.value)
                                                    }
                                                    sx={{ width: "120px" }}
                                                    slotProps={{
                                                        input: {
                                                            endAdornment: (
                                                                <Typography sx={{ ml: 0.5, fontSize: 13 }}>%</Typography>
                                                            ),
                                                        }
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E601542A",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <TextField
                                                    variant="outlined"
                                                    size="small"
                                                    value={row.concessionAmount}
                                                    onChange={(e) =>
                                                        handleChange(rowIndex, "amount", e.target.value)
                                                    }
                                                    sx={{ width: "120px" }}
                                                    slotProps={{
                                                        input: {
                                                            startAdornment: (
                                                                <Typography sx={{ mr: 0.5, fontSize: 13 }}>₹</Typography>
                                                            ),
                                                        }
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    textAlign: "center",
                                                    fontWeight: 500,
                                                    color: "#333",
                                                    borderRight: isIndividual ? 1 : 0,
                                                    borderColor: "#E601542A",
                                                }}
                                            >
                                                ₹ {row.finalFee}
                                            </TableCell>

                                            {isIndividual && (
                                                <>
                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E601542A", textAlign: "center" }}>
                                                        <TextField
                                                            variant="outlined"
                                                            size="small"
                                                            placeholder="Category"
                                                            value={row.rowCategory}
                                                            onChange={(e) => handleChange(rowIndex, "rowCategory", e.target.value)}
                                                            sx={{ width: "130px", '& .MuiOutlinedInput-root': { fontSize: 12, borderRadius: '6px' } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ borderRight: 1, borderColor: "#E601542A", textAlign: "center" }}>
                                                        <TextField
                                                            variant="outlined"
                                                            size="small"
                                                            placeholder="Recommended By"
                                                            value={row.rowRecommendedBy}
                                                            onChange={(e) => handleChange(rowIndex, "rowRecommendedBy", e.target.value)}
                                                            sx={{ width: "130px", '& .MuiOutlinedInput-root': { fontSize: 12, borderRadius: '6px' } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <TextField
                                                            variant="outlined"
                                                            size="small"
                                                            placeholder="Reason"
                                                            value={row.rowReason}
                                                            onChange={(e) => handleChange(rowIndex, "rowReason", e.target.value)}
                                                            sx={{ width: "150px", '& .MuiOutlinedInput-root': { fontSize: 12, borderRadius: '6px' } }}
                                                        />
                                                    </TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))
                                )}

                                {rows.length > 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={isIndividual ? 8 : 5}
                                            sx={{
                                                textAlign: "right",
                                                fontWeight: 600,
                                                borderRight: 1,
                                                borderColor: "#E601542A",
                                            }}
                                        >
                                            <Typography sx={{ color: "green" }}>Total Amount</Typography>
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                textAlign: "center",
                                                fontWeight: 600,
                                                color: "green",
                                            }}
                                        >
                                            ₹ {totalAmount.toLocaleString("en-IN")}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", pb: 2 }}>
                    <Button
                        onClick={handleResetAll}
                        sx={{
                            border: "1px solid #000",
                            borderRadius: "30px",
                            textTransform: "none",
                            width: "100px",
                            height: "30px",
                            color: "#000"
                        }}>
                        Reset All
                    </Button>
                    <Button
                        onClick={handleApplyConcession}
                        sx={{
                            backgroundColor: websiteSettings.mainColor,
                            borderRadius: "30px",
                            textTransform: "none",
                            ml: "10px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            border: "1px solid rgba(0,0,0,0.1)",
                            px: 3,
                            height: "30px",
                            color: websiteSettings.textColor
                        }}>
                        Apply Concession
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}
