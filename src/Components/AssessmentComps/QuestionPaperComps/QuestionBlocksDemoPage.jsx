import React, { useCallback, useMemo, useState } from "react";
import { Box, Grid, Typography, Button, IconButton, Switch, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DataObjectOutlinedIcon from "@mui/icons-material/DataObjectOutlined";
import TouchAppOutlinedIcon from "@mui/icons-material/TouchAppOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";

import { DASH, RADIUS, Panel, PageHeader } from "../../DashBoardComps/dashboardTheme";
import { outlineBtnSx, primaryBtnSx, headerActionSx } from "./questionPaperTheme";
import { BlockList, BLOCK_KINDS, IMAGE_WIDTH_KEYS, ALIGN_KEYS } from "./questionBlocks";
import { MOCK_PAPER, MOCK_IMAGES } from "./questionBlocksMock";

const SHEET_FONT = "'Times New Roman', Georgia, serif";

const BROKEN_URL = "https://schoolmateblob.blob.core.windows.net/qp/2026/this-one-is-missing.png";

const clone = (value) => JSON.parse(JSON.stringify(value));

const OptionRow = ({ option, index, resolveSrc }) => (
    <Box sx={{ display: "flex", gap: 0.8, alignItems: "flex-start", minWidth: 0 }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111", lineHeight: 1.8, flexShrink: 0 }}>
            {String.fromCharCode(97 + index)})
        </Typography>
        <Box sx={{ minWidth: 0, flex: 1, textAlign: "center" }}>
            <BlockList blocks={option.content} resolveSrc={resolveSrc} />
        </Box>
    </Box>
);

const QuestionRow = ({
    question, sectionIndex, questionIndex, resolveSrc, selected, onSelectBlock, showUnknown,
}) => {
    const isCurrent = selected.s === sectionIndex && selected.q === questionIndex;
    return (
        <Box
            sx={{
                display: "flex",
                gap: 1.2,
                mb: 2.6,
                px: 1,
                py: 1,
                mx: -1,
                borderRadius: RADIUS,
                bgcolor: isCurrent ? "rgba(238,162,0,0.05)" : "transparent",
                transition: "background-color .2s ease",
                breakInside: "avoid",
            }}
        >
            <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: "#111", width: 26, flexShrink: 0, lineHeight: 1.9 }}>
                {question.questionNo}.
            </Typography>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <BlockList
                    blocks={question.content}
                    resolveSrc={resolveSrc}
                    interactive
                    selectedIndex={isCurrent ? selected.b : -1}
                    onSelectBlock={(blockIndex) => onSelectBlock(sectionIndex, questionIndex, blockIndex)}
                    showUnknown={showUnknown}
                />

                {question.options && (
                    <Grid container spacing={1.2} sx={{ mt: 0.6 }}>
                        {question.options.map((option, i) => (
                            <Grid key={option.id} size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                                <OptionRow option={option} index={i} resolveSrc={resolveSrc} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#111", flexShrink: 0, lineHeight: 1.9 }}>
                [{question.marks}]
            </Typography>
        </Box>
    );
};

const SwitchRow = ({ label, note, checked, onChange }) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, py: 0.6 }}>
        <Switch
            size="small"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            sx={{
                mt: 0.2,
                "& .MuiSwitch-switchBase.Mui-checked": { color: DASH.primary },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: DASH.primary },
            }}
        />
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink }}>{label}</Typography>
            <Typography sx={{ fontSize: "11px", color: DASH.muted, lineHeight: 1.6 }}>{note}</Typography>
        </Box>
    </Box>
);

