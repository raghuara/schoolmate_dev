import { Box, Grid, IconButton, Typography, Avatar, Chip, Divider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CakeIcon from '@mui/icons-material/Cake';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import ProfileImage from '../../Images/PagesImage/dummy-image.jpg';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import { DashboardBirthday } from '../../Api/Api';
import Loader from '../Loader';
import { useSelector } from 'react-redux';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';

const EmptyState = ({ label }) => (
    <Box sx={{ textAlign: 'center', py: 4, color: '#bbb' }}>
        <CakeIcon sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
        <Typography sx={{ fontSize: '13px', fontStyle: 'italic' }}>
            No {label} birthdays today
        </Typography>
    </Box>
);

export default function BirthdayPage() {
    const today = dayjs();
    const [selectedDate, setSelectedDate] = useState(today);
    const [formattedDate, setFormattedDate] = useState(today.format('DD-MM-YYYY'));
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber;
    const userType = user.userType;
    const token = '123';

    const [birthdayDetails, setBirthdayDetails] = useState([]);
    const [studentsBirthday, setStudentsBirthday] = useState([]);

    useEffect(() => {
        fetchBirthdayData();
    }, [formattedDate]);

    const fetchBirthdayData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(DashboardBirthday, {
                params: { RollNumber: rollNumber, UserType: userType, Date: formattedDate },
                headers: { Authorization: `Bearer ${token}` },
            });
            const AllData = res.data.staffsbirthday;
            setBirthdayDetails(AllData.teaching);
            setStudentsBirthday(res.data.studentsbirthday);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateChange = (newValue) => {
        setSelectedDate(newValue);
        setFormattedDate(dayjs(newValue).format('DD-MM-YYYY'));
        setOpen(false);
    };

    const shiftDay = (offset) => {
        const newDate = selectedDate.add(offset, 'day');
        setSelectedDate(newDate);
        setFormattedDate(newDate.format('DD-MM-YYYY'));
    };

    const isToday = selectedDate.isSame(today, 'day');

    return (
        <Box sx={{ bgcolor: '#fff', mt: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            {isLoading && <Loader />}

            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, borderBottom: '1px solid #f0f0f0', bgcolor: websiteSettings.backgroundColor }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: `${websiteSettings.mainColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CakeIcon sx={{ fontSize: 18, color: websiteSettings.mainColor }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>
                            Birthday Details
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#999' }}>
                            {isToday ? 'Today' : ''} · {selectedDate.format('DD MMMM YYYY')}
                        </Typography>
                    </Box>
                </Box>

                {/* Date navigation */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => shiftDay(-1)}
                        sx={{ width: 28, height: 28, bgcolor: '#f5f5f5', '&:hover': { bgcolor: '#ebebeb' } }}>
                        <ChevronLeftIcon sx={{ fontSize: 18 }} />
                    </IconButton>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            open={open}
                            onClose={() => setOpen(false)}
                            value={selectedDate}
                            onChange={handleDateChange}
                            views={['year', 'month', 'day']}
                            sx={{ opacity: 0, pointerEvents: 'none', width: 0, position: 'absolute' }}
                        />
                    </LocalizationProvider>

                    <IconButton size="small" onClick={() => setOpen(true)}
                        sx={{ width: 28, height: 28, bgcolor: '#f5f5f5', '&:hover': { bgcolor: '#ebebeb' } }}>
                        <CalendarMonthIcon sx={{ fontSize: 16, color: '#555' }} />
                    </IconButton>

                    <IconButton size="small" onClick={() => shiftDay(1)}
                        sx={{ width: 28, height: 28, bgcolor: '#f5f5f5', '&:hover': { bgcolor: '#ebebeb' } }}>
                        <ChevronRightIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    {/* Staff Birthdays */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ border: '1px solid #f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.2, bgcolor: '#f8f8f8', borderBottom: '1px solid #f0f0f0' }}>
                                <PeopleIcon sx={{ fontSize: 16, color: '#1976D2' }} />
                                <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#333' }}>
                                    Staff Birthdays
                                </Typography>
                                <Chip
                                    label={birthdayDetails?.length || 0}
                                    size="small"
                                    sx={{ ml: 'auto', bgcolor: '#E3F2FD', color: '#1976D2', fontWeight: 700, fontSize: '11px', height: '20px' }}
                                />
                            </Box>

                            <Box sx={{ maxHeight: '220px', overflowY: 'auto', p: 1 }}>
                                {birthdayDetails && birthdayDetails.length > 0 ? (
                                    birthdayDetails.map((person, index) => (
                                        <Box key={index}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, px: 1, borderRadius: '8px', '&:hover': { bgcolor: '#fafafa' }, transition: '0.15s' }}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <Avatar
                                                        src={person.filepath || ProfileImage}
                                                        onError={(e) => { e.target.src = ProfileImage; }}
                                                        sx={{ width: 38, height: 38, border: '2px solid #E3F2FD' }}
                                                    />
                                                    <Box sx={{
                                                        position: 'absolute', bottom: -2, right: -2,
                                                        width: 16, height: 16, borderRadius: '50%',
                                                        bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                                    }}>
                                                        <CakeIcon sx={{ fontSize: 10, color: '#E91E8C' }} />
                                                    </Box>
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {person.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#888' }}>
                                                        {person.userType
                                                            ? person.userType.charAt(0).toUpperCase() + person.userType.slice(1)
                                                            : ''
                                                        } · {person.rollNumber}
                                                    </Typography>
                                                </Box>
                                                <CakeIcon sx={{ fontSize: 16, color: '#FFD54F', flexShrink: 0 }} />
                                            </Box>
                                            {index < birthdayDetails.length - 1 && (
                                                <Divider sx={{ mx: 1, borderColor: '#f5f5f5' }} />
                                            )}
                                        </Box>
                                    ))
                                ) : (
                                    <EmptyState label="staff" />
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    {/* Student Birthdays */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ border: '1px solid #f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.2, bgcolor: '#f8f8f8', borderBottom: '1px solid #f0f0f0' }}>
                                <SchoolIcon sx={{ fontSize: 16, color: '#388E3C' }} />
                                <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#333' }}>
                                    Student Birthdays
                                </Typography>
                                <Chip
                                    label={studentsBirthday?.length || 0}
                                    size="small"
                                    sx={{ ml: 'auto', bgcolor: '#E8F5E9', color: '#388E3C', fontWeight: 700, fontSize: '11px', height: '20px' }}
                                />
                            </Box>

                            <Box sx={{ maxHeight: '220px', overflowY: 'auto', p: 1 }}>
                                {studentsBirthday && studentsBirthday.length > 0 ? (
                                    studentsBirthday.map((person, index) => (
                                        <Box key={index}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, px: 1, borderRadius: '8px', '&:hover': { bgcolor: '#fafafa' }, transition: '0.15s' }}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <Avatar
                                                        src={person.filepath || ProfileImage}
                                                        onError={(e) => { e.target.src = ProfileImage; }}
                                                        sx={{ width: 38, height: 38, border: '2px solid #E8F5E9' }}
                                                    />
                                                    <Box sx={{
                                                        position: 'absolute', bottom: -2, right: -2,
                                                        width: 16, height: 16, borderRadius: '50%',
                                                        bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                                    }}>
                                                        <CakeIcon sx={{ fontSize: 10, color: '#E91E8C' }} />
                                                    </Box>
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {person.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#888' }}>
                                                        {person.rollNumber} · {person.grade} – {person.section}
                                                    </Typography>
                                                </Box>
                                                <CakeIcon sx={{ fontSize: 16, color: '#FFD54F', flexShrink: 0 }} />
                                            </Box>
                                            {index < studentsBirthday.length - 1 && (
                                                <Divider sx={{ mx: 1, borderColor: '#f5f5f5' }} />
                                            )}
                                        </Box>
                                    ))
                                ) : (
                                    <EmptyState label="student" />
                                )}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
