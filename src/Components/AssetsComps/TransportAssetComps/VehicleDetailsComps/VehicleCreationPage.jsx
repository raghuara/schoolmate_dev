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
    Checkbox,
    FormGroup,
    Collapse
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { postVehicleAcquisitionDetail, postVehicleDocuments, postVehicleInsuranceCompliance, postVehicleRegistrationOwnership, postVehicleSpecification, postVehicleWarrantyServiceClaim } from "../../../../Api/Api";
import axios from "axios";
import SnackBar from "../../../SnackBar";

const inputSx = {
    "& .MuiOutlinedInput-root": {
        height: 40,
        borderRadius: "8px",
        fontSize: "14px",
        backgroundColor: "#fff",
    }
};

const selectSx = {
    height: 40,
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#fff",
};

const labelSx = {
    color: "#ff1414",
    fontWeight: 700,
    fontSize: "13px",
    mb: 0.5
};

const FormField = ({ label, children, gridSize = 3 }) => (
    <Grid size={{ xs: 12, sm: 6, md: gridSize }}>
        <InputLabel sx={labelSx}>{label}</InputLabel>
        {children}
    </Grid>
);

const ActionButtons = ({ onClear, onSave }) => (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button
            variant="text"
            onClick={onClear}
            sx={{
                color: "#000",
                textTransform: "none",
                fontWeight: 600
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
                px: 4,
                "&:hover": { backgroundColor: "#F59E0B" }
            }}
        >
            Save
        </Button>
    </Box>
);

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
                    mb: 1,
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
            <Typography color="#ff1414" fontSize={11} fontWeight={700}>
                {label}
            </Typography>
            {preview && (
                <Typography
                    color="#4CAF50"
                    fontSize={11}
                    sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                    onClick={() => window.open(preview, '_blank')}
                >
                    View Document
                </Typography>
            )}
        </Box>
    );
};

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

