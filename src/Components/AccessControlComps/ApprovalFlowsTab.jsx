import React, { useState, useMemo } from "react";
import {
    Box, Typography, Button, IconButton, Switch, Tooltip, Chip,
    FormControl, Select, MenuItem, Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { useSelector } from "react-redux";
import { selectUserTypes } from "../../Redux/Slices/userTypesSlice";

const ACCENT = "#4338CA";
const MAX_LEVELS = 3;

// The only flows that need a multi-level approval chain.
const APPROVAL_PAGES = [
    { key: "news", label: "News", group: "Communication" },
    { key: "messages", label: "Messages", group: "Communication" },
    { key: "circular", label: "Circular", group: "Communication" },
    { key: "homework", label: "Homework", group: "Communication" },
    { key: "feestructure", label: "Create Fee Structure", group: "Fee & Finance" },
    { key: "leaveattendance", label: "Leave & Attendance", group: "Leave & Attendance" },
];

const emptyFlow = () => ({ enabled: false, levels: [], allowSameLevel: true });

export default function ApprovalFlowsTab({ showSnack }) {
    const userTypes = useSelector(selectUserTypes) || [];

    // User types that can act as approvers (Students never approve).
    const roleOptions = useMemo(
        () => userTypes.map((u) => u.userType).filter((n) => n && n.toLowerCase().replace(/\s/g, "") !== "student"),
        [userTypes],
    );

    const [flows, setFlows] = useState(() => {
        const init = {};
        APPROVAL_PAGES.forEach((p) => { init[p.key] = emptyFlow(); });
        return init;
    });
    const [expanded, setExpanded] = useState(APPROVAL_PAGES[0].key);

    const cfg = (key) => flows[key] || emptyFlow();

    const setLevel = (key, idx, value) => setFlows((prev) => {
        const levels = [...(prev[key]?.levels || [])];
        levels[idx] = value;
        return { ...prev, [key]: { ...prev[key], levels } };
    });

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

    const explanationLines = (c) => {
        const filled = (c.levels || []).filter(Boolean);
        if (filled.length === 0) return [];
        const out = [];
        out.push(`Level 1 (${filled[0]}) is the final approver — their approval finalizes the item.`);
        for (let i = 1; i < filled.length; i++) {
            out.push(`Level ${i + 1} (${filled[i]}) approves first, then it moves up to Level ${i}.`);
        }
        if (c.allowSameLevel) out.push("Only Level 2 approvers can approve each other's items — Level 1 and Level 3 cannot.");
        else out.push("Members can only be approved by a higher level, not their peers.");
        return out;
    };

    const handleSave = () => {
        // TODO: POST the `flows` object to the backend once the endpoint exists.
        showSnack?.("Approval flows saved.");
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
                        <Typography sx={{ fontSize: 11.5, color: "#6B7280" }}>Set who approves each item — top level is the final approver.</Typography>
                    </Box>
                </Box>
                <Button
                    onClick={handleSave}
                    sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, bgcolor: ACCENT, color: "#fff", borderRadius: "10px", height: 38, px: 2.4, "&:hover": { bgcolor: ACCENT, filter: "brightness(0.92)" } }}
                >
                    Save Approval Flows
                </Button>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {APPROVAL_PAGES.map((p) => {
                    const c = cfg(p.key);
                    const filledCount = (c.levels || []).filter(Boolean).length;
                    const lines = explanationLines(c);
                    return (
                        <Accordion
                            key={p.key}
                            expanded={expanded === p.key}
                            onChange={() => setExpanded(expanded === p.key ? "" : p.key)}
                            disableGutters
                            elevation={0}
                            sx={{ border: "1px solid #E5E7EB", borderRadius: "10px !important", "&:before": { display: "none" }, overflow: "hidden" }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#F8FAFC", minHeight: 52, "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1.2 } }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ACCENT }} />
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{p.label}</Typography>
                                <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>· {p.group}</Typography>
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
                                                value={lvl}
                                                displayEmpty
                                                onChange={(e) => setLevel(p.key, idx, e.target.value)}
                                                renderValue={(v) => (v ? v : <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>Select user type</Typography>)}
                                                sx={{ borderRadius: "8px", height: 36, fontSize: 13, fontWeight: 600 }}
                                            >
                                                {roleOptions.filter((r) => r === lvl || !(c.levels || []).includes(r)).map((r) => (
                                                    <MenuItem key={r} value={r} sx={{ fontSize: 13, fontWeight: 600 }}>{r}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
                                            {idx === 0 ? "Final approver" : `Approves Level ${idx + 2}+ & Others`}
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
                                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>Allow Level 2 approvers to approve each other</Typography>
                                        <Typography sx={{ fontSize: 11, color: "#6B7280" }}>When on, only <strong>Level 2</strong> user types can approve each other's items — <strong>Level 1 and Level 3 are not included</strong>.</Typography>
                                    </Box>
                                    <Switch checked={!!c.allowSameLevel} onChange={() => toggleSameLevel(p.key)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#0891B2" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#0891B2" } }} />
                                </Box>

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
            </Box>
        </Box>
    );
}
