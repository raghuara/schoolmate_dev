import React, { useEffect, useState } from 'react';
import {
    Table, TableHead, TableRow, TableCell,
    TableBody, Paper, TableContainer
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { DashboardStudentsAttendance } from '../../Api/Api';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';

const AttendanceTablePage = () => {
    const [summary, setSummary] = useState([]);
    const [selectedDate] = useState(dayjs());
    const formattedDate = selectedDate.format('DD-MM-YYYY');

    const rollNumber = localStorage.getItem("rollNumber");
    const userType = localStorage.getItem("userType");
    const token = '123';
    const websiteSettings = useSelector(selectWebsiteSettings);

    useEffect(() => {
        fetchAttendanceData();
    }, [formattedDate]);

    const fetchAttendanceData = async () => {
        try {
            const res = await axios.get(DashboardStudentsAttendance, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Date: formattedDate,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = res.data.studentsAttendance;

            const allClasses = {
                "Pre-KG": data?.pre_kg_attendance,
                "LKG": data?.lkg_attendance,
                "UKG": data?.ukg_attendance,
                "Grade 1": data?.grade1Attendance,
                "Grade 2": data?.grade2Attendance,
                "Grade 3": data?.grade3Attendance,
                "Grade 4": data?.grade4Attendance,
                "Grade 5": data?.grade5Attendance,
                "Grade 6": data?.grade6Attendance,
                "Grade 7": data?.grade7Attendance,
                "Grade 8": data?.grade8Attendance,
                "Grade 9": data?.grade9Attendance,
                "Grade 10": data?.grade10Attendance,
            };

            const summaryArray = [];

            Object.entries(allClasses).forEach(([className, attendanceList]) => {
                if (Array.isArray(attendanceList) && attendanceList.length > 0) {
                    let present = 0, absent = 0, leave = 0, late = 0, total = 0;

                    attendanceList.forEach(section => {
                        const sTotal = parseInt(section.total || 0);
                        const sPresent = parseInt(section.present || 0);
                        const sAbsent = parseInt(section.absent || 0);
                        const sLeave = parseInt(section.leave || 0);
                        const sLate = parseInt(section.late || 0);

                        present += sPresent;
                        absent += sAbsent;
                        leave += sLeave;
                        late += sLate;
                        total += sTotal;
                    });

                    summaryArray.push({ className, present, absent, leave, late, total });
                }
            });

            setSummary(summaryArray);
        } catch (error) {
            console.error("Error fetching attendance summary:", error);
        }
    };

    return (
        <Paper
            elevation={1}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #e0e0e0',
                backgroundColor: '#ffffff'
            }}
        >
            <TableContainer sx={{ height: 407 }}>
                <Table stickyHeader aria-label="attendance summary table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                            {["Class", "Present", "Absent", "Leave", "Late", "Total"].map((head, idx) => (
                                <TableCell
                                    key={idx}
                                    align={idx === 0 ? 'left' : 'right'}
                                    sx={{
                                        fontWeight: 'bold',
                                        borderRight: '1px solid #ddd',
                                        backgroundColor: "#FAF6FC",
                                        color: '#333'
                                    }}
                                >
                                    {head}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {summary.length > 0 ? (
                            summary.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : "#FAF6FC",
                                        '&:last-child td': { borderBottom: 0 }
                                    }}
                                >
                                    <TableCell sx={{ borderRight: '1px solid #eee' }}>{row.className}</TableCell>
                                    <TableCell align="right" sx={{ borderRight: '1px solid #eee' }}>{row.present}</TableCell>
                                    <TableCell align="right" sx={{ borderRight: '1px solid #eee' }}>{row.absent}</TableCell>
                                    <TableCell align="right" sx={{ borderRight: '1px solid #eee' }}>{row.leave}</TableCell>
                                    <TableCell align="right" sx={{ borderRight: '1px solid #eee' }}>{row.late}</TableCell>
                                    <TableCell align="right">{row.total}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    No data available
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default AttendanceTablePage;
