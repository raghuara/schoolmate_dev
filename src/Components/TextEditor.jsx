import React, { useState, useEffect } from "react";
import {
    Editor,
    EditorState,
    RichUtils,
    Modifier,
    convertFromRaw,
    convertToRaw,
} from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import { convertFromHTML, ContentState } from "draft-js";
import "draft-js/dist/Draft.css";
import { Box, IconButton } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";

const Toolbar = ({ onToggleBold, onPaste }) => (
    <Box
        sx={{
            position: "absolute",
            top: 3,
            right: 3,
            display: "flex",
            gap: 1,
            zIndex: 10,
            padding: "4px 8px",
            borderRadius: "8px",
            backgroundColor: "#f1f1f1",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
    >
        <IconButton onClick={onToggleBold}>
            <FormatBoldIcon style={{ fontSize: "20px" }} />
        </IconButton>
        <IconButton onClick={onPaste}>
            <ContentPasteIcon style={{ fontSize: "20px" }} />
        </IconButton>
    </Box>
);

const RichTextEditor = ({ value, onContentChange }) => {
    const [editorState, setEditorState] = useState(() =>
        EditorState.createEmpty()
    );
    const [typingTimeout, setTypingTimeout] = useState(null);

    useEffect(() => {
        if (value) {
            const blocksFromHTML = convertFromHTML(value);
            const contentBlocks = blocksFromHTML?.contentBlocks || [];
            const entityMap = blocksFromHTML?.entityMap || {};
            const contentState = contentBlocks.length
                ? ContentState.createFromBlockArray(contentBlocks, entityMap)
                : ContentState.createFromText("");
            setEditorState(EditorState.createWithContent(contentState));
        }
    }, [value]);

    const toggleBold = () => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
    };

    const handleEditorChange = (state) => {
        if (!state) return;

        setEditorState(state);

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        const newTimeout = setTimeout(() => {
            const contentState = state.getCurrentContent();
            const html = stateToHTML(contentState);
            if (onContentChange) {
                onContentChange(html);
            }
        }, 500);

        setTypingTimeout(newTimeout);
    };

    const handlePaste = () => {
        navigator.clipboard
            .readText()
            .then((text) => {
                if (text) {
                    const currentContent = editorState.getCurrentContent();
                    const selection = editorState.getSelection();

                    const contentState = Modifier.insertText(
                        currentContent,
                        selection,
                        text
                    );

                    const newState = EditorState.push(
                        editorState,
                        contentState,
                        "insert-characters"
                    );
                    setEditorState(newState);
                    const html = stateToHTML(newState.getCurrentContent());
                    if (onContentChange) {
                        onContentChange(html);
                    }
                }
            })
            .catch((err) => {
                console.error("Error accessing clipboard:", err);
            });
    };

    return (
        <Box sx={{ position: "relative" }}>
            <Box
                sx={{
                    position: "relative",
                    border: "1px solid #DADCE0",
                    borderRadius: "5px",
                    padding: 2,
                    minHeight: "130px",
                    cursor: "text",
                    overflow: "hidden",
                }}
            >
                <Toolbar onToggleBold={toggleBold} onPaste={handlePaste} />

                <Editor
                    editorState={editorState}
                    onChange={handleEditorChange}
                    placeholder="Start typing here..."
                />
            </Box>
        </Box>
    );
};

export default RichTextEditor;
