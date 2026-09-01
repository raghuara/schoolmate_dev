import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, InputAdornment, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C } from "./complaintsTokens";
import { toneFor } from "./complaintsManagementData";
import {
    MY_WORK_TABS,
    MY_WORK_COLS,
    MY_WORK_PRIORITY_TONES,
    MY_WORK_STATUS_TONES,
    myWorkFilterOptions,
    ALL_PRIORITIES,
    ALL_STATUSES,
} from "./myWorkData";
import { MODULE } from "./complaintsConfigApi";
import { fetchStaffMyWork } from "./complaintsWorkApi";

// The staff-facing queue: only what is assigned to the signed-in user.
//
// This screen is reached by whichever role holds the `mywork` permission — see
// complaintsAccess.js. It is deliberately NOT gated on a userType string: the
// whole point of the role migration is that a school can name its staff role
// whatever it likes and still have this screen resolve.
//
// The comp's palette lines up with existing tokens: its #E2E8F0 border is
// C.inputBorder and its #F1F5F9 surfaces are C.divider.

const COL = MY_WORK_COLS;

const panelSx = {
    bgcolor: C.surface,
    borderRadius: "12px",
    border: `1px solid ${C.inputBorder}`,
    boxSizing: "border-box",
};

const headCellSx = { fontSize: "13px", fontWeight: 700, color: C.textMuted };

