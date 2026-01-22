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
    postVehicleSpecification,
    postVehicleRegistrationOwnership,
    postVehicleInsuranceCompliance,
    postVehicleWarrantyServiceClaim,
    postVehicleDocuments,
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
    color: "#333",
    fontWeight: 600,
    fontSize: "11px",
    mb: 0.5
};

// Form Field Component
const FormField = ({ label, children, required = false }) => (
    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
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

// Tab Panel Component
function TabPanel({ children, value, index }) {
    return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>;
}

export default function EditVehicleDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = "123";
    const { vehicleId } = location.state || {};
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);

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
    const [standingSpace, setStandingSpace] = useState("");
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

    // CCTV Camera
    const [cctvInstalled, setCctvInstalled] = useState("Yes");
    const [numberOfCameras, setNumberOfCameras] = useState("");
    const [cctvDealerInstallerSame, setCctvDealerInstallerSame] = useState("Yes");
    const [camera1DateOfInstallation, setCamera1DateOfInstallation] = useState("");
    const [camera1DealerInstallerName, setCamera1DealerInstallerName] = useState("");
    const [camera1Type, setCamera1Type] = useState("");
    const [camera1VendorContactDetails, setCamera1VendorContactDetails] = useState("");
    const [camera1Remarks, setCamera1Remarks] = useState("");

    // First Aid Kit
    const [firstAidKitInstallation, setFirstAidKitInstallation] = useState("Yes");
    const [firstAidDateOfInstallation, setFirstAidDateOfInstallation] = useState("");
    const [firstAidExpiryCheckDueDate, setFirstAidExpiryCheckDueDate] = useState("");
    const [firstAidLastInspectionDate, setFirstAidLastInspectionDate] = useState("");

    // Safety Grills
    const [safetyGrillsInstalled, setSafetyGrillsInstalled] = useState("Yes");
    const [grillLocation, setGrillLocation] = useState("");
    const [emergencyExitAvailable, setEmergencyExitAvailable] = useState("Yes");
    const [complianceAsPerNorms, setComplianceAsPerNorms] = useState("Yes");

    // Speed Governor
    const [speedGovernorInstallation, setSpeedGovernorInstallation] = useState("Yes");
    const [speedGovernorDateOfInstallation, setSpeedGovernorDateOfInstallation] = useState("");
    const [speedGovernorVendorName, setSpeedGovernorVendorName] = useState("");
    const [speedLimitSet, setSpeedLimitSet] = useState("");
    const [speedGovernorCertificateNumber, setSpeedGovernorCertificateNumber] = useState("");
    const [speedGovernorValidityDate, setSpeedGovernorValidityDate] = useState("");

    // Fire Extinguisher
    const [fireExtinguisherInstallation, setFireExtinguisherInstallation] = useState("Yes");
    const [fireExtinguisherDateOfInstallation, setFireExtinguisherDateOfInstallation] = useState("");
    const [fireExtinguisherExpiryDate, setFireExtinguisherExpiryDate] = useState("");
    const [extinguisherTypeCapacity, setExtinguisherTypeCapacity] = useState("");
    const [fireExtinguisherVendorDetails, setFireExtinguisherVendorDetails] = useState("");

    // GPS Tracker
    const [gpsTrackerInstallation, setGpsTrackerInstallation] = useState("Yes");
    const [gpsDateOfInstallation, setGpsDateOfInstallation] = useState("");
    const [gpsDeviceIdImei, setGpsDeviceIdImei] = useState("");
    const [gpsHardwareWarranty, setGpsHardwareWarranty] = useState("");
    const [gpsSimNumber, setGpsSimNumber] = useState("");
    const [gpsSubscriptionValidTill, setGpsSubscriptionValidTill] = useState("");

    // Bus Branding
    const [schoolNameFrontSide, setSchoolNameFrontSide] = useState("Yes");
    const [schoolNameBackSide, setSchoolNameBackSide] = useState("Yes");
    const [schoolNameLeftSide, setSchoolNameLeftSide] = useState("Yes");
    const [schoolNameRightSide, setSchoolNameRightSide] = useState("Yes");
    const [reflectiveTapesFrontSide, setReflectiveTapesFrontSide] = useState("Yes");
    const [reflectiveTapesBackSide, setReflectiveTapesBackSide] = useState("Yes");
    const [reflectiveTapesLeftSide, setReflectiveTapesLeftSide] = useState("Yes");
    const [reflectiveTapesRightSide, setReflectiveTapesRightSide] = useState("Yes");
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

    const handleDocumentChange = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDocumentDrop = (e, setFile, setPreview) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleBusPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBusPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setBusPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleBusPhotoDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setBusPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setBusPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // ==================== FETCH DATA ====================
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
            const data = res.data?.data || {};

            // Populate Acquisition Details
            setModeOfAcquisition(data.modeOfAcquisition || "New");
            setAcquisitionSourceType(data.vehicleAcquisitionSourceType || "Dealer");
            setAcquisitionDate(formatDateToYYYYMMDD(data.vehicleAcquisitionDate) || "");
            setVehicleAssetType(data.vehicleAssetType || "");
            setAssetSubType(data.vehicleAssetSubType || "");
            setVehicleBrand(data.vehicleBrand || "");
            setDealerName(data.dealerName || "");
            setDealerContactNumber(data.dealerContactNumber || "");
            setDealerAddress(data.dealerAddress || "");
            setDealerGstin(data.dealerGSTIN || "");
            setInvoiceNumber(data.invoiceOrTransferOrDonationNumber || "");
            setBusPhotoPreview(data.busPhotoUrl || null);

            // Populate Vehicle Specification
            setBusModelMake(data.busModelAndMake || "");
            setYearOfManufacture(data.yearOfManufacture || "");
            setEngineNumber(data.engineNumberAsPerRC || "");
            setEngineChassisNumber(data.engineChasisNumberAsPerRC || "");
            setFuelType(data.fuelTypeAsPerRC || "");
            setVehicleClass(data.vehicleClassAsPerRC || "");
            setFuelTankCapacity(data.fuelTankCapacity || "");
            setSeatingCapacity(data.seatingCapacity || "");
            setSeatsPerRow(data.seatsPerRow || "");
            setStandingSpace(data.standingSpace || "");
            setVehicleColor(data.vehicleColour || "");

            // Populate Registration & Ownership
            setRegistrationNumber(data.registrationNumberAsPerRC || "");
            setRtoNameCode(data.rtoNameAndCodeAsPerRC || "");
            setRegistrationDate(formatDateToYYYYMMDD(data.registrationDate) || "");
            setVehicleOwnershipType(data.vehicleOwnershipType || "");
            setVehicleOwnerName(data.vehicleOwnerNameAsPerRC || "");
            setOwnerPermanentAddress(data.ownerPermanentAddress || "");
            setOwnerContactNumber(data.ownerContactNumber || "");
            setVehicleOwnerLegalIdGst(data.vehicleOwnerLegalIdOrGST || "");

            // Populate Insurance
            setInsuranceCompanyName(data.insuranceCompanyName || "");
            setInsurancePolicyNumber(data.insurancePolicyNumber || "");
            setInsurancePolicyType(data.insurancePolicyType || "");
            setPolicyStartDate(formatDateToYYYYMMDD(data.policyStartDate) || "");
            setPolicyEndDate(formatDateToYYYYMMDD(data.policyEndDate) || "");
            setPrimaryInsuranceIdentifier(data.primaryInsuranceIdentifier || "");
            setCurrentInsuranceStatus(data.currentInsuranceStatus || "");
            setInsurancePremiumAmount(data.insurancePremiumAmount || "");

            // Populate Warranty
            setWarrantyProvided(data.warranty || "Provided");
            setWarrantyProvidedBy(data.warrantyProvidedBy || "Manufacturer");
            setWarrantyType(data.warrantyType || "Standard");
            setWarrantyCoverageFor(data.warrantyCoverageFor || "");
            setFullVehicleWarrantyStartDate(formatDateToYYYYMMDD(data.fullVehicleWarrantyStartDate) || "");
            setFullVehicleWarrantyEndDate(formatDateToYYYYMMDD(data.fullVehicleWarrantyEndDate) || "");
            setFullVehicleWarrantyPeriod(data.fullVehicleWarrantyPeriod || "");

            // Populate Document Previews
            setRcBookPreview(data.rcBookFileUrl || null);
            setFitnessCertificatePreview(data.fitnessCertificateFileUrl || null);
            setRoadTaxCertificatePreview(data.roadTaxCertificateFileUrl || null);
            setInsuranceDocPreview(data.insuranceDocumentFileUrl || null);
            setPucCertificatePreview(data.pucCertificateFileUrl || null);
            setPermitDocumentPreview(data.permitDocumentFileUrl || null);
        } catch (error) {
            console.error("Error fetching vehicle details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSafetyComplianceDetails = async () => {
        try {
            const res = await axios.get(findVehicleSafetyComplianceDetails, {
                params: { VehicleAssetID: vehicleId },
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res.data?.data || {};

            // FC Details
            setFcType(data.fcType || "");
            setFcNumber(data.fcNumber || "");
            setFcIssueDate(formatDateToYYYYMMDD(data.fcIssueDate) || "");
            setFcExpiryDate(formatDateToYYYYMMDD(data.fcExpiryDate) || "");
            setFcValidityDuration(data.fcValidityDuration || "");
            setFcLastValidDate(formatDateToYYYYMMDD(data.lastValidDate) || "");
            setFcRenewalReminder(data.renewalReminder || "30 days before Expiry");
            setFcCurrentStatus(data.currentFCStatus || "");
            setFcNotesAboutInspection(data.notesAboutInspection || "");

            // Permit Details
            setPermitNumber(data.permitNumber || "");
            setPermitType(data.permitType || "");
            setIssuingRto(data.issuingRTO || "");
            setPermitValidDateFrom(formatDateToYYYYMMDD(data.validDateFrom) || "");
            setPermitValidTill(formatDateToYYYYMMDD(data.validTill) || "");
            setPermitValidityDuration(data.permitValidityDuration || "");
            setPermitAreaOfOperation(data.permitAreaOfOperation || "");
            setPermitRoute(data.permitRoute || "");

            // PUC Details
            setPucCertificateNumber(data.pucCertificateNumber || "");
            setPucIssueDate(formatDateToYYYYMMDD(data.pucIssueDate) || "");
            setPucExpiryDate(formatDateToYYYYMMDD(data.pucExpiryDate) || "");
            setPucValidityStatus(data.pucValidityStatus || "");

            // Road Tax
            setTaxType(data.taxType || "");
            setTaxPaidDate(formatDateToYYYYMMDD(data.taxPaidDate) || "");
            setTaxExpiryDate(formatDateToYYYYMMDD(data.taxExpiryDate) || "");
            setTaxStatus(data.taxStatus || "");

            // CCTV
            setCctvInstalled(data.cctvInstalled || "Yes");
            setNumberOfCameras(data.numberOfCameras || "");
            setCctvDealerInstallerSame(data.cctvDealerInstallerSame || "Yes");
            setCamera1DateOfInstallation(formatDateToYYYYMMDD(data.camera1DateOfInstallation) || "");
            setCamera1DealerInstallerName(data.camera1DealerInstallerName || "");
            setCamera1Type(data.camera1Type || "");
            setCamera1VendorContactDetails(data.camera1VendorContactDetails || "");
            setCamera1Remarks(data.camera1Remarks || "");

            // First Aid Kit
            setFirstAidKitInstallation(data.firstAidKitInstallation || "Yes");
            setFirstAidDateOfInstallation(formatDateToYYYYMMDD(data.firstAidDateOfInstallation) || "");
            setFirstAidExpiryCheckDueDate(formatDateToYYYYMMDD(data.firstAidExpiryCheckDueDate) || "");
            setFirstAidLastInspectionDate(formatDateToYYYYMMDD(data.firstAidLastInspectionDate) || "");

            // Safety Grills
            setSafetyGrillsInstalled(data.safetyGrillsInstalled || "Yes");
            setGrillLocation(data.grillLocation || "");
            setEmergencyExitAvailable(data.emergencyExitAvailable || "Yes");
            setComplianceAsPerNorms(data.complianceAsPerNorms || "Yes");

            // Speed Governor
            setSpeedGovernorInstallation(data.speedGovernorInstallation || "Yes");
            setSpeedGovernorDateOfInstallation(formatDateToYYYYMMDD(data.speedGovernorDateOfInstallation) || "");
            setSpeedGovernorVendorName(data.speedGovernorVendorName || "");
            setSpeedLimitSet(data.speedLimitSet || "");
            setSpeedGovernorCertificateNumber(data.speedGovernorCertificateNumber || "");
            setSpeedGovernorValidityDate(formatDateToYYYYMMDD(data.speedGovernorValidityDate) || "");

            // Fire Extinguisher
            setFireExtinguisherInstallation(data.fireExtinguisherInstallation || "Yes");
            setFireExtinguisherDateOfInstallation(formatDateToYYYYMMDD(data.fireExtinguisherDateOfInstallation) || "");
            setFireExtinguisherExpiryDate(formatDateToYYYYMMDD(data.fireExtinguisherExpiryDate) || "");
            setExtinguisherTypeCapacity(data.extinguisherTypeCapacity || "");
            setFireExtinguisherVendorDetails(data.fireExtinguisherVendorDetails || "");

            // GPS Tracker
            setGpsTrackerInstallation(data.gpsTrackerInstallation || "Yes");
            setGpsDateOfInstallation(formatDateToYYYYMMDD(data.gpsDateOfInstallation) || "");
            setGpsDeviceIdImei(data.gpsDeviceIdImei || "");
            setGpsHardwareWarranty(data.gpsHardwareWarranty || "");
            setGpsSimNumber(data.gpsSimNumber || "");
            setGpsSubscriptionValidTill(formatDateToYYYYMMDD(data.gpsSubscriptionValidTill) || "");

            // Bus Branding
            setSchoolNameFrontSide(data.schoolNameFrontSide || "Yes");
            setSchoolNameBackSide(data.schoolNameBackSide || "Yes");
            setSchoolNameLeftSide(data.schoolNameLeftSide || "Yes");
            setSchoolNameRightSide(data.schoolNameRightSide || "Yes");
            setReflectiveTapesFrontSide(data.reflectiveTapesFrontSide || "Yes");
            setReflectiveTapesBackSide(data.reflectiveTapesBackSide || "Yes");
            setReflectiveTapesLeftSide(data.reflectiveTapesLeftSide || "Yes");
            setReflectiveTapesRightSide(data.reflectiveTapesRightSide || "Yes");
            setSignageFrontSide(data.signageFrontSide || "Yes");
            setSignageBackSide(data.signageBackSide || "Yes");
            setSignageLeftSide(data.signageLeftSide || "Yes");
            setSignageRightSide(data.signageRightSide || "Yes");
        } catch (error) {
            console.error("Error fetching safety compliance details:", error);
        }
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
            await axios.post(postVehicleAcquisitionDetail, sendData, { headers: { Authorization: `Bearer ${token}` } });
            setMessage("Acquisition Details updated successfully");
            setOpen(true); setColor(true); setStatus(true);
        } catch (error) {
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
                SeatingCapacity: seatingCapacity, SeatsPerRow: seatsPerRow, StandingSpace: standingSpace, VehicleColour: vehicleColor
            };
            await axios.post(postVehicleSpecification, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("Vehicle Specification updated successfully");
            setOpen(true); setColor(true); setStatus(true);
        } catch (error) {
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
            await axios.post(postVehicleRegistrationOwnership, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("Registration & Ownership updated successfully");
            setOpen(true); setColor(true); setStatus(true);
        } catch (error) {
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
            await axios.post(postVehicleInsuranceCompliance, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("Insurance Details updated successfully");
            setOpen(true); setColor(true); setStatus(true);
        } catch (error) {
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
            await axios.post(postVehicleWarrantyServiceClaim, sendData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
            setMessage("Warranty Details updated successfully");
            setOpen(true); setColor(true); setStatus(true);
        } catch (error) {
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
            await axios.post(postVehicleDocuments, sendData, { headers: { Authorization: `Bearer ${token}` } });
            setMessage("Documents updated successfully");
            setOpen(true); setColor(true); setStatus(true);
        } catch (error) {
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
                CurrentFCStatus: fcCurrentStatus, NotesAboutInspection: fcNotesAboutInspection
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
                TaxExpiryDate: formatDateToDDMMYYYY(taxExpiryDate), TaxStatus: taxStatus
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
                Camera1VendorContactDetails: camera1VendorContactDetails, Camera1Remarks: camera1Remarks,
                FirstAidKitInstallation: firstAidKitInstallation, FirstAidDateOfInstallation: formatDateToDDMMYYYY(firstAidDateOfInstallation),
                FirstAidExpiryCheckDueDate: formatDateToDDMMYYYY(firstAidExpiryCheckDueDate), FirstAidLastInspectionDate: formatDateToDDMMYYYY(firstAidLastInspectionDate),
                SafetyGrillsInstalled: safetyGrillsInstalled, GrillLocation: grillLocation, EmergencyExitAvailable: emergencyExitAvailable,
                ComplianceAsPerNorms: complianceAsPerNorms, SpeedGovernorInstallation: speedGovernorInstallation,
                SpeedGovernorDateOfInstallation: formatDateToDDMMYYYY(speedGovernorDateOfInstallation), SpeedGovernorVendorName: speedGovernorVendorName,
                SpeedLimitSet: speedLimitSet, SpeedGovernorCertificateNumber: speedGovernorCertificateNumber,
                SpeedGovernorValidityDate: formatDateToDDMMYYYY(speedGovernorValidityDate), FireExtinguisherInstallation: fireExtinguisherInstallation,
                FireExtinguisherDateOfInstallation: formatDateToDDMMYYYY(fireExtinguisherDateOfInstallation),
                FireExtinguisherExpiryDate: formatDateToDDMMYYYY(fireExtinguisherExpiryDate), ExtinguisherTypeCapacity: extinguisherTypeCapacity,
                FireExtinguisherVendorDetails: fireExtinguisherVendorDetails, GPSTrackerInstallation: gpsTrackerInstallation,
                GPSDateOfInstallation: formatDateToDDMMYYYY(gpsDateOfInstallation), GPSDeviceIdIMEI: gpsDeviceIdImei,
                GPSHardwareWarranty: gpsHardwareWarranty, GPSSimNumber: gpsSimNumber, GPSSubscriptionValidTill: formatDateToDDMMYYYY(gpsSubscriptionValidTill)
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
                    <Typography sx={{ ml: 2, px: 2, py: 0.5, backgroundColor: "#E3F2FD", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#1976D2" }}>
                        {vehicleId}
                    </Typography>
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
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Mode of Acquisition</InputLabel>
                                        <RadioGroup row value={modeOfAcquisition} onChange={(e) => setModeOfAcquisition(e.target.value)}>
                                            <FormControlLabel value="New" control={<Radio size="small" />} label={<Typography fontSize="13px">New</Typography>} />
                                            <FormControlLabel value="Used" control={<Radio size="small" />} label={<Typography fontSize="13px">Used</Typography>} />
                                        </RadioGroup>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Acquisition Source Type</InputLabel>
                                        <Select fullWidth sx={selectSx} value={acquisitionSourceType} onChange={(e) => setAcquisitionSourceType(e.target.value)}>
                                            <MenuItem value="Dealer">Dealer</MenuItem>
                                            <MenuItem value="Previous Owner">Previous Owner</MenuItem>
                                            <MenuItem value="Donor">Donor</MenuItem>
                                        </Select>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Acquisition Date</InputLabel>
                                        <TextField fullWidth sx={inputSx} type="date" value={acquisitionDate} onChange={(e) => setAcquisitionDate(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Vehicle Asset Type</InputLabel>
                                        <Select fullWidth sx={selectSx} value={vehicleAssetType} onChange={(e) => setVehicleAssetType(e.target.value)}>
                                            <MenuItem value="Bus">Bus</MenuItem>
                                            <MenuItem value="Van">Van</MenuItem>
                                            <MenuItem value="Car">Car</MenuItem>
                                        </Select>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Asset Sub Type</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={assetSubType} onChange={(e) => setAssetSubType(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Vehicle Brand</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={vehicleBrand} onChange={(e) => setVehicleBrand(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Dealer Name</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={dealerName} onChange={(e) => setDealerName(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Dealer Contact</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={dealerContactNumber} onChange={(e) => setDealerContactNumber(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Dealer Address</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={dealerAddress} onChange={(e) => setDealerAddress(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Dealer GSTIN</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={dealerGstin} onChange={(e) => setDealerGstin(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <InputLabel sx={labelSx}>Invoice Number</InputLabel>
                                        <TextField fullWidth sx={inputSx} value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                                    </Grid>
                                </Grid>
                            </Box>
                            <Box sx={{ width: 200 }}>
                                <InputLabel sx={labelSx}>Bus Photo</InputLabel>
                                <input type="file" ref={busPhotoInputRef} onChange={handleBusPhotoChange} accept="image/*" style={{ display: 'none' }} />
                                <Box onClick={() => busPhotoInputRef.current?.click()} onDrop={handleBusPhotoDrop} onDragOver={(e) => e.preventDefault()}
                                    sx={{ width: "100%", height: 150, border: "2px dashed #1976D2", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", backgroundColor: "#E3F2FD", overflow: "hidden", "&:hover": { backgroundColor: "#BBDEFB" } }}>
                                    {busPhotoPreview ? <img src={busPhotoPreview} alt="Bus" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UploadFileIcon sx={{ fontSize: 48, color: "#666" }} />}
                                </Box>
                            </Box>
                        </Box>
                        <ActionButtons onClear={() => {}} onSave={handleAcquisitionDetailsUpdate} />
                    </ExpandableSection>

                    {/* Vehicle Specification */}
                    <ExpandableSection title="Vehicle Specification" expanded={expandedSections.specification} onToggle={() => toggleSection('specification')}>
                        <Grid container spacing={2}>
                            <FormField label="Bus Model & Make"><TextField fullWidth sx={inputSx} value={busModelMake} onChange={(e) => setBusModelMake(e.target.value)} /></FormField>
                            <FormField label="Year of Manufacture"><TextField fullWidth sx={inputSx} value={yearOfManufacture} onChange={(e) => setYearOfManufacture(e.target.value)} /></FormField>
                            <FormField label="Engine Number"><TextField fullWidth sx={inputSx} value={engineNumber} onChange={(e) => setEngineNumber(e.target.value)} /></FormField>
                            <FormField label="Chassis Number"><TextField fullWidth sx={inputSx} value={engineChassisNumber} onChange={(e) => setEngineChassisNumber(e.target.value)} /></FormField>
                            <FormField label="Fuel Type"><Select fullWidth sx={selectSx} value={fuelType} onChange={(e) => setFuelType(e.target.value)}><MenuItem value="Diesel">Diesel</MenuItem><MenuItem value="Petrol">Petrol</MenuItem><MenuItem value="Electric">Electric</MenuItem><MenuItem value="CNG">CNG</MenuItem></Select></FormField>
                            <FormField label="Vehicle Class"><Select fullWidth sx={selectSx} value={vehicleClass} onChange={(e) => setVehicleClass(e.target.value)}><MenuItem value="Transport">Transport</MenuItem><MenuItem value="Non-transport">Non-transport</MenuItem></Select></FormField>
                            <FormField label="Fuel Tank Capacity"><TextField fullWidth sx={inputSx} value={fuelTankCapacity} onChange={(e) => setFuelTankCapacity(e.target.value)} /></FormField>
                            <FormField label="Seating Capacity"><TextField fullWidth sx={inputSx} value={seatingCapacity} onChange={(e) => setSeatingCapacity(e.target.value)} /></FormField>
                            <FormField label="Seats per Row"><TextField fullWidth sx={inputSx} value={seatsPerRow} onChange={(e) => setSeatsPerRow(e.target.value)} /></FormField>
                            <FormField label="Standing Space"><TextField fullWidth sx={inputSx} value={standingSpace} onChange={(e) => setStandingSpace(e.target.value)} /></FormField>
                            <FormField label="Vehicle Colour"><TextField fullWidth sx={inputSx} value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} /></FormField>
                        </Grid>
                        <ActionButtons onClear={() => {}} onSave={handleVehicleSpecificationUpdate} />
                    </ExpandableSection>

                    {/* Registration & Ownership */}
                    <ExpandableSection title="Registration & Ownership" expanded={expandedSections.registration} onToggle={() => toggleSection('registration')}>
                        <Grid container spacing={2}>
                            <FormField label="Registration Number"><TextField fullWidth sx={inputSx} value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} /></FormField>
                            <FormField label="RTO Name & Code"><TextField fullWidth sx={inputSx} value={rtoNameCode} onChange={(e) => setRtoNameCode(e.target.value)} /></FormField>
                            <FormField label="Registration Date"><TextField fullWidth sx={inputSx} type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} /></FormField>
                            <FormField label="Ownership Type"><Select fullWidth sx={selectSx} value={vehicleOwnershipType} onChange={(e) => setVehicleOwnershipType(e.target.value)}><MenuItem value="School Owned">School Owned</MenuItem><MenuItem value="Trust Management Owned">Trust Management Owned</MenuItem><MenuItem value="Vendor">Vendor</MenuItem></Select></FormField>
                            <FormField label="Owner Name"><TextField fullWidth sx={inputSx} value={vehicleOwnerName} onChange={(e) => setVehicleOwnerName(e.target.value)} /></FormField>
                            <FormField label="Owner Address"><TextField fullWidth sx={inputSx} value={ownerPermanentAddress} onChange={(e) => setOwnerPermanentAddress(e.target.value)} /></FormField>
                            <FormField label="Owner Contact"><TextField fullWidth sx={inputSx} value={ownerContactNumber} onChange={(e) => setOwnerContactNumber(e.target.value)} /></FormField>
                            <FormField label="Owner Legal ID/GST"><TextField fullWidth sx={inputSx} value={vehicleOwnerLegalIdGst} onChange={(e) => setVehicleOwnerLegalIdGst(e.target.value)} /></FormField>
                        </Grid>
                        <ActionButtons onClear={() => {}} onSave={handleRegistrationOwnershipUpdate} />
                    </ExpandableSection>

                    {/* Insurance */}
                    <ExpandableSection title="Insurance Details" expanded={expandedSections.insurance} onToggle={() => toggleSection('insurance')}>
                        <Grid container spacing={2}>
                            <FormField label="Insurance Company"><TextField fullWidth sx={inputSx} value={insuranceCompanyName} onChange={(e) => setInsuranceCompanyName(e.target.value)} /></FormField>
                            <FormField label="Policy Number"><TextField fullWidth sx={inputSx} value={insurancePolicyNumber} onChange={(e) => setInsurancePolicyNumber(e.target.value)} /></FormField>
                            <FormField label="Policy Type"><Select fullWidth sx={selectSx} value={insurancePolicyType} onChange={(e) => setInsurancePolicyType(e.target.value)}><MenuItem value="Third Party">Third Party</MenuItem><MenuItem value="Comprehensive">Comprehensive</MenuItem></Select></FormField>
                            <FormField label="Policy Start Date"><TextField fullWidth sx={inputSx} type="date" value={policyStartDate} onChange={(e) => setPolicyStartDate(e.target.value)} /></FormField>
                            <FormField label="Policy End Date"><TextField fullWidth sx={inputSx} type="date" value={policyEndDate} onChange={(e) => setPolicyEndDate(e.target.value)} /></FormField>
                            <FormField label="Primary Identifier"><Select fullWidth sx={selectSx} value={primaryInsuranceIdentifier} onChange={(e) => setPrimaryInsuranceIdentifier(e.target.value)}><MenuItem value="Chassis Number">Chassis Number</MenuItem><MenuItem value="Registration Number">Registration Number</MenuItem></Select></FormField>
                            <FormField label="Insurance Status"><Select fullWidth sx={selectSx} value={currentInsuranceStatus} onChange={(e) => setCurrentInsuranceStatus(e.target.value)}><MenuItem value="Active">Active</MenuItem><MenuItem value="Expired">Expired</MenuItem></Select></FormField>
                            <FormField label="Premium Amount"><TextField fullWidth sx={inputSx} value={insurancePremiumAmount} onChange={(e) => setInsurancePremiumAmount(e.target.value)} /></FormField>
                        </Grid>
                        <ActionButtons onClear={() => {}} onSave={handleInsuranceUpdate} />
                    </ExpandableSection>

                    {/* Warranty */}
                    <ExpandableSection title="Warranty & Service" expanded={expandedSections.warranty} onToggle={() => toggleSection('warranty')}>
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
                            <FormField label="Coverage For"><Select fullWidth sx={selectSx} value={warrantyCoverageFor} onChange={(e) => setWarrantyCoverageFor(e.target.value)}><MenuItem value="Engine">Engine</MenuItem><MenuItem value="Gearbox">Gearbox</MenuItem><MenuItem value="Full Vehicle">Full Vehicle</MenuItem></Select></FormField>
                            <FormField label="Start Date"><TextField fullWidth sx={inputSx} type="date" value={fullVehicleWarrantyStartDate} onChange={(e) => setFullVehicleWarrantyStartDate(e.target.value)} /></FormField>
                            <FormField label="End Date"><TextField fullWidth sx={inputSx} type="date" value={fullVehicleWarrantyEndDate} onChange={(e) => setFullVehicleWarrantyEndDate(e.target.value)} /></FormField>
                            <FormField label="Warranty Period"><TextField fullWidth sx={inputSx} value={fullVehicleWarrantyPeriod} InputProps={{ readOnly: true }} /></FormField>
                        </Grid>
                        <ActionButtons onClear={() => {}} onSave={handleWarrantyUpdate} />
                    </ExpandableSection>

                    {/* Documents */}
                    <ExpandableSection title="Documents" expanded={expandedSections.documents} onToggle={() => toggleSection('documents')}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 6, sm: 4, md: 2 }}><DocumentUploadBox label="RC Book" preview={rcBookPreview} inputRef={rcBookRef} onFileChange={(e) => handleDocumentChange(e, setRcBook, setRcBookPreview)} onDrop={(e) => handleDocumentDrop(e, setRcBook, setRcBookPreview)} /></Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 2 }}><DocumentUploadBox label="Fitness Certificate" preview={fitnessCertificatePreview} inputRef={fitnessCertificateRef} onFileChange={(e) => handleDocumentChange(e, setFitnessCertificate, setFitnessCertificatePreview)} onDrop={(e) => handleDocumentDrop(e, setFitnessCertificate, setFitnessCertificatePreview)} /></Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 2 }}><DocumentUploadBox label="Road Tax" preview={roadTaxCertificatePreview} inputRef={roadTaxCertificateRef} onFileChange={(e) => handleDocumentChange(e, setRoadTaxCertificate, setRoadTaxCertificatePreview)} onDrop={(e) => handleDocumentDrop(e, setRoadTaxCertificate, setRoadTaxCertificatePreview)} /></Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 2 }}><DocumentUploadBox label="Insurance" preview={insuranceDocPreview} inputRef={insuranceDocRef} onFileChange={(e) => handleDocumentChange(e, setInsuranceDoc, setInsuranceDocPreview)} onDrop={(e) => handleDocumentDrop(e, setInsuranceDoc, setInsuranceDocPreview)} /></Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 2 }}><DocumentUploadBox label="PUC Certificate" preview={pucCertificatePreview} inputRef={pucCertificateRef} onFileChange={(e) => handleDocumentChange(e, setPucCertificate, setPucCertificatePreview)} onDrop={(e) => handleDocumentDrop(e, setPucCertificate, setPucCertificatePreview)} /></Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 2 }}><DocumentUploadBox label="Permit Document" preview={permitDocumentPreview} inputRef={permitDocumentRef} onFileChange={(e) => handleDocumentChange(e, setPermitDocument, setPermitDocumentPreview)} onDrop={(e) => handleDocumentDrop(e, setPermitDocument, setPermitDocumentPreview)} /></Grid>
                        </Grid>
                        <ActionButtons onClear={() => {}} onSave={handleDocumentsUpdate} />
                    </ExpandableSection>
                </TabPanel>

                {/* Tab 2: Safety & Compliance */}
                <TabPanel value={tabValue} index={1}>
                    {/* FC Details */}
                    <ExpandableSection title="Fitness Certificate (FC) Details" expanded={expandedSections.fcDetails} onToggle={() => toggleSection('fcDetails')}>
                        <Grid container spacing={2}>
                            <FormField label="FC Type"><Select fullWidth sx={selectSx} value={fcType} onChange={(e) => setFcType(e.target.value)}><MenuItem value="New">New</MenuItem><MenuItem value="Renewal">Renewal</MenuItem></Select></FormField>
                            <FormField label="FC Number"><TextField fullWidth sx={inputSx} value={fcNumber} onChange={(e) => setFcNumber(e.target.value)} /></FormField>
                            <FormField label="Issue Date"><TextField fullWidth sx={inputSx} type="date" value={fcIssueDate} onChange={(e) => setFcIssueDate(e.target.value)} /></FormField>
                            <FormField label="Expiry Date"><TextField fullWidth sx={inputSx} type="date" value={fcExpiryDate} onChange={(e) => setFcExpiryDate(e.target.value)} /></FormField>
                            <FormField label="Validity Duration"><TextField fullWidth sx={inputSx} value={fcValidityDuration} onChange={(e) => setFcValidityDuration(e.target.value)} /></FormField>
                            <FormField label="Current Status"><Select fullWidth sx={selectSx} value={fcCurrentStatus} onChange={(e) => setFcCurrentStatus(e.target.value)}><MenuItem value="Valid">Valid</MenuItem><MenuItem value="Expired">Expired</MenuItem><MenuItem value="Pending Renewal">Pending Renewal</MenuItem></Select></FormField>
                        </Grid>
                        <ActionButtons onClear={() => {}} onSave={handleFCDetailsUpdate} />
                    </ExpandableSection>

                    {/* Permit Details */}
                    <ExpandableSection title="Permit Details" expanded={expandedSections.permitDetail} onToggle={() => toggleSection('permitDetail')}>
                        <Grid container spacing={2}>
                            <FormField label="Permit Number"><TextField fullWidth sx={inputSx} value={permitNumber} onChange={(e) => setPermitNumber(e.target.value)} /></FormField>
                            <FormField label="Permit Type"><Select fullWidth sx={selectSx} value={permitType} onChange={(e) => setPermitType(e.target.value)}><MenuItem value="Contract Carriage">Contract Carriage</MenuItem><MenuItem value="Stage Carriage">Stage Carriage</MenuItem><MenuItem value="Private Service Vehicle">Private Service Vehicle</MenuItem></Select></FormField>
                            <FormField label="Issuing RTO"><TextField fullWidth sx={inputSx} value={issuingRto} onChange={(e) => setIssuingRto(e.target.value)} /></FormField>
                            <FormField label="Valid From"><TextField fullWidth sx={inputSx} type="date" value={permitValidDateFrom} onChange={(e) => setPermitValidDateFrom(e.target.value)} /></FormField>
                            <FormField label="Valid Till"><TextField fullWidth sx={inputSx} type="date" value={permitValidTill} onChange={(e) => setPermitValidTill(e.target.value)} /></FormField>
                            <FormField label="Area of Operation"><TextField fullWidth sx={inputSx} value={permitAreaOfOperation} onChange={(e) => setPermitAreaOfOperation(e.target.value)} /></FormField>
                            <FormField label="Route"><TextField fullWidth sx={inputSx} value={permitRoute} onChange={(e) => setPermitRoute(e.target.value)} /></FormField>
                        </Grid>
                        <ActionButtons onClear={() => {}} onSave={handlePermitDetailUpdate} />
                    </ExpandableSection>

                    {/* PUC Details */}
                    <ExpandableSection title="PUC Details" expanded={expandedSections.pucDetail} onToggle={() => toggleSection('pucDetail')}>
                        <Grid container spacing={2}>
                            <FormField label="PUC Certificate Number"><TextField fullWidth sx={inputSx} value={pucCertificateNumber} onChange={(e) => setPucCertificateNumber(e.target.value)} /></FormField>
                            <FormField label="Issue Date"><TextField fullWidth sx={inputSx} type="date" value={pucIssueDate} onChange={(e) => setPucIssueDate(e.target.value)} /></FormField>
                            <FormField label="Expiry Date"><TextField fullWidth sx={inputSx} type="date" value={pucExpiryDate} onChange={(e) => setPucExpiryDate(e.target.value)} /></FormField>
                            <FormField label="Validity Status"><Select fullWidth sx={selectSx} value={pucValidityStatus} onChange={(e) => setPucValidityStatus(e.target.value)}><MenuItem value="Valid">Valid</MenuItem><MenuItem value="Expired">Expired</MenuItem></Select></FormField>
                        </Grid>
                        <ActionButtons onClear={() => {}} onSave={handlePUCDetailUpdate} />
                    </ExpandableSection>

                    {/* Road Tax */}
                    <ExpandableSection title="Road Tax Details" expanded={expandedSections.roadTax} onToggle={() => toggleSection('roadTax')}>
                        <Grid container spacing={2}>
                            <FormField label="Tax Type"><Select fullWidth sx={selectSx} value={taxType} onChange={(e) => setTaxType(e.target.value)}><MenuItem value="Quarterly">Quarterly</MenuItem><MenuItem value="Half Yearly">Half Yearly</MenuItem><MenuItem value="Annual">Annual</MenuItem><MenuItem value="One Time">One Time</MenuItem></Select></FormField>
                            <FormField label="Tax Paid Date"><TextField fullWidth sx={inputSx} type="date" value={taxPaidDate} onChange={(e) => setTaxPaidDate(e.target.value)} /></FormField>
                            <FormField label="Tax Expiry Date"><TextField fullWidth sx={inputSx} type="date" value={taxExpiryDate} onChange={(e) => setTaxExpiryDate(e.target.value)} /></FormField>
                            <FormField label="Tax Status"><Select fullWidth sx={selectSx} value={taxStatus} onChange={(e) => setTaxStatus(e.target.value)}><MenuItem value="Paid">Paid</MenuItem><MenuItem value="Pending">Pending</MenuItem><MenuItem value="Overdue">Overdue</MenuItem></Select></FormField>
                        </Grid>
                        <ActionButtons onClear={() => {}} onSave={handleRoadTaxUpdate} />
                    </ExpandableSection>

                    {/* CCTV & Safety Equipment */}
                    <ExpandableSection title="CCTV & Safety Equipment" expanded={expandedSections.cctvCamera} onToggle={() => toggleSection('cctvCamera')}>
                        <Typography sx={{ fontWeight: 600, mb: 2, color: "#1976D2" }}>CCTV Camera Installation</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <InputLabel sx={labelSx}>CCTV Installed</InputLabel>
                                <RadioGroup row value={cctvInstalled} onChange={(e) => setCctvInstalled(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Number of Cameras"><TextField fullWidth sx={inputSx} value={numberOfCameras} onChange={(e) => setNumberOfCameras(e.target.value)} /></FormField>
                            <FormField label="Installation Date"><TextField fullWidth sx={inputSx} type="date" value={camera1DateOfInstallation} onChange={(e) => setCamera1DateOfInstallation(e.target.value)} /></FormField>
                            <FormField label="Camera Type"><TextField fullWidth sx={inputSx} value={camera1Type} onChange={(e) => setCamera1Type(e.target.value)} /></FormField>
                        </Grid>

                        <Typography sx={{ fontWeight: 600, mb: 2, mt: 3, color: "#1976D2" }}>First Aid Kit</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <InputLabel sx={labelSx}>First Aid Kit Installed</InputLabel>
                                <RadioGroup row value={firstAidKitInstallation} onChange={(e) => setFirstAidKitInstallation(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Installation Date"><TextField fullWidth sx={inputSx} type="date" value={firstAidDateOfInstallation} onChange={(e) => setFirstAidDateOfInstallation(e.target.value)} /></FormField>
                            <FormField label="Expiry Check Due"><TextField fullWidth sx={inputSx} type="date" value={firstAidExpiryCheckDueDate} onChange={(e) => setFirstAidExpiryCheckDueDate(e.target.value)} /></FormField>
                        </Grid>

                        <Typography sx={{ fontWeight: 600, mb: 2, mt: 3, color: "#1976D2" }}>Speed Governor</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <InputLabel sx={labelSx}>Speed Governor Installed</InputLabel>
                                <RadioGroup row value={speedGovernorInstallation} onChange={(e) => setSpeedGovernorInstallation(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Installation Date"><TextField fullWidth sx={inputSx} type="date" value={speedGovernorDateOfInstallation} onChange={(e) => setSpeedGovernorDateOfInstallation(e.target.value)} /></FormField>
                            <FormField label="Speed Limit Set (Kmph)"><TextField fullWidth sx={inputSx} value={speedLimitSet} onChange={(e) => setSpeedLimitSet(e.target.value)} /></FormField>
                            <FormField label="Certificate Number"><TextField fullWidth sx={inputSx} value={speedGovernorCertificateNumber} onChange={(e) => setSpeedGovernorCertificateNumber(e.target.value)} /></FormField>
                            <FormField label="Validity Date"><TextField fullWidth sx={inputSx} type="date" value={speedGovernorValidityDate} onChange={(e) => setSpeedGovernorValidityDate(e.target.value)} /></FormField>
                        </Grid>

                        <Typography sx={{ fontWeight: 600, mb: 2, mt: 3, color: "#1976D2" }}>Fire Extinguisher</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <InputLabel sx={labelSx}>Fire Extinguisher Installed</InputLabel>
                                <RadioGroup row value={fireExtinguisherInstallation} onChange={(e) => setFireExtinguisherInstallation(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Installation Date"><TextField fullWidth sx={inputSx} type="date" value={fireExtinguisherDateOfInstallation} onChange={(e) => setFireExtinguisherDateOfInstallation(e.target.value)} /></FormField>
                            <FormField label="Expiry Date"><TextField fullWidth sx={inputSx} type="date" value={fireExtinguisherExpiryDate} onChange={(e) => setFireExtinguisherExpiryDate(e.target.value)} /></FormField>
                            <FormField label="Type & Capacity"><TextField fullWidth sx={inputSx} value={extinguisherTypeCapacity} onChange={(e) => setExtinguisherTypeCapacity(e.target.value)} /></FormField>
                        </Grid>

                        <Typography sx={{ fontWeight: 600, mb: 2, mt: 3, color: "#1976D2" }}>GPS Tracker</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <InputLabel sx={labelSx}>GPS Installed</InputLabel>
                                <RadioGroup row value={gpsTrackerInstallation} onChange={(e) => setGpsTrackerInstallation(e.target.value)}>
                                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            </Grid>
                            <FormField label="Installation Date"><TextField fullWidth sx={inputSx} type="date" value={gpsDateOfInstallation} onChange={(e) => setGpsDateOfInstallation(e.target.value)} /></FormField>
                            <FormField label="Device ID / IMEI"><TextField fullWidth sx={inputSx} value={gpsDeviceIdImei} onChange={(e) => setGpsDeviceIdImei(e.target.value)} /></FormField>
                            <FormField label="SIM Number"><TextField fullWidth sx={inputSx} value={gpsSimNumber} onChange={(e) => setGpsSimNumber(e.target.value)} /></FormField>
                            <FormField label="Subscription Valid Till"><TextField fullWidth sx={inputSx} type="date" value={gpsSubscriptionValidTill} onChange={(e) => setGpsSubscriptionValidTill(e.target.value)} /></FormField>
                        </Grid>
                        <ActionButtons onClear={() => {}} onSave={handleCCTVCameraUpdate} />
                    </ExpandableSection>

                    {/* Bus Branding */}
                    <ExpandableSection title="Bus Branding & Visual Identity" expanded={expandedSections.busBranding} onToggle={() => toggleSection('busBranding')}>
                        <Typography sx={{ fontWeight: 600, mb: 2, color: "#1976D2" }}>School Name Display</Typography>
                        <Grid container spacing={2}>
                            {["Front", "Back", "Left", "Right"].map((side) => (
                                <Grid size={{ xs: 6, sm: 3 }} key={side}>
                                    <InputLabel sx={labelSx}>{side} Side</InputLabel>
                                    <RadioGroup row value={eval(`schoolName${side}Side`)} onChange={(e) => eval(`setSchoolName${side}Side`)(e.target.value)}>
                                        <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                        <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                    </RadioGroup>
                                </Grid>
                            ))}
                        </Grid>

                        <Typography sx={{ fontWeight: 600, mb: 2, mt: 3, color: "#1976D2" }}>Reflective Tapes Display</Typography>
                        <Grid container spacing={2}>
                            {["Front", "Back", "Left", "Right"].map((side) => (
                                <Grid size={{ xs: 6, sm: 3 }} key={side}>
                                    <InputLabel sx={labelSx}>{side} Side</InputLabel>
                                    <RadioGroup row value={eval(`reflectiveTapes${side}Side`)} onChange={(e) => eval(`setReflectiveTapes${side}Side`)(e.target.value)}>
                                        <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                        <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                    </RadioGroup>
                                </Grid>
                            ))}
                        </Grid>

                        <Typography sx={{ fontWeight: 600, mb: 2, mt: 3, color: "#1976D2" }}>School Bus Signage Display</Typography>
                        <Grid container spacing={2}>
                            {["Front", "Back", "Left", "Right"].map((side) => (
                                <Grid size={{ xs: 6, sm: 3 }} key={side}>
                                    <InputLabel sx={labelSx}>{side} Side</InputLabel>
                                    <RadioGroup row value={eval(`signage${side}Side`)} onChange={(e) => eval(`setSignage${side}Side`)(e.target.value)}>
                                        <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                        <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                    </RadioGroup>
                                </Grid>
                            ))}
                        </Grid>
                        <ActionButtons onClear={() => {}} onSave={handleBusBrandingUpdate} />
                    </ExpandableSection>
                </TabPanel>
            </Box>
        </Box>
    );
}
