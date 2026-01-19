import React, { useEffect, useState } from 'react'
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
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { selectGrades } from '../../../../Redux/Slices/DropdownController'
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice'
import axios from 'axios'
import { deleteVehicleById, getVehicleDetailById, postVehicle } from '../../../../Api/Api'
import BusImage from "../../../../Images/PagesImage/bus.png"
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ViewVehicleDetails() {
    const navigate = useNavigate()
    const token = "123";
    const user = useSelector((state) => state.auth)
    const rollNumber = user.rollNumber;
    const grades = useSelector(selectGrades)
    const websiteSettings = useSelector(selectWebsiteSettings)
    const location = useLocation();

    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [status, setStatus] = useState(false)
    const [color, setColor] = useState(false)
    const [message, setMessage] = useState('')

    const { vehicleId } = location.state || {}
    const [vehicleDetails, setVehicleDetails] = useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEditClick = (id) => {
        navigate("/dashboardmenu/asset/transport/details/edit", { state: { vehicleId: id } })
    }

    useEffect(() => {
        getUsers()
    }, []);

    const getUsers = async () => {
        console.log(vehicleId, "vehicleId")
        setIsLoading(true);
        try {
            const res = await axios.get(getVehicleDetailById, {
                params: {
                    id: vehicleId
                },
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

    const handleDeleteVehicle = async () => {
        setIsDeleting(true);
        try {
            await axios.delete(deleteVehicleById, {
                params: { 
                    id: vehicleDetails.id },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage("Vehicle deleted successfully");
            setColor(true);
            setStatus(true);
            setOpen(true);

            setOpenDeleteDialog(false);

            setTimeout(() => {
                navigate(-1);
            }, 800);

        } catch (error) {
            console.error("Delete failed", error);
            setMessage("Failed to delete vehicle");
            setColor(false);
            setStatus(false);
            setOpen(true);
        } finally {
            setIsDeleting(false);
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
                            View Vehicle Details
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* ---------- Form ---------- */}
            <Box sx={{ p: 2, }}>
                <Box
                    sx={{
                        border: "1px solid #E0E0E0",
                        borderRadius: "10px",
                        px: 2,
                        pt: 2,
                        pb:6,
                        backgroundColor: "#fff",
                        position: "relative",
                    }}
                >
                    <Grid container spacing={2} alignItems="center" sx={{border:"1px solid #ccc", borderRadius:"5px", p:2}}>

                        {/* LEFT : BUS IMAGE */}
                        <Grid size={{ lg: 3, md: 4, sm: 12 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                                    bgcolor: "#fff",
                                }}
                            >
                                <img
                                    src={BusImage}
                                    alt="bus"
                                    style={{ maxHeight: "110px", maxWidth: "140px" }}
                                />

                                <Typography
                                    sx={{
                                        mt: 1,
                                        fontSize: "12px",
                                        px: 1.5,
                                        py: 0.4,
                                        borderRadius: "12px",
                                        backgroundColor: "#E3F2FD",
                                        color: "#1976D2",
                                        fontWeight: 600,
                                    }}
                                >
                                    {vehicleDetails.busInternalName}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* RIGHT : BUS DETAILS */}
                        <Grid size={{ lg: 9, md: 8, sm: 12 }}>
                            <Grid container spacing={2}>

                                <Grid size={{ lg: 4, md: 6, sm: 12 }} sx={{borderLeft: "1px solid #ccc", px:2}}>
                                    <Typography
                                        sx={{
                                            fontSize: "12px",
                                            color: "#9E9E9E",
                                            mb: "2px",
                                        }}
                                    >
                                        Bus Internal Name
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "14px",
                                            color: "#212121",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {vehicleDetails.busInternalName}
                                    </Typography>
                                </Grid>
                                <Grid size={{ lg: 4, md: 6, sm: 12 }} sx={{borderLeft: "1px solid #ccc", px:2,}}>
                                    <Typography
                                        sx={{
                                            fontSize: "12px",
                                            color: "#9E9E9E",
                                            mb: "2px",
                                        }}
                                    >
                                        Vehicle Type
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "14px",
                                            color: "#212121",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {vehicleDetails.vehicleType}
                                    </Typography>
                                </Grid>
                                <Grid size={{ lg: 4, md: 6, sm: 12 }} sx={{borderLeft: "1px solid #ccc", px:2,}}>
                                    <Typography
                                        sx={{
                                            fontSize: "12px",
                                            color: "#9E9E9E",
                                            mb: "2px",
                                        }}
                                    >
                                        Vehicle Brand
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "14px",
                                            color: "#212121",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {vehicleDetails.vehicleBrand || "- - -"}
                                    </Typography>
                                </Grid>
                                <Grid size={{ lg: 4, md: 6, sm: 12 }} sx={{borderLeft: "1px solid #ccc", px:2,}}>
                                    <Typography
                                        sx={{
                                            fontSize: "12px",
                                            color: "#9E9E9E",
                                            mb: "2px",
                                        }}
                                    >
                                        Registration Number
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "14px",
                                            color: "#212121",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {vehicleDetails.registrationNumber}
                                    </Typography>
                                </Grid>
                                <Grid size={{ lg: 4, md: 6, sm: 12 }} sx={{borderLeft: "1px solid #ccc", px:2,}}>
                                    <Typography
                                        sx={{
                                            fontSize: "12px",
                                            color: "#9E9E9E",
                                            mb: "2px",
                                        }}
                                    >
                                        Total Seats Count
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "14px",
                                            color: "#212121",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {vehicleDetails.totalSeatsCount}
                                    </Typography>
                                </Grid>
                                <Grid size={{ lg: 4, md: 6, sm: 12 }} sx={{borderLeft: "1px solid #ccc", px:2,}}>
                                    <Typography
                                        sx={{
                                            fontSize: "12px",
                                            color: "#9E9E9E",
                                            mb: "2px",
                                        }}
                                    >
                                        Manufacturing Year
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "14px",
                                            color: "#212121",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {vehicleDetails.manufacturingYear}
                                    </Typography>
                                </Grid>
                                <Grid size={{ lg: 4, md: 6, sm: 12 }} sx={{borderLeft: "1px solid #ccc", px:2,}}>
                                    <Typography
                                        sx={{
                                            fontSize: "12px",
                                            color: "#9E9E9E",
                                            mb: "2px",
                                        }}
                                    >
                                        Fuel Type
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "14px",
                                            color: "#212121",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {vehicleDetails.fuel || "- - -"}
                                    </Typography>
                                </Grid>

                            </Grid>
                        </Grid>

                    </Grid>
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            display: "flex",
                            gap: 1,
                        }}
                    >
                        {/* DELETE BUTTON */}
                        <Button
                            onClick={() => setOpenDeleteDialog(true)}
                            variant="outlined"
                            sx={{
                                textTransform: "none",
                                borderRadius: "999px",
                                width: "80px",
                                height: "25px",
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#D32F2F",
                                borderColor: "#D32F2F",
                                "&:hover": {
                                    backgroundColor: "rgba(211, 47, 47, 0.04)",
                                    borderColor: "#B71C1C",
                                },
                            }}
                        >
                            <DeleteIcon sx={{ fontSize: "16px", mr: 0.5 }} />
                            Delete
                        </Button>

                        {/* EDIT BUTTON */}

                        <Button
                            onClick={() => handleEditClick(vehicleDetails.id)}
                            variant="outlined"
                            sx={{
                                textTransform: "none",
                                borderRadius: "999px",
                                width: "70px",
                                height: "25px",
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#000",
                                borderColor: "#000",
                                "&:hover": {
                                    backgroundColor: "#F5F5F5",
                                },
                            }}
                        >
                            <EditIcon sx={{ fontSize: "16px", mr: 0.5 }} />
                            Edit
                        </Button>
                    </Box>
                    <Dialog
                        open={openDeleteDialog}
                        onClose={() => !isDeleting && setOpenDeleteDialog(false)}
                        maxWidth="xs"
                        fullWidth
                    >
                        <DialogTitle sx={{ fontWeight: 600 }}>
                            Delete Vehicle
                        </DialogTitle>

                        <DialogContent>
                            <Typography sx={{ fontSize: "14px", color: "#555" }}>
                                Are you sure you want to delete the bus{" "}
                                <b>{vehicleDetails.busInternalName}</b>?
                                This action cannot be undone.
                            </Typography>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button
                                onClick={() => setOpenDeleteDialog(false)}
                                disabled={isDeleting}
                                sx={{ textTransform: "none" }}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={handleDeleteVehicle}
                                disabled={isDeleting}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 600,
                                    color: "#D32F2F",
                                }}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogActions>
                    </Dialog>

                </Box>

            </Box>
        </Box>
    )
}
