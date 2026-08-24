import React, { useEffect, useMemo, useState } from "react";
import {
    Autocomplete, Avatar, Box, Button, Dialog, DialogActions, Grid, IconButton,
    InputAdornment, Paper, Skeleton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Tooltip, Typography,
} from "@mui/material";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import GroupsIcon from "@mui/icons-material/Groups";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Loader from "../Loader";
import SnackBar from "../SnackBar";
import { GetStudentsInformation } from "../../Api/Api";
import { selectGrades } from "../../Redux/Slices/DropdownController";
import { findSubMenuPermissions } from "../../Redux/Slices/AuthSlice";
import { DASH, RADIUS, BRAND, SOFT, PageHeader, Panel, StatTile, EmptyNote } from "../DashBoardComps/dashboardTheme";
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
        height: 34,
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
    const [selectedGradeId, setSelectedGradeId] = useState(0);
    const [selectedSection, setSelectedSection] = useState(null);

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
        if (!query) return studentDetails;
        return studentDetails.filter(
            (item) =>
                item.rollNumber.toString().toLowerCase().includes(query) ||
                (item.studentNameInEnglish && item.studentNameInEnglish.toLowerCase().includes(query))
        );
    }, [studentDetails, searchQuery]);

    const missingName = studentDetails.filter((s) => !s.studentNameInEnglish).length;
    const missingPhoto = studentDetails.filter((s) => !s.passportSizePhotofilepath).length;

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

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(GetStudentsInformation, {
                params: {
                    grade: selectedGradeId || 131,
                    section: selectedSection || "A1",
                    createRollNumber: rollNumber,
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

    const classLabel = `${selectedGrade?.sign || "-"} · ${selectedSection || "-"}`;

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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        {canMerge && (
                            <Button
                                component={Link}
                                to="merge-sibling"
                                startIcon={<CallMergeIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                    textTransform: "none",
                                    fontSize: "12.5px",
                                    fontWeight: 700,
                                    height: 34,
                                    px: 1.6,
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
                                startIcon={<AddIcon sx={{ fontSize: 17 }} />}
                                disableElevation
                                sx={{
                                    textTransform: "none",
                                    fontSize: "12.5px",
                                    fontWeight: 700,
                                    height: 34,
                                    px: 1.8,
                                    borderRadius: RADIUS,
                                    color: "#fff",
                                    bgcolor: BRAND.pink.main,
                                    "&:hover": { bgcolor: "#C40047" },
                                }}
                            >
                                Create Student
                            </Button>
                        )}
                    </Box>
                )}
            />

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <StatTile
                        icon={GroupsIcon}
                        label="Students in Class"
                        value={studentDetails.length}
                        caption={classLabel}
                        accent={BRAND.pink.main}
                        accentBg={BRAND.pink.icon}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <StatTile
                        icon={PersonOffOutlinedIcon}
                        label="Name Not Provided"
                        value={missingName}
                        caption={missingName ? "Needs correction" : "All records named"}
                        captionColor={missingName ? DASH.red : DASH.green}
                        captionBg={missingName ? DASH.redLight : DASH.greenLight}
                        accent={DASH.amber}
                        accentBg={DASH.amberLight}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <StatTile
                        icon={ImageNotSupportedOutlinedIcon}
                        label="Photo Missing"
                        value={missingPhoto}
                        caption={missingPhoto ? "Upload pending" : "All photos uploaded"}
                        captionColor={missingPhoto ? DASH.amber : DASH.green}
                        captionBg={missingPhoto ? DASH.amberLight : DASH.greenLight}
                        accent={BRAND.blue.main}
                        accentBg={BRAND.blue.icon}
                    />
                </Grid>
            </Grid>

            <Panel
                title="Student Records"
                subtitle={classLabel}
                bodySx={{ p: 0 }}
                right={(
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Autocomplete
                            disablePortal
                            options={grades}
                            getOptionLabel={(option) => option.sign}
                            value={grades.find((item) => item.id === selectedGradeId) || null}
                            onChange={(event, newValue) => handleGradeChange(newValue)}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            PaperComponent={dropdownPaper}
                            sx={{ width: { xs: "100%", sm: 130 }, ...fieldSx }}
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
                            sx={{ width: { xs: "100%", sm: 120 }, ...fieldSx }}
                            renderInput={(params) => <TextField {...params} placeholder="Section" />}
                        />
                        <TextField
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search name or roll number"
                            sx={{ width: { xs: "100%", sm: 240 }, ...fieldSx }}
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
                            <IconButton
                                onClick={fetchAllData}
                                disabled={isLoading}
                                sx={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: RADIUS,
                                    border: `1px solid ${DASH.line}`,
                                    bgcolor: "#fff",
                                    "&:hover": { bgcolor: DASH.lineSoft },
                                }}
                            >
                                <RefreshIcon sx={{ fontSize: 17, color: DASH.muted }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            >
                {!canView ? (
                    <Box sx={{ py: 5 }}>
                        <EmptyNote text="You don't have permission to view student records." />
                    </Box>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1.5,
                                flexWrap: "wrap",
                                px: 2,
                                py: 1.2,
                                borderBottom: `1px solid ${DASH.lineSoft}`,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.6,
                                    px: 1.1,
                                    py: 0.4,
                                    borderRadius: RADIUS,
                                    bgcolor: BRAND.blue.icon,
                                    border: `1px solid ${BRAND.blue.main}24`,
                                }}
                            >
                                <BadgeOutlinedIcon sx={{ fontSize: 14, color: BRAND.blue.main }} />
                                <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: BRAND.blue.main }}>
                                    {classLabel}
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, fontWeight: 600 }}>
                                {searchQuery
                                    ? `Showing ${filteredData.length} of ${studentDetails.length}`
                                    : `${studentDetails.length} student${studentDetails.length === 1 ? "" : "s"}`}
                            </Typography>
                        </Box>

                        <TableContainer sx={{ maxHeight: "60vh" }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ ...headCellSx, width: 56, pl: 2 }}>#</TableCell>
                                        <TableCell sx={headCellSx}>Student</TableCell>
                                        <TableCell sx={headCellSx}>Roll Number</TableCell>
                                        <TableCell sx={headCellSx}>Class</TableCell>
                                        <TableCell sx={headCellSx}>Section</TableCell>
                                        <TableCell sx={{ ...headCellSx, textAlign: "right", pr: 2 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isLoading && filteredData.length === 0 && [0, 1, 2, 3, 4].map((i) => (
                                        <TableRow key={i}>
                                            <TableCell sx={{ ...bodyCellSx, pl: 2 }}><Skeleton variant="text" width={18} /></TableCell>
                                            <TableCell sx={bodyCellSx}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                    <Skeleton variant="circular" width={32} height={32} />
                                                    <Skeleton variant="text" width={140} />
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={bodyCellSx}><Skeleton variant="text" width={80} /></TableCell>
                                            <TableCell sx={bodyCellSx}><Skeleton variant="text" width={50} /></TableCell>
                                            <TableCell sx={bodyCellSx}><Skeleton variant="text" width={40} /></TableCell>
                                            <TableCell sx={{ ...bodyCellSx, pr: 2 }}><Skeleton variant="rounded" width={90} height={26} sx={{ ml: "auto" }} /></TableCell>
                                        </TableRow>
                                    ))}

                                    {!isLoading && filteredData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} sx={{ borderBottom: "none" }}>
                                                <Box sx={{ py: 5, textAlign: "center" }}>
                                                    <Box
                                                        sx={{
                                                            width: 44, height: 44, borderRadius: "50%", bgcolor: DASH.lineSoft,
                                                            display: "inline-flex", alignItems: "center", justifyContent: "center", mb: 1,
                                                        }}
                                                    >
                                                        <GroupsIcon sx={{ fontSize: 22, color: DASH.faint }} />
                                                    </Box>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.ink }}>
                                                        {searchQuery ? "No student matches your search" : "No students in this class"}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 11.5, color: DASH.muted, mt: 0.3 }}>
                                                        {searchQuery
                                                            ? "Try a different name or roll number."
                                                            : "Pick another grade or section above."}
                                                    </Typography>
                                                    {searchQuery && (
                                                        <Button
                                                            onClick={() => setSearchQuery("")}
                                                            startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
                                                            sx={{
                                                                mt: 1.4, textTransform: "none", fontSize: 12, fontWeight: 700,
                                                                height: 30, px: 1.6, borderRadius: RADIUS, color: DASH.text,
                                                                border: `1px solid ${DASH.line}`,
                                                                "&:hover": { bgcolor: DASH.lineSoft },
                                                            }}
                                                        >
                                                            Clear search
                                                        </Button>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {filteredData.map((row, index) => (
                                        <TableRow
                                            key={row.id}
                                            hover
                                            sx={{ "&:hover": { bgcolor: DASH.lineSoft }, "&:last-of-type td": { borderBottom: "none" } }}
                                        >
                                            <TableCell sx={{ ...bodyCellSx, pl: 2, color: DASH.faint, fontWeight: 700 }}>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell sx={bodyCellSx}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                                                    <Tooltip arrow title="View photo">
                                                        <Avatar
                                                            onClick={() => handleViewClick(row.passportSizePhotofilepath)}
                                                            src={row.passportSizePhotofilepath || avatarImage}
                                                            sx={{
                                                                width: 32, height: 32, cursor: "pointer",
                                                                border: `1px solid ${DASH.line}`,
                                                            }}
                                                        />
                                                    </Tooltip>
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
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ ...bodyCellSx, fontFamily: "monospace", fontWeight: 600 }}>
                                                {row.rollNumber}
                                            </TableCell>
                                            <TableCell sx={bodyCellSx}>{row.grade}</TableCell>
                                            <TableCell sx={bodyCellSx}>{row.section}</TableCell>
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
                                                            "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
                                                        }}
                                                    >
                                                        View Info
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
