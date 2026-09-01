import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, CARD_SHADOW } from "./complaintsTokens";
import { tableHeaderCellSx, tableHeaderRowSx } from "./ComplaintsTableParts";
import { searchStudents } from "./complaintsDetailApi";
import {
    STUDENT_COLS,
    STUDENT_PAGE_SIZE,
    CLASS_OPTIONS,
    SECTION_OPTIONS,
} from "./registerComplaintData";

// Step one of the parent-complaint intake, reached from "Add New > Parent
// Complaint" on the Management Dashboard: find the student the complaint is
// about, then carry them into the complaint form.
//
// The Figma frame includes the sidebar and the global top bar. DashBoardLayout
// already renders both, so this page starts at the back arrow.

const COL = STUDENT_COLS;

// This comp's form controls use a #D1D5DC hairline rather than the #E8ECF4 the
// card borders use, and sit at 40px.
const FIELD_BORDER = "#D1D5DC";

const cardSx = {
    alignSelf: "stretch",
    p: 3,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    boxShadow: CARD_SHADOW,
    display: "flex",
    flexDirection: "column",
};

const controlSx = {
    height: 40,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "8px",
    fontSize: "14px",
    color: C.text,
    "& .MuiOutlinedInput-input": { p: "0 12px", display: "flex", alignItems: "center" },
    "& fieldset": { borderColor: FIELD_BORDER },
    "&:hover fieldset": { borderColor: FIELD_BORDER },
    "& .MuiSelect-icon": { color: C.textMuted, fontSize: "18px" },
};

/* Labelled form control — the comp stacks a 13/500 label over every field. */
const Field = ({ label, width, children }) => (
    <Box
        sx={{
            width,
            flex: width ? "0 0 auto" : 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
        }}
    >
        <Typography sx={{ fontSize: "13px", fontWeight: 500, color: C.text }}>{label}</Typography>
        {children}
    </Box>
);

/* Body cell. The comp greys the admission / class / section columns and keeps
   the name and parent columns at full contrast. */
const Cell = ({ width, muted, fontSize = "13px", fontWeight = 400, children }) => (
    <Typography
        sx={{
            width,
            flex: width ? "0 0 auto" : 1,
            minWidth: 0,
            fontSize,
            fontWeight,
            color: muted ? C.textMuted : C.text,
        }}
    >
        {children}
    </Typography>
);

