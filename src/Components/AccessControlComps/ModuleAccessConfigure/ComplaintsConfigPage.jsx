import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import axios from "axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ModuleConfigShell from "./ModuleConfigShell";
import { UpdateUserTypePermissions } from "../../../Api/Api";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";
import {
    ALL_FLOW_SUBMENUS,
    COMPLAINTS_FLOWS,
    FLOW_SUBMENU,
    flowPermissions,
    readFlow,
} from "./complaintsGroups";

const TOKEN = "123";

const MODULE = { key: "complaints", name: "Complaints", color: "#B45309" };

const NO_PAGES = [];

const FlowPicker = ({ roleName, value, onChange }) => (
    <Box
        sx={{
            bgcolor: "#fff",
            border: `1px solid ${DASH.line}`,
            borderRadius: RADIUS,
            p: 1.8,
            mb: 2,
        }}
    >
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.ink }}>
            Complaints Flow
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: DASH.muted, mt: 0.2, mb: 1.6 }}>
            Pick the flow {roleName} works in — only one can be active.
        </Typography>

        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 1.5,
            }}
        >
            {COMPLAINTS_FLOWS.map((flow) => {
                const Icon = flow.icon;
                const active = flow.key === value;
                return (
                    <Box
                        key={flow.key}
                        role="radio"
                        aria-checked={active}
                        tabIndex={0}
                        onClick={() => onChange(flow.key)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onChange(flow.key);
                            }
                        }}
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.4,
                            px: 1.6,
                            py: 1.4,
                            borderRadius: RADIUS,
                            cursor: "pointer",
                            userSelect: "none",
                            bgcolor: active ? `${flow.color}0A` : "#fff",
                            border: `1px solid ${active ? flow.color : DASH.line}`,
                            transition: "background-color .15s, border-color .15s",
                            "&:hover": { borderColor: active ? flow.color : DASH.faint },
                            "&:focus-visible": { outline: `2px solid ${flow.color}`, outlineOffset: 2 },
                        }}
                    >
                        <Box
                            sx={{
                                width: 34,
                                height: 34,
                                borderRadius: RADIUS,
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: active ? `${flow.color}14` : DASH.lineSoft,
                            }}
                        >
                            <Icon sx={{ fontSize: 19, color: active ? flow.color : DASH.faint }} />
                        </Box>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: DASH.ink }}>
                                    {flow.name}
                                </Typography>
                                {active && (
                                    <Box sx={{ px: 0.7, borderRadius: RADIUS, bgcolor: `${flow.color}1F` }}>
                                        <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: flow.color, lineHeight: "16px", letterSpacing: 0.5 }}>
                                            ACTIVE
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            <Typography sx={{ fontSize: 11.5, color: DASH.muted, mt: 0.2 }}>
                                {flow.caption}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: DASH.faint, mt: 0.6, lineHeight: 1.5 }}>
                                {flow.desc}
                            </Typography>
                        </Box>

                        {active
                            ? <CheckCircleIcon sx={{ fontSize: 20, color: flow.color, flexShrink: 0 }} />
                            : <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: DASH.line, flexShrink: 0 }} />}
                    </Box>
                );
            })}
        </Box>
    </Box>
);

export default function ComplaintsConfigPage() {
    const location = useLocation();
    const role = location.state?.role || { id: 0, name: "Role" };
    const [flow, setFlow] = useState(() => readFlow(location.state?.permissions));
    const [savedFlow, setSavedFlow] = useState(flow);

    const validate = () => null;

    const handleSave = async (payload) => {
        const menu = payload?.data?.mainMenus?.[0];
        if (menu) {
            menu.subMenus = [
                ...menu.subMenus,
                { subMenu: FLOW_SUBMENU, permissions: flowPermissions(flow) },
            ];
        }
        const res = await axios.put(UpdateUserTypePermissions, payload, { headers: { Authorization: `Bearer ${TOKEN}` } });
        if (res?.data?.error !== true) setSavedFlow(flow);
        return res?.data;
    };

    return (
        <ModuleConfigShell
            moduleMeta={MODULE}
            pages={NO_PAGES}
            approval={false}
            validate={validate}
            preserveSubMenus={ALL_FLOW_SUBMENUS}
            externalDirty={flow !== savedFlow}
            topSlot={<FlowPicker roleName={role.name} value={flow} onChange={setFlow} />}
            onSave={handleSave}
        />
    );
}
