import { Autocomplete, Box, Button, Divider, Grid, IconButton, InputAdornment, List, ListItemButton, ListItemText, Paper, Popover, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../../Redux/Slices/DropdownController';
import AddIcon from '@mui/icons-material/Add';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const items = [
  
    {
        color: "#8600BB",
        icon: DashboardIcon,
        text: "Finance Dashboard",
        bgColor: "#f9f4fc",
        iconBgColor: "#8600BB1A",
        path: "dashboard",
        disabled: false,
    },
    {
        color: "#E30053",
        icon: PaymentIcon,
        text: "Billing Screen",
        bgColor: "#FCF8F9",
        iconBgColor: "#fbebf1",
        path: "pay-fees",
        disabled: false,
    },
    // {
    //     color: "#FF6B35",
    //     icon: DashboardIcon,
    //     text: "Finance Dashboard",
    //     bgColor: "#FFF5F2",
    //     iconBgColor: "#FF6B351A",
    //     path: "dashboard",
    //     disabled: false,
    // },
    // {
    //     color: "#8600BB",
    //     icon: ReceiptLongIcon,
    //     text: "Report",
    //     bgColor: "#f9f4fc",
    //     iconBgColor: "#8600BB1A",
    //     path: "report",
    //     disabled: false,
    // },
    {
        color: "#3457D5",
        icon: SportsSoccerIcon,
        text: "ECA Management",
        bgColor: "#eaeefa5A",
        iconBgColor: "#3457D51A",
        path: "eca-manage",
        disabled: false,
    },
    {
        color: "#FF6B35",
        icon: AddBoxIcon,
        text: "Additional Fee Management",
        bgColor: "#FFF5F2",
        iconBgColor: "#FF6B351A",
        path: "additional-manage",
        disabled: false,
    },
    {
        color: "#7DC353",
        icon: AccountBalanceWalletIcon,
        text: "Expense",
        bgColor: "#CFE8BB1A",
        iconBgColor: "#7DC3531A",
        path: "expense",
        disabled: false,
    },
];

export default function FeeFinancePage() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("");
    const websiteSettings = useSelector(selectWebsiteSettings);
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];

    useEffect(() => {
        if (grades && grades.length > 0) {
            setSelectedGradeId(grades[0].id);
            setSelectedSection(grades[0].sections[0]);
        }
    }, [grades]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const open = Boolean(anchorEl);
    const id = open ? "fee-structure-popover" : undefined;

    const feeTypes = [
        "School Fee",
        "Transport Fee",
        "Extra curricular Activities Fees",
        "Additional Fee",
    ];

    const handleFeeSelect = (fee) => {
        handleClose();

        switch (fee) {
            case "School Fee":
                navigate("school");
                break;
            case "Transport Fee":
                navigate("transport");
                break;
            case "Extra curricular Activities Fees":
                navigate("extra-curricular");
                break;
            case "Additional Fee":
                navigate("extra");
                break;
            default:
                break;
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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
                            <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                            </IconButton>
                            <Typography sx={{ fontSize: "20px", fontWeight: "600" }}> Fee & Finance </Typography>
                        </Box>
                    </Grid>
                    <Grid
                        size={{
                            lg: 6,
                            xs: 12,
                        }}>
                        <Grid container spacing={2} sx={{ display: 'flex', justifyContent: { lg: "end", xs: "center" } }}>
                            {/* <Grid
                                size={{
                                    lg: 5.3,
                                    md: 5.3,
                                    sm: 6,
                                    xs: 10,
                                }}
                            >
                                <Link to="concession">
                                    <Button sx={{ border: "1px solid #000", textTransform: "none", borderRadius: "50px", color: '#000', width: "100%" }}>
                                        <PersonAddAlt1Icon style={{ paddingRight: "10px", paddingLeft: "5px", }} />  Manage /Create Concession
                                    </Button>
                                </Link>
                            </Grid> */}
                            <Grid
                                size={{
                                    lg: 5.3,
                                    md: 5.3,
                                    sm: 6,
                                    xs: 10,
                                }}>
                                <Button aria-describedby={id} onClick={handleClick} sx={{ border: "1px solid #000", textTransform: "none", borderRadius: "50px", color: '#000', width: "100%" }}>
                                    <PersonAddAlt1Icon style={{ paddingRight: "10px", paddingLeft: "5px", }} />  Create New Fee Structure
                                </Button>
                                <Popover
                                    id={id}
                                    open={open}
                                    anchorEl={anchorEl}
                                    onClose={handleClose}
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "center",
                                    }}
                                    transformOrigin={{
                                        vertical: "top",
                                        horizontal: "center",
                                    }}
                                    PaperProps={{
                                        sx: {
                                            bgcolor: "#000",
                                            color: "#fff",
                                            borderRadius: "5px",
                                            mt: 1,
                                            width: "190px",
                                            padding: "10px"
                                        },
                                    }}
                                >
                                    <List disablePadding>
                                        {feeTypes.map((fee) => (
                                            <ListItemButton
                                                key={fee}
                                                onClick={() => handleFeeSelect(fee)}
                                                sx={{
                                                    color: "#fff",
                                                    "&:hover": { bgcolor: "#333" },
                                                    fontSize: "12px",
                                                    p: "5px",
                                                    borderRadius: "3px"
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "12px !important" }}>
                                                    {fee}
                                                </Typography>
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Popover>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

            </Box>
            <Divider sx={{ pt: 2 }} />

            <Grid container spacing={2} >
                {items.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                        <Grid
                            sx={{ display: "flex", justifyContent: "center", pb: 1.5, mb: 1, mt: 3 }}
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
                                        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
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
                                    <Grid container spacing={1} sx={{ height: '100%', px: 2, }}>
                                        <Grid
                                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                            size={{
                                                md: 0.5
                                            }}>
                                            <Box
                                                sx={{
                                                    width: '7px',
                                                    backgroundColor: item.color,
                                                    height: '100%',
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    borderTopLeftRadius: '5px',
                                                    borderBottomLeftRadius: '5px',
                                                }}
                                            />
                                        </Grid>
                                        <Grid
                                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                            size={{
                                                md: 2
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
                                                {/* <img src={item.icon} width={25} height={25} /> */}
                                                <IconComponent sx={{ color: item.color, fontSize: "23px" }} />
                                            </Box>
                                        </Grid>
                                        <Grid
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            size={{
                                                md: 7
                                            }}>
                                            <Typography sx={{ fontWeight: "600", color: "#000" }}>
                                                {item.text}
                                            </Typography>
                                        </Grid>
                                        <Grid
                                            sx={{
                                                display: 'flex',
                                                justifyContent: "center",
                                                alignItems: 'center',
                                                height: '100%'
                                            }}
                                            size={{
                                                md: 2
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