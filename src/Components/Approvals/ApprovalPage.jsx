import { Box, Grid, Tab, Tabs, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectVersion } from "../../Redux/Slices/versionSlice";
import Loader from "../Loader";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ApprovalStatusCircularFetch, ApprovalStatusHomeWorkFetch, ApprovalStatusMessageFetch, ApprovalStatusNewsFetch, GetOverallLeaveDetails, paymentApprovalsGet } from "../../Api/Api";
import { selectAcademicYear } from "../../Redux/Slices/academicYearSlice";
import { findSubMenuPermissions, hasMainMenuAccess, selectUserTypeID } from "../../Redux/Slices/AuthSlice";
import { APPROVAL_SUBMENUS, isApproverFor, selectApprovalMatrix } from "../../Redux/Slices/approvalMatrixSlice";
import axios from "axios";
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MessageIcon from '@mui/icons-material/Message';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { DASH, RADIUS, PageHeader, SectionTitle, ModuleCard, EmptyNote } from "../DashBoardComps/dashboardTheme";

export default function ApprovalPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [newsIntimation, setNewsIntimation] = useState(false);
    const [messageIntimation, setMessageIntimation] = useState(false);
    const [circularIntimation, setCircularIntimation] = useState(false);
    const [homeworkIntimation, setHomeworkIntimation] = useState(false);
    const [leavePending, setLeavePending] = useState(0);
    const [paymentPending, setPaymentPending] = useState(0);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const permissions = user.permissions;
    const userTypeID = useSelector(selectUserTypeID);
    const approvalMatrix = useSelector(selectApprovalMatrix);

    // Access comes from the login response, never from userType.
    // Until the backend publishes an "approvals" main menu, the tree is absent
    // and the module stays open; once it arrives, it takes over completely.
    const approvalsMenu = (permissions?.mainMenus || []).find((m) => m.mainMenu === "approvals");
    const rbacReady = Boolean(approvalsMenu);
    const hasApprovalsAccess = !rbacReady || hasMainMenuAccess(permissions, "approvals");

    // A tab is hidden only when the backend explicitly says so. An unknown
    // subMenu name falls through to visible, so a naming mismatch cannot lock
    // an approver out of their own queue.
    const canSeeTab = (subMenu) => {
        if (!rbacReady) return true;
        const perms = findSubMenuPermissions(permissions, "approvals", subMenu);
        if (!perms) return true;
        return Object.values(perms).some((v) => v === "Y");
    };
    const version = useSelector(selectVersion);
    const academicYear = useSelector(selectAcademicYear);
    const token = "123"
    const location = useLocation();

    // Callers should send state.tabId ('communication' | 'fee' | 'leave').
    // A raw tabIndex still works for older callers, but it is brittle: which tabs
    // exist depends on the licence version and this role's permissions, so index
    // 1 is not always the same tab. The id is resolved against the live list.
    const [value, setValue] = useState(location.state?.tabIndex ?? 0);

    // A card is only worth showing to someone who sits on that module's approval
    // chain - anyone else has nothing waiting on them. All four fee cards are
    // governed by the single "createfeesstructure" flow.
    const approves = (subMenu) => isApproverFor(approvalMatrix, subMenu, userTypeID);

    const items = [
        { subMenu: APPROVAL_SUBMENUS.NEWS, color: "#A749CC", icon: NewspaperIcon, text: "News", desc: "Review news posts before they reach parents and students.", path: 'news', intimation: newsIntimation },
        { subMenu: APPROVAL_SUBMENUS.MESSAGE, color: "#ED9146", icon: MessageIcon, text: "Messages", desc: "Review messages waiting to be sent out.", path: 'messages', intimation: messageIntimation },
        { subMenu: APPROVAL_SUBMENUS.CIRCULAR, color: "#7DC353", icon: StickyNote2Icon, text: "Circulars", desc: "Review circulars before they are published.", path: 'circulars', intimation: circularIntimation },
        { subMenu: APPROVAL_SUBMENUS.HOMEWORK, color: "#E10052", icon: MenuBookIcon, text: "Homework", desc: "Review homework before it reaches the class.", path: 'homework', intimation: homeworkIntimation },
    ].filter((item) => approves(item.subMenu));

    const leaveItems = [
        { color: "#3457D5", icon: EventBusyIcon, text: "Student Leave", desc: "Approve or reject student leave requests.", path: 'student-leave', badge: leavePending },
    ];

    const items1 = [
        { color: "#A749CC", icon: SchoolIcon, text: "School Fee", desc: "Approve the school fee structure for each grade.", path: 'school', intimation: newsIntimation },
        { color: "#ED9146", icon: DirectionsBusIcon, text: "Transport Fee", desc: "Approve transport fee structures for each route.", path: 'transport', intimation: messageIntimation },
        { color: "#7DC353", icon: SportsSoccerIcon, text: "ECA Fee", desc: "Approve extra-curricular activity fees.", path: 'eca', intimation: circularIntimation },
        { color: "#E10052", icon: AddBoxIcon, text: "Additional Fee", desc: "Approve one-off and miscellaneous charges.", path: 'additional', intimation: homeworkIntimation },
    ].filter(() => approves(APPROVAL_SUBMENUS.FEE_STRUCTURE));

    /*
       Online payments are a different kind of approval from a fee structure:
       the accounts team clears money that has already been collected, so this
       card is not filtered by the fee-structure approval matrix.
    */
    const paymentItems = [
        {
            color: "#15803D",
            icon: PriceCheckIcon,
            text: "Payment Approval",
            desc: "Verify online and cheque payments taken at the billing counter.",
            path: "payments",
            badge: paymentPending,
        },
    ];

    const tabs = [
        ...(version.LITE && canSeeTab('communication') && items.length ? [{ id: 'communication', label: 'Communication', icon: CampaignOutlinedIcon, dot: items.some((i) => i.intimation) }] : []),
        ...(version.PRO && canSeeTab('fee') && (items1.length || paymentItems.length) ? [{ id: 'fee', label: 'Fee & Finance', icon: ReceiptLongIcon, count: paymentPending }] : []),
        ...(version.LITE && canSeeTab('leave') ? [{ id: 'leave', label: 'Leave Management', icon: EventBusyIcon, count: leavePending }] : []),
    ];
    const activeTabId = tabs[value]?.id;

    useEffect(() => {
        const byId = location.state?.tabId
            ? tabs.findIndex((t) => t.id === location.state.tabId)
            : -1;
        if (byId >= 0) { setValue(byId); return; }
        if (location.state?.tabIndex !== undefined) setValue(location.state.tabIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, tabs.length]);

    // If the landing index points past the tabs this role can see, fall back to
    // the first one rather than showing an empty page.
    useEffect(() => {
        if (tabs.length && value > tabs.length - 1) setValue(0);
    }, [tabs.length, value]);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            fetchApprovalData(ApprovalStatusNewsFetch, setNewsIntimation),
            fetchApprovalData(ApprovalStatusMessageFetch, setMessageIntimation),
            fetchApprovalData(ApprovalStatusCircularFetch, setCircularIntimation),
            fetchApprovalData(ApprovalStatusHomeWorkFetch, setHomeworkIntimation),
        ]).finally(() => {
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Pending student-leave count → badge on the Student Leave card.
    useEffect(() => {
        axios.get(GetOverallLeaveDetails, {
            params: { academicYear, status: "pending" },
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => setLeavePending(res.data?.cards?.pending || 0))
            .catch((err) => console.error("GetOverallLeaveDetails (count) failed:", err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear]);

    // Pending online / cheque payments → badge on the Payment Approval card.
    useEffect(() => {
        axios.get(paymentApprovalsGet, {
            params: { method: "all" },
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => setPaymentPending(Number(res.data?.summary?.pendingCount) || 0))
            .catch((err) => console.error("paymentApprovalsGet (count) failed:", err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const fetchApprovalData = async (endpoint, setIntimation) => {
        try {
            const res = await axios.get(endpoint, {
                params: {
                    rollNumber: rollNumber,
                    userType: userType,
                    screen: "approver",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const postData = res.data.post || [];
            const scheduleData = res.data.schedule || [];

            const allData = [...postData, ...scheduleData];
            const filteredData = allData.filter(
                (item) => item.createdByRollNumber !== rollNumber
            );
            setIntimation(filteredData.length > 0);
        } catch (error) {
            console.error(`Error fetching approval from ${endpoint}`, error);
        }
    };

    if (!hasApprovalsAccess) {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }

    // One card grid, whatever the section holds - every card is the same
    // height, so a section with fewer cards cannot bleed into the next one.
    const CardGrid = ({ list }) => (
        <Grid container spacing={2} alignItems="stretch" sx={{ pb: 1 }}>
            {list.map((item) => (
                <Grid key={item.text} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <ModuleCard
                        accent={item.color}
                        icon={item.icon}
                        title={item.text}
                        desc={item.desc}
                        to={item.path}
                        state={{ tabId: activeTabId, tabIndex: value }}
                        badge={item.badge}
                        dot={item.intimation}
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
            }}
        >
            {isLoading && <Loader />}

            <PageHeader
                title="Approvals"
                subtitle="Everything waiting for your review, by module"
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
                            label={(
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <Box sx={{ px: 0.7, borderRadius: '20px', bgcolor: '#FFF3E0', border: '1px solid #FFE0B2' }}>
                                            <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#E65100', lineHeight: '16px' }}>
                                                {tab.count}
                                            </Typography>
                                        </Box>
                                    )}
                                    {!tab.count && tab.dot && (
                                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: DASH.red }} />
                                    )}
                                </Box>
                            )}
                        />
                    );
                })}
            </Tabs>

            {activeTabId === 'communication' && (
                <Box>
                    <SectionTitle icon={CampaignOutlinedIcon}>Communication Approvals</SectionTitle>
                    <CardGrid list={items} />
                </Box>
            )}

            {activeTabId === 'fee' && (
                <Box>
                    {items1.length > 0 && (
                        <>
                            <SectionTitle icon={SchoolIcon}>Fee Structure Approvals</SectionTitle>
                            <CardGrid list={items1} />
                        </>
                    )}

                    <SectionTitle icon={PriceCheckIcon}>Payment Approvals</SectionTitle>
                    <CardGrid list={paymentItems} />
                </Box>
            )}

            {activeTabId === 'leave' && (
                <Box>
                    <SectionTitle icon={EventBusyIcon}>Leave Approvals</SectionTitle>
                    <CardGrid list={leaveItems} />
                </Box>
            )}

            {tabs.length === 0 && (
                <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 3, mt: 2 }}>
                    <EmptyNote text="You are not on any approval chain right now." />
                </Box>
            )}
        </Box>
    );
}
