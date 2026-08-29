import React, { useMemo } from "react";
import {
    Box, Grid, Typography, Button, Checkbox, Slider, TextField, MenuItem, LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

import { DASH, RADIUS, Panel, EmptyNote } from "../../../DashBoardComps/dashboardTheme";
import { chapterPageCount } from "../../../AcademicsComps/BooksChaptersComps/bookApi";
import { fieldSx, outlineBtnSx, primaryBtnSx, Banner } from "../questionPaperTheme";

export default function ChaptersStep({
    books,
    bookId,
    onBookChange,
    selectedChapterIds,
    onToggleChapter,
    onSelectAll,
    onClearAll,
    weightage,
    onWeightageChange,
    onBalanceWeightage,
}) {
    const navigate = useNavigate();

    const book = useMemo(
        () => books.find((b) => String(b.id) === String(bookId)) || books[0] || null,
        [books, bookId]
    );

    const chapters = book?.chapters || [];
    const selected = chapters.filter((c) => selectedChapterIds.includes(c.id));
    const weightTotal = selected.reduce((sum, c) => sum + (Number(weightage[c.id]) || 0), 0);
    const balanced = selected.length === 0 || weightTotal === 100;

    if (!books.length) {
        return (
            <Box sx={{ bgcolor: "#fff", border: `1px dashed ${DASH.line}`, borderRadius: RADIUS, py: 7, px: 3, textAlign: "center" }}>
                <MenuBookOutlinedIcon sx={{ fontSize: 44, color: DASH.line }} />
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink, mt: 1.2 }}>
                    No confirmed book for this class and subject
                </Typography>
                <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.6, mb: 2.4, maxWidth: 520, mx: "auto", lineHeight: 1.7 }}>
                    Questions are generated from chapters, so a book has to be in the library first.
                    Upload it, confirm the detected chapter split, then come back to this step.
                </Typography>
                <Button
                    onClick={() => navigate("/dashboardmenu/books/upload")}
                    startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={primaryBtnSx}
                >
                    Upload Book
                </Button>
            </Box>
        );
    }

    return (
        <>
            <Banner tone="info" icon={InfoOutlinedIcon} title="Pick the portion">
                Only the chapters you tick are used to generate questions. Weightage is optional -
                set it when a chapter should carry more of the paper than the others.
            </Banner>

            <Grid container spacing={1.8}>
                <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                    <Panel
                        title="Chapters"
                        subtitle={`${selected.length} of ${chapters.length} selected`}
                        accent={DASH.primary}
                        right={
                            <Box sx={{ display: "flex", gap: 0.8 }}>
                                <Button onClick={onSelectAll} sx={{ ...outlineBtnSx, py: 0.3, fontSize: "11.5px" }}>
                                    Select all
                                </Button>
                                <Button onClick={onClearAll} sx={{ ...outlineBtnSx, py: 0.3, fontSize: "11.5px" }}>
                                    Clear
                                </Button>
                            </Box>
                        }
                        bodySx={{ p: 1.4 }}
                    >
                        {books.length > 1 && (
                            <TextField
                                select fullWidth size="small" label="Book"
                                value={String(book?.id ?? "")}
                                onChange={(e) => onBookChange(e.target.value)}
                                sx={{ ...fieldSx, mb: 1.6 }}
                            >
                                {books.map((b) => (
                                    <MenuItem key={b.id} value={String(b.id)} sx={{ fontSize: "13px" }}>
                                        {b.title} - {b.chapterCount} chapters
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        {chapters.length === 0 ? (
                            <EmptyNote text="This book has no confirmed chapters yet." />
                        ) : (
                            chapters.map((chapter) => {
                                const isOn = selectedChapterIds.includes(chapter.id);
                                return (
                                    <Box
                                        key={chapter.id}
                                        onClick={() => onToggleChapter(chapter.id)}
                                        sx={{
                                            display: "flex", alignItems: "flex-start", gap: 1,
                                            border: `1px solid ${isOn ? DASH.primary : DASH.line}`,
                                            bgcolor: isOn ? DASH.primaryLight : "#fff",
                                            borderRadius: RADIUS, p: 1.2, mb: 1, cursor: "pointer",
                                            transition: "border-color .2s ease, background-color .2s ease",
                                            "&:hover": { borderColor: DASH.primaryBorder },
                                        }}
                                    >
                                        <Checkbox
                                            checked={isOn}
                                            size="small"
                                            sx={{ p: 0.3, mt: 0.1, "&.Mui-checked": { color: DASH.primary } }}
                                        />
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink }}>
                                                {chapter.number}. {chapter.title}
                                            </Typography>
                                            <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.3 }}>
                                                p.{chapter.startPage}-{chapter.endPage} - {chapterPageCount(chapter)} pages -{" "}
                                                {(chapter.wordCount || 0).toLocaleString()} words
                                            </Typography>

                                            {isOn && (
                                                <Box
                                                    sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1 }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Typography sx={{ fontSize: "11px", color: DASH.muted, width: 68, flexShrink: 0 }}>
                                                        Weightage
                                                    </Typography>
                                                    <Slider
                                                        size="small"
                                                        value={Number(weightage[chapter.id]) || 0}
                                                        onChange={(e, value) => onWeightageChange(chapter.id, value)}
                                                        min={0}
                                                        max={100}
                                                        sx={{
                                                            flex: 1,
                                                            color: DASH.primary,
                                                            "& .MuiSlider-thumb": { width: 12, height: 12 },
                                                        }}
                                                    />
                                                    <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.ink, width: 34, textAlign: "right" }}>
                                                        {Number(weightage[chapter.id]) || 0}%
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })
                        )}
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
                                    {book?.title}
                                </Typography>
                                <Typography sx={{ fontSize: "11px", color: DASH.muted }}>
                                    {book?.grade} - {book?.subject} - {book?.medium}
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
                                {balanced ? " - balanced." : " - it should add up to 100%."}
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
