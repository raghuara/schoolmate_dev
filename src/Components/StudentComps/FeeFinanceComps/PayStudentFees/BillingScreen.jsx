import { Box } from '@mui/system'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Avatar, Button, Card, CardContent, Checkbox, Chip, CircularProgress, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, Grid, IconButton, InputAdornment, LinearProgress, Paper, Radio, Step, StepLabel, Stepper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, ThemeProvider, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import avatarImage from '../../../../Images/PagesImage/avatar.png'
import ClearIcon from '@mui/icons-material/Clear';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import html2pdf from 'html2pdf.js';
import { useReactToPrint } from 'react-to-print';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GooglePayLogo from "../../../../Images/logo/google-pay-icon.webp"
import PhonePayLogo from "../../../../Images/logo/phone-pay.png"
import PaytmPayLogo from "../../../../Images/logo/paytm.png"
import VisaLogo from "../../../../Images/logo/visa.png"
import MasterCardLogo from "../../../../Images/logo/Mastercard_logo.webp"
import RupayLogo from "../../../../Images/logo/rupay.png"
import CashLogo from "../../../../Images/logo/cash.png"
import SbiLogo from "../../../../Images/logo/sbi.png"
import HdfcLogo from "../../../../Images/logo/Hdfc.png"
import IciciLogo from "../../../../Images/logo/icici.jpg"
import CheckLogo from "../../../../Images/logo/check.webp"
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import axios from 'axios';
import { findStudents, findStudentSchoolFeesBilling } from '../../../../Api/Api';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentsIcon from '@mui/icons-material/Payments';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PrintIcon from '@mui/icons-material/Print';
import HistoryIcon from '@mui/icons-material/History';
import LockIcon from '@mui/icons-material/Lock';
const notesList = [2000, 500, 200, 100, 50, 20, 10];
const MAX_AMOUNT = 99999999;

const studentData = {
  name: "Nisha Preethi S.",
  rollNo: "25002",
  gender: "Female",
  grade: "Prekg",
  section: "C",
  avatar: "NP"
};

const dummyFeeData = [
  { id: 1, feeName: "Admission Fee", amount: 5000, status: "Paid", paidAmount: 5000, pendingAmount: 0, dueDate: "01/11/2025" },
  { id: 2, feeName: "Tuition Fee", amount: 10000, status: "Partially Paid", paidAmount: 6000, pendingAmount: 4000, dueDate: "05/11/2025" },
  { id: 3, feeName: "Library Fee", amount: 1500, status: "Unpaid", paidAmount: 0, pendingAmount: 1500, dueDate: "10/11/2025" },
  { id: 4, feeName: "Transportation Fee", amount: 3000, status: "Paid", paidAmount: 3000, pendingAmount: 0, dueDate: "15/11/2025" },
  { id: 5, feeName: "Laboratory Fee", amount: 2500, status: "Unpaid", paidAmount: 0, pendingAmount: 2500, dueDate: "20/11/2025" },
];


const dummyData1 = [
  {
    feeName: "Admission Fee",
    amount: "5000",
    status: "Paid",
    paidAmount: "5000",
    pendingAmount: "0",
    date: "01/11/2025"
  },
  {
    feeName: "Tuition Fee",
    amount: "10000",
    status: "Partially Paid",
    paidAmount: "6000",
    pendingAmount: "4000",
    date: "05/11/2025"
  },
];

