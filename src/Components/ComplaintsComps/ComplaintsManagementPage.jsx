import React, { useMemo, useState } from "react";
import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C } from "./complaintsTokens";
import useComplaintsPermissions from "./useComplaintsPermissions";
import {
    WORKSPACE_TABS,
    WORKSPACE_ITEMS,
    PARENT_ITEMS,
    STATUS_FILTERS_BY_TAB,
    PAGINATION_BY_TAB,
    TAB_TYPE,
    TYPE_TONES,
    CATEGORY_TONES,
    PRIORITY_TONES,
    STATUS_TONES,
    SLA_TONES,
    toneFor,
} from "./complaintsManagementData";

// Reached from "Manage Complaints" on the Complaints dashboard. One workspace
// listing both parent complaints and internal actions.
//
// The Figma frame includes the global top bar (Welcome back / search / avatar).
// DashBoardLayout already renders that via DashBoardHeader, so this page starts
// at the "Dashboard" crumb.

const panelSx = {
    alignSelf: "stretch",
    p: 2,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
};

/* Rounded tint chip used for type / priority / status. */
const Chip = ({ label, tone, fontSize = "12px" }) => (
    <Box sx={{ px: "10px", py: "4px", borderRadius: "6px", bgcolor: tone.bg, flexShrink: 0 }}>
        <Typography sx={{ fontSize, fontWeight: 700, color: tone.color, whiteSpace: "nowrap" }}>
            {label}
        </Typography>
    </Box>
);

/* "Priority: [High]" — label plus its value. */
const MetaChip = ({ label, children }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>{label}</Typography>
        {children}
    </Box>
);

/* "Student: Aarav Kumar" — muted label, bold value. */
const MetaText = ({ label, value }) => (
    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
        {label}{" "}
        <Box component="span" sx={{ fontWeight: 600, color: C.text }}>
            {value}
        </Box>
    </Typography>
);

