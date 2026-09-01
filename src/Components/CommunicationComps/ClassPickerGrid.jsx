import React from "react";
import { Box, Chip, Divider, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { DASH, RADIUS } from "../DashBoardComps/dashboardTheme";

/* One class picker for every screen that starts with "which class?" - Marks,
   Study Materials and anything added later. The category colour is the only
   thing that changes between them; the card is identical everywhere. */

export const CATEGORY_COLORS = {
    Nursery: { primary: "#A749CC" },
    Primary: { primary: "#F6A059" },
    Secondary: { primary: "#CF02AB" },
    // The grades feed sends this without a space; the academics screens use one.
    HigherSecondary: { primary: "#1F73C2" },
    "Higher Secondary": { primary: "#1F73C2" },
};

export const getCategoryColors = (category) =>
    CATEGORY_COLORS[category] || { primary: DASH.muted };

export const groupByCategory = (grades = []) =>
    grades.reduce((acc, item) => {
        const category = item.category || "Others";
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

const ClassCard = ({ item, primary, icon: Icon }) => (
    <Box
        sx={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            gap: 1.3,
            height: 62,
            pl: 2,
            pr: 1.4,
            bgcolor: `${primary}0D`,
            border: `1px solid ${primary}2E`,
            borderRadius: RADIUS,
            cursor: "pointer",
            userSelect: "none",
            transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
            "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: 3,
                bgcolor: primary,
            },
            "&:hover": {
                transform: "translateY(-2px)",
                bgcolor: `${primary}1A`,
                borderColor: `${primary}66`,
                boxShadow: "0 6px 18px rgba(17,24,39,0.09)",
                ".cpArrow": { opacity: 1, transform: "translateX(2px)" },
            },
            "&:focus-visible": { outline: `2px solid ${primary}`, outlineOffset: 2 },
        }}
    >
        <Box
            sx={{
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: RADIUS,
                bgcolor: "#fff",
                border: `1px solid ${primary}33`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Icon sx={{ fontSize: 18, color: primary }} />
        </Box>

        <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASH.ink, flex: 1, minWidth: 0 }} noWrap>
            {item.sign}
        </Typography>

        <ArrowForwardIcon
            className="cpArrow"
            sx={{
                fontSize: 17,
                color: primary,
                opacity: 0.35,
                flexShrink: 0,
                transition: "opacity .25s ease, transform .25s ease",
            }}
        />
    </Box>
);

export default function ClassPickerGrid({
    grades = [],
    icon,
    sectionSuffix = "",
    // Either hand back a route for the card to link to, or handle the click.
    getLink,
    onSelect,
}) {
    const grouped = groupByCategory(grades);

    return (
        <>
            {Object.entries(grouped).map(([category, items]) => {
                const { primary } = getCategoryColors(category);

                return (
                    <Box key={category} sx={{ mb: 2.5 }}>
                        {/* Category band - the dashboard's SectionTitle language */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, mb: 1.4 }}>
                            <Box sx={{ width: 3, height: 18, borderRadius: RADIUS, bgcolor: primary, flexShrink: 0 }} />
                            <Typography
                                sx={{
                                    fontSize: "11.5px",
                                    fontWeight: 700,
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    color: DASH.muted,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {sectionSuffix ? `${category} ${sectionSuffix}` : category}
                            </Typography>
                            <Chip
                                size="small"
                                label={items.length}
                                sx={{
                                    height: 18,
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    borderRadius: RADIUS,
                                    bgcolor: `${primary}1A`,
                                    color: primary,
                                }}
                            />
                            <Divider sx={{ flex: 1 }} />
                        </Box>

                        <Grid container spacing={1.5}>
                            {items.map((item, index) => {
                                const card = <ClassCard item={item} primary={primary} icon={icon} />;
                                const link = getLink?.(item);

                                return (
                                    <Grid key={item.id ?? index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        {link ? (
                                            <Link
                                                to={link.to}
                                                state={link.state}
                                                style={{ textDecoration: "none", display: "block" }}
                                            >
                                                {card}
                                            </Link>
                                        ) : (
                                            <Box
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => onSelect?.(item)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        e.preventDefault();
                                                        onSelect?.(item);
                                                    }
                                                }}
                                            >
                                                {card}
                                            </Box>
                                        )}
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                );
            })}
        </>
    );
}
