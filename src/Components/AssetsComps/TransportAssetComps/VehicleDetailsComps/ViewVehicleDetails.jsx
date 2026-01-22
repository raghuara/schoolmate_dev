import React, { useEffect, useState } from 'react'
import { Box } from '@mui/system'
import {
    Button,
    Grid,
    IconButton,
    Tab,
    Tabs,
    Typography,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Divider
} from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useLocation, useNavigate } from 'react-router-dom'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import axios from 'axios'
import { findVehicleManagementDetails, findVehicleSafetyComplianceDetails, deleteVehicleById } from '../../../../Api/Api'
import BusImage from "../../../../Images/PagesImage/bus.png"
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DescriptionIcon from '@mui/icons-material/Description';
import SecurityIcon from '@mui/icons-material/Security';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { useSelector } from 'react-redux'

// Color palette for sections
const sectionColors = {
    acquisition: { bg: "#FFF8E1", border: "#FFE082", icon: "#F57C00" },
    specification: { bg: "#E3F2FD", border: "#90CAF9", icon: "#1976D2" },
    registration: { bg: "#F3E5F5", border: "#CE93D8", icon: "#7B1FA2" },
    insurance: { bg: "#E8F5E9", border: "#A5D6A7", icon: "#388E3C" },
    warranty: { bg: "#FFF3E0", border: "#FFCC80", icon: "#E65100" },
    documents: { bg: "#E0F7FA", border: "#80DEEA", icon: "#00838F" },
    fc: { bg: "#FCE4EC", border: "#F48FB1", icon: "#C2185B" },
    permit: { bg: "#EDE7F6", border: "#B39DDB", icon: "#512DA8" },
    puc: { bg: "#E8EAF6", border: "#9FA8DA", icon: "#303F9F" },
    roadTax: { bg: "#EFEBE9", border: "#BCAAA4", icon: "#5D4037" },
    cctv: { bg: "#E0F2F1", border: "#80CBC4", icon: "#00695C" },
    branding: { bg: "#FBE9E7", border: "#FFAB91", icon: "#BF360C" }
};

// Reusable Detail Item Component
const DetailItem = ({ label, value, fullWidth = false }) => (
    <Grid size={{ xs: 12, sm: fullWidth ? 12 : 6, md: fullWidth ? 12 : 3 }}>
        <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: "11px", color: "#757575", mb: 0.5, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#212121", fontWeight: 500 }}>
                {value || "- - -"}
            </Typography>
        </Box>
    </Grid>
);

// Section Header Component with colored background
const SectionHeader = ({ icon: Icon, title, chipLabel, chipColor = "primary", colorScheme }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2.5,
            mt: 1,
            backgroundColor: colorScheme?.bg || "#F5F5F5",
            borderLeft: `4px solid ${colorScheme?.border || "#E0E0E0"}`,
            borderRadius: "0 8px 8px 0",
            p: 1.5,
            pl: 2
        }}
    >
        {Icon && (
            <Box sx={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                p: 0.8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.08)"
            }}>
                <Icon sx={{ color: colorScheme?.icon || "#1976D2", fontSize: 22 }} />
            </Box>
        )}
        <Typography sx={{ fontWeight: 600, fontSize: "15px", color: "#333", flex: 1 }}>
            {title}
        </Typography>
        {chipLabel && (
            <Chip
                label={chipLabel}
                size="small"
                color={chipColor}
                sx={{ fontSize: "11px", height: 24, fontWeight: 600 }}
            />
        )}
    </Box>
);

// Section Card Component
const SectionCard = ({ children, sx = {} }) => (
    <Paper
        elevation={0}
        sx={{
            border: "1px solid #E8E8E8",
            borderRadius: "16px",
            p: 3,
            mb: 3,
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            ...sx
        }}
    >
        {children}
    </Paper>
);

