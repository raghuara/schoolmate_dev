import React, { useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, CARD_SHADOW } from "./complaintsTokens";
import ComplaintsBreadcrumb from "./ComplaintsBreadcrumb";
import {
    TableChip,
    RowAction,
    tableHeaderCellSx,
    tableHeaderRowSx,
    tableBodyRowSx,
} from "./ComplaintsTableParts";
import {
    CATEGORY_ROWS,
    CATEGORY_COLS,
    PRIORITY_STYLE,
    STATUS_STYLE,
} from "./complaintCategoriesData";
import AddCategoryDrawer from "./AddCategoryDrawer";

// Reached from the "Category Configuration" tile on the Configurations screen.
// The Figma frame includes the global top bar; DashBoardLayout already renders
// that, so this page starts at the breadcrumb.

const COL = CATEGORY_COLS;

export default function ComplaintCategoriesPage() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    // Local only — the enable/disable action has no endpoint yet, so it just
    // flips the row so the screen behaves while the API is built.
    const [rows, setRows] = useState(CATEGORY_ROWS);

    const [addOpen, setAddOpen] = useState(false);

    const toggleStatus = (id) =>
        setRows((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, status: r.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : r,
            ),
        );

    // The drawer's Default Owner list is not in the comp — derive it from the
    // owners already in use rather than inventing one. Swap for the staff API.
    const ownerOptions = useMemo(
        () => [...new Set(rows.map((r) => r.owner).filter(Boolean))].sort(),
        [rows],
    );

    // Local only — appends to component state until the categories API exists.
    const addCategory = (draft) => {
        setRows((prev) => [
            ...prev,
            {
                ...draft,
                id: Math.max(0, ...prev.map((r) => r.id)) + 1,
                priority: (draft.priority || "Normal").toUpperCase(),
            },
        ]);
        setAddOpen(false);
    };

    return (
        <Box sx={{ p: "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Breadcrumb + title, with the primary action on the right */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <ComplaintsBreadcrumb
                        trail={[
                            { label: "Administration" },
                            {
                                label: "Complaint Configuration",
                                onClick: () => navigate("/dashboardmenu/complaints/configuration"),
                            },
                            { label: "Categories" },
                        ]}
                    />
                    <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                        Complaint Categories
                    </Typography>
                </Box>

                <Button
                    onClick={() => setAddOpen(true)}
                    startIcon={<AddOutlinedIcon sx={{ fontSize: "12px" }} />}
                    sx={{
                        height: 36,
                        boxSizing: "border-box",
                        px: "14px",
                        gap: 1,
                        bgcolor: accent,
                        color: "#191C1E",
                        borderRadius: "7px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        "&:hover": { bgcolor: websiteSettings.darkColor },
                    }}
                >
                    Add Category
                </Button>
            </Box>

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
                {/* Fixed column widths would squash on small screens, so the table
                    scrolls inside the card instead of forcing the page sideways. */}
                <Box sx={{ overflowX: "auto" }}>
                    <Box sx={{ minWidth: COL.minWidth }}>
                        <Box sx={{ ...tableHeaderRowSx, gap: COL.gap }}>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.name, flexShrink: 0 }}>
                                Category Name
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, flex: 1, minWidth: 0 }}>
                                Description
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.priority, flexShrink: 0 }}>
                                Default Priority
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.owner, flexShrink: 0 }}>
                                Default Owner
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.status, flexShrink: 0 }}>
                                Status
                            </Typography>
                            <Typography sx={{ ...tableHeaderCellSx, width: COL.actions, flexShrink: 0, textAlign: "right" }}>
                                Actions
                            </Typography>
                        </Box>

                        {rows.map((row) => {
                            const isActive = row.status === "ACTIVE";
                            return (
                                <Box key={row.id} sx={{ ...tableBodyRowSx, gap: COL.gap }}>
                                    <Typography
                                        sx={{ width: COL.name, flexShrink: 0, fontSize: "13px", fontWeight: 600, color: C.text }}
                                    >
                                        {row.name}
                                    </Typography>
                                    <Typography
                                        sx={{ flex: 1, minWidth: 0, fontSize: "13px", fontWeight: 400, color: C.textMuted }}
                                    >
                                        {row.description}
                                    </Typography>
                                    <Box sx={{ width: COL.priority, flexShrink: 0 }}>
                                        <TableChip label={row.priority} palette={PRIORITY_STYLE} width={100} />
                                    </Box>
                                    <Typography
                                        sx={{ width: COL.owner, flexShrink: 0, fontSize: "13px", fontWeight: 400, color: C.text }}
                                    >
                                        {row.owner}
                                    </Typography>
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
                                            label={isActive ? "Disable" : "Enable"}
                                            color={isActive ? C.red : C.green}
                                            onClick={() => toggleStatus(row.id)}
                                        />
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>

            <AddCategoryDrawer
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onSave={addCategory}
                ownerOptions={ownerOptions}
            />
        </Box>
    );
}