export default function ComplaintsManagementPage() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const { canViewConfig } = useComplaintsPermissions("dashboard");

    const [tab, setTab] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // The All tab lists both streams; a single tab lists that stream's own rows,
    // which the comps label by category rather than by type.
    const isAllTab = tab === "All";

    const items = useMemo(() => {
        const wantedType = TAB_TYPE[tab];
        const source = tab === "Parent Complaints" ? PARENT_ITEMS : WORKSPACE_ITEMS;
        const q = search.trim().toLowerCase();
        return source.filter((it) => {
            if (wantedType && it.type !== wantedType) return false;
            if (statusFilter !== "All" && it.status !== statusFilter) return false;
            if (!q) return true;
            return [it.ref, it.title, it.owner, it.student, it.category]
                .filter(Boolean)
                .some((v) => v.toLowerCase().includes(q));
        });
    }, [tab, statusFilter, search]);

    if (!canViewConfig) return <Navigate to="/dashboardmenu/dashboard" replace />;

    const resetPaging = () => {
        setPage(1);
        setStatusFilter("All");
    };

    // Counts follow the comp's mock totals. Once the API paginates, `totalItems`
    // and `pageCount` come from the response and `items` holds only this page.
    const { pageSize, totalItems, pageCount } = PAGINATION_BY_TAB[tab] || PAGINATION_BY_TAB.All;

    // Each tab runs its own lifecycle, so the chip row follows the selected tab.
    const statusFilters = STATUS_FILTERS_BY_TAB[tab] || STATUS_FILTERS_BY_TAB.All;
    const firstItem = (page - 1) * pageSize + 1;
    const lastItem = Math.min(page * pageSize, totalItems);

    // The comp shows 1, 2, 3 … 9 — first three plus the last, with an ellipsis.
    const pageNumbers = pageCount <= 4 ? Array.from({ length: pageCount }, (_, i) => i + 1) : [1, 2, 3, "…", pageCount];

    const pageBtnSx = (active) => ({
        minWidth: 0,
        px: "12px",
        py: "6px",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: active ? 700 : 500,
        textTransform: "none",
        boxSizing: "border-box",
        bgcolor: active ? "#FFFCF5" : "transparent",
        color: active ? C.text : C.textMuted,
        border: `1px solid ${active ? accent : C.border}`,
        "&:hover": {
            bgcolor: active ? "#FFFCF5" : "#F8FAFC",
            border: `1px solid ${active ? accent : C.border}`,
        },
    });

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            {/* Crumb + title */}
            <Box sx={{ px: "28px", pt: 2.5, pb: 1.25, display: "flex", flexDirection: "column", gap: "6px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Typography
                        onClick={() => navigate("/dashboardmenu/dashboard")}
                        sx={{
                            fontSize: "12px",
                            fontWeight: 500,
                            color: C.textMuted,
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                        }}
                    >
                        Dashboard
                    </Typography>
                    <ChevronRightOutlinedIcon sx={{ fontSize: "12px", color: C.textFaint }} />
                    <Typography sx={{ fontSize: "12px", fontWeight: 500, color: C.text }}>
                        Management
                    </Typography>
                </Box>

                <Typography sx={{ fontSize: "24px", fontWeight: 700, color: C.text }}>
                    Complaints Management
                </Typography>
                <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                    Manage parent complaints and internal school actions from one workspace.
                </Typography>
            </Box>

            <Box sx={{ p: "28px", display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Tabs + search + filters */}
                <Box sx={{ ...panelSx, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        {WORKSPACE_TABS.map((label) => {
                            const active = tab === label;
                            return (
                                <Box
                                    key={label}
                                    onClick={() => {
                                        setTab(label);
                                        resetPaging();
                                    }}
                                    sx={{
                                        px: 2,
                                        py: 1,
                                        borderRadius: "20px",
                                        cursor: "pointer",
                                        whiteSpace: "nowrap",
                                        bgcolor: active ? accent : C.surface,
                                        border: `1px solid ${active ? accent : C.border}`,
                                        transition: "background-color 0.2s",
                                        "&:hover": { bgcolor: active ? accent : "#F8FAFC" },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "13px",
                                            fontWeight: active ? 700 : 500,
                                            color: active ? C.text : C.textMuted,
                                        }}
                                    >
                                        {label}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: 1.5,
                            flexWrap: "wrap",
                        }}
                    >
                        <TextField
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search..."
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
                                width: { xs: "100%", sm: 300 },
                                "& .MuiOutlinedInput-root": {
                                    height: 38,
                                    bgcolor: "#F4F6FA",
                                    borderRadius: "8px",
                                    px: "14px",
                                    "& fieldset": { borderColor: C.border },
                                    "&:hover fieldset": { borderColor: C.border },
                                },
                                "& .MuiOutlinedInput-input": { p: 0, fontSize: "13px", color: C.text },
                            }}
                        />

                        <Button
                            startIcon={<FilterListOutlinedIcon sx={{ fontSize: "14px" }} />}
                            sx={{
                                height: 38,
                                px: "14px",
                                gap: 1,
                                boxSizing: "border-box",
                                bgcolor: C.surface,
                                color: C.text,
                                borderRadius: "8px",
                                border: `1px solid ${C.border}`,
                                fontSize: "13px",
                                fontWeight: 600,
                                textTransform: "none",
                                whiteSpace: "nowrap",
                                "&:hover": { bgcolor: "#F8FAFC", border: `1px solid ${C.border}` },
                            }}
                        >
                            Filters
                        </Button>
                    </Box>
                </Box>

                {/* Lifecycle filters. The All-tab comp does not draw this row — it
                    appears once a single stream is selected. */}
                {!isAllTab && (
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
                        {statusFilters.map((f) => {
                            const active = statusFilter === f.label;
                            return (
                                <Box
                                    key={f.label}
                                    onClick={() => {
                                        setStatusFilter(f.label);
                                        setPage(1);
                                    }}
                                    sx={{
                                        px: "14px",
                                        py: "6px",
                                        borderRadius: "20px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        whiteSpace: "nowrap",
                                        bgcolor: active ? C.text : C.surface,
                                        border: `1px solid ${active ? C.text : C.border}`,
                                        transition: "background-color 0.2s",
                                        "&:hover": { bgcolor: active ? C.text : "#F8FAFC" },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "13px",
                                            fontWeight: active ? 700 : 500,
                                            color: active ? "#FFFFFF" : C.text,
                                        }}
                                    >
                                        {f.label}
                                    </Typography>
                                    <Box
                                        sx={{
                                            px: "6px",
                                            py: "2px",
                                            borderRadius: "10px",
                                            bgcolor: active ? "rgba(255, 255, 255, 0.13)" : "#F4F6FA",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                color: active ? "#FFFFFF" : C.textMuted,
                                            }}
                                        >
                                            {f.count}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                )}

                {/* Item cards */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {items.map((item) => (
                        <Box
                            key={item.id}
                            sx={{
                                p: "18px",
                                boxSizing: "border-box",
                                bgcolor: C.surface,
                                borderRadius: "12px",
                                border: `1px solid ${C.border}`,
                                display: "flex",
                                alignItems: { xs: "stretch", md: "center" },
                                flexDirection: { xs: "column", md: "row" },
                                gap: 2,
                            }}
                        >
                            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
                                {/* Reference + type */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                                    <Typography
                                        sx={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            color: C.textMuted,
                                            fontFamily: "Inter, Roboto, sans-serif",
                                        }}
                                    >
                                        {item.ref}
                                    </Typography>
                                    <Box sx={{ width: "1px", height: 12, bgcolor: C.border }} />
                                    {/* All lists both streams, so it labels each card by type;
                                        a single-stream tab labels it by category instead. */}
                                    {!isAllTab && item.category ? (
                                        <Chip
                                            label={item.category}
                                            tone={CATEGORY_TONES[item.category] || TYPE_TONES[item.type]}
                                            fontSize="11px"
                                        />
                                    ) : (
                                        <Chip
                                            label={item.type}
                                            tone={TYPE_TONES[item.type] || TYPE_TONES["Parent Complaint"]}
                                            fontSize="11px"
                                        />
                                    )}
                                </Box>

                                {/* Title + who */}
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                                        {item.title}
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                        {item.student && (
                                            <>
                                                <MetaText label="Student:" value={item.student} />
                                                <Typography sx={{ fontSize: "13px", color: C.textFaint }}>|</Typography>
                                            </>
                                        )}
                                        <MetaText label="Owner:" value={item.owner} />
                                    </Box>
                                </Box>

                                <Box sx={{ height: "1px", bgcolor: C.border }} />

                                {/* Priority / status / SLA / date */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                                    <MetaChip label="Priority:">
                                        <Chip
                                            label={item.priority}
                                            tone={PRIORITY_TONES[item.priority] || PRIORITY_TONES.Normal}
                                        />
                                    </MetaChip>
                                    <MetaChip label="Status:">
                                        <Chip
                                            label={item.status}
                                            tone={toneFor(STATUS_TONES, item.status) || PRIORITY_TONES.Normal}
                                        />
                                    </MetaChip>
                                    <MetaChip label="SLA / Due:">
                                        <Typography
                                            sx={{
                                                fontSize: "13px",
                                                fontWeight: 600,
                                                color: SLA_TONES[item.slaTone] || SLA_TONES.neutral,
                                            }}
                                        >
                                            {item.sla}
                                        </Typography>
                                    </MetaChip>
                                    <MetaChip label="Date:">
                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: C.textMuted }}>
                                            {item.date}
                                        </Typography>
                                    </MetaChip>
                                </Box>
                            </Box>

                            <Button
                                onClick={() =>
                                    navigate(`/dashboardmenu/complaints/manage/${encodeURIComponent(item.id)}`)
                                }
                                sx={{
                                    px: 2,
                                    py: 1,
                                    alignSelf: { xs: "flex-start", md: "center" },
                                    bgcolor: C.surface,
                                    color: C.text,
                                    borderRadius: "8px",
                                    border: `1px solid ${C.border}`,
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    textTransform: "none",
                                    flexShrink: 0,
                                    "&:hover": { bgcolor: "#F8FAFC", border: `1px solid ${C.border}` },
                                }}
                            >
                                View
                            </Button>
                        </Box>
                    ))}

                    {items.length === 0 && (
                        <Box sx={{ ...panelSx, py: 5, textAlign: "center" }}>
                            <Typography sx={{ fontSize: "13px", color: C.textFaint }}>
                                Nothing matches that search.
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Footer count + pager */}
                <Box
                    sx={{
                        ...panelSx,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        Showing{" "}
                        <Box component="span" sx={{ fontWeight: 600, color: C.text }}>
                            {firstItem}-{lastItem}
                        </Box>{" "}
                        of{" "}
                        <Box component="span" sx={{ fontWeight: 600, color: C.text }}>
                            {totalItems}
                        </Box>{" "}
                        items
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Button
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            sx={pageBtnSx(false)}
                        >
                            Previous
                        </Button>

                        {pageNumbers.map((n, i) =>
                            n === "…" ? (
                                <Typography
                                    key={`gap-${i}`}
                                    sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted, px: "4px" }}
                                >
                                    …
                                </Typography>
                            ) : (
                                <Button key={n} onClick={() => setPage(n)} sx={pageBtnSx(n === page)}>
                                    {n}
                                </Button>
                            ),
                        )}

                        <Button
                            disabled={page === pageCount}
                            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                            sx={pageBtnSx(false)}
                        >
                            Next
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
