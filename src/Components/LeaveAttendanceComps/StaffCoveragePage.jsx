import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    InputAdornment,
    MenuItem,
    Select,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import SnackBar from "../SnackBar";
import { DASH, RADIUS, EmptyNote, PageHeader } from "../DashBoardComps/dashboardTheme";
import { selectSubMenuPermissions, selectUserTypeID } from "../../Redux/Slices/AuthSlice";
import {
    COVERAGE_MAIN_MENU,
    COVERAGE_SUB_MENU,
    EXCLUSION_EFFECTS,
    fetchCoverage,
    resolveCoverageAccess,
    saveCoverage,
} from "./staffCoverageApi";
import { refreshExcluded } from "./coverageScope";

/* Payroll & attendance coverage.
   One roster of every employee-eligible user with an Included switch per row. Excluding
   someone keeps their login but takes them out of payroll, attendance, bank details and
   the salary register — see EXCLUSION_EFFECTS. */

const ALL_ROLES = "All roles";
const ALL_STATUS = "All";
const INCLUDED = "Included";
const EXCLUDED = "Excluded";

/* Role chip colours. Anything unlisted falls back to grey rather than inventing a hue. */
const ROLE_TONE = {
    "Super Admin": { bg: DASH.violetLight, fg: DASH.violet },
    Admin: { bg: DASH.blueLight, fg: DASH.blue },
    Teacher: { bg: DASH.greenLight, fg: DASH.green },
    Staff: { bg: DASH.amberLight, fg: "#B45309" },
};
const roleTone = (role) => ROLE_TONE[role] || { bg: DASH.lineSoft, fg: DASH.muted };

const initialsOf = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

const panelSx = {
    bgcolor: "#fff",
    border: `1px solid ${DASH.line}`,
    borderRadius: RADIUS,
    boxSizing: "border-box",
};

const headCellSx = {
    fontSize: "12px",
    fontWeight: 700,
    color: DASH.muted,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    bgcolor: DASH.lineSoft,
    borderBottom: `1px solid ${DASH.line}`,
    py: 1.2,
};

const bodyCellSx = { fontSize: "13px", color: DASH.text, borderBottom: `1px solid ${DASH.lineSoft}` };

/* Total / Included / Excluded. Counts come from the roster, never from a filtered view —
   a filter must not make it look like people left payroll. */
function CountTile({ label, value, tone, active, onClick }) {
    return (
        <Box
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
            sx={{
                ...panelSx,
                px: 2,
                py: 1.2,
                minWidth: 132,
                cursor: onClick ? "pointer" : "default",
                borderColor: active ? tone : DASH.line,
                bgcolor: active ? `${tone}0F` : "#fff",
                transition: "border-color 0.2s, background-color 0.2s",
                "&:hover": onClick ? { borderColor: tone } : undefined,
                "&:focus-visible": { outline: `2px solid ${tone}`, outlineOffset: 2 },
            }}
        >
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, letterSpacing: "0.06em" }}>
                {label.toUpperCase()}
            </Typography>
            <Typography sx={{ fontSize: "22px", fontWeight: 700, color: tone, lineHeight: 1.25 }}>
                {value}
            </Typography>
        </Box>
    );
}

