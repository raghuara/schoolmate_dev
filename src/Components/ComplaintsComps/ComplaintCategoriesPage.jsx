import React, { useCallback, useEffect, useMemo, useState } from "react";
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
    CATEGORY_COLS,
    CATEGORY_PAGE_SIZE,
    STATUS_FILTER,
    PRIORITY_FILTER,
    PRIORITY_STYLE,
    STATUS_STYLE,
} from "./complaintCategoriesData";
import AddCategoryDrawer from "./AddCategoryDrawer";
import {
    MODULE,
    categoryQueryFrom,
    categoryRowForTable,
    createCategory,
    fetchCategories,
    fetchRoleNames,
    setCategoryStatus,
} from "./complaintsConfigApi";

// Reached from the "Category Configuration" tile on the Configurations screen.
// The Figma frame includes the global top bar; DashBoardLayout already renders
// that, so this page starts at the breadcrumb.

const COL = CATEGORY_COLS;

export default function ComplaintCategoriesPage({ embedded = false }) {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    /* Which stream this screen configures. Parent and Staff Concern share one set of
       endpoints and are told apart by moduleType, so InternalCategoriesPage renders the
       same data with MODULE.staff. */
    const moduleType = MODULE.parent;

    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [pageCountFromApi, setPageCountFromApi] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [addOpen, setAddOpen] = useState(false);

    // Toolbar state. Each filter rests on its own label ("All Status", "Priority"),
    // which is how the comp draws the unset state.
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState(STATUS_FILTER[0]);
    const [priority, setPriority] = useState(PRIORITY_FILTER[0]);
    const [page, setPage] = useState(1);

    /* Search, filters and paging are all applied server-side, so a change to any of them
       is a refetch rather than a slice of a local array. */
    const load = useCallback(async () => {
        setLoading(true);
        const result = await fetchCategories({
            moduleType,
            ...categoryQueryFrom({ search, status, priority }),
            page,
            pageSize: CATEGORY_PAGE_SIZE,
        });
        if (!result.ok) {
            setError(result.message);
            setRows([]);
            setTotal(0);
        } else {
            setError("");
            setRows(result.rows.map(categoryRowForTable));
            setTotal(result.totalItems);
            setPageCountFromApi(result.totalPages || 1);
        }
        setLoading(false);
    }, [moduleType, search, status, priority, page]);

    useEffect(() => {
        load();
    }, [load]);

    // Typing shouldn't fire a request per keystroke; settle first, then search.
    const [searchInput, setSearchInput] = useState("");
    useEffect(() => {
        const id = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 350);
        return () => clearTimeout(id);
    }, [searchInput]);

    const toggleStatus = async (id) => {
        const row = rows.find((r) => r.id === id);
        if (!row) return;
        const result = await setCategoryStatus({
            categoryId: row.categoryId,
            isActive: row.status !== "ACTIVE",
        });
        if (!result.ok) setError(result.message);
        // Re-read rather than flipping locally: the server owns the row's version stamp
        else load();
    };

    // The drawer's Default Owner list is not in the comp — derive it from the
    // owners already in use rather than inventing one. Swap for the staff API.
    /* The picker offers the school's roles, not the owners already in use — an unowned
       category list would otherwise leave the dropdown empty with nothing to choose. */
    const [ownerOptions, setOwnerOptions] = useState([]);

    useEffect(() => {
        let cancelled = false;
        fetchRoleNames().then((names) => {
            if (!cancelled) setOwnerOptions(names);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    /* `rows` is already the current page, filtered and searched by the server, so the
       footer counts come from the response — counting the rows on screen would report
       "1-8 of 8" on every page. */
    const pageCount = Math.max(1, pageCountFromApi);
    const currentPage = Math.min(page, pageCount);
    const firstRow = total === 0 ? 0 : (currentPage - 1) * CATEGORY_PAGE_SIZE + 1;
    const lastRow = Math.min(currentPage * CATEGORY_PAGE_SIZE, total);
    const pageRows = rows;

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

    /* The drawer collects { name, description, priority, owner, status }; the API also wants
       a categoryCode, which the comp has no field for. Deriving it from the name keeps the
       one required field the drawer cannot ask for from blocking a save — SNAKE_CASE is the
       convention every seeded code follows (ACADEMICS, FEE_ACCOUNT, TEACHER_RELATED). */
    const codeFrom = (name) =>
        name
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "")
            .slice(0, 40);

    const addCategory = async (draft) => {
        const result = await createCategory({
            moduleType,
            code: codeFrom(draft.name),
            name: draft.name.trim(),
            description: draft.description || "",
            priority: (draft.priority || "Normal").replace(/^(.)(.*)$/, (m, a, b) => a + b.toLowerCase()),
            ownerRole: draft.owner || "",
            isActive: draft.status !== "INACTIVE",
        });
        if (!result.ok) {
            setError(result.message);
            return;
        }
        setAddOpen(false);
        setPage(1);
        load();
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
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
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

                        {/* A fetch in flight and a genuinely empty result are different
                            states — showing "no categories" while loading sends the reader
                            looking for a filter to clear. */}
                        {loading && (
                            <Box sx={{ ...tableBodyRowSx, justifyContent: "center", py: 4 }}>
                                <Typography sx={{ fontSize: "13px", color: C.textMuted }}>
                                    Loading categories…
                                </Typography>
                            </Box>
                        )}

                        {!loading && error && (
                            <Box sx={{ ...tableBodyRowSx, justifyContent: "center", py: 4 }}>
                                <Typography sx={{ fontSize: "13px", color: C.red }}>{error}</Typography>
                            </Box>
                        )}

                        {!loading && !error && pageRows.length === 0 && (
                            <Box sx={{ ...tableBodyRowSx, justifyContent: "center", py: 4 }}>
                                <Typography sx={{ fontSize: "13px", color: C.textMuted }}>
                                    No categories match these filters.
                                </Typography>
                            </Box>
                        )}

                        {!loading && pageRows.map((row) => {
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
                    Showing {firstRow}-{lastRow} of {total} categories
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