/* Bordered pill wrapping a borderless Select: "Priority: [All Priorities ▾]" */
function FilterPill({ label, value, options, onChange }) {
    return (
        <Box
            sx={{
                ...panelSx,
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 2,
            }}
        >
            <Typography sx={{ fontSize: "13px", fontWeight: 500, color: C.textMuted, whiteSpace: "nowrap" }}>
                {label}
            </Typography>
            <Select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                variant="standard"
                disableUnderline
                sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.text,
                    "& .MuiSelect-select": { p: 0, pr: "20px !important" },
                    "& .MuiSelect-icon": { color: C.textMuted, fontSize: "16px", right: 0 },
                }}
            >
                {options.map((o) => (
                    <MenuItem key={o} value={o} sx={{ fontSize: "13px" }}>
                        {o}
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );
}

export default function MyWorkPage({ embedded = false }) {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const [tab, setTab] = useState(MY_WORK_TABS[0]);

    // Where "New complaint" goes, per tab: the parent stream starts by finding the
    // student, the internal stream is the operations issue form.
    const intakePath =
        tab === MY_WORK_TABS[1]
            ? "/dashboardmenu/complaints/add-issue"
            : "/dashboardmenu/complaints/register";
    const [priority, setPriority] = useState(ALL_PRIORITIES);
    const [status, setStatus] = useState(ALL_STATUSES);
    const [search, setSearch] = useState("");

    const [tabRows, setTabRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* The queue is scoped to the signed-in user by the server — actorRollNumber is the
       whole filter, so there is nothing to narrow here. */
    const moduleTypeForTab = tab === MY_WORK_TABS[1] ? MODULE.staff : MODULE.parent;

    const load = useCallback(async () => {
        setLoading(true);
        const result = await fetchStaffMyWork({ moduleType: moduleTypeForTab, pageSize: 100 });
        if (!result.ok) {
            setError(
                result.routeMissing
                    ? "The My Work endpoint is not available on this server."
                    : result.message || "Could not load your work queue.",
            );
            setTabRows([]);
        } else {
            setError("");
            setTabRows(result.rows);
        }
        setLoading(false);
    }, [moduleTypeForTab]);

    useEffect(() => {
        load();
    }, [load]);

    /* Priority and status choices come from the rows on screen, so they can only ever
       offer a filter that matches something. */
    const options = useMemo(() => myWorkFilterOptions(tabRows), [tabRows]);

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return tabRows.filter(
            (r) =>
                (priority === ALL_PRIORITIES || r.priority === priority) &&
                (status === ALL_STATUSES || r.status === status) &&
                (!q ||
                    [r.ref, r.title, r.category, r.student]
                        .filter(Boolean)
                        .some((v) => v.toLowerCase().includes(q))),
        );
    }, [tabRows, priority, status, search]);

    // Switching tab clears the filters — a status from one stream's lifecycle is
    // meaningless in the other.
    const selectTab = (t) => {
        setTab(t);
        setPriority(ALL_PRIORITIES);
        setStatus(ALL_STATUSES);
        setSearch("");
    };

    // Rows open the staff detail — what this user needs to act on the item, plus
    // the status control. The admin workspace has its own, richer detail screen.
    const openItem = (row) =>
        navigate(`/dashboardmenu/complaints/my-work/${encodeURIComponent(row.id)}`);

    return (
        <Box sx={{ p: embedded ? 0 : "40px", display: "flex", flexDirection: "column", gap: 4 }}>
            {!embedded && (
                <Typography sx={{ fontSize: "28px", fontWeight: 700, color: C.text }}>My Work</Typography>
            )}

            {/* Segmented tabs + primary action */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                <Box
                    sx={{
                        // Sized to its labels rather than pinned to the comp's 340px.
                        // The pills are flex: 1 with nowrap labels, so their min-content
                        // width will not shrink; at 340 "Parent Complaints 3" and
                        // "Internal Complaints 4" together overflowed and spilled past
                        // the rail's rounded edge.
                        width: "fit-content",
                        maxWidth: "100%",
                        p: "4px",
                        boxSizing: "border-box",
                        bgcolor: C.inputBorder,
                        borderRadius: "12px",
                        display: "flex",
                        gap: "4px",
                    }}
                >
                    {MY_WORK_TABS.map((t) => {
                        const active = tab === t;
                        /* Only the open tab's queue is fetched, so the other tab shows no
                           count rather than a stale or invented one. */
                        const count = t === tab ? tabRows.length : null;
                        return (
                            <Box
                                key={t}
                                onClick={() => selectTab(t)}
                                sx={{
                                    flex: 1,
                                    px: 2,
                                    py: 1,
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 1,
                                    bgcolor: active ? C.surface : "transparent",
                                }}
                            >
                                <Typography
                                    sx={{ fontSize: "13px", fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}
                                >
                                    {t}
                                </Typography>
                                {count !== null && (
                                    <Box
                                        sx={{
                                            px: "6px",
                                            py: "2px",
                                            borderRadius: "99px",
                                            bgcolor: active ? C.text : C.textFaint,
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#fff" }}>
                                            {count}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>

                {/* The selected tab already says which stream is being raised, so this
                    opens that intake directly rather than going through the Add New
                    picker: a parent complaint is filed against a student, an internal
                    one is a school-operations issue. */}
                <Button
                    onClick={() => navigate(intakePath)}
                    startIcon={<AddOutlinedIcon sx={{ fontSize: "16px" }} />}
                    sx={{
                        px: 2.5,
                        py: 1.5,
                        boxSizing: "border-box",
                        bgcolor: accent,
                        color: C.text,
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        "&:hover": { bgcolor: websiteSettings.darkColor },
                    }}
                >
                    New complaint
                </Button>
            </Box>

            {/* Filters + search */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    <FilterPill
                        label="Priority:"
                        value={priority}
                        options={options.priority}
                        onChange={setPriority}
                    />
                    <FilterPill label="Status:" value={status} options={options.status} onChange={setStatus} />
                </Box>

                <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search complaints..."
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchOutlinedIcon sx={{ fontSize: "16px", color: C.textMuted }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{
                        width: 320,
                        maxWidth: "100%",
                        "& .MuiOutlinedInput-root": {
                            p: 1.5,
                            boxSizing: "border-box",
                            bgcolor: C.surface,
                            borderRadius: "12px",
                            fontSize: "14px",
                            "& fieldset": { borderColor: C.inputBorder },
                            "&:hover fieldset": { borderColor: C.inputBorder },
                        },
                        "& .MuiOutlinedInput-input": { p: 0, color: C.text },
                        "& .MuiOutlinedInput-input::placeholder": { color: C.textFaint, opacity: 1 },
                    }}
                />
            </Box>

            {/* Table */}
            <Box
                sx={{
                    alignSelf: "stretch",
                    bgcolor: C.surface,
                    borderRadius: "16px",
                    border: `1px solid ${C.inputBorder}`,
                    boxSizing: "border-box",
                    overflow: "hidden",
                }}
            >
                <Box sx={{ overflowX: "auto" }}>
                    <Box sx={{ minWidth: COL.minWidth }}>
                        {/* Header */}
                        <Box
                            sx={{
                                px: 3,
                                py: 2,
                                bgcolor: C.divider,
                                display: "flex",
                                alignItems: "center",
                                gap: COL.gap,
                            }}
                        >
                            <Typography sx={{ ...headCellSx, width: COL.id, flexShrink: 0 }}>
                                COMPLAINT ID
                            </Typography>
                            <Typography sx={{ ...headCellSx, flex: 1, minWidth: 0 }}>
                                TITLE / CATEGORY
                            </Typography>
                            <Typography sx={{ ...headCellSx, width: COL.student, flexShrink: 0 }}>
                                STUDENT
                            </Typography>
                            <Typography sx={{ ...headCellSx, width: COL.status, flexShrink: 0 }}>
                                STATUS
                            </Typography>
                            <Typography sx={{ ...headCellSx, width: COL.due, flexShrink: 0 }}>
                                DUE DATE
                            </Typography>
                        </Box>

                        {(loading || rows.length === 0) && (
                            <Box sx={{ p: 5, textAlign: "center" }}>
                                <Typography sx={{ fontSize: "13px", color: C.textFaint }}>
                                    {loading
                                        ? "Loading your work queue…"
                                        : error || "Nothing is assigned to you in this stream."}
                                </Typography>
                            </Box>
                        )}

                        {rows.map((row) => {
                            const priorityTone =
                                MY_WORK_PRIORITY_TONES[row.priority] || MY_WORK_PRIORITY_TONES.NORMAL;
                            const statusTone =
                                toneFor(MY_WORK_STATUS_TONES, row.status) || { bg: C.divider, color: C.textMuted };
                            const dueColor = row.dueUrgent ? C.red : C.textMuted;
                            return (
                                <Box
                                    key={row.id}
                                    onClick={() => openItem(row)}
                                    sx={{
                                        p: 3,
                                        borderBottom: `1px solid ${C.divider}`,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: COL.gap,
                                        cursor: "pointer",
                                        "&:hover": { bgcolor: "#F8FAFC" },
                                    }}
                                >
                                    {/* ID + priority */}
                                    <Box
                                        sx={{
                                            width: COL.id,
                                            flexShrink: 0,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            gap: "6px",
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: C.text }}>
                                            {row.ref}
                                        </Typography>
                                        <Box
                                            sx={{
                                                px: "6px",
                                                py: "2px",
                                                borderRadius: "4px",
                                                bgcolor: priorityTone.bg,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "10px",
                                                    fontWeight: 700,
                                                    color: priorityTone.color,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {row.priority}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Category + title */}
                                    <Box
                                        sx={{
                                            flex: 1,
                                            minWidth: 0,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "4px",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: "11px",
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                color: "#F59E0B",
                                            }}
                                        >
                                            {row.category}
                                        </Typography>
                                        <Typography sx={{ fontSize: "15px", fontWeight: 600, color: C.text }}>
                                            {row.title}
                                        </Typography>
                                    </Box>

                                    {/* Student */}
                                    <Box
                                        sx={{
                                            width: COL.student,
                                            flexShrink: 0,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "2px",
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: C.text }}>
                                            {row.student}
                                        </Typography>
                                        <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textMuted }}>
                                            {row.grade}
                                        </Typography>
                                    </Box>

                                    {/* Status */}
                                    <Box sx={{ width: COL.status, flexShrink: 0, display: "flex" }}>
                                        <Box
                                            sx={{
                                                px: "10px",
                                                py: "4px",
                                                borderRadius: "6px",
                                                bgcolor: statusTone.bg,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                    color: statusTone.color,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {row.status}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Due */}
                                    <Box
                                        sx={{
                                            width: COL.due,
                                            flexShrink: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                        }}
                                    >
                                        <AccessTimeOutlinedIcon sx={{ fontSize: "14px", color: dueColor }} />
                                        <Typography
                                            sx={{ fontSize: "13px", fontWeight: 500, color: dueColor }}
                                        >
                                            {row.due}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}

                        {rows.length === 0 && (
                            <Box sx={{ p: 5, textAlign: "center" }}>
                                <Typography sx={{ fontSize: "13px", color: C.textFaint }}>
                                    Nothing assigned to you matches those filters.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
