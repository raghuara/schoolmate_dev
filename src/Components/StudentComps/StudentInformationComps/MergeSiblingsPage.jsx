import React, { useEffect, useRef, useState } from "react";
import { Dialog, IconButton, Box, Typography, Grid, TextField, Button, InputAdornment } from "@mui/material";
import Loader from "../../Loader";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import SnackBar from "../../SnackBar";
import { postSiblingMapping } from "../../../Api/Api";
import axios from "axios";

export default function MergeSiblingsPage() {
    const navigate = useNavigate()
    const token = '123';
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor || "#E60154";
    const [siblings, setSiblings] = useState(["", "", "", ""]);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (index, value) => {
        const regex = /^[a-zA-Z0-9]*$/;
        if (value === "" || regex.test(value)) {
          const updated = [...siblings];
          updated[index] = value;
          setSiblings(updated);
        }
      };

    const handleSubmit = async (status) => {
        const filledSiblings = siblings.filter((sib) => sib.trim() !== "");

        if (filledSiblings.length < 2) {
            setMessage("Please enter at least 2 siblings.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }
        setIsLoading(true);
        try {
            const sendData = filledSiblings.reduce((acc, curr, index) => {
                acc[`sibling${index + 1}`] = curr;
                return acc;
              }, {});

            const res = await axios.post(postSiblingMapping, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Merged successfully");

            setSiblings(["", "", "", ""]);

        } catch (error) {
            setMessage("An error occurred ");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ backgroundColor: "#F6F6F8", height: "91.7vh" }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box>
                <Grid container sx={{ backgroundColor: "#F2F2F2", py: 1, px: 2, borderBottom: "1px solid #ddd" }} >
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Grid container >
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Box sx={{ display: "flex" }}>
                                    <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '3px', '&:hover': { backgroundColor: "rgba(252, 190, 58, 0.2)" } }}>
                                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                                    </IconButton>

                                    <Typography sx={{ fontWeight: "600", ml: 1, marginTop: "3px", fontSize: "19px" }}>
                                        Merge Siblings
                                    </Typography>
                                </Box>
                            </Grid>

                        </Grid>
                    </Grid>
                </Grid>
                <Box sx={{ px: 2, py: 2.5 }}>
                    <Box sx={{ maxWidth: 760, mx: "auto", borderRadius: "14px", border: "1px solid #E5E7EB", bgcolor: "#fff", overflow: "hidden", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}>
                        {/* Card header */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 2, bgcolor: "#FAFAFB", borderBottom: "1px solid #EEF0F2" }}>
                            <Box sx={{ width: 42, height: 42, borderRadius: "12px", bgcolor: `${accent}1A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Diversity3Icon sx={{ fontSize: 24, color: accent }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Merge Siblings</Typography>
                                <Typography sx={{ fontSize: 12.5, color: "#6B7280" }}>Link students who are siblings by entering their roll numbers.</Typography>
                            </Box>
                        </Box>

                        {/* Info banner */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mx: 3, mt: 2.5, px: 1.4, py: 1, borderRadius: "8px", bgcolor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                            <InfoOutlinedIcon sx={{ fontSize: 17, color: "#2563EB" }} />
                            <Typography sx={{ fontSize: 12, color: "#1E40AF", fontWeight: 600 }}>
                                Enter at least 2 roll numbers to merge them as siblings. Up to 4 can be linked at once.
                            </Typography>
                        </Box>

                        {/* Sibling inputs */}
                        <Box sx={{ px: 3, py: 2.5 }}>
                            <Grid container spacing={2}>
                                {siblings.map((sibling, index) => (
                                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                                        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", mb: 0.5 }}>
                                            Sibling {index + 1} {index < 2 && <span style={{ color: "#EF4444" }}>*</span>}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Enter roll number"
                                            value={sibling}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: sibling ? accent : "#E5E7EB", color: sibling ? "#fff" : "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                                                            {index + 1}
                                                        </Box>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {/* Footer */}
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.2, px: 3, py: 2, borderTop: "1px solid #EEF0F2", bgcolor: "#FAFAFB" }}>
                            <Button
                                onClick={() => navigate(-1)}
                                sx={{ textTransform: "none", fontWeight: 700, color: "#374151", border: "1px solid #E5E7EB", borderRadius: "8px", px: 2.4, height: 38, "&:hover": { bgcolor: "#fff" } }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                startIcon={<CallMergeIcon sx={{ fontSize: 18 }} />}
                                sx={{ textTransform: "none", fontWeight: 700, bgcolor: accent, color: websiteSettings.textColor || "#fff", borderRadius: "8px", px: 2.6, height: 38, "&:hover": { bgcolor: accent, filter: "brightness(0.92)" } }}
                            >
                                Merge Siblings
                            </Button>
                        </Box>
                    </Box>
                </Box>


            </Box>
        </Box>
    );
}
