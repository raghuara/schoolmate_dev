import React, { useEffect, useRef, useState } from "react";
import { Dialog, IconButton, Box, Typography, Grid, TextField, Button, } from "@mui/material";
import Loader from "../../Loader";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
                <Box sx={{ px: 2, py: 2 }}>
                    <Box
                        sx={{
                            borderRadius: 2,
                            border: "1px solid #ccc",
                            p: 3,
                            height: "70vh",
                            position: "relative"
                        }}
                    >
                        <Typography sx={{ fontWeight: 600, fontSize: "16px", mb: 2 }}>
                            Enter Sibling Details
                        </Typography>

                        <Grid container spacing={2}>
                            {siblings.map((sibling, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                    <TextField
                                        fullWidth
                                        label={`Sibling ${index + 1} Roll Number`}
                                        size="small"
                                        value={sibling}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                    />
                                </Grid>
                            ))}
                        </Grid>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2, position: "absolute", bottom: "20px", right: "20px" }}>
                            <Button
                                style={{
                                    background: "#F2F2F2",
                                    border: "1px solid #ddd",
                                    padding: "6px 18px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                style={{
                                    background: websiteSettings.mainColor,
                                    color: websiteSettings.textColor,
                                    border: "none",
                                    padding: "6px 18px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}

                            >
                                Save
                            </Button>
                        </Box>
                    </Box>
                </Box>


            </Box>
        </Box>
    );
}
