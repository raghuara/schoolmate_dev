import React, { useState, useEffect, useRef } from "react";
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import axios from "axios";
import SnackBar from "../../../SnackBar";
import {
    postVehicleFCDetail,
    postVehiclePermitDetail,
    postVehiclePUCDetail,
    postVehicleRoadTransportTax,
    postVehicleCctvCameraInstallation,
    postVehicleBusBrandingVisualIdentity,
    findVehicleSafetyComplianceDetails
} from "../../../../Api/Api";

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
    <Paper sx={{borderRadius:"5px",  mb: 2, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <Box
            onClick={onToggle}
            sx={{
                backgroundColor: "#FFF1F1",
                borderTopLeftRadius:"5px",
                borderTopRightRadius:"5px",
                border:"1px solid rgba(0, 0, 0, 0.1)",
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
            <Typography fontWeight={600} fontSize="15px" color="#333">
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
const DocumentUploadBox = ({ label, file, preview, onFileChange, onDrop, inputRef }) => {
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <Box sx={{ textAlign: "center" }}>
            <input
                type="file"
                ref={inputRef}
                onChange={onFileChange}
                accept="image/*,.pdf"
                style={{ display: 'none' }}
            />
            <Box
                onClick={() => inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={handleDragOver}
                sx={{
                    width: 180,
                    height: 150,
                    border: "2px dashed #1976D2",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    backgroundColor: "#E3F2FD",
                    mx: "auto",
                    mb: 0.5,
                    overflow: "hidden",
                    "&:hover": {
                        backgroundColor: "#BBDEFB",
                        borderColor: "#1565C0"
                    }
                }}
            >
                {preview ? (
                    <img src={preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <>
                        <Box sx={{ position: "relative", mb: 1.5 }}>
                            <UploadFileIcon sx={{ color: "#000", fontSize: 48 }} />
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: -4,
                                    right: -8,
                                    backgroundColor: "#1976D2",
                                    borderRadius: "50%",
                                    width: 22,
                                    height: 22,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: "bold", lineHeight: 1 }}>↑</Typography>
                            </Box>
                        </Box>
                        <Typography fontSize={12} textAlign="center" color="#333" fontWeight={500}>
                            Drag and Drop files here
                        </Typography>
                        <Typography fontSize={12} textAlign="center" color="#333">
                            or <span style={{ textDecoration: "underline", fontWeight: 500 }}>Choose file</span>
                        </Typography>
                    </>
                )}
            </Box>
            <Typography color="#ff0000" fontSize={10} fontWeight={600}>
                {label}
            </Typography>
            {preview && (
                <Typography
                    color="#4CAF50"
                    fontSize={10}
                    sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                    onClick={() => window.open(preview, '_blank')}
                >
                    View Document
                </Typography>
            )}
        </Box>
    );
};

// Branding Image Upload Box with Radio
const BrandingImageUploadBoxWithRadio = ({ side, label, value, onChange, file, preview, onFileChange, onDrop, inputRef }) => {
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
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
            <input
                type="file"
                ref={inputRef}
                onChange={onFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
            <Box
                onClick={() => inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={handleDragOver}
                sx={{
                    width: 180,
                    height: 150,
                    border: "2px dashed #1976D2",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    backgroundColor: "#E3F2FD",
                    mx: "auto",
                    mb: 0.5,
                    overflow: "hidden",
                    "&:hover": {
                        backgroundColor: "#BBDEFB",
                        borderColor: "#1565C0"
                    }
                }}
            >
                {preview ? (
                    <img src={preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <>
                        <Box sx={{ position: "relative", mb: 1.5 }}>
                            <UploadFileIcon sx={{ color: "#000", fontSize: 48 }} />
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: -4,
                                    right: -8,
                                    backgroundColor: "#1976D2",
                                    borderRadius: "50%",
                                    width: 22,
                                    height: 22,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: "bold", lineHeight: 1 }}>↑</Typography>
                            </Box>
                        </Box>
                        <Typography fontSize={12} textAlign="center" color="#333" fontWeight={500}>
                            Drag and Drop files here
                        </Typography>
                        <Typography fontSize={12} textAlign="center" color="#333">
                            or <span style={{ textDecoration: "underline", fontWeight: 500 }}>Choose file</span>
                        </Typography>
                    </>
                )}
            </Box>
            <Typography color="#ff0000" fontSize={10} fontWeight={600}>
                {label}
            </Typography>
            {preview && (
                <Typography
                    color="#4CAF50"
                    fontSize={10}
                    sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                    onClick={() => window.open(preview, '_blank')}
                >
                    View Photo
                </Typography>
            )}
        </Box>
    );
};

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

export default function VehicleSafetyCompliancePage({ vehicleAssetId }) {
    const token = "123";
    const [isLoading, setIsLoading] = useState(false);

    // SnackBar state
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

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

    // Helper function to format date to DD-MM-YYYY
    const formatDateToDDMMYYYY = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Validation helper functions
    const isEndDateAfterStartDate = (startDate, endDate) => {
        if (!startDate || !endDate) return true;
        return new Date(endDate) >= new Date(startDate);
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

    // ==================== FILE UPLOAD STATES ====================
    // School Name Display Files
    const [schoolNameFrontFile, setSchoolNameFrontFile] = useState(null);
    const [schoolNameFrontPreview, setSchoolNameFrontPreview] = useState(null);
    const [schoolNameBackFile, setSchoolNameBackFile] = useState(null);
    const [schoolNameBackPreview, setSchoolNameBackPreview] = useState(null);
    const [schoolNameLeftFile, setSchoolNameLeftFile] = useState(null);
    const [schoolNameLeftPreview, setSchoolNameLeftPreview] = useState(null);
    const [schoolNameRightFile, setSchoolNameRightFile] = useState(null);
    const [schoolNameRightPreview, setSchoolNameRightPreview] = useState(null);

    // Internal Name & Photo Display Files
    const [internalNameFrontFile, setInternalNameFrontFile] = useState(null);
    const [internalNameFrontPreview, setInternalNameFrontPreview] = useState(null);
    const [internalNameBackFile, setInternalNameBackFile] = useState(null);
    const [internalNameBackPreview, setInternalNameBackPreview] = useState(null);
    const [internalNameLeftFile, setInternalNameLeftFile] = useState(null);
    const [internalNameLeftPreview, setInternalNameLeftPreview] = useState(null);
    const [internalNameRightFile, setInternalNameRightFile] = useState(null);
    const [internalNameRightPreview, setInternalNameRightPreview] = useState(null);

    // Reflective Tapes Display Files
    const [reflectiveTapesFrontFile, setReflectiveTapesFrontFile] = useState(null);
    const [reflectiveTapesFrontPreview, setReflectiveTapesFrontPreview] = useState(null);
    const [reflectiveTapesBackFile, setReflectiveTapesBackFile] = useState(null);
    const [reflectiveTapesBackPreview, setReflectiveTapesBackPreview] = useState(null);
    const [reflectiveTapesLeftFile, setReflectiveTapesLeftFile] = useState(null);
    const [reflectiveTapesLeftPreview, setReflectiveTapesLeftPreview] = useState(null);
    const [reflectiveTapesRightFile, setReflectiveTapesRightFile] = useState(null);
    const [reflectiveTapesRightPreview, setReflectiveTapesRightPreview] = useState(null);

    // Signage Display Files
    const [signageFrontFile, setSignageFrontFile] = useState(null);
    const [signageFrontPreview, setSignageFrontPreview] = useState(null);
    const [signageBackFile, setSignageBackFile] = useState(null);
    const [signageBackPreview, setSignageBackPreview] = useState(null);
    const [signageLeftFile, setSignageLeftFile] = useState(null);
    const [signageLeftPreview, setSignageLeftPreview] = useState(null);
    const [signageRightFile, setSignageRightFile] = useState(null);
    const [signageRightPreview, setSignageRightPreview] = useState(null);

    // ==================== FILE UPLOAD REFS ====================
    const schoolNameFrontRef = useRef(null);
    const schoolNameBackRef = useRef(null);
    const schoolNameLeftRef = useRef(null);
    const schoolNameRightRef = useRef(null);
    const internalNameFrontRef = useRef(null);
    const internalNameBackRef = useRef(null);
    const internalNameLeftRef = useRef(null);
    const internalNameRightRef = useRef(null);
    const reflectiveTapesFrontRef = useRef(null);
    const reflectiveTapesBackRef = useRef(null);
    const reflectiveTapesLeftRef = useRef(null);
    const reflectiveTapesRightRef = useRef(null);
    const signageFrontRef = useRef(null);
    const signageBackRef = useRef(null);
    const signageLeftRef = useRef(null);
    const signageRightRef = useRef(null);

    // ==================== FILE UPLOAD HANDLERS ====================
    const handleFileChange = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileDrop = (e, setFile, setPreview) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // ==================== CLEAR HANDLERS ====================

    // FC Details Clear
    const handleFCDetailsClear = () => {
        setFcType("");
        setFcNumber("");
        setFcIssueDate("");
        setFcExpiryDate("");
        setFcValidityDuration("");
        setFcLastValidDate("");
        setFcRenewalReminder("30 days before Expiry");
        setFcCurrentStatus("");
        setFcNotesAboutInspection("");
    };

    // Permit Detail Clear
    const handlePermitDetailClear = () => {
        setPermitNumber("");
        setPermitType("");
        setIssuingRto("");
        setPermitValidDateFrom("");
        setPermitValidTill("");
        setPermitValidityDuration("");
        setPermitAreaOfOperation("");
        setPermitRoute("");
    };

    // PUC Detail Clear
    const handlePUCDetailClear = () => {
        setPucCertificateNumber("");
        setPucIssueDate("");
        setPucExpiryDate("");
        setPucValidityStatus("");
    };

    // Road Tax Clear
    const handleRoadTaxClear = () => {
        setTaxType("");
        setTaxPaidDate("");
        setTaxExpiryDate("");
        setTaxStatus("");
    };

    // CCTV Camera Clear
    const handleCCTVCameraClear = () => {
        setCctvInstalled("Yes");
        setNumberOfCameras("");
        setCctvDealerInstallerSame("Yes");
        // Camera 1 Details
        setCamera1DateOfInstallation("");
        setCamera1DealerInstallerName("");
        setCamera1Type("");
        setCamera1DealerInstallerName2("");
        setCamera1VendorContactDetails("");
        setCamera1Remarks("");
        // First Aid Kit
        setFirstAidKitInstallation("Yes");
        setFirstAidDateOfInstallation("");
        setFirstAidExpiryCheckDueDate("");
        setFirstAidLastInspectionDate("");
        setFirstAidRemarks("");
        // Safety Grills
        setSafetyGrillsInstallation("Yes");
        setSafetyGrillsInstalled("Yes");
        setGrillLocation("");
        setEmergencyExitAvailable("Yes");
        setEmergencyExitLocation("");
        setComplianceAsPerNorms("Yes");
        setSafetyInstallationInspectionDate("");
        setSafetyRemarks("");
        // Speed Governor
        setSpeedGovernorInstallation("Yes");
        setSpeedGovernorDateOfInstallation("");
        setSpeedGovernorVendorName("");
        setSpeedLimitSet("");
        setSpeedGovernorCertificateNumber("");
        setSpeedGovernorValidityDate("");
        setSpeedGovernorRemarks("");
        // Fire Extinguisher
        setFireExtinguisherInstallation("Yes");
        setFireExtinguisherDateOfInstallation("");
        setFireExtinguisherExpiryDate("");
        setExtinguisherTypeCapacity("");
        setFireExtinguisherVendorDetails("");
        setFireExtinguisherRemarks("");
        // GPS Tracker
        setGpsTrackerInstallation("Yes");
        setGpsDateOfInstallation("");
        setGpsDeviceIdImei("");
        setGpsHardwareWarranty("");
        setGpsOwnerNameAddress("");
        setGpsSimNumber("");
        setGpsSubscriptionValidTill("");
        setGpsRemarks("");
    };

    // Bus Branding Clear
    const handleBusBrandingClear = () => {
        setSchoolNameFrontSide("Yes");
        setSchoolNameBackSide("Yes");
        setSchoolNameLeftSide("Yes");
        setSchoolNameRightSide("Yes");
        setInternalNameFrontSide("Yes");
        setInternalNameBackSide("Yes");
        setInternalNameLeftSide("Yes");
        setInternalNameRightSide("Yes");
        setReflectiveTapesFrontSide("Yes");
        setReflectiveTapesBackSide("Yes");
        setReflectiveTapesLeftSide("Yes");
        setReflectiveTapesRightSide("Yes");
        setSignageFrontSide("Yes");
        setSignageBackSide("Yes");
        setSignageLeftSide("Yes");
        setSignageRightSide("Yes");
        // Clear file states
        setSchoolNameFrontFile(null);
        setSchoolNameFrontPreview(null);
        setSchoolNameBackFile(null);
        setSchoolNameBackPreview(null);
        setSchoolNameLeftFile(null);
        setSchoolNameLeftPreview(null);
        setSchoolNameRightFile(null);
        setSchoolNameRightPreview(null);
        setInternalNameFrontFile(null);
        setInternalNameFrontPreview(null);
        setInternalNameBackFile(null);
        setInternalNameBackPreview(null);
        setInternalNameLeftFile(null);
        setInternalNameLeftPreview(null);
        setInternalNameRightFile(null);
        setInternalNameRightPreview(null);
        setReflectiveTapesFrontFile(null);
        setReflectiveTapesFrontPreview(null);
        setReflectiveTapesBackFile(null);
        setReflectiveTapesBackPreview(null);
        setReflectiveTapesLeftFile(null);
        setReflectiveTapesLeftPreview(null);
        setReflectiveTapesRightFile(null);
        setReflectiveTapesRightPreview(null);
        setSignageFrontFile(null);
        setSignageFrontPreview(null);
        setSignageBackFile(null);
        setSignageBackPreview(null);
        setSignageLeftFile(null);
        setSignageLeftPreview(null);
        setSignageRightFile(null);
        setSignageRightPreview(null);
    };

    // ==================== SUBMIT HANDLERS ====================

    // FC Details Submit
    const handleFCDetailsSubmit = async () => {
        // Validation
        if (!vehicleAssetId) {
            setMessage("Vehicle Asset ID is required. Please generate or select a vehicle first.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!isEndDateAfterStartDate(fcIssueDate, fcExpiryDate)) {
            setMessage("FC Expiry Date must be after FC Issue Date");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleAssetId,
                FCType: fcType,
                FCNumber: fcNumber,
                FCIssueDate: formatDateToDDMMYYYY(fcIssueDate),
                FCExpiryDate: formatDateToDDMMYYYY(fcExpiryDate),
                FCValidityDuration: fcValidityDuration,
                LastValidDate: formatDateToDDMMYYYY(fcLastValidDate),
                RenewalReminder: fcRenewalReminder,
                CurrentFCStatus: fcCurrentStatus,
                NotesAboutInspection: fcNotesAboutInspection
            };

            await axios.post(postVehicleFCDetail, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("FC Details saved successfully");
        } catch (error) {
            setMessage("An error occurred while saving FC Details.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Permit Detail Submit
    const handlePermitDetailSubmit = async () => {
        // Validation
        if (!vehicleAssetId) {
            setMessage("Vehicle Asset ID is required. Please generate or select a vehicle first.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!isEndDateAfterStartDate(permitValidDateFrom, permitValidTill)) {
            setMessage("Valid Till date must be after Valid Date From");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleAssetId,
                PermitNumber: permitNumber,
                PermitType: permitType,
                IssuingRTO: issuingRto,
                ValidDateFrom: formatDateToDDMMYYYY(permitValidDateFrom),
                ValidTill: formatDateToDDMMYYYY(permitValidTill),
                PermitValidityDuration: permitValidityDuration,
                PermitAreaOfOperation: permitAreaOfOperation,
                PermitRoute: permitRoute
            };

            await axios.post(postVehiclePermitDetail, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Permit Details saved successfully");
        } catch (error) {
            setMessage("An error occurred while saving Permit Details.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // PUC Detail Submit
    const handlePUCDetailSubmit = async () => {
        // Validation
        if (!vehicleAssetId) {
            setMessage("Vehicle Asset ID is required. Please generate or select a vehicle first.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!isEndDateAfterStartDate(pucIssueDate, pucExpiryDate)) {
            setMessage("PUC Expiry Date must be after PUC Issue Date");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleAssetId,
                PUCNumber: pucCertificateNumber,
                PUCIssueDate: formatDateToDDMMYYYY(pucIssueDate),
                PUCExpiryDate: formatDateToDDMMYYYY(pucExpiryDate),
                PUCValidityStatus: pucValidityStatus
            };

            await axios.post(postVehiclePUCDetail, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("PUC Details saved successfully");
        } catch (error) {
            setMessage("An error occurred while saving PUC Details.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Road Tax Submit
    const handleRoadTaxSubmit = async () => {
        // Validation
        if (!vehicleAssetId) {
            setMessage("Vehicle Asset ID is required. Please generate or select a vehicle first.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleAssetId,
                TaxType: taxType,
                TaxPaidDate: formatDateToDDMMYYYY(taxPaidDate),
                TaxValidDate: formatDateToDDMMYYYY(taxExpiryDate),
                TaxStatus: taxStatus
            };

            await axios.post(postVehicleRoadTransportTax, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Road Tax Details saved successfully");
        } catch (error) {
            setMessage("An error occurred while saving Road Tax Details.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // CCTV Camera Submit
    const handleCCTVCameraSubmit = async () => {
        // Validation
        if (!vehicleAssetId) {
            setMessage("Vehicle Asset ID is required. Please generate or select a vehicle first.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleAssetId,
                CCTVInstalled: cctvInstalled,
                NumberOfCameras: numberOfCameras,
                CCTVDealerInstallerSame: cctvDealerInstallerSame,
                // Camera 1 Details
                Camera1DateOfInstallation: formatDateToDDMMYYYY(camera1DateOfInstallation),
                Camera1DealerInstallerName: camera1DealerInstallerName,
                Camera1Type: camera1Type,
                Camera1DealerInstallerName2: camera1DealerInstallerName2,
                Camera1VendorContactDetails: camera1VendorContactDetails,
                Camera1Remarks: camera1Remarks,
                // First Aid Kit
                FirstAidKitInstallation: firstAidKitInstallation,
                FirstAidDateOfInstallation: formatDateToDDMMYYYY(firstAidDateOfInstallation),
                FirstAidExpiryCheckDueDate: formatDateToDDMMYYYY(firstAidExpiryCheckDueDate),
                FirstAidLastInspectionDate: formatDateToDDMMYYYY(firstAidLastInspectionDate),
                FirstAidRemarks: firstAidRemarks,
                // Safety Grills & Exit Doors
                SafetyGrillsInstallation: safetyGrillsInstallation,
                SafetyGrillsInstalled: safetyGrillsInstalled,
                GrillLocation: grillLocation,
                EmergencyExitAvailable: emergencyExitAvailable,
                EmergencyExitLocation: emergencyExitLocation,
                ComplianceAsPerNorms: complianceAsPerNorms,
                SafetyInstallationInspectionDate: formatDateToDDMMYYYY(safetyInstallationInspectionDate),
                SafetyRemarks: safetyRemarks,
                // Speed Governor
                SpeedGovernorInstallation: speedGovernorInstallation,
                SpeedGovernorDateOfInstallation: formatDateToDDMMYYYY(speedGovernorDateOfInstallation),
                SpeedGovernorVendorName: speedGovernorVendorName,
                SpeedLimitSet: speedLimitSet,
                SpeedGovernorCertificateNumber: speedGovernorCertificateNumber,
                SpeedGovernorValidityDate: formatDateToDDMMYYYY(speedGovernorValidityDate),
                SpeedGovernorRemarks: speedGovernorRemarks,
                // Fire Extinguisher
                FireExtinguisherInstallation: fireExtinguisherInstallation,
                FireExtinguisherDateOfInstallation: formatDateToDDMMYYYY(fireExtinguisherDateOfInstallation),
                FireExtinguisherExpiryDate: formatDateToDDMMYYYY(fireExtinguisherExpiryDate),
                ExtinguisherTypeCapacity: extinguisherTypeCapacity,
                FireExtinguisherVendorDetails: fireExtinguisherVendorDetails,
                FireExtinguisherRemarks: fireExtinguisherRemarks,
                // GPS Tracker
                GPSTrackerInstallation: gpsTrackerInstallation,
                GPSDateOfInstallation: formatDateToDDMMYYYY(gpsDateOfInstallation),
                GPSDeviceIdIMEI: gpsDeviceIdImei,
                GPSHardwareWarranty: gpsHardwareWarranty,
                GPSOwnerNameAddress: gpsOwnerNameAddress,
                GPSSimNumber: gpsSimNumber,
                GPSSubscriptionValidTill: formatDateToDDMMYYYY(gpsSubscriptionValidTill),
                GPSRemarks: gpsRemarks
            };

            await axios.post(postVehicleCctvCameraInstallation, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("CCTV Camera & Safety Details saved successfully");
        } catch (error) {
            setMessage("An error occurred while saving CCTV Camera & Safety Details.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Bus Branding Submit
    const handleBusBrandingSubmit = async () => {
        // Validation
        if (!vehicleAssetId) {
            setMessage("Vehicle Asset ID is required. Please generate or select a vehicle first.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);
        try {
            const sendData = new FormData();
            sendData.append("VehicleAssetID", vehicleAssetId);

            // School Name Display
            sendData.append("SchoolNameFrontSide", schoolNameFrontSide);
            sendData.append("SchoolNameBackSide", schoolNameBackSide);
            sendData.append("SchoolNameLeftSide", schoolNameLeftSide);
            sendData.append("SchoolNameRightSide", schoolNameRightSide);

            // Internal Name & Photo Display
            sendData.append("InternalNameFrontSide", internalNameFrontSide);
            sendData.append("InternalNameBackSide", internalNameBackSide);
            sendData.append("InternalNameLeftSide", internalNameLeftSide);
            sendData.append("InternalNameRightSide", internalNameRightSide);

            // Reflective Tapes Display
            sendData.append("ReflectiveTapesFrontSide", reflectiveTapesFrontSide);
            sendData.append("ReflectiveTapesBackSide", reflectiveTapesBackSide);
            sendData.append("ReflectiveTapesLeftSide", reflectiveTapesLeftSide);
            sendData.append("ReflectiveTapesRightSide", reflectiveTapesRightSide);

            // Signage Display
            sendData.append("SignageFrontSide", signageFrontSide);
            sendData.append("SignageBackSide", signageBackSide);
            sendData.append("SignageLeftSide", signageLeftSide);
            sendData.append("SignageRightSide", signageRightSide);

            // School Name Display Files
            if (schoolNameFrontFile) {
                sendData.append("SchoolNameFrontFile", schoolNameFrontFile);
                sendData.append("SchoolNameFrontFileType", schoolNameFrontFile.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (schoolNameBackFile) {
                sendData.append("SchoolNameBackFile", schoolNameBackFile);
                sendData.append("SchoolNameBackFileType", schoolNameBackFile.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (schoolNameLeftFile) {
                sendData.append("SchoolNameLeftFile", schoolNameLeftFile);
                sendData.append("SchoolNameLeftFileType", schoolNameLeftFile.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (schoolNameRightFile) {
                sendData.append("SchoolNameRightFile", schoolNameRightFile);
                sendData.append("SchoolNameRightFileType", schoolNameRightFile.type.startsWith('image/') ? 'image' : 'pdf');
            }

            // Internal Name & Photo Display Files
            if (internalNameFrontFile) {
                sendData.append("InternalNameFrontFile", internalNameFrontFile);
                sendData.append("InternalNameFrontFileType", internalNameFrontFile.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (internalNameBackFile) {
                sendData.append("InternalNameBackFile", internalNameBackFile);
                sendData.append("InternalNameBackFileType", internalNameBackFile.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (internalNameLeftFile) {
                sendData.append("InternalNameLeftFile", internalNameLeftFile);
                sendData.append("InternalNameLeftFileType", internalNameLeftFile.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (internalNameRightFile) {
                sendData.append("InternalNameRightFile", internalNameRightFile);
                sendData.append("InternalNameRightFileType", internalNameRightFile.type.startsWith('image/') ? 'image' : 'pdf');
            }

            // Reflective Tapes Display Files
            if (reflectiveTapesFrontFile) {
                sendData.append("ReflectiveTapesFrontFile", reflectiveTapesFrontFile);
                sendData.append("ReflectiveTapesFrontFileType", reflectiveTapesFrontFile.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (reflectiveTapesBackFile) {
                sendData.append("ReflectiveTapesBackFile", reflectiveTapesBackFile);
                sendData.append("ReflectiveTapesBackFileType", reflectiveTapesBackFile.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (reflectiveTapesLeftFile) {
                sendData.append("ReflectiveTapesLeftFile", reflectiveTapesLeftFile);
                sendData.append("ReflectiveTapesLeftFileType", reflectiveTapesLeftFile.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (reflectiveTapesRightFile) {
                sendData.append("ReflectiveTapesRightFile", reflectiveTapesRightFile);
                sendData.append("ReflectiveTapesRightFileType", reflectiveTapesRightFile.type.startsWith('image/') ? 'image' : 'pdf');
            }

            // Signage Display Files
            if (signageFrontFile) {
                sendData.append("SignageFrontFile", signageFrontFile);
                sendData.append("SignageFrontFileType", signageFrontFile.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (signageBackFile) {
                sendData.append("SignageBackFile", signageBackFile);
                sendData.append("SignageBackFileType", signageBackFile.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (signageLeftFile) {
                sendData.append("SignageLeftFile", signageLeftFile);
                sendData.append("SignageLeftFileType", signageLeftFile.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (signageRightFile) {
                sendData.append("SignageRightFile", signageRightFile);
                sendData.append("SignageRightFileType", signageRightFile.type.startsWith('image/') ? 'image' : 'pdf');
            }

            await axios.post(postVehicleBusBrandingVisualIdentity, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Bus Branding & Visual Identity saved successfully");
        } catch (error) {
            setMessage("An error occurred while saving Bus Branding & Visual Identity.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate Vehicle ID
    const handleGenerateVehicleId = () => {
        setMessage("Vehicle ID Generated Successfully!");
        setOpen(true);
        setColor(true);
        setStatus(true);
    };

    // Reset All
    const handleResetAll = () => {
        handleFCDetailsClear();
        handlePermitDetailClear();
        handlePUCDetailClear();
        handleRoadTaxClear();
        handleCCTVCameraClear();
        handleBusBrandingClear();
        setMessage("All fields have been reset");
        setOpen(true);
        setColor(true);
        setStatus(true);
    };

    return (
        <Box sx={{ backgroundColor: "#FAFAFA" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

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

                    <ActionButtons onClear={handleFCDetailsClear} onSave={handleFCDetailsSubmit} />
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

                    <ActionButtons onClear={handlePermitDetailClear} onSave={handlePermitDetailSubmit} />
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

                    <ActionButtons onClear={handlePUCDetailClear} onSave={handlePUCDetailSubmit} />
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

                    <ActionButtons onClear={handleRoadTaxClear} onSave={handleRoadTaxSubmit} />
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
                                    file={schoolNameFrontFile}
                                    preview={schoolNameFrontPreview}
                                    onFileChange={(e) => handleFileChange(e, setSchoolNameFrontFile, setSchoolNameFrontPreview)}
                                    onDrop={(e) => handleFileDrop(e, setSchoolNameFrontFile, setSchoolNameFrontPreview)}
                                    inputRef={schoolNameFrontRef}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Back side"
                                    label="Bus photographs (Back Side)"
                                    value={schoolNameBackSide}
                                    onChange={(e) => setSchoolNameBackSide(e.target.value)}
                                    file={schoolNameBackFile}
                                    preview={schoolNameBackPreview}
                                    onFileChange={(e) => handleFileChange(e, setSchoolNameBackFile, setSchoolNameBackPreview)}
                                    onDrop={(e) => handleFileDrop(e, setSchoolNameBackFile, setSchoolNameBackPreview)}
                                    inputRef={schoolNameBackRef}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Left side"
                                    label="Bus photographs (Left side)"
                                    value={schoolNameLeftSide}
                                    onChange={(e) => setSchoolNameLeftSide(e.target.value)}
                                    file={schoolNameLeftFile}
                                    preview={schoolNameLeftPreview}
                                    onFileChange={(e) => handleFileChange(e, setSchoolNameLeftFile, setSchoolNameLeftPreview)}
                                    onDrop={(e) => handleFileDrop(e, setSchoolNameLeftFile, setSchoolNameLeftPreview)}
                                    inputRef={schoolNameLeftRef}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Right side"
                                    label="Bus photographs (Right side)"
                                    value={schoolNameRightSide}
                                    onChange={(e) => setSchoolNameRightSide(e.target.value)}
                                    file={schoolNameRightFile}
                                    preview={schoolNameRightPreview}
                                    onFileChange={(e) => handleFileChange(e, setSchoolNameRightFile, setSchoolNameRightPreview)}
                                    onDrop={(e) => handleFileDrop(e, setSchoolNameRightFile, setSchoolNameRightPreview)}
                                    inputRef={schoolNameRightRef}
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
                                    file={internalNameFrontFile}
                                    preview={internalNameFrontPreview}
                                    onFileChange={(e) => handleFileChange(e, setInternalNameFrontFile, setInternalNameFrontPreview)}
                                    onDrop={(e) => handleFileDrop(e, setInternalNameFrontFile, setInternalNameFrontPreview)}
                                    inputRef={internalNameFrontRef}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Back side"
                                    label="Bus photographs (Back Side)"
                                    value={internalNameBackSide}
                                    onChange={(e) => setInternalNameBackSide(e.target.value)}
                                    file={internalNameBackFile}
                                    preview={internalNameBackPreview}
                                    onFileChange={(e) => handleFileChange(e, setInternalNameBackFile, setInternalNameBackPreview)}
                                    onDrop={(e) => handleFileDrop(e, setInternalNameBackFile, setInternalNameBackPreview)}
                                    inputRef={internalNameBackRef}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Left side"
                                    label="Bus photographs (Left side)"
                                    value={internalNameLeftSide}
                                    onChange={(e) => setInternalNameLeftSide(e.target.value)}
                                    file={internalNameLeftFile}
                                    preview={internalNameLeftPreview}
                                    onFileChange={(e) => handleFileChange(e, setInternalNameLeftFile, setInternalNameLeftPreview)}
                                    onDrop={(e) => handleFileDrop(e, setInternalNameLeftFile, setInternalNameLeftPreview)}
                                    inputRef={internalNameLeftRef}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Right side"
                                    label="Bus photographs (Right side)"
                                    value={internalNameRightSide}
                                    onChange={(e) => setInternalNameRightSide(e.target.value)}
                                    file={internalNameRightFile}
                                    preview={internalNameRightPreview}
                                    onFileChange={(e) => handleFileChange(e, setInternalNameRightFile, setInternalNameRightPreview)}
                                    onDrop={(e) => handleFileDrop(e, setInternalNameRightFile, setInternalNameRightPreview)}
                                    inputRef={internalNameRightRef}
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
                                    file={reflectiveTapesFrontFile}
                                    preview={reflectiveTapesFrontPreview}
                                    onFileChange={(e) => handleFileChange(e, setReflectiveTapesFrontFile, setReflectiveTapesFrontPreview)}
                                    onDrop={(e) => handleFileDrop(e, setReflectiveTapesFrontFile, setReflectiveTapesFrontPreview)}
                                    inputRef={reflectiveTapesFrontRef}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Back side"
                                    label="Bus photographs (Back Side)"
                                    value={reflectiveTapesBackSide}
                                    onChange={(e) => setReflectiveTapesBackSide(e.target.value)}
                                    file={reflectiveTapesBackFile}
                                    preview={reflectiveTapesBackPreview}
                                    onFileChange={(e) => handleFileChange(e, setReflectiveTapesBackFile, setReflectiveTapesBackPreview)}
                                    onDrop={(e) => handleFileDrop(e, setReflectiveTapesBackFile, setReflectiveTapesBackPreview)}
                                    inputRef={reflectiveTapesBackRef}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Left side"
                                    label="Bus photographs (Left side)"
                                    value={reflectiveTapesLeftSide}
                                    onChange={(e) => setReflectiveTapesLeftSide(e.target.value)}
                                    file={reflectiveTapesLeftFile}
                                    preview={reflectiveTapesLeftPreview}
                                    onFileChange={(e) => handleFileChange(e, setReflectiveTapesLeftFile, setReflectiveTapesLeftPreview)}
                                    onDrop={(e) => handleFileDrop(e, setReflectiveTapesLeftFile, setReflectiveTapesLeftPreview)}
                                    inputRef={reflectiveTapesLeftRef}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Right side"
                                    label="Bus photographs (Right side)"
                                    value={reflectiveTapesRightSide}
                                    onChange={(e) => setReflectiveTapesRightSide(e.target.value)}
                                    file={reflectiveTapesRightFile}
                                    preview={reflectiveTapesRightPreview}
                                    onFileChange={(e) => handleFileChange(e, setReflectiveTapesRightFile, setReflectiveTapesRightPreview)}
                                    onDrop={(e) => handleFileDrop(e, setReflectiveTapesRightFile, setReflectiveTapesRightPreview)}
                                    inputRef={reflectiveTapesRightRef}
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
                                    file={signageFrontFile}
                                    preview={signageFrontPreview}
                                    onFileChange={(e) => handleFileChange(e, setSignageFrontFile, setSignageFrontPreview)}
                                    onDrop={(e) => handleFileDrop(e, setSignageFrontFile, setSignageFrontPreview)}
                                    inputRef={signageFrontRef}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Back side"
                                    label="Bus photographs (Back Side)"
                                    value={signageBackSide}
                                    onChange={(e) => setSignageBackSide(e.target.value)}
                                    file={signageBackFile}
                                    preview={signageBackPreview}
                                    onFileChange={(e) => handleFileChange(e, setSignageBackFile, setSignageBackPreview)}
                                    onDrop={(e) => handleFileDrop(e, setSignageBackFile, setSignageBackPreview)}
                                    inputRef={signageBackRef}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Left side"
                                    label="Bus photographs (Left side)"
                                    value={signageLeftSide}
                                    onChange={(e) => setSignageLeftSide(e.target.value)}
                                    file={signageLeftFile}
                                    preview={signageLeftPreview}
                                    onFileChange={(e) => handleFileChange(e, setSignageLeftFile, setSignageLeftPreview)}
                                    onDrop={(e) => handleFileDrop(e, setSignageLeftFile, setSignageLeftPreview)}
                                    inputRef={signageLeftRef}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio
                                    side="Right side"
                                    label="Bus photographs (Right side)"
                                    value={signageRightSide}
                                    onChange={(e) => setSignageRightSide(e.target.value)}
                                    file={signageRightFile}
                                    preview={signageRightPreview}
                                    onFileChange={(e) => handleFileChange(e, setSignageRightFile, setSignageRightPreview)}
                                    onDrop={(e) => handleFileDrop(e, setSignageRightFile, setSignageRightPreview)}
                                    inputRef={signageRightRef}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </ExpandableSection>


            </Box>
        </Box>
    );
}
