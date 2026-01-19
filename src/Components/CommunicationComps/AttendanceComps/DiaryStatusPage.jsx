import { Autocomplete, Box, Button, Checkbox, createTheme, Dialog, DialogActions, DialogContent, FormControlLabel, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextareaAutosize, TextField, ThemeProvider, Typography } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React, { useEffect, useState } from 'react'
import { selectGrades } from '../../../Redux/Slices/DropdownController';
import { useSelector } from 'react-redux';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dayjs from 'dayjs';
import { dairyStatusReport, fetchDairyStatus, fetchHomeworkStatus, homeworkStatusReport, postDairyStatus, postHomeworkStatus, updateDairyStatus, updateHomeworkStatus } from '../../../Api/Api';
import axios from 'axios';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Loader from '../../Loader';
import SnackBar from '../../SnackBar';
import * as XLSX from 'xlsx';

export default function DiaryStatusPage() {
    const token = "123"
    const today = dayjs().format('DD-MM-YYYY');
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedGradeSign, setSelectedGradeSign] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [onlyFromDate, setOnlyFromDate] = useState(false);
    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [openPopup, setOpenPopup] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [comments, setComments] = useState({});
    const [statuses, setStatuses] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [formattedDate, setFormattedDate] = useState(today);
    const [homeworkDoneSaved, setHomeworkDoneSaved] = useState("");
    const [homeworkStatusData, setHomeworkStatusData] = useState([]);
    const [openCal, setOpenCal] = useState(false);
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [exportData, setExportData] = useState([]);

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#90caf9',
            },
            background: {
                paper: '#121212',
            },
            text: {
                primary: '#ffffff',
            },
        },
    });

    useEffect(() => {
        if (grades && grades.length > 0) {
            setSelectedGradeId(grades[0].id);
            setSelectedSection(grades[0].sections[0]);
        }
    }, [grades]);

    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue.id);
            setSelectedGradeSign(newValue.sign);
            setSelectedSection(newValue.sections[0]);
        } else {
            setSelectedGradeId(null);
            setSelectedGradeSign(null);
            setSelectedSection(null);
        }
    };

    const handleSectionChange = (event, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
    };

    const handleFilterChange = (e, newValue) => {
        setSelectedFilter(newValue);
    };

    const handleClear = () => {
        fetchData()
    };

    const handleExport = () => {
        setOpenPopup(true);
    };


    const handleClose1 = () => {
        setOpenPopup(false);
    };

    const handleAdd = (rollNumber) => {
        setOpenAlert(rollNumber);
    };

    const handleSaveComment = () => {
        setOpenAlert(false);
    };

    const isExportEnabled =
    fromDate &&
    (!onlyFromDate ? toDate : true) &&
    selectedGradeId &&
    selectedSection;

    const visibleData = selectedFilter
        ? homeworkStatusData.filter((row) => {
            const status = statuses[row.rollNumber];
            return selectedFilter === "Signed" ? status === 1 : status === 0;
        })
        : homeworkStatusData;

    useEffect(() => {
        if (selectedGradeId && selectedSection && formattedDate) {
            fetchData();
        }
    }, [selectedGradeId, selectedSection, formattedDate]);

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const res = await axios.get(fetchDairyStatus, {
                params: {
                    Class: selectedGradeId || grades?.[0]?.id || "",
                    Section: selectedSection || grades?.[0]?.sections?.[0] || "",
                    Date: formattedDate,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setHomeworkDoneSaved(res.data.dairySaved);
            setHomeworkStatusData(res.data.dairyStatusDetails)

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false)
        };
    }

    useEffect(() => {
        if (homeworkStatusData?.length) {
            const mappedStatuses = {};
            const mappedComments = {};

            homeworkStatusData.forEach((item) => {
                mappedStatuses[item.rollNumber] = item.status === "0" ? 0 : 1;
                mappedComments[item.rollNumber] = item.remark || "";
            });

            setStatuses(mappedStatuses);
            setComments(mappedComments);
        }
    }, [homeworkStatusData]);

    const handleExportExcel = () => {
        const header = [
            'S.No', 'Date', 'Roll Number', 'Student Name', 'Class', 'Section',
            'Status',
        ];

        const data = exportData.map((row, index) => [
            index + 1,
            row.date,
            row.rollNumber,
            row.name,
            row.grade,
            row.section,
            row.status === "1" ? "Signed" : "Not Signed",
        ]);

        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

        const formattedFromDate = fromDate ? dayjs(fromDate).format("DD-MM-YYYY") : "";
        const formattedToDate = !onlyFromDate && toDate ? dayjs(toDate).format("DD-MM-YYYY") : "";

        const fileName = formattedToDate
            ? `Homework Status ${formattedFromDate} - ${formattedToDate}.xlsx`
            : `Homework Status ${formattedFromDate}.xlsx`;

        XLSX.writeFile(wb, fileName);
    };


    useEffect(() => {
        fetchExportData()
    }, [fromDate, toDate, selectedGradeId, selectedSection]);

    const fetchExportData = async () => {
        setIsLoading(true)
        try {
            const res = await axios.get(dairyStatusReport, {
                params: {
                    FromDate: fromDate ? dayjs(fromDate).format("DD-MM-YYYY") : "",
                    ToDate: onlyFromDate
                        ? fromDate
                            ? dayjs(fromDate).format("DD-MM-YYYY")
                            : ""
                        : toDate
                            ? dayjs(toDate).format("DD-MM-YYYY")
                            : "",
                    Class: selectedGradeId || grades?.[0]?.id || "",
                    Section: selectedSection || grades?.[0]?.sections?.[0] || "",
                },

                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setExportData(res.data.reportDetails);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false)
        };
    }

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post(
                postDairyStatus,
                {
                    grade: String(selectedGradeId || grades?.[0]?.id || ""),
                    section: selectedSection || grades?.[0]?.sections?.[0] || "",
                    date: formattedDate,
                    details: visibleData.map((row) => ({
                        rollNumber: row.rollNumber,
                        status: statuses[row.rollNumber]?.toString() ?? "1",
                        remarks: comments[row.rollNumber] || "",
                    })),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Status Added Successfully");
            fetchData()
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to add Status. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const res = await axios.put(
                updateDairyStatus,
                {
                    grade: String(selectedGradeId || grades?.[0]?.id || ""),
                    section: selectedSection || grades?.[0]?.sections?.[0] || "",
                    date: formattedDate,
                    details: visibleData.map((row) => ({
                        rollNumber: row.rollNumber,
                        status: statuses[row.rollNumber]?.toString() ?? "1",
                        remarks: comments[row.rollNumber] || "",
                    })),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Status Updated Successfully");
            fetchData()
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to add Status. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Box>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box sx={{ display: "flex", marginTop: "-15px", mb: 1.5, pl: 1 }}>
                <ThemeProvider theme={darkTheme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            open={openCal}
                            onClose={handleClose}
                            value={selectedDate}
                            onChange={(newValue) => {
                                setSelectedDate(newValue);
                                const newFormattedDate = dayjs(newValue).format('DD-MM-YYYY');
                                setFormattedDate(newFormattedDate);
                                handleClose();
                            }}
                            views={['year', 'month', 'day']}
                            renderInput={() => null}
                            sx={{
                                opacity: 0,
                                pointerEvents: 'none',
                                width: "10px",
                                height: "10px",
                                marginTop: "-30px",
                            }}
                        />
                    </LocalizationProvider>
                </ThemeProvider>
                <Box onClick={handleOpen} sx={{ display: "flex", cursor: "pointer" }}>
                    <CalendarMonthIcon style={{ marginTop: "0px", fontSize: "20px", marginRight: "5px", textDecoration: "underline" }} />
                    <Typography style={{ fontSize: "12px", color: "#777", borderBottom: "1px solid #000" }}>
                        {dayjs(selectedDate).format('DD MMMM YYYY')}
                    </Typography>
                </Box>
            </Box>
            <Grid container spacing={2} px={2}>
                <Grid
                    size={{
                        lg: 2
                    }}>
                    <Autocomplete
                        disablePortal
                        options={grades}
                        getOptionLabel={(option) => option.sign}
                        value={grades.find((item) => item.id === selectedGradeId) || null}
                        onChange={(event, newValue) => {
                            handleGradeChange(newValue);
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        sx={{ width: "100%" }}
                        PaperComponent={(props) => (
                            <Paper
                                {...props}
                                style={{
                                    ...props.style,
                                    maxHeight: "180px",
                                    backgroundColor: "#000",
                                    color: "#fff",
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li style={{ fontSize: "14px" }} {...props} className="classdropdownOptions">
                                {option.sign}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                placeholder="Select Class"
                                {...params}
                                fullWidth
                                InputProps={{
                                    ...params.InputProps,
                                    sx: {
                                        paddingRight: 0,
                                        height: "33px",
                                        fontSize: "14px",
                                    },
                                }}
                            />
                        )}
                    />
                </Grid>
                <Grid
                    size={{
                        lg: 2
                    }}>
                    <Autocomplete
                        disablePortal
                        options={sections}
                        getOptionLabel={(option) => option.sectionName}
                        value={
                            sections.find((option) => option.sectionName === selectedSection) ||
                            null
                        }
                        onChange={handleSectionChange}
                        isOptionEqualToValue={(option, value) =>
                            option.sectionName === value.sectionName
                        }
                        sx={{ width: "100%" }}
                        PaperComponent={(props) => (
                            <Paper
                                {...props}
                                style={{
                                    ...props.style,
                                    maxHeight: "150px",
                                    backgroundColor: "#000",
                                    color: "#fff",
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li style={{ fontSize: "14px" }} {...props} className="classdropdownOptions">
                                {option.sectionName}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                placeholder="Select Section"
                                {...params}
                                fullWidth
                                InputProps={{
                                    ...params.InputProps,
                                    sx: {
                                        paddingRight: 0,
                                        height: "33px",
                                        fontSize: "14px",
                                    },
                                }}
                            />
                        )}
                    />
                </Grid>

                <Grid
                    size={{
                        lg: 2
                    }}>
                    <Autocomplete
                        disablePortal
                        options={["Signed", "Not Signed"]}
                        value={selectedFilter}
                        onChange={handleFilterChange}
                        sx={{ width: "100%" }}
                        PaperComponent={(props) => (
                            <Paper
                                {...props}
                                style={{
                                    ...props.style,
                                    height: '80px',
                                    backgroundColor: '#000',
                                    color: '#fff',
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li style={{ fontSize: "14px" }} {...props} className="classdropdownOptions">
                                {option}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: params.InputProps.endAdornment,
                                    sx: {
                                        paddingRight: 0,
                                        height: "33px",
                                        fontSize: "14px",
                                    },
                                }}
                            />
                        )}
                    />
                </Grid>
            </Grid>
            <Box sx={{ marginTop: "-10px", px: 2 }}>
                <Box sx={{ display: "flex" }}>
                    <Grid container sx={{ justifyContent: "space-between" }}>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 5,
                                lg: 3
                            }}>
                            <Box sx={{ display: "flex", mt: 2.8, width: "100%", }}>
                                <Typography sx={{ fontSize: "12px", color: "#fff", backgroundColor: "#307EB9", padding: "0px 5px 0px 5px", borderRadius: "4px 0px 0px 0px", fontWeight: "600", }}>
                                    {selectedGradeSign || grades?.[0]?.sign || ""} - {selectedSection || grades?.[0]?.sections?.[0] || ""}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid
                            sx={{ display: "flex", justifyContent: "end" }}
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 5,
                                lg: 9
                            }}>
                            <Button
                                variant="outlined"
                                onClick={handleExport}
                                sx={{
                                    border: "none",
                                    backgroundColor: "#fff",
                                    width: "100px",
                                    height: "26px",
                                    color: websiteSettings.textColor,
                                    textTransform: "none",
                                    backgroundColor: websiteSettings.mainColor
                                }}>

                                <ExitToAppIcon sx={{ fontSize: "20px" }} />
                                &nbsp;Export
                            </Button>
                            <Dialog
                                open={openPopup}
                                onClose={handleClose1}
                                maxWidth={false}
                                PaperProps={{
                                    sx: {
                                        width: '50%',
                                        borderRadius: 2,
                                    },
                                }}
                            >
                                <Box sx={{ p: 2 }}>
                                    <Typography sx={{ pb: 2, fontWeight: "600", fontSize: "18px" }}>Export Diary Signature Status</Typography>

                                    <Grid container spacing={2} px={2}>
                                        <Grid
                                            size={{
                                                lg: 4
                                            }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="From Date"
                                                    value={fromDate}
                                                    onChange={(newValue) => {
                                                        if (!onlyFromDate && toDate && (newValue.isSame(toDate) || newValue.isAfter(toDate))) {
                                                            setFromDate(null);
                                                            alert("From Date must be less than To Date");
                                                        } else {
                                                            setFromDate(newValue);
                                                        }
                                                    }}
                                                    disableFuture={!onlyFromDate}
                                                    maxDate={
                                                        onlyFromDate
                                                            ? dayjs()
                                                            : toDate
                                                                ? toDate.subtract(1, 'day')
                                                                : dayjs().subtract(1, 'day')
                                                    }
                                                    sx={{ width: "100%" }}
                                                    renderInput={(params) => (
                                                        <TextField {...params} fullWidth size="small" />
                                                    )}
                                                />
                                            </LocalizationProvider>

                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={onlyFromDate}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setOnlyFromDate(checked);
                                                            if (checked) {
                                                                setToDate(null);
                                                            }
                                                        }}
                                                        size="small"
                                                    />
                                                }
                                                label={<span style={{ fontSize: "13px" }}>Only From Date</span>}
                                                sx={{
                                                    '& .MuiFormControlLabel-label': {
                                                        fontSize: '13px',
                                                        color: "#777"
                                                    },
                                                }}
                                            />
                                        </Grid>

                                        {!onlyFromDate && (
                                            <Grid size={4}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        label="To Date"
                                                        value={toDate}
                                                        onChange={(newValue) => {
                                                            if (fromDate && (newValue.isSame(fromDate) || newValue.isBefore(fromDate))) {
                                                                setToDate(null);
                                                                alert("To Date must be greater than From Date");
                                                            } else {
                                                                setToDate(newValue);
                                                            }
                                                        }}
                                                        disableFuture={false}
                                                        minDate={fromDate ? fromDate.add(1, 'day') : dayjs("2000-01-01")}
                                                        maxDate={dayjs()}
                                                        sx={{ width: "100%" }}
                                                        renderInput={(params) => (
                                                            <TextField {...params} size="small" fullWidth />
                                                        )}
                                                    />
                                                </LocalizationProvider>

                                            </Grid>
                                        )}
                                        <Grid
                                            size={{
                                                lg: 4
                                            }}>
                                            <Autocomplete
                                                disablePortal
                                                options={grades}
                                                getOptionLabel={(option) => option.sign}
                                                value={grades.find((item) => item.id === selectedGradeId) || null}
                                                onChange={(event, newValue) => handleGradeChange(newValue)}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                sx={{ width: "100%" }}
                                                PaperComponent={(props) => (
                                                    <Paper
                                                        {...props}
                                                        style={{
                                                            ...props.style,
                                                            maxHeight: "180px",
                                                            backgroundColor: "#000",
                                                            color: "#fff",
                                                        }}
                                                    />
                                                )}
                                                renderOption={(props, option) => (
                                                    <li style={{ fontSize: "14px" }} {...props} className="classdropdownOptions">
                                                        {option.sign}
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField
                                                        placeholder="Select Class"
                                                        {...params}
                                                        fullWidth
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            sx: {
                                                                paddingRight: 0,
                                                                height: "55px",
                                                                fontSize: "14px",
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        <Grid
                                            size={{
                                                lg: 4
                                            }}>
                                            <Autocomplete
                                                disablePortal
                                                options={sections}
                                                getOptionLabel={(option) => option.sectionName}
                                                value={sections.find((option) => option.sectionName === selectedSection) || null}
                                                onChange={handleSectionChange}
                                                isOptionEqualToValue={(option, value) => option.sectionName === value.sectionName}
                                                sx={{ width: "100%" }}
                                                PaperComponent={(props) => (
                                                    <Paper
                                                        {...props}
                                                        style={{
                                                            ...props.style,
                                                            maxHeight: "150px",
                                                            backgroundColor: "#000",
                                                            color: "#fff",
                                                        }}
                                                    />
                                                )}
                                                renderOption={(props, option) => (
                                                    <li style={{ fontSize: "14px" }} {...props} className="classdropdownOptions">
                                                        {option.sectionName}
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField
                                                        placeholder="Select Section"
                                                        {...params}
                                                        fullWidth
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            sx: {
                                                                paddingRight: 0,
                                                                height: "55px",
                                                                fontSize: "14px",
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>

                                <DialogActions>
                                    <Button sx={{
                                        border: "1px solid #A9A9A9",
                                        backgroundColor: "#fff",
                                        py: 0.3,
                                        width: "100px",
                                        color: "#000",
                                        textTransform: "none",
                                        borderRadius: "30px",

                                    }}
                                        onClick={handleClose1}>
                                        Cancel
                                    </Button>
                                    <Button
                                    disabled={!isExportEnabled}
                                        sx={{
                                            border: "none",
                                            backgroundColor: "#fff",
                                            py: 0.3,
                                            width: "100px",
                                            color: websiteSettings.textColor,
                                            textTransform: "none",
                                            borderRadius: "30px",
                                            backgroundColor: websiteSettings.mainColor

                                        }}
                                        onClick={handleExportExcel}
                                        autoFocus
                                    >
                                        Export
                                    </Button>
                                </DialogActions>
                            </Dialog>

                        </Grid>

                    </Grid>
                </Box>
                <TableContainer
                    sx={{
                        border: "1px solid #E8DDEA",
                        maxHeight: "64vh",
                        overflowY: "auto",

                    }}
                >
                    <Table stickyHeader aria-label="attendance table" sx={{ minWidth: '100%' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                    S.No
                                </TableCell>
                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                    Roll Number
                                </TableCell>
                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                    Student Name
                                </TableCell>
                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                    Class
                                </TableCell>
                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                    Section
                                </TableCell>
                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visibleData.map((row, index) => (
                                <TableRow key={row.id}>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                        {index + 1}
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                        {row.rollNumber}
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", color: row.name ? "inherit" : "red", }}>
                                        {row.name || "Name not provided"}
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                        {row.grade}
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                        {row.section}
                                    </TableCell>

                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", width: "200px" }}>
                                        <Autocomplete
                                            disablePortal
                                            options={["Signed", "Not Signed"]}
                                            value={
                                                statuses[row.rollNumber] === 0
                                                    ? "Not Signed"
                                                    : "Signed"
                                            }
                                            onChange={(e, newValue) => {
                                                const mappedValue = newValue === "Signed" ? 1 : 0;
                                                setStatuses((prev) => ({
                                                    ...prev,
                                                    [row.rollNumber]: mappedValue,
                                                }));
                                            }}
                                            sx={{ width: "100%" }}
                                            PaperComponent={(props) => (
                                                <Paper
                                                    {...props}
                                                    style={{
                                                        ...props.style,
                                                        height: '80px',
                                                        backgroundColor: '#000',
                                                        color: '#fff',
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li style={{ fontSize: "14px" }} {...props} className="classdropdownOptions">
                                                    {option}
                                                </li>
                                            )}
                                            renderInput={(params) => {
                                                const status = statuses[row.rollNumber];
                                                return (
                                                    <TextField
                                                        {...params}
                                                        fullWidth
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            endAdornment: params.InputProps.endAdornment,
                                                            sx: {
                                                                paddingRight: 0,
                                                                height: "33px",
                                                                fontSize: "14px",
                                                                color: status === 0 ? "red" : "green",
                                                            },
                                                        }}
                                                    />
                                                );
                                            }}
                                        />

                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Box sx={{ height: '50px' }}></Box>
                </TableContainer>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", }}>
                <Box sx={{ position: "absolute", bottom: "10px" }}>
                    <Button
                        variant="outlined"
                        onClick={handleClear}
                        sx={{
                            borderColor: "#A9A9A9",
                            backgroundColor: "#fff",
                            py: 0.3,
                            width: "100px",
                            color: "#000",
                            textTransform: "none",
                            borderRadius: "30px",
                            mr: 2

                        }}>
                        Clear
                    </Button>

                    {homeworkDoneSaved === "N" && (
                        <Button
                            variant="outlined"
                            onClick={handleSave}
                            sx={{
                                border: "none",
                                backgroundColor: websiteSettings.mainColor,
                                py: 0.3,
                                width: "100px",
                                color: websiteSettings.textColor,
                                textTransform: "none",
                                borderRadius: "30px",
                                mr: 2,
                            }}
                        >
                            Save
                        </Button>
                    )}

                    {homeworkDoneSaved === "Y" && (
                        <Button
                            variant="outlined"
                            onClick={handleUpdate}
                            sx={{
                                border: "none",
                                backgroundColor: websiteSettings.mainColor,
                                py: 0.3,
                                width: "100px",
                                color: websiteSettings.textColor,
                                textTransform: "none",
                                borderRadius: "30px",
                                mr: 2,
                            }}
                        >
                            Update
                        </Button>
                    )}

                    {/* <Button
                        variant="outlined"
                        onClick={handleExport}
                        sx={{
                            border: "none",
                            backgroundColor: "#fff",
                            py: 0.3,
                            width: "100px",
                            color: websiteSettings.textColor,
                            textTransform: "none",
                            borderRadius: "30px",
                            backgroundColor: websiteSettings.mainColor

                        }}>
                        Notify
                    </Button> */}
                </Box>
            </Box>
        </Box>
    );
}