const ChoiceGroup = ({ label, values, active, onPick }) => (
    <Box sx={{ mb: 1.4 }}>
        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, textTransform: "uppercase", letterSpacing: 0.4, mb: 0.6 }}>
            {label}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap" }}>
            {values.map((value) => (
                <Button
                    key={value}
                    onClick={() => onPick(value)}
                    sx={{
                        textTransform: "none",
                        fontSize: "12px",
                        fontWeight: 600,
                        minWidth: 0,
                        px: 1.3,
                        height: 30,
                        borderRadius: RADIUS,
                        border: `1px solid ${active === value ? DASH.primary : DASH.line}`,
                        bgcolor: active === value ? DASH.primaryLight : "#fff",
                        color: active === value ? "#92400E" : DASH.text,
                        "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                    }}
                >
                    {value}
                </Button>
            ))}
        </Box>
    </Box>
);

export default function QuestionBlocksDemoPage() {
    const navigate = useNavigate();

    const [paper, setPaper] = useState(() => clone(MOCK_PAPER));
    const [selected, setSelected] = useState({ s: 1, q: 0, b: 1 });
    const [showJson, setShowJson] = useState(true);
    const [breakImage, setBreakImage] = useState(false);
    const [showUnknown, setShowUnknown] = useState(true);
    const [copied, setCopied] = useState(false);

    const resolveSrc = useCallback((url) => {
        if (breakImage && String(url).indexOf("q04-pumpkin") > -1) return BROKEN_URL;
        return MOCK_IMAGES[url] || url;
    }, [breakImage]);

    const question = paper.sections?.[selected.s]?.questions?.[selected.q] || null;
    const block = question?.content?.[selected.b] || null;

    const pickBlock = (s, q, b) => setSelected({ s, q, b });

    const patchBlock = (patch) => {
        setPaper((prev) => {
            const next = clone(prev);
            const target = next.sections[selected.s].questions[selected.q].content[selected.b];
            next.sections[selected.s].questions[selected.q].content[selected.b] = { ...target, ...patch };
            return next;
        });
    };

    const moveBlock = (direction) => {
        const list = question?.content || [];
        const to = selected.b + direction;
        if (to < 0 || to >= list.length) return;
        setPaper((prev) => {
            const next = clone(prev);
            const target = next.sections[selected.s].questions[selected.q].content;
            const [moved] = target.splice(selected.b, 1);
            target.splice(to, 0, moved);
            return next;
        });
        setSelected((current) => ({ ...current, b: to }));
    };

    const questionJson = useMemo(() => (question ? JSON.stringify(question, null, 2) : ""), [question]);

    const copyJson = () => {
        if (navigator.clipboard) navigator.clipboard.writeText(questionJson);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const canEditImage = block && (block.kind === "image" || block.kind === "labelledImage");

    return (
        <Box sx={{ bgcolor: DASH.canvas, minHeight: "100%", p: { xs: 1.5, md: 2 } }}>
            <PageHeader
                title="Question blocks - working preview"
                subtitle="Mock data only. Shows how an AI-written paper that contains pictures would be sent and printed."
                onBack={() => navigate(-1)}
                right={
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            onClick={() => setShowJson((v) => !v)}
                            startIcon={<DataObjectOutlinedIcon sx={{ fontSize: 16 }} />}
                            sx={{ ...outlineBtnSx, ...headerActionSx }}
                        >
                            {showJson ? "Hide the response" : "Show the response"}
                        </Button>
                        <Button
                            onClick={() => { setPaper(clone(MOCK_PAPER)); setSelected({ s: 1, q: 0, b: 1 }); }}
                            sx={{ ...primaryBtnSx, ...headerActionSx }}
                        >
                            Reset the demo
                        </Button>
                    </Box>
                }
            />

            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.2,
                    bgcolor: DASH.primaryLight,
                    border: `1px solid ${DASH.primaryBorder}`,
                    borderRadius: RADIUS,
                    px: 1.8,
                    py: 1.3,
                    mb: 2,
                }}
            >
                <InfoOutlinedIcon sx={{ fontSize: 17, color: "#92400E", mt: 0.2, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "12px", color: "#92400E", lineHeight: 1.8 }}>
                    A question is not text plus one picture. It is an <strong>ordered list of blocks</strong>, so a picture can sit
                    after the text, inside an option, or be the whole question. The paper below is drawn only from that list -
                    click any part of it to see the exact JSON the backend has to send.
                </Typography>
            </Box>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: showJson ? 7 : 12 }}>
                    <Panel
                        title="The printed paper"
                        subtitle="Same renderer is used for the screen and for the PDF"
                        accent={DASH.blue}
                        bodySx={{ bgcolor: DASH.surface, p: { xs: 1, md: 2 } }}
                    >
                        <Box
                            sx={{
                                bgcolor: "#fff",
                                border: `1px solid ${DASH.line}`,
                                boxShadow: "0 1px 10px rgba(17,24,39,0.06)",
                                maxWidth: 760,
                                mx: "auto",
                                px: { xs: 2, md: 4 },
                                py: { xs: 2.5, md: 4 },
                                fontFamily: SHEET_FONT,
                                "& *": { fontFamily: SHEET_FONT },
                            }}
                        >
                            <Typography sx={{ fontSize: "17px", fontWeight: 700, textAlign: "center", color: "#111" }}>
                                {paper.title}
                            </Typography>
                            <Typography sx={{ fontSize: "13px", textAlign: "center", color: "#111", mt: 0.3 }}>
                                Class {paper.grade} - {paper.subject}
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    border: "1px dashed #111",
                                    px: 1.4,
                                    py: 0.7,
                                    mt: 1.6,
                                    mb: 2.4,
                                }}
                            >
                                <Typography sx={{ fontSize: "12.5px", color: "#111" }}>
                                    Time allowed : {Math.floor(paper.timeAllowedMinutes / 60)}.{String(paper.timeAllowedMinutes % 60).padStart(2, "0")} hours
                                </Typography>
                                <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#111" }}>
                                    Maximum Marks : {paper.maximumMarks}
                                </Typography>
                            </Box>

                            {paper.sections.map((section, sectionIndex) => (
                                <Box key={section.sectionId} sx={{ mb: 3 }}>
                                    <Typography
                                        sx={{
                                            fontSize: "14px",
                                            fontWeight: 700,
                                            textAlign: "center",
                                            letterSpacing: 1.4,
                                            color: "#111",
                                            textDecoration: "underline",
                                            mb: 1,
                                        }}
                                    >
                                        {section.heading}
                                    </Typography>

                                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 1.6 }}>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#111" }}>
                                            {section.direction}
                                        </Typography>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#111", whiteSpace: "nowrap" }}>
                                            {section.marksLabel}
                                        </Typography>
                                    </Box>

                                    {section.questions.map((item, questionIndex) => (
                                        <QuestionRow
                                            key={item.questionId}
                                            question={item}
                                            sectionIndex={sectionIndex}
                                            questionIndex={questionIndex}
                                            resolveSrc={resolveSrc}
                                            selected={selected}
                                            onSelectBlock={pickBlock}
                                            showUnknown={showUnknown}
                                        />
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    </Panel>
                </Grid>

                {showJson && (
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 5 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <Panel
                                title={block ? `Selected block - ${block.kind}` : "Nothing selected"}
                                subtitle={block ? "Change it here and the paper above redraws" : "Click any line or picture in the paper"}
                                accent={DASH.primary}
                            >
                                {!block && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
                                        <TouchAppOutlinedIcon sx={{ fontSize: 18, color: DASH.faint }} />
                                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted }}>
                                            Click a sentence, a picture or an answer box in the paper.
                                        </Typography>
                                    </Box>
                                )}

                                {block && (
                                    <>
                                        {canEditImage && (
                                            <>
                                                <ChoiceGroup
                                                    label="Width - a share of the column, never pixels"
                                                    values={IMAGE_WIDTH_KEYS}
                                                    active={block.width || "medium"}
                                                    onPick={(value) => patchBlock({ width: value })}
                                                />
                                                {block.kind === "image" && (
                                                    <ChoiceGroup
                                                        label="Align"
                                                        values={ALIGN_KEYS}
                                                        active={block.align || "left"}
                                                        onPick={(value) => patchBlock({ align: value })}
                                                    />
                                                )}
                                            </>
                                        )}

                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.4 }}>
                                            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>
                                                Position
                                            </Typography>
                                            <Tooltip title="Move up">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => moveBlock(-1)}
                                                        disabled={selected.b === 0}
                                                        sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS }}
                                                    >
                                                        <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Move down">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => moveBlock(1)}
                                                        disabled={selected.b >= (question?.content?.length || 1) - 1}
                                                        sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS }}
                                                    >
                                                        <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Typography sx={{ fontSize: "11.5px", color: DASH.faint }}>
                                                block {selected.b + 1} of {question?.content?.length || 0}
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                mt: 1.6,
                                                bgcolor: "#0F172A",
                                                borderRadius: RADIUS,
                                                px: 1.4,
                                                py: 1.2,
                                                overflowX: "auto",
                                            }}
                                        >
                                            <Box
                                                component="pre"
                                                sx={{
                                                    m: 0,
                                                    fontSize: "11px",
                                                    lineHeight: 1.7,
                                                    color: "#7DD3FC",
                                                    fontFamily: "Consolas, Menlo, monospace",
                                                }}
                                            >
                                                {JSON.stringify(block, null, 2)}
                                            </Box>
                                        </Box>
                                    </>
                                )}
                            </Panel>

                            <Panel
                                title="What the backend sends for this question"
                                subtitle={question ? `${question.questionId} - ${question.content.length} blocks` : ""}
                                accent={DASH.green}
                                right={
                                    <Button
                                        onClick={copyJson}
                                        startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: 15 }} />}
                                        sx={{ ...outlineBtnSx, height: 30 }}
                                    >
                                        {copied ? "Copied" : "Copy"}
                                    </Button>
                                }
                            >
                                <Box
                                    sx={{
                                        bgcolor: "#0F172A",
                                        borderRadius: RADIUS,
                                        px: 1.4,
                                        py: 1.2,
                                        maxHeight: 340,
                                        overflow: "auto",
                                    }}
                                >
                                    <Box
                                        component="pre"
                                        sx={{
                                            m: 0,
                                            fontSize: "11px",
                                            lineHeight: 1.7,
                                            color: "#A5B4FC",
                                            fontFamily: "Consolas, Menlo, monospace",
                                        }}
                                    >
                                        {questionJson}
                                    </Box>
                                </Box>
                            </Panel>

                            <Panel title="Block kinds the frontend can draw" accent={DASH.violet}>
                                {BLOCK_KINDS.map((item) => (
                                    <Box key={item.kind} sx={{ display: "flex", gap: 1.2, mb: 1.2 }}>
                                        <Box
                                            sx={{
                                                px: 0.9,
                                                height: 19,
                                                display: "flex",
                                                alignItems: "center",
                                                borderRadius: RADIUS,
                                                bgcolor: DASH.violetLight,
                                                border: `1px solid ${DASH.violet}33`,
                                                color: DASH.violet,
                                                fontSize: "10.5px",
                                                fontWeight: 700,
                                                fontFamily: "Consolas, Menlo, monospace",
                                                flexShrink: 0,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {item.kind}
                                        </Box>
                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, lineHeight: 1.65 }}>
                                            {item.note}
                                        </Typography>
                                    </Box>
                                ))}
                                <Typography sx={{ fontSize: "11px", color: DASH.faint, lineHeight: 1.7, mt: 0.4 }}>
                                    Anything else is skipped, not crashed. Question 8 carries a
                                    {" "}<strong>mindMap</strong> block on purpose - the backend can ship a new kind before the
                                    frontend knows it, and old builds still print the rest of the paper.
                                </Typography>
                            </Panel>

                            <Panel
                                title="Try the two things that go wrong"
                                subtitle="Both are silent failures if we do not plan for them"
                                accent={DASH.red}
                            >
                                <SwitchRow
                                    label="Break the pumpkin picture URL"
                                    note="A dead blob URL keeps its space and says so, instead of leaving a hole that shifts the numbering."
                                    checked={breakImage}
                                    onChange={setBreakImage}
                                />
                                <SwitchRow
                                    label="Show unknown block kinds"
                                    note="Off is what prints. On is the developer view, so we can see what this build did not understand."
                                    checked={showUnknown}
                                    onChange={setShowUnknown}
                                />
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        alignItems: "flex-start",
                                        mt: 1,
                                        bgcolor: DASH.redLight,
                                        border: "1px solid #FECACA",
                                        borderRadius: RADIUS,
                                        px: 1.4,
                                        py: 1.1,
                                    }}
                                >
                                    <ScienceOutlinedIcon sx={{ fontSize: 16, color: DASH.red, mt: 0.2, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: "11.5px", color: "#B91C1C", lineHeight: 1.75 }}>
                                        <strong>The one to settle first:</strong> the blob must send CORS headers. Without them the
                                        pictures look fine on screen and come out blank in the downloaded PDF, because html2canvas
                                        cannot read a cross-origin image. Test that on day one, not at the end.
                                    </Typography>
                                </Box>
                            </Panel>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}
