import React, { useEffect, useMemo, useState } from "react";
import {
    Autocomplete, Avatar, Box, Button, Chip, Dialog, DialogActions, Grid, IconButton,
    InputAdornment, Paper, Skeleton, Table, TableBody, TableCell, TableContainer,
    TableHead, TablePagination, TableRow, TextField, Tooltip, Typography,
} from "@mui/material";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Loader from "../Loader";
import SnackBar from "../SnackBar";
import { GetStudentsInformation } from "../../Api/Api";
import { selectGrades } from "../../Redux/Slices/DropdownController";
import { findSubMenuPermissions } from "../../Redux/Slices/AuthSlice";
import {
    DASH, RADIUS, BRAND, SOFT, KPI_TONES, PageHeader, Panel, SolidStatCard, EmptyNote,
} from "../DashBoardComps/dashboardTheme";
import avatarImage from "../../Images/PagesImage/avatar.png";

const dropdownPaper = (props) => (
    <Paper
        {...props}
        sx={{
            mt: 0.5,
            maxHeight: 220,
            borderRadius: RADIUS,
            border: `1px solid ${DASH.line}`,
            boxShadow: "0 8px 24px rgba(16,24,40,0.12)",
            "& .MuiAutocomplete-option": { fontSize: "13px" },
        }}
    />
);

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        height: 36,
        fontSize: 12.5,
        fontWeight: 600,
        borderRadius: RADIUS,
        bgcolor: "#fff",
        "& fieldset": { borderColor: DASH.line },
        "&:hover fieldset": { borderColor: DASH.faint },
    },
};

const headCellSx = {
    fontSize: "10.5px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: DASH.faint,
    bgcolor: DASH.surface,
    borderBottom: `1px solid ${DASH.line}`,
    whiteSpace: "nowrap",
    py: 1.2,
};

const bodyCellSx = {
    fontSize: "12.5px",
    color: DASH.text,
    borderBottom: `1px solid ${DASH.lineSoft}`,
    whiteSpace: "nowrap",
    py: 1.1,
};

const AVATAR_TONES = [BRAND.pink, BRAND.blue, BRAND.green, BRAND.purple, BRAND.orange, BRAND.cyan];

const toneFor = (key) => {
    const text = String(key || "");
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) % 997;
    return AVATAR_TONES[hash % AVATAR_TONES.length];
};

const initialsOf = (name) => {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    return parts.slice(0, 2).map((word) => word[0].toUpperCase()).join("");
};

const missingOf = (row) => {
    const gaps = [];
    if (!row.studentNameInEnglish) gaps.push("Name");
    if (!row.passportSizePhotofilepath) gaps.push("Photo");
    return gaps;
};

