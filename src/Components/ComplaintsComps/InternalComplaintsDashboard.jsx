import React from "react";
import { Box, Grid, Typography } from "@mui/material";

import { C, cardSx } from "./complaintsTokens";
import {
    StatCard,
    SectionCard,
    StatRow,
    SlaRow,
    ChipRow,
    ListCard,
    MetricBarRow,
    MetricCard,
    ComplianceRow,
    DonutGauge,
} from "./ComplaintsCards";
import {
    INTERNAL_STATS,
    ACTIONS_BY_CATEGORY,
    ACTIONS_BY_PRIORITY,
    RESOLUTION_TIME,
    ON_TIME_COMPLETION,
    REOPENED_ACTIONS,
    STAFF_ACTIONS,
    COMPLIANCE_OVERVIEW,
    REPEATED_ISSUES,
    FEED_CARDS,
    INTERNAL_SLA_METRICS,
} from "./internalComplaintsMockData";

// Five tiles per row on desktop — 12 / 5 = 2.4 columns each.
const STAT_SIZE = { xs: 12, sm: 6, md: 4, lg: 2.4 };
const HALF_SIZE = { xs: 12, sm: 12, md: 6, lg: 6 };
const THIRD_SIZE = { xs: 12, sm: 12, md: 4, lg: 4 };
const WIDE_SIZE = { xs: 12, sm: 12, md: 7, lg: 7 };
const NARROW_SIZE = { xs: 12, sm: 12, md: 5, lg: 5 };

// Figma sized the priority bars in fixed pixels; scale against the largest count instead
// so the row stays proportional at any container width.
const priorityMax = Math.max(...ACTIONS_BY_PRIORITY.map((p) => p.value), 1);

/* On-Time Completion — headline + caption on the left, gauge on the right. */
const OnTimeCard = () => {
    const { title, subtitle, pct, caption, color } = ON_TIME_COMPLETION;
    return (
        <Box sx={cardSx}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
                    {title}
                </Typography>
                <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textMuted }}>
                    {subtitle}
                </Typography>
            </Box>

            <Box
                sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                    <Typography sx={{ fontSize: "24px", fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
                        {pct}%
                    </Typography>
                    <Typography sx={{ fontSize: "11px", fontWeight: 400, color: C.textMuted }}>
                        {caption}
                    </Typography>
                </Box>
                <DonutGauge pct={pct} color={color} size={72} />
            </Box>
        </Box>
    );
};

export default function InternalComplaintsDashboard() {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* KPI row */}
            <Grid container spacing={1.5}>
                {INTERNAL_STATS.map((s) => (
                    <Grid key={s.label} size={STAT_SIZE} sx={{ display: "flex" }}>
                        <StatCard {...s} />
                    </Grid>
                ))}
            </Grid>

            {/* Category breakdown + priority distribution */}
            <Grid container spacing={2}>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Actions by Category" subtitle="Internal audit and maintenance">
                        {ACTIONS_BY_CATEGORY.map((r, i) => (
                            <StatRow key={r.label} {...r} isLast={i === ACTIONS_BY_CATEGORY.length - 1} />
                        ))}
                    </SectionCard>
                </Grid>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Actions by Priority" subtitle="Urgency distribution" hideChevron>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {ACTIONS_BY_PRIORITY.map((r) => (
                                <MetricBarRow key={r.label} {...r} pct={(r.value / priorityMax) * 100} />
                            ))}
                        </Box>
                    </SectionCard>
                </Grid>
            </Grid>

            {/* Headline performance metrics */}
            <Grid container spacing={2}>
                <Grid size={THIRD_SIZE} sx={{ display: "flex" }}>
                    <MetricCard {...RESOLUTION_TIME} />
                </Grid>
                <Grid size={THIRD_SIZE} sx={{ display: "flex" }}>
                    <OnTimeCard />
                </Grid>
                <Grid size={THIRD_SIZE} sx={{ display: "flex" }}>
                    <MetricCard {...REOPENED_ACTIONS} />
                </Grid>
            </Grid>

            {/* Staff workloads + compliance overview */}
            <Grid container spacing={2}>
                <Grid size={WIDE_SIZE} sx={{ display: "flex" }}>
                    <SectionCard
                        title="Staff-wise Assigned Actions"
                        subtitle="Active workloads assigned to coordinators & leads"
                        hideChevron
                    >
                        {STAFF_ACTIONS.map((r, i) => (
                            <ChipRow key={r.label} {...r} divided isLast={i === STAFF_ACTIONS.length - 1} />
                        ))}
                    </SectionCard>
                </Grid>
                <Grid size={NARROW_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Operational & Compliance Overview" hideChevron>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {COMPLIANCE_OVERVIEW.map((r) => (
                                <ComplianceRow key={r.label} {...r} />
                            ))}
                        </Box>
                    </SectionCard>
                </Grid>
            </Grid>

            {/* Chronic issues + internal SLA */}
            <Grid container spacing={2}>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    <SectionCard title="Repeated Issues" subtitle="Chronic operational bottlenecks" hideChevron>
                        {REPEATED_ISSUES.map((r) => (
                            <ChipRow key={r.label} {...r} />
                        ))}
                    </SectionCard>
                </Grid>
                <Grid size={HALF_SIZE} sx={{ display: "flex" }}>
                    {/* TODO: the Figma export was truncated inside this card — the rows below
                        follow the parent-tab SLA layout with placeholder values. */}
                    <SectionCard
                        title="SLA Performance (Internal)"
                        subtitle="Response & resolution metrics"
                        hideChevron
                    >
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {INTERNAL_SLA_METRICS.map((r) => (
                                <SlaRow key={r.label} {...r} />
                            ))}
                        </Box>
                    </SectionCard>
                </Grid>
            </Grid>

            {/* Suggestions / appreciations / flagged staff */}
            <Grid container spacing={2}>
                {FEED_CARDS.map((card) => (
                    <Grid key={card.title} size={THIRD_SIZE} sx={{ display: "flex" }}>
                        <ListCard {...card} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
