import { Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Logo from "../Images/Login/MSMSLogo.png";
import slider1 from "../Images/Login/01.png";
import slider2 from "../Images/Login/02.png";
import slider3 from "../Images/Login/03.png";
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
        <Box
            sx={{
                backgroundColor: websiteSettings.backgroundColor,
                minHeight: "100vh",
                width: "100%",
                padding: 0,
                margin: 0,
            }}
        >
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box sx={{ backgroundColor: "#FFF", height: "60px", display: "flex", alignItems: "center", pl: 2 }}>
                <img src={productLogo} width={"150px"} alt="logo" />
            </Box>
            <Box>
                <Box >
                    <Grid container>
                        <Grid
                            sx={{ height: "100%" }}
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 4,
                                lg: 4.25
                            }}>
                            <Box
                                sx={{
                                    borderRadius: "6px",
                                }}>
                                <style>
                                    {`
                                .slick-dots{
                                  padding-bottom:15px !important;
                                }
                                .slick-dots li button {
                                    color: #fff !important;
                                }
                                .slick-dots li button:before {
                                    color: #fff !important;
                                }
                                .slick-dots li.slick-active button:before {
                                    background-color: #fff !important;
                                }
                                `}
                                </style>
                                <Slider style={{ padding: "0px", boxShadow: "none" }} {...settings}>
                                    <Box sx={{ borderRadius: "6px", position: "relative" }}>
                                        <img width={"100%"} src={slider1} alt="sliderimg" />
                                    </Box>
                                    <Box sx={{ borderRadius: "6px", position: "relative" }}>
                                        <img width={"100%"} src={slider2} alt="sliderimg" />
                                    </Box>
                                    <Box sx={{ borderRadius: "6px", position: "relative" }}>
                                        <img width={"100%"} src={slider3} alt="sliderimg" />
                                    </Box>
                                </Slider>
                            </Box>
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 8,
                                lg: 7.5
                            }}>
                            <Grid container spacing={0} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Grid
                                    size={{
                                        xs: 8,
                                        md: 8,
                                        lg: 8
                                    }}>
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", pt: 5 }}>
                                        <img src={SchoolLogo} height={110} alt="Logo" />
                                    </Box>

                                    <Typography sx={{ mt: 7, fontWeight: 600 }} variant='h5'> Log Into your </Typography>
                                    <Typography sx={{ mt: 1, fontWeight: 700 }} variant='h4'> MSMS account </Typography>
                                    <Form onSubmit={handleSubmit}>
                                        <TextField
                                            className='textFieldStyle'
                                            sx={{
                                                width: "100%",
                                                mt: 3,
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: activateError ? "red" : activateSuccess ? "green" : "black",
                                                        borderWidth: activateError ? "2px" : activateSuccess ? "2px" : "1px",
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: activateError ? "red" : activateSuccess ? "green" : "black",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: activateError ? "red" : activateSuccess ? "green" : "black",
                                                    },
                                                    "& input": {
                                                        color: activateError ? "red" : activateSuccess ? "green" : "#000",
                                                    },
                                                }
                                            }}
                                            id="outlined-username"
                                            placeholder="Enter Unique ID"
                                            variant="outlined"
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                        />
                                        {activateError &&
                                            <Typography sx={{ color: "red", mt: 0.5, fontSize: "14px", display: "flex", alignItems: "center" }}>
                                                <ErrorIcon style={{ fontSize: "20px", marginRight: "5px" }} /> Enter Correct Unique ID</Typography>
                                        }

                                        <TextField
                                            className='textFieldStyle'
                                            sx={{
                                                width: "100%",
                                                mt: 3,
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: activateError ? "red" : activateSuccess ? "green" : "black",
                                                        borderWidth: activateError ? "2px" : activateSuccess ? "2px" : "1px",
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: activateError ? "red" : activateSuccess ? "green" : "black",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: activateError ? "red" : activateSuccess ? "green" : "black",
                                                    },
                                                    "& input": {
                                                        color: activateError ? "red" : activateSuccess ? "green" : "#000",
                                                    },
                                                }
                                            }}
                                            id="outlined-password"
                                            placeholder="Enter Password"
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
                                                        >
                                                            {showPassword ? <VisibilityIcon style={{ color: '#000' }} /> : <VisibilityOffIcon style={{ color: activateError ? "red" : activateSuccess ? "green" : '#000' }} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        {activateError &&
                                            <Typography sx={{ color: "red", mt: 0.5, fontSize: "14px", display: "flex", alignItems: "center" }}>
                                                <ErrorIcon style={{ fontSize: "20px", marginRight: "5px" }} /> Enter Correct Password</Typography>
                                        }

                                        <Box sx={{ mt: 4 }}>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid
                                                    size={{
                                                        xs: 12,
                                                        sm: 6
                                                    }}>
                                                    <Button
                                                        type='submit'
                                                        disabled={!isButtonEnabled}
                                                        sx={{
                                                            backgroundColor: isButtonEnabled ? websiteSettings.mainColor : websiteSettings.lightColor,
                                                            color: websiteSettings.textColor,
                                                            "&.Mui-disabled": {
                                                                backgroundColor: websiteSettings.lightColor
                                                            },
                                                            width: { xs: "100%", sm: "auto" }
                                                        }}
                                                        className='LoginButton'
                                                        variant="contained"
                                                    >
                                                        Login
                                                    </Button>
                                                </Grid>

                                                <Grid
                                                    sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-end" } }}
                                                    size={{
                                                        xs: 12,
                                                        sm: 6
                                                    }}>
                                                    <Typography sx={{ p: { xs: 1, sm: 3 }, textAlign: { xs: "center", sm: "right" } }}>
                                                        Forgot Password?{" "}
                                                        <Link
                                                            to="#"
                                                            style={{ color: websiteSettings.mainColor, textDecoration: "none" }}
                                                        >
                                                            Click here
                                                        </Link>
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Form>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}