import React from "react";
import { Box, Typography } from "@mui/material";

export default function ERPPage() {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "90vh",
                textAlign: "center",
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    fontWeight: "700",
                    color: "#2C3E50",
                    mb: 2,
                }}
            >
                Coming Soon
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    fontSize: "16px",
                    color: "#7F8C8D",
                }}
            >
                Exciting updates are on the way! Stay tuned.
            </Typography>
        </Box>
    );
}
