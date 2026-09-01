import React from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import { DASH, RADIUS } from "./dashboardTheme";

/* The master dashboard's first load. Every block mirrors the real grid sizes in
   DashBoardPage so the layout does not jump when the data lands. */

const Surface = ({ height, children, sx = {} }) => (
    <Box
        sx={{
            height,
            bgcolor: "#fff",
            border: `1px solid ${DASH.line}`,
            borderRadius: RADIUS,
            overflow: "hidden",
            ...sx,
        }}
    >
        {children}
    </Box>
);

// Matches SolidStatCard: 100px, a label, a big number, a note.
const KpiSkeleton = () => (
    <Box
        sx={{
            height: 100,
            bgcolor: DASH.surface,
            border: `1px solid ${DASH.line}`,
            borderRadius: "7px",
            p: "11px 14px",
            boxSizing: "border-box",
        }}
    >
        <Skeleton variant="rounded" width="45%" height={9} sx={{ bgcolor: DASH.lineSoft }} />
        <Skeleton variant="rounded" width="35%" height={26} sx={{ bgcolor: DASH.lineSoft, mt: 1 }} />
        <Skeleton variant="rounded" width="65%" height={9} sx={{ bgcolor: DASH.lineSoft, mt: 1.2 }} />
    </Box>
);

// Matches Panel: a titled header rule, then body content.
const PanelSkeleton = ({ height = 260, lines = 4, chart = false }) => (
    <Surface height={height} sx={{ display: "flex", flexDirection: "column" }}>
        <Box
            sx={{
                px: 2,
                py: 1.4,
                borderBottom: `1px solid ${DASH.lineSoft}`,
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                flexShrink: 0,
            }}
        >
            <Skeleton variant="rounded" width={3} height={20} sx={{ bgcolor: DASH.lineSoft }} />
            <Box sx={{ flex: 1 }}>
                <Skeleton variant="rounded" width="38%" height={12} sx={{ bgcolor: DASH.lineSoft }} />
                <Skeleton variant="rounded" width="55%" height={9} sx={{ bgcolor: DASH.lineSoft, mt: 0.6 }} />
            </Box>
        </Box>

        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
            {chart ? (
                <Box sx={{ height: "100%", display: "flex", alignItems: "flex-end", gap: 1.2 }}>
                    {[52, 74, 38, 88, 61, 96, 45, 70].map((h, i) => (
                        <Skeleton
                            key={i}
                            variant="rounded"
                            height={`${h}%`}
                            sx={{ bgcolor: DASH.lineSoft, flex: 1, minWidth: 0 }}
                        />
                    ))}
                </Box>
            ) : (
                [...Array(lines)].map((_, i) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.6 }}>
                        <Skeleton variant="circular" width={26} height={26} sx={{ bgcolor: DASH.lineSoft, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Skeleton variant="rounded" width={`${70 - i * 8}%`} height={10} sx={{ bgcolor: DASH.lineSoft }} />
                            <Skeleton variant="rounded" width={`${45 - i * 5}%`} height={8} sx={{ bgcolor: DASH.lineSoft, mt: 0.6 }} />
                        </Box>
                        <Skeleton variant="rounded" width={38} height={16} sx={{ bgcolor: DASH.lineSoft, flexShrink: 0 }} />
                    </Box>
                ))
            )}
        </Box>
    </Surface>
);

const BandTitle = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.4, mt: 0.5 }}>
        <Skeleton variant="circular" width={18} height={18} sx={{ bgcolor: DASH.lineSoft }} />
        <Skeleton variant="rounded" width={150} height={12} sx={{ bgcolor: DASH.lineSoft }} />
    </Box>
);

export default function MasterDashboardSkeleton() {
    return (
        <Box aria-busy="true">
            {/* Band 1 - KPI strip */}
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                {[0, 1, 2, 3].map((i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <KpiSkeleton />
                    </Grid>
                ))}
            </Grid>

            {/* Band 0 - Needs Attention */}
            <Box sx={{ mb: 2 }}>
                <PanelSkeleton height={170} lines={2} />
            </Box>

            {/* Band 2 - Attendance */}
            <BandTitle />
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                    <PanelSkeleton height={300} chart />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <PanelSkeleton height={300} lines={4} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <PanelSkeleton height={300} lines={4} />
                </Grid>
            </Grid>

            {/* Band 3 - Academics */}
            <BandTitle />
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <PanelSkeleton height={260} lines={3} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <PanelSkeleton height={260} chart />
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 4, lg: 5 }}>
                    <PanelSkeleton height={260} lines={3} />
                </Grid>
            </Grid>

            {/* Band 4 - Fee & Finance */}
            <BandTitle />
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 12, md: 7, lg: 5 }}>
                    <PanelSkeleton height={280} chart />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 5, lg: 3 }}>
                    <PanelSkeleton height={280} lines={3} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 12, lg: 4 }}>
                    <PanelSkeleton height={280} lines={3} />
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <PanelSkeleton height={220} lines={3} />
                </Grid>
            </Grid>

            {/* Band 5 - Staff & Payroll */}
            <BandTitle />
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                {[0, 1, 2].map((i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <PanelSkeleton height={240} lines={3} />
                    </Grid>
                ))}
            </Grid>

            {/* Band 6 - Transport */}
            <BandTitle />
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <PanelSkeleton height={240} lines={3} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 8, lg: 8 }}>
                    <PanelSkeleton height={240} lines={3} />
                </Grid>
            </Grid>

            {/* Band 7 + 8 - Operations and Communication */}
            <BandTitle />
            <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
                {[0, 1, 2, 3].map((i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                        <PanelSkeleton height={230} lines={3} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
