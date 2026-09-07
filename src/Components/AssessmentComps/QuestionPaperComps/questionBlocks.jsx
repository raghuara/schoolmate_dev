import React, { useState } from "react";
import { Box, Typography } from "@mui/material";

import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";

export const IMAGE_WIDTHS = { small: "26%", medium: "48%", large: "72%", full: "100%" };

export const IMAGE_WIDTH_KEYS = ["small", "medium", "large", "full"];

export const ALIGN_KEYS = ["left", "center", "right"];

const FLEX_ALIGN = { left: "flex-start", center: "center", right: "flex-end" };

export const BLOCK_KINDS = [
    { kind: "text", label: "Text", note: "A sentence. A blank is written as ____ inside the value." },
    { kind: "image", label: "Image", note: "A picture anywhere in the question. width is a share of the column, never pixels." },
    { kind: "answerSpace", label: "Answer space", note: "Ruled lines, an empty box, tick boxes or a row of boxes to write in." },
    { kind: "table", label: "Table", note: "Match the following, and any other grid." },
    { kind: "imageGrid", label: "Image grid", note: "A row of pictures with a box under each one." },
    { kind: "labelledImage", label: "Labelled image", note: "One diagram with write-in boxes placed on it by percentage." },
];

const SelectFrame = ({ interactive, isSelected, kind, onSelect, children }) => {
    if (!interactive) return children;
    return (
        <Box
            onClick={(e) => { e.stopPropagation(); if (onSelect) onSelect(); }}
            sx={{
                position: "relative",
                cursor: "pointer",
                borderRadius: RADIUS,
                outline: isSelected ? `2px solid ${DASH.primary}` : "2px solid transparent",
                outlineOffset: 3,
                transition: "outline-color .15s ease",
                "&:hover": { outlineColor: isSelected ? DASH.primary : DASH.primaryBorder },
                "&:hover .blockTag": { opacity: 1 },
            }}
        >
            <Box
                className="blockTag"
                sx={{
                    position: "absolute",
                    top: -9,
                    right: 0,
                    zIndex: 2,
                    px: 0.7,
                    height: 16,
                    display: "flex",
                    alignItems: "center",
                    borderRadius: RADIUS,
                    bgcolor: isSelected ? DASH.primary : DASH.faint,
                    color: "#fff",
                    fontSize: "9.5px",
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    fontFamily: "system-ui, sans-serif",
                    opacity: isSelected ? 1 : 0,
                    transition: "opacity .15s ease",
                    pointerEvents: "none",
                }}
            >
                {kind}
            </Box>
            {children}
        </Box>
    );
};

