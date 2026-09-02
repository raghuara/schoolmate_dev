import React, { useEffect, useState } from "react";
import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C } from "./complaintsTokens";
import { myWorkDetailFrom, DETAIL_STATUS_TONES } from "./myWorkDetailData";
import { fetchComplaintDetail, detailForScreen } from "./complaintsDetailApi";
import { toneFor } from "./complaintsManagementData";

// One assigned item, opened from the My Work queue. This is the staff view of a
// complaint: everything needed to act on it, plus the status control — it is not
// the admin detail screen (ComplaintDetailPage), which carries reassignment,
// escalation and the full audit trail.
//
// Serves both streams. A parent complaint shows the student and the four-step
// complaint lifecycle; an operations observation shows the location, the shorter
// three-step lifecycle and a "Mark as Completed" shortcut. Everything that
// differs comes from the item's `config` — see VARIANTS in myWorkDetailData.
//
// The comp shares the queue's palette: #E2E8F0 hairlines (C.inputBorder) and
// #F1F5F9 dividers (C.divider).

const cardSx = {
    alignSelf: "stretch",
    p: 4,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "16px",
    border: `1px solid ${C.inputBorder}`,
    display: "flex",
    flexDirection: "column",
    gap: 2,
};

// The rail's cards sit at 24px padding rather than the 32px of the main column.
const railCardSx = { ...cardSx, p: 3 };

/* Card heading — 16/700 uppercase in this comp. */
const CardTitle = ({ children, color = C.text, fontSize = "16px" }) => (
    <Typography sx={{ fontSize, fontWeight: 700, color, textTransform: "uppercase" }}>
        {children}
    </Typography>
);

// The rail marks a value red when it is a risk, amber when it is the deadline.
const TONE_COLORS = { red: C.red, amber: "#F59E0B" };

/* "Priority          High Priority" — label left, value right. */
const MetaRow = ({ label, value, valueColor = C.text }) => (
    <Box
        sx={{
            alignSelf: "stretch",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
        }}
    >
        <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>{label}</Typography>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: valueColor }}>{value}</Typography>
    </Box>
);