export default function VehicleCreationPage({ generatedVehicleId }) {
    const [isLoading, setIsLoading] = useState(false);

    const token = "123"
    const [expandedSections, setExpandedSections] = useState({
        acquisition: true,
        specification: true,
        registration: true,
        insurance: true,
        warranty: true,
        documents: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const getInvoiceLabel = () => {
        switch (modeOfAcquisition) {
            case "New":
                return "Invoice Number"
            case "Used":
                return "Ownership Transfer Acknowledgement Number";
            case "Internal Bus transfer":
                return "Transfer Ref Number";
            case "Received as donation":
                return "Donation Number";
            default:
                return "Invoice Number";
        }
    };

    // Helper function to get source type based on Mode of Acquisition
    const getSourceTypeFromMode = (mode) => {
        switch (mode) {
            case "New":
                return "Dealer";
            case "Used":
                return "Previous Owner";
            case "Received as donation":
                return "Donor";
            case "Internal Bus transfer":
                return "Source school";
            default:
                return "Dealer";
        }
    };

    // Handle Mode of Acquisition change - also updates Source Type
    const handleModeOfAcquisitionChange = (e) => {
        const newMode = e.target.value;
        setModeOfAcquisition(newMode);
        setAcquisitionSourceType(getSourceTypeFromMode(newMode));
    };

    // Vehicle Acquisition Detail state
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

    // Vehicle Specification state
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
    const [transportType, setTransportType] = useState("Transport");
    const [vehicleColor, setVehicleColor] = useState("");

    // Registration & Ownership state
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [rtoNameCode, setRtoNameCode] = useState("");
    const [registrationDate, setRegistrationDate] = useState("");
    const [vehicleOwnershipType, setVehicleOwnershipType] = useState("");
    const [vehicleOwnerName, setVehicleOwnerName] = useState("");
    const [ownerPermanentAddress, setOwnerPermanentAddress] = useState("");
    const [ownerContactNumber, setOwnerContactNumber] = useState("");
    const [vehicleOwnerLegalIdGst, setVehicleOwnerLegalIdGst] = useState("");

    // Insurance state
    const [insuranceCompanyName, setInsuranceCompanyName] = useState("");
    const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("");
    const [insurancePolicyType, setInsurancePolicyType] = useState("");
    const [policyStartDate, setPolicyStartDate] = useState("");
    const [policyEndDate, setPolicyEndDate] = useState("");
    const [primaryInsuranceIdentifier, setPrimaryInsuranceIdentifier] = useState("");
    const [currentInsuranceStatus, setCurrentInsuranceStatus] = useState("");
    const [insurancePremiumAmount, setInsurancePremiumAmount] = useState("");

    // Warranty state
    const [warrantyProvided, setWarrantyProvided] = useState("Provided");
    const [warrantyProvidedBy, setWarrantyProvidedBy] = useState("Manufacturer");
    const [warrantyType, setWarrantyType] = useState("Standard");
    const [warrantyCoverageFor, setWarrantyCoverageFor] = useState("");
    const [fullVehicleWarrantyStartDate, setFullVehicleWarrantyStartDate] = useState("");
    const [fullVehicleWarrantyEndDate, setFullVehicleWarrantyEndDate] = useState("");
    const [fullVehicleWarrantyPeriod, setFullVehicleWarrantyPeriod] = useState("");

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

    // Documents state
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

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const handleBusPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBusPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBusPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBusPhotoDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setBusPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBusPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

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

    const formatDateToDDMMYYYY = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Validation helper functions
    const isValidPhone = (phone) => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    };

    const isValidGSTIN = (gstin) => {
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstin === "" || gstinRegex.test(gstin);
    };

    const isValidYear = (year) => {
        const yearNum = parseInt(year);
        const currentYear = new Date().getFullYear();
        return yearNum >= 1900 && yearNum <= currentYear + 1;
    };

    const isEndDateAfterStartDate = (startDate, endDate) => {
        if (!startDate || !endDate) return true;
        return new Date(endDate) >= new Date(startDate);
    };

    const handleAcquisitionDetailsSubmit = async () => {
        // Validations
        // if (!acquisitionDate) {
        //     setMessage("Please select Vehicle Acquisition Date");
        //     setOpen(true);
        //     setColor(false);
        //     setStatus(false);
        //     return;
        // }
        // if (!vehicleAssetType) {
        //     setMessage("Please select Vehicle Asset Type");
        //     setOpen(true);
        //     setColor(false);
        //     setStatus(false);
        //     return;
        // }
        // if (dealerContactNumber && !isValidPhone(dealerContactNumber)) {
        //     setMessage("Please enter a valid 10-digit Dealer Contact Number");
        //     setOpen(true);
        //     setColor(false);
        //     setStatus(false);
        //     return;
        // }
        // if (dealerGstin && !isValidGSTIN(dealerGstin)) {
        //     setMessage("Please enter a valid GSTIN format");
        //     setOpen(true);
        //     setColor(false);
        //     setStatus(false);
        //     return;
        // }

        setIsLoading(true);

        try {
            const sendData = new FormData();
            sendData.append("VehicleAssetID", generatedVehicleId);
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
                const fileType = busPhoto.type.startsWith('image/') ? 'image' : 'pdf';
                sendData.append("BusPhotoFileType", fileType);
            }

            const res = await axios.post(postVehicleAcquisitionDetail, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Saved successfully");
        } catch (error) {
            setMessage("An error occurred.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVehicleSpecificationSubmit = async () => {
        // Validations
        if (yearOfManufacture && !isValidYear(yearOfManufacture)) {
            setMessage("Please enter a valid Year of Manufacture");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }
        if (seatingCapacity && (isNaN(seatingCapacity) || parseInt(seatingCapacity) <= 0)) {
            setMessage("Please enter a valid Seating Capacity");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }
        if (seatsPerRow && (isNaN(seatsPerRow) || parseInt(seatsPerRow) <= 0)) {
            setMessage("Please enter a valid Seats per Row");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);

        try {
            const sendData = {
                VehicleAssetID: generatedVehicleId,
                BusModelAndMake: busModelMake,
                YearOfManufacture: yearOfManufacture,
                EngineNumberAsPerRC: engineNumber,
                EngineChasisNumberAsPerRC: engineChassisNumber,
                FuelTypeAsPerRC: fuelType,
                VehicleClassAsPerRC: vehicleClass,
                FuelTankCapacity: fuelTankCapacity,
                SeatingCapacity: seatingCapacity,
                SeatsPerRow: seatsPerRow,
                StandingSpace: blendingSource,
                VehicleColour: vehicleColor
            };

            const res = await axios.post(postVehicleSpecification, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Saved successfully");
        } catch (error) {
            setMessage("An error occurred.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Registration & Ownership Clear
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

    // Registration & Ownership Submit
    const handleRegistrationOwnershipSubmit = async () => {
        // Validations
        if (ownerContactNumber && !isValidPhone(ownerContactNumber)) {
            setMessage("Please enter a valid 10-digit Owner Contact Number");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }
        if (vehicleOwnerLegalIdGst && !isValidGSTIN(vehicleOwnerLegalIdGst)) {
            setMessage("Please enter a valid GST format");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);

        try {
            const sendData = {
                VehicleAssetID: generatedVehicleId,
                RegistrationNumberAsPerRC: registrationNumber,
                RTONameAndCodeAsPerRC: rtoNameCode,
                RegistrationDate: formatDateToDDMMYYYY(registrationDate),
                VehicleOwnershipType: vehicleOwnershipType,
                VehicleOwnerNameAsPerRC: vehicleOwnerName,
                OwnerPermanentAddress: ownerPermanentAddress,
                OwnerContactNumber: ownerContactNumber,
                VehicleOwnerLegalIdOrGST: vehicleOwnerLegalIdGst
            };

            const res = await axios.post(postVehicleRegistrationOwnership, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Saved successfully");
        } catch (error) {
            setMessage("An error occurred.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Insurance Clear
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

    // Insurance Submit
    const handleInsuranceSubmit = async () => {
        // Validations
        if (!isEndDateAfterStartDate(policyStartDate, policyEndDate)) {
            setMessage("Policy End Date must be after Policy Start Date");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }
        if (insurancePremiumAmount && (isNaN(insurancePremiumAmount) || parseFloat(insurancePremiumAmount) < 0)) {
            setMessage("Please enter a valid Insurance Premium Amount");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);

        try {
            const sendData = {
                VehicleAssetID: generatedVehicleId,
                InsuranceCompanyName: insuranceCompanyName,
                InsurancePolicyNumber: insurancePolicyNumber,
                InsurancePolicyType: insurancePolicyType,
                PolicyStartDate: formatDateToDDMMYYYY(policyStartDate),
                PolicyEndDate: formatDateToDDMMYYYY(policyEndDate),
                PrimaryInsuranceIdentifier: primaryInsuranceIdentifier,
                CurrentInsuranceStatus: currentInsuranceStatus,
                InsurancePremiumAmount: insurancePremiumAmount
            };

            const res = await axios.post(postVehicleInsuranceCompliance, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Saved successfully");
        } catch (error) {
            setMessage("An error occurred.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Warranty Clear
    const handleWarrantyClear = () => {
        setWarrantyProvided("Provided");
        setWarrantyProvidedBy("Manufacturer");
        setWarrantyType("Standard");
        setWarrantyCoverageFor("");
        setFullVehicleWarrantyStartDate("");
        setFullVehicleWarrantyEndDate("");
        setFullVehicleWarrantyPeriod("");
    };

    // Warranty Submit
    const handleWarrantySubmit = async () => {
        // Validations
        if (!isEndDateAfterStartDate(fullVehicleWarrantyStartDate, fullVehicleWarrantyEndDate)) {
            setMessage("Warranty End Date must be after Warranty Start Date");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);

        try {
            const sendData = {
                VehicleAssetID: generatedVehicleId,
                Warranty: warrantyProvided,
                WarrantyProvidedBy: warrantyProvidedBy,
                WarrantyType: warrantyType,
                WarrantyCoverageFor: warrantyCoverageFor,
                FullVehicleWarrantyStartDate: formatDateToDDMMYYYY(fullVehicleWarrantyStartDate),
                FullVehicleWarrantyEndDate: formatDateToDDMMYYYY(fullVehicleWarrantyEndDate),
                FullVehicleWarrantyPeriod: fullVehicleWarrantyPeriod
            };

            const res = await axios.post(postVehicleWarrantyServiceClaim, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Saved successfully");
        } catch (error) {
            setMessage("An error occurred.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Generic document handler
    const handleDocumentChange = (e, setFile, setPreview) => {
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

    const handleDocumentDrop = (e, setFile, setPreview) => {
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

    // Documents Clear
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

    // Documents Submit
    const handleDocumentsSubmit = async () => {
        setIsLoading(true);

        try {
            const sendData = new FormData();
            sendData.append("VehicleAssetID", generatedVehicleId);

            if (rcBook) {
                sendData.append("RCBookFile", rcBook);
                sendData.append("RCBookFileType", rcBook.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (fitnessCertificate) {
                sendData.append("FitnessCertificateFile", fitnessCertificate);
                sendData.append("FitnessCertificateFileType", fitnessCertificate.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (roadTaxCertificate) {
                sendData.append("RoadTaxCertificateFile", roadTaxCertificate);
                sendData.append("RoadTaxCertificateFileType", roadTaxCertificate.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (insuranceDoc) {
                sendData.append("InsuranceDocumentFile", insuranceDoc);
                sendData.append("InsuranceDocumentFileType", insuranceDoc.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (pucCertificate) {
                sendData.append("PUCCertificateFile", pucCertificate);
                sendData.append("PUCCertificateFileType", pucCertificate.type.startsWith('image/') ? 'image' : 'pdf');
            }
            if (permitDocument) {
                sendData.append("PermitDocumentFile", permitDocument);
                sendData.append("PermitDocumentFileType", permitDocument.type.startsWith('image/') ? 'image' : 'pdf');
            }

            const res = await axios.post(postVehicleDocuments, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Saved successfully");
        } catch (error) {
            setMessage("An error occurred.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Box sx={{ backgroundColor: "#FAFAFA" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <Box sx={{ p: 3 }}>
                {/* Section 1: Vehicle Acquisition Detail */}
                <ExpandableSection
                    title="Vehicle Acquisition Detail"
                    expanded={expandedSections.acquisition}
                    onToggle={() => toggleSection('acquisition')}
                >
                    <Box sx={{ display: "flex", gap: 3 }}>
                        {/* Left side - Form Fields */}
                        <Box sx={{ flex: 1 }}>
                            <Grid container spacing={2}>
                                {/* Row 1: Mode of Acquisition | Vehicle Acquisition Source Type | Vehicle Acquisition Date | Vehicle Asset type */}
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <InputLabel sx={labelSx}>Mode of Acquisition</InputLabel>
                                    <RadioGroup
                                        row
                                        value={modeOfAcquisition}
                                        onChange={handleModeOfAcquisitionChange}
                                        sx={{ mt: 0.5 }}
                                    >
                                        <FormControlLabel value="New" control={<Radio size="small" />} label={<Typography fontSize="13px">New</Typography>} />
                                        <FormControlLabel value="Used" control={<Radio size="small" />} label={<Typography fontSize="13px">Used</Typography>} />
                                        <FormControlLabel value="Received as donation" control={<Radio size="small" />} label={<Typography fontSize="13px">Received as donation</Typography>} />
                                        <FormControlLabel value="Internal Bus transfer" control={<Radio size="small" />} label={<Typography fontSize="13px">Internal Bus transfer</Typography>} />
                                    </RadioGroup>
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
                                    <TextField
                                        fullWidth
                                        sx={inputSx}
                                        type="date"
                                        value={acquisitionDate}
                                        onChange={(e) => setAcquisitionDate(e.target.value)}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 3 }}>
                                    <InputLabel sx={labelSx}>Vehicle Asset type</InputLabel>
                                    <Select fullWidth sx={selectSx} value={vehicleAssetType} onChange={(e) => setVehicleAssetType(e.target.value)} displayEmpty>
                                        <MenuItem value="Bus">Bus</MenuItem>
                                        <MenuItem value="Van">Van</MenuItem>
                                        <MenuItem value="Car">Car</MenuItem>
                                        <MenuItem value="Two Wheeler">Two Wheeler</MenuItem>
                                    </Select>
                                    <Typography fontSize="11px" color="#666" mt={0.5}>
                                        Bus / Van / Car/Two Wheeler
                                    </Typography>
                                </Grid>

                                {/* Row 2: Vehicle Asset Sub Type | Vehicle Brand | Dealer Name */}
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
                                    <TextField fullWidth sx={inputSx} value={dealerName} onChange={(e) => setDealerName(e.target.value)} placeholder="XXXXXX" />
                                </Grid>

                                {/* Row 3: Dealer Contact Number | Dealer Address | Dealer GSTIN | Invoice Number */}
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <InputLabel sx={labelSx}>Dealer Contact Number</InputLabel>
                                    <TextField fullWidth sx={inputSx} value={dealerContactNumber} onChange={(e) => setDealerContactNumber(e.target.value)} placeholder="XXXXXX" />
                                </Grid>

                                <Grid size={{ xs: 12, md: 3 }}>
                                    <InputLabel sx={labelSx}>Dealer Address</InputLabel>
                                    <TextField fullWidth sx={inputSx} value={dealerAddress} onChange={(e) => setDealerAddress(e.target.value)} placeholder="XXXXXX" />
                                </Grid>

                                <Grid size={{ xs: 12, md: 3 }}>
                                    <InputLabel sx={labelSx}>Dealer GSTIN (As per Invoice)</InputLabel>
                                    <TextField fullWidth sx={inputSx} value={dealerGstin} onChange={(e) => setDealerGstin(e.target.value)} placeholder="XXXXXX" />
                                </Grid>

                                <Grid size={{ xs: 12, md: 3 }}>
                                    <InputLabel sx={labelSx}>{getInvoiceLabel()}</InputLabel>
                                    <TextField fullWidth sx={inputSx} value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Right side - Upload Bus Photograph (separate with space) */}
                        <Box sx={{ width: 200, flexShrink: 0 }}>
                            <InputLabel sx={labelSx}>Upload Bus Photograph</InputLabel>
                            <input
                                type="file"
                                ref={busPhotoInputRef}
                                onChange={handleBusPhotoChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <Box
                                onClick={() => busPhotoInputRef.current?.click()}
                                onDrop={handleBusPhotoDrop}
                                onDragOver={handleDragOver}
                                sx={{
                                    width: "100%",
                                    height: 150,
                                    border: "2px dashed #1976D2",
                                    borderRadius: "12px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    backgroundColor: "#E3F2FD",
                                    overflow: "hidden",
                                    "&:hover": {
                                        backgroundColor: "#BBDEFB",
                                        borderColor: "#1565C0"
                                    }
                                }}
                            >
                                {busPhotoPreview ? (
                                    <img
                                        src={busPhotoPreview}
                                        alt="Bus Preview"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
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
                            {busPhotoPreview && (
                                <Typography
                                    color="#4CAF50"
                                    fontSize={11}
                                    mt={0.5}
                                    textAlign="center"
                                    sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                                    onClick={() => window.open(busPhotoPreview, '_blank')}
                                >
                                    View Document
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <ActionButtons onClear={handleAcquisitionDetailsClear} onSave={handleAcquisitionDetailsSubmit} />
                </ExpandableSection>

                {/* Section 2: Vehicle Specification */}
                <ExpandableSection
                    title="Vehicle Specification ( For All mode of Acquisition )"
                    expanded={expandedSections.specification}
                    onToggle={() => toggleSection('specification')}
                >
                    <Grid container spacing={2}>
                        {/* Row 1: 5 fields */}
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Bus Model & Make</InputLabel>
                            <TextField fullWidth sx={inputSx} value={busModelMake} onChange={(e) => setBusModelMake(e.target.value)} placeholder="LP 912" />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Year of Manufacture</InputLabel>
                            <TextField fullWidth sx={inputSx} value={yearOfManufacture} onChange={(e) => setYearOfManufacture(e.target.value)} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Engine Number(As per RC)</InputLabel>
                            <TextField fullWidth sx={inputSx} value={engineNumber} onChange={(e) => setEngineNumber(e.target.value)} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Engine Chassis Number(As per RC)</InputLabel>
                            <TextField fullWidth sx={inputSx} value={engineChassisNumber} onChange={(e) => setEngineChassisNumber(e.target.value)} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Fuel Type(As per RC)</InputLabel>
                            <Select fullWidth sx={selectSx} value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                                <MenuItem value="Diesel">Diesel</MenuItem>
                                <MenuItem value="Petrol">Petrol</MenuItem>
                                <MenuItem value="Electric">Electric</MenuItem>
                                <MenuItem value="CNG">CNG</MenuItem>
                            </Select>
                        </Grid>

                        {/* Row 2: 5 fields */}
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Vehicle Class ( As per RC)</InputLabel>
                            <Select fullWidth sx={selectSx} value={vehicleClass} onChange={(e) => setVehicleClass(e.target.value)}>
                                <MenuItem value="Transport">Transport</MenuItem>
                                <MenuItem value="Non-transport">Non-transport</MenuItem>
                            </Select>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Fuel Tank capacity</InputLabel>
                            <TextField fullWidth sx={inputSx} value={fuelTankCapacity} onChange={(e) => setFuelTankCapacity(e.target.value)} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Seating Capacity</InputLabel>
                            <TextField fullWidth sx={inputSx} value={seatingCapacity} onChange={(e) => setSeatingCapacity(e.target.value)} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Seats per Row.</InputLabel>
                            <TextField fullWidth sx={inputSx} value={seatsPerRow} onChange={(e) => setSeatsPerRow(e.target.value)} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Blending source</InputLabel>
                            <TextField fullWidth sx={inputSx} value={blendingSource} onChange={(e) => setBlendingSource(e.target.value)} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Vehicle colour</InputLabel>
                            <TextField fullWidth sx={inputSx} value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} />
                        </Grid>
                    </Grid>

                    <ActionButtons onClear={handleVehicleSpecificationClear} onSave={handleVehicleSpecificationSubmit} />
                </ExpandableSection>

                {/* Section 3: Registration & Vehicle Ownership Detail */}
                <ExpandableSection
                    title="Registration & Vehicle Ownership Detail"
                    expanded={expandedSections.registration}
                    onToggle={() => toggleSection('registration')}
                >
                    <Grid container spacing={2}>
                        {/* Row 1: 5 fields */}
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Registration Number (As per RC)</InputLabel>
                            <TextField fullWidth sx={inputSx} value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="TN-XX-YY-1234" />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>RTO Name & Code (As per RC)</InputLabel>
                            <TextField fullWidth sx={inputSx} value={rtoNameCode} onChange={(e) => setRtoNameCode(e.target.value)} placeholder="Chennai South RTO" />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Registration Date</InputLabel>
                            <TextField fullWidth sx={inputSx} type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Vehicle Ownership Type</InputLabel>
                            <Select fullWidth sx={selectSx} value={vehicleOwnershipType} onChange={(e) => setVehicleOwnershipType(e.target.value)}>
                                <MenuItem value="School Owned">School Owned</MenuItem>
                                <MenuItem value="Trust Management Owned">Trust Management Owned</MenuItem>
                                <MenuItem value="Vendor">Vendor</MenuItem>
                                <MenuItem value="Contractor Owned">Contractor Owned</MenuItem>
                            </Select>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Vehicle Owner Name (As per RC)</InputLabel>
                            <TextField fullWidth sx={inputSx} value={vehicleOwnerName} onChange={(e) => setVehicleOwnerName(e.target.value)} />
                        </Grid>

                        {/* Row 2: 3 fields */}
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Owner Permanent Address</InputLabel>
                            <TextField fullWidth sx={inputSx} value={ownerPermanentAddress} onChange={(e) => setOwnerPermanentAddress(e.target.value)} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Owner Contact Number</InputLabel>
                            <TextField fullWidth sx={inputSx} value={ownerContactNumber} onChange={(e) => setOwnerContactNumber(e.target.value)} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Vehicle Owner Legal ID GST</InputLabel>
                            <TextField fullWidth sx={inputSx} value={vehicleOwnerLegalIdGst} onChange={(e) => setVehicleOwnerLegalIdGst(e.target.value)} />
                        </Grid>
                    </Grid>

                    <ActionButtons onClear={handleRegistrationOwnershipClear} onSave={handleRegistrationOwnershipSubmit} />
                </ExpandableSection>

                {/* Section 4: Insurance Registration Compliance */}
                <ExpandableSection
                    title="Insurance Registration Compliance"
                    expanded={expandedSections.insurance}
                    onToggle={() => toggleSection('insurance')}
                >
                    <Grid container spacing={2}>
                        {/* Row 1: 5 fields */}
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Insurance Company Name</InputLabel>
                            <TextField fullWidth sx={inputSx} value={insuranceCompanyName} onChange={(e) => setInsuranceCompanyName(e.target.value)} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Insurance Policy Number</InputLabel>
                            <TextField fullWidth sx={inputSx} value={insurancePolicyNumber} onChange={(e) => setInsurancePolicyNumber(e.target.value)} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Insurance Policy Type</InputLabel>
                            <Select fullWidth sx={selectSx} value={insurancePolicyType} onChange={(e) => setInsurancePolicyType(e.target.value)}>
                                <MenuItem value="Third Party">Third Party</MenuItem>
                                <MenuItem value="Comprehensive">Comprehensive</MenuItem>
                            </Select>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Policy Start Date</InputLabel>
                            <TextField fullWidth sx={inputSx} type="date" value={policyStartDate} onChange={(e) => setPolicyStartDate(e.target.value)} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Policy End Date</InputLabel>
                            <TextField fullWidth sx={inputSx} type="date" value={policyEndDate} onChange={(e) => setPolicyEndDate(e.target.value)} />
                        </Grid>

                        {/* Row 2: 3 fields */}
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Primary Insurance Identifier</InputLabel>
                            <Select fullWidth sx={selectSx} value={primaryInsuranceIdentifier} onChange={(e) => setPrimaryInsuranceIdentifier(e.target.value)}>
                                <MenuItem value="Chassis Number">Chassis Number</MenuItem>
                                <MenuItem value="Registration Number">Registration Number</MenuItem>
                            </Select>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Current Insurance Status</InputLabel>
                            <Select fullWidth sx={selectSx} value={currentInsuranceStatus} onChange={(e) => setCurrentInsuranceStatus(e.target.value)}>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Expired">Expired</MenuItem>
                                <MenuItem value="Active but RC pending">Active but RC pending</MenuItem>
                            </Select>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <InputLabel sx={labelSx}>Insurance Premium Amount</InputLabel>
                            <TextField fullWidth sx={inputSx} value={insurancePremiumAmount} onChange={(e) => setInsurancePremiumAmount(e.target.value)} />
                        </Grid>
                    </Grid>

                    <ActionButtons onClear={handleInsuranceClear} onSave={handleInsuranceSubmit} />
                </ExpandableSection>

                {/* Section 5: Warranty & Service claim */}
                <ExpandableSection
                    title="Warranty & Service claim"
                    expanded={expandedSections.warranty}
                    onToggle={() => toggleSection('warranty')}
                >
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <InputLabel sx={labelSx}>Warranty</InputLabel>
                            <RadioGroup
                                row
                                value={warrantyProvided}
                                onChange={(e) => setWarrantyProvided(e.target.value)}
                            >
                                <FormControlLabel value="Provided" control={<Radio size="small" />} label="Provided" />
                                <FormControlLabel value="Not provided" control={<Radio size="small" />} label="Not provided" />
                            </RadioGroup>
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <InputLabel sx={labelSx}>Warranty Provided by</InputLabel>
                            <RadioGroup
                                row
                                value={warrantyProvidedBy}
                                onChange={(e) => setWarrantyProvidedBy(e.target.value)}
                            >
                                <FormControlLabel value="Manufacturer" control={<Radio size="small" />} label="Manufacturer" />
                                <FormControlLabel value="Dealer" control={<Radio size="small" />} label="Dealer" />
                            </RadioGroup>
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <InputLabel sx={labelSx}>Warranty Type</InputLabel>
                            <RadioGroup
                                row
                                value={warrantyType}
                                onChange={(e) => setWarrantyType(e.target.value)}
                            >
                                <FormControlLabel value="Standard" control={<Radio size="small" />} label="Standard" />
                                <FormControlLabel value="Extended" control={<Radio size="small" />} label="Extended" />
                            </RadioGroup>
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <InputLabel sx={labelSx}>Warranty Coverage for</InputLabel>
                            <Select fullWidth sx={selectSx} value={warrantyCoverageFor} onChange={(e) => setWarrantyCoverageFor(e.target.value)}>
                                <MenuItem value="Engine">Engine</MenuItem>
                                <MenuItem value="Gearbox">Gearbox</MenuItem>
                                <MenuItem value="Full Vehicle">Full Vehicle</MenuItem>
                            </Select>
                        </Grid>

                        <FormField label="Full vehicle Warranty Start date">
                            <TextField fullWidth sx={inputSx} type="date" value={fullVehicleWarrantyStartDate} onChange={(e) => setFullVehicleWarrantyStartDate(e.target.value)} />
                        </FormField>

                        <FormField label="Full vehicle Warranty End date">
                            <TextField fullWidth sx={inputSx} type="date" value={fullVehicleWarrantyEndDate} onChange={(e) => setFullVehicleWarrantyEndDate(e.target.value)} />
                        </FormField>

                        <FormField label="Full vehicle warranty period (Auto calculate )">
                            <TextField fullWidth sx={inputSx} value={fullVehicleWarrantyPeriod} InputProps={{ readOnly: true }} />
                        </FormField>
                    </Grid>

                    <ActionButtons onClear={handleWarrantyClear} onSave={handleWarrantySubmit} />
                </ExpandableSection>

                {/* Section 6: Documents */}
                <ExpandableSection
                    title="Documents"
                    expanded={expandedSections.documents}
                    onToggle={() => toggleSection('documents')}
                >
                    <Grid container spacing={3}>
                        {/* RC Book */}
                        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                            <Box sx={{ textAlign: "center" }}>
                                <input
                                    type="file"
                                    ref={rcBookRef}
                                    onChange={(e) => handleDocumentChange(e, setRcBook, setRcBookPreview)}
                                    accept="image/*,.pdf"
                                    style={{ display: 'none' }}
                                />
                                <Box
                                    onClick={() => rcBookRef.current?.click()}
                                    onDrop={(e) => handleDocumentDrop(e, setRcBook, setRcBookPreview)}
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
                                        mb: 1,
                                        overflow: "hidden",
                                        "&:hover": { backgroundColor: "#BBDEFB", borderColor: "#1565C0" }
                                    }}
                                >
                                    {rcBookPreview ? (
                                        <img src={rcBookPreview} alt="RC Book" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                <Typography color="#ff1414" fontSize={11} fontWeight={700}>RC Book /Reg Certificate</Typography>
                                {rcBookPreview && (
                                    <Typography color="#4CAF50" fontSize={11} sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }} onClick={() => window.open(rcBookPreview, '_blank')}>
                                        View Document
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Fitness Certificate */}
                        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                            <Box sx={{ textAlign: "center" }}>
                                <input
                                    type="file"
                                    ref={fitnessCertificateRef}
                                    onChange={(e) => handleDocumentChange(e, setFitnessCertificate, setFitnessCertificatePreview)}
                                    accept="image/*,.pdf"
                                    style={{ display: 'none' }}
                                />
                                <Box
                                    onClick={() => fitnessCertificateRef.current?.click()}
                                    onDrop={(e) => handleDocumentDrop(e, setFitnessCertificate, setFitnessCertificatePreview)}
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
                                        mb: 1,
                                        overflow: "hidden",
                                        "&:hover": { backgroundColor: "#BBDEFB", borderColor: "#1565C0" }
                                    }}
                                >
                                    {fitnessCertificatePreview ? (
                                        <img src={fitnessCertificatePreview} alt="Fitness Certificate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                <Typography color="#ff1414" fontSize={11} fontWeight={700}>Fitness Certificate</Typography>
                                {fitnessCertificatePreview && (
                                    <Typography color="#4CAF50" fontSize={11} sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }} onClick={() => window.open(fitnessCertificatePreview, '_blank')}>
                                        View Document
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Road Tax Certificate */}
                        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                            <Box sx={{ textAlign: "center" }}>
                                <input
                                    type="file"
                                    ref={roadTaxCertificateRef}
                                    onChange={(e) => handleDocumentChange(e, setRoadTaxCertificate, setRoadTaxCertificatePreview)}
                                    accept="image/*,.pdf"
                                    style={{ display: 'none' }}
                                />
                                <Box
                                    onClick={() => roadTaxCertificateRef.current?.click()}
                                    onDrop={(e) => handleDocumentDrop(e, setRoadTaxCertificate, setRoadTaxCertificatePreview)}
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
                                        mb: 1,
                                        overflow: "hidden",
                                        "&:hover": { backgroundColor: "#BBDEFB", borderColor: "#1565C0" }
                                    }}
                                >
                                    {roadTaxCertificatePreview ? (
                                        <img src={roadTaxCertificatePreview} alt="Road Tax Certificate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                <Typography color="#ff1414" fontSize={11} fontWeight={700}>Road tax certificate</Typography>
                                {roadTaxCertificatePreview && (
                                    <Typography color="#4CAF50" fontSize={11} sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }} onClick={() => window.open(roadTaxCertificatePreview, '_blank')}>
                                        View Document
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Insurance */}
                        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                            <Box sx={{ textAlign: "center" }}>
                                <input
                                    type="file"
                                    ref={insuranceDocRef}
                                    onChange={(e) => handleDocumentChange(e, setInsuranceDoc, setInsuranceDocPreview)}
                                    accept="image/*,.pdf"
                                    style={{ display: 'none' }}
                                />
                                <Box
                                    onClick={() => insuranceDocRef.current?.click()}
                                    onDrop={(e) => handleDocumentDrop(e, setInsuranceDoc, setInsuranceDocPreview)}
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
                                        mb: 1,
                                        overflow: "hidden",
                                        "&:hover": { backgroundColor: "#BBDEFB", borderColor: "#1565C0" }
                                    }}
                                >
                                    {insuranceDocPreview ? (
                                        <img src={insuranceDocPreview} alt="Insurance" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                <Typography color="#ff1414" fontSize={11} fontWeight={700}>Insurance</Typography>
                                {insuranceDocPreview && (
                                    <Typography color="#4CAF50" fontSize={11} sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }} onClick={() => window.open(insuranceDocPreview, '_blank')}>
                                        View Document
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* PUC Certificate */}
                        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                            <Box sx={{ textAlign: "center" }}>
                                <input
                                    type="file"
                                    ref={pucCertificateRef}
                                    onChange={(e) => handleDocumentChange(e, setPucCertificate, setPucCertificatePreview)}
                                    accept="image/*,.pdf"
                                    style={{ display: 'none' }}
                                />
                                <Box
                                    onClick={() => pucCertificateRef.current?.click()}
                                    onDrop={(e) => handleDocumentDrop(e, setPucCertificate, setPucCertificatePreview)}
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
                                        mb: 1,
                                        overflow: "hidden",
                                        "&:hover": { backgroundColor: "#BBDEFB", borderColor: "#1565C0" }
                                    }}
                                >
                                    {pucCertificatePreview ? (
                                        <img src={pucCertificatePreview} alt="PUC Certificate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                <Typography color="#ff1414" fontSize={11} fontWeight={700}>PUC certificate</Typography>
                                {pucCertificatePreview && (
                                    <Typography color="#4CAF50" fontSize={11} sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }} onClick={() => window.open(pucCertificatePreview, '_blank')}>
                                        View Document
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Permit Document */}
                        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                            <Box sx={{ textAlign: "center" }}>
                                <input
                                    type="file"
                                    ref={permitDocumentRef}
                                    onChange={(e) => handleDocumentChange(e, setPermitDocument, setPermitDocumentPreview)}
                                    accept="image/*,.pdf"
                                    style={{ display: 'none' }}
                                />
                                <Box
                                    onClick={() => permitDocumentRef.current?.click()}
                                    onDrop={(e) => handleDocumentDrop(e, setPermitDocument, setPermitDocumentPreview)}
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
                                        mb: 1,
                                        overflow: "hidden",
                                        "&:hover": { backgroundColor: "#BBDEFB", borderColor: "#1565C0" }
                                    }}
                                >
                                    {permitDocumentPreview ? (
                                        <img src={permitDocumentPreview} alt="Permit Document" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                <Typography color="#ff1414" fontSize={11} fontWeight={700}>Permit Document</Typography>
                                {permitDocumentPreview && (
                                    <Typography color="#4CAF50" fontSize={11} sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }} onClick={() => window.open(permitDocumentPreview, '_blank')}>
                                        View Document
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>

                    <ActionButtons onClear={handleDocumentsClear} onSave={handleDocumentsSubmit} />
                </ExpandableSection>
            </Box>
        </Box>
    );
}
