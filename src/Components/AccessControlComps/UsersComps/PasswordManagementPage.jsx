import React, { useCallback, useEffect, useState } from "react";
import {
    Box, IconButton, Typography, Button, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination, Dialog, DialogContent, DialogActions, Chip, Avatar,
    MenuItem, Select, Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import LockResetIcon from "@mui/icons-material/LockReset";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { hasPermission } from "../../../Redux/Slices/AuthSlice";
import Loader from "../../Loader";
import SnackBar from "../../SnackBar";
import axios from "axios";
import { UsersPassword, updateLoginPassword } from "../../../Api/Api";
import avatarImage from "../../../Images/PagesImage/avatar.png";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { DASH, RADIUS, Panel, EmptyNote } from "../../DashBoardComps/dashboardTheme";

const ACCENT = DASH.violet;

const USER_TYPE_COLORS = {
    Student: { color: DASH.blue, bg: DASH.blueLight },
    Teacher: { color: DASH.green, bg: DASH.greenLight },
    Staff: { color: "#C2701F", bg: "#FBF4EF" },
    Parent: { color: "#A749CC", bg: "#F7F0F9" },
};

const ROWS_OPTIONS = [10, 25, 50, 100];

const isStudentRow = (row) => String(row?.userType || "").toLowerCase() === "student";

const TH = ({ children, align }) => (
    <TableCell
        align={align}
        sx={{
            bgcolor: DASH.surface,
            borderBottom: `1px solid ${DASH.line}`,
            color: DASH.muted,
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            py: 1,
            whiteSpace: "nowrap",
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

// ─── Memoised table — skips re-render when dialog state changes ───────────────
const PasswordTable = React.memo(({ pageData, allData, page, rowsPerPage, onPageChange, onRowsPerPageChange, onChangePassword, onViewImage, searchQuery }) => (
    <>
        <TableContainer sx={{ maxHeight: "62vh" }}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TH align="center">S.No</TH>
                        <TH>Roll Number</TH>
                        <TH>Name</TH>
                        <TH>User Type</TH>
                        <TH align="center">Class</TH>
                        <TH align="center">Section</TH>
                        <TH align="center">Picture</TH>
                        <TH>Password</TH>
                        <TH align="right">Action</TH>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pageData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} sx={{ borderBottom: "none" }}>
                                <EmptyNote
                                    text={searchQuery ? `No member matches “${searchQuery}”.` : "No records to show."}
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        pageData.map((row, index) => {
                            const utStyle = USER_TYPE_COLORS[row.userType] || { color: DASH.muted, bg: DASH.lineSoft };
                            const globalIndex = page * rowsPerPage + index;
                            return (
                                <TableRow
                                    key={row.rollNumber || index}
                                    sx={{ transition: "background-color 0.15s", "&:hover": { bgcolor: DASH.surface } }}
                                >
                                    <TD align="center">
                                        <Typography sx={{ fontSize: "12px", color: DASH.faint }}>{globalIndex + 1}</Typography>
                                    </TD>
                                    <TD>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.text, whiteSpace: "nowrap" }}>
                                            {row.rollNumber}
                                        </Typography>
                                    </TD>
                                    <TD>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: row.name ? DASH.ink : DASH.red, minWidth: 140 }}>
                                            {row.name || "Name not provided"}
                                        </Typography>
                                    </TD>
                                    <TD>
                                        <Chip
                                            label={row.userType || "-"}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                borderRadius: RADIUS,
                                                bgcolor: utStyle.bg,
                                                color: utStyle.color,
                                                border: `1px solid ${utStyle.color}33`,
                                                fontWeight: 700,
                                                fontSize: "10.5px",
                                            }}
                                        />
                                    </TD>
                                    <TD align="center">
                                        <Typography sx={{ fontSize: "12px", color: row.grade ? DASH.text : DASH.faint }}>
                                            {row.grade || "-"}
                                        </Typography>
                                    </TD>
                                    <TD align="center">
                                        <Typography sx={{ fontSize: "12px", color: row.section ? DASH.text : DASH.faint }}>
                                            {row.section || "-"}
                                        </Typography>
                                    </TD>
                                    <TD align="center">
                                        {row.filepath ? (
                                            <Button
                                                size="small"
                                                onClick={() => onViewImage(row.filepath)}
                                                startIcon={<ImageIcon sx={{ fontSize: 14 }} />}
                                                sx={{
                                                    textTransform: "none",
                                                    fontSize: "11.5px",
                                                    fontWeight: 700,
                                                    height: 26,
                                                    px: 1.2,
                                                    borderRadius: RADIUS,
                                                    color: DASH.blue,
                                                    "&:hover": { bgcolor: DASH.blueLight },
                                                }}
                                            >
                                                View
                                            </Button>
                                        ) : (
                                            <Typography sx={{ fontSize: "11.5px", color: DASH.faint }}>No image</Typography>
                                        )}
                                    </TD>
                                    <TD>
                                        <Box
                                            component="span"
                                            sx={{
                                                display: "inline-block",
                                                px: 1,
                                                py: 0.3,
                                                borderRadius: RADIUS,
                                                bgcolor: DASH.lineSoft,
                                                color: DASH.text,
                                                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                                                fontSize: "12px",
                                                letterSpacing: "0.5px",
                                            }}
                                        >
                                            {row.password || "-"}
                                        </Box>
                                    </TD>
                                    <TD align="right">
                                        <Button
                                            size="small"
                                            onClick={() => onChangePassword(row)}
                                            startIcon={<LockResetIcon sx={{ fontSize: 15 }} />}
                                            sx={{
                                                textTransform: "none",
                                                fontSize: "11.5px",
                                                fontWeight: 700,
                                                height: 28,
                                                px: 1.4,
                                                borderRadius: RADIUS,
                                                color: "#B45309",
                                                bgcolor: DASH.amberLight,
                                                border: "1px solid #FDE68A",
                                                whiteSpace: "nowrap",
                                                "&:hover": { bgcolor: DASH.amberLight, borderColor: DASH.amber },
                                            }}
                                        >
                                            Change
                                        </Button>
                                    </TD>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>

        {/* Pagination bar */}
        <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
            px: 2,
            py: 0.5,
            borderTop: `1px solid ${DASH.line}`,
            bgcolor: DASH.surface,
        }}>
            <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                Showing{" "}
                <strong>{allData.length === 0 ? 0 : page * rowsPerPage + 1}</strong>
                {" - "}
                <strong>{Math.min((page + 1) * rowsPerPage, allData.length)}</strong>
                {" of "}
                <strong>{allData.length}</strong> records
            </Typography>
            <TablePagination
                component="div"
                count={allData.length}
                page={page}
                onPageChange={onPageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={ROWS_OPTIONS}
                sx={{
                    "& .MuiTablePagination-toolbar": { minHeight: "40px", p: 0 },
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "11.5px", color: DASH.muted, mb: 0 },
                    "& .MuiTablePagination-select": { fontSize: "11.5px" },
                    "& .MuiIconButton-root": { p: 0.5 },
                    border: "none",
                }}
            />
        </Box>
    </>
));

