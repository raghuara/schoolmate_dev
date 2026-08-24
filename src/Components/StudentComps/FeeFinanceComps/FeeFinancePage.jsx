import { Box, Button, Grid, Menu, MenuItem, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import { findSubMenuPermissions, hasAnyPermission } from '../../../Redux/Slices/AuthSlice';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../../Redux/Slices/DropdownController';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { paymentApprovalsGet } from '../../../Api/Api';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PaymentIcon from '@mui/icons-material/Payment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GroupsIcon from '@mui/icons-material/Groups';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import AppsIcon from '@mui/icons-material/Apps';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AddBoxIcon from '@mui/icons-material/AddBox';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { DASH, RADIUS, PageHeader, SectionTitle } from '../../DashBoardComps/dashboardTheme';

/*
   Module cards, in the same language as Profile Management: a flat accent tint,
   a matching border, and chips that are real destinations rather than labels.

   ECA and Additional Fee are not two separate modules from the user's side -
   both screens exist to put students onto a fee, which is what their
   allowmapstudent / editstudent permission keys describe. They now sit inside a
   single "Fee Student Mapping" card. `accessKey` on each chip is the name the
   permission lookup below uses, so a chip only appears when it would actually
   open something.
*/
const CARD_DESC_H = 34;
const CARD_CHIP_H = 21;

const items = [
    {
        accent: "#8600BB",
        icon: DashboardIcon,
        text: "Finance Dashboard",
        desc: "Revenue, collections and outstanding fees at a glance.",
        path: "dashboard",
        accessKey: "Finance Dashboard",
        links: [],
    },
    {
        accent: "#E30053",
        icon: PaymentIcon,
        text: "Billing Screen",
        desc: "Collect fees, record payments and raise receipts.",
        path: "pay-fees",
        accessKey: "Billing Screen",
        links: [],
    },
    {
        accent: "#3457D5",
        icon: HowToRegIcon,
        text: "Fee Student Mapping",
        desc: "Put students onto extra-curricular and additional fees.",
        path: "student-mapping",
        accessKey: "Fee Student Mapping",
        links: [
            { label: "ECA Students", path: "eca-manage", accessKey: "ECA Management" },
            { label: "Additional Fee Students", path: "additional-manage", accessKey: "Additional Fee Management" },
        ],
    },
    {
        accent: "#7DC353",
        icon: AccountBalanceWalletIcon,
        text: "Expense",
        desc: "Record school spending and track it against budget.",
        path: "expense",
        accessKey: "Expense",
        links: [
            { label: "Add Expense", path: "expense", state: { value: "Y", tabKey: "addExpense" }, accessKey: "Expense: Add Expense" },
            // Add Budget is a dialog on the Expense dashboard, so the shortcut
            // has to land on that tab and open it.
            { label: "Add Budget", path: "expense", state: { value: "Y", tabKey: "dashboard", openBudget: true }, accessKey: "Expense: Add Budget" },
        ],
    },
    {
        accent: "#00ACC1",
        icon: ReceiptLongIcon,
        text: "Concession Log",
        desc: "History of every fee concession granted to a student.",
        path: "concession-log",
        accessKey: "Concession Log",
        links: [],
    },
    {
        accent: "#15803D",
        icon: VerifiedOutlinedIcon,
        text: "Payment Approval",
        desc: "Verify online and cheque payments in the Approvals hub.",
        path: "/dashboardmenu/approvals/payments",
        accessKey: "Payment Approval",
        badgeKey: "pendingPayments",
        links: [],
    },
    {
        accent: "#7C3AED",
        icon: GroupsIcon,
        text: "Finance Teams",
        desc: "Split admin staff between billing and accounts approvers.",
        path: "teams",
        accessKey: "Finance Teams",
        links: [],
    },
];

export default function FeeFinancePage() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("");
    const websiteSettings = useSelector(selectWebsiteSettings);
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];
    const user = useSelector((state) => state.auth);

    // Which cards this user may open. Billing, ECA, Additional Fee and Expense
    // carry no plain "view" flag - their access is whatever operation keys the
    // role was granted - so those go through hasAnyPermission.
    const perms = user.permissions;
    // Same guard the sidebar uses: until the permission payload has actually
    // arrived, don't treat "no permissions" as "denied" - that empties the whole
    // tab instead of showing what the user is entitled to.
    const rbacReady = (perms?.mainMenus || []).length > 0;
    const allow = (fn) => !rbacReady || fn();
    const cardAccess = {
        "Finance Dashboard": allow(() => findSubMenuPermissions(perms, "feeandfinance", "financedashboard")?.view === "Y"),
        "Billing Screen": allow(() => hasAnyPermission(perms, "feeandfinance", "billingscreen")),
        "ECA Management": allow(() => hasAnyPermission(perms, "feeandfinance", "ecamanagement")),
        "Additional Fee Management": allow(() => hasAnyPermission(perms, "feeandfinance", "additionalfeemanagement")),
        "Expense": allow(() => hasAnyPermission(perms, "feeandfinance", "expense")),
        "Concession Log": allow(() => findSubMenuPermissions(perms, "feeandfinance", "concessionlog")?.view === "Y"),
    };
    /*
       Expense chips are per-operation, not per-module: the card itself appears
       for anyone with any expense key, but "Add Expense" needs allowaddexpense
       and "Add Budget" needs allowaddbudget together with viewdashboard, since
       the budget dialog lives on that tab.
    */
    const expensePerms = findSubMenuPermissions(perms, "feeandfinance", "expense") || {};
    const expenseGranted = (key) => allow(() => expensePerms[key] === "Y");
    cardAccess["Expense: Add Expense"] = expenseGranted("allowaddexpense");
    cardAccess["Expense: Add Budget"] = expenseGranted("allowaddbudget") && expenseGranted("viewdashboard");

    // Fee Student Mapping is a wrapper over the two student-assignment screens,
    // so it shows when the user can reach either one.
    cardAccess["Fee Student Mapping"] =
        cardAccess["ECA Management"] || cardAccess["Additional Fee Management"];

    // Payment Approval and Finance Teams have no permission sub menu of their
    // own yet, so they follow the page itself until Access Control gains keys
    // for them.
    cardAccess["Payment Approval"] = true;
    cardAccess["Finance Teams"] = true;

    const canCreateFeeStructure = allow(() => findSubMenuPermissions(perms, "feeandfinance", "createfeesstructure")?.create === "Y");

    const token = "123";
    // Only the pending count is needed here - it drives the badge on the
    // Payment Approval card. The queue itself lives in the Approvals hub.
    const [pendingPayments, setPendingPayments] = useState(0);

    useEffect(() => {
        axios.get(paymentApprovalsGet, {
            params: { method: "all" },
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => setPendingPayments(Number(res?.data?.summary?.pendingCount) || 0))
            .catch((err) => console.error("paymentApprovalsGet (count) failed:", err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cardBadges = { pendingPayments };

    useEffect(() => {
        if (grades && grades.length > 0) {
            setSelectedGradeId(grades[0].id);
            setSelectedSection(grades[0].sections[0]);
        }
    }, [grades]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const open = Boolean(anchorEl);
    const id = open ? "fee-structure-popover" : undefined;

    const feeTypes = [
        {
            label: "School Fee",
            desc: "Term-wise tuition for each grade",
            path: "school",
            accent: "#A749CC",
            icon: SchoolIcon,
        },
        {
            label: "Transport Fee",
            desc: "Charges by route and stop",
            path: "transport",
            accent: "#ED9146",
            icon: DirectionsBusIcon,
        },
        {
            label: "Extra-Curricular Fee",
            desc: "Fees for activities and clubs",
            path: "extra-curricular",
            accent: "#7DC353",
            icon: SportsSoccerIcon,
        },
        {
            label: "Additional Fee",
            desc: "One-off and miscellaneous charges",
            path: "extra",
            accent: "#E10052",
            icon: AddBoxIcon,
        },
    ];

    const handleFeeSelect = (fee) => {
        handleClose();
        navigate(fee.path);
    };

    const handleClose = () => {
        setAnchorEl(null);
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
                title="Fee & Finance"
                subtitle="Fee structures, collections and payment approvals"
                onBack={() => navigate(-1)}
                right={canCreateFeeStructure && (
                    <>
                        <Button
                            aria-describedby={id}
                            onClick={handleClick}
                            disableElevation
                            startIcon={<PostAddIcon sx={{ fontSize: 18 }} />}
                            endIcon={
                                <KeyboardArrowDownIcon
                                    sx={{
                                        fontSize: 18,
                                        transition: 'transform 0.2s ease',
                                        transform: open ? 'rotate(180deg)' : 'none',
                                    }}
                                />
                            }
                            sx={{
                                textTransform: 'none',
                                fontSize: '13px',
                                fontWeight: 700,
                                height: 34,
                                px: 1.8,
                                borderRadius: RADIUS,
                                color: '#fff',
                                bgcolor: '#E30053',
                                '&:hover': { bgcolor: '#C40047' },
                            }}
                        >
                            Create Fee Structure
                        </Button>
                        <Menu
                            id={id}
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            slotProps={{
                                paper: {
                                    sx: {
                                        mt: 0.7,
                                        minWidth: 268,
                                        borderRadius: RADIUS,
                                        border: `1px solid ${DASH.line}`,
                                        boxShadow: '0 8px 24px rgba(16,24,40,0.12)',
                                    },
                                },
                            }}
                        >
                            <Typography sx={{
                                fontSize: 10.5, fontWeight: 700, color: DASH.muted,
                                textTransform: 'uppercase', letterSpacing: 0.5,
                                px: 1.6, pt: 0.6, pb: 0.8,
                            }}>
                                Choose a fee type
                            </Typography>
                            {feeTypes.map((fee) => {
                                const FeeIcon = fee.icon;
                                return (
                                    <MenuItem
                                        key={fee.path}
                                        onClick={() => handleFeeSelect(fee)}
                                        sx={{
                                            gap: 1.3,
                                            py: 1,
                                            px: 1.6,
                                            '&:hover': { bgcolor: `${fee.accent}0F` },
                                        }}
                                    >
                                        <Box sx={{
                                            width: 30, height: 30, borderRadius: RADIUS,
                                            bgcolor: `${fee.accent}14`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <FeeIcon sx={{ fontSize: 17, color: fee.accent }} />
                                        </Box>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: DASH.ink }}>
                                                {fee.label}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10.5px', color: DASH.faint }}>
                                                {fee.desc}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                );
                            })}
                        </Menu>
                    </>
                )}
            />
            <SectionTitle icon={AppsIcon}>Modules</SectionTitle>
            <Grid container spacing={2} alignItems="stretch" sx={{ pb: 1 }}>
                {items
                    .filter(item => cardAccess[item.accessKey])
                    .map((item) => {
                        const IconComponent = item.icon;
                        // Only the chips this user can actually open. The head always
                        // opens the module's own path, so clicking the card never
                        // silently picks one of the chips for you.
                        const links = item.links.filter(l => cardAccess[l.accessKey]);
                        return (
                            <Grid
                                key={item.accessKey}
                                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <Box
                                    sx={{
                                        bgcolor: `${item.accent}0A`,
                                        borderTop: `1px solid ${item.accent}38`,
                                        borderLeft: `1px solid ${item.accent}38`,
                                        borderBottom: '1px solid transparent',
                                        borderRight: '1px solid transparent',
                                        borderRadius: RADIUS,
                                        boxShadow: '1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)',
                                        p: 1.4,
                                        height: '100%',
                                        boxSizing: 'border-box',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                                        '&:hover': {
                                            boxShadow: '0 4px 16px rgba(17,24,39,0.10)',
                                            borderBottomColor: `${item.accent}38`,
                                            borderRightColor: `${item.accent}38`,
                                            '.ffArrow': { transform: 'translateX(3px)', opacity: 1 },
                                        },
                                    }}
                                >
                                    {/* The head opens the module. It is a sibling of the chips below
                                        rather than wrapping them - an anchor inside an anchor is invalid
                                        markup and the outer one swallows the inner click. */}
                                    <Link
                                        to={item.path}
                                        state={{ value: 'Y' }}
                                        style={{ textDecoration: 'none', display: 'block' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                                            <Box
                                                sx={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: '50%',
                                                    bgcolor: `${item.accent}14`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <IconComponent sx={{ color: item.accent, fontSize: 19 }} />
                                            </Box>

                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: DASH.ink, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {item.text}
                                                    </Typography>
                                                    {item.badgeKey && cardBadges[item.badgeKey] > 0 && (
                                                        <Box
                                                            sx={{
                                                                px: 0.7,
                                                                borderRadius: "20px",
                                                                bgcolor: `${item.accent}1F`,
                                                                border: `1px solid ${item.accent}3D`,
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <Typography sx={{ fontSize: 10, fontWeight: 800, color: item.accent, lineHeight: "16px" }}>
                                                                {cardBadges[item.badgeKey]}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    <ArrowForwardIcon
                                                        className="ffArrow"
                                                        sx={{
                                                            fontSize: 16,
                                                            color: item.accent,
                                                            opacity: 0.45,
                                                            transition: 'transform 0.2s ease, opacity 0.2s ease',
                                                            ml: 'auto',
                                                        }}
                                                    />
                                                </Box>
                                                <Typography
                                                    sx={{
                                                        fontSize: '11.5px',
                                                        color: DASH.muted,
                                                        mt: 0.3,
                                                        lineHeight: 1.45,
                                                        height: CARD_DESC_H,
                                                        display: '-webkit-box',
                                                        WebkitBoxOrient: 'vertical',
                                                        WebkitLineClamp: 2,
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {item.desc}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Link>

                                    {/* Shortcuts straight into the screens behind this module */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            mt: 'auto',
                                            pt: 0.9,
                                            height: CARD_CHIP_H,
                                            boxSizing: 'content-box',
                                            overflowX: 'auto',
                                            scrollbarWidth: 'none',
                                            '&::-webkit-scrollbar': { display: 'none' },
                                        }}
                                    >
                                        {links.map((l) => (
                                            <Link
                                                key={l.label}
                                                to={l.path}
                                                state={l.state || { value: 'Y' }}
                                                style={{ textDecoration: 'none', flexShrink: 0 }}
                                            >
                                                <Box
                                                    sx={{
                                                        px: 0.85,
                                                        py: 0.25,
                                                        borderRadius: '20px',
                                                        bgcolor: `${item.accent}0F`,
                                                        border: `1px solid ${item.accent}24`,
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'background-color 0.15s ease, border-color 0.15s ease',
                                                        '&:hover': {
                                                            bgcolor: `${item.accent}1F`,
                                                            borderColor: `${item.accent}59`,
                                                        },
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: '10px', fontWeight: 600, color: item.accent, lineHeight: '15px' }}>
                                                        {l.label}
                                                    </Typography>
                                                </Box>
                                            </Link>
                                        ))}
                                    </Box>
                                </Box>
                            </Grid>
                        )
                    })}
            </Grid>

        </Box>
    )
}
