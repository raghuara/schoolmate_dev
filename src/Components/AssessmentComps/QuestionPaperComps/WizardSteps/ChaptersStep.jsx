import React, { useMemo } from "react";
import { Box, Grid, Typography, Button, Checkbox, Slider, LinearProgress, CircularProgress } from "@mui/material";

import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

import { DASH, RADIUS, Panel, EmptyNote } from "../../../DashBoardComps/dashboardTheme";
import { Pill, outlineBtnSx, primaryBtnSx, Banner } from "../questionPaperTheme";

const pageCount = (chapter) => Math.max(0, (Number(chapter.endPage) || 0) - (Number(chapter.startPage) || 0) + 1);

const ChapterRow = ({ chapter, isOn, weight, onToggle, onWeightageChange }) => (
    <Box
        onClick={() => onToggle(chapter.id)}
        sx={{
            display: "flex", alignItems: "flex-start", gap: 1,
            border: `1px solid ${isOn ? DASH.primary : DASH.line}`,
            bgcolor: isOn ? DASH.primaryLight : "#fff",
            borderRadius: RADIUS, p: 1.2, mb: 1, cursor: "pointer",
            transition: "border-color .2s ease, background-color .2s ease",
            "&:hover": { borderColor: DASH.primaryBorder },
        }}
    >
        <Checkbox checked={isOn} size="small" sx={{ p: 0.3, mt: 0.1, "&.Mui-checked": { color: DASH.primary } }} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink }}>
                {chapter.number}. {chapter.title}
            </Typography>
            <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.3 }}>
                p.{chapter.startPage}-{chapter.endPage} - {pageCount(chapter)} pages
            </Typography>

            {isOn && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Typography sx={{ fontSize: "11px", color: DASH.muted, width: 68, flexShrink: 0 }}>Weightage</Typography>
                    <Slider
                        size="small"
                        value={weight}
                        onChange={(e, value) => onWeightageChange(chapter.id, value)}
                        min={0}
                        max={100}
                        sx={{ flex: 1, color: DASH.primary, "& .MuiSlider-thumb": { width: 12, height: 12 } }}
                    />
                    <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.ink, width: 34, textAlign: "right" }}>
                        {weight}%
                    </Typography>
                </Box>
            )}
        </Box>
    </Box>
);

