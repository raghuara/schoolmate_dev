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
import { findStudentEcaFeesBilling, findStudents, findStudentSchoolFeesBilling, findStudentAdditionalFeesBilling, postPaymentMethod, postEcaPaymentMethod, postAdditionalPaymentMethod, findStudentTransportFeesBilling, postTransportPaymentMethod } from '../../../../Api/Api';
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

  const currentYear = new Date().getFullYear();
  const currentAcademicYear = `${currentYear}-${currentYear + 1}`;
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);

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

  const [paymentStep, setPaymentStep] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [completedPaymentAmount, setCompletedPaymentAmount] = useState(0);
  const [completedPaymentFees, setCompletedPaymentFees] = useState([]);
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

  const handleSelect = (index) => {
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

      // Transport fees use camelCase field names, other fees use PascalCase
      const isTransportFee = value === 1;

      const paymentMethods = {
        totalPaidAmount: totalPaidAmount,
        paymentOption: selectedPaymentMethod.toUpperCase(),
        paidDate: dayjs().format('YYYY-MM-DD')
      };

      // Add remark field with correct casing based on fee type
      if (isTransportFee) {
        paymentMethods.remark = sanitizeInput(paymentFormData.remarks || `Payment via ${paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.name}`);
      } else {
        paymentMethods.Remark = sanitizeInput(paymentFormData.remarks || `Payment via ${paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.name}`);
      }

      switch (selectedPaymentMethod) {
        case 'upi':
          if (isTransportFee) {
            paymentMethods.upiid = sanitizeInput(paymentFormData.upiId || '');
            paymentMethods.transactionID = sanitizeInput(paymentFormData.transactionId || `UPI-TXN-${Date.now()}`);
          } else {
            paymentMethods.UPIID = sanitizeInput(paymentFormData.upiId || '');
            paymentMethods.TransactionID = sanitizeInput(paymentFormData.transactionId || `UPI-TXN-${Date.now()}`);
          }
          break;

        case 'netbanking':
          if (isTransportFee) {
            paymentMethods.transactionID = sanitizeInput(paymentFormData.transactionId || `NB-TXN-${Date.now()}`);
            paymentMethods.bankName = sanitizeInput(paymentFormData.bankName || '');
          } else {
            paymentMethods.TransactionID = sanitizeInput(paymentFormData.transactionId || `NB-TXN-${Date.now()}`);
            paymentMethods.BankName = sanitizeInput(paymentFormData.bankName || '');
          }
          break;

        case 'cheque':
          if (isTransportFee) {
            paymentMethods.transactionID = sanitizeInput(paymentFormData.transactionId || `CHQ-TXN-${Date.now()}`);
            paymentMethods.chequeNo = sanitizeInput(paymentFormData.chequeNo || '');
            paymentMethods.bankName = sanitizeInput(paymentFormData.bankName || '');
          } else {
            paymentMethods.TransactionID = sanitizeInput(paymentFormData.transactionId || `CHQ-TXN-${Date.now()}`);
            paymentMethods.ChequeNo = sanitizeInput(paymentFormData.chequeNo || '');
            paymentMethods.BankName = sanitizeInput(paymentFormData.bankName || '');
          }
          paymentMethods.ChequeDate = paymentFormData.chequeDate ? dayjs(paymentFormData.chequeDate).format('DD-MM-YYYY') : dayjs().format('DD-MM-YYYY');
          break;

        case 'card':
          if (isTransportFee) {
            paymentMethods.transactionID = sanitizeInput(paymentFormData.transactionId || `CARD-TXN-${Date.now()}`);
            paymentMethods.cardType = sanitizeInput(paymentFormData.cardType || '');
            paymentMethods.cardLastFourDigits = paymentFormData.cardLast4?.replace(/\D/g, '').substring(0, 4) || '';
          } else {
            paymentMethods.TransactionID = sanitizeInput(paymentFormData.transactionId || `CARD-TXN-${Date.now()}`);
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

      const res = await axios.post(apiEndpoint, payload, {
        params: {
          RollNumber: rollNumber,
          Year: selectedYear
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (res.data.success || res.status === 200) {
        setPaymentProcessing(false);
        setPaymentSuccess(true);

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
      case 'Paid': return '#10b981';
      case 'Partially Paid': return '#f59e0b';
      case 'Unpaid': return '#ef4444';
      default: return '#64748b';
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
      return {
        text: 'Paid',
        color: '#10b981',
        bgColor: '#d1fae5',
        icon: '✓',
        status: 'paid'
      };
    }

    if (!dueDate || dueDate === '' || dueDate === '-') {
      return {
        text: 'No Due Date',
        color: '#94a3b8',
        bgColor: '#f1f5f9',
        icon: '📅',
        status: 'none'
      };
    }

    const daysRemaining = getDaysRemaining(dueDate);

    if (daysRemaining === null) {
      return {
        text: 'Invalid Date',
        color: '#94a3b8',
        bgColor: '#f1f5f9',
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
        color: '#f59e0b',
        bgColor: '#fef3c7',
        icon: '⏰',
        status: 'soon'
      };
    } else if (daysRemaining <= 7) {
      return {
        text: `${daysRemaining} days left`,
        color: '#3b82f6',
        bgColor: '#dbeafe',
        icon: '📆',
        status: 'upcoming'
      };
    } else {
      return {
        text: dueDate,
        color: '#10b981',
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
    switch (value) {
      case 0:
        return schoolFee;
      case 1:
        return transportFeeElements;
      case 2:
        return ecaFeeElements;
      case 3:
        return additionalFeeElements;
      default:
        return [];
    }
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
  }, [selectedYear, value]);

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


  const fetchEcaDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(findStudentEcaFeesBilling, {
        params: {
          RollNumber: rollNumber,
          Year: selectedYear
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
          RollNumber: rollNumber,
          Year: selectedYear
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
          RollNumber: rollNumber,
          Year: selectedYear
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
                sx={{
                  textTransform: "none",
                  backgroundColor: "#000",
                  color: "#fff",
                  mr: 2,
                  fontSize: '14px',
                  height: "33px"
                }}
              >Special Concession / Reconcession</Button>
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
                      {getCurrentDetails().name}
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
                      {getCurrentDetails().rollnumber}
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
                      {getCurrentDetails().gender}
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
                      {getCurrentDetails().grade}
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
                      {getCurrentDetails().section}
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
          <Box sx={{ display: "flex",}}>
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
            {getCurrentFeeData().some(fee => parseFloat(fee.concessionAmount || 0) > 0) && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 0.5,
                  backgroundColor: "#e8f5e9",
                  border: "1px solid #4caf50",
                  py: 0.5,
                  width: "fit-content",
                  px: 2,
                  borderTopLeftRadius: "5px",
                  borderTopRightRadius: "5px",
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 15, color: "#2e7d32" }} />
                <Typography sx={{ color: "#2e7d32", fontSize: "12px", fontWeight: 600 }}>
                  Concession Applied
                </Typography>
              </Box>
            )}
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
                {getCurrentFeeData().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: "center", py: 8 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            backgroundColor: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 1
                          }}
                        >
                          <Typography sx={{ fontSize: "40px" }}>📋</Typography>
                        </Box>
                        <Typography sx={{ fontSize: "18px", fontWeight: 600, color: "#64748b" }}>
                          {getNoDataMessage()}
                        </Typography>
                        <Typography sx={{ fontSize: "14px", color: "#94a3b8" }}>
                          No fee records found for this student in the selected category
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
                            padding: "8px",
                          }}
                        >
                          {(() => {
                            const status = row.status?.toLowerCase();
                            let statusConfig = {
                              text: 'Unknown',
                              color: '#64748b',
                              bgColor: '#f1f5f9',
                              icon: '❓'
                            };

                            if (status === 'paid') {
                              statusConfig = {
                                text: 'Paid',
                                color: '#10b981',
                                bgColor: '#d1fae5',
                                icon: '✓'
                              };
                            } else if (status === 'notpaid') {
                              statusConfig = {
                                text: 'Not Paid',
                                color: '#ef4444',
                                bgColor: '#fee2e2',
                                icon: '✗'
                              };
                            } else if (status === 'partiallypaid') {
                              statusConfig = {
                                text: 'Partially Paid',
                                color: '#f59e0b',
                                bgColor: '#fef3c7',
                                icon: '◐'
                              };
                            }

                            return (
                              <Box
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: "6px",
                                  backgroundColor: statusConfig.bgColor,
                                  border: `1px solid ${statusConfig.color}30`,
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
                          })()}
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
                                  borderRadius: "6px",
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
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <>
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
                      fontWeight: 600,
                      fontSize: "20px",
                      mb: 1,
                      color: "#000",
                    }}
                  >
                    {Array.isArray(selectedFee) ? `Complete ${feeTabs[value]} Bill` : feeTabs[value]}
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      border: "1px solid #e0e0e0",
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
                          {["S.No", "Fee Details", "Fee Amount", "Paid Amount", "Pending Amount"].map((header, index) => (
                            <TableCell
                              key={index}
                              sx={{
                                backgroundColor: "#ff00001A",
                                fontWeight: header === "Paid Amount" ? 700 : 600,
                                textAlign: "center",
                                border: "1px solid #E601542A",
                                color: header === "Paid Amount" ? "#00963C" : "#000",
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
                            // Multiple fees - Entire Bill
                            selectedFee.map((fee, index) => (
                              <TableRow key={index}>
                                <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                                  {index + 1}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                                  {value === 1
                                    ? (fee.place || "-")
                                    : value === 2
                                      ? `${fee.activityName || "-"} - ${fee.activityCategory || "-"}`
                                      : value === 3
                                        ? (fee.feeName || "-")
                                        : (fee.feeDetails || "-")
                                  }
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                                  ₹{(fee.feeAmount || fee.amount || 0).toLocaleString()}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", bgcolor: "#00963C0A", color: "#00963C", fontSize: "14px", fontWeight: 700 }}>
                                  ₹{(fee.paidAmount || 0).toLocaleString()}
                                </TableCell>
                                <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                                  ₹{(fee.pendingAmount || 0).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            // Single fee
                            <TableRow>
                              <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                                1
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                                {value === 1
                                  ? (selectedFee.place || "-")
                                  : value === 2
                                    ? `${selectedFee.activityName || "-"} - ${selectedFee.activityCategory || "-"}`
                                    : value === 3
                                      ? (selectedFee.feeName || "-")
                                      : (selectedFee.feeDetails || "-")
                                }
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                                ₹{(selectedFee.feeAmount || selectedFee.amount || 0).toLocaleString()}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", bgcolor: "#00963C0A", color: "#00963C", fontSize: "14px", fontWeight: 700 }}>
                                ₹{(selectedFee.paidAmount || 0).toLocaleString()}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                                ₹{(selectedFee.pendingAmount || 0).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          )
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#999", fontSize: "14px", py: 3 }}>
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
                        border: "1px solid #00963C",
                        py: 1.5,
                        px: 4,
                        color: "#00963C",
                        fontWeight: "700",
                        backgroundColor: "#00963C0A",
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

            {getCurrentFeeData().length > 0 && (
              <>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", ml: 12 }}>
                    <Box sx={{ border: "1px solid #ccc", py: 1, px: 3, color: "#00963C", fontWeight: "600", borderTop: "none", borderBottomLeftRadius: "5px", backgroundColor: "#fff", }}>
                      Total Fees Amount
                    </Box>
                    <Box sx={{ border: "1px solid #ccc", borderLeft: "none", fontWeight: "600", py: 1, px: 2, color: "#00963C", borderTop: "none", borderBottomRightRadius: "5px", backgroundColor: "#fff", }}>
                      ₹{getTotalFeeAmount().toLocaleString()}
                    </Box>
                  </Box>
                  {areAllFeesPaid() && (
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
                      onClick={handlePrintEntireBill}
                    >
                      Print as Entire Bill
                    </Box>
                  )}
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
                      // Map tab value to feeType
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
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", mb: 1 }}>
                                  <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#64748b" }}>Amount to Pay</Typography>
                                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#1e293b" }}>
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
                                        background: isOverpaid ? "#ecfdf5" : "#fef2f2",
                                        borderRadius: "12px",
                                        border: `1px solid ${isOverpaid ? "#10b981" : "#ef4444"}`,
                                      }}
                                    >
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography sx={{ fontSize: "1.2rem" }}>
                                          {isOverpaid ? "💰" : "⚠️"}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: isOverpaid ? "#059669" : "#dc2626" }}>
                                          {isOverpaid ? "Change to Return" : "Short Amount"}
                                        </Typography>
                                      </Box>
                                      <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: isOverpaid ? "#10b981" : "#ef4444" }}>
                                        ₹{Math.abs(balance).toLocaleString()}
                                      </Typography>
                                    </Box>

                                    {/* Change Denomination Input */}
                                    {isOverpaid && (
                                      <Box sx={{ mt: 1 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#059669" }}>
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
                                              color: "#059669",
                                              border: "1px solid #10b981",
                                              "&:hover": { bgcolor: "#f0fdf4" },
                                            }}
                                          >
                                            Auto Fill
                                          </Button>
                                        </Box>

                                        <Box sx={{ background: "#f0fdf4", borderRadius: "12px", p: 2, border: "1px solid #10b981" }}>
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
                                              <Box sx={{ width: 50, py: 0.5, px: 1, background: "#fff", borderRadius: "6px", border: "1px solid #10b981", textAlign: "center" }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#047857" }}>₹{note}</Typography>
                                              </Box>
                                              <Typography sx={{ color: "#059669", fontSize: "1rem" }}>×</Typography>
                                              <TextField
                                                size="small"
                                                type="number"
                                                value={changeCounts[note]}
                                                onChange={(e) => handleChangeCount(note, e.target.value)}
                                                sx={{
                                                  width: 60,
                                                  "& .MuiOutlinedInput-root": {
                                                    borderRadius: "6px",
                                                    background: "#fff",
                                                    "& input": { textAlign: "center", fontWeight: 600, py: 0.5, fontSize: "0.8rem" },
                                                  },
                                                }}
                                              />
                                              <Typography sx={{ color: "#059669", fontSize: "1rem" }}>=</Typography>
                                              <Box sx={{ flex: 1, textAlign: "right" }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: getChangeSubtotal(note) > 0 ? "#047857" : "#94a3b8" }}>
                                                  ₹{getChangeSubtotal(note).toLocaleString()}
                                                </Typography>
                                              </Box>
                                            </Box>
                                          ))}

                                          <Divider sx={{ my: 1.5, borderColor: "#10b98130" }} />

                                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, background: "#fff", borderRadius: "8px" }}>
                                            <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#059669" }}>Total Change Given</Typography>
                                            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#047857" }}>
                                              ₹{totalChange.toLocaleString()}
                                            </Typography>
                                          </Box>

                                          {/* Validation Message */}
                                          {totalChange !== Math.abs(balance) && totalChange > 0 && (
                                            <Box sx={{ mt: 1, p: 1, background: "#fef2f2", borderRadius: "8px", border: "1px solid #ef4444" }}>
                                              <Typography sx={{ fontSize: "0.7rem", color: "#dc2626", textAlign: "center" }}>
                                                ⚠️ Change mismatch: Expected ₹{Math.abs(balance).toLocaleString()} but giving ₹{totalChange.toLocaleString()}
                                              </Typography>
                                            </Box>
                                          )}

                                          {totalChange === Math.abs(balance) && totalChange > 0 && (
                                            <Box sx={{ mt: 1, p: 1, background: "#ecfdf5", borderRadius: "8px", border: "1px solid #10b981" }}>
                                              <Typography sx={{ fontSize: "0.7rem", color: "#059669", textAlign: "center" }}>
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
                                      background: "#ecfdf5",
                                      borderRadius: "12px",
                                      border: "1px solid #10b981",
                                    }}
                                  >
                                    <CheckCircleIcon sx={{ color: "#10b981", fontSize: 20 }} />
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#059669" }}>
                                      Exact Amount - No Change Required
                                    </Typography>
                                  </Box>
                                )}

                                {/* Collection Summary */}
                                {totalCash > 0 && (
                                  <Box sx={{ mt: 2, p: 2, background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#64748b", mb: 1 }}>
                                      📊 Collection Summary
                                    </Typography>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                      {notesList.map((note) => {
                                        if (counts[note] > 0) {
                                          return (
                                            <Box key={note} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                              <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                                                ₹{note} × {counts[note]}
                                              </Typography>
                                              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#1e293b" }}>
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
                                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>{details.name}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ p: 2, background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Roll Number
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>{details.rollnumber}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ p: 2, background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Class & Section
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>{details.grade} - {details.section}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }} >
                              <Box sx={{ p: 2, background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Fee Type
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>
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
                              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#1e293b" }}>Amount to Pay</Typography>
                            </Box>
                            <Typography sx={{ fontWeight: 800, fontSize: "1.75rem", color: "#10b981" }}>
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
                                  borderRadius: "12px",
                                  border: "1px solid #3b82f6",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#1e40af" }}>
                                  💵 Cash Received
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: "#3b82f6" }}>
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
                                        background: "#ecfdf5",
                                        borderRadius: "12px",
                                        border: "1px solid #10b981",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#059669" }}>
                                        💰 Change to Return
                                      </Typography>
                                      <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: "#10b981" }}>
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
                                        background: "#fef2f2",
                                        borderRadius: "12px",
                                        border: "1px solid #ef4444",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#dc2626" }}>
                                        ⚠️ Short Amount
                                      </Typography>
                                      <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: "#ef4444" }}>
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
                                        background: "#ecfdf5",
                                        borderRadius: "12px",
                                        border: "1px solid #10b981",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <CheckCircleIcon sx={{ color: "#10b981", fontSize: 20 }} />
                                      <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#059669" }}>
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

                      {/* Student Info Card */}
                      <Card
                        sx={{
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
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
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                fontSize: "1.3rem",
                                fontWeight: 700,
                              }}
                            >
                              {details?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST'}
                            </Avatar>
                            <Box sx={{ textAlign: "left", flex: 1 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#1e293b", mb: 0.5 }}>
                                {details?.name || 'Student Name'}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                                  Roll: <span style={{ fontWeight: 600, color: "#1e293b" }}>{details?.rollNumber || rollNumber || '-'}</span>
                                </Typography>
                                <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                                  Grade: <span style={{ fontWeight: 600, color: "#1e293b" }}>{details?.grade || '-'}</span>
                                </Typography>
                                <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                                  Section: <span style={{ fontWeight: 600, color: "#1e293b" }}>{details?.section || '-'}</span>
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          {/* Transaction Details */}
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 6 }}>
                              <Box sx={{ textAlign: "left" }}>
                                <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Transaction ID
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#1e293b" }}>
                                  TXN{Date.now().toString().slice(-10)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Box sx={{ textAlign: "left" }}>
                                <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Date & Time
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#1e293b" }}>
                                  {dayjs().format("DD MMM YYYY")}
                                </Typography>
                                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                                  {dayjs().format("hh:mm A")}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Box sx={{ textAlign: "left" }}>
                                <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Payment Method
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  {paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.icon}
                                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }}>
                                    {paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.name}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Box sx={{ textAlign: "left" }}>
                                <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                                  Paid Amount
                                </Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#10b981" }}>
                                  ₹{completedPaymentAmount.toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          <Divider sx={{ my: 2 }} />

                          {/* Payment Breakdown */}
                          <Box sx={{ textAlign: "left" }}>
                            <Typography sx={{ color: "#1e293b", fontSize: "0.9rem", fontWeight: 700, mb: 2 }}>
                              Payment Summary
                            </Typography>

                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                              <Typography sx={{ fontSize: "0.9rem", color: "#64748b" }}>
                                Amount Paid
                              </Typography>
                              <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b" }}>
                                ₹{completedPaymentAmount.toLocaleString()}
                              </Typography>
                            </Box>

                            {selectedPaymentMethod === "cash" && (
                              <>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                                  <Typography sx={{ fontSize: "0.9rem", color: "#64748b" }}>
                                    💵 Cash Received
                                  </Typography>
                                  <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b" }}>
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
                                          background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                                          borderRadius: "12px",
                                          border: "1px solid #10b981",
                                        }}
                                      >
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#059669" }}>
                                            💰 Change to Return
                                          </Typography>
                                          <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: "#10b981" }}>
                                            ₹{balance.toLocaleString()}
                                          </Typography>
                                        </Box>
                                        {totalChange > 0 && (
                                          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #10b98130" }}>
                                            <Typography sx={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600, mb: 1 }}>
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
                                          background: "#fef2f2",
                                          borderRadius: "12px",
                                          border: "1px solid #ef4444",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#dc2626" }}>
                                          ⚠️ Short Amount
                                        </Typography>
                                        <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: "#ef4444" }}>
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
                                          background: "#ecfdf5",
                                          borderRadius: "12px",
                                          border: "1px solid #10b981",
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <CheckCircleIcon sx={{ color: "#10b981", fontSize: 20 }} />
                                        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#059669" }}>
                                          Exact Amount - No Change Required
                                        </Typography>
                                      </Box>
                                    );
                                  }
                                })()}
                              </>
                            )}

                            <Divider sx={{ my: 2 }} />

                            {/* Fee Items Paid */}
                            <Typography sx={{ color: "#1e293b", fontSize: "0.9rem", fontWeight: 700, mb: 1.5 }}>
                              Fee Items Paid ({selectedRows.length})
                            </Typography>
                            <Box sx={{ maxHeight: 180, overflowY: "auto", pr: 1 }}>
                              {selectedRows.map((index) => {
                                const fee = getCurrentFeeData()[index];
                                const amountPaid = toPayAmounts[index] || 0;
                                return (
                                  <Box
                                    key={index}
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      mb: 1,
                                      p: 1.5,
                                      background: "#f8fafc",
                                      borderRadius: "8px",
                                      border: "1px solid #e2e8f0",
                                    }}
                                  >
                                    <Box sx={{ flex: 1 }}>
                                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", mb: 0.3 }}>
                                        {fee?.feeName || fee?.feeDetails || fee?.activityName || `Fee ${index + 1}`}
                                      </Typography>
                                      <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                                        Total: ₹{fee?.feeAmount || fee?.amount || 0} | Pending: ₹{fee?.pendingAmount || 0}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: "right" }}>
                                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#10b981" }}>
                                        ₹{amountPaid.toLocaleString()}
                                      </Typography>
                                      <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
                                        paid
                                      </Typography>
                                    </Box>
                                  </Box>
                                );
                              })}
                            </Box>
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
                    onClick={handleCloseAttempt}
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

            {/* Confirmation Dialog for Closing with Unsaved Data */}
            <Dialog
              open={showCloseConfirmation}
              onClose={handleCancelClose}
              maxWidth="xs"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: "16px",
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
                    bgcolor: "#FEF2F2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontSize: "32px" }}>⚠️</Typography>
                </Box>
                <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", mb: 1 }}>
                  Discard Payment Details?
                </Typography>
                <Typography sx={{ fontSize: "14px", color: "#64748b", mb: 3 }}>
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
                    border: "2px solid #e2e8f0",
                    color: "#64748b",
                    "&:hover": {
                      border: "2px solid #cbd5e1",
                      background: "#f8fafc",
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
                    background: "#ef4444",
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
                  borderRadius: "16px",
                  overflow: "hidden",
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Box
                  ref={printReceiptRef}
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "6px",
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
                      fontWeight: 600,
                      fontSize: "20px",
                      mb: 1,
                      color: "#000",
                    }}
                  >
                    Payment Receipt - {feeTabs[value]}
                  </Typography>

                  {/* Student & Receipt Info Grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    {[
                      { label: "Transaction ID", value: `TXN${Date.now().toString().slice(-10)}` },
                      { label: "Student Name", value: details?.name || "-" },
                      { label: "Roll No", value: details?.rollNumber || rollNumber || "-" },
                      { label: "Class & Section", value: `${details?.grade || '-'} ${details?.section || ''}`.trim() },
                      { label: "Receipt Date", value: dayjs().format("DD/MM/YYYY") },
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

                  {/* Fee Details Table */}
                  <TableContainer
                    sx={{
                      border: "1px solid #E601542A",
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
                                backgroundColor: header === "Paid Amount" ? "#00963C1A" : "#ff00001A",
                                fontWeight: header === "Paid Amount" ? 700 : 600,
                                textAlign: "center",
                                border: "1px solid #E601542A",
                                color: header === "Paid Amount" ? "#00963C" : "#000",
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
                              <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                                {index + 1}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px", fontWeight: 600 }}>
                                {feeTabs[value]}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                                {value === 1
                                  ? (fee.place || "-")
                                  : value === 2
                                    ? `${fee.activityName || "-"} - ${fee.activityCategory || "-"}`
                                    : value === 3
                                      ? (fee.feeName || "-")
                                      : (fee.feeDetails || "-")
                                }
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                                ₹{(fee.feeAmount || fee.amount || 0).toLocaleString()}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", bgcolor: "#00963C0A", color: "#00963C", fontSize: "14px", fontWeight: 700 }}>
                                ₹{(fee.paidAmount || fee.actualPaidAmount || (completedPaymentAmount / completedPaymentFees.length) || 0).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                              1
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px", fontWeight: 600 }}>
                              {feeTabs[value]}
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                              Payment
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", color: "#000", fontSize: "14px" }}>
                              ₹{completedPaymentAmount.toLocaleString()}
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", border: "1px solid #E601542A", bgcolor: "#00963C0A", color: "#00963C", fontSize: "14px", fontWeight: 700 }}>
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
                      border: "1px solid #00963C",
                      py: 1.5,
                      px: 4,
                      color: "#00963C",
                      fontWeight: "700",
                      backgroundColor: "#00963C0A",
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
                      <Typography sx={{ fontSize: "15px", color: "#000", mb: 0.5 }}>
                        <b>Paid amount in words:</b> {convertNumberToWords(completedPaymentAmount)} rupees only
                      </Typography>
                      <Typography sx={{ fontSize: "14px", color: "#666" }}>
                        <b>Payment Method:</b> {paymentMethodOptions.find(m => m.id === selectedPaymentMethod)?.name || '-'}
                      </Typography>
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
                      borderColor: "#000",
                      color: "#000",
                      textTransform: "none",
                      borderRadius: "30px",
                      width: "100px",
                      height: "33px",
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
                      height: "33px",
                      borderRadius: "30px",
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
                      height: "33px",
                      borderRadius: "30px",
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

              </DialogContent>
            </Dialog>
          </>
        </Box>
      </Box>
    </Box>
  )
}