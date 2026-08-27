import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Typography, Button, IconButton, Switch, Tooltip, Chip,
    FormControl, Select, MenuItem, Accordion, AccordionSummary, AccordionDetails,
    Table, TableBody, TableCell, TableHead, TableRow, CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { selectApproverUserTypes } from "../../Redux/Slices/userTypesSlice";
import { APPROVAL_MODULES, fetchApprovalMatrix, selectApprovalMatrix } from "../../Redux/Slices/approvalMatrixSlice";
import { UpdateApprovalMatrix } from "../../Api/Api";
import { DASH, RADIUS } from "../DashBoardComps/dashboardTheme";

const ACCENT = "#4338CA";
const MAX_LEVELS = 3;
const token = "123";

// The module list and its subMenu keys live in the slice, so this screen and
// the create screens can never disagree about what a flow is called.
const APPROVAL_PAGES = APPROVAL_MODULES;
// Leave flows have exactly one approver, so they get their own compact section
// instead of the multi-level accordion.
const SINGLE_APPROVER_PAGES = APPROVAL_MODULES.filter((p) => p.singleApprover);
const SINGLE_APPROVER_KEYS = new Set(SINGLE_APPROVER_PAGES.map((p) => p.key));
const MULTI_LEVEL_PAGES = APPROVAL_MODULES.filter((p) => !p.singleApprover);

const emptyFlow = (key) => ({ enabled: SINGLE_APPROVER_KEYS.has(key), levels: [], allowSameLevel: false });

const blankFlows = () => {
    const init = {};
    APPROVAL_PAGES.forEach((p) => { init[p.key] = emptyFlow(p.key); });
    return init;
};