export default function StudentInformationPage() {
    const navigate = useNavigate();
    const token = "123";
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber;
    const grades = useSelector(selectGrades);

    const studentPerms = findSubMenuPermissions(user.permissions, "profilemanagement", "studentmanagement") || {};
    const canView = studentPerms.view === "Y";
    const canCreate = studentPerms.create === "Y";
    const canEdit = studentPerms.edit === "Y";
    const canMerge = studentPerms.siblingapproval === "Y";

    const [isLoading, setIsLoading] = useState(false);
    const [studentDetails, setStudentDetails] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedGradeId, setSelectedGradeId] = useState(0);
    const [selectedSection, setSelectedSection] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];

    const filteredData = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return studentDetails.filter((item) => {
            if (statusFilter === "noName" && item.studentNameInEnglish) return false;
            if (statusFilter === "noPhoto" && item.passportSizePhotofilepath) return false;
            if (statusFilter === "complete" && missingOf(item).length > 0) return false;
            if (!query) return true;
            return (
                String(item.rollNumber).toLowerCase().includes(query) ||
                (item.studentNameInEnglish || "").toLowerCase().includes(query)
            );
        });
    }, [studentDetails, searchQuery, statusFilter]);

    const pagedData = useMemo(
        () => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [filteredData, page, rowsPerPage]
    );

    const total = studentDetails.length;
    const missingName = studentDetails.filter((s) => !s.studentNameInEnglish).length;
    const missingPhoto = studentDetails.filter((s) => !s.passportSizePhotofilepath).length;
    const completeCount = studentDetails.filter((s) => missingOf(s).length === 0).length;
    const completePercent = total ? Math.round((completeCount / total) * 100) : 0;

    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue.id);
            setSelectedSection(newValue.sections[0]);
        } else {
            setSelectedGradeId(null);
            setSelectedSection(null);
        }
    };

    const handleSectionChange = (event, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
    };

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleViewInfo = (roll) => {
        navigate("viewinfo", { state: { rollNumber: roll } });
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };

    const handleUploadClick = () => {
        navigate("create");
    };

    const toggleStatusFilter = (key) => {
        setStatusFilter((current) => (current === key ? "all" : key));
    };

    useEffect(() => {
        if (grades && grades.length > 0) {
            setSelectedGradeId(grades[0].id);
            setSelectedSection(grades[0].sections[0]);
        }
    }, [grades]);

    useEffect(() => {
        fetchAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSection, selectedGradeId]);

    useEffect(() => {
        setPage(0);
    }, [searchQuery, statusFilter, selectedGradeId, selectedSection]);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(GetStudentsInformation, {
                params: {
                    grade: selectedGradeId || 131,
                    section: selectedSection || "A1",
                    creatorRollNumber: rollNumber,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data && res.data.studentsInfo) {
                setStudentDetails(res.data.studentsInfo);
            } else {
                setStudentDetails([]);
                console.error("Unexpected API response format:", res.data);
            }
        } catch (error) {
            console.error("Error fetching student data:", error);
            setStudentDetails([]);
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("No Data");
        } finally {
            setIsLoading(false);
        }
    };

    const classLabel = `${selectedGrade?.sign || "-"} · Section ${selectedSection || "-"}`;
    const showSkeleton = isLoading && filteredData.length === 0;

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: 4,
                bgcolor: DASH.canvas,
                boxSizing: "border-box",
            }}
        >
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <PageHeader
                title="Students Information"
                subtitle="Student records for the selected class and section"
                onBack={() => navigate(-1)}
                right={(
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: { xs: "stretch", sm: "flex-end" },
                            gap: 1,
                            maxWidth: "100%",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap",
                                justifyContent: { xs: "flex-start", sm: "flex-end" },
                            }}
                        >
                            {canMerge && (
                                <Button
                                    component={Link}
                                    to="merge-sibling"
                                    startIcon={<CallMergeIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                        textTransform: "none",
                                        fontSize: "12.5px",
                                        fontWeight: 700,
                                        height: 36,
                                        px: 1.8,
                                        borderRadius: RADIUS,
                                        color: SOFT.purple.color,
                                        bgcolor: SOFT.purple.bg,
                                        border: `1px solid ${SOFT.purple.border}`,
                                        "&:hover": { bgcolor: SOFT.purple.hover },
                                    }}
                                >
                                    Merge Siblings
                                </Button>
                            )}
                            {canCreate && (
                                <Button
                                    onClick={handleUploadClick}
                                    startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                                    disableElevation
                                    sx={{
                                        textTransform: "none",
                                        fontSize: "12.5px",
                                        fontWeight: 700,
                                        height: 36,
                                        px: 2.2,
                                        borderRadius: RADIUS,
                                        color: "#fff",
                                        bgcolor: BRAND.pink.main,
                                        boxShadow: `0 6px 14px ${BRAND.pink.main}33`,
                                        "&:hover": { bgcolor: "#C40047", boxShadow: `0 8px 18px ${BRAND.pink.main}45` },
                                    }}
                                >
                                    Create Student
                                </Button>
                            )}
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                                flexWrap: "wrap",
                                justifyContent: { xs: "flex-start", sm: "flex-end" },
                            }}
                        >
                            {statusFilter !== "all" && (
                                <Chip
                                    size="small"
                                    onDelete={() => setStatusFilter("all")}
                                    label={
                                        statusFilter === "noName"
                                            ? "Name not provided"
                                            : statusFilter === "noPhoto"
                                                ? "Photo missing"
                                                : "Complete records"
                                    }
                                    sx={{
                                        height: 28,
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        borderRadius: RADIUS,
                                        bgcolor: BRAND.blue.icon,
                                        color: BRAND.blue.main,
                                        "& .MuiChip-deleteIcon": { fontSize: 15, color: BRAND.blue.main },
                                    }}
                                />
                            )}
                            <Autocomplete
                                disablePortal
                                options={grades}
                                getOptionLabel={(option) => option.sign}
                                value={grades.find((item) => item.id === selectedGradeId) || null}
                                onChange={(event, newValue) => handleGradeChange(newValue)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                PaperComponent={dropdownPaper}
                                sx={{ width: { xs: 118, sm: 126 }, ...fieldSx }}
                                renderInput={(params) => <TextField {...params} placeholder="Grade" />}
                            />
                            <Autocomplete
                                disablePortal
                                disabled={!selectedGrade}
                                options={sections}
                                getOptionLabel={(option) => option.sectionName}
                                value={sections.find((option) => option.sectionName === selectedSection) || null}
                                onChange={handleSectionChange}
                                isOptionEqualToValue={(option, value) => option.sectionName === value.sectionName}
                                PaperComponent={dropdownPaper}
                                sx={{ width: { xs: 108, sm: 116 }, ...fieldSx }}
                                renderInput={(params) => <TextField {...params} placeholder="Section" />}
                            />
                            <TextField
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search name or roll number"
                                sx={{ width: { xs: "100%", sm: 220, md: 250 }, ...fieldSx }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchQuery ? (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ width: 22, height: 22 }}>
                                                    <CloseIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ) : null,
                                    },
                                }}
                            />
                            <Tooltip arrow title="Refresh list">
                                <span>
                                    <IconButton
                                        onClick={fetchAllData}
                                        disabled={isLoading}
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: RADIUS,
                                            border: `1px solid ${DASH.line}`,
                                            bgcolor: "#fff",
                                            "&:hover": { bgcolor: DASH.lineSoft },
                                        }}
                                    >
                                        <RefreshIcon sx={{ fontSize: 17, color: DASH.muted }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    </Box>
                )}
            />

            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={GroupsOutlinedIcon}
                        label="Students in Class"
                        value={total}
                        note={classLabel}
                        tone={KPI_TONES.orange}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={TaskAltOutlinedIcon}
                        label="Profile Completeness"
                        value={`${completePercent}%`}
                        note={`${completeCount} of ${total} records complete`}
                        tone={KPI_TONES.green}
                        onClick={total ? () => toggleStatusFilter("complete") : undefined}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={PersonOffOutlinedIcon}
                        label="Name Not Provided"
                        value={missingName}
                        note={missingName ? "Tap to review these records" : "All records named"}
                        tone={KPI_TONES.pink}
                        onClick={missingName ? () => toggleStatusFilter("noName") : undefined}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={ImageNotSupportedOutlinedIcon}
                        label="Photo Missing"
                        value={missingPhoto}
                        note={missingPhoto ? "Tap to review these records" : "All photos uploaded"}
                        tone={KPI_TONES.cyan}
                        onClick={missingPhoto ? () => toggleStatusFilter("noPhoto") : undefined}
                    />
                </Grid>
            </Grid>

            <Panel
                title="Student Records"
                subtitle={
                    searchQuery || statusFilter !== "all"
                        ? `Showing ${filteredData.length} of ${total}`
                        : `${total} student${total === 1 ? "" : "s"} in ${classLabel}`
                }
                accent={BRAND.blue.main}
                bodySx={{ p: 0 }}
            >
                {!canView ? (
                    <Box sx={{ py: 5 }}>
                        <EmptyNote text="You don't have permission to view student records." />
                    </Box>
                ) : (
                    <>
                        <TableContainer sx={{ maxHeight: "58vh" }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ ...headCellSx, width: 56, pl: 2 }}>#</TableCell>
                                        <TableCell sx={headCellSx}>Student</TableCell>
                                        <TableCell sx={headCellSx}>Roll Number</TableCell>
                                        <TableCell sx={headCellSx}>Class &amp; Section</TableCell>
                                        <TableCell sx={headCellSx}>Academic Year</TableCell>
                                        <TableCell sx={headCellSx}>Record Status</TableCell>
                                        <TableCell sx={{ ...headCellSx, textAlign: "right", pr: 2 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {showSkeleton && [0, 1, 2, 3, 4].map((i) => (
                                        <TableRow key={i}>
                                            <TableCell sx={{ ...bodyCellSx, pl: 2 }}><Skeleton variant="text" width={18} /></TableCell>
                                            <TableCell sx={bodyCellSx}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                    <Skeleton variant="circular" width={34} height={34} />
                                                    <Skeleton variant="text" width={150} />
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={bodyCellSx}><Skeleton variant="text" width={80} /></TableCell>
                                            <TableCell sx={bodyCellSx}><Skeleton variant="rounded" width={70} height={20} /></TableCell>
                                            <TableCell sx={bodyCellSx}><Skeleton variant="text" width={70} /></TableCell>
                                            <TableCell sx={bodyCellSx}><Skeleton variant="rounded" width={80} height={20} /></TableCell>
                                            <TableCell sx={{ ...bodyCellSx, pr: 2 }}><Skeleton variant="rounded" width={90} height={26} sx={{ ml: "auto" }} /></TableCell>
                                        </TableRow>
                                    ))}

                                    {!isLoading && filteredData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} sx={{ borderBottom: "none" }}>
                                                <Box sx={{ py: 5, textAlign: "center" }}>
                                                    <Box
                                                        sx={{
                                                            width: 44, height: 44, borderRadius: "50%", bgcolor: DASH.lineSoft,
                                                            display: "inline-flex", alignItems: "center", justifyContent: "center", mb: 1,
                                                        }}
                                                    >
                                                        <GroupsOutlinedIcon sx={{ fontSize: 22, color: DASH.faint }} />
                                                    </Box>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.ink }}>
                                                        {searchQuery || statusFilter !== "all"
                                                            ? "No student matches this filter"
                                                            : "No students in this class"}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 11.5, color: DASH.muted, mt: 0.3 }}>
                                                        {searchQuery || statusFilter !== "all"
                                                            ? "Try a different name, roll number or filter."
                                                            : "Pick another grade or section above."}
                                                    </Typography>
                                                    {(searchQuery || statusFilter !== "all") && (
                                                        <Button
                                                            onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                                                            startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
                                                            sx={{
                                                                mt: 1.4, textTransform: "none", fontSize: 12, fontWeight: 700,
                                                                height: 30, px: 1.6, borderRadius: RADIUS, color: DASH.text,
                                                                border: `1px solid ${DASH.line}`,
                                                                "&:hover": { bgcolor: DASH.lineSoft },
                                                            }}
                                                        >
                                                            Clear filters
                                                        </Button>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {pagedData.map((row, index) => {
                                        const gaps = missingOf(row);
                                        const tone = toneFor(row.rollNumber);
                                        return (
                                            <TableRow
                                                key={row.id}
                                                hover
                                                sx={{
                                                    "& td": { transition: "background-color 0.15s ease" },
                                                    "&:hover td": { bgcolor: BRAND.blue.bg },
                                                    "&:last-of-type td": { borderBottom: "none" },
                                                }}
                                            >
                                                <TableCell sx={{ ...bodyCellSx, pl: 2, color: DASH.faint, fontWeight: 700 }}>
                                                    {page * rowsPerPage + index + 1}
                                                </TableCell>
                                                <TableCell sx={bodyCellSx}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                                                        <Tooltip arrow title={row.passportSizePhotofilepath ? "View photo" : "No photo uploaded"}>
                                                            <Avatar
                                                                onClick={() => handleViewClick(row.passportSizePhotofilepath)}
                                                                src={row.passportSizePhotofilepath || undefined}
                                                                sx={{
                                                                    width: 34,
                                                                    height: 34,
                                                                    cursor: "pointer",
                                                                    fontSize: "12px",
                                                                    fontWeight: 700,
                                                                    color: tone.main,
                                                                    bgcolor: tone.icon,
                                                                    border: `1px solid ${tone.main}33`,
                                                                }}
                                                            >
                                                                {initialsOf(row.studentNameInEnglish)}
                                                            </Avatar>
                                                        </Tooltip>
                                                        <Box sx={{ minWidth: 0 }}>
                                                            <Typography
                                                                sx={{
                                                                    fontSize: "12.5px",
                                                                    fontWeight: 600,
                                                                    color: row.studentNameInEnglish ? DASH.ink : DASH.red,
                                                                    fontStyle: row.studentNameInEnglish ? "normal" : "italic",
                                                                }}
                                                                noWrap
                                                            >
                                                                {row.studentNameInEnglish || "Name not provided"}
                                                            </Typography>
                                                            {row.studentNameInTamil && (
                                                                <Typography sx={{ fontSize: "11px", color: DASH.muted }} noWrap>
                                                                    {row.studentNameInTamil}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={bodyCellSx}>
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            display: "inline-block",
                                                            px: 0.9,
                                                            py: 0.3,
                                                            borderRadius: RADIUS,
                                                            bgcolor: DASH.lineSoft,
                                                            border: `1px solid ${DASH.line}`,
                                                            fontFamily: "monospace",
                                                            fontSize: "11.5px",
                                                            fontWeight: 700,
                                                            color: DASH.text,
                                                        }}
                                                    >
                                                        {row.rollNumber}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={bodyCellSx}>
                                                    <Chip
                                                        size="small"
                                                        label={`${row.grade} · ${row.section}`}
                                                        sx={{
                                                            height: 21,
                                                            fontSize: "10.5px",
                                                            fontWeight: 700,
                                                            borderRadius: RADIUS,
                                                            bgcolor: BRAND.blue.icon,
                                                            color: BRAND.blue.main,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ ...bodyCellSx, color: DASH.muted }}>
                                                    {row.academicYear || "-"}
                                                </TableCell>
                                                <TableCell sx={bodyCellSx}>
                                                    <Chip
                                                        size="small"
                                                        label={gaps.length === 0 ? "Complete" : `${gaps.join(" & ")} missing`}
                                                        sx={{
                                                            height: 21,
                                                            fontSize: "10.5px",
                                                            fontWeight: 700,
                                                            borderRadius: RADIUS,
                                                            bgcolor: gaps.length === 0 ? DASH.greenLight : DASH.amberLight,
                                                            color: gaps.length === 0 ? DASH.green : DASH.amber,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ ...bodyCellSx, textAlign: "right", pr: 2 }}>
                                                    {(canView || canEdit) && (
                                                        <Button
                                                            onClick={() => handleViewInfo(row.rollNumber)}
                                                            startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                                                            sx={{
                                                                textTransform: "none",
                                                                fontSize: "11.5px",
                                                                fontWeight: 700,
                                                                height: 28,
                                                                px: 1.2,
                                                                borderRadius: RADIUS,
                                                                color: DASH.text,
                                                                bgcolor: "#fff",
                                                                border: `1px solid ${DASH.line}`,
                                                                "&:hover": {
                                                                    bgcolor: BRAND.blue.icon,
                                                                    borderColor: `${BRAND.blue.main}55`,
                                                                    color: BRAND.blue.main,
                                                                },
                                                            }}
                                                        >
                                                            View Info
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {filteredData.length > 0 && (
                            <TablePagination
                                component="div"
                                count={filteredData.length}
                                page={page}
                                onPageChange={(event, newPage) => setPage(newPage)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(event) => {
                                    setRowsPerPage(parseInt(event.target.value, 10));
                                    setPage(0);
                                }}
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                sx={{
                                    borderTop: `1px solid ${DASH.lineSoft}`,
                                    "& .MuiTablePagination-toolbar": { minHeight: 44, px: 2 },
                                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                                        fontSize: "11.5px",
                                        fontWeight: 600,
                                        color: DASH.muted,
                                    },
                                    "& .MuiTablePagination-select": { fontSize: "11.5px", fontWeight: 700 },
                                }}
                            />
                        )}
                    </>
                )}
            </Panel>

            <Dialog
                open={openImage}
                onClose={handleImageClose}
                sx={{
                    "& .MuiPaper-root": {
                        backgroundColor: "transparent",
                        boxShadow: "none",
                        borderRadius: 0,
                        padding: 0,
                        overflow: "visible",
                    },
                }}
                slotProps={{
                    backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.8)" } },
                }}
            >
                <img
                    src={imageUrl || avatarImage}
                    alt="Student"
                    style={{
                        width: "auto",
                        height: "auto",
                        maxWidth: "80vw",
                        maxHeight: "80vh",
                        display: "block",
                        margin: "auto",
                        borderRadius: 8,
                    }}
                />
                <DialogActions sx={{ padding: 0 }}>
                    <IconButton onClick={handleImageClose} sx={{ position: "absolute", top: -10, right: -40 }}>
                        <CloseIcon style={{ color: "#fff" }} />
                    </IconButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
