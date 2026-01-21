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
    Radio,
    RadioGroup,
    FormControlLabel,
    Collapse
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate } from "react-router-dom";

// Reusable style objects
const inputSx = {
    "& .MuiOutlinedInput-root": {
        height: 40,
        borderRadius: "8px",
        fontSize: "13px",
        backgroundColor: "#fff",
    }
};

const selectSx = {
    height: 40,
    borderRadius: "8px",
    fontSize: "13px",
    backgroundColor: "#fff",
};

const labelSx = {
    color: "#ff0000",
    fontWeight: 600,
    fontSize: "11px",
    mb: 0.5
};

const blackLabelSx = {
    color: "#000",
    fontWeight: 600,
    fontSize: "11px",
    mb: 0.5
};

// Expandable Section Component
const ExpandableSection = ({ title, expanded, onToggle, children }) => (
    <Paper sx={{ borderRadius: "8px", mb: 2, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <Box
            onClick={onToggle}
            sx={{
                backgroundColor: "#FFF1F1",
                p: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                "&:hover": {
                    backgroundColor: "#FFE4E4"
                }
            }}
        >
            <Typography fontWeight={600} fontSize="13px" color="#333">
                {title}
            </Typography>
            <IconButton size="small" sx={{ p: 0 }}>
                {expanded ? (
                    <ExpandLessIcon sx={{ color: "#333", fontSize: 20 }} />
                ) : (
                    <ExpandMoreIcon sx={{ color: "#333", fontSize: 20 }} />
                )}
            </IconButton>
        </Box>
        <Collapse in={expanded}>
            <Box sx={{ p: 2, backgroundColor: "#fff" }}>
                {children}
            </Box>
        </Collapse>
    </Paper>
);

// Document Upload Box Component
const DocumentUploadBox = ({ label }) => (
    <Box sx={{ textAlign: "center" }}>
        <Box
            sx={{
                width: 90,
                height: 80,
                border: "2px dashed #90CAF9",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backgroundColor: "#FAFAFA",
                mx: "auto",
                mb: 0.5,
                "&:hover": {
                    backgroundColor: "#F5F5F5",
                    borderColor: "#64B5F6"
                }
            }}
        >
            <UploadFileIcon sx={{ color: "#1976D2", fontSize: 24, mb: 0.3 }} />
            <Typography fontSize={8} textAlign="center" color="#666" px={0.5} lineHeight={1.2}>
                Drag and Drop files here or Choose file
            </Typography>
        </Box>
        <Typography color="#ff0000" fontSize={10} fontWeight={600}>
            {label}
        </Typography>
        <Typography
            color="#4CAF50"
            fontSize={10}
            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
        >
            View Document
        </Typography>
    </Box>
);

// Branding Image Upload Box with Radio
const BrandingImageUploadBoxWithRadio = ({ side, label, value, onChange }) => (
    <Box sx={{ textAlign: "center" }}>
        {/* Side label with radio buttons */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
            <Typography fontSize="10px">{side} :</Typography>
            <RadioGroup row value={value} onChange={onChange}>
                <FormControlLabel value="Yes" control={<Radio size="small" sx={{ p: 0.4 }} />} label={<Typography fontSize="10px">Yes</Typography>} sx={{ mr: 1.5 }} />
                <FormControlLabel value="No" control={<Radio size="small" sx={{ p: 0.4 }} />} label={<Typography fontSize="10px">No</Typography>} />
            </RadioGroup>
        </Box>
        {/* Upload Box */}
        <Box
            sx={{
                width: 80,
                height: 70,
                border: "2px dashed #90CAF9",
                borderRadius: "6px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backgroundColor: "#FAFAFA",
                mx: "auto",
                mb: 0.5,
                "&:hover": {
                    backgroundColor: "#F5F5F5",
                    borderColor: "#64B5F6"
                }
            }}
        >
            <UploadFileIcon sx={{ color: "#1976D2", fontSize: 22 }} />
            <Typography fontSize={7} textAlign="center" color="#666" lineHeight={1.2} px={0.5}>
                Drag and Drop files here or Choose file
            </Typography>
        </Box>
        <Typography color="#ff0000" fontSize={10} fontWeight={600}>
            {label}
        </Typography>
        <Typography
            color="#4CAF50"
            fontSize={10}
            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
        >
            View Photo
        </Typography>
    </Box>
);

// Action Buttons Component
const ActionButtons = ({ onClear, onSave }) => (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button
            variant="text"
            onClick={onClear}
            sx={{
                color: "#000",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "12px"
            }}
        >
            Clear
        </Button>
        <Button
            variant="contained"
            onClick={onSave}
            sx={{
                backgroundColor: "#FBBF24",
                color: "#000",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "20px",
                px: 3,
                fontSize: "12px",
                "&:hover": { backgroundColor: "#F59E0B" }
            }}
        >
            Save
        </Button>
    </Box>
);

export default function VehicleSafetyCompliancePage() {
    const navigate = useNavigate();

    // Expandable sections state
    const [expandedSections, setExpandedSections] = useState({
        fcDetails: true,
        permitDetail: true,
        pucDetail: true,
        roadTax: true,
        cctvCamera: true,
        busBranding: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // FC Details State
    const [fcType, setFcType] = useState("");
    const [fcNumber, setFcNumber] = useState("");
    const [fcIssueDate, setFcIssueDate] = useState("");
    const [fcExpiryDate, setFcExpiryDate] = useState("");
    const [fcValidityDuration, setFcValidityDuration] = useState("");
    const [fcLastValidDate, setFcLastValidDate] = useState("");
    const [fcRenewalReminder, setFcRenewalReminder] = useState("30 days before Expiry");
    const [fcCurrentStatus, setFcCurrentStatus] = useState("");
    const [fcNotesAboutInspection, setFcNotesAboutInspection] = useState("");

    // Permit Detail State
    const [permitNumber, setPermitNumber] = useState("");
    const [permitType, setPermitType] = useState("");
    const [issuingRto, setIssuingRto] = useState("");
    const [permitValidDateFrom, setPermitValidDateFrom] = useState("");
    const [permitValidTill, setPermitValidTill] = useState("");
    const [permitValidityDuration, setPermitValidityDuration] = useState("");
    const [permitAreaOfOperation, setPermitAreaOfOperation] = useState("");
    const [permitRoute, setPermitRoute] = useState("");

    // PUC Detail State
    const [pucCertificateNumber, setPucCertificateNumber] = useState("");
    const [pucIssueDate, setPucIssueDate] = useState("");
    const [pucExpiryDate, setPucExpiryDate] = useState("");
    const [pucValidityStatus, setPucValidityStatus] = useState("");

    // State Road Transport Tax State
    const [taxType, setTaxType] = useState("");
    const [taxPaidDate, setTaxPaidDate] = useState("");
    const [taxExpiryDate, setTaxExpiryDate] = useState("");
    const [taxStatus, setTaxStatus] = useState("");
    const [taxReceiptNumber, setTaxReceiptNumber] = useState("");

    // CCTV Camera Installation State
    const [cctvInstalled, setCctvInstalled] = useState("Yes");
    const [numberOfCameras, setNumberOfCameras] = useState("");
    const [cctvDealerInstallerSame, setCctvDealerInstallerSame] = useState("Yes");

    // Camera 1 Details
    const [camera1DateOfInstallation, setCamera1DateOfInstallation] = useState("");
    const [camera1DealerInstallerName, setCamera1DealerInstallerName] = useState("");
    const [camera1Type, setCamera1Type] = useState("");
    const [camera1DealerInstallerName2, setCamera1DealerInstallerName2] = useState("");
    const [camera1VendorContactDetails, setCamera1VendorContactDetails] = useState("");
    const [camera1Remarks, setCamera1Remarks] = useState("");

    // First Aid Kit Installation
    const [firstAidKitInstallation, setFirstAidKitInstallation] = useState("Yes");
    const [firstAidDateOfInstallation, setFirstAidDateOfInstallation] = useState("");
    const [firstAidExpiryCheckDueDate, setFirstAidExpiryCheckDueDate] = useState("");
    const [firstAidLastInspectionDate, setFirstAidLastInspectionDate] = useState("");
    const [firstAidRemarks, setFirstAidRemarks] = useState("");

    // Safety Grills & Exit Doors
    const [safetyGrillsInstallation, setSafetyGrillsInstallation] = useState("Yes");
    const [safetyGrillsInstalled, setSafetyGrillsInstalled] = useState("Yes");
    const [grillLocation, setGrillLocation] = useState("");
    const [emergencyExitAvailable, setEmergencyExitAvailable] = useState("Yes");
    const [emergencyExitLocation, setEmergencyExitLocation] = useState("");
    const [complianceAsPerNorms, setComplianceAsPerNorms] = useState("Yes");
    const [safetyInstallationInspectionDate, setSafetyInstallationInspectionDate] = useState("");
    const [safetyRemarks, setSafetyRemarks] = useState("");

    // Speed Governor Installation
    const [speedGovernorInstallation, setSpeedGovernorInstallation] = useState("Yes");
    const [speedGovernorDateOfInstallation, setSpeedGovernorDateOfInstallation] = useState("");
    const [speedGovernorVendorName, setSpeedGovernorVendorName] = useState("");
    const [speedLimitSet, setSpeedLimitSet] = useState("");
    const [speedGovernorCertificateNumber, setSpeedGovernorCertificateNumber] = useState("");
    const [speedGovernorValidityDate, setSpeedGovernorValidityDate] = useState("");
    const [speedGovernorRemarks, setSpeedGovernorRemarks] = useState("");

    // Fire Extinguisher Installation
    const [fireExtinguisherInstallation, setFireExtinguisherInstallation] = useState("Yes");
    const [fireExtinguisherDateOfInstallation, setFireExtinguisherDateOfInstallation] = useState("");
    const [fireExtinguisherExpiryDate, setFireExtinguisherExpiryDate] = useState("");
    const [extinguisherTypeCapacity, setExtinguisherTypeCapacity] = useState("");
    const [fireExtinguisherVendorDetails, setFireExtinguisherVendorDetails] = useState("");
    const [fireExtinguisherRemarks, setFireExtinguisherRemarks] = useState("");

    // GPS Tracker Installation
    const [gpsTrackerInstallation, setGpsTrackerInstallation] = useState("Yes");
    const [gpsDateOfInstallation, setGpsDateOfInstallation] = useState("");
    const [gpsDeviceIdImei, setGpsDeviceIdImei] = useState("");
    const [gpsHardwareWarranty, setGpsHardwareWarranty] = useState("");
    const [gpsOwnerNameAddress, setGpsOwnerNameAddress] = useState("");
    const [gpsSimNumber, setGpsSimNumber] = useState("");
    const [gpsSubscriptionValidTill, setGpsSubscriptionValidTill] = useState("");
    const [gpsRemarks, setGpsRemarks] = useState("");

    // Bus Branding & Visual Identity - School Name Display
    const [schoolNameFrontSide, setSchoolNameFrontSide] = useState("Yes");
    const [schoolNameBackSide, setSchoolNameBackSide] = useState("Yes");
    const [schoolNameLeftSide, setSchoolNameLeftSide] = useState("Yes");
    const [schoolNameRightSide, setSchoolNameRightSide] = useState("Yes");

    // Bus Branding - Internal Name & Photo Display
    const [internalNameFrontSide, setInternalNameFrontSide] = useState("Yes");
    const [internalNameBackSide, setInternalNameBackSide] = useState("Yes");
    const [internalNameLeftSide, setInternalNameLeftSide] = useState("Yes");
    const [internalNameRightSide, setInternalNameRightSide] = useState("Yes");

    // Bus Branding - Reflective Tapes Display
    const [reflectiveTapesFrontSide, setReflectiveTapesFrontSide] = useState("Yes");
    const [reflectiveTapesBackSide, setReflectiveTapesBackSide] = useState("Yes");
    const [reflectiveTapesLeftSide, setReflectiveTapesLeftSide] = useState("Yes");
    const [reflectiveTapesRightSide, setReflectiveTapesRightSide] = useState("Yes");

    // Bus Branding - Signage Display
    const [signageFrontSide, setSignageFrontSide] = useState("Yes");
    const [signageBackSide, setSignageBackSide] = useState("Yes");
    const [signageLeftSide, setSignageLeftSide] = useState("Yes");
    const [signageRightSide, setSignageRightSide] = useState("Yes");

    return (
        <Box sx={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
            {/* Header */}
            <Box sx={{
                backgroundColor: "#fff",
                px: 2,
                py: 1.5,
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center"
            }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, p: 0.5 }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                </IconButton>
                <Typography fontWeight={600} fontSize="15px">
                    Vehicle Safety & Compliance Installation detail
                </Typography>
            </Box>

            <Box sx={{ p: 2 }}>
                {/* ==================== FC Details Section ==================== */}
                <ExpandableSection
                    title="FC Details"
                    expanded={expandedSections.fcDetails}
                    onToggle={() => toggleSection('fcDetails')}
                >
                    <Grid container spacing={2}>
                        {/* Row 1: FC Type | FC Number | FC Issue Date | FC Expiry Date | FC Validity Duration */}
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>FC Type</InputLabel>
                            <Select fullWidth sx={selectSx} value={fcType} onChange={(e) => setFcType(e.target.value)} displayEmpty>
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value="Initial">Initial</MenuItem>
                                <MenuItem value="Renewal">Renewal</MenuItem>
                                <MenuItem value="Reinspection">Reinspection</MenuItem>
                                <MenuItem value="Conditional">Conditional</MenuItem>
                            </Select>
                            {/* <Typography fontSize="10px" color="#666" sx={{ mt: 0.5 }}>Initial / Renewal / Reinspection / Conditional</Typography> */}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>FC Number</InputLabel>
                            <TextField fullWidth sx={inputSx} value={fcNumber} onChange={(e) => setFcNumber(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>FC Issue Date</InputLabel>
                            <TextField fullWidth sx={inputSx} type="date" value={fcIssueDate} onChange={(e) => setFcIssueDate(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>FC Expiry Date</InputLabel>
                            <TextField fullWidth sx={inputSx} type="date" value={fcExpiryDate} onChange={(e) => setFcExpiryDate(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>FC Validity Duration (Auto Calculated)</InputLabel>
                            <TextField fullWidth sx={inputSx} value={fcValidityDuration} onChange={(e) => setFcValidityDuration(e.target.value)} />
                        </Grid>

                        {/* Row 2: Last Valid date | Renewal Reminder | Current FC Status | Notes about Inspection */}
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Last Valid date  (Auto Calculated)</InputLabel>
                            <TextField fullWidth sx={inputSx} value={fcLastValidDate} onChange={(e) => setFcLastValidDate(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Renewal Reminder</InputLabel>
                            <Select fullWidth sx={selectSx} value={fcRenewalReminder} onChange={(e) => setFcRenewalReminder(e.target.value)}>
                                <MenuItem value="30 days before Expiry">30 days before Expiry</MenuItem>
                                <MenuItem value="15 days before Expiry">15 days before Expiry</MenuItem>
                                <MenuItem value="7 days before Expiry">7 days before Expiry</MenuItem>
                                <MenuItem value="60 days before Expiry">60 days before Expiry</MenuItem>
                            </Select>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Current FC Satus</InputLabel>
                            <TextField fullWidth sx={inputSx} value={fcCurrentStatus} onChange={(e) => setFcCurrentStatus(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4.8 }}>
                            <InputLabel sx={labelSx}>Notes about Inspection :</InputLabel>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "8px",
                                        fontSize: "13px",
                                        backgroundColor: "#fff",
                                    }
                                }}
                                value={fcNotesAboutInspection}
                                onChange={(e) => setFcNotesAboutInspection(e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <ActionButtons onClear={() => { }} onSave={() => { }} />
                </ExpandableSection>

                {/* ==================== Permit Detail Section ==================== */}
                <ExpandableSection
                    title="Permit Detail"
                    expanded={expandedSections.permitDetail}
                    onToggle={() => toggleSection('permitDetail')}
                >
                    <Grid container spacing={2}>
                        {/* Row 1: Permit Number | Permit Type | Issuing RTO | Valid Date From | Valid Till */}
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Permit Number</InputLabel>
                            <TextField fullWidth sx={inputSx} value={permitNumber} onChange={(e) => setPermitNumber(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Permit Type</InputLabel>
                            <Select fullWidth sx={selectSx} value={permitType} onChange={(e) => setPermitType(e.target.value)} displayEmpty>
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value="Contract Carriage">Contract Carriage</MenuItem>
                                <MenuItem value="Stage Carriage">Stage Carriage</MenuItem>
                                <MenuItem value="Private Service">Private Service</MenuItem>
                                <MenuItem value="All India Tourist">All India Tourist</MenuItem>
                            </Select>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Issuing RTO</InputLabel>
                            <TextField fullWidth sx={inputSx} value={issuingRto} onChange={(e) => setIssuingRto(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Valid Date From</InputLabel>
                            <TextField fullWidth sx={inputSx} type="date" value={permitValidDateFrom} onChange={(e) => setPermitValidDateFrom(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Valid Till</InputLabel>
                            <TextField fullWidth sx={inputSx} type="date" value={permitValidTill} onChange={(e) => setPermitValidTill(e.target.value)} />
                        </Grid>

                        {/* Row 2: Permit Validity Duration | Permit Area of Operation | Permit Route */}
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Permit Validity Duration (Auto Calculated)</InputLabel>
                            <TextField fullWidth sx={inputSx} value={permitValidityDuration} onChange={(e) => setPermitValidityDuration(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Permit Area of Operation</InputLabel>
                            <Select fullWidth sx={selectSx} value={permitAreaOfOperation} onChange={(e) => setPermitAreaOfOperation(e.target.value)} displayEmpty>
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value="District">District</MenuItem>
                                <MenuItem value="State">State</MenuItem>
                            </Select>
                            {/* <Typography fontSize="10px" color="#666" sx={{ mt: 0.5 }}>(District /State)</Typography> */}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Permit Route(Optional)</InputLabel>
                            <TextField fullWidth sx={inputSx} value={permitRoute} onChange={(e) => setPermitRoute(e.target.value)} />
                        </Grid>
                    </Grid>

                    <ActionButtons onClear={() => { }} onSave={() => { }} />
                </ExpandableSection>

                {/* ==================== Pollution Under Control (PUC) Detail Section ==================== */}
                <ExpandableSection
                    title="Pollution Under Control (PUC) Detail :"
                    expanded={expandedSections.pucDetail}
                    onToggle={() => toggleSection('pucDetail')}
                >
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>PUC Certificate number</InputLabel>
                            <TextField fullWidth sx={inputSx} value={pucCertificateNumber} onChange={(e) => setPucCertificateNumber(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>PUC Issue Date</InputLabel>
                            <TextField fullWidth sx={inputSx} type="date" value={pucIssueDate} onChange={(e) => setPucIssueDate(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Expiry Date</InputLabel>
                            <TextField fullWidth sx={inputSx} type="date" value={pucExpiryDate} onChange={(e) => setPucExpiryDate(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>PUC Validity (Auto Calculate)</InputLabel>
                            <TextField fullWidth sx={inputSx} value={pucValidityStatus} onChange={(e) => setPucValidityStatus(e.target.value)} />
                        </Grid>
                    </Grid>

                    <ActionButtons onClear={() => { }} onSave={() => { }} />
                </ExpandableSection>

                {/* ==================== State Road Transport Tax Section ==================== */}
                <ExpandableSection
                    title="State Road Transport Tax :"
                    expanded={expandedSections.roadTax}
                    onToggle={() => toggleSection('roadTax')}
                >
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Tax Type</InputLabel>
                            <Select fullWidth sx={selectSx} value={taxType} onChange={(e) => setTaxType(e.target.value)} displayEmpty>
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value="Quarterly">Quarterly</MenuItem>
                                <MenuItem value="Annually">Annually</MenuItem>
                                <MenuItem value="Life Time">Life Time</MenuItem>
                            </Select>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Tax paid Date</InputLabel>
                            <TextField fullWidth sx={inputSx} type="date" value={taxPaidDate} onChange={(e) => setTaxPaidDate(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Valid date</InputLabel>
                            <TextField fullWidth sx={inputSx} type="date" value={taxExpiryDate} onChange={(e) => setTaxExpiryDate(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Tax Validity Period (Auto Calculate) </InputLabel>
                            <TextField fullWidth sx={inputSx} value={taxStatus} onChange={(e) => setTaxStatus(e.target.value)} />
                        </Grid>
                    </Grid>

                    <ActionButtons onClear={() => { }} onSave={() => { }} />
                </ExpandableSection>

                {/* ==================== CCTV Camera Installation Detail Section ==================== */}
                <ExpandableSection
                    title="CCTV Camera Installation Detail"
                    expanded={expandedSections.cctvCamera}
                    onToggle={() => toggleSection('cctvCamera')}
                >
                    {/* CCTV Header Row */}
                    <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Typography fontSize="11px" fontWeight={600} sx={{ whiteSpace: "nowrap" }}>CCTV Camera Installation :</Typography>
                                <RadioGroup row value={cctvInstalled} onChange={(e) => setCctvInstalled(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="11px">Yes</Typography>} sx={{ mr: 2 }} />
                                    <FormControlLabel value="No" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="11px">No</Typography>} />
                                </RadioGroup>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography fontSize="11px" fontWeight={600} sx={{ whiteSpace: "nowrap" }}>Number of CCTV Cameras Installed</Typography>
                                <TextField sx={{ ...inputSx, width: 60, "& .MuiOutlinedInput-root": { height: 32 } }} value={numberOfCameras} onChange={(e) => setNumberOfCameras(e.target.value)} />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                                <Typography fontSize="11px" fontWeight={600} color="#ff0000" sx={{ whiteSpace: "nowrap" }}>
                                    Is the CCTV dealer and installer the same ?
                                </Typography>
                                <RadioGroup row value={cctvDealerInstallerSame} onChange={(e) => setCctvDealerInstallerSame(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="11px">Yes</Typography>} sx={{ mr: 2 }} />
                                    <FormControlLabel value="No" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="11px">No</Typography>} />
                                </RadioGroup>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Camera 1 Details Title */}
                    <Typography fontSize="12px" fontWeight={600} sx={{ mb: 2, color: "#333" }}>
                        CCTV Camera 1 Details :
                    </Typography>

                    <Grid container spacing={3}>
                        {/* Left Column - CCTV Camera Details */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ border: "1px solid #eee", borderRadius: "8px", p: 2 }}>
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 6 }}>
                                        <InputLabel sx={labelSx}>Date of Installation</InputLabel>
                                        <TextField fullWidth sx={inputSx} type="date" value={camera1DateOfInstallation} onChange={(e) => setCamera1DateOfInstallation(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <InputLabel sx={labelSx}>CCTV Dealer or Installer  Name</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={camera1DealerInstallerName} onChange={(e) => setCamera1DealerInstallerName(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <InputLabel sx={labelSx}>CCTV Camera type</InputLabel>
                                        <Select fullWidth sx={selectSx} value={camera1Type} onChange={(e) => setCamera1Type(e.target.value)} displayEmpty>
                                            <MenuItem value="">Front/Rear/Both</MenuItem>
                                            <MenuItem value="Front">Front</MenuItem>
                                            <MenuItem value="Rear">Rear</MenuItem>
                                            <MenuItem value="Both">Both</MenuItem>
                                        </Select>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <InputLabel sx={labelSx}>CCTV Dealer or Installer Name</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={camera1DealerInstallerName2} onChange={(e) => setCamera1DealerInstallerName2(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Vendor Contact Details</InputLabel>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: "8px",
                                                    fontSize: "13px",
                                                    backgroundColor: "#fff",
                                                }
                                            }}
                                            value={camera1VendorContactDetails}
                                            onChange={(e) => setCamera1VendorContactDetails(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Remarks</InputLabel>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: "8px",
                                                    fontSize: "13px",
                                                    backgroundColor: "#fff",
                                                }
                                            }}
                                            value={camera1Remarks}
                                            onChange={(e) => setCamera1Remarks(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>

                        {/* Middle Column - First Aid Kit Installation */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ border: "1px solid #eee", borderRadius: "8px", p: 2, height: "100%" }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                    <Typography fontSize="12px" fontWeight={600}>First Aid Kit Installation</Typography>
                                    <RadioGroup row value={firstAidKitInstallation} onChange={(e) => setFirstAidKitInstallation(e.target.value)}>
                                        <FormControlLabel value="Yes" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="11px">Yes</Typography>} sx={{ mr: 2 }} />
                                        <FormControlLabel value="No" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="11px">No</Typography>} />
                                    </RadioGroup>
                                </Box>
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Date of Installation</InputLabel>
                                        <TextField fullWidth sx={inputSx} type="date" value={firstAidDateOfInstallation} onChange={(e) => setFirstAidDateOfInstallation(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Expiry Check Due Date</InputLabel>
                                        <TextField fullWidth sx={inputSx} type="date" value={firstAidExpiryCheckDueDate} onChange={(e) => setFirstAidExpiryCheckDueDate(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Last Inspection Date</InputLabel>
                                        <TextField fullWidth sx={inputSx} type="date" value={firstAidLastInspectionDate} onChange={(e) => setFirstAidLastInspectionDate(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Remarks</InputLabel>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: "8px",
                                                    fontSize: "13px",
                                                    backgroundColor: "#fff",
                                                }
                                            }}
                                            value={firstAidRemarks}
                                            onChange={(e) => setFirstAidRemarks(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>

                        {/* Right Column - Safety Grills & Exit Doors */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ border: "1px solid #eee", borderRadius: "8px", p: 2, height: "100%" }}>
                                {/* Header */}
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                    <Typography fontSize="12px" fontWeight={600}>Safety grills & Exit doors Installation</Typography>
                                    <RadioGroup row value={safetyGrillsInstallation} onChange={(e) => setSafetyGrillsInstallation(e.target.value)}>
                                        <FormControlLabel value="Yes" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="10px">Yes</Typography>} sx={{ mr: 1.5 }} />
                                        <FormControlLabel value="No" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="10px">No</Typography>} />
                                    </RadioGroup>
                                </Box>

                                {/* Safety Grills Installed */}
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <InputLabel sx={{ ...labelSx, mb: 0 }}>Safety Grills Installed :</InputLabel>
                                        <RadioGroup row value={safetyGrillsInstalled} onChange={(e) => setSafetyGrillsInstalled(e.target.value)}>
                                            <FormControlLabel value="Yes" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="10px">Yes</Typography>} sx={{ mr: 1.5 }} />
                                            <FormControlLabel value="No" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="10px">NO</Typography>} />
                                        </RadioGroup>
                                    </Box>
                                </Box>

                                {/* Grill Location */}
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                        <InputLabel sx={{ ...labelSx, mb: 0 }}>Grill Location :</InputLabel>
                                        <Typography fontSize="10px" color="#666">(Windows / Rear / Both)</Typography>
                                    </Box>
                                    <TextField fullWidth sx={inputSx} value={grillLocation} onChange={(e) => setGrillLocation(e.target.value)} />
                                </Box>

                                {/* Emergency Exit Available */}
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <InputLabel sx={{ ...labelSx, mb: 0 }}>Emergency Exit Available :</InputLabel>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <RadioGroup row value={emergencyExitAvailable} onChange={(e) => setEmergencyExitAvailable(e.target.value)}>
                                                <FormControlLabel value="Yes" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="10px">Yes</Typography>} sx={{ mr: 1.5 }} />
                                                <FormControlLabel value="No" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="10px">NO</Typography>} />
                                            </RadioGroup>
                                            <Typography fontSize="10px" color="#666">(Rear / Side)</Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Emergency Exit Location */}
                                <Box sx={{ mb: 2 }}>
                                    <InputLabel sx={labelSx}>Emergency Exit Location</InputLabel>
                                    <TextField fullWidth sx={inputSx} value={emergencyExitLocation} onChange={(e) => setEmergencyExitLocation(e.target.value)} />
                                </Box>

                                {/* Compliance as per Norms */}
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <InputLabel sx={{ ...labelSx, mb: 0 }}>Compliance as per Norms :</InputLabel>
                                        <RadioGroup row value={complianceAsPerNorms} onChange={(e) => setComplianceAsPerNorms(e.target.value)}>
                                            <FormControlLabel value="Yes" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="10px">Yes</Typography>} sx={{ mr: 1.5 }} />
                                            <FormControlLabel value="No" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="10px">NO</Typography>} />
                                        </RadioGroup>
                                    </Box>
                                </Box>

                                {/* Installation Inspection Date */}
                                <Box sx={{ mb: 2 }}>
                                    <InputLabel sx={labelSx}>Installation Inspection Date</InputLabel>
                                    <TextField fullWidth sx={inputSx} type="date" value={safetyInstallationInspectionDate} onChange={(e) => setSafetyInstallationInspectionDate(e.target.value)} />
                                </Box>

                                {/* Remarks */}
                                <Box>
                                    <InputLabel sx={labelSx}>Remarks :</InputLabel>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "8px",
                                                fontSize: "13px",
                                                backgroundColor: "#fff",
                                            }
                                        }}
                                        value={safetyRemarks}
                                        onChange={(e) => setSafetyRemarks(e.target.value)}
                                    />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </ExpandableSection>

                {/* ==================== Speed Governor, Fire Extinguisher, GPS Tracker - Side by Side ==================== */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {/* Speed Governor Installation */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ borderRadius: "8px", overflow: "hidden", height: "100%", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                            <Box sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                    <Typography fontSize="12px" fontWeight={600}>Speed Governor Installation</Typography>
                                    <RadioGroup row value={speedGovernorInstallation} onChange={(e) => setSpeedGovernorInstallation(e.target.value)}>
                                        <FormControlLabel value="Yes" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="11px">Yes</Typography>} sx={{ mr: 2 }} />
                                        <FormControlLabel value="No" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="11px">No</Typography>} />
                                    </RadioGroup>
                                </Box>
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Date of Installation</InputLabel>
                                        <TextField fullWidth sx={inputSx} type="date" value={speedGovernorDateOfInstallation} onChange={(e) => setSpeedGovernorDateOfInstallation(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Vendor / Authorised Fitter Name</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={speedGovernorVendorName} onChange={(e) => setSpeedGovernorVendorName(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <InputLabel sx={labelSx}>Speed Limit Set (Kmph)</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={speedLimitSet} onChange={(e) => setSpeedLimitSet(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <InputLabel sx={labelSx}>Certificate / Approval Number</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={speedGovernorCertificateNumber} onChange={(e) => setSpeedGovernorCertificateNumber(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Validity / Calibration Due Date</InputLabel>
                                        <TextField fullWidth sx={inputSx} type="date" value={speedGovernorValidityDate} onChange={(e) => setSpeedGovernorValidityDate(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Remarks</InputLabel>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: "8px",
                                                    fontSize: "13px",
                                                    backgroundColor: "#fff",
                                                }
                                            }}
                                            value={speedGovernorRemarks}
                                            onChange={(e) => setSpeedGovernorRemarks(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Fire Extinguisher Installation */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ borderRadius: "8px", overflow: "hidden", height: "100%", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                            <Box sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                    <Typography fontSize="12px" fontWeight={600}>Fire extinguisher Installation</Typography>
                                    <RadioGroup row value={fireExtinguisherInstallation} onChange={(e) => setFireExtinguisherInstallation(e.target.value)}>
                                        <FormControlLabel value="Yes" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography fontSize="11px">Yes</Typography>} sx={{ mr: 2 }} />
                                        <FormControlLabel value="No" control={<Radio size="small" sx={{ p: 0.3 }} />} label={<Typography fontSize="11px">No</Typography>} />
                                    </RadioGroup>
                                </Box>
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 6 }}>
                                        <InputLabel sx={labelSx}>Date of Installation :</InputLabel>
                                        <TextField fullWidth sx={inputSx} type="date" value={fireExtinguisherDateOfInstallation} onChange={(e) => setFireExtinguisherDateOfInstallation(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <InputLabel sx={labelSx}>Expiry or Refill Due Date</InputLabel>
                                        <TextField fullWidth sx={inputSx} type="date" value={fireExtinguisherExpiryDate} onChange={(e) => setFireExtinguisherExpiryDate(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Extinguisher Type & Capacity Kg.</InputLabel>
                                        <TextField fullWidth sx={inputSx} placeholder="(ABC / CO2)" value={extinguisherTypeCapacity} onChange={(e) => setExtinguisherTypeCapacity(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Vendor Details</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={fireExtinguisherVendorDetails} onChange={(e) => setFireExtinguisherVendorDetails(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Remarks</InputLabel>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: "8px",
                                                    fontSize: "13px",
                                                    backgroundColor: "#fff",
                                                }
                                            }}
                                            value={fireExtinguisherRemarks}
                                            onChange={(e) => setFireExtinguisherRemarks(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* GPS Tracker Installation */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ borderRadius: "8px", overflow: "hidden", height: "100%", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                            <Box sx={{ p: 2 }}>
                                <Typography fontSize="12px" fontWeight={600} sx={{ mb: 2 }}>GPS Tracker Installation</Typography>
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Date of Installation</InputLabel>
                                        <TextField fullWidth sx={inputSx} type="date" value={gpsDateOfInstallation} onChange={(e) => setGpsDateOfInstallation(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <InputLabel sx={labelSx}>GPS ID / IMEI</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={gpsDeviceIdImei} onChange={(e) => setGpsDeviceIdImei(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <InputLabel sx={labelSx}>GPS Hardware warranty</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={gpsHardwareWarranty} onChange={(e) => setGpsHardwareWarranty(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>GPS Owner Name & Address</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={gpsOwnerNameAddress} onChange={(e) => setGpsOwnerNameAddress(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <InputLabel sx={labelSx}>SIM Number (masked)</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={gpsSimNumber} onChange={(e) => setGpsSimNumber(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <InputLabel sx={labelSx}>Subscription valid till</InputLabel>
                                        <TextField fullWidth sx={inputSx} type="date" value={gpsSubscriptionValidTill} onChange={(e) => setGpsSubscriptionValidTill(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel sx={labelSx}>Remarks</InputLabel>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: "8px",
                                                    fontSize: "13px",
                                                    backgroundColor: "#fff",
                                                }
                                            }}
                                            value={gpsRemarks}
                                            onChange={(e) => setGpsRemarks(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* ==================== Bus Branding & Visual Identity Section ==================== */}
                <ExpandableSection
                    title="Bus Branding & Visual Identity :"
                    expanded={expandedSections.busBranding}
                    onToggle={() => toggleSection('busBranding')}
                >
                    {/* School Name Display */}
                    <Box sx={{ mb: 4 }}>
                        <Typography fontSize="12px" fontWeight={600} sx={{ mb: 2 }}>School Name Display</Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Front side"
                                    label="Bus photographs (Front Side)"
                                    value={schoolNameFrontSide}
                                    onChange={(e) => setSchoolNameFrontSide(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Back side"
                                    label="Bus photographs (Back Side)"
                                    value={schoolNameBackSide}
                                    onChange={(e) => setSchoolNameBackSide(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Left side"
                                    label="Bus photographs (Left side)"
                                    value={schoolNameLeftSide}
                                    onChange={(e) => setSchoolNameLeftSide(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Right side"
                                    label="Bus photographs (Right side)"
                                    value={schoolNameRightSide}
                                    onChange={(e) => setSchoolNameRightSide(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* School Bus Internal Name & Photo Display */}
                    <Box sx={{ mb: 4 }}>
                        <Typography fontSize="12px" fontWeight={600} sx={{ mb: 2 }}>School Bus Internal Name & Photo Display</Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Front side"
                                    label="Bus photographs (Front Side)"
                                    value={internalNameFrontSide}
                                    onChange={(e) => setInternalNameFrontSide(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Back side"
                                    label="Bus photographs (Back Side)"
                                    value={internalNameBackSide}
                                    onChange={(e) => setInternalNameBackSide(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Left side"
                                    label="Bus photographs (Left side)"
                                    value={internalNameLeftSide}
                                    onChange={(e) => setInternalNameLeftSide(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Right side"
                                    label="Bus photographs (Right side)"
                                    value={internalNameRightSide}
                                    onChange={(e) => setInternalNameRightSide(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Reflective Tapes Display */}
                    <Box sx={{ mb: 4 }}>
                        <Typography fontSize="12px" fontWeight={600} sx={{ mb: 2 }}>Reflective Tapes Display</Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Front side"
                                    label="Bus photographs (Front Side)"
                                    value={reflectiveTapesFrontSide}
                                    onChange={(e) => setReflectiveTapesFrontSide(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Back side"
                                    label="Bus photographs (Back Side)"
                                    value={reflectiveTapesBackSide}
                                    onChange={(e) => setReflectiveTapesBackSide(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Left side"
                                    label="Bus photographs (Left side)"
                                    value={reflectiveTapesLeftSide}
                                    onChange={(e) => setReflectiveTapesLeftSide(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Right side"
                                    label="Bus photographs (Right side)"
                                    value={reflectiveTapesRightSide}
                                    onChange={(e) => setReflectiveTapesRightSide(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* School Bus Signage display */}
                    <Box sx={{ mb: 2 }}>
                        <Typography fontSize="12px" fontWeight={600} sx={{ mb: 2 }}>School bus Signage display</Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Front side"
                                    label="Bus photographs (Front Side)"
                                    value={signageFrontSide}
                                    onChange={(e) => setSignageFrontSide(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Back side"
                                    label="Bus photographs (Back Side)"
                                    value={signageBackSide}
                                    onChange={(e) => setSignageBackSide(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Left side"
                                    label="Bus photographs (Left side)"
                                    value={signageLeftSide}
                                    onChange={(e) => setSignageLeftSide(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Right side"
                                    label="Bus photographs (Right side)"
                                    value={signageRightSide}
                                    onChange={(e) => setSignageRightSide(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </ExpandableSection>

                {/* ==================== Bottom Action Buttons ==================== */}
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3, mb: 2 }}>
                    <Button
                        variant="outlined"
                        sx={{
                            borderRadius: "20px",
                            px: 4,
                            textTransform: "none",
                            borderColor: "#333",
                            color: "#333",
                            fontSize: "13px"
                        }}
                    >
                        Reset All
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#FBBF24",
                            color: "#000",
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "20px",
                            px: 4,
                            fontSize: "13px",
                            "&:hover": { backgroundColor: "#F59E0B" }
                        }}
                    >
                        Generate Vehicle ID
                    </Button>
                </Box>

            </Box>
        </Box>
    );
}