export default function ChaptersStep({
    books,
    loading = false,
    emptyMessage = "",
    gradeLabel,
    subject,
    selectedChapterIds,
    onToggleChapter,
    onSelectBook,
    onClearAll,
    weightage,
    onWeightageChange,
    onBalanceWeightage,
    onReload,
}) {
    const allChapters = useMemo(() => books.flatMap((b) => b.chapters), [books]);
    const selected = allChapters.filter((c) => selectedChapterIds.includes(c.id));
    const weightTotal = selected.reduce((sum, c) => sum + (Number(weightage[c.id]) || 0), 0);
    const balanced = selected.length === 0 || weightTotal === 100;
    const remaining = 100 - weightTotal;
    const portion = [gradeLabel, subject].filter(Boolean).join(" - ");

    if (loading) {
        return (
            <Panel title="Chapters" subtitle="Reading the library" accent={DASH.primary}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, py: 3, justifyContent: "center" }}>
                    <CircularProgress size={20} thickness={4} sx={{ color: DASH.primary }} />
                    <Typography sx={{ fontSize: "13px", color: DASH.muted }}>
                        Looking for confirmed books{portion ? ` for ${portion}` : ""}
                    </Typography>
                </Box>
            </Panel>
        );
    }

    if (!books.length) {
        return (
            <Box sx={{ bgcolor: "#fff", border: `1px dashed ${DASH.line}`, borderRadius: RADIUS, py: 6, px: 3, textAlign: "center" }}>
                <MenuBookOutlinedIcon sx={{ fontSize: 44, color: DASH.line }} />
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink, mt: 1.2 }}>
                    No confirmed book{portion ? ` for ${portion}` : " for this class and subject"}
                </Typography>
                <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.6, mb: 2.4, maxWidth: 560, mx: "auto", lineHeight: 1.7 }}>
                    {emptyMessage || "Questions are generated from chapters, so a confirmed book for this class and subject has to be in the library first. Once it is confirmed, check again and the chapters appear here."}
                </Typography>
                <Button onClick={onReload} startIcon={<RefreshIcon sx={{ fontSize: 16 }} />} sx={primaryBtnSx}>
                    Check again
                </Button>
            </Box>
        );
    }

    return (
        <>
            <Banner tone="info" icon={InfoOutlinedIcon} title="Pick the portion">
                Only the chapters you tick are used to generate questions. The shares must add up to 100% -
                use Split evenly if you want every chapter to carry the same weight.
            </Banner>

            <Grid container spacing={1.8}>
                <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                    <Panel
                        title="Chapters"
                        subtitle={`${selected.length} of ${allChapters.length} selected${books.length > 1 ? ` across ${books.length} books` : ""}`}
                        accent={DASH.primary}
                        right={
                            <Box sx={{ display: "flex", gap: 0.8 }}>
                                <Button onClick={onClearAll} sx={{ ...outlineBtnSx, py: 0.3, fontSize: "11.5px" }}>
                                    Clear
                                </Button>
                            </Box>
                        }
                        bodySx={{ p: 1.4 }}
                    >
                        {books.map((book) => {
                            const bookSelected = book.chapters.filter((c) => selectedChapterIds.includes(c.id)).length;
                            return (
                                <Box key={book.id} sx={{ mb: 1.6 }}>
                                    <Box
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap",
                                            px: 1.2, py: 0.9, mb: 1, borderRadius: RADIUS,
                                            bgcolor: DASH.surface, border: `1px solid ${DASH.lineSoft}`,
                                        }}
                                    >
                                        <MenuBookOutlinedIcon sx={{ fontSize: 16, color: DASH.cyan }} />
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink }}>
                                                {book.title}
                                            </Typography>
                                            <Typography sx={{ fontSize: "11px", color: DASH.muted }}>
                                                {[book.term ? `Term ${book.term}` : "", book.medium, book.publisher, book.editionYear].filter(Boolean).join(" - ")}
                                            </Typography>
                                        </Box>
                                        <Pill label={`${bookSelected} / ${book.chapters.length}`} color={DASH.muted} bg="#fff" border={DASH.line} />
                                        <Button
                                            onClick={() => onSelectBook(book)}
                                            sx={{ ...outlineBtnSx, py: 0.2, fontSize: "11px", height: 26 }}
                                        >
                                            {bookSelected === book.chapters.length ? "Unselect all" : "Select all"}
                                        </Button>
                                    </Box>

                                    {book.chapters.length === 0 ? (
                                        <EmptyNote text="This book has no confirmed chapters." />
                                    ) : (
                                        book.chapters.map((chapter) => (
                                            <ChapterRow
                                                key={chapter.id}
                                                chapter={chapter}
                                                isOn={selectedChapterIds.includes(chapter.id)}
                                                weight={Number(weightage[chapter.id]) || 0}
                                                onToggle={onToggleChapter}
                                                onWeightageChange={onWeightageChange}
                                            />
                                        ))
                                    )}
                                </Box>
                            );
                        })}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                    <Panel title="Portion Summary" subtitle="What the generator will read" accent={DASH.cyan} sx={{ mb: 1.8 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.6 }}>
                            <Box
                                sx={{
                                    width: 38, height: 38, borderRadius: RADIUS, bgcolor: DASH.cyanLight,
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                }}
                            >
                                <MenuBookOutlinedIcon sx={{ fontSize: 20, color: DASH.cyan }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: DASH.ink }}>
                                    {portion || "This paper"}
                                </Typography>
                                <Typography sx={{ fontSize: "11px", color: DASH.muted }}>
                                    {books.length === 1 ? books[0].title : `${books.length} confirmed books`}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
                            <LayersOutlinedIcon sx={{ fontSize: 15, color: DASH.faint }} />
                            <Typography sx={{ fontSize: "12px", color: DASH.text }}>
                                <strong>{selected.length}</strong> chapter{selected.length === 1 ? "" : "s"} selected
                            </Typography>
                        </Box>

                        {selected.length === 0 ? (
                            <EmptyNote text="Tick at least one chapter to continue." />
                        ) : (
                            selected.map((chapter) => {
                                const weight = Number(weightage[chapter.id]) || 0;
                                return (
                                    <Box key={chapter.id} sx={{ mb: 1.1 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.4 }}>
                                            <Typography
                                                sx={{
                                                    fontSize: "11.5px", color: DASH.text, minWidth: 0,
                                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                }}
                                            >
                                                {chapter.number}. {chapter.title}
                                            </Typography>
                                            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.ink, flexShrink: 0 }}>
                                                {weight}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={weight}
                                            sx={{
                                                height: 5, borderRadius: RADIUS, bgcolor: DASH.lineSoft,
                                                "& .MuiLinearProgress-bar": { bgcolor: DASH.cyan, borderRadius: RADIUS },
                                            }}
                                        />
                                    </Box>
                                );
                            })
                        )}
                    </Panel>

                    {selected.length > 0 && (
                        <Box
                            sx={{
                                display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap",
                                bgcolor: balanced ? DASH.greenLight : DASH.primaryLight,
                                border: `1px solid ${balanced ? "#BBF7D0" : DASH.primaryBorder}`,
                                borderRadius: RADIUS, px: 1.6, py: 1.3,
                            }}
                        >
                            <BalanceOutlinedIcon sx={{ fontSize: 17, color: balanced ? "#065F46" : "#92400E" }} />
                            <Typography sx={{ fontSize: "12px", color: balanced ? "#065F46" : "#92400E", flex: 1, minWidth: 120 }}>
                                Weightage totals <strong>{weightTotal}%</strong>
                                {balanced
                                    ? " - balanced."
                                    : remaining > 0
                                        ? ` - ${remaining}% still to give out.`
                                        : ` - ${-remaining}% over. Bring a chapter down or split evenly.`}
                            </Typography>
                            {!balanced && (
                                <Button onClick={onBalanceWeightage} sx={{ ...outlineBtnSx, py: 0.3, fontSize: "11.5px" }}>
                                    Split evenly
                                </Button>
                            )}
                        </Box>
                    )}
                </Grid>
            </Grid>
        </>
    );
}
