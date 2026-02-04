import React, { useEffect, useState, useRef } from "react";
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
    Collapse,
    Tabs,
    Tab
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SecurityIcon from '@mui/icons-material/Security';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from "axios";
import Loader from "../../../Loader";
import SnackBar from "../../../SnackBar";
import {
    findVehicleManagementDetails,
    findVehicleSafetyComplianceDetails,
    postVehicleAcquisitionDetail,
    updateVehicleAcquisitionDetail,
    postVehicleSpecification,
    updateVehicleSpecification,
    postVehicleRegistrationOwnership,
    updateVehicleRegistrationOwnership,
    postVehicleInsuranceCompliance,
    updateVehicleInsuranceCompliance,
    postVehicleWarrantyServiceClaim,
    updateVehicleWarrantyServiceClaim,
    postVehicleDocuments,
    updateVehicleDocuments,
    updateVehicleFCDetail,
    updateVehiclePermitDetail,
    updateVehiclePUCDetail,
    updateVehicleRoadTransportTax,
    updateVehicleCctvCameraInstallation,
    updateVehicleBusBrandingVisualIdentity
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
    color: "#ff1414",
    fontWeight: 600,
    fontSize: "11px",
    mb: 0.5
};

// Form Field Component
const FormField = ({ label, children, required = false, gridSize = 2.4 }) => (
    <Grid size={{ xs: 12, sm: 6, md: gridSize }}>
        <InputLabel sx={labelSx}>
            {label}
            {required && <span style={{ color: "#ff0000" }}>*</span>}
        </InputLabel>
        {children}
    </Grid>
);

