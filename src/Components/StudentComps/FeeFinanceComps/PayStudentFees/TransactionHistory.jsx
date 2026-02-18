import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Tooltip,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { schoolFeesRecordGet, ecaFeesRecordGet, additionalFeesRecordGet, transportFeesRecordGet } from '../../../../Api/Api';
import toast from 'react-hot-toast';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { rollNumber, year, feeType = 'schoolfee', activeTab } = location.state || {};

  const [isLoading, setIsLoading] = useState(true);
  const [transactionData, setTransactionData] = useState(null);
  const [selectedDenomination, setSelectedDenomination] = useState(null);
  const [denominationDialogOpen, setDenominationDialogOpen] = useState(false);

  const token = "123";

  useEffect(() => {
    if (rollNumber && year) {
      fetchTransactionHistory();
    }
  }, [rollNumber, year, feeType]);

  const fetchTransactionHistory = async () => {
    setIsLoading(true);
    try {
      let endpoint;
      let params;

      // Determine endpoint and params based on fee type
      switch (feeType) {
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
          params = { RollNumber: rollNumber, Year: year, FeesType: "schoolfee" };
          break;
      }

      const response = await axios.get(endpoint, {
        params: params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.error === false) {
        let processedData = response.data.data;

        // Transform transport fee data to match expected structure
        if (feeType === 'transport' && processedData.payments) {
          // Group payments by studentFeesElementID to create fee elements
          const feeElementsMap = {};

          processedData.payments.forEach((payment, index) => {
            const elementId = payment.studentFeesElementID || '1';

            if (!feeElementsMap[elementId]) {
              feeElementsMap[elementId] = {
                id: elementId,
                place: 'Transport Service', // Default, can be enhanced based on your data
                dueDate: '-',
                feeAmount: 0,
                paidAmount: 0,
                pendingAmount: 0,
                status: 'paid',
                attemptCount: 0,
                attempts: []
              };
            }

            // Add payment as an attempt
            feeElementsMap[elementId].attempts.push({
              attemptNo: feeElementsMap[elementId].attempts.length + 1,
              paidDate: payment.paidDate,
              paymentOption: payment.paymentOption,
              totalPaidAmount: payment.totalPaidAmount,
              upiid: payment.upiid,
              transactionID: payment.transactionID,
              bankName: payment.bankName,
              chequeNo: payment.chequeNo,
              cardType: payment.cardType,
              cardLastFourDigits: payment.cardLastFourDigits,
              remark: payment.remark,
              cashDenominations: processedData.cashDenominations?.filter(cd => cd.id === parseInt(payment.cashDenominationID))
            });

            feeElementsMap[elementId].paidAmount += payment.totalPaidAmount || 0;
            feeElementsMap[elementId].feeAmount += payment.totalPaidAmount || 0;
            feeElementsMap[elementId].attemptCount = feeElementsMap[elementId].attempts.length;
          });

          processedData.feesElements = Object.values(feeElementsMap);
        }

        setTransactionData(processedData);
      } else {
        toast.error(response.data.message || 'Failed to fetch transaction history');
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      toast.error('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  const getFeeTypeName = () => {
    switch (feeType) {
      case 'eca':
        return 'ECA Fee';
      case 'additional':
        return 'Additional Fee';
      case 'transport':
        return 'Transport Fee';
      default:
        return 'School Fee';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return { bg: '#E8F5E9', color: '#2E7D32', label: 'Paid' };
      case 'partiallypaid':
        return { bg: '#FFF3E0', color: '#F57C00', label: 'Partially Paid' };
      case 'pending':
        return { bg: '#FFEBEE', color: '#C62828', label: 'Pending' };
      default:
        return { bg: '#F5F5F5', color: '#616161', label: status };
    }
  };

  const getPaymentIcon = (paymentOption) => {
    switch (paymentOption?.toUpperCase()) {
      case 'CASH':
        return <LocalAtmIcon sx={{ fontSize: 16 }} />;
      case 'UPI':
        return <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />;
      case 'CARD':
        return <CreditCardIcon sx={{ fontSize: 16 }} />;
      case 'NETBANKING':
        return <AccountBalanceIcon sx={{ fontSize: 16 }} />;
      case 'CHEQUE':
        return <DescriptionIcon sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const handleViewDenomination = (cashDenominations) => {
    if (cashDenominations && cashDenominations.length > 0) {
      setSelectedDenomination(cashDenominations[0]);
      setDenominationDialogOpen(true);
    }
  };

  const renderDenominationTable = (denomination, type) => {
    // Handle both nested structure (school/ECA/additional) and flat structure (transport)
    const denomData = denomination.inwardsDenomination
      ? (type === 'inwards' ? denomination.inwardsDenomination : denomination.outwardsDenomination)
      : denomination; // For transport fees, the denomination object is already flat

    const notes = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

    return (
      <TableContainer sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', py: 1 }}>Denomination</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '13px', py: 1 }}>Count</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '13px', py: 1 }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notes.map((note) => {
              const key = type === 'inwards' ? `inWards${note}` : `outWards${note}`;
              const count = denomData[key] || 0;
              if (count > 0) {
                return (
                  <TableRow key={note}>
                    <TableCell sx={{ fontSize: '13px', py: 0.8 }}>₹{note}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '13px', py: 0.8 }}>{count}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '13px', fontWeight: 600, py: 0.8 }}>
                      ₹{(note * count).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              }
              return null;
            })}
            <TableRow sx={{ bgcolor: '#fafafa' }}>
              <TableCell colSpan={2} sx={{ fontWeight: 600, fontSize: '13px', py: 1 }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '13px', py: 1 }}>
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '86vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!transactionData) {
    return (
      <Box sx={{ border: '1px solid #ccc', borderRadius: '20px', p: 2, height: '86vh' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/dashboardmenu/fee/billing', { state: { rollNumber, activeTab } })}>
            <ArrowBackIcon />
          </IconButton>
          <Typography sx={{ fontSize: '20px', fontWeight: '600', ml: 1 }}>
            Transaction History
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <Typography sx={{ color: '#94a3b8' }}>No transaction history found</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: '20px', p: 2, height: '86vh', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton onClick={() => navigate('/dashboardmenu/fee/billing', { state: { rollNumber, activeTab } })}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ ml: 1 }}>
            <Typography sx={{ fontSize: '20px', fontWeight: '700', color: '#333' }}>
              Transaction History
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#666', mt: 0.3 }}>
              View complete payment history and transaction details
            </Typography>
          </Box>
        </Box>

        {/* Info Cards */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{
              border: '1px solid #e8e8e8',
              borderRadius: '8px',
              p: 1.5,
              bgcolor: '#fafafa'
            }}>
              <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>Fee Type</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: '700', color: '#333' }}>
                {getFeeTypeName()}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{
              border: '1px solid #e8e8e8',
              borderRadius: '8px',
              p: 1.5,
              bgcolor: '#fafafa'
            }}>
              <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>Academic Year</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: '700', color: '#333' }}>
                {year || '2024-2025'}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{
              border: '1px solid #e8e8e8',
              borderRadius: '8px',
              p: 1.5,
              bgcolor: '#fafafa'
            }}>
              <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>Roll Number</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: '700', color: '#333' }}>
                {rollNumber || '-'}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{
              border: '1px solid #e8e8e8',
              borderRadius: '8px',
              p: 1.5,
              bgcolor: '#fafafa'
            }}>
              <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>Total Fee Elements</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: '700', color: '#333' }}>
                {transactionData?.feesElements?.length || 0}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Student Information Table */}
      <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 'none', border: '1px solid #d0d0d0' }}>
        <Table sx={{ border: '1px solid #e8e8e8' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', width: '15%', py: 1.5, border: '1px solid #e8e8e8' }}>SI No</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', width: '30%', py: 1.5, border: '1px solid #e8e8e8' }}>Student Name</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', width: '20%', py: 1.5, border: '1px solid #e8e8e8' }}>Roll No</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', width: '20%', py: 1.5, border: '1px solid #e8e8e8' }}>Class & Section</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', width: '15%', py: 1.5, border: '1px solid #e8e8e8' }}>Gender</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontSize: '14px', py: 1.5, border: '1px solid #e8e8e8' }}>
                {feeType === 'eca'
                  ? transactionData.ecaFeesID || '-'
                  : feeType === 'additional'
                    ? transactionData.additionalFeesID || '-'
                    : feeType === 'transport'
                      ? '-'
                      : transactionData.primeSchoolFeeID || '-'}
              </TableCell>
              <TableCell sx={{ fontSize: '14px', fontWeight: 600, py: 1.5, border: '1px solid #e8e8e8' }}>{transactionData.name}</TableCell>
              <TableCell sx={{ fontSize: '14px', py: 1.5, border: '1px solid #e8e8e8' }}>{transactionData.rollnumber}</TableCell>
              <TableCell sx={{ fontSize: '14px', py: 1.5, border: '1px solid #e8e8e8' }}>{transactionData.grade} {transactionData.section}</TableCell>
              <TableCell sx={{ fontSize: '14px', py: 1.5, border: '1px solid #e8e8e8' }}>{transactionData.gender}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Fee Elements */}
      {transactionData.feesElements && transactionData.feesElements.length > 0 ? (
        transactionData.feesElements.map((feeElement, index) => {
          const statusInfo = getStatusColor(feeElement.status);

          return (
            <Card
              key={feeElement.id}
              sx={{
                mb: 3,
                boxShadow: 'none',
                border: '1px solid #d0d0d0',
                overflow: 'hidden'
              }}
            >
              {/* Fee Details Header Table */}
              <TableContainer>
                <Table sx={{ border: '1px solid #e8e8e8' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#ffe6e6' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '14px', color: '#000', py: 1.5, border: '1px solid #e8e8e8' }}>S.No</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '14px', color: '#000', py: 1.5, border: '1px solid #e8e8e8' }}>
                        {feeType === 'eca' ? 'Activity Category' : feeType === 'additional' ? 'Fee Name' : feeType === 'transport' ? 'Location/Place' : 'Fee Details'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '14px', color: '#000', py: 1.5, border: '1px solid #e8e8e8' }}>
                        {feeType === 'eca' ? 'Activity Name' : feeType === 'additional' ? 'Due Date' : feeType === 'transport' ? 'Due Date' : 'Fee Description'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '14px', color: '#000', py: 1.5, border: '1px solid #e8e8e8' }}>Fee Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ bgcolor: '#fff' }}>
                      <TableCell sx={{ fontSize: '14px', py: 1.5, border: '1px solid #e8e8e8' }}>{index + 1}</TableCell>
                      <TableCell sx={{ fontSize: '14px', fontWeight: 600, py: 1.5, border: '1px solid #e8e8e8' }}>
                        {feeType === 'eca'
                          ? feeElement.activityCategory
                          : feeType === 'additional'
                            ? feeElement.feeName
                            : feeType === 'transport'
                              ? feeElement.place
                              : feeElement.feeDetails}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px', py: 1.5, border: '1px solid #e8e8e8' }}>
                        {feeType === 'eca'
                          ? feeElement.activityName
                          : feeType === 'additional'
                            ? feeElement.dueDate
                            : feeType === 'transport'
                              ? feeElement.dueDate
                              : feeElement.feeDescription}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px', fontWeight: 700, py: 1.5, border: '1px solid #e8e8e8' }}>₹{feeElement.feeAmount?.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Fee Summary */}
              <Box sx={{ p: 2, bgcolor: '#fafafa', borderTop: '1px solid #e8e8e8' }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '14px', color: '#666' }}>Total Fee:</Typography>
                      <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>
                        ₹{feeElement.feeAmount?.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '14px', color: '#666' }}>Paid Amount:</Typography>
                      <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#2E7D32' }}>
                        ₹{feeElement.paidAmount?.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '14px', color: '#666' }}>Pending Amount:</Typography>
                      <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#d32f2f' }}>
                        ₹{feeElement.pendingAmount?.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                  <Chip
                    label={statusInfo.label}
                    icon={feeElement.status?.toLowerCase() === 'paid' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <PendingActionsIcon sx={{ fontSize: 14 }} />}
                    size="small"
                    sx={{
                      bgcolor: statusInfo.bg,
                      color: statusInfo.color,
                      fontWeight: 600,
                      fontSize: '12px'
                    }}
                  />
                  <Typography sx={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>
                    Total {feeElement.attemptCount} {feeElement.attemptCount === 1 ? 'Payment' : 'Payments'}
                  </Typography>
                </Box>
              </Box>

              {/* Payment History Table */}
              {feeElement.attempts && feeElement.attempts.length > 0 && (
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: '15px', fontWeight: 700, mb: 2, color: '#333' }}>
                    Payment History
                  </Typography>
                  <TableContainer sx={{ border: '1px solid #e8e8e8' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '13px', py: 1, border: '1px solid #e8e8e8' }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '13px', py: 1, border: '1px solid #e8e8e8' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '13px', py: 1, border: '1px solid #e8e8e8' }}>Payment Method</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '13px', py: 1, border: '1px solid #e8e8e8' }}>Transaction Details</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '13px', py: 1, border: '1px solid #e8e8e8' }}>Remark</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '13px', py: 1, border: '1px solid #e8e8e8' }}>Amount Paid</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, fontSize: '13px', py: 1, border: '1px solid #e8e8e8' }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {feeElement.attempts.map((attempt, attemptIndex) => (
                          <TableRow
                            key={attemptIndex}
                            sx={{
                              '&:hover': { bgcolor: '#fafafa' }
                            }}
                          >
                            {/* Attempt Number */}
                            <TableCell sx={{ py: 1.2, border: '1px solid #e8e8e8' }}>
                              <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                {attempt.attemptNo}
                              </Typography>
                            </TableCell>

                            {/* Date */}
                            <TableCell sx={{ py: 1.2, border: '1px solid #e8e8e8' }}>
                              <Typography sx={{ fontSize: '13px' }}>
                                {attempt.paidDate}
                              </Typography>
                            </TableCell>

                            {/* Payment Method */}
                            <TableCell sx={{ py: 1.2, border: '1px solid #e8e8e8' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                {getPaymentIcon(attempt.paymentOption)}
                                <Typography sx={{ fontSize: '13px' }}>
                                  {attempt.paymentOption}
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* Transaction Details */}
                            <TableCell sx={{ py: 1.2, border: '1px solid #e8e8e8' }}>
                              {attempt.paymentOption?.toUpperCase() === 'UPI' && (
                                <Box>
                                  <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                    ID: {attempt.upiid || '-'}
                                  </Typography>
                                  <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                    Txn: {attempt.transactionID || '-'}
                                  </Typography>
                                </Box>
                              )}

                              {attempt.paymentOption?.toUpperCase() === 'CARD' && (
                                <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                  {attempt.cardType || '-'} **** {attempt.cardLastFourDigits || '-'}
                                </Typography>
                              )}

                              {(attempt.paymentOption?.toUpperCase() === 'NETBANKING' || attempt.paymentOption?.toUpperCase() === 'CHEQUE') && (
                                <Box>
                                  <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                    {attempt.bankName || '-'}
                                  </Typography>
                                  {attempt.paymentOption?.toUpperCase() === 'CHEQUE' && (
                                    <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                      Cheque: {attempt.chequeNo || '-'}
                                    </Typography>
                                  )}
                                </Box>
                              )}

                              {attempt.paymentOption?.toUpperCase() === 'CASH' && (
                                <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                  Cash Payment
                                </Typography>
                              )}
                            </TableCell>

                            {/* Remark */}
                            <TableCell sx={{ py: 1.2, border: '1px solid #e8e8e8' }}>
                              <Tooltip title={attempt.remark || 'No remark'}>
                                <Typography sx={{
                                  fontSize: '12px',
                                  color: '#666',
                                  maxWidth: '120px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {attempt.remark || '-'}
                                </Typography>
                              </Tooltip>
                            </TableCell>

                            {/* Amount */}
                            <TableCell align="right" sx={{ py: 1.2, border: '1px solid #e8e8e8' }}>
                              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#2E7D32' }}>
                                ₹{attempt.totalPaidAmount?.toLocaleString()}
                              </Typography>
                            </TableCell>

                            {/* Action */}
                            <TableCell align="center" sx={{ py: 1.2, border: '1px solid #e8e8e8' }}>
                              {attempt.paymentOption?.toUpperCase() === 'CASH' && attempt.cashDenominations && attempt.cashDenominations.length > 0 && (
                                <Tooltip title="View Cash Denomination">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewDenomination(attempt.cashDenominations)}
                                    sx={{
                                      border: '1px solid #e8e8e8',
                                      '&:hover': {
                                        bgcolor: '#f5f5f5'
                                      }
                                    }}
                                  >
                                    <VisibilityIcon sx={{ fontSize: 16 }} />
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
            </Card>
          );
        })
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontSize: '16px', color: '#666' }}>
            No fee elements found
          </Typography>
        </Box>
      )}

      {/* Cash Denomination Dialog */}
      <Dialog
        open={denominationDialogOpen}
        onClose={() => setDenominationDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <DialogTitle sx={{
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalAtmIcon />
            <Typography sx={{ fontSize: '18px', fontWeight: '600' }}>
              Cash Denomination Breakdown
            </Typography>
          </Box>
          <IconButton onClick={() => setDenominationDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedDenomination && (
            <Grid container spacing={3}>
              {/* Inwards */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ bgcolor: '#fafafa', p: 2, borderRadius: '8px', mb: 2, border: '1px solid #e8e8e8' }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#333', mb: 1 }}>
                    Cash Received (Inwards)
                  </Typography>
                  <Typography sx={{ fontSize: '22px', fontWeight: '700', color: '#2E7D32' }}>
                    ₹{(selectedDenomination.inWardsTotal || selectedDenomination.totalInwards || 0).toLocaleString()}
                  </Typography>
                </Box>
                {renderDenominationTable(selectedDenomination, 'inwards')}
              </Grid>

              {/* Outwards */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ bgcolor: '#fafafa', p: 2, borderRadius: '8px', mb: 2, border: '1px solid #e8e8e8' }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#333', mb: 1 }}>
                    Change Returned (Outwards)
                  </Typography>
                  <Typography sx={{ fontSize: '22px', fontWeight: '700', color: '#d32f2f' }}>
                    ₹{(selectedDenomination.outWardsTotal || selectedDenomination.outWardsdenomination || 0).toLocaleString()}
                  </Typography>
                </Box>
                {renderDenominationTable(selectedDenomination, 'outwards')}
              </Grid>

              {/* Net Amount */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ bgcolor: '#f5f5f5', p: 2.5, borderRadius: '8px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#666', mb: 1 }}>
                    Net Amount Collected
                  </Typography>
                  <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#333' }}>
                    ₹{(selectedDenomination.totalInwards || selectedDenomination.inWardsTotal || 0).toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#999', mt: 1 }}>
                    Created on: {selectedDenomination.createdOn || '-'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e8e8e8' }}>
          <Button
            onClick={() => setDenominationDialogOpen(false)}
            variant="contained"
            sx={{
              textTransform: 'none',
              bgcolor: '#333',
              borderRadius: '8px',
              px: 3,
              fontWeight: 600,
              '&:hover': { bgcolor: '#555' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionHistory;
