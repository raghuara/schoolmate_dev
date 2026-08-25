import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Grid, IconButton, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SnackBar from '../../../SnackBar';
import { QuizCardSkeleton } from '../../../InnerLoader';
import { findSubMenuPermissions } from '../../../../Redux/Slices/AuthSlice';
import { getAllVehicles } from '../../../../Api/Api';
import BusImage from '../../../../Images/PagesImage/bus.png';
import { DASH, RADIUS, EmptyNote, PageHeader, SectionTitle } from '../../../DashBoardComps/dashboardTheme';

const ACCENT = "#A749CC";
const ACCENT_DEEP = "#8600BB";

const InfoRow = ({ icon: Icon, label, value }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <Icon sx={{ fontSize: 15, color: ACCENT, flexShrink: 0, opacity: 0.85 }} />
        <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: DASH.text, flexShrink: 0 }}>{label}</Typography>
        <Typography
            sx={{
                fontSize: "12.5px",
                fontWeight: 700,
                color: DASH.ink,
                ml: "auto",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}
        >
            {value || "-"}
        </Typography>
    </Box>
);

export default function VehicleDetailsPage() {
    const navigate = useNavigate();
    const token = "123";
    const user = useSelector((state) => state.auth);
    // Adding a vehicle is its own grant; viewing the list is not enough.
    const rbacReady = (user.permissions?.mainMenus || []).length > 0;
    const vehiclePerms = findSubMenuPermissions(user.permissions, "transport", "vehicledetails") || {};
    const canCreate = !rbacReady || vehiclePerms.create === "Y";

    const [isLoading, setIsLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const [searchQuery, setSearchQuery] = useState("");
    const [vehicleDetails, setVehicleDetails] = useState([]);

    const handleViewEditClick = (id) => {
        navigate("view", { state: { vehicleId: id } });
    };

    const getUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getAllVehicles, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setVehicleDetails(res.data?.vehicles || []);
        } catch (error) {
            console.error("Error while fetching vehicles:", error);
            setVehicleDetails([]);
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Could not load the vehicle list. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const filteredVehicleDetails = vehicleDetails.filter((vehicle) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();

        return (
            vehicle.vehicleAssetID?.toLowerCase().includes(query) ||
            vehicle.busName?.toLowerCase().includes(query) ||
            vehicle.vehicleBrand?.toLowerCase().includes(query) ||
            vehicle.registrationNumber?.toLowerCase().includes(query)
        );
    });

    const total = vehicleDetails.length;
    const shown = filteredVehicleDetails.length;

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: 4,
                bgcolor: DASH.canvas,
            }}
        >
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <PageHeader
                title="Vehicle Details"
                subtitle={isLoading
                    ? "Fleet records, registration and acquisition"
                    : `${total} ${total === 1 ? "vehicle" : "vehicles"} in the fleet`}
                onBack={() => navigate(-1)}
                right={
                    <>
                        <TextField
                            placeholder="Search name, number or brand"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                width: { xs: 150, sm: 260 },
                                "& .MuiOutlinedInput-root": {
                                    height: 34,
                                    borderRadius: RADIUS,
                                    bgcolor: "#fff",
                                    fontSize: "13px",
                                    "& fieldset": { borderColor: `${ACCENT}47` },
                                    "&:hover fieldset": { borderColor: `${ACCENT}7A` },
                                    "&.Mui-focused fieldset": { borderColor: ACCENT },
                                },
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 18, color: DASH.faint }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchQuery ? (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={() => setSearchQuery("")}
                                                sx={{ width: 22, height: 22 }}
                                            >
                                                <CloseIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : null,
                                },
                            }}
                        />

                        <Tooltip title="Refresh">
                            <IconButton
                                onClick={getUsers}
                                sx={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: RADIUS,
                                    border: `1px solid ${ACCENT}47`,
                                    bgcolor: `${ACCENT}1A`,
                                    "&:hover": { bgcolor: `${ACCENT}2E` },
                                }}
                            >
                                <RefreshIcon sx={{ fontSize: 18, color: ACCENT_DEEP }} />
                            </IconButton>
                        </Tooltip>

                        {canCreate && (
                            <Button
                                onClick={() => navigate("add")}
                                disableElevation
                                startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                                sx={{
                                    textTransform: "none",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    height: 34,
                                    px: 1.8,
                                    borderRadius: RADIUS,
                                    bgcolor: `${ACCENT}1A`,
                                    color: ACCENT_DEEP,
                                    border: `1px solid ${ACCENT}47`,
                                    whiteSpace: "nowrap",
                                    "&:hover": { bgcolor: `${ACCENT}2E`, borderColor: ACCENT },
                                }}
                            >
                                Add Vehicle
                            </Button>
                        )}
                    </>
                }
            />

            <SectionTitle icon={DirectionsBusIcon}>
                {searchQuery.trim() && !isLoading ? `Fleet - ${shown} of ${total}` : "Fleet"}
            </SectionTitle>

            {isLoading && (
                <Grid container spacing={2} alignItems="stretch">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Grid key={`vehicle-skeleton-${i}`} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <QuizCardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            )}

            {!isLoading && shown === 0 && (
                <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 3 }}>
                    <EmptyNote
                        text={total === 0
                            ? "No vehicles have been added yet."
                            : "No vehicles match your search."}
                    />
                </Box>
            )}

            {!isLoading && shown > 0 && (
                <Grid container spacing={2} alignItems="stretch">
                    {filteredVehicleDetails.map((vehicle) => (
                        <Grid
                            key={vehicle.vehicleAssetID}
                            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                            sx={{ display: "flex" }}
                        >
                            <Box
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    bgcolor: "#fff",
                                    border: `1px solid ${ACCENT}47`,
                                    borderLeft: `3px solid ${ACCENT}`,
                                    borderRadius: RADIUS,
                                    overflow: "hidden",
                                    boxSizing: "border-box",
                                    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                                    "&:hover": {
                                        boxShadow: "0 6px 18px rgba(17,24,39,0.10)",
                                        borderColor: ACCENT,
                                        ".vdArrow": { transform: "translateX(3px)" },
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.2,
                                        p: 1.4,
                                        bgcolor: `${ACCENT}14`,
                                        borderBottom: `1px solid ${ACCENT}47`,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 54,
                                            height: 42,
                                            borderRadius: RADIUS,
                                            bgcolor: "#fff",
                                            border: `1px solid ${ACCENT}47`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <img
                                            src={vehicle.busPhotoFilePath || BusImage}
                                            onError={(e) => { e.currentTarget.src = BusImage; }}
                                            alt={vehicle.busName || "vehicle"}
                                            style={{ maxHeight: "38px", maxWidth: "50px", objectFit: "contain" }}
                                        />
                                    </Box>

                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography
                                            sx={{
                                                fontSize: "13.5px",
                                                fontWeight: 700,
                                                color: DASH.ink,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {vehicle.busName || "Unnamed vehicle"}
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                mt: 0.5,
                                                px: 0.9,
                                                py: 0.25,
                                                maxWidth: "100%",
                                                borderRadius: "20px",
                                                bgcolor: `${ACCENT}1A`,
                                                border: `1px solid ${ACCENT}3D`,
                                            }}
                                        >
                                            <DirectionsBusIcon sx={{ fontSize: 13, color: ACCENT_DEEP, flexShrink: 0 }} />
                                            <Typography
                                                sx={{
                                                    fontSize: "11px",
                                                    fontWeight: 700,
                                                    color: ACCENT_DEEP,
                                                    letterSpacing: "0.03em",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {vehicle.registrationNumber || "No registration"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{ p: 1.4, display: "flex", flexDirection: "column", gap: 0.9, flex: 1 }}>
                                    <InfoRow icon={BadgeOutlinedIcon} label="Asset ID" value={vehicle.vehicleAssetID} />
                                    <InfoRow icon={LocalOfferOutlinedIcon} label="Brand" value={vehicle.vehicleBrand} />
                                    <InfoRow icon={HandshakeOutlinedIcon} label="Acquisition" value={vehicle.modeOfAcquisition} />
                                </Box>

                                <Button
                                    onClick={() => handleViewEditClick(vehicle.vehicleAssetID)}
                                    disableElevation
                                    endIcon={<ArrowForwardIcon className="vdArrow" sx={{ fontSize: 16, transition: "transform 0.2s ease" }} />}
                                    sx={{
                                        m: 1.4,
                                        mt: 0,
                                        textTransform: "none",
                                        fontSize: "12.5px",
                                        fontWeight: 700,
                                        height: 34,
                                        borderRadius: RADIUS,
                                        color: ACCENT_DEEP,
                                        bgcolor: `${ACCENT}1A`,
                                        border: `1px solid ${ACCENT}47`,
                                        "&:hover": { bgcolor: `${ACCENT}2E`, borderColor: ACCENT },
                                    }}
                                >
                                    View details / Edit
                                </Button>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
