import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { Autocomplete, Button, Card, Grid, IconButton, InputAdornment, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import BusImage from "../../../../Images/PagesImage/bus.png"
import { getAllVehicleDetails } from '../../../../Api/Api';
import axios from 'axios';

export default function VehicleDetailsPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = "123";
    const user = useSelector((state) => state.auth)
    const rollNumber = user.rollNumber;
    const userType = user.userType

    const grades = useSelector(selectGrades);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [openCal, setOpenCal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const [searchQuery, setSearchQuery] = useState("");
    const [vehicleDetails, setVehicleDetails] = useState([]);

    const handleViewEditClick = (id) => {
        navigate("view", {state:{vehicleId:id}})
    }

    useEffect(() => {
        getUsers()
    }, []);

    const getUsers = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getAllVehicleDetails, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setVehicleDetails(res.data?.data || []);
        } catch (error) {
            console.error("Error while inserting news data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredVehicleDetails = vehicleDetails.filter((vehicle) => {
        if (!searchQuery.trim()) return true;
    
        const query = searchQuery.toLowerCase();
    
        return (
            vehicle.busInternalName?.toLowerCase().includes(query) ||
            vehicle.registrationNumber?.toLowerCase().includes(query)
        );
    });
    
    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderBottom: "1px solid #ddd", mb: 0.13, width: "100%", py: 1 }}>
                <Grid container px={2}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }} sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px', }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: "600", fontSize: "19px" }} >Vehicle  Details</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search by vehicle Name or vehicle number"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                sx: {
                                    padding: "0 10px",
                                    borderRadius: "50px",
                                    height: "30px",
                                    fontSize: "12px",
                                },
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    minHeight: "28px",
                                    paddingRight: "3px",
                                    backgroundColor: "#fff",
                                },
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: websiteSettings.mainColor,
                                },
                            }}

                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }} sx={{ display: "flex", alignItems: "center", justifyContent: "end" }}>
                        <Button
                            onClick={() => navigate("add")}
                            variant="outlined"
                            sx={{
                                borderColor: "#A9A9A9",
                                backgroundColor: "#000",
                                py: 0.3,
                                width: "150px",
                                height: "30px",
                                color: "#fff",
                                textTransform: "none",
                                border: "none",
                                mr: 2
                            }}
                        >
                            <AddIcon sx={{ fontSize: "18px" }} />
                            &nbsp;Vehicle
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ p: 2, height: "80vh", overflowY: "auto" }}>
                <Grid container spacing={4}>
                   {filteredVehicleDetails.map((vehicle) => (
                        <Grid key={vehicle.id} size={{ xs: 12, sm: 12, md: 6, lg: 4 }}>
                            <Box sx={{ backgroundColor: "#8600BB", borderTopLeftRadius: "10px", borderTopRightRadius: "10px", color: "#fff", pl: 1.5, py: 0.5 }}>
                                Bus Internal Name : {vehicle.busInternalName}
                            </Box>
                            <Grid container spacing={4} sx={{ p: 2, border: "1px solid #D98AA6", backgroundColor: "rgba(255, 0, 4, 0.03)" }}>
                                <Grid size={{ xs: 7, sm: 7, md: 7, lg: 7 }}>

                                    <Typography sx={{ fontSize: "16px", color: "#B0B0B0", mt: 1 }}>Registration number </Typography>
                                    <Typography sx={{ fontSize: "14px", color: "#555", fontWeight: "600", display: "flex", alignItems: "center" }}><DirectionsBusIcon />  &nbsp;{vehicle.registrationNumber} </Typography>

                                    <Typography sx={{ fontSize: "14px", color: "#B0B0B0", mt: 1 }}>Seat capacity </Typography>
                                    <Typography sx={{ fontSize: "14px", color: "#555", fontWeight: "600", display: "flex", alignItems: "center" }}><DirectionsBusIcon /> &nbsp;{vehicle.totalSeatsCount}+1 (Driver)</Typography>

                                    <Typography sx={{ fontSize: "14px", color: "#B0B0B0", mt: 1 }}>Bus Modal & Make Year </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: "14px",
                                            color: "#555",
                                            fontWeight: "600",
                                            display: "flex",
                                            alignItems: "center"
                                        }}
                                    >
                                        <DirectionsBusIcon />
                                        &nbsp;
                                        {vehicle.vehicleBrand || vehicle.manufacturingYear
                                            ? `${vehicle.vehicleBrand || ""}${vehicle.vehicleBrand && vehicle.manufacturingYear ? " - " : ""}${vehicle.manufacturingYear || ""}`
                                            : "-"
                                        }
                                    </Typography>


                                </Grid>

                                <Grid size={{ xs: 5, sm: 5, md: 5, lg: 5 }} >
                                    <Box sx={{ backgroundColor: "#fff", width: "100%", borderRadius: "10px", py: 1, display: "flex", justifyContent: "center" }}>
                                        <img src={BusImage} style={{ maxHeight: "100px", maxWidth: "120px" }} alt="bus" />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ marginTop: "-10px" }}>
                                    <Button
                                    onClick={() => handleViewEditClick(vehicle.id)}
                                        sx={{ width: "100%", border: "1px solid #00963C", color: "#00963C", textTransform: "none", borderRadius: "999px" }}
                                    >
                                        View details / Edit
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>

                    ))}

                </Grid>

            </Box>
        </Box>
    )
}
