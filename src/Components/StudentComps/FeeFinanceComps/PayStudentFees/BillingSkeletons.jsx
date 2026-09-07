import React from "react";
import { Box, Grid, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { DASH, RADIUS } from "../../../DashBoardComps/dashboardTheme";

const bar = { bgcolor: DASH.lineSoft };

export const FeeTableSkeleton = ({ columns = 8, rows = 6, height = "auto" }) => (
    <TableContainer
        sx={{
            border: `1px solid ${DASH.line}`,
            borderRadius: "6px",
            borderTopLeftRadius: 0,
            bgcolor: "#fff",
            boxShadow: "none",
            height,
            overflow: "hidden",
        }}
    >
        <Table size="small" sx={{ minWidth: "100%" }}>
            <TableHead>
                <TableRow>
                    {[...Array(columns)].map((_, i) => (
                        <TableCell
                            key={i}
                            sx={{
                                bgcolor: DASH.surface,
                                borderRight: 1,
                                borderColor: DASH.line,
                                py: 1.2,
                            }}
                        >
                            <Skeleton variant="rounded" height={9} width="70%" sx={{ ...bar, mx: "auto" }} />
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {[...Array(rows)].map((_, r) => (
                    <TableRow key={r}>
                        {[...Array(columns)].map((_, c) => (
                            <TableCell key={c} sx={{ borderRight: 1, borderColor: DASH.line, py: 1.4 }}>
                                <Skeleton variant="rounded" height={11} width={c === 1 ? "82%" : "58%"} sx={{ ...bar, mx: "auto" }} />
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

export const StudentCardSkeleton = () => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 2, md: 3 },
            flexWrap: "wrap",
            bgcolor: "#FFF7FA",
            border: "1px solid #F7C9DA",
            borderLeft: "3px solid #E30053",
            borderRadius: "10px",
            boxShadow: "none",
            px: 2,
            py: 1.6,
            mb: 2,
        }}
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.6, minWidth: 0 }}>
            <Skeleton variant="circular" width={52} height={52} sx={{ bgcolor: "#F7C9DA" }} />
            <Box>
                <Skeleton variant="rounded" width={130} height={15} sx={{ bgcolor: "#F7C9DA" }} />
                <Skeleton variant="rounded" width={78} height={10} sx={{ bgcolor: "#F7C9DA", mt: 0.7 }} />
            </Box>
        </Box>

        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 2, md: 3.5 },
                flexWrap: "wrap",
                pl: { xs: 0, md: 3 },
                borderLeft: { xs: "none", md: "1px solid #F7C9DA" },
            }}
        >
            {[0, 1, 2].map((i) => (
                <Box key={i} sx={{ minWidth: 62 }}>
                    <Skeleton variant="rounded" width={48} height={8} sx={{ bgcolor: "#F7C9DA" }} />
                    <Skeleton variant="rounded" width={62} height={12} sx={{ bgcolor: "#F7C9DA", mt: 0.6 }} />
                </Box>
            ))}
        </Box>
    </Box>
);

export const FeeBandSkeleton = () => (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, mb: 0 }}>
        <Skeleton variant="rounded" width={110} height={28} sx={{ ...bar, borderRadius: "6px 6px 0 0" }} />
        <Skeleton variant="rounded" width={96} height={22} sx={{ ...bar, borderRadius: "999px", mb: 0.5 }} />
    </Box>
);

export const StudentGridSkeleton = ({ count = 10, columns = 7 }) => (
    <FeeTableSkeleton columns={columns} rows={count} />
);

export const ConcessionFormSkeleton = () => (
    <Box
        sx={{
            border: `1px solid ${DASH.line}`,
            borderRadius: "10px",
            bgcolor: "#fff",
            boxShadow: "none",
            mt: 2,
            mb: 1,
        }}
    >
        <Box
            sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: `1px solid ${DASH.lineSoft}`,
                bgcolor: DASH.surface,
                borderRadius: "10px 10px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Skeleton variant="rounded" width={28} height={28} sx={{ ...bar, borderRadius: RADIUS }} />
                <Skeleton variant="rounded" width={140} height={12} sx={bar} />
            </Box>
            <Skeleton variant="rounded" width={150} height={20} sx={bar} />
        </Box>

        <Grid container spacing={2} sx={{ p: 2 }}>
            {[0, 1, 2].map((i) => (
                <Grid key={i} size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                    <Skeleton variant="rounded" width="55%" height={11} sx={bar} />
                    <Skeleton variant="rounded" height={44} sx={{ ...bar, mt: 1, borderRadius: RADIUS }} />
                </Grid>
            ))}
        </Grid>
    </Box>
);

