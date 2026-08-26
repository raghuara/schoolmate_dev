import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { C, cardSx, statCardSx } from "./complaintsTokens";

/* Compact KPI tile — icon chip + period label on one line, big number below. */
export function StatCard({ label, value, icon: Icon, iconColor, iconBg, valueColor }) {
    return (
        <Box sx={statCardSx}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box
                    sx={{
                        width: 28,
                        height: 28,
                        bgcolor: iconBg,
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexShrink: 0,
                    }}
                >
                    <Icon sx={{ fontSize: "16px", color: iconColor }} />
                </Box>
                <Typography sx={{ fontSize: "11px", fontWeight: 600, color: C.textMuted }}>
                    {label}
                </Typography>
            </Box>
            <Typography sx={{ fontSize: "24px", fontWeight: 700, color: valueColor || C.text, lineHeight: 1.2 }}>
                {value}
            </Typography>
        </Box>
    );
}

/* Content card: title + optional subtitle + chevron affordance, then whatever body is passed. */
export function SectionCard({ title, subtitle, onOpen, hideChevron, children }) {
    return (
        <Box sx={cardSx}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                    <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {!hideChevron && (
                    <IconButton size="small" onClick={onOpen} sx={{ p: 0.5, flexShrink: 0 }}>
                        <ChevronRightOutlinedIcon sx={{ fontSize: "16px", color: C.textFaint }} />
                    </IconButton>
                )}
            </Box>
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: "10px" }}>
                {children}
            </Box>
        </Box>
    );
}

/* label ......... value  — with a hairline under every row but the last. */
export function StatRow({ label, caption, value, valueColor, valueWeight = 700, isLast }) {
    return (
        <Box
            sx={{
                py: "10px",
                borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1,
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
                    {label}
                </Typography>
                {caption && (
                    <Typography sx={{ fontSize: "11px", fontWeight: 400, color: C.textMuted }}>
                        {caption}
                    </Typography>
                )}
            </Box>
            <Typography sx={{ fontSize: "13px", fontWeight: valueWeight, color: valueColor || C.text, whiteSpace: "nowrap" }}>
                {value}
            </Typography>
        </Box>
    );
}

/* Slim track used by both "Complaints by Source" and the SLA rows. */
export function ProgressTrack({ pct, color, sx }) {
    return (
        <Box sx={{ height: 8, bgcolor: C.track, borderRadius: "4px", overflow: "hidden", ...sx }}>
            <Box sx={{ width: `${Math.min(Math.max(pct, 0), 100)}%`, height: "100%", bgcolor: color }} />
        </Box>
    );
}

/* label | track | pct% */
export function SourceRow({ label, pct, color }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: C.text, minWidth: 60 }}>
                {label}
            </Typography>
            <ProgressTrack pct={pct} color={color} sx={{ flex: 1, maxWidth: 220 }} />
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: C.text, minWidth: 36, textAlign: "right" }}>
                {pct}%
            </Typography>
        </Box>
    );
}

/* label + tinted badge on top, full-width track underneath. */
export function SlaRow({ label, chip, pct, color }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
                    {label}
                </Typography>
                <Box sx={{ px: "10px", py: "4px", borderRadius: "6px", bgcolor: `${color}1A` }}>
                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color, whiteSpace: "nowrap" }}>
                        {chip}
                    </Typography>
                </Box>
            </Box>
            <ProgressTrack pct={pct} color={color} />
        </Box>
    );
}

/* Tinted pill used for counts — "6 Active", "3x this month", "10 Total". */
export function TintChip({ label, color, rounded }) {
    return (
        <Box
            sx={{
                px: rounded ? "6px" : "8px",
                py: rounded ? "2px" : "4px",
                borderRadius: rounded ? "100px" : "6px",
                bgcolor: `${color}1A`,
                flexShrink: 0,
            }}
        >
            <Typography
                sx={{
                    fontSize: rounded ? "11px" : "12px",
                    fontWeight: rounded ? 600 : 700,
                    color,
                    whiteSpace: "nowrap",
                }}
            >
                {label}
            </Typography>
        </Box>
    );
}

