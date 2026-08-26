import React from "react";
import { Box, Typography } from "@mui/material";
import CheckOutlinedIcon from "@mui/icons-material/Check";
import { C } from "./complaintsTokens";
import { TIMELINE_STATE } from "./complaintDetailData";

// Shared by the Complaint Details and Action Details screens. Both draw the same
// mechanism — completed / active / pending markers joined by a connector that is
// coloured up to the last completed step — but at slightly different sizes and
// with different treatment of pending rows, hence the props.

function Marker({ state, accent, ring }) {
    if (state === TIMELINE_STATE.DONE) {
        return (
            <Box
                sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: C.green,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <CheckOutlinedIcon sx={{ fontSize: "10px", color: "#fff" }} />
            </Box>
        );
    }
    if (state === TIMELINE_STATE.ACTIVE) {
        return (
            <Box
                sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    // The Action comp lifts the active marker with a white ring
                    // and a soft shadow; the Complaint comp leaves it flat.
                    ...(ring
                        ? {
                              border: "2px solid #fff",
                              boxShadow: "0px 2px 6px rgba(245, 158, 11, 0.25)",
                          }
                        : null),
                }}
            >
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#fff" }} />
            </Box>
        );
    }
    return (
        <Box
            sx={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                bgcolor: C.surface,
                border: `2px solid ${C.textFaint}`,
                boxSizing: "border-box",
                flexShrink: 0,
            }}
        />
    );
}

export default function ComplaintTimeline({
    steps = [],
    accent,
    labelSize = "14px",
    // The Action comp greys pending labels; the Complaint comp keeps them muted.
    pendingLabelColor = C.textMuted,
    pendingLabelWeight = 400,
    // Optional caption under a pending step ("Planned step" / "Final step").
    pendingCaption = null,
    finalCaption = null,
    activeCaptionColor = C.textMuted,
    activeMarkerRing = false,
}) {
    return (
        // Rows carry their own bottom padding rather than a container gap, so the
        // connector can run through that space and join one marker to the next.
        <Box sx={{ alignSelf: "stretch", pl: 0.5, display: "flex", flexDirection: "column" }}>
            {steps.map((step, i) => {
                const active = step.state === TIMELINE_STATE.ACTIVE;
                const pending = step.state === TIMELINE_STATE.PENDING;
                const done = step.state === TIMELINE_STATE.DONE;
                const isLast = i === steps.length - 1;

                const caption = step.at || (pending ? (isLast ? finalCaption : pendingCaption) : null);

                return (
                    <Box
                        key={step.label}
                        sx={{ display: "flex", alignItems: "stretch", gap: 2, pb: isLast ? 0 : 2 }}
                    >
                        <Box
                            sx={{
                                width: 16,
                                flexShrink: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <Marker state={step.state} accent={accent} ring={activeMarkerRing} />
                            {!isLast && (
                                <Box
                                    sx={{
                                        flex: 1,
                                        width: "2px",
                                        minHeight: 12,
                                        mt: "4px",
                                        borderRadius: "1px",
                                        // Green up to the last completed step, muted from
                                        // the active step onward.
                                        bgcolor: done ? C.green : C.border,
                                    }}
                                />
                            )}
                        </Box>

                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                            <Typography
                                sx={{
                                    fontSize: labelSize,
                                    fontWeight: active ? 700 : pending ? pendingLabelWeight : 600,
                                    color: pending ? pendingLabelColor : C.text,
                                }}
                            >
                                {step.label}
                            </Typography>
                            {caption && (
                                <Typography
                                    sx={{
                                        fontSize: "11px",
                                        fontWeight: 400,
                                        color: active ? activeCaptionColor : C.textMuted,
                                    }}
                                >
                                    {caption}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}
