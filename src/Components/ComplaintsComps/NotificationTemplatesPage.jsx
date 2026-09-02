import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { C, CARD_SHADOW } from "./complaintsTokens";
import ComplaintsBreadcrumb from "./ComplaintsBreadcrumb";
import {
    TableChip,
    RowAction,
    tableHeaderCellSx,
    tableHeaderRowSx,
    tableBodyRowSx,
} from "./ComplaintsTableParts";
// STATUS_STYLE is shared with the Categories table — same ACTIVE/INACTIVE palette.
import { STATUS_STYLE } from "./complaintCategoriesData";
import { TEMPLATE_COLS, CHANNEL_STYLE } from "./notificationTemplatesData";
import EditTemplateDialog from "./EditTemplateDialog";
import {
    MODULE,
    fetchNotificationTemplates,
    saveNotificationTemplate,
    templateRowToApi,
} from "./complaintsConfigApi";

// Reached from the "Notification Template Configuration" tile on the
// Configurations screen.

const COL = TEMPLATE_COLS;

// The Parent and Internal variants are the same screen with different copy and
// rows, so the props below carry the differences and default to the Parent values
// — the Parent route renders it with no props. Same shape as AuditLogPage.
export default function NotificationTemplatesPage({
    // Rendered inside the Configuration Hub: the hub owns the page chrome,
    // so the screen drops its own padding, breadcrumb and title.
    embedded = false,
    crumbLabel = "Complaint Configuration",
    subtitle = "Manage complaint-related notification messages.",
    /* Both streams share these endpoints and are told apart by moduleType. */
    moduleType = MODULE.parent,
}) {
    const navigate = useNavigate();

    /* Empty until the fetch lands. Seeding from the comps' mock made the screen render
       one set of rows and then visibly swap it for the server's — a flash of data that was
       never real. A loading line is honest; wrong content is not. */
    const [rows, setRows] = useState([]);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const result = await fetchNotificationTemplates({ moduleType });
        if (!result.ok) {
            setError(result.message);
            setRows([]);
        } else {
            setError("");
            // Already in table shape — the wrapper normalises once
            setRows(result.rows);
        }
        setLoading(false);
    }, [moduleType]);

    useEffect(() => {
        load();
    }, [load]);

    /* The endpoint saves ONE template, addressed by eventCode — so only the edited row is
       sent, not the whole list. */
    const saveTemplate = async (updated) => {
        const result = await saveNotificationTemplate({
            moduleType,
            template: templateRowToApi(updated),
        });
        if (!result.ok) {
            setError(result.message);
            return;
        }
        setError("");
        setEditing(null);
        load();
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
                            { label: "Notification Templates" },
                        ]}
                    />
                    <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                        Notification Templates
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        {subtitle}
                    </Typography>
                </Box>
            )}

            {/* Table card */}
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
                {/* Fixed columns would squash on small screens, so the table scrolls
                    inside the card rather than pushing the page sideways. */}
                <Box sx={{ overflowX: "auto" }}>
                    <Box sx={{ minWidth: COL.minWidth }}>
                        <Box sx={{ ...tableHeaderRowSx, gap: COL.gap }}>
                            <Typography sx={{ ...tableHeaderCellSx, flex: 1, minWidth: COL.name }}>
                                Template Name
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.channels, flexShrink: 0 }}>
                                Active Channels
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.status, flexShrink: 0 }}>
                                Status
                            </Typography>
                            <Typography
                                sx={{ ...tableHeaderCellSx, width: COL.actions, flexShrink: 0, textAlign: "right" }}
                            >
                                Actions
                            </Typography>
                        </Box>

                        {loading && (
                            <Box sx={{ p: "24px", textAlign: "center" }}>
                                <Typography sx={{ fontSize: "13px", color: C.textMuted }}>
                                    Loading templates…
                                </Typography>
                            </Box>
                        )}
                        {!loading && error && (
                            <Box sx={{ p: "24px", textAlign: "center" }}>
                                <Typography sx={{ fontSize: "13px", color: C.red }}>{error}</Typography>
                            </Box>
                        )}
                        {!loading && rows.map((row) => (
                            <Box key={row.id} sx={{ ...tableBodyRowSx, gap: COL.gap }}>
                                <Typography
                                    sx={{
                                        flex: 1,
                                        minWidth: COL.name,
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: C.text,
                                    }}
                                >
                                    {row.name}
                                </Typography>

                                <Box
                                    sx={{
                                        width: COL.channels,
                                        flexShrink: 0,
                                        display: "flex",
                                        gap: "6px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {row.channels.map((ch) => (
                                        <TableChip key={ch} label={ch} palette={CHANNEL_STYLE} fontSize="10px" />
                                    ))}
                                </Box>

                                <Box sx={{ width: COL.status, flexShrink: 0 }}>
                                    <TableChip label={row.status} palette={STATUS_STYLE} width={80} />
                                </Box>

                                <Box
                                    sx={{
                                        width: COL.actions,
                                        flexShrink: 0,
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 1.5,
                                    }}
                                >
                                    <RowAction
                                        label="Edit Template"
                                        color={C.blue}
                                        onClick={() => setEditing(row)}
                                    />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            <EditTemplateDialog
                open={!!editing}
                template={editing}
                onClose={() => setEditing(null)}
                onSave={saveTemplate}
            />
        </Box>
    );
}
