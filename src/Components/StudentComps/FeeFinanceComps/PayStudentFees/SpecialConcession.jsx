import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import SnackBar from '../../../SnackBar'
import { Button, Card, FormControlLabel, Grid, IconButton, InputAdornment, Switch, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import NotesIcon from '@mui/icons-material/Notes';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import axios from 'axios';
import { DASH, RADIUS } from "../../../DashBoardComps/dashboardTheme";
import { FeeTableSkeleton, ConcessionFormSkeleton } from "./BillingSkeletons";
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

    const user = useSelector((state) => state.auth);
    const userRollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    
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

    // Remaining payable amount — what can still be collected / conceded for this fee
    const getPendingAmount = (item) => {
        const pending = parseFloat(item.pendingAmount);
        if (Number.isFinite(pending)) return Math.max(pending, 0);
        // Fallback when the API doesn't send pendingAmount
        const gross = getActualFeeAmount(item);
        const paid = parseFloat(item.paidAmount ?? item.amountPaid ?? item.paid ?? 0);
        return Math.max(gross - paid, 0);
    };

    // Only FULLY paid fees are blocked. Unpaid AND partially paid fees are allowed.
    const isFullyPaid = (item) => {
        const actualAmount = getActualFeeAmount(item);
        if (actualAmount <= 0) return true;            // nothing to concede
        return getPendingAmount(item) <= 0;            // fully paid → no pending left
    };

    const buildRows = (tab, feeData) => {
        const data = feeData?.[tab] || [];
        return data
            .filter((item) => !isFullyPaid(item))
            .map((item) => {
                const actualAmount = getActualFeeAmount(item);
                const pending = getPendingAmount(item);
                return {
                    ...item,
                    displayName: getFeeName(item, tab),
                    displayAmount: actualAmount,
                    pendingAmount: pending,
                    maxConcession: pending,            // concession can't exceed what's still owed
                    concessionPercent: "",
                    concessionAmount: "",
                    finalFee: actualAmount,
                    rowCategory: "",
                    rowRecommendedBy: "",
                    rowReason: "",
                };
            });
    };
 
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

            // No saved concessions for this tab — reset toggle + common fields, leave rows blank
            if (!concessions || !Array.isArray(concessions) || concessions.length === 0) {
                setIsIndividual(false);
                setConcessionCategory('');
                setRecommendedBy('');
                setRecommendationReason('');
                return;
            }

            // Lookup by feeElementId so we can fill the right row
            const concessionMap = {};
            concessions.forEach((c) => { concessionMap[c.feeElementId] = c; });

            // Detect mode from saved records:
            //   "Y" on ANY record → per-fee (turn toggle ON)
            //   otherwise → common mode (toggle OFF). Old records with "" fall here.
            const perFeeMode = concessions.some((c) => c.isSeparateDetailsPerFee === 'Y');
            setIsIndividual(perFeeMode);

            if (perFeeMode) {
                // Per-fee mode — clear common fields; each row will carry its own
                setConcessionCategory('');
                setRecommendedBy('');
                setRecommendationReason('');
            } else {
                // Common mode — populate top-level fields from the first record that has any detail.
                // If none has details (e.g. old records with all empty strings), fields stay empty.
                const firstWithDetails =
                    concessions.find((c) =>
                        (c.concessionCategory || '').trim() ||
                        (c.recommendedBy || '').trim() ||
                        (c.recommendationReason || '').trim()
                    ) || concessions[0];
                setConcessionCategory(firstWithDetails.concessionCategory || '');
                setRecommendedBy(firstWithDetails.recommendedBy || '');
                setRecommendationReason(firstWithDetails.recommendationReason || '');
            }

            // Populate each row with its saved concession amount + per-row details (when in per-fee mode)
            const updatedRows = currentRows.map((row) => {
                const existing = concessionMap[row.id];
                if (existing && parseFloat(existing.concessionAmount) > 0) {
                    const amount = parseFloat(row.displayAmount);
                    const concessionAmount = parseFloat(existing.concessionAmount);
                    const percent = amount > 0 ? ((concessionAmount / amount) * 100).toFixed(2) : '0';
                    return {
                        ...row,
                        concessionAmount: String(concessionAmount),
                        concessionPercent: percent,
                        finalFee: Math.round(amount - concessionAmount),
                        // Fill per-row detail fields only when we're in per-fee mode
                        rowCategory: perFeeMode ? (existing.concessionCategory || '') : (row.rowCategory || ''),
                        rowRecommendedBy: perFeeMode ? (existing.recommendedBy || '') : (row.rowRecommendedBy || ''),
                        rowReason: perFeeMode ? (existing.recommendationReason || '') : (row.rowReason || ''),
                    };
                }
                return row;
            });
            setRows(updatedRows);
        } catch {
            // Fetch failed — reset to clean defaults so we don't show stale state from another tab
            setIsIndividual(false);
            setConcessionCategory('');
            setRecommendedBy('');
            setRecommendationReason('');
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleChange = (index, field, value) => {
        const updatedRows = [...rows];
        let row = { ...updatedRows[index] };
        const amount = parseFloat(row.displayAmount);
        // Concession is limited to the remaining payable (pending) amount
        const maxConcession = Number.isFinite(parseFloat(row.maxConcession)) ? parseFloat(row.maxConcession) : amount;

        if (field === "percent") {
            const percent = Math.min(parseFloat(value) || 0, 100);
            let concessionAmount = Math.round((amount * percent) / 100);
            if (concessionAmount > maxConcession) concessionAmount = maxConcession;
            row.concessionPercent = parseFloat(value) > 100 ? '100' : value;
            row.concessionAmount = concessionAmount;
            row.finalFee = Math.round(amount - concessionAmount);
        } else if (field === "amount") {
            const concessionAmount = Math.min(parseFloat(value) || 0, maxConcession);
            const percent = amount > 0 ? ((concessionAmount / amount) * 100).toFixed(2) : '0';
            row.concessionAmount = parseFloat(value) > maxConcession ? String(maxConcession) : value;
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

        // Validate mandatory fields
        if (isIndividual) {
            const incompleteRow = rowsWithConcession.find(
                (r) => !(r.rowCategory || '').trim() || !(r.rowRecommendedBy || '').trim() || !(r.rowReason || '').trim()
            );
            if (incompleteRow) {
                setMessage("Please fill Concession Category, Recommended By, and Recommendation Reason for all concession rows");
                setStatus(false);
                setColor(false);
                setOpen(true);
                return;
            }
        } else {
            if (!(concessionCategory || '').trim() || !(recommendedBy || '').trim() || !(recommendationReason || '').trim()) {
                setMessage("Please fill Concession Category, Recommended By, and Recommendation Reason");
                setStatus(false);
                setColor(false);
                setOpen(true);
                return;
            }
        }

        // concessionBy = the logged-in user who is granting this concession (admin / staff / etc.)
        const concessionBy = userRollNumber || "";

        // Safely convert to Number (returns 0 if invalid, for IDs we use undefined so they aren't sent wrong)
        const numOrUndef = (v) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : undefined;
        };

        const getRowDetails = (row) => {
            if (isIndividual) {
                return {
                    isSeparateDetailsPerFee: "Y",
                    concessionCategory: (row.rowCategory || '').trim(),
                    recommendedBy: (row.rowRecommendedBy || '').trim(),
                    recommendationReason: (row.rowReason || '').trim(),
                };
            }
            return {
                isSeparateDetailsPerFee: "N",
                concessionCategory: (concessionCategory || '').trim(),
                recommendedBy: (recommendedBy || '').trim(),
                recommendationReason: (recommendationReason || '').trim(),
            };
        };

        let concessionElements = [];

        if (tabValue === 0) {
            concessionElements = rowsWithConcession.map(row => ({
                primeSchoolFeesID: numOrUndef(row.primeSchoolFeesID),
                feesElementID: numOrUndef(row.id),
                concessionAmount: parseFloat(row.concessionAmount),
                concessionBy,
                ...getRowDetails(row),
            }));
        } else if (tabValue === 1) {
            concessionElements = rowsWithConcession.map(row => ({
                feesElementID: numOrUndef(row.id),
                concessionAmount: parseFloat(row.concessionAmount),
                concessionBy,
                ...getRowDetails(row),
            }));
        } else if (tabValue === 2) {
            concessionElements = rowsWithConcession.map(row => ({
                ecaFeesID: numOrUndef(row.ecaFeesID),
                feesElementID: numOrUndef(row.id),
                concessionAmount: parseFloat(row.concessionAmount),
                concessionBy,
                ...getRowDetails(row),
            }));
        } else if (tabValue === 3) {
            concessionElements = rowsWithConcession.map(row => ({
                additionalFeesID: numOrUndef(row.additionalFeesID),
                feesElementID: numOrUndef(row.id),
                concessionAmount: parseFloat(row.concessionAmount),
                concessionBy,
                ...getRowDetails(row),
            }));
        }

        // Safety: bail out if any critical ID is missing — that's the #1 cause of the EF save error
        const badRow = concessionElements.find((el) =>
            el.feesElementID == null ||
            (tabValue === 0 && el.primeSchoolFeesID == null) ||
            (tabValue === 2 && el.ecaFeesID == null) ||
            (tabValue === 3 && el.additionalFeesID == null)
        );
        if (badRow) {
            console.warn('Missing ID in concession payload row:', badRow);
            setMessage('Some fee rows are missing their reference ID. Please refresh and try again.');
            setStatus(false); setColor(false); setOpen(true);
            return;
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
            // Debug: log the exact payload so we can diagnose backend EF save failures
            console.log('[Concession] POST', feeTabs[tabValue], apiEndpoint);
            console.log('[Concession] params:', { RollNumber: rollNumber, Year: selectedYear });
            console.log('[Concession] body:', JSON.stringify(payload, null, 2));

            const res = await axios.post(apiEndpoint, payload, {
                params: { rollNumber: rollNumber, year: selectedYear },
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                timeout: 60000, // 60s — EF save can be slow on the first call
            });

            if (res.data.success || res.status === 200) {
                setMessage("Concession applied successfully!");
                setStatus(true);
                setColor(true);
                setOpen(true);
                setConcessionCategory('');
                setRecommendedBy('');
                setRecommendationReason('');
                // Redirect to Billing Screen after short delay so user sees the success message
                setTimeout(() => {
                    navigate(-1);
                }, 1200);
            } else {
                throw new Error(res.data.message || 'Failed to apply concession');
            }
        } catch (error) {
            console.error("Error applying concession (full):", error);
            console.error("Response data:", error.response?.data);
            // Surface inner exception text if backend returned it
            const serverMsg =
                error.response?.data?.innerException ||
                error.response?.data?.InnerException ||
                error.response?.data?.message ||
                error.response?.data?.Message ||
                error.message ||
                'Failed to apply concession';
            setMessage(String(serverMsg).slice(0, 300));
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
                <Box
                    sx={{
                        backgroundColor: DASH.canvas,
                        px: 2,
                        py: 1.5,
                        borderBottom: `1px solid ${DASH.line}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", minWidth: 0, flex: { xs: "1 1 100%", md: "1 1 0" } }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ width: 28, height: 28 }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: DASH.ink }} />
                        </IconButton>
                        <Box sx={{ ml: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "20px", color: DASH.ink, lineHeight: 1.2 }}>Apply special concession</Typography>
                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, whiteSpace: "nowrap" }}>Reduce a fee element for one student</Typography>
                        </Box>
                    </Box>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: { xs: "1 1 100%", md: "0 0 auto" } }}>
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
                                    backgroundColor: DASH.lineSoft,
                                    minHeight: 0,
                                    borderRadius: "999px",
                                    border: `1px solid ${DASH.line}`,
                                    p: 0.5,
                                    "& .MuiTabs-flexContainer": {
                                        justifyContent: "center",
                                    },
                                    "& .MuiTab-root": {
                                        textTransform: "none",
                                        fontSize: "12.5px",
                                        color: DASH.muted,
                                        fontWeight: 600,
                                        minWidth: 0,
                                        minHeight: 28,
                                        height: 28,
                                        px: 1.8,
                                        borderRadius: "999px",
                                        transition: "color .18s ease, background-color .18s ease",
                                        "&:hover": { color: DASH.text },
                                        },
                                    "& .Mui-selected": {
                                        color: "#fff !important",
                                        bgcolor: "#E30053",
                                        fontWeight: 700,
                                        borderRadius: "999px",
                                        boxShadow: "0 1px 3px rgba(227,0,83,0.30)",
                                        "&:hover": { bgcolor: "#C40047" },
                                    },
                                }}
                            >
                                {feeTabs.map((label, idx) => (
                                    <Tab key={idx} label={label} />
                                ))}
                            </Tabs>
                        </Box>

                        <Box sx={{ display: { xs: "none", md: "block" }, flex: "1 1 0" }} />
                </Box>
                
                <Box sx={{
                    px: 2, pb: 2, pt: 1, minHeight: "72vh",
                }}>
                    {isLoading && (
                      <>
                        <ConcessionFormSkeleton />
                        <Box sx={{ mt: 2 }}>
                          <FeeTableSkeleton columns={isIndividual ? 9 : 6} rows={5} />
                        </Box>
                      </>
                    )}
                    {!isLoading && (
                      <>

                    <Card sx={{ mt: 2, mb: 1, border: `1px solid ${DASH.line}`, borderRadius: '10px', boxShadow: 'none', backgroundColor: '#fff' }}>
                        {/* Card header */}
                        <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: DASH.surface, borderRadius: '10px 10px 0 0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 28, height: 28, borderRadius: RADIUS, backgroundColor: "#FDECF2", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <NotesIcon sx={{ fontSize: 16, color: "#E30053" }} />
                                </Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.text }}>
                                    Concession Details
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: DASH.faint, ml: 0.5 }}>
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
                                            "& .MuiSwitch-switchBase.Mui-checked": { color: "#E30053" },
                                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#E30053" },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: DASH.text }}>
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
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: DASH.text, mb: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CategoryIcon sx={{ fontSize: 14, color: "#E30053" }} />
                                    Concession Category <span style={{ color: 'red' }}>*</span>
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
                                                    <CategoryIcon sx={{ fontSize: 16, color: DASH.faint }} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: 40, borderRadius: RADIUS, fontSize: 13, backgroundColor: DASH.surface,
                                            '& fieldset': { borderColor: DASH.line },
                                            '&:hover fieldset': { borderColor: "#E30053" },
                                            '&.Mui-focused fieldset': { borderColor: "#E30053" },
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: DASH.text, mb: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <PersonIcon sx={{ fontSize: 14, color: "#E30053" }} />
                                    Recommended By <span style={{ color: 'red' }}>*</span>
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
                                                    <PersonIcon sx={{ fontSize: 16, color: DASH.faint }} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: 40, borderRadius: RADIUS, fontSize: 13, backgroundColor: DASH.surface,
                                            '& fieldset': { borderColor: DASH.line },
                                            '&:hover fieldset': { borderColor: "#E30053" },
                                            '&.Mui-focused fieldset': { borderColor: "#E30053" },
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: DASH.text, mb: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <NotesIcon sx={{ fontSize: 14, color: "#E30053" }} />
                                    Recommendation Reason <span style={{ color: 'red' }}>*</span>
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
                                                    <NotesIcon sx={{ fontSize: 16, color: DASH.faint }} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: 40, borderRadius: RADIUS, fontSize: 13, backgroundColor: DASH.surface,
                                            '& fieldset': { borderColor: DASH.line },
                                            '&:hover fieldset': { borderColor: "#E30053" },
                                            '&.Mui-focused fieldset': { borderColor: "#E30053" },
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        )}
                    </Card>
                    <Box
                        sx={{
                            position: "relative",
                            top: "1px",
                            zIndex: 1,
                            display: "inline-flex",
                            alignItems: "center",
                            backgroundColor: "#E30053",
                            border: "1px solid #E30053",
                            borderBottom: "none",
                            py: 0.6,
                            width: "fit-content",
                            px: 2,
                            borderTopLeftRadius: "6px",
                            borderTopRightRadius: "6px",
                            mt: 2,
                        }}
                    >
                        <Typography sx={{ color: "#fff", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
                            Concession {feeTabs[tabValue]} Detail
                        </Typography>
                    </Box>
                    <TableContainer
                        sx={{
                            border: `1px solid ${DASH.line}`,
                            borderRadius: "6px",
                            borderTopLeftRadius: 0,
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
                                        ...(isIndividual ? ["Category *", "Recommended By *", "Reason *"] : []),
                                    ].map((header, index) => (
                                        <TableCell
                                            key={index}
                                            sx={{
                                                borderRight: 1,
                                                borderColor: DASH.line,
                                                textAlign: "center",
                                                backgroundColor: DASH.surface,
                                                fontWeight: 700,
                                                fontSize: "10.5px",
                                                letterSpacing: "0.06em",
                                                textTransform: "uppercase",
                                                color: DASH.muted,
                                                py: 1.2,
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
                                        <TableCell colSpan={isIndividual ? 9 : 6} sx={{ textAlign: "center", py: 6, borderBottom: "none" }}>
                                            <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink }}>
                                                No fee records to discount
                                            </Typography>
                                            <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.5 }}>
                                                This student has no {String(feeTabs[tabValue]).toLowerCase()} entries for the selected year.
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
                                                "&:hover": { backgroundColor: DASH.surface },
                                                transition: "background-color 0.2s ease",
                                            }}
                                        >
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: DASH.line,
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
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                }}
                                            >
                                                {row.displayName}
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: DASH.line,
                                                    textAlign: "center",
                                                }}
                                            >
                                                ₹ {row.displayAmount}
                                                {Number(row.pendingAmount) < Number(row.displayAmount) && (
                                                    <Typography sx={{ fontSize: 11, color: DASH.amber, fontWeight: 600 }}>
                                                        ₹{row.pendingAmount} pending
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: DASH.line,
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
                                                    borderColor: DASH.line,
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
                                                    borderColor: DASH.line,
                                                }}
                                            >
                                                ₹ {row.finalFee}
                                            </TableCell>

                                            {isIndividual && (
                                                <>
                                                    <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center" }}>
                                                        <TextField
                                                            variant="outlined"
                                                            size="small"
                                                            placeholder="Category *"
                                                            value={row.rowCategory}
                                                            onChange={(e) => handleChange(rowIndex, "rowCategory", e.target.value)}
                                                            sx={{ width: "130px", '& .MuiOutlinedInput-root': { fontSize: 12, borderRadius: '6px' } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ borderRight: 1, borderColor: DASH.line, textAlign: "center" }}>
                                                        <TextField
                                                            variant="outlined"
                                                            size="small"
                                                            placeholder="Recommended By *"
                                                            value={row.rowRecommendedBy}
                                                            onChange={(e) => handleChange(rowIndex, "rowRecommendedBy", e.target.value)}
                                                            sx={{ width: "130px", '& .MuiOutlinedInput-root': { fontSize: 12, borderRadius: '6px' } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        <TextField
                                                            variant="outlined"
                                                            size="small"
                                                            placeholder="Reason *"
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
                                                borderColor: DASH.line,
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

                      </>
                    )}
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, px: 2, pb: 2 }}>
                    <Button
                        onClick={handleResetAll}
                        startIcon={<RestartAltIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            textTransform: "none",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            height: 34,
                            px: 1.8,
                            borderRadius: RADIUS,
                            color: DASH.text,
                            bgcolor: "#fff",
                            border: `1px solid ${DASH.line}`,
                            boxShadow: "none",
                            "& .MuiButton-startIcon": { mr: 0.6 },
                            "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
                        }}>
                        Reset All
                    </Button>
                    <Button
                        onClick={handleApplyConcession}
                        disableElevation
                        sx={{
                            textTransform: "none",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            height: 34,
                            px: 2.2,
                            borderRadius: RADIUS,
                            backgroundColor: "#E30053",
                            color: "#fff",
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "#C40047", boxShadow: "0 2px 8px rgba(227,0,83,0.25)" },
                        }}>
                        Apply Concession
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}