// ─── Main component ───────────────────────────────────────────────────────────
export default function PasswordManagementPage() {
    const navigate = useNavigate();
    const token = "123";
    const permissions = useSelector((state) => state.auth.permissions);
    const websiteSettings = useSelector(selectWebsiteSettings);

    // Which side of the roster this user may reset passwords for.
    const canStudents = hasPermission(permissions, "accesscontrol", "users", "allowpasswordmanagementstudent");
    const canStaff = hasPermission(permissions, "accesscontrol", "users", "allowpasswordmanagementstaff");
    const canBoth = canStudents && canStaff;

    const [isLoading, setIsLoading] = useState(false);
    const [passwords, setPasswords] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    // Only meaningful when both sides are allowed.
    const [audience, setAudience] = useState("all");

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    // Image dialog
    const [imageUrl, setImageUrl] = useState("");
    const [openImage, setOpenImage] = useState(false);

    // Single state object for change-password dialog — 1 setState = 1 re-render
    const [dialog, setDialog] = useState({
        open: false,
        user: null,
        newPassword: "",
        confirmPassword: "",
        showNew: false,
        showConfirm: false,
    });

    // SnackBar — single object to avoid multiple setStates
    const [snack, setSnack] = useState({ open: false, status: false, color: false, message: "" });

    const mainColor = websiteSettings.mainColor || DASH.primary;

    // Rows the permissions allow, narrowed further by the audience toggle when
    // the user is allowed to see both sides.
    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(UsersPassword, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (res.data || []).filter((row) => {
                const student = isStudentRow(row);
                if (student && !canStudents) return false;
                if (!student && !canStaff) return false;
                if (canBoth && audience === "student") return student;
                if (canBoth && audience === "staff") return !student;
                return true;
            });

            setPasswords(data);
            setFilteredData(data);
            setPage(0);
        } catch (error) {
            console.error(error);
            setSnack({ open: true, status: false, color: false, message: "Failed to load data" });
        } finally {
            setIsLoading(false);
        }
    }, [canStudents, canStaff, canBoth, audience]);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const runSearch = (query) => {
        setSearchQuery(query);
        setPage(0); // reset to first page on search
        setFilteredData(
            query
                ? passwords.filter(
                    (item) =>
                        item.rollNumber?.toString().toLowerCase().includes(query) ||
                        item.name?.toLowerCase().includes(query)
                )
                : passwords
        );
    };

    const handleSearchChange = (e) => runSearch(e.target.value.toLowerCase());

    const handleExport = () => {
        if (!filteredData.length) {
            setSnack({ open: true, status: false, color: false, message: "No data to export" });
            return;
        }
        const header = ["S.No", "Roll Number", "Name", "User Type", "Class", "Section", "Password"];
        const data = filteredData.map((row, i) => [
            i + 1, row.rollNumber || "", row.name || "Name not provided",
            row.userType || "", row.grade || "", row.section || "", row.password || "",
        ]);
        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "User Passwords");
        XLSX.writeFile(wb, `User_Passwords_${dayjs().format("YYYY-MM-DD_HH-mm")}.xlsx`);
    };

    // Slice for current page — only these rows get rendered in the DOM
    const pageData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handlePageChange = useCallback((_, newPage) => setPage(newPage), []);
    const handleRowsPerPageChange = useCallback((e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    }, []);

    // useCallback keeps references stable so React.memo works correctly
    const handleOpenChange = useCallback((row) => {
        setDialog({ open: true, user: row, newPassword: "", confirmPassword: "", showNew: false, showConfirm: false });
    }, []);

    const handleViewImage = useCallback((url) => {
        setImageUrl(url);
        setOpenImage(true);
    }, []);

    const closeDialog = () => setDialog((prev) => ({ ...prev, open: false }));

    const passwordsMatch = dialog.newPassword && dialog.confirmPassword && dialog.newPassword === dialog.confirmPassword;
    const passwordMismatch = dialog.newPassword && dialog.confirmPassword && dialog.newPassword !== dialog.confirmPassword;

    const handleChangePassword = async () => {
        if (!passwordsMatch) return;
        // The list is already filtered, but never let a reset through for a side
        // this user was not granted.
        if (isStudentRow(dialog.user) ? !canStudents : !canStaff) {
            setSnack({ open: true, status: false, color: false, message: "You do not have permission to reset this password." });
            return;
        }
        setIsLoading(true);
        try {
            await axios.put(
                updateLoginPassword,
                {
                    rollNumber: dialog.user.rollNumber,
                    userType: dialog.user.userType,
                    newPassword: dialog.newPassword,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSnack({ open: true, status: true, color: true, message: "Password updated successfully" });
            closeDialog();
            fetchAllData();
        } catch (error) {
            setSnack({ open: true, status: false, color: false, message: error.response?.data?.message || "Failed to update password" });
        } finally {
            setIsLoading(false);
        }
    };

    const fieldSx = {
        "& .MuiOutlinedInput-root": {
            height: 36,
            fontSize: "13px",
            borderRadius: RADIUS,
            bgcolor: "#fff",
            "& fieldset": { borderColor: DASH.line },
            "&:hover fieldset": { borderColor: DASH.faint },
            "&.Mui-focused fieldset": { borderColor: mainColor, borderWidth: "1px" },
        },
    };

    const labelSx = { fontSize: "11px", fontWeight: 700, color: DASH.muted, textTransform: "uppercase", letterSpacing: "0.4px", mb: 0.6 };

    const ghostBtnSx = {
        textTransform: "none", fontSize: "12.5px", fontWeight: 700, color: DASH.text,
        bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
        px: 2, height: 34, boxShadow: "none",
        "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
    };

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%", boxSizing: "border-box" }}>
            {isLoading && <Loader />}
            <SnackBar
                open={snack.open}
                color={snack.color}
                setOpen={(val) => setSnack((prev) => ({ ...prev, open: val }))}
                status={snack.status}
                message={snack.message}
            />

            {/* Header */}
            <Box
                sx={{
                    display: "flex", alignItems: { xs: "flex-start", md: "center" },
                    justifyContent: "space-between", flexDirection: { xs: "column", md: "row" },
                    gap: 1.5, mb: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, minWidth: 0 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mt: -0.5 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                            Password Management
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            Look up a member's login and reset it when they are locked out
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 }, flexWrap: "wrap" }}>
                    {canBoth ? (
                        <Select
                            size="small"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            sx={{
                                fontSize: "12.5px", fontWeight: 600, height: 32, minWidth: 150,
                                borderRadius: RADIUS, bgcolor: "#fff",
                                "& fieldset": { borderColor: DASH.line },
                                "&:hover fieldset": { borderColor: DASH.faint },
                                "&.Mui-focused fieldset": { borderColor: mainColor, borderWidth: "1px" },
                            }}
                        >
                            <MenuItem value="all" sx={{ fontSize: "12.5px" }}>Students &amp; Staff</MenuItem>
                            <MenuItem value="student" sx={{ fontSize: "12.5px" }}>Students only</MenuItem>
                            <MenuItem value="staff" sx={{ fontSize: "12.5px" }}>Staff only</MenuItem>
                        </Select>
                    ) : (
                        <Chip
                            label={canStudents ? "Students" : "Staff"}
                            size="small"
                            sx={{ height: 24, fontSize: "11px", fontWeight: 700, borderRadius: RADIUS, bgcolor: `${ACCENT}14`, color: ACCENT }}
                        />
                    )}

                    <TextField
                        size="small"
                        placeholder="Search by name or roll number"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => runSearch("")} sx={{ p: 0.2 }}>
                                            <HighlightOffIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null,
                            },
                        }}
                        sx={{
                            width: { xs: "100%", sm: 260 },
                            "& .MuiOutlinedInput-root": {
                                height: 32,
                                fontSize: "12.5px",
                                borderRadius: RADIUS,
                                bgcolor: "#fff",
                                "& fieldset": { borderColor: DASH.line },
                                "&:hover fieldset": { borderColor: DASH.faint },
                                "&.Mui-focused fieldset": { borderColor: mainColor, borderWidth: "1px" },
                            },
                        }}
                    />

                    <Button
                        onClick={handleExport}
                        startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            textTransform: "none",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            height: 32,
                            px: 1.8,
                            borderRadius: RADIUS,
                            color: DASH.cyan,
                            bgcolor: DASH.cyanLight,
                            border: "1px solid #A5F3FC",
                            boxShadow: "none",
                            "&:hover": { bgcolor: DASH.cyanLight, borderColor: DASH.cyan },
                        }}
                    >
                        Export
                    </Button>
                </Box>
            </Box>

            {/* Table */}
            <Panel
                title="Member Logins"
                subtitle={isLoading ? "Loading…" : `${filteredData.length} of ${passwords.length} record${passwords.length === 1 ? "" : "s"}`}
                accent={ACCENT}
                bodySx={{ p: 0 }}
            >
                <PasswordTable
                    pageData={pageData}
                    allData={filteredData}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onChangePassword={handleOpenChange}
                    onViewImage={handleViewImage}
                    searchQuery={searchQuery}
                />
            </Panel>

            {/* ── Change Password Dialog ── */}
            <Dialog
                open={dialog.open}
                onClose={closeDialog}
                fullWidth
                maxWidth="xs"
                slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden" } } }}
            >
                <Box sx={{ height: 3, bgcolor: DASH.amber }} />
                <Box sx={{ px: 2, py: 1.6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                        <Box sx={{
                            width: 34, height: 34, flexShrink: 0, borderRadius: RADIUS,
                            bgcolor: DASH.amberLight, border: "1px solid #FDE68A",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <LockResetIcon sx={{ fontSize: 18, color: "#B45309" }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                Change Password
                            </Typography>
                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                                The member signs in with the new one straight away
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={closeDialog}>
                        <CloseIcon sx={{ fontSize: 18, color: DASH.muted }} />
                    </IconButton>
                </Box>

                <DialogContent sx={{ px: 2, pt: 0, pb: 1 }}>
                    {/* Who this is for */}
                    {dialog.user && (
                        <Box sx={{
                            display: "flex", alignItems: "center", gap: 1.5, p: 1.4, mb: 2.2,
                            bgcolor: DASH.surface, border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
                        }}>
                            <Avatar
                                src={dialog.user.filepath || avatarImage}
                                sx={{ width: 38, height: 38, border: `1px solid ${DASH.line}` }}
                            />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: "13.5px", color: DASH.ink }} noWrap>
                                    {dialog.user.name || "Name not provided"}
                                </Typography>
                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted }} noWrap>
                                    {dialog.user.rollNumber}
                                    {dialog.user.userType ? ` · ${dialog.user.userType}` : ""}
                                    {dialog.user.grade ? ` · ${dialog.user.grade}` : ""}
                                    {dialog.user.section ? ` / ${dialog.user.section}` : ""}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    <Typography sx={labelSx}>New Password</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        type={dialog.showNew ? "text" : "password"}
                        placeholder="Enter new password"
                        value={dialog.newPassword}
                        onChange={(e) => setDialog((prev) => ({ ...prev, newPassword: e.target.value }))}
                        sx={{ ...fieldSx, mb: 2 }}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setDialog((prev) => ({ ...prev, showNew: !prev.showNew }))}>
                                            {dialog.showNew ? <VisibilityIcon sx={{ fontSize: 17 }} /> : <VisibilityOffIcon sx={{ fontSize: 17 }} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Typography sx={labelSx}>Confirm Password</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        type={dialog.showConfirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={dialog.confirmPassword}
                        onChange={(e) => setDialog((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        error={!!passwordMismatch}
                        helperText={passwordMismatch ? "Passwords do not match" : passwordsMatch ? "Passwords match" : " "}
                        sx={{
                            ...fieldSx,
                            "& .MuiFormHelperText-root": {
                                color: passwordMismatch ? DASH.red : DASH.green,
                                fontWeight: 600,
                                fontSize: "11px",
                                ml: 0,
                                mt: 0.6,
                            },
                        }}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setDialog((prev) => ({ ...prev, showConfirm: !prev.showConfirm }))}>
                                            {dialog.showConfirm ? <VisibilityIcon sx={{ fontSize: 17 }} /> : <VisibilityOffIcon sx={{ fontSize: 17 }} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 2, pb: 2, pt: 1, gap: 1 }}>
                    <Button onClick={closeDialog} sx={ghostBtnSx}>Cancel</Button>
                    <Button
                        variant="contained"
                        disableElevation
                        disabled={!passwordsMatch}
                        onClick={handleChangePassword}
                        sx={{
                            textTransform: "none",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            borderRadius: RADIUS,
                            px: 2.4,
                            height: 34,
                            color: websiteSettings.textColor || "#fff",
                            bgcolor: mainColor,
                            boxShadow: "none",
                            "&:hover": { bgcolor: mainColor, filter: "brightness(0.92)", boxShadow: "none" },
                            "&.Mui-disabled": { bgcolor: DASH.line, color: DASH.faint },
                        }}
                    >
                        Update Password
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Image Preview Dialog */}
            <Dialog
                open={openImage}
                onClose={() => setOpenImage(false)}
                maxWidth="md"
                slotProps={{
                    paper: { sx: { backgroundColor: "transparent", boxShadow: "none", overflow: "visible", position: "relative" } },
                    backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.85)" } },
                }}
            >
                <img
                    src={imageUrl || avatarImage}
                    alt="User"
                    style={{ width: "auto", height: "auto", maxWidth: "80vw", maxHeight: "80vh", display: "block", margin: "auto", borderRadius: "8px" }}
                />
                <Tooltip title="Close" arrow>
                    <IconButton
                        onClick={() => setOpenImage(false)}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "rgba(0,0,0,0.45)",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
                        }}
                    >
                        <CloseIcon sx={{ color: "#fff", fontSize: 18 }} />
                    </IconButton>
                </Tooltip>
            </Dialog>
        </Box>
    );
}
