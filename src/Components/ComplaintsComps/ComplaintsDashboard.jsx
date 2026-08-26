import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import { C } from "./complaintsTokens";
import { StatCard, SectionCard, StatRow, SourceRow, SlaRow } from "./ComplaintsCards";
import {
    VOLUME_STATS,
    ATTENTION_STATS,
    BY_CATEGORY,
    BY_CLASS,
    BY_ROLE,
    BY_EMPLOYEE,
    BY_SOURCE,
    SLA_METRICS,
    FREQUENT_COMPLAINTS,
    FREQUENTLY_INVOLVED,
    PARENT_SATISFACTION,
} from "./complaintsMockData";

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
const SatisfactionChart = () => {
    const { headline, slices } = PARENT_SATISFACTION;
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
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <StatRowGrid items={VOLUME_STATS} />
            <StatRowGrid items={ATTENTION_STATS} />

            <Grid container spacing={2}>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Complaints by Category" subtitle="Distribution across complaint categories">
                        {BY_CATEGORY.map((r, i) => (
                            <StatRow key={r.label} {...r} isLast={i === BY_CATEGORY.length - 1} />
                        ))}
                    </SectionCard>
                </Grid>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Complaints by Class" subtitle="Distribution across classes">
                        {BY_CLASS.map((r, i) => (
                            <StatRow key={r.label} {...r} isLast={i === BY_CLASS.length - 1} />
                        ))}
                    </SectionCard>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Complaints by Role" subtitle="Role ownership">
                        {BY_ROLE.map((r, i) => (
                            <StatRow key={r.label} {...r} isLast={i === BY_ROLE.length - 1} />
                        ))}
                    </SectionCard>
                </Grid>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Complaints by Employee" subtitle="Employee ownership">
                        {BY_EMPLOYEE.map((r, i) => (
                            <StatRow key={r.label} {...r} isLast={i === BY_EMPLOYEE.length - 1} />
                        ))}
                    </SectionCard>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Complaints by Source" subtitle="Submission channels">
                        {BY_SOURCE.map((r) => (
                            <SourceRow key={r.label} {...r} />
                        ))}
                    </SectionCard>
                </Grid>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="SLA Performance" subtitle="Response & resolution metrics">
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {SLA_METRICS.map((r) => (
                                <SlaRow key={r.label} {...r} />
                            ))}
                        </Box>
                    </SectionCard>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Frequently Requested Complaints" subtitle="Issues that recur most often">
                        {FREQUENT_COMPLAINTS.map((r, i) => (
                            <StatRow
                                key={r.label}
                                {...r}
                                valueColor={C.textMuted}
                                valueWeight={600}
                                isLast={i === FREQUENT_COMPLAINTS.length - 1}
                            />
                        ))}

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
                        {FREQUENTLY_INVOLVED.map((r, i) => (
                            <StatRow
                                key={r.label}
                                {...r}
                                valueColor={C.textMuted}
                                valueWeight={600}
                                isLast={i === FREQUENTLY_INVOLVED.length - 1}
                            />
                        ))}
                    </SectionCard>
                </Grid>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Parent Satisfaction" subtitle="Visual breakdown">
                        <SatisfactionChart />
                    </SectionCard>
                </Grid>
            </Grid>
        </Box>
    );
}
