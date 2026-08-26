import React from 'react';
import { Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { hasAnyPermission } from '../../../Redux/Slices/AuthSlice';
import { DASH, RADIUS, EmptyNote, ModuleCard, PageHeader, SectionTitle } from '../../DashBoardComps/dashboardTheme';

/*
   Every screen behind this page exists to put students onto a fee - that is what
   their allowmapstudent / editstudent / allowstudentmapping permission keys
   describe - so they are presented together rather than as unrelated modules
   spread across the Fee & Finance and Transport tabs.
*/
const items = [
    {
        accent: '#3457D5',
        icon: SportsSoccerIcon,
        text: 'ECA Student Mapping',
        desc: 'Assign students to extra-curricular activity fees and manage who is enrolled.',
        path: '/dashboardmenu/fee/eca-manage',
        mainMenu: 'feeandfinance',
        subMenu: 'ecamanagement',
    },
    {
        accent: '#FF6B35',
        icon: AddBoxIcon,
        text: 'Additional Fee Student Mapping',
        desc: 'Assign students to additional fees and manage who has been charged.',
        path: '/dashboardmenu/fee/additional-manage',
        mainMenu: 'feeandfinance',
        subMenu: 'additionalfeemanagement',
    },
    {
        accent: '#7DC353',
        icon: DirectionsBusIcon,
        text: 'Transport Student Mapping',
        desc: 'Assign students to a route, stop and vehicle for the transport fee.',
        path: '/dashboardmenu/transport/student-map',
        mainMenu: 'transport',
        subMenu: 'studentmapping',
    },
];

export default function FeeStudentMappingPage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);

    // Same guard the rest of Fee & Finance uses: until the permission payload
    // has arrived, "no permissions" must not be read as "denied".
    const rbacReady = (user?.permissions?.mainMenus || []).length > 0;
    const visibleItems = items.filter(
        (item) => !rbacReady || hasAnyPermission(user.permissions, item.mainMenu, item.subMenu)
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
            <PageHeader
                title="Fee Student Mapping"
                subtitle="Choose which fee you want to map students onto"
                onBack={() => navigate(-1)}
            />

            <SectionTitle icon={HowToRegIcon}>Mapping Screens</SectionTitle>

            {visibleItems.length === 0 && (
                <Box sx={{ bgcolor: '#fff', border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 3 }}>
                    <EmptyNote text="You do not have access to map students onto any fee." />
                </Box>
            )}

            <Grid container spacing={2} alignItems="stretch" sx={{ pb: 1 }}>
                {visibleItems.map((item) => (
                    <Grid
                        key={item.subMenu}
                        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                        sx={{ display: 'flex' }}
                    >
                        <ModuleCard
                            accent={item.accent}
                            icon={item.icon}
                            title={item.text}
                            desc={item.desc}
                            to={item.path}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