const PaperImage = ({ src, alt, minHeight }) => {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <Box
                sx={{
                    width: "100%",
                    minHeight: minHeight || 104,
                    border: `1.5px dashed ${DASH.red}`,
                    borderRadius: RADIUS,
                    bgcolor: DASH.redLight,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.3,
                    px: 1,
                    py: 1,
                }}
            >
                <BrokenImageOutlinedIcon sx={{ fontSize: 19, color: DASH.red }} />
                <Typography sx={{ fontSize: "10.5px", color: DASH.red, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>
                    Image not available
                </Typography>
                <Typography sx={{ fontSize: "9.5px", color: DASH.red, fontFamily: "system-ui, sans-serif", textAlign: "center", lineHeight: 1.5 }}>
                    The space is kept so the paper does not reflow
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            component="img"
            src={src}
            alt={alt || ""}
            crossOrigin="anonymous"
            onError={() => setFailed(true)}
            sx={{ width: "100%", display: "block", borderRadius: "2px" }}
        />
    );
};

const TextBlock = ({ block }) => (
    <Typography
        sx={{
            fontSize: "13.5px",
            lineHeight: 1.9,
            color: "#111",
            fontWeight: block.bold ? 700 : 400,
            fontStyle: block.italic ? "italic" : "normal",
            whiteSpace: "pre-wrap",
        }}
    >
        {block.value}
    </Typography>
);

const ImageBlock = ({ block, resolveSrc }) => (
    <Box sx={{ display: "flex", justifyContent: FLEX_ALIGN[block.align] || "flex-start", my: 1 }}>
        <Box sx={{ width: IMAGE_WIDTHS[block.width] || IMAGE_WIDTHS.medium, maxWidth: "100%" }}>
            <PaperImage src={resolveSrc(block.url)} alt={block.alt} />
            {block.caption && (
                <Typography sx={{ fontSize: "10.5px", color: "#444", textAlign: "center", mt: 0.4, fontStyle: "italic" }}>
                    {block.caption}
                </Typography>
            )}
        </Box>
    </Box>
);

const AnswerSpaceBlock = ({ block }) => {
    const count = Number(block.count) || 1;

    if (block.variant === "box") {
        return (
            <Box
                sx={{
                    border: "1px solid #111",
                    height: block.height || 72,
                    borderRadius: "2px",
                    my: 1,
                    width: block.width === "half" ? "50%" : "100%",
                }}
            />
        );
    }

    if (block.variant === "checkbox") {
        return (
            <Box sx={{ display: "flex", gap: 1.2, my: 0.8 }}>
                {Array.from({ length: count }).map((_, i) => (
                    <Box key={i} sx={{ width: 17, height: 17, border: "1.5px solid #111" }} />
                ))}
            </Box>
        );
    }

    if (block.variant === "grid") {
        return (
            <Box sx={{ display: "flex", gap: 0.8, my: 1, flexWrap: "wrap" }}>
                {Array.from({ length: count }).map((_, i) => (
                    <Box key={i} sx={{ width: 54, height: 30, border: "1px solid #111", borderRadius: "2px" }} />
                ))}
            </Box>
        );
    }

    return (
        <Box sx={{ my: 1 }}>
            {Array.from({ length: count }).map((_, i) => (
                <Box
                    key={i}
                    sx={{
                        borderBottom: "1px solid #111",
                        height: 26,
                        width: block.width === "half" ? "55%" : "92%",
                    }}
                />
            ))}
        </Box>
    );
};

const TableBlock = ({ block }) => (
    <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", my: 1.2, fontSize: "12.5px" }}>
        {block.headers && (
            <Box component="thead">
                <Box component="tr">
                    {block.headers.map((head, i) => (
                        <Box key={i} component="th" sx={{ border: "1px solid #111", p: 0.8, textAlign: "left", fontWeight: 700 }}>
                            {head}
                        </Box>
                    ))}
                </Box>
            </Box>
        )}
        <Box component="tbody">
            {(block.rows || []).map((row, r) => (
                <Box key={r} component="tr">
                    {row.map((cell, c) => (
                        <Box key={c} component="td" sx={{ border: "1px solid #111", p: 0.8, verticalAlign: "top", minWidth: 60 }}>
                            {cell}
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    </Box>
);

const ImageGridBlock = ({ block, resolveSrc }) => {
    const columns = Number(block.columns) || 3;
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gap: 1.4,
                my: 1.2,
            }}
        >
            {(block.items || []).map((item, i) => (
                <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.6 }}>
                    <Box sx={{ width: "72%" }}>
                        <PaperImage src={resolveSrc(item.url)} alt={item.alt} minHeight={68} />
                    </Box>
                    {item.box && <Box sx={{ width: 46, height: 24, border: "1.5px solid #111", borderRadius: "2px" }} />}
                    {item.label && <Typography sx={{ fontSize: "11px" }}>{item.label}</Typography>}
                </Box>
            ))}
        </Box>
    );
};

const LabelledImageBlock = ({ block, resolveSrc }) => (
    <Box sx={{ display: "flex", justifyContent: "center", my: 1.2 }}>
        <Box
            sx={{
                position: "relative",
                width: IMAGE_WIDTHS[block.width] || IMAGE_WIDTHS.full,
                maxWidth: "100%",
                border: "1px solid #111",
            }}
        >
            <PaperImage src={resolveSrc(block.url)} alt={block.alt} />
            {(block.labels || []).map((label, i) => (
                <Box
                    key={i}
                    sx={{
                        position: "absolute",
                        left: `${label.x}%`,
                        top: `${label.y}%`,
                        transform: "translate(-50%, -50%)",
                        width: `${label.width || 17}%`,
                        height: 20,
                        border: "1.5px solid #111",
                        bgcolor: "#fff",
                        borderRadius: "2px",
                    }}
                />
            ))}
        </Box>
    </Box>
);

const UnknownBlock = ({ block }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            border: `1.5px dashed ${DASH.violet}`,
            bgcolor: DASH.violetLight,
            borderRadius: RADIUS,
            px: 1.2,
            py: 1,
            my: 1,
        }}
    >
        <HelpOutlineIcon sx={{ fontSize: 17, color: DASH.violet, mt: 0.2, flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.violet, fontFamily: "system-ui, sans-serif" }}>
                Unknown block kind: {block.kind}
            </Typography>
            <Typography sx={{ fontSize: "10.5px", color: DASH.violet, fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
                A newer backend sent a kind this build does not know. On the printed paper it is skipped instead of breaking the page.
            </Typography>
        </Box>
    </Box>
);

const RENDERERS = {
    text: TextBlock,
    image: ImageBlock,
    answerSpace: AnswerSpaceBlock,
    table: TableBlock,
    imageGrid: ImageGridBlock,
    labelledImage: LabelledImageBlock,
};

export const isKnownKind = (kind) => Boolean(RENDERERS[kind]);

export const Block = ({ block, resolveSrc, interactive, isSelected, onSelect, showUnknown }) => {
    const Renderer = RENDERERS[block.kind];

    if (!Renderer) {
        if (!showUnknown) return null;
        return (
            <SelectFrame interactive={interactive} isSelected={isSelected} kind={block.kind} onSelect={onSelect}>
                <UnknownBlock block={block} />
            </SelectFrame>
        );
    }

    return (
        <SelectFrame interactive={interactive} isSelected={isSelected} kind={block.kind} onSelect={onSelect}>
            <Renderer block={block} resolveSrc={resolveSrc} />
        </SelectFrame>
    );
};

export const BlockList = ({
    blocks = [],
    resolveSrc = (url) => url,
    interactive,
    selectedIndex,
    onSelectBlock,
    showUnknown,
}) => (
    <>
        {blocks.map((block, i) => (
            <Block
                key={block.id || i}
                block={block}
                resolveSrc={resolveSrc}
                interactive={interactive}
                isSelected={selectedIndex === i}
                onSelect={() => onSelectBlock && onSelectBlock(i)}
                showUnknown={showUnknown}
            />
        ))}
    </>
);
