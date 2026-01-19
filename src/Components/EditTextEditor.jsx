import React, { useState, useEffect, useRef } from "react";
import JoditEditor from "jodit-react";
import { Box } from "@mui/material";

const SimpleTextEditor = ({ value, onContentChange }) => {
    const editor = useRef(null);
    const [content, setContent] = useState(value || "");

    useEffect(() => {
        if (value !== content) {
            setContent(value || "");
        }
    }, [value]);

    const handleContentChange = (newContent) => {
        setContent(newContent);
        if (onContentChange) {
            onContentChange(newContent);
        }
    };

    const editorConfig = {
        readonly: false,
        placeholder: "Start typing here...",
        toolbarSticky: false,
        buttons: ["bold", "paste"], 
        toolbar: true,
        toolbarInline: true,
        toolbarButtonSize: "small",
        height: 150,
        showXPathInStatusbar: false,
        showCharsCounter: false,
        showWordsCounter: false,
        showStatusbar: false,
        toolbarAdaptive: false,
        askBeforePasteHTML: false,
    };

    return (
        <Box
            sx={{
                position: "relative",
                borderRadius: "5px",
                minHeight: "130px",
                overflow: "hidden",
                backgroundColor: "#fff",
            }}
        >
            <JoditEditor
                ref={editor}
                value={content}
                config={editorConfig}
                onBlur={handleContentChange}
                onChange={() => {}}
            />
            <style jsx>{`
               .jodit-ui-group.jodit-ui-group_line_true.jodit-ui-group_size_middle {
                    display: flex;
                    justify-content: start; 
                }
                .jodit-toolbar-button__trigger {
                display:none;
                }
                .jodit-add-new-line{
                  display:none;
                }
            `}</style>
        </Box>
    );
};

export default SimpleTextEditor;
