import React from 'react';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AddBoxIcon from '@mui/icons-material/AddBox';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { hasAnyPermission } from '../../../Redux/Slices/AuthSlice';
import { DASH, RADIUS, EmptyNote } from '../../DashBoardComps/dashboardTheme';

/*
   Both screens behind this page exist to put students onto a fee - that is what
   their allowmapstudent / editstudent permission keys describe - so they are
   presented together rather than as two unrelated modules on the Fee & Finance
   tab.
*/
const items = [
    {
        accent: '#3457D5',
        icon: SportsSoccerIcon,
        text: 'ECA Student Mapping',
        desc: 'Assign students to extra-curricular activity fees and manage who is enrolled.',
        path: '/dashboardmenu/fee/eca-manage',
        subMenu: 'ecamanagement',
    },
    {
        accent: '#FF6B35',
        icon: AddBoxIcon,
        text: 'Additional Fee Student Mapping',
        desc: 'Assign students to additional fees and manage who has been charged.',
        path: '/dashboardmenu/fee/additional-manage',
        subMenu: 'additionalfeemanagement',
    },
];

export default function FeeStudentMappingPage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);

    // Same guard the rest of Fee & Finance uses: until the permission payload
    // has arrived, "no permissions" must not be read as "denied".
    const rbacReady = (user?.permissions?.mainMenus || []).length > 0;
    const visibleItems = items.filter(
        (item) => !rbacReady || hasAnyPermission(user.permissions, 'feeandfinance', item.subMenu)
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{
                backgroundColor: '#f2f2f2',
                px: 2,
                borderRadius: '10px 10px 10px 0px',
                borderBottom: '1px solid #ddd',
                mb: 0.13,
            }}>
                <Grid container alignItems="center">
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* negative margin keeps the button's padding from setting the bar height */}
                        <IconButton onClick={() => navigate(-1)} sx={{ width: 26, height: 26, my: '-5px', flexShrink: 0 }}>
                            <ArrowBackIcon sx={{ fontSize: 18, color: DASH.ink }} />
                        </IconButton>
                        <HowToRegIcon sx={{ fontSize: 19, color: '#3457D5', flexShrink: 0 }} />
                        <Typography sx={{ fontWeight: '600', fontSize: '20px', flexShrink: 0 }}>
                            Fee Student Mapping
                        </Typography>
                        <Typography sx={{
                            fontSize: '11.5px', color: DASH.muted, minWidth: 0,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            display: { xs: 'none', lg: 'block' },
                        }}>
                            Choose which fee you want to map students onto
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ p: 2 }}>
                {visibleItems.length === 0 && (
                    <Box sx={{ bgcolor: '#fff', border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 3 }}>
                        <EmptyNote text="You do not have access to map students onto any fee." />
                    </Box>
                )}

                <Grid container spacing={2} alignItems="stretch">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Grid key={item.subMenu} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <Link to={item.path} state={{ value: 'Y' }} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                                    <Box
                                        sx={{
                                            bgcolor: `${item.accent}0A`,
                                            border: `1px solid ${item.accent}38`,
                                            borderRadius: RADIUS,
                                            p: 1.4,
                                            height: '100%',
                                            boxSizing: 'border-box',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'box-shadow 0.2s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 16px rgba(17,24,39,0.10)',
                                                '.fsmArrow': { transform: 'translateX(3px)', opacity: 1 },
                                            },
                                        }}
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
                                                <Icon sx={{ color: item.accent, fontSize: 19 }} />
                                            </Box>

                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: DASH.ink }}>
                                                        {item.text}
                                                    </Typography>
                                                    <ArrowForwardIcon
                                                        className="fsmArrow"
                                                        sx={{
                                                            fontSize: 16,
                                                            color: item.accent,
                                                            opacity: 0.45,
                                                            transition: 'transform 0.2s ease, opacity 0.2s ease',
                                                            ml: 'auto',
                                                        }}
                                                    />
                                                </Box>
                                                <Typography sx={{ fontSize: '11.5px', color: DASH.muted, mt: 0.3, lineHeight: 1.45 }}>
                                                    {item.desc}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Link>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Box>
    );
}
