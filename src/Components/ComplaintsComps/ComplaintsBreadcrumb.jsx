import React from "react";
import { Box, Typography } from "@mui/material";
import { C } from "./complaintsTokens";

// Administration > Complaint Configuration > <current>
//
// Pass `trail` as [{ label, onClick? }]; the last entry renders as the current
// crumb. The comps colour that last crumb differently per screen — #212121 on
// Categories, the accent on Role & Permissions — hence `currentColor`.

export default function ComplaintsBreadcrumb({ trail, currentColor = "#212121", fontSize = "11px" }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
            {trail.map((crumb, i) => {
                const last = i === trail.length - 1;
                return (
                    <React.Fragment key={crumb.label}>
                        <Typography
                            onClick={crumb.onClick}
                            sx={{
                                fontSize,
                                fontWeight: last ? 600 : 500,
                                color: last ? currentColor : C.textFaint,
                                cursor: crumb.onClick ? "pointer" : "default",
                                "&:hover": crumb.onClick ? { textDecoration: "underline" } : undefined,
                            }}
                        >
                            {crumb.label}
                        </Typography>
                        {!last && (
                            <Typography sx={{ fontSize, fontWeight: 400, color: C.textFaint }}>
                                &gt;
                            </Typography>
                        )}
                    </React.Fragment>
                );
            })}
        </Box>
    );
}
