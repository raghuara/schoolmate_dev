import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ManagementPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { packageType } = location.state || {};

    let heading = '';
    let subHeading = '';
    let tittle = '';
    let tittle1 = '';
    let description = [];
    let color = '';
    let bgColor = '';
    let bgColor1 = '';

    switch (packageType) {
        case 'lite':
            heading = 'SchoolMate - Lite';
            subHeading = "Smart schools don't send messages. They build conversations";
            tittle = "Communication Only Ideal for schools beginning their digital journey.";
            description = [
                'Real-time communication between school and parents',
                'Circulars, announcements, and reminders',
                'Notifications for attendance, homework, and events',
                'Digital consent forms and acknowledgements',
                'Daily/class-wise digital attendance with instant parent notification',
                'Timetable & academic calendar setup',
                'Limited role-based permissions for staff access control'
            ];            
            color = '#E80155';
            bgColor = '#F8EFF2';
            bgColor1 = '#FBF6F7';
            break;
        case 'pro':
            heading = 'SchoolMate - Pro';
            subHeading = 'Let your ERP do the work. Not your admin staff';
            tittle = "Built on everything in Pro, and goes even further with:";
            tittle1 = "For schools ready to digitize academic and administrative operations.";
            description = [
                'Student & staff profile management',
                'Online fee collection with reminders',
                'Leave & payroll tracking',
                'Internal document management system',
                'Advanced role-based permissions & approval workflows',
                'Stock and inventory management',
                'Order management for uniforms, stationery & more',
                'Simple book distribution tracking to students and staff'
            ];
            color = '#149B46';
            bgColor = '#F0F6F3';
            bgColor1 = '#F6F9F7';
            break;
        case 'plus':
            heading = 'SchoolMate - Plus';
            subHeading = 'Empowering schools with additional capabilities.';
            tittle = "Built on everything in PLUS, and goes even further with:";
            tittle1 = "Best for schools that value operational efficiency and student safety.";
            description = [
                'GPS-based live bus tracking',
                'Pickup/drop alerts for parents',
                'Transport-linked attendance',
                'Route planning & staff/bus assignments',
                'Transport reports & emergency alerts'
            ];
            
            color = '#7E27AE';
            bgColor = '#f5f1f7';
            bgColor1 = '#F8F7F9';
            break;

        case 'premium':
            heading = 'SchoolMate - Premium';
            subHeading = 'Ultimate ERP suite for large school groups.';
            tittle = "Built on everything in 360, and goes even further with:";
            tittle1 = "The ultimate all-in-one platform for modern schools.";
            description = [
                'Exam planner & online mark entry',
                'Auto-generated report cards',
                'Homework tracking & submission updates',
                'Syllabus coverage and lesson progress monitoring',
                'Performance dashboards & academic analytics Daily task management for staff',
                'Teachers\' work done register',
                'Personalized to-do list for efficient planning'
            ];
            
            color = '#F49D2F';
            bgColor = '#FAF6F2';
            bgColor1 = '#FAF8F6';
            break;
        default:
            heading = 'SchoolMate';
            subHeading = '';
            description = [];
            color = '#000';
    }
 
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>

                <Typography variant="h5" fontWeight="bold" sx={{ color: color, }}>
                    {heading}
                </Typography>
            </Box>

            {subHeading && (
                <Typography variant="subtitle1" sx={{ color: color, mb: 2, ml: 5 }}>
                    {subHeading}
                </Typography>
            )}
            <Box>
                <Box sx={{ backgroundColor: bgColor, p: 2 }}>
                    {tittle1 && (
                        <Typography variant="subtitle1" sx={{ color: '#000', }}>
                            {tittle1}
                        </Typography>
                    )}
                    {tittle && (
                        <Typography variant="subtitle1" sx={{ color: '#000', fontWeight: "600" }}>
                            {tittle}
                        </Typography>
                    )}
                </Box>
                {description.length > 0 && (
                    <Box sx={{ backgroundColor: bgColor1, borderRadius: 2, p: 2, }}>
                        <List>
                            {description.map((item, index) => (
                                <ListItem key={index} disablePadding>
                                    <ListItemText primary={`• ${item}`} sx={{ mb: 1 }} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ManagementPage;