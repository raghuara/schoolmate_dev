import React, { useState } from "react";
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
    trail,
    title,
    subtitle,
    initialRows,
    columns,
    categories,
    modeStyles,
    modeChipWidth = 120,
}) {
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    // Who may open and change this mapping comes from the role permissions.
    const { canViewConfig, canEditConfig } = useComplaintsPermissions();

    const [rows, setRows] = useState(initialRows);
    // null = closed, {} = adding, row = editing that row.
    const [editing, setEditing] = useState(null);

    if (!canViewConfig) return <Navigate to="/dashboardmenu/dashboard" replace />;

    // Local only — saves land in component state until the mapping API exists.
    const saveMapping = (mapping) => {
        setRows((prev) =>
            mapping.id
                ? prev.map((r) => (r.id === mapping.id ? mapping : r))
                : [...prev, { ...mapping, id: Math.max(0, ...prev.map((r) => r.id)) + 1 }],
        );
        setEditing(null);
    };

    return (
        <Box sx={{ p: "28px", display: "flex", flexDirection: "column", gap: 3 }}>
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
                <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: 0 }}>
                    <ComplaintsBreadcrumb trail={trail} />

                    <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                        {title}
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        {subtitle}
                    </Typography>
                </Box>

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
                            {rows.map((row) => (
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
