import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import { C } from "./complaintsTokens";
import { StatCard, SectionCard, StatRow, SourceRow, SlaRow } from "./ComplaintsCards";
import {
    VOLUME_STAT_DEFS,
    ATTENTION_STAT_DEFS,
    NOT_IN_DASHBOARD_API,
    statsFrom,
    slaMetricsFrom,
} from "./complaintsDashboardData";
import { MODULE } from "./complaintsConfigApi";
import { fetchManagementDashboard } from "./complaintsWorkApi";

// Five tiles per row on desktop — 12 / 5 = 2.4 columns each.
const STAT_SIZE = { xs: 12, sm: 6, md: 4, lg: 2.4 };
const HALF_SIZE = { xs: 12, sm: 12, md: 6, lg: 6 };

const StatRowGrid = ({ items }) => (
    <Grid container spacing={1.5}>
        {items.map((s) => (
            <Grid key={s.label} size={STAT_SIZE} sx={{ display: "flex" }}>
                <StatCard {...s} />
            </Grid>
        ))}
    </Grid>
);

// Donut + legend. Recharts is the chart library this project standardises on.
const SatisfactionChart = ({ slices, headline }) => {
    if (!slices.length) {
        return (
            <Typography sx={{ fontSize: "13px", color: C.textFaint }}>
                No satisfaction responses yet.
            </Typography>
        );
    }
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
            <Box sx={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={slices}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={48}
                            outerRadius={70}
                            paddingAngle={2}
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                            isAnimationActive={false}
                        >
                            {slices.map((s) => (
                                <Cell key={s.name} fill={s.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        pointerEvents: "none",
                    }}
                >
                    <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text, lineHeight: 1.1 }}>
                        {headline}%
                    </Typography>
                    <Typography sx={{ fontSize: "10px", fontWeight: 400, color: C.textMuted }}>
                        Satisfied
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 1.5 }}>
                {slices.map((s) => (
                    <Box key={s.name} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: s.color, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textMuted, flex: 1 }}>
                            {s.name}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: C.text }}>
                            {s.value}%
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default function ComplaintsDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        fetchManagementDashboard({ moduleType: MODULE.parent }).then((result) => {
            if (cancelled) return;
            if (result.ok) setData(result);
            else setError(result.message || "Could not load the dashboard.");
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const counts = data?.counts || null;
    const empty = [];
    /* A card with no rows reads as "nothing happened"; these have nothing to read because
       the endpoint does not report them, which is a different thing and worth saying. */
    const missing = (
        <Typography sx={{ fontSize: "12px", color: C.textFaint }}>{NOT_IN_DASHBOARD_API}</Typography>
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {error && (
                <Box
                    sx={{
                        px: 2,
                        py: 1.25,
                        bgcolor: "#FFFBEB",
                        border: "1px solid #FDE68A",
                        borderRadius: "8px",
                    }}
                >
                    <Typography sx={{ fontSize: "12.5px", color: "#92400E" }}>{error}</Typography>
                </Box>
            )}

            <StatRowGrid items={statsFrom(VOLUME_STAT_DEFS, counts)} />
            <StatRowGrid items={statsFrom(ATTENTION_STAT_DEFS, counts)} />

            <Grid container spacing={2}>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Complaints by Category" subtitle="Distribution across complaint categories">
                        {(data?.byCategory || empty).map((r, i) => (
                            <StatRow key={r.label} {...r} isLast={i === (data?.byCategory || empty).length - 1} />
                        ))}
                        {!loading && !(data?.byCategory || empty).length && missing}
                    </SectionCard>
                </Grid>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Complaints by Class" subtitle="Distribution across classes">
                        {missing}
                    </SectionCard>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Complaints by Role" subtitle="Role ownership">
                        {missing}
                    </SectionCard>
                </Grid>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Complaints by Employee" subtitle="Employee ownership">
                        {(data?.byOwner || empty).map((r, i) => (
                            <StatRow key={r.label} {...r} isLast={i === (data?.byOwner || empty).length - 1} />
                        ))}
                        {!loading && !(data?.byOwner || empty).length && missing}
                    </SectionCard>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Complaints by Source" subtitle="Submission channels">
                        {missing}
                    </SectionCard>
                </Grid>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="SLA Performance" subtitle="Response & resolution metrics">
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {slaMetricsFrom(data?.averages).map((r) => (
                                <SlaRow key={r.label} {...r} />
                            ))}
                        </Box>
                    </SectionCard>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Frequently Requested Complaints" subtitle="Issues that recur most often">
                        {(data?.repeatedIssues || empty).map((r, i) => (
                            <StatRow
                                key={r.label}
                                {...r}
                                valueColor={C.textMuted}
                                valueWeight={600}
                                isLast={i === (data?.repeatedIssues || empty).length - 1}
                            />
                        ))}
                        {!loading && !(data?.repeatedIssues || empty).length && missing}

                        <Typography
                            sx={{
                                mt: 1,
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: "0.5px",
                                color: C.textFaint,
                                textTransform: "uppercase",
                            }}
                        >
                            Frequently Involved
                        </Typography>
                        {missing}
                    </SectionCard>
                </Grid>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Parent Satisfaction" subtitle="Visual breakdown">
                        <SatisfactionChart
                            slices={data?.parentSatisfaction || empty}
                            headline={counts ? counts.total : "—"}
                        />
                    </SectionCard>
                </Grid>
            </Grid>
        </Box>
    );
}
