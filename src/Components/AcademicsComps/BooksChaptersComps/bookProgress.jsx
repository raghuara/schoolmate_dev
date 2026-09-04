import React from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { DASH, RADIUS, Panel } from "../../DashBoardComps/dashboardTheme";
import { outlineBtnSx } from "./bookTheme";

export const mmss = (seconds) => {
    const total = Math.max(0, Math.round(Number(seconds) || 0));
    if (total < 60) return `${total}s`;
    return `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, "0")}s`;
};

/* The three things that actually happen, in the order they happen. There is no
   server-reported step list, so the screen does not invent one. */
const TRACK = [
    { title: "Book uploaded", detail: "The file is stored and in the queue" },
    { title: "Reading the book", detail: "Pages are read and chapter headings detected" },
    { title: "Chapters ready to review", detail: "Check the split before the book is used" },
];

const TrackRow = ({ step, state, note, last }) => (
    <Box sx={{ display: "flex", gap: 1.4, mb: last ? 0 : 1.8 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            <Box
                sx={{
                    width: 24, height: 24, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: state === "done" ? DASH.green : state === "active" ? DASH.primary : "#fff",
                    border: `2px solid ${state === "done" ? DASH.green : state === "active" ? DASH.primary : DASH.line}`,
                    transition: "all .3s ease",
                }}
            >
                {state === "done"
                    ? <CheckCircleIcon sx={{ fontSize: 14, color: "#fff" }} />
                    : state === "active"
                        ? <CircularProgress size={11} thickness={6} sx={{ color: "#fff" }} />
                        : <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: DASH.line }} />}
            </Box>
            {!last && (
                <Box sx={{ width: 2, flex: 1, minHeight: 16, bgcolor: state === "done" ? DASH.green : DASH.lineSoft, mt: 0.4 }} />
            )}
        </Box>
        <Box sx={{ minWidth: 0, pb: 0.5 }}>
            <Typography
                sx={{
                    fontSize: "13px",
                    fontWeight: state === "idle" ? 600 : 700,
                    color: state === "idle" ? DASH.faint : DASH.ink,
                }}
            >
                {step.title}
            </Typography>
            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2, lineHeight: 1.5 }}>
                {note || step.detail}
            </Typography>
        </Box>
    </Box>
);

/* Where a book has got to while it is being read. Shared by the upload screen
   and by opening a book that is still processing from the library, so both show
   the same thing rather than one of them being a dead end. */
export const BookProgressPanel = ({ book, processing, elapsed, actions, footNote }) => {
    const status = book?.status || "";
    const queued = status === "Processing" && processing && !processing.isActivelyProcessing;
    const reading = status === "Processing" && Boolean(processing?.isActivelyProcessing);
    const ready = status === "Needs Review" || status === "Ready";
    const failed = status === "Failed";
    const ahead = Number(processing?.queuePosition) || 0;

    return (
        <Panel
            title={failed ? "The book could not be read" : ready ? "Chapters detected" : "Reading the book"}
            subtitle={book?.fileName || book?.title || ""}
            accent={failed ? DASH.red : ready ? DASH.green : DASH.primary}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.6, mb: 2.4 }}>
                <Box
                    sx={{
                        width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        bgcolor: failed ? DASH.redLight : ready ? DASH.greenLight : DASH.primaryLight,
                        border: `1px solid ${failed ? "#FECACA" : ready ? "#BBF7D0" : DASH.primaryBorder}`,
                    }}
                >
                    {failed
                        ? <ErrorOutlineIcon sx={{ fontSize: 26, color: DASH.red }} />
                        : ready
                            ? <CheckCircleIcon sx={{ fontSize: 26, color: DASH.green }} />
                            : queued
                                ? <HourglassEmptyOutlinedIcon sx={{ fontSize: 24, color: DASH.primary }} />
                                : <AutoAwesomeOutlinedIcon sx={{ fontSize: 24, color: DASH.primary }} />}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink }}>
                        {failed && "Reading failed"}
                        {ready && `${book.chapterCount} chapters found`}
                        {queued && `Waiting in the queue${ahead > 0 ? ` - ${ahead} ahead` : " - next up"}`}
                        {reading && `Reading the book - ${mmss(elapsed)} so far`}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.3, lineHeight: 1.6 }}>
                        {failed && (book.failureReason || "No reason was given. Upload the file again.")}
                        {ready && "Open the chapter list and check the split before the book is used."}
                        {queued && "One book is read at a time. If a few were uploaded together, they take their turn."}
                        {reading && `${book.pages ? `${book.pages} pages. ` : ""}How long it takes depends on the page count - the screen updates on its own.`}
                    </Typography>
                </Box>
            </Box>

            {!failed && (
                <>
                    <TrackRow step={TRACK[0]} state="done" />
                    <TrackRow
                        step={TRACK[1]}
                        state={ready ? "done" : "active"}
                        note={queued
                            ? `Queued${ahead > 0 ? ` behind ${ahead} book${ahead > 1 ? "s" : ""}` : ", next up"}`
                            : reading ? `Running - ${mmss(elapsed)} elapsed` : undefined}
                    />
                    <TrackRow
                        step={TRACK[2]}
                        state={ready ? "active" : "idle"}
                        note={ready ? `${book.chapterCount} chapters, ${(book.totalWords || 0).toLocaleString()} words` : undefined}
                        last
                    />
                </>
            )}

            {actions && (
                <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>{actions}</Box>
            )}

            {footNote && (
                <Typography sx={{ fontSize: "11px", color: DASH.faint, mt: 1.2, lineHeight: 1.6 }}>
                    {footNote}
                </Typography>
            )}
        </Panel>
    );
};