// Document Preview Component with colored background
const DocumentPreview = ({ label, url, colorScheme }) => (
    <Box sx={{ textAlign: "center" }}>
        <Box
            sx={{
                width: 130,
                height: 110,
                border: `2px dashed ${url ? colorScheme?.border || "#90CAF9" : "#E0E0E0"}`,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: url ? colorScheme?.bg || "#E3F2FD" : "#FAFAFA",
                mx: "auto",
                mb: 1,
                overflow: "hidden",
                cursor: url ? "pointer" : "default",
                transition: "all 0.2s ease",
                "&:hover": url ? {
                    transform: "scale(1.02)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                } : {}
            }}
            onClick={() => url && window.open(url, '_blank')}
        >
            {url ? (
                <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <DescriptionIcon sx={{ color: "#BDBDBD", fontSize: 36 }} />
            )}
        </Box>
        <Typography sx={{ fontSize: "11px", color: "#555", fontWeight: 600 }}>
            {label}
        </Typography>
        {url && (
            <Typography
                sx={{
                    fontSize: "10px",
                    color: colorScheme?.icon || "#1976D2",
                    cursor: "pointer",
                    fontWeight: 500,
                    "&:hover": { textDecoration: "underline" }
                }}
                onClick={() => window.open(url, '_blank')}
            >
                View Document
            </Typography>
        )}
    </Box>
);

// Status Chip Component with enhanced styling
const StatusChip = ({ status }) => {
    const getStatusStyle = () => {
        if (!status) return { bg: "#F5F5F5", text: "#9E9E9E", border: "#E0E0E0" };
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === "active" || lowerStatus === "yes" || lowerStatus === "valid" || lowerStatus === "provided") {
            return { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" };
        }
        if (lowerStatus === "expired" || lowerStatus === "no" || lowerStatus === "invalid" || lowerStatus === "not provided") {
            return { bg: "#FFEBEE", text: "#C62828", border: "#EF9A9A" };
        }
        return { bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9" };
    };

    const style = getStatusStyle();
    return (
        <Chip
            label={status || "N/A"}
            size="small"
            sx={{
                backgroundColor: style.bg,
                color: style.text,
                border: `1px solid ${style.border}`,
                fontSize: "11px",
                fontWeight: 600,
                height: 26,
                borderRadius: "6px"
            }}
        />
    );
};

// Info Card for Speed Governor, Fire Extinguisher, GPS
const InfoCard = ({ title, icon: Icon, colorScheme, children }) => (
    <Paper
        sx={{
            p: 2.5,
            borderRadius: "12px",
            border: `1px solid ${colorScheme?.border || "#E0E0E0"}`,
            backgroundColor: "#fff",
            height: "100%",
            transition: "all 0.2s ease",
            "&:hover": {
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
            }
        }}
    >
        <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2,
            pb: 1.5,
            borderBottom: `2px solid ${colorScheme?.bg || "#F5F5F5"}`
        }}>
            <Box sx={{
                backgroundColor: colorScheme?.bg || "#F5F5F5",
                borderRadius: "10px",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <Icon sx={{ color: colorScheme?.icon || "#666", fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#333" }}>
                {title}
            </Typography>
        </Box>
        {children}
    </Paper>
);

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vehicle-tabpanel-${index}`}
            aria-labelledby={`vehicle-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export default function ViewVehicleDetails() {
    const navigate = useNavigate()
    const token = "123";
    const location = useLocation();

    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [status, setStatus] = useState(false)
    const [color, setColor] = useState(false)
    const [message, setMessage] = useState('')

    const { vehicleId } = location.state || {}
    const [vehicleData, setVehicleData] = useState({});
    const [safetyData, setSafetyData] = useState({});
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleEditClick = (id) => {
        navigate("/dashboardmenu/asset/transport/details/edit", { state: { vehicleId: id } })
    }

    useEffect(() => {
        if (vehicleId) {
            fetchVehicleDetails();
            fetchSafetyComplianceDetails();
        }
    }, [vehicleId]);

    const fetchVehicleDetails = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(findVehicleManagementDetails, {
                params: { VehicleAssetID: vehicleId },
                headers: { Authorization: `Bearer ${token}` },
            });
            setVehicleData(res.data?.data || {});
        } catch (error) {
            console.error("Error fetching vehicle details:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchSafetyComplianceDetails = async () => {
        try {
            const res = await axios.get(findVehicleSafetyComplianceDetails, {
                params: { VehicleAssetID: vehicleId },
                headers: { Authorization: `Bearer ${token}` },
            });
            setSafetyData(res.data?.data || {});
        } catch (error) {
            console.error("Error fetching safety compliance details:", error);
        }
    }

    const handleDeleteVehicle = async () => {
        setIsDeleting(true);
        try {
            await axios.delete(deleteVehicleById, {
                params: { id: vehicleId },
                headers: { Authorization: `Bearer ${token}` },
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
        <Box sx={{ width: '100%', backgroundColor: "#F8F9FA", minHeight: "100vh" }}>
            <SnackBar
                open={open}
                color={color}
                setOpen={setOpen}
                status={status}
                message={message}
            />

            {isLoading && <Loader />}

            {/* Header */}
            <Box sx={{
                position: "fixed",
                top: "60px",
                left: isExpanded ? "260px" : "80px",
                right: 0,
                backgroundColor: "#f2f2f2",
                px: 2,
                py:0.5,
                borderBottom: "1px solid #ddd",
                zIndex: 1200,
                transition: "left 0.3s ease-in-out",
                overflow: 'hidden',
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ mr: 1, color: "#000", "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography sx={{ fontWeight: 600, fontSize: 20, }}>
                        Vehicle Details
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Button
                        onClick={() => setOpenDeleteDialog(true)}
                        variant="outlined"
                        startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            height:"28px",
                            textTransform: "none",
                            borderRadius: "8px",
                            px: 2.5,
                            py: 0.8,
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#D32F2F",
                            borderColor: "#D32F2F",
                            backgroundColor: "#fff",
                            "&:hover": {
                                backgroundColor: "#FFEBEE",
                                borderColor: "#B71C1C",
                            },
                        }}
                    >
                        Delete
                    </Button>
                    <Button
                        onClick={() => handleEditClick(vehicleId)}
                        variant="contained"
                        startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            height:"28px",
                            textTransform: "none",
                            borderRadius: "8px",
                            px: 2.5,
                            py: 0.8,
                            fontSize: "13px",
                            fontWeight: 600,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "#fff",
                            "&:hover": {
                                background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                            },
                        }}
                    >
                        Edit Vehicle
                    </Button>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ p: 3, pt: "60px" }}>
                {/* Vehicle Summary Card */}
                <SectionCard sx={{
                    background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
                    border: "1px solid rgba(0,0,0,0.1)"
                }}>
                    <Grid container spacing={3} alignItems="center">
                        {/* Bus Image */}
                        <Grid size={{ xs: 12, md: 2 }}>
                            <Box sx={{ textAlign: "center" }}>
                                <Box
                                    sx={{
                                        width: 150,
                                        height: 110,
                                        borderRadius: "16px",
                                        overflow: "hidden",
                                        mx: "auto",
                                        mb: 1.5,
                                        border: "3px solid #fff",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                                    }}
                                >
                                    <img
                                        src={vehicleData.busPhotoUrl || BusImage}
                                        alt="Vehicle"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </Box>
                                <Chip
                                    label={vehicleData.vehicleAssetId || vehicleId || "N/A"}
                                    size="small"
                                    sx={{
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        color: "#fff",
                                        fontWeight: 600,
                                        fontSize: "12px",
                                        height: 28,
                                        borderRadius: "8px"
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* Vehicle Quick Info */}
                        <Grid size={{ xs: 12, md: 10 }}>
                            <Grid container spacing={2}>
                                {[
                                    { label: "Vehicle Type", value: vehicleData.vehicleAssetType, color: "#E3F2FD" },
                                    { label: "Brand", value: vehicleData.vehicleBrand, color: "#FFF3E0" },
                                    { label: "Model", value: vehicleData.busModelAndMake, color: "#F3E5F5" },
                                    { label: "Registration No.", value: vehicleData.registrationNumberAsPerRC, color: "#E8F5E9", highlight: true },
                                    { label: "Seating Capacity", value: vehicleData.seatingCapacity, color: "#FCE4EC" },
                                    { label: "Fuel Type", value: vehicleData.fuelTypeAsPerRC, color: "#E0F7FA" }
                                ].map((item, index) => (
                                    <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
                                        <Box sx={{
                                            backgroundColor: item.color,
                                            borderRadius: "12px",
                                            p: 1.5,
                                            height: "100%",
                                            transition: "transform 0.2s ease",
                                            "&:hover": { transform: "translateY(-2px)" }
                                        }}>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                {item.label}
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: "14px",
                                                fontWeight: 700,
                                                color: item.highlight ? "#1565C0" : "#212121",
                                                mt: 0.5
                                            }}>
                                                {item.value || "- - -"}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </SectionCard>

                {/* Tabs */}
                <Paper
                    elevation={0}
                    sx={{
                        border: "1px solid #E8E8E8",
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                    }}
                >
                    <Box sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)"
                    }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            sx={{
                                "& .MuiTab-root": {
                                    textTransform: "none",
                                    fontWeight: 500,
                                    fontSize: "14px",
                                    minHeight: 60,
                                    "&.Mui-selected": {
                                        fontWeight: 700,
                                        color: "#667eea"
                                    }
                                },
                                "& .MuiTabs-indicator": {
                                    backgroundColor: "#667eea",
                                    height: 3,
                                    borderRadius: "3px 3px 0 0"
                                }
                            }}
                        >
                            <Tab
                                icon={<DirectionsBusIcon sx={{ fontSize: 22 }} />}
                                iconPosition="start"
                                label="Vehicle Information"
                            />
                            <Tab
                                icon={<SecurityIcon sx={{ fontSize: 22 }} />}
                                iconPosition="start"
                                label="Safety & Compliance"
                            />
                        </Tabs>
                    </Box>

                    {/* Tab 1: Vehicle Information */}
                    <TabPanel value={tabValue} index={0}>
                        <Box sx={{ p: 3 }}>
                            {/* Acquisition Details */}
                            <SectionHeader
                                icon={DirectionsBusIcon}
                                title="Vehicle Acquisition Details"
                                colorScheme={sectionColors.acquisition}
                            />
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <DetailItem label="Mode of Acquisition" value={vehicleData.modeOfAcquisition} />
                                <DetailItem label="Acquisition Source Type" value={vehicleData.vehicleAcquisitionSourceType} />
                                <DetailItem label="Acquisition Date" value={vehicleData.vehicleAcquisitionDate} />
                                <DetailItem label="Vehicle Asset Type" value={vehicleData.vehicleAssetType} />
                                <DetailItem label="Vehicle Asset Sub Type" value={vehicleData.vehicleAssetSubType} />
                                <DetailItem label="Vehicle Brand" value={vehicleData.vehicleBrand} />
                                <DetailItem label="Dealer Name" value={vehicleData.dealerName} />
                                <DetailItem label="Dealer Contact" value={vehicleData.dealerContactNumber} />
                                <DetailItem label="Dealer Address" value={vehicleData.dealerAddress} fullWidth />
                                <DetailItem label="Dealer GSTIN" value={vehicleData.dealerGSTIN} />
                                <DetailItem label="Invoice/Transfer Number" value={vehicleData.invoiceOrTransferOrDonationNumber} />
                            </Grid>

                            <Divider sx={{ my: 4 }} />

                            {/* Vehicle Specification */}
                            <SectionHeader
                                icon={LocalGasStationIcon}
                                title="Vehicle Specification"
                                colorScheme={sectionColors.specification}
                            />
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <DetailItem label="Bus Model & Make" value={vehicleData.busModelAndMake} />
                                <DetailItem label="Year of Manufacture" value={vehicleData.yearOfManufacture} />
                                <DetailItem label="Engine Number" value={vehicleData.engineNumberAsPerRC} />
                                <DetailItem label="Chassis Number" value={vehicleData.engineChasisNumberAsPerRC} />
                                <DetailItem label="Fuel Type" value={vehicleData.fuelTypeAsPerRC} />
                                <DetailItem label="Vehicle Class" value={vehicleData.vehicleClassAsPerRC} />
                                <DetailItem label="Fuel Tank Capacity" value={vehicleData.fuelTankCapacity} />
                                <DetailItem label="Seating Capacity" value={vehicleData.seatingCapacity} />
                                <DetailItem label="Seats per Row" value={vehicleData.seatsPerRow} />
                                <DetailItem label="Standing Space" value={vehicleData.standingSpace} />
                                <DetailItem label="Vehicle Colour" value={vehicleData.vehicleColour} />
                            </Grid>

                            <Divider sx={{ my: 4 }} />

                            {/* Registration & Ownership */}
                            <SectionHeader
                                icon={DescriptionIcon}
                                title="Registration & Ownership"
                                colorScheme={sectionColors.registration}
                            />
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <DetailItem label="Registration Number" value={vehicleData.registrationNumberAsPerRC} />
                                <DetailItem label="RTO Name & Code" value={vehicleData.rtoNameAndCodeAsPerRC} />
                                <DetailItem label="Registration Date" value={vehicleData.registrationDate} />
                                <DetailItem label="Ownership Type" value={vehicleData.vehicleOwnershipType} />
                                <DetailItem label="Owner Name" value={vehicleData.vehicleOwnerNameAsPerRC} />
                                <DetailItem label="Owner Contact" value={vehicleData.ownerContactNumber} />
                                <DetailItem label="Owner Address" value={vehicleData.ownerPermanentAddress} fullWidth />
                                <DetailItem label="Owner Legal ID / GST" value={vehicleData.vehicleOwnerLegalIdOrGST} />
                            </Grid>

                            <Divider sx={{ my: 4 }} />

                            {/* Insurance Details */}
                            <SectionHeader
                                icon={VerifiedUserIcon}
                                title="Insurance Details"
                                chipLabel={vehicleData.currentInsuranceStatus}
                                chipColor={vehicleData.currentInsuranceStatus === "Active" ? "success" : "error"}
                                colorScheme={sectionColors.insurance}
                            />
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <DetailItem label="Insurance Company" value={vehicleData.insuranceCompanyName} />
                                <DetailItem label="Policy Number" value={vehicleData.insurancePolicyNumber} />
                                <DetailItem label="Policy Type" value={vehicleData.insurancePolicyType} />
                                <DetailItem label="Policy Start Date" value={vehicleData.policyStartDate} />
                                <DetailItem label="Policy End Date" value={vehicleData.policyEndDate} />
                                <DetailItem label="Primary Identifier" value={vehicleData.primaryInsuranceIdentifier} />
                                <DetailItem label="Premium Amount" value={vehicleData.insurancePremiumAmount ? `₹ ${vehicleData.insurancePremiumAmount}` : null} />
                            </Grid>

                            <Divider sx={{ my: 4 }} />

                            {/* Warranty Details */}
                            <SectionHeader
                                icon={VerifiedUserIcon}
                                title="Warranty & Service"
                                colorScheme={sectionColors.warranty}
                            />
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <DetailItem label="Warranty" value={vehicleData.warranty} />
                                <DetailItem label="Warranty Provided By" value={vehicleData.warrantyProvidedBy} />
                                <DetailItem label="Warranty Type" value={vehicleData.warrantyType} />
                                <DetailItem label="Coverage For" value={vehicleData.warrantyCoverageFor} />
                                <DetailItem label="Warranty Start Date" value={vehicleData.fullVehicleWarrantyStartDate} />
                                <DetailItem label="Warranty End Date" value={vehicleData.fullVehicleWarrantyEndDate} />
                                <DetailItem label="Warranty Period" value={vehicleData.fullVehicleWarrantyPeriod} />
                            </Grid>

                            <Divider sx={{ my: 4 }} />

                            {/* Documents */}
                            <SectionHeader
                                icon={DescriptionIcon}
                                title="Documents"
                                colorScheme={sectionColors.documents}
                            />
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                                    <DocumentPreview label="RC Book" url={vehicleData.rcBookFileUrl} colorScheme={sectionColors.documents} />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                                    <DocumentPreview label="Fitness Certificate" url={vehicleData.fitnessCertificateFileUrl} colorScheme={sectionColors.fc} />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                                    <DocumentPreview label="Road Tax" url={vehicleData.roadTaxCertificateFileUrl} colorScheme={sectionColors.roadTax} />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                                    <DocumentPreview label="Insurance" url={vehicleData.insuranceDocumentFileUrl} colorScheme={sectionColors.insurance} />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                                    <DocumentPreview label="PUC Certificate" url={vehicleData.pucCertificateFileUrl} colorScheme={sectionColors.puc} />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                                    <DocumentPreview label="Permit Document" url={vehicleData.permitDocumentFileUrl} colorScheme={sectionColors.permit} />
                                </Grid>
                            </Grid>
                        </Box>
                    </TabPanel>

                    {/* Tab 2: Safety & Compliance */}
                    <TabPanel value={tabValue} index={1}>
                        <Box sx={{ p: 3 }}>
                            {/* FC Details */}
                            <SectionHeader
                                icon={VerifiedUserIcon}
                                title="Fitness Certificate (FC) Details"
                                chipLabel={safetyData.fcValidityStatus}
                                colorScheme={sectionColors.fc}
                            />
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <DetailItem label="FC Number" value={safetyData.fcNumber} />
                                <DetailItem label="FC Issue Date" value={safetyData.fcIssueDate} />
                                <DetailItem label="FC Expiry Date" value={safetyData.fcExpiryDate} />
                                <DetailItem label="FC Validity Duration" value={safetyData.fcValidityDuration} />
                                <DetailItem label="Next Inspection Date" value={safetyData.nextInspectionDate} />
                                <DetailItem label="Issuing Authority" value={safetyData.fcIssuingAuthority} />
                            </Grid>

                            <Divider sx={{ my: 4 }} />

                            {/* Permit Details */}
                            <SectionHeader
                                icon={DescriptionIcon}
                                title="Permit Details"
                                colorScheme={sectionColors.permit}
                            />
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <DetailItem label="Permit Type" value={safetyData.permitType} />
                                <DetailItem label="Permit Number" value={safetyData.permitNumber} />
                                <DetailItem label="Permit Issue Date" value={safetyData.permitIssueDate} />
                                <DetailItem label="Permit Expiry Date" value={safetyData.permitExpiryDate} />
                                <DetailItem label="Permit Validity Duration" value={safetyData.permitValidityDuration} />
                                <DetailItem label="Area of Operation" value={safetyData.permitAreaOfOperation} />
                                <DetailItem label="Permit Route" value={safetyData.permitRoute} />
                            </Grid>

                            <Divider sx={{ my: 4 }} />

                            {/* PUC Details */}
                            <SectionHeader
                                icon={LocalGasStationIcon}
                                title="Pollution Under Control (PUC) Details"
                                chipLabel={safetyData.pucValidityStatus}
                                colorScheme={sectionColors.puc}
                            />
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <DetailItem label="PUC Certificate Number" value={safetyData.pucCertificateNumber} />
                                <DetailItem label="PUC Issue Date" value={safetyData.pucIssueDate} />
                                <DetailItem label="PUC Expiry Date" value={safetyData.pucExpiryDate} />
                                <DetailItem label="PUC Validity Status" value={safetyData.pucValidityStatus} />
                            </Grid>

                            <Divider sx={{ my: 4 }} />

                            {/* Road Tax Details */}
                            <SectionHeader
                                icon={DescriptionIcon}
                                title="State Road Transport Tax"
                                colorScheme={sectionColors.roadTax}
                            />
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <DetailItem label="Tax Type" value={safetyData.taxType} />
                                <DetailItem label="Tax Paid Date" value={safetyData.taxPaidDate} />
                                <DetailItem label="Tax Expiry Date" value={safetyData.taxExpiryDate} />
                                <DetailItem label="Tax Status" value={safetyData.taxStatus} />
                            </Grid>

                            <Divider sx={{ my: 4 }} />

                            {/* CCTV Details */}
                            <SectionHeader
                                icon={CameraAltIcon}
                                title="CCTV Camera Installation"
                                chipLabel={safetyData.cctvInstalled}
                                chipColor={safetyData.cctvInstalled === "Yes" ? "success" : "default"}
                                colorScheme={sectionColors.cctv}
                            />
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <DetailItem label="CCTV Installed" value={safetyData.cctvInstalled} />
                                <DetailItem label="Number of Cameras" value={safetyData.numberOfCameras} />
                                <DetailItem label="Dealer/Installer Same" value={safetyData.cctvDealerInstallerSame} />
                                <DetailItem label="Installation Date" value={safetyData.camera1DateOfInstallation} />
                                <DetailItem label="Camera Type" value={safetyData.camera1Type} />
                                <DetailItem label="Dealer/Installer Name" value={safetyData.camera1DealerInstallerName} />
                            </Grid>

                            {/* First Aid Kit & Safety Grills */}
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{
                                        backgroundColor: "#E8F5E9",
                                        borderRadius: "12px",
                                        p: 2.5,
                                        border: "1px solid #A5D6A7"
                                    }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: "14px", mb: 2, color: "#2E7D32" }}>
                                            First Aid Kit Installation
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Installed</Typography>
                                                <StatusChip status={safetyData.firstAidKitInstallation} />
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Installation Date</Typography>
                                                <Typography sx={{ fontSize: "13px", fontWeight: 500, mt: 0.5 }}>{safetyData.firstAidDateOfInstallation || "- - -"}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Expiry Check Due</Typography>
                                                <Typography sx={{ fontSize: "13px", fontWeight: 500, mt: 0.5 }}>{safetyData.firstAidExpiryCheckDueDate || "- - -"}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Last Inspection</Typography>
                                                <Typography sx={{ fontSize: "13px", fontWeight: 500, mt: 0.5 }}>{safetyData.firstAidLastInspectionDate || "- - -"}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{
                                        backgroundColor: "#FFF3E0",
                                        borderRadius: "12px",
                                        p: 2.5,
                                        border: "1px solid #FFCC80"
                                    }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: "14px", mb: 2, color: "#E65100" }}>
                                            Safety Grills & Exit Doors
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Grills Installed</Typography>
                                                <StatusChip status={safetyData.safetyGrillsInstalled} />
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Grill Location</Typography>
                                                <Typography sx={{ fontSize: "13px", fontWeight: 500, mt: 0.5 }}>{safetyData.grillLocation || "- - -"}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Emergency Exit</Typography>
                                                <StatusChip status={safetyData.emergencyExitAvailable} />
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Compliance</Typography>
                                                <StatusChip status={safetyData.complianceAsPerNorms} />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 4 }} />

                            {/* Speed Governor, Fire Extinguisher, GPS */}
                            <Grid container spacing={3}>
                                {/* Speed Governor */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <InfoCard
                                        title="Speed Governor"
                                        icon={SpeedIcon}
                                        colorScheme={{ bg: "#E3F2FD", border: "#90CAF9", icon: "#1976D2" }}
                                    >
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Installation</Typography>
                                            <StatusChip status={safetyData.speedGovernorInstallation} />
                                        </Box>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Installation Date</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{safetyData.speedGovernorDateOfInstallation || "- - -"}</Typography>
                                        </Box>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Speed Limit (Kmph)</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{safetyData.speedLimitSet || "- - -"}</Typography>
                                        </Box>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Certificate No.</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{safetyData.speedGovernorCertificateNumber || "- - -"}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Validity Date</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{safetyData.speedGovernorValidityDate || "- - -"}</Typography>
                                        </Box>
                                    </InfoCard>
                                </Grid>

                                {/* Fire Extinguisher */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <InfoCard
                                        title="Fire Extinguisher"
                                        icon={LocalFireDepartmentIcon}
                                        colorScheme={{ bg: "#FFEBEE", border: "#EF9A9A", icon: "#C62828" }}
                                    >
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Installation</Typography>
                                            <StatusChip status={safetyData.fireExtinguisherInstallation} />
                                        </Box>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Installation Date</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{safetyData.fireExtinguisherDateOfInstallation || "- - -"}</Typography>
                                        </Box>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Expiry/Refill Due</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{safetyData.fireExtinguisherExpiryDate || "- - -"}</Typography>
                                        </Box>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Type & Capacity</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{safetyData.extinguisherTypeCapacity || "- - -"}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Vendor</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{safetyData.fireExtinguisherVendorDetails || "- - -"}</Typography>
                                        </Box>
                                    </InfoCard>
                                </Grid>

                                {/* GPS Tracker */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <InfoCard
                                        title="GPS Tracker"
                                        icon={GpsFixedIcon}
                                        colorScheme={{ bg: "#E0F7FA", border: "#80DEEA", icon: "#00838F" }}
                                    >
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Installation Date</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{safetyData.gpsDateOfInstallation || "- - -"}</Typography>
                                        </Box>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>GPS ID / IMEI</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{safetyData.gpsDeviceIdImei || "- - -"}</Typography>
                                        </Box>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Hardware Warranty</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{safetyData.gpsHardwareWarranty || "- - -"}</Typography>
                                        </Box>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>SIM Number</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{safetyData.gpsSimNumber || "- - -"}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: "10px", color: "#666", fontWeight: 600, textTransform: "uppercase" }}>Subscription Valid</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{safetyData.gpsSubscriptionValidTill || "- - -"}</Typography>
                                        </Box>
                                    </InfoCard>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 4 }} />

                            {/* Bus Branding */}
                            <SectionHeader
                                icon={BrandingWatermarkIcon}
                                title="Bus Branding & Visual Identity"
                                colorScheme={sectionColors.branding}
                            />

                            {/* School Name Display */}
                            <Box sx={{
                                backgroundColor: "#FFF8E1",
                                borderRadius: "12px",
                                p: 2.5,
                                mb: 3,
                                border: "1px solid #FFE082"
                            }}>
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#F57C00", mb: 2 }}>
                                    School Name Display
                                </Typography>
                                <Grid container spacing={2}>
                                    {["Front", "Back", "Left", "Right"].map((side) => (
                                        <Grid size={{ xs: 6, sm: 3 }} key={side}>
                                            <Box sx={{ textAlign: "center", backgroundColor: "#fff", borderRadius: "8px", p: 1.5 }}>
                                                <Typography sx={{ fontSize: "10px", color: "#666", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>{side} Side</Typography>
                                                <StatusChip status={safetyData[`schoolName${side}Side`]} />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            {/* Reflective Tapes */}
                            <Box sx={{
                                backgroundColor: "#E8EAF6",
                                borderRadius: "12px",
                                p: 2.5,
                                mb: 3,
                                border: "1px solid #9FA8DA"
                            }}>
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#303F9F", mb: 2 }}>
                                    Reflective Tapes Display
                                </Typography>
                                <Grid container spacing={2}>
                                    {["Front", "Back", "Left", "Right"].map((side) => (
                                        <Grid size={{ xs: 6, sm: 3 }} key={side}>
                                            <Box sx={{ textAlign: "center", backgroundColor: "#fff", borderRadius: "8px", p: 1.5 }}>
                                                <Typography sx={{ fontSize: "10px", color: "#666", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>{side} Side</Typography>
                                                <StatusChip status={safetyData[`reflectiveTapes${side}Side`]} />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            {/* School Bus Signage */}
                            <Box sx={{
                                backgroundColor: "#F3E5F5",
                                borderRadius: "12px",
                                p: 2.5,
                                border: "1px solid #CE93D8"
                            }}>
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#7B1FA2", mb: 2 }}>
                                    School Bus Signage Display
                                </Typography>
                                <Grid container spacing={2}>
                                    {["Front", "Back", "Left", "Right"].map((side) => (
                                        <Grid size={{ xs: 6, sm: 3 }} key={side}>
                                            <Box sx={{ textAlign: "center", backgroundColor: "#fff", borderRadius: "8px", p: 1.5 }}>
                                                <Typography sx={{ fontSize: "10px", color: "#666", mb: 0.5, fontWeight: 600, textTransform: "uppercase" }}>{side} Side</Typography>
                                                <StatusChip status={safetyData[`signage${side}Side`]} />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Box>
                    </TabPanel>
                </Paper>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => !isDeleting && setOpenDeleteDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: "16px" }
                }}
            >
                <DialogTitle sx={{ fontWeight: 600, pb: 1, pt: 3 }}>
                    Delete Vehicle
                </DialogTitle>

                <DialogContent>
                    <Typography sx={{ fontSize: "14px", color: "#555" }}>
                        Are you sure you want to delete this vehicle?
                        <br />
                        <Box component="span" sx={{
                            display: "inline-block",
                            backgroundColor: "#FFEBEE",
                            color: "#C62828",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "6px",
                            fontWeight: 600,
                            mt: 1
                        }}>
                            Vehicle ID: {vehicleId}
                        </Box>
                        <br /><br />
                        This action cannot be undone.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        disabled={isDeleting}
                        sx={{ textTransform: "none", borderRadius: "10px", px: 3 }}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleDeleteVehicle}
                        disabled={isDeleting}
                        variant="contained"
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "10px",
                            px: 3,
                            backgroundColor: "#D32F2F",
                            "&:hover": { backgroundColor: "#B71C1C" }
                        }}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
