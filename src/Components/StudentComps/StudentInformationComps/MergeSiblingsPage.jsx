import React, { useState } from "react";
import { Box, Button, Grid, InputAdornment, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import Loader from "../../Loader";
import SnackBar from "../../SnackBar";
import { postSiblingMapping } from "../../../Api/Api";
import { DASH, RADIUS, BRAND, Panel, PageHeader } from "../../DashBoardComps/dashboardTheme";

const MAX_SIBLINGS = 4;
const ACCENT = BRAND.pink.main;

export default function MergeSiblingsPage() {
    const navigate = useNavigate();
    const token = "123";

    const [isLoading, setIsLoading] = useState(false);
    const [siblings, setSiblings] = useState(["", "", "", ""]);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const showSnack = (msg, ok) => {
        setMessage(msg);
        setColor(ok);
        setStatus(ok);
        setOpen(true);
    };

    const filled = siblings.map((s) => s.trim()).filter(Boolean);
    const duplicateOf = (value, index) =>
        Boolean(value.trim()) &&
        siblings.some((other, i) => i !== index && other.trim().toLowerCase() === value.trim().toLowerCase());
    const hasDuplicate = siblings.some((s, i) => duplicateOf(s, i));
    const readyToMerge = filled.length >= 2 && !hasDuplicate;

    const handleChange = (index, value) => {
        const regex = /^[a-zA-Z0-9]*$/;
        if (value === "" || regex.test(value)) {
            const updated = [...siblings];
            updated[index] = value;
            setSiblings(updated);
        }
    };

    const handleClear = () => setSiblings(["", "", "", ""]);

    const handleSubmit = async () => {
        const filledSiblings = siblings.filter((sib) => sib.trim() !== "");

        if (filledSiblings.length < 2) {
            showSnack("Please enter at least 2 siblings.", false);
            return;
        }
        if (hasDuplicate) {
            showSnack("The same roll number is entered more than once.", false);
            return;
        }
        setIsLoading(true);
        try {
            const sendData = filledSiblings.reduce((acc, curr, index) => {
                acc[`sibling${index + 1}`] = curr;
                return acc;
            }, {});

            await axios.post(postSiblingMapping, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            showSnack("Merged successfully", true);
            setSiblings(["", "", "", ""]);
        } catch (error) {
            showSnack("An error occurred ", false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: 4,
                bgcolor: DASH.canvas,
                boxSizing: "border-box",
            }}
        >
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <PageHeader
                title="Merge Siblings"
                subtitle="Link students from the same family so their records stay connected"
                onBack={() => navigate(-1)}
            />

            <Box sx={{ maxWidth: 780, mx: "auto" }}>
                <Panel
                    title="Sibling Mapping"
                    subtitle={`Enter 2 to ${MAX_SIBLINGS} roll numbers`}
                    accent={ACCENT}
                    right={(
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 1.2,
                                height: 30,
                                borderRadius: RADIUS,
                                bgcolor: `${ACCENT}0F`,
                                border: `1px solid ${ACCENT}24`,
                            }}
                        >
                            <Diversity3Icon sx={{ fontSize: 16, color: ACCENT }} />
                            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: ACCENT }}>
                                {filled.length} entered
                            </Typography>
                        </Box>
                    )}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1.4,
                            py: 1,
                            mb: 2.5,
                            borderRadius: RADIUS,
                            bgcolor: DASH.blueLight,
                            border: "1px solid #BFDBFE",
                        }}
                    >
                        <InfoOutlinedIcon sx={{ fontSize: 17, color: DASH.blue, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: "12px", color: "#1E40AF", fontWeight: 600 }}>
                            At least 2 roll numbers are needed. Up to {MAX_SIBLINGS} students can be linked at once.
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        {siblings.map((sibling, index) => {
                            const isDuplicate = duplicateOf(sibling, index);
                            const active = Boolean(sibling.trim());
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }} key={index}>
                                    <Typography
                                        sx={{
                                            fontSize: "10.5px",
                                            fontWeight: 700,
                                            letterSpacing: "0.05em",
                                            textTransform: "uppercase",
                                            color: DASH.muted,
                                            mb: 0.6,
                                        }}
                                    >
                                        Sibling {index + 1}
                                        {index < 2 && <Box component="span" sx={{ color: DASH.red }}> *</Box>}
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Enter roll number"
                                        value={sibling}
                                        error={isDuplicate}
                                        helperText={isDuplicate ? "Already entered above" : " "}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                height: 38,
                                                fontSize: 13,
                                                fontWeight: 600,
                                                borderRadius: RADIUS,
                                                bgcolor: "#fff",
                                                "& fieldset": { borderColor: active ? `${ACCENT}59` : DASH.line },
                                                "&:hover fieldset": { borderColor: DASH.faint },
                                            },
                                            "& .MuiFormHelperText-text, & .MuiFormHelperText-root": {
                                                fontSize: "10.5px",
                                                marginLeft: 0,
                                                marginTop: "2px",
                                            },
                                        }}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Box
                                                            sx={{
                                                                width: 22,
                                                                height: 22,
                                                                borderRadius: "50%",
                                                                bgcolor: active ? ACCENT : DASH.lineSoft,
                                                                color: active ? "#fff" : DASH.faint,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontSize: 11,
                                                                fontWeight: 800,
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </Box>
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Box
                        sx={{
                            mt: 1,
                            p: 1.6,
                            borderRadius: RADIUS,
                            border: `1px dashed ${readyToMerge ? `${ACCENT}59` : DASH.line}`,
                            bgcolor: readyToMerge ? `${ACCENT}0A` : DASH.surface,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "10.5px",
                                fontWeight: 700,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                color: DASH.faint,
                                mb: 0.8,
                            }}
                        >
                            Will be linked as siblings
                        </Typography>

                        {filled.length === 0 ? (
                            <Typography sx={{ fontSize: "12px", color: DASH.muted }}>
                                Nothing entered yet.
                            </Typography>
                        ) : (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                                {filled.map((roll, i) => (
                                    <React.Fragment key={`${roll}-${i}`}>
                                        {i > 0 && (
                                            <Typography sx={{ fontSize: "13px", fontWeight: 800, color: DASH.faint }}>+</Typography>
                                        )}
                                        <Box
                                            sx={{
                                                px: 1.1,
                                                py: 0.35,
                                                borderRadius: "20px",
                                                bgcolor: `${ACCENT}14`,
                                                border: `1px solid ${ACCENT}3D`,
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: ACCENT, fontFamily: "monospace" }}>
                                                {roll}
                                            </Typography>
                                        </Box>
                                    </React.Fragment>
                                ))}
                            </Box>
                        )}

                        {filled.length === 1 && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 1 }}>
                                <ErrorOutlineRoundedIcon sx={{ fontSize: 14, color: DASH.amber }} />
                                <Typography sx={{ fontSize: "11px", fontWeight: 600, color: DASH.amber }}>
                                    Add one more roll number to merge.
                                </Typography>
                            </Box>
                        )}
                        {hasDuplicate && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 1 }}>
                                <ErrorOutlineRoundedIcon sx={{ fontSize: 14, color: DASH.red }} />
                                <Typography sx={{ fontSize: "11px", fontWeight: 600, color: DASH.red }}>
                                    Remove the repeated roll number before merging.
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.2,
                            flexWrap: "wrap",
                            mt: 2,
                            pt: 2,
                            borderTop: `1px solid ${DASH.lineSoft}`,
                        }}
                    >
                        <Button
                            onClick={handleClear}
                            disabled={filled.length === 0}
                            startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "12.5px",
                                color: DASH.muted,
                                height: 36,
                                px: 1.6,
                                borderRadius: RADIUS,
                                "&:hover": { bgcolor: DASH.lineSoft },
                            }}
                        >
                            Clear all
                        </Button>

                        <Box sx={{ display: "flex", gap: 1.2 }}>
                            <Button
                                onClick={() => navigate(-1)}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: "12.5px",
                                    color: DASH.text,
                                    border: `1px solid ${DASH.line}`,
                                    borderRadius: RADIUS,
                                    px: 2.4,
                                    height: 36,
                                    bgcolor: "#fff",
                                    "&:hover": { bgcolor: DASH.lineSoft },
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!readyToMerge || isLoading}
                                disableElevation
                                startIcon={<CallMergeIcon sx={{ fontSize: 17 }} />}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: "12.5px",
                                    bgcolor: ACCENT,
                                    color: "#fff",
                                    borderRadius: RADIUS,
                                    px: 2.6,
                                    height: 36,
                                    "&:hover": { bgcolor: "#C40047" },
                                    "&.Mui-disabled": { bgcolor: DASH.lineSoft, color: DASH.faint },
                                }}
                            >
                                {isLoading ? "Merging…" : "Merge Siblings"}
                            </Button>
                        </Box>
                    </Box>
                </Panel>
            </Box>
        </Box>
    );
}
