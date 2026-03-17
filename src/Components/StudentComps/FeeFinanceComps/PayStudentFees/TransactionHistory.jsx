import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Typography, Chip, IconButton, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogContent, DialogActions, Button, CircularProgress, Tooltip,
  Tab, Tabs,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import html2pdf from 'html2pdf.js';
import { useReactToPrint } from 'react-to-print';
import dayjs from 'dayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { schoolFeesRecordGet, ecaFeesRecordGet, additionalFeesRecordGet, transportFeesRecordGet } from '../../../../Api/Api';
import SnackBar from '../../../SnackBar';
import avatarImage from '../../../../Images/PagesImage/avatar.png';

const TAB_FEE_TYPES = ['schoolfee', 'transport', 'eca', 'additional'];
const FEE_TYPE_TO_TAB = { schoolfee: 0, transport: 1, eca: 2, additional: 3 };

const FEE_TYPE_COLORS = {
  schoolfee: { color: '#1976D2', bg: '#E3F2FD', label: 'School Fee' },
  eca: { color: '#8E24AA', bg: '#F3E5F5', label: 'ECA Fee' },
  additional: { color: '#F57C00', bg: '#FFF3E0', label: 'Additional Fee' },
  transport: { color: '#388E3C', bg: '#E8F5E9', label: 'Transport Fee' },
};

const STATUS_CONFIG = {
  paid: { bg: '#E8F5E9', color: '#2E7D32', label: 'Paid', icon: CheckCircleIcon },
  partiallypaid: { bg: '#FFF3E0', color: '#F57C00', label: 'Partially Paid', icon: HourglassEmptyIcon },
  pending: { bg: '#FFEBEE', color: '#C62828', label: 'Pending', icon: PendingActionsIcon },
};

const PAYMENT_ICONS = {
  CASH: <LocalAtmIcon sx={{ fontSize: 15 }} />,
  UPI: <AccountBalanceWalletIcon sx={{ fontSize: 15 }} />,
  CARD: <CreditCardIcon sx={{ fontSize: 15 }} />,
  NETBANKING: <AccountBalanceIcon sx={{ fontSize: 15 }} />,
  CHEQUE: <DescriptionIcon sx={{ fontSize: 15 }} />,
};

// ── Number to words (Indian system) ───────────────────────────────────────────
const convertToWords = (num) => {
  if (!num || num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const cvtH = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + cvtH(n % 100) : '');
  };
  if (num < 1000) return cvtH(num);
  if (num < 100000) return cvtH(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + cvtH(num % 1000) : '');
  if (num < 10000000) return cvtH(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convertToWords(num % 100000) : '');
  return cvtH(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convertToWords(num % 10000000) : '');
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color = '#333', bg = '#fafafa' }) => (
  <Box sx={{ border: '1px solid #e8e8e8', borderRadius: '10px', p: 1.5, bgcolor: bg }}>
    <Typography sx={{ fontSize: '11px', color: '#888', mb: 0.4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: '16px', fontWeight: 800, color }}>
      {value}
    </Typography>
  </Box>
);

const TransactionHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { rollNumber, year, feeType = 'schoolfee', activeTab } = location.state || {};

  const [tabValue, setTabValue] = useState(() => FEE_TYPE_TO_TAB[feeType] ?? 0);
  const currentFeeType = TAB_FEE_TYPES[tabValue] || 'schoolfee';

  const [isLoading, setIsLoading] = useState(true);
  const [transactionData, setTransactionData] = useState(null);
  const [selectedDenomination, setSelectedDenomination] = useState(null);
  const [denominationDialogOpen, setDenominationDialogOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, status: false, color: false, message: '' });

  const token = '123';
  const ftConfig = FEE_TYPE_COLORS[currentFeeType] || FEE_TYPE_COLORS.schoolfee;
  const websiteSettings = useSelector(selectWebsiteSettings);
  const printReceiptRef = useRef(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setTransactionData(null);
  };

  useEffect(() => {
    if (rollNumber && year) fetchTransactionHistory();
  }, [rollNumber, year, tabValue]);

  const fetchTransactionHistory = async () => {
    setIsLoading(true);
    try {
      let endpoint, params;
      switch (currentFeeType) {
        case 'eca':
          endpoint = ecaFeesRecordGet;
          params = { RollNumber: rollNumber, Year: year };
          break;
        case 'additional':
          endpoint = additionalFeesRecordGet;
          params = { RollNumber: rollNumber, Year: year };
          break;
        case 'transport':
          endpoint = transportFeesRecordGet;
          params = { RollNumber: rollNumber, Year: year };
          break;
        default:
          endpoint = schoolFeesRecordGet;
          params = { RollNumber: rollNumber, Year: year, FeesType: 'schoolfee' };
      }

      const response = await axios.get(endpoint, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.error === false) {
        let processedData = response.data.data;

        if (currentFeeType === 'transport' && processedData.payments) {
          const feeElementsMap = {};
          processedData.payments.forEach((payment) => {
            const elementId = payment.studentFeesElementID || '1';
            if (!feeElementsMap[elementId]) {
              feeElementsMap[elementId] = {
                id: elementId, place: 'Transport Service',
                dueDate: '-', feeAmount: 0, paidAmount: 0,
                pendingAmount: 0, status: 'paid', attemptCount: 0, attempts: [],
              };
            }
            feeElementsMap[elementId].attempts.push({
              attemptNo: feeElementsMap[elementId].attempts.length + 1,
              paidDate: payment.paidDate,
              paymentOption: payment.paymentOption,
              totalPaidAmount: payment.totalPaidAmount,
              upiid: payment.upiid, transactionID: payment.transactionID,
              bankName: payment.bankName, chequeNo: payment.chequeNo,
              cardType: payment.cardType, cardLastFourDigits: payment.cardLastFourDigits,
              remark: payment.remark,
              cashDenominations: processedData.cashDenominations?.filter(
                cd => cd.id === parseInt(payment.cashDenominationID)
              ),
            });
            feeElementsMap[elementId].paidAmount += payment.totalPaidAmount || 0;
            feeElementsMap[elementId].feeAmount += payment.totalPaidAmount || 0;
            feeElementsMap[elementId].attemptCount = feeElementsMap[elementId].attempts.length;
          });
          processedData.feesElements = Object.values(feeElementsMap);
        }

        setTransactionData(processedData);
      } else {
        setSnack({ open: true, status: false, color: false, message: response.data.message || 'Failed to fetch transaction history' });
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      setSnack({ open: true, status: false, color: false, message: 'Failed to load transaction history' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status) =>
    STATUS_CONFIG[status?.toLowerCase()] || { bg: '#F5F5F5', color: '#616161', label: status, icon: PendingActionsIcon };

  const handleViewDenomination = (cashDenominations) => {
    if (cashDenominations?.length > 0) {
      setSelectedDenomination(cashDenominations[0]);
      setDenominationDialogOpen(true);
    }
  };

  const renderDenominationTable = (denomination, type) => {
    const denomData = denomination.inwardsDenomination
      ? (type === 'inwards' ? denomination.inwardsDenomination : denomination.outwardsDenomination)
      : denomination;
    const notes = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

    return (
      <TableContainer sx={{ mt: 1.5, border: '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f8f8' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '12px', py: 1 }}>Denomination</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '12px', py: 1 }}>Count</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '12px', py: 1 }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notes.map((note) => {
              const key = type === 'inwards' ? `inWards${note}` : `outWards${note}`;
              const count = denomData[key] || 0;
              if (!count) return null;
              return (
                <TableRow key={note} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                  <TableCell sx={{ fontSize: '13px', py: 0.8 }}>₹{note}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '13px', py: 0.8 }}>{count}</TableCell>
                  <TableCell align="right" sx={{ fontSize: '13px', fontWeight: 600, py: 0.8 }}>
                    ₹{(note * count).toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow sx={{ bgcolor: '#f8f8f8' }}>
              <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: '12px', py: 1 }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '12px', py: 1 }}>
                ₹{type === 'inwards'
                  ? (denomination.inWardsTotal || denomination.totalInwards || 0).toLocaleString()
                  : (denomination.outWardsTotal || 0).toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const goBack = () => navigate('/dashboardmenu/fee/billing', { state: { rollNumber, activeTab: tabValue } });

  const handlePrint = useReactToPrint({
    content: () => printReceiptRef.current,
    documentTitle: `TransactionHistory_${transactionData?.name || 'Student'}_${dayjs().format('DD-MM-YYYY')}`,
  });

  const handleDownload = () => {
    const element = printReceiptRef.current;
    const opt = {
      filename: `TransactionHistory_${transactionData?.name || 'Student'}_${dayjs().format('DD-MM-YYYY')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '86vh', gap: 2 }}>
        <CircularProgress size={36} sx={{ color: ftConfig.color }} />
        <Typography sx={{ fontSize: '13px', color: '#888' }}>Loading transaction history...</Typography>
      </Box>
    );
  }

  // ── No data ──────────────────────────────────────────────────────────────
  if (!transactionData) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ backgroundColor: '#f2f2f2', p: 1.5, borderRadius: '10px 10px 10px 0px', borderBottom: '1px solid #ddd' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ width: 27, height: 27 }} onClick={goBack}>
              <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
            </IconButton>
            <Typography sx={{ fontWeight: 600, fontSize: '20px' }}>Transaction History</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', color: '#ccc', gap: 1 }}>
          <ReceiptLongIcon sx={{ fontSize: 48 }} />
          <Typography sx={{ fontSize: '14px', fontStyle: 'italic' }}>No transaction history found</Typography>
        </Box>
      </Box>
    );
  }

  const totalFee = transactionData.feesElements?.reduce((s, e) => s + (e.feeAmount || 0), 0) || 0;
  const totalPaid = transactionData.feesElements?.reduce((s, e) => s + (e.paidAmount || 0), 0) || 0;
  const totalPending = transactionData.feesElements?.reduce((s, e) => s + (e.pendingAmount || 0), 0) || 0;

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', height: '86vh' }}>
      <SnackBar
        open={snack.open}
        color={snack.color}
        setOpen={(val) => setSnack((prev) => ({ ...prev, open: val }))}
        status={snack.status}
        message={snack.message}
      />

      {/* ── Header ── */}
      <Box sx={{ backgroundColor: '#f2f2f2', p: 1.5, borderRadius: '10px 10px 10px 0px', borderBottom: '1px solid #ddd' }}>
        <Grid container alignItems="center">
          <Grid size={{ xs: 12, sm: 7, lg: 3 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ width: 27, height: 27 }} onClick={goBack}>
              <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
            </IconButton>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '20px', lineHeight: 1.2 }}>Transaction History</Typography>
              <Typography sx={{ fontSize: '11px', color: '#888' }}>Complete payment history and transaction details</Typography>
            </Box>
          </Grid>

          <Grid
            size={{ xs: 12, md: 6, lg: 6 }}
            sx={{
              display: "flex",
              justifyContent: "center",
            }}>
            <Tabs
              value={tabValue}
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
          <Grid size={{ xs: 12, sm: 5, lg: 3 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 1 }}>
            <Chip
              label={year || '—'}
              size="small"
              sx={{ bgcolor: '#f0f0f0', color: '#555', fontWeight: 600, fontSize: '12px' }}
            />
            {transactionData && (
              <Tooltip title="Print / Download Receipt">
                <IconButton
                  onClick={() => setPrintDialogOpen(true)}
                  sx={{ width: 32, height: 32, bgcolor: '#fff', border: '1px solid #ddd', '&:hover': { bgcolor: '#f0f0f0' } }}
                >
                  <PrintIcon sx={{ fontSize: 17, color: '#444' }} />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>

        <Grid container sx={{ py: 2 }} >
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
                    {transactionData.name}
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
                    {transactionData.rollNumber}
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
                    {transactionData.grade}
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
                    {transactionData.section}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>


        {/* ── Summary stats ── */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard label="Total Fee" value={`₹${totalFee.toLocaleString()}`} color="#333" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard label="Amount Paid" value={`₹${totalPaid.toLocaleString()}`} color="#2E7D32" bg="#F0FBF1" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard label="Pending Amount" value={`₹${totalPending.toLocaleString()}`} color="#C62828" bg="#FFF5F5" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard label="Fee Elements" value={transactionData.feesElements?.length || 0} color={ftConfig.color} bg={ftConfig.bg} />
          </Grid>
        </Grid>

        {/* ── Fee elements ── */}
        {transactionData.feesElements?.length > 0 ? (
          transactionData.feesElements.map((feeElement, index) => {
            const sc = getStatusConfig(feeElement.status);
            const StatusIcon = sc.icon;
            const col2Label = currentFeeType === 'eca' ? 'Activity Category' : currentFeeType === 'additional' ? 'Fee Name' : currentFeeType === 'transport' ? 'Location' : 'Fee Details';
            const col2Value = currentFeeType === 'eca' ? feeElement.activityCategory : currentFeeType === 'additional' ? feeElement.feeName : currentFeeType === 'transport' ? feeElement.place : feeElement.feeDetails;
            const col3Label = currentFeeType === 'eca' ? 'Activity Name' : 'Due Date';
            const col3Value = currentFeeType === 'eca' ? feeElement.activityName : feeElement.dueDate;

            return (
              <Box
                key={feeElement.id}
                sx={{
                  border: '1px solid #e8e8e8',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  mb: 2,
                  bgcolor: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  borderTop: `3px solid ${sc.color}`,
                }}
              >
                {/* Element header */}
                <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', bgcolor: '#fafafa' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 26, height: 26, borderRadius: '6px', bgcolor: ftConfig.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ReceiptLongIcon sx={{ fontSize: 14, color: ftConfig.color }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#222' }}>
                      {col2Value || `Element ${index + 1}`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={<StatusIcon sx={{ fontSize: '13px !important', color: `${sc.color} !important` }} />}
                      label={sc.label}
                      size="small"
                      sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '11px', border: `1px solid ${sc.color}33` }}
                    />
                    <Typography sx={{ fontSize: '11px', color: '#aaa' }}>#{index + 1}</Typography>
                  </Box>
                </Box>

                {/* Fee summary row */}
                <Box sx={{ px: 2, py: 1.5, display: 'flex', flexWrap: 'wrap', gap: 3, borderBottom: '1px solid #f0f0f0' }}>
                  {[
                    { label: col3Label, value: col3Value || '—', color: '#333' },
                    { label: 'Fee Amount', value: `₹${feeElement.feeAmount?.toLocaleString() || 0}`, color: '#333' },
                    { label: 'Paid', value: `₹${feeElement.paidAmount?.toLocaleString() || 0}`, color: '#2E7D32' },
                    { label: 'Pending', value: `₹${feeElement.pendingAmount?.toLocaleString() || 0}`, color: '#C62828' },
                    { label: 'Payments', value: `${feeElement.attemptCount || 0} transaction${feeElement.attemptCount !== 1 ? 's' : ''}`, color: ftConfig.color },
                  ].map((item) => (
                    <Box key={item.label}>
                      <Typography sx={{ fontSize: '10px', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.2 }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: '13px', fontWeight: 700, color: item.color }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Payment history table */}
                {feeElement.attempts?.length > 0 && (
                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#555', mb: 1.2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Payment History
                    </Typography>
                    <TableContainer sx={{ border: '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#faf6fc' }}>
                            {['#', 'Date', 'Method', 'Transaction Details', 'Remark', 'Amount', 'Action'].map((col) => (
                              <TableCell key={col} sx={{ fontWeight: 700, fontSize: '12px', py: 1, borderRight: '1px solid #f0f0f0', color: '#444', whiteSpace: 'nowrap' }}>
                                {col}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {feeElement.attempts.map((attempt, idx) => (
                            <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                              <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: '#666', py: 1, borderRight: '1px solid #f5f5f5' }}>
                                {attempt.attemptNo}
                              </TableCell>
                              <TableCell sx={{ fontSize: '12px', py: 1, borderRight: '1px solid #f5f5f5', whiteSpace: 'nowrap' }}>
                                {attempt.paidDate || '—'}
                              </TableCell>
                              <TableCell sx={{ py: 1, borderRight: '1px solid #f5f5f5' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                  <Box sx={{ color: ftConfig.color }}>
                                    {PAYMENT_ICONS[attempt.paymentOption?.toUpperCase()] || null}
                                  </Box>
                                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>
                                    {attempt.paymentOption || '—'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontSize: '12px', color: '#555', py: 1, borderRight: '1px solid #f5f5f5' }}>
                                {attempt.paymentOption?.toUpperCase() === 'UPI' && (
                                  <Box>
                                    <Typography sx={{ fontSize: '12px' }}>ID: {attempt.upiid || '—'}</Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#999' }}>Txn: {attempt.transactionID || '—'}</Typography>
                                  </Box>
                                )}
                                {attempt.paymentOption?.toUpperCase() === 'CARD' && (
                                  <Typography sx={{ fontSize: '12px' }}>
                                    {attempt.cardType || '—'} **** {attempt.cardLastFourDigits || '—'}
                                  </Typography>
                                )}
                                {['NETBANKING', 'CHEQUE'].includes(attempt.paymentOption?.toUpperCase()) && (
                                  <Box>
                                    <Typography sx={{ fontSize: '12px' }}>{attempt.bankName || '—'}</Typography>
                                    {attempt.paymentOption?.toUpperCase() === 'CHEQUE' && (
                                      <Typography sx={{ fontSize: '11px', color: '#999' }}>Cheque: {attempt.chequeNo || '—'}</Typography>
                                    )}
                                  </Box>
                                )}
                                {attempt.paymentOption?.toUpperCase() === 'CASH' && (
                                  <Typography sx={{ fontSize: '12px', color: '#888' }}>Cash Payment</Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ py: 1, borderRight: '1px solid #f5f5f5', maxWidth: 120 }}>
                                <Tooltip title={attempt.remark || 'No remark'} placement="top">
                                  <Typography sx={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {attempt.remark || '—'}
                                  </Typography>
                                </Tooltip>
                              </TableCell>
                              <TableCell sx={{ py: 1, borderRight: '1px solid #f5f5f5', whiteSpace: 'nowrap' }}>
                                <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#2E7D32' }}>
                                  ₹{attempt.totalPaidAmount?.toLocaleString() || 0}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ py: 1 }}>
                                {attempt.paymentOption?.toUpperCase() === 'CASH' && attempt.cashDenominations?.length > 0 && (
                                  <Tooltip title="View Cash Denomination">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleViewDenomination(attempt.cashDenominations)}
                                      sx={{ width: 28, height: 28, border: '1px solid #e0e0e0', '&:hover': { bgcolor: '#f5f5f5', borderColor: ftConfig.color } }}
                                    >
                                      <VisibilityIcon sx={{ fontSize: 14, color: ftConfig.color }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            );
          })
        ) : (
          <Box sx={{ textAlign: 'center', py: 8, color: '#ccc' }}>
            <ReceiptLongIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography sx={{ fontSize: '14px', fontStyle: 'italic' }}>No fee elements found</Typography>
          </Box>
        )}
      </Box>

      {/* ── Print Receipt Dialog ── */}
      <Dialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        maxWidth="md"
        fullWidth
        keepMounted
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden', maxHeight: '90vh' } }}
      >
        <Box sx={{ p: 2, overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' }}>
          {/* Printable receipt area */}
          <Box
            ref={printReceiptRef}
            sx={{
              backgroundColor: '#fff',
              borderRadius: '6px',
              px: 3,
              '@media print': { boxShadow: 'none' },
            }}
          >
            {/* Header: logo + school name */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1, gap: 2 }}>
              <img src={websiteSettings?.logo} width="60px" alt="school logo" />
              <Typography sx={{ fontWeight: 700, fontSize: '20px', color: '#000' }}>
                {websiteSettings?.title || ''}
              </Typography>
            </Box>
            <Box sx={{ height: '1px', width: '100%', backgroundColor: '#ccc', mb: 1 }} />

            <Typography sx={{ textAlign: 'center', fontSize: '15px', mb: 1.5, color: '#555' }}>
              Transaction History Receipt — {ftConfig.label}
            </Typography>

            {/* Student info grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', border: '1px solid #e0e0e0', mb: 1.5 }}>
              {[
                { label: 'Student Name', value: transactionData?.name || '—' },
                { label: 'Roll No', value: transactionData?.rollnumber || '—' },
                { label: 'Class & Section', value: `${transactionData?.grade || '—'} ${transactionData?.section || ''}`.trim() },
                { label: 'Academic Year', value: year || '—' },
                { label: 'Print Date', value: dayjs().format('DD/MM/YYYY') },
              ].map((item, i) => (
                <Box key={i} sx={{ borderRight: i !== 4 ? '1px solid #e0e0e0' : 'none', p: 0.7 }}>
                  <Typography sx={{ color: '#888', fontSize: '11px' }}>{item.label}</Typography>
                  <Typography sx={{ color: '#000', fontSize: '13px', fontWeight: 500, mt: 0.4 }}>{item.value}</Typography>
                </Box>
              ))}
            </Box>

            {/* Summary row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid #e0e0e0', mb: 1.5 }}>
              {[
                { label: 'Total Fee', value: `₹${(transactionData?.feesElements?.reduce((s, e) => s + (e.feeAmount || 0), 0) || 0).toLocaleString()}`, color: '#333' },
                { label: 'Amount Paid', value: `₹${(transactionData?.feesElements?.reduce((s, e) => s + (e.paidAmount || 0), 0) || 0).toLocaleString()}`, color: '#2E7D32' },
                { label: 'Pending Amount', value: `₹${(transactionData?.feesElements?.reduce((s, e) => s + (e.pendingAmount || 0), 0) || 0).toLocaleString()}`, color: '#C62828' },
              ].map((item, i) => (
                <Box key={i} sx={{ borderRight: i !== 2 ? '1px solid #e0e0e0' : 'none', p: 0.8, textAlign: 'center', bgcolor: i === 1 ? '#F0FBF1' : i === 2 ? '#FFF5F5' : '#fafafa' }}>
                  <Typography sx={{ color: '#888', fontSize: '11px' }}>{item.label}</Typography>
                  <Typography sx={{ color: item.color, fontSize: '16px', fontWeight: 700, mt: 0.3 }}>{item.value}</Typography>
                </Box>
              ))}
            </Box>

            {/* Fee elements table */}
            <TableContainer sx={{ border: '1px solid #E601542A', mb: 1.5 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['S.No', 'Fee Details', 'Due Date', 'Fee Amount', 'Paid Amount', 'Pending', 'Status'].map((h, i) => (
                      <TableCell key={i} sx={{
                        backgroundColor: h === 'Paid Amount' ? '#00963C1A' : h === 'Pending' ? '#ff00001A' : '#ff00000D',
                        fontWeight: 600, textAlign: 'center', border: '1px solid #E601542A',
                        color: h === 'Paid Amount' ? '#00963C' : h === 'Pending' ? '#C62828' : '#000',
                        fontSize: '12px', py: 0.8,
                      }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionData?.feesElements?.map((el, idx) => {
                    const detailVal =
                      currentFeeType === 'eca' ? `${el.activityName || '—'} (${el.activityCategory || '—'})` :
                        currentFeeType === 'additional' ? (el.feeName || '—') :
                          currentFeeType === 'transport' ? (el.place || '—') :
                            (el.feeDetails || '—');
                    const dueDate = currentFeeType === 'eca' ? (el.activityName || '—') : (el.dueDate || '—');
                    const sc = getStatusConfig(el.status);
                    return (
                      <TableRow key={idx}>
                        <TableCell sx={{ textAlign: 'center', border: '1px solid #E601542A', fontSize: '12px' }}>{idx + 1}</TableCell>
                        <TableCell sx={{ textAlign: 'center', border: '1px solid #E601542A', fontSize: '12px' }}>{detailVal}</TableCell>
                        <TableCell sx={{ textAlign: 'center', border: '1px solid #E601542A', fontSize: '12px' }}>{dueDate}</TableCell>
                        <TableCell sx={{ textAlign: 'center', border: '1px solid #E601542A', fontSize: '12px' }}>₹{(el.feeAmount || 0).toLocaleString()}</TableCell>
                        <TableCell sx={{ textAlign: 'center', border: '1px solid #E601542A', bgcolor: '#00963C0A', color: '#00963C', fontSize: '12px', fontWeight: 700 }}>₹{(el.paidAmount || 0).toLocaleString()}</TableCell>
                        <TableCell sx={{ textAlign: 'center', border: '1px solid #E601542A', bgcolor: '#ff00000A', color: '#C62828', fontSize: '12px', fontWeight: 700 }}>₹{(el.pendingAmount || 0).toLocaleString()}</TableCell>
                        <TableCell sx={{ textAlign: 'center', border: '1px solid #E601542A', fontSize: '11px', color: sc.color, fontWeight: 600 }}>{sc.label}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Payment history details */}
            {transactionData?.feesElements?.map((el, elIdx) => {
              if (!el.attempts?.length) return null;
              const detailVal =
                currentFeeType === 'eca' ? `${el.activityName || '—'}` :
                  currentFeeType === 'additional' ? (el.feeName || '—') :
                    currentFeeType === 'transport' ? (el.place || '—') :
                      (el.feeDetails || `Element ${elIdx + 1}`);
              return (
                <Box key={elIdx} sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#444', mb: 0.6 }}>
                    Payment Attempts — {detailVal}
                  </Typography>
                  <TableContainer sx={{ border: '1px solid #e0e0e0' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8f8f8' }}>
                          {['#', 'Date', 'Method', 'Transaction Info', 'Amount'].map((h) => (
                            <TableCell key={h} sx={{ fontWeight: 700, fontSize: '11px', py: 0.6, border: '1px solid #e8e8e8' }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {el.attempts.map((att, attIdx) => (
                          <TableRow key={attIdx}>
                            <TableCell sx={{ fontSize: '11px', py: 0.5, border: '1px solid #f0f0f0' }}>{att.attemptNo}</TableCell>
                            <TableCell sx={{ fontSize: '11px', py: 0.5, border: '1px solid #f0f0f0', whiteSpace: 'nowrap' }}>{att.paidDate || '—'}</TableCell>
                            <TableCell sx={{ fontSize: '11px', py: 0.5, border: '1px solid #f0f0f0', fontWeight: 600 }}>{att.paymentOption || '—'}</TableCell>
                            <TableCell sx={{ fontSize: '11px', py: 0.5, border: '1px solid #f0f0f0', color: '#666' }}>
                              {att.paymentOption?.toUpperCase() === 'UPI' && `UPI: ${att.upiid || '—'} | Txn: ${att.transactionID || '—'}`}
                              {att.paymentOption?.toUpperCase() === 'CARD' && `${att.cardType || '—'} **** ${att.cardLastFourDigits || '—'}`}
                              {['NETBANKING', 'CHEQUE'].includes(att.paymentOption?.toUpperCase()) && `${att.bankName || '—'}${att.chequeNo ? ` | Cheque: ${att.chequeNo}` : ''}`}
                              {att.paymentOption?.toUpperCase() === 'CASH' && 'Cash Payment'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '12px', py: 0.5, border: '1px solid #f0f0f0', fontWeight: 700, color: '#2E7D32' }}>₹{(att.totalPaidAmount || 0).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              );
            })}

            {/* Total paid + words */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ border: '1px solid #00963C', py: 1, px: 3, color: '#00963C', fontWeight: 700, backgroundColor: '#00963C0A', borderRadius: '5px', fontSize: '14px' }}>
                Total Paid: <span style={{ marginLeft: '16px', fontSize: '16px' }}>
                  ₹{(transactionData?.feesElements?.reduce((s, e) => s + (e.paidAmount || 0), 0) || 0).toLocaleString()}
                </span>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: '13px', color: '#000', mb: 0.4 }}>
                  <b>Total paid in words:</b> {convertToWords(transactionData?.feesElements?.reduce((s, e) => s + (e.paidAmount || 0), 0) || 0)} Rupees Only
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#666' }}>
                  <b>Print Date:</b> {dayjs().format('DD MMMM YYYY, hh:mm A')}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ border: '1px solid #000', width: '160px', height: '32px', borderRadius: '4px', mx: 'auto' }} />
                <Typography sx={{ fontSize: '12px', mt: 0.8 }}>School Staff Signature</Typography>
              </Box>
            </Box>
          </Box>

          {/* Dialog actions */}
          <DialogActions sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1.5 }}>
            <Button
              onClick={() => setPrintDialogOpen(false)}
              variant="outlined"
              sx={{ borderColor: '#000', color: '#000', textTransform: 'none', borderRadius: '30px', width: '100px', height: '33px', fontWeight: 600, '&:hover': { borderColor: '#333', bgcolor: '#f5f5f5' } }}
            >
              Close
            </Button>
            <Button
              onClick={handlePrint}
              variant="contained"
              startIcon={<PrintIcon />}
              sx={{ backgroundColor: websiteSettings?.mainColor || '#1976D2', textTransform: 'none', color: websiteSettings?.textColor || '#fff', width: '120px', height: '33px', borderRadius: '30px', fontWeight: 600, '&:hover': { backgroundColor: websiteSettings?.darkColor || '#1565C0' } }}
            >
              Print
            </Button>
            <Button
              onClick={handleDownload}
              variant="contained"
              startIcon={<FileDownloadIcon />}
              sx={{ backgroundColor: websiteSettings?.mainColor || '#1976D2', textTransform: 'none', color: websiteSettings?.textColor || '#fff', width: '140px', height: '33px', borderRadius: '30px', fontWeight: 600, '&:hover': { backgroundColor: websiteSettings?.darkColor || '#1565C0' } }}
            >
              Download
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── Cash Denomination Dialog ── */}
      <Dialog
        open={denominationDialogOpen}
        onClose={() => setDenominationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ bgcolor: '#f2f2f2', px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #ddd' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalAtmIcon sx={{ fontSize: 18, color: '#388E3C' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '16px' }}>Cash Denomination Breakdown</Typography>
          </Box>
          <IconButton size="small" onClick={() => setDenominationDialogOpen(false)}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 2.5 }}>
          {selectedDenomination && (
            <Grid container spacing={2}>
              {/* Inwards */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ border: '1px solid #e8e8e8', borderRadius: '10px', overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: '#F0FBF1', px: 2, py: 1.5, borderBottom: '1px solid #e8e8e8' }}>
                    <Typography sx={{ fontSize: '12px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.3 }}>
                      Cash Received (Inwards)
                    </Typography>
                    <Typography sx={{ fontSize: '22px', fontWeight: 800, color: '#2E7D32' }}>
                      ₹{(selectedDenomination.inWardsTotal || selectedDenomination.totalInwards || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    {renderDenominationTable(selectedDenomination, 'inwards')}
                  </Box>
                </Box>
              </Grid>

              {/* Outwards */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ border: '1px solid #e8e8e8', borderRadius: '10px', overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: '#FFF5F5', px: 2, py: 1.5, borderBottom: '1px solid #e8e8e8' }}>
                    <Typography sx={{ fontSize: '12px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.3 }}>
                      Change Returned (Outwards)
                    </Typography>
                    <Typography sx={{ fontSize: '22px', fontWeight: 800, color: '#C62828' }}>
                      ₹{(selectedDenomination.outWardsTotal || selectedDenomination.outWardsdenomination || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    {renderDenominationTable(selectedDenomination, 'outwards')}
                  </Box>
                </Box>
              </Grid>

              {/* Net */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ border: '1px solid #e8e8e8', borderRadius: '10px', p: 2, textAlign: 'center', bgcolor: '#fafafa' }}>
                  <Typography sx={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.5 }}>
                    Net Amount Collected
                  </Typography>
                  <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#333' }}>
                    ₹{(selectedDenomination.totalInwards || selectedDenomination.inWardsTotal || 0).toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#aaa', mt: 0.5 }}>
                    Created on: {selectedDenomination.createdOn || '—'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2, pt: 1, borderTop: '1px solid #e8e8e8' }}>
          <Button
            onClick={() => setDenominationDialogOpen(false)}
            variant="contained"
            sx={{ textTransform: 'none', bgcolor: '#333', borderRadius: '20px', px: 3, fontWeight: 600, '&:hover': { bgcolor: '#555' } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionHistory;
