import React, { useEffect, useState } from 'react'
import { Box } from '@mui/system'
import {
    Button,
    Grid,
    IconButton,
    Typography,
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    InputAdornment,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Checkbox,
    Avatar,
    Divider,
    Collapse,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Tabs,
    Tab,
    Tooltip
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PeopleIcon from '@mui/icons-material/People'
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import RouteIcon from '@mui/icons-material/Route'
import EventSeatIcon from '@mui/icons-material/EventSeat'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SchoolIcon from '@mui/icons-material/School'
import CloseIcon from '@mui/icons-material/Close'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import VisibilityIcon from '@mui/icons-material/Visibility'
import HistoryIcon from '@mui/icons-material/History'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import StudentSelectionPopup from '../../../Tools/StudentSelectionPopup'
import axios from 'axios'
import { getRouteFullDetailsById, GetUsersBaseDetails, postStudentRouteMapping, getAllStudentMappingCards } from '../../../../Api/Api'

// Color palette for bus cards - darker header/buttons with light card bg
const busColors = [
    { bg: "#8B5CF6", headerBg: "#DDD6FE", light: "#FAF9FF", border: "#C4B5FD", text: "#5B21B6" },
    { bg: "#10B981", headerBg: "#A7F3D0", light: "#F5FDF9", border: "#6EE7B7", text: "#065F46" },
    { bg: "#EF4444", headerBg: "#FECACA", light: "#FFF5F5", border: "#FCA5A5", text: "#B91C1C" },
    { bg: "#F59E0B", headerBg: "#FDE68A", light: "#FFFCF0", border: "#FCD34D", text: "#B45309" },
    { bg: "#3B82F6", headerBg: "#BFDBFE", light: "#F5F9FF", border: "#93C5FD", text: "#1E40AF" },
    { bg: "#EC4899", headerBg: "#FBCFE8", light: "#FFF5FA", border: "#F9A8D4", text: "#9D174D" },
];

// Seat Availability Component
const SeatAvailability = ({ occupied, total }) => {
    const available = total - occupied;
    const percentage = (occupied / total) * 100;
    const isLow = available <= 10;
    const isFull = available === 0;

    return (
        <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, mb: 0.5 }}>
                Bus Seat Availability
            </Typography>
            <Box sx={{
                backgroundColor: isFull ? "#FEE2E2" : isLow ? "#FEF3C7" : "#D1FAE5",
                border: `1px solid ${isFull ? "#FCA5A5" : isLow ? "#FCD34D" : "#6EE7B7"}`,
                borderRadius: "4px",
                px: 2,
                py: 0.5
            }}>
                <Typography sx={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: isFull ? "#DC2626" : isLow ? "#D97706" : "#059669"
                }}>
                    {occupied}/{total}
                </Typography>
            </Box>
            <Typography sx={{
                fontSize: "9px",
                color: isFull ? "#DC2626" : isLow ? "#D97706" : "#059669",
                mt: 0.5,
                fontWeight: 500
            }}>
                {isFull ? "No seats Available" : `Only ${available} seats Available`}
            </Typography>
        </Box>
    );
};

// Info Row Component
const InfoRow = ({ label, value, valueColor = "#333" }) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
        <Typography sx={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>
            {label}
        </Typography>
        <Typography sx={{ fontSize: "12px", color: valueColor, fontWeight: 600 }}>
            {value}
        </Typography>
    </Box>
);

