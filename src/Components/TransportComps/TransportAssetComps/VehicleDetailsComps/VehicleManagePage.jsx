import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    IconButton
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { generateVehicleAssetId } from "../../../../Api/Api";
import VehicleAssetInformation from "./VehicleCreationPage";
import VehicleSafetyCompliancePage from "./VehicleSafetyCompliancePage";

function TabPanel({ children, value, index }) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

export default function VehicleManagementPage() {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [generatedVehicleId, setGeneratedVehicleId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const token = "123";

    useEffect(() => {
        generateToken();
    }, []);

    const generateToken = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(generateVehicleAssetId, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setGeneratedVehicleId(res.data.vehicleAssetID);
        } catch (error) {
            console.error("Error while generating vehicle ID:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
            {/* Header */}
            <Box sx={{
                backgroundColor: "#f2f2f2",
                px: 2,
                py: 1.5,
                borderBottom: "1px solid #ddd",
                display: "flex",
                alignItems: "center"
            }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                </IconButton>
                <Typography fontWeight={600} fontSize="18px">
                    Vehicle Management
                </Typography>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "14px"
                        },
                        "& .Mui-selected": {
                            color: "#1976D2"
                        }
                    }}
                >
                    <Tab label="Vehicle Asset Information" />
                    <Tab label="Safety & Compliance" />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
                <VehicleAssetInformation generatedVehicleId={generatedVehicleId} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <VehicleSafetyCompliancePage vehicleAssetId={generatedVehicleId} />
            </TabPanel>
        </Box>
    );
}
