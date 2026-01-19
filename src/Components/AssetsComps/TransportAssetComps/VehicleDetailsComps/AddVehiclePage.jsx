import React, { useState } from 'react'
import { Box } from '@mui/system'
import {
    Autocomplete,
    Button,
    Card,
    Grid,
    IconButton,
    InputAdornment,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    Paper,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { selectGrades } from '../../../../Redux/Slices/DropdownController'
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice'
import axios from 'axios'
import { postVehicle } from '../../../../Api/Api'

/* ---------- Common Styles ---------- */
const labelSx = {
    fontSize: '13px',
    fontWeight: 600,
    mb: 0.5,
    color: '#333'
}

const inputSx = {
    '& .MuiInputBase-root': {
        height: 40,
        fontSize: '14px'
    }
}

const selectSx = {
    height: 40,
    fontSize: '14px'
}

export default function AddVehiclePage() {
    const navigate = useNavigate()
    const token = "123";
    const user = useSelector((state) => state.auth)
    const rollNumber = user.rollNumber;
    const grades = useSelector(selectGrades)
    const websiteSettings = useSelector(selectWebsiteSettings)

    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [status, setStatus] = useState(false)
    const [color, setColor] = useState(false)
    const [message, setMessage] = useState('')

    const [isDisabledPrimary, setIsDisabledPrimary] = useState(false)

    const [busName, setBusName] = useState('')
    const [vehicleType, setVehicleType] = useState(null);
    const [vehicleBrand, setVehicleBrand] = useState('')
    const [registrationNumber, setRegistrationNumber] = useState('')
    const [totalSeats, setTotalSeats] = useState(0)
    const [manufacturingYear, setManufacturingYear] = useState(0)
    const [fuelType, setFuelType] = useState(null);

    const handleClear = () => {
        setBusName('');
        setVehicleType(null);
        setVehicleBrand('');
        setRegistrationNumber('');
        setTotalSeats('');
        setManufacturingYear('');
        setFuelType(null);
    };


    const handleSubmit = async () => {
        if (!busName || !vehicleType || !registrationNumber || !totalSeats) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Please fill all required fields");
            return;
        }
        setIsLoading(true);

        try {
            const sendData = {
                rollNumber: rollNumber,
                busInternalName: busName,
                vehicleType: vehicleType,
                registrationNumber: registrationNumber,
                totalSeatsCount: totalSeats,
                vehicleBrand: vehicleBrand,
                manufacturingYear: manufacturingYear || 0,
                fuel: fuelType || "",
            }

            const res = await axios.post(postVehicle, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("New Vehicle Added Successfully");

            setBusName('');
            setVehicleType(null);
            setVehicleBrand('');
            setRegistrationNumber('');
            setTotalSeats('');
            setManufacturingYear('');
            setFuelType(null);

        } catch (error) {
            setMessage("An error occurred while creating the message.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <SnackBar
                open={open}
                color={color}
                setOpen={setOpen}
                status={status}
                message={message}
            />

            {isLoading && <Loader />}

            {/* ---------- Header ---------- */}
            <Box
                sx={{
                    backgroundColor: '#f2f2f2',
                    px: 2,
                    py: 1,
                    borderBottom: '1px solid #ddd'
                }}
            >
                <Grid container alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }} display="flex" alignItems="center">
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{ width: 28, height: 28 }}
                        >
                            <ArrowBackIcon sx={{ fontSize: 20 }} />
                        </IconButton>

                        <Typography sx={{ fontWeight: 600, fontSize: 19, ml: 1 }}>
                            Add New Vehicle Details
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* ---------- Form ---------- */}
            <Box sx={{ p: 2, }}>
                <Box sx={{ position: "relative", backgroundColor: "#FFF", border: "1px solid #ccc", }}>
                    <Box
                        sx={{
                            backgroundColor: '#FFF1F1',
                            p: 1.5,
                            mb: 3,
                            borderBottom: "1px solid #ccc",

                        }}
                    >
                        <Typography fontWeight={600}>
                            Primary Bus Detail
                        </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ px: 2, pb: 5 }}>
                        <Grid size={{ xs: 12, lg: 2.4 }}>
                            <InputLabel sx={labelSx}>Bus Internal Name<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></InputLabel>
                            <TextField
                                fullWidth
                                value={busName}
                                sx={inputSx}
                                slotProps={{
                                    input: {
                                        maxLength: 100,
                                    },
                                }}
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (value.length > 60) return

                                    setBusName(value)
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, lg: 2.4 }}>
                            <InputLabel sx={labelSx}>Vehicle Type<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></InputLabel>
                            <Autocomplete
                                value={vehicleType || null}
                                options={['Bus', 'Van']}
                                onChange={(event, newValue) => {
                                    setVehicleType(newValue || "");
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        sx={inputSx}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, lg: 2.4 }}>
                            <InputLabel sx={labelSx}>Vehicle Brand</InputLabel>
                            <TextField
                                fullWidth
                                value={vehicleBrand}
                                sx={inputSx}
                                slotProps={{
                                    input: {
                                        maxLength: 100,
                                    },
                                }}
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (value.length > 50) return

                                    setVehicleBrand(value)
                                }
                                }
                            />
                        </Grid>

                        <Grid size={{ xs: 12, lg: 2.4 }}>
                            <InputLabel sx={labelSx}>Registration Number<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></InputLabel>
                            <TextField
                                fullWidth
                                value={registrationNumber}
                                sx={inputSx}
                                slotProps={{
                                    input: {
                                        maxLength: 100,
                                    },
                                }}
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (value.length > 50) return

                                    setRegistrationNumber(value)
                                }
                                }
                            />
                        </Grid>

                        <Grid size={{ xs: 12, lg: 2.4 }}>
                            <InputLabel sx={labelSx}>Total Seats Count<span style={{ color: "#ff0000", fontSize: "16px" }}>*</span></InputLabel>

                            <TextField
                                fullWidth
                                value={totalSeats}
                                sx={inputSx}
                                slotProps={{
                                    input: {
                                        inputMode: 'numeric',
                                        maxLength: 3
                                    }
                                }}
                                onChange={(e) => {
                                    const value = e.target.value

                                    if (value === '') {
                                        setTotalSeats('')
                                        return
                                    }

                                    if (!/^\d+$/.test(value)) return

                                    const numberValue = Number(value)

                                    if (numberValue < 0 || numberValue > 100) return

                                    setTotalSeats(value)
                                }}
                                onPaste={(e) => {
                                    const paste = e.clipboardData.getData('text')
                                    if (!/^\d+$/.test(paste) || Number(paste) > 100) {
                                        e.preventDefault()
                                    }
                                }}
                            />
                        </Grid>


                        <Grid size={{ xs: 12, lg: 2.4 }}>
                            <InputLabel sx={labelSx}>Manufacturing Year</InputLabel>
                            <TextField
                                fullWidth
                                value={manufacturingYear === 0 ? "" : manufacturingYear}
                                sx={inputSx}
                                placeholder="YYYY"
                                slotProps={{
                                    input: {
                                        inputMode: "numeric",
                                        maxLength: 4,
                                    },
                                }}
                                onFocus={() => {
                                    if (manufacturingYear === 0) {
                                        setManufacturingYear("");
                                    }
                                }}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    if (value === "") {
                                        setManufacturingYear(0);
                                        return;
                                    }

                                    if (!/^\d+$/.test(value)) return;
                                    if (value.length > 4) return;

                                    setManufacturingYear(Number(value));
                                }}
                                onBlur={() => {
                                    if (!manufacturingYear) {
                                        setManufacturingYear(0);
                                    }
                                }}
                                onPaste={(e) => {
                                    const paste = e.clipboardData.getData("text");
                                    if (!/^\d{4}$/.test(paste)) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, lg: 2.4 }}>
                            <InputLabel sx={labelSx}>Fuel Type</InputLabel>
                            <Autocomplete
                                value={fuelType}
                                options={["Petrol", "Diesel", "CNG", "Electric"]}
                                onChange={(event, newValue) => {
                                    setFuelType(newValue); 
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} sx={inputSx} />
                                )}
                            />


                        </Grid>
                    </Grid>

                    {/* ---------- Actions ---------- */}
                    <Box sx={{ position: "absolute", bottom: "10px", right: "10px", }}>
                        {!isDisabledPrimary &&
                            <>
                                <Button onClick={handleClear} sx={{ textTransform: "none", color: "#000", py: 0.2, fontSize: "12px", px: 2.5, borderRadius: "20px", border: "1px solid #000", mr: 2 }}>
                                    Clear
                                </Button>
                                <Button onClick={handleSubmit} sx={{ textTransform: "none", color: "#000", py: 0.2, px: 2.5, fontSize: "12px", borderRadius: "20px", backgroundColor: websiteSettings.mainColor }}>
                                    Save
                                </Button>
                            </>
                        }
                        {isDisabledPrimary &&
                            <Box sx={{ fontSize: "13px", color: "green", fontWeight: "600", display: "flex", justifyContent: "center", alignItems: "center" }}><CheckCircleIcon style={{ fontSize: "20px" }} />&nbsp; Saved</Box>
                        }
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