export const TransactionListSkeleton = ({ rows = 5 }) => (
    <Box>
        {[...Array(rows)].map((_, i) => (
            <Box
                key={i}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 2,
                    py: 1.6,
                    mb: 1.2,
                    bgcolor: "#fff",
                    border: `1px solid ${DASH.line}`,
                    borderRadius: "10px",
                }}
            >
                <Skeleton variant="rounded" width={38} height={38} sx={{ ...bar, borderRadius: RADIUS, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Skeleton variant="rounded" width="32%" height={12} sx={bar} />
                    <Skeleton variant="rounded" width="20%" height={9} sx={{ ...bar, mt: 0.7 }} />
                </Box>
                <Skeleton variant="rounded" width={90} height={22} sx={{ ...bar, borderRadius: "999px", flexShrink: 0 }} />
                <Skeleton variant="rounded" width={72} height={14} sx={{ ...bar, flexShrink: 0 }} />
            </Box>
        ))}
    </Box>
);

export const ActivityCardsSkeleton = ({ count = 8 }) => (
    <Grid container spacing={3} sx={{ px: 3, pt: 3, pb: 3 }} alignItems="stretch">
        {[...Array(count)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 12, md: 6, lg: 3 }} sx={{ display: "flex" }}>
                <Box
                    sx={{
                        width: "100%",
                        minHeight: 400,
                        display: "flex",
                        flexDirection: "column",
                        border: `1px solid ${DASH.line}`,
                        borderRadius: "10px",
                        bgcolor: "#fff",
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: DASH.violetLight,
                            borderBottom: `1px solid ${DASH.line}`,
                            borderLeft: `3px solid ${DASH.violet}`,
                            borderRadius: "10px 10px 0 0",
                            px: 2,
                            py: 1.4,
                        }}
                    >
                        <Skeleton variant="rounded" width="70%" height={12} sx={{ bgcolor: "#DDD6FE" }} />
                    </Box>

                    <Box sx={{ p: 2, flex: 1 }}>
                        <Skeleton variant="rounded" width="45%" height={10} sx={bar} />
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                            {[...Array(8)].map((_, g) => (
                                <Box key={g} sx={{ textAlign: "center" }}>
                                    <Skeleton variant="rounded" width={34} height={8} sx={{ ...bar, mx: "auto" }} />
                                    <Skeleton variant="rounded" width={52} height={24} sx={{ ...bar, mt: 0.6, borderRadius: "50px" }} />
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ p: 2, pt: 0 }}>
                        <Skeleton variant="rounded" height={34} sx={{ ...bar, borderRadius: "999px" }} />
                    </Box>
                </Box>
            </Grid>
        ))}
    </Grid>
);

export const BusRouteCardsSkeleton = ({ count = 6 }) => (
    <Grid container spacing={3}>
        {[...Array(count)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Box
                    sx={{
                        border: `1px solid ${DASH.line}`,
                        borderRadius: "10px",
                        bgcolor: "#fff",
                        overflow: "hidden",
                    }}
                >
                    <Box sx={{ bgcolor: DASH.surface, borderBottom: `1px solid ${DASH.line}`, px: 2, py: 1.6 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
                            <Skeleton variant="rounded" width={38} height={38} sx={{ ...bar, borderRadius: RADIUS }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Skeleton variant="rounded" width="62%" height={12} sx={bar} />
                                <Skeleton variant="rounded" width="40%" height={9} sx={{ ...bar, mt: 0.6 }} />
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ p: 2 }}>
                        {[0, 1, 2].map((r) => (
                            <Box key={r} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.4 }}>
                                <Skeleton variant="rounded" width="42%" height={10} sx={bar} />
                                <Skeleton variant="rounded" width="24%" height={10} sx={bar} />
                            </Box>
                        ))}

                        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                            <Skeleton variant="rounded" height={34} sx={{ ...bar, flex: 1, borderRadius: RADIUS }} />
                            <Skeleton variant="rounded" height={34} sx={{ ...bar, flex: 1, borderRadius: RADIUS }} />
                        </Box>
                    </Box>
                </Box>
            </Grid>
        ))}
    </Grid>
);
