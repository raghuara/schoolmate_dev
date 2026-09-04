import React, { useState, useEffect } from "react";
import {
    Box, Typography, Button, Switch, Chip, Checkbox, FormControlLabel,
    Accordion, AccordionSummary, AccordionDetails, FormControl, Select, MenuItem, Divider, Tooltip, Grid, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import axios from "axios";
import { UpdateUserTypePermissions, GetUserTypePermissions } from "../../../Api/Api";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import SnackBar from "../../SnackBar";
import { DASH, RADIUS, PageHeader } from "../../DashBoardComps/dashboardTheme";

const TOKEN = "123";
const ACCENT = "#4338CA";
const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

export const OPS = [
    { key: "view", label: "View" },
    { key: "create", label: "Create" },
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete" },
];

/* A real checkbox, in a tile that shows its state at a glance. The tick is the
   control people look for; the surround only gives the row edges so a column of
   them scans as a list of choices instead of a ragged line of text.

   No icons: the four core operations and the per-module extras sit side by side
   in the same card, and giving only the four a glyph made them read as a
   different kind of control from the plain ones next to them. */
const PermChip = ({ label, active, disabled, accent, onClick, title }) => {
    const tile = (
        <Box
            sx={{
                borderRadius: RADIUS,
                border: `1px solid ${disabled ? DASH.line : active ? accent : DASH.line}`,
                bgcolor: disabled ? DASH.lineSoft : active ? `${accent}0A` : "#fff",
                transition: "background-color .15s, border-color .15s",
                "&:hover": disabled ? {} : { borderColor: active ? accent : DASH.faint, bgcolor: active ? `${accent}14` : DASH.surface },
            }}
        >
            <FormControlLabel
                disabled={disabled}
                control={
                    <Checkbox
                        size="small"
                        checked={active}
                        disabled={disabled}
                        onChange={onClick}
                        sx={{
                            p: 0.5,
                            color: "#C7CDD6",
                            "&.Mui-checked": { color: accent },
                            "&.Mui-disabled": { color: "#DCE0E6" },
                        }}
                    />
                }
                label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontSize: 12.5,
                                fontWeight: active ? 700 : 600,
                                color: disabled ? "#B6BCC6" : active ? DASH.ink : DASH.text,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {label}
                        </Typography>
                        {disabled && <LockOutlinedIcon sx={{ fontSize: 12, color: "#B6BCC6", flexShrink: 0 }} />}
                    </Box>
                }
                sx={{ m: 0, width: "100%", px: 0.7, py: 0.35, "& .MuiFormControlLabel-label": { minWidth: 0, flex: 1 } }}
            />
        </Box>
    );
    return title
        ? <Tooltip title={title} arrow placement="top"><Box sx={{ minWidth: 0 }}>{tile}</Box></Tooltip>
        : tile;
};

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

