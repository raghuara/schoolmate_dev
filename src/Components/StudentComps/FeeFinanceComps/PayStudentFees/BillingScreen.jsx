import { Box } from '@mui/system'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SnackBar from '../../../SnackBar'
import { Accordion, AccordionDetails, AccordionSummary, Alert, Avatar, Button, Card, CardContent, Checkbox, Chip, CircularProgress, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, Grid, IconButton, InputAdornment, LinearProgress, Paper, Radio, Step, StepLabel, Stepper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, ThemeProvider, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import { selectAcademicYear } from '../../../../Redux/Slices/academicYearSlice';
import { findSubMenuPermissions } from '../../../../Redux/Slices/AuthSlice';
import avatarImage from '../../../../Images/PagesImage/avatar.png';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import html2pdf from 'html2pdf.js';
import { useReactToPrint } from 'react-to-print';
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import axios from 'axios';
import { DASH, RADIUS } from "../../../DashBoardComps/dashboardTheme";
import { FeeTableSkeleton, StudentCardSkeleton, FeeBandSkeleton } from "./BillingSkeletons";
import { findStudentEcaFeesBilling, findStudents, findStudentSchoolFeesBilling, findStudentAdditionalFeesBilling, postPaymentMethod, postEcaPaymentMethod, postAdditionalPaymentMethod, findStudentTransportFeesBilling, postTransportPaymentMethod, getBillingUser } from '../../../../Api/Api';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentsIcon from '@mui/icons-material/Payments';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PrintIcon from '@mui/icons-material/Print';
import HistoryIcon from '@mui/icons-material/History';
import LockIcon from '@mui/icons-material/Lock';
const notesList = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
const MAX_AMOUNT = 99999999;

// Number to words converter for Indian numbering system
const convertNumberToWords = (num) => {
  if (num === 0) return "Zero";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

  const convertHundreds = (n) => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convertHundreds(n % 100) : "");
  };

  if (num < 100) {
    return convertHundreds(num);
  }

  if (num < 1000) {
    return convertHundreds(num);
  }

  if (num < 100000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    return convertHundreds(thousands) + " Thousand" + (remainder ? " " + convertHundreds(remainder) : "");
  }

  if (num < 10000000) {
    const lakhs = Math.floor(num / 100000);
    const remainder = num % 100000;
    return convertHundreds(lakhs) + " Lakh" + (remainder ? " " + convertNumberToWords(remainder) : "");
  }

  const crores = Math.floor(num / 10000000);
  const remainder = num % 10000000;
  return convertHundreds(crores) + " Crore" + (remainder ? " " + convertNumberToWords(remainder) : "");
};


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

  // Academic year is set globally in the dashboard header (Redux)
  const selectedYear = useSelector(selectAcademicYear);
  // Granting a concession is a separate right from taking a payment.
  const auth = useSelector((state) => state.auth);
  const rbacReady = (auth.permissions?.mainMenus || []).length > 0;
  const canConcession = !rbacReady
    || findSubMenuPermissions(auth.permissions, "feeandfinance", "billingscreen")?.allowconcession === "Y";

  const [counts, setCounts] = useState(
    notesList.reduce((acc, n) => ({ ...acc, [n]: 0 }), {})
  );

  const [changeCounts, setChangeCounts] = useState(
    notesList.reduce((acc, n) => ({ ...acc, [n]: 0 }), {})
  );

  const printRef = useRef();
  const componentRef = useRef(null);
  const printReceiptRef = useRef(null);
  const [openPaymentPopup, setOpenPaymentPopup] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [openPrintReceiptDialog, setOpenPrintReceiptDialog] = useState(false);

  const hasUnsavedData = () => {
    if (paymentSuccess) return false;

    const hasFormData =
      paymentFormData.upiId ||
      paymentFormData.transactionId ||
      paymentFormData.bankName ||
      paymentFormData.chequeNo ||
      paymentFormData.cardType ||
      paymentFormData.cardLast4 ||
      paymentFormData.remarks;

    const hasCashData = notesList.some(note => counts[note] > 0);
    const hasChangeData = notesList.some(note => changeCounts[note] > 0);

    return hasFormData || hasCashData || hasChangeData;
  };

  const handleCloseAttempt = () => {
    if (paymentProcessing) {
      setMessage('Please wait while payment is being processed');
      setStatus(false);
      setColor(false);
      setOpen(true);
      return;
    }

    if (hasUnsavedData()) {
      setShowCloseConfirmation(true);
    } else {
      handleForceClose();
    }
  };

  const handleForceClose = () => {
    setOpenPaymentPopup(false);
    setShowCloseConfirmation(false);
    setPaymentStep(0);
    setSelectedPaymentMethod('');
    setPaymentProcessing(false);
    setPaymentSuccess(false);
    setCompletedPaymentAmount(0);
    setCompletedPaymentFees([]);
    setCompletedBillID('');
    setPaymentFormData({
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
    setCounts(notesList.reduce((acc, n) => ({ ...acc, [n]: 0 }), {}));
    setChangeCounts(notesList.reduce((acc, n) => ({ ...acc, [n]: 0 }), {}));
    if (upiProofPreview) URL.revokeObjectURL(upiProofPreview);
    setUpiProofFile(null);
    setUpiProofPreview('');
  };

  const handleClosePaymentPopup = () => {
    handleForceClose();
  };

  const handleCancelClose = () => {
    setShowCloseConfirmation(false);
  };

  const handleConfirmClose = () => {
    handleForceClose();
  };
  const [openPaymentAccordion, setOpenPaymentAccordion] = useState("");

  const [openHistoryPopup, setOpenHistoryPopup] = useState(false);

  const today = dayjs().format('DD-MM-YYYY');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [formattedDate, setFormattedDate] = useState(today);

  const [openCal, setOpenCal] = useState(false);
  const handleOpenCal = () => setOpenCal(true);
  const handleCloseCal = () => setOpenCal(false);
  const location = useLocation();
  const { rollNumber, activeTab } = location.state || {};
  const [details, setDetails] = useState([]);
  const [schoolFee, setSchoolFee] = useState([]);

  const [ecaDetails, setEcaDetails] = useState([]);
  const [ecaFeeElements, setEcaFeeElements] = useState([]);

  const [transportDetails, setTransportDetails] = useState([]);
  const [transportFeeElements, setTransportFeeElements] = useState([]);

  const [additionalDetails, setAdditionalDetails] = useState([]);
  const [additionalFeeElements, setAdditionalFeeElements] = useState([]);

  const [studentInfo, setStudentInfo] = useState(null);

  const [paymentStep, setPaymentStep] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [completedPaymentAmount, setCompletedPaymentAmount] = useState(0);
  const [completedPaymentFees, setCompletedPaymentFees] = useState([]);
  const [completedBillID, setCompletedBillID] = useState('');
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

  // UPI payment proof (screenshot) — sent only with the school-fee endpoint
  const [upiProofFile, setUpiProofFile] = useState(null);
  const [upiProofPreview, setUpiProofPreview] = useState('');

  const handleUpiProofChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload a valid image file');
      setStatus(false); setColor(false); setOpen(true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be under 5MB');
      setStatus(false); setColor(false); setOpen(true);
      return;
    }
    if (upiProofPreview) URL.revokeObjectURL(upiProofPreview);
    setUpiProofFile(file);
    setUpiProofPreview(URL.createObjectURL(file));
  };

  const handleRemoveUpiProof = () => {
    if (upiProofPreview) URL.revokeObjectURL(upiProofPreview);
    setUpiProofFile(null);
    setUpiProofPreview('');
  };

  const feeTabs = [
    "School Fee",
    "Transport Fee",
    "ECA Fee",
    "Additional Fee",
  ];


  const paymentSteps = ['Select Method', 'Enter Details', 'Confirm & Pay'];

  const paymentMethodOptions = [
    { id: 'cash', name: 'Cash Payment', icon: <PaymentsIcon />, description: 'Pay with cash at counter', color: DASH.green },
    { id: 'upi', name: 'UPI Payment', icon: <AccountBalanceWalletIcon />, description: 'GPay, PhonePe, Paytm', color: '#8b5cf6' },
    { id: 'netbanking', name: 'Net Banking', icon: <AccountBalanceIcon />, description: 'NEFT / RTGS Transfer', color: DASH.blue },
    { id: 'cheque', name: 'Cheque Deposit', icon: <ReceiptLongIcon />, description: 'Pay via bank cheque', color: DASH.amber },
    { id: 'card', name: 'Card Payment', icon: <CreditCardIcon />, description: 'Credit / Debit Card', color: DASH.red },
  ];


  const handleToPayChange = (index, value) => {
    const numValue = parseFloat(value) || 0;
    const currentFeeData = getCurrentFeeData();
    const pendingAmount = currentFeeData[index]?.pendingAmount || 0;

    if (numValue > pendingAmount) {
      setMessage(`Amount cannot exceed pending amount of ₹${pendingAmount}`);
      setStatus(false);
      setColor(false);
      setOpen(true);
      return;
    }

    if (numValue < 0) {
      return;
    }

    setToPayAmounts(prev => ({
      ...prev,
      [index]: numValue
    }));
  };

  const handleOpenPaymentPopup = () => {
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

  // A fee can be paid only when it has a pending amount AND no payment request is
  // awaiting approval. "Pending" approval blocks re-payment; "Rejected"/"Approved"/none
  // allow paying whatever is still pending.
  const isRowPayable = (row) => {
    const appr = String(row?.paymentApprovalStatus || '').toLowerCase();
    if (appr === 'pending') return false;
    return (Number(row?.pendingAmount) || 0) > 0;
  };

  const handleSelect = (index) => {
    const currentFeeData = getCurrentFeeData();
    if (!isRowPayable(currentFeeData[index])) return;
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleOpenPopup = (row) => {
    setSelectedFee(row);
    setOpenPreview(true);
  };


  const handleOpenPrintReceipt = () => {
    console.log('Opening print receipt with:');
    console.log('completedPaymentAmount:', completedPaymentAmount);
    console.log('completedPaymentFees:', completedPaymentFees);
    setOpenPrintReceiptDialog(true);
  };

  const handleClosePrintReceipt = () => {
    setOpenPrintReceiptDialog(false);
  };

  const handlePrintReceipt = useReactToPrint({
    content: () => printReceiptRef.current,
    documentTitle: `Receipt_${details?.name || 'Student'}_${dayjs().format('DD-MM-YYYY')}`,
  });

  const handleDownloadReceipt = () => {
    const element = printReceiptRef.current;
    const opt = {
      margin: 0.5,
      filename: `Receipt_${details?.name || 'Student'}_${dayjs().format('DD-MM-YYYY')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const getSubtotal = (note) => note * counts[note];
  const totalCash = notesList.reduce((sum, note) => sum + getSubtotal(note), 0);

  const getChangeSubtotal = (note) => note * changeCounts[note];
  const totalChange = notesList.reduce((sum, note) => sum + getChangeSubtotal(note), 0);

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

  const handleChangeCount = (note, value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return;
    setChangeCounts((prev) => ({ ...prev, [note]: num }));
  };

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPaymentMethod(methodId);
  };

  const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') return '';
    return input
      .trim()
      .replace(/[<>]/g, '')
      .substring(0, 200);
  };

  const validateUPIID = (upiId) => {
    if (!upiId || !upiId.trim()) return { valid: false, message: 'UPI ID is required' };
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    if (!upiRegex.test(upiId.trim())) {
      return { valid: false, message: 'Invalid UPI ID format (e.g., user@bank)' };
    }
    return { valid: true };
  };

  const validateTransactionID = (txnId, paymentMethod) => {
    if (!txnId || !txnId.trim()) return { valid: false, message: 'Transaction ID is required' };
    const sanitized = sanitizeInput(txnId);
    if (sanitized.length < 4) {
      return { valid: false, message: 'Transaction ID must be at least 4 characters' };
    }
    return { valid: true };
  };

  const validateBankName = (bankName) => {
    if (!bankName || !bankName.trim()) return { valid: false, message: 'Bank name is required' };
    const sanitized = sanitizeInput(bankName);
    if (sanitized.length < 3) {
      return { valid: false, message: 'Bank name must be at least 3 characters' };
    }
    return { valid: true };
  };

  const validateChequeNo = (chequeNo) => {
    if (!chequeNo || !chequeNo.trim()) return { valid: false, message: 'Cheque number is required' };
    const sanitized = sanitizeInput(chequeNo);
    if (!/^\d{6,}$/.test(sanitized)) {
      return { valid: false, message: 'Cheque number must be at least 6 digits' };
    }
    return { valid: true };
  };

  const validateCardLast4 = (cardLast4) => {
    if (!cardLast4 || !cardLast4.trim()) return { valid: false, message: 'Last 4 digits are required' };
    if (!/^\d{4}$/.test(cardLast4.trim())) {
      return { valid: false, message: 'Must be exactly 4 digits' };
    }
    return { valid: true };
  };

  const validateCardType = (cardType) => {
    if (!cardType || !cardType.trim()) return { valid: false, message: 'Card type is required' };
    const validTypes = ['visa', 'mastercard', 'rupay', 'amex'];
    if (!validTypes.includes(cardType.toLowerCase())) {
      return { valid: false, message: 'Invalid card type' };
    }
    return { valid: true };
  };

  const validateCashPayment = () => {
    const amountToPay = getTotalPending();
    if (amountToPay <= 0) {
      return { valid: false, message: 'No amount to pay' };
    }
    if (totalCash <= 0) {
      return { valid: false, message: 'Please enter cash received' };
    }
    if (totalCash < amountToPay) {
      const shortAmount = amountToPay - totalCash;
      return { valid: false, message: `Short amount: ₹${shortAmount.toLocaleString()}. Please collect sufficient cash.` };
    }

    const changeAmount = totalCash - amountToPay;
    if (changeAmount > 0) {
      if (totalChange <= 0) {
        return { valid: false, message: `Change of ₹${changeAmount.toLocaleString()} needs to be returned. Please enter change denomination breakdown.` };
      }

      if (totalChange !== changeAmount) {
        const difference = Math.abs(totalChange - changeAmount);
        return {
          valid: false,
          message: `Change denomination mismatch! Expected: ₹${changeAmount.toLocaleString()}, Entered: ₹${totalChange.toLocaleString()}. ${totalChange < changeAmount ? 'Add' : 'Reduce'} ₹${difference.toLocaleString()}.`
        };
      }
    }

    return { valid: true };
  };

  const validatePaymentForm = () => {
    switch (selectedPaymentMethod) {
      case 'upi': {
        const upiValidation = validateUPIID(paymentFormData.upiId);
        if (!upiValidation.valid) return upiValidation;

        const txnValidation = validateTransactionID(paymentFormData.transactionId, 'UPI');
        if (!txnValidation.valid) return txnValidation;

        if (!upiProofFile) {
          return { valid: false, message: 'Please upload the UPI payment screenshot to continue' };
        }

        return { valid: true };
      }

      case 'netbanking': {
        const txnValidation = validateTransactionID(paymentFormData.transactionId, 'Net Banking');
        if (!txnValidation.valid) return txnValidation;

        const bankValidation = validateBankName(paymentFormData.bankName);
        if (!bankValidation.valid) return bankValidation;

        return { valid: true };
      }

      case 'cheque': {
        const chequeValidation = validateChequeNo(paymentFormData.chequeNo);
        if (!chequeValidation.valid) return chequeValidation;

        const bankValidation = validateBankName(paymentFormData.bankName);
        if (!bankValidation.valid) return bankValidation;

        if (!paymentFormData.chequeDate) {
          return { valid: false, message: 'Cheque date is required' };
        }

        return { valid: true };
      }

      case 'card': {
        const cardTypeValidation = validateCardType(paymentFormData.cardType);
        if (!cardTypeValidation.valid) return cardTypeValidation;

        const cardLast4Validation = validateCardLast4(paymentFormData.cardLast4);
        if (!cardLast4Validation.valid) return cardLast4Validation;

        const txnValidation = validateTransactionID(paymentFormData.transactionId, 'Card');
        if (!txnValidation.valid) return txnValidation;

        return { valid: true };
      }

      case 'cash': {
        return validateCashPayment();
      }

      default:
        return { valid: false, message: 'Please select a payment method' };
    }
  };

  const handlePaymentNext = () => {
    if (paymentStep === 0 && !selectedPaymentMethod) {
      setMessage('Please select a payment method');
      setStatus(false);
      setColor(false);
      setOpen(true);
      return;
    }

    if (paymentStep === 1) {
      const validation = validatePaymentForm();
      if (!validation.valid) {
        setMessage(validation.message);
        setStatus(false);
        setColor(false);
        setOpen(true);
        return;
      }
    }

    if (paymentStep < 2) setPaymentStep(paymentStep + 1);
  };

  const handlePaymentBack = () => {
    if (paymentStep > 0) setPaymentStep(paymentStep - 1);
  };

  const handlePaymentConfirm = async () => {
    if (paymentProcessing) {
      return;
    }

    if (!selectedRows || selectedRows.length === 0) {
      setMessage('No fees selected for payment');
      setStatus(false);
      setColor(false);
      setOpen(true);
      return;
    }

    const totalAmount = getTotalPending();
    if (totalAmount <= 0) {
      setMessage('Payment amount must be greater than zero');
      setStatus(false);
      setColor(false);
      setOpen(true);
      return;
    }

    if (totalAmount > MAX_AMOUNT) {
      setMessage(`Payment amount cannot exceed ₹${MAX_AMOUNT.toLocaleString()}`);
      setStatus(false);
      setColor(false);
      setOpen(true);
      return;
    }

    if (!selectedPaymentMethod) {
      setMessage('Please select a payment method');
      setStatus(false);
      setColor(false);
      setOpen(true);
      return;
    }

    const validation = validatePaymentForm();
    if (!validation.valid) {
      setMessage(validation.message);
      setStatus(false);
      setColor(false);
      setOpen(true);
      return;
    }

    const currentFeeData = getCurrentFeeData();
    for (const index of selectedRows) {
      const paidAmount = toPayAmounts[index] || 0;
      const fee = currentFeeData[index];

      if (paidAmount <= 0) {
        setMessage(`Invalid amount for ${fee?.feeName || fee?.feeDetails || 'fee item'}`);
        setStatus(false);
        setColor(false);
        setOpen(true);
        return;
      }

      if (paidAmount > fee.pendingAmount) {
        setMessage(`Amount for ${fee?.feeName || fee?.feeDetails || 'fee item'} exceeds pending amount`);
        setStatus(false);
        setColor(false);
        setOpen(true);
        return;
      }
    }

    setPaymentProcessing(true);

    try {
      console.log('Payment processing - totalAmount:', totalAmount);
      console.log('Payment processing - selectedRows:', selectedRows);
      console.log('Payment processing - toPayAmounts:', toPayAmounts);

      setCompletedPaymentAmount(totalAmount);

      // Save the fees being paid for the receipt
      const paidFees = selectedRows.map((index) => {
        const fee = currentFeeData[index];
        const paidAmount = toPayAmounts[index] || 0;
        console.log('Saving fee for receipt:', {
          feeName: fee.feeDetails || fee.place || fee.feeName || fee.activityName,
          feeAmount: fee.feeAmount || fee.amount,
          paidAmount: paidAmount
        });
        return {
          ...fee,
          paidAmount: paidAmount,
          actualPaidAmount: paidAmount // Backup field
        };
      });

      console.log('completedPaymentFees set to:', paidFees);
      setCompletedPaymentFees(paidFees);

      const payFeesElements = selectedRows.map((index) => {
        const fee = currentFeeData[index];
        const paidAmount = toPayAmounts[index] || 0;

        const dateFormat = (value === 3) ? 'YYYY-MM-DD' : 'DD-MM-YYYY';

        const baseElement = {
          feesElementID: fee.feesElementID || fee.id || index + 1,
          paidDate: dayjs().format(dateFormat),
          paidAmount: Math.round(paidAmount * 100) / 100
        };

        switch (value) {
          case 0:
            return {
              primeSchoolFeesID: fee.primeSchoolFeesID || fee.id || 1,
              ...baseElement
            };
          case 1:
            // Transport fees only use feesElementID, paidDate, and paidAmount
            return baseElement;
          case 2:
            return {
              ecaFeesID: fee.ecaFeesID || fee.id || 1,
              ...baseElement
            };
          case 3:
            return {
              additionalFeesID: fee.additionalFeesID || fee.id || 1,
              ...baseElement
            };
          default:
            return {
              primeSchoolFeesID: fee.primeSchoolFeesID || fee.id || 1,
              ...baseElement
            };
        }
      });

      const totalPaidAmount = Math.round(totalAmount * 100) / 100;

      // All fee endpoints expect camelCase field names
      const useCamelCaseKeys = true;

      const paymentMethods = {
        totalPaidAmount: totalPaidAmount,
        paymentOption: selectedPaymentMethod.toUpperCase(),
        paidFrom: 'website',
        paidDate: dayjs().format('YYYY-MM-DD')
      };

      // Add remark field with correct casing based on fee type
      if (useCamelCaseKeys) {
        paymentMethods.remark = sanitizeInput(paymentFormData.remarks || `Payment via ${paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.name}`);
      } else {
        paymentMethods.Remark = sanitizeInput(paymentFormData.remarks || `Payment via ${paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.name}`);
      }

      switch (selectedPaymentMethod) {
        case 'upi':
          if (useCamelCaseKeys) {
            paymentMethods.upiid = sanitizeInput(paymentFormData.upiId || '');
            paymentMethods.transactionID = sanitizeInput(paymentFormData.transactionId || '');
          } else {
            paymentMethods.UPIID = sanitizeInput(paymentFormData.upiId || '');
            paymentMethods.TransactionID = sanitizeInput(paymentFormData.transactionId || '');
          }
          break;

        case 'netbanking':
          if (useCamelCaseKeys) {
            paymentMethods.transactionID = sanitizeInput(paymentFormData.transactionId || '');
            paymentMethods.bankName = sanitizeInput(paymentFormData.bankName || '');
          } else {
            paymentMethods.TransactionID = sanitizeInput(paymentFormData.transactionId || '');
            paymentMethods.BankName = sanitizeInput(paymentFormData.bankName || '');
          }
          break;

        case 'cheque':
          if (useCamelCaseKeys) {
            paymentMethods.transactionID = sanitizeInput(paymentFormData.transactionId || '');
            paymentMethods.chequeNo = sanitizeInput(paymentFormData.chequeNo || '');
            paymentMethods.bankName = sanitizeInput(paymentFormData.bankName || '');
          } else {
            paymentMethods.TransactionID = sanitizeInput(paymentFormData.transactionId || '');
            paymentMethods.ChequeNo = sanitizeInput(paymentFormData.chequeNo || '');
            paymentMethods.BankName = sanitizeInput(paymentFormData.bankName || '');
          }
          paymentMethods.ChequeDate = paymentFormData.chequeDate ? dayjs(paymentFormData.chequeDate).format('DD-MM-YYYY') : dayjs().format('DD-MM-YYYY');
          break;

        case 'card':
          if (useCamelCaseKeys) {
            paymentMethods.transactionID = sanitizeInput(paymentFormData.transactionId || '');
            paymentMethods.cardType = sanitizeInput(paymentFormData.cardType || '');
            paymentMethods.cardLastFourDigits = paymentFormData.cardLast4?.replace(/\D/g, '').substring(0, 4) || '';
          } else {
            paymentMethods.TransactionID = sanitizeInput(paymentFormData.transactionId || '');
            paymentMethods.CardType = sanitizeInput(paymentFormData.cardType || '');
            paymentMethods.CardLastFourDigits = paymentFormData.cardLast4?.replace(/\D/g, '').substring(0, 4) || '';
          }
          break;

        case 'cash':
          if (totalCash > 0) {
            paymentMethods.CashReceived = Math.round(totalCash * 100) / 100;
            const balance = totalCash - totalPaidAmount;
            if (balance > 0) {
              paymentMethods.ChangeReturned = Math.round(balance * 100) / 100;
            }
          }
          paymentMethods.inwardsDinomination = convertToInwardsDenomination();
          paymentMethods.outwardsDinomination = convertToOutwardsDenomination();
          break;

        default:
          throw new Error('Invalid payment method');
      }

      const payload = {
        payFeesElements,
        paymentMethods
      };

      let apiEndpoint;
      switch (value) {
        case 0:
          apiEndpoint = postPaymentMethod;
          break;
        case 1:
          apiEndpoint = postTransportPaymentMethod;
          break;
        case 2:
          apiEndpoint = postEcaPaymentMethod;
          break;
        case 3:
          apiEndpoint = postAdditionalPaymentMethod;
          break;
        default:
          apiEndpoint = postPaymentMethod;
      }

      const requestConfig = {
        params: {
          rollNumber: rollNumber,
          year: selectedYear
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // All fee endpoints expect multipart form-data:
      //   request      → JSON string of { payFeesElements, paymentMethods }
      //   UPIProofFile → uploaded screenshot (only when paying via UPI)
      const formData = new FormData();
      formData.append('request', JSON.stringify(payload));
      if (selectedPaymentMethod === 'upi' && upiProofFile) {
        formData.append('upiProofFile', upiProofFile);
      }
      const requestBody = formData;
      // Content-Type (with multipart boundary) is set automatically by the browser

      const res = await axios.post(apiEndpoint, requestBody, requestConfig);

      if (res.data.success || res.status === 200) {
        setPaymentProcessing(false);
        setPaymentSuccess(true);
        setCompletedBillID(res.data.billID || res.data.data?.billID || '');

        switch (value) {
          case 0:
            await fetchStatusDetails();
            break;
          case 1:
            await fetchTransportDetails();
            break;
          case 2:
            await fetchEcaDetails();
            break;
          case 3:
            await fetchAdditionalDetails();
            break;
          default:
            await fetchStatusDetails();
        }

        setSelectedRows([]);
        setMessage('Payment completed successfully!');
        setStatus(true);
        setColor(true);
        setOpen(true);
      } else {
        throw new Error(res.data.message || 'Payment failed');
      }
    } catch (error) {
      console.error("Error while processing payment:", error);
      setPaymentProcessing(false);
      setMessage(error.response?.data?.message || error.message || 'Payment failed. Please try again.');
      setStatus(false);
      setColor(false);
      setOpen(true);
    }
  };

  const handlePaymentFormChange = (field, value) => {
    let sanitizedValue = value;

    if (typeof value === 'string') {
      if (field === 'upiId' || field === 'transactionId' || field === 'bankName' ||
        field === 'chequeNo' || field === 'cardType' || field === 'remarks') {
        sanitizedValue = sanitizeInput(value);
      }

      if (field === 'cardLast4') {
        sanitizedValue = value.replace(/\D/g, '').substring(0, 4);
      }
    }

    setPaymentFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  const getTotalPending = () => {
    return selectedRows.reduce((sum, idx) => sum + (toPayAmounts[idx] || 0), 0);
  };

  const calculateChangeDenomination = (changeAmount) => {
    const denominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
    const result = {};
    let remaining = changeAmount;

    denominations.forEach(denom => {
      if (remaining >= denom) {
        const count = Math.floor(remaining / denom);
        result[denom] = count;
        remaining = remaining % denom;
      }
    });

    return result;
  };

  const convertToInwardsDenomination = () => {
    return {
      inWards2000: counts[2000] || 0,
      inWards500: counts[500] || 0,
      inWards200: counts[200] || 0,
      inWards100: counts[100] || 0,
      inWards50: counts[50] || 0,
      inWards20: counts[20] || 0,
      inWards10: counts[10] || 0,
      inWards5: counts[5] || 0,
      inWards2: counts[2] || 0,
      inWards1: counts[1] || 0
    };
  };

  const convertToOutwardsDenomination = () => {
    return {
      outWards2000: changeCounts[2000] || 0,
      outWards500: changeCounts[500] || 0,
      outWards200: changeCounts[200] || 0,
      outWards100: changeCounts[100] || 0,
      outWards50: changeCounts[50] || 0,
      outWards20: changeCounts[20] || 0,
      outWards10: changeCounts[10] || 0,
      outWards5: changeCounts[5] || 0,
      outWards2: changeCounts[2] || 0,
      outWards1: changeCounts[1] || 0
    };
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return DASH.green;
      case 'Partially Paid': return DASH.amber;
      case 'Unpaid': return DASH.red;
      default: return DASH.muted;
    }
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;

    const [day, month, year] = dueDate.split('/');
    const due = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getDueDateInfo = (dueDate, paymentStatus, pendingAmount = 0) => {
    const isPaid = paymentStatus?.toLowerCase() === 'paid' || pendingAmount === 0;

    if (isPaid) {
      if (!dueDate || dueDate === '' || dueDate === '-') {
        return {
          text: 'No Due Date',
          color: DASH.faint,
          bgColor: DASH.lineSoft,
          icon: '📅',
          status: 'paid'
        };
      }
      return {
        text: dueDate,
        color: DASH.muted,
        bgColor: DASH.lineSoft,
        icon: '📅',
        status: 'paid'
      };
    }

    if (!dueDate || dueDate === '' || dueDate === '-') {
      return {
        text: 'No Due Date',
        color: DASH.faint,
        bgColor: DASH.lineSoft,
        icon: '📅',
        status: 'none'
      };
    }

    const daysRemaining = getDaysRemaining(dueDate);

    if (daysRemaining === null) {
      return {
        text: 'Invalid Date',
        color: DASH.faint,
        bgColor: DASH.lineSoft,
        icon: '❓',
        status: 'invalid'
      };
    }

    if (daysRemaining < 0) {
      return {
        text: `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) > 1 ? 's' : ''}`,
        color: '#dc2626',
        bgColor: '#fee2e2',
        icon: '⚠️',
        status: 'overdue'
      };
    } else if (daysRemaining === 0) {
      return {
        text: 'Due Today',
        color: '#ea580c',
        bgColor: '#ffedd5',
        icon: '🔔',
        status: 'today'
      };
    } else if (daysRemaining <= 3) {
      return {
        text: `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left`,
        color: DASH.amber,
        bgColor: '#fef3c7',
        icon: '⏰',
        status: 'soon'
      };
    } else if (daysRemaining <= 7) {
      return {
        text: `${daysRemaining} days left`,
        color: DASH.blue,
        bgColor: '#dbeafe',
        icon: '📆',
        status: 'upcoming'
      };
    } else {
      return {
        text: dueDate,
        color: DASH.green,
        bgColor: '#d1fae5',
        icon: '✓',
        status: 'safe'
      };
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
    setSelectedRows([]);
    setToPayAmounts({});
  };

  // Restore active tab when navigating back from transaction history
  useEffect(() => {
    if (activeTab !== undefined && activeTab !== null) {
      setValue(activeTab);
    }
  }, [activeTab]);

  const getCurrentFeeData = () => {
    let data;
    switch (value) {
      case 0:
        data = schoolFee;
        break;
      case 1:
        data = transportFeeElements;
        break;
      case 2:
        data = ecaFeeElements;
        break;
      case 3:
        data = additionalFeeElements;
        break;
      default:
        data = [];
    }
    return (data || []).filter(fee => (fee.feeAmount || 0) !== 0);
  };

  const getCurrentDetails = () => {
    switch (value) {
      case 0:
        return details;
      case 1:
        return transportDetails;
      case 2:
        return ecaDetails;
      case 3:
        return additionalDetails;
      default:
        return {};
    }
  };

  const getNoDataMessage = () => {
    switch (value) {
      case 0:
        return "No School Fees Assigned";
      case 1:
        return "No Transport Fees Assigned";
      case 2:
        return "No ECA Fees Assigned";
      case 3:
        return "No Additional Fees Assigned";
      default:
        return "No Fees Found";
    }
  };

  const getTotalFeeAmount = () => {
    const currentFeeData = getCurrentFeeData();
    if (!currentFeeData || currentFeeData.length === 0) return 0;

    return currentFeeData.reduce((total, fee) => {
      return total + (fee.feeAmount || 0);
    }, 0);
  };

  useEffect(() => {
    const currentFeeData = getCurrentFeeData();
    if (currentFeeData && currentFeeData.length > 0) {
      const initialAmounts = {};
      currentFeeData.forEach((fee, index) => {
        initialAmounts[index] = fee.pendingAmount;
      });
      setToPayAmounts(initialAmounts);
    }
  }, [schoolFee, ecaFeeElements, transportFeeElements, additionalFeeElements, value]);

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

  // Check if all fees in current tab are fully paid
  const areAllFeesPaid = () => {
    const currentFeeData = getCurrentFeeData();
    if (!currentFeeData || currentFeeData.length === 0) return false;
    return currentFeeData.every(fee => fee.pendingAmount === 0);
  };

  // Calculate total amount for all fees
  const getTotalAmountForAllFees = (fees) => {
    if (!fees || fees.length === 0) return 0;
    return fees.reduce((total, fee) => total + (fee.feeAmount || 0), 0);
  };

  // Handle print entire bill
  const handlePrintEntireBill = () => {
    const currentFeeData = getCurrentFeeData();
    if (currentFeeData && currentFeeData.length > 0) {
      setSelectedFee(currentFeeData); // Set as array for entire bill
      setOpenPreview(true);
    }
  };


  useEffect(() => {
    fetchBillingUser();
  }, []);

  const fetchBillingUser = async () => {
    try {
      const res = await axios.get(getBillingUser, {
        params: { rollNumber },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data) {
        setStudentInfo(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch billing user:', error);
    }
  };

  useEffect(() => {
    if (!selectedYear) return;
    switch (value) {
      case 0:
        fetchStatusDetails();
        break;
      case 1:
        fetchTransportDetails();
        break;
      case 2:
        fetchEcaDetails();
        break;
      case 3:
        fetchAdditionalDetails();
        break;
      default:
        fetchStatusDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, value]);

  const fetchStatusDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(findStudentSchoolFeesBilling, {
        params: {
          rollNumber: rollNumber,
          year: selectedYear
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


  const fetchEcaDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(findStudentEcaFeesBilling, {
        params: {
          rollNumber: rollNumber,
          year: selectedYear
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const feeDetail = res.data.data
      setEcaDetails(feeDetail)
      setEcaFeeElements(feeDetail.feesElements)
    } catch (error) {
      console.error("Error while fetching ECA fee data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchTransportDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(findStudentTransportFeesBilling, {
        params: {
          rollNumber: rollNumber,
          year: selectedYear
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.error === false && res.data.data) {
        const responseData = res.data.data;
        setTransportDetails(responseData);
        setTransportFeeElements(responseData.feesElements || []);
      } else {
        setMessage(res.data.message || 'Failed to fetch transport fees');
        setOpen(true);
        setStatus(false);
        setColor(false);
        setTransportDetails({});
        setTransportFeeElements([]);
      }
    } catch (error) {
      console.error("Error while loading transport fee data:", error);
      setMessage('Failed to fetch transport fees');
      setOpen(true);
      setStatus(false);
      setColor(false);
      setTransportDetails({});
      setTransportFeeElements([]);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchAdditionalDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(findStudentAdditionalFeesBilling, {
        params: {
          rollNumber: rollNumber,
          year: selectedYear
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const feeDetail = res.data.data
      setAdditionalDetails(feeDetail)
      setAdditionalFeeElements(feeDetail.feesElements)
    } catch (error) {
      console.error("Error while fetching additional fee data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box sx={{ width: "100%", }}>
      <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
      <Box
        sx={{
          backgroundColor: DASH.canvas,
          px: 2,
          py: 1.2,
          borderBottom: `1px solid ${DASH.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ width: 28, height: 28 }}>
            <ArrowBackIcon sx={{ fontSize: 20, color: DASH.ink }} />
          </IconButton>
          <Box sx={{ ml: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "20px", color: DASH.ink, lineHeight: 1.2 }}>Billing Screen</Typography>
            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, whiteSpace: "nowrap" }}>Collect fees and record the payment method</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto", flexWrap: "wrap" }}>
              {canConcession && (
              <Button
                onClick={() => navigate('/dashboardmenu/fee/special', {
                  state: {
                    selectedTab: value,
                    allFeeData: {
                      0: schoolFee,
                      1: transportFeeElements,
                      2: ecaFeeElements,
                      3: additionalFeeElements,
                    },
                    rollNumber,
                    selectedYear
                  }
                })}
                startIcon={<LocalOfferOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: "none",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  height: 34,
                  px: 1.8,
                  borderRadius: RADIUS,
                  color: DASH.violet,
                  backgroundColor: DASH.violetLight,
                  border: "1px solid #DDD6FE",
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                  "& .MuiButton-startIcon": { mr: 0.6 },
                  "&:hover": { backgroundColor: DASH.violetLight, borderColor: DASH.violet, boxShadow: "none" },
                }}
              >Special Concession</Button>
              )}
        </Box>
      </Box>

      <Box sx={{ height: "83vh", overflowY: "auto", overflowX: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", pt: 1.5, justifyContent: "end", px: 2 }}>
          <Typography sx={{ fontWeight: 600, color: DASH.muted, fontSize: "12px" }}>Billing on</Typography>
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
          <Box
            onClick={handleOpenCal}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.7,
              ml: 1,
              height: 28,
              px: 1.2,
              borderRadius: RADIUS,
              bgcolor: "#fff",
              border: `1px solid ${DASH.line}`,
              cursor: "pointer",
              transition: "border-color .2s ease, background-color .2s ease",
              "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 15, color: DASH.muted }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.ink, whiteSpace: "nowrap" }}>
              {dayjs(selectedDate).format('DD MMMM YYYY')}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ px: 2, pt: 1 }}>
          {isLoading ? <StudentCardSkeleton /> : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 2, md: 3 },
              flexWrap: "wrap",
              bgcolor: "#FFF7FA",
              border: "1px solid #F7C9DA",
              borderLeft: "3px solid #E30053",
              borderRadius: "10px",
              boxShadow: "none",
              px: 2,
              py: 1.6,
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.6, minWidth: 0 }}>
              <Box
                component="img"
                src={studentInfo?.image || avatarImage}
                alt={studentInfo?.name || "student"}
                onError={(e) => (e.target.src = avatarImage)}
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                  bgcolor: "#fff",
                  border: `1px solid #F7C9DA`,
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: DASH.ink,
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 220,
                  }}
                >
                  {studentInfo?.name || "—"}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: DASH.muted, fontFamily: "monospace" }}>
                  #{studentInfo?.rollNumber || "—"}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 2, md: 3.5 },
                flexWrap: "wrap",
                pl: { xs: 0, md: 3 },
                borderLeft: { xs: "none", md: `1px solid ${DASH.lineSoft}` },
              }}
            >
              {[
                { label: "Gender", value: studentInfo?.gender },
                { label: "Grade", value: studentInfo?.grade },
                { label: "Section", value: studentInfo?.section },
              ].map((f) => (
                <Box key={f.label} sx={{ minWidth: 62 }}>
                  <Typography
                    sx={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: DASH.faint,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {f.label}
                  </Typography>
                  <Typography sx={{ fontSize: "13.5px", fontWeight: 600, color: DASH.ink, mt: 0.3 }}>
                    {f.value || "—"}
                  </Typography>
                </Box>
              ))}
            </Box>

          </Box>
          )}
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
                  backgroundColor: DASH.lineSoft,
                  minHeight: 0,
                  borderRadius: "999px",
                  border: `1px solid ${DASH.line}`,
                  p: 0.5,

                  "& .MuiTabs-flexContainer": {
                    justifyContent: "center",
                  },

                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontSize: "12.5px",
                    color: DASH.muted,
                    fontWeight: 600,
                    minWidth: 0,
                    minHeight: 28,
                    height: 28,
                    px: 1.8,
                    borderRadius: "999px",
                    transition: "color .18s ease, background-color .18s ease",
                    "&:hover": { color: DASH.text },
                    },

                  "& .Mui-selected": {
                    color: "#fff !important",
                    bgcolor: "#E30053",
                    fontWeight: 700,
                    borderRadius: "999px",
                    boxShadow: "0 1px 3px rgba(227,0,83,0.30)",
                    "&:hover": { bgcolor: "#C40047" },
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

          {isLoading ? <FeeBandSkeleton /> : (
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                position: "relative",
                top: "1px",
                zIndex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#E30053",
                border: "1px solid #E30053",
                borderBottom: "none",
                py: 0.6,
                width: "fit-content",
                px: 2,
                borderTopLeftRadius: "6px",
                borderTopRightRadius: "6px",
              }}
            >
              <Typography sx={{ color: "#fff", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
                {feeTabs[value]}
              </Typography>
            </Box>

            {/* Admission status chip — only on School Fee tab when API returned a value */}
            {value === 0 && (() => {
              const admission = (details?.oldOrNewAdmission || "").toLowerCase();
              if (admission !== "old" && admission !== "new") return null;
              const isOld = admission === "old";
              return (
                <Tooltip
                  arrow
                  placement="top"
                  title={
                    isOld
                      ? "Old student — Admission Fee is waived. Only the recurring school fees apply."
                      : "New student — full School Fee structure (including Admission Fee) applies."
                  }
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.6,
                      mb: 0.5,
                      px: 1.25,
                      height: 22,
                      borderRadius: "999px",
                      backgroundColor: isOld ? DASH.amberLight : DASH.blueLight,
                      border: `1px solid ${isOld ? "#FDBA74" : "#BFDBFE"}`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 7, height: 7, borderRadius: "50%",
                        backgroundColor: isOld ? DASH.amber : DASH.blue,
                      }}
                    />
                    <Typography sx={{
                      fontSize: "11px", fontWeight: 700, letterSpacing: 0.2,
                      color: isOld ? "#B45309" : "#1D4ED8",
                    }}>
                      {isOld ? "Old Student" : "New Student"}
                    </Typography>
                    {isOld && (
                      <Typography sx={{
                        fontSize: "10px", fontWeight: 600,
                        color: "#9A3412", opacity: 0.85,
                        ml: 0.3, borderLeft: "1px solid #FDBA74", pl: 0.6,
                      }}>
                        No Admission Fee
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              );
            })()}

            {(() => {
              const concessionFees = getCurrentFeeData().filter(
                (fee) => parseFloat(fee.concessionAmount || 0) > 0
              );
              if (concessionFees.length === 0) return null;
              const totalConcession = concessionFees.reduce(
                (sum, fee) => sum + parseFloat(fee.concessionAmount || 0),
                0
              );
              const getFeeLabel = (fee) =>
                fee.feeName || fee.feeDetails || fee.activityName || fee.place || "-";
              return (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 0.75,
                    ml: 1,
                    mt: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      backgroundColor: "#4caf50",
                      border: "1px solid #4caf50",
                      height: "22px",
                      px: 1.25,
                      borderRadius: "999px",
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 15, color: "#fff" }} />
                    <Typography sx={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}>
                      Concession Applied
                    </Typography>
                    <Box
                      sx={{
                        ml: 0.5,
                        px: 0.75,
                        py: 0.1,
                        borderRadius: "999px",
                        backgroundColor: "#fff",
                      }}
                    >
                      <Typography sx={{ color: "#2e7d32", fontSize: "11px", fontWeight: 700 }}>
                        ₹{totalConcession.toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })()}
          </Box>
          <Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<HistoryIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                const feeTypeMap = {
                  0: 'schoolfee',
                  1: 'transport',
                  2: 'eca',
                  3: 'additional'
                };
                navigate('/dashboardmenu/fee/transaction-history', {
                  state: {
                    rollNumber,
                    year: selectedYear,
                    feeType: feeTypeMap[value],
                    activeTab: value
                  }
                });
              }}
              sx={{
                backgroundColor: "#E30053",
                color: "#fff",
                textTransform: "none",
                borderRadius: "999px",
                height: 34,
                px: 2.2,
                fontSize: "12.5px",
                fontWeight: 700,
                boxShadow: "none",
                whiteSpace: "nowrap",
                "& .MuiButton-startIcon": { mr: 0.6 },
                "&:hover": { backgroundColor: "#C40047", boxShadow: "0 2px 8px rgba(227,0,83,0.25)" },
              }}
            >
              Transaction History
            </Button>
          </Box>
          </Box>
          )}
          
       

          {(() => {
            const fees = getCurrentFeeData() || [];
            const inReview = fees.filter((f) => String(f.paymentApprovalStatus || '').toLowerCase() === 'pending').length;
            const rejected = fees.filter((f) => String(f.paymentApprovalStatus || '').toLowerCase() === 'rejected').length;
            if (!inReview && !rejected) return null;
            return (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                {inReview > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderRadius: RADIUS, backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
                    <Typography sx={{ fontSize: 16 }}>⏳</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>
                      {inReview} payment{inReview > 1 ? 's' : ''} in review — awaiting accounts team approval. These can't be paid until approved.
                    </Typography>
                  </Box>
                )}
                {rejected > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderRadius: RADIUS, backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                    <Typography sx={{ fontSize: 16 }}>⚠️</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#991B1B' }}>
                      {rejected} payment{rejected > 1 ? 's' : ''} rejected — please review and submit again.
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })()}

          {isLoading ? (
            <FeeTableSkeleton columns={8} rows={6} />
          ) : (
          <TableContainer
            sx={{
              border: `1px solid ${DASH.line}`,
              borderRadius: "6px",
              borderTopLeftRadius: 0,
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
                  ].map((header, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        borderRight: 1,
                        borderColor: DASH.line,
                        textAlign: "center",
                        backgroundColor: DASH.surface,
                        fontWeight: 700,
                        fontSize: "10.5px",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: DASH.muted,
                        py: 1.2,
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {getCurrentFeeData().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: "center", py: 7, borderBottom: "none" }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: RADIUS,
                            backgroundColor: "#FDECF2",
                            border: "1px solid #F7C9DA",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 1.8,
                          }}
                        >
                          <ReceiptLongIcon sx={{ fontSize: 22, color: "#E30053" }} />
                        </Box>
                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: DASH.ink }}>
                          {getNoDataMessage()}
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.6, maxWidth: 340, lineHeight: 1.6 }}>
                          Nothing to collect here yet. Create the fee structure for this class, or pick a different fee type above.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  getCurrentFeeData().map((row, rowIndex) => {
                    const isSelected = selectedRows.includes(rowIndex);
                    return (
                      <TableRow
                        key={rowIndex}
                        onClick={() => handleSelect(rowIndex)}
                        sx={{
                          cursor: !isRowPayable(row) ? "default" : "pointer",
                          backgroundColor: isSelected ? "#FFF7F7" : "transparent",
                          "&:hover": {
                            backgroundColor: !isRowPayable(row) ? "transparent" : isSelected ? `${DASH.red}1A` : DASH.surface,
                          },
                          transition: "background-color 0.2s ease",
                        }}
                      >

                        <TableCell
                          sx={{
                            borderRight: 1,
                            borderColor: "#E300532A",
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
                              disabled={!isRowPayable(row)}
                              onChange={() => handleSelect(rowIndex)}
                              color="secondary"
                              sx={{
                                "&.Mui-checked": {
                                  color: "#E30053",
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
                            borderColor: "#E300532A",
                            textAlign: "center",
                          }}
                        >
                          {value === 1
                            ? (row.place || "-")
                            : value === 2
                              ? `${row.activityName || "-"} - ${row.activityCategory || "-"}`
                              : value === 3
                                ? (row.feeName || "-")
                                : (row.feeDetails || "-")
                          }
                        </TableCell>

                        <TableCell
                          sx={{
                            borderRight: 1,
                            borderColor: "#E300532A",
                            textAlign: "center",
                          }}
                        >
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                            <Typography sx={{ fontSize: "14px", color: "#333" }}>
                              ₹{row.feeAmount}
                            </Typography>
                            {parseFloat(row.concessionAmount || 0) > 0 && (
                              <Tooltip title="Concession applied on this fee" arrow>
                                <Box
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.4,
                                    px: 0.9,
                                    py: 0.1,
                                    borderRadius: "999px",
                                    backgroundColor: "#E8F5E9",
                                    border: "1px solid #A5D6A7",
                                  }}
                                >
                                  <CheckCircleIcon sx={{ fontSize: 12, color: "#2e7d32" }} />
                                  <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#1b5e20" }}>
                                    Concession
                                  </Typography>
                                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#2e7d32" }}>
                                    ₹{parseFloat(row.concessionAmount || 0).toLocaleString("en-IN")}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell
                          sx={{
                            borderRight: 1,
                            borderColor: "#E300532A",
                            textAlign: "center",
                            padding: "8px",
                          }}
                        >
                          {(() => {
                            const status = row.status?.toLowerCase();
                            const appr = String(row.paymentApprovalStatus || '').toLowerCase();
                            const pending = Number(row.pendingAmount) || 0;
                            let statusConfig = {
                              text: 'Unknown',
                              color: DASH.muted,
                              bgColor: DASH.lineSoft,
                              icon: '❓',
                              tooltip: '',
                            };

                            if (appr === 'pending') {
                              statusConfig = {
                                text: 'In Review',
                                color: DASH.amber,
                                bgColor: '#fef3c7',
                                icon: '⏳',
                                tooltip: 'Payment sent for approval to the accounts team. Once approved, the status will update here.',
                              };
                            } else if (appr === 'rejected') {
                              const reason = row.rejectionReason || row.approvalRemarks || row.paymentApprovalRemarks || row.rejectedReason || '';
                              statusConfig = {
                                text: 'Rejected',
                                color: DASH.red,
                                bgColor: '#fee2e2',
                                icon: '⚠️',
                                tooltip: reason
                                  ? `Rejected: ${reason} — please review and submit the payment again.`
                                  : 'Your last payment request was rejected. Please review and submit the payment again.',
                              };
                            } else if (status === 'paid' || pending === 0) {
                              statusConfig = {
                                text: 'Paid',
                                color: DASH.green,
                                bgColor: '#d1fae5',
                                icon: '✓',
                                tooltip: '',
                              };
                            } else if (status === 'partiallypaid') {
                              statusConfig = {
                                text: 'Partially Paid',
                                color: DASH.amber,
                                bgColor: '#fef3c7',
                                icon: '◐',
                                tooltip: '',
                              };
                            } else if (status === 'notpaid') {
                              statusConfig = {
                                text: 'Not Paid',
                                color: DASH.red,
                                bgColor: '#fee2e2',
                                icon: '✗',
                                tooltip: '',
                              };
                            }

                            const chip = (
                              <Box
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: RADIUS,
                                  backgroundColor: statusConfig.bgColor,
                                  border: `1px solid ${statusConfig.color}30`,
                                  cursor: statusConfig.tooltip ? 'help' : 'default',
                                }}
                              >
                                <Typography sx={{ fontSize: "14px" }}>
                                  {statusConfig.icon}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: statusConfig.color,
                                  }}
                                >
                                  {statusConfig.text}
                                </Typography>
                              </Box>
                            );

                            return statusConfig.tooltip
                              ? <Tooltip title={statusConfig.tooltip} arrow>{chip}</Tooltip>
                              : chip;
                          })()}
                        </TableCell>

                        <TableCell
                          sx={{
                            borderRight: 1,
                            borderColor: "#E300532A",
                            textAlign: "center",
                          }}
                        >
                          ₹{row.paidAmount}
                        </TableCell>

                        <TableCell
                          sx={{
                            borderRight: 1,
                            borderColor: "#E300532A",
                            textAlign: "center",
                          }}
                        >
                          ₹{row.pendingAmount}
                        </TableCell>

                        <TableCell
                          sx={{
                            borderRight: 1,
                            borderColor: "#E300532A",
                            textAlign: "center",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TextField
                            size='small'
                            type="number"
                            value={toPayAmounts[rowIndex] || 0}
                            onChange={(e) => handleToPayChange(rowIndex, e.target.value)}
                            disabled={!isSelected || !isRowPayable(row)}
                            inputProps={{
                              min: 0,
                              max: row.pendingAmount,
                              step: 1
                            }}
                            sx={{
                              width: '120px',
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: isSelected ? '#E30053' : '#ccc',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#E30053',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#E30053',
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
                            borderColor: "#E300532A",
                            textAlign: "center",
                            padding: "8px",
                          }}
                        >
                          {(() => {
                            const dueDateInfo = getDueDateInfo(row.dueDate, row.status, row.pendingAmount);
                            return (
                              <Box
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: RADIUS,
                                  backgroundColor: dueDateInfo.bgColor,
                                  border: `1px solid ${dueDateInfo.color}30`,
                                }}
                              >
                                <Typography sx={{ fontSize: "14px" }}>
                                  {dueDateInfo.icon}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: dueDateInfo.color,
                                  }}
                                >
                                  {dueDateInfo.text}
                                </Typography>
                              </Box>
                            );
                          })()}
                        </TableCell>

                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          )}

          <>
            <Dialog open={openPreview} onClose={handleClose} maxWidth="md" fullWidth keepMounted>
              <Box sx={{ p: 2 }}>
                <Box
                  ref={componentRef}
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: RADIUS,
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
                      {websiteSettings?.title || ""}
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
                      fontSize: "16px",
                      mb: 1,
                      color: DASH.muted,
                    }}
                  >
                    Payment Receipt - {feeTabs[value]}
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      border: `1px solid ${DASH.line}`,
                    }}
                  >
                    {[
                      { label: "SI No", value: selectedFee?.id || "-" },
                      { label: "Student Name", value: getCurrentDetails()?.name || "-" },
                      { label: "Roll No", value: getCurrentDetails()?.rollnumber || rollNumber || "-" },
                      { label: "Class & Section", value: `${getCurrentDetails()?.grade || '-'} ${getCurrentDetails()?.section || ''}`.trim() },
                      { label: "Receipt Date", value: dayjs().format("DD/MM/YYYY") },
                    ].map((item, i) => (
                      <Box
                        key={i}
                        sx={{
                          borderRight: i !== 4 ? `1px solid ${DASH.line}` : "none",
                          p: 0.7,
                        }}
                      >
                        <Typography sx={{ color: "#888", fontSize: "12px" }}>{item.label}</Typography>
                        <Typography
                          sx={{
                            color: DASH.ink,
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
                      border: `1px solid ${DASH.line}`,
                      mt: 1.5
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          {["S.No", "Fee Details", "Fee Amount", "Paid Amount", "Pending Amount"].map((header, index) => (
                            <TableCell
                              key={index}
                              sx={{
                                backgroundColor: `${DASH.red}1A`,
                                fontWeight: header === "Paid Amount" ? 700 : 600,
                                textAlign: "center",
                                border: `1px solid ${DASH.line}`,
                                color: header === "Paid Amount" ? DASH.green : "#000",
                                fontSize: "14px",
                              }}
                            >
                              {header}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {selectedFee ? (
                          Array.isArray(selectedFee) ? (
                            selectedFee.map((fee, index) => (
                              <TableRow key={index}>
                                <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                                  {index + 1}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                                  {value === 1
                                    ? (fee.place || "-")
                                    : value === 2
                                      ? `${fee.activityName || "-"} - ${fee.activityCategory || "-"}`
                                      : value === 3
                                        ? (fee.feeName || "-")
                                        : (fee.feeDetails || "-")
                                  }
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                                  ₹{(fee.feeAmount || fee.amount || 0).toLocaleString()}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, bgcolor: `${DASH.green}0A`, color: DASH.green, fontSize: "14px", fontWeight: 700 }}>
                                  ₹{(fee.paidAmount || 0).toLocaleString()}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                                  ₹{(fee.pendingAmount || 0).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (

                            <TableRow>
                              <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                                1
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                                {value === 1
                                  ? (selectedFee.place || "-")
                                  : value === 2
                                    ? `${selectedFee.activityName || "-"} - ${selectedFee.activityCategory || "-"}`
                                    : value === 3
                                      ? (selectedFee.feeName || "-")
                                      : (selectedFee.feeDetails || "-")
                                }
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                                ₹{(selectedFee.feeAmount || selectedFee.amount || 0).toLocaleString()}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, bgcolor: `${DASH.green}0A`, color: DASH.green, fontSize: "14px", fontWeight: 700 }}>
                                ₹{(selectedFee.paidAmount || 0).toLocaleString()}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                                ₹{(selectedFee.pendingAmount || 0).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          )
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: "#999", fontSize: "14px", py: 3 }}>
                              No fee selected
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ display: "flex", justifyContent: "end", }}>
                    <Box
                      sx={{
                        border: `1px solid ${DASH.green}`,
                        py: 1.5,
                        px: 4,
                        color: DASH.green,
                        fontWeight: "700",
                        backgroundColor: `${DASH.green}0A`,
                        borderTop: "none",
                        borderBottomLeftRadius: "5px",
                        mr: "-2px",
                        borderBottomRightRadius: "5px",
                        fontSize: "16px",
                      }}
                    >
                      Paid Amount: <span style={{ marginLeft: "20px", fontSize: "18px" }}>₹{
                        Array.isArray(selectedFee)
                          ? selectedFee.reduce((total, fee) => total + (fee.paidAmount || 0), 0).toLocaleString()
                          : ((selectedFee?.paidAmount || 0)).toLocaleString()
                      }</span>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: "15px", color: "#000" }}>
                      <b>Paid amount in words :</b> {
                        Array.isArray(selectedFee)
                          ? `${convertNumberToWords(selectedFee.reduce((total, fee) => total + (fee.paidAmount || 0), 0))} rupees only`
                          : (selectedFee?.paidAmount)
                            ? `${convertNumberToWords(selectedFee?.paidAmount)} rupees only`
                            : "No amount"
                      }
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
                      borderColor: DASH.line,
                      color: DASH.text,
                      bgcolor: "#fff",
                      fontWeight: 700,
                      textTransform: "none",
                      borderRadius: RADIUS,
                      width: "100px",
                      height: 34,
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
                      height: 34,
                      borderRadius: RADIUS,
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
                      height: 34,
                      borderRadius: RADIUS,
                    }}
                  >
                    Download
                  </Button>
                </DialogActions>
              </Box>
            </Dialog>

            {getCurrentFeeData().length > 0 && (
              <>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", ml: 12 }}>
                    <Box sx={{ border: "1px solid #ccc", py: 1, px: 3, color: DASH.green, fontWeight: "600", borderTop: "none", borderBottomLeftRadius: "5px", backgroundColor: "#fff", }}>
                      Total Fees Amount
                    </Box>
                    <Box sx={{ border: "1px solid #ccc", borderLeft: "none", fontWeight: "600", py: 1, px: 2, color: DASH.green, borderTop: "none", borderBottomRightRadius: "5px", backgroundColor: "#fff", }}>
                      ₹{getTotalFeeAmount().toLocaleString()}
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>

                    <Button
                      variant="contained"
                      size="small"
                      disabled={selectedRows.length === 0 || getTotalPending() === 0}
                      onClick={handleOpenPaymentPopup}
                      sx={{
                        backgroundColor: "#2e7d32",
                        textTransform: "none",
                        borderRadius: RADIUS,
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
                  </Box>
                </Box>
              </>
            )}

            <Dialog
              open={openPaymentPopup}
              onClose={!paymentProcessing ? handleCloseAttempt : undefined}
              maxWidth="sm"
              fullWidth
              disableEscapeKeyDown={paymentProcessing || paymentSuccess}
              PaperProps={{
                sx: {
                  borderRadius: "10px",
                  overflow: "hidden",
                  background: "#ffffff",
                  boxShadow: "0 12px 32px rgba(16,24,40,0.16)",
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
                    onClick={handleCloseAttempt}
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
                      <LockIcon sx={{ fontSize: 16, color: DASH.green }} />
                      <Typography sx={{ fontSize: "0.75rem", color: DASH.green, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Secure Payment
                      </Typography>
                    </Box>
                  </Box>
                  {/* Amount Display */}
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "baseline",
                      background: DASH.surface,
                      px: 3,
                      borderRadius: "10px",
                      height: "100%",
                      boxShadow: `0 8px 24px ${websiteSettings.mainColor}30`,
                      mt: 3,
                      py: 2

                    }}
                  >
                    <Typography sx={{ fontSize: "0.9rem", color: websiteSettings.textColor, fontWeight: 500, opacity: 0.9 }}>₹</Typography>
                    <Typography sx={{ fontSize: "2rem", fontWeight: 800, color: websiteSettings.textColor, letterSpacing: "-0.02em" }}>
                      {paymentSuccess ? completedPaymentAmount.toLocaleString() : getTotalPending().toLocaleString()}
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
                                ? { background: DASH.green, color: "#fff" }
                                : paymentStep === index
                                  ? { background: websiteSettings.mainColor, color: websiteSettings.textColor, boxShadow: `0 4px 12px ${websiteSettings.mainColor}40` }
                                  : { background: DASH.lineSoft, color: DASH.faint }),
                            }}
                          >
                            {paymentStep > index ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : index + 1}
                          </Box>
                          <Typography
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: paymentStep === index ? 600 : 500,
                              color: paymentStep >= index ? DASH.ink : DASH.faint,
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
                              background: paymentStep > index ? DASH.green : DASH.line,
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
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: DASH.muted, mb: 2, textAlign: "center" }}>
                        Select how you want to pay
                      </Typography>
                      {/* Offline Payment Notice */}
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", p: 2, mb: 2.5 }}>
                        <InfoOutlinedIcon sx={{ color: "#2563EB", fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                        <Box>
                          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1D4ED8", mb: 0.4 }}>
                            Offline Payment Recording
                          </Typography>
                          <Typography sx={{ fontSize: "0.78rem", color: "#1e40af", lineHeight: 1.6 }}>
                            This is an <strong>offline payment process.</strong> You are recording the fee payment received from the student. The transaction details will be saved in the system for tracking and reporting purposes only.
                          </Typography>
                        </Box>
                      </Box>

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
                              borderRadius: "10px",
                              cursor: "pointer",
                              border: "2px solid",
                              borderColor: selectedPaymentMethod === method.id ? method.color : "#ddd",
                              background: selectedPaymentMethod === method.id ? `${method.color}08` : DASH.surface,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                background: selectedPaymentMethod === method.id ? `${method.color}12` : DASH.lineSoft,
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: "10px",
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
                              <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: DASH.ink }}>
                                {method.name}
                              </Typography>
                              <Typography sx={{ fontSize: "0.75rem", color: DASH.muted }}>
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
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: DASH.muted, mb: 2.5, textAlign: "center" }}>
                        Enter your payment details
                      </Typography>

                      {/* Cash Payment Form */}
                      {selectedPaymentMethod === "cash" && (
                        <Box>
                          <Box sx={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "10px", p: 2, mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                            <PaymentsIcon sx={{ color: DASH.amber, fontSize: 22 }} />
                            <Typography sx={{ fontSize: "0.85rem", color: "#92400e", fontWeight: 500 }}>
                              Enter the denomination count for cash payment
                            </Typography>
                          </Box>

                          <Box sx={{ background: DASH.surface, borderRadius: "10px", p: 2.5, border: "1px solid #ccc" }}>
                            {notesList.map((note, idx) => (
                              <Box
                                key={note}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  py: 1.5,
                                  borderBottom: idx < notesList.length - 1 ? `1px solid ${DASH.line}` : "none",
                                }}
                              >
                                <Box sx={{ width: 60, py: 0.8, px: 1.5, background: "#fff", borderRadius: RADIUS, border: `1px solid ${DASH.line}`, textAlign: "center" }}>
                                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: DASH.ink }}>₹{note}</Typography>
                                </Box>
                                <Typography sx={{ color: DASH.faint, fontSize: "1.2rem" }}>×</Typography>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={counts[note]}
                                  onChange={(e) => handleChange(note, e.target.value)}
                                  sx={{
                                    width: 70,
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: RADIUS,
                                      background: "#fff",
                                      "& input": { textAlign: "center", fontWeight: 600, py: 1 },
                                    },
                                  }}
                                />
                                <Typography sx={{ color: DASH.faint, fontSize: "1.2rem" }}>=</Typography>
                                <Box sx={{ flex: 1, textAlign: "right" }}>
                                  <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: getSubtotal(note) > 0 ? DASH.green : DASH.faint }}>
                                    ₹{getSubtotal(note).toLocaleString()}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3, p: 2.5, background: "#0f172a", borderRadius: "10px" }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: "#fff" }}>Total Cash</Typography>
                            <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: websiteSettings.mainColor }}>
                              ₹{totalCash.toLocaleString()}
                            </Typography>
                          </Box>

                          {/* Balance Calculation */}
                          {(() => {
                            const amountToPay = getTotalPending();
                            const balance = totalCash - amountToPay;
                            const isExact = balance === 0;
                            const isOverpaid = balance > 0;
                            const isUnderpaid = balance < 0;

                            return (
                              <Box sx={{ mt: 2 }}>
                                {/* Amount to Pay */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, background: "#fff", borderRadius: "10px", border: `1px solid ${DASH.line}`, mb: 1 }}>
                                  <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: DASH.muted }}>Amount to Pay</Typography>
                                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: DASH.ink }}>
                                    ₹{amountToPay.toLocaleString()}
                                  </Typography>
                                </Box>

                                {/* Balance/Change Display */}
                                {!isExact && totalCash > 0 && (
                                  <>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        p: 2,
                                        background: isOverpaid ? DASH.greenLight : DASH.redLight,
                                        borderRadius: "10px",
                                        border: `1px solid ${isOverpaid ? DASH.green : DASH.red}`,
                                      }}
                                    >
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography sx={{ fontSize: "1.2rem" }}>
                                          {isOverpaid ? "💰" : "⚠️"}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: isOverpaid ? "#0E9F6E" : "#dc2626" }}>
                                          {isOverpaid ? "Change to Return" : "Short Amount"}
                                        </Typography>
                                      </Box>
                                      <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: isOverpaid ? DASH.green : DASH.red }}>
                                        ₹{Math.abs(balance).toLocaleString()}
                                      </Typography>
                                    </Box>

                                    {/* Change Denomination Input */}
                                    {isOverpaid && (
                                      <Box sx={{ mt: 1 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0E9F6E" }}>
                                            💵 Enter Change Denomination
                                          </Typography>
                                          <Button
                                            size="small"
                                            onClick={() => {
                                              const changeDenomination = calculateChangeDenomination(Math.abs(balance));
                                              const newChangeCounts = { ...notesList.reduce((acc, n) => ({ ...acc, [n]: 0 }), {}) };
                                              Object.entries(changeDenomination).forEach(([denom, count]) => {
                                                newChangeCounts[denom] = count;
                                              });
                                              setChangeCounts(newChangeCounts);
                                            }}
                                            sx={{
                                              textTransform: "none",
                                              fontSize: "0.7rem",
                                              color: "#0E9F6E",
                                              border: "1px solid #10b981",
                                              "&:hover": { bgcolor: "#f0fdf4" },
                                            }}
                                          >
                                            Auto Fill
                                          </Button>
                                        </Box>

                                        <Box sx={{ background: "#f0fdf4", borderRadius: "10px", p: 2, border: "1px solid #10b981" }}>
                                          {notesList.map((note, idx) => (
                                            <Box
                                              key={note}
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.5,
                                                py: 1,
                                                borderBottom: idx < notesList.length - 1 ? "1px solid #10b98130" : "none",
                                              }}
                                            >
                                              <Box sx={{ width: 50, py: 0.5, px: 1, background: "#fff", borderRadius: RADIUS, border: "1px solid #10b981", textAlign: "center" }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#047857" }}>₹{note}</Typography>
                                              </Box>
                                              <Typography sx={{ color: "#0E9F6E", fontSize: "1rem" }}>×</Typography>
                                              <TextField
                                                size="small"
                                                type="number"
                                                value={changeCounts[note]}
                                                onChange={(e) => handleChangeCount(note, e.target.value)}
                                                sx={{
                                                  width: 60,
                                                  "& .MuiOutlinedInput-root": {
                                                    borderRadius: RADIUS,
                                                    background: "#fff",
                                                    "& input": { textAlign: "center", fontWeight: 600, py: 0.5, fontSize: "0.8rem" },
                                                  },
                                                }}
                                              />
                                              <Typography sx={{ color: "#0E9F6E", fontSize: "1rem" }}>=</Typography>
                                              <Box sx={{ flex: 1, textAlign: "right" }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: getChangeSubtotal(note) > 0 ? "#047857" : DASH.faint }}>
                                                  ₹{getChangeSubtotal(note).toLocaleString()}
                                                </Typography>
                                              </Box>
                                            </Box>
                                          ))}

                                          <Divider sx={{ my: 1.5, borderColor: "#10b98130" }} />

                                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, background: "#fff", borderRadius: RADIUS }}>
                                            <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0E9F6E" }}>Total Change Given</Typography>
                                            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#047857" }}>
                                              ₹{totalChange.toLocaleString()}
                                            </Typography>
                                          </Box>

                                          {/* Validation Message */}
                                          {totalChange !== Math.abs(balance) && totalChange > 0 && (
                                            <Box sx={{ mt: 1, p: 1, background: DASH.redLight, borderRadius: RADIUS, border: "1px solid #ef4444" }}>
                                              <Typography sx={{ fontSize: "0.7rem", color: "#dc2626", textAlign: "center" }}>
                                                ⚠️ Change mismatch: Expected ₹{Math.abs(balance).toLocaleString()} but giving ₹{totalChange.toLocaleString()}
                                              </Typography>
                                            </Box>
                                          )}

                                          {totalChange === Math.abs(balance) && totalChange > 0 && (
                                            <Box sx={{ mt: 1, p: 1, background: DASH.greenLight, borderRadius: RADIUS, border: "1px solid #10b981" }}>
                                              <Typography sx={{ fontSize: "0.7rem", color: "#0E9F6E", textAlign: "center" }}>
                                                ✓ Change amount matches correctly
                                              </Typography>
                                            </Box>
                                          )}
                                        </Box>
                                      </Box>
                                    )}
                                  </>
                                )}

                                {/* Exact Payment Success */}
                                {isExact && totalCash > 0 && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      gap: 1,
                                      p: 2,
                                      background: DASH.greenLight,
                                      borderRadius: "10px",
                                      border: "1px solid #10b981",
                                    }}
                                  >
                                    <CheckCircleIcon sx={{ color: DASH.green, fontSize: 20 }} />
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#0E9F6E" }}>
                                      Exact Amount - No Change Required
                                    </Typography>
                                  </Box>
                                )}

                                {/* Collection Summary */}
                                {totalCash > 0 && (
                                  <Box sx={{ mt: 2, p: 2, background: DASH.surface, borderRadius: "10px", border: `1px solid ${DASH.line}` }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: DASH.muted, mb: 1 }}>
                                      📊 Collection Summary
                                    </Typography>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                      {notesList.map((note) => {
                                        if (counts[note] > 0) {
                                          return (
                                            <Box key={note} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                              <Typography sx={{ fontSize: "0.8rem", color: DASH.muted }}>
                                                ₹{note} × {counts[note]}
                                              </Typography>
                                              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: DASH.ink }}>
                                                ₹{(note * counts[note]).toLocaleString()}
                                              </Typography>
                                            </Box>
                                          );
                                        }
                                        return null;
                                      })}
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            );
                          })()}
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
                              disabled
                              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
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

                          {/* UPI payment screenshot upload */}
                          <Grid size={{ xs: 12 }}>
                            <input
                              type="file"
                              accept="image/*"
                              id="upi-proof-upload"
                              style={{ display: "none" }}
                              onChange={handleUpiProofChange}
                            />
                            {!upiProofFile ? (
                              <label htmlFor="upi-proof-upload">
                                <Box
                                  sx={{
                                    border: "1.5px dashed #c4b5fd",
                                    borderRadius: "10px",
                                    p: 2,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    backgroundColor: "#faf5ff",
                                    transition: "all 0.2s",
                                    "&:hover": { backgroundColor: "#f3e8ff", borderColor: "#8b5cf6" },
                                  }}
                                >
                                  <AccountBalanceWalletIcon sx={{ color: "#8b5cf6", fontSize: 26, mb: 0.5 }} />
                                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#6d28d9" }}>
                                    Upload UPI Payment Screenshot
                                    <Box component="span" sx={{ color: DASH.red, ml: 0.3 }}>*</Box>
                                  </Typography>
                                  <Typography sx={{ fontSize: "0.72rem", color: DASH.faint, mt: 0.3 }}>
                                    PNG / JPG, up to 5MB — required
                                  </Typography>
                                </Box>
                              </label>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                  p: 1.2,
                                  border: `1px solid ${DASH.line}`,
                                  borderRadius: "10px",
                                  backgroundColor: "#faf5ff",
                                }}
                              >
                                <Avatar
                                  variant="rounded"
                                  src={upiProofPreview}
                                  sx={{ width: 48, height: 48, border: `1px solid ${DASH.line}` }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: DASH.ink }} noWrap>
                                    {upiProofFile.name}
                                  </Typography>
                                  <Typography sx={{ fontSize: "0.72rem", color: DASH.muted }}>
                                    {(upiProofFile.size / 1024).toFixed(0)} KB
                                  </Typography>
                                </Box>
                                <IconButton size="small" onClick={handleRemoveUpiProof} sx={{ color: DASH.red }}>
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
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
                                startAdornment: <InputAdornment position="start"><AccountBalanceIcon sx={{ color: DASH.blue }} /></InputAdornment>,
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
                              disabled
                              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
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
                                  startAdornment: <InputAdornment position="start"><ReceiptLongIcon sx={{ color: DASH.amber }} /></InputAdornment>,
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
                                startAdornment: <InputAdornment position="start"><CreditCardIcon sx={{ color: DASH.red }} /></InputAdornment>,
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
                              disabled
                              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
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
                        <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: DASH.ink }}>
                          Confirm Payment Details
                        </Typography>
                      </Box>

                      <Card
                        sx={{
                          borderRadius: "20px",
                          border: `1px solid ${DASH.line}`,
                          mb: 3,
                          overflow: "hidden",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                        }}
                      >
                        {/* Payment Method Header */}
                        <Box
                          sx={{
                            backgroundColor: `${paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.color}12`,
                            px: 3,
                            py: 2.5,
                            borderBottom: `1px solid ${DASH.line}`,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: "10px",
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
                              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: DASH.ink }}>
                                {paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.name}
                              </Typography>
                              <Typography sx={{ fontSize: "0.85rem", color: DASH.muted }}>
                                {paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.description}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <CardContent sx={{ p: 3 }}>
                          <Grid container spacing={2.5}>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ p: 2, background: DASH.surface, borderRadius: "10px", border: `1px solid ${DASH.line}` }}>
                                <Typography sx={{ color: DASH.muted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Student Name
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: DASH.ink }}>{details.name}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ p: 2, background: DASH.surface, borderRadius: "10px", border: `1px solid ${DASH.line}` }}>
                                <Typography sx={{ color: DASH.muted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Roll Number
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: DASH.ink }}>{details.rollnumber}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ p: 2, background: DASH.surface, borderRadius: "10px", border: `1px solid ${DASH.line}` }}>
                                <Typography sx={{ color: DASH.muted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Class & Section
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: DASH.ink }}>{details.grade} - {details.section}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ p: 2, background: DASH.surface, borderRadius: "10px", border: `1px solid ${DASH.line}` }}>
                                <Typography sx={{ color: DASH.muted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Fee Type
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: DASH.ink }}>
                                  {feeTabs[value]}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Total Amount */}
                          <Box
                            sx={{
                              mt: 3,
                              p: 2.5,
                              backgroundColor: `${DASH.green}12`,
                              borderRadius: "10px",
                              border: "1px solid #10b98125",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Box sx={{ width: 40, height: 40, borderRadius: "10px", background: DASH.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <PaymentsIcon sx={{ color: "#fff", fontSize: 20 }} />
                              </Box>
                              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: DASH.ink }}>Amount to Pay</Typography>
                            </Box>
                            <Typography sx={{ fontWeight: 800, fontSize: "1.75rem", color: DASH.green }}>
                              ₹{getTotalPending().toLocaleString()}
                            </Typography>
                          </Box>

                          {/* Cash Payment Details */}
                          {selectedPaymentMethod === "cash" && (
                            <>
                              {/* Cash Received */}
                              <Box
                                sx={{
                                  mt: 2,
                                  p: 2,
                                  background: "#f0f9ff",
                                  borderRadius: "10px",
                                  border: "1px solid #3b82f6",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#1e40af" }}>
                                  💵 Cash Received
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: DASH.blue }}>
                                  ₹{totalCash.toLocaleString()}
                                </Typography>
                              </Box>

                              {/* Change to Return */}
                              {(() => {
                                const balance = totalCash - getTotalPending();
                                if (balance > 0) {
                                  return (
                                    <Box
                                      sx={{
                                        mt: 2,
                                        p: 2,
                                        background: DASH.greenLight,
                                        borderRadius: "10px",
                                        border: "1px solid #10b981",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#0E9F6E" }}>
                                        💰 Change to Return
                                      </Typography>
                                      <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: DASH.green }}>
                                        ₹{balance.toLocaleString()}
                                      </Typography>
                                    </Box>
                                  );
                                } else if (balance < 0) {
                                  return (
                                    <Box
                                      sx={{
                                        mt: 2,
                                        p: 2,
                                        background: DASH.redLight,
                                        borderRadius: "10px",
                                        border: "1px solid #ef4444",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#dc2626" }}>
                                        ⚠️ Short Amount
                                      </Typography>
                                      <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: DASH.red }}>
                                        ₹{Math.abs(balance).toLocaleString()}
                                      </Typography>
                                    </Box>
                                  );
                                } else {
                                  return (
                                    <Box
                                      sx={{
                                        mt: 2,
                                        p: 2,
                                        background: DASH.greenLight,
                                        borderRadius: "10px",
                                        border: "1px solid #10b981",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <CheckCircleIcon sx={{ color: DASH.green, fontSize: 20 }} />
                                      <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#0E9F6E" }}>
                                        Exact Amount - No Change Required
                                      </Typography>
                                    </Box>
                                  );
                                }
                              })()}
                            </>
                          )}
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
                          background: DASH.surface,
                          borderRadius: "10px",
                          border: `1px solid ${DASH.line}`,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: DASH.green }}>
                          <SecurityIcon sx={{ fontSize: 20 }} />
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>Secured</Typography>
                        </Box>
                        <Box sx={{ width: 1, height: 16, background: DASH.line }} />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: DASH.blue }}>
                          <VerifiedUserIcon sx={{ fontSize: 20 }} />
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>Verified</Typography>
                        </Box>
                        <Box sx={{ width: 1, height: 16, background: DASH.line }} />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#8b5cf6" }}>
                          <LockIcon sx={{ fontSize: 20 }} />
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>256-bit SSL</Typography>
                        </Box>
                      </Box>

                      {/* Offline Payment Notice */}
                      {!paymentProcessing && (
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", p: 2, mt: 2 }}>
                          <InfoOutlinedIcon sx={{ color: "#2563EB", fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: "0.78rem", color: "#1e40af", lineHeight: 1.6 }}>
                            <strong>Note:</strong> Confirming this will record the payment as received in the system. This is an <strong>offline process</strong> — the transaction is being logged manually based on the payment already collected from the student.
                          </Typography>
                        </Box>
                      )}

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
                          <Typography sx={{ fontWeight: 600, color: DASH.ink, fontSize: "1.1rem", mb: 0.5 }}>
                            Processing Payment
                          </Typography>
                          <Typography sx={{ color: DASH.muted, fontSize: "0.9rem" }}>
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
                    <Box sx={{ textAlign: "center", py: 3, px: 2 }}>
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
                            backgroundColor: `${DASH.green}12`,
                            animation: "pulse 2s ease-in-out infinite",
                          }}
                        />
                        <Box
                          sx={{
                            position: "relative",
                            width: 90,
                            height: 90,
                            borderRadius: "50%",
                            backgroundColor: DASH.green,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 12px 32px rgba(16, 185, 129, 0.35)",
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 50, color: "#fff" }} />
                        </Box>
                      </Box>

                      <Typography sx={{ fontWeight: 800, fontSize: "1.75rem", color: DASH.ink, mb: 0.5, letterSpacing: "-0.02em" }}>
                        Payment Successful!
                      </Typography>
                      <Typography sx={{ color: DASH.muted, mb: 4, fontSize: "1rem" }}>
                        Your transaction has been completed successfully
                      </Typography>

                      {/* Student Info Card */}
                      <Card
                        sx={{
                          borderRadius: "10px",
                          border: `1px solid ${DASH.line}`,
                          maxWidth: 600,
                          mx: "auto",
                          mb: 3,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                            <Avatar
                              sx={{
                                width: 56,
                                height: 56,
                                backgroundColor: DASH.violet,
                                fontSize: "1.3rem",
                                fontWeight: 700,
                              }}
                            >
                              {details?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST'}
                            </Avatar>
                            <Box sx={{ textAlign: "left", flex: 1 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: DASH.ink, mb: 0.5 }}>
                                {details?.name || 'Student Name'}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                <Typography sx={{ fontSize: "0.85rem", color: DASH.muted }}>
                                  Roll: <span style={{ fontWeight: 600, color: DASH.ink }}>{details?.rollNumber || rollNumber || '-'}</span>
                                </Typography>
                                <Typography sx={{ fontSize: "0.85rem", color: DASH.muted }}>
                                  Grade: <span style={{ fontWeight: 600, color: DASH.ink }}>{details?.grade || '-'}</span>
                                </Typography>
                                <Typography sx={{ fontSize: "0.85rem", color: DASH.muted }}>
                                  Section: <span style={{ fontWeight: 600, color: DASH.ink }}>{details?.section || '-'}</span>
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          {/* Transaction Details */}
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 6 }}>
                              <Box sx={{ textAlign: "left" }}>
                                <Typography sx={{ color: DASH.faint, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Bill ID
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: DASH.ink }}>
                                  {completedBillID || '-'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Box sx={{ textAlign: "left" }}>
                                <Typography sx={{ color: DASH.faint, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Date & Time
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: DASH.ink }}>
                                  {dayjs().format("DD MMM YYYY")}
                                </Typography>
                                <Typography sx={{ fontSize: "0.75rem", color: DASH.muted }}>
                                  {dayjs().format("hh:mm A")}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Box sx={{ textAlign: "left" }}>
                                <Typography sx={{ color: DASH.faint, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Payment Method
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  {paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.icon}
                                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: DASH.ink }}>
                                    {paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.name}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Box sx={{ textAlign: "left" }}>
                                <Typography sx={{ color: DASH.faint, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Paid Amount
                                </Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: DASH.green }}>
                                  ₹{completedPaymentAmount.toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>
                            {paymentFormData.transactionId && (
                              <Grid size={{ xs: 6 }}>
                                <Box sx={{ textAlign: "left" }}>
                                  <Typography sx={{ color: DASH.faint, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                    Transaction ID
                                  </Typography>
                                  <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: DASH.ink }}>
                                    {paymentFormData.transactionId}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}

                            {/* UPI Details */}
                            {selectedPaymentMethod === "upi" && paymentFormData.upiId && (
                              <Grid size={{ xs: 6 }}>
                                <Box sx={{ textAlign: "left" }}>
                                  <Typography sx={{ color: DASH.faint, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                    UPI ID
                                  </Typography>
                                  <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: DASH.ink }}>
                                    {paymentFormData.upiId}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}

                            {/* Net Banking Details */}
                            {selectedPaymentMethod === "netbanking" && paymentFormData.bankName && (
                              <Grid size={{ xs: 6 }}>
                                <Box sx={{ textAlign: "left" }}>
                                  <Typography sx={{ color: DASH.faint, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                    Bank Name
                                  </Typography>
                                  <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: DASH.ink }}>
                                    {paymentFormData.bankName}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}

                            {/* Cheque Details */}
                            {selectedPaymentMethod === "cheque" && (
                              <>
                                {paymentFormData.bankName && (
                                  <Grid size={{ xs: 6 }}>
                                    <Box sx={{ textAlign: "left" }}>
                                      <Typography sx={{ color: DASH.faint, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                        Bank Name
                                      </Typography>
                                      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: DASH.ink }}>
                                        {paymentFormData.bankName}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                                {paymentFormData.chequeNo && (
                                  <Grid size={{ xs: 6 }}>
                                    <Box sx={{ textAlign: "left" }}>
                                      <Typography sx={{ color: DASH.faint, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                        Cheque No
                                      </Typography>
                                      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: DASH.ink }}>
                                        {paymentFormData.chequeNo}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                                {paymentFormData.chequeDate && (
                                  <Grid size={{ xs: 6 }}>
                                    <Box sx={{ textAlign: "left" }}>
                                      <Typography sx={{ color: DASH.faint, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                        Cheque Date
                                      </Typography>
                                      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: DASH.ink }}>
                                        {dayjs(paymentFormData.chequeDate).format("DD MMM YYYY")}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                              </>
                            )}

                            {/* Card Details */}
                            {selectedPaymentMethod === "card" && (
                              <>
                                {paymentFormData.cardType && (
                                  <Grid size={{ xs: 6 }}>
                                    <Box sx={{ textAlign: "left" }}>
                                      <Typography sx={{ color: DASH.faint, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                        Card Type
                                      </Typography>
                                      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: DASH.ink }}>
                                        {paymentFormData.cardType}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                                {paymentFormData.cardLast4 && (
                                  <Grid size={{ xs: 6 }}>
                                    <Box sx={{ textAlign: "left" }}>
                                      <Typography sx={{ color: DASH.faint, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                        Card (Last 4)
                                      </Typography>
                                      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: DASH.ink }}>
                                        **** **** **** {paymentFormData.cardLast4}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                              </>
                            )}
                          </Grid>

                          <Divider sx={{ my: 2 }} />

                          {/* Payment Breakdown */}
                          <Box sx={{ textAlign: "left" }}>
                            <Typography sx={{ color: DASH.ink, fontSize: "0.9rem", fontWeight: 700, mb: 2 }}>
                              Payment Summary
                            </Typography>

                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                              <Typography sx={{ fontSize: "0.9rem", color: DASH.muted }}>
                                Amount Paid
                              </Typography>
                              <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: DASH.ink }}>
                                ₹{completedPaymentAmount.toLocaleString()}
                              </Typography>
                            </Box>

                            {selectedPaymentMethod === "cash" && (
                              <>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                                  <Typography sx={{ fontSize: "0.9rem", color: DASH.muted }}>
                                    💵 Cash Received
                                  </Typography>
                                  <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: DASH.ink }}>
                                    ₹{totalCash.toLocaleString()}
                                  </Typography>
                                </Box>

                                {(() => {
                                  const balance = totalCash - completedPaymentAmount;
                                  if (balance > 0) {
                                    return (
                                      <Box
                                        sx={{
                                          mt: 2,
                                          p: 2,
                                          backgroundColor: DASH.greenLight,
                                          borderRadius: "10px",
                                          border: "1px solid #10b981",
                                        }}
                                      >
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#0E9F6E" }}>
                                            💰 Change to Return
                                          </Typography>
                                          <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: DASH.green }}>
                                            ₹{balance.toLocaleString()}
                                          </Typography>
                                        </Box>
                                        {totalChange > 0 && (
                                          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #10b98130" }}>
                                            <Typography sx={{ fontSize: "0.75rem", color: "#0E9F6E", fontWeight: 600, mb: 1 }}>
                                              Change Breakdown:
                                            </Typography>
                                            <Grid container spacing={1}>
                                              {notesList.map((note) => {
                                                if (changeCounts[note] > 0) {
                                                  return (
                                                    <Grid size={{ xs: 6 }} key={note}>
                                                      <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                                                        <Typography sx={{ color: "#047857" }}>
                                                          ₹{note} × {changeCounts[note]}
                                                        </Typography>
                                                        <Typography sx={{ fontWeight: 600, color: "#047857" }}>
                                                          ₹{(note * changeCounts[note]).toLocaleString()}
                                                        </Typography>
                                                      </Box>
                                                    </Grid>
                                                  );
                                                }
                                                return null;
                                              })}
                                            </Grid>
                                          </Box>
                                        )}
                                      </Box>
                                    );
                                  } else if (balance < 0) {
                                    return (
                                      <Box
                                        sx={{
                                          mt: 2,
                                          p: 2,
                                          background: DASH.redLight,
                                          borderRadius: "10px",
                                          border: "1px solid #ef4444",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#dc2626" }}>
                                          ⚠️ Short Amount
                                        </Typography>
                                        <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: DASH.red }}>
                                          ₹{Math.abs(balance).toLocaleString()}
                                        </Typography>
                                      </Box>
                                    );
                                  } else {
                                    return (
                                      <Box
                                        sx={{
                                          mt: 2,
                                          p: 2,
                                          background: DASH.greenLight,
                                          borderRadius: "10px",
                                          border: "1px solid #10b981",
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <CheckCircleIcon sx={{ color: DASH.green, fontSize: 20 }} />
                                        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#0E9F6E" }}>
                                          Exact Amount - No Change Required
                                        </Typography>
                                      </Box>
                                    );
                                  }
                                })()}
                              </>
                            )}

                          </Box>
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
                          backgroundColor: `${DASH.green}12`,
                          borderRadius: "100px",
                          border: "1px solid #10b98125",
                        }}
                      >
                        <VerifiedUserIcon sx={{ fontSize: 20, color: DASH.green }} />
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: DASH.green }}>
                          Verified & Secured Payment
                        </Typography>
                      </Box>

                      {/* Offline Payment Notice */}
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", p: 2, mt: 2, textAlign: "left" }}>
                        <InfoOutlinedIcon sx={{ color: "#2563EB", fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: "0.78rem", color: "#1e40af", lineHeight: 1.6 }}>
                          <strong>Payment Recorded:</strong> This transaction has been saved in the system as an offline payment. The record will reflect in the student's fee history and financial reports.
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
                  backgroundColor: "#fff",
                }}
              >
                {!paymentSuccess && paymentStep > 0 && (
                  <Button
                    onClick={handlePaymentBack}
                    disabled={paymentProcessing}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
                      color: DASH.muted,
                      px: 2.5,
                      py: 1.2,
                      "&:hover": { background: DASH.lineSoft },
                    }}
                  >
                    Back
                  </Button>
                )}
                <Box sx={{ flex: 1 }} />

                {!paymentSuccess && (
                  <Button
                    onClick={handleCloseAttempt}
                    disabled={paymentProcessing}
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
                      color: DASH.muted,
                      border: `2px solid ${DASH.line}`,
                      px: 3,
                      mr: 1,
                      py: 1.2,
                      "&:hover": {
                        borderColor: "#555",
                        background: DASH.surface,
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
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 700,
                      px: 4,
                      py: 1.2,
                      backgroundColor: websiteSettings.mainColor,
                      color: websiteSettings.textColor,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      border: "1px solid rgba(0,0,0,0.1)",
                      "&:disabled": {
                        background: DASH.line,
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
                      borderRadius: RADIUS,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "13px",
                      height: 38,
                      px: 3.5,
                      backgroundColor: DASH.green,
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor: "#0E9F6E",
                        boxShadow: "0 2px 8px rgba(16,185,129,0.25)",
                      },
                      "&:disabled": {
                        background: DASH.faint,
                        boxShadow: "none",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {paymentProcessing ? "Processing..." : `Pay ₹${getTotalPending().toLocaleString()}`}
                  </Button>
                )}

                {paymentSuccess && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={handleOpenPrintReceipt}
                      sx={{
                        borderRadius: "10px",
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
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 700,
                        px: 4,
                        py: 1.2,
                        backgroundColor: websiteSettings.mainColor,
                        color: websiteSettings.textColor,
                        boxShadow: `0 4px 14px ${websiteSettings.mainColor}40`,
                        "&:hover": {
                          backgroundColor: websiteSettings.darkColor,
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

            {/* Confirmation Dialog for Closing with Unsaved Data */}
            <Dialog
              open={showCloseConfirmation}
              onClose={handleCancelClose}
              maxWidth="xs"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: "10px",
                  overflow: "hidden",
                },
              }}
            >
              <DialogContent sx={{ pt: 4, pb: 2, px: 3, textAlign: "center" }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: DASH.redLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontSize: "32px" }}>⚠️</Typography>
                </Box>
                <Typography sx={{ fontSize: "20px", fontWeight: 700, color: DASH.ink, mb: 1 }}>
                  Discard Payment Details?
                </Typography>
                <Typography sx={{ fontSize: "14px", color: DASH.muted, mb: 3 }}>
                  You have unsaved payment information. If you close now, all entered data will be lost.
                </Typography>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3, gap: 2, justifyContent: "center" }}>
                <Button
                  onClick={handleCancelClose}
                  variant="outlined"
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1.2,
                    border: `2px solid ${DASH.line}`,
                    color: DASH.muted,
                    "&:hover": {
                      border: "2px solid #cbd5e1",
                      background: DASH.surface,
                    },
                  }}
                >
                  Continue Payment
                </Button>
                <Button
                  onClick={handleConfirmClose}
                  variant="contained"
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    py: 1.2,
                    background: DASH.red,
                    "&:hover": {
                      background: "#dc2626",
                    },
                  }}
                >
                  Discard & Close
                </Button>
              </DialogActions>
            </Dialog>

            {/* Print Receipt Dialog */}
            <Dialog
              open={openPrintReceiptDialog}
              onClose={handleClosePrintReceipt}
              maxWidth="md"
              fullWidth
              keepMounted
              sx={{
                zIndex: 1400, // Higher than payment popup to appear on top
              }}
              PaperProps={{
                sx: {
                  borderRadius: "10px",
                  overflow: "hidden",
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Box
                  ref={printReceiptRef}
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: RADIUS,
                    px: 3,
                    "@media print": {
                      boxShadow: "none",
                    },
                  }}
                >
                  {/* Header with Logo */}
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
                      {websiteSettings?.title || ""}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      height: "1px",
                      width: "100%",
                      backgroundColor: "#ccc",
                      mb: 1,
                    }}
                  />

                  <Typography
                    sx={{
                      textAlign: "center",
                      // fontWeight: 600,
                      fontSize: "16px",
                      mb: 1,
                      color: DASH.muted,
                    }}
                  >
                    Payment Receipt - {feeTabs[value]}
                  </Typography>

                  {/* Student & Receipt Info Grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      border: `1px solid ${DASH.line}`,
                    }}
                  >
                    {[
                      { label: "Bill ID", value: completedBillID || '-' },
                      { label: "Student Name", value: details?.name || "-" },
                      { label: "Roll No", value: details?.rollNumber || rollNumber || "-" },
                      { label: "Class & Section", value: `${details?.grade || '-'} ${details?.section || ''}`.trim() },
                      { label: "Receipt Date", value: dayjs().format("DD/MM/YYYY") },
                    ].map((item, i) => (
                      <Box
                        key={i}
                        sx={{
                          borderRight: i !== 4 ? `1px solid ${DASH.line}` : "none",
                          p: 0.7,
                        }}
                      >
                        <Typography sx={{ color: "#888", fontSize: "12px" }}>{item.label}</Typography>
                        <Typography
                          sx={{
                            color: DASH.ink,
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

                  {/* Fee Details Table */}
                  <TableContainer
                    sx={{
                      border: `1px solid ${DASH.line}`,
                      mt: 1.5
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          {["S.No", "Fee Type", "Fee Details", "Fee Amount", "Paid Amount"].map((header, index) => (
                            <TableCell
                              key={index}
                              sx={{
                                backgroundColor: header === "Paid Amount" ? `${DASH.green}1A` : `${DASH.red}1A`,
                                fontWeight: header === "Paid Amount" ? 700 : 600,
                                textAlign: "center",
                                border: `1px solid ${DASH.line}`,
                                color: header === "Paid Amount" ? DASH.green : "#000",
                                fontSize: "14px",
                              }}
                            >
                              {header}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {completedPaymentFees && completedPaymentFees.length > 0 ? (
                          completedPaymentFees.map((fee, index) => (
                            <TableRow key={index}>
                              <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                                {index + 1}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px", fontWeight: 600 }}>
                                {feeTabs[value]}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                                {value === 1
                                  ? (fee.place || "-")
                                  : value === 2
                                    ? `${fee.activityName || "-"} - ${fee.activityCategory || "-"}`
                                    : value === 3
                                      ? (fee.feeName || "-")
                                      : (fee.feeDetails || "-")
                                }
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                                ₹{(fee.feeAmount || fee.amount || 0).toLocaleString()}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, bgcolor: `${DASH.green}0A`, color: DASH.green, fontSize: "14px", fontWeight: 700 }}>
                                ₹{(fee.paidAmount || fee.actualPaidAmount || (completedPaymentAmount / completedPaymentFees.length) || 0).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                              1
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px", fontWeight: 600 }}>
                              {feeTabs[value]}
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                              Payment
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, color: DASH.ink, fontSize: "14px" }}>
                              ₹{completedPaymentAmount.toLocaleString()}
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", border: `1px solid ${DASH.line}`, bgcolor: `${DASH.green}0A`, color: DASH.green, fontSize: "14px", fontWeight: 700 }}>
                              ₹{completedPaymentAmount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Total Paid Amount */}
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0 }}>
                    <Box sx={{
                      border: `1px solid ${DASH.green}`,
                      py: 1.5,
                      px: 4,
                      color: DASH.green,
                      fontWeight: "700",
                      backgroundColor: `${DASH.green}0A`,
                      borderTop: "none",
                      borderBottomLeftRadius: "5px",
                      mr: "-2px",
                      borderBottomRightRadius: "5px",
                      fontSize: "16px",
                    }}>
                      Paid Amount: <span style={{ marginLeft: "20px", fontSize: "18px" }}>₹{completedPaymentAmount.toLocaleString()}</span>
                    </Box>
                  </Box>

                  {/* Payment Details */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 1,
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: "15px", color: DASH.ink, mb: 0.5 }}>
                        <b>Paid amount in words:</b> {convertNumberToWords(completedPaymentAmount)} rupees only
                      </Typography>
                      <Typography sx={{ fontSize: "14px", color: "#666" }}>
                        <b>Payment Method:</b> {paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.name || '-'}
                      </Typography>
                      {paymentFormData.transactionId && (
                        <Typography sx={{ fontSize: "14px", color: "#666" }}>
                          <b>Transaction ID:</b> {paymentFormData.transactionId}
                        </Typography>
                      )}
                      <Typography sx={{ fontSize: "14px", color: "#666" }}>
                        <b>Payment Date:</b> {dayjs().format("DD MMMM YYYY, hh:mm A")}
                      </Typography>
                    </Box>

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

                {/* Dialog Actions */}
                <DialogActions sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1.5 }}>
                  <Button
                    onClick={handleClosePrintReceipt}
                    variant="outlined"
                    sx={{
                      borderColor: DASH.line,
                      color: DASH.text,
                      bgcolor: "#fff",
                      fontWeight: 700,
                      textTransform: "none",
                      borderRadius: RADIUS,
                      width: "100px",
                      height: 34,
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "#333",
                        bgcolor: "#f5f5f5",
                      }
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handlePrintReceipt}
                    variant="contained"
                    startIcon={<PrintIcon />}
                    sx={{
                      backgroundColor: websiteSettings.mainColor,
                      textTransform: "none",
                      color: websiteSettings.textColor,
                      width: "120px",
                      height: 34,
                      borderRadius: RADIUS,
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: websiteSettings.darkColor,
                      }
                    }}
                  >
                    Print
                  </Button>
                  <Button
                    onClick={handleDownloadReceipt}
                    variant="contained"
                    sx={{
                      backgroundColor: websiteSettings.mainColor,
                      textTransform: "none",
                      color: websiteSettings.textColor,
                      width: "130px",
                      height: 34,
                      borderRadius: RADIUS,
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: websiteSettings.darkColor,
                      }
                    }}
                  >
                    Download
                  </Button>
                </DialogActions>
              </Box>
            </Dialog>

            {/* <Dialog
              open={openHistoryPopup}
              onClose={() => setOpenHistoryPopup(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogContent>
                <Box sx={{ backgroundColor: DASH.canvas, px: 2, py: 1.2, borderBottom: `1px solid ${DASH.line}` }}>
                  <Grid container>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center" }}>

                      <Typography sx={{ fontWeight: 700, fontSize: "20px", color: DASH.ink, lineHeight: 1.2 }}>Transaction History</Typography>
                    </Grid>
                  </Grid>
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    border: `1px solid ${DASH.line}`,
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
                        borderRight: i !== 4 ? `1px solid ${DASH.line}` : "none",
                        p: 0.7,
                      }}
                    >
                      <Typography sx={{ color: "#888", fontSize: "12px" }}>{item.label}</Typography>
                      <Typography
                        sx={{
                          color: DASH.ink,
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

              </DialogContent>
            </Dialog> */}
          </>
        </Box>
      </Box>
    </Box>
  )
}