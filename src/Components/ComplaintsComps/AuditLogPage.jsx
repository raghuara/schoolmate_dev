import React, { useMemo, useState } from "react";
import { Box, Button, MenuItem, Select, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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
    AUDIT_ROWS,
    AUDIT_COLS,
    AUDIT_PAGINATION,

    MODULE_TONE,
} from "./auditLogData";

// Reached from the "Audit Log" tile on the Configurations screen.

const COL = AUDIT_COLS;

/* Filter control styled to the comp: 180px, #F4F6FA fill, 8px radius. */
function FilterSelect({ value, onChange, placeholder, options, disabled }) {
    return (
        <Select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            displayEmpty
            disabled={disabled}
            renderValue={(v) => (v === "" ? placeholder : v)}
            sx={{
                width: 180,
                bgcolor: "#F4F6FA",
                borderRadius: "8px",
                fontSize: "13px",
                color: value === "" ? C.textMuted : C.text,
                "& .MuiOutlinedInput-input": { p: "8px 14px", fontWeight: 400 },
                "& fieldset": { borderColor: C.border },
                "&:hover fieldset": { borderColor: C.border },
                "& .MuiSelect-icon": { color: C.textMuted, fontSize: "18px" },
            }}
        >
            <MenuItem value="" sx={{ fontSize: "13px" }}>
                {placeholder}
            </MenuItem>
            {(options || []).map((o) => (
                <MenuItem key={o} value={o} sx={{ fontSize: "13px" }}>
                    {o}
                </MenuItem>
            ))}
        </Select>
    );
}