/* Title + count badge on one line, then a short feed of label/caption entries.
   Entries may carry a leading status dot ("Attention Required"). */
export function ListCard({ title, badge, badgeColor, items }) {
    return (
        <Box sx={cardSx}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
                    {title}
                </Typography>
                <TintChip label={badge} color={badgeColor} rounded />
            </Box>

            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                {items.map((item) => (
                    <Box key={item.label} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        {item.dotColor && (
                            <Box
                                sx={{
                                    width: 7,
                                    height: 7,
                                    mt: "5px",
                                    borderRadius: "50%",
                                    bgcolor: item.dotColor,
                                    flexShrink: 0,
                                }}
                            />
                        )}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
                                {item.label}
                            </Typography>
                            <Typography sx={{ fontSize: "11px", fontWeight: 400, color: C.textMuted }}>
                                {item.caption}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

/* label (fixed gutter) | track | count — "Actions by Priority". */
export function MetricBarRow({ label, value, pct, color }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
                sx={{ fontSize: "13px", fontWeight: 500, color: C.text, width: { xs: 70, sm: 100 }, flexShrink: 0 }}
            >
                {label}
            </Typography>
            <ProgressTrack pct={pct} color={color} sx={{ flex: 1 }} />
            <Typography
                sx={{ fontSize: "13px", fontWeight: 700, color: C.text, width: 40, textAlign: "right", flexShrink: 0 }}
            >
                {value}
            </Typography>
        </Box>
    );
}

/* label + caption on the left, tinted chip on the right — staff workloads, repeated issues. */
export function ChipRow({ label, caption, chip, color, divided, isLast }) {
    return (
        <Box
            sx={{
                py: divided ? "10px" : "4px",
                borderBottom: divided && !isLast ? `1px solid ${C.divider}` : "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1,
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: caption ? 600 : 500, color: C.text }}>
                    {label}
                </Typography>
                {caption && (
                    <Typography sx={{ fontSize: "11px", fontWeight: 400, color: C.textMuted }}>
                        {caption}
                    </Typography>
                )}
            </Box>
            <TintChip label={chip} color={color} />
        </Box>
    );
}

/* label/caption left; right side is either value + count pill, or value + mini track. */
export function ComplianceRow({ label, caption, value, valueColor, chip, chipColor, pct, barColor }) {
    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: "11px", fontWeight: 400, color: C.textMuted }}>
                    {caption}
                </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: valueColor || C.text }}>
                    {value}
                </Typography>
                {chip ? (
                    <TintChip label={chip} color={chipColor} rounded />
                ) : (
                    <ProgressTrack
                        pct={pct}
                        color={barColor}
                        sx={{ width: { xs: 80, sm: 120, lg: 140 }, height: 6, borderRadius: "3px" }}
                    />
                )}
            </Box>
        </Box>
    );
}

/* Headline metric card: title/subtitle, big figure + unit, delta line — or a custom body. */
export function MetricCard({ title, subtitle, value, unit, valueColor, delta, deltaColor, children }) {
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

            {children || (
                <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                        <Typography
                            sx={{ fontSize: "32px", fontWeight: 700, color: valueColor || C.text, lineHeight: 1.1 }}
                        >
                            {value}
                        </Typography>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: C.textMuted }}>
                            {unit}
                        </Typography>
                    </Box>
                    {delta && (
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: deltaColor || C.green }}>
                            {delta}
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}

/* Small progress ring. Figma drew a flat disc with the % overlaid — a Recharts donut
   reads the same at that size and actually encodes the value. */
export function DonutGauge({ pct, color, size = 72 }) {
    const data = [
        { name: "done", value: pct, color },
        { name: "rest", value: Math.max(100 - pct, 0), color: C.track },
    ];
    return (
        <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        innerRadius={size * 0.32}
                        outerRadius={size * 0.5}
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                        isAnimationActive={false}
                    >
                        {data.map((d) => (
                            <Cell key={d.name} fill={d.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    pointerEvents: "none",
                }}
            >
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: C.text }}>
                    {pct}%
                </Typography>
            </Box>
        </Box>
    );
}
