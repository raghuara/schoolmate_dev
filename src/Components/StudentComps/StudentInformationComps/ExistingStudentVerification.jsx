import React, { useState } from "react";
import {
    Box, Grid, Typography, TextField, Button, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DownloadingOutlinedIcon from "@mui/icons-material/DownloadingOutlined";

const ROWS_PER_PAGE = 5;

const labelSx = { fontSize: "12px", color: "#374151", fontWeight: 600 };
const fieldSx = { mt: 0.5, "& .MuiOutlinedInput-root": { borderRadius: "8px", height: 41, fontSize: 14 } };

// NOTE: replace this with the real "search archived/previous student records" API.
// Keep each record shaped like: { id, name, admissionNo, academicYear, grade, status, note }
const buildMockResults = () => ([
    { id: 1, name: "K Arjun Kumar", admissionNo: "ADM-2023-018", academicYear: "2023-2024", grade: "Grade V", status: "TC Issued", note: "" },
    { id: 2, name: "K Arjun Kumar", admissionNo: "ADM-2022-044", academicYear: "2024-2025", grade: "Grade VI", status: "Active", note: "Currently Studying" },
    { id: 3, name: "V Arjun Kumar", admissionNo: "ADM-2022-044", academicYear: "2024-2025", grade: "Grade VI", status: "Active", note: "Currently Studying" },
    { id: 4, name: "R Arjun Kumar", admissionNo: "ADM-2022-044", academicYear: "2024-2025", grade: "Grade VI", status: "Active", note: "Currently Studying" },
]);

const STATUS_STYLE = {
    "TC Issued": { color: "#1565C0", bg: "#E3F2FD", label: "TC ISSUED" },
    "Active": { color: "#16A34A", bg: "#E8F5E9", label: "ACTIVE" },
};

export default function ExistingStudentVerification({ mainColor = "#E60154", defaultAcademicYear = "", onLoadExisting }) {
    const [form, setForm] = useState({
        fullName: "", dob: "", mobile: "", academicYear: defaultAcademicYear || "",
        aadhaar: "", emis: "", prevAdmissionNo: "", prevRollNo: "",
    });
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const setField = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

    const handleCompare = () => {
        setLoading(true);
        setSearched(true);
        setPage(1);
        // TODO: call the real search API with `form` and setResults(res.data)
        setTimeout(() => {
            setResults(buildMockResults());
            setLoading(false);
        }, 500);
    };

    const fields = [
        { key: "fullName", label: "Student Full Name", required: true, placeholder: "e.g. Arjun Kumar" },
        { key: "dob", label: "Date of Birth", required: true, placeholder: "e.g. 12 May 2013" },
        { key: "mobile", label: "Parent Mobile Number", required: true, placeholder: "+91 ..." },
        { key: "academicYear", label: "Academic Year", required: true, placeholder: "e.g. 2024-2025" },
        { key: "aadhaar", label: "Aadhaar Number", placeholder: "XXXX XXXX XXXX" },
        { key: "emis", label: "EMIS Number", placeholder: "EMIS..." },
        { key: "prevAdmissionNo", label: "Previous Admission Number", placeholder: "ADM-...." },
        { key: "prevRollNo", label: "Previous Roll Number", placeholder: "Roll no" },
    ];

    const totalPages = Math.max(1, Math.ceil(results.length / ROWS_PER_PAGE));
    const pageRows = results.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

    return (
        <Box sx={{ p: 2 }}>
            {/* Search form */}
            <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "12px", p: 2.2 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.6, mb: 1.5 }}>
                    Student Verification
                </Typography>
                <Grid container columnSpacing={3} rowSpacing={1.5}>
                    {fields.map((f) => (
                        <Grid key={f.key} size={{ xs: 12, sm: 6, md: 3 }}>
                            <Typography sx={labelSx} component="span">
                                {f.label}{f.required && <span style={{ color: "#ff0000", fontSize: "16px" }}>*</span>}
                            </Typography>
                            <TextField
                                fullWidth size="small"
                                value={form[f.key]}
                                onChange={setField(f.key)}
                                placeholder={f.placeholder}
                                sx={fieldSx}
                            />
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Button
                        onClick={handleCompare}
                        startIcon={<SearchIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            textTransform: "none", fontWeight: 700, fontSize: 13,
                            border: "1px solid #000", color: "#000", borderRadius: "20px",
                            px: 2.4, height: 38, "&:hover": { bgcolor: "#f5f5f5" },
                        }}
                    >
                        Compare Existing Records
                    </Button>
                </Box>
            </Box>

            {/* Results */}
            {searched && (
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.2, borderRadius: "8px", bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", mb: 1.5 }}>
                        <InfoOutlinedIcon sx={{ fontSize: 18, color: "#2563EB" }} />
                        <Typography sx={{ fontSize: 12.5, color: "#1E40AF", fontWeight: 600 }}>
                            Possible student records found based on the entered details. Please review carefully before restoring or creating a new student profile.
                        </Typography>
                    </Box>

                    <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "#FAFBFC" }}>
                                        {["Student Name", "Admission No", "Academic Year", "Grade", "Status", "Actions"].map((h) => (
                                            <TableCell key={h} sx={{ fontWeight: 700, fontSize: 10.5, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, py: 1.4, whiteSpace: "nowrap" }}>
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: "none" }}>
                                                <CircularProgress size={26} sx={{ color: mainColor }} />
                                            </TableCell>
                                        </TableRow>
                                    ) : pageRows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: "none" }}>
                                                <PersonSearchOutlinedIcon sx={{ fontSize: 34, color: "#D1D5DB" }} />
                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF", mt: 0.5 }}>No matching records found</Typography>
                                                <Typography sx={{ fontSize: 11.5, color: "#9CA3AF" }}>Try different details, or continue creating a new profile.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : pageRows.map((r) => {
                                        const st = STATUS_STYLE[r.status] || { color: "#374151", bg: "#F3F4F6", label: r.status };
                                        const isTC = r.status === "TC Issued";
                                        return (
                                            <TableRow key={r.id} sx={{ "&:hover": { bgcolor: "#FAFBFC" } }}>
                                                <TableCell sx={{ borderBottom: "1px solid #F3F4F6" }}>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{r.name}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px solid #F3F4F6" }}>
                                                    <Typography sx={{ fontSize: 12.5, color: "#374151" }}>{r.admissionNo}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px solid #F3F4F6" }}>
                                                    <Typography sx={{ fontSize: 12.5, color: "#374151" }}>{r.academicYear}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px solid #F3F4F6" }}>
                                                    <Typography sx={{ fontSize: 12.5, color: "#374151" }}>{r.grade}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px solid #F3F4F6" }}>
                                                    <Chip size="small" label={st.label} sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: st.bg, color: st.color }} />
                                                    {r.note && (
                                                        <Typography sx={{ fontSize: 10, fontStyle: "italic", color: "#16A34A", mt: 0.3 }}>{r.note}</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px solid #F3F4F6" }}>
                                                    <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
                                                        <Button
                                                            size="small"
                                                            startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                                                            sx={{ textTransform: "none", fontSize: 11.5, fontWeight: 700, color: "#374151", border: "1px solid #E5E7EB", borderRadius: "8px", height: 30, px: 1.2, "&:hover": { bgcolor: "#F9FAFB" } }}
                                                        >
                                                            {isTC ? "View Previous Profile" : "View Student Profile"}
                                                        </Button>
                                                        {isTC && (
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                disableElevation
                                                                startIcon={<DownloadingOutlinedIcon sx={{ fontSize: 15 }} />}
                                                                onClick={() => onLoadExisting && onLoadExisting(r)}
                                                                sx={{ textTransform: "none", fontSize: 11.5, fontWeight: 700, bgcolor: mainColor, color: "#fff", borderRadius: "8px", height: 30, px: 1.4, "&:hover": { bgcolor: mainColor, filter: "brightness(0.92)" } }}
                                                            >
                                                                Load Existing Details
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {results.length > 0 && (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, px: 2, py: 1.2, borderTop: "1px solid #F3F4F6" }}>
                                <Typography sx={{ fontSize: 11.5, color: "#6B7280" }}>
                                    Showing {(page - 1) * ROWS_PER_PAGE + 1}-{Math.min(page * ROWS_PER_PAGE, results.length)} of {results.length}
                                </Typography>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(_, v) => setPage(v)}
                                    size="small"
                                    shape="rounded"
                                    sx={{ "& .Mui-selected": { bgcolor: `${mainColor} !important`, color: "#fff !important" } }}
                                />
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    );
}