// Expandable Section Component
const ExpandableSection = ({ title, expanded, onToggle, children }) => (
    <Paper sx={{ borderRadius: "5px", mb: 2, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <Box
            onClick={onToggle}
            sx={{
                backgroundColor: "#FFF1F1",
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                p: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                "&:hover": { backgroundColor: "#FFE4E4" }
            }}
        >
            <Typography fontWeight={600} fontSize="15px" color="#333">{title}</Typography>
            <IconButton size="small" sx={{ p: 0 }}>
                {expanded ? <ExpandLessIcon sx={{ color: "#333", fontSize: 20 }} /> : <ExpandMoreIcon sx={{ color: "#333", fontSize: 20 }} />}
            </IconButton>
        </Box>
        <Collapse in={expanded}>
            <Box sx={{ p: 2, backgroundColor: "#fff" }}>{children}</Box>
        </Collapse>
    </Paper>
);

// Action Buttons Component
const ActionButtons = ({ onClear, onSave, saveLabel = "Update" }) => (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button variant="text" onClick={onClear} sx={{ color: "#000", textTransform: "none", fontWeight: 600 }}>Clear</Button>
        <Button variant="contained" onClick={onSave} sx={{ backgroundColor: "#FBBF24", color: "#000", textTransform: "none", fontWeight: 600, borderRadius: "20px", px: 4, "&:hover": { backgroundColor: "#F59E0B" } }}>{saveLabel}</Button>
    </Box>
);

// Document Upload Box Component
const DocumentUploadBox = ({ label, preview, onFileChange, onDrop, inputRef }) => {
    const handleDragOver = (e) => e.preventDefault();
    return (
        <Box sx={{ textAlign: "center" }}>
            <input type="file" ref={inputRef} onChange={onFileChange} accept="image/*,.pdf" style={{ display: 'none' }} />
            <Box onClick={() => inputRef.current?.click()} onDrop={onDrop} onDragOver={handleDragOver}
                sx={{
                    width: 180, height: 150, border: "2px dashed #1976D2", borderRadius: "12px",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", backgroundColor: "#E3F2FD", mx: "auto", mb: 1, overflow: "hidden",
                    "&:hover": { backgroundColor: "#BBDEFB", borderColor: "#1565C0" }
                }}
            >
                {preview ? (
                    <img src={preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <>
                        <Box sx={{ position: "relative", mb: 1.5 }}>
                            <UploadFileIcon sx={{ color: "#000", fontSize: 48 }} />
                            <Box sx={{ position: "absolute", bottom: -4, right: -8, backgroundColor: "#1976D2", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: "bold", lineHeight: 1 }}>↑</Typography>
                            </Box>
                        </Box>
                        <Typography fontSize={12} textAlign="center" color="#333" fontWeight={500}>Drag and Drop files here</Typography>
                        <Typography fontSize={12} textAlign="center" color="#333">or <span style={{ textDecoration: "underline", fontWeight: 500 }}>Choose file</span></Typography>
                    </>
                )}
            </Box>
            <Typography color="#ff1414" fontSize={11} fontWeight={700}>{label}</Typography>
            {preview && <Typography color="#4CAF50" fontSize={11} sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }} onClick={() => window.open(preview, '_blank')}>View Document</Typography>}
        </Box>
    );
};

// Branding Image Upload Box with Radio
const BrandingImageUploadBoxWithRadio = ({ side, label, value, onChange }) => {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    return (
        <Box sx={{ textAlign: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
                <Typography fontSize="11px" fontWeight={500}>{side} :</Typography>
                <RadioGroup row value={value} onChange={onChange}>
                    <FormControlLabel value="Yes" control={<Radio size="small" sx={{ p: 0.4 }} />} label={<Typography fontSize="11px">Yes</Typography>} sx={{ mr: 1.5 }} />
                    <FormControlLabel value="No" control={<Radio size="small" sx={{ p: 0.4 }} />} label={<Typography fontSize="11px">No</Typography>} />
                </RadioGroup>
            </Box>
            <input type="file" ref={inputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            <Box
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                sx={{
                    width: 120, height: 100, border: "2px dashed #1976D2", borderRadius: "12px",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", backgroundColor: "#E3F2FD", mx: "auto", mb: 0.5, overflow: "hidden",
                    "&:hover": { backgroundColor: "#BBDEFB", borderColor: "#1565C0" }
                }}
            >
                {preview ? (
                    <img src={preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <>
                        <Box sx={{ position: "relative", mb: 1 }}>
                            <UploadFileIcon sx={{ color: "#000", fontSize: 32 }} />
                            <Box sx={{ position: "absolute", bottom: -4, right: -8, backgroundColor: "#1976D2", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography sx={{ color: "#fff", fontSize: 12, fontWeight: "bold", lineHeight: 1 }}>↑</Typography>
                            </Box>
                        </Box>
                        <Typography fontSize={9} textAlign="center" color="#333" fontWeight={500}>Drag and Drop files here</Typography>
                        <Typography fontSize={9} textAlign="center" color="#333">or <span style={{ textDecoration: "underline", fontWeight: 500 }}>Choose file</span></Typography>
                    </>
                )}
            </Box>
            <Typography color="#ff1414" fontSize={11} fontWeight={700}>{label}</Typography>
            {preview && <Typography color="#4CAF50" fontSize={11} sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }} onClick={() => window.open(preview, '_blank')}>View Photo</Typography>}
        </Box>
    );
};

// Tab Panel Component
function TabPanel({ children, value, index }) {
    return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>;
}

export default function EditVehicleDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = "123";
    const { vehicleId } = location.state || {};
    const isExpanded = useSelector((state) => state.sidebar?.isExpanded ?? true);

    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [tabValue, setTabValue] = useState(0);

    // Expanded sections state
    const [expandedSections, setExpandedSections] = useState({
        acquisition: true, specification: true, registration: true, insurance: true, warranty: true, documents: true,
        fcDetails: true, permitDetail: true, pucDetail: true, roadTax: true, cctvCamera: true, busBranding: true
    });

    const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

    // ==================== RECORD IDs FOR UPDATES ====================
    const [acquisitionId, setAcquisitionId] = useState(null);
    const [specificationId, setSpecificationId] = useState(null);
    const [registrationId, setRegistrationId] = useState(null);
    const [insuranceId, setInsuranceId] = useState(null);
    const [warrantyId, setWarrantyId] = useState(null);
    const [documentsId, setDocumentsId] = useState(null);

    // ==================== VEHICLE ASSET STATES ====================
    // Acquisition Details
    const [modeOfAcquisition, setModeOfAcquisition] = useState("New");
    const [acquisitionSourceType, setAcquisitionSourceType] = useState("Dealer");
    const [assetSubType, setAssetSubType] = useState("");
    const [vehicleBrand, setVehicleBrand] = useState("");
    const [acquisitionDate, setAcquisitionDate] = useState("");
    const [vehicleAssetType, setVehicleAssetType] = useState("");
    const [dealerName, setDealerName] = useState("");
    const [dealerContactNumber, setDealerContactNumber] = useState("");
    const [dealerAddress, setDealerAddress] = useState("");
    const [dealerGstin, setDealerGstin] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [busPhoto, setBusPhoto] = useState(null);
    const [busPhotoPreview, setBusPhotoPreview] = useState(null);
    const busPhotoInputRef = useRef(null);
    const [busName, setBusName] = useState("");

    // Vehicle Specification
    const [busModelMake, setBusModelMake] = useState("");
    const [yearOfManufacture, setYearOfManufacture] = useState("");
    const [engineNumber, setEngineNumber] = useState("");
    const [engineChassisNumber, setEngineChassisNumber] = useState("");
    const [fuelType, setFuelType] = useState("");
    const [vehicleClass, setVehicleClass] = useState("");
    const [fuelTankCapacity, setFuelTankCapacity] = useState("");
    const [seatingCapacity, setSeatingCapacity] = useState("");
    const [seatsPerRow, setSeatsPerRow] = useState("");
    const [blendingSource, setBlendingSource] = useState("");
    const [vehicleColor, setVehicleColor] = useState("");

    // Registration & Ownership
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [rtoNameCode, setRtoNameCode] = useState("");
    const [registrationDate, setRegistrationDate] = useState("");
    const [vehicleOwnershipType, setVehicleOwnershipType] = useState("");
    const [vehicleOwnerName, setVehicleOwnerName] = useState("");
    const [ownerPermanentAddress, setOwnerPermanentAddress] = useState("");
    const [ownerContactNumber, setOwnerContactNumber] = useState("");
    const [vehicleOwnerLegalIdGst, setVehicleOwnerLegalIdGst] = useState("");

    // Insurance
    const [insuranceCompanyName, setInsuranceCompanyName] = useState("");
    const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("");
    const [insurancePolicyType, setInsurancePolicyType] = useState("");
    const [policyStartDate, setPolicyStartDate] = useState("");
    const [policyEndDate, setPolicyEndDate] = useState("");
    const [primaryInsuranceIdentifier, setPrimaryInsuranceIdentifier] = useState("");
    const [currentInsuranceStatus, setCurrentInsuranceStatus] = useState("");
    const [insurancePremiumAmount, setInsurancePremiumAmount] = useState("");

    // Warranty
    const [warrantyProvided, setWarrantyProvided] = useState("Provided");
    const [warrantyProvidedBy, setWarrantyProvidedBy] = useState("Manufacturer");
    const [warrantyType, setWarrantyType] = useState("Standard");
    const [warrantyCoverageFor, setWarrantyCoverageFor] = useState("");
    const [fullVehicleWarrantyStartDate, setFullVehicleWarrantyStartDate] = useState("");
    const [fullVehicleWarrantyEndDate, setFullVehicleWarrantyEndDate] = useState("");
    const [fullVehicleWarrantyPeriod, setFullVehicleWarrantyPeriod] = useState("");

    // Documents
    const [rcBook, setRcBook] = useState(null);
    const [rcBookPreview, setRcBookPreview] = useState(null);
    const [fitnessCertificate, setFitnessCertificate] = useState(null);
    const [fitnessCertificatePreview, setFitnessCertificatePreview] = useState(null);
    const [roadTaxCertificate, setRoadTaxCertificate] = useState(null);
    const [roadTaxCertificatePreview, setRoadTaxCertificatePreview] = useState(null);
    const [insuranceDoc, setInsuranceDoc] = useState(null);
    const [insuranceDocPreview, setInsuranceDocPreview] = useState(null);
    const [pucCertificate, setPucCertificate] = useState(null);
    const [pucCertificatePreview, setPucCertificatePreview] = useState(null);
    const [permitDocument, setPermitDocument] = useState(null);
    const [permitDocumentPreview, setPermitDocumentPreview] = useState(null);

    // Document refs
    const rcBookRef = useRef(null);
    const fitnessCertificateRef = useRef(null);
    const roadTaxCertificateRef = useRef(null);
    const insuranceDocRef = useRef(null);
    const pucCertificateRef = useRef(null);
    const permitDocumentRef = useRef(null);

    // ==================== SAFETY COMPLIANCE STATES ====================
    // FC Details
    const [fcType, setFcType] = useState("");
    const [fcNumber, setFcNumber] = useState("");
    const [fcIssueDate, setFcIssueDate] = useState("");
    const [fcExpiryDate, setFcExpiryDate] = useState("");
    const [fcValidityDuration, setFcValidityDuration] = useState("");
    const [fcLastValidDate, setFcLastValidDate] = useState("");
    const [fcRenewalReminder, setFcRenewalReminder] = useState("30 days before Expiry");
    const [fcCurrentStatus, setFcCurrentStatus] = useState("");
    const [fcNotesAboutInspection, setFcNotesAboutInspection] = useState("");

    // Permit Details
    const [permitNumber, setPermitNumber] = useState("");
    const [permitType, setPermitType] = useState("");
    const [issuingRto, setIssuingRto] = useState("");
    const [permitValidDateFrom, setPermitValidDateFrom] = useState("");
    const [permitValidTill, setPermitValidTill] = useState("");
    const [permitValidityDuration, setPermitValidityDuration] = useState("");
    const [permitAreaOfOperation, setPermitAreaOfOperation] = useState("");
    const [permitRoute, setPermitRoute] = useState("");

    // PUC Details
    const [pucCertificateNumber, setPucCertificateNumber] = useState("");
    const [pucIssueDate, setPucIssueDate] = useState("");
    const [pucExpiryDate, setPucExpiryDate] = useState("");
    const [pucValidityStatus, setPucValidityStatus] = useState("");

    // Road Tax
    const [taxType, setTaxType] = useState("");
    const [taxPaidDate, setTaxPaidDate] = useState("");
    const [taxExpiryDate, setTaxExpiryDate] = useState("");
    const [taxStatus, setTaxStatus] = useState("");
    const [taxReceiptNumber, setTaxReceiptNumber] = useState("");

    // CCTV Camera
    const [cctvInstalled, setCctvInstalled] = useState("Yes");
    const [numberOfCameras, setNumberOfCameras] = useState("");
    const [cctvDealerInstallerSame, setCctvDealerInstallerSame] = useState("Yes");
    const [camera1DateOfInstallation, setCamera1DateOfInstallation] = useState("");
    const [camera1DealerInstallerName, setCamera1DealerInstallerName] = useState("");
    const [camera1Type, setCamera1Type] = useState("");
    const [camera1DealerInstallerName2, setCamera1DealerInstallerName2] = useState("");
    const [camera1VendorContactDetails, setCamera1VendorContactDetails] = useState("");
    const [camera1Remarks, setCamera1Remarks] = useState("");

    // First Aid Kit
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

    // Speed Governor
    const [speedGovernorInstallation, setSpeedGovernorInstallation] = useState("Yes");
    const [speedGovernorDateOfInstallation, setSpeedGovernorDateOfInstallation] = useState("");
    const [speedGovernorVendorName, setSpeedGovernorVendorName] = useState("");
    const [speedLimitSet, setSpeedLimitSet] = useState("");
    const [speedGovernorCertificateNumber, setSpeedGovernorCertificateNumber] = useState("");
    const [speedGovernorValidityDate, setSpeedGovernorValidityDate] = useState("");
    const [speedGovernorRemarks, setSpeedGovernorRemarks] = useState("");

    // Fire Extinguisher
    const [fireExtinguisherInstallation, setFireExtinguisherInstallation] = useState("Yes");
    const [fireExtinguisherDateOfInstallation, setFireExtinguisherDateOfInstallation] = useState("");
    const [fireExtinguisherExpiryDate, setFireExtinguisherExpiryDate] = useState("");
    const [extinguisherTypeCapacity, setExtinguisherTypeCapacity] = useState("");
    const [fireExtinguisherVendorDetails, setFireExtinguisherVendorDetails] = useState("");
    const [fireExtinguisherRemarks, setFireExtinguisherRemarks] = useState("");

    // GPS Tracker
    const [gpsTrackerInstallation, setGpsTrackerInstallation] = useState("Yes");
    const [gpsDateOfInstallation, setGpsDateOfInstallation] = useState("");
    const [gpsDeviceIdImei, setGpsDeviceIdImei] = useState("");
    const [gpsHardwareWarranty, setGpsHardwareWarranty] = useState("");
    const [gpsOwnerNameAddress, setGpsOwnerNameAddress] = useState("");
    const [gpsSimNumber, setGpsSimNumber] = useState("");
    const [gpsSubscriptionValidTill, setGpsSubscriptionValidTill] = useState("");
    const [gpsRemarks, setGpsRemarks] = useState("");

    // Bus Branding - School Name Display
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

    // ==================== HELPER FUNCTIONS ====================
    const formatDateToDDMMYYYY = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatDateToYYYYMMDD = (dateString) => {
        if (!dateString) return "";
        if (dateString.includes('-')) {
            const parts = dateString.split('-');
            if (parts[0].length === 4) return dateString;
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateString;
    };

    // File validation helper
    const validateFile = (file, allowedTypes, maxSizeMB, fileTypeName) => {
        // Check file type
        const isValidType = allowedTypes.some(type => {
            if (type === 'image/*') return file.type.startsWith('image/');
            if (type === 'application/pdf') return file.type === 'application/pdf';
            return file.type === type;
        });

        if (!isValidType) {
            const typesList = allowedTypes.map(t => {
                if (t === 'image/*') return 'images (JPG, PNG, etc.)';
                if (t === 'application/pdf') return 'PDF';
                return t;
            }).join(' or ');
            setMessage(`Invalid file type for ${fileTypeName}. Please upload ${typesList}.`);
            setOpen(true);
            setColor(false);
            setStatus(false);
            return false;
        }

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            setMessage(`File size for ${fileTypeName} exceeds ${maxSizeMB}MB. Please upload a smaller file.`);
            setOpen(true);
            setColor(false);
            setStatus(false);
            return false;
        }

        return true;
    };

    const handleDocumentChange = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            // Validate: Allow images or PDF, max 10MB
            if (!validateFile(file, ['image/*', 'application/pdf'], 10, 'document')) {
                e.target.value = ''; // Reset input
                return;
            }
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDocumentDrop = (e, setFile, setPreview) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            // Validate: Allow images or PDF, max 10MB
            if (!validateFile(file, ['image/*', 'application/pdf'], 10, 'document')) {
                return;
            }
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleBusPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate: Allow only images, max 5MB
            if (!validateFile(file, ['image/*'], 5, 'bus photo')) {
                e.target.value = ''; // Reset input
                return;
            }
            setBusPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setBusPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleBusPhotoDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            // Validate: Allow only images, max 5MB
            if (!validateFile(file, ['image/*'], 5, 'bus photo')) {
                return;
            }
            setBusPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setBusPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Helper function to get invoice label based on Mode of Acquisition
    const getInvoiceLabel = () => {
        switch (modeOfAcquisition) {
            case "New": return "Invoice Number";
            case "Used": return "Ownership Transfer Acknowledgement Number";
            case "Internal Bus transfer": return "Transfer Ref Number";
            case "Received as donation": return "Donation Number";
            default: return "Invoice Number";
        }
    };

    // Helper function to get source type based on Mode of Acquisition
    const getSourceTypeFromMode = (mode) => {
        switch (mode) {
            case "New": return "Dealer";
            case "Used": return "Previous Owner";
            case "Received as donation": return "Donor";
            case "Internal Bus transfer": return "Source school";
            default: return "Dealer";
        }
    };

    // Handle Mode of Acquisition change - also updates Source Type
    const handleModeOfAcquisitionChange = (e) => {
        const newMode = e.target.value;
        setModeOfAcquisition(newMode);
        setAcquisitionSourceType(getSourceTypeFromMode(newMode));
    };

    // Auto calculate warranty period when start and end dates change
    useEffect(() => {
        if (fullVehicleWarrantyStartDate && fullVehicleWarrantyEndDate) {
            const startDate = new Date(fullVehicleWarrantyStartDate);
            const endDate = new Date(fullVehicleWarrantyEndDate);

            if (endDate > startDate) {
                const diffTime = Math.abs(endDate - startDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                const years = Math.floor(diffDays / 365);
                const months = Math.floor((diffDays % 365) / 30);
                const days = diffDays % 30;

                let period = "";
                if (years > 0) period += `${years} Year${years > 1 ? 's' : ''}`;
                if (months > 0) period += `${period ? ' ' : ''}${months} Month${months > 1 ? 's' : ''}`;
                if (days > 0 && years === 0) period += `${period ? ' ' : ''}${days} Day${days > 1 ? 's' : ''}`;

                setFullVehicleWarrantyPeriod(period || "0 Days");
            } else {
                setFullVehicleWarrantyPeriod("");
            }
        } else {
            setFullVehicleWarrantyPeriod("");
        }
    }, [fullVehicleWarrantyStartDate, fullVehicleWarrantyEndDate]);

    // ==================== FETCH DATA ====================
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        if (!vehicleId) {
            console.log("No vehicleId provided");
            return;
        }
        console.log("EditVehicleDetails - vehicleId from location.state:", vehicleId);
        setIsLoading(true);

        // Fetch Vehicle Management Details
        try {
            const vehicleRes = await axios.get(findVehicleManagementDetails, {
                params: { VehicleAssetID: vehicleId },
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Vehicle Details API Response:", vehicleRes.data);
            populateVehicleDetails(vehicleRes.data);
        } catch (error) {
            console.error("Error fetching vehicle details:", error);
        }

        // Fetch Safety Compliance Details (separate try-catch to handle 404)
        try {
            const safetyRes = await axios.get(findVehicleSafetyComplianceDetails, {
                params: { VehicleAssetID: vehicleId },
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("✅ Safety Compliance data found:", safetyRes.data);
            populateSafetyComplianceDetails(safetyRes.data);
        } catch (error) {
            // 404 is expected if no safety compliance data exists yet
            if (error.response?.status === 404) {
                console.log("ℹ️ No safety compliance data found for this vehicle. Please add data in the Safety & Compliance tab first.");
            } else {
                console.error("Error fetching safety compliance details:", error);
            }
        }

        setIsLoading(false);
    };

    const populateVehicleDetails = (responseData) => {
        if (!responseData) return;

        // API returns nested structure: { acquisitionDetail, specification, registrationOwnership, insuranceCompliance, warrantyServiceClaim, documents }
        const acquisition = responseData.acquisitionDetail;
        const specification = responseData.specification;
        const registration = responseData.registrationOwnership;
        const insurance = responseData.insuranceCompliance;
        const warranty = responseData.warrantyServiceClaim;
        const documents = responseData.documents;

        // Populate Acquisition Details
        if (acquisition) {
            setAcquisitionId(acquisition.id || null);
            setBusName(acquisition.busName || "");
            setModeOfAcquisition(acquisition.modeOfAcquisition || "New");
            setAcquisitionSourceType(acquisition.vehicleAcquisitionSourceType || "Dealer");
            setAcquisitionDate(formatDateToYYYYMMDD(acquisition.vehicleAcquisitionDate) || "");
            setVehicleAssetType(acquisition.vehicleAssetType || "");
            setAssetSubType(acquisition.vehicleAssetSubType || "");
            setVehicleBrand(acquisition.vehicleBrand || "");
            setDealerName(acquisition.dealerName || "");
            setDealerContactNumber(acquisition.dealerContactNumber || "");
            setDealerAddress(acquisition.dealerAddress || "");
            setDealerGstin(acquisition.dealerGSTIN || "");
            setInvoiceNumber(acquisition.invoiceOrTransferOrDonationNumber || "");
            setBusPhotoPreview(acquisition.busPhotoUrl || null);
        }

        // Populate Vehicle Specification
        if (specification) {
            setSpecificationId(specification.id || null);
            setBusModelMake(specification.busModelAndMake || "");
            setYearOfManufacture(specification.yearOfManufacture || "");
            setEngineNumber(specification.engineNumberAsPerRC || "");
            setEngineChassisNumber(specification.engineChasisNumberAsPerRC || "");
            setFuelType(specification.fuelTypeAsPerRC || "");
            setVehicleClass(specification.vehicleClassAsPerRC || "");
            setFuelTankCapacity(specification.fuelTankCapacity || "");
            setSeatingCapacity(specification.seatingCapacity || "");
            setSeatsPerRow(specification.seatsPerRow || "");
            setBlendingSource(specification.standingSpace || "");
            setVehicleColor(specification.vehicleColour || "");
        }

        // Populate Registration & Ownership
        if (registration) {
            setRegistrationId(registration.id || null);
            setRegistrationNumber(registration.registrationNumberAsPerRC || "");
            setRtoNameCode(registration.rtoNameAndCodeAsPerRC || "");
            setRegistrationDate(formatDateToYYYYMMDD(registration.registrationDate) || "");
            setVehicleOwnershipType(registration.vehicleOwnershipType || "");
            setVehicleOwnerName(registration.vehicleOwnerNameAsPerRC || "");
            setOwnerPermanentAddress(registration.ownerPermanentAddress || "");
            setOwnerContactNumber(registration.ownerContactNumber || "");
            setVehicleOwnerLegalIdGst(registration.vehicleOwnerLegalIdOrGST || "");
        }

        // Populate Insurance
        if (insurance) {
            setInsuranceId(insurance.id || null);
            setInsuranceCompanyName(insurance.insuranceCompanyName || "");
            setInsurancePolicyNumber(insurance.insurancePolicyNumber || "");
            setInsurancePolicyType(insurance.insurancePolicyType || "");
            setPolicyStartDate(formatDateToYYYYMMDD(insurance.policyStartDate) || "");
            setPolicyEndDate(formatDateToYYYYMMDD(insurance.policyEndDate) || "");
            setPrimaryInsuranceIdentifier(insurance.primaryInsuranceIdentifier || "");
            setCurrentInsuranceStatus(insurance.currentInsuranceStatus || "");
            setInsurancePremiumAmount(insurance.insurancePremiumAmount || "");
        }

        // Populate Warranty
        if (warranty) {
            setWarrantyId(warranty.id || null);
            setWarrantyProvided(warranty.warranty || "Provided");
            setWarrantyProvidedBy(warranty.warrantyProvidedBy || "Manufacturer");
            setWarrantyType(warranty.warrantyType || "Standard");
            setWarrantyCoverageFor(warranty.warrantyCoverageFor || "");
            setFullVehicleWarrantyStartDate(formatDateToYYYYMMDD(warranty.fullVehicleWarrantyStartDate) || "");
            setFullVehicleWarrantyEndDate(formatDateToYYYYMMDD(warranty.fullVehicleWarrantyEndDate) || "");
            setFullVehicleWarrantyPeriod(warranty.fullVehicleWarrantyPeriod || "");
        }

        // Populate Document Previews
        if (documents) {
            setDocumentsId(documents.id || null);
            setRcBookPreview(documents.rcBookFileUrl || null);
            setFitnessCertificatePreview(documents.fitnessCertificateFileUrl || null);
            setRoadTaxCertificatePreview(documents.roadTaxCertificateFileUrl || null);
            setInsuranceDocPreview(documents.insuranceDocumentFileUrl || null);
            setPucCertificatePreview(documents.pucCertificateFileUrl || null);
            setPermitDocumentPreview(documents.permitDocumentFileUrl || null);
        }
    };

    const populateSafetyComplianceDetails = (responseData) => {
        if (!responseData) return;

        // API returns nested structure: { fcDetail, permitDetail, pucDetail, roadTransportTaxDetail, cctvComplianceDetail, brandingVisualIdentity }
        const fc = responseData.fcDetail || responseData;
        const permit = responseData.permitDetail || responseData;
        const puc = responseData.pucDetail || responseData;
        const roadTax = responseData.roadTransportTaxDetail || responseData.roadTaxDetail || responseData;
        const cctv = responseData.cctvComplianceDetail || responseData.cctvCameraInstallation || responseData;
        const branding = responseData.brandingVisualIdentity || responseData.busBrandingVisualIdentity || responseData;

        // FC Details
        if (fc) {
            setFcType(fc.fcType || "");
            setFcNumber(fc.fcNumber || "");
            setFcIssueDate(formatDateToYYYYMMDD(fc.fcIssueDate) || "");
            setFcExpiryDate(formatDateToYYYYMMDD(fc.fcExpiryDate) || "");
            setFcValidityDuration(fc.fcValidityDuration || "");
            setFcLastValidDate(formatDateToYYYYMMDD(fc.lastValidDate) || "");
            setFcRenewalReminder(fc.renewalReminder || "30 days before Expiry");
            setFcCurrentStatus(fc.currentFcStatus || "");
            setFcNotesAboutInspection(fc.notesAboutInspection || "");
        }

        // Permit Details
        if (permit) {
            setPermitNumber(permit.permitNumber || "");
            setPermitType(permit.permitType || "");
            setIssuingRto(permit.issuingRTO || "");
            setPermitValidDateFrom(formatDateToYYYYMMDD(permit.validDateFrom) || "");
            setPermitValidTill(formatDateToYYYYMMDD(permit.validTill) || "");
            setPermitValidityDuration(permit.permitValidityDuration || "");
            setPermitAreaOfOperation(permit.permitAreaOfOperation || "");
            setPermitRoute(permit.permitRoute || "");
        }

        // PUC Details
        if (puc) {
            setPucCertificateNumber(puc.pucCertificateNumber || puc.pucNumber || "");
            setPucIssueDate(formatDateToYYYYMMDD(puc.pucIssueDate) || "");
            setPucExpiryDate(formatDateToYYYYMMDD(puc.pucExpiryDate) || "");
            setPucValidityStatus(puc.pucValidityStatus || "");
        }

        // Road Tax
        if (roadTax) {
            setTaxType(roadTax.taxType || "");
            setTaxPaidDate(formatDateToYYYYMMDD(roadTax.taxPaidDate || roadTax.taxLastPaidDate) || "");
            setTaxExpiryDate(formatDateToYYYYMMDD(roadTax.taxExpiryDate || roadTax.validTill || roadTax.taxValidDate) || "");
            setTaxStatus(roadTax.taxStatus || roadTax.taxValidityPeriodAutoCalculated || "");
            setTaxReceiptNumber(roadTax.taxReceiptNumber || "");
        }

        // CCTV & Safety Equipment
        if (cctv) {
            setCctvInstalled(cctv.cctvInstalled || cctv.cctvCameraInstallation || "Yes");
            setNumberOfCameras(cctv.numberOfCameras || cctv.numberOfCctvCamerasInstalled || "");
            setCctvDealerInstallerSame(cctv.cctvDealerInstallerSame || cctv.isCctvDealerInstallerSame || "Yes");
            setCamera1DateOfInstallation(formatDateToYYYYMMDD(cctv.camera1DateOfInstallation) || "");
            setCamera1DealerInstallerName(cctv.camera1DealerInstallerName || cctv.camera1DealerOrInstallerName || "");
            setCamera1Type(cctv.camera1Type || cctv.camera1TypeFrontRearBoth || "");
            setCamera1DealerInstallerName2(cctv.camera1DealerInstallerName2 || "");
            setCamera1VendorContactDetails(cctv.camera1VendorContactDetails || "");
            setCamera1Remarks(cctv.camera1Remarks || "");

            // First Aid Kit
            setFirstAidKitInstallation(cctv.firstAidKitInstallation || "Yes");
            setFirstAidDateOfInstallation(formatDateToYYYYMMDD(cctv.firstAidDateOfInstallation) || "");
            setFirstAidExpiryCheckDueDate(formatDateToYYYYMMDD(cctv.firstAidExpiryCheckDueDate) || "");
            setFirstAidLastInspectionDate(formatDateToYYYYMMDD(cctv.firstAidLastInspectionDate) || "");
            setFirstAidRemarks(cctv.firstAidRemarks || "");

            // Safety Grills
            setSafetyGrillsInstallation(cctv.safetyGrillsInstallation || cctv.safetyGrillsExitDoorsInstallation || "Yes");
            setSafetyGrillsInstalled(cctv.safetyGrillsInstalled || "Yes");
            setGrillLocation(cctv.grillLocation || "");
            setEmergencyExitAvailable(cctv.emergencyExitAvailable || "Yes");
            setEmergencyExitLocation(cctv.emergencyExitLocation || "");
            setComplianceAsPerNorms(cctv.complianceAsPerNorms || "Yes");
            setSafetyInstallationInspectionDate(formatDateToYYYYMMDD(cctv.safetyInstallationInspectionDate || cctv.installationInspectionDate) || "");
            setSafetyRemarks(cctv.safetyRemarks || "");

            // Speed Governor
            setSpeedGovernorInstallation(cctv.speedGovernorInstallation || "Yes");
            setSpeedGovernorDateOfInstallation(formatDateToYYYYMMDD(cctv.speedGovernorDateOfInstallation) || "");
            setSpeedGovernorVendorName(cctv.speedGovernorVendorName || cctv.speedGovernorVendorAuthorizedFitterName || "");
            setSpeedLimitSet(cctv.speedLimitSet || cctv.speedLimitSetKmph || "");
            setSpeedGovernorCertificateNumber(cctv.speedGovernorCertificateNumber || cctv.certificateApprovalNumber || "");
            setSpeedGovernorValidityDate(formatDateToYYYYMMDD(cctv.speedGovernorValidityDate || cctv.validityCalibrationDueDate) || "");
            setSpeedGovernorRemarks(cctv.speedGovernorRemarks || "");

            // Fire Extinguisher
            setFireExtinguisherInstallation(cctv.fireExtinguisherInstallation || "Yes");
            setFireExtinguisherDateOfInstallation(formatDateToYYYYMMDD(cctv.fireExtinguisherDateOfInstallation || cctv.fireDateOfInstallation) || "");
            setFireExtinguisherExpiryDate(formatDateToYYYYMMDD(cctv.fireExtinguisherExpiryDate || cctv.fireExpiryOrRefillDueDate) || "");
            setExtinguisherTypeCapacity(cctv.extinguisherTypeCapacity || cctv.extinguisherTypeCapacityKg || "");
            setFireExtinguisherVendorDetails(cctv.fireExtinguisherVendorDetails || cctv.fireVendorDetails || "");
            setFireExtinguisherRemarks(cctv.fireExtinguisherRemarks || cctv.fireRemarks || "");

            // GPS Tracker
            setGpsTrackerInstallation(cctv.gpsTrackerInstallation || "Yes");
            setGpsDateOfInstallation(formatDateToYYYYMMDD(cctv.gpsDateOfInstallation) || "");
            setGpsDeviceIdImei(cctv.gpsDeviceIdIMEI || cctv.gpsIdImei || "");
            setGpsHardwareWarranty(cctv.gpsHardwareWarranty || "");
            setGpsOwnerNameAddress(cctv.gpsOwnerNameAddress || cctv.gpsDealerNameAddress || "");
            setGpsSimNumber(cctv.gpsSimNumber || cctv.simNumberMasked || "");
            setGpsSubscriptionValidTill(formatDateToYYYYMMDD(cctv.gpsSubscriptionValidTill || cctv.subscriptionValidTill) || "");
            setGpsRemarks(cctv.gpsRemarks || "");
        }

        // Bus Branding
        if (branding) {
            // School Name (backend uses schoolNameDisplayFront/Back/Left/Right)
            setSchoolNameFrontSide(branding.schoolNameFrontSide || branding.schoolNameDisplayFront || "Yes");
            setSchoolNameBackSide(branding.schoolNameBackSide || branding.schoolNameDisplayBack || "Yes");
            setSchoolNameLeftSide(branding.schoolNameLeftSide || branding.schoolNameDisplayLeft || "Yes");
            setSchoolNameRightSide(branding.schoolNameRightSide || branding.schoolNameDisplayRight || "Yes");

            // Internal Name (backend uses internalNamePhotoFront/Back/Left/Right)
            setInternalNameFrontSide(branding.internalNameFrontSide || branding.internalNamePhotoFront || "Yes");
            setInternalNameBackSide(branding.internalNameBackSide || branding.internalNamePhotoBack || "Yes");
            setInternalNameLeftSide(branding.internalNameLeftSide || branding.internalNamePhotoLeft || "Yes");
            setInternalNameRightSide(branding.internalNameRightSide || branding.internalNamePhotoRight || "Yes");

            // Reflective Tapes (backend uses reflectiveTapesFront/Back/Left/Right)
            setReflectiveTapesFrontSide(branding.reflectiveTapesFrontSide || branding.reflectiveTapesFront || "Yes");
            setReflectiveTapesBackSide(branding.reflectiveTapesBackSide || branding.reflectiveTapesBack || "Yes");
            setReflectiveTapesLeftSide(branding.reflectiveTapesLeftSide || branding.reflectiveTapesLeft || "Yes");
            setReflectiveTapesRightSide(branding.reflectiveTapesRightSide || branding.reflectiveTapesRight || "Yes");

            // Signage (backend uses signageFront/Back/Left/Right)
            setSignageFrontSide(branding.signageFrontSide || branding.signageFront || "Yes");
            setSignageBackSide(branding.signageBackSide || branding.signageBack || "Yes");
            setSignageLeftSide(branding.signageLeftSide || branding.signageLeft || "Yes");
            setSignageRightSide(branding.signageRightSide || branding.signageRight || "Yes");
        }
    };

    // ==================== CLEAR HANDLERS ====================
    const handleAcquisitionDetailsClear = () => {
        setModeOfAcquisition("New");
        setAcquisitionSourceType("Dealer");
        setAcquisitionDate("");
        setVehicleAssetType("");
        setAssetSubType("");
        setVehicleBrand("");
        setDealerName("");
        setDealerContactNumber("");
        setDealerAddress("");
        setDealerGstin("");
        setInvoiceNumber("");
        setBusPhoto(null);
        setBusPhotoPreview(null);
    };

    const handleVehicleSpecificationClear = () => {
        setBusModelMake("");
        setYearOfManufacture("");
        setEngineNumber("");
        setEngineChassisNumber("");
        setFuelType("");
        setVehicleClass("");
        setFuelTankCapacity("");
        setSeatingCapacity("");
        setSeatsPerRow("");
        setBlendingSource("");
        setVehicleColor("");
    };

    const handleRegistrationOwnershipClear = () => {
        setRegistrationNumber("");
        setRtoNameCode("");
        setRegistrationDate("");
        setVehicleOwnershipType("");
        setVehicleOwnerName("");
        setOwnerPermanentAddress("");
        setOwnerContactNumber("");
        setVehicleOwnerLegalIdGst("");
    };

    const handleInsuranceClear = () => {
        setInsuranceCompanyName("");
        setInsurancePolicyNumber("");
        setInsurancePolicyType("");
        setPolicyStartDate("");
        setPolicyEndDate("");
        setPrimaryInsuranceIdentifier("");
        setCurrentInsuranceStatus("");
        setInsurancePremiumAmount("");
    };

    const handleWarrantyClear = () => {
        setWarrantyProvided("Provided");
        setWarrantyProvidedBy("Manufacturer");
        setWarrantyType("Standard");
        setWarrantyCoverageFor("");
        setFullVehicleWarrantyStartDate("");
        setFullVehicleWarrantyEndDate("");
        setFullVehicleWarrantyPeriod("");
    };

    const handleDocumentsClear = () => {
        setRcBook(null);
        setRcBookPreview(null);
        setFitnessCertificate(null);
        setFitnessCertificatePreview(null);
        setRoadTaxCertificate(null);
        setRoadTaxCertificatePreview(null);
        setInsuranceDoc(null);
        setInsuranceDocPreview(null);
        setPucCertificate(null);
        setPucCertificatePreview(null);
        setPermitDocument(null);
        setPermitDocumentPreview(null);
    };

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

    const handlePUCDetailClear = () => {
        setPucCertificateNumber("");
        setPucIssueDate("");
        setPucExpiryDate("");
        setPucValidityStatus("");
    };

    const handleRoadTaxClear = () => {
        setTaxType("");
        setTaxPaidDate("");
        setTaxExpiryDate("");
        setTaxStatus("");
        setTaxReceiptNumber("");
    };

    const handleCCTVCameraClear = () => {
        setCctvInstalled("Yes");
        setNumberOfCameras("");
        setCctvDealerInstallerSame("Yes");
        setCamera1DateOfInstallation("");
        setCamera1DealerInstallerName("");
        setCamera1Type("");
        setCamera1DealerInstallerName2("");
        setCamera1VendorContactDetails("");
        setCamera1Remarks("");
        setFirstAidKitInstallation("Yes");
        setFirstAidDateOfInstallation("");
        setFirstAidExpiryCheckDueDate("");
        setFirstAidLastInspectionDate("");
        setFirstAidRemarks("");
        setSafetyGrillsInstallation("Yes");
        setSafetyGrillsInstalled("Yes");
        setGrillLocation("");
        setEmergencyExitAvailable("Yes");
        setEmergencyExitLocation("");
        setComplianceAsPerNorms("Yes");
        setSafetyInstallationInspectionDate("");
        setSafetyRemarks("");
        setSpeedGovernorInstallation("Yes");
        setSpeedGovernorDateOfInstallation("");
        setSpeedGovernorVendorName("");
        setSpeedLimitSet("");
        setSpeedGovernorCertificateNumber("");
        setSpeedGovernorValidityDate("");
        setSpeedGovernorRemarks("");
        setFireExtinguisherInstallation("Yes");
        setFireExtinguisherDateOfInstallation("");
        setFireExtinguisherExpiryDate("");
        setExtinguisherTypeCapacity("");
        setFireExtinguisherVendorDetails("");
        setFireExtinguisherRemarks("");
        setGpsTrackerInstallation("Yes");
        setGpsDateOfInstallation("");
        setGpsDeviceIdImei("");
        setGpsHardwareWarranty("");
        setGpsOwnerNameAddress("");
        setGpsSimNumber("");
        setGpsSubscriptionValidTill("");
        setGpsRemarks("");
    };

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
    };

    // ==================== UPDATE HANDLERS ====================
    const handleAcquisitionDetailsUpdate = async () => {
        setIsLoading(true);
        try {
            const sendData = new FormData();
            sendData.append("VehicleAssetID", vehicleId);
            sendData.append("ModeOfAcquisition", modeOfAcquisition);
            sendData.append("VehicleAcquisitionDate", formatDateToDDMMYYYY(acquisitionDate));
            sendData.append("VehicleAssetType", vehicleAssetType);
            sendData.append("VehicleAcquisitionSourceType", acquisitionSourceType);
            sendData.append("VehicleAssetSubType", assetSubType);
            sendData.append("VehicleBrand", vehicleBrand);
            sendData.append("DealerName", dealerName);
            sendData.append("DealerContactNumber", dealerContactNumber);
            sendData.append("DealerAddress", dealerAddress);
            sendData.append("DealerGSTIN", dealerGstin);
            sendData.append("InvoiceOrTransferOrDonationNumber", invoiceNumber);
            if (busPhoto) {
                sendData.append("BusPhotoFile", busPhoto);
                sendData.append("BusPhotoFileType", busPhoto.type.startsWith('image/') ? 'image' : 'pdf');
            }
            await axios.put(updateVehicleAcquisitionDetail, sendData, { headers: { Authorization: `Bearer ${token}` } });
            setMessage("Acquisition Details updated successfully");
            setOpen(true); setColor(true); setStatus(true);
            fetchAllData(); // Refresh data after update
        } catch (error) {
            console.error("Error updating acquisition details:", error);
            setMessage("An error occurred."); setOpen(true); setColor(false); setStatus(false);
        } finally { setIsLoading(false); }
    };

    const handleVehicleSpecificationUpdate = async () => {
        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleId, BusModelAndMake: busModelMake, YearOfManufacture: yearOfManufacture,
                EngineNumberAsPerRC: engineNumber, EngineChasisNumberAsPerRC: engineChassisNumber,
                FuelTypeAsPerRC: fuelType, VehicleClassAsPerRC: vehicleClass, FuelTankCapacity: fuelTankCapacity,
                SeatingCapacity: seatingCapacity, SeatsPerRow: seatsPerRow, StandingSpace: blendingSource, VehicleColour: vehicleColor
            };
            await axios.put(updateVehicleSpecification, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("Vehicle Specification updated successfully");
            setOpen(true); setColor(true); setStatus(true);
        } catch (error) {
            console.error("Error updating vehicle specification:", error);
            setMessage("An error occurred."); setOpen(true); setColor(false); setStatus(false);
        } finally { setIsLoading(false); }
    };

    const handleRegistrationOwnershipUpdate = async () => {
        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleId, RegistrationNumberAsPerRC: registrationNumber, RTONameAndCodeAsPerRC: rtoNameCode,
                RegistrationDate: formatDateToDDMMYYYY(registrationDate), VehicleOwnershipType: vehicleOwnershipType,
                VehicleOwnerNameAsPerRC: vehicleOwnerName, OwnerPermanentAddress: ownerPermanentAddress,
                OwnerContactNumber: ownerContactNumber, VehicleOwnerLegalIdOrGST: vehicleOwnerLegalIdGst
            };
            await axios.put(updateVehicleRegistrationOwnership, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("Registration & Ownership updated successfully");
            setOpen(true); setColor(true); setStatus(true);
        } catch (error) {
            console.error("Error updating registration ownership:", error);
            setMessage("An error occurred."); setOpen(true); setColor(false); setStatus(false);
        } finally { setIsLoading(false); }
    };

    const handleInsuranceUpdate = async () => {
        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleId, InsuranceCompanyName: insuranceCompanyName, InsurancePolicyNumber: insurancePolicyNumber,
                InsurancePolicyType: insurancePolicyType, PolicyStartDate: formatDateToDDMMYYYY(policyStartDate),
                PolicyEndDate: formatDateToDDMMYYYY(policyEndDate), PrimaryInsuranceIdentifier: primaryInsuranceIdentifier,
                CurrentInsuranceStatus: currentInsuranceStatus, InsurancePremiumAmount: insurancePremiumAmount
            };
            await axios.put(updateVehicleInsuranceCompliance, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("Insurance Details updated successfully");
            setOpen(true); setColor(true); setStatus(true);
        } catch (error) {
            console.error("Error updating insurance:", error);
            setMessage("An error occurred."); setOpen(true); setColor(false); setStatus(false);
        } finally { setIsLoading(false); }
    };

    const handleWarrantyUpdate = async () => {
        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleId, Warranty: warrantyProvided, WarrantyProvidedBy: warrantyProvidedBy,
                WarrantyType: warrantyType, WarrantyCoverageFor: warrantyCoverageFor,
                FullVehicleWarrantyStartDate: formatDateToDDMMYYYY(fullVehicleWarrantyStartDate),
                FullVehicleWarrantyEndDate: formatDateToDDMMYYYY(fullVehicleWarrantyEndDate),
                FullVehicleWarrantyPeriod: fullVehicleWarrantyPeriod
            };
            await axios.put(updateVehicleWarrantyServiceClaim, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("Warranty Details updated successfully");
            setOpen(true); setColor(true); setStatus(true);
        } catch (error) {
            console.error("Error updating warranty:", error);
            setMessage("An error occurred."); setOpen(true); setColor(false); setStatus(false);
        } finally { setIsLoading(false); }
    };

    const handleDocumentsUpdate = async () => {
        setIsLoading(true);
        try {
            const sendData = new FormData();
            sendData.append("VehicleAssetID", vehicleId);
            if (rcBook) { sendData.append("RCBookFile", rcBook); sendData.append("RCBookFileType", rcBook.type.startsWith('image/') ? 'image' : 'pdf'); }
            if (fitnessCertificate) { sendData.append("FitnessCertificateFile", fitnessCertificate); sendData.append("FitnessCertificateFileType", fitnessCertificate.type.startsWith('image/') ? 'image' : 'pdf'); }
            if (roadTaxCertificate) { sendData.append("RoadTaxCertificateFile", roadTaxCertificate); sendData.append("RoadTaxCertificateFileType", roadTaxCertificate.type.startsWith('image/') ? 'image' : 'pdf'); }
            if (insuranceDoc) { sendData.append("InsuranceDocumentFile", insuranceDoc); sendData.append("InsuranceDocumentFileType", insuranceDoc.type.startsWith('image/') ? 'image' : 'pdf'); }
            if (pucCertificate) { sendData.append("PUCCertificateFile", pucCertificate); sendData.append("PUCCertificateFileType", pucCertificate.type.startsWith('image/') ? 'image' : 'pdf'); }
            if (permitDocument) { sendData.append("PermitDocumentFile", permitDocument); sendData.append("PermitDocumentFileType", permitDocument.type.startsWith('image/') ? 'image' : 'pdf'); }
            await axios.put(updateVehicleDocuments, sendData, { headers: { Authorization: `Bearer ${token}` } });
            setMessage("Documents updated successfully");
            setOpen(true); setColor(true); setStatus(true);
        } catch (error) {
            console.error("Error updating documents:", error);
            setMessage("An error occurred."); setOpen(true); setColor(false); setStatus(false);
        } finally { setIsLoading(false); }
    };

    // Safety Compliance Update Handlers
    const handleFCDetailsUpdate = async () => {
        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleId, FCType: fcType, FCNumber: fcNumber, FCIssueDate: formatDateToDDMMYYYY(fcIssueDate),
                FCExpiryDate: formatDateToDDMMYYYY(fcExpiryDate), FCValidityDuration: fcValidityDuration,
                LastValidDate: formatDateToDDMMYYYY(fcLastValidDate), RenewalReminder: fcRenewalReminder,
                currentFcStatus: fcCurrentStatus, notesAboutInspection: fcNotesAboutInspection
            };
            await axios.put(updateVehicleFCDetail, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("FC Details updated successfully"); setOpen(true); setColor(true); setStatus(true);
        } catch (error) { setMessage("An error occurred."); setOpen(true); setColor(false); setStatus(false); }
        finally { setIsLoading(false); }
    };

    const handlePermitDetailUpdate = async () => {
        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleId, PermitNumber: permitNumber, PermitType: permitType, IssuingRTO: issuingRto,
                ValidDateFrom: formatDateToDDMMYYYY(permitValidDateFrom), ValidTill: formatDateToDDMMYYYY(permitValidTill),
                PermitValidityDuration: permitValidityDuration, PermitAreaOfOperation: permitAreaOfOperation, PermitRoute: permitRoute
            };
            await axios.put(updateVehiclePermitDetail, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("Permit Details updated successfully"); setOpen(true); setColor(true); setStatus(true);
        } catch (error) { setMessage("An error occurred."); setOpen(true); setColor(false); setStatus(false); }
        finally { setIsLoading(false); }
    };

    const handlePUCDetailUpdate = async () => {
        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleId, PUCCertificateNumber: pucCertificateNumber, PUCIssueDate: formatDateToDDMMYYYY(pucIssueDate),
                PUCExpiryDate: formatDateToDDMMYYYY(pucExpiryDate), PUCValidityStatus: pucValidityStatus
            };
            await axios.put(updateVehiclePUCDetail, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("PUC Details updated successfully"); setOpen(true); setColor(true); setStatus(true);
        } catch (error) { setMessage("An error occurred."); setOpen(true); setColor(false); setStatus(false); }
        finally { setIsLoading(false); }
    };

    const handleRoadTaxUpdate = async () => {
        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleId, TaxType: taxType, TaxPaidDate: formatDateToDDMMYYYY(taxPaidDate),
                TaxExpiryDate: formatDateToDDMMYYYY(taxExpiryDate), TaxStatus: taxStatus, TaxReceiptNumber: taxReceiptNumber
            };
            await axios.put(updateVehicleRoadTransportTax, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("Road Tax Details updated successfully"); setOpen(true); setColor(true); setStatus(true);
        } catch (error) { setMessage("An error occurred."); setOpen(true); setColor(false); setStatus(false); }
        finally { setIsLoading(false); }
    };

    const handleCCTVCameraUpdate = async () => {
        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleId, CCTVInstalled: cctvInstalled, NumberOfCameras: numberOfCameras,
                CCTVDealerInstallerSame: cctvDealerInstallerSame, Camera1DateOfInstallation: formatDateToDDMMYYYY(camera1DateOfInstallation),
                Camera1DealerInstallerName: camera1DealerInstallerName, Camera1Type: camera1Type,
                Camera1DealerInstallerName2: camera1DealerInstallerName2, Camera1VendorContactDetails: camera1VendorContactDetails, Camera1Remarks: camera1Remarks,
                FirstAidKitInstallation: firstAidKitInstallation, FirstAidDateOfInstallation: formatDateToDDMMYYYY(firstAidDateOfInstallation),
                FirstAidExpiryCheckDueDate: formatDateToDDMMYYYY(firstAidExpiryCheckDueDate), FirstAidLastInspectionDate: formatDateToDDMMYYYY(firstAidLastInspectionDate),
                FirstAidRemarks: firstAidRemarks, SafetyGrillsInstallation: safetyGrillsInstallation,
                SafetyGrillsInstalled: safetyGrillsInstalled, GrillLocation: grillLocation, EmergencyExitAvailable: emergencyExitAvailable,
                EmergencyExitLocation: emergencyExitLocation, ComplianceAsPerNorms: complianceAsPerNorms,
                SafetyInstallationInspectionDate: formatDateToDDMMYYYY(safetyInstallationInspectionDate), SafetyRemarks: safetyRemarks,
                SpeedGovernorInstallation: speedGovernorInstallation, SpeedGovernorDateOfInstallation: formatDateToDDMMYYYY(speedGovernorDateOfInstallation),
                SpeedGovernorVendorName: speedGovernorVendorName, SpeedLimitSet: speedLimitSet, SpeedGovernorCertificateNumber: speedGovernorCertificateNumber,
                SpeedGovernorValidityDate: formatDateToDDMMYYYY(speedGovernorValidityDate), SpeedGovernorRemarks: speedGovernorRemarks,
                FireExtinguisherInstallation: fireExtinguisherInstallation, FireExtinguisherDateOfInstallation: formatDateToDDMMYYYY(fireExtinguisherDateOfInstallation),
                FireExtinguisherExpiryDate: formatDateToDDMMYYYY(fireExtinguisherExpiryDate), ExtinguisherTypeCapacity: extinguisherTypeCapacity,
                FireExtinguisherVendorDetails: fireExtinguisherVendorDetails, FireExtinguisherRemarks: fireExtinguisherRemarks,
                GPSTrackerInstallation: gpsTrackerInstallation, GPSDateOfInstallation: formatDateToDDMMYYYY(gpsDateOfInstallation),
                GPSDeviceIdIMEI: gpsDeviceIdImei, GPSHardwareWarranty: gpsHardwareWarranty, GPSOwnerNameAddress: gpsOwnerNameAddress,
                GPSSimNumber: gpsSimNumber, GPSSubscriptionValidTill: formatDateToDDMMYYYY(gpsSubscriptionValidTill), GPSRemarks: gpsRemarks
            };
            await axios.put(updateVehicleCctvCameraInstallation, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("CCTV & Safety Details updated successfully"); setOpen(true); setColor(true); setStatus(true);
        } catch (error) { setMessage("An error occurred."); setOpen(true); setColor(false); setStatus(false); }
        finally { setIsLoading(false); }
    };

    const handleBusBrandingUpdate = async () => {
        setIsLoading(true);
        try {
            const sendData = {
                VehicleAssetID: vehicleId, SchoolNameFrontSide: schoolNameFrontSide, SchoolNameBackSide: schoolNameBackSide,
                SchoolNameLeftSide: schoolNameLeftSide, SchoolNameRightSide: schoolNameRightSide,
                InternalNameFrontSide: internalNameFrontSide, InternalNameBackSide: internalNameBackSide,
                InternalNameLeftSide: internalNameLeftSide, InternalNameRightSide: internalNameRightSide,
                ReflectiveTapesFrontSide: reflectiveTapesFrontSide, ReflectiveTapesBackSide: reflectiveTapesBackSide,
                ReflectiveTapesLeftSide: reflectiveTapesLeftSide, ReflectiveTapesRightSide: reflectiveTapesRightSide,
                SignageFrontSide: signageFrontSide, SignageBackSide: signageBackSide, SignageLeftSide: signageLeftSide, SignageRightSide: signageRightSide
            };
            await axios.put(updateVehicleBusBrandingVisualIdentity, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("Bus Branding updated successfully"); setOpen(true); setColor(true); setStatus(true);
        } catch (error) { setMessage("An error occurred."); setOpen(true); setColor(false); setStatus(false); }
        finally { setIsLoading(false); }
    };

    return (
        <Box sx={{ width: '100%', backgroundColor: "#F8F9FA", minHeight: "100vh" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}

            {/* Header */}
            <Box sx={{
                position: "fixed", top: "60px", left: isExpanded ? "260px" : "80px", right: 0,
                backgroundColor: "#f2f2f2", px: 2, py: 0.5, borderBottom: "1px solid #ddd",
                zIndex: 1200, transition: "left 0.3s ease-in-out", display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
                    <Typography sx={{ fontWeight: 600, fontSize: 20 }}>Edit Vehicle Details</Typography>
                    {/* <Typography sx={{ ml: 2, px: 2, py: 0.5, backgroundColor: "#E3F2FD", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#1976D2" }}>
                        {vehicleId}
                    </Typography> */}
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ p: 3, pt: "70px" }}>
                {/* Tabs */}
                <Paper sx={{ mb: 2, borderRadius: "8px" }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', "& .MuiTab-root": { textTransform: "none", fontWeight: 500 } }}>
                        <Tab icon={<DirectionsBusIcon />} iconPosition="start" label="Vehicle Information" />
                        <Tab icon={<SecurityIcon />} iconPosition="start" label="Safety & Compliance" />
                    </Tabs>
                </Paper>

                {/* Tab 1: Vehicle Information */}
                <TabPanel value={tabValue} index={0}>
                    {/* Acquisition Details */}
                    <ExpandableSection title="Vehicle Acquisition Detail" expanded={expandedSections.acquisition} onToggle={() => toggleSection('acquisition')}>
                        <Box sx={{ display: "flex", gap: 3 }}>
                            <Box sx={{ flex: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <InputLabel sx={labelSx}>Mode of Acquisition</InputLabel>
                                        <RadioGroup row value={modeOfAcquisition} onChange={handleModeOfAcquisitionChange} sx={{ mt: 0.5 }}>
                                            <FormControlLabel value="New" control={<Radio size="small" />} label={<Typography fontSize="13px">New</Typography>} />
                                            <FormControlLabel value="Used" control={<Radio size="small" />} label={<Typography fontSize="13px">Used</Typography>} />
                                            <FormControlLabel value="Received as donation" control={<Radio size="small" />} label={<Typography fontSize="13px">Received as donation</Typography>} />
                                            <FormControlLabel value="Internal Bus transfer" control={<Radio size="small" />} label={<Typography fontSize="13px">Internal Bus transfer</Typography>} />
                                        </RadioGroup>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                    <InputLabel sx={labelSx}>Bus Name</InputLabel>
                                    <TextField fullWidth sx={inputSx} value={busName} onChange={(e) => setBusName(e.target.value)} placeholder="Enter bus name" />
                                </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Vehicle Acquisition Source Type</InputLabel>
                                        <Select fullWidth sx={selectSx} value={acquisitionSourceType} onChange={(e) => setAcquisitionSourceType(e.target.value)}>
                                            <MenuItem value="Dealer">Dealer</MenuItem>
                                            <MenuItem value="Previous Owner">Previous Owner</MenuItem>
                                            <MenuItem value="Donor">Donor</MenuItem>
                                            <MenuItem value="Source school">Source school</MenuItem>
                                        </Select>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Vehicle Acquisition Date</InputLabel>
                                        <TextField fullWidth sx={inputSx} type="date" value={acquisitionDate} onChange={(e) => setAcquisitionDate(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Vehicle Asset Type</InputLabel>
                                        <Select fullWidth sx={selectSx} value={vehicleAssetType} onChange={(e) => setVehicleAssetType(e.target.value)} displayEmpty>
                                            <MenuItem value=""><em>Select</em></MenuItem>
                                            <MenuItem value="Bus">Bus</MenuItem>
                                            <MenuItem value="Van">Van</MenuItem>
                                            <MenuItem value="Car">Car</MenuItem>
                                            <MenuItem value="Two Wheeler">Two Wheeler</MenuItem>
                                        </Select>
                                        <Typography fontSize="11px" color="#666" mt={0.5}>Bus / Van / Car / Two Wheeler</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Vehicle Asset Sub Type</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={assetSubType} onChange={(e) => setAssetSubType(e.target.value)} placeholder="Mini bus" />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Vehicle Brand</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={vehicleBrand} onChange={(e) => setVehicleBrand(e.target.value)} placeholder="Ashok Leyland" />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Dealer Name</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={dealerName} onChange={(e) => setDealerName(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Dealer Contact Number</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={dealerContactNumber} onChange={(e) => setDealerContactNumber(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Dealer Address</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={dealerAddress} onChange={(e) => setDealerAddress(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Dealer GSTIN (As per Invoice)</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={dealerGstin} onChange={(e) => setDealerGstin(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>{getInvoiceLabel()}</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                                    </Grid>
                                </Grid>
                            </Box>
                            <Box sx={{ width: 180, flexShrink: 0 }}>
                                <InputLabel sx={labelSx}>Upload Bus Photograph</InputLabel>
                                <input type="file" ref={busPhotoInputRef} onChange={handleBusPhotoChange} accept="image/*" style={{ display: 'none' }} />
                                <Box onClick={() => busPhotoInputRef.current?.click()} onDrop={handleBusPhotoDrop} onDragOver={(e) => e.preventDefault()}
                                    sx={{ width: "100%", height: 150, border: "2px dashed #1976D2", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", backgroundColor: "#E3F2FD", overflow: "hidden", "&:hover": { backgroundColor: "#BBDEFB" } }}>
                                    {busPhotoPreview ? <img src={busPhotoPreview} alt="Bus" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                                        <>
                                            <UploadFileIcon sx={{ fontSize: 32, color: "#1976D2" }} />
                                            <Typography fontSize={9} textAlign="center" color="#666" px={1}>Drag and Drop files here<br />or Choose file</Typography>
                                        </>
                                    )}
                                </Box>
                                {busPhotoPreview && <Typography color="#4CAF50" fontSize={11} mt={0.5} textAlign="center" sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }} onClick={() => window.open(busPhotoPreview, '_blank')}>View Document</Typography>}
                            </Box>
                        </Box>
                        <ActionButtons onClear={handleAcquisitionDetailsClear} onSave={handleAcquisitionDetailsUpdate} />
                    </ExpandableSection>

                    {/* Vehicle Specification */}
                    <ExpandableSection title="Vehicle Specification ( For All mode of Acquisition )" expanded={expandedSections.specification} onToggle={() => toggleSection('specification')}>
                        <Grid container spacing={2}>
                            <FormField label="Bus Model & Make"><TextField fullWidth sx={inputSx} value={busModelMake} onChange={(e) => setBusModelMake(e.target.value)} placeholder="LP 912" /></FormField>
                            <FormField label="Year of Manufacture"><TextField fullWidth sx={inputSx} value={yearOfManufacture} onChange={(e) => setYearOfManufacture(e.target.value)} /></FormField>
                            <FormField label="Engine Number (As per RC)"><TextField fullWidth sx={inputSx} value={engineNumber} onChange={(e) => setEngineNumber(e.target.value)} /></FormField>
                            <FormField label="Engine Chassis Number (As per RC)"><TextField fullWidth sx={inputSx} value={engineChassisNumber} onChange={(e) => setEngineChassisNumber(e.target.value)} /></FormField>
                            <FormField label="Fuel Type (As per RC)"><Select fullWidth sx={selectSx} value={fuelType} onChange={(e) => setFuelType(e.target.value)} displayEmpty><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="Diesel">Diesel</MenuItem><MenuItem value="Petrol">Petrol</MenuItem><MenuItem value="Electric">Electric</MenuItem><MenuItem value="CNG">CNG</MenuItem></Select></FormField>
                            <FormField label="Vehicle Class (As per RC)"><Select fullWidth sx={selectSx} value={vehicleClass} onChange={(e) => setVehicleClass(e.target.value)} displayEmpty><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="Transport">Transport</MenuItem><MenuItem value="Non-transport">Non-transport</MenuItem></Select></FormField>
                            <FormField label="Fuel Tank Capacity"><TextField fullWidth sx={inputSx} value={fuelTankCapacity} onChange={(e) => setFuelTankCapacity(e.target.value)} /></FormField>
                            <FormField label="Seating Capacity"><TextField fullWidth sx={inputSx} value={seatingCapacity} onChange={(e) => setSeatingCapacity(e.target.value)} /></FormField>
                            <FormField label="Seats per Row"><TextField fullWidth sx={inputSx} value={seatsPerRow} onChange={(e) => setSeatsPerRow(e.target.value)} /></FormField>
                            <FormField label="Blending Source"><TextField fullWidth sx={inputSx} value={blendingSource} onChange={(e) => setBlendingSource(e.target.value)} /></FormField>
                            <FormField label="Vehicle Colour"><TextField fullWidth sx={inputSx} value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} /></FormField>
                        </Grid>
                        <ActionButtons onClear={handleVehicleSpecificationClear} onSave={handleVehicleSpecificationUpdate} />
                    </ExpandableSection>

                    {/* Registration & Ownership */}
                    <ExpandableSection title="Registration & Vehicle Ownership Detail" expanded={expandedSections.registration} onToggle={() => toggleSection('registration')}>
                        <Grid container spacing={2}>
                            <FormField label="Registration Number (As per RC)"><TextField fullWidth sx={inputSx} value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="TN-XX-YY-1234" /></FormField>
                            <FormField label="RTO Name & Code (As per RC)"><TextField fullWidth sx={inputSx} value={rtoNameCode} onChange={(e) => setRtoNameCode(e.target.value)} placeholder="Chennai South RTO" /></FormField>
                            <FormField label="Registration Date"><TextField fullWidth sx={inputSx} type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} /></FormField>
                            <FormField label="Vehicle Ownership Type"><Select fullWidth sx={selectSx} value={vehicleOwnershipType} onChange={(e) => setVehicleOwnershipType(e.target.value)} displayEmpty><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="School Owned">School Owned</MenuItem><MenuItem value="Trust Management Owned">Trust Management Owned</MenuItem><MenuItem value="Vendor">Vendor</MenuItem><MenuItem value="Contractor Owned">Contractor Owned</MenuItem></Select></FormField>
                            <FormField label="Vehicle Owner Name (As per RC)"><TextField fullWidth sx={inputSx} value={vehicleOwnerName} onChange={(e) => setVehicleOwnerName(e.target.value)} /></FormField>
                            <FormField label="Owner Permanent Address"><TextField fullWidth sx={inputSx} value={ownerPermanentAddress} onChange={(e) => setOwnerPermanentAddress(e.target.value)} /></FormField>
                            <FormField label="Owner Contact Number"><TextField fullWidth sx={inputSx} value={ownerContactNumber} onChange={(e) => setOwnerContactNumber(e.target.value)} /></FormField>
                            <FormField label="Vehicle Owner Legal ID GST"><TextField fullWidth sx={inputSx} value={vehicleOwnerLegalIdGst} onChange={(e) => setVehicleOwnerLegalIdGst(e.target.value)} /></FormField>
                        </Grid>
                        <ActionButtons onClear={handleRegistrationOwnershipClear} onSave={handleRegistrationOwnershipUpdate} />
                    </ExpandableSection>

                    {/* Insurance */}
                    <ExpandableSection title="Insurance Registration Compliance" expanded={expandedSections.insurance} onToggle={() => toggleSection('insurance')}>
                        <Grid container spacing={2}>
                            <FormField label="Insurance Company Name"><TextField fullWidth sx={inputSx} value={insuranceCompanyName} onChange={(e) => setInsuranceCompanyName(e.target.value)} /></FormField>
                            <FormField label="Insurance Policy Number"><TextField fullWidth sx={inputSx} value={insurancePolicyNumber} onChange={(e) => setInsurancePolicyNumber(e.target.value)} /></FormField>
                            <FormField label="Insurance Policy Type"><Select fullWidth sx={selectSx} value={insurancePolicyType} onChange={(e) => setInsurancePolicyType(e.target.value)} displayEmpty><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="Third Party">Third Party</MenuItem><MenuItem value="Comprehensive">Comprehensive</MenuItem></Select></FormField>
                            <FormField label="Policy Start Date"><TextField fullWidth sx={inputSx} type="date" value={policyStartDate} onChange={(e) => setPolicyStartDate(e.target.value)} /></FormField>
                            <FormField label="Policy End Date"><TextField fullWidth sx={inputSx} type="date" value={policyEndDate} onChange={(e) => setPolicyEndDate(e.target.value)} /></FormField>
                            <FormField label="Primary Insurance Identifier"><Select fullWidth sx={selectSx} value={primaryInsuranceIdentifier} onChange={(e) => setPrimaryInsuranceIdentifier(e.target.value)} displayEmpty><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="Chassis Number">Chassis Number</MenuItem><MenuItem value="Registration Number">Registration Number</MenuItem></Select></FormField>
                            <FormField label="Current Insurance Status"><Select fullWidth sx={selectSx} value={currentInsuranceStatus} onChange={(e) => setCurrentInsuranceStatus(e.target.value)} displayEmpty><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="Active">Active</MenuItem><MenuItem value="Expired">Expired</MenuItem><MenuItem value="Active but RC pending">Active but RC pending</MenuItem></Select></FormField>
                            <FormField label="Insurance Premium Amount"><TextField fullWidth sx={inputSx} value={insurancePremiumAmount} onChange={(e) => setInsurancePremiumAmount(e.target.value)} /></FormField>
                        </Grid>
                        <ActionButtons onClear={handleInsuranceClear} onSave={handleInsuranceUpdate} />
                    </ExpandableSection>

                    {/* Warranty */}
                    <ExpandableSection title="Warranty & Service claim" expanded={expandedSections.warranty} onToggle={() => toggleSection('warranty')}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <InputLabel sx={labelSx}>Warranty</InputLabel>
                                <RadioGroup row value={warrantyProvided} onChange={(e) => setWarrantyProvided(e.target.value)}>
                                    <FormControlLabel value="Provided" control={<Radio size="small" />} label="Provided" />
                                    <FormControlLabel value="Not provided" control={<Radio size="small" />} label="Not provided" />
                                </RadioGroup>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <InputLabel sx={labelSx}>Warranty Provided by</InputLabel>
                                <RadioGroup row value={warrantyProvidedBy} onChange={(e) => setWarrantyProvidedBy(e.target.value)}>
                                    <FormControlLabel value="Manufacturer" control={<Radio size="small" />} label="Manufacturer" />
                                    <FormControlLabel value="Dealer" control={<Radio size="small" />} label="Dealer" />
                                </RadioGroup>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <InputLabel sx={labelSx}>Warranty Type</InputLabel>
                                <RadioGroup row value={warrantyType} onChange={(e) => setWarrantyType(e.target.value)}>
                                    <FormControlLabel value="Standard" control={<Radio size="small" />} label="Standard" />
                                    <FormControlLabel value="Extended" control={<Radio size="small" />} label="Extended" />
                                </RadioGroup>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <InputLabel sx={labelSx}>Warranty Coverage for</InputLabel>
                                <Select fullWidth sx={selectSx} value={warrantyCoverageFor} onChange={(e) => setWarrantyCoverageFor(e.target.value)} displayEmpty><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="Engine">Engine</MenuItem><MenuItem value="Gearbox">Gearbox</MenuItem><MenuItem value="Full Vehicle">Full Vehicle</MenuItem></Select>
                            </Grid>
                            <FormField label="Full vehicle Warranty Start date" gridSize={3}><TextField fullWidth sx={inputSx} type="date" value={fullVehicleWarrantyStartDate} onChange={(e) => setFullVehicleWarrantyStartDate(e.target.value)} /></FormField>
                            <FormField label="Full vehicle Warranty End date" gridSize={3}><TextField fullWidth sx={inputSx} type="date" value={fullVehicleWarrantyEndDate} onChange={(e) => setFullVehicleWarrantyEndDate(e.target.value)} /></FormField>
                            <FormField label="Full vehicle warranty period (Auto calculate)" gridSize={3}><TextField fullWidth sx={inputSx} value={fullVehicleWarrantyPeriod} InputProps={{ readOnly: true }} /></FormField>
                        </Grid>
                        <ActionButtons onClear={handleWarrantyClear} onSave={handleWarrantyUpdate} />
                    </ExpandableSection>

                    {/* Documents */}
                    <ExpandableSection title="Documents" expanded={expandedSections.documents} onToggle={() => toggleSection('documents')}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 6, sm: 4, md: 2 }}><DocumentUploadBox label="RC Book /Reg Certificate" preview={rcBookPreview} inputRef={rcBookRef} onFileChange={(e) => handleDocumentChange(e, setRcBook, setRcBookPreview)} onDrop={(e) => handleDocumentDrop(e, setRcBook, setRcBookPreview)} /></Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 2 }}><DocumentUploadBox label="Fitness Certificate" preview={fitnessCertificatePreview} inputRef={fitnessCertificateRef} onFileChange={(e) => handleDocumentChange(e, setFitnessCertificate, setFitnessCertificatePreview)} onDrop={(e) => handleDocumentDrop(e, setFitnessCertificate, setFitnessCertificatePreview)} /></Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 2 }}><DocumentUploadBox label="Road Tax Certificate" preview={roadTaxCertificatePreview} inputRef={roadTaxCertificateRef} onFileChange={(e) => handleDocumentChange(e, setRoadTaxCertificate, setRoadTaxCertificatePreview)} onDrop={(e) => handleDocumentDrop(e, setRoadTaxCertificate, setRoadTaxCertificatePreview)} /></Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 2 }}><DocumentUploadBox label="Insurance" preview={insuranceDocPreview} inputRef={insuranceDocRef} onFileChange={(e) => handleDocumentChange(e, setInsuranceDoc, setInsuranceDocPreview)} onDrop={(e) => handleDocumentDrop(e, setInsuranceDoc, setInsuranceDocPreview)} /></Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 2 }}><DocumentUploadBox label="PUC Certificate" preview={pucCertificatePreview} inputRef={pucCertificateRef} onFileChange={(e) => handleDocumentChange(e, setPucCertificate, setPucCertificatePreview)} onDrop={(e) => handleDocumentDrop(e, setPucCertificate, setPucCertificatePreview)} /></Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 2 }}><DocumentUploadBox label="Permit Document" preview={permitDocumentPreview} inputRef={permitDocumentRef} onFileChange={(e) => handleDocumentChange(e, setPermitDocument, setPermitDocumentPreview)} onDrop={(e) => handleDocumentDrop(e, setPermitDocument, setPermitDocumentPreview)} /></Grid>
                        </Grid>
                        <ActionButtons onClear={handleDocumentsClear} onSave={handleDocumentsUpdate} />
                    </ExpandableSection>
                </TabPanel>

                {/* Tab 2: Safety & Compliance */}
                <TabPanel value={tabValue} index={1}>
                    {/* FC Details */}
                    <ExpandableSection title="FC Details" expanded={expandedSections.fcDetails} onToggle={() => toggleSection('fcDetails')}>
                        <Grid container spacing={2}>
                            <FormField label="FC Type"><Select fullWidth sx={selectSx} value={fcType} onChange={(e) => setFcType(e.target.value)} displayEmpty><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="Initial">Initial</MenuItem><MenuItem value="Renewal">Renewal</MenuItem><MenuItem value="Reinspection">Reinspection</MenuItem><MenuItem value="Conditional">Conditional</MenuItem></Select></FormField>
                            <FormField label="FC Number"><TextField fullWidth sx={inputSx} value={fcNumber} onChange={(e) => setFcNumber(e.target.value)} /></FormField>
                            <FormField label="FC Issue Date"><TextField fullWidth sx={inputSx} type="date" value={fcIssueDate} onChange={(e) => setFcIssueDate(e.target.value)} /></FormField>
                            <FormField label="FC Expiry Date"><TextField fullWidth sx={inputSx} type="date" value={fcExpiryDate} onChange={(e) => setFcExpiryDate(e.target.value)} /></FormField>
                            <FormField label="FC Validity Duration (Auto Calculated)"><TextField fullWidth sx={inputSx} value={fcValidityDuration} onChange={(e) => setFcValidityDuration(e.target.value)} /></FormField>
                            <FormField label="Last Valid Date (Auto Calculated)"><TextField fullWidth sx={inputSx} value={fcLastValidDate} onChange={(e) => setFcLastValidDate(e.target.value)} /></FormField>
                            <FormField label="Renewal Reminder"><Select fullWidth sx={selectSx} value={fcRenewalReminder} onChange={(e) => setFcRenewalReminder(e.target.value)}><MenuItem value="30 days before Expiry">30 days before Expiry</MenuItem><MenuItem value="15 days before Expiry">15 days before Expiry</MenuItem><MenuItem value="7 days before Expiry">7 days before Expiry</MenuItem><MenuItem value="60 days before Expiry">60 days before Expiry</MenuItem></Select></FormField>
                            <FormField label="Current FC Status"><TextField fullWidth sx={inputSx} value={fcCurrentStatus} onChange={(e) => setFcCurrentStatus(e.target.value)} /></FormField>
                            <Grid size={{ xs: 12, sm: 6, md: 4.8 }}>
                                <InputLabel sx={labelSx}>Notes about Inspection</InputLabel>
                                <TextField fullWidth multiline rows={3} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px", backgroundColor: "#fff" } }} value={fcNotesAboutInspection} onChange={(e) => setFcNotesAboutInspection(e.target.value)} />
                            </Grid>
                        </Grid>
                        <ActionButtons onClear={handleFCDetailsClear} onSave={handleFCDetailsUpdate} />
                    </ExpandableSection>

                    {/* Permit Details */}
                    <ExpandableSection title="Permit Detail" expanded={expandedSections.permitDetail} onToggle={() => toggleSection('permitDetail')}>
                        <Grid container spacing={2}>
                            <FormField label="Permit Number"><TextField fullWidth sx={inputSx} value={permitNumber} onChange={(e) => setPermitNumber(e.target.value)} /></FormField>
                            <FormField label="Permit Type"><Select fullWidth sx={selectSx} value={permitType} onChange={(e) => setPermitType(e.target.value)} displayEmpty><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="Contract Carriage">Contract Carriage</MenuItem><MenuItem value="Stage Carriage">Stage Carriage</MenuItem><MenuItem value="Private Service Vehicle">Private Service Vehicle</MenuItem><MenuItem value="All India Tourist">All India Tourist</MenuItem></Select></FormField>
                            <FormField label="Issuing RTO"><TextField fullWidth sx={inputSx} value={issuingRto} onChange={(e) => setIssuingRto(e.target.value)} /></FormField>
                            <FormField label="Valid Date From"><TextField fullWidth sx={inputSx} type="date" value={permitValidDateFrom} onChange={(e) => setPermitValidDateFrom(e.target.value)} /></FormField>
                            <FormField label="Valid Till"><TextField fullWidth sx={inputSx} type="date" value={permitValidTill} onChange={(e) => setPermitValidTill(e.target.value)} /></FormField>
                            <FormField label="Permit Validity Duration (Auto Calculated)"><TextField fullWidth sx={inputSx} value={permitValidityDuration} onChange={(e) => setPermitValidityDuration(e.target.value)} /></FormField>
                            <FormField label="Permit Area of Operation"><Select fullWidth sx={selectSx} value={permitAreaOfOperation} onChange={(e) => setPermitAreaOfOperation(e.target.value)} displayEmpty><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="District">District</MenuItem><MenuItem value="State">State</MenuItem></Select></FormField>
                            <FormField label="Permit Route (Optional)"><TextField fullWidth sx={inputSx} value={permitRoute} onChange={(e) => setPermitRoute(e.target.value)} /></FormField>
                        </Grid>
                        <ActionButtons onClear={handlePermitDetailClear} onSave={handlePermitDetailUpdate} />
                    </ExpandableSection>

                    {/* PUC Details */}
                    <ExpandableSection title="PUC Detail" expanded={expandedSections.pucDetail} onToggle={() => toggleSection('pucDetail')}>
                        <Grid container spacing={2}>
                            <FormField label="PUC Certificate Number"><TextField fullWidth sx={inputSx} value={pucCertificateNumber} onChange={(e) => setPucCertificateNumber(e.target.value)} /></FormField>
                            <FormField label="PUC Issue Date"><TextField fullWidth sx={inputSx} type="date" value={pucIssueDate} onChange={(e) => setPucIssueDate(e.target.value)} /></FormField>
                            <FormField label="PUC Expiry Date"><TextField fullWidth sx={inputSx} type="date" value={pucExpiryDate} onChange={(e) => setPucExpiryDate(e.target.value)} /></FormField>
                            <FormField label="PUC Validity Status"><Select fullWidth sx={selectSx} value={pucValidityStatus} onChange={(e) => setPucValidityStatus(e.target.value)} displayEmpty><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="Valid">Valid</MenuItem><MenuItem value="Expired">Expired</MenuItem></Select></FormField>
                        </Grid>
                        <ActionButtons onClear={handlePUCDetailClear} onSave={handlePUCDetailUpdate} />
                    </ExpandableSection>

                    {/* Road Tax */}
                    <ExpandableSection title="State Road Transport Tax Details" expanded={expandedSections.roadTax} onToggle={() => toggleSection('roadTax')}>
                        <Grid container spacing={2}>
                            <FormField label="Tax Type"><Select fullWidth sx={selectSx} value={taxType} onChange={(e) => setTaxType(e.target.value)} displayEmpty><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="Quarterly">Quarterly</MenuItem><MenuItem value="Half Yearly">Half Yearly</MenuItem><MenuItem value="Annual">Annual</MenuItem><MenuItem value="One Time">One Time</MenuItem></Select></FormField>
                            <FormField label="Tax Paid Date"><TextField fullWidth sx={inputSx} type="date" value={taxPaidDate} onChange={(e) => setTaxPaidDate(e.target.value)} /></FormField>
                            <FormField label="Tax Expiry Date"><TextField fullWidth sx={inputSx} type="date" value={taxExpiryDate} onChange={(e) => setTaxExpiryDate(e.target.value)} /></FormField>
                            <FormField label="Tax Status"><Select fullWidth sx={selectSx} value={taxStatus} onChange={(e) => setTaxStatus(e.target.value)} displayEmpty><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="Paid">Paid</MenuItem><MenuItem value="Pending">Pending</MenuItem><MenuItem value="Overdue">Overdue</MenuItem></Select></FormField>
                            <FormField label="Tax Receipt Number"><TextField fullWidth sx={inputSx} value={taxReceiptNumber} onChange={(e) => setTaxReceiptNumber(e.target.value)} /></FormField>
                        </Grid>
                        <ActionButtons onClear={handleRoadTaxClear} onSave={handleRoadTaxUpdate} />
                    </ExpandableSection>

                    {/* CCTV & Safety Equipment */}
                    <ExpandableSection title="CCTV Camera & Safety Equipment Installation" expanded={expandedSections.cctvCamera} onToggle={() => toggleSection('cctvCamera')}>
                        {/* CCTV Camera Installation */}
                        <Typography sx={{ fontWeight: 600, mb: 2, color: "#1976D2", borderBottom: "1px solid #E0E0E0", pb: 1 }}>CCTV Camera Installation</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 2.4 }}>
                                <InputLabel sx={labelSx}>CCTV Installed</InputLabel>
                                <RadioGroup row value={cctvInstalled} onChange={(e) => setCctvInstalled(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Number of Cameras"><TextField fullWidth sx={inputSx} value={numberOfCameras} onChange={(e) => setNumberOfCameras(e.target.value)} /></FormField>
                            <Grid size={{ xs: 12, md: 2.4 }}>
                                <InputLabel sx={labelSx}>Dealer/Installer Same</InputLabel>
                                <RadioGroup row value={cctvDealerInstallerSame} onChange={(e) => setCctvDealerInstallerSame(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Date of Installation"><TextField fullWidth sx={inputSx} type="date" value={camera1DateOfInstallation} onChange={(e) => setCamera1DateOfInstallation(e.target.value)} /></FormField>
                            <FormField label="Dealer/Installer Name"><TextField fullWidth sx={inputSx} value={camera1DealerInstallerName} onChange={(e) => setCamera1DealerInstallerName(e.target.value)} /></FormField>
                            <FormField label="Camera Type"><TextField fullWidth sx={inputSx} value={camera1Type} onChange={(e) => setCamera1Type(e.target.value)} /></FormField>
                            <FormField label="Vendor Contact Details"><TextField fullWidth sx={inputSx} value={camera1VendorContactDetails} onChange={(e) => setCamera1VendorContactDetails(e.target.value)} /></FormField>
                            <FormField label="Remarks"><TextField fullWidth sx={inputSx} value={camera1Remarks} onChange={(e) => setCamera1Remarks(e.target.value)} /></FormField>
                        </Grid>

                        {/* First Aid Kit */}
                        <Typography sx={{ fontWeight: 600, mb: 2, mt: 3, color: "#1976D2", borderBottom: "1px solid #E0E0E0", pb: 1 }}>First Aid Kit Installation</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 2.4 }}>
                                <InputLabel sx={labelSx}>First Aid Kit Installed</InputLabel>
                                <RadioGroup row value={firstAidKitInstallation} onChange={(e) => setFirstAidKitInstallation(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Date of Installation"><TextField fullWidth sx={inputSx} type="date" value={firstAidDateOfInstallation} onChange={(e) => setFirstAidDateOfInstallation(e.target.value)} /></FormField>
                            <FormField label="Expiry Check Due Date"><TextField fullWidth sx={inputSx} type="date" value={firstAidExpiryCheckDueDate} onChange={(e) => setFirstAidExpiryCheckDueDate(e.target.value)} /></FormField>
                            <FormField label="Last Inspection Date"><TextField fullWidth sx={inputSx} type="date" value={firstAidLastInspectionDate} onChange={(e) => setFirstAidLastInspectionDate(e.target.value)} /></FormField>
                            <FormField label="Remarks"><TextField fullWidth sx={inputSx} value={firstAidRemarks} onChange={(e) => setFirstAidRemarks(e.target.value)} /></FormField>
                        </Grid>

                        {/* Safety Grills & Exit Doors */}
                        <Typography sx={{ fontWeight: 600, mb: 2, mt: 3, color: "#1976D2", borderBottom: "1px solid #E0E0E0", pb: 1 }}>Safety Grills & Exit Doors</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 2.4 }}>
                                <InputLabel sx={labelSx}>Safety Grills Installed</InputLabel>
                                <RadioGroup row value={safetyGrillsInstalled} onChange={(e) => setSafetyGrillsInstalled(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Grill Location"><TextField fullWidth sx={inputSx} value={grillLocation} onChange={(e) => setGrillLocation(e.target.value)} /></FormField>
                            <Grid size={{ xs: 12, md: 2.4 }}>
                                <InputLabel sx={labelSx}>Emergency Exit Available</InputLabel>
                                <RadioGroup row value={emergencyExitAvailable} onChange={(e) => setEmergencyExitAvailable(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Emergency Exit Location"><TextField fullWidth sx={inputSx} value={emergencyExitLocation} onChange={(e) => setEmergencyExitLocation(e.target.value)} /></FormField>
                            <Grid size={{ xs: 12, md: 2.4 }}>
                                <InputLabel sx={labelSx}>Compliance As Per Norms</InputLabel>
                                <RadioGroup row value={complianceAsPerNorms} onChange={(e) => setComplianceAsPerNorms(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Inspection Date"><TextField fullWidth sx={inputSx} type="date" value={safetyInstallationInspectionDate} onChange={(e) => setSafetyInstallationInspectionDate(e.target.value)} /></FormField>
                            <FormField label="Remarks"><TextField fullWidth sx={inputSx} value={safetyRemarks} onChange={(e) => setSafetyRemarks(e.target.value)} /></FormField>
                        </Grid>

                        {/* Speed Governor */}
                        <Typography sx={{ fontWeight: 600, mb: 2, mt: 3, color: "#1976D2", borderBottom: "1px solid #E0E0E0", pb: 1 }}>Speed Governor Installation</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 2.4 }}>
                                <InputLabel sx={labelSx}>Speed Governor Installed</InputLabel>
                                <RadioGroup row value={speedGovernorInstallation} onChange={(e) => setSpeedGovernorInstallation(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Date of Installation"><TextField fullWidth sx={inputSx} type="date" value={speedGovernorDateOfInstallation} onChange={(e) => setSpeedGovernorDateOfInstallation(e.target.value)} /></FormField>
                            <FormField label="Vendor Name"><TextField fullWidth sx={inputSx} value={speedGovernorVendorName} onChange={(e) => setSpeedGovernorVendorName(e.target.value)} /></FormField>
                            <FormField label="Speed Limit Set (Kmph)"><TextField fullWidth sx={inputSx} value={speedLimitSet} onChange={(e) => setSpeedLimitSet(e.target.value)} /></FormField>
                            <FormField label="Certificate Number"><TextField fullWidth sx={inputSx} value={speedGovernorCertificateNumber} onChange={(e) => setSpeedGovernorCertificateNumber(e.target.value)} /></FormField>
                            <FormField label="Validity Date"><TextField fullWidth sx={inputSx} type="date" value={speedGovernorValidityDate} onChange={(e) => setSpeedGovernorValidityDate(e.target.value)} /></FormField>
                            <FormField label="Remarks"><TextField fullWidth sx={inputSx} value={speedGovernorRemarks} onChange={(e) => setSpeedGovernorRemarks(e.target.value)} /></FormField>
                        </Grid>

                        {/* Fire Extinguisher */}
                        <Typography sx={{ fontWeight: 600, mb: 2, mt: 3, color: "#1976D2", borderBottom: "1px solid #E0E0E0", pb: 1 }}>Fire Extinguisher Installation</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 2.4 }}>
                                <InputLabel sx={labelSx}>Fire Extinguisher Installed</InputLabel>
                                <RadioGroup row value={fireExtinguisherInstallation} onChange={(e) => setFireExtinguisherInstallation(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Date of Installation"><TextField fullWidth sx={inputSx} type="date" value={fireExtinguisherDateOfInstallation} onChange={(e) => setFireExtinguisherDateOfInstallation(e.target.value)} /></FormField>
                            <FormField label="Expiry Date"><TextField fullWidth sx={inputSx} type="date" value={fireExtinguisherExpiryDate} onChange={(e) => setFireExtinguisherExpiryDate(e.target.value)} /></FormField>
                            <FormField label="Type & Capacity"><TextField fullWidth sx={inputSx} value={extinguisherTypeCapacity} onChange={(e) => setExtinguisherTypeCapacity(e.target.value)} /></FormField>
                            <FormField label="Vendor Details"><TextField fullWidth sx={inputSx} value={fireExtinguisherVendorDetails} onChange={(e) => setFireExtinguisherVendorDetails(e.target.value)} /></FormField>
                            <FormField label="Remarks"><TextField fullWidth sx={inputSx} value={fireExtinguisherRemarks} onChange={(e) => setFireExtinguisherRemarks(e.target.value)} /></FormField>
                        </Grid>

                        {/* GPS Tracker */}
                        <Typography sx={{ fontWeight: 600, mb: 2, mt: 3, color: "#1976D2", borderBottom: "1px solid #E0E0E0", pb: 1 }}>GPS Tracker Installation</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 2.4 }}>
                                <InputLabel sx={labelSx}>GPS Installed</InputLabel>
                                <RadioGroup row value={gpsTrackerInstallation} onChange={(e) => setGpsTrackerInstallation(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Date of Installation"><TextField fullWidth sx={inputSx} type="date" value={gpsDateOfInstallation} onChange={(e) => setGpsDateOfInstallation(e.target.value)} /></FormField>
                            <FormField label="Device ID / IMEI"><TextField fullWidth sx={inputSx} value={gpsDeviceIdImei} onChange={(e) => setGpsDeviceIdImei(e.target.value)} /></FormField>
                            <FormField label="Hardware Warranty"><TextField fullWidth sx={inputSx} value={gpsHardwareWarranty} onChange={(e) => setGpsHardwareWarranty(e.target.value)} /></FormField>
                            <FormField label="Owner Name & Address"><TextField fullWidth sx={inputSx} value={gpsOwnerNameAddress} onChange={(e) => setGpsOwnerNameAddress(e.target.value)} /></FormField>
                            <FormField label="SIM Number"><TextField fullWidth sx={inputSx} value={gpsSimNumber} onChange={(e) => setGpsSimNumber(e.target.value)} /></FormField>
                            <FormField label="Subscription Valid Till"><TextField fullWidth sx={inputSx} type="date" value={gpsSubscriptionValidTill} onChange={(e) => setGpsSubscriptionValidTill(e.target.value)} /></FormField>
                            <FormField label="Remarks"><TextField fullWidth sx={inputSx} value={gpsRemarks} onChange={(e) => setGpsRemarks(e.target.value)} /></FormField>
                        </Grid>
                        <ActionButtons onClear={handleCCTVCameraClear} onSave={handleCCTVCameraUpdate} />
                    </ExpandableSection>

                    {/* Bus Branding */}
                    <ExpandableSection title="Bus Branding & Visual Identity" expanded={expandedSections.busBranding} onToggle={() => toggleSection('busBranding')}>
                        {/* School Name Display */}
                        <Typography sx={{ fontWeight: 600, mb: 2, color: "#1976D2", borderBottom: "1px solid #E0E0E0", pb: 1 }}>School Name Display</Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Front" label="School Name" value={schoolNameFrontSide} onChange={(e) => setSchoolNameFrontSide(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Back" label="School Name" value={schoolNameBackSide} onChange={(e) => setSchoolNameBackSide(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Left" label="School Name" value={schoolNameLeftSide} onChange={(e) => setSchoolNameLeftSide(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Right" label="School Name" value={schoolNameRightSide} onChange={(e) => setSchoolNameRightSide(e.target.value)} />
                            </Grid>
                        </Grid>

                        {/* Internal Name & Photo Display */}
                        <Typography sx={{ fontWeight: 600, mb: 2, color: "#1976D2", borderBottom: "1px solid #E0E0E0", pb: 1 }}>Internal Name & Photo Display</Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Front" label="Internal Name" value={internalNameFrontSide} onChange={(e) => setInternalNameFrontSide(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Back" label="Internal Name" value={internalNameBackSide} onChange={(e) => setInternalNameBackSide(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Left" label="Internal Name" value={internalNameLeftSide} onChange={(e) => setInternalNameLeftSide(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Right" label="Internal Name" value={internalNameRightSide} onChange={(e) => setInternalNameRightSide(e.target.value)} />
                            </Grid>
                        </Grid>

                        {/* Reflective Tapes Display */}
                        <Typography sx={{ fontWeight: 600, mb: 2, color: "#1976D2", borderBottom: "1px solid #E0E0E0", pb: 1 }}>Reflective Tapes Display</Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Front" label="Reflective Tapes" value={reflectiveTapesFrontSide} onChange={(e) => setReflectiveTapesFrontSide(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Back" label="Reflective Tapes" value={reflectiveTapesBackSide} onChange={(e) => setReflectiveTapesBackSide(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Left" label="Reflective Tapes" value={reflectiveTapesLeftSide} onChange={(e) => setReflectiveTapesLeftSide(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Right" label="Reflective Tapes" value={reflectiveTapesRightSide} onChange={(e) => setReflectiveTapesRightSide(e.target.value)} />
                            </Grid>
                        </Grid>

                        {/* School Bus Signage Display */}
                        <Typography sx={{ fontWeight: 600, mb: 2, color: "#1976D2", borderBottom: "1px solid #E0E0E0", pb: 1 }}>School Bus Signage Display</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Front" label="Signage" value={signageFrontSide} onChange={(e) => setSignageFrontSide(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Back" label="Signage" value={signageBackSide} onChange={(e) => setSignageBackSide(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Left" label="Signage" value={signageLeftSide} onChange={(e) => setSignageLeftSide(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <BrandingImageUploadBoxWithRadio side="Right" label="Signage" value={signageRightSide} onChange={(e) => setSignageRightSide(e.target.value)} />
                            </Grid>
                        </Grid>
                        <ActionButtons onClear={handleBusBrandingClear} onSave={handleBusBrandingUpdate} />
                    </ExpandableSection>
                </TabPanel>
            </Box>
        </Box>
    );
}