export default function ApprovalFlowsTab({ showSnack }) {
    const dispatch = useDispatch();
    // The matrix lives in the store so every screen reads the same flow.
    const matrix = useSelector(selectApprovalMatrix);
    // Students are excluded by the slice — it owns that rule, not this screen.
    const roleOptionsRaw = useSelector(selectApproverUserTypes);
    const roleOptions = useMemo(() => roleOptionsRaw || [], [roleOptionsRaw]);
    const roleName = useCallback(
        (id) => roleOptions.find((u) => String(u.userTypeID) === String(id))?.userType || "Deleted user type",
        [roleOptions],
    );

    const [flows, setFlows] = useState(blankFlows);
    // What the server last gave us, so Save only sends what actually changed.
    const [saved, setSaved] = useState(blankFlows);
    const [expanded, setExpanded] = useState(APPROVAL_PAGES[0].key);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // The store is the source of truth; this screen edits a copy of it and
    // pushes changes back through the API, then refreshes the store.
    useEffect(() => {
        const next = blankFlows();
        (matrix || []).forEach((row) => {
            if (!row?.subMenu) return;
            // level1 carries every approver for single-level (leave) flows, so it
            // may arrive as an array or a comma separated list as well as an object.
            const readLevel = (lvl) => {
                if (lvl === null || lvl === undefined || lvl === "") return [];
                if (Array.isArray(lvl)) return lvl.map((x) => x?.userTypeID ?? x);
                if (typeof lvl === "object") return [lvl.userTypeID];
                return String(lvl).split(",").map((x) => x.trim()).filter(Boolean);
            };
            const levels = [row.level1, row.level2, row.level3]
                .flatMap(readLevel)
                .filter((id) => id !== null && id !== undefined && id !== "");
            next[row.subMenu] = {
                id: row.id,
                levels,
                // Leave always requires approval - it has no off switch.
                enabled: SINGLE_APPROVER_KEYS.has(row.subMenu) ? true : levels.length > 0,
                allowSameLevel: row.approvalWithinSameLevel === "Y",
            };
        });
        setFlows(next);
        setSaved(JSON.parse(JSON.stringify(next)));
    }, [matrix]);

    const loadMatrix = useCallback(async () => {
        setIsLoading(true);
        try {
            await dispatch(fetchApprovalMatrix()).unwrap();
        } catch (err) {
            showSnack?.(typeof err === "string" ? err : "Failed to load approval flows.", false);
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => { loadMatrix(); }, [loadMatrix]);

    const cfg = (key) => flows[key] || emptyFlow(key);

    const setLevel = (key, idx, value) => setFlows((prev) => {
        const levels = [...(prev[key]?.levels || [])];
        levels[idx] = value;
        return { ...prev, [key]: { ...prev[key], levels } };
    });

    // Leave flows take a set of co-equal approvers, not an ordered chain.
    const setApprovers = (key, values) => setFlows((prev) => ({
        ...prev, [key]: { ...prev[key], levels: values },
    }));

    const addLevel = (key) => setFlows((prev) => {
        const levels = [...(prev[key]?.levels || [])];
        if (levels.length >= Math.min(MAX_LEVELS, roleOptions.length)) return prev;
        levels.push("");
        return { ...prev, [key]: { ...prev[key], levels } };
    });

    const removeLevel = (key, idx) => setFlows((prev) => {
        const levels = (prev[key]?.levels || []).filter((_, i) => i !== idx);
        return { ...prev, [key]: { ...prev[key], levels } };
    });

    const toggleSameLevel = (key) => setFlows((prev) => ({
        ...prev, [key]: { ...prev[key], allowSameLevel: !prev[key]?.allowSameLevel },
    }));

    const toggleEnabled = (key) => setFlows((prev) => ({
        ...prev, [key]: { ...prev[key], enabled: !prev[key]?.enabled },
    }));

    // ── The rules this screen configures ──────────────────────────────────────
    // Level 1 is the final approver and publishes straight away. Every level
    // below sends its work upward, one level at a time. A level approves every
    // level beneath it plus Others. Others hold the module but no level, so they
    // can only request. The same-level switch lets peers clear each other, and
    // never crosses levels.
    const filledLevels = (c) => (c.levels || []).filter(Boolean);

    const matrixRows = (c) => {
        const filled = filledLevels(c);
        const rows = filled.map((id, i) => {
            const approves = [];
            if (c.allowSameLevel) approves.push(`Level ${i + 1} peers`);
            filled.slice(i + 1).forEach((_, j) => approves.push(`Level ${i + j + 2}`));
            approves.push("Others");

            return {
                key: `lvl-${i}`,
                badge: String(i + 1),
                name: roleName(id),
                posting: i === 0 ? "Publishes immediately" : "Sent for approval",
                direct: i === 0,
                needs: i === 0
                    ? "Nobody - final approver"
                    : filled.slice(0, i).map((_, j) => `Level ${j + 1}`).reverse().join("  →  "),
                approves: approves.join(", "),
            };
        });

        if (filled.length) {
            rows.push({
                key: "others",
                badge: "-",
                name: "Others",
                posting: "Sent for approval",
                direct: false,
                needs: filled.map((_, j) => `Level ${j + 1}`).reverse().join("  →  "),
                approves: "Nobody",
                muted: true,
            });
        }
        return rows;
    };

    const explanationLines = (c) => {
        const filled = filledLevels(c);
        if (filled.length === 0) return [];
        const out = [];

        out.push(`Level 1 (${roleName(filled[0])}) is the final approver - whatever they post goes live straight away, no request needed.`);

        for (let i = 1; i < filled.length; i += 1) {
            const chain = filled.slice(0, i).map((_, j) => `Level ${j + 1}`).reverse().join(" then ");
            const canApprove = [];
            filled.slice(i + 1).forEach((_, j) => canApprove.push(`Level ${i + j + 2}`));
            canApprove.push("Others");
            out.push(`Level ${i + 1} (${roleName(filled[i])}) sends their items to ${chain}, and can approve ${canApprove.join(" and ")}.`);
        }

        out.push("Others - user types who can use this module but hold no approval level - can only send requests. They never approve.");

        out.push(c.allowSameLevel
            ? "Same level peers can approve each other: one Level 1 can clear another Level 1, Level 2 clears Level 2, Level 3 clears Level 3. Approval never crosses between levels."
            : "Peers cannot clear each other - every item has to be approved by a level above the person who posted it.");

        return out;
    };

    // Throw away local edits and go back to what the server last gave us.
    const handleDiscard = () => {
        setFlows(JSON.parse(JSON.stringify(saved)));
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const isSingleApprover = (key) => SINGLE_APPROVER_PAGES.some((sp) => sp.key === key);

    const toPayload = (key, c) => {
        const levels = c.enabled ? filledLevels(c) : [];
        // Leave flows carry one approver, so levels 2 and 3 are always cleared -
        // a stale level left over from the old multi-level shape would otherwise
        // keep asking for a second approval nobody configured.
        if (isSingleApprover(key)) {
            // Co-equal approvers: all of them ride in level1 as a comma separated
            // list, and 2/3 are always cleared so no stale level can block a request.
            return {
                subMenu: key,
                level1: levels.map(String).join(","),
                level2: "",
                level3: "",
                approvalWithinSameLevel: "N",
            };
        }
        return {
            subMenu: key,
            level1: levels[0] !== undefined ? String(levels[0]) : "",
            level2: levels[1] !== undefined ? String(levels[1]) : "",
            level3: levels[2] !== undefined ? String(levels[2]) : "",
            approvalWithinSameLevel: c.allowSameLevel ? "Y" : "N",
        };
    };

    const changedKeys = APPROVAL_PAGES
        .map((p) => p.key)
        .filter((key) => JSON.stringify(toPayload(key, cfg(key))) !== JSON.stringify(toPayload(key, saved[key] || emptyFlow(key))));

    const handleSave = async () => {
        if (changedKeys.length === 0) {
            showSnack?.("Nothing to save - no approval flow has changed.", false);
            return;
        }
        // A half-filled level would silently drop a step out of the chain.
        const incomplete = changedKeys.find((key) => {
            const c = cfg(key);
            if (isSingleApprover(key)) return c.enabled && !filledLevels(c).length;
            return c.enabled && (c.levels || []).some((lvl) => !lvl);
        });
        if (incomplete) {
            const page = APPROVAL_PAGES.find((p) => p.key === incomplete);
            showSnack?.(isSingleApprover(incomplete)
                ? `Pick who approves ${page?.label || incomplete}.`
                : `Pick a user type for every level in ${page?.label || incomplete}.`, false);
            setExpanded(incomplete);
            return;
        }

        setIsSaving(true);
        try {
            const results = await Promise.all(changedKeys.map((key) =>
                axios.post(UpdateApprovalMatrix, toPayload(key, cfg(key)), {
                    headers: { Authorization: `Bearer ${token}` },
                }).then((res) => ({ key, ok: !res?.data?.error, message: res?.data?.message }))
                    .catch((err) => ({ key, ok: false, message: err?.response?.data?.message }))
            ));

            const failed = results.filter((r) => !r.ok);
            if (failed.length) {
                const names = failed.map((f) => APPROVAL_PAGES.find((p) => p.key === f.key)?.label || f.key);
                showSnack?.(failed[0].message || `Could not save: ${names.join(", ")}.`, false);
            } else {
                showSnack?.(`Saved ${results.length} approval flow${results.length > 1 ? "s" : ""}.`);
            }
            await loadMatrix();
        } finally {
            setIsSaving(false);
        }
    };

    if (roleOptions.length === 0) {
        return (
            <Box sx={{ p: 6, textAlign: "center", borderRadius: "12px", border: "1px dashed #E5E7EB", bgcolor: "#FAFAFA" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF" }}>
                    No user types available yet — create user types first to build approval flows.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <VerifiedOutlinedIcon sx={{ fontSize: 20, color: ACCENT }} />
                    <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>Approval Flows</Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#6B7280" }}>
                            Set who approves each item. Level 1 is the final approver and posts without a request; leave uses a single set of approvers instead.
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {changedKeys.length > 0 && (
                        <Chip
                            size="small"
                            label={`${changedKeys.length} unsaved`}
                            sx={{ height: 22, fontSize: 10.5, fontWeight: 700, bgcolor: "#FEF3C7", color: "#92400E" }}
                        />
                    )}
                    <Tooltip title="Reload from server" arrow>
                        <span>
                            <IconButton onClick={loadMatrix} disabled={isLoading || isSaving} size="small" sx={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                                <RefreshIcon sx={{ fontSize: 18, color: "#475569" }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || isLoading || changedKeys.length === 0}
                        startIcon={isSaving ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : null}
                        sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, bgcolor: ACCENT, color: "#fff", borderRadius: "10px", height: 38, px: 2.4, "&:hover": { bgcolor: ACCENT, filter: "brightness(0.92)" }, "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" } }}
                    >
                        {isSaving ? "Saving…" : "Save Approval Flows"}
                    </Button>
                </Box>
            </Box>

            {isLoading && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, p: 1.2, borderRadius: "8px", bgcolor: "#EEF2FF", border: "1px solid #C7D2FE" }}>
                    <CircularProgress size={14} sx={{ color: ACCENT }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#3730A3" }}>Loading approval flows…</Typography>
                </Box>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {MULTI_LEVEL_PAGES.map((p) => {
                    const c = cfg(p.key);
                    const filledCount = filledLevels(c).length;
                    const lines = explanationLines(c);
                    const rows = matrixRows(c);
                    const dirty = changedKeys.includes(p.key);

                    return (
                        <Accordion
                            key={p.key}
                            expanded={expanded === p.key}
                            onChange={() => setExpanded(expanded === p.key ? "" : p.key)}
                            disableGutters
                            elevation={0}
                            sx={{ border: `1px solid ${dirty ? "#FCD34D" : "#E5E7EB"}`, borderRadius: "10px !important", "&:before": { display: "none" }, overflow: "hidden" }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#F8FAFC", minHeight: 52, "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1.2 } }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ACCENT }} />
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{p.label}</Typography>
                                <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>· {p.group}</Typography>
                                {dirty && (
                                    <Chip size="small" label="Unsaved" sx={{ height: 19, fontSize: 9.5, fontWeight: 700, bgcolor: "#FEF3C7", color: "#92400E" }} />
                                )}
                                <Chip
                                    size="small"
                                    label={!c.enabled ? "Off" : filledCount > 0 ? `On · ${filledCount} level${filledCount > 1 ? "s" : ""}` : "On"}
                                    sx={{ ml: "auto", mr: 1, height: 20, fontSize: 10, fontWeight: 700, bgcolor: c.enabled ? "#ECFDF5" : "#F1F5F9", color: c.enabled ? "#047857" : "#64748B" }}
                                />
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: c.enabled ? 2 : 0 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>Require approval for {p.label}</Typography>
                                        <Typography sx={{ fontSize: 11.5, color: "#6B7280" }}>Set up multi-level approvers who must approve each item before it is finalized.</Typography>
                                    </Box>
                                    <Switch checked={!!c.enabled} onChange={() => toggleEnabled(p.key)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: ACCENT }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: ACCENT } }} />
                                </Box>

                                {!c.enabled ? null : (<>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, mb: 0.8 }}>Approval levels (top → bottom)</Typography>

                                {(c.levels || []).length === 0 && (
                                    <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic", mb: 1 }}>No approval levels yet — add Level 1 (the final approver).</Typography>
                                )}

                                {(c.levels || []).map((lvl, idx) => (
                                    <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
                                        <Box sx={{ width: 26, height: 26, borderRadius: "50%", bgcolor: idx === 0 ? ACCENT : `${ACCENT}1A`, color: idx === 0 ? "#fff" : ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                                            {idx + 1}
                                        </Box>
                                        <FormControl size="small" sx={{ width: 220 }}>
                                            <Select
                                                value={lvl || ""}
                                                displayEmpty
                                                onChange={(e) => setLevel(p.key, idx, e.target.value)}
                                                renderValue={(v) => (v ? roleName(v) : <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>Select user type</Typography>)}
                                                sx={{ borderRadius: "8px", height: 36, fontSize: 13, fontWeight: 600 }}
                                            >
                                                {roleOptions
                                                    .filter((r) => String(r.userTypeID) === String(lvl) || !(c.levels || []).some((x) => String(x) === String(r.userTypeID)))
                                                    .map((r) => (
                                                        <MenuItem key={r.userTypeID} value={r.userTypeID} sx={{ fontSize: 13, fontWeight: 600 }}>{r.userType}</MenuItem>
                                                    ))}
                                            </Select>
                                        </FormControl>
                                        <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
                                            {idx === 0
                                                ? "Final approver · posts without a request"
                                                : `Sends to Level ${idx} · approves everyone below`}
                                        </Typography>
                                        <Tooltip title="Remove level" arrow>
                                            <IconButton size="small" onClick={() => removeLevel(p.key, idx)} sx={{ ml: "auto" }}>
                                                <DeleteOutlineIcon sx={{ fontSize: 17, color: "#DC2626" }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                ))}

                                <Button
                                    onClick={() => addLevel(p.key)}
                                    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                                    disabled={(c.levels || []).length >= Math.min(MAX_LEVELS, roleOptions.length)}
                                    sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, color: ACCENT, borderRadius: "8px", border: `1px dashed ${ACCENT}66`, px: 1.4, height: 32, mt: 0.5, "&:hover": { bgcolor: `${ACCENT}0A` }, "&.Mui-disabled": { color: "#CBD5E1", borderColor: "#E5E7EB" } }}
                                >
                                    Add approval level
                                </Button>

                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mt: 1.5, p: 1.2, borderRadius: "8px", bgcolor: "#F8FAFC", border: "1px solid #EEF0F2" }}>
                                    <Box>
                                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>Allow same-level approvers to approve each other</Typography>
                                        <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                                            When on, a approver can clear an item raised by someone on <strong>their own level</strong> — Level 1 for Level 1, Level 2 for Level 2, Level 3 for Level 3. Approval <strong>never crosses</strong> between levels.
                                        </Typography>
                                    </Box>
                                    <Switch checked={!!c.allowSameLevel} onChange={() => toggleSameLevel(p.key)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#0891B2" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#0891B2" } }} />
                                </Box>

                                {rows.length > 0 && (
                                    <Box sx={{ mt: 1.5, borderRadius: "8px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
                                        <Box sx={{ px: 1.4, py: 1, bgcolor: "#F8FAFC", borderBottom: "1px solid #E5E7EB" }}>
                                            <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: 0.3 }}>
                                                Who can do what
                                            </Typography>
                                        </Box>
                                        <Box sx={{ overflowX: "auto" }}>
                                            <Table size="small" sx={{ minWidth: 620 }}>
                                                <TableHead>
                                                    <TableRow>
                                                        {["Level", "When they post", "Needs approval from", "They can approve"].map((h) => (
                                                            <TableCell key={h} sx={{ fontSize: 10.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.3, bgcolor: "#FCFCFD", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>
                                                                {h}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {rows.map((r) => (
                                                        <TableRow key={r.key} sx={{ bgcolor: r.muted ? "#FAFAFA" : "inherit" }}>
                                                            <TableCell sx={{ borderBottom: "1px solid #F1F5F9" }}>
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
                                                                    <Box sx={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, bgcolor: r.muted ? "#E2E8F0" : r.direct ? ACCENT : `${ACCENT}1A`, color: r.muted ? "#64748B" : r.direct ? "#fff" : ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>
                                                                        {r.badge}
                                                                    </Box>
                                                                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: r.muted ? "#64748B" : "#111827", whiteSpace: "nowrap" }}>{r.name}</Typography>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell sx={{ borderBottom: "1px solid #F1F5F9" }}>
                                                                <Chip
                                                                    size="small"
                                                                    label={r.posting}
                                                                    sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: r.direct ? "#ECFDF5" : "#FFF7ED", color: r.direct ? "#047857" : "#C2410C" }}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{ fontSize: 12, color: "#475569", borderBottom: "1px solid #F1F5F9", whiteSpace: "nowrap" }}>{r.needs}</TableCell>
                                                            <TableCell sx={{ fontSize: 12, color: r.muted ? "#94A3B8" : "#475569", borderBottom: "1px solid #F1F5F9" }}>{r.approves}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Box>
                                    </Box>
                                )}

                                {lines.length > 0 && (
                                    <Box sx={{ mt: 1.5, p: 1.4, borderRadius: "8px", bgcolor: "#EEF2FF", border: "1px solid #C7D2FE" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.6 }}>
                                            <InfoOutlinedIcon sx={{ fontSize: 16, color: ACCENT }} />
                                            <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: "#3730A3", textTransform: "uppercase", letterSpacing: 0.3 }}>How this approval works</Typography>
                                        </Box>
                                        {lines.map((l, i) => (
                                            <Typography key={i} sx={{ fontSize: 12, color: "#3730A3", lineHeight: 1.5, mb: 0.3 }}>• {l}</Typography>
                                        ))}
                                    </Box>
                                )}
                                </>)}
                            </AccordionDetails>
                        </Accordion>
                    );
                })}

                {/* --- Leave Management: approval is always required; pick who can clear it --- */}
                {SINGLE_APPROVER_PAGES.length > 0 && (() => {
                    const dirty = SINGLE_APPROVER_PAGES.some((lp) => changedKeys.includes(lp.key));
                    const setCount = SINGLE_APPROVER_PAGES.filter((lp) => filledLevels(cfg(lp.key)).length).length;

                    return (
                        <Accordion
                            expanded={expanded === "leavemanagement"}
                            onChange={() => setExpanded(expanded === "leavemanagement" ? "" : "leavemanagement")}
                            disableGutters
                            elevation={0}
                            sx={{ border: `1px solid ${dirty ? "#FCD34D" : DASH.line}`, borderRadius: "10px !important", "&:before": { display: "none" }, overflow: "hidden" }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: DASH.surface, minHeight: 52, "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1.2 } }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ACCENT }} />
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: DASH.ink }}>Leave Management</Typography>
                                <Typography sx={{ fontSize: 11, color: DASH.faint }}>· Leave & Attendance</Typography>
                                {dirty && (
                                    <Chip size="small" label="Unsaved" sx={{ height: 19, fontSize: 9.5, fontWeight: 700, bgcolor: "#FEF3C7", color: "#92400E" }} />
                                )}
                                <Chip
                                    size="small"
                                    label={`Always on · ${setCount} of ${SINGLE_APPROVER_PAGES.length} set`}
                                    sx={{ ml: "auto", mr: 1, height: 20, fontSize: 10, fontWeight: 700, bgcolor: setCount === SINGLE_APPROVER_PAGES.length ? DASH.greenLight : DASH.amberLight, color: setCount === SINGLE_APPROVER_PAGES.length ? DASH.green : DASH.amber }}
                                />
                            </AccordionSummary>

                            <AccordionDetails sx={{ p: 2, bgcolor: DASH.canvas }}>
                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.9, mb: 2, px: 1.2, py: 1, borderRadius: RADIUS, bgcolor: "#fff", border: `1px dashed ${DASH.line}` }}>
                                    <InfoOutlinedIcon sx={{ fontSize: 14, color: DASH.faint, mt: "1px" }} />
                                    <Typography sx={{ fontSize: 11.5, color: DASH.muted, lineHeight: 1.5 }}>
                                        Student and staff leave always needs approval — there is no way to turn it off.
                                        Tick every user type allowed to clear a request; any one of them can approve it.
                                        Students are never offered as approvers.
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    {SINGLE_APPROVER_PAGES.map((lp) => {
                                        const c = cfg(lp.key);
                                        const picked = (c.levels || []).map(String).filter(Boolean);
                                        const isStudent = lp.key === "studentleave";
                                        const accent = isStudent ? DASH.cyan : DASH.violet;
                                        const accentLight = isStudent ? DASH.cyanLight : DASH.violetLight;

                                        const toggleApprover = (id) => {
                                            const key = String(id);
                                            setApprovers(lp.key, picked.includes(key)
                                                ? picked.filter((x) => x !== key)
                                                : [...picked, key]);
                                        };

                                        return (
                                            <Box
                                                key={lp.key}
                                                sx={{
                                                    bgcolor: "#fff",
                                                    border: `1px solid ${DASH.line}`,
                                                    borderRadius: RADIUS,
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, px: 2, py: 1.4, borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                    <Box sx={{ width: 3, height: 20, borderRadius: RADIUS, bgcolor: accent, flexShrink: 0 }} />
                                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: DASH.ink, lineHeight: 1.35 }}>
                                                            {lp.label}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: 11.5, color: DASH.muted, mt: 0.1 }}>
                                                            {isStudent ? "Raised by students" : "Raised by staff"}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        size="small"
                                                        label={picked.length === 0 ? "No approver yet" : `${picked.length} approver${picked.length > 1 ? "s" : ""}`}
                                                        sx={{
                                                            height: 20, fontSize: 10, fontWeight: 700, borderRadius: RADIUS,
                                                            bgcolor: picked.length ? accentLight : DASH.amberLight,
                                                            color: picked.length ? accent : DASH.amber,
                                                        }}
                                                    />
                                                </Box>

                                                <Box sx={{ p: 2 }}>
                                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: DASH.muted, textTransform: "uppercase", letterSpacing: 0.4, mb: 1.2 }}>
                                                        Who can approve
                                                    </Typography>

                                                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }, gap: 1.2 }}>
                                                        {roleOptions.map((u) => {
                                                            const id = String(u.userTypeID);
                                                            const on = picked.includes(id);
                                                            const initials = String(u.userType || "?")
                                                                .split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

                                                            return (
                                                                <Box
                                                                    key={id}
                                                                    role="checkbox"
                                                                    aria-checked={on}
                                                                    tabIndex={0}
                                                                    onClick={() => toggleApprover(id)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleApprover(id); }
                                                                    }}
                                                                    sx={{
                                                                        display: "flex", alignItems: "center", gap: 1.2,
                                                                        px: 1.4, py: 1.2,
                                                                        borderRadius: RADIUS,
                                                                        cursor: "pointer",
                                                                        userSelect: "none",
                                                                        bgcolor: on ? accentLight : "#fff",
                                                                        border: `1px solid ${on ? accent : DASH.line}`,
                                                                        transition: "background-color 0.15s, border-color 0.15s, box-shadow 0.15s",
                                                                        "&:hover": { borderColor: on ? accent : "#9AA3AF", bgcolor: on ? accentLight : DASH.surface },
                                                                        "&:focus-visible": { outline: `2px solid ${accent}`, outlineOffset: 2 },
                                                                    }}
                                                                >
                                                                    <Box sx={{
                                                                        width: 30, height: 30, borderRadius: RADIUS, flexShrink: 0,
                                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                                        bgcolor: on ? accent : DASH.lineSoft,
                                                                        color: on ? "#fff" : DASH.muted,
                                                                        fontSize: 11, fontWeight: 800,
                                                                    }}>
                                                                        {initials}
                                                                    </Box>

                                                                    <Typography sx={{
                                                                        flex: 1, minWidth: 0,
                                                                        fontSize: 12.5, fontWeight: on ? 700 : 600,
                                                                        color: on ? DASH.ink : DASH.text,
                                                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                                    }}>
                                                                        {u.userType}
                                                                    </Typography>

                                                                    {on
                                                                        ? <CheckCircleIcon sx={{ fontSize: 18, color: accent, flexShrink: 0 }} />
                                                                        : <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: DASH.line, flexShrink: 0 }} />}
                                                                </Box>
                                                            );
                                                        })}
                                                    </Box>

                                                    <Typography sx={{ fontSize: 11, color: picked.length ? DASH.muted : DASH.amber, mt: 1.4, lineHeight: 1.5, fontWeight: picked.length ? 400 : 600 }}>
                                                        {picked.length === 0
                                                            ? `Pick at least one user type — ${isStudent ? "student" : "staff"} leave cannot be approved until you do.`
                                                            : picked.length === 1
                                                                ? `${roleName(picked[0])} approves every ${isStudent ? "student" : "staff"} leave request.`
                                                                : `Any one of these ${picked.length} user types can approve a ${isStudent ? "student" : "staff"} leave request.`}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    );
                })()}
            </Box>

            {/* --- Sticky save bar: only shows once something actually changed, so the
                 action is reachable no matter how far down the page you scrolled. --- */}
            {changedKeys.length > 0 && (
                <Box
                    sx={{
                        position: "sticky",
                        bottom: 16,
                        zIndex: 5,
                        mt: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                        px: 2,
                        py: 1.4,
                        borderRadius: RADIUS,
                        bgcolor: "#fff",
                        border: `1px solid ${DASH.amber}`,
                        boxShadow: "0 8px 24px rgba(16,24,40,0.16)",
                    }}
                >
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: DASH.amber, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.ink }}>
                            {changedKeys.length} unsaved change{changedKeys.length > 1 ? "s" : ""}
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: DASH.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {changedKeys
                                .map((k) => (APPROVAL_PAGES.find((ap) => ap.key === k)?.label || k))
                                .join(", ")}
                        </Typography>
                    </Box>

                    <Button
                        onClick={handleDiscard}
                        disabled={isSaving}
                        variant="outlined"
                        sx={{
                            textTransform: "none", fontWeight: 600, fontSize: 12.5,
                            borderRadius: RADIUS, height: 34, px: 2,
                            color: DASH.text, borderColor: "#D6DAE1", bgcolor: "#fff",
                            "&:hover": { borderColor: "#9AA3AF", bgcolor: DASH.surface },
                        }}
                    >
                        Discard
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        startIcon={isSaving ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : null}
                        sx={{
                            textTransform: "none", fontWeight: 700, fontSize: 12.5,
                            borderRadius: RADIUS, height: 34, px: 2.4,
                            bgcolor: ACCENT, color: "#fff", boxShadow: "none",
                            "&:hover": { bgcolor: ACCENT, filter: "brightness(0.92)", boxShadow: "none" },
                            "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
                        }}
                    >
                        {isSaving ? "Saving…" : "Save Approval Flows"}
                    </Button>
                </Box>
            )}

        </Box>
    );
}
