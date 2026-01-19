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


export default function ForgotPasswordPage() {
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
    const dispatch = useDispatch();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const websiteSettings = useSelector(selectWebsiteSettings); 

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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
                throw new Error("Access denied. Only admins and staff can log in.");
            }
            dispatch(loginSuccess({ name, rollNumber, userType, grade, section }));
            setActivateSuccess(true);
            setActivateError(false);
            setTimeout(() => {
                navigate("/dashboardmenu/dashboard");
            }, 1000);


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
        <Box >
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box sx={{ height: "60px", display:"flex", alignItems:"center", pl:2 }}>
                <img src={productLogo} width={"150px"} alt="logo" />
            </Box>
            <Box>
                <Box sx={{ backgroundColor: websiteSettings.backgroundColor }}>
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
                                }}
                            >
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
                                <Slider style={{ backgroundColor: "#FFFDF7", padding: "0px", boxShadow: "none" }} {...settings}>
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
                                        <img src={websiteSettings.logo} height={100} alt="Logo" />
                                    </Box>
                                    <Typography sx={{ mt: 5, fontWeight: 600 }} variant='h5'> Forgot </Typography>
                                    <Typography sx={{ mt: 2, fontWeight: 600 }} variant='h5'> Your Password </Typography>

                                    <Form onSubmit={handleSubmit}>
                                        <TextField
                                            className='textFieldStyle'
                                            sx={{
                                                width: "100%",
                                                mt: 4,
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: "black",
                                                        borderWidth: "1px",
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "black",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "black",
                                                    },
                                                }
                                            }}
                                            id="outlined-new-password"
                                            label="Enter Old Password"
                                            variant="outlined"
                                            type={showPassword ? 'text' : 'password'}
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            required
                                            autoComplete='off'
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={togglePasswordVisibility}
                                                            edge="end"
                                                        >
                                                            {showPassword ? <VisibilityIcon style={{ color: '#000' }} /> : <VisibilityOffIcon style={{ color: '#000' }} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        /> 
                                        <TextField
                                            className='textFieldStyle'
                                            sx={{
                                                width: "100%",
                                                mt: 3,
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: "black",
                                                        borderWidth: "1px",
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "black",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "black",
                                                    },
                                                }
                                            }}
                                            id="outlined-new-password"
                                            label="Enter New Password"
                                            variant="outlined"
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            autoComplete='off'
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={togglePasswordVisibility}
                                                            edge="end"
                                                        >
                                                            {showPassword ? <VisibilityIcon style={{ color: '#000' }} /> : <VisibilityOffIcon style={{ color: '#000' }} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        <TextField
                                            className='textFieldStyle'
                                            sx={{
                                                width: "100%",
                                                mt: 3,
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: "black",
                                                        borderWidth: "1px",
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "black",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "black",
                                                    },
                                                }
                                            }}
                                            id="outlined-confirm-password"
                                            label="Confirm New Password"
                                            variant="outlined"
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            autoComplete='off'
                                            InputProps={{ 
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={togglePasswordVisibility}
                                                            edge="end"
                                                        >
                                                            {showPassword ? <VisibilityIcon style={{ color: '#000' }} /> : <VisibilityOffIcon style={{ color: '#000' }} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        <Box sx={{ mt: 4 }}>
                                            <Grid container spacing={0}>
                                                <Grid size={6}>
                                                    <Button
                                                        type='submit'
                                                        disabled={!isButtonEnabled}
                                                        sx={{
                                                            backgroundColor: isButtonEnabled ? websiteSettings.mainColor : websiteSettings.lightColor,
                                                            "&.Mui-disabled": {
                                                                backgroundColor: websiteSettings.lightColor
                                                            }
                                                        }}
                                                        className='LoginButton'
                                                        variant="contained"
                                                    >
                                                        Login
                                                    </Button>
                                                </Grid>

                                                <Grid sx={{ display: "flex", justifyContent: "end" }} size={6}>
                                                    <Typography sx={{ p: 3 }}> Want to Login? <span style={{ color: "#ffb71e" }}>
                                                        <Link to="/" style={{ color: websiteSettings.mainColor, textDecoration: "none" }}>
                                                            Click here
                                                        </Link></span> </Typography>
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
