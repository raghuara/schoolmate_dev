import React, { useCallback, useEffect, useState } from "react";
import {
    Box, Grid, IconButton, Typography, Button, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination, Dialog, DialogContent, DialogActions, Chip, Avatar,
    MenuItem, Select,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import LockResetIcon from "@mui/icons-material/LockReset";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import Loader from "../../Loader";
import SnackBar from "../../SnackBar";
import axios from "axios";
import { UsersPassword, updateLoginPassword } from "../../../Api/Api";
import avatarImage from "../../../Images/PagesImage/avatar.png";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const USER_TYPE_COLORS = {
    Student: { color: "#1976D2", bg: "#E3F2FD" },
    Teacher: { color: "#388E3C", bg: "#E8F5E9" },
    Staff:   { color: "#F57C00", bg: "#FFF3E0" },
    Parent:  { color: "#8E24AA", bg: "#F3E5F5" },
};

const ROWS_OPTIONS = [10, 25, 50, 100];

// ─── Memoised table — skips re-render when dialog state changes ───────────────
const PasswordTable = React.memo(({ pageData, allData, page, rowsPerPage, onPageChange, onRowsPerPageChange, onChangePassword, onViewImage }) => (
    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <TableContainer sx={{ maxHeight: "74vh", overflowY: "auto" }}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        {["S.No", "Roll Number", "Name", "User Type", "Class", "Section", "Picture", "Password", "Action"].map((col) => (
                            <TableCell
                                key={col}
                                sx={{
                                    bgcolor: "#faf6fc",
                                    fontWeight: 700,
                                    fontSize: "12px",
                                    textAlign: "center",
                                    borderRight: "1px solid #e0e0e0",
                                    whiteSpace: "nowrap",
                                    color: "#444",
                                }}
                            >
                                {col}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pageData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} sx={{ textAlign: "center", py: 5, color: "#bbb", fontSize: "13px", fontStyle: "italic" }}>
                                No records found
                            </TableCell>
                        </TableRow>
                    ) : (
                        pageData.map((row, index) => {
                            const utStyle = USER_TYPE_COLORS[row.userType] || { color: "#555", bg: "#f5f5f5" };
                            const globalIndex = page * rowsPerPage + index;
                            return (
                                <TableRow key={row.rollNumber || index} sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                                    <TableCell sx={{ borderRight: "1px solid #e0e0e0", textAlign: "center", fontSize: "13px", color: "#666" }}>
                                        {globalIndex + 1}
                                    </TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #e0e0e0", textAlign: "center", fontSize: "13px", fontWeight: 600 }}>
                                        {row.rollNumber}
                                    </TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #e0e0e0", fontSize: "13px", color: row.name ? "#222" : "#e53935", fontWeight: row.name ? 400 : 600, minWidth: 140 }}>
                                        {row.name || "Name not provided"}
                                    </TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #e0e0e0", textAlign: "center" }}>
                                        <Chip
                                            label={row.userType || "—"}
                                            size="small"
                                            sx={{
                                                bgcolor: utStyle.bg,
                                                color: utStyle.color,
                                                fontWeight: 600,
                                                fontSize: "11px",
                                                height: "22px",
                                                border: `1px solid ${utStyle.color}33`,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #e0e0e0", textAlign: "center", fontSize: "13px" }}>
                                        {row.grade || "—"}
                                    </TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #e0e0e0", textAlign: "center", fontSize: "13px" }}>
                                        {row.section || "—"}
                                    </TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #e0e0e0", textAlign: "center" }}>
                                        {row.filepath ? (
                                            <Button
                                                size="small"
                                                onClick={() => onViewImage(row.filepath)}
                                                sx={{ textTransform: "none", fontSize: "12px", color: "#1976D2" }}
                                                startIcon={<ImageIcon sx={{ fontSize: 14 }} />}
                                            >
                                                View
                                            </Button>
                                        ) : (
                                            <Typography sx={{ fontSize: "12px", color: "#bbb", fontStyle: "italic" }}>No image</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #e0e0e0", textAlign: "center", fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                                        {row.password || "—"}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                        <Button
                                            size="small"
                                            onClick={() => onChangePassword(row)}
                                            startIcon={<LockResetIcon sx={{ fontSize: 14 }} />}
                                            sx={{
                                                textTransform: "none",
                                                fontSize: "11px",
                                                color: "#F57C00",
                                                fontWeight: 600,
                                                borderRadius: "20px",
                                                px: 1.5,
                                                "&:hover": { bgcolor: "#FFF3E0" },
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Change
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>

        {/* Pagination bar */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 0.5, borderTop: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
            <Typography sx={{ fontSize: "12px", color: "#888" }}>
                Showing{" "}
                <strong>{allData.length === 0 ? 0 : page * rowsPerPage + 1}</strong>
                {" – "}
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
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "12px", color: "#888", mb: 0 },
                    "& .MuiTablePagination-select": { fontSize: "12px" },
                    "& .MuiIconButton-root": { p: 0.5 },
                    border: "none",
                }}
            />
        </Box>
    </Box>
));

// ─── Main component ───────────────────────────────────────────────────────────
export default function PasswordManagementPage() {
    const navigate = useNavigate();
    const token = "123";
    const user = useSelector((state) => state.auth);
    const websiteSettings = useSelector(selectWebsiteSettings);

    const [isLoading, setIsLoading] = useState(false);
    const [passwords, setPasswords] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

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

    useEffect(() => { fetchAllData(); }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(UsersPassword, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPasswords(res.data);
            setFilteredData(res.data);
            setPage(0);
        } catch (error) {
            console.error(error);
            setSnack({ open: true, status: false, color: false, message: "Failed to load data" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
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

    // Route guard — only superadmin can access this page.
    // Placed AFTER all hooks to comply with react-hooks/rules-of-hooks.
    if (user?.userType !== "superadmin") {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }

    return (
        <Box sx={{ width: "100%" }}>
            {isLoading && <Loader />}
            <SnackBar
                open={snack.open}
                color={snack.color}
                setOpen={(val) => setSnack((prev) => ({ ...prev, open: val }))}
                status={snack.status}
                message={snack.message}
            />

            {/* Header */}
            <Box sx={{ backgroundColor: "#f2f2f2", p: 1.5, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd" }}>
                <Grid container alignItems="center" spacing={1}>
                    <Grid size={{ xs: 12, sm: 5 }} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton sx={{ width: 27, height: 27 }} onClick={() => navigate(-1)}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 600, fontSize: "20px" }}>Password Management</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by name or roll number..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 18, color: "#aaa" }} />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: "50px", fontSize: "13px", height: "32px" },
                                },
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "50px" } }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }} sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
                        <Button
                            variant="contained"
                            onClick={handleExport}
                            startIcon={<FileDownloadIcon sx={{ fontSize: 18 }} />}
                            sx={{
                                textTransform: "none",
                                bgcolor: websiteSettings.mainColor,
                                "&:hover": { bgcolor: websiteSettings.mainColor, opacity: 0.9 },
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: 600,
                                height: "32px",
                            }}
                        >
                            Export
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* Table */}
            <Box sx={{ p: 2 }}>
                <PasswordTable
                    pageData={pageData}
                    allData={filteredData}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onChangePassword={handleOpenChange}
                    onViewImage={handleViewImage}
                />
            </Box>

            {/* ── Change Password Dialog ── */}
            <Dialog open={dialog.open} onClose={closeDialog} fullWidth maxWidth="xs">
                <Box sx={{ bgcolor: "#f2f2f2", px: 2.5, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #ddd" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LockResetIcon sx={{ fontSize: 18, color: "#F57C00" }} />
                        <Typography sx={{ fontWeight: 600, fontSize: "16px" }}>Change Password</Typography>
                    </Box>
                    <IconButton size="small" onClick={closeDialog}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                <DialogContent sx={{ pt: 2.5, pb: 1 }}>
                    {/* User info card */}
                    {dialog.user && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "#fafafa", border: "1px solid #e8e8e8", borderRadius: "8px", mb: 2.5 }}>
                            <Avatar
                                src={dialog.user.filepath || avatarImage}
                                sx={{ width: 40, height: 40, border: "2px solid #e0e0e0" }}
                            />
                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "#222" }}>
                                    {dialog.user.name || "Name not provided"}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#888" }}>
                                    {dialog.user.rollNumber}
                                    {dialog.user.userType ? ` · ${dialog.user.userType}` : ""}
                                    {dialog.user.grade ? ` · ${dialog.user.grade}` : ""}
                                    {dialog.user.section ? ` / ${dialog.user.section}` : ""}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* New password */}
                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#555", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                        New Password
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        type={dialog.showNew ? "text" : "password"}
                        placeholder="Enter new password"
                        value={dialog.newPassword}
                        onChange={(e) => setDialog((prev) => ({ ...prev, newPassword: e.target.value }))}
                        sx={{ mb: 2 }}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setDialog((prev) => ({ ...prev, showNew: !prev.showNew }))}>
                                            {dialog.showNew ? <VisibilityIcon sx={{ fontSize: 18 }} /> : <VisibilityOffIcon sx={{ fontSize: 18 }} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    {/* Confirm password */}
                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#555", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                        Confirm Password
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        type={dialog.showConfirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={dialog.confirmPassword}
                        onChange={(e) => setDialog((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        error={!!passwordMismatch}
                        helperText={passwordMismatch ? "Passwords do not match" : passwordsMatch ? "✓ Passwords match" : ""}
                        sx={{
                            "& .MuiFormHelperText-root": {
                                color: passwordMismatch ? "#e53935" : "#388E3C",
                                fontWeight: 600,
                                fontSize: "12px",
                            },
                        }}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setDialog((prev) => ({ ...prev, showConfirm: !prev.showConfirm }))}>
                                            {dialog.showConfirm ? <VisibilityIcon sx={{ fontSize: 18 }} /> : <VisibilityOffIcon sx={{ fontSize: 18 }} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 2.5, pb: 2, pt: 1 }}>
                    <Button
                        onClick={closeDialog}
                        sx={{ textTransform: "none", color: "#555", borderRadius: "20px", border: "1px solid #ddd" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={!passwordsMatch}
                        onClick={handleChangePassword}
                        sx={{
                            textTransform: "none",
                            borderRadius: "20px",
                            bgcolor: websiteSettings.mainColor,
                            "&:hover": { bgcolor: websiteSettings.mainColor, opacity: 0.9 },
                            "&:disabled": { bgcolor: "#e0e0e0", color: "#bbb" },
                            px: 3,
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
                sx={{ "& .MuiPaper-root": { backgroundColor: "transparent", boxShadow: "none", overflow: "visible" } }}
                BackdropProps={{ style: { backgroundColor: "rgba(0,0,0,0.85)" } }}
            >
                <img
                    src={imageUrl || avatarImage}
                    alt="User"
                    style={{ width: "auto", height: "auto", maxWidth: "80vw", maxHeight: "80vh", display: "block", margin: "auto" }}
                />
                <IconButton
                    onClick={() => setOpenImage(false)}
                    sx={{ position: "absolute", top: -10, right: -40, bgcolor: "rgba(255,255,255,0.2)", "&:hover": { bgcolor: "rgba(255,255,255,0.4)" } }}
                >
                    <CloseIcon sx={{ color: "#fff" }} />
                </IconButton>
            </Dialog>
        </Box>
    );
}
