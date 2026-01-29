import React, { useState } from "react";
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
    Autocomplete,
    InputAdornment,
    Tooltip,
    Chip,
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
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { selectSidebarExpanded } from "../../../../Redux/Slices/sidebarSlice";

// Modern Professional Styles - Sharp Edges
const inputSx = {
    "& .MuiOutlinedInput-root": {
        height: 44,
        borderRadius: "4px",
        fontSize: "14px",
        backgroundColor: "#fff",
        border: "1px solid #D1D5DB",
        transition: "all 0.2s ease",
        "&:hover": {
            borderColor: "#9CA3AF",
        },
        "&.Mui-focused": {
            borderColor: "#6366F1",
            boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.1)",
        }
    }
};

const selectSx = {
    height: 44,
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "#fff",
    transition: "all 0.2s ease",
    "&:hover": {
        borderColor: "#9CA3AF",
    },
    "&.Mui-focused": {
        borderColor: "#6366F1",
        boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.1)",
    }
};

const labelSx = {
    color: "#374151",
    fontWeight: 600,
    fontSize: "13px",
    mb: 0.75,
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    "& .required": {
        color: "#EF4444",
        marginLeft: "2px"
    }
};

export default function RouteManagement() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const isExpanded = useSelector(selectSidebarExpanded);

    // State for view mode
    const [viewMode, setViewMode] = useState("list"); // "list" or "create"
    const [editingRoute, setEditingRoute] = useState(null);

    // State for route form
    const [routeName, setRouteName] = useState("");
    const [tripType, setTripType] = useState("");
    const [tripDate, setTripDate] = useState("everyday");
    const [selectedDays, setSelectedDays] = useState([]);
    const [tripTime, setTripTime] = useState("");
    const [tripDuration, setTripDuration] = useState("");
    const [assignedBus, setAssignedBus] = useState("");
    const [assignedDriver, setAssignedDriver] = useState("");

    // State for stops
    const [stops, setStops] = useState([
        { id: 1, name: "", type: "stop", arrivalTime: "", waitTime: "2" }
    ]);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog states
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Sample data
    const [routes, setRoutes] = useState([
        {
            id: 1,
            name: "Morning Pickup - Route A",
            type: "Pickup",
            date: "Everyday",
            time: "07:00 AM",
            duration: "45 mins",
            bus: "Bus A (TN-45-AB-1234)",
            driver: "Rajesh Kumar",
            stops: 6,
            status: "Active"
        },
        {
            id: 2,
            name: "Afternoon Drop - Route A",
            type: "Drop",
            date: "Everyday",
            time: "03:30 PM",
            duration: "50 mins",
            bus: "Bus A (TN-45-AB-1234)",
            driver: "Rajesh Kumar",
            stops: 6,
            status: "Active"
        },
        {
            id: 3,
            name: "Morning Pickup - Route B",
            type: "Pickup",
            date: "Mon, Wed, Fri",
            time: "07:30 AM",
            duration: "35 mins",
            bus: "Bus B (TN-45-CD-5678)",
            driver: "Suresh Babu",
            stops: 4,
            status: "Active"
        },
    ]);

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
    const buses = [
        { id: 1, name: "Bus A", number: "TN-45-AB-1234" },
        { id: 2, name: "Bus B", number: "TN-45-CD-5678" },
        { id: 3, name: "Bus C", number: "TN-45-EF-9012" },
    ];
    const drivers = [
        { id: 1, name: "Rajesh Kumar", phone: "9876543210" },
        { id: 2, name: "Suresh Babu", phone: "9876543211" },
        { id: 3, name: "Mohan Das", phone: "9876543212" },
    ];
    const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Sample location suggestions
    const locationSuggestions = [
        "Morning Star Matriculation School, Thanjavur",
        "Thanjavur Tanjore - Old Bus Stand, S Rampart",
        "Brihadeeswara Temple, Balaganapathy Nagar",
        "Annai Sathya Stadium, 44/1, 2nd St, Rajja Nagar",
        "Municipal Colony, Eiswari Nagar, Thanjavur",
        "Mangalapuram, Ramani Nagar, Thanjavur",
        "Thanjavur Medical College, Medical College Rd",
        "Thanjavur Railway Junction",
        "Big Bazaar, South Main Street",
        "VOC Park, Gandhiji Road"
    ];

    // Add new stop
    const addStop = () => {
        const newId = Math.max(...stops.map(s => s.id), 0) + 1;
        setStops([...stops, { id: newId, name: "", type: "stop", arrivalTime: "", waitTime: "2" }]);
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
    const handleEditRoute = (route) => {
        setViewMode("create");
        setEditingRoute(route);
        setRouteName(route.name);
        setTripType(route.type);
    };

    // Reset form
    const resetForm = () => {
        setRouteName("");
        setTripType("");
        setTripDate("everyday");
        setSelectedDays([]);
        setTripTime("");
        setTripDuration("");
        setAssignedBus("");
        setAssignedDriver("");
        setStops([{ id: 1, name: "", type: "stop", arrivalTime: "", waitTime: "2" }]);
    };

    // Handle save/create trip
    const handleSaveTrip = () => {
        // Validation and save logic here
        console.log("Saving trip...");
        setViewMode("list");
    };

    // Handle delete
    const handleDeleteRoute = (route) => {
        setDeleteTarget(route);
        setDeleteDialog(true);
    };

    const confirmDelete = () => {
        setRoutes(routes.filter(r => r.id !== deleteTarget.id));
        setDeleteDialog(false);
        setDeleteTarget(null);
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

    // Render List View
    const renderListView = () => (
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {[
                    { label: "Total Routes", value: routes.length, color: "#5B21B6", bg: "#EDE9FE", borderColor: "#C4B5FD", iconBg: "#DDD6FE", icon: <RouteIcon sx={{ fontSize: 18 }} /> },
                    { label: "Active", value: routes.filter(r => r.status === "Active").length, color: "#047857", bg: "#D1FAE5", borderColor: "#6EE7B7", iconBg: "#A7F3D0", icon: <CheckCircleIcon sx={{ fontSize: 18 }} /> },
                    { label: "Pickup", value: routes.filter(r => r.type === "Pickup").length, color: "#1D4ED8", bg: "#DBEAFE", borderColor: "#93C5FD", iconBg: "#BFDBFE", icon: <TrendingUpIcon sx={{ fontSize: 18 }} /> },
                    { label: "Drop", value: routes.filter(r => r.type === "Drop").length, color: "#B45309", bg: "#FEF3C7", borderColor: "#FCD34D", iconBg: "#FDE68A", icon: <NearMeIcon sx={{ fontSize: 18 }} /> },
                ].map((stat, idx) => (
                    <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                        <Paper sx={{
                            p: 3,
                            borderRadius: "4px",
                            border: `1px solid ${stat.borderColor}`,
                            backgroundColor: stat.bg,
                            boxShadow: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5
                        }}>
                            <Box sx={{
                                width: 42,
                                height: 42,
                                borderRadius: "4px",
                                backgroundColor: stat.iconBg,
                                border: `1px solid ${stat.borderColor}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                            }}>
                                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                            </Box>
                            <Box>
                                <Typography fontSize="11px" color="#374151" fontWeight={600} textTransform="uppercase" letterSpacing="0.3px">
                                    {stat.label}
                                </Typography>
                                <Typography fontSize="24px" fontWeight={700} color={stat.color} lineHeight={1.2}>
                                    {stat.value}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Search and Actions Bar */}
            <Paper sx={{
                p: 1.5,
                borderRadius: "4px",
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                border: "1px solid #D1D5DB",
                boxShadow: "none",
                backgroundColor: "#F3F4F6"
            }}>
                <TextField
                    placeholder="Search routes..."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        width: { xs: "100%", sm: 320 },
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "4px",
                            height: 38,
                            backgroundColor: "#F9FAFB",
                            "& fieldset": { borderColor: "#E5E7EB" },
                            "&:hover fieldset": { borderColor: "#D1D5DB" },
                            "&.Mui-focused fieldset": {
                                borderColor: websiteSettings.mainColor,
                                borderWidth: "1px"
                            }
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            borderColor: "#E5E7EB",
                            color: "#4B5563",
                            textTransform: "none",
                            borderRadius: "4px",
                            height: 38,
                            fontSize: "13px",
                            fontWeight: 500,
                            px: 2,
                            "&:hover": { borderColor: "#D1D5DB", backgroundColor: "#F9FAFB" }
                        }}
                    >
                        Export
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                        onClick={handleCreateNew}
                        sx={{
                            backgroundColor: websiteSettings.mainColor,
                            color: websiteSettings.textColor,
                            textTransform: "none",
                            borderRadius: "4px",
                            height: 38,
                            fontWeight: 600,
                            fontSize: "13px",
                            px: 2.5,
                            boxShadow: "none",
                            "&:hover": { backgroundColor: websiteSettings.darkColor || websiteSettings.mainColor, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }
                        }}
                    >
                        New Route
                    </Button>
                </Box>
            </Paper>

            {/* Routes Table */}
            <Paper sx={{
                borderRadius: "4px",
                overflow: "hidden",
                boxShadow: "none",
                border: "1px solid #D1D5DB",
                backgroundColor: "#fff"
            }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#E5E7EB" }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: "11px", color: "#6B7280", py: 1.5, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #E5E7EB" }}>Route Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: "11px", color: "#6B7280", py: 1.5, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #E5E7EB" }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: "11px", color: "#6B7280", py: 1.5, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #E5E7EB" }}>Schedule</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: "11px", color: "#6B7280", py: 1.5, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #E5E7EB" }}>Time</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: "11px", color: "#6B7280", py: 1.5, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #E5E7EB" }}>Bus</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: "11px", color: "#6B7280", py: 1.5, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #E5E7EB" }}>Driver</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: "11px", color: "#6B7280", py: 1.5, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #E5E7EB" }}>Stops</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: "11px", color: "#6B7280", py: 1.5, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #E5E7EB" }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: "11px", color: "#6B7280", py: 1.5, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #E5E7EB" }} align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRoutes.map((route) => (
                            <TableRow
                                key={route.id}
                                sx={{
                                    transition: "all 0.15s ease",
                                    "&:hover": { backgroundColor: "#F9FAFB" },
                                    "&:last-child td": { borderBottom: 0 }
                                }}
                            >
                                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #F3F4F6" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Box sx={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: "4px",
                                            backgroundColor: route.type === "Pickup" ? "#EFF6FF" : route.type === "Drop" ? "#FEF3C7" : "#F5F3FF",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <RouteIcon sx={{ color: route.type === "Pickup" ? "#3B82F6" : route.type === "Drop" ? "#F59E0B" : "#8B5CF6", fontSize: 18 }} />
                                        </Box>
                                        <Box>
                                            <Typography fontSize="13px" fontWeight={600} color="#111827">{route.name}</Typography>
                                            <Typography fontSize="11px" color="#9CA3AF">{route.duration}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #F3F4F6" }}>
                                    <Chip
                                        label={route.type}
                                        size="small"
                                        sx={{
                                            backgroundColor: route.type === "Pickup" ? "#DBEAFE" : route.type === "Drop" ? "#FEF3C7" : "#F3E8FF",
                                            color: route.type === "Pickup" ? "#1D4ED8" : route.type === "Drop" ? "#B45309" : "#7C3AED",
                                            fontWeight: 600,
                                            fontSize: "11px",
                                            borderRadius: "4px",
                                            height: 22,
                                            "& .MuiChip-label": { px: 1 }
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontSize: "13px", color: "#4B5563", py: 1.5, borderBottom: "1px solid #F3F4F6" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <ScheduleIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                                        {route.date}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #F3F4F6" }}>
                                    <Typography fontSize="13px" fontWeight={500} color="#111827">{route.time}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #F3F4F6" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <DirectionsBusIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                                        <Typography fontSize="13px" color="#4B5563">{route.bus}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ fontSize: "13px", color: "#4B5563", py: 1.5, borderBottom: "1px solid #F3F4F6" }}>{route.driver}</TableCell>
                                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #F3F4F6" }}>
                                    <Box sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        backgroundColor: "#F3F4F6",
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: "4px"
                                    }}>
                                        <LocationOnIcon sx={{ fontSize: 12, color: "#6B7280" }} />
                                        <Typography fontSize="12px" fontWeight={500} color="#4B5563">{route.stops}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #F3F4F6" }}>
                                    <Box sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        backgroundColor: route.status === "Active" ? "#ECFDF5" : "#FEF2F2",
                                        color: route.status === "Active" ? "#059669" : "#DC2626",
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: "4px"
                                    }}>
                                        <Box sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: "50%",
                                            backgroundColor: route.status === "Active" ? "#10B981" : "#EF4444"
                                        }} />
                                        <Typography fontSize="11px" fontWeight={600}>{route.status}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="center" sx={{ py: 1.5, borderBottom: "1px solid #F3F4F6" }}>
                                    <Box sx={{ display: "flex", justifyContent: "center", gap: 0.25 }}>
                                        <Tooltip title="Edit Route" arrow>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditRoute(route)}
                                                sx={{
                                                    color: "#9CA3AF",
                                                    width: 30,
                                                    height: 30,
                                                    "&:hover": { color: "#6366F1", backgroundColor: "#F5F3FF" }
                                                }}
                                            >
                                                <EditIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
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
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredRoutes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                        <RouteIcon sx={{ fontSize: 48, color: "#D1D5DB" }} />
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

    // Render Create/Edit View
    const renderCreateView = () => (
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
            {/* Route Information Card */}
            <Paper sx={{
                borderRadius: "4px",
                mb: 2.5,
                overflow: "hidden",
                boxShadow: "none",
                border: "1px solid #C7D2FE",
                backgroundColor: "#fff"
            }}>
                {/* Card Header */}
                <Box sx={{
                    background: "#EEF2FF",
                    borderBottom: "1px solid #C7D2FE",
                    px: 2,
                    py: 1.25,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25
                }}>
                    <Box sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "4px",
                        backgroundColor: "#C7D2FE",
                        border: "1px solid #A5B4FC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <RouteIcon sx={{ color: "#4F46E5", fontSize: 18 }} />
                    </Box>
                    <Typography fontWeight={600} fontSize="14px" color="#4338CA">
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
                                {buses.map((bus) => (
                                    <MenuItem key={bus.id} value={bus.id}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <DirectionsBusIcon sx={{ fontSize: 18, color: websiteSettings.mainColor }} />
                                            <Typography fontSize="14px">{bus.name} ({bus.number})</Typography>
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
                borderRadius: "4px",
                mb: 2.5,
                overflow: "hidden",
                boxShadow: "none",
                border: "1px solid #A7F3D0"
            }}>
                {/* Card Header */}
                <Box sx={{
                    background: "#ECFDF5",
                    borderBottom: "1px solid #A7F3D0",
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
                            borderRadius: "4px",
                            backgroundColor: "#A7F3D0",
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
                            <Typography fontSize="11px" color="#059669">
                                {stops.length} stop{stops.length > 1 ? 's' : ''} configured
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        onClick={addStop}
                        size="small"
                        sx={{
                            backgroundColor: "#10B981",
                            color: "#fff",
                            textTransform: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: 500,
                            px: 1.5,
                            py: 0.5,
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "#059669", boxShadow: "none" }
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
                                background: "#D1D5DB",
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
                                    border: index === 0 || index === stops.length - 1 ? "none" : "2px solid #D1D5DB",
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
                                    borderRadius: "4px",
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
                                                color: index === 0 ? "#D1D5DB" : "#6B7280",
                                                "&:hover": { color: "#6366F1", backgroundColor: "#EEF2FF" }
                                            }}
                                        >
                                            <ExpandLessIcon fontSize="small" />
                                        </IconButton>
                                        <DragIndicatorIcon sx={{ color: "#D1D5DB", fontSize: 18, mx: "auto" }} />
                                        <IconButton
                                            size="small"
                                            onClick={() => moveStop(index, 1)}
                                            disabled={index === stops.length - 1}
                                            sx={{
                                                p: 0.25,
                                                color: index === stops.length - 1 ? "#D1D5DB" : "#6B7280",
                                                "&:hover": { color: "#6366F1", backgroundColor: "#EEF2FF" }
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
                                        <Autocomplete
                                            freeSolo
                                            options={locationSuggestions}
                                            value={stop.name}
                                            onChange={(e, value) => updateStop(stop.id, "name", value || "")}
                                            onInputChange={(e, value) => updateStop(stop.id, "name", value)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    placeholder={index === 0 ? "e.g., School Main Gate" : "Enter location"}
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": {
                                                            height: 40,
                                                            borderRadius: "4px",
                                                            fontSize: "14px",
                                                            backgroundColor: "#fff",
                                                            border: "1px solid #D1D5DB",
                                                            "&:hover": { borderColor: "#9CA3AF" },
                                                            "&.Mui-focused": {
                                                                borderColor: "#6366F1",
                                                                boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.1)"
                                                            }
                                                        }
                                                    }}
                                                />
                                            )}
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
                                                    borderRadius: "4px",
                                                    fontSize: "14px",
                                                    backgroundColor: "#fff",
                                                    border: "1px solid #D1D5DB",
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
                                                    borderRadius: "4px",
                                                    fontSize: "14px",
                                                    backgroundColor: "#fff",
                                                    border: "1px solid #D1D5DB",
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
                    onClick={() => setViewMode("list")}
                    sx={{
                        borderColor: "#D1D5DB",
                        color: "#6B7280",
                        textTransform: "none",
                        borderRadius: "4px",
                        height: 40,
                        fontSize: "14px",
                        fontWeight: 500,
                        px: 3,
                        "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" }
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
                        borderRadius: "4px",
                        height: 40,
                        fontSize: "14px",
                        fontWeight: 500,
                        px: 3,
                        "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" }
                    }}
                >
                    Export
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSaveTrip}
                    sx={{
                        backgroundColor: websiteSettings.mainColor,
                        color: websiteSettings.textColor,
                        textTransform: "none",
                        borderRadius: "4px",
                        height: 40,
                        fontWeight: 600,
                        fontSize: "14px",
                        px: 4,
                        boxShadow: "none",
                        "&:hover": {
                            backgroundColor: websiteSettings.darkColor || websiteSettings.mainColor,
                            boxShadow: "none"
                        }
                    }}
                >
                    {editingRoute ? "Update Route" : "Create Route"}
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ width: '100%',  }}>
            {/* Header */}
            <Box sx={{
                position: "fixed",
                top: "60px",
                left: isExpanded ? "260px" : "80px",
                right: 0,
                backgroundColor: "#f2f2f2",
                px: 2,
                py: 0.5,
                borderBottom: "1px solid #ddd",
                zIndex: 1200,
                transition: "left 0.3s ease-in-out"
            }}>
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    maxWidth: 1400,
                    mx: "auto"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <IconButton
                            onClick={() => viewMode === "create" ? setViewMode("list") : navigate(-1)}
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "4px",
                                "&:hover": { backgroundColor: "#F3F4F6" }
                            }}
                        >
                            <ArrowBackIcon sx={{ fontSize: 18, color: "#6B7280" }} />
                        </IconButton>
                        <Box sx={{ borderLeft: "1px solid #E5E7EB", pl: 1.5 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 16, color: "#111827", lineHeight: 1.3 }}>
                                {viewMode === "create"
                                    ? (editingRoute ? "Edit Route" : "Create New Route")
                                    : "Route Management"
                                }
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>
                                {viewMode === "create"
                                    ? "Configure route details and stops"
                                    : "Manage transportation routes"
                                }
                            </Typography>
                        </Box>
                    </Box>
                    {viewMode === "list" && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                                px: 1.5,
                                py: 0.5,
                                backgroundColor: "#F5F3FF",
                                borderRadius: "4px"
                            }}>
                                <RouteIcon sx={{ color: "#8B5CF6", fontSize: 16 }} />
                                <Typography fontSize="12px" fontWeight={600} color="#7C3AED">
                                    {routes.length} Routes
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3, pt: 10 }}>
                {viewMode === "list" ? renderListView() : renderCreateView()}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                PaperProps={{
                    sx: { borderRadius: "4px", minWidth: 400, overflow: "hidden", border: "1px solid #E5E7EB" }
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
                            borderRadius: "4px",
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
                                sx={{
                                    textTransform: "none",
                                    color: "#374151",
                                    fontWeight: 500,
                                    borderRadius: "4px",
                                    border: "1px solid #D1D5DB",
                                    px: 3,
                                    py: 1,
                                    "&:hover": { backgroundColor: "#F9FAFB", borderColor: "#9CA3AF" }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                sx={{
                                    textTransform: "none",
                                    backgroundColor: "#DC2626",
                                    color: "#fff",
                                    fontWeight: 500,
                                    borderRadius: "4px",
                                    px: 3,
                                    py: 1,
                                    boxShadow: "none",
                                    "&:hover": { backgroundColor: "#B91C1C", boxShadow: "none" }
                                }}
                            >
                                Delete Route
                            </Button>
                        </DialogActions>
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
}
