import React, { useRef } from "react";
import { Box, Button } from "@mui/material";

const tamilKeys = [
  ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ"],
  ["ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ", "்"],
  ["க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம", "ய", "ர"],
  ["ல", "வ", "ழ", "ள", "ற", "ன", "ஸ", "ஹ", "ஜ", "ஷ"]
];

export default function TamilKeyboard({ value, setValue }) {
  const inputRef = useRef(null);


  const handleKeyClick = (char) => {
    setValue((prev) => {
      const newValue = (prev + char).slice(0, 25);
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const len = newValue.length;
          inputRef.current.setSelectionRange(len, len);
        }
      });

      return newValue;
    });
  };
  

  const handleBackspace = () => {
    setValue((prev) => {
      const newValue = prev.slice(0, -1);
  
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const len = newValue.length;
          inputRef.current.setSelectionRange(len, len);
        }
      });
  
      return newValue;
    });
  };
  

  return (
    <Box
      sx={{
        background: "#fff",
        borderRadius: "5px",
        p: 1,
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        maxWidth: 520,

      }}
    >
      <Box sx={{ border: "1px solid #ccc", p: 1, borderRadius: "5px" }}>
        {tamilKeys.map((row, rowIndex) => (
          <Box key={rowIndex} sx={{ display: "flex", justifyContent: "center", mb: 1, }}>
            {row.map((key) => (
              <Button
                key={key}
                onClick={() => handleKeyClick(key)}
                variant="outlined"
                sx={{
                  minWidth: 23,
                  height: 30,
                  mx: 0.5,
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: "8px",
                  color: "#000",
                  borderColor: "#0000005A",
                }}
              >
                {key}
              </Button>
            ))}
          </Box>
        ))}

        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Button
            variant="contained"
            onClick={() => handleKeyClick(" ")}
            sx={{ mr: 1, width: 200, height: 44, boxShadow: "0 1px 3px rgba(0,0,0,0.2)", }}
          >
            Space
          </Button>
          <Button
            variant="contained"
            onClick={() => handleKeyClick(".")}
            sx={{ mr: 1, width: "10px !important", height: 44, boxShadow: "0 1px 3px rgba(0,0,0,0.2)", fontWeight: "600" }}
          >
            .
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBackspace}
            sx={{ width: 40, height: 44, boxShadow: "0 1px 3px rgba(0,0,0,0.2)", }}
          >
            ⌫
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