// The Parent and Internal comps for this screen share one layout and differ only
// in their copy, rows and totals, so those arrive as props defaulting to the
// Parent values — the Parent route renders it with no props.
export default function AuditLogPage({
    // Rendered inside the Configuration Hub: the hub owns the page chrome,
    // so the screen drops its own padding, breadcrumb and title.
    embedded = false,
    crumbLabel = "Complaint Configuration",
    subtitle = "Track complaint system activity and configuration changes.",
    auditRows = AUDIT_ROWS,
    pagination = AUDIT_PAGINATION,
    // (row) => path, or null where no detail screen exists for that variant.
    detailPathFor = (row) => `/dashboardmenu/complaints/configuration/audit-log/${row.id}`,
    // The Parent comp gives both cards a shadow; the Internal comp does not.
    showCardShadow = true,
}) {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const [filters, setFilters] = useState({ user: "", action: "", module: "" });
    const [page, setPage] = useState(1);

    const setFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const resetFilters = () => {
        setFilters({ user: "", action: "", module: "" });
        setPage(1);
    };

    // Derived from the rows in play, so the dropdowns stay correct for either variant.
    const filterOptions = useMemo(() => {
        const distinct = (key) => [...new Set(auditRows.map((r) => r[key]))].sort();
        return { user: distinct("user"), action: distinct("action"), module: distinct("module") };
    }, [auditRows]);

    const rows = useMemo(
        () =>
            auditRows.filter(
                (r) =>
                    (!filters.user || r.user === filters.user) &&
                    (!filters.action || r.action === filters.action) &&
                    (!filters.module || r.module === filters.module),
            ),
        [auditRows, filters],
    );

    // Counts follow the comp's mock totals. Once the API paginates, `totalEntries`
    // and `pageCount` come from the response and `rows` holds only the current page.
    const { pageSize, totalEntries, pageCount } = pagination;
    const firstEntry = (page - 1) * pageSize + 1;
    const lastEntry = Math.min(page * pageSize, totalEntries);

    const pageBtnSx = (active) => ({
        minWidth: 0,
        px: "12px",
        py: "6px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "none",
        boxSizing: "border-box",
        bgcolor: active ? "#FFFCF5" : C.surface,
        color: active ? C.text : C.textMuted,
        border: `1px solid ${active ? accent : C.border}`,
        "&:hover": { bgcolor: active ? "#FFFCF5" : "#F8FAFC", border: `1px solid ${active ? accent : C.border}` },
    });

    const stepBtnSx = {
        ...pageBtnSx(false),
        bgcolor: "#F4F6FA",
        "&:hover": { bgcolor: "#EDF1F7", border: `1px solid ${C.border}` },
        "&.Mui-disabled": { bgcolor: "#F4F6FA", color: C.textFaint, border: `1px solid ${C.border}` },
    };

    return (
        <Box sx={{ p: embedded ? 0 : "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Breadcrumb + title + blurb */}
            {!embedded && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <ComplaintsBreadcrumb
                        trail={[
                            { label: "Administration" },
                            {
                                label: crumbLabel,
                                onClick: () => navigate("/dashboardmenu/complaints/configuration"),
                            },
                            { label: "Audit Log" },
                        ]}
                    />
                    <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                        Audit Log
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        {subtitle}
                    </Typography>
                </Box>
            )}

            {/* Filter bar */}
            <Box
                sx={{
                    alignSelf: "stretch",
                    p: 2,
                    boxSizing: "border-box",
                    bgcolor: C.surface,
                    borderRadius: "12px",
                    border: `1px solid ${C.border}`,
                    boxShadow: showCardShadow ? CARD_SHADOW : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                }}
            >
                {/* Date range needs a picker that the comps do not specify yet, so it
                    renders in the right place but is inert. */}
                <FilterSelect value="" onChange={() => {}} placeholder="Select Date Range" disabled />
                <FilterSelect
                    value={filters.user}
                    onChange={(v) => setFilter("user", v)}
                    placeholder="Select User"
                    options={filterOptions.user}
                />
                <FilterSelect
                    value={filters.action}
                    onChange={(v) => setFilter("action", v)}
                    placeholder="Select Action"
                    options={filterOptions.action}
                />
                <FilterSelect
                    value={filters.module}
                    onChange={(v) => setFilter("module", v)}
                    placeholder="Select Module"
                    options={filterOptions.module}
                />
                <Button
                    onClick={resetFilters}
                    sx={{
                        px: 2,
                        py: 1,
                        color: C.blue,
                        fontSize: "13px",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                    }}
                >
                    Reset Filters
                </Button>
            </Box>

            {/* Table card */}
            <Box
                sx={{
                    alignSelf: "stretch",
                    p: 3,
                    boxSizing: "border-box",
                    bgcolor: C.surface,
                    borderRadius: "16px",
                    border: `1px solid ${C.border}`,
                    boxShadow: showCardShadow ? CARD_SHADOW : "none",
                }}
            >
                {/* Seven fixed columns, so the table scrolls inside the card rather
                    than pushing the page sideways. */}
                <Box sx={{ overflowX: "auto" }}>
                    <Box sx={{ minWidth: COL.minWidth }}>
                        <Box sx={{ ...tableHeaderRowSx, gap: COL.gap }}>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.date, flexShrink: 0 }}>
                                Date &amp; Time
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.user, flexShrink: 0 }}>
                                User
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.role, flexShrink: 0 }}>
                                Role
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.action, flexShrink: 0 }}>
                                Action
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.module, flexShrink: 0 }}>
                                Module
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, flex: 1, minWidth: 0 }}>
                                Reference
                            </Typography>
                            <Typography
                                sx={{ ...tableHeaderCellSx, width: COL.details, flexShrink: 0, textAlign: "right" }}
                            >
                                Details
                            </Typography>
                        </Box>

                        {rows.map((row) => (
                            <Box key={row.id} sx={{ ...tableBodyRowSx, gap: COL.gap }}>
                                <Typography
                                    sx={{ width: COL.date, flexShrink: 0, fontSize: "13px", fontWeight: 400, color: C.textMuted }}
                                >
                                    {row.dateTime}
                                </Typography>
                                <Typography
                                    sx={{ width: COL.user, flexShrink: 0, fontSize: "13px", fontWeight: 600, color: C.text }}
                                >
                                    {row.user}
                                </Typography>
                                <Typography
                                    sx={{ width: COL.role, flexShrink: 0, fontSize: "13px", fontWeight: 400, color: C.textMuted }}
                                >
                                    {row.role}
                                </Typography>
                                <Typography
                                    sx={{ width: COL.action, flexShrink: 0, fontSize: "13px", fontWeight: 600, color: C.text }}
                                >
                                    {row.action}
                                </Typography>
                                <Box sx={{ width: COL.module, flexShrink: 0, display: "flex" }}>
                                    <TableChip label={row.module} tone={MODULE_TONE} fontWeight={600} />
                                </Box>
                                <Typography
                                    sx={{ flex: 1, minWidth: 0, fontSize: "13px", fontWeight: 400, color: C.text }}
                                >
                                    {row.reference}
                                </Typography>
                                <Box
                                    sx={{
                                        width: COL.details,
                                        flexShrink: 0,
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <RowAction
                                        label="View"
                                        color={C.blue}
                                        onClick={() => {
                                            const to = detailPathFor && detailPathFor(row);
                                            if (to) navigate(to);
                                        }}
                                    />
                                </Box>
                            </Box>
                        ))}

                        {rows.length === 0 && (
                            <Box sx={{ p: "24px", textAlign: "center" }}>
                                <Typography sx={{ fontSize: "13px", color: C.textFaint }}>
                                    No entries match those filters.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Footer: entry count + pagination */}
                <Box
                    sx={{
                        pt: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        Showing {firstEntry}-{lastEntry} of {totalEntries} entries
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            sx={stepBtnSx}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                            <Button key={n} onClick={() => setPage(n)} sx={pageBtnSx(n === page)}>
                                {n}
                            </Button>
                        ))}
                        <Button
                            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                            disabled={page === pageCount}
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
