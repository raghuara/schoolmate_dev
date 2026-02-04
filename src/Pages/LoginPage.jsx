import { Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { motion } from 'framer-motion';
import Logo from "../Images/Login/MSMSLogo.png";
import slider1 from "../Images/Login/01.png";
import slider2 from "../Images/Login/02.png";
import slider3 from "../Images/Login/03.png";
import LoginImage from "../Images/Login/image.jpg";
import "../Css/Style.css";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Login } from '../Api/Api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Form } from 'react-bootstrap';
import SnackBar from '../Components/SnackBar';
import Loader from '../Components/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { selectWebsiteSettings } from '../Redux/Slices/websiteSettingsSlice';
import Slider from 'react-slick';
import ErrorIcon from '@mui/icons-material/Error';
import { loginSuccess } from '../Redux/Slices/AuthSlice';
import { generateToken } from '../Components/Notification/Firebase';
import productLogo from '../Images/Login/SchoolMate Logo.png'
import SchoolLogo from '../Images/Login/MSMSLogo.png'
import { broadcastLogin, generateSessionId } from '../Redux/Slices/sessionManager';

export default function LoginPage() {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const token = '123';
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [activateError, setActivateError] = useState(false);
    const [activateSuccess, setActivateSuccess] = useState(false);
    const fcmToken = localStorage.getItem("fcmToken")
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const dispatch = useDispatch();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };


    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 3500,
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 1, slidesToScroll: 1 },
            },
            {
                breakpoint: 600,
                settings: { slidesToShow: 1, slidesToScroll: 1 },
            },
            {
                breakpoint: 480,
                settings: { slidesToShow: 1, slidesToScroll: 1 },
            },
        ],
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await axios.post(Login,
                {
                    userName: userId,
                    password: password,
                    FCM: fcmToken || "123",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Logged in successfully");

            const { name, rollNumber, userType, grade, section } = res.data.data;

            if (!["superadmin", "admin", "staff", "teacher"].includes(userType)) {
                setOpen(true);
                setStatus(false);
                setColor(false);
                setMessage("Access denied. Only admins and staff can log in.");
                setActivateError(true);
                setActivateSuccess(false);
                return;
            }
            const sessionId = generateSessionId();
            localStorage.setItem("sessionId", sessionId);
            broadcastLogin(sessionId);

            dispatch(loginSuccess({ name, rollNumber, userType, grade, section }));
            setActivateSuccess(true);
            setActivateError(false);
            setTimeout(() => {
                navigate("/dashboardmenu/dashboard");
            }, 500);

        } catch (error) {
            setActivateError(true);
            setActivateSuccess(false);
            console.error("An error occurred:", error);
            setOpen(true);
            setStatus(true);
            setColor(false);
            setMessage("Incorrect username or password.");
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonEnabled = userId.trim() !== '' && password.trim() !== '';

    return (
        <Box sx={{ height: "100vh", width: "100%" }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <Grid container sx={{ height: "100%" }}>
                {/* Slider Section - Left Side */}
                <Grid
                    sx={{
                        backgroundColor: "#FFFBE2",
                        display: { xs: "none", md: "flex" },
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        p: 3,
                        height: "100%"
                    }}
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 6,
                        lg: 6
                    }}
                >
                    

                    <motion.img
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{
                            width: "100%",
                            maxHeight: "100%",
                            height: "auto",
                            display: "block",
                            objectFit: "contain"
                        }}
                        src={LoginImage}
                        alt="sliderimg"
                    />
                </Grid>

                {/* Login Form Section - Right Side */}
                <Grid
                    sx={{
                        backgroundColor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center", 
                        p: { xs: 3, md: 4 },
                        height: "100%"  
                    }}
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 6,
                        lg: 6
                    }}
                >
                   
                    
                    <Box sx={{ width: "100%", maxWidth: "460px", position: "relative", zIndex: 1 }}>
                        {/* Title */}
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                            <motion.img
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: [0, -10, 0]
                                }}
                                transition={{
                                    opacity: { duration: 0.5, ease: "easeOut" },
                                    scale: { duration: 0.5, ease: "easeOut" },
                                    y: {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.5
                                    }
                                }}
                                src={SchoolLogo}
                                alt="logo"
                                width={"100px"}
                            />
                        </Box>
                        <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: { xs: "28px", md: "32px" },
                                        color: "#1a202c",
                                        mb: 0.5,
                                        letterSpacing: "-1px"
                                    }}
                                >
                                    Welcome Back
                                </Typography>
                                <Typography
                                    sx={{
                                        fontWeight: 400,
                                        fontSize: "14px",
                                        color: "#718096",
                                    }}
                                >
                                    Please login to continue to your account
                                </Typography>
                            </motion.div>
                        </Box>

                        {/* Form */}
                        <Form onSubmit={handleSubmit}>
                            {/* Username Field */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                            >
                            <Box sx={{ mb: 2.5 }}>
                                <Typography
                                    sx={{
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        color: "#2d3748",
                                        mb: 1
                                    }}
                                >
                                    Login ID
                                </Typography>
                                <TextField
                                    fullWidth
                                    id="outlined-username"
                                    placeholder="Enter your unique ID"
                                    variant="outlined"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "12px",
                                            backgroundColor: "#f7fafc",
                                            transition: "all 0.2s",
                                            "& fieldset": {
                                                borderColor: activateError ? "#f56565" : activateSuccess ? "#48bb78" : "#e2e8f0",
                                                borderWidth: "2px",
                                            },
                                            "&:hover": {
                                                backgroundColor: "#edf2f7",
                                                "& fieldset": {
                                                    borderColor: activateError ? "#f56565" : activateSuccess ? "#48bb78" : "#cbd5e0",
                                                }
                                            },
                                            "&.Mui-focused": {
                                                backgroundColor: "#ffffff",
                                                "& fieldset": {
                                                    borderColor: activateError ? "#f56565" : activateSuccess ? "#48bb78" : "#4299e1",
                                                    borderWidth: "2px",
                                                }
                                            },
                                            "& input": {
                                                padding: "15px 18px",
                                                fontSize: "15px",
                                                color: "#2d3748",
                                                fontWeight: 500,
                                            },
                                        }
                                    }}
                                />
                                {activateError && (
                                    <Typography
                                        sx={{
                                            color: "#f56565",
                                            mt: 1,
                                            fontSize: "13px",
                                            display: "flex",
                                            alignItems: "center",
                                            fontWeight: 500
                                        }}
                                    >
                                        <ErrorIcon sx={{ fontSize: "17px", mr: 0.5 }} />
                                        Incorrect Unique ID
                                    </Typography>
                                )}
                            </Box>
                            </motion.div>

                            {/* Password Field */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                            >
                            <Box sx={{ mb: 1.5 }}>
                                <Typography
                                    sx={{
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        color: "#2d3748",
                                        mb: 1
                                    }}
                                >
                                    Password
                                </Typography>
                                <TextField
                                    fullWidth
                                    id="outlined-password"
                                    placeholder="Enter your password"
                                    variant="outlined"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete='off'
                                    inputProps={{
                                        onCopy: (e) => e.preventDefault(),
                                        onPaste: (e) => e.preventDefault(),
                                        onCut: (e) => e.preventDefault(),
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={togglePasswordVisibility}
                                                    edge="end"
                                                    sx={{
                                                        color: "#718096",
                                                        "&:hover": {
                                                            backgroundColor: "rgba(0,0,0,0.04)"
                                                        }
                                                    }}
                                                >
                                                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "12px",
                                            backgroundColor: "#f7fafc",
                                            transition: "all 0.2s",
                                            "& fieldset": {
                                                borderColor: activateError ? "#f56565" : activateSuccess ? "#48bb78" : "#e2e8f0",
                                                borderWidth: "2px",
                                            },
                                            "&:hover": {
                                                backgroundColor: "#edf2f7",
                                                "& fieldset": {
                                                    borderColor: activateError ? "#f56565" : activateSuccess ? "#48bb78" : "#cbd5e0",
                                                }
                                            },
                                            "&.Mui-focused": {
                                                backgroundColor: "#ffffff",
                                                "& fieldset": {
                                                    borderColor: activateError ? "#f56565" : activateSuccess ? "#48bb78" : "#4299e1",
                                                    borderWidth: "2px",
                                                }
                                            },
                                            "& input": {
                                                padding: "15px 18px",
                                                fontSize: "15px",
                                                color: "#2d3748",
                                                fontWeight: 500,
                                            },
                                        }
                                    }}
                                />
                                {activateError && (
                                    <Typography
                                        sx={{
                                            color: "#f56565",
                                            mt: 1,
                                            fontSize: "13px",
                                            display: "flex",
                                            alignItems: "center",
                                            fontWeight: 500
                                        }}
                                    >
                                        <ErrorIcon sx={{ fontSize: "17px", mr: 0.5 }} />
                                        Incorrect Password
                                    </Typography>
                                )}
                            </Box>
                            </motion.div>

                            {/* Forgot Password */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                            >
                            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
                                <motion.div
                                    animate={{
                                        opacity: [1, 0.7, 1]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Link
                                        to="#"
                                        style={{
                                            color: "#4299e1",
                                            textDecoration: "none",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Forgot Password?
                                    </Link>
                                </motion.div>
                            </Box>
                            </motion.div>

                            {/* Login Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: isButtonEnabled ? [1, 1.02, 1] : 1
                                }}
                                transition={{
                                    opacity: { duration: 0.5, delay: 0.7, ease: "easeOut" },
                                    y: { duration: 0.5, delay: 0.7, ease: "easeOut" },
                                    scale: isButtonEnabled ? {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 1
                                    } : { duration: 0 }
                                }}
                            >
                            <Button
                                type='submit'
                                fullWidth
                                disabled={!isButtonEnabled}
                                variant="contained"
                                sx={{
                                    backgroundColor: isButtonEnabled ? "#4299e1" : "#e2e8f0",
                                    color: isButtonEnabled ? "#ffffff" : "#a0aec0",
                                    padding: "12px 24px",
                                    fontSize: "16px",
                                    fontWeight: 700,
                                    borderRadius: "999px",
                                    textTransform: "none",
                                    boxShadow: "none",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: isButtonEnabled ? "#3182ce" : "#e2e8f0",
                                        transform: isButtonEnabled ? "translateY(-2px)" : "none",
                                        boxShadow: isButtonEnabled ? "0 6px 20px rgba(66, 153, 225, 0.5)" : "none",
                                    },
                                    "&.Mui-disabled": {
                                        backgroundColor: "#e2e8f0",
                                        color: "#a0aec0"
                                    }
                                }}
                            >
                                Login
                            </Button>
                            </motion.div>

                            {/* Footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [1, 0.6, 1] }}
                                transition={{
                                    opacity: {
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 1
                                    }
                                }}
                            >
                            <Box sx={{ mt: 3, textAlign: "center" }}>
                                <Typography sx={{ fontSize: "13px", color: "#a0aec0", mb: 1 }}>
                                    Secure Login • SchoolMate © 2024
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#cbd5e0" }}>
                                    Protected by enterprise-grade security
                                </Typography>
                            </Box>
                            </motion.div>
                        </Form>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}