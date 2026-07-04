import React, { useState } from "react";
import {
    Box, Typography, Button, IconButton, Switch, Chip, Checkbox, FormControlLabel, FormGroup,
    Accordion, AccordionSummary, AccordionDetails, FormControl, Select, MenuItem, Divider, Tooltip, Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import SnackBar from "../../SnackBar";
import { useSelector } from "react-redux";

const ACCENT = "#4338CA";

export const OPS = [
    { key: "view", label: "View" },
    { key: "create", label: "Create" },
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete" },
];

// What each operation implies. Enabling an op auto-enables (and locks-on) the ops it implies.
//   Create → View,  Edit → Create + View,  Delete → View only (not Create/Edit).
const IMPLIES = {
    create: ["view"],
    edit: ["create", "view"],
    delete: ["view"],
};

export const defaultPageConfig = () => ({
    view: true, create: false, edit: false, delete: false,
    approval: false,
    levels: [],            // ordered approver user-types: index 0 = Level 1 (top)
    allowSameLevel: false, // peer approval within the same level (Level 2+)
});

/**
 * Shared layout + state engine for a module's access-configuration page.
 *
 * Props:
 *  - moduleMeta : { key, name, color }
 *  - pages      : string[]                  pages/screens that belong to this module
 *  - opsKeys      : string[]                  default subset of OPS keys for this module's pages
 *  - approval     : boolean                   default: whether an approval flow applies
 *  - validate     : (config) => string|null   optional module-specific validation
 *  - extraOps     : { [page]: [{key,label}] } page-specific extra permission checkboxes
 *  - pageOverrides: { [page]: { opsKeys?, approval? } } per-page overrides of opsKeys / approval
 */
export default function ModuleConfigShell({ moduleMeta, pages, opsKeys = ["view", "create", "edit", "delete"], approval = false, validate, extraOps = {}, extraOpsLabels = {}, pageOverrides = {}, approvalText = {}, approvalNoun = "post" }) {
    const nounS = approvalNoun;
    const nounP = `${approvalNoun}s`;
    const navigate = useNavigate();
    const location = useLocation();
    const role = location.state?.role || { id: 0, name: "Role" };
    const allRoles = location.state?.roles || [];
    const color = moduleMeta.color || ACCENT;
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);

    // Per-page resolvers (fall back to the module-level defaults)
    const pageOpsKeys = (page) => pageOverrides[page]?.opsKeys || opsKeys;
    const pageOps = (page) => OPS.filter((o) => pageOpsKeys(page).includes(o.key));
    const pageApproval = (page) => (pageOverrides[page]?.approval ?? approval);

    // Selectable approver user-types (exclude the Student category)
    const roleOptions = (allRoles.length ? allRoles : [{ id: 1, name: "Admin" }, { id: 2, name: "Office Staffs" }, { id: 3, name: "Teachers" }, { id: 4, name: "Parent" }])
        .filter((r) => r.name !== "Student")
        .map((r) => r.name);

    // Flatten extra ops for a page (handles flat items, grouped { items }, and a group { gate })
    const flatten = (list) => (list || []).flatMap((e) => (e.items ? [...(e.gate ? [e.gate] : []), ...e.items] : [e]));
    const flatExtraOps = (page) => flatten(extraOps[page]);

    const [config, setConfig] = useState(() => Object.fromEntries(pages.map((p) => [p, {
        ...defaultPageConfig(),
        ...Object.fromEntries(flatten(extraOps[p]).map((e) => [e.key, false])),
    }])));
    const [snack, setSnack] = useState({ open: false, ok: true, msg: "" });
    const showSnack = (msg, ok = true) => setSnack({ open: true, ok, msg });
    const [expandedPages, setExpandedPages] = useState({});

    const setPage = (page, patch) => setConfig((prev) => ({ ...prev, [page]: { ...prev[page], ...patch } }));

    const toggleOp = (page, key) => {
        const cur = config[page];
        const next = { [key]: !cur[key] };
        const keys = pageOpsKeys(page);
        // Enabling an op auto-enables the ops it implies (Edit → Create + View, Delete → View)
        if (!cur[key] && IMPLIES[key]) {
            IMPLIES[key].forEach((k) => { if (keys.includes(k)) next[k] = true; });
        }
        setPage(page, next);
    };

    // A gated group's toggle — turning it off also clears its child options
    const toggleGate = (page, gateKey, itemKeys) => {
        const turningOff = !!config[page][gateKey];
        const next = { [gateKey]: !config[page][gateKey] };
        if (turningOff) itemKeys.forEach((k) => { next[k] = false; });
        setPage(page, next);
    };

    // An op is locked-on while another active op (within this page's ops) implies it
    const isLocked = (cfg, key, keys) =>
        keys.some((k) => k !== key && cfg[k] && (IMPLIES[k] || []).includes(key));
    // An op can be locked at all only if some op in this page's ops implies it
    const isLockable = (key, keys) =>
        keys.some((k) => k !== key && (IMPLIES[k] || []).includes(key));
    const toggleApproval = (page) => setPage(page, { approval: !config[page].approval });
    const toggleSameLevel = (page) => setPage(page, { allowSameLevel: !config[page].allowSameLevel });

    // "Allow all" — every operation + option checkbox key for a page (approval is excluded)
    const pageAllKeys = (page) => [...pageOpsKeys(page), ...flatExtraOps(page).map((e) => e.key)];
    const isPageAllOn = (page) => {
        const ks = pageAllKeys(page);
        return ks.length > 0 && ks.every((k) => config[page][k]);
    };
    const setPageAll = (page, val) => {
        setPage(page, Object.fromEntries(pageAllKeys(page).map((k) => [k, val])));
        if (val) setExpandedPages((prev) => ({ ...prev, [page]: true })); // open the card when enabling all
    };
    const isGlobalAllOn = () =>
        pages.some((p) => pageAllKeys(p).length) && pages.every((p) => pageAllKeys(p).every((k) => config[p][k]));
    const setAllPages = (val) => {
        setConfig((prev) => {
            const next = { ...prev };
            pages.forEach((p) => { next[p] = { ...next[p], ...Object.fromEntries(pageAllKeys(p).map((k) => [k, val])) }; });
            return next;
        });
        if (val) setExpandedPages(Object.fromEntries(pages.map((p) => [p, true]))); // open every card
    };

    const addLevel = (page) => {
        if (config[page].levels.length >= 3) return; // max 3 approval levels
        setPage(page, { levels: [...config[page].levels, ""] });
    };
    const removeLevel = (page, idx) => setPage(page, { levels: config[page].levels.filter((_, i) => i !== idx) });
    const setLevel = (page, idx, value) => {
        const next = [...config[page].levels];
        next[idx] = value;
        setPage(page, { levels: next });
    };

    // Built-in validation, then any module-specific rules supplied by the page
    const runValidation = () => {
        for (const page of pages) {
            const c = config[page];
            if (pageApproval(page) && c.approval) {
                if (c.levels.length === 0) return `Add at least Level 1 approver for "${page}".`;
                if (c.levels.some((l) => !l)) return `Select a user type for every approval level in "${page}".`;
            }
        }
        if (validate) return validate(config);
        return null;
    };

    const save = () => {
        const err = runValidation();
        if (err) return showSnack(err, false);
        // TODO: POST the per-page permissions (+ approval hierarchy) for this role & module
        showSnack(`Saved access configuration for ${moduleMeta.name} · ${role.name}.`);
    };

    // Human-readable approval explanation for a page
    const explain = (cfg) => {
        const levels = cfg.levels.filter(Boolean);
        const others = roleOptions.filter((r) => !levels.includes(r));
        const lines = [];
        levels.forEach((r, i) => {
            if (i === 0) {
                lines.push({ k: `L${i}`, t: `Level 1 — ${r}: approves every ${nounS} in this page. Their own ${nounP} are approved directly (no approval needed).` });
            } else {
                lines.push({ k: `L${i}`, t: `Level ${i + 1} — ${r}: approves everyone below (Level ${i + 2}+ & Others). Their own ${nounP} go up to Level ${i} for approval.` });
            }
        });
        if (levels.length && others.length) {
            lines.push({ k: "others", t: `Others — ${others.join(", ")}: not approvers. They can only submit ${nounP} for approval — routed to the nearest higher level. They cannot approve any ${nounS} themselves.` });
        }
        if (cfg.allowSameLevel && levels.length > 1) {
            lines.push({ k: "peer", t: `Peer approval is ON: approvers within the same level can approve each other's ${nounP} — e.g. if Admin is a Level 2 approver, one Admin can approve another Admin's ${nounS}; the same applies to Level 3 and below. Level 1 is excluded.` });
        }
        return lines;
    };

    // Operation permissions rendered as professional checkbox chips
    const renderOps = (page, cfg) => {
        const keys = pageOpsKeys(page);
        return (
            <FormGroup row sx={{ gap: 1 }}>
                {pageOps(page).map((o) => {
                    const active = cfg[o.key];
                    const lockable = isLockable(o.key, keys);
                    const locked = lockable && isLocked(cfg, o.key, keys);
                    return (
                        <FormControlLabel
                            key={o.key}
                            control={
                                <Checkbox
                                    size="small"
                                    checked={active}
                                    disabled={locked}
                                    onChange={() => toggleOp(page, o.key)}
                                    sx={{ p: 0.5, color: "#C7CDD6", "&.Mui-checked": { color }, "&.Mui-disabled.Mui-checked": { color: `${color}99` } }}
                                />
                            }
                            label={
                                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4 }}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: active ? "#111827" : "#6B7280" }}>{o.label}</Typography>
                                    {lockable && <LockOutlinedIcon sx={{ fontSize: 13, color: "#9CA3AF", visibility: locked ? "visible" : "hidden" }} />}
                                </Box>
                            }
                            sx={{ m: 0, mr: 1 }}
                        />
                    );
                })}
            </FormGroup>
        );
    };

    // Page-specific extra permissions (e.g. "Merge Siblings" on Student Management)
    // One option checkbox (used by both flat and grouped extra-op rendering)
    const extraCheckbox = (page, cfg, o) => {
        const active = !!cfg[o.key];
        return (
            <FormControlLabel
                key={o.key}
                control={
                    <Checkbox
                        size="small"
                        checked={active}
                        onChange={() => toggleOp(page, o.key)}
                        sx={{ p: 0.5, color: "#C7CDD6", "&.Mui-checked": { color } }}
                    />
                }
                label={<Typography sx={{ fontSize: 13, fontWeight: 600, color: active ? "#111827" : "#6B7280" }}>{o.label}</Typography>}
                sx={{ m: 0, mr: 1 }}
            />
        );
    };

    // Extra permissions — supports flat items [{key,label}] or grouped [{group, items:[...]}]
    const renderExtraOps = (page, cfg) => {
        const extras = extraOps[page] || [];
        if (!extras.length) return null;
        const heading = (page in extraOpsLabels) ? extraOpsLabels[page] : "Additional permissions";
        const hasGroups = extras.some((e) => e.items);
        return (
            <Box sx={{ mt: pageOps(page).length > 0 ? 1.5 : 0 }}>
                {heading && <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, mb: 1 }}>{heading}</Typography>}
                {hasGroups ? (
                    extras.map((e) => {
                        if (!e.items) {
                            return <FormGroup key={e.key} row sx={{ gap: 1, mb: 1.2 }}>{extraCheckbox(page, cfg, e)}</FormGroup>;
                        }
                        // Gated group: a toggle that reveals its child options only when enabled
                        if (e.gate) {
                            const gateOn = !!cfg[e.gate.key];
                            return (
                                <Box key={e.group} sx={{ mb: 1.2 }}>
                                    <FormControlLabel
                                        control={<Checkbox size="small" checked={gateOn} onChange={() => toggleGate(page, e.gate.key, e.items.map((i) => i.key))} sx={{ p: 0.5, color: "#C7CDD6", "&.Mui-checked": { color } }} />}
                                        label={<Typography sx={{ fontSize: 13, fontWeight: 600, color: gateOn ? "#111827" : "#6B7280" }}>{e.gate.label}</Typography>}
                                        sx={{ m: 0 }}
                                    />
                                    {gateOn && (
                                        <Box sx={{ pl: 3.5, mt: 0.3 }}>
                                            {e.group && <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", mb: 0.2 }}>{e.group} for</Typography>}
                                            <FormGroup row sx={{ gap: 1 }}>{e.items.map((o) => extraCheckbox(page, cfg, o))}</FormGroup>
                                        </Box>
                                    )}
                                </Box>
                            );
                        }
                        return (
                            <Box key={e.group} sx={{ mb: 1.2 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", mb: 0.4 }}>{e.group}</Typography>
                                <FormGroup row sx={{ gap: 1 }}>{e.items.map((o) => extraCheckbox(page, cfg, o))}</FormGroup>
                            </Box>
                        );
                    })
                ) : (
                    <FormGroup row sx={{ gap: 1 }}>{extras.map((o) => extraCheckbox(page, cfg, o))}</FormGroup>
                )}
            </Box>
        );
    };

    const viewHint = (cfg, page) => {
        const keys = pageOpsKeys(page);
        const show = pageOps(page).some((o) => isLockable(o.key, keys) && isLocked(cfg, o.key, keys));
        return (
            <Typography sx={{ fontSize: 10.5, color: "#9CA3AF", mt: 1.2, display: "flex", alignItems: "center", gap: 0.4, visibility: show ? "visible" : "hidden" }}>
                <LockOutlinedIcon sx={{ fontSize: 12 }} /> Lower operations are required and stay on while a higher operation is enabled.
            </Typography>
        );
    };

    return (
        <Box sx={{ width: "100%" }}>
            <SnackBar open={snack.open} color={snack.ok} setOpen={(v) => setSnack((s) => ({ ...s, open: v }))} status={snack.ok} message={snack.msg} />

            {/* Header */}
            <Box sx={{
                position: "fixed",
                top: "60px",
                left: isExpanded ? "260px" : "80px",
                right: 0,
                backgroundColor: "#f2f2f2",
                px: 2,
                py: 1,
                borderBottom: "1px solid #ddd",
                borderTop: "1px solid #ddd",
                zIndex: 1200,
                transition: "left 0.3s ease-in-out",
                overflow: 'hidden',
                 display:"flex",
                justifyContent:"space-between"
            }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: 30, height: 30 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: `${color}16`, color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                        {moduleMeta.name?.[0]}
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "19px", lineHeight: 1.1 }}>Configure · {moduleMeta.name}</Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#6B7280" }}>Feature Permissions / {role.name} / {moduleMeta.name}</Typography>
                    </Box>
                </Box>
                <Button onClick={save} startIcon={<SaveOutlinedIcon sx={{ fontSize: 18 }} />} sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, bgcolor: ACCENT, color: "#fff", borderRadius: "8px", height: 38, px: 2, "&:hover": { bgcolor: ACCENT, filter: "brightness(0.92)" } }}>
                    Save Configuration
                </Button>
            </Box>

            <Box sx={{ pb: 2, pt:"70px", px:2 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 1.5, flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: 12.5, color: "#6B7280", flex: 1, minWidth: 240 }}>
                        Pick exactly which pages of <strong>{moduleMeta.name}</strong> the <strong>{role.name}</strong> role can use{approval ? ", the operations they can perform, and the approval flow for each page." : " and the operations they can perform."}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.4, py: 0.6, borderRadius: "10px", border: `1px solid ${ACCENT}33`, bgcolor: `${ACCENT}0A` }}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#3730A3" }}>Allow all features</Typography>
                        <Switch checked={isGlobalAllOn()} onChange={() => setAllPages(!isGlobalAllOn())} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: ACCENT }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: ACCENT } }} />
                    </Box>
                </Box>

                <Grid container spacing={1.5} alignItems="flex-start">
                    {pages.map((page) => {
                        const cfg = config[page];
                        const lines = explain(cfg);

                        return (
                            <Grid key={page} size={{ xs: 12, md: 6 }}>
                                <Accordion disableGutters expanded={!!expandedPages[page]} onChange={(e, isExp) => setExpandedPages((prev) => ({ ...prev, [page]: isExp }))} sx={{ borderRadius: "12px !important", border: "1px solid #ddd", boxShadow: "none", "&:before": { display: "none" }, overflow: "hidden" }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: `${color}12`, "& .MuiAccordionSummary-content": { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, pr: 1 } }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
                                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{page}</Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap" }}>
                                            {pageAllKeys(page).length > 0 && (
                                                <FormControlLabel
                                                    onClick={(e) => e.stopPropagation()}
                                                    control={<Switch size="small" checked={isPageAllOn(page)} onChange={() => setPageAll(page, !isPageAllOn(page))} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: ACCENT }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: ACCENT } }} />}
                                                    label={<Typography sx={{ fontSize: 11, fontWeight: 700, color: "#6B7280" }}>Allow all</Typography>}
                                                    sx={{ m: 0, mr: 0.3 }}
                                                />
                                            )}
                                            {pageAllKeys(page).length > 0 && (() => {
                                                const total = pageAllKeys(page).length;
                                                const on = pageAllKeys(page).filter((k) => cfg[k]).length;
                                                return (
                                                    <Box sx={{ px: 1, height: 20, borderRadius: "10px", display: "flex", alignItems: "center", fontSize: 10.5, fontWeight: 700, bgcolor: on > 0 ? `${color}14` : "#F8FAFC", color: on > 0 ? color : "#9CA3AF", border: `1px solid ${on > 0 ? `${color}33` : "#E5E7EB"}` }}>
                                                        {on}/{total}
                                                    </Box>
                                                );
                                            })()}
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 2 }}>
                                        {pageOps(page).length > 0 && (<>
                                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, mb: 1 }}>Allowed operations</Typography>
                                            {renderOps(page, cfg)}
                                            {viewHint(cfg, page)}
                                        </>)}
                                        {renderExtraOps(page, cfg)}
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Box>
    );
}
