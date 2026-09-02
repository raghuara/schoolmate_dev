import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, CARD_SHADOW } from "./complaintsTokens";
import ComplaintsBreadcrumb from "./ComplaintsBreadcrumb";
import useComplaintsPermissions from "./useComplaintsPermissions";
import AssignmentMappingDrawer from "./AssignmentMappingDrawer";
import { STATUS_STYLES } from "./assignmentMappingData";
import {
    MODE_VALUE,
    assignmentRowForTable,
    createAssignmentMapping,
    fetchAssignmentMappings,
    fetchCategories,
    updateAssignmentMapping,
} from "./complaintsConfigApi";

// Shared by the parent-side and internal (School Operations) mapping screens —
// the comps are the same table with different copy, categories and mode tints.
//
// The Figma frames include the global top bar (Welcome back / search / avatar).
// DashBoardLayout already renders that via DashBoardHeader, so this starts at the
// breadcrumb.

const headCellSx = {
    py: "10px",
    px: "12px",
    bgcolor: "#F8FAFC",
    borderBottom: `1px solid ${C.border}`,
    color: C.textMuted,
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
};

const bodyCellSx = {
    p: "12px",
    borderBottom: `1px solid ${C.border}`,
    fontSize: "13px",
    color: C.text,
};

/* Solid-tint tag used by the Assignment Mode and Status columns. */
const Tag = ({ label, styles, width }) => (
    <Box
        sx={{
            width,
            maxWidth: "100%",
            px: 1,
            py: "4px",
            borderRadius: "4px",
            bgcolor: styles.bg,
            display: "flex",
            justifyContent: "center",
        }}
    >
        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: styles.color, whiteSpace: "nowrap" }}>
            {label}
        </Typography>
    </Box>
);

export default function AssignmentMappingScreen({
    // Rendered inside the Configuration Hub: the hub owns the page chrome,
    // so the screen drops its own padding, breadcrumb and title.
    embedded = false,
    trail,
    title,
    subtitle,
    /* Which stream to configure. Parent and Staff Concern share these endpoints and are
       told apart by moduleType, so this one screen serves both. */
    moduleType,
    columns,
    modeStyles,
    modeChipWidth = 120,
}) {
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    // Who may open and change this mapping comes from the role permissions.
    const { canViewConfig, canEditConfig } = useComplaintsPermissions();

    const [rows, setRows] = useState([]);
    /* The picker shows category names but the API addresses them by id, so the active
       categories are read alongside the mappings to translate one to the other. */
    const [categoryIndex, setCategoryIndex] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // null = closed, {} = adding, row = editing that row.
    const [editing, setEditing] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        const [mappings, cats] = await Promise.all([
            fetchAssignmentMappings({ moduleType }),
            fetchCategories({ moduleType, status: "Active", page: 1, pageSize: 200 }),
        ]);
        if (!mappings.ok) {
            setError(mappings.message);
            setRows([]);
        } else {
            setError("");
            setRows(mappings.rows.map(assignmentRowForTable));
        }
        if (cats.ok) {
            setCategoryIndex(
                cats.rows.reduce((acc, c) => ({ ...acc, [c.name]: c.categoryId }), {}),
            );
        }
        setLoading(false);
    }, [moduleType]);

    useEffect(() => {
        load();
    }, [load]);

    const categories = useMemo(() => Object.keys(categoryIndex).sort(), [categoryIndex]);

    const saveMapping = async (mapping) => {
        const categoryId = mapping.categoryId ?? categoryIndex[mapping.category];
        if (!categoryId) {
            setError("That category no longer exists — reload and try again.");
            return;
        }
        const draft = {
            assignmentMappingId: mapping.assignmentMappingId ?? mapping.id,
            categoryId,
            mode: MODE_VALUE[mapping.mode] || "Manual",
            role: mapping.role || "",
            // Only a manual row names a person; an auto row is resolved at intake
            assignToRollNumber: MODE_VALUE[mapping.mode] === "Auto" ? "" : mapping.owner || "",
            grade: mapping.grade || "",
            section: mapping.section || "",
            department: mapping.department || "",
            priorityOverride: mapping.priorityOverride || "",
            sortOrder: mapping.sortOrder ?? 0,
            isActive: mapping.status !== "Inactive",
        };
        const result = draft.assignmentMappingId
            ? await updateAssignmentMapping(draft)
            : await createAssignmentMapping(draft);
        if (!result.ok) {
            setError(result.message);
            return;
        }
        setEditing(null);
        load();
    };

    if (!canViewConfig) return <Navigate to="/dashboardmenu/dashboard" replace />;

    return (
        <Box sx={{ p: embedded ? 0 : "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Breadcrumb + title + primary action */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                }}
            >
                {!embedded && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: 0 }}>
                        <ComplaintsBreadcrumb trail={trail} />

                        <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                            {title}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                            {subtitle}
                        </Typography>
                    </Box>
                )}

                {canEditConfig && (
                    <Button
                        onClick={() => setEditing({})}
                        startIcon={<AddOutlinedIcon sx={{ fontSize: "12px" }} />}
                        sx={{
                            height: 36,
                            boxSizing: "border-box",
                            px: "14px",
                            gap: 1,
                            bgcolor: accent,
                            color: C.onAccent,
                            borderRadius: "7px",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            textTransform: "none",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            "&:hover": { bgcolor: websiteSettings.darkColor },
                        }}
                    >
                        Add Mapping
                    </Button>
                )}
            </Box>

            {/* Mapping table */}
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
                <TableContainer sx={{ overflowX: "auto" }}>
                    <Table sx={{ minWidth: 1000, borderCollapse: "collapse" }}>
                        <TableHead>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableCell
                                        key={col.key}
                                        align={col.align || "left"}
                                        sx={{ ...headCellSx, width: col.width }}
                                    >
                                        {col.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* Loading, failed and genuinely empty are three different
                                situations — a bare table says nothing about which. */}
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ ...bodyCellSx, textAlign: "center", py: 4, color: C.textMuted }}>
                                        Loading mappings…
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && error && (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ ...bodyCellSx, textAlign: "center", py: 4, color: C.red }}>
                                        {error}
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && !error && rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ ...bodyCellSx, textAlign: "center", py: 4, color: C.textMuted }}>
                                        No assignment mappings yet — use Add Mapping to route a category to a role.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && rows.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell sx={{ ...bodyCellSx, width: 220, fontWeight: 600 }}>
                                        {row.category}
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellSx, width: 140, color: C.textMuted }}>
                                        {row.role}
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellSx, width: 160 }}>
                                        {row.owner}
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellSx, width: 160 }}>
                                        <Tag
                                            label={row.mode}
                                            styles={modeStyles[row.mode] || modeStyles["Auto Assign"]}
                                            width={modeChipWidth}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellSx, width: 100 }}>
                                        <Tag
                                            label={row.status}
                                            styles={STATUS_STYLES[row.status] || STATUS_STYLES.Inactive}
                                            width={80}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...bodyCellSx, width: 100 }}>
                                        {canEditConfig && (
                                            <Typography
                                                component="span"
                                                onClick={() => setEditing(row)}
                                                sx={{
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    color: C.blue,
                                                    cursor: "pointer",
                                                    "&:hover": { textDecoration: "underline" },
                                                }}
                                            >
                                                Edit
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <AssignmentMappingDrawer
                open={!!editing}
                mapping={editing && editing.id ? editing : null}
                categories={categories}
                onClose={() => setEditing(null)}
                onSave={saveMapping}
            />
        </Box>
    );
}