const dummyData2 = [
  {
    billNumber: "MS/25/FRE/002360",
    billDate: "27-11-2025",
    time: "3:00 pm",
    feeName: "Admission Fee",
    paymentMode: "Gpay",
    amount: "5000",
  },
  {
    billNumber: "MS/25/FRE/002360",
    billDate: "27-11-2025",
    time: "3:00 pm",
    feeName: "Admission Fee",
    paymentMode: "Gpay",
    amount: "5000",
  },
];
export default function BillingScreen() {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const grades = useSelector(selectGrades);
  const token = "123"
  const websiteSettings = useSelector(selectWebsiteSettings);

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(false);
  const [color, setColor] = useState(false);
  const [message, setMessage] = useState('');

  const [selectedRows, setSelectedRows] = useState([]);
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [toPayAmounts, setToPayAmounts] = useState({});

  const currentYear = new Date().getFullYear();
  const currentAcademicYear = `${currentYear}-${currentYear + 1}`;
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);

  const [counts, setCounts] = useState(
    notesList.reduce((acc, n) => ({ ...acc, [n]: 0 }), {})
  );

  const printRef = useRef();
  const componentRef = useRef(null);
  const [openPaymentPopup, setOpenPaymentPopup] = useState(false);

  const handleClosePaymentPopup = () => setOpenPaymentPopup(false);
  const [openPaymentAccordion, setOpenPaymentAccordion] = useState("");

  const [openHistoryPopup, setOpenHistoryPopup] = useState(false);

  const today = dayjs().format('DD-MM-YYYY');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [formattedDate, setFormattedDate] = useState(today);

  const [openCal, setOpenCal] = useState(false);
  const handleOpenCal = () => setOpenCal(true);
  const handleCloseCal = () => setOpenCal(false);
  const location = useLocation();
  const { rollNumber } = location.state || {};
  const [details, setDetails] = useState([]);
  const [schoolFee, setSchoolFee] = useState([]);
  const [feeData, setFeeData] = useState(dummyFeeData);

  const [paymentStep, setPaymentStep] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    upiId: '',
    transactionId: '',
    bankName: '',
    chequeNo: '',
    chequeDate: '',
    cardType: '',
    cardLast4: '',
    remarks: '',
    amount: '',
  });

  const feeTabs = [
    "School Fee",
    "Transport Fee",
    "ECA Fee",
    "Additional Fee",
  ];


  const academicYears = [
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
  ];

  const paymentSteps = ['Select Method', 'Enter Details', 'Confirm & Pay'];

  const paymentMethodOptions = [
    { id: 'cash', name: 'Cash Payment', icon: <PaymentsIcon />, description: 'Pay with cash at counter', color: '#10b981' },
    { id: 'upi', name: 'UPI Payment', icon: <AccountBalanceWalletIcon />, description: 'GPay, PhonePe, Paytm', color: '#8b5cf6' },
    { id: 'netbanking', name: 'Net Banking', icon: <AccountBalanceIcon />, description: 'NEFT / RTGS Transfer', color: '#3b82f6' },
    { id: 'cheque', name: 'Cheque Deposit', icon: <ReceiptLongIcon />, description: 'Pay via bank cheque', color: '#f59e0b' },
    { id: 'card', name: 'Card Payment', icon: <CreditCardIcon />, description: 'Credit / Debit Card', color: '#ef4444' },
  ];


  useEffect(() => {
    if (schoolFee && schoolFee.length > 0) {
      const initialAmounts = {};
      schoolFee.forEach((fee, index) => {
        initialAmounts[index] = fee.pendingAmount;
      });
      setToPayAmounts(initialAmounts);
    }
  }, [schoolFee]);

  
  const handleToPayChange = (index, value) => {
    const numValue = parseFloat(value) || 0;
    const pendingAmount = schoolFee[index].pendingAmount;

    // Prevent amount higher than pending amount
    if (numValue > pendingAmount) {
      setMessage(`Amount cannot exceed pending amount of ₹${pendingAmount}`);
      setStatus(false);
      setColor(false);
      setOpen(true);
      return;
    }

    // Prevent negative amounts
    if (numValue < 0) {
      return;
    }

    setToPayAmounts(prev => ({
      ...prev,
      [index]: numValue
    }));
  };

  const handleOpenPaymentPopup = () => {
    // Calculate total based on selected rows and their toPay amounts
    const totalSelected = selectedRows.reduce((sum, idx) => {
      return sum + (toPayAmounts[idx] || 0);
    }, 0);

    if (totalSelected === 0) {
      setMessage('Please enter an amount to pay');
      setStatus(false);
      setColor(false);
      setOpen(true);
      return;
    }

    setPaymentFormData(prev => ({ ...prev, amount: totalSelected.toString() }));
    setOpenPaymentPopup(true);
    setPaymentStep(0);
    setSelectedPaymentMethod('');
    setPaymentProcessing(false);
    setPaymentSuccess(false);
  };

  const handleSelect = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleOpenPopup = (row) => {
    setSelectedFee(row);
    setOpenPreview(true);
  };

  const getSubtotal = (note) => note * counts[note];
  const totalCash = notesList.reduce((sum, note) => sum + getSubtotal(note), 0);

  const canUpdate = (note, newCount) => {
    const newSubtotal = note * newCount;
    const otherSum = totalCash - getSubtotal(note);
    return otherSum + newSubtotal <= MAX_AMOUNT;
  };

  const handleChange = (note, value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return;
    if (!canUpdate(note, num)) return;
    setCounts((prev) => ({ ...prev, [note]: num }));
  };

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPaymentMethod(methodId);
  };

  const handlePaymentNext = () => {
    if (paymentStep < 2) setPaymentStep(paymentStep + 1);
  };

  const handlePaymentBack = () => {
    if (paymentStep > 0) setPaymentStep(paymentStep - 1);
  };

  const handlePaymentConfirm = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      // Update fee data after successful payment based on toPay amounts
      setFeeData(prev => prev.map((fee, idx) => {
        if (selectedRows.includes(idx)) {
          const paymentAmount = toPayAmounts[idx] || 0;
          const newPaidAmount = fee.paidAmount + paymentAmount;
          const newPendingAmount = fee.pendingAmount - paymentAmount;

          // Determine new status
          let newStatus = 'Unpaid';
          if (newPendingAmount === 0) {
            newStatus = 'Paid';
          } else if (newPaidAmount > 0) {
            newStatus = 'Partially Paid';
          }

          return {
            ...fee,
            status: newStatus,
            paidAmount: newPaidAmount,
            pendingAmount: newPendingAmount >= 0 ? newPendingAmount : 0
          };
        }
        return fee;
      }));

      // Reset toPay amounts for paid rows to new pending amounts
      setToPayAmounts(prev => {
        const updated = { ...prev };
        selectedRows.forEach(idx => {
          const fee = feeData[idx];
          const paymentAmount = toPayAmounts[idx] || 0;
          const newPendingAmount = fee.pendingAmount - paymentAmount;
          updated[idx] = newPendingAmount >= 0 ? newPendingAmount : 0;
        });
        return updated;
      });

      setSelectedRows([]);
    }, 2500);
  };

  const handlePaymentFormChange = (field, value) => {
    setPaymentFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTotalPending = () => {
    // Calculate total based on selected rows and their toPay amounts
    return selectedRows.reduce((sum, idx) => sum + (toPayAmounts[idx] || 0), 0);
  };

  const getTotalYearlyFees = () => {
    return feeData.reduce((sum, fee) => sum + fee.amount, 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return '#10b981';
      case 'Partially Paid': return '#f59e0b';
      case 'Unpaid': return '#ef4444';
      default: return '#64748b';
    }
  };


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

  const [value, setValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };


  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "School_Fee_Receipt",
    removeAfterPrint: true,
  });

  const handleDownload = () => {
    const element = componentRef.current;
    if (!element) return alert("Printable element not found!");
    const opt = {
      margin: 0,
      filename: "School_Fee_Receipt.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleClose = () => {
    setOpenPreview(false);
    setSelectedFee(null);
  };


  useEffect(() => {
    fetchStatusDetails()
  }, [selectedYear,]);

  const fetchStatusDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(findStudentSchoolFeesBilling, {
        params: {
          RollNumber: rollNumber,
          Year: selectedYear
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const feeDetail = res.data.data
      setDetails(feeDetail)
      setSchoolFee(feeDetail.feesElements)
    } catch (error) {
      console.error("Error while inserting news data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box sx={{ width: "100%", }}>
      <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
      {isLoading && <Loader />}
      <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1, borderBottom: "1px solid #ddd", mb: 0.13, }}>
        <Grid container>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px', }}>
              <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
            </IconButton>
            <Box>
              <Typography sx={{ fontWeight: "600", fontSize: "19px" }} >Billing Screen</Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: 'end' }}>
            <Box sx={{ display: "flex", alignItems: "center", }}>
              <Link to="/dashboardmenu/fee/special">
                <Button
                  sx={{
                    textTransform: "none",
                    backgroundColor: "#000",
                    color: "#fff",
                    mr: 2,
                    fontSize: '14px',
                    height: "33px"
                  }}
                >Special Concession / Reconcession</Button>
              </Link>
              <Autocomplete
                size="small"
                options={academicYears}
                sx={{ width: "170px" }}
                value={selectedYear}
                onChange={(e, newValue) => setSelectedYear(newValue)}
                renderInput={(params) => (
                  <TextField
                    placeholder="Select Academic Year"
                    {...params}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "5px",
                        fontSize: 14,
                        height: 35,
                      },
                      "& .MuiOutlinedInput-input": {
                        textAlign: "center",
                        fontWeight: "600"
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ height: "83vh", overflowY: "auto", overflowX: "hidden" }}>
        <Box sx={{ display: "flex", pt: 0.5, justifyContent: "end", px: 2 }}>
          <Typography sx={{ fontWeight: "600", color: "#555", fontSize: "14px" }}>Billing on :</Typography>
          <ThemeProvider theme={darkTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                open={openCal}
                onClose={handleCloseCal}
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                  const newFormattedDate = dayjs(newValue).format('DD-MM-YYYY');
                  setFormattedDate(newFormattedDate);
                  handleCloseCal();
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
          <Box onClick={handleOpenCal} sx={{ display: "flex", cursor: "pointer" }}>
            <CalendarMonthIcon style={{ marginTop: "0px", fontSize: "20px", marginRight: "3px", textDecoration: "underline" }} />
            <Typography style={{ fontSize: "12px", color: "#777", borderBottom: "1px solid #000" }}>
              {dayjs(selectedDate).format('DD MMMM YYYY')}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ px: 2 }}>
          <Grid container >
            <Grid
              size={{ xs: 12, md: 4.8, lg: 1.6 }}
              sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              <img
                src={avatarImage}
                alt="student"
                style={{
                  border: "1px solid #0000002A",
                  borderRadius: "5px",
                  width: "110px",
                  height: "100px",
                  objectFit: "cover",
                }}
                onError={(e) => (e.target.src = avatarImage)}
              />
            </Grid>
            <Grid
              size={{ xs: 12, md: 4.8, lg: 10.4 }} >
              <Grid container sx={{ pt: 1.5 }}>
                <Grid
                  size={{ xs: 12, md: 4.8, lg: 2.3 }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px dotted #0000005A",
                    borderTop: "1px dotted #0000005A",
                    px: 2,
                    py: 1,
                    borderRight: "1px dotted #0000005A",
                  }}
                >
                  <Box>
                    <Typography sx={{ color: "#B0B0B0", fontSize: "12px" }}>
                      Student Name
                    </Typography>
                    <Typography
                      sx={{
                        color: "#000",
                        fontSize: "16px",
                        py: 0.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 150,
                        cursor: "default",
                        display: "block",
                      }}
                    >
                      {details.name}
                    </Typography>
                  </Box>
                </Grid>

                <Grid
                  size={{ xs: 12, md: 4.8, lg: 1.9 }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px dotted #0000005A",
                    borderTop: "1px dotted #0000005A",
                    px: 2,
                    py: 1,
                    borderRight: "1px dotted #0000005A",
                  }}
                >
                  <Box>
                    <Typography sx={{ color: "#B0B0B0", fontSize: "12px" }}>
                      Roll No
                    </Typography>
                    <Typography sx={{ color: "#000", fontSize: "16px", py: 1 }}>
                      25002
                    </Typography>
                  </Box>
                </Grid>
                <Grid
                  size={{ xs: 12, md: 4.8, lg: 1.9 }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px dotted #0000005A",
                    borderTop: "1px dotted #0000005A",
                    px: 2,
                    py: 1,
                    borderRight: "1px dotted #0000005A",
                  }}
                >
                  <Box>
                    <Typography sx={{ color: "#B0B0B0", fontSize: "12px" }}>
                      Gender
                    </Typography>
                    <Typography sx={{ color: "#000", fontSize: "16px", py: 1 }}>
                      Male
                    </Typography>
                  </Box>
                </Grid>

                <Grid
                  size={{ xs: 12, md: 4.8, lg: 1.9 }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px dotted #0000005A",
                    borderTop: "1px dotted #0000005A",
                    px: 2,
                    py: 1,
                    borderRight: "1px dotted #0000005A",
                  }}
                >
                  <Box>
                    <Typography sx={{ color: "#B0B0B0", fontSize: "12px" }}>
                      Grade
                    </Typography>
                    <Typography sx={{ color: "#000", fontSize: "16px", py: 1 }}>
                      Prekg
                    </Typography>
                  </Box>
                </Grid>

                <Grid
                  size={{ xs: 12, md: 4.8, lg: 1.9 }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px dotted #0000005A",
                    borderTop: "1px dotted #0000005A",
                    px: 2,
                    py: 1,
                    borderRight: "1px dotted #0000005A",
                  }}
                >
                  <Box>
                    <Typography sx={{ color: "#B0B0B0", fontSize: "12px" }}>
                      Section
                    </Typography>
                    <Typography sx={{ color: "#000", fontSize: "16px", py: 1 }}>
                      C
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container sx={{ display: "flex", justifyContent: "center" }}>
            <Grid
              size={{ xs: 12, md: "auto", lg: "auto" }}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}>
              <Tabs
                value={value}
                onChange={handleTabChange}
                aria-label="attendance tabs"
                variant="scrollable"
                slotProps={{
                  indicator: {
                    sx: { display: "none" },
                  },
                }}
                sx={{
                  backgroundColor: "#fff",
                  minHeight: "10px",
                  borderRadius: "50px",
                  border: "1px solid rgba(0,0,0,0.1)",

                  "& .MuiTabs-flexContainer": {
                    justifyContent: "center",
                  },

                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontSize: "13px",
                    color: "#555",
                    fontWeight: "bold",
                    minWidth: 0,
                    minHeight: "30px",
                    height: "30px",
                    px: 2,
                    m: 0.8,
                  },

                  "& .Mui-selected": {
                    color: `${websiteSettings.textColor} !important`,
                    bgcolor: websiteSettings.mainColor,
                    borderRadius: "50px",
                    boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Tab label="School Fee" />
                <Tab label="Transport Fee" />
                <Tab label="ECA Fee" />
                <Tab label="Additional Fee" />
              </Tabs>
            </Grid>
          </Grid>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: websiteSettings.mainColor,
              py: 0.5,
              width: "fit-content",
              px: 4,
              borderTopLeftRadius: "5px",
              borderTopRightRadius: "5px",
            }}
          >
            <Typography sx={{ color: websiteSettings.textColor }}>
              {feeTabs[value]}
            </Typography>
          </Box>

          <TableContainer
            sx={{
              border: "1px solid #E601542A",
              overflowY: "auto",
              boxShadow: "none",
              backgroundColor: "#fff",
            }}
          >
            <Table stickyHeader sx={{ minWidth: "100%" }}>
              <TableHead>
                <TableRow>
                  {[
                    "S.No",
                    "Fee Details",
                    "Fee Amount",
                    "Payment Status",
                    "Paid Amount",
                    "Pending Amount",
                    "To Pay",
                    "Due Date",
                    "Print",
                  ].map((header, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        borderRight: 1,
                        borderColor: "#E601542A",
                        textAlign: "center",
                        backgroundColor: "#ff00001A",
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
                {schoolFee.map((row, rowIndex) => {
                  const isSelected = selectedRows.includes(rowIndex);
                  return (
                    <TableRow
                      key={rowIndex}
                      onClick={() => handleSelect(rowIndex)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#FFF7F7" : "transparent",
                        "&:hover": {
                          backgroundColor: isSelected ? "#ff00001A" : "#fafafa",
                        },
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
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.5,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelect(rowIndex)}
                            color="secondary"
                            sx={{
                              "&.Mui-checked": {
                                color: "#E60154",
                              },
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Typography sx={{ fontSize: 14, color: "#333" }}>
                            {rowIndex + 1}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell
                        sx={{
                          borderRight: 1,
                          borderColor: "#E601542A",
                          textAlign: "center",
                        }}
                      >
                        {row.feeDetails}
                      </TableCell>

                      <TableCell
                        sx={{
                          borderRight: 1,
                          borderColor: "#E601542A",
                          textAlign: "center",
                        }}
                      >
                        ₹{row.feeAmount}
                      </TableCell>

                      <TableCell
                        sx={{
                          borderRight: 1,
                          borderColor: "#E601542A",
                          textAlign: "center",
                          color:
                            row.status === "Paid"
                              ? "green"
                              : row.status === "Pending"
                                ? "red"
                                : "#f57c00",
                          fontWeight: 500,
                        }}
                      >
                        {row.status}
                      </TableCell>

                      <TableCell
                        sx={{
                          borderRight: 1,
                          borderColor: "#E601542A",
                          textAlign: "center",
                        }}
                      >
                        ₹{row.paidAmount}
                      </TableCell>

                      <TableCell
                        sx={{
                          borderRight: 1,
                          borderColor: "#E601542A",
                          textAlign: "center",
                        }}
                      >
                        ₹{row.pendingAmount}
                      </TableCell>

                      <TableCell
                        sx={{
                          borderRight: 1,
                          borderColor: "#E601542A",
                          textAlign: "center",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TextField
                          size='small'
                          type="number"
                          value={toPayAmounts[rowIndex] || 0}
                          onChange={(e) => handleToPayChange(rowIndex, e.target.value)}
                          disabled={!isSelected || row.pendingAmount === 0}
                          inputProps={{
                            min: 0,
                            max: row.pendingAmount,
                            step: 1
                          }}
                          sx={{
                            width: '120px',
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: isSelected ? '#E60154' : '#ccc',
                              },
                              '&:hover fieldset': {
                                borderColor: '#E60154',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#E60154',
                              },
                              '&.Mui-disabled': {
                                backgroundColor: '#f5f5f5',
                              }
                            },
                            '& input': {
                              textAlign: 'center',
                              fontWeight: 600
                            }
                          }}
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 0.5 }}>₹</Typography>
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
                        {row.dueDate}
                      </TableCell>

                      <TableCell
                        sx={{
                          borderRight: 1,
                          borderColor: "#E601542A",
                          textAlign: "center",
                          color: "#6A1B9A",
                          fontWeight: 500,
                          textDecoration: "underline",
                          "&:hover": { color: "#4A148C" },
                          cursor: "pointer",
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPopup(row);
                          }}
                          sx={{
                            backgroundColor: "#E60154",
                            color: "#fff",
                            fontWeight: "600",
                            textTransform: "none",
                            borderRadius: "999px",
                            height: "25px",
                            width: "80px",
                            fontSize: 13,
                            boxShadow: "none",
                            borderColor: "#E601542A"
                          }}
                        >
                          Print
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Dialog open={openPreview} onClose={handleClose} maxWidth="md" fullWidth keepMounted>
            <Box sx={{ p: 2 }}>
              <Box
                ref={componentRef}
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                  px: 3,
                  "@media print": {
                    boxShadow: "none",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mb: 1,
                    gap: 2,
                  }}
                >
                  <img src={websiteSettings?.logo} width="70px" alt="school logo" />
                  <Typography sx={{ fontWeight: 700, fontSize: "20px", color: "#000" }}>
                    {websiteSettings?.title || "MORNING STAR MATRICULATION SCHOOL"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    height: "1px",
                    width: "100%",
                    backgroundColor: "#ccc",
                    mb: 1,
                  }}
                ></Box>

                <Typography
                  sx={{
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "20px",
                    mb: 1,
                    color: "#000",
                  }}
                >
                  School Fee
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  {[
                    { label: "SI No", value: "MS/25/FRE/002360" },
                    { label: "Student Name", value: "Nisha Preethi S." },
                    { label: "Roll No", value: "25002" },
                    { label: "Class & Section", value: "Prekg A1" },
                    { label: "Bill Date", value: "31/10/2025" },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      sx={{
                        borderRight: i !== 4 ? "1px solid #e0e0e0" : "none",
                        p: 0.7,
                      }}
                    >
                      <Typography sx={{ color: "#888", fontSize: "12px" }}>{item.label}</Typography>
                      <Typography
                        sx={{
                          color: "#000",
                          fontSize: "15px",
                          fontWeight: 500,
                          mt: 0.5,
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <TableContainer
                  sx={{
                    border: "1px solid #E601542A",
                    mt: 1.5
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        {["S.No", "Fee Details", "Fee Description", "Fee Amount"].map((header, index) => (
                          <TableCell
                            key={index}
                            sx={{
                              backgroundColor: "#ff00001A",
                              fontWeight: 600,
                              textAlign: "center",
                              border: "1px solid #E601542A",
                              color: "#000",
                              fontSize: "14px",
                            }}
                          >
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {dummyData1.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A" }}>
                            {rowIndex + 1}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A" }}>
                            {row.feeName}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A" }}>
                            {row.feeName}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A" }}>
                            {row.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: "flex", justifyContent: "end", }}>
                  <Box
                    sx={{
                      border: "1px solid #ccc",
                      py: 1,
                      px: 3,
                      color: "#00963C",
                      fontWeight: "600",
                      backgroundColor: "#fff",
                      borderTop: "none",
                      borderBottomLeftRadius: "5px",
                      mr: "-2px",
                      borderBottomRightRadius: "5px",
                    }}
                  >
                    Total Amount: <span style={{ marginLeft: "20px" }}>Rs.15,000</span>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography sx={{ fontSize: "15px" }}>
                    <b>Total amount in words :</b> Fifteen Thousand Rupees only
                  </Typography>

                  <Box sx={{ textAlign: "center" }}>
                    <Box
                      sx={{
                        border: "1px solid #000",
                        width: "180px",
                        height: "35px",
                        borderRadius: "5px",
                        mx: "auto",
                      }}
                    />
                    <Typography sx={{ fontSize: "13px", mt: 1 }}>School staff signature</Typography>
                  </Box>
                </Box>
              </Box>

              <DialogActions sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  sx={{
                    borderColor: "#000",
                    color: "#000",
                    textTransform: "none",
                    borderRadius: "30px",
                    width: "100px",
                    height: "33px",
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={handlePrint}

                  variant="contained"
                  sx={{
                    backgroundColor: websiteSettings.mainColor,
                    textTransform: "none",
                    color: websiteSettings.textColor,
                    width: "100px",
                    height: "33px",
                    borderRadius: "30px",
                  }}
                >
                  Print
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="contained"
                  sx={{
                    backgroundColor: websiteSettings.mainColor,
                    textTransform: "none",
                    color: websiteSettings.textColor,
                    width: "110px",
                    height: "33px",
                    borderRadius: "30px",
                  }}
                >
                  Download
                </Button>
              </DialogActions>
            </Box>
          </Dialog>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", ml: 12 }}>
              <Box sx={{ border: "1px solid #ccc", py: 1, px: 3, color: "#00963C", fontWeight: "600", borderTop: "none", borderBottomLeftRadius: "5px", backgroundColor: "#fff", }}>
                Total Yearly Fees Amount
              </Box>
              <Box sx={{ border: "1px solid #ccc", borderLeft: "none", fontWeight: "600", py: 1, px: 2, color: "#00963C", borderTop: "none", borderBottomRightRadius: "5px", backgroundColor: "#fff", }}>
                Rs.45,000
              </Box>
            </Box>
            <Box
              sx={{
                textTransform: "none",
                textDecoration: "underline",
                color: "#1F73C2",
                mt: 1,
                cursor: "pointer",
                display: "inline-block",
                transition: "color 0.2s ease",
                userSelect: "none",
                "&:hover": {
                  color: "#145A9E",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
              onClick={() => {
                console.log("Print Entire Bill clicked");
              }}
            >
              Print as Entire Bill
            </Box>

          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box
              sx={{
                textTransform: "none",
                textDecoration: "underline",
                color: "#1F73C2",
                mt: 2,
                cursor: "pointer",
                display: "inline-block",
                transition: "color 0.2s ease",
                userSelect: "none",
                "&:hover": {
                  color: "#145A9E",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
              onClick={() => {
                setOpenHistoryPopup(true)
              }}
            >
              View Previous bill Transaction History
            </Box>
            <Button
              variant="contained"
              size="small"
              disabled={selectedRows.length === 0}
              onClick={handleOpenPaymentPopup}
              sx={{
                backgroundColor: "#2e7d32",
                textTransform: "none",
                borderRadius: "8px",
                mt: 1,
                px: 3,
                "&:hover": {
                  backgroundColor: "#1b5e20",
                },
                fontSize: 13,
                boxShadow: "none",
              }}
            >
              Pay ₹{getTotalPending().toLocaleString()}
            </Button>

            <Dialog
              open={openPaymentPopup}
              onClose={!paymentProcessing ? handleClosePaymentPopup : undefined}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: "10px",
                  overflow: "hidden",
                  background: "#ffffff",
                  boxShadow: "0 32px 64px -12px rgba(0, 0, 0, 0.3)",
                },
              }}
            >

              {/* Premium Header */}
              <Box
                sx={{
                  background: websiteSettings.mainColor,
                  color: "#fff",
                  px: 3.5,
                  pt: 3,
                  pb: 4,
                  position: "relative",
                  overflow: "hidden",
                  minHeight: "100px"
                }}
              >
                {/* Decorative Elements */}
                <Box sx={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, borderRadius: "50%", background: websiteSettings.mainColor, opacity: 0.1 }} />
                <Box sx={{ position: "absolute", bottom: -30, left: -30, width: 100, height: 100, borderRadius: "50%", background: websiteSettings.mainColor, opacity: 0.08 }} />

                {/* Close Button */}
                {!paymentProcessing && !paymentSuccess && (
                  <IconButton
                    onClick={handleClosePaymentPopup}
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      color: websiteSettings.textColor,
                      width: 36,
                      height: 36,
                      zIndex: "999",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                )}

                {/* Header Content */}
                <Box sx={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.75rem", color: websiteSettings.textColor, mb: 0.5, letterSpacing: "-0.02em" }}>
                      {paymentSuccess ? "Payment Complete" : "Complete Payment"}
                    </Typography>

                    <Typography sx={{ fontSize: "0.9rem", color: websiteSettings.textColor, mb: 3 }}>
                      {paymentSuccess ? "Your transaction was successful" : "Pay your school fees securely"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, backgroundColor: "#fff", width: "fit-content", px: 2, py: 0.3, borderRadius: "999px" }}>
                      <LockIcon sx={{ fontSize: 16, color: "#10b981" }} />
                      <Typography sx={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Secure Payment
                      </Typography>
                    </Box>
                  </Box>
                  {/* Amount Display */}
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "baseline",
                      background: "#F8FAFC",
                      px: 3,
                      borderRadius: "14px",
                      height: "100%",
                      boxShadow: `0 8px 24px ${websiteSettings.mainColor}30`,
                      mt: 3,
                      py: 2

                    }}
                  >
                    <Typography sx={{ fontSize: "0.9rem", color: websiteSettings.textColor, fontWeight: 500, opacity: 0.9 }}>₹</Typography>
                    <Typography sx={{ fontSize: "2rem", fontWeight: 800, color: websiteSettings.textColor, letterSpacing: "-0.02em" }}>
                      {getTotalPending().toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <DialogContent sx={{ px: 3.5, pt: 3.5, pb: 2 }} >
                {/* Progress Steps */}
                {!paymentSuccess && (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 4 }}>
                    {paymentSteps.map((label, index) => (
                      <React.Fragment key={label}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              transition: "all 0.3s ease",
                              ...(paymentStep > index
                                ? { background: "#10b981", color: "#fff" }
                                : paymentStep === index
                                  ? { background: websiteSettings.mainColor, color: websiteSettings.textColor, boxShadow: `0 4px 12px ${websiteSettings.mainColor}40` }
                                  : { background: "#f1f5f9", color: "#94a3b8" }),
                            }}
                          >
                            {paymentStep > index ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : index + 1}
                          </Box>
                          <Typography
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: paymentStep === index ? 600 : 500,
                              color: paymentStep >= index ? "#1e293b" : "#94a3b8",
                              display: { xs: "none", sm: "block" },
                            }}
                          >
                            {label}
                          </Typography>
                        </Box>
                        {index < paymentSteps.length - 1 && (
                          <Box
                            sx={{
                              width: 40,
                              height: 2,
                              borderRadius: 1,
                              background: paymentStep > index ? "#10b981" : "#e2e8f0",
                              transition: "all 0.3s ease",
                            }}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </Box>
                )}

                {/* Step 0: Select Payment Method */}
                {paymentStep === 0 && !paymentSuccess && (
                  <Fade in timeout={300}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#64748b", mb: 2, textAlign: "center" }}>
                        Select how you want to pay
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {paymentMethodOptions.map((method) => (
                          <Box
                            key={method.id}
                            onClick={() => handlePaymentMethodSelect(method.id)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              p: 2,
                              borderRadius: "14px",
                              cursor: "pointer",
                              border: "2px solid",
                              borderColor: selectedPaymentMethod === method.id ? method.color : "#ddd",
                              background: selectedPaymentMethod === method.id ? `${method.color}08` : "#f8fafc",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                background: selectedPaymentMethod === method.id ? `${method.color}12` : "#f1f5f9",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: selectedPaymentMethod === method.id ? method.color : "#fff",
                                color: selectedPaymentMethod === method.id ? "#fff" : method.color,
                                boxShadow: selectedPaymentMethod === method.id ? `0 4px 12px ${method.color}35` : "0 2px 8px rgba(0,0,0,0.06)",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {method.icon}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#1e293b" }}>
                                {method.name}
                              </Typography>
                              <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                                {method.description}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                border: selectedPaymentMethod === method.id ? "none" : "2px solid #d1d5db",
                                background: selectedPaymentMethod === method.id ? method.color : "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {selectedPaymentMethod === method.id && (
                                <CheckCircleIcon sx={{ fontSize: 22, color: "#fff" }} />
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Fade>
                )}

                {/* Step 1: Enter Details */}
                {paymentStep === 1 && !paymentSuccess && (
                  <Fade in timeout={300}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#64748b", mb: 2.5, textAlign: "center" }}>
                        Enter your payment details
                      </Typography>

                      {/* Cash Payment Form */}
                      {selectedPaymentMethod === "cash" && (
                        <Box>
                          <Box sx={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "12px", p: 2, mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                            <PaymentsIcon sx={{ color: "#f59e0b", fontSize: 22 }} />
                            <Typography sx={{ fontSize: "0.85rem", color: "#92400e", fontWeight: 500 }}>
                              Enter the denomination count for cash payment
                            </Typography>
                          </Box>

                          <Box sx={{ background: "#f8fafc", borderRadius: "16px", p: 2.5, border: "1px solid #ccc" }}>
                            {notesList.map((note, idx) => (
                              <Box
                                key={note}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  py: 1.5,
                                  borderBottom: idx < notesList.length - 1 ? "1px solid #e2e8f0" : "none",
                                }}
                              >
                                <Box sx={{ width: 60, py: 0.8, px: 1.5, background: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }}>₹{note}</Typography>
                                </Box>
                                <Typography sx={{ color: "#94a3b8", fontSize: "1.2rem" }}>×</Typography>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={counts[note]}
                                  onChange={(e) => handleChange(note, e.target.value)}
                                  sx={{
                                    width: 70,
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "8px",
                                      background: "#fff",
                                      "& input": { textAlign: "center", fontWeight: 600, py: 1 },
                                    },
                                  }}
                                />
                                <Typography sx={{ color: "#94a3b8", fontSize: "1.2rem" }}>=</Typography>
                                <Box sx={{ flex: 1, textAlign: "right" }}>
                                  <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: getSubtotal(note) > 0 ? "#10b981" : "#94a3b8" }}>
                                    ₹{getSubtotal(note).toLocaleString()}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3, p: 2.5, background: "#0f172a", borderRadius: "14px" }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: "#fff" }}>Total Cash</Typography>
                            <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: websiteSettings.mainColor }}>
                              ₹{totalCash.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* UPI Payment Form */}
                      {selectedPaymentMethod === "upi" && (
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="UPI ID"
                              placeholder="example@upi"
                              fullWidth
                              value={paymentFormData.upiId}
                              onChange={(e) => handlePaymentFormChange("upiId", e.target.value)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><AccountBalanceWalletIcon sx={{ color: "#8b5cf6" }} /></InputAdornment>,
                              }}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Transaction ID"
                              placeholder="Enter UPI transaction ID"
                              fullWidth
                              value={paymentFormData.transactionId}
                              onChange={(e) => handlePaymentFormChange("transactionId", e.target.value)}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Amount"
                              type="number"
                              fullWidth
                              value={paymentFormData.amount}
                              onChange={(e) => handlePaymentFormChange("amount", e.target.value)}
                              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Remarks (Optional)"
                              placeholder="Add a note"
                              fullWidth
                              value={paymentFormData.remarks}
                              onChange={(e) => handlePaymentFormChange("remarks", e.target.value)}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            />
                          </Grid>
                        </Grid>
                      )}

                      {/* Net Banking Form */}
                      {selectedPaymentMethod === "netbanking" && (
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Bank Name"
                              placeholder="Enter bank name"
                              fullWidth
                              value={paymentFormData.bankName}
                              onChange={(e) => handlePaymentFormChange("bankName", e.target.value)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><AccountBalanceIcon sx={{ color: "#3b82f6" }} /></InputAdornment>,
                              }}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Transaction ID"
                              placeholder="NEFT/RTGS reference"
                              fullWidth
                              value={paymentFormData.transactionId}
                              onChange={(e) => handlePaymentFormChange("transactionId", e.target.value)}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Transaction Date"
                              type="date"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Amount"
                              type="number"
                              fullWidth
                              value={paymentFormData.amount}
                              onChange={(e) => handlePaymentFormChange("amount", e.target.value)}
                              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            />
                          </Grid>
                        </Grid>
                      )}

                      {/* Cheque Form */}
                      {selectedPaymentMethod === "cheque" && (
                        <Box>
                          <Alert severity="warning" sx={{ mb: 3, borderRadius: "10px" }}>
                            <Typography variant="body2">
                              Cheque payments take 2-3 business days to clear. Payment will be confirmed after successful clearance.
                            </Typography>
                          </Alert>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                label="Cheque Number"
                                placeholder="Enter cheque number"
                                fullWidth
                                value={paymentFormData.chequeNo}
                                onChange={(e) => handlePaymentFormChange("chequeNo", e.target.value)}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start"><ReceiptLongIcon sx={{ color: "#f59e0b" }} /></InputAdornment>,
                                }}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                label="Bank Name"
                                placeholder="Issuing bank name"
                                fullWidth
                                value={paymentFormData.bankName}
                                onChange={(e) => handlePaymentFormChange("bankName", e.target.value)}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                label="Cheque Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={paymentFormData.chequeDate}
                                onChange={(e) => handlePaymentFormChange("chequeDate", e.target.value)}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                label="Amount"
                                type="number"
                                fullWidth
                                value={paymentFormData.amount}
                                onChange={(e) => handlePaymentFormChange("amount", e.target.value)}
                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      {/* Card Payment Form */}
                      {selectedPaymentMethod === "card" && (
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Card Type"
                              placeholder="Visa / Mastercard / Rupay"
                              fullWidth
                              value={paymentFormData.cardType}
                              onChange={(e) => handlePaymentFormChange("cardType", e.target.value)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><CreditCardIcon sx={{ color: "#ef4444" }} /></InputAdornment>,
                              }}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Last 4 Digits"
                              placeholder="XXXX"
                              fullWidth
                              value={paymentFormData.cardLast4}
                              onChange={(e) => handlePaymentFormChange("cardLast4", e.target.value.slice(0, 4))}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Transaction ID"
                              placeholder="Card transaction reference"
                              fullWidth
                              value={paymentFormData.transactionId}
                              onChange={(e) => handlePaymentFormChange("transactionId", e.target.value)}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Amount"
                              type="number"
                              fullWidth
                              value={paymentFormData.amount}
                              onChange={(e) => handlePaymentFormChange("amount", e.target.value)}
                              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  </Fade>
                )}

                {/* Step 2: Confirm Payment */}
                {paymentStep === 2 && !paymentSuccess && (
                  <Fade in timeout={400}>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                        <Box sx={{ width: 4, height: 24, borderRadius: 2, background: websiteSettings.mainColor }} />
                        <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#1e293b" }}>
                          Confirm Payment Details
                        </Typography>
                      </Box>

                      <Card
                        sx={{
                          borderRadius: "20px",
                          border: "1px solid #e2e8f0",
                          mb: 3,
                          overflow: "hidden",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                        }}
                      >
                        {/* Payment Method Header */}
                        <Box
                          sx={{
                            background: `linear-gradient(135deg, ${paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.color}15 0%, ${paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.color}05 100%)`,
                            px: 3,
                            py: 2.5,
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: "12px",
                                background: paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                boxShadow: `0 4px 12px ${paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.color}40`,
                              }}
                            >
                              {paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.icon}
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#1e293b" }}>
                                {paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.name}
                              </Typography>
                              <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                                {paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.description}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <CardContent sx={{ p: 3 }}>
                          <Grid container spacing={2.5}>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ p: 2, background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Student Name
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>{studentData.name}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ p: 2, background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Roll Number
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>{studentData.rollNo}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ p: 2, background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Class & Section
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>{studentData.grade} - {studentData.section}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ p: 2, background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Fee Type
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>School Fee</Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Total Amount */}
                          <Box
                            sx={{
                              mt: 3,
                              p: 2.5,
                              background: "linear-gradient(135deg, #10b98112 0%, #10b98108 100%)",
                              borderRadius: "16px",
                              border: "1px solid #10b98125",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Box sx={{ width: 40, height: 40, borderRadius: "10px", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <PaymentsIcon sx={{ color: "#fff", fontSize: 20 }} />
                              </Box>
                              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#1e293b" }}>Total Payable</Typography>
                            </Box>
                            <Typography sx={{ fontWeight: 800, fontSize: "1.75rem", color: "#10b981" }}>
                              ₹{selectedPaymentMethod === "cash" ? totalCash.toLocaleString() : getTotalPending().toLocaleString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Security Badge */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 2,
                          p: 2,
                          background: "#f8fafc",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#10b981" }}>
                          <SecurityIcon sx={{ fontSize: 20 }} />
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>Secured</Typography>
                        </Box>
                        <Box sx={{ width: 1, height: 16, background: "#e2e8f0" }} />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#3b82f6" }}>
                          <VerifiedUserIcon sx={{ fontSize: 20 }} />
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>Verified</Typography>
                        </Box>
                        <Box sx={{ width: 1, height: 16, background: "#e2e8f0" }} />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#8b5cf6" }}>
                          <LockIcon sx={{ fontSize: 20 }} />
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>256-bit SSL</Typography>
                        </Box>
                      </Box>

                      {paymentProcessing && (
                        <Box sx={{ mt: 4, textAlign: "center" }}>
                          <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
                            <CircularProgress
                              size={60}
                              thickness={4}
                              sx={{
                                color: websiteSettings.mainColor,
                                "& .MuiCircularProgress-circle": {
                                  strokeLinecap: "round",
                                },
                              }}
                            />
                          </Box>
                          <Typography sx={{ fontWeight: 600, color: "#1e293b", fontSize: "1.1rem", mb: 0.5 }}>
                            Processing Payment
                          </Typography>
                          <Typography sx={{ color: "#64748b", fontSize: "0.9rem" }}>
                            Please wait while we process your transaction...
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Fade>
                )}

                {/* Payment Success */}
                {paymentSuccess && (
                  <Fade in timeout={400}>
                    <Box sx={{ textAlign: "center", py: 3 }}>
                      {/* Success Icon with Animation Effect */}
                      <Box sx={{ position: "relative", display: "inline-block", mb: 3 }}>
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #10b98115 0%, #10b98105 100%)",
                            animation: "pulse 2s ease-in-out infinite",
                          }}
                        />
                        <Box
                          sx={{
                            position: "relative",
                            width: 90,
                            height: 90,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 12px 32px rgba(16, 185, 129, 0.35)",
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 50, color: "#fff" }} />
                        </Box>
                      </Box>

                      <Typography sx={{ fontWeight: 800, fontSize: "1.75rem", color: "#1e293b", mb: 0.5, letterSpacing: "-0.02em" }}>
                        Payment Successful!
                      </Typography>
                      <Typography sx={{ color: "#64748b", mb: 4, fontSize: "1rem" }}>
                        Your transaction has been completed successfully
                      </Typography>

                      {/* Transaction Details Card */}
                      <Card
                        sx={{
                          borderRadius: "20px",
                          border: "none",
                          maxWidth: 420,
                          mx: "auto",
                          mb: 3,
                          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                          overflow: "hidden",
                        }}
                      >
                        <Box sx={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", py: 2, px: 3 }}>
                          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Transaction Receipt
                          </Typography>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ textAlign: "left" }}>
                                <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Transaction ID
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }}>TXN{Date.now()}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ textAlign: "left" }}>
                                <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Date & Time
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }}>{dayjs().format("DD MMM YYYY, hh:mm A")}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ textAlign: "left" }}>
                                <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Payment Method
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }}>
                                  {paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.name}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ textAlign: "left" }}>
                                <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Amount Paid
                                </Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "#10b981" }}>
                                  ₹{selectedPaymentMethod === "cash" ? totalCash.toLocaleString() : getTotalPending().toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>

                      {/* Verified Badge */}
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1.5,
                          px: 3,
                          py: 1.5,
                          background: "linear-gradient(135deg, #10b98112 0%, #10b98108 100%)",
                          borderRadius: "100px",
                          border: "1px solid #10b98125",
                        }}
                      >
                        <VerifiedUserIcon sx={{ fontSize: 20, color: "#10b981" }} />
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#10b981" }}>
                          Verified & Secured Payment
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                )}
              </DialogContent>

              <DialogActions
                sx={{
                  px: 4,
                  pb: 2,
                  pt: 2,
                  borderTop: "1px solid #ccc",
                  background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
                }}
              >
                {!paymentSuccess && paymentStep > 0 && (
                  <Button
                    onClick={handlePaymentBack}
                    disabled={paymentProcessing}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 600,
                      color: "#64748b",
                      px: 2.5,
                      py: 1.2,
                      "&:hover": { background: "#f1f5f9" },
                    }}
                  >
                    Back
                  </Button>
                )}
                <Box sx={{ flex: 1 }} />

                {!paymentSuccess && (
                  <Button
                    onClick={handleClosePaymentPopup}
                    disabled={paymentProcessing}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 600,
                      color: "#555",
                      border: "2px solid #e2e8f0",
                      px: 3,
                      mr: 1,
                      py: 1.2,
                      "&:hover": {
                        borderColor: "#555",
                        background: "#f8fafc",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                )}

                {!paymentSuccess && paymentStep < 2 && (
                  <Button
                    variant="contained"
                    onClick={handlePaymentNext}
                    disabled={paymentStep === 0 && !selectedPaymentMethod}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 700,
                      px: 4,
                      py: 1.2,
                      background: `linear-gradient(135deg, ${websiteSettings.mainColor} 0%, ${websiteSettings.darkColor} 100%)`,
                      color: websiteSettings.textColor,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      border: "1px solid rgba(0,0,0,0.1)",
                      "&:disabled": {
                        background: "#e2e8f0",
                        boxShadow: "none",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Continue
                  </Button>
                )}

                {!paymentSuccess && paymentStep === 2 && (
                  <Button
                    variant="contained"
                    onClick={handlePaymentConfirm}
                    disabled={paymentProcessing}
                    startIcon={paymentProcessing ? null : <CheckCircleIcon />}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 700,
                      px: 4,
                      py: 1.2,
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        boxShadow: "0 6px 20px rgba(16, 185, 129, 0.5)",
                        transform: "translateY(-1px)",
                      },
                      "&:disabled": {
                        background: "#94a3b8",
                        boxShadow: "none",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {paymentProcessing ? "Processing..." : `Pay ₹${selectedPaymentMethod === "cash" ? totalCash.toLocaleString() : getTotalPending().toLocaleString()}`}
                  </Button>
                )}

                {paymentSuccess && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        py: 1.2,
                        borderWidth: "2px",
                        borderColor: websiteSettings.mainColor,
                        color: websiteSettings.mainColor,
                        "&:hover": {
                          borderWidth: "2px",
                          borderColor: websiteSettings.darkColor,
                          background: `${websiteSettings.mainColor}10`,
                        },
                      }}
                    >
                      Print Receipt
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleClosePaymentPopup}
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 700,
                        px: 4,
                        py: 1.2,
                        background: `linear-gradient(135deg, ${websiteSettings.mainColor} 0%, ${websiteSettings.darkColor} 100%)`,
                        color: websiteSettings.textColor,
                        boxShadow: `0 4px 14px ${websiteSettings.mainColor}40`,
                        "&:hover": {
                          background: `linear-gradient(135deg, ${websiteSettings.darkColor} 0%, ${websiteSettings.darkColor} 100%)`,
                          boxShadow: `0 6px 20px ${websiteSettings.mainColor}50`,
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      Done
                    </Button>
                  </>
                )}
              </DialogActions>
            </Dialog>

            <Dialog
              open={openHistoryPopup}
              onClose={() => setOpenHistoryPopup(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogContent>
                <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1, borderBottom: "1px solid #ddd", mb: 0.13, }}>
                  <Grid container>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center" }}>

                      <Typography sx={{ fontWeight: "600", fontSize: "19px" }} >Transaction History</Typography>
                    </Grid>
                  </Grid>
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    border: "1px solid #e0e0e0",
                    mt: 2
                  }}
                >
                  {[
                    { label: "Student Name", value: "Nisha Preethi S." },
                    { label: "Roll No", value: "25002" },
                    { label: "Gender", value: "Female" },
                    { label: "Class", value: "Prekg" },
                    { label: "Section", value: "A1" },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      sx={{
                        borderRight: i !== 4 ? "1px solid #e0e0e0" : "none",
                        p: 0.7,
                      }}
                    >
                      <Typography sx={{ color: "#888", fontSize: "12px" }}>{item.label}</Typography>
                      <Typography
                        sx={{
                          color: "#000",
                          fontSize: "15px",
                          fontWeight: 500,
                          mt: 0.5,
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                {/* {dummyData2.map((row, index) => (
                  <TableContainer
                    key={index}
                    sx={{
                      border: "1px solid #E601542A",
                      mt: 2,
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          {[
                            "S.No",
                            "Bill Number",
                            "Bill Date",
                            "Fee Details",
                            "Payment Mode",
                            "Received Amount",
                            "Print",
                          ].map((header, i) => (
                            <TableCell
                              key={i}
                              sx={{
                                backgroundColor: "#ff00001A",
                                fontWeight: 600,
                                textAlign: "center",
                                border: "1px solid #E601542A",
                                fontSize: "14px",
                              }}
                            >
                              {header}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A" }}>
                            {index + 1}
                          </TableCell>

                          <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A" }}>
                            {row.billNumber}
                          </TableCell>

                          <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A" }}>
                            {row.billDate} – {row.time}
                          </TableCell>

                          <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A" }}>
                            {row.feeName}
                          </TableCell>

                          <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A" }}>
                            {row.paymentMode}
                          </TableCell>

                          <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A" }}>
                            ₹{row.amount}
                          </TableCell>

                          <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A" }}>
                            <Button
                              variant="outlined"
                              sx={{
                                borderRadius: "999px",
                                borderColor: "#E10052",
                                color: "#E10052",
                                height: "28px",
                                width: "100px",
                                fontSize: "12px",
                                textTransform: "none",
                              }}
                            >
                              Print
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                ))} */}
              </DialogContent>
            </Dialog>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