export default function StaffCoveragePage() {
    const navigate = useNavigate();
    const userTypeID = useSelector(selectUserTypeID);
    const coveragePerms = useSelector(selectSubMenuPermissions(COVERAGE_MAIN_MENU, COVERAGE_SUB_MENU));
    const payrollPerms = useSelector(selectSubMenuPermissions(COVERAGE_MAIN_MENU, "payrollmanagement"));
    // raw value, not a boolean — undefined (submenu absent) must not read as a refusal
    const coverageView = coveragePerms?.view;
    const payrollEdit = payrollPerms?.edit === "Y";

    /* Only a staff-leave approver may open this. "checking" holds the screen blank until
       the settings answer, so a denied user never sees the roster flash first. */
    const [access, setAccess] = useState({ state: "checking", message: "" });

    const [roster, setRoster] = useState([]);
    const [roles, setRoles] = useState([]);
    /* Edits live here as { [rollNumber]: { included, reason } }; anyone absent is unchanged
       from what the server sent. `baseline` is that server state, so the save can send only
       what actually moved. */
    const [coverage, setCoverage] = useState({});
    const [baseline, setBaseline] = useState({});
    const [selected, setSelected] = useState(() => new Set());

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [role, setRole] = useState(ALL_ROLES);
    const [status, setStatus] = useState(ALL_STATUS);

    const [snack, setSnack] = useState({ open: false, message: "", ok: true });
    const showSnack = (message, ok) => setSnack({ open: true, message, ok });

    const load = useCallback(async () => {
        setLoading(true);
        const result = await fetchCoverage();
        if (!result.ok) {
            showSnack(result.message, false);
            setRoster([]);
        } else {
            setRoster(result.rows);
            setRoles(result.roles);
            // Seed both from the server so `dirty` compares against what is stored
            const map = {};
            result.rows.forEach((row) => {
                map[row.rollNumber] = { included: row.included, reason: row.reason };
            });
            setCoverage(map);
            setBaseline(map);
        }
        setSelected(new Set());
        setLoading(false);
    }, []);

    useEffect(() => {
        let cancelled = false;
        resolveCoverageAccess(userTypeID, { coverageView, payrollEdit }).then((result) => {
            if (!cancelled) setAccess(result);
        });
        return () => {
            cancelled = true;
        };
    }, [userTypeID, coverageView, payrollEdit]);

    useEffect(() => {
        if (access.state === "allowed") load();
    }, [access.state, load]);

    const entryOf = (rollNumber) => coverage[rollNumber] || { included: true, reason: "" };

    const patch = (rollNumber, changes) =>
        setCoverage((prev) => ({
            ...prev,
            [rollNumber]: { ...(prev[rollNumber] || { included: true, reason: "" }), ...changes },
        }));

    const setIncluded = (rollNumber, included) =>
        // Clearing the reason on re-include stops a stale note reappearing later
        patch(rollNumber, included ? { included: true, reason: "" } : { included: false });

    const includedCount = useMemo(
        () => roster.filter((row) => entryOf(row.rollNumber).included).length,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [roster, coverage],
    );
    const excludedCount = roster.length - includedCount;

    const dirty = useMemo(() => {
        const normalise = (map) =>
            Object.entries(map)
                .filter(([, value]) => value && value.included === false)
                .map(([roll, value]) => `${roll}:${(value.reason || "").trim()}`)
                .sort()
                .join("|");
        return normalise(coverage) !== normalise(baseline);
    }, [coverage, baseline]);

    const rows = useMemo(() => {
        const term = search.trim().toLowerCase();
        return roster.filter((row) => {
            if (role !== ALL_ROLES && row.role !== role) return false;
            const isIncluded = entryOf(row.rollNumber).included;
            if (status === INCLUDED && !isIncluded) return false;
            if (status === EXCLUDED && isIncluded) return false;
            if (!term) return true;
            return (
                row.name.toLowerCase().includes(term) ||
                row.rollNumber.toLowerCase().includes(term)
            );
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roster, coverage, search, role, status]);

    const allVisibleSelected = rows.length > 0 && rows.every((row) => selected.has(row.rollNumber));

    const toggleSelectAll = () =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (allVisibleSelected) rows.forEach((row) => next.delete(row.rollNumber));
            else rows.forEach((row) => next.add(row.rollNumber));
            return next;
        });

    const toggleSelect = (rollNumber) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(rollNumber)) next.delete(rollNumber);
            else next.add(rollNumber);
            return next;
        });

    const applyToSelected = (included) => {
        setCoverage((prev) => {
            const next = { ...prev };
            selected.forEach((rollNumber) => {
                const current = next[rollNumber] || { included: true, reason: "" };
                next[rollNumber] = included
                    ? { included: true, reason: "" }
                    : { ...current, included: false };
            });
            return next;
        });
        setSelected(new Set());
    };

    const handleSave = async () => {
        setSaving(true);
        /* Only what actually moved — the API takes a change list, so an untouched row
           must not be resent as if it had been re-decided. */
        const changes = roster
            .map((row) => ({ ...row, ...(coverage[row.rollNumber] || {}) }))
            .filter((row) => {
                const before = baseline[row.rollNumber] || { included: true, reason: "" };
                return (
                    before.included !== row.included ||
                    (!row.included && (before.reason || "") !== (row.reason || ""))
                );
            });
        const result = await saveCoverage({ changes });
        showSnack(result.message, result.ok);
        if (result.ok) {
            setBaseline(coverage);
            // Every other screen filters on a cached copy of this list — refresh it now
            refreshExcluded();
            // Re-read so the counts and the excludedOn / excludedBy trail come from the server
            load();
        }
        setSaving(false);
    };

    if (access.state !== "allowed") {
        return (
            <Box sx={{ p: 2, bgcolor: DASH.canvas, minHeight: "100%" }}>
                <PageHeader
                    title="Payroll & Attendance Coverage"
                    onBack={() => navigate(-1)}
                />
                <Box sx={{ ...panelSx, p: 4, textAlign: "center" }}>
                    <Typography sx={{ fontSize: "14px", color: DASH.muted }}>
                        {access.state === "checking" && "Checking your access…"}
                        {access.state === "denied" &&
                            "Only a staff leave approver can change payroll and attendance coverage."}
                        {access.state === "unavailable" &&
                            (access.message || "The approval settings could not be read, so access cannot be confirmed.")}
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, bgcolor: DASH.canvas, minHeight: "100%" }}>
            <SnackBar
                open={snack.open}
                setOpen={(open) => setSnack((prev) => ({ ...prev, open }))}
                message={snack.message}
                status={snack.ok}
                color={snack.ok}
            />

            <PageHeader
                title="Payroll & Attendance Coverage"
                subtitle="Choose who is treated as an employee. Excluding someone keeps their login and removes them from payroll and attendance."
                onBack={() => navigate(-1)}
                right={
                    <Button
                        onClick={handleSave}
                        disabled={!dirty || saving}
                        startIcon={
                            saving ? <CircularProgress size={15} sx={{ color: "inherit" }} /> : <SaveOutlinedIcon />
                        }
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "13px",
                            px: 2.2,
                            py: 0.9,
                            borderRadius: RADIUS,
                            bgcolor: DASH.primary,
                            color: "#fff",
                            "&:hover": { bgcolor: "#D18F00" },
                            "&.Mui-disabled": { bgcolor: DASH.line, color: DASH.faint },
                        }}
                    >
                        {saving ? "Saving…" : "Save changes"}
                    </Button>
                }
            />

            {/* What exclusion actually does — stated before the switches, not after. */}
            <Box
                sx={{
                    ...panelSx,
                    borderLeft: `3px solid ${DASH.primary}`,
                    p: 1.6,
                    mb: 2,
                    display: "flex",
                    gap: 1.2,
                    alignItems: "flex-start",
                }}
            >
                <InfoOutlinedIcon sx={{ fontSize: 18, color: DASH.primary, mt: "1px" }} />
                <Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.ink }}>
                        An excluded person is left out of:
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: DASH.muted }}>
                        {EXCLUSION_EFFECTS.join(" · ")}
                    </Typography>
                </Box>
            </Box>

            {/* Counts double as status filters — clicking Excluded shows only those rows. */}
            <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap", mb: 2 }}>
                <CountTile
                    label="Total"
                    value={roster.length}
                    tone={DASH.ink}
                    active={status === ALL_STATUS}
                    onClick={() => setStatus(ALL_STATUS)}
                />
                <CountTile
                    label="Included"
                    value={includedCount}
                    tone={DASH.green}
                    active={status === INCLUDED}
                    onClick={() => setStatus(INCLUDED)}
                />
                <CountTile
                    label="Excluded"
                    value={excludedCount}
                    tone={DASH.red}
                    active={status === EXCLUDED}
                    onClick={() => setStatus(EXCLUDED)}
                />
            </Box>

            <Box sx={{ ...panelSx, p: 1.6, mb: 1.6, display: "flex", gap: 1.2, flexWrap: "wrap", alignItems: "center" }}>
                <TextField
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name or roll no…"
                    size="small"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchOutlinedIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{
                        width: 300,
                        maxWidth: "100%",
                        "& .MuiOutlinedInput-root": { borderRadius: RADIUS, fontSize: "13px", bgcolor: "#fff" },
                    }}
                />

                <Select
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    size="small"
                    sx={{ minWidth: 168, borderRadius: RADIUS, fontSize: "13px", bgcolor: "#fff" }}
                >
                    <MenuItem value={ALL_ROLES} sx={{ fontSize: "13px" }}>
                        {ALL_ROLES}
                    </MenuItem>
                    {roles.map((item) => (
                        <MenuItem key={item} value={item} sx={{ fontSize: "13px" }}>
                            {item}
                        </MenuItem>
                    ))}
                </Select>

                <Box sx={{ flex: 1 }} />

                {selected.size > 0 ? (
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Typography sx={{ fontSize: "13px", color: DASH.muted }}>
                            {selected.size} selected
                        </Typography>
                        <Button
                            onClick={() => applyToSelected(true)}
                            sx={{
                                textTransform: "none",
                                fontSize: "13px",
                                fontWeight: 600,
                                borderRadius: RADIUS,
                                color: DASH.green,
                                border: `1px solid ${DASH.green}55`,
                                px: 1.6,
                            }}
                        >
                            Include
                        </Button>
                        <Button
                            onClick={() => applyToSelected(false)}
                            sx={{
                                textTransform: "none",
                                fontSize: "13px",
                                fontWeight: 600,
                                borderRadius: RADIUS,
                                color: DASH.red,
                                border: `1px solid ${DASH.red}55`,
                                px: 1.6,
                            }}
                        >
                            Exclude
                        </Button>
                    </Box>
                ) : (
                    <Typography sx={{ fontSize: "13px", color: DASH.muted }}>
                        Showing <b>{rows.length}</b> of {roster.length}
                    </Typography>
                )}
            </Box>

            <Box sx={{ ...panelSx, overflow: "hidden" }}>
                <TableContainer sx={{ maxHeight: "58vh" }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox" sx={headCellSx}>
                                    <Checkbox
                                        size="small"
                                        checked={allVisibleSelected}
                                        indeterminate={!allVisibleSelected && rows.some((r) => selected.has(r.rollNumber))}
                                        onChange={toggleSelectAll}
                                        disabled={rows.length === 0}
                                    />
                                </TableCell>
                                <TableCell sx={headCellSx}>Staff member</TableCell>
                                <TableCell sx={headCellSx}>Roll no</TableCell>
                                <TableCell sx={headCellSx}>Role</TableCell>
                                <TableCell sx={headCellSx}>Reason for exclusion</TableCell>
                                <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Coverage</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ ...bodyCellSx, textAlign: "center", py: 5 }}>
                                        <CircularProgress size={22} sx={{ color: DASH.primary }} />
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ ...bodyCellSx, py: 4 }}>
                                        <EmptyNote
                                            text={
                                                roster.length === 0
                                                    ? "No users found."
                                                    : "No one matches these filters."
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading &&
                                rows.map((row) => {
                                    const entry = entryOf(row.rollNumber);
                                    const tone = roleTone(row.role);
                                    return (
                                        <TableRow
                                            key={row.rollNumber}
                                            hover
                                            sx={{ bgcolor: entry.included ? "transparent" : `${DASH.red}08` }}
                                        >
                                            <TableCell padding="checkbox" sx={bodyCellSx}>
                                                <Checkbox
                                                    size="small"
                                                    checked={selected.has(row.rollNumber)}
                                                    onChange={() => toggleSelect(row.rollNumber)}
                                                />
                                            </TableCell>

                                            <TableCell sx={bodyCellSx}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            fontSize: "11px",
                                                            fontWeight: 700,
                                                            bgcolor: tone.bg,
                                                            color: tone.fg,
                                                        }}
                                                    >
                                                        {initialsOf(row.name)}
                                                    </Avatar>
                                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.ink }}>
                                                        {row.name || "—"}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            <TableCell sx={{ ...bodyCellSx, fontVariantNumeric: "tabular-nums" }}>
                                                {row.rollNumber}
                                            </TableCell>

                                            <TableCell sx={bodyCellSx}>
                                                <Chip
                                                    label={row.role}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: tone.bg,
                                                        color: tone.fg,
                                                        fontWeight: 600,
                                                        fontSize: "11px",
                                                        height: 22,
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell sx={bodyCellSx}>
                                                {entry.included ? (
                                                    <Typography sx={{ fontSize: "13px", color: DASH.faint }}>—</Typography>
                                                ) : (
                                                    <TextField
                                                        value={entry.reason}
                                                        onChange={(event) =>
                                                            patch(row.rollNumber, { reason: event.target.value })
                                                        }
                                                        placeholder="Why is this person excluded?"
                                                        variant="standard"
                                                        size="small"
                                                        sx={{
                                                            width: "100%",
                                                            minWidth: 180,
                                                            "& .MuiInput-input": { fontSize: "13px", py: 0.3 },
                                                        }}
                                                    />
                                                )}
                                            </TableCell>

                                            <TableCell sx={{ ...bodyCellSx, textAlign: "right", whiteSpace: "nowrap" }}>
                                                <Tooltip
                                                    title={
                                                        entry.included
                                                            ? "On payroll and attendance"
                                                            : "Left out of payroll and attendance"
                                                    }
                                                    arrow
                                                >
                                                    <Box
                                                        component="span"
                                                        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontSize: "12px",
                                                                fontWeight: 600,
                                                                color: entry.included ? DASH.green : DASH.red,
                                                                minWidth: 60,
                                                                textAlign: "right",
                                                            }}
                                                        >
                                                            {entry.included ? INCLUDED : EXCLUDED}
                                                        </Typography>
                                                        <Switch
                                                            size="small"
                                                            checked={entry.included}
                                                            onChange={(event) =>
                                                                setIncluded(row.rollNumber, event.target.checked)
                                                            }
                                                        />
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 1.4 }}>
                <GroupOutlinedIcon sx={{ fontSize: 15, color: DASH.faint }} />
                <Typography sx={{ fontSize: "12px", color: DASH.faint }}>
                    Students are never listed here — this roster is staff only.
                </Typography>
            </Box>
        </Box>
    );
}
