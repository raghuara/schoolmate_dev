import React, { useState, useEffect } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { generateVehicleAssetId } from "../../../../Api/Api";
import VehicleAssetInformation from "./VehicleCreationPage";
import VehicleSafetyCompliancePage from "./VehicleSafetyCompliancePage";
import { DASH, RADIUS, PageHeader } from "../../../DashBoardComps/dashboardTheme";

const ACCENT = "#A749CC";

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
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: 4,
                bgcolor: DASH.canvas,
            }}
        >
            <PageHeader
                title="Vehicle Management"
                subtitle="Add a vehicle to the fleet and record its safety compliance"
                onBack={() => navigate(-1)}
                right={
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                            height: 34,
                            px: 1.4,
                            borderRadius: RADIUS,
                            bgcolor: `${ACCENT}0F`,
                            border: `1px solid ${ACCENT}24`,
                        }}
                    >
                        <BadgeOutlinedIcon sx={{ fontSize: 16, color: ACCENT }} />
                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            Asset ID
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: ACCENT }}>
                            {isLoading ? "Generating..." : (generatedVehicleId || "Not generated")}
                        </Typography>
                    </Box>
                }
            />

            <Box
                sx={{
                    bgcolor: "#fff",
                    border: `1px solid ${DASH.line}`,
                    borderRadius: RADIUS,
                    overflow: "hidden",
                }}
            >
                <Box sx={{ borderBottom: `1px solid ${DASH.line}`, px: { xs: 0.5, md: 1 } }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            minHeight: 44,
                            "& .MuiTab-root": {
                                textTransform: "none",
                                fontSize: "13px",
                                fontWeight: 600,
                                minHeight: 44,
                                color: DASH.muted,
                                px: 2,
                            },
                            "& .Mui-selected": { color: `${DASH.ink} !important` },
                            "& .MuiTabs-indicator": { backgroundColor: ACCENT, height: 2.5, borderRadius: "3px 3px 0 0" },
                        }}
                    >
                        <Tab
                            icon={<DirectionsBusIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label="Vehicle Asset Information"
                        />
                        <Tab
                            icon={<ShieldOutlinedIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label="Safety & Compliance"
                        />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <VehicleAssetInformation generatedVehicleId={generatedVehicleId} />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <VehicleSafetyCompliancePage vehicleAssetId={generatedVehicleId} />
                </TabPanel>
            </Box>
        </Box>
    );
}
