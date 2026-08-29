import React, { useMemo, useState } from "react";
import { Box, Button, InputAdornment, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, CARD_SHADOW } from "./complaintsTokens";
import ComplaintsBreadcrumb from "./ComplaintsBreadcrumb";
import {
    TableChip,
    RowAction,
    tableHeaderCellSx,
    tableHeaderRowSx,
    tableBodyRowSx,
} from "./ComplaintsTableParts";
import {
    CATEGORY_ROWS,
    CATEGORY_COLS,
    CATEGORY_PAGE_SIZE,
    STATUS_FILTER,
    PRIORITY_FILTER,
    PRIORITY_STYLE,
    STATUS_STYLE,
} from "./complaintCategoriesData";
import AddCategoryDrawer from "./AddCategoryDrawer";

// Reached from the "Category Configuration" tile on the Configurations screen.
// The Figma frame includes the global top bar; DashBoardLayout already renders
// that, so this page starts at the breadcrumb.

const COL = CATEGORY_COLS;

export default function ComplaintCategoriesPage({ embedded = false }) {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    // Local only — the enable/disable action has no endpoint yet, so it just
    // flips the row so the screen behaves while the API is built.
    const [rows, setRows] = useState(CATEGORY_ROWS);

    const [addOpen, setAddOpen] = useState(false);

    // Toolbar state. Each filter rests on its own label ("All Status", "Priority"),
    // which is how the comp draws the unset state.
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState(STATUS_FILTER[0]);
    const [priority, setPriority] = useState(PRIORITY_FILTER[0]);
    const [page, setPage] = useState(1);

    const toggleStatus = (id) =>
        setRows((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, status: r.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : r,
            ),
        );

    // The drawer's Default Owner list is not in the comp — derive it from the
    // owners already in use rather than inventing one. Swap for the staff API.
    const ownerOptions = useMemo(
        () => [...new Set(rows.map((r) => r.owner).filter(Boolean))].sort(),
        [rows],
    );

    const visibleRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows.filter((r) => {
            if (status !== STATUS_FILTER[0] && r.status !== status) return false;
            if (priority !== PRIORITY_FILTER[0] && r.priority !== priority) return false;
            if (!q) return true;
            return [r.name, r.description, r.owner]
                .filter(Boolean)
                .some((v) => v.toLowerCase().includes(q));
        });
    }, [rows, search, status, priority]);

    // Paging is local while the rows are mock. Once the API paginates, the totals
    // come from the response and `pageRows` holds only what it returned.
    const pageCount = Math.max(1, Math.ceil(visibleRows.length / CATEGORY_PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const firstRow = visibleRows.length === 0 ? 0 : (currentPage - 1) * CATEGORY_PAGE_SIZE + 1;
    const lastRow = Math.min(currentPage * CATEGORY_PAGE_SIZE, visibleRows.length);
    const pageRows = visibleRows.slice(
        (currentPage - 1) * CATEGORY_PAGE_SIZE,
        currentPage * CATEGORY_PAGE_SIZE,
    );

    const filterControlSx = {
        height: 36,
        boxSizing: "border-box",
        bgcolor: C.surface,
        borderRadius: "8px",
        fontSize: "13px",
        color: C.text,
        "& .MuiOutlinedInput-input": { p: "0 12px", display: "flex", alignItems: "center" },
        "& fieldset": { borderColor: C.border },
        "&:hover fieldset": { borderColor: C.border },
        "& .MuiSelect-icon": { color: C.textMuted, fontSize: "16px" },
    };

    const pageBtnSx = (active) => ({
        minWidth: 0,
        px: "10px",
        py: "6px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: active ? 700 : 600,
        textTransform: "none",
        boxSizing: "border-box",
        bgcolor: active ? accent : C.surface,
        color: active ? "#191C1E" : C.textMuted,
        border: active ? "none" : `1px solid ${C.border}`,
        "&:hover": { bgcolor: active ? websiteSettings.darkColor : "#F8FAFC" },
        "&.Mui-disabled": { bgcolor: "#F4F6FA", color: C.textFaint },
    });

    // Local only — appends to component state until the categories API exists.
    const addCategory = (draft) => {
        setRows((prev) => [
            ...prev,
            {
                ...draft,
                id: Math.max(0, ...prev.map((r) => r.id)) + 1,
                priority: (draft.priority || "Normal").toUpperCase(),
            },
        ]);
        setAddOpen(false);
    };

    return (
        <Box sx={{ p: embedded ? 0 : "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Breadcrumb + title */}
            {!embedded && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <ComplaintsBreadcrumb
                        trail={[
                            { label: "Administration" },
                            {
                                label: "Complaint Configuration",
                                onClick: () => navigate("/dashboardmenu/complaints/configuration"),
                            },
                            { label: "Categories" },
                        ]}
                    />
                    <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                        Complaint Categories
                    </Typography>
                </Box>
            )}

            {/* Search + filters, with the primary action on the right */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2.5,
                    flexWrap: "wrap",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
                    <TextField
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search categories..."
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlinedIcon sx={{ fontSize: "14px", color: C.textFaint }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            width: { xs: "100%", sm: 352 },
                            "& .MuiOutlinedInput-root": {
                                height: 36,
                                boxSizing: "border-box",
                                bgcolor: "#F4F6FA",
                                borderRadius: "8px",
                                fontSize: "13px",
                                pl: "12px",
                                "& fieldset": { borderColor: C.border },
                                "&:hover fieldset": { borderColor: C.border },
                            },
                            "& .MuiOutlinedInput-input": { p: 0, color: C.text },
                            "& .MuiOutlinedInput-input::placeholder": {
                                color: "rgba(30, 41, 59, 0.50)",
                                opacity: 1,
                            },
                        }}
                    />

                    <Select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                        sx={filterControlSx}
                    >
                        {STATUS_FILTER.map((option) => (
                            <MenuItem key={option} value={option} sx={{ fontSize: "13px" }}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>

                    <Select
                        value={priority}
                        onChange={(e) => {
                            setPriority(e.target.value);
                            setPage(1);
                        }}
                        sx={filterControlSx}
                    >
                        {PRIORITY_FILTER.map((option) => (
                            <MenuItem key={option} value={option} sx={{ fontSize: "13px" }}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                <Button
                    onClick={() => setAddOpen(true)}
                    startIcon={<AddOutlinedIcon sx={{ fontSize: "12px" }} />}
                    sx={{
                        height: 36,
                        boxSizing: "border-box",
                        px: "14px",
                        gap: 1,
                        bgcolor: accent,
                        color: "#191C1E",
                        borderRadius: "7px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        "&:hover": { bgcolor: websiteSettings.darkColor },
                    }}
                >
                    Add Category
                </Button>
            </Box>

            {/* Table card */}
            <Box
                sx={{
                    p: 3,
                    boxSizing: "border-box",
                    bgcolor: C.surface,
                    borderRadius: "16px",
                    border: `1px solid ${C.border}`,
                    boxShadow: CARD_SHADOW,
                }}
            >
                {/* Fixed column widths would squash on small screens, so the table
                    scrolls inside the card instead of forcing the page sideways. */}
                <Box sx={{ overflowX: "auto" }}>
                    <Box sx={{ minWidth: COL.minWidth }}>
                        <Box sx={{ ...tableHeaderRowSx, gap: COL.gap }}>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.name, flexShrink: 0 }}>
                                Category Name
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, flex: 1, minWidth: 0 }}>
                                Description
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.priority, flexShrink: 0 }}>
                                Default Priority
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.owner, flexShrink: 0 }}>
                                Default Owner
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.status, flexShrink: 0 }}>
                                Status
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.actions, flexShrink: 0, textAlign: "right" }}>
                                Actions
                            </Typography>
                        </Box>

                        {pageRows.map((row) => {
                            const isActive = row.status === "ACTIVE";
                            return (
                                <Box key={row.id} sx={{ ...tableBodyRowSx, gap: COL.gap }}>
                                    <Typography
                                        sx={{ width: COL.name, flexShrink: 0, fontSize: "13px", fontWeight: 600, color: C.text }}
                                    >
                                        {row.name}
                                    </Typography>
                                    <Typography
                                        sx={{ flex: 1, minWidth: 0, fontSize: "13px", fontWeight: 400, color: C.textMuted }}
                                    >
                                        {row.description}
                                    </Typography>
                                    <Box sx={{ width: COL.priority, flexShrink: 0 }}>
                                        <TableChip label={row.priority} palette={PRIORITY_STYLE} width={100} />
                                    </Box>
                                    <Typography
                                        sx={{ width: COL.owner, flexShrink: 0, fontSize: "13px", fontWeight: 400, color: C.text }}
                                    >
                                        {row.owner || "—"}
                                    </Typography>
                                    <Box sx={{ width: COL.status, flexShrink: 0 }}>
                                        <TableChip label={row.status} palette={STATUS_STYLE} width={80} />
                                    </Box>
                                    <Box
                                        sx={{
                                            width: COL.actions,
                                            flexShrink: 0,
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: 1.5,
                                        }}
                                    >
                                        <RowAction
                                            label={isActive ? "Disable" : "Enable"}
                                            color={isActive ? C.red : C.green}
                                            onClick={() => toggleStatus(row.id)}
                                        />
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>

            {/* Count + paging */}
            <Box
                sx={{
                    pt: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                    Showing {firstRow}-{lastRow} of {visibleRows.length} categories
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                        disabled={currentPage === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        sx={{ ...pageBtnSx(false), bgcolor: "#F4F6FA" }}
                    >
                        &lt; Previous
                    </Button>

                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                        <Button key={n} onClick={() => setPage(n)} sx={pageBtnSx(n === currentPage)}>
                            {n}
                        </Button>
                    ))}

                    <Button
                        disabled={currentPage === pageCount}
                        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                        sx={pageBtnSx(false)}
                    >
                        Next &gt;
                    </Button>
                </Box>
            </Box>

            <AddCategoryDrawer
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onSave={addCategory}
                ownerOptions={ownerOptions}
            />
        </Box>
    );
}