export default function ModuleConfigShell({ moduleMeta, pages, opsKeys = ["view", "create", "edit", "delete"], approval = false, validate, extraOps = {}, extraOpsLabels = {}, pageOverrides = {}, pageRequires = {}, approvalText = {}, approvalNoun = "post", preserveSubMenus = [], onSave }) {
    const nounS = approvalNoun;
    const nounP = `${approvalNoun}s`;
    const navigate = useNavigate();
    const location = useLocation();
    const role = location.state?.role || { id: 0, name: "Role" };
    const allRoles = location.state?.roles || [];
    const mainMenuKey = location.state?.mainMenu || moduleMeta.key;
    const color = moduleMeta.color || ACCENT;

    const pageOpsKeys = (page) => pageOverrides[page]?.opsKeys || opsKeys;
    const pageOps = (page) => OPS.filter((o) => pageOpsKeys(page).includes(o.key));
    const pageApproval = (page) => (pageOverrides[page]?.approval ?? approval);

    const roleOptions = (allRoles.length ? allRoles : [{ id: 1, name: "Admin" }, { id: 2, name: "Office Staffs" }, { id: 3, name: "Teachers" }, { id: 4, name: "Parent" }])
        .filter((r) => r.name !== "Student")
        .map((r) => r.name);

    const flatten = (list) => (list || []).flatMap((e) => (e.items ? [...(e.gate ? [e.gate] : []), ...e.items] : [e]));
    const flatExtraOps = (page) => flatten(extraOps[page]);

    /* subMenus of this main menu that another screen owns. Communication and
       Academics are two screens over one `communication` main menu, so each save
       has to carry the other half's stored values back untouched - otherwise a
       backend that replaces a main menu's subMenus instead of merging them would
       silently wipe whichever half was not on screen. Empty for every module
       that owns its whole main menu. */
    const [storedMenu, setStoredMenu] = useState(null);

    const [config, setConfig] = useState(() => Object.fromEntries(pages.map((p) => [p, {
        ...defaultPageConfig(),
        ...Object.fromEntries(flatten(extraOps[p]).map((e) => [e.key, false])),
    }])));

    // Extra permissions refine a page the user can already open, so they only
    // apply once "View" is granted. A page that declares no View operation of
    // its own (Billing, ECA, Additional Fee, Expense) has nothing to gate on,
    // so its extras stay available.
    // Some pages only exist inside another one - Events is a view of the School
    // Calendar, so granting it while the calendar is hidden gives a permission
    // the user can never reach. pageRequires names that dependency.
    const requiredPageFor = (page) => pageRequires[page] || null;
    const pageDependencyMet = (page) => {
        const dep = requiredPageFor(page);
        if (!dep) return true;
        return !!config[dep.page]?.[dep.key];
    };
    const dependentPagesOf = (page, key) =>
        Object.entries(pageRequires)
            .filter(([, dep]) => dep.page === page && dep.key === key)
            .map(([child]) => child);

    const gatesOnView = (page) => pageOpsKeys(page).includes("view");
    const extrasEnabled = (page) => !gatesOnView(page) || !!config[page]?.view;

    // An extra op can also depend on another one on the same page - declared as
    // { key: "allowconcession", requires: "allowbilling" }. Concession is an
    // action taken while billing, so it cannot be granted on its own.
    const requirementMet = (page, o) => !o.requires || !!config[page]?.[o.requires];
    const opEnabled = (page, o) => extrasEnabled(page) && requirementMet(page, o);
    const dependentsOf = (page, key) => flatExtraOps(page).filter((e) => e.requires === key);
    /* Set by every checkbox on this screen, cleared whenever the stored values are
       (re)loaded - which includes the reload that follows a successful save. A
       flag rather than a snapshot diff: toggling something on and back off still
       counts as touched, which is the safer side to err on when the question is
       "are you sure you want to throw this away". */
    const [dirty, setDirty] = useState(false);
    const [leaveOpen, setLeaveOpen] = useState(false);

    const [snack, setSnack] = useState({ open: false, ok: true, msg: "" });
    const showSnack = (msg, ok = true) => setSnack({ open: true, ok, msg });
    const [expandedPages, setExpandedPages] = useState({});
    const [saving, setSaving] = useState(false);

    const setPage = (page, patch) => {
        setDirty(true);
        setConfig((prev) => ({ ...prev, [page]: { ...prev[page], ...patch } }));
    };

    // Operations that sit above this one: Edit is above Create and View,
    // Create is above View. Delete only needs View, so it is not above Create.
    const opsAbove = (page, key) =>
        pageOpsKeys(page).filter((k) => k !== key && (IMPLIES[k] || []).includes(key));

    // Which higher operations are currently forcing this box to stay ticked.
    const includedBy = (page, cfg, key) => opsAbove(page, key).filter((k) => cfg[k]);

    // A page that only exists inside this one cannot stay granted once the
    // operation it hangs off is switched off.
    const clearDependentPages = (page, key) => {
        dependentPagesOf(page, key).forEach((child) => {
            const childKeys = [...pageOpsKeys(child), ...flatExtraOps(child).map((e) => e.key)];
            setPage(child, Object.fromEntries(childKeys.map((k) => [k, false])));
        });
    };

    const toggleOp = (page, key) => {
        const cur = config[page];
        const keys = pageOpsKeys(page);
        const higherOn = includedBy(page, cur, key);

        // Ticking a box that is only on because a higher operation forced it
        // means "reduce access to this level" - the higher ones come off and
        // this one stays. Without this the box would have to be cleared from
        // the top down one at a time to get back to View.
        if (cur[key] && higherOn.length) {
            const next = {};
            higherOn.forEach((k) => {
                next[k] = false;
                dependentsOf(page, k).forEach((e) => { next[e.key] = false; });
            });
            setPage(page, next);
            higherOn.forEach((k) => clearDependentPages(page, k));
            return;
        }

        const next = { [key]: !cur[key] };
        if (!cur[key] && IMPLIES[key]) {
            IMPLIES[key].forEach((k) => { if (keys.includes(k)) next[k] = true; });
        }
        // Clearing View closes the page, so nothing that depends on opening it
        // may stay ticked - neither the operations that imply View nor the
        // extra permissions. Otherwise a contradictory set gets saved.
        if (key === "view" && cur[key]) {
            keys.forEach((k) => { if ((IMPLIES[k] || []).includes("view")) next[k] = false; });
            flatExtraOps(page).forEach((e) => { next[e.key] = false; });
        }
        // Same idea one level down: turning a prerequisite off cannot leave the
        // permissions that depend on it still ticked.
        if (cur[key]) dependentsOf(page, key).forEach((e) => { next[e.key] = false; });
        setPage(page, next);

        if (cur[key]) clearDependentPages(page, key);
    };

    const toggleGate = (page, gateKey, itemKeys) => {
        const turningOff = !!config[page][gateKey];
        const next = { [gateKey]: !config[page][gateKey] };
        if (turningOff) itemKeys.forEach((k) => { next[k] = false; });
        setPage(page, next);
    };

    const isLocked = (cfg, key, keys) =>
        keys.some((k) => k !== key && cfg[k] && (IMPLIES[k] || []).includes(key));
    const isLockable = (key, keys) =>
        keys.some((k) => k !== key && (IMPLIES[k] || []).includes(key));
    const toggleApproval = (page) => setPage(page, { approval: !config[page].approval });
    const toggleSameLevel = (page) => setPage(page, { allowSameLevel: !config[page].allowSameLevel });

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
        setDirty(true);
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

    const yn = (v) => (v ? "Y" : "N");
    const subMenuKey = (page) => pageOverrides[page]?.subMenu || String(page).toLowerCase().replace(/[^a-z0-9]/g, "");
    const buildPermissions = (page) => {
        const c = config[page] || {};
        const keys = [...pageOpsKeys(page), ...flatExtraOps(page).map((e) => e.key)];
        // The UI greys the extras out when View is off; enforce the same rule on
        // the way out, so a record that already had them set cannot be saved back
        // with permissions the role has no page to use them on.
        const byKey = Object.fromEntries(flatExtraOps(page).map((e) => [e.key, e]));
        const allowed = (k) => (byKey[k] ? opEnabled(page, byKey[k]) : true);
        // A page whose parent is off is saved as fully denied, whatever the
        // stored record said, so opening and saving repairs an old one.
        if (!pageDependencyMet(page)) return Object.fromEntries(keys.map((k) => [k, yn(false)]));
        return Object.fromEntries(keys.map((k) => [k, yn(allowed(k) ? c[k] : false)]));
    };

    // Map a fetched GetUserTypePermissions payload onto this module's checkboxes.
    // Same-key mapping: "Y" -> checked, "N" / null / missing -> unchecked.
    const applyData = (data) => {
        const menu = (data?.mainMenus || []).find((m) => m.mainMenu === mainMenuKey);
        setStoredMenu(menu || null);
        setDirty(false);
        if (!menu) return; // nothing saved yet for this module — keep defaults
        setConfig((prev) => {
            const next = { ...prev };
            pages.forEach((page) => {
                const sm = (menu.subMenus || []).find((s) => s.subMenu === subMenuKey(page));
                if (!sm) return;
                const perms = sm.permissions || {};
                const patch = {};
                [...pageOpsKeys(page), ...flatExtraOps(page).map((e) => e.key)].forEach((k) => {
                    patch[k] = perms[k] === "Y";
                });
                next[page] = { ...next[page], ...patch };
            });
            return next;
        });
    };

    const fetchPermissions = async () => {
        if (role?.id == null) return;
        try {
            const res = await axios.post(GetUserTypePermissions, { userTypeID: role.id, userType: role.name }, { headers: { Authorization: `Bearer ${TOKEN}` } });
            applyData(res?.data?.data || null);
        } catch (e) {
            // keep current selections if the refresh fails
        }
    };

    useEffect(() => {
        // Seed instantly from the permissions FeaturePermissionsPage already fetched, then refresh.
        if (location.state?.permissions) applyData(location.state.permissions);
        fetchPermissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Resolves true only when the configuration reached the server, so "Save and
    // leave" can tell the difference between a save and a failed one.
    const save = async () => {
        const err = runValidation();
        if (err) { showSnack(err, false); return false; }

        // Resent verbatim, never rebuilt - this screen has no checkboxes for them.
        const preserved = (preserveSubMenus || [])
            .map((key) => (storedMenu?.subMenus || []).find((sm) => sm.subMenu === key))
            .filter(Boolean)
            .map((sm) => ({ subMenu: sm.subMenu, permissions: { ...(sm.permissions || {}) } }));

        const payload = {
            data: {
                userTypeID: role.id,
                userType: role.name,
                mainMenus: [
                    {
                        mainMenu: mainMenuKey,
                        subMenus: [
                            ...pages.map((page) => ({
                                subMenu: subMenuKey(page),
                                permissions: buildPermissions(page),
                            })),
                            ...preserved,
                        ],
                    },
                ],
            },
        };

        setSaving(true);
        try {
            // If the wrapper page provides its own save handler, delegate the API call to it.
            if (typeof onSave === "function") {
                const res = await onSave(payload, { role, mainMenuKey });
                if (res?.error === true) { showSnack(res?.message || "Could not save the configuration.", false); return false; }
                showSnack(res?.message || `Saved access configuration for ${moduleMeta.name} · ${role.name}.`);
                await fetchPermissions(); // re-fetch so the screen shows the stored values
            } else {
                const res = await axios.put(UpdateUserTypePermissions, payload, { headers: { Authorization: `Bearer ${TOKEN}` } });
                const ok = !res?.data || res.data.error === false || res.status === 200;
                if (!ok) { showSnack(res?.data?.message || "Could not save the configuration.", false); return false; }
                showSnack(res?.data?.message || `Saved access configuration for ${moduleMeta.name} · ${role.name}.`);
                await fetchPermissions(); // re-fetch so the screen shows the stored values
            }
            return true;
        } catch (e) {
            showSnack(e?.response?.data?.message || e?.message || "Failed to save the configuration. Please try again.", false);
            return false;
        } finally {
            setSaving(false);
        }
    };

    /* Leaving with unsaved work ------------------------------------------------
       The back arrow is the one exit this screen owns, so it asks first. A tab
       close or reload is caught by beforeunload, which can only show the
       browser's own wording. Sidebar links are plain <Link>s under a non-data
       router, so useBlocker is not available to intercept them - those still
       leave silently, and would need the router swapped to createBrowserRouter. */
    useEffect(() => {
        if (!dirty) return undefined;
        const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [dirty]);

    const handleBack = () => {
        if (dirty) { setLeaveOpen(true); return; }
        navigate(-1);
    };

    const discardAndLeave = () => {
        setLeaveOpen(false);
        setDirty(false);
        navigate(-1);
    };

    const saveAndLeave = async () => {
        const ok = await save();
        if (!ok) { setLeaveOpen(false); return; } // stay put so the error is readable
        setLeaveOpen(false);
        navigate(-1);
    };

    // Every permission this screen can grant, and how many are currently on.
    const grantTotals = () => {
        let granted = 0;
        let total = 0;
        pages.forEach((page) => {
            const met = pageDependencyMet(page);
            pageAllKeys(page).forEach((key) => {
                total += 1;
                if (met && config[page]?.[key]) granted += 1;
            });
        });
        return { granted, total };
    };

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

    const renderOps = (page, cfg) => (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 1 }}>
            {pageOps(page).map((o) => {
                const depMet = pageDependencyMet(page);
                const active = depMet && cfg[o.key];
                // Only a missing prerequisite page can disable a chip. An operation
                // held on by a higher one stays clickable, and clicking it reduces
                // access to that level.
                const forcedBy = depMet ? includedBy(page, cfg, o.key) : [];
                const labelOf = (k) => OPS.find((x) => x.key === k)?.label || k;
                const hint = forcedBy.length
                    ? `Included by ${forcedBy.map(labelOf).join(" and ")}. Click to reduce access to ${o.label}.`
                    : "";

                return (
                    <PermChip
                        key={o.key}
                        label={o.label}
                        active={active}
                        disabled={!depMet}
                        accent={color}
                        title={hint}
                        onClick={() => toggleOp(page, o.key)}
                    />
                );
            })}
        </Box>
    );

    const extraCheckbox = (page, cfg, o) => {
        const enabled = opEnabled(page, o);
        const active = enabled && !!cfg[o.key];
        // Say which box has to be ticked first, rather than leaving a dead one.
        const blockedBy = !requirementMet(page, o)
            ? (flatExtraOps(page).find((e) => e.key === o.requires)?.label || o.requires)
            : null;
        return (
            <PermChip
                key={o.key}
                label={o.label}
                active={active}
                disabled={!enabled}
                accent={color}
                title={blockedBy ? `Enable "${blockedBy}" first` : ""}
                onClick={() => toggleOp(page, o.key)}
            />
        );
    };

    const renderExtraOps = (page, cfg) => {
        const extras = extraOps[page] || [];
        if (!extras.length) return null;
        const heading = (page in extraOpsLabels) ? extraOpsLabels[page] : "Additional permissions";
        const hasGroups = extras.some((e) => e.items);
        return (
            <Box sx={{ mt: pageOps(page).length > 0 ? 1.5 : 0 }}>
                {heading && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1, flexWrap: "wrap" }}>
                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: DASH.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>{heading}</Typography>
                        {!extrasEnabled(page) && (
                            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.9, py: 0.15, borderRadius: RADIUS, bgcolor: DASH.amberLight, border: "1px solid #FDE68A" }}>
                                <VisibilityOutlinedIcon sx={{ fontSize: 12, color: "#B45309" }} />
                                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#B45309" }}>
                                    Enable View first
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
                {hasGroups ? (
                    extras.map((e) => {
                        if (!e.items) {
                            return <Box key={e.key} sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 1, mb: 1.2 }}>{extraCheckbox(page, cfg, e)}</Box>;
                        }
                        if (e.gate) {
                            const gateOn = !!cfg[e.gate.key];
                            return (
                                <Box key={e.group} sx={{ mb: 1.2 }}>
                                    <PermChip
                                        label={e.gate.label}
                                        active={gateOn}
                                        disabled={!extrasEnabled(page)}
                                        accent={color}
                                        onClick={() => toggleGate(page, e.gate.key, e.items.map((i) => i.key))}
                                    />
                                    {gateOn && (
                                        <Box sx={{ pl: 3.5, mt: 0.3 }}>
                                            {e.group && <Typography sx={{ fontSize: 11, fontWeight: 600, color: DASH.faint, mb: 0.5 }}>{e.group} for</Typography>}
                                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 1 }}>{e.items.map((o) => extraCheckbox(page, cfg, o))}</Box>
                                        </Box>
                                    )}
                                </Box>
                            );
                        }
                        return (
                            <Box key={e.group} sx={{ mb: 1.2 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: DASH.text, mb: 0.6 }}>{e.group}</Typography>
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 1 }}>{e.items.map((o) => extraCheckbox(page, cfg, o))}</Box>
                            </Box>
                        );
                    })
                ) : (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 1 }}>{extras.map((o) => extraCheckbox(page, cfg, o))}</Box>
                )}
            </Box>
        );
    };

    const viewHint = (cfg, page) => {
        const keys = pageOpsKeys(page);
        const show = pageOps(page).some((o) => isLockable(o.key, keys) && isLocked(cfg, o.key, keys));
        return (
            <Typography sx={{ fontSize: 10.5, color: DASH.faint, mt: 1.2, display: "flex", alignItems: "center", gap: 0.4, visibility: show ? "visible" : "hidden" }}>
                <ArrowDownwardIcon sx={{ fontSize: 12 }} /> Each operation includes the ones below it. Tick a lower box to reduce access to that level.
            </Typography>
        );
    };

    const { granted: grantedCount, total: grantTotal } = grantTotals();

    return (
        <Box sx={{ px: { xs: 1.5, md: 3 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100vh", boxSizing: "border-box" }}>
            <SnackBar open={snack.open} color={snack.ok} setOpen={(v) => setSnack((s) => ({ ...s, open: v }))} status={snack.ok} message={snack.msg} />

            {/* The same header Feature Permissions uses, so the two screens read as
                one flow rather than two designs one click apart. */}
            <PageHeader
                title={`Configure · ${moduleMeta.name}`}
                subtitle={`Feature Permissions / ${role.name} / ${moduleMeta.name}`}
                onBack={handleBack}
                right={(
                    <>
                        {grantTotal > 0 && (
                            <Box sx={{
                                display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.8,
                                px: 1.4, height: 34, borderRadius: RADIUS,
                                bgcolor: grantedCount ? `${color}0A` : DASH.lineSoft,
                                border: `1px solid ${grantedCount ? `${color}38` : DASH.line}`,
                            }}>
                                <Typography sx={{ fontSize: 15, fontWeight: 800, color: grantedCount ? color : DASH.faint, lineHeight: 1 }}>
                                    {grantedCount}
                                </Typography>
                                <Typography sx={{ fontSize: 11.5, color: DASH.muted, whiteSpace: "nowrap" }}>
                                    of {grantTotal} permissions on
                                </Typography>
                            </Box>
                        )}
                        {dirty && !saving && (
                            <Chip
                                size="small"
                                label="Unsaved changes"
                                sx={{ height: 22, fontSize: 10.5, fontWeight: 700, borderRadius: RADIUS, bgcolor: DASH.amberLight, color: "#92400E" }}
                            />
                        )}
                        <Button
                            onClick={save}
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveOutlinedIcon sx={{ fontSize: 18 }} />}
                            sx={{
                                textTransform: "none", fontWeight: 700, fontSize: 13,
                                bgcolor: color, color: "#fff", borderRadius: RADIUS, height: 34, px: 2,
                                boxShadow: `0 2px 8px ${color}33`,
                                "&:hover": { bgcolor: color, filter: "brightness(0.92)", boxShadow: `0 4px 12px ${color}40` },
                                "&.Mui-disabled": { bgcolor: DASH.line, color: DASH.faint, boxShadow: "none" },
                            }}
                        >
                            {saving ? "Saving…" : "Save Configuration"}
                        </Button>
                    </>
                )}
            />

            <Box>
                <Box
                    sx={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 1.5, mb: 2, flexWrap: "wrap",
                        bgcolor: "#fff", borderRadius: RADIUS,
                        border: `1px solid ${DASH.line}`, borderLeft: `3px solid ${color}`,
                        px: 1.8, py: 1.3,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2, flex: 1, minWidth: 260 }}>
                        <TuneOutlinedIcon sx={{ fontSize: 17, color, mt: "1px", flexShrink: 0 }} />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.ink, lineHeight: 1.3 }}>
                                What the {role.name} role can do in {moduleMeta.name}
                            </Typography>
                            <Typography sx={{ fontSize: 11.5, color: DASH.muted, mt: 0.2, lineHeight: 1.5 }}>
                                Each operation includes the ones below it — granting Edit also grants Create and View
                                {approval ? ", and the approval flow is set per page." : "."}
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: "flex", alignItems: "center", gap: 0.8, flexShrink: 0,
                            px: 1.4, py: 0.4, borderRadius: RADIUS,
                            border: `1px solid ${isGlobalAllOn() ? color : DASH.line}`,
                            bgcolor: isGlobalAllOn() ? `${color}0A` : "#fff",
                            transition: "background-color .15s, border-color .15s",
                        }}
                    >
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: isGlobalAllOn() ? color : DASH.text }}>
                            Allow all features
                        </Typography>
                        <Switch
                            checked={isGlobalAllOn()}
                            onChange={() => setAllPages(!isGlobalAllOn())}
                            sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": { color },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: color },
                            }}
                        />
                    </Box>
                </Box>

                <Grid container spacing={2} alignItems="flex-start">
                    {pages.map((page) => {
                        const cfg = config[page];
                        const lines = explain(cfg);
                        const pageTotal = pageAllKeys(page).length;
                        const pageOn = pageDependencyMet(page) ? pageAllKeys(page).filter((k) => cfg[k]).length : 0;

                        return (
                            <Grid key={page} size={{ xs: 12, md: 6 }}>
                                <Accordion
                                    disableGutters
                                    expanded={!!expandedPages[page]}
                                    onChange={(e, isExp) => setExpandedPages((prev) => ({ ...prev, [page]: isExp }))}
                                    sx={{
                                        bgcolor: "#fff",
                                        borderRadius: `${RADIUS} !important`,
                                        border: `1px solid ${pageOn > 0 ? `${color}38` : DASH.line}`,
                                        boxShadow: "none",
                                        overflow: "hidden",
                                        transition: "box-shadow .2s ease, border-color .2s ease",
                                        "&:before": { display: "none" },
                                        "&:hover": { boxShadow: "0 4px 16px rgba(17,24,39,0.08)" },
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ fontSize: 20, color: DASH.faint }} />}
                                        sx={{
                                            minHeight: 52,
                                            px: 1.6,
                                            bgcolor: pageOn > 0 ? `${color}08` : "#fff",
                                            borderBottom: expandedPages[page] ? `1px solid ${DASH.lineSoft}` : "none",
                                            "& .MuiAccordionSummary-content": { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, pr: 1, my: 1 },
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                                            <Box sx={{ width: 3, height: 18, borderRadius: RADIUS, bgcolor: pageOn > 0 ? color : DASH.line, flexShrink: 0 }} />
                                            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: DASH.ink, ...oneLine }}>{page}</Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap", flexShrink: 0 }}>
                                            {requiredPageFor(page) && !pageDependencyMet(page) && (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, px: 0.9, height: 21, borderRadius: RADIUS, bgcolor: DASH.amberLight, border: "1px solid #FDE68A" }}>
                                                    <LockOutlinedIcon sx={{ fontSize: 12, color: "#B45309" }} />
                                                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#B45309" }}>
                                                        Needs {requiredPageFor(page).page}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {pageTotal > 0 && (
                                                <Box sx={{
                                                    px: 1, height: 21, borderRadius: RADIUS, display: "flex", alignItems: "center",
                                                    fontSize: 10.5, fontWeight: 700,
                                                    bgcolor: pageOn > 0 ? `${color}14` : DASH.lineSoft,
                                                    color: pageOn > 0 ? color : DASH.faint,
                                                    border: `1px solid ${pageOn > 0 ? `${color}33` : DASH.line}`,
                                                }}>
                                                    {pageOn}/{pageTotal}
                                                </Box>
                                            )}
                                            {pageTotal > 0 && (
                                                <Tooltip arrow title={isPageAllOn(page) ? "Turn every permission off" : "Turn every permission on"}>
                                                    <span onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex" }}>
                                                        <Switch
                                                            size="small"
                                                            disabled={!pageDependencyMet(page)}
                                                            checked={pageDependencyMet(page) && isPageAllOn(page)}
                                                            onChange={() => pageDependencyMet(page) && setPageAll(page, !isPageAllOn(page))}
                                                            sx={{
                                                                "& .MuiSwitch-switchBase.Mui-checked": { color },
                                                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: color },
                                                            }}
                                                        />
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 2 }}>
                                        {requiredPageFor(page) && !pageDependencyMet(page) && (
                                            <Box
                                                sx={{
                                                    display: "flex", alignItems: "flex-start", gap: 0.8,
                                                    bgcolor: DASH.amberLight, border: "1px solid #FDE68A",
                                                    borderRadius: RADIUS, px: 1.2, py: 0.8, mb: 1.4,
                                                }}
                                            >
                                                <LockOutlinedIcon sx={{ fontSize: 14, color: "#B45309", mt: "1px" }} />
                                                <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "#B45309", lineHeight: 1.45 }}>
                                                    {page} sits inside {requiredPageFor(page).page}. Turn on
                                                    {" "}{requiredPageFor(page).key === "view" ? "View" : requiredPageFor(page).key}
                                                    {" "}for {requiredPageFor(page).page} first - without it this page has no way to be opened.
                                                </Typography>
                                            </Box>
                                        )}

                                        {pageOps(page).length > 0 && (<>
                                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: DASH.muted, textTransform: "uppercase", letterSpacing: 0.6, mb: 1 }}>Allowed operations</Typography>
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

            {/* Asked on the way out, never on the way in - the screen stays usable
                and the choice only appears when there is something to lose. */}
            <Dialog
                open={leaveOpen}
                onClose={() => setLeaveOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: "14px", border: "1px solid #E5E7EB" } }}
            >
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.2, pb: 1 }}>
                    <Box
                        sx={{
                            width: 34, height: 34, borderRadius: "10px", flexShrink: 0,
                            bgcolor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <WarningAmberRoundedIcon sx={{ fontSize: 20, color: "#B45309" }} />
                    </Box>
                    <Typography sx={{ fontSize: 16.5, fontWeight: 700, color: "#111827" }}>
                        Discard unsaved changes?
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ pt: 0 }}>
                    <DialogContentText sx={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6 }}>
                        Your changes to <strong>{moduleMeta.name}</strong> for <strong>{role.name}</strong> have
                        not been saved. Leaving now throws them away.
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.4, pt: 0.5, gap: 1, flexWrap: "wrap" }}>
                    <Button
                        onClick={() => setLeaveOpen(false)}
                        sx={{
                            textTransform: "none", fontWeight: 700, fontSize: 12.5, height: 34, px: 2,
                            borderRadius: "8px", color: "#374151", border: "1px solid #D6DAE1",
                            "&:hover": { borderColor: "#9AA3AF", bgcolor: "#FAFAFA" },
                        }}
                    >
                        Keep editing
                    </Button>
                    <Button
                        onClick={discardAndLeave}
                        disabled={saving}
                        sx={{
                            textTransform: "none", fontWeight: 700, fontSize: 12.5, height: 34, px: 2,
                            borderRadius: "8px", color: "#DC2626", border: "1px solid #FECACA",
                            "&:hover": { bgcolor: "#FEF2F2", borderColor: "#DC2626" },
                        }}
                    >
                        Discard
                    </Button>
                    <Button
                        onClick={saveAndLeave}
                        disabled={saving}
                        startIcon={saving
                            ? <CircularProgress size={14} sx={{ color: "#fff" }} />
                            : <SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            textTransform: "none", fontWeight: 700, fontSize: 12.5, height: 34, px: 2,
                            borderRadius: "8px", bgcolor: ACCENT, color: "#fff", boxShadow: "none",
                            "&:hover": { bgcolor: ACCENT, filter: "brightness(0.92)", boxShadow: "none" },
                            "&.Mui-disabled": { bgcolor: "#C7C9D9", color: "#fff" },
                        }}
                    >
                        {saving ? "Saving…" : "Save and leave"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
