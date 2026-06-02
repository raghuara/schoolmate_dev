import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import {
  Autocomplete, Button, Chip, Dialog, Grid, IconButton,
  InputAdornment, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import axios from 'axios'
import { additionalFeeFetch, updateAdditionalFee, deleteAdditionalFeesStructure } from '../../../../Api/Api'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice'
import { selectGrades } from '../../../../Redux/Slices/DropdownController'

export default function CreatedExtraFees() {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth)
  const rollNumber = user.rollNumber
  const userType = user.userType
  const token = '123'
  const websiteSettings = useSelector(selectWebsiteSettings)
  const grades = useSelector(selectGrades) || []
  const isExpanded = useSelector((state) => state.sidebar.isExpanded)

  
  const getGradeEntries = (item) => {
    if (item.grades && typeof item.grades === 'object') {
      return Object.entries(item.grades).filter(
        ([, amount]) => amount !== null && amount !== undefined && amount !== ''
      )
    }
    if (grades.length > 0) {
      return grades
        .map((g) => [g.sign, item[g.sign.toLowerCase()]])
        .filter(([, amount]) => amount !== null && amount !== undefined && amount !== '')
    }
    return []
  }

  const currentYear = new Date().getFullYear()
  const currentAcademicYear = `${currentYear}-${currentYear + 1}`
  const academicYears = [
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
  ]

  const [selectedYear, setSelectedYear] = useState(currentAcademicYear)
  const [feeList, setFeeList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [openCal, setOpenCal] = useState(false)

  // SnackBar
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(false)
  const [color, setColor] = useState(false)
  const [message, setMessage] = useState('')

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editActivity, setEditActivity] = useState(null)
  const [editFees, setEditFees] = useState({
    feeName: '',
    remarks: '',
    amount: '',
    dueDate: null,
  })

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const formatDate = (d) => (d ? dayjs(d).format('DD-MM-YYYY') : '-')

  useEffect(() => {
    getAdditionalFees()
  }, [selectedYear])

  const getAdditionalFees = async () => {
    setIsLoading(true)
    try {
      const res = await axios.get(additionalFeeFetch, {
        params: { Year: selectedYear },
        headers: { Authorization: `Bearer ${token}` },
      })
      setFeeList(res.data)
    } catch (error) {
      setMessage('Failed to load additional fees')
      setOpen(true); setColor(false); setStatus(false)
    } finally {
      setIsLoading(false)
    }
  }


  const handleEdit = (item) => {
    setEditActivity(item)
    setEditFees({
      feeName: item.feeName || '',
      remarks: item.remarks || '',
      amount: item.feeAmount !== undefined ? String(item.feeAmount) : '',
      dueDate: item.dueDate ? dayjs(item.dueDate) : null,
    })
    setEditOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!editFees.feeName.trim()) {
      setMessage('Fee Name is required'); setOpen(true); setColor(false); setStatus(false); return
    }
    if (!editFees.remarks.trim()) {
      setMessage('Remarks are required'); setOpen(true); setColor(false); setStatus(false); return
    }
    if (!editFees.amount) {
      setMessage('Fee Amount is required'); setOpen(true); setColor(false); setStatus(false); return
    }
    setIsLoading(true)
    try {
      const sendData = {
        additionalFeesID: editActivity.additionalFeesID || editActivity.id,
        rollNumber,
        year: selectedYear,
        feeName: editFees.feeName,
        remarks: editFees.remarks,
        paid: 'Y',
        feeAmount: Number(editFees.amount),
        dueDate: editFees.dueDate ? dayjs(editFees.dueDate).format('YYYY-MM-DD') : null,
      }
      await axios.put(updateAdditionalFee, sendData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage(userType === 'superadmin' ? 'Additional Fee updated successfully' : 'Requested successfully')
      setOpen(true); setColor(true); setStatus(true)
      setEditOpen(false)
      getAdditionalFees()
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Failed to update additional fee')
      setOpen(true); setColor(false); setStatus(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (item) => {
    setDeleteTarget(item)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsLoading(true)
    try {
      await axios.delete(deleteAdditionalFeesStructure, {
        params: {
          additionalFeesID: deleteTarget.additionalFeesID || deleteTarget.id,
          RollNumber: rollNumber,
        },
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage(userType === 'superadmin' ? 'Additional Fee deleted successfully' : 'Requested successfully')
      setOpen(true); setColor(true); setStatus(true)
      setDeleteOpen(false); setDeleteTarget(null)
      getAdditionalFees()
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Failed to delete additional fee')
      setOpen(true); setColor(false); setStatus(false)
    } finally {
      setIsLoading(false)
    }
  }

  const canEditActivity = (item) => {
    if (item.isAnyStudentPaid === true) return false
    if (item.isEditable === false) return false
    if (typeof item.paidStudents === 'number') return item.paidStudents === 0
    return true
  }

  return (
    <Box>
      <Box sx={{ width: '100%' }}>
        <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
        {isLoading && <Loader />}

        {/* Header */}
        <Box sx={{
          position: 'fixed', top: '60px',
          left: isExpanded ? '260px' : '80px',
          right: 0, backgroundColor: '#f2f2f2',
          px: 2, borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd',
          zIndex: 1200, transition: 'left 0.3s ease-in-out', py: 0.7,
        }}>
          <Grid container>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => navigate(-1)} sx={{ width: '27px', height: '27px', mt: '2px' }}>
                <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
              </IconButton>
              <Typography sx={{ fontWeight: '600', fontSize: '19px' }}>Created Additional Fees</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
              <Autocomplete
                size="small"
                options={academicYears}
                sx={{ width: '170px' }}
                value={selectedYear}
                onChange={(e, newValue) => setSelectedYear(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14, height: 35 },
                      '& .MuiOutlinedInput-input': { textAlign: 'center', fontWeight: '600' },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Content */}
        <Box sx={{ px: 2, pb: 2, pt: '68px' }}>

          {/* Info note */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            bgcolor: '#FFF8E1', border: '1px solid #FFE082',
            borderRadius: '8px', px: 2, py: 1, mb: 2, mt: 1,
          }}>
            <InfoOutlinedIcon sx={{ fontSize: 18, color: '#F9A825', flexShrink: 0 }} />
            <Typography sx={{ fontSize: 13, color: '#795548' }}>
              Editing and deleting fee details is only allowed before any student has paid. Once even one student has paid, both edit and delete will be disabled.
            </Typography>
          </Box>

          {feeList?.length === 0 ? (
            <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '10px', py: 5, px: 4, textAlign: 'center', mt: 2 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#333', mb: 1 }}>
                No additional fees available
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#666', maxWidth: '420px', mx: 'auto' }}>
                Additional fees have not been configured for the selected academic year.
                Please check back later or create a new fee.
              </Typography>
            </Box>
          ) : (
            feeList.map((item, index) => (
              <React.Fragment key={item.additionalFeesID || index}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{
                    bgcolor: '#FF6B35', color: '#fff', fontSize: '13px',
                    mt: '10px', px: 3, py: 0.2, ml: '15px', fontWeight: 600,
                    borderTopLeftRadius: '7px', borderTopRightRadius: '7px', width: 'fit-content',
                  }}>
                    {item.feeName}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: '10px' }}>
                    <Tooltip title={canEditActivity(item) ? 'Edit Fee' : 'Cannot edit — one or more students have already paid'} arrow>
                      <span>
                        <IconButton
                          onClick={() => canEditActivity(item) && handleEdit(item)}
                          disabled={!canEditActivity(item)}
                          sx={{
                            width: 30, height: 30, border: '1px solid #e0e0e0',
                            bgcolor: canEditActivity(item) ? '#f5f5f5' : '#f0f0f0',
                            '&:hover': canEditActivity(item) ? { bgcolor: '#E3F2FD', borderColor: '#1976D2' } : {},
                            '&.Mui-disabled': { opacity: 0.45 },
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16, color: canEditActivity(item) ? '#1976D2' : '#bbb' }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={canEditActivity(item) ? 'Delete Fee' : 'Cannot delete — one or more students have already paid'} arrow>
                      <span>
                        <IconButton
                          onClick={() => canEditActivity(item) && handleDeleteClick(item)}
                          disabled={!canEditActivity(item)}
                          sx={{
                            width: 30, height: 30, border: '1px solid #e0e0e0',
                            bgcolor: canEditActivity(item) ? '#f5f5f5' : '#f0f0f0',
                            '&:hover': canEditActivity(item) ? { bgcolor: '#FFEBEE', borderColor: '#f44336' } : {},
                            '&.Mui-disabled': { opacity: 0.45 },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16, color: canEditActivity(item) ? '#f44336' : '#bbb' }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>

                <Box p={2} sx={{ backgroundColor: '#fff', border: '1px solid #FFD5C2', borderRadius: '5px' }}>
                  {(() => {
                    const gradeEntries = getGradeEntries(item)
                    const isGradeWise = gradeEntries.length > 0

                    
                    if (isGradeWise) {
                      return (
                        <>
                          <TableContainer sx={{ border: '1px solid #FFD5C2', backgroundColor: '#fff', boxShadow: 'none', borderBottom: 'none' }}>
                            <Table stickyHeader sx={{ minWidth: '100%' }}>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center', backgroundColor: '#FFF5F2' }}>Fee Name</TableCell>
                                  <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center', backgroundColor: '#FFF5F2' }}>Remarks</TableCell>
                                  <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center', backgroundColor: '#FFF5F2' }}>Payment Status</TableCell>
                                  <TableCell sx={{ textAlign: 'center', backgroundColor: '#FFF5F2' }}>Due Date</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center' }}>{item.feeName}</TableCell>
                                  <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center' }}>{item.remarks}</TableCell>
                                  <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center' }}>{item.paid === 'Y' ? 'Paid' : 'Unpaid'}</TableCell>
                                  <TableCell sx={{ textAlign: 'center' }}>{formatDate(item.dueDate)}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>

                          <Box sx={{ backgroundColor: '#FFEDE5', p: 3, border: '1px solid #FFD5C2', borderTop: 'none' }}>
                            <Grid container spacing={2}>
                              {gradeEntries.map(([gradeKey, amount]) => (
                                <Grid size={{ xs: 6, sm: 4, md: 2, lg: 1.5 }} key={gradeKey}>
                                  <Typography sx={{ color: '#EA580C', fontSize: '12px', mb: 0.5 }}>
                                    {String(gradeKey).toUpperCase()}
                                  </Typography>
                                  <Box sx={{
                                    border: '1px solid #0000003A', borderRadius: '5px',
                                    height: '30px', backgroundColor: '#F6F6F8',
                                    px: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    ₹ {amount}
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        </>
                      )
                    }

                    
                    return (
                      <TableContainer sx={{ border: '1px solid #FFD5C2', backgroundColor: '#fff', boxShadow: 'none', borderBottom: 'none' }}>
                        <Table stickyHeader sx={{ minWidth: '100%' }}>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center', backgroundColor: '#FFF5F2' }}>Fee Name</TableCell>
                              <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center', backgroundColor: '#FFF5F2' }}>Remarks</TableCell>
                              <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center', backgroundColor: '#FFF5F2' }}>Payment Status</TableCell>
                              <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center', backgroundColor: '#FFF5F2' }}>Fee Amount</TableCell>
                              <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center', backgroundColor: '#FFF5F2' }}>Due Date</TableCell>
                              <TableCell sx={{ borderColor: '#FFD5C2', textAlign: 'center', backgroundColor: '#FFF5F2' }}>Created By</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center' }}>{item.feeName}</TableCell>
                              <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center' }}>{item.remarks}</TableCell>
                              <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center' }}>{item.paid === 'Y' ? 'Paid' : 'Unpaid'}</TableCell>
                              <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center' }}>₹ {item.feeAmount}</TableCell>
                              <TableCell sx={{ borderRight: 1, borderColor: '#FFD5C2', textAlign: 'center' }}>{formatDate(item.dueDate)}</TableCell>
                              <TableCell sx={{ borderColor: '#FFD5C2', textAlign: 'center' }}>
                                {item.createdByRollName} - {item.createdByRollNumber}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )
                  })()}
                </Box>
              </React.Fragment>
            ))
          )}
        </Box>

        {/* ── Edit Dialog ───────────────────────────────────────────────────── */}
        <Dialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: '10px', overflow: 'hidden' } }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 1.5, backgroundColor: '#f2f2f2', borderBottom: '1px solid #ddd' }}>
            <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>Edit Additional Fee</Typography>
            <IconButton size="small" onClick={() => setEditOpen(false)}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ p: 2 }}>
            <Box sx={{ border: '1px solid #FFD5C2', borderRadius: '5px', overflow: 'hidden' }}>
              {/* Orange header */}
              <Box sx={{ background: '#FFF5F2', borderBottom: '1px solid #FFD5C2', px: 3, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '6px', backgroundColor: '#FFD5C2', border: '1px solid #FFB088', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EditIcon sx={{ color: '#EA580C', fontSize: 15 }} />
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#C2410C' }}>Fee Details</Typography>
              </Box>

              <Grid container rowSpacing={2} columnSpacing={4} p={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Fee Name</Typography>
                  <TextField
                    size="small"
                    value={editFees.feeName}
                    onChange={(e) => setEditFees((prev) => ({ ...prev, feeName: e.target.value }))}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 }, width: '100%' }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Remarks</Typography>
                  <TextField
                    size="small"
                    value={editFees.remarks}
                    onChange={(e) => setEditFees((prev) => ({ ...prev, remarks: e.target.value }))}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 }, width: '100%' }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Fee Amount</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={editFees.amount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 8)
                      setEditFees((prev) => ({ ...prev, amount: val }))
                    }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment>, inputMode: 'numeric' } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Due Date</Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      open={openCal}
                      onClose={() => setOpenCal(false)}
                      value={editFees.dueDate}
                      onChange={(newValue) => { setEditFees((prev) => ({ ...prev, dueDate: newValue })); setOpenCal(false) }}
                      disablePast
                      views={['year', 'month', 'day']}
                      renderInput={() => null}
                      sx={{ opacity: 0, pointerEvents: 'none', width: '0px' }}
                      slotProps={{
                        day: {
                          sx: () => ({
                            '&.Mui-selected': { backgroundColor: `${websiteSettings.mainColor} !important`, color: '#000', border: `1px solid ${websiteSettings.mainColor}` },
                            '&.MuiPickersDay-today': { border: `1px solid ${websiteSettings.mainColor}`, color: '#000' },
                            '&.Mui-selected.MuiPickersDay-today': { backgroundColor: `${websiteSettings.mainColor} !important`, border: `1px solid ${websiteSettings.mainColor}`, color: '#000' },
                          }),
                        },
                      }}
                    />
                    <Button
                      sx={{ width: '150px', height: '35px', backgroundColor: '#F3E5F5', textTransform: 'none', color: '#8600BB' }}
                      onClick={() => setOpenCal(true)}
                    >
                      {editFees.dueDate ? formatDate(editFees.dueDate) : 'Add Due Date'}
                      <CalendarMonthIcon style={{ color: '#8600BB', marginLeft: '10px', fontSize: '20px' }} />
                    </Button>
                    {editFees.dueDate && (
                      <Tooltip title="Clear Due Date">
                        <IconButton sx={{ width: '33px', height: '33px' }} onClick={() => setEditFees((prev) => ({ ...prev, dueDate: null }))}>
                          <HighlightOffIcon style={{ color: 'red' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'end', px: 2, py: 1.5, borderTop: '1px solid #eee', gap: 1 }}>
            <Button
              onClick={() => setEditOpen(false)}
              sx={{ border: '1px solid #000', borderRadius: '30px', textTransform: 'none', width: '100px', height: '30px', color: '#000' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              sx={{
                backgroundColor: websiteSettings.mainColor, borderRadius: '30px', textTransform: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.1)',
                px: 3, height: '30px', color: websiteSettings.textColor,
              }}
            >
              {userType === 'superadmin' ? 'Update' : 'Send for Approval'}
            </Button>
          </Box>
        </Dialog>

        {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
        <Dialog
          open={deleteOpen}
          onClose={() => !isLoading && setDeleteOpen(false)}
          PaperProps={{ sx: { borderRadius: '10px', minWidth: 380, overflow: 'hidden', border: '1px solid #E5E7EB' } }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ backgroundColor: '#FEF2F2', borderBottom: '1px solid #FECACA', py: 2.5, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: 52, height: 52, borderRadius: '8px', backgroundColor: '#FEE2E2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DeleteIcon sx={{ fontSize: 26, color: '#DC2626' }} />
              </Box>
            </Box>
            <Box sx={{ p: 3 }}>
              <Typography sx={{ fontSize: '17px', fontWeight: 600, color: '#111827', mb: 1 }}>
                {userType === 'superadmin' ? 'Delete Additional Fee?' : 'Request for Delete?'}
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#6B7280', mb: 3, lineHeight: 1.6 }}>
                {userType === 'superadmin'
                  ? <>Are you sure you want to delete <strong>"{deleteTarget?.feeName}"</strong>?<br />This action cannot be undone.</>
                  : <>Are you sure you want to send a delete request for <strong>"{deleteTarget?.feeName}"</strong>?<br />This will be sent for admin approval.</>
                }
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  onClick={() => setDeleteOpen(false)}
                  disabled={isLoading}
                  sx={{ textTransform: 'none', color: '#374151', fontWeight: 500, borderRadius: '30px', border: '1px solid #D1D5DB', px: 3, py: 0.8, '&:hover': { backgroundColor: '#F9FAFB' } }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={isLoading}
                  sx={{ textTransform: 'none', backgroundColor: '#DC2626', color: '#fff', fontWeight: 500, borderRadius: '30px', px: 3, py: 0.8, boxShadow: 'none', '&:hover': { backgroundColor: '#B91C1C' } }}
                >
                  {isLoading
                    ? (userType === 'superadmin' ? 'Deleting...' : 'Sending...')
                    : (userType === 'superadmin' ? 'Delete' : 'Send Request')
                  }
                </Button>
              </Box>
            </Box>
          </Box>
        </Dialog>

      </Box>
    </Box>
  )
}
