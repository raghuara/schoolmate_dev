import React, { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Grid, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import { C, cardSx, outlineBtnSx, statCardSx } from "./complaintsTokens";
import { actorRollNumber, fetchParentOverview } from "./complaintsParentApi";
import { PARENT_STATUS_TONES, formatOn } from "./parentComplaintsView";

/**
 * The parent's landing screen: five counts and the five most recent complaints.
 *
 * WHOSE COMPLAINTS
 * Keyed on the STUDENT, because a parent login can sit over more than one child and the
 * overview is per child. The roll number comes from the route when one is given
 * (`complaints/parent/:studentId`) and otherwise from the session — a parent signing in as
 * themselves is their own subject, while a staff member opening a child's overview arrives
 * with the roll number in the URL.
 */

/* The server's own five buckets. `actionRequired` and `underReview` are its wording, not a
   generic open/closed split, so they keep their names. */
const statTone = [
    { key: "total", label: "Total complaints", colour: C.text },
    { key: "actionRequired", label: "Action required", colour: C.red },
    { key: "underReview", label: "Under review", colour: C.amber },
    { key: "resolved", label: "Resolved", colour: C.green },
    { key: "closed", label: "Closed", colour: C.textMuted },
];

export default function ParentComplaintsOverviewPage() {
    const navigate = useNavigate();
    const { studentId } = useParams();
    const studentRollNumber = studentId || actorRollNumber();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [counts, setCounts] = useState(null);
    const [cards, setCards] = useState([]);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        const result = await fetchParentOverview({ studentRollNumber });
        if (!result.ok) {
            /* An empty 404 body means the route itself is missing, which is the school's
               problem to raise rather than something the reader can retry away. */
            setError(
                result.routeMissing
                    ? "The complaint overview is not available on the server yet."
                    : result.message || "Could not load the complaint overview.",
            );
            setCounts(null);
            setCards([]);
        } else {
            setCounts(result.counts);
            setCards(result.cards);
        }
        setLoading(false);
    }, [studentRollNumber]);

    useEffect(() => {
        load();
    }, [load]);

    const openList = () =>
        navigate(
            studentId
                ? `/dashboardmenu/complaints/parent/${studentId}/my-complaints`
                : "/dashboardmenu/complaints/parent/my-complaints",
        );

    return (
        <Box sx={{ p: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                    mb: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                        onClick={() => navigate(-1)}
                        sx={{ minWidth: 0, p: 0.5, color: C.text }}
                        aria-label="Back"
                    >
                        <ArrowBackIcon sx={{ fontSize: "20px" }} />
                    </Button>
                    <Box>
                        <Typography sx={{ fontSize: "20px", fontWeight: 600, color: C.text }}>
                            Complaint Overview
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: C.textMuted }}>
                            {studentRollNumber
                                ? `Student roll number ${studentRollNumber}`
                                : "No student selected"}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button sx={outlineBtnSx} onClick={load} disabled={loading}>
                        <RefreshOutlinedIcon sx={{ fontSize: "16px" }} />
                        Refresh
                    </Button>
                    <Button sx={outlineBtnSx} onClick={openList}>
                        View all complaints
                        <ArrowForwardIcon sx={{ fontSize: "16px" }} />
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2, fontSize: "13px", borderRadius: "9px" }}>
                    {error}
                </Alert>
            )}

            {!studentRollNumber && !loading && (
                <Alert severity="info" sx={{ mb: 2, fontSize: "13px", borderRadius: "9px" }}>
                    Open this screen from a student to see their complaints.
                </Alert>
            )}

            <Grid container spacing={2} sx={{ mb: 2 }}>
                {statTone.map((stat) => (
                    <Grid
                        key={stat.key}
                        size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}
                        sx={{ display: "flex" }}
                    >
                        <Box sx={statCardSx}>
                            <Typography sx={{ fontSize: "12px", color: C.textMuted }}>
                                {stat.label}
                            </Typography>
                            <Typography
                                sx={{ fontSize: "24px", fontWeight: 700, color: stat.colour }}
                            >
                                {loading || !counts ? "—" : counts[stat.key]}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            <Box sx={cardSx}>
                <Typography sx={{ fontSize: "16px", fontWeight: 600, color: C.text, mb: 1.5 }}>
                    Recent complaints
                </Typography>

                {loading && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 3 }}>
                        <CircularProgress size={18} sx={{ color: C.textMuted }} />
                        <Typography sx={{ fontSize: "13px", color: C.textMuted }}>
                            Loading complaints…
                        </Typography>
                    </Box>
                )}

                {!loading && cards.length === 0 && !error && (
                    <Typography sx={{ fontSize: "13px", color: C.textMuted, py: 3 }}>
                        No complaints have been raised yet.
                    </Typography>
                )}

                {!loading &&
                    cards.map((card) => {
                        const tone = PARENT_STATUS_TONES[card.displayStatus] || {
                            fg: C.textMuted,
                            bg: C.track,
                        };
                        return (
                            <Box
                                key={card.token}
                                onClick={openList}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 2,
                                    py: 1.5,
                                    borderBottom: `1px solid ${C.divider}`,
                                    cursor: "pointer",
                                    "&:last-of-type": { borderBottom: "none" },
                                    "&:hover": { bgcolor: C.fieldBg },
                                }}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        sx={{
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: C.text,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {card.title || "Untitled complaint"}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: C.textFaint }}>
                                        {card.token}
                                        {card.category ? ` · ${card.category}` : ""} ·{" "}
                                        {formatOn(card.raisedOn)}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
                                >
                                    {card.parentActionType != null && (
                                        <Chip
                                            label="Action needed"
                                            size="small"
                                            sx={{
                                                bgcolor: "rgba(59, 130, 246, 0.10)",
                                                color: C.blue,
                                                fontSize: "11px",
                                                fontWeight: 600,
                                            }}
                                        />
                                    )}
                                    <Chip
                                        label={card.displayStatus || "—"}
                                        size="small"
                                        sx={{
                                            bgcolor: tone.bg,
                                            color: tone.fg,
                                            fontSize: "11px",
                                            fontWeight: 600,
                                        }}
                                    />
                                </Box>
                            </Box>
                        );
                    })}
            </Box>
        </Box>
    );
}
