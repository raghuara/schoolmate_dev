import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { Button, Card, CardContent, Grid, IconButton, InputAdornment, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ClearIcon from '@mui/icons-material/Clear';
import dayjs from 'dayjs';

const dummyData1 = [
    { feeName: "Admission Fee", amount: 5000 },
    { feeName: "Notebook & Supplies Fee", amount: 15000 },
    { feeName: "Term Fee 1", amount: 5000 },
    { feeName: "Term Fee 2", amount: 5000 },
    { feeName: "Term Fee 3", amount: 5000 },
    { feeName: "Late Fee", amount: 100 },
];

export default function SpecialConcession() {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');


    const [rows, setRows] = useState(
        dummyData1.map((item) => ({
            ...item,
            concessionPercent: "",
            concessionAmount: "",
            finalFee: item.amount,
        }))
    );

    const handleChange = (index, field, value) => {
        const updatedRows = [...rows];
        let row = { ...updatedRows[index] };
        const amount = parseFloat(row.amount);

        if (field === "percent") {
            const percent = parseFloat(value) || 0;
            const concessionAmount = (amount * percent) / 100;
            row.concessionPercent = value;
            row.concessionAmount = concessionAmount.toFixed(2);
            row.finalFee = (amount - concessionAmount).toFixed(2);
        } else if (field === "amount") {
            const concessionAmount = parseFloat(value) || 0;
            const percent = ((concessionAmount / amount) * 100).toFixed(2);
            row.concessionAmount = value;
            row.concessionPercent = percent;
            row.finalFee = (amount - concessionAmount).toFixed(2);
        }

        updatedRows[index] = row;
        setRows(updatedRows);
    };

    const totalAmount = rows.reduce((sum, r) => sum + parseFloat(r.finalFee || r.amount), 0);

    return (
        <Box>
            <Box sx={{ width: "100%", }}>
                <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
                {isLoading && <Loader />}
                <Box sx={{ position: "fixed", backgroundColor: "#f2f2f2", px: 2, py: 1.5, borderBottom: "1px solid #ddd", mb: 0.13, zIndex: "1200", width: "100%" }}>
                    <Grid container>
                        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                            <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px', }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                            </IconButton>
                            <Typography sx={{ fontWeight: "600", fontSize: "19px" }} >Apply special concession</Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{
                    px: 2, pb: 2, pt: "68px", minHeight: "72vh",
                }}>
                    <Grid container sx={{ mt: 2 }}>
                        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }} sx={{ display: "flex", justifyContent: { lg: "center" }, }} >
                            <Box>
                                <Typography sx={{ pb: 1, textAlign: "center" }}> Concession category</Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    sx={{ width: "250px" }}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }} sx={{ display: "flex", justifyContent: { lg: "center" } }} >
                            <Box>
                                <Typography sx={{ pb: 1, textAlign: "center" }}> Recommended by </Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    sx={{ width: "250px" }}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }} sx={{ display: "flex", justifyContent: { lg: "center" } }} >
                            <Box>
                                <Typography sx={{ pb: 1, textAlign: "center" }}> Recommendation Reason</Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    multiline
                                    rows={2}
                                    sx={{ width: "250px" }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: websiteSettings.mainColor, py: 1, width: "fit-content", px: 4, borderTopLeftRadius: "5px", borderTopRightRadius: "5px", mt: 2 }}>
                        <Typography sx={{ color: websiteSettings.textColor }}>Concession School Fee Detail</Typography>
                    </Box>
                    <TableContainer
                        sx={{
                            border: "1px solid #E601542A",
                            boxShadow: "none",
                            backgroundColor: "#fff",
                        }}
                    >
                        <Table stickyHeader sx={{ width: "100%" }}>
                            <TableHead>
                                <TableRow>
                                    {[
                                        "S.No",
                                        "Fee Details",
                                        "Fee Amount",
                                        "Concession %",
                                        "Concession Amount",
                                        "Final Fee Amount",
                                    ].map((header, index) => (
                                        <TableCell
                                            key={index}
                                            sx={{
                                                borderRight: 1,
                                                borderColor: "#E601542A",
                                                textAlign: "center",
                                                backgroundColor: "#B05DD03A",
                                                fontWeight: 600,
                                                fontSize: 14,
                                                color: "#000",
                                            }}
                                        >
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {rows.map((row, rowIndex) => (
                                    <TableRow
                                        key={rowIndex}
                                        sx={{
                                            cursor: "pointer",
                                            backgroundColor: "transparent",
                                            "&:hover": { backgroundColor: "#fafafa" },
                                            transition: "background-color 0.2s ease",
                                        }}
                                    >
                                        <TableCell
                                            sx={{
                                                borderRight: 1,
                                                borderColor: "#E601542A",
                                                textAlign: "center",
                                            }}
                                        >
                                            <Typography sx={{ fontSize: 14, color: "#333" }}>
                                                {rowIndex + 1}
                                            </Typography>
                                        </TableCell>

                                        <TableCell
                                            sx={{
                                                borderRight: 1,
                                                borderColor: "#E601542A",
                                                textAlign: "center",
                                            }}
                                        >
                                            {row.feeName}
                                        </TableCell>

                                        <TableCell
                                            sx={{
                                                borderRight: 1,
                                                borderColor: "#E601542A",
                                                textAlign: "center",
                                            }}
                                        >
                                            ₹ {row.amount}
                                        </TableCell>

                                        <TableCell
                                            sx={{
                                                borderRight: 1,
                                                borderColor: "#E601542A",
                                                textAlign: "center",
                                            }}
                                        >
                                            <TextField
                                                variant="outlined"
                                                size="small"
                                                value={row.concessionPercent}
                                                onChange={(e) =>
                                                    handleChange(rowIndex, "percent", e.target.value)
                                                }
                                                sx={{ width: "120px" }}
                                                slotProps={{
                                                    input: {
                                                        endAdornment: (
                                                            <Typography sx={{ ml: 0.5, fontSize: 13 }}>%</Typography>
                                                        ),
                                                    }
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell
                                            sx={{
                                                borderRight: 1,
                                                borderColor: "#E601542A",
                                                textAlign: "center",
                                            }}
                                        >
                                            <TextField
                                                variant="outlined"
                                                size="small"
                                                value={row.concessionAmount}
                                                onChange={(e) =>
                                                    handleChange(rowIndex, "amount", e.target.value)
                                                }
                                                sx={{ width: "120px" }}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <Typography sx={{ mr: 0.5, fontSize: 13 }}>₹</Typography>
                                                        ),
                                                    }
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell
                                            sx={{
                                                textAlign: "center",
                                                fontWeight: 500,
                                                color: "#333",
                                            }}
                                        >
                                            ₹ {row.finalFee}
                                        </TableCell>
                                    </TableRow>
                                ))}

                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        sx={{
                                            textAlign: "right",
                                            fontWeight: 600,
                                            borderRight: 1,
                                            borderColor: "#E601542A",
                                        }}
                                    >
                                        <Typography sx={{ color: "green" }}>Total Amount</Typography>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            textAlign: "center",
                                            fontWeight: 600,
                                            color: "green",
                                        }}
                                    >
                                        ₹ {totalAmount.toLocaleString("en-IN")}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", pb: 2 }}>
                    <Button
                        sx={{
                            border: "1px solid #000",
                            borderRadius: "30px",
                            textTransform: "none",
                            width: "100px",
                            height: "30px",
                            color: "#000"
                        }}>
                        Reset All
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: websiteSettings.mainColor,
                            borderRadius: "30px",
                            textTransform: "none",
                            ml: "10px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            border: "1px solid rgba(0,0,0,0.1)",
                            px: 3,
                            height: "30px",
                            color: websiteSettings.textColor
                        }}>
                        Apply Concession
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}