export default function MyWorkDetailPage() {
    const navigate = useNavigate();
    const { itemId } = useParams();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const token = decodeURIComponent(itemId || "");

    /* The queue and the detail come from different places: there is no My Work detail
       endpoint, so this reads the ordinary complaint record and lays it out for this
       screen. It used to look the row up in a bundled queue, which meant a real token
       found nothing and the screen bounced back to the list. */
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchComplaintDetail({ complaintToken: token }).then((result) => {
            if (cancelled) return;
            if (result.ok) {
                setError("");
                setItem(myWorkDetailFrom(detailForScreen(result), token));
            } else {
                setError(result.message || `${token} could not be loaded.`);
            }
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [token]);

    // Hooks must run before the early return below, so the fallbacks stand in
    // while `item` is missing.
    const [status, setStatus] = useState(item?.currentStatus || "");
    const [note, setNote] = useState("");

    // No endpoint yet — wire these to the status-update API when it lands.
    const submitUpdate = (nextStatus = status) => {
        console.log("Status update:", { id: item?.id, status: nextStatus, note });
        setStatus(nextStatus);
        setNote("");
    };

    if (loading || !item) {
        return (
            <Box sx={{ p: "40px" }}>
                <Typography sx={{ fontSize: "13px", color: error ? C.red : C.textMuted }}>
                    {error || "Loading…"}
                </Typography>
            </Box>
        );
    }

    const statusTone = toneFor(DETAIL_STATUS_TONES, item.status) || { bg: C.divider, color: C.textMuted };
    const { backLabel, subjectTitle, notesTitle, statuses, completeAction, listStyle } = item.config;

    return (
        <Box sx={{ p: "40px", display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Back */}
            <Box
                onClick={() => navigate("/dashboardmenu/complaints/my-work")}
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.5,
                    alignSelf: "flex-start",
                    cursor: "pointer",
                    "&:hover .backLabel": { textDecoration: "underline" },
                }}
            >
                <ArrowBackIcon sx={{ fontSize: "16px", color: C.textMuted }} />
                <Typography
                    className="backLabel"
                    sx={{ fontSize: "14px", fontWeight: 500, color: C.textMuted }}
                >
                    {backLabel}
                </Typography>
            </Box>

            {/* Detail column + action rail. The rail drops under the detail once
                there is no room for a 400px column beside it. */}
            <Box
                sx={{
                    alignSelf: "stretch",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 4,
                    flexWrap: { xs: "wrap", lg: "nowrap" },
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        minWidth: { xs: "100%", lg: 320 },
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                    }}
                >
                    {/* Header */}
                    <Box sx={cardSx}>
                        <Box
                            sx={{
                                alignSelf: "stretch",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: C.textMuted }}>
                                {item.ref}
                            </Typography>
                            <Box
                                sx={{
                                    px: "10px",
                                    py: "4px",
                                    bgcolor: statusTone.bg,
                                    borderRadius: "6px",
                                    flexShrink: 0,
                                }}
                            >
                                <Typography
                                    sx={{ fontSize: "11px", fontWeight: 600, color: statusTone.color }}
                                >
                                    {item.status}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ borderColor: C.divider }} />

                        <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    color: "#F59E0B",
                                    textTransform: "uppercase",
                                }}
                            >
                                {item.category}
                            </Typography>
                            <Typography sx={{ fontSize: "24px", fontWeight: 700, color: C.text }}>
                                {item.title}
                            </Typography>
                        </Box>

                        <Typography
                            sx={{ fontSize: "15px", fontWeight: 400, color: C.textMuted, lineHeight: "22px" }}
                        >
                            {item.description}
                        </Typography>
                    </Box>

                    {/* Student */}
                    <Box sx={cardSx}>
                        <CardTitle>{subjectTitle}</CardTitle>

                        <Box sx={{ alignSelf: "stretch", display: "flex", alignItems: "center", gap: 2 }}>
                            {item.subject.kind === "location" ? (
                                <Box
                                    sx={{
                                        p: 1.5,
                                        flexShrink: 0,
                                        boxSizing: "border-box",
                                        bgcolor: "#FEF3C7",
                                        borderRadius: "8px",
                                        display: "flex",
                                    }}
                                >
                                    <PlaceOutlinedIcon sx={{ fontSize: "20px", color: "#F59E0B" }} />
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        flexShrink: 0,
                                        bgcolor: C.inputBorder,
                                        borderRadius: "24px",
                                    }}
                                />
                            )}
                            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                                <Typography sx={{ fontSize: "16px", fontWeight: 600, color: C.text }}>
                                    {item.subject.name}
                                </Typography>
                                <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                                    {item.subject.meta}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ borderColor: C.divider }} />

                        <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <Typography
                                sx={{
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    color: C.textFaint,
                                    textTransform: "uppercase",
                                }}
                            >
                                {item.subject.contactLabel}
                            </Typography>
                            <Typography sx={{ fontSize: "14px", fontWeight: 500, color: C.text }}>
                                {item.subject.contact}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Attachments */}
                    <Box sx={cardSx}>
                        <CardTitle>Attachments</CardTitle>

                        {item.attachments.length === 0 ? (
                            <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textFaint }}>
                                No attachments on this complaint.
                            </Typography>
                        ) : (
                            item.attachments.map((file) => (
                                <Box
                                    key={file.name}
                                    sx={{
                                        alignSelf: "stretch",
                                        px: 2,
                                        py: 1.5,
                                        boxSizing: "border-box",
                                        bgcolor: "#F8FAFC",
                                        borderRadius: "8px",
                                        border: `1px solid ${C.inputBorder}`,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                    }}
                                >
                                    <InsertDriveFileOutlinedIcon
                                        sx={{ fontSize: "16px", color: C.textMuted, flexShrink: 0 }}
                                    />
                                    <Typography
                                        sx={{
                                            flex: 1,
                                            minWidth: 0,
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            color: C.text,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {file.name}
                                    </Typography>
                                    <Typography
                                        sx={{ fontSize: "12px", fontWeight: 400, color: C.textMuted, flexShrink: 0 }}
                                    >
                                        {file.size}
                                    </Typography>
                                </Box>
                            ))
                        )}
                    </Box>

                    {/* Internal notes */}
                    <Box sx={cardSx}>
                        <CardTitle>{notesTitle}</CardTitle>

                        {item.notes.length === 0 ? (
                            <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textFaint }}>
                                No internal notes yet.
                            </Typography>
                        ) : (
                            item.notes.map((entry, i) => (
                                <Box
                                    key={`${entry.author}-${i}`}
                                    sx={{
                                        alignSelf: "stretch",
                                        p: 2,
                                        boxSizing: "border-box",
                                        bgcolor: "#DBEAFE",
                                        borderRadius: "12px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1.5,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            alignSelf: "stretch",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: 2,
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: C.blue }}>
                                            {entry.author}
                                        </Typography>
                                        <Typography
                                            sx={{ fontSize: "11px", fontWeight: 400, color: C.textMuted, flexShrink: 0 }}
                                        >
                                            {entry.at}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        sx={{ fontSize: "13px", fontWeight: 400, color: C.text, lineHeight: "18px" }}
                                    >
                                        {entry.body}
                                    </Typography>
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>

                {/* Action rail */}
                <Box
                    sx={{
                        width: { xs: "100%", lg: 400 },
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                    }}
                >
                    <Box sx={railCardSx}>
                        <CardTitle color={C.textFaint} fontSize="14px">
                            Timeline &amp; Priority
                        </CardTitle>

                        <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {item.timeline.map((row) => (
                                <MetaRow
                                    key={row.label}
                                    label={row.label}
                                    value={row.value}
                                    valueColor={TONE_COLORS[row.tone] || C.text}
                                />
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ ...railCardSx, gap: 2.5 }}>
                        <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                            Update Action Status
                        </Typography>

                        {/* Status options — a radio list rather than a dropdown, so the
                            whole lifecycle stays visible while choosing. */}
                        <Box
                            sx={{
                                alignSelf: "stretch",
                                boxSizing: "border-box",
                                bgcolor: C.surface,
                                borderRadius: listStyle.radius,
                                border: `1px solid ${C.inputBorder}`,
                                boxShadow: listStyle.shadow,
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {statuses.map((option, i) => {
                                const selected = status === option.key;
                                return (
                                    <React.Fragment key={option.key}>
                                        {i > 0 && <Divider sx={{ borderColor: C.divider }} />}
                                        <Box
                                            onClick={() => setStatus(option.key)}
                                            sx={{
                                                alignSelf: "stretch",
                                                p: listStyle.rowPadding,
                                                boxSizing: "border-box",
                                                bgcolor: selected ? option.tint : "transparent",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.5,
                                                transition: "background-color 0.2s",
                                                "&:hover": { bgcolor: selected ? option.tint : "#F8FAFC" },
                                            }}
                                        >
                                            {/* The complaints comp draws a ring with an
                                                inner dot; the operations one fills the
                                                whole radio. */}
                                            <Box
                                                sx={{
                                                    width: listStyle.radioSize,
                                                    height: listStyle.radioSize,
                                                    flexShrink: 0,
                                                    boxSizing: "border-box",
                                                    borderRadius: "50%",
                                                    bgcolor:
                                                        selected && !listStyle.radioDot
                                                            ? option.color
                                                            : "transparent",
                                                    border: `2px solid ${
                                                        selected ? option.color : listStyle.idleBorder
                                                    }`,
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}
                                            >
                                                {selected && listStyle.radioDot > 0 && (
                                                    <Box
                                                        sx={{
                                                            width: listStyle.radioDot,
                                                            height: listStyle.radioDot,
                                                            bgcolor: option.color,
                                                            borderRadius: "50%",
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                            <Typography
                                                sx={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                    fontSize: "14px",
                                                    fontWeight: selected ? 600 : 500,
                                                    color: selected ? option.color : C.text,
                                                }}
                                            >
                                                {option.label}
                                            </Typography>

                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    flexShrink: 0,
                                                    bgcolor: option.color,
                                                    borderRadius: "50%",
                                                }}
                                            />
                                        </Box>
                                    </React.Fragment>
                                );
                            })}
                        </Box>

                        <TextField
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Write response or operational note here..."
                            fullWidth
                            multiline
                            rows={3}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    boxSizing: "border-box",
                                    bgcolor: "#F8FAFC",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    p: "14px",
                                    "& fieldset": { borderColor: C.inputBorder },
                                    "&:hover fieldset": { borderColor: C.inputBorder },
                                },
                                "& .MuiOutlinedInput-input": { p: 0, color: C.text },
                                "& .MuiOutlinedInput-input::placeholder": { color: C.textFaint, opacity: 1 },
                            }}
                        />

                        <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 1 }}>
                        <Button
                            onClick={() => submitUpdate()}
                            fullWidth
                            sx={{
                                py: 1.5,
                                boxSizing: "border-box",
                                bgcolor: accent,
                                color: C.text,
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: 700,
                                textTransform: "none",
                                "&:hover": { bgcolor: websiteSettings.darkColor },
                            }}
                        >
                            Submit Update
                        </Button>

                        {completeAction && (
                            <Button
                                onClick={() => submitUpdate(completeAction.status)}
                                fullWidth
                                sx={{
                                    py: 1.5,
                                    boxSizing: "border-box",
                                    borderRadius: "8px",
                                    border: `1px solid ${C.inputBorder}`,
                                    color: C.text,
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    "&:hover": { bgcolor: "#F8FAFC", border: `1px solid ${C.inputBorder}` },
                                }}
                            >
                                {completeAction.label}
                            </Button>
                        )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