// Bus Card Component
const BusCard = ({
    bus,
    colorScheme,
    onAddStudents,
    onViewExisting
}) => {
    const [showStops, setShowStops] = useState(false);

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 0,
                overflow: "hidden",
                border: `1px solid ${colorScheme.border}`,
                transition: "all 0.2s ease",
                "&:hover": {
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                backgroundColor: colorScheme.headerBg,
                color: colorScheme.text,
                px: 2,
                py: 1.2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderBottom: `1px solid ${colorScheme.border}`
            }}>
                <DirectionsBusIcon sx={{ fontSize: 20, color: colorScheme.text }} />
                <Typography sx={{ fontWeight: 600, fontSize: "15px", color: colorScheme.text }}>
                    {bus.routeName || "Route"}
                </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ p: 2.5, backgroundColor: colorScheme.light }}>
                {/* Route and Seat Availability */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
                    <Box sx={{ flex: 1, pr: 2 }}>
                        {/* Assigned Bus */}
                        <Box sx={{ mb: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                                <DirectionsBusIcon sx={{ fontSize: 14, color: colorScheme.text }} />
                                <Typography sx={{ fontSize: "11px", color: "#888", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Assigned Bus
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#333", pl: 2.3 }}>
                                {bus.busName || "N/A"}
                            </Typography>
                        </Box>

                        {/* Bus Route */}
                        <Box sx={{ mb: 1.5, height:"60px" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                                <RouteIcon sx={{ fontSize: 14, color: colorScheme.text }} />
                                <Typography sx={{ fontSize: "11px", color: "#888", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Route
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#333", pl: 2.3 }}>
                                {bus.busRoute || "N/A"}
                            </Typography>
                        </Box>

                        {/* Trip Time */}
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                                <AccessTimeIcon sx={{ fontSize: 14, color: colorScheme.text }} />
                                <Typography sx={{ fontSize: "11px", color: "#888", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Trip Time & Duration
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#333", pl: 2.3 }}>
                                {bus.tripTimeAndDuration || `${bus.tripStartTime || "N/A"} (${bus.duration || "N/A"})`}
                            </Typography>
                        </Box>
                    </Box>

                    <SeatAvailability
                        occupied={bus.occupiedSeats || 0}
                        total={bus.totalSeats || 35}
                    />
                </Box>

                <Divider sx={{ my: 2, borderColor: colorScheme.border }} />

                {/* Student Statistics */}
                <Box sx={{
                    mb: 2.5,
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    p: 1.5,
                    border: `1px solid ${colorScheme.border}`
                }}>
                    <Typography sx={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", mb: 1.2 }}>
                        Student Statistics
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "12px", color: "#555" }}>Existing Students</Typography>
                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>
                                {bus.existingStudents || 0} students
                            </Typography>
                        </Box>
                        {/* <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "12px", color: "#555" }}>Transferred</Typography>
                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#059669" }}>
                                {bus.transferredIn || 0} IN / {bus.transferredOut || 0} OUT
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "12px", color: "#555" }}>Removed</Typography>
                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#DC2626" }}>
                                {bus.removedStudents || 0}
                            </Typography>
                        </Box> */}
                    </Box>
                </Box>

                {/* View Intermediate Bus Stop */}
                <Box
                    onClick={() => setShowStops(!showStops)}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                        cursor: "pointer",
                        color: colorScheme.text,
                        mb: 2,
                        "&:hover": { textDecoration: "underline" }
                    }}
                >
                    <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
                        View Intermediate Bus Stop
                    </Typography>
                    {showStops ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                </Box>

                {/* Intermediate Stops Collapse */}
                <Collapse in={showStops}>
                    <Box sx={{
                        backgroundColor: colorScheme.light,
                        borderRadius: "8px",
                        p: 1.5,
                        mb: 2,
                        maxHeight: 200,
                        overflowY: "auto",
                        border: `1px solid ${colorScheme.border}`,
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: colorScheme.light,
                            borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: colorScheme.border,
                            borderRadius: '10px',
                            '&:hover': {
                                backgroundColor: colorScheme.text,
                            },
                        },
                    }}>
                        {bus.intermediateStops && bus.intermediateStops.length > 0 ? (
                            bus.intermediateStops.map((stop, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        py: 0.8,
                                        px: 0.5,
                                        borderBottom: index < bus.intermediateStops.length - 1 ? "1px dashed #E5E7EB" : "none",
                                        transition: "background-color 0.2s",
                                        '&:hover': {
                                            backgroundColor: 'rgba(0,0,0,0.02)',
                                            borderRadius: '4px'
                                        }
                                    }}
                                >
                                    <LocationOnIcon sx={{ fontSize: 14, color: colorScheme.text }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: "11px", color: "#333", fontWeight: 600 }}>
                                            {stop.point}
                                        </Typography>
                                        <Typography sx={{ fontSize: "10px", color: "#666" }}>
                                            {stop.stopName} - {stop.time}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`${stop.studentsCount || 0}`}
                                        size="small"
                                        sx={{
                                            ml: "auto",
                                            height: 20,
                                            fontSize: "9px",
                                            backgroundColor: colorScheme.headerBg,
                                            color: colorScheme.text,
                                            borderRadius: "4px",
                                            border: `1px solid ${colorScheme.border}`,
                                            fontWeight: 600
                                        }}
                                    />
                                </Box>
                            ))
                        ) : (
                            <Typography sx={{ fontSize: "11px", color: "#999", textAlign: "center", py: 2 }}>
                                No intermediate stops configured
                            </Typography>
                        )}
                    </Box>
                </Collapse>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {/* Primary Actions Row */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<PersonAddIcon sx={{ fontSize: 16 }} />}
                            onClick={() => onAddStudents(bus)}
                            sx={{
                                backgroundColor: "#10B981",
                                color: "#fff",
                                textTransform: "none",
                                borderRadius: "8px",
                                py: 1,
                                fontSize: "12px",
                                fontWeight: 600,
                                boxShadow: "none",
                                "&:hover": {
                                    backgroundColor: "#059669",
                                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                                }
                            }}
                        >
                            Add / Remove
                        </Button>
                        {/* <Button
                            fullWidth
                            variant="contained"
                            startIcon={<PersonRemoveIcon sx={{ fontSize: 16 }} />}
                            onClick={() => onRemoveStudents(bus)}
                            sx={{
                                backgroundColor: "#EF4444",
                                color: "#fff",
                                textTransform: "none",
                                borderRadius: "8px",
                                py: 1,
                                fontSize: "12px",
                                fontWeight: 600,
                                boxShadow: "none",
                                "&:hover": {
                                    backgroundColor: "#DC2626",
                                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)"
                                }
                            }}
                        >
                            Remove
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<SwapHorizIcon sx={{ fontSize: 16 }} />}
                            onClick={() => onTransferStudents(bus)}
                            sx={{
                                backgroundColor: "#8B5CF6",
                                color: "#fff",
                                textTransform: "none",
                                borderRadius: "8px",
                                py: 1,
                                fontSize: "12px",
                                fontWeight: 600,
                                boxShadow: "none",
                                "&:hover": {
                                    backgroundColor: "#7C3AED",
                                    boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)"
                                }
                            }}
                        >
                            Transfer
                        </Button> */}
                    </Box>

                    {/* View Actions Row */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                            onClick={() => onViewExisting(bus)}
                            sx={{
                                borderColor: colorScheme.border,
                                color: colorScheme.text,
                                backgroundColor: "#fff",
                                textTransform: "none",
                                borderRadius: "8px",
                                py: 0.8,
                                fontSize: "11px",
                                fontWeight: 600,
                                "&:hover": {
                                    borderColor: colorScheme.text,
                                    backgroundColor: colorScheme.headerBg
                                }
                            }}
                        >
                            View Students
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};

export default function StudentMapping() {
    const navigate = useNavigate();
    const token = "123";
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);

    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const [searchQuery, setSearchQuery] = useState("");
    const [busRoutes, setBusRoutes] = useState([]);
    const [users, setUsers] = useState([]);
    const [routeDetails, setRouteDetails] = useState(null);

    // Dialog states
    const [openStudentPopup, setOpenStudentPopup] = useState(false);
    const [viewExistingDialog, setViewExistingDialog] = useState(false);
    const [selectedBus, setSelectedBus] = useState(null);

    // Student selection states
    const [existingStudents, setExistingStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [studentSearchQuery, setStudentSearchQuery] = useState("");

    const currentYear = new Date().getFullYear();
    const currentAcademicYear = `${currentYear}-${currentYear + 1}`;
    const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  
    const academicYears = [
      `${currentYear - 2}-${currentYear - 1}`,
      `${currentYear - 1}-${currentYear}`,
      `${currentYear}-${currentYear + 1}`,
    ];

    // Fetch initial data
    useEffect(() => {
        getUsers();
        fetchBusRoutes();
    }, []);

    const getUsers = async () => {
        try {
            const res = await axios.get(GetUsersBaseDetails, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(res.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
            setMessage("Failed to fetch students");
            setOpen(true);
            setColor(false);
            setStatus(false);
        }
    };

    const fetchBusRoutes = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(getAllStudentMappingCards, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.error === false) {
                const mappedRoutes = response.data.routes.map(route => {
                    // Parse seat availability (format: "occupied/total")
                    const [occupiedSeats, totalSeats] = route.seatAvailability.split('/').map(s => parseInt(s) || 0);

                    return {
                        id: route.routeInformationId,
                        routeName: route.tripName, // Route name for card header
                        busName: route.assignBus, // Bus name for display
                        busRoute: route.busRoute, // Full route description
                        tripStartTime: route.time,
                        tripEndTime: "", // Not provided in API
                        duration: route.duration,
                        tripTimeAndDuration: route.tripTimeAndDuration,
                        occupiedSeats: occupiedSeats,
                        totalSeats: totalSeats,
                        seatNote: route.seatNote,
                        existingStudents: route.studentStatistics.existingStudents,
                        transferredIn: route.studentStatistics.transferredIn,
                        transferredOut: route.studentStatistics.transferredOut,
                        removedStudents: route.studentStatistics.removed,
                        active: route.active,
                        intermediateStops: route.routeStops.map(stop => ({
                            stopName: stop.place,
                            point: stop.point,
                            time: stop.arrivalTime,
                            studentsCount: stop.studentsCount,
                            wait: stop.wait,
                            remarks: stop.remarks
                        }))
                    };
                });

                setBusRoutes(mappedRoutes);
                setMessage("Routes loaded successfully");
                setOpen(true);
                setColor(true);
                setStatus(true);
            } else {
                setMessage(response.data.message || "Failed to load routes");
                setOpen(true);
                setColor(false);
                setStatus(false);
            }
        } catch (error) {
            console.error("Error fetching bus routes:", error);
            setMessage("Failed to load routes");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchExistingStudents = async (routeInformationId) => {
        setIsLoading(true);
        try {
            const response = await axios.get(getRouteFullDetailsById, {
                params: { routeInformationId },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.error === false && response.data.routeStops) {
                // Students are nested inside each routeStop — extract and flatten them
                const studentsWithDetails = [];

                response.data.routeStops.forEach(stop => {
                    (stop.students || []).forEach(student => {
                        const rollNumber = student.rollNumber || student.roll || student.roll_number;
                        const user = users.find(u => u.rollNumber === rollNumber);
                        studentsWithDetails.push({
                            id: user?._id || user?.id || rollNumber,
                            name: user?.name || student.name || 'N/A',
                            rollNumber: rollNumber || 'N/A',
                            grade: user?.grade || student.grade || 'N/A',
                            section: user?.section || student.section || 'N/A',
                            phone: user?.phone || user?.phoneNumber || student.phone || 'N/A',
                            email: user?.email || student.email || '',
                            stopName: stop.place || 'N/A',
                            stopPoint: stop.point || '',
                            status: student.status || 'Active'
                        });
                    });
                });

                setExistingStudents(studentsWithDetails);

                if (studentsWithDetails.length === 0) {
                    setMessage("No students mapped to this route yet");
                    setOpen(true);
                    setColor(false);
                    setStatus(false);
                }
            } else {
                setExistingStudents([]);
                setMessage("No students found for this route");
                setOpen(true);
                setColor(false);
                setStatus(false);
            }
        } catch (error) {
            console.error("Error fetching existing students:", error);
            setExistingStudents([]);
            setMessage("Failed to load student details");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter routes based on search
    const filteredBusRoutes = busRoutes.filter((bus) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            bus.routeName?.toLowerCase().includes(query) ||
            bus.busName?.toLowerCase().includes(query) ||
            bus.busRoute?.toLowerCase().includes(query)
        );
    });

    // Fetch route details by ID
    const fetchRouteDetails = async (routeInformationId) => {
        setIsLoading(true);
        try {
            const response = await axios.get(getRouteFullDetailsById, {
                params: { routeInformationId },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.error === false) {
                setRouteDetails(response.data);
                setMessage("Route details loaded successfully");
                setOpen(true);
                setColor(true);
                setStatus(true);
                return response.data;
            } else {
                setMessage(response.data.message || "Failed to fetch route details");
                setOpen(true);
                setColor(false);
                setStatus(false);
                return null;
            }
        } catch (error) {
            console.error("Error fetching route details:", error);
            setMessage("Failed to load route details");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Handlers
    const handleAddStudents = async (bus) => {
        setSelectedBus(bus);
        // Fetch route details before opening popup
        const details = await fetchRouteDetails(bus.id);
        if (details) {
            setOpenStudentPopup(true);
        }
    };

    const handleCloseStudentPopup = () => {
        setOpenStudentPopup(false);
        setSelectedBus(null);
        setRouteDetails(null);
    };

    const handleSaveStudents = async (payload) => {

        if (!payload || !payload.selectedStudents || payload.selectedStudents.length === 0) {
            setMessage("Please select at least one student");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!payload.busStop) {
            setMessage("Please select a bus stop");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        // Construct payload with selected bus stop information
        const transformedPayload = {
            routeInfo: {
                routeInformationId: routeDetails.routeInformationId,
                busStop: payload.busStop, 
                year:selectedYear,
                rollNumbers: payload.selectedStudents.map(student => student.rollNumber || student)
            }
        };

        console.log("Transformed payload for API:", transformedPayload);
        console.log("Selected bus stop details:", payload.busStopDetails);

        setIsLoading(true);
        try {
            const response = await axios.post(postStudentRouteMapping, transformedPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.error === false) {
                setMessage(response.data.message || "Students mapped successfully");
                setOpen(true);
                setColor(true);
                setStatus(true);
                handleCloseStudentPopup();
                fetchBusRoutes();
            } else {
                setMessage(response.data.message || "Failed to map students");
                setOpen(true);
                setColor(false);
                setStatus(false);
            }
        } catch (error) {
            console.error("Error saving students:", error);
            setMessage(error.response?.data?.message || "Failed to map students");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewExisting = (bus) => {
        setSelectedBus(bus);
        setSelectedStudents([]);
        setStudentSearchQuery("");
        fetchExistingStudents(bus.id); // Pass route information ID
        setViewExistingDialog(true);
    };


    // const handleSaveStudentMapping = async () => {
    //     if (selectedStudents.length === 0) {
    //         setMessage("Please select at least one student");
    //         setColor(false);
    //         setStatus(false);
    //         setOpen(true);
    //         return;
    //     }

    //     if (!selectedStop) {
    //         setMessage("Please select a bus stop");
    //         setColor(false);
    //         setStatus(false);
    //         setOpen(true);
    //         return;
    //     }

    //     setIsLoading(true);
    //     try {
    //         // Replace with actual API call
    //         // await axios.post(addStudentsToBusRoute, {
    //         //     busId: selectedBus.id,
    //         //     stopId: selectedStop.id,
    //         //     studentIds: selectedStudents.map(s => s.id)
    //         // }, {
    //         //     headers: { Authorization: `Bearer ${token}` },
    //         // });

    //         setMessage(`${selectedStudents.length} students added successfully`);
    //         setColor(true);
    //         setStatus(true);
    //         setOpen(true);
    //         setAddStudentDialog(false);
    //         fetchBusRoutes();
    //     } catch (error) {
    //         console.error("Error adding students:", error);
    //         setMessage("Failed to add students");
    //         setColor(false);
    //         setStatus(false);
    //         setOpen(true);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };


    // Filter existing students based on search
    const filteredExistingStudents = existingStudents.filter((student) => {
        if (!studentSearchQuery.trim()) return true;
        const query = studentSearchQuery.toLowerCase();
        return (
            student.name?.toLowerCase().includes(query) ||
            student.rollNumber?.toLowerCase().includes(query) ||
            student.grade?.toLowerCase().includes(query) ||
            student.section?.toLowerCase().includes(query) ||
            student.stopName?.toLowerCase().includes(query) ||
            student.phone?.toLowerCase().includes(query) ||
            student.email?.toLowerCase().includes(query)
        );
    });

    return (
        <Box sx={{ width: '100%', backgroundColor: "#F8F9FA", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}

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
                 transition: "left 0.3s ease-in-out",
                 overflow: 'hidden',
                 display: "flex",
                 justifyContent: "space-between",
                 alignItems: "center",
            }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography sx={{ fontWeight: 600, fontSize: 20 }}>
                        Student Mapping
                    </Typography>
                </Box>

                <TextField
                    placeholder="Search by route name, bus, or route..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "#999" }} />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: "25px",
                            height: "36px",
                            fontSize: "13px",
                            backgroundColor: "#fff"
                        }
                    }}
                    sx={{ width: 300 }}
                />
                <Autocomplete
                  size="small"
                  options={academicYears}
                  sx={{ width: "170px" }}
                  value={selectedYear}
                  onChange={(e, newValue) => setSelectedYear(newValue)}
                  renderInput={(params) => (
                    <TextField
                      placeholder="Select Academic Year"
                      {...params}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "5px",
                          fontSize: 14,
                          height: 35,
                        },
                        "& .MuiOutlinedInput-input": {
                          textAlign: "center",
                          fontWeight: "600"
                        },
                      }}
                    />
                  )}
                />
            </Box>

            {/* Main Content */}
            <Box sx={{ p: 3, pt:9 }}>
                <Grid container spacing={3}>
                    {filteredBusRoutes.map((bus, index) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={bus.id}>
                            <BusCard
                                bus={bus}
                                colorScheme={busColors[index % busColors.length]}
                                onAddStudents={handleAddStudents}
                                onViewExisting={handleViewExisting}
                            />
                        </Grid>
                    ))}
                </Grid>

                {filteredBusRoutes.length === 0 && (
                    <Box sx={{
                        textAlign: "center",
                        py: 8,
                        color: "#999"
                    }}>
                        <DirectionsBusIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                        <Typography sx={{ fontSize: "16px" }}>
                            No bus routes found
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Student Selection Popup */}
            <StudentSelectionPopup
                open={openStudentPopup}
                
                onClose={handleCloseStudentPopup}
                users={users}
                activity={routeDetails}
                value={routeDetails?.studentRouteMappings?.map(s => s.rollNumber).join(', ') || ''}
                onSave={(payload) => handleSaveStudents(payload)}
            />

            {/* View Existing Students Dialog */} 
            <Dialog
                open={viewExistingDialog}
                onClose={() => setViewExistingDialog(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 0, border: "1px solid #E5E7EB" } }}
            >
                <DialogTitle sx={{
                    backgroundColor: '#fff',
                    py: 2.5,
                    px: 3,
                    borderBottom: '2px solid #E5E7EB'
                }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box sx={{
                                width: 44,
                                height: 44,
                                backgroundColor: '#F3F4F6',
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "8px",
                                border: '1px solid #E5E7EB'
                            }}>
                                <PeopleIcon sx={{ color: "#6B7280", fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: "17px", color: "#111827" }}>
                                    Mapped Students
                                </Typography>
                                <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
                                    {selectedBus?.routeName} • {selectedBus?.busName}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Chip
                                icon={<SchoolIcon sx={{ fontSize: 16 }} />}
                                label={`${existingStudents.length} Students`}
                                sx={{
                                    backgroundColor: '#F3F4F6',
                                    color: "#374151",
                                    fontWeight: 600,
                                    borderRadius: "6px",
                                    border: '1px solid #D1D5DB',
                                    fontSize: '13px'
                                }}
                            />
                            <IconButton
                                onClick={() => setViewExistingDialog(false)}
                                sx={{
                                    color: "#6B7280",
                                    '&:hover': {
                                        backgroundColor: '#F3F4F6',
                                        color: '#374151'
                                    }
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 3, backgroundColor: '#F9FAFB' }}>
                    {/* Search Bar */}
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            placeholder="Search by name, roll number, grade, section, or bus stop..."
                            value={studentSearchQuery}
                            onChange={(e) => setStudentSearchQuery(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }
                            }}
                            sx={{
                                backgroundColor: '#fff',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': {
                                        borderColor: '#D1D5DB',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#9CA3AF',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#6B7280',
                                        borderWidth: '2px'
                                    },
                                }
                            }}
                            size="small"
                        />
                    </Box>

                    {/* Students Table */}
                    {existingStudents.length > 0 ? (
                        <Box sx={{
                            maxHeight: 450,
                            overflowY: "auto",
                            backgroundColor: '#fff',
                            borderRadius: "12px",
                            border: "1px solid #E5E7EB",
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: '#F3F4F6',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#D1D5DB',
                                borderRadius: '10px',
                                '&:hover': {
                                    backgroundColor: '#9CA3AF',
                                },
                            },
                        }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{
                                            fontWeight: 600,
                                            backgroundColor: '#F9FAFB',
                                            color: "#374151",
                                            fontSize: "12px",
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            py: 2,
                                            borderBottom: '2px solid #E5E7EB'
                                        }}>
                                            Student Details
                                        </TableCell>
                                        <TableCell sx={{
                                            fontWeight: 600,
                                            backgroundColor: '#F9FAFB',
                                            color: "#374151",
                                            fontSize: "12px",
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            borderBottom: '2px solid #E5E7EB'
                                        }}>
                                            Roll Number
                                        </TableCell>
                                        <TableCell sx={{
                                            fontWeight: 600,
                                            backgroundColor: '#F9FAFB',
                                            color: "#374151",
                                            fontSize: "12px",
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            borderBottom: '2px solid #E5E7EB'
                                        }}>
                                            Class
                                        </TableCell>
                                        <TableCell sx={{
                                            fontWeight: 600,
                                            backgroundColor: '#F9FAFB',
                                            color: "#374151",
                                            fontSize: "12px",
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            borderBottom: '2px solid #E5E7EB'
                                        }}>
                                            Bus Stop
                                        </TableCell>
                                        <TableCell sx={{
                                            fontWeight: 600,
                                            backgroundColor: '#F9FAFB',
                                            color: "#374151",
                                            fontSize: "12px",
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            borderBottom: '2px solid #E5E7EB'
                                        }}>
                                            Contact
                                        </TableCell>
                                        <TableCell sx={{
                                            fontWeight: 600,
                                            backgroundColor: '#F9FAFB',
                                            color: "#374151",
                                            fontSize: "12px",
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            borderBottom: '2px solid #E5E7EB'
                                        }}>
                                            Status
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredExistingStudents.length > 0 ? (
                                        filteredExistingStudents.map((student, idx) => (
                                            <TableRow
                                                key={student.id}
                                                hover
                                                sx={{
                                                    backgroundColor: idx % 2 === 0 ? "#fff" : "#F9FAFB",
                                                    '&:hover': {
                                                        backgroundColor: '#F3F4F6 !important',
                                                        transition: 'all 0.2s ease'
                                                    }
                                                }}
                                            >
                                                {/* Student Details */}
                                                <TableCell sx={{ borderBottom: "1px solid #E5E7EB", py: 2 }}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                        <Avatar sx={{
                                                            width: 36,
                                                            height: 36,
                                                            fontSize: "14px",
                                                            backgroundColor: '#F3F4F6',
                                                            color: "#374151",
                                                            fontWeight: 600,
                                                            border: '2px solid #E5E7EB'
                                                        }}>
                                                            {student.name?.charAt(0)?.toUpperCase()}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: '#111827' }}>
                                                                {student.name}
                                                            </Typography>
                                                            {student.email && student.email !== 'N/A' && (
                                                                <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                                                    {student.email}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {/* Roll Number */}
                                                <TableCell sx={{ borderBottom: "1px solid #E5E7EB", py: 2 }}>
                                                    <Chip
                                                        label={student.rollNumber}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: "#F9FAFB",
                                                            color: "#374151",
                                                            fontWeight: 600,
                                                            fontSize: "12px",
                                                            border: '1px solid #D1D5DB'
                                                        }}
                                                    />
                                                </TableCell>

                                                {/* Grade & Section */}
                                                <TableCell sx={{ borderBottom: "1px solid #E5E7EB", py: 2 }}>
                                                    <Box>
                                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: '#111827' }}>
                                                            {student.grade}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                                            Section {student.section}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                {/* Bus Stop */}
                                                <TableCell sx={{ borderBottom: "1px solid #E5E7EB", py: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <LocationOnIcon sx={{ fontSize: 15, color: '#3457D5' }} />
                                                        <Box>
                                                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: '#111827' }}>
                                                               {student.stopPoint}
                                                            </Typography>
                                                            {student.stopPoint && (
                                                                <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                                                    Stop Name:{student.stopName}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {/* Contact */}
                                                <TableCell sx={{ borderBottom: "1px solid #E5E7EB", py: 2 }}>
                                                    <Typography sx={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>
                                                        {student.phone}
                                                    </Typography>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell sx={{ borderBottom: "1px solid #E5E7EB", py: 2 }}>
                                                    <Chip
                                                        label={student.status || 'Active'}
                                                        size="small"
                                                        icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                                        sx={{
                                                            backgroundColor: "#ECFDF5",
                                                            color: "#047857",
                                                            fontWeight: 600,
                                                            fontSize: "11px",
                                                            border: '1px solid #A7F3D0'
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} sx={{ textAlign: "center", py: 6 }}>
                                                <SchoolIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
                                                <Typography sx={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }}>
                                                    No students match your search
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    ) : (
                        <Box sx={{
                            textAlign: 'center',
                            py: 8,
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: '2px dashed #E5E7EB'
                        }}>
                            <SchoolIcon sx={{ fontSize: 64, color: "#D1D5DB", mb: 2 }} />
                            <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#374151", mb: 1 }}>
                                No Students Mapped Yet
                            </Typography>
                            <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                                Click "Add / Remove" button to map students to this route
                            </Typography>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{
                    px: 3,
                    py: 2.5,
                    borderTop: "2px solid #E5E7EB",
                    backgroundColor: "#fff",
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>
                        Total: {existingStudents.length} student{existingStudents.length !== 1 ? 's' : ''} mapped to this route
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setViewExistingDialog(false)}
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            px: 4,
                            py: 1,
                            fontWeight: 600,
                            fontSize: 14,
                            backgroundColor: '#374151',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: '#1F2937',
                                boxShadow: 'none',
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