/* A duplicate is stored but never read: the server refuses to process a second
   book for the same year, class, subject, medium and term. Nothing moves until
   one of the pair is deleted, so the screen says exactly that and offers the
   one action that resolves it. */
export const DuplicatePanel = ({ book, onDelete, onOpenOriginal, deleting }) => (
    <Panel
        title="This book is already in the library"
        subtitle={book?.fileName || book?.title || ""}
        accent="#D97706"
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.6, mb: 2 }}>
            <Box
                sx={{
                    width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: "#FEF3C7", border: "1px solid #FDE68A",
                }}
            >
                <ContentCopyOutlinedIcon sx={{ fontSize: 24, color: "#92400E" }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink }}>
                    Not read - a matching book already exists
                </Typography>
                <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.3, lineHeight: 1.6 }}>
                    {[book?.grade, book?.subject, book?.medium, book?.term ? `Term ${book.term}` : ""]
                        .filter(Boolean).join(" - ")} for {book?.academicYear || "this year"} is
                    already uploaded, so this copy was stored but never read.
                </Typography>
            </Box>
        </Box>

        <Box
            sx={{
                display: "flex", gap: 1.2, alignItems: "flex-start",
                bgcolor: "#FFFBEB", border: "1px solid #FDE68A",
                borderRadius: RADIUS, px: 1.6, py: 1.3,
            }}
        >
            <InfoOutlinedIcon sx={{ fontSize: 16, color: "#92400E", mt: 0.1, flexShrink: 0 }} />
            <Typography sx={{ fontSize: "12px", color: "#92400E", lineHeight: 1.7 }}>
                <strong>Delete one of the two to carry on.</strong> Deleting this copy keeps the
                book already in the library. Deleting the original instead starts this copy
                reading straight away - useful when this file is the newer edition.
                {book?.term ? "" : " If the two books are actually different terms, set the term on the original and upload this one again."}
            </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
            <Button
                onClick={onDelete}
                disabled={deleting}
                startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                sx={{
                    textTransform: "none", fontSize: "13px", fontWeight: 700, height: 38,
                    px: 2, borderRadius: RADIUS, bgcolor: DASH.red, color: "#fff",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" },
                    "&.Mui-disabled": { bgcolor: DASH.line, color: DASH.faint },
                }}
            >
                {deleting ? "Deleting..." : "Delete this copy"}
            </Button>
            {onOpenOriginal && book?.duplicateOfBookId && (
                <Button onClick={onOpenOriginal} sx={{ ...outlineBtnSx, height: 38 }}>
                    Open the book already there
                </Button>
            )}
        </Box>
    </Panel>
);
