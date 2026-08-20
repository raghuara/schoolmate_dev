import React from "react";
import { Box, Grid, Skeleton, CircularProgress, Typography } from "@mui/material";

/*
   Inner-page loading states.

   The shared <Loader /> is a fixed full-screen overlay, which is right for an
   action the user just triggered (delete, publish) but wrong for a list that is
   simply fetching. Covering the whole app to load one panel hides the header the
   user is still reading, and it cannot stop an empty state painting underneath.

   These render inside the content area instead, holding the shape of what is
   coming so nothing jumps when the data lands.
*/

const SHIMMER = { bgcolor: "#EEF0F3" };

// One placeholder card shaped like the news / message / circular cards.
const CardSkeleton = () => (
    <Box
        sx={{
            border: "1px solid #E6E8EC",
            borderRadius: "12px",
            backgroundColor: "#fff",
            p: 2,
            height: "100%",
            boxSizing: "border-box",
        }}
    >
        <Box sx={{ display: "flex", gap: 0.7, mb: 1.2 }}>
            <Skeleton variant="rounded" width={54} height={20} sx={{ ...SHIMMER, borderRadius: "6px" }} />
            <Skeleton variant="rounded" width={96} height={20} sx={{ ...SHIMMER, borderRadius: "6px" }} />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="text" width="62%" height={24} sx={SHIMMER} />
                <Skeleton variant="text" width="42%" height={16} sx={SHIMMER} />
            </Box>
            <Box sx={{ width: 120, flexShrink: 0 }}>
                <Skeleton variant="text" width="100%" height={14} sx={SHIMMER} />
                <Skeleton variant="text" width="70%" height={14} sx={{ ...SHIMMER, ml: "auto" }} />
            </Box>
        </Box>

        <Skeleton variant="rectangular" height={1} sx={{ ...SHIMMER, my: 1.5 }} />

        <Skeleton variant="text" width="100%" height={14} sx={SHIMMER} />
        <Skeleton variant="text" width="88%" height={14} sx={SHIMMER} />
        <Skeleton variant="text" width="55%" height={14} sx={SHIMMER} />
    </Box>
);

/*
   Skeleton for a grouped card list. `groups` mirrors the "Posted on ..." date
   headings and `perGroup` the cards under each, so the placeholder occupies
   roughly the same space the real list will.
*/
export const ListSkeleton = ({ groups = 2, perGroup = 2, columns = { xs: 12, sm: 12, md: 12, lg: 6 } }) => (
    <Box sx={{ px: 2, pb: 2, pt: 1.5 }} aria-busy="true" aria-label="Loading">
        {Array.from({ length: groups }).map((_, g) => (
            <Box key={g} sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1.5 }}>
                    <Skeleton variant="text" width={165} height={14} sx={SHIMMER} />
                    <Box sx={{ flex: 1, height: "1px", bgcolor: "#EDEFF3" }} />
                </Box>

                <Grid container spacing={2}>
                    {Array.from({ length: perGroup }).map((__, c) => (
                        <Grid key={c} size={columns}>
                            <CardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        ))}
    </Box>
);

/*
   Compact spinner for smaller regions - a dialog body, a panel, a tab that is
   still fetching. Sits in the flow rather than covering the page.
*/
export const InlineLoader = ({ label = "Loading...", minHeight = "40vh" }) => (
    <Box
        sx={{
            minHeight,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.4,
        }}
        aria-busy="true"
    >
        <CircularProgress size={30} thickness={4} sx={{ color: "#E30053" }} />
        {!!label && (
            <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#8A93A0" }}>
                {label}
            </Typography>
        )}
    </Box>
);

export default ListSkeleton;
