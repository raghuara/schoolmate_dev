import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    Typography,
    Paper,
    Button,
    IconButton,
    Dialog,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    InputAdornment,
    Tooltip,
    Chip,
    CircularProgress,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RouteIcon from '@mui/icons-material/Route';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NearMeIcon from '@mui/icons-material/NearMe';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import HomeIcon from '@mui/icons-material/Home';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { findSubMenuPermissions } from '../../../../Redux/Slices/AuthSlice';
import axios from 'axios';
import { getAllRoutes, postNewRoute, getAllVehicles, getRouteById, updateNewRoute, deleteRouteById } from '../../../../Api/Api';
import SnackBar from '../../../SnackBar';
import { DASH, RADIUS, KPI_TONES, PageHeader, SolidStatCard } from '../../../DashBoardComps/dashboardTheme';

const ACCENT = "#A749CC";
const ACCENT_DEEP = "#8600BB";

// Route type colours, from the dashboard palette
const TYPE_TONE = {
    Pickup: { color: DASH.blue, bg: DASH.blueLight },
    Drop: { color: DASH.amber, bg: DASH.amberLight },
    default: { color: DASH.violet, bg: DASH.violetLight },
};
const toneFor = (type) => TYPE_TONE[type] || TYPE_TONE.default;

const inputSx = {
    "& .MuiOutlinedInput-root": {
        height: 38,
        borderRadius: RADIUS,
        fontSize: "13px",
        backgroundColor: "#fff",
        transition: "border-color 0.2s ease",
        "& fieldset": { borderColor: DASH.line },
        "&:hover fieldset": { borderColor: DASH.faint },
        "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1px" },
    }
};

const selectSx = {
    height: 38,
    borderRadius: RADIUS,
    fontSize: "13px",
    backgroundColor: "#fff",
    transition: "border-color 0.2s ease",
    "& fieldset": { borderColor: DASH.line },
    "&:hover fieldset": { borderColor: DASH.faint },
    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1px" },
};

const labelSx = {
    color: DASH.text,
    fontWeight: 600,
    fontSize: "12px",
    mb: 0.5,
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    "& .required": {
        color: DASH.red,
        marginLeft: "2px"
    }
};

