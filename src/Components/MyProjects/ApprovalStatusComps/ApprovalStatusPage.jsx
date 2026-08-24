import { Box, Grid, Tab, Tabs } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { selectVersion } from "../../../Redux/Slices/versionSlice";
import { findSubMenuPermissions, selectUserTypeID } from "../../../Redux/Slices/AuthSlice";
import { APPROVAL_SUBMENUS, mustRequestApproval, selectApprovalMatrix, selectApprovalMatrixReady } from "../../../Redux/Slices/approvalMatrixSlice";
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MessageIcon from '@mui/icons-material/Message';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { DASH, RADIUS, EmptyNote, ModuleCard, PageHeader, SectionTitle } from "../../DashBoardComps/dashboardTheme";

export default function ApprovalStatusPage() {
    const user = useSelector((state) => state.auth);
    const version = useSelector(selectVersion);
    const navigate = useNavigate();
    const location = useLocation();

    const [value, setValue] = useState(location.state?.tabIndex ?? 0);

    const rbacReady = (user?.permissions?.mainMenus || []).length > 0;
    const userTypeID = useSelector(selectUserTypeID);
    const approvalMatrix = useSelector(selectApprovalMatrix);
    const matrixReady = useSelector(selectApprovalMatrixReady);

    // This screen tracks work YOU sent for approval, so a card only earns a
    // place when both hold: you can create in that module, and your work
    // actually goes for approval. Level 1 posts straight out and never has a
    // pending item; a module with no flow never queues one either -
    // mustRequestApproval is false in both cases.
    const tracks = (mainMenu, subMenu, flowKey) =>
        findSubMenuPermissions(user?.permissions, mainMenu, subMenu)?.create === "Y"
        && mustRequestApproval(approvalMatrix, flowKey, userTypeID);

    const items = [
        { color: "#A749CC", icon: NewspaperIcon, text: "News", desc: "News posts you sent for approval.", path: 'news', show: tracks("communication", "news", APPROVAL_SUBMENUS.NEWS) },
        { color: "#ED9146", icon: MessageIcon, text: "Messages", desc: "Messages you sent for approval.", path: 'messages', show: tracks("communication", "message", APPROVAL_SUBMENUS.MESSAGE) },
        { color: "#7DC353", icon: StickyNote2Icon, text: "Circulars", desc: "Circulars you sent for approval.", path: 'circulars', show: tracks("communication", "circular", APPROVAL_SUBMENUS.CIRCULAR) },
        { color: "#E10052", icon: MenuBookIcon, text: "Homework", desc: "Homework you sent for approval.", path: 'homework', show: tracks("communication", "homework", APPROVAL_SUBMENUS.HOMEWORK) },
    ].filter((i) => i.show);

    // All four fee types ride on the one createfeesstructure flow.
    const canTrackFees = tracks("feeandfinance", "createfeesstructure", APPROVAL_SUBMENUS.FEE_STRUCTURE);
    const items1 = [
        { color: "#A749CC", icon: SchoolIcon, text: "School Fee", desc: "School fee structures you submitted.", path: 'school' },
        { color: "#ED9146", icon: DirectionsBusIcon, text: "Transport Fee", desc: "Transport fee structures you submitted.", path: 'transport' },
        { color: "#7DC353", icon: SportsSoccerIcon, text: "ECA Fee", desc: "Extra-curricular fee structures you submitted.", path: 'extracurricular' },
        { color: "#E10052", icon: AddBoxIcon, text: "Additional Fee", desc: "Additional fee structures you submitted.", path: 'additional' },
    ].filter(() => canTrackFees);

    // Inventory and Assets had no panel behind them, so selecting either showed
    // a blank page. A tab with no cards left is not worth offering either.
    const tabs = [
        ...(version.LITE && items.length ? [{ id: 'communication', label: 'Communication', icon: CampaignOutlinedIcon }] : []),
        ...(version.PRO && items1.length ? [{ id: 'fee', label: 'Fee & Finance', icon: ReceiptLongIcon }] : []),
    ];
    const activeTabId = tabs[value]?.id;

    // Nothing to track - the My Projects button is hidden in this case too.
    const nothingToTrack = rbacReady && matrixReady && !items.length && !items1.length;

    useEffect(() => {
        if (location.state?.tabIndex !== undefined) {
            setValue(location.state.tabIndex);
        }
    }, [location.state]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    if (nothingToTrack) {
        return <Navigate to="/dashboardmenu/myprojects" replace />;
    }

    const CardGrid = ({ list, tabIndex }) => (
        <Grid container spacing={2} alignItems="stretch" sx={{ pb: 1 }}>
            {list.map((item) => (
                <Grid key={item.text} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <ModuleCard
                        accent={item.color}
                        icon={item.icon}
                        title={item.text}
                        desc={item.desc}
                        to={item.path}
                        state={{ tabIndex }}
                    />
                </Grid>
            ))}
        </Grid>
    );

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: 4,
                bgcolor: DASH.canvas,
                boxSizing: "border-box",
            }}
        >
            <PageHeader
                title="Approval Status"
                subtitle="Where the work you sent for approval currently stands"
                onBack={() => navigate("/dashboardmenu/myprojects", { state: { tabIndex: value } })}
            />

            <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    minHeight: 40,
                    borderBottom: `1px solid ${DASH.line}`,
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        minHeight: 40,
                        color: DASH.muted,
                        px: 2,
                    },
                    '& .Mui-selected': { color: `${DASH.ink} !important` },
                    '& .MuiTabs-indicator': { backgroundColor: DASH.primary, height: 2.5, borderRadius: '3px 3px 0 0' },
                }}
            >
                {tabs.map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                        <Tab
                            key={tab.id}
                            icon={TabIcon ? <TabIcon sx={{ fontSize: 18 }} /> : undefined}
                            iconPosition="start"
                            label={tab.label}
                        />
                    );
                })}
            </Tabs>

            {activeTabId === 'communication' && (
                <Box>
                    <SectionTitle icon={CampaignOutlinedIcon}>Communication</SectionTitle>
                    <CardGrid list={items} tabIndex={0} />
                </Box>
            )}

            {activeTabId === 'fee' && (
                <Box>
                    <SectionTitle icon={SchoolIcon}>Fee Structures</SectionTitle>
                    <CardGrid list={items1} tabIndex={1} />
                </Box>
            )}

            {tabs.length === 0 && (
                <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 3, mt: 2 }}>
                    <EmptyNote text="You have not sent anything for approval yet." />
                </Box>
            )}
        </Box>
    );
}