export default function RegisterComplaintPage() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    // What the user is typing, and what the last Search actually applied — the
    // comp gives this screen an explicit Search button rather than live filtering.
    const [draft, setDraft] = useState({ query: "", grade: "", section: "" });
    const [criteria, setCriteria] = useState({ query: "", grade: "", section: "" });
    const [page, setPage] = useState(1);

    const setDraftField = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

    const runSearch = () => {
        setCriteria(draft);
        setPage(1);
        setSearched(true);
    };

    /* Searching, filtering and paging all happen server-side, so a change to the criteria
       or the page is a refetch rather than a slice of a local array. */
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const result = await searchStudents({
            search: criteria.query.trim(),
            grade: criteria.grade,
            section: criteria.section,
            page,
            pageSize: STUDENT_PAGE_SIZE,
        });
        if (!result.ok) {
            setError(result.message || "Could not search students");
            setRows([]);
            setTotal(0);
        } else {
            setError("");
            setRows(result.rows);
            setTotal(result.totalItems);
            setPages(result.totalPages || 1);
        }
        setLoading(false);
    }, [criteria, page]);

    useEffect(() => {
        if (searched) load();
    }, [searched, load]);

    const pageCount = Math.max(1, pages);
    const currentPage = Math.min(page, pageCount);
    const firstRow = total === 0 ? 0 : (currentPage - 1) * STUDENT_PAGE_SIZE + 1;
    const lastRow = Math.min(currentPage * STUDENT_PAGE_SIZE, total);
    const pageRows = rows;

    // The student rides along in navigation state so the form does not have to
    // look them up again; the id in the path keeps a refresh working.
    const handleSelect = (student) => {
        navigate(`/dashboardmenu/complaints/register/${student.id}`, { state: { student } });
    };

    const stepBtnSx = {
        minWidth: 0,
        px: "12px",
        py: "6px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 500,
        textTransform: "none",
        boxSizing: "border-box",
        bgcolor: C.surface,
        color: C.textMuted,
        border: `1px solid ${C.border}`,
        "&:hover": { bgcolor: "#F8FAFC", border: `1px solid ${C.border}` },
        "&.Mui-disabled": { color: C.textFaint, border: `1px solid ${C.border}` },
    };

    return (
        <Box sx={{ p: "28px", display: "flex", flexDirection: "column", gap: 3.5 }}>
            {/* Back + title */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton onClick={() => navigate(-1)} aria-label="Back" sx={{ p: 0.5 }}>
                        <ArrowBackIcon sx={{ fontSize: "18px", color: C.textMuted }} />
                    </IconButton>
                    <Typography sx={{ fontSize: "21px", fontWeight: 700, color: C.text }}>
                        Register Complaint
                    </Typography>
                </Box>
                <Typography sx={{ pl: "26px", fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                    Register a complaint on behalf of a parent.
                </Typography>
            </Box>

            {/* Search Student */}
            <Box sx={{ ...cardSx, gap: 2.5 }}>
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                    Search Student
                </Typography>

                <Box
                    sx={{
                        alignSelf: "stretch",
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Field label="Search here">
                        <TextField
                            value={draft.query}
                            onChange={(e) => setDraftField("query", e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && runSearch()}
                            placeholder="Search by student name, admission number or parent mobile"
                            fullWidth
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    height: 40,
                                    boxSizing: "border-box",
                                    bgcolor: C.surface,
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    "& fieldset": { borderColor: FIELD_BORDER },
                                    "&:hover fieldset": { borderColor: FIELD_BORDER },
                                },
                                "& .MuiOutlinedInput-input": { p: "0 12px", color: C.text },
                                "& .MuiOutlinedInput-input::placeholder": { color: C.textMuted, opacity: 1 },
                            }}
                        />
                    </Field>

                    <Field label="Class" width={180}>
                        <Select
                            value={draft.grade}
                            onChange={(e) => setDraftField("grade", e.target.value)}
                            displayEmpty
                            renderValue={(v) => (v === "" ? "All Classes" : v)}
                            fullWidth
                            sx={controlSx}
                        >
                            <MenuItem value="" sx={{ fontSize: "14px" }}>
                                All Classes
                            </MenuItem>
                            {CLASS_OPTIONS.map((o) => (
                                <MenuItem key={o} value={o} sx={{ fontSize: "14px" }}>
                                    {o}
                                </MenuItem>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Section" width={180}>
                        <Select
                            value={draft.section}
                            onChange={(e) => setDraftField("section", e.target.value)}
                            displayEmpty
                            renderValue={(v) => (v === "" ? "All Sections" : v)}
                            fullWidth
                            sx={controlSx}
                        >
                            <MenuItem value="" sx={{ fontSize: "14px" }}>
                                All Sections
                            </MenuItem>
                            {SECTION_OPTIONS.map((o) => (
                                <MenuItem key={o} value={o} sx={{ fontSize: "14px" }}>
                                    {o}
                                </MenuItem>
                            ))}
                        </Select>
                    </Field>

                    <Button
                        onClick={runSearch}
                        sx={{
                            height: 40,
                            px: 3,
                            boxSizing: "border-box",
                            bgcolor: accent,
                            color: "#191C1E",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                            textTransform: "none",
                            whiteSpace: "nowrap",
                            "&:hover": { bgcolor: websiteSettings.darkColor },
                        }}
                    >
                        Search
                    </Button>
                </Box>
            </Box>

            {/* Search Results */}
            <Box sx={{ ...cardSx, gap: 2 }}>
                <Box
                    sx={{
                        alignSelf: "stretch",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
                        Search Results
                    </Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textMuted }}>
                        Showing {total} {total === 1 ? "match" : "matches"}
                    </Typography>
                </Box>

                {/* Seven fixed columns, so the table scrolls inside the card rather
                    than pushing the page sideways. */}
                <Box sx={{ alignSelf: "stretch", overflowX: "auto" }}>
                    <Box sx={{ minWidth: COL.minWidth }}>
                        <Box sx={tableHeaderRowSx}>
                            <Typography sx={{ ...tableHeaderCellSx, flex: 1, minWidth: 0 }}>
                                Student Name
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.admission, flexShrink: 0 }}>
                                Admission No.
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.grade, flexShrink: 0 }}>
                                Class
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.section, flexShrink: 0 }}>
                                Section
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.parent, flexShrink: 0 }}>
                                Parent Name
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.mobile, flexShrink: 0 }}>
                                Parent Mobile
                            </Typography>
                            <Typography
                                sx={{ ...tableHeaderCellSx, width: COL.action, flexShrink: 0, textAlign: "right" }}
                            >
                                Action
                            </Typography>
                        </Box>

                        {pageRows.map((student) => (
                            <Box
                                key={student.id}
                                sx={{
                                    px: "12px",
                                    py: "14px",
                                    borderBottom: `1px solid ${C.border}`,
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <Cell fontSize="14px" fontWeight={600}>
                                    {student.name}
                                </Cell>
                                <Cell width={COL.admission} muted>
                                    {student.admissionNo}
                                </Cell>
                                <Cell width={COL.grade} muted>
                                    {student.grade}
                                </Cell>
                                <Cell width={COL.section} muted>
                                    {student.section}
                                </Cell>
                                <Cell width={COL.parent}>{student.parentName}</Cell>
                                <Cell width={COL.mobile}>{student.parentMobile}</Cell>
                                <Box
                                    sx={{
                                        width: COL.action,
                                        flexShrink: 0,
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Button
                                        onClick={() => handleSelect(student)}
                                        sx={{
                                            minWidth: 0,
                                            px: 2,
                                            py: "6px",
                                            bgcolor: accent,
                                            color: "#191C1E",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            textTransform: "none",
                                            "&:hover": { bgcolor: websiteSettings.darkColor },
                                        }}
                                    >
                                        Select
                                    </Button>
                                </Box>
                            </Box>
                        ))}

                        {/* Before the first search, mid-search and "nothing matched" are
                            three different things — an unsearched screen should not read as
                            an empty result. */}
                        {pageRows.length === 0 && (
                            <Box sx={{ px: "12px", py: "28px", display: "flex", justifyContent: "center" }}>
                                <Typography
                                    sx={{
                                        fontSize: "13px",
                                        fontWeight: 400,
                                        color: error ? C.red : C.textMuted,
                                        textAlign: "center",
                                    }}
                                >
                                    {loading
                                        ? "Searching…"
                                        : error
                                          ? error
                                          : !searched
                                            ? "Search by name, admission number or roll number to find a student."
                                            : "No students match this search."}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Footer count + paging */}
                <Box
                    sx={{
                        alignSelf: "stretch",
                        pt: 2,
                        pb: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        Showing {firstRow}-{lastRow} of {total} results
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button
                            disabled={currentPage === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            sx={stepBtnSx}
                        >
                            Previous
                        </Button>

                        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => {
                            const active = n === currentPage;
                            return (
                                <Button
                                    key={n}
                                    onClick={() => setPage(n)}
                                    sx={{
                                        minWidth: 0,
                                        px: "12px",
                                        py: "6px",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        fontWeight: active ? 600 : 500,
                                        textTransform: "none",
                                        boxSizing: "border-box",
                                        bgcolor: active ? accent : C.surface,
                                        color: active ? "#191C1E" : C.textMuted,
                                        border: `1px solid ${active ? accent : C.border}`,
                                        "&:hover": {
                                            bgcolor: active ? websiteSettings.darkColor : "#F8FAFC",
                                            border: `1px solid ${active ? accent : C.border}`,
                                        },
                                    }}
                                >
                                    {n}
                                </Button>
                            );
                        })}

                        <Button
                            disabled={currentPage === pageCount}
                            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                            sx={stepBtnSx}
                        >
                            Next
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
