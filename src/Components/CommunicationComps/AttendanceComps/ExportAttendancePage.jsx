import { Grid } from '@mui/joy';
import { Autocomplete, Box, Button, Checkbox, FormControlLabel, IconButton, Paper, TextField, Typography } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React, { useState } from 'react'
import { selectGrades } from '../../../Redux/Slices/DropdownController';
import { useSelector } from 'react-redux';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dayjs from 'dayjs';

export default function ExportAttendancePage() {
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedGradeSign, setSelectedGradeSign] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState("");
    const [onlyFromDate, setOnlyFromDate] = useState(false);
    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];
    const websiteSettings = useSelector(selectWebsiteSettings);

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

    const handleFilterChange = (event, value) => {
        setSelectedFilter(value || "");
    };

    const handleClear = () => {

    };

    const handleExport = () => {

    };

    return (
        <Box>
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1.5, borderBottom: "1px solid #ddd", mb: 0.13, }}>
                <Grid container>
                    <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }} sx={{ display: "flex", alignItems: "center" }}>
                        <Link style={{ textDecoration: "none" }} to="/dashboardmenu/attendance">
                            <IconButton sx={{ width: "27px", height: "27px", marginTop: '3px' }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                            </IconButton>
                        </Link>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Export Attendance</Typography>
                    </Grid>
                </Grid>
            </Box>
            <Grid container spacing={2} p={2}>
                <Grid
                    size={{
                        lg: 3
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
                    <Grid size={3}>
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
                                disableFuture
                                minDate={fromDate ? fromDate.add(1, 'day') : dayjs("2000-01-01")}
                                maxDate={dayjs().subtract(1, 'day')}
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
                        lg: 3
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
                        lg: 3
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
                        lg: 3
                    }}>
                    <Autocomplete
                        disablePortal
                        options={["Present", 'Absent', 'Leave', 'Late']}
                        value={selectedFilter}
                        onChange={handleFilterChange}
                        sx={{ width: "100%" }}
                        PaperComponent={(props) => (
                            <Paper
                                {...props}
                                style={{
                                    ...props.style,
                                    height: '150px',
                                    backgroundColor: '#000',
                                    color: '#fff',
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li style={{ fontSize: "14px" }}
                                {...props}
                                className="classdropdownOptions"
                            >
                                {option}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                label="Select Status"
                                {...params}

                                fullWidth
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: params.InputProps.endAdornment,
                                    sx: {
                                        paddingRight: 0,
                                        height: '55px',
                                        fontSize: "14px",
                                    },
                                }}
                            />
                        )}
                    />
                </Grid>
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "center", }}>
                <Box sx={{ position: "absolute", bottom: "30px" }}>
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
                    <Button
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
                        <ExitToAppIcon sx={{ fontSize: "20px" }} />
                        &nbsp;Export
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
