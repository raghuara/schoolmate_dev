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
import axios from 'axios'

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
    onViewExisting,
    onRemoveStudents,
    onTransferStudents,
    onViewRemovedTransferred
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
                    {bus.busName || bus.vehicleInternalName || "Bus"}
                </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ p: 2.5, backgroundColor: colorScheme.light }}>
                {/* Route and Seat Availability */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
                    <Box sx={{ flex: 1, pr: 2 }}>
                        {/* Bus Route */}
                        <Box sx={{ mb: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                                <RouteIcon sx={{ fontSize: 14, color: colorScheme.text }} />
                                <Typography sx={{ fontSize: "11px", color: "#888", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Bus Route
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#333", pl: 2.3 }}>
                                {bus.routeName || "N/A"}
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
                                {bus.tripStartTime || "N/A"} - {bus.tripEndTime || "N/A"} ({bus.duration || "N/A"})
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
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                        </Box>
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
                        borderRadius: 0,
                        p: 1.5,
                        mb: 2,
                        maxHeight: 150,
                        overflowY: "auto",
                        border: `1px solid ${colorScheme.border}`
                    }}>
                        {bus.intermediateStops && bus.intermediateStops.length > 0 ? (
                            bus.intermediateStops.map((stop, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        py: 0.5,
                                        borderBottom: index < bus.intermediateStops.length - 1 ? "1px dashed #E5E7EB" : "none"
                                    }}
                                >
                                    <LocationOnIcon sx={{ fontSize: 14, color: colorScheme.text }} />
                                    <Typography sx={{ fontSize: "11px", color: "#555" }}>
                                        {stop.stopName} - {stop.time}
                                    </Typography>
                                    <Chip
                                        label={`${stop.studentsCount || 0} students`}
                                        size="small"
                                        sx={{
                                            ml: "auto",
                                            height: 20,
                                            fontSize: "9px",
                                            backgroundColor: colorScheme.headerBg,
                                            color: colorScheme.text,
                                            borderRadius: "4px",
                                            border: `1px solid ${colorScheme.border}`
                                        }}
                                    />
                                </Box>
                            ))
                        ) : (
                            <Typography sx={{ fontSize: "11px", color: "#999", textAlign: "center" }}>
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
                            Add
                        </Button>
                        <Button
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
                        </Button>
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
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<HistoryIcon sx={{ fontSize: 16 }} />}
                            onClick={() => onViewRemovedTransferred(bus)}
                            sx={{
                                borderColor: "#FDE68A",
                                color: "#D97706",
                                backgroundColor: "#fff",
                                textTransform: "none",
                                borderRadius: "8px",
                                py: 0.8,
                                fontSize: "11px",
                                fontWeight: 600,
                                "&:hover": {
                                    borderColor: "#D97706",
                                    backgroundColor: "#FEF3C7"
                                }
                            }}
                        >
                            History
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

    // Dialog states
    const [addStudentDialog, setAddStudentDialog] = useState(false);
    const [viewExistingDialog, setViewExistingDialog] = useState(false);
    const [removeStudentDialog, setRemoveStudentDialog] = useState(false);
    const [transferStudentDialog, setTransferStudentDialog] = useState(false);
    const [viewRemovedDialog, setViewRemovedDialog] = useState(false);
    const [confirmRemoveDialog, setConfirmRemoveDialog] = useState(false);
    const [confirmTransferDialog, setConfirmTransferDialog] = useState(false);
    const [selectedBus, setSelectedBus] = useState(null);

    // Student selection states
    const [availableStudents, setAvailableStudents] = useState([]);
    const [existingStudents, setExistingStudents] = useState([]);
    const [removedStudents, setRemovedStudents] = useState([]);
    const [transferredStudents, setTransferredStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [studentSearchQuery, setStudentSearchQuery] = useState("");
    const [selectedStop, setSelectedStop] = useState(null);
    const [targetBus, setTargetBus] = useState(null);
    const [targetStop, setTargetStop] = useState(null);
    const [removeReason, setRemoveReason] = useState("");
    const [historyTabValue, setHistoryTabValue] = useState(0);

    
    // Mock data - Replace with API call
    useEffect(() => {
        fetchBusRoutes();
    }, []);

    const fetchBusRoutes = async () => {
        setIsLoading(true);
        try {
            // Replace with actual API call
            // const res = await axios.get(getBusRoutesWithStudentMapping, {
            //     headers: { Authorization: `Bearer ${token}` },
            // });
            // setBusRoutes(res.data?.routes || []);

            // Mock data for demonstration
            setBusRoutes([
                {
                    id: 1,
                    busName: "Bus A",
                    vehicleInternalName: "Bus A",
                    routeName: "OBS to NBS",
                    tripStartTime: "9.00 AM",
                    tripEndTime: "10.00 PM",
                    duration: "60 mins",
                    tripDate: "Everyday",
                    occupiedSeats: 25,
                    totalSeats: 35,
                    existingStudents: 20,
                    transferredIn: 4,
                    transferredOut: 5,
                    removedStudents: 0,
                    intermediateStops: [
                        { stopName: "Main Gate", time: "9:00 AM", studentsCount: 5 },
                        { stopName: "City Center", time: "9:15 AM", studentsCount: 8 },
                        { stopName: "Park Avenue", time: "9:30 AM", studentsCount: 7 },
                    ]
                },
                {
                    id: 2,
                    busName: "Bus B",
                    vehicleInternalName: "Bus B",
                    routeName: "OBS to NBS",
                    tripStartTime: "9.00 AM",
                    tripEndTime: "10.00 PM",
                    duration: "60 mins",
                    tripDate: "Everyday",
                    occupiedSeats: 35,
                    totalSeats: 35,
                    existingStudents: 20,
                    transferredIn: 4,
                    transferredOut: 5,
                    removedStudents: 0,
                    intermediateStops: [
                        { stopName: "North Block", time: "9:00 AM", studentsCount: 10 },
                        { stopName: "South Block", time: "9:20 AM", studentsCount: 12 },
                        { stopName: "East Wing", time: "9:40 AM", studentsCount: 13 },
                    ]
                },
                {
                    id: 3,
                    busName: "Bus C",
                    vehicleInternalName: "Bus C",
                    routeName: "OBS to NBS",
                    tripStartTime: "9.00 AM",
                    tripEndTime: "10.00 PM",
                    duration: "60 mins",
                    tripDate: "Everyday",
                    occupiedSeats: 25,
                    totalSeats: 35,
                    existingStudents: 20,
                    transferredIn: 4,
                    transferredOut: 5,
                    removedStudents: 0,
                    intermediateStops: [
                        { stopName: "West Point", time: "9:00 AM", studentsCount: 6 },
                        { stopName: "Central Hub", time: "9:25 AM", studentsCount: 9 },
                        { stopName: "Final Stop", time: "9:50 AM", studentsCount: 10 },
                    ]
                },
            ]);
        } catch (error) {
            console.error("Error fetching bus routes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvailableStudents = async () => {
        try {
            // Replace with actual API call
            // const res = await axios.get(getAvailableStudentsForMapping, {
            //     headers: { Authorization: `Bearer ${token}` },
            // });
            // setAvailableStudents(res.data?.students || []);

            // Mock data
            setAvailableStudents([
                { id: 1, name: "John Smith", rollNumber: "STU001", grade: "Grade 5", section: "A", address: "123 Main St", phone: "9876543210" },
                { id: 2, name: "Emma Wilson", rollNumber: "STU002", grade: "Grade 5", section: "B", address: "456 Oak Ave", phone: "9876543211" },
                { id: 3, name: "Michael Brown", rollNumber: "STU003", grade: "Grade 6", section: "A", address: "789 Pine Rd", phone: "9876543212" },
                { id: 4, name: "Sarah Davis", rollNumber: "STU004", grade: "Grade 6", section: "B", address: "321 Elm St", phone: "9876543213" },
                { id: 5, name: "James Johnson", rollNumber: "STU005", grade: "Grade 7", section: "A", address: "654 Maple Dr", phone: "9876543214" },
            ]);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const fetchExistingStudents = async (busId) => {
        try {
            // Replace with actual API call
            // const res = await axios.get(getExistingStudentsForBus, {
            //     params: { busId },
            //     headers: { Authorization: `Bearer ${token}` },
            // });
            // setExistingStudents(res.data?.students || []);

            // Mock data - students already mapped to this bus
            setExistingStudents([
                { id: 101, name: "Alice Cooper", rollNumber: "STU101", grade: "Grade 5", section: "A", address: "100 School St", phone: "9876543220", stopName: "Main Gate", mappedDate: "2024-01-15" },
                { id: 102, name: "Bob Martin", rollNumber: "STU102", grade: "Grade 5", section: "B", address: "200 College Rd", phone: "9876543221", stopName: "City Center", mappedDate: "2024-01-16" },
                { id: 103, name: "Carol White", rollNumber: "STU103", grade: "Grade 6", section: "A", address: "300 Park Ave", phone: "9876543222", stopName: "Park Avenue", mappedDate: "2024-01-17" },
                { id: 104, name: "David Lee", rollNumber: "STU104", grade: "Grade 6", section: "B", address: "400 Lake View", phone: "9876543223", stopName: "Main Gate", mappedDate: "2024-01-18" },
                { id: 105, name: "Eva Green", rollNumber: "STU105", grade: "Grade 7", section: "A", address: "500 Hill Top", phone: "9876543224", stopName: "City Center", mappedDate: "2024-01-19" },
            ]);
        } catch (error) {
            console.error("Error fetching existing students:", error);
        }
    };

    const fetchRemovedTransferredStudents = async (busId) => {
        try {
            // Replace with actual API call
            // Mock data for removed students
            setRemovedStudents([
                { id: 201, name: "Frank Miller", rollNumber: "STU201", grade: "Grade 5", section: "A", removedDate: "2024-01-20", reason: "Parent request", removedBy: "Admin" },
                { id: 202, name: "Grace Hall", rollNumber: "STU202", grade: "Grade 6", section: "B", removedDate: "2024-01-21", reason: "Changed residence", removedBy: "Admin" },
            ]);

            // Mock data for transferred students
            setTransferredStudents([
                { id: 301, name: "Henry Wilson", rollNumber: "STU301", grade: "Grade 5", section: "A", transferDate: "2024-01-22", fromBus: "Bus A", toBus: "Bus B", fromStop: "Main Gate", toStop: "North Block" },
                { id: 302, name: "Ivy Chen", rollNumber: "STU302", grade: "Grade 6", section: "B", transferDate: "2024-01-23", fromBus: "Bus B", toBus: "Bus A", fromStop: "South Block", toStop: "City Center" },
                { id: 303, name: "Jack Brown", rollNumber: "STU303", grade: "Grade 7", section: "A", transferDate: "2024-01-24", fromBus: "Bus A", toBus: "Bus C", fromStop: "Park Avenue", toStop: "West Point" },
            ]);
        } catch (error) {
            console.error("Error fetching removed/transferred students:", error);
        }
    };

    // Filter bus routes based on search
    const filteredBusRoutes = busRoutes.filter((bus) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            bus.busName?.toLowerCase().includes(query) ||
            bus.routeName?.toLowerCase().includes(query) ||
            bus.vehicleInternalName?.toLowerCase().includes(query)
        );
    });

    // Filter students based on search
    const filteredStudents = availableStudents.filter((student) => {
        if (!studentSearchQuery.trim()) return true;
        const query = studentSearchQuery.toLowerCase();
        return (
            student.name?.toLowerCase().includes(query) ||
            student.rollNumber?.toLowerCase().includes(query) ||
            student.grade?.toLowerCase().includes(query)
        );
    });

    // Handlers
    const handleAddStudents = (bus) => {
        setSelectedBus(bus);
        setSelectedStudents([]);
        setSelectedStop(null);
        setStudentSearchQuery("");
        fetchAvailableStudents();
        setAddStudentDialog(true);
    };

    const handleViewExisting = (bus) => {
        setSelectedBus(bus);
        setSelectedStudents([]);
        setStudentSearchQuery("");
        fetchExistingStudents(bus.id);
        setViewExistingDialog(true);
    };

    const handleRemoveStudents = (bus) => {
        setSelectedBus(bus);
        setSelectedStudents([]);
        setStudentSearchQuery("");
        setRemoveReason("");
        fetchExistingStudents(bus.id);
        setRemoveStudentDialog(true);
    };

    const handleTransferStudents = (bus) => {
        setSelectedBus(bus);
        setSelectedStudents([]);
        setStudentSearchQuery("");
        setTargetBus(null);
        setTargetStop(null);
        fetchExistingStudents(bus.id);
        setTransferStudentDialog(true);
    };

    const handleViewRemovedTransferred = (bus) => {
        setSelectedBus(bus);
        setHistoryTabValue(0);
        fetchRemovedTransferredStudents(bus.id);
        setViewRemovedDialog(true);
    };

    const handleStudentSelect = (student) => {
        setSelectedStudents(prev => {
            const isSelected = prev.find(s => s.id === student.id);
            if (isSelected) {
                return prev.filter(s => s.id !== student.id);
            }
            return [...prev, student];
        });
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedStudents(filteredStudents);
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSaveStudentMapping = async () => {
        if (selectedStudents.length === 0) {
            setMessage("Please select at least one student");
            setColor(false);
            setStatus(false);
            setOpen(true);
            return;
        }

        if (!selectedStop) {
            setMessage("Please select a bus stop");
            setColor(false);
            setStatus(false);
            setOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            // Replace with actual API call
            // await axios.post(addStudentsToBusRoute, {
            //     busId: selectedBus.id,
            //     stopId: selectedStop.id,
            //     studentIds: selectedStudents.map(s => s.id)
            // }, {
            //     headers: { Authorization: `Bearer ${token}` },
            // });

            setMessage(`${selectedStudents.length} students added successfully`);
            setColor(true);
            setStatus(true);
            setOpen(true);
            setAddStudentDialog(false);
            fetchBusRoutes();
        } catch (error) {
            console.error("Error adding students:", error);
            setMessage("Failed to add students");
            setColor(false);
            setStatus(false);
            setOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmRemove = async () => {
        if (selectedStudents.length === 0) {
            setMessage("Please select at least one student to remove");
            setColor(false);
            setStatus(false);
            setOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            // Replace with actual API call
            // await axios.post(removeStudentsFromBus, {
            //     busId: selectedBus.id,
            //     studentIds: selectedStudents.map(s => s.id),
            //     reason: removeReason
            // }, {
            //     headers: { Authorization: `Bearer ${token}` },
            // });

            setMessage(`${selectedStudents.length} students removed successfully`);
            setColor(true);
            setStatus(true);
            setOpen(true);
            setRemoveStudentDialog(false);
            setConfirmRemoveDialog(false);
            fetchBusRoutes();
        } catch (error) {
            console.error("Error removing students:", error);
            setMessage("Failed to remove students");
            setColor(false);
            setStatus(false);
            setOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmTransfer = async () => {
        if (selectedStudents.length === 0) {
            setMessage("Please select at least one student to transfer");
            setColor(false);
            setStatus(false);
            setOpen(true);
            return;
        }

        if (!targetBus) {
            setMessage("Please select a target bus");
            setColor(false);
            setStatus(false);
            setOpen(true);
            return;
        }

        if (!targetStop) {
            setMessage("Please select a target bus stop");
            setColor(false);
            setStatus(false);
            setOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            // Replace with actual API call
            // await axios.post(transferStudentsBetweenBuses, {
            //     fromBusId: selectedBus.id,
            //     toBusId: targetBus.id,
            //     toStopId: targetStop.id,
            //     studentIds: selectedStudents.map(s => s.id)
            // }, {
            //     headers: { Authorization: `Bearer ${token}` },
            // });

            setMessage(`${selectedStudents.length} students transferred successfully to ${targetBus.busName}`);
            setColor(true);
            setStatus(true);
            setOpen(true);
            setTransferStudentDialog(false);
            setConfirmTransferDialog(false);
            fetchBusRoutes();
        } catch (error) {
            console.error("Error transferring students:", error);
            setMessage("Failed to transfer students");
            setColor(false);
            setStatus(false);
            setOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter existing students based on search
    const filteredExistingStudents = existingStudents.filter((student) => {
        if (!studentSearchQuery.trim()) return true;
        const query = studentSearchQuery.toLowerCase();
        return (
            student.name?.toLowerCase().includes(query) ||
            student.rollNumber?.toLowerCase().includes(query) ||
            student.grade?.toLowerCase().includes(query) ||
            student.stopName?.toLowerCase().includes(query)
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
                    placeholder="Search by bus name or route..."
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
                                onRemoveStudents={handleRemoveStudents}
                                onTransferStudents={handleTransferStudents}
                                onViewRemovedTransferred={handleViewRemovedTransferred}
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

            {/* Add Students Dialog */}
            <Dialog
                open={addStudentDialog}
                onClose={() => setAddStudentDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 0, border: "1px solid #E5E7EB" } }}
            >
                <DialogTitle sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #E5E7EB",
                    py: 1.5,
                    px: 2.5,
                    backgroundColor: "#fff"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{
                            width: 36,
                            height: 36,
                            backgroundColor: "#ECFDF5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px"
                        }}>
                            <PersonAddIcon sx={{ color: "#059669", fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "16px", color: "#111827" }}>
                            Add Students to {selectedBus?.busName}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setAddStudentDialog(false)} sx={{ color: "#6B7280" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 2.5 }}>
                    {/* Select Stop */}
                    <Box sx={{ mb: 2.5 }}>
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, mb: 1, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Select Bus Stop *
                        </Typography>
                        <Autocomplete
                            options={selectedBus?.intermediateStops || []}
                            getOptionLabel={(option) => `${option.stopName} - ${option.time}`}
                            value={selectedStop}
                            onChange={(e, value) => setSelectedStop(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select a bus stop"
                                    size="small"
                                />
                            )}
                        />
                    </Box>

                    {/* Search Students */}
                    <TextField
                        fullWidth
                        placeholder="Search students by name, roll number, or grade..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "#9CA3AF" }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2.5 }}
                        size="small"
                    />

                    {/* Selected Count */}
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2.5,
                        p: 1.5,
                        backgroundColor: selectedStudents.length > 0 ? "#ECFDF5" : "#F9FAFB",
                        border: selectedStudents.length > 0 ? "1px solid #A7F3D0" : "1px solid #E5E7EB",
                        borderRadius: "8px"
                    }}>
                        <Typography sx={{ fontSize: "13px", color: selectedStudents.length > 0 ? "#059669" : "#6B7280", fontWeight: 500 }}>
                            {selectedStudents.length} student(s) selected
                        </Typography>
                        <Chip
                            label={`Available Seats: ${(selectedBus?.totalSeats || 0) - (selectedBus?.occupiedSeats || 0)}`}
                            size="small"
                            sx={{ backgroundColor: "#ECFDF5", color: "#059669", borderRadius: "4px", fontWeight: 600 }}
                        />
                    </Box>

                    {/* Students Table */}
                    <Box sx={{
                        maxHeight: 350,
                        overflowY: "auto",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px"
                    }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox" sx={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB" }}>
                                        <Checkbox
                                            checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                            indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                                            onChange={handleSelectAll}
                                            sx={{ color: "#059669", "&.Mui-checked": { color: "#059669" }, "&.MuiCheckbox-indeterminate": { color: "#059669" } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Student Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Roll Number</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Grade</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Section</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", fontSize: "12px" }}>Address</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents.map((student, idx) => (
                                    <TableRow
                                        key={student.id}
                                        hover
                                        onClick={() => handleStudentSelect(student)}
                                        sx={{
                                            cursor: "pointer",
                                            backgroundColor: selectedStudents.find(s => s.id === student.id) ? "#ECFDF5" : idx % 2 === 0 ? "#fff" : "#F9FAFB"
                                        }}
                                    >
                                        <TableCell padding="checkbox" sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB" }}>
                                            <Checkbox
                                                checked={!!selectedStudents.find(s => s.id === student.id)}
                                                sx={{ color: "#059669", "&.Mui-checked": { color: "#059669" } }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", py: 1.5 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Avatar sx={{ width: 28, height: 28, fontSize: "12px", backgroundColor: "#ECFDF5", color: "#059669" }}>
                                                    {student.name?.charAt(0)}
                                                </Avatar>
                                                <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{student.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", py: 1.5, fontSize: "13px" }}>{student.rollNumber}</TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", py: 1.5, fontSize: "13px" }}>{student.grade}</TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", py: 1.5, fontSize: "13px" }}>{student.section}</TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", py: 1.5, fontSize: "12px", color: "#6B7280" }}>{student.address}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 2.5, py: 2, borderTop: "1px solid #E5E7EB", backgroundColor: "#F9FAFB", gap: 1.5 }}>
                    <Button
                        onClick={() => setAddStudentDialog(false)}
                        sx={{ textTransform: "none", borderRadius: "8px", border: "1px solid #D1D5DB", color: "#374151", px: 3 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveStudentMapping}
                        disabled={selectedStudents.length === 0 || !selectedStop}
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            backgroundColor: "#059669",
                            px: 3,
                            fontWeight: 600,
                            "&:hover": { backgroundColor: "#047857" }
                        }}
                    >
                        Add {selectedStudents.length} Student(s)
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Existing Students Dialog */}
            <Dialog
                open={viewExistingDialog}
                onClose={() => setViewExistingDialog(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 0, border: "1px solid #E5E7EB" } }}
            >
                <DialogTitle sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #E5E7EB",
                    py: 1.5,
                    px: 2.5,
                    backgroundColor: "#fff"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{
                            width: 36,
                            height: 36,
                            backgroundColor: "#EFF6FF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px"
                        }}>
                            <PeopleIcon sx={{ color: "#2563EB", fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "16px", color: "#111827" }}>
                            Existing Students - {selectedBus?.busName}
                        </Typography>
                        <Chip
                            label={`${existingStudents.length} Students`}
                            size="small"
                            sx={{ backgroundColor: "#EFF6FF", color: "#2563EB", fontWeight: 600, borderRadius: "4px" }}
                        />
                    </Box>
                    <IconButton onClick={() => setViewExistingDialog(false)} sx={{ color: "#6B7280" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 2.5 }}>
                    {/* Search */}
                    <TextField
                        fullWidth
                        placeholder="Search by name, roll number, grade, or stop..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "#9CA3AF" }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2.5 }}
                        size="small"
                    />

                    {/* Students Table */}
                    <Box sx={{
                        maxHeight: 400,
                        overflowY: "auto",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px"
                    }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Student Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Roll Number</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Grade</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Section</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Bus Stop</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Phone</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", fontSize: "12px" }}>Mapped Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredExistingStudents.length > 0 ? (
                                    filteredExistingStudents.map((student, idx) => (
                                        <TableRow key={student.id} hover sx={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#F9FAFB" }}>
                                            <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", py: 1.5 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Avatar sx={{ width: 28, height: 28, fontSize: "12px", backgroundColor: "#EFF6FF", color: "#2563EB" }}>
                                                        {student.name?.charAt(0)}
                                                    </Avatar>
                                                    <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{student.name}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", py: 1.5, fontSize: "13px" }}>{student.rollNumber}</TableCell>
                                            <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", py: 1.5, fontSize: "13px" }}>{student.grade}</TableCell>
                                            <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", py: 1.5, fontSize: "13px" }}>{student.section}</TableCell>
                                            <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", py: 1.5 }}>
                                                <Chip
                                                    icon={<LocationOnIcon sx={{ fontSize: 14 }} />}
                                                    label={student.stopName}
                                                    size="small"
                                                    sx={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", fontSize: "11px", borderRadius: "4px", fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", py: 1.5, fontSize: "12px" }}>{student.phone}</TableCell>
                                            <TableCell sx={{ borderBottom: "1px solid #E5E7EB", py: 1.5, fontSize: "12px", color: "#6B7280" }}>{student.mappedDate}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "#9CA3AF" }}>
                                            No students found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 2.5, py: 2, borderTop: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                    <Button
                        onClick={() => setViewExistingDialog(false)}
                        sx={{ textTransform: "none", borderRadius: "8px", border: "1px solid #D1D5DB", color: "#374151", px: 3, fontWeight: 600 }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Remove Students Dialog */}
            <Dialog
                open={removeStudentDialog}
                onClose={() => setRemoveStudentDialog(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 0, border: "1px solid #E5E7EB" } }}
            >
                <DialogTitle sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #E5E7EB",
                    py: 1.5,
                    px: 2.5,
                    backgroundColor: "#fff"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ width: 36, height: 36, backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>
                            <PersonRemoveIcon sx={{ color: "#DC2626", fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "16px", color: "#111827" }}>
                            Remove Students from {selectedBus?.busName}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setRemoveStudentDialog(false)} sx={{ color: "#6B7280" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 2.5 }}>
                    {/* Search */}
                    <TextField
                        fullWidth
                        placeholder="Search students to remove..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "#999" }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2.5 }}
                        size="small"
                    />

                    {/* Selected Count */}
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2.5,
                        p: 1.5,
                        backgroundColor: selectedStudents.length > 0 ? "#FEF2F2" : "#F9FAFB",
                        borderRadius: "8px",
                        border: selectedStudents.length > 0 ? "1px solid #FECACA" : "1px solid #E5E7EB"
                    }}>
                        <Typography sx={{ fontSize: "13px", color: selectedStudents.length > 0 ? "#DC2626" : "#6B7280", fontWeight: 500 }}>
                            {selectedStudents.length} student(s) selected for removal
                        </Typography>
                    </Box>

                    {/* Students Table */}
                    <Box sx={{
                        maxHeight: 350,
                        overflowY: "auto",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px"
                    }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox" sx={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB" }}>
                                        <Checkbox
                                            checked={selectedStudents.length === filteredExistingStudents.length && filteredExistingStudents.length > 0}
                                            indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredExistingStudents.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedStudents(filteredExistingStudents);
                                                } else {
                                                    setSelectedStudents([]);
                                                }
                                            }}
                                            sx={{ color: "#DC2626", "&.Mui-checked": { color: "#DC2626" }, "&.MuiCheckbox-indeterminate": { color: "#DC2626" } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Student Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Roll Number</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Grade</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Bus Stop</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", fontSize: "12px" }}>Phone</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredExistingStudents.map((student, idx) => (
                                    <TableRow
                                        key={student.id}
                                        hover
                                        onClick={() => handleStudentSelect(student)}
                                        sx={{
                                            cursor: "pointer",
                                            backgroundColor: selectedStudents.find(s => s.id === student.id) ? "#FEF2F2" : idx % 2 === 0 ? "#fff" : "#F9FAFB"
                                        }}
                                    >
                                        <TableCell padding="checkbox" sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB" }}>
                                            <Checkbox checked={!!selectedStudents.find(s => s.id === student.id)} sx={{ color: "#DC2626", "&.Mui-checked": { color: "#DC2626" } }} />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Avatar sx={{ width: 28, height: 28, fontSize: "12px", backgroundColor: "#FEE2E2", color: "#DC2626" }}>
                                                    {student.name?.charAt(0)}
                                                </Avatar>
                                                {student.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>{student.rollNumber}</TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>{student.grade}</TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>
                                            <Chip
                                                icon={<LocationOnIcon sx={{ fontSize: 14 }} />}
                                                label={student.stopName}
                                                size="small"
                                                sx={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", fontSize: "11px", borderRadius: "4px" }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", fontSize: "12px" }}>{student.phone}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>

                    {/* Removal Reason */}
                    {selectedStudents.length > 0 && (
                        <Box sx={{ mt: 2.5 }}>
                            <Typography sx={{ fontSize: "13px", fontWeight: 600, mb: 1, color: "#374151" }}>
                                Reason for Removal (Optional)
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Enter reason for removing students..."
                                value={removeReason}
                                onChange={(e) => setRemoveReason(e.target.value)}
                                size="small"
                            />
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 2.5, py: 2, borderTop: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                    <Button
                        onClick={() => setRemoveStudentDialog(false)}
                        sx={{ textTransform: "none", borderRadius: "8px", border: "1px solid #D1D5DB", color: "#374151" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setConfirmRemoveDialog(true)}
                        disabled={selectedStudents.length === 0}
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            backgroundColor: "#DC2626",
                            "&:hover": { backgroundColor: "#B91C1C" }
                        }}
                    >
                        Remove {selectedStudents.length} Student(s)
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Transfer Students Dialog */}
            <Dialog
                open={transferStudentDialog}
                onClose={() => setTransferStudentDialog(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 0, border: "1px solid #E5E7EB" } }}
            >
                <DialogTitle sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #E5E7EB",
                    py: 1.5,
                    px: 2.5,
                    backgroundColor: "#fff"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ width: 36, height: 36, backgroundColor: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>
                            <SwapHorizIcon sx={{ color: "#7C3AED", fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "16px", color: "#111827" }}>
                            Transfer Students from {selectedBus?.busName}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setTransferStudentDialog(false)} sx={{ color: "#6B7280" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 2.5 }}>
                    {/* Transfer To Section */}
                    <Box sx={{ mb: 2.5, p: 2, backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600, mb: 2, color: "#374151" }}>
                            Transfer To
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5, color: "#333" }}>
                                    Select Target Bus *
                                </Typography>
                                <Autocomplete
                                    options={busRoutes.filter(b => b.id !== selectedBus?.id)}
                                    getOptionLabel={(option) => `${option.busName} - ${option.routeName}`}
                                    value={targetBus}
                                    onChange={(e, value) => {
                                        setTargetBus(value);
                                        setTargetStop(null);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select a bus to transfer to"
                                            size="small"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5, color: "#333" }}>
                                    Select Target Bus Stop *
                                </Typography>
                                <Autocomplete
                                    options={targetBus?.intermediateStops || []}
                                    getOptionLabel={(option) => `${option.stopName} - ${option.time}`}
                                    value={targetStop}
                                    onChange={(e, value) => setTargetStop(value)}
                                    disabled={!targetBus}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder={targetBus ? "Select a bus stop" : "Select a bus first"}
                                            size="small"
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                        {targetBus && (
                            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                                <Chip
                                    label={`Available Seats: ${(targetBus.totalSeats || 0) - (targetBus.occupiedSeats || 0)}`}
                                    size="small"
                                    sx={{ backgroundColor: "#ECFDF5", color: "#059669", borderRadius: "4px" }}
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Search */}
                    <TextField
                        fullWidth
                        placeholder="Search students to transfer..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "#999" }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2.5 }}
                        size="small"
                    />

                    {/* Selected Count */}
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2.5,
                        p: 1.5,
                        backgroundColor: selectedStudents.length > 0 ? "#F5F3FF" : "#F9FAFB",
                        borderRadius: "8px",
                        border: selectedStudents.length > 0 ? "1px solid #DDD6FE" : "1px solid #E5E7EB"
                    }}>
                        <Typography sx={{ fontSize: "13px", color: selectedStudents.length > 0 ? "#7C3AED" : "#6B7280", fontWeight: 500 }}>
                            {selectedStudents.length} student(s) selected for transfer
                        </Typography>
                    </Box>

                    {/* Students Table */}
                    <Box sx={{
                        maxHeight: 300,
                        overflowY: "auto",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px"
                    }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox" sx={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB" }}>
                                        <Checkbox
                                            checked={selectedStudents.length === filteredExistingStudents.length && filteredExistingStudents.length > 0}
                                            indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredExistingStudents.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedStudents(filteredExistingStudents);
                                                } else {
                                                    setSelectedStudents([]);
                                                }
                                            }}
                                            sx={{ color: "#7C3AED", "&.Mui-checked": { color: "#7C3AED" }, "&.MuiCheckbox-indeterminate": { color: "#7C3AED" } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Student Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Roll Number</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Grade</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Current Stop</TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", fontSize: "12px" }}>Phone</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredExistingStudents.map((student, idx) => (
                                    <TableRow
                                        key={student.id}
                                        hover
                                        onClick={() => handleStudentSelect(student)}
                                        sx={{
                                            cursor: "pointer",
                                            backgroundColor: selectedStudents.find(s => s.id === student.id) ? "#F5F3FF" : idx % 2 === 0 ? "#fff" : "#F9FAFB"
                                        }}
                                    >
                                        <TableCell padding="checkbox" sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB" }}>
                                            <Checkbox checked={!!selectedStudents.find(s => s.id === student.id)} sx={{ color: "#7C3AED", "&.Mui-checked": { color: "#7C3AED" } }} />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Avatar sx={{ width: 28, height: 28, fontSize: "12px", backgroundColor: "#EDE9FE", color: "#7C3AED" }}>
                                                    {student.name?.charAt(0)}
                                                </Avatar>
                                                {student.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>{student.rollNumber}</TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>{student.grade}</TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>
                                            <Chip
                                                icon={<LocationOnIcon sx={{ fontSize: 14 }} />}
                                                label={student.stopName}
                                                size="small"
                                                sx={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", fontSize: "11px", borderRadius: "4px" }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB", fontSize: "12px" }}>{student.phone}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 2.5, py: 2, borderTop: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                    <Button
                        onClick={() => setTransferStudentDialog(false)}
                        sx={{ textTransform: "none", borderRadius: "8px", border: "1px solid #D1D5DB", color: "#374151" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setConfirmTransferDialog(true)}
                        disabled={selectedStudents.length === 0 || !targetBus || !targetStop}
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            backgroundColor: "#7C3AED",
                            "&:hover": { backgroundColor: "#6D28D9" }
                        }}
                    >
                        Transfer {selectedStudents.length} Student(s)
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Removed/Transferred Students Dialog */}
            <Dialog
                open={viewRemovedDialog}
                onClose={() => setViewRemovedDialog(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 0, border: "1px solid #E5E7EB" } }}
            >
                <DialogTitle sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #E5E7EB",
                    py: 1.5,
                    px: 2.5,
                    backgroundColor: "#fff"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ width: 36, height: 36, backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>
                            <HistoryIcon sx={{ color: "#D97706", fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "16px", color: "#111827" }}>
                            Student History - {selectedBus?.busName}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setViewRemovedDialog(false)} sx={{ color: "#6B7280" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {/* Tabs */}
                    <Box sx={{ borderBottom: "1px solid #E5E7EB" }}>
                        <Tabs
                            value={historyTabValue}
                            onChange={(e, newValue) => setHistoryTabValue(newValue)}
                            sx={{
                                px: 2,
                                "& .MuiTab-root": { textTransform: "none", fontWeight: 600, color: "#6B7280" },
                                "& .Mui-selected": { color: "#374151" },
                                "& .MuiTabs-indicator": { backgroundColor: "#374151" }
                            }}
                        >
                            <Tab
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <PersonRemoveIcon sx={{ fontSize: 18 }} />
                                        Removed Students
                                        <Chip label={removedStudents.length} size="small" sx={{ height: 20, fontSize: "11px", backgroundColor: "#FEE2E2", color: "#DC2626", borderRadius: "4px" }} />
                                    </Box>
                                }
                            />
                            <Tab
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <SwapHorizIcon sx={{ fontSize: 18 }} />
                                        Transferred Students
                                        <Chip label={transferredStudents.length} size="small" sx={{ height: 20, fontSize: "11px", backgroundColor: "#EDE9FE", color: "#7C3AED", borderRadius: "4px" }} />
                                    </Box>
                                }
                            />
                        </Tabs>
                    </Box>

                    {/* Tab Content */}
                    <Box sx={{ p: 2.5 }}>
                        {historyTabValue === 0 && (
                            <Box sx={{
                                maxHeight: 400,
                                overflowY: "auto",
                                border: "1px solid #E5E7EB",
                                borderRadius: "8px"
                            }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Student Name</TableCell>
                                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Roll Number</TableCell>
                                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Grade</TableCell>
                                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Removed Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Reason</TableCell>
                                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", fontSize: "12px" }}>Removed By</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {removedStudents.length > 0 ? (
                                            removedStudents.map((student, idx) => (
                                                <TableRow key={student.id} hover sx={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#F9FAFB" }}>
                                                    <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <Avatar sx={{ width: 28, height: 28, fontSize: "12px", backgroundColor: "#FEE2E2", color: "#DC2626" }}>
                                                                {student.name?.charAt(0)}
                                                            </Avatar>
                                                            {student.name}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>{student.rollNumber}</TableCell>
                                                    <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>{student.grade}</TableCell>
                                                    <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>{student.removedDate}</TableCell>
                                                    <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>
                                                        <Chip
                                                            label={student.reason}
                                                            size="small"
                                                            sx={{ backgroundColor: "#FEF2F2", color: "#DC2626", fontSize: "11px", borderRadius: "4px" }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: "1px solid #E5E7EB", fontSize: "12px" }}>{student.removedBy}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} sx={{ textAlign: "center", py: 4, color: "#9CA3AF" }}>
                                                    No removed students found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}

                        {historyTabValue === 1 && (
                            <Box sx={{
                                maxHeight: 400,
                                overflowY: "auto",
                                border: "1px solid #E5E7EB",
                                borderRadius: "8px"
                            }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Student Name</TableCell>
                                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Roll Number</TableCell>
                                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Grade</TableCell>
                                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>Transfer Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>From</TableCell>
                                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB", color: "#374151", borderBottom: "1px solid #E5E7EB", fontSize: "12px" }}>To</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transferredStudents.length > 0 ? (
                                            transferredStudents.map((student, idx) => (
                                                <TableRow key={student.id} hover sx={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#F9FAFB" }}>
                                                    <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <Avatar sx={{ width: 28, height: 28, fontSize: "12px", backgroundColor: "#EDE9FE", color: "#7C3AED" }}>
                                                                {student.name?.charAt(0)}
                                                            </Avatar>
                                                            {student.name}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>{student.rollNumber}</TableCell>
                                                    <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>{student.grade}</TableCell>
                                                    <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>{student.transferDate}</TableCell>
                                                    <TableCell sx={{ borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB", fontSize: "12px" }}>
                                                        <Box>
                                                            <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>{student.fromBus}</Typography>
                                                            <Typography sx={{ fontSize: "10px", color: "#6B7280" }}>{student.fromStop}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: "1px solid #E5E7EB", fontSize: "12px" }}>
                                                        <Box>
                                                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#059669" }}>{student.toBus}</Typography>
                                                            <Typography sx={{ fontSize: "10px", color: "#6B7280" }}>{student.toStop}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} sx={{ textAlign: "center", py: 4, color: "#9CA3AF" }}>
                                                    No transferred students found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 2.5, py: 2, borderTop: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                    <Button
                        onClick={() => setViewRemovedDialog(false)}
                        sx={{ textTransform: "none", borderRadius: "8px", border: "1px solid #D1D5DB", color: "#374151" }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Remove Dialog */}
            <Dialog
                open={confirmRemoveDialog}
                onClose={() => setConfirmRemoveDialog(false)}
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: "12px", border: "1px solid #E5E7EB" } }}
            >
                <DialogTitle sx={{ pb: 1, borderBottom: "1px solid #E5E7EB", backgroundColor: "#fff" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "8px",
                            backgroundColor: "#FEE2E2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <PersonRemoveIcon sx={{ color: "#DC2626" }} />
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "16px", color: "#111827" }}>
                            Confirm Removal
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 2.5 }}>
                    <Typography sx={{ fontSize: "14px", color: "#6B7280", mb: 2.5 }}>
                        Are you sure you want to remove <strong>{selectedStudents.length} student(s)</strong> from <strong>{selectedBus?.busName}</strong>?
                    </Typography>
                    {removeReason && (
                        <Box sx={{ backgroundColor: "#FEF2F2", p: 2, borderRadius: "8px", border: "1px solid #FECACA" }}>
                            <Typography sx={{ fontSize: "12px", color: "#DC2626", fontWeight: 600 }}>Reason:</Typography>
                            <Typography sx={{ fontSize: "13px", color: "#374151" }}>{removeReason}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 2.5, py: 2, borderTop: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                    <Button
                        onClick={() => setConfirmRemoveDialog(false)}
                        sx={{ textTransform: "none", borderRadius: "8px", border: "1px solid #D1D5DB", color: "#374151" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmRemove}
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            backgroundColor: "#DC2626",
                            "&:hover": { backgroundColor: "#B91C1C" }
                        }}
                    >
                        Yes, Remove
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Transfer Dialog */}
            <Dialog
                open={confirmTransferDialog}
                onClose={() => setConfirmTransferDialog(false)}
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: "12px", border: "1px solid #E5E7EB" } }}
            >
                <DialogTitle sx={{ pb: 1, borderBottom: "1px solid #E5E7EB", backgroundColor: "#fff" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "8px",
                            backgroundColor: "#EDE9FE",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <SwapHorizIcon sx={{ color: "#7C3AED" }} />
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "16px", color: "#111827" }}>
                            Confirm Transfer
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 2.5 }}>
                    <Typography sx={{ fontSize: "14px", color: "#6B7280", mb: 2.5 }}>
                        Are you sure you want to transfer <strong>{selectedStudents.length} student(s)</strong>?
                    </Typography>
                    <Box sx={{ backgroundColor: "#FAFAFA", p: 2, borderRadius: "8px", border: "1px solid #E5E7EB" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                            <Box sx={{ textAlign: "center" }}>
                                <Typography sx={{ fontSize: "11px", color: "#6B7280", fontWeight: 600 }}>FROM</Typography>
                                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#DC2626" }}>{selectedBus?.busName}</Typography>
                            </Box>
                            <SwapHorizIcon sx={{ color: "#9CA3AF", fontSize: 28 }} />
                            <Box sx={{ textAlign: "center" }}>
                                <Typography sx={{ fontSize: "11px", color: "#6B7280", fontWeight: 600 }}>TO</Typography>
                                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#059669" }}>{targetBus?.busName}</Typography>
                                <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{targetStop?.stopName}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, py: 2, borderTop: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                    <Button
                        onClick={() => setConfirmTransferDialog(false)}
                        sx={{ textTransform: "none", borderRadius: "8px", border: "1px solid #D1D5DB", color: "#374151" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmTransfer}
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            backgroundColor: "#7C3AED",
                            "&:hover": { backgroundColor: "#6D28D9" }
                        }}
                    >
                        Yes, Transfer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
