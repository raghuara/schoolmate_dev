import React from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";

/* The Students Attendance overview while it loads: the graph card, then the
   two half-width cards. Same sizes as the real layout so nothing moves. */

const bar = { bgcolor: DASH.lineSoft };

const Card = ({ children, sx = {} }) => (
    <Box
        sx={{
            backgroundColor: "#fff",
            border: `1px solid ${DASH.line}`,
            borderRadius: RADIUS,
            boxShadow: "0 1px 3px rgba(16,24,40,0.06)",
            boxSizing: "border-box",
            ...sx,
        }}
    >
        {children}
    </Box>
);

const CardHead = ({ right }) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, px: 2, pt: 1.8, pb: 1.2 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
            <Skeleton variant="rounded" width="34%" height={13} sx={bar} />
            <Skeleton variant="rounded" width="52%" height={9} sx={{ ...bar, mt: 0.7 }} />
        </Box>
        {right && <Skeleton variant="rounded" width={140} height={32} sx={bar} />}
    </Box>
);

export default function AttendanceOverviewSkeleton() {
    return (
        <Box aria-busy="true">
            {/* Total Attendance Graph */}
            <Card sx={{ mx: 2 }}>
                <CardHead right />
                <Box sx={{ px: 2, pb: 2, height: 260, display: "flex", alignItems: "flex-end", gap: 1.4 }}>
                    {[48, 72, 35, 88, 60, 94, 42, 68, 55, 80, 38, 74].map((h, i) => (
                        <Skeleton key={i} variant="rounded" height={`${h}%`} sx={{ ...bar, flex: 1, minWidth: 0 }} />
                    ))}
                </Box>
            </Card>

            {/* Irregular attendees + Students Counts */}
            <Grid container spacing={2} sx={{ px: 2, mt: 2, mb: 2, alignItems: "stretch" }}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                    <Card sx={{ height: "100%", minHeight: 320, px: 2, pb: 2 }}>
                        <Box sx={{ pt: 1.8, pb: 1.2 }}>
                            <Skeleton variant="rounded" width="42%" height={13} sx={bar} />
                        </Box>
                        {[0, 1, 2].map((i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    p: 2,
                                    mb: 1.5,
                                    borderRadius: RADIUS,
                                    bgcolor: DASH.surface,
                                }}
                            >
                                <Skeleton variant="rounded" width={5} height={34} sx={bar} />
                                <Skeleton variant="rounded" width="45%" height={12} sx={bar} />
                            </Box>
                        ))}
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                    <Card sx={{ height: "100%", minHeight: 320, px: 2, pb: 2 }}>
                        <Box sx={{ pt: 1.8, pb: 1.2 }}>
                            <Skeleton variant="rounded" width="38%" height={13} sx={bar} />
                        </Box>
                        <Grid container spacing={2}>
                            {[0, 1].map((i) => (
                                <Grid key={i} size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                    <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                                        <Skeleton variant="circular" width={130} height={130} sx={bar} />
                                    </Box>
                                </Grid>
                            ))}
                            <Grid size={12}>
                                <Skeleton variant="rounded" width="60%" height={10} sx={{ ...bar, mx: "auto" }} />
                                <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 1.5 }}>
                                    {[0, 1, 2, 3].map((i) => (
                                        <Skeleton key={i} variant="rounded" width={62} height={14} sx={bar} />
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
