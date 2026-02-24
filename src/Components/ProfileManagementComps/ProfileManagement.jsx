import { Box, Divider, Grid, IconButton, Typography } from '@mui/material'
import React from 'react'
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BoyIcon from '@mui/icons-material/Boy';
import Person4Icon from '@mui/icons-material/Person4';

const items = [
    {
        color: "#E30053",
        icon: BoyIcon,
        text: "Student",
        bgColor: "#FCF8F9",
        iconBgColor: "#fbebf1",
        path: "student/information",
        disabled: false,
        size: "35px"
    },
    {
        color: "#8600BB",
        icon: Person4Icon,
        text: "Staff",
        bgColor: "#f9f4fc",
        iconBgColor: "#F7F0F9",
        path: "staff",
        disabled: false,
        size: "30"
    },
];

export default function ProfileManagement() {
    const navigate = useNavigate()
    const user = useSelector((state) => state.auth);
    const userType = user.userType;

    return (
        <Box sx={{ border: "1px solid #ccc", borderRadius: "20px", p: 2, height: "86vh" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Grid container spacing={2} sx={{ width: "100%" }}>
                    <Grid
                        size={{
                            lg: 6,
                            xs: 12,
                        }}>
                        <Box sx={{ display: "flex" }}>
                            <IconButton  onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                            </IconButton>
                            <Typography sx={{ fontSize: "20px", fontWeight: "600" }}> Profile Management </Typography>
                        </Box>
                    </Grid>

                </Grid>

            </Box>
            <Divider sx={{ pt: 2 }} />

            <Grid container spacing={2} >
                {items.filter(item => item.text !== "Staff" || userType === "superadmin" || userType === "admin").map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                        <Grid
                            sx={{ display: "flex", justifyContent: "center", pb: 6, mb: 1, mt: 3 }}
                            key={index}
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 3,
                                lg: 3
                            }}>
                            <Link
                                to={item.disabled ? "#" : item.path}
                                state={{ value: 'Y' }}
                                style={{
                                    textDecoration: 'none',
                                    height: "60px",
                                    width: "100%",
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "relative",
                                        backgroundColor: item.bgColor,
                                        boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                                        width: "100%",
                                        height: "100px",
                                        borderRadius: "5px",
                                        cursor: item.disabled ? "not-allowed" : "pointer",
                                        opacity: item.disabled ? 0.6 : 1,
                                        transition: "0.3s",
                                        "&:hover": {
                                            ".arrowIcon": {
                                                opacity: item.disabled ? 0 : 1,
                                            },
                                        },
                                        "&::before": {
                                            content: '""',
                                            position: "absolute",
                                            left: 0,
                                            top: 0,
                                            height: "100%",
                                            width: "5px",
                                            borderTopLeftRadius: "10px",
                                            borderBottomLeftRadius: "10px",
                                            background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}99 100%)`,
                                        },
                                    }}
                                >
                                    <Grid container spacing={1} sx={{ height: '100%', px: 2, mt: 3 }}>
                                        <Grid
                                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                            size={{
                                                md: 3
                                            }}>
                                            <Box sx={{
                                                backgroundColor: item.iconBgColor,
                                                borderRadius: "50px",
                                                width: "25px",
                                                height: "25px",
                                                p: 1.3,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}>
                                                <IconComponent sx={{ color: item.color, fontSize: item.size }} />
                                            </Box>
                                        </Grid>
                                        <Grid
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            size={{
                                                md: 6
                                            }}>
                                            <Box>
                                                <Typography sx={{ fontWeight: "600", color: "#000", pl: 1 }}>
                                                    {item.text}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid
                                            sx={{
                                                display: 'flex',
                                                justifyContent: "center",
                                                alignItems: 'center',
                                                height: '100%'
                                            }}
                                            size={{
                                                md: 3
                                            }}>
                                            <ArrowForwardIcon className="arrowIcon" sx={{
                                                opacity: 0,
                                                transition: 'opacity 0.3s ease',
                                                color: item.color,
                                            }} />
                                        </Grid>
                                    </Grid>

                                </Box>
                            </Link>
                        </Grid>
                    )
                })}
            </Grid>
        </Box>
    )
}