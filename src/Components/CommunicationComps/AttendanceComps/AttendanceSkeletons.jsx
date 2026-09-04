import React from "react";
import { Box, Grid, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";

/* Loading states for the attendance screens. Each one keeps the real layout's
   column count and grid sizes so nothing shifts when the data arrives. */

const bar = { bgcolor: DASH.lineSoft };

/* A table with the same number of columns as the one it stands in for. */
export const AttendanceTableSkeleton = ({ columns = 8, rows = 8, height = "56vh" }) => (
    <TableContainer
        sx={{
            border: `1px solid ${DASH.line}`,
            borderRadius: RADIUS,
            bgcolor: "#fff",
            height,
            overflow: "hidden",
        }}
    >
        <Table stickyHeader size="small" sx={{ minWidth: "100%" }}>
            <TableHead>
                <TableRow>
                    {[...Array(columns)].map((_, i) => (
                        <TableCell
                            key={i}
                            sx={{
                                bgcolor: DASH.surface,
                                borderBottom: `1px solid ${DASH.line}`,
                                py: 1.1,
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
                            <TableCell key={c} sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, py: 1.2 }}>
                                <Skeleton variant="rounded" height={11} width={c === 2 ? "80%" : "55%"} sx={{ ...bar, mx: "auto" }} />
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

/* The coloured Present / Absent / Leave / Late / Half Day counters. */
export const StatusChipsSkeleton = ({ count = 5 }) => (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end", mb: 1 }}>
        {[...Array(count)].map((_, i) => (
            <Skeleton key={i} variant="rounded" width={96} height={28} sx={{ ...bar, borderRadius: "20px" }} />
        ))}
    </Box>
);

/* Class cards on the Students Attendance overview - same sizes as the real grid. */
export const ClassCardsSkeleton = ({ count = 8 }) => (
    <Grid container spacing={2}>
        {[...Array(count)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Box
                    sx={{
                        height: 116,
                        p: 1.6,
                        bgcolor: "#fff",
                        border: `1px solid ${DASH.line}`,
                        borderRadius: RADIUS,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Skeleton variant="rounded" width={34} height={34} sx={bar} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Skeleton variant="rounded" height={11} width="55%" sx={bar} />
                            <Skeleton variant="rounded" height={8} width="35%" sx={{ ...bar, mt: 0.6 }} />
                        </Box>
                    </Box>
                    <Skeleton variant="rounded" height={6} sx={{ ...bar, borderRadius: "999px" }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Skeleton variant="rounded" height={9} width="30%" sx={bar} />
                        <Skeleton variant="rounded" height={9} width="20%" sx={bar} />
                    </Box>
                </Box>
            </Grid>
        ))}
    </Grid>
);

/* The two donut charts on the overview. */
export const AttendanceChartsSkeleton = () => (
    <Grid container spacing={2}>
        {[0, 1].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <Box
                    sx={{
                        height: 230,
                        bgcolor: "#fff",
                        border: `1px solid ${DASH.line}`,
                        borderRadius: RADIUS,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Skeleton variant="circular" width={140} height={140} sx={bar} />
                </Box>
            </Grid>
        ))}
    </Grid>
);

/* One section block on Irregular Attendance: a heading plus its table. */
export const IrregularSectionSkeleton = ({ sections = 2, columns = 7 }) => (
    <Box>
        {[...Array(sections)].map((_, i) => (
            <Box key={i} sx={{ mb: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.2 }}>
                    <Skeleton variant="rounded" width={3} height={18} sx={bar} />
                    <Skeleton variant="rounded" width={140} height={11} sx={bar} />
                </Box>
                <AttendanceTableSkeleton columns={columns} rows={4} height="auto" />
            </Box>
        ))}
    </Box>
);