export default function RouteManagement() {
    const navigate = useNavigate();
    // Creating, editing and deleting a route are each their own grant; viewing
    // the list gets you none of them.
    const auth = useSelector((state) => state.auth);
    const rbacReady = (auth.permissions?.mainMenus || []).length > 0;
    const routePerms = findSubMenuPermissions(auth.permissions, "transport", "routemanagement") || {};
    const canCreate = !rbacReady || routePerms.create === "Y";
    const canEdit = !rbacReady || routePerms.edit === "Y";
    const canDelete = !rbacReady || routePerms.delete === "Y";

    // State for view mode
    const [viewMode, setViewMode] = useState("list");
    const [editingRoute, setEditingRoute] = useState(null);

    // API Data States
    const [isLoading, setIsLoading] = useState(false);
    const [routes, setRoutes] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [stats, setStats] = useState({
        totalRoutes: 0,
        activeRoutes: 0,
        pickup: 0,
        drop: 0
    });

    // State for route form
    const [routeName, setRouteName] = useState("");
    const [tripType, setTripType] = useState("");
    const [tripDate, setTripDate] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [tripTime, setTripTime] = useState("");
    const [tripDuration, setTripDuration] = useState("");
    const [assignedBus, setAssignedBus] = useState("");
    const [assignedDriver, setAssignedDriver] = useState("");
    const token = "123"
    // State for stops
    const [stops, setStops] = useState([
        { id: 1, name: "", type: "stop", arrivalTime: "", waitTime: "2", km: "" }
    ]);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog states
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // SnackBar states
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const tripTypes = [
        { value: "Pickup", label: "Pickup", icon: <AirportShuttleIcon sx={{ fontSize: 16, color: "#3B82F6" }} /> },
        { value: "Drop", label: "Drop", icon: <HomeIcon sx={{ fontSize: 16, color: "#F59E0B" }} /> },
        { value: "Round Trip", label: "Round Trip", icon: <SyncAltIcon sx={{ fontSize: 16, color: "#8B5CF6" }} /> }
    ];
    const TripSlot = [
        { value: "Morning", label: "Morning", icon: <WbTwilightIcon sx={{ fontSize: 16, color: "#F97316" }} /> },
        { value: "Afternoon", label: "Afternoon", icon: <WbSunnyIcon sx={{ fontSize: 16, color: "#EAB308" }} /> },
        { value: "Evening", label: "Evening", icon: <NightsStayIcon sx={{ fontSize: 16, color: "#6366F1" }} /> },
        { value: "Special", label: "Special", icon: <StarIcon sx={{ fontSize: 16, color: "#EC4899" }} /> }
    ];
    const drivers = [
        { id: 1, name: "Rajesh Kumar", phone: "9876543210" },
        { id: 2, name: "Suresh Babu", phone: "9876543211" },
        { id: 3, name: "Mohan Das", phone: "9876543212" },
    ];
    const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // SnackBar helper functions
    const showSuccess = (msg) => {
        setMessage(msg);
        setOpen(true);
        setColor(true);
        setStatus(true);
    };

    const showError = (msg) => {
        setMessage(msg);
        setOpen(true);
        setColor(false);
        setStatus(false);
    };

    // Add new stop
    const addStop = () => {
        if (stops.length >= 30) {
            showError('Maximum limit of 30 stops reached');
            return;
        }
        const newId = Math.max(...stops.map(s => s.id), 0) + 1;
        setStops([...stops, { id: newId, name: "", type: "stop", arrivalTime: "", waitTime: "2", km: "" }]);
    };

    // Remove stop
    const removeStop = (id) => {
        if (stops.length > 1) {
            setStops(stops.filter(stop => stop.id !== id));
        }
    };

    // Update stop
    const updateStop = (id, field, value) => {
        setStops(stops.map(stop =>
            stop.id === id ? { ...stop, [field]: value } : stop
        ));
    };

    // Move stop up/down
    const moveStop = (index, direction) => {
        const newStops = [...stops];
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < stops.length) {
            [newStops[index], newStops[newIndex]] = [newStops[newIndex], newStops[index]];
            setStops(newStops);
        }
    };

    // Handle create new route
    const handleCreateNew = () => {
        setViewMode("create");
        setEditingRoute(null);
        resetForm();
    };

    // Handle edit route
    const handleEditRoute = async (route) => {
        setIsLoading(true);
        try {
            const response = await axios.get(getRouteById, {
                params: { routeInformationId: route.id },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.error === false) {
                const data = response.data;
                const routeInfo = data.routeInformation;

                // Set editing route with full data
                // Use routeInfo.id as the routeInformationId (not data.routeInformationId which can be 0)
                setEditingRoute({
                    ...route,
                    routeInformationId: routeInfo.id,
                    fullData: data
                });

                console.log('=== Edit Route Loaded ===');
                console.log('Setting routeInformationId to:', routeInfo.id);

                // Populate form fields
                setRouteName(routeInfo.tripName);
                setTripType(routeInfo.tripType.charAt(0).toUpperCase() + routeInfo.tripType.slice(1));
                setTripDate(routeInfo.tripSlot.charAt(0).toUpperCase() + routeInfo.tripSlot.slice(1));

                // Convert 12-hour time to 24-hour format for input
                const convert12to24 = (time12) => {
                    if (!time12) return '';
                    const [time, period] = time12.split(' ');
                    let [hours, minutes] = time.split(':');
                    hours = parseInt(hours);

                    if (period === 'PM' && hours !== 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;

                    return `${hours.toString().padStart(2, '0')}:${minutes}`;
                };

                setTripTime(convert12to24(routeInfo.time));
                setTripDuration(routeInfo.duration.replace(' mins', ''));

                // Find and set the vehicle
                const vehicle = vehicles.find(v =>
                    v.busName === routeInfo.assignBus ||
                    v.vehicleBrand === routeInfo.assignBus
                );
                setAssignedBus(vehicle ? vehicle.vehicleAssetID : routeInfo.assignBus);

                // Map route stops
                const mappedStops = data.routeStops.map((stop, index) => ({
                    id: index + 1,
                    name: stop.place,
                    type: "stop",
                    arrivalTime: convert12to24(stop.arrivalTime),
                    waitTime: stop.wait || "2",
                    km: stop.kms != null ? String(stop.kms) : "",
                    remarks: stop.remarks || ''
                }));

                setStops(mappedStops);
                setViewMode("create");
                showSuccess('Route loaded for editing');
            }
        } catch (error) {
            console.error("Error fetching route details:", error);
            showError('Failed to load route details');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setRouteName("");
        setTripType("");
        setTripDate("");
        setSelectedDays([]);
        setTripTime("");
        setTripDuration("");
        setAssignedBus("");
        setAssignedDriver("");
        setStops([{ id: 1, name: "", type: "stop", arrivalTime: "", waitTime: "2" }]);
    };

    // Handle save/create trip
    const handleSaveTrip = async () => {
        // Validation
        if (!routeName.trim()) {
            showError('Please enter trip name');
            return;
        }
        if (!assignedBus) {
            showError('Please assign a bus');
            return;
        }
        if (!tripType) {
            showError('Please select trip type');
            return;
        }
        if (!tripDate) {
            showError('Please select trip slot');
            return;
        }
        if (stops.length === 0) {
            showError('Please add at least one stop');
            return;
        }

        // Validate stops
        for (let i = 0; i < stops.length; i++) {
            if (!stops[i].name.trim()) {
                showError(`Please enter location for stop ${i === 0 ? 'starting point' : i === stops.length - 1 ? 'final destination' : i}`);
                return;
            }
        }

        setIsLoading(true);
        try {
            // Format time to 12-hour format if needed
            const formatTime = (time24) => {
                if (!time24) return '';
                const [hours, minutes] = time24.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
            };

            // Get current timestamp
            const getCurrentTimestamp = () => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            };

            // Get point label based on index
            const getPointLabel = (index) => {
                if (index === 0) return 'Starting Point';
                if (index === stops.length - 1) return 'Final Destination';
                return `Stop ${index}`;
            };

            // Get remarks based on position
            const getRemarks = (index) => {
                if (index === 0) return 'Start';
                if (index === stops.length - 1) return 'Drop';
                return '';
            };

            // Prepare route information
            const selectedVehicle = vehicles.find(v => v.vehicleAssetID === assignedBus);
            const busDisplayName = selectedVehicle
                ? (selectedVehicle.busName || selectedVehicle.vehicleBrand || 'No Name')
                : assignedBus;

            // Compute total kms
            const totalKms = stops.reduce((sum, s) => sum + (parseFloat(s.km) || 0), 0);

            const routeInformation = {
                tripName: routeName,
                assignBus: busDisplayName,
                tripType: tripType.toLowerCase(),
                tripSlot: tripDate.toLowerCase(),
                time: formatTime(tripTime),
                duration: `${tripDuration} mins`,
                totalKms: totalKms,
                createdOn: getCurrentTimestamp()
            };

            // Prepare route stops
            const routeStops = stops.map((stop, index) => ({
                point: getPointLabel(index),
                place: stop.name,
                arrivalTime: formatTime(stop.arrivalTime),
                wait: stop.waitTime || '2',
                kms: parseFloat(stop.km) || 0,
                remarks: getRemarks(index)
            }));

            // Determine if this is an update or create
            const isUpdate = editingRoute && editingRoute.routeInformationId !== undefined;

            let payload;
            let response;

            if (isUpdate) {
                // Prepare update payload
                payload = {
                    routeInformationId: editingRoute.routeInformationId,
                    routeInformation: {
                        tripName: routeName,
                        assignBus: busDisplayName,
                        tripType: tripType.toLowerCase(),
                        tripSlot: tripDate.toLowerCase(),
                        time: formatTime(tripTime),
                        duration: `${tripDuration} mins`,
                        totalKms: totalKms,
                        createdOn: editingRoute.fullData?.routeInformation?.createdOn || getCurrentTimestamp()
                    },
                    routeStops: stops.map((stop, index) => ({
                        point: getPointLabel(index),
                        place: stop.name,
                        arrivalTime: formatTime(stop.arrivalTime),
                        wait: stop.waitTime || '2',
                        kms: parseFloat(stop.km) || 0,
                        remarks: getRemarks(index)
                    }))
                };

                // PUT request for update
                response = await axios.put(updateNewRoute, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // Prepare create payload
                payload = {
                    routeInformation,
                    routeStops
                };

                // POST request for create
                response = await axios.post(postNewRoute, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            if (response.data.error === false) {
                showSuccess(response.data.message || (isUpdate ? 'Route updated successfully' : 'Route created successfully'));
                setViewMode("list");
                resetForm();
                setEditingRoute(null);
                fetchRoutes(); // Refresh routes after saving
            } else {
                showError(response.data.message || (isUpdate ? 'Failed to update route' : 'Failed to create route'));
            }
        } catch (error) {
            console.error(editingRoute ? "Error updating route:" : "Error creating route:", error);
            showError(error.response?.data?.message || (editingRoute ? 'Failed to update route' : 'Failed to create route'));
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete
    const handleDeleteRoute = (route) => {
        setDeleteTarget(route);
        setDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setIsLoading(true);
        try {
            const response = await axios.delete(deleteRouteById, {
                params: { routeInformationId: deleteTarget.id },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.error === false) {
                showSuccess(response.data.message || 'Route deleted successfully');
                setDeleteDialog(false);
                setDeleteTarget(null);
                fetchRoutes(); // Refresh routes after deletion
            } else {
                showError(response.data.message || 'Failed to delete route');
            }
        } catch (error) {
            console.error("Error deleting route:", error);
            showError(error.response?.data?.message || 'Failed to delete route');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter routes
    const filteredRoutes = routes.filter((route) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            route.name?.toLowerCase().includes(query) ||
            route.type?.toLowerCase().includes(query) ||
            route.bus?.toLowerCase().includes(query) ||
            route.driver?.toLowerCase().includes(query)
        );
    });

    useEffect(() => {
        fetchRoutes();
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await axios.get(getAllVehicles, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.error === false) {
                setVehicles(response.data.vehicles || []);
            } else {
                console.error('Failed to fetch vehicles:', response.data.message);
            }
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        }
    };

    const fetchByIdVehicles = async () => {
        try {
            const response = await axios.get(getRouteById, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.error === false) {
                setVehicles(response.data.vehicles || []);
            } else {
                console.error('Failed to fetch vehicles:', response.data.message);
            }
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        }
    };

    const fetchRoutes = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(getAllRoutes, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.error === false) {
                const data = response.data;

                // Set statistics
                setStats({
                    totalRoutes: data.totalRoutes || 0,
                    activeRoutes: data.activeRoutes || 0,
                    pickup: data.pickup || 0,
                    drop: data.drop || 0
                });

                // Map API response to component structure
                const mappedRoutes = data.routes.map(route => ({
                    id: route.routeInformationId,
                    name: route.tripName,
                    type: route.tripType.charAt(0).toUpperCase() + route.tripType.slice(1).toLowerCase(),
                    date: route.tripSlot.charAt(0).toUpperCase() + route.tripSlot.slice(1).toLowerCase(),
                    time: route.time,
                    duration: route.duration,
                    bus: route.assignBus,
                    driver: route.assignDriver || "Not Assigned",
                    stops: route.stops || route.totalStops || 0,
                    totalKms: route.totalKms != null ? route.totalKms : '',
                    status: route.active
                }));

                setRoutes(mappedRoutes);
                showSuccess('Routes loaded successfully');
            } else {
                showError(response.data.message || 'Failed to fetch routes');
            }
        } catch (error) {
            console.error("Error fetching routes:", error);
            showError('Failed to load routes');
        } finally {
            setIsLoading(false);
        }
    };

    // Render List View
    const renderListView = () => {
        if (isLoading) {
            return (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '60vh',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    <Box sx={{
                        width: 60,
                        height: 60,
                        border: `4px solid ${DASH.line}`,
                        borderTop: `4px solid ${ACCENT}`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                        }
                    }} />
                    <Typography sx={{ fontSize: "13px", color: DASH.muted }}>Loading routes...</Typography>
                </Box>
            );
        }

        return (
        <Box>
            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 2, alignItems: "stretch" }}>
                {[
                    { label: "Total Routes", value: stats.totalRoutes, note: "across the fleet", tone: KPI_TONES.violet, icon: RouteIcon },
                    { label: "Active", value: stats.activeRoutes, note: "running today", tone: KPI_TONES.green, icon: CheckCircleIcon },
                    { label: "Pickup", value: stats.pickup, note: "morning trips", tone: KPI_TONES.blue, icon: TrendingUpIcon },
                    { label: "Drop", value: stats.drop, note: "evening trips", tone: KPI_TONES.orange, icon: NearMeIcon },
                ].map((stat, idx) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                        <SolidStatCard
                            icon={stat.icon}
                            label={stat.label}
                            value={stat.value}
                            note={stat.note}
                            tone={stat.tone}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Search and Actions Bar */}
            <Box sx={{
                p: 1.5,
                borderRadius: RADIUS,
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                border: `1px solid ${DASH.line}`,
                backgroundColor: "#fff"
            }}>
                <TextField
                    placeholder="Search routes..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        width: { xs: "100%", sm: 320 },
                        "& .MuiOutlinedInput-root": {
                            borderRadius: RADIUS,
                            height: 34,
                            fontSize: "13px",
                            backgroundColor: "#fff",
                            "& fieldset": { borderColor: `${ACCENT}47` },
                            "&:hover fieldset": { borderColor: `${ACCENT}7A` },
                            "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1px" }
                        }
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: DASH.faint, fontSize: 18 }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ width: 22, height: 22 }}>
                                        <CloseIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        },
                    }}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                    {canCreate && (
                    <Button
                        startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                        onClick={handleCreateNew}
                        disableElevation
                        sx={{
                            textTransform: "none",
                            borderRadius: RADIUS,
                            height: 34,
                            fontWeight: 700,
                            fontSize: "13px",
                            px: 2,
                            color: ACCENT_DEEP,
                            bgcolor: `${ACCENT}1A`,
                            border: `1px solid ${ACCENT}47`,
                            "&:hover": { bgcolor: `${ACCENT}2E`, borderColor: ACCENT }
                        }}
                    >
                        New Route
                    </Button>
                    )}
                </Box>
            </Box>

            {/* Routes Table */}
            <Paper sx={{
                borderRadius: RADIUS,
                overflow: "hidden",
                boxShadow: "none",
                border: `1px solid ${DASH.line}`,
                backgroundColor: "#fff"
            }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, fontSize: "10.5px", color: DASH.muted, bgcolor: DASH.surface, py: 1.2, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", borderBottom: `1px solid ${DASH.line}` }}>Route Name</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: "10.5px", color: DASH.muted, bgcolor: DASH.surface, py: 1.2, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", textAlign: "center", borderBottom: `1px solid ${DASH.line}` }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: "10.5px", color: DASH.muted, bgcolor: DASH.surface, py: 1.2, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", borderBottom: `1px solid ${DASH.line}` }}>Schedule</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: "10.5px", color: DASH.muted, bgcolor: DASH.surface, py: 1.2, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", borderBottom: `1px solid ${DASH.line}` }}>Time</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: "10.5px", color: DASH.muted, bgcolor: DASH.surface, py: 1.2, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", borderBottom: `1px solid ${DASH.line}` }}>Bus</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: "10.5px", color: DASH.muted, bgcolor: DASH.surface, py: 1.2, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", textAlign: "center", borderBottom: `1px solid ${DASH.line}` }}>Duration</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: "10.5px", color: DASH.muted, bgcolor: DASH.surface, py: 1.2, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", textAlign: "center", borderBottom: `1px solid ${DASH.line}` }}>Total KM</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: "10.5px", color: DASH.muted, bgcolor: DASH.surface, py: 1.2, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", textAlign: "center", borderBottom: `1px solid ${DASH.line}` }}>Stops</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: "10.5px", color: DASH.muted, bgcolor: DASH.surface, py: 1.2, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", textAlign: "center", borderBottom: `1px solid ${DASH.line}` }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRoutes.map((route) => (
                            <TableRow
                                key={route.id}
                                sx={{
                                    transition: "all 0.15s ease",
                                    "&:hover": { backgroundColor: DASH.surface },
                                    "&:last-child td": { borderBottom: 0 }
                                }}
                            >
                                <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Box sx={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: RADIUS,
                                            backgroundColor: toneFor(route.type).bg,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <RouteIcon sx={{ color: toneFor(route.type).color, fontSize: 18 }} />
                                        </Box>
                                        <Box>
                                            <Typography fontSize="13px" fontWeight={600} color="#111827">{route.name}</Typography>
                                            <Typography fontSize="11px" color="#9CA3AF">{route.duration}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${DASH.lineSoft}`, textAlign: "center" }}>
                                    <Chip
                                        label={route.type}
                                        size="small"
                                        sx={{
                                            backgroundColor: toneFor(route.type).bg,
                                            color: toneFor(route.type).color,
                                            fontWeight: 600,
                                            fontSize: "11px",
                                            borderRadius: RADIUS,
                                            height: 22,
                                            "& .MuiChip-label": { px: 1 }
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontSize: "13px", color: "#4B5563", py: 1.5, borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <ScheduleIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                                        {route.date}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                    <Typography fontSize="13px" fontWeight={500} color="#111827">{route.time}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <DirectionsBusIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                                        <Typography fontSize="13px" color="#4B5563">{route.bus}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ fontSize: "13px", color: "#4B5563", py: 1.5, borderBottom: `1px solid ${DASH.lineSoft}`, textAlign: "center" }}>{route.duration}</TableCell>
                                <TableCell sx={{ fontSize: "13px", color: "#4B5563", py: 1.5, borderBottom: `1px solid ${DASH.lineSoft}`, textAlign: "center" }}>{route.totalKms ? `${route.totalKms} km` : "-"}</TableCell>
                                <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${DASH.lineSoft}`, textAlign: "center" }}>
                                    <Box sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        backgroundColor: DASH.surface,
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: RADIUS
                                    }}>
                                        <LocationOnIcon sx={{ fontSize: 12, color: "#6B7280" }} />
                                        <Typography fontSize="12px" fontWeight={500} color="#4B5563">{route.stops}</Typography>
                                    </Box>
                                </TableCell>
                                {/* <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                    <Box sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        backgroundColor: route.status === "Active" ? "#ECFDF5" : "#FEF2F2",
                                        color: route.status === "Active" ? "#059669" : "#DC2626",
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: RADIUS
                                    }}>
                                        <Box sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: "50%",
                                            backgroundColor: route.status === "Active" ? "#10B981" : "#EF4444"
                                        }} />
                                        <Typography fontSize="11px" fontWeight={600}>{route.status}</Typography>
                                    </Box>
                                </TableCell> */}
                                <TableCell align="center" sx={{ py: 1.5, borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                    <Box sx={{ display: "flex", justifyContent: "center", gap: 0.25 }}>
                                        {canEdit && (
                                        <Tooltip title="Edit Route" arrow>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditRoute(route)}
                                                sx={{
                                                    color: "#9CA3AF",
                                                    width: 30,
                                                    height: 30,
                                                    "&:hover": { color: ACCENT_DEEP, backgroundColor: `${ACCENT}14` }
                                                }}
                                            >
                                                <EditIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                        )}
                                        {canDelete && (
                                        <Tooltip title="Delete Route" arrow>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteRoute(route)}
                                                sx={{
                                                    color: "#9CA3AF",
                                                    width: 30,
                                                    height: 30,
                                                    "&:hover": { color: "#EF4444", backgroundColor: "#FEF2F2" }
                                                }}
                                            >
                                                <DeleteIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredRoutes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                        <RouteIcon sx={{ fontSize: 48, color: DASH.line }} />
                                        <Typography color="#6B7280" fontWeight={500}>No routes found</Typography>
                                        <Typography color="#9CA3AF" fontSize="13px">Try adjusting your search criteria</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
        );
    };

    // Render Create/Edit View
    const renderCreateView = () => (
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
            {/* Route Information Card */}
            <Paper sx={{
                borderRadius: RADIUS,
                mb: 2.5,
                overflow: "hidden",
                boxShadow: "none",
                border: `1px solid ${ACCENT}38`,
                backgroundColor: "#fff"
            }}>
                {/* Card Header */}
                <Box sx={{
                    background: `${ACCENT}14`,
                    borderBottom: `1px solid ${ACCENT}38`,
                    px: 2,
                    py: 1.25,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25
                }}>
                    <Box sx={{
                        width: 32,
                        height: 32,
                        borderRadius: RADIUS,
                        backgroundColor: `${ACCENT}24`,
                        border: `1px solid ${ACCENT}47`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <RouteIcon sx={{ color: ACCENT_DEEP, fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "14px", color: DASH.ink }}>
                        Route Information
                    </Typography>
                </Box>

                {/* Card Content */}
                <Box sx={{ px: 2, py: 2, backgroundColor: "#fff" }}>
                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <InputLabel sx={labelSx}>
                                Trip Name <span className="required">*</span>
                            </InputLabel>
                            <TextField
                                fullWidth
                                placeholder="e.g., Morning Pickup - Route A"
                                value={routeName}
                                onChange={(e) => setRouteName(e.target.value)}
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <InputLabel sx={labelSx}>
                                Assign Bus <span className="required">*</span>
                            </InputLabel>
                            <Select
                                fullWidth
                                value={assignedBus}
                                onChange={(e) => setAssignedBus(e.target.value)}
                                displayEmpty
                                sx={selectSx}
                            >
                                <MenuItem value="" disabled>
                                    <Typography color="#9CA3AF">Select a bus</Typography>
                                </MenuItem>
                                {vehicles.map((vehicle) => (
                                    <MenuItem key={vehicle.vehicleAssetID} value={vehicle.vehicleAssetID}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <DirectionsBusIcon sx={{ fontSize: 18, color: ACCENT }} />
                                            <Typography fontSize="14px">
                                                {vehicle.busName || 'No Name'} {vehicle.registrationNumber ? `(${vehicle.registrationNumber})` : ''}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <InputLabel sx={labelSx}>
                                Trip Type <span className="required">*</span>
                            </InputLabel>
                            <Select
                                fullWidth
                                value={tripType}
                                onChange={(e) => setTripType(e.target.value)}
                                displayEmpty
                                sx={selectSx}
                                renderValue={(selected) => {
                                    if (!selected) return <Typography color="#9CA3AF">Select type</Typography>;
                                    const item = tripTypes.find(t => t.value === selected);
                                    return item ? (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            {item.icon}
                                            <Typography fontSize="14px">{item.label}</Typography>
                                        </Box>
                                    ) : selected;
                                }}
                            >
                                <MenuItem value="" disabled>
                                    <Typography color="#9CA3AF">Select type</Typography>
                                </MenuItem>
                                {tripTypes.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            {type.icon}
                                            <Typography fontSize="14px">{type.label}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <InputLabel sx={labelSx}>
                                Trip Slot <span className="required">*</span>
                            </InputLabel>
                            <Select
                                fullWidth
                                value={tripDate}
                                onChange={(e) => setTripDate(e.target.value)}
                                displayEmpty
                                sx={selectSx}
                                renderValue={(selected) => {
                                    if (!selected) return <Typography color="#9CA3AF">Select slot</Typography>;
                                    const item = TripSlot.find(t => t.value === selected);
                                    return item ? (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            {item.icon}
                                            <Typography fontSize="14px">{item.label}</Typography>
                                        </Box>
                                    ) : selected;
                                }}
                            >
                                <MenuItem value="" disabled>
                                    <Typography color="#9CA3AF">Select slot</Typography>
                                </MenuItem>
                                {TripSlot.map((slot) => (
                                    <MenuItem key={slot.value} value={slot.value}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            {slot.icon}
                                            <Typography fontSize="14px">{slot.label}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <InputLabel sx={labelSx}>
                                Time & Duration <span className="required">*</span>
                            </InputLabel>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <TextField
                                    type="time"
                                    value={tripTime}
                                    onChange={(e) => setTripTime(e.target.value)}
                                    sx={{ ...inputSx, flex: 1 }}
                                />
                                <TextField
                                    placeholder="45"
                                    value={tripDuration}
                                    onChange={(e) => setTripDuration(e.target.value)}
                                    sx={{ ...inputSx, width: 80 }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Typography fontSize="12px" color="#9CA3AF">min</Typography>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* Route Stops Card */}
            <Paper sx={{
                borderRadius: RADIUS,
                mb: 2.5,
                overflow: "hidden",
                boxShadow: "none",
                border: `1px solid ${DASH.green}38`
            }}>
                {/* Card Header */}
                <Box sx={{
                    background: DASH.greenLight,
                    borderBottom: `1px solid ${DASH.green}38`,
                    px: 2,
                    py: 1.25,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: RADIUS,
                            backgroundColor: `${DASH.green}24`,
                            border: "1px solid #6EE7B7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <LocationOnIcon sx={{ color: "#059669", fontSize: 18 }} />
                        </Box>
                        <Box>
                            <Typography fontWeight={600} fontSize="14px" color="#047857">
                                Route Stops
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Typography fontSize="11px" color={stops.length >= 30 ? "#f44336" : "#059669"}>
                                    {stops.length}/30 stops configured
                                </Typography>
                                {stops.some(s => s.km) && (
                                    <Typography fontSize="11px" color="#047857" fontWeight={600}>
                                        · {stops.reduce((sum, s) => sum + (parseFloat(s.km) || 0), 0).toFixed(1)} km total
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <Button
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        onClick={addStop}
                        disabled={stops.length >= 30}
                        size="small"
                        sx={{
                            backgroundColor: stops.length >= 30 ? "#9CA3AF" : "#10B981",
                            color: "#fff",
                            textTransform: "none",
                            borderRadius: RADIUS,
                            fontSize: "12px",
                            fontWeight: 500,
                            px: 1.5,
                            py: 0.5,
                            boxShadow: "none",
                            "&:hover": { backgroundColor: stops.length >= 30 ? "#9CA3AF" : "#059669", boxShadow: "none" },
                            "&.Mui-disabled": {
                                backgroundColor: "#9CA3AF",
                                color: "#fff",
                                opacity: 0.7
                            }
                        }}
                    >
                        Add Stop
                    </Button>
                </Box>

                {/* Stops List */}
                <Box sx={{ p: 2, backgroundColor: "#FAFAFA" }}>
                    <Box sx={{ position: "relative" }}>
                        {/* Vertical Timeline Line */}
                        {stops.length > 1 && (
                            <Box sx={{
                                position: "absolute",
                                left: 17,
                                top: 36,
                                bottom: 36,
                                width: 2,
                                background: DASH.line,
                                borderRadius: 1,
                                zIndex: 0
                            }} />
                        )}

                        {stops.map((stop, index) => (
                            <Box
                                key={stop.id}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    mb: index === stops.length - 1 ? 0 : 2,
                                    position: "relative",
                                    zIndex: 1
                                }}
                            >
                                {/* Stop Number/Icon */}
                                <Box sx={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    backgroundColor: index === 0 ? "#10B981" : index === stops.length - 1 ? "#EF4444" : "#fff",
                                    border: index === 0 || index === stops.length - 1 ? "none" : `2px solid ${DASH.line}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "none",
                                    flexShrink: 0
                                }}>
                                    {index === 0 ? (
                                        <PlayArrowIcon sx={{ color: "#fff", fontSize: 18 }} />
                                    ) : index === stops.length - 1 ? (
                                        <FmdGoodIcon sx={{ color: "#fff", fontSize: 18 }} />
                                    ) : (
                                        <Typography color="#6B7280" fontSize="12px" fontWeight={600}>
                                            {index}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Stop Card */}
                                <Paper sx={{
                                    flex: 1,
                                    p: 1.5,
                                    borderRadius: RADIUS,
                                    border: "1px solid #E8EDF2",
                                    backgroundColor: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    boxShadow: "none",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        borderColor: "#9CA3AF",
                                        backgroundColor: "#FAFAFA"
                                    }
                                }}>
                                    {/* Reorder Buttons */}
                                    <Box sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.25
                                    }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => moveStop(index, -1)}
                                            disabled={index === 0}
                                            sx={{
                                                p: 0.25,
                                                color: index === 0 ? DASH.line : DASH.muted,
                                                "&:hover": { color: ACCENT_DEEP, backgroundColor: `${ACCENT}14` }
                                            }}
                                        >
                                            <ExpandLessIcon fontSize="small" />
                                        </IconButton>
                                        <DragIndicatorIcon sx={{ color: DASH.line, fontSize: 18, mx: "auto" }} />
                                        <IconButton
                                            size="small"
                                            onClick={() => moveStop(index, 1)}
                                            disabled={index === stops.length - 1}
                                            sx={{
                                                p: 0.25,
                                                color: index === stops.length - 1 ? DASH.line : DASH.muted,
                                                "&:hover": { color: ACCENT_DEEP, backgroundColor: `${ACCENT}14` }
                                            }}
                                        >
                                            <ExpandMoreIcon fontSize="small" />
                                        </IconButton>
                                    </Box>

                                    {/* Location Input */}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography fontSize="11px" color="#6B7280" fontWeight={500} mb={0.5}>
                                            {index === 0 ? "Starting Point" : index === stops.length - 1 ? "Final Destination" : `Stop ${index}`}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            value={stop.name}
                                            onChange={(e) => updateStop(stop.id, "name", e.target.value)}
                                            placeholder={index === 0 ? "e.g., School Main Gate" : "Enter location"}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    height: 40,
                                                    borderRadius: RADIUS,
                                                    fontSize: "14px",
                                                    backgroundColor: "#fff",
                                                    border: `1px solid ${DASH.line}`,
                                                    "&:hover": { borderColor: "#9CA3AF" },
                                                    "&.Mui-focused": {
                                                        borderColor: "#6366F1",
                                                        boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.1)"
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>

                                    {/* Time Input */}
                                    <Box sx={{ width: 130 }}>
                                        <Typography fontSize="11px" color="#6B7280" fontWeight={500} mb={0.5}>
                                            Arrival Time
                                        </Typography>
                                        <TextField
                                            type="time"
                                            value={stop.arrivalTime}
                                            onChange={(e) => updateStop(stop.id, "arrivalTime", e.target.value)}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    height: 40,
                                                    borderRadius: RADIUS,
                                                    fontSize: "14px",
                                                    backgroundColor: "#fff",
                                                    border: `1px solid ${DASH.line}`,
                                                    "&:hover": { borderColor: "#9CA3AF" },
                                                    "&.Mui-focused": {
                                                        borderColor: "#6366F1",
                                                        boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.1)"
                                                    }
                                                }
                                            }}
                                            fullWidth
                                        />
                                    </Box>

                                    {/* Wait Time */}
                                    <Box sx={{ width: 90 }}>
                                        <Typography fontSize="11px" color="#6B7280" fontWeight={500} mb={0.5}>
                                            Wait
                                        </Typography>
                                        <TextField
                                            value={stop.waitTime}
                                            onChange={(e) => updateStop(stop.id, "waitTime", e.target.value)}
                                            placeholder="2"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    height: 40,
                                                    borderRadius: RADIUS,
                                                    fontSize: "14px",
                                                    backgroundColor: "#fff",
                                                    border: `1px solid ${DASH.line}`,
                                                    "&:hover": { borderColor: "#9CA3AF" },
                                                    "&.Mui-focused": {
                                                        borderColor: "#6366F1",
                                                        boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.1)"
                                                    }
                                                }
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography fontSize="11px" color="#9CA3AF">min</Typography>
                                                    </InputAdornment>
                                                )
                                            }}
                                            fullWidth
                                        />
                                    </Box>

                                    {/* KM Input */}
                                    <Box sx={{ width: 90 }}>
                                        <Typography fontSize="11px" color="#6B7280" fontWeight={500} mb={0.5}>
                                            Distance (km)
                                        </Typography>
                                        <TextField
                                            value={stop.km}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (/^\d*\.?\d{0,2}$/.test(val)) updateStop(stop.id, "km", val);
                                            }}
                                            placeholder="0.0"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    height: 40,
                                                    borderRadius: RADIUS,
                                                    fontSize: "14px",
                                                    backgroundColor: "#fff",
                                                    border: `1px solid ${DASH.line}`,
                                                    "&:hover": { borderColor: "#9CA3AF" },
                                                    "&.Mui-focused": {
                                                        borderColor: "#6366F1",
                                                        boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.1)"
                                                    }
                                                }
                                            }}
                                            slotProps={{
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Typography fontSize="11px" color="#9CA3AF">km</Typography>
                                                        </InputAdornment>
                                                    )
                                                }
                                            }}
                                            fullWidth
                                        />
                                    </Box>

                                    {/* Delete Button */}
                                    {stops.length > 1 && (
                                        <Tooltip title="Remove stop">
                                            <IconButton
                                                size="small"
                                                onClick={() => removeStop(stop.id)}
                                                sx={{
                                                    color: "#9CA3AF",
                                                    "&:hover": { color: "#EF4444", backgroundColor: "#FEF2F2" }
                                                }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Paper>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3
            }}>
                <Button
                    variant="outlined"
                    onClick={() => {
                        setViewMode("list");
                        setEditingRoute(null);
                        resetForm();
                    }}
                    sx={{
                        borderColor: "#D1D5DB",
                        color: "#6B7280",
                        textTransform: "none",
                        borderRadius: RADIUS,
                        height: 40,
                        fontSize: "14px",
                        fontWeight: 500,
                        px: 3,
                        "&:hover": { borderColor: DASH.faint, backgroundColor: DASH.surface }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    sx={{
                        borderColor: "#D1D5DB",
                        color: "#374151",
                        textTransform: "none",
                        borderRadius: RADIUS,
                        height: 40,
                        fontSize: "14px",
                        fontWeight: 500,
                        px: 3,
                        "&:hover": { borderColor: DASH.faint, backgroundColor: DASH.surface }
                    }}
                >
                    Export
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSaveTrip}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} sx={{ color: "#9CA3AF" }} /> : null}
                    sx={{
                        backgroundColor: `${ACCENT}1A`,
                        color: ACCENT_DEEP,
                        border: `1px solid ${ACCENT}47`,
                        textTransform: "none",
                        borderRadius: RADIUS,
                        height: 36,
                        fontWeight: 700,
                        fontSize: "13px",
                        px: 3,
                        boxShadow: "none",
                        "&:hover": {
                            backgroundColor: `${ACCENT}2E`,
                            borderColor: ACCENT,
                            boxShadow: "none"
                        },
                        "&:disabled": {
                            backgroundColor: DASH.lineSoft,
                            borderColor: DASH.line,
                            color: DASH.faint
                        }
                    }}
                >
                    {isLoading ? "Creating Route..." : editingRoute ? "Update Route" : "Create Route"}
                </Button>
            </Box>
        </Box>
    );

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
                title={viewMode === "create"
                    ? (editingRoute ? "Edit Route" : "Create New Route")
                    : "Route Management"}
                subtitle={viewMode === "create"
                    ? "Configure route details and stops"
                    : "Manage transportation routes"}
                onBack={() => {
                    if (viewMode === "create") {
                        setViewMode("list");
                        setEditingRoute(null);
                        resetForm();
                    } else {
                        navigate(-1);
                    }
                }}
                right={viewMode === "list" && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            height: 34,
                            px: 1.4,
                            borderRadius: RADIUS,
                            bgcolor: `${ACCENT}1A`,
                            border: `1px solid ${ACCENT}47`,
                        }}
                    >
                        <RouteIcon sx={{ color: ACCENT_DEEP, fontSize: 16 }} />
                        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: ACCENT_DEEP }}>
                            {stats.totalRoutes} Routes
                        </Typography>
                    </Box>
                )}
            />

            <Box>
                {viewMode === "list" ? renderListView() : renderCreateView()}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog}
                onClose={() => !isLoading && setDeleteDialog(false)}
                PaperProps={{
                    sx: { borderRadius: RADIUS, minWidth: 400, overflow: "hidden", border: "1px solid #E5E7EB" }
                }}
            >
                <Box sx={{ textAlign: "center" }}>
                    {/* Red Header */}
                    <Box sx={{
                        backgroundColor: "#FEF2F2",
                        borderBottom: "1px solid #FECACA",
                        py: 2.5,
                        display: "flex",
                        justifyContent: "center"
                    }}>
                        <Box sx={{
                            width: 56,
                            height: 56,
                            borderRadius: RADIUS,
                            backgroundColor: "#FEE2E2",
                            border: "1px solid #FECACA",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <DeleteIcon sx={{ fontSize: 28, color: "#DC2626" }} />
                        </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 3 }}>
                        <Typography sx={{ fontSize: "18px", fontWeight: 600, color: "#111827", mb: 1 }}>
                            Delete Route?
                        </Typography>
                        <Typography sx={{ fontSize: "14px", color: "#6B7280", mb: 3, lineHeight: 1.6 }}>
                            Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>?
                            <br />This action cannot be undone.
                        </Typography>
                        <DialogActions sx={{ justifyContent: 'center', p: 0, gap: 2 }}>
                            <Button
                                onClick={() => setDeleteDialog(false)}
                                disabled={isLoading}
                                sx={{
                                    textTransform: "none",
                                    color: "#374151",
                                    fontWeight: 500,
                                    borderRadius: RADIUS,
                                    border: `1px solid ${DASH.line}`,
                                    px: 3,
                                    py: 1,
                                    "&:hover": { backgroundColor: "#F9FAFB", borderColor: "#9CA3AF" },
                                    "&:disabled": {
                                        color: "#9CA3AF",
                                        borderColor: "#E5E7EB"
                                    }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                disabled={isLoading}
                                startIcon={isLoading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : null}
                                sx={{
                                    textTransform: "none",
                                    backgroundColor: "#DC2626",
                                    color: "#fff",
                                    fontWeight: 500,
                                    borderRadius: RADIUS,
                                    px: 3,
                                    py: 1,
                                    boxShadow: "none",
                                    "&:hover": { backgroundColor: "#B91C1C", boxShadow: "none" },
                                    "&:disabled": {
                                        backgroundColor: "#FECACA",
                                        color: "#fff"
                                    }
                                }}
                            >
                                {isLoading ? "Deleting..." : "Delete Route"}
                            </Button>
                        </DialogActions>
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
}
