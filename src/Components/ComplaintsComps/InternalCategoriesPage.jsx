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
// Same four-colour priority palette and ACTIVE/INACTIVE palette as the Parent
// Categories table.
import { PRIORITY_STYLE, STATUS_STYLE } from "./complaintCategoriesData";
import {
    INTERNAL_CATEGORY_COLS,
    INTERNAL_STATUS_FILTER,
} from "./internalCategoriesData";
import CreateCategoryDialog from "./CreateCategoryDialog";
import {
    MODULE,
    categoryQueryFrom,
    categoryRowForTable,
    createCategory,
    fetchCategories,
    fetchRoleNames,
    setCategoryStatus,
} from "./complaintsConfigApi";

// Reached from the "Entry & Category Configuration" tile on the Internal
// Complaints tab of the Configurations screen.

const COL = INTERNAL_CATEGORY_COLS;

// This comp sets its table header at 13px where the Parent Categories comp uses 12px.
const headerCellSx = { ...tableHeaderCellSx, fontSize: "13px" };

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

export default function InternalCategoriesPage({ embedded = false }) {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    /* The Staff Concern half of the same endpoints the parent screen uses — only the
       moduleType differs. */
    const moduleType = MODULE.staff;

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All Status");
    const [department, setDepartment] = useState("All Departments");
    const [addOpen, setAddOpen] = useState(false);

    /* Search and status are applied server-side; department is not a filter the API takes,
       so it stays local over the returned page. */
    const load = useCallback(async () => {
        setLoading(true);
        const result = await fetchCategories({
            moduleType,
            ...categoryQueryFrom({ search, status, priority: "" }),
            page: 1,
            pageSize: 100,
        });
        if (!result.ok) {
            setError(result.message);
            setRows([]);
        } else {
            setError("");
            setRows(result.rows.map(categoryRowForTable));
        }
        setLoading(false);
    }, [moduleType, search, status]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        const id = setTimeout(() => setSearch(searchInput), 350);
        return () => clearTimeout(id);
    }, [searchInput]);

    /* Not every category carries a department, so fall back to its owner. */
    const departmentOf = (row) => row.department || row.owner;

    /* The same list without the filter sentinel, for the create dialog — it is
       choosing a department, not filtering by one. */
    const departmentChoices = useMemo(
        () => [...new Set(rows.map(departmentOf).filter(Boolean))].sort(),
        [rows],
    );

    const departmentOptions = useMemo(
        () => [
            "All Departments",
            ...[...new Set(rows.map(departmentOf).filter(Boolean))].sort(),
        ],
        [rows],
    );

    /* `rows` already came back searched and status-filtered by the server. Department is
       not a filter the API accepts, so it is the one narrowing still done here. */
    const visibleRows = useMemo(
        () =>
            rows.filter(
                (r) => department === "All Departments" || departmentOf(r) === department,
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [rows, department],
    );

    const toggleStatus = async (id) => {
        const row = rows.find((r) => r.id === id);
        if (!row) return;
        const result = await setCategoryStatus({
            categoryId: row.categoryId,
            isActive: row.status !== "ACTIVE",
        });
        if (!result.ok) setError(result.message);
        else load();
    };

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

    /* The API needs a categoryCode the dialog has no field for; derived from the name in
       the SNAKE_CASE every seeded code uses. */
    const codeFrom = (name) =>
        name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);

    const addCategory = async (draft) => {
        const result = await createCategory({
            moduleType,
            code: codeFrom(draft.name),
            name: draft.name.trim(),
            description: draft.description || "",
            department: draft.department || "",
            priority: (draft.priority || "Normal").replace(/^(.)(.*)$/, (m, a, b) => a + b.toLowerCase()),
            ownerRole: draft.owner || "",
            isActive: draft.status !== "INACTIVE",
        });
        if (!result.ok) {
            setError(result.message);
            return;
        }
        setAddOpen(false);
        load();
    };

    return (
        <Box sx={{ p: embedded ? 0 : "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Breadcrumb + title, with the primary action on the right */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                }}
            >
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
                            Internal Complaints Categories
                        </Typography>
                        <Typography
                            sx={{ maxWidth: 680, fontSize: "13px", fontWeight: 400, color: C.textMuted }}
                        >
                            Manage categories and subcategories used for internal actions, observations and
                            improvement activities.
                        </Typography>
                    </Box>
                )}

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

            {/* Search + filters + count */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
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
                        width: 260,
                        "& .MuiOutlinedInput-root": {
                            height: 36,
                            boxSizing: "border-box",
                            bgcolor: C.surface,
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

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        sx={filterControlSx}
                    >
                        {INTERNAL_STATUS_FILTER.map((s) => (
                            <MenuItem key={s} value={s} sx={{ fontSize: "13px" }}>
                                {s}
                            </MenuItem>
                        ))}
                    </Select>

                    <Select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        sx={filterControlSx}
                    >
                        {departmentOptions.map((d) => (
                            <MenuItem key={d} value={d} sx={{ fontSize: "13px" }}>
                                {d}
                            </MenuItem>
                        ))}
                    </Select>

                    <Typography sx={{ fontSize: "13px", fontWeight: 500, color: C.textMuted }}>
                        {visibleRows.length} categor{visibleRows.length === 1 ? "y" : "ies"}
                    </Typography>
                </Box>
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
                            <Typography sx={{ ...headerCellSx, flex: 1, minWidth: COL.name }}>
                                Category Name
                            </Typography>
                            <Typography sx={{ ...headerCellSx, width: COL.priority, flexShrink: 0 }}>
                                Default Priority
                            </Typography>
                            <Typography sx={{ ...headerCellSx, width: COL.owner, flexShrink: 0 }}>
                                Default Owner
                            </Typography>
                            <Typography sx={{ ...headerCellSx, width: COL.status, flexShrink: 0 }}>
                                Status
                            </Typography>
                            <Typography
                                sx={{ ...headerCellSx, width: COL.actions, flexShrink: 0, textAlign: "right" }}
                            >
                                Actions
                            </Typography>
                        </Box>

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

                        {!loading && !error && visibleRows.length === 0 && (
                            <Box sx={{ ...tableBodyRowSx, justifyContent: "center", py: 4 }}>
                                <Typography sx={{ fontSize: "13px", color: C.textMuted }}>
                                    No categories match these filters.
                                </Typography>
                            </Box>
                        )}

                        {!loading && visibleRows.map((row) => {
                            const isActive = row.status === "ACTIVE";
                            return (
                                <Box key={row.id} sx={{ ...tableBodyRowSx, gap: COL.gap }}>
                                    <Box
                                        sx={{
                                            flex: 1,
                                            minWidth: COL.name,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <Typography
                                            sx={{ fontSize: "13px", fontWeight: 600, color: C.text }}
                                        >
                                            {row.name}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ width: COL.priority, flexShrink: 0 }}>
                                        <TableChip
                                            label={row.priority}
                                            palette={PRIORITY_STYLE}
                                            width={COL.priorityChipWidth}
                                        />
                                    </Box>

                                    <Typography
                                        sx={{
                                            width: COL.owner,
                                            flexShrink: 0,
                                            fontSize: "13px",
                                            fontWeight: 400,
                                            color: C.textMuted,
                                        }}
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

                        {visibleRows.length === 0 && (
                            <Box sx={{ p: "24px", textAlign: "center" }}>
                                <Typography sx={{ fontSize: "13px", color: C.textFaint }}>
                                    No categories match those filters.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            <CreateCategoryDialog
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onSave={addCategory}
                ownerOptions={ownerOptions}
                departmentOptions={departmentChoices}
            />
        </Box>
    );
}
