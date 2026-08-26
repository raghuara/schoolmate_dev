import React from "react";
import { Box, Grid, Skeleton, CircularProgress, Typography, TableRow, TableCell } from "@mui/material";

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

   `columns` must match how that page actually lays its cards out, or the
   loading state promises a shape the data does not arrive in. News, Messages and
   Circulars stack one card per row, which is the default; the timetable screens
   run two across at lg and pass their own.

   `spacing` must match the page's own Grid container for the same reason -
   Messages runs spacing 4 and Consent Forms 3, so the default 2 leaves the
   placeholder cards closer together than the real ones.

   `sx` overrides the outer padding for pages whose list wrapper differs, so the
   cards do not shift when the placeholder is swapped for real data.
*/
export const ListSkeleton = ({ groups = 2, perGroup = 2, columns = { xs: 12, sm: 12, md: 12, lg: 12 }, spacing = 2, sx = {} }) => (
    <Box sx={{ px: 2.2, pb: 2, pt: 0.5, ...sx }} aria-busy="true" aria-label="Loading">
        {Array.from({ length: groups }).map((_, g) => (
            <Box key={g} sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1.5 }}>
                    <Skeleton variant="text" width={165} height={14} sx={SHIMMER} />
                    <Box sx={{ flex: 1, height: "1px", bgcolor: "#EDEFF3" }} />
                </Box>

                <Grid container spacing={spacing}>
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
   Dashboard placeholders.

   A spinner in the middle of a chart panel tells the user nothing about what is
   coming and lets the page height jump when it lands. These hold the real
   shape instead - tile, chart, donut, table row - so the layout is already
   settled by the time the numbers arrive.
*/

// KPI tile: label + icon on one line, then the big value and its note.
export const TileSkeleton = ({ height = 104 }) => (
    <Box
        sx={{
            border: "1px solid #E6E8EC",
            borderRadius: "5px",
            bgcolor: "#fff",
            height,
            boxSizing: "border-box",
            px: 1.8,
            py: 1.4,
        }}
        aria-busy="true"
    >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
            <Skeleton variant="text" width="54%" height={12} sx={SHIMMER} />
            <Skeleton variant="circular" width={30} height={30} sx={SHIMMER} />
        </Box>
        <Skeleton variant="text" width="40%" height={32} sx={{ ...SHIMMER, mt: 0.4 }} />
        <Skeleton variant="text" width="58%" height={12} sx={SHIMMER} />
    </Box>
);

// Module tile: icon + two lines of heading, then a row of small stat cells.
export const ModuleTileSkeleton = ({ cells = 4 }) => (
    <Box
        sx={{
            border: "1px solid #E6E8EC",
            borderRadius: "5px",
            bgcolor: "#fff",
            p: 1.4,
            height: "100%",
            boxSizing: "border-box",
        }}
        aria-busy="true"
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="circular" width={34} height={34} sx={SHIMMER} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="text" width="50%" height={16} sx={SHIMMER} />
                <Skeleton variant="text" width="78%" height={12} sx={SHIMMER} />
            </Box>
            <Skeleton variant="rounded" width={42} height={18} sx={{ ...SHIMMER, borderRadius: "5px" }} />
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${cells}, minmax(0, 1fr))`, gap: 0.6, mt: 1.3 }}>
            {Array.from({ length: cells }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={43} sx={{ ...SHIMMER, borderRadius: "5px" }} />
            ))}
        </Box>
    </Box>
);

/*
   Chart body. Bar heights are derived from the index rather than random so the
   placeholder does not reshuffle on every render.
*/
export const ChartSkeleton = ({ height = 280, bars = 14 }) => (
    <Box sx={{ height, display: "flex", alignItems: "flex-end", gap: 0.9, pb: 2.5, pt: 1 }} aria-busy="true">
        {Array.from({ length: bars }).map((_, i) => (
            <Skeleton
                key={i}
                variant="rounded"
                width="100%"
                height={`${30 + ((i * 29) % 58)}%`}
                sx={{ ...SHIMMER, borderRadius: "4px" }}
            />
        ))}
    </Box>
);

// Donut plus the legend rows that sit under it.
export const DonutSkeleton = ({ size = 148, legendRows = 3 }) => (
    <Box aria-busy="true">
        <Box sx={{ display: "flex", justifyContent: "center", py: 1.4 }}>
            <Skeleton variant="circular" width={size} height={size} sx={SHIMMER} />
        </Box>
        <Box sx={{ mt: 1.2 }}>
            {Array.from({ length: legendRows }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={28} sx={{ ...SHIMMER, borderRadius: "5px", mb: 0.6 }} />
            ))}
        </Box>
    </Box>
);

/*
   Table body rows. Renders <TableRow> directly, so it goes inside <TableBody>
   and keeps the real column widths.
*/
export const TableRowsSkeleton = ({ rows = 6, columns = 7, wideColumn = 2 }) => (
    <>
        {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={r}>
                {Array.from({ length: columns }).map((__, c) => (
                    <TableCell key={c} sx={{ borderBottom: "1px solid #F3F4F6", py: 1.15 }}>
                        <Skeleton
                            variant="text"
                            height={16}
                            width={c === 0 ? 18 : c === wideColumn ? "82%" : "62%"}
                            sx={SHIMMER}
                        />
                    </TableCell>
                ))}
            </TableRow>
        ))}
    </>
);

/*
   Contact card: avatar, name and scope chip, then one row per phone number.
   `lines` should be the typical number of numbers on a card, not the maximum -
   the placeholder wants to sit close to the average height, not the tallest.
*/
export const ContactCardSkeleton = ({ lines = 2, withActions = true }) => (
    <Box
        sx={{
            p: 1.6,
            borderRadius: "5px",
            border: "1px solid #E6E8EC",
            bgcolor: "#fff",
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
        }}
        aria-busy="true"
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
            <Skeleton variant="circular" width={42} height={42} sx={SHIMMER} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="text" width="64%" height={18} sx={SHIMMER} />
                <Skeleton variant="rounded" width={80} height={18} sx={{ ...SHIMMER, borderRadius: "9px", mt: 0.3 }} />
            </Box>
            <Skeleton variant="circular" width={22} height={22} sx={SHIMMER} />
        </Box>

        <Skeleton variant="rectangular" height={1} sx={{ ...SHIMMER, mb: 1.2 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
            {Array.from({ length: lines }).map((_, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <Skeleton variant="circular" width={14} height={14} sx={SHIMMER} />
                    <Skeleton variant="text" width={i === 0 ? "58%" : "46%"} height={15} sx={SHIMMER} />
                </Box>
            ))}
        </Box>

        {withActions && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: "auto", pt: 1.4 }}>
                <Skeleton variant="rounded" width={62} height={27} sx={{ ...SHIMMER, borderRadius: "8px" }} />
                <Skeleton variant="rounded" width={27} height={27} sx={{ ...SHIMMER, borderRadius: "8px" }} />
            </Box>
        )}
    </Box>
);

/*
   Calendar month grid: weekday row then six rows of day circles, matching the
   react-multi-date-picker layout the School Calendar renders.
*/
export const CalendarSkeleton = ({ weeks = 6 }) => (
    <Box
        sx={{
            width: "100%",
            maxWidth: 520,
            bgcolor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            p: 1.8,
            boxSizing: "border-box",
        }}
        aria-busy="true"
    >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Skeleton variant="circular" width={22} height={22} sx={SHIMMER} />
            <Skeleton variant="text" width={130} height={18} sx={SHIMMER} />
            <Skeleton variant="circular" width={22} height={22} sx={SHIMMER} />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 0.8 }}>
            {Array.from({ length: 7 }).map((_, i) => (
                <Box key={i} sx={{ display: "flex", justifyContent: "center" }}>
                    <Skeleton variant="text" width={20} height={12} sx={SHIMMER} />
                </Box>
            ))}
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 0.9, columnGap: 0.5 }}>
            {Array.from({ length: weeks * 7 }).map((_, i) => (
                <Box key={i} sx={{ display: "flex", justifyContent: "center" }}>
                    <Skeleton variant="circular" width={30} height={30} sx={SHIMMER} />
                </Box>
            ))}
        </Box>
    </Box>
);

/*
   School Calendar event card: coloured left rail, a date pill beside the
   headline, description lines, then the action row.
*/
export const EventCardSkeleton = ({ lines = 2 }) => (
    <Box
        sx={{
            bgcolor: "#FAFBFC",
            border: "1px solid #E9ECEF",
            borderLeft: "4px solid #E3E6EA",
            borderRadius: "10px",
            p: 1.5,
            width: "100%",
            boxSizing: "border-box",
        }}
        aria-busy="true"
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
            <Skeleton variant="rounded" width={78} height={20} sx={{ ...SHIMMER, borderRadius: "6px" }} />
            <Skeleton variant="text" width="52%" height={18} sx={SHIMMER} />
        </Box>

        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} variant="text" width={i === lines - 1 ? "64%" : "100%"} height={14} sx={SHIMMER} />
        ))}

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
            <Skeleton variant="rounded" width={92} height={24} sx={{ ...SHIMMER, borderRadius: "20px" }} />
            <Box sx={{ display: "flex", gap: 0.6 }}>
                <Skeleton variant="circular" width={26} height={26} sx={SHIMMER} />
                <Skeleton variant="circular" width={26} height={26} sx={SHIMMER} />
            </Box>
        </Box>
    </Box>
);

/*
   Feedback card: heading on the left with the poster's details right, a rule,
   the question text, then the reply box. Taller than the news card, so it needs
   its own placeholder rather than reusing CardSkeleton.

   `withReply` should track the page's canReply permission - a user who cannot
   reply sees no textarea, and the skeleton must not promise one.
*/
export const FeedbackCardSkeleton = ({ withReply = true }) => (
    <Box aria-busy="true">
        {/* matches the invisible "Today" badge row that always holds space */}
        <Box sx={{ height: 24 }} />
        <Box
            sx={{
                boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.19)",
                borderRadius: "7px",
                backgroundColor: "#fff",
                p: 2,
                mb: 2,
                minHeight: "170px",
                boxSizing: "border-box",
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
                    <Skeleton variant="text" width="58%" height={22} sx={SHIMMER} />
                </Box>
                <Box sx={{ width: 150, flexShrink: 0 }}>
                    <Skeleton variant="text" width="100%" height={13} sx={{ ...SHIMMER, ml: "auto" }} />
                    <Skeleton variant="text" width="72%" height={13} sx={{ ...SHIMMER, ml: "auto" }} />
                    <Skeleton variant="text" width="86%" height={13} sx={{ ...SHIMMER, ml: "auto" }} />
                </Box>
            </Box>

            <Skeleton variant="rectangular" height={1} sx={{ ...SHIMMER, my: 1.4 }} />

            <Box sx={{ px: 2, pt: 1 }}>
                <Skeleton variant="text" width="100%" height={16} sx={SHIMMER} />
                <Skeleton variant="text" width="76%" height={16} sx={SHIMMER} />
            </Box>

            {withReply && (
                <Skeleton
                    variant="rounded"
                    height={132}
                    sx={{ ...SHIMMER, borderRadius: "8px", mt: 1.5 }}
                />
            )}
        </Box>
    </Box>
);

/*
   Grouped feedback list. The real page prints a "Posted on ..." line above each
   day and lays the cards two across at lg with spacing 3 - both mirrored here so
   nothing reflows when the data lands.
*/
export const FeedbackListSkeleton = ({ groups = 1, perGroup = 2, withReply = true }) => (
    <Box aria-busy="true" aria-label="Loading">
        {Array.from({ length: groups }).map((_, g) => (
            <Box key={g} sx={{ mb: 4 }}>
                <Skeleton variant="text" width={185} height={13} sx={{ ...SHIMMER, mb: 1 }} />
                <Grid container spacing={3}>
                    {Array.from({ length: perGroup }).map((__, c) => (
                        <Grid key={c} size={{ xs: 12, sm: 12, lg: 6 }}>
                            <FeedbackCardSkeleton withReply={withReply} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        ))}
    </Box>
);

/*
   Chat conversation rows for the left rail: 40px avatar, name and timestamp on
   one line, message preview and unread badge on the next.
*/
export const ChatListSkeleton = ({ rows = 7 }) => (
    <Box aria-busy="true" aria-label="Loading chats">
        {Array.from({ length: rows }).map((_, i) => (
            <Box
                key={i}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.1,
                    px: 1.5,
                    py: 0.9,
                    borderLeft: "3px solid transparent",
                    borderBottom: "1px solid #f3f3f5",
                }}
            >
                <Skeleton variant="circular" width={40} height={40} sx={{ ...SHIMMER, flexShrink: 0 }} />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                        <Skeleton variant="text" width={`${52 + ((i * 13) % 26)}%`} height={17} sx={SHIMMER} />
                        <Skeleton variant="text" width={34} height={12} sx={{ ...SHIMMER, flexShrink: 0 }} />
                    </Box>
                    <Skeleton variant="text" width={`${60 + ((i * 17) % 30)}%`} height={14} sx={SHIMMER} />
                </Box>
            </Box>
        ))}
    </Box>
);

/*
   Message thread. Bubbles alternate sides and vary in width so the placeholder
   reads as a conversation rather than a stack of identical blocks.
*/
export const ChatThreadSkeleton = ({ bubbles = 7 }) => {
    const WIDTHS = ["46%", "62%", "35%", "54%", "70%", "40%", "58%"];
    return (
        <Box sx={{ px: 2, py: 1.5 }} aria-busy="true" aria-label="Loading messages">
            {Array.from({ length: bubbles }).map((_, i) => {
                const mine = i % 3 === 1;
                return (
                    <Box
                        key={i}
                        sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", mb: 1.2 }}
                    >
                        <Skeleton
                            variant="rounded"
                            width={WIDTHS[i % WIDTHS.length]}
                            height={i % 4 === 0 ? 56 : 38}
                            sx={{
                                ...SHIMMER,
                                borderRadius: mine ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                            }}
                        />
                    </Box>
                );
            })}
        </Box>
    );
};

/*
   Timetable / exam timetable / homework / study material cards. These pages all
   print the "Posted on ..." line inside each card rather than once above the
   group, so ListSkeleton's grouped shape is wrong for them.

   By default this returns bare <Grid> items to drop straight into the page's own
   <Grid container>; pass `standalone` for the two call sites that sit outside one.
   `columns` must be the size the real cards use - the grid view runs three
   across while the list view is full width, and they are different components.
*/
export const PostedCardsSkeleton = ({
    count = 6,
    columns = { xs: 12, sm: 6, md: 4 },
    rows = 3,
    showDate = true,
    standalone = false,
    spacing = 3,
}) => {
    const items = Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={columns}>
            {showDate && (
                <Skeleton variant="text" width={158} height={13} sx={{ ...SHIMMER, mb: 1.6 }} />
            )}
            <Box sx={{ border: "1px solid #E6E8EC", borderRadius: "5px", bgcolor: "#fff", overflow: "hidden" }}>
                {/* the coloured grade/subject tab the real cards carry */}
                <Skeleton variant="rectangular" width={100} height={24} sx={{ ...SHIMMER, borderRadius: "5px 5px 0 0" }} />
                <Box sx={{ p: 1.5 }}>
                    {Array.from({ length: rows }).map((__, r) => (
                        <Box key={r} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.55 }}>
                            <Skeleton variant="text" width={`${40 + ((r * 13) % 24)}%`} height={15} sx={SHIMMER} />
                            <Skeleton variant="text" width="26%" height={15} sx={SHIMMER} />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Grid>
    ));

    return standalone ? <Grid container spacing={spacing}>{items}</Grid> : <>{items}</>;
};

/*
   Quiz card: subject badge, two-line title, meta line, status pill, then the
   three-figure stats strip.
*/
export const QuizCardSkeleton = () => (
    <Box
        sx={{
            height: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "5px",
            overflow: "hidden",
        }}
        aria-busy="true"
    >
        <Box sx={{ p: 2, pb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.4 }}>
                <Skeleton variant="rounded" width={42} height={42} sx={{ ...SHIMMER, borderRadius: "5px", flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Skeleton variant="text" width="92%" height={18} sx={SHIMMER} />
                    <Skeleton variant="text" width="58%" height={18} sx={SHIMMER} />
                    <Skeleton variant="text" width="70%" height={13} sx={{ ...SHIMMER, mt: 0.4 }} />
                </Box>
                <Skeleton variant="circular" width={20} height={20} sx={{ ...SHIMMER, flexShrink: 0 }} />
            </Box>
            <Skeleton variant="rounded" width={78} height={20} sx={{ ...SHIMMER, borderRadius: "5px", mt: 1.4 }} />
        </Box>

        <Box sx={{ mx: 2, mb: 1.6 }}>
            <Skeleton variant="rounded" height={56} sx={{ ...SHIMMER, borderRadius: "5px" }} />
        </Box>
    </Box>
);

// Quiz grid at the page's own { xs: 12, sm: 6, md: 4, lg: 4 } / spacing 2.
export const QuizGridSkeleton = ({ count = 6 }) => (
    <Grid container spacing={2} sx={{ alignItems: "stretch" }} aria-busy="true" aria-label="Loading quizzes">
        {Array.from({ length: count }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                <QuizCardSkeleton />
            </Grid>
        ))}
    </Grid>
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
