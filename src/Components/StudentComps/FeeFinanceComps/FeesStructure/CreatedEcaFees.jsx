import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import {
  Autocomplete, Button, Chip, Dialog, Grid, IconButton,
  InputAdornment, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ClearIcon from '@mui/icons-material/Clear'
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
import { ecaFeeFetch, ECAupdateSchoolFee, deleteEcaFeesStructure } from '../../../../Api/Api'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectGrades } from '../../../../Redux/Slices/DropdownController'
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice'

export default function CreatedEcaFees() {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth)
  const rollNumber = user.rollNumber
  const userType = user.userType
  const token = '123'
  const grades = useSelector(selectGrades)
  const websiteSettings = useSelector(selectWebsiteSettings)
  const isExpanded = useSelector((state) => state.sidebar.isExpanded)

  const currentYear = new Date().getFullYear()
  const currentAcademicYear = `${currentYear}-${currentYear + 1}`
  const academicYears = [
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
  ]

  const [selectedYear, setSelectedYear] = useState(currentAcademicYear)
  const [ecaList, setEcaList] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // SnackBar
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(false)
  const [color, setColor] = useState(false)
  const [message, setMessage] = useState('')

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editActivity, setEditActivity] = useState(null)
  const [openCal, setOpenCal] = useState(false)
  const [editFees, setEditFees] = useState({
    activityName: '',
    activityCategory: '',
    gradeAmounts: {},
    dueDate: null,
  })
  const [editRemovedGrades, setEditRemovedGrades] = useState(new Set())

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const formatDate = (d) => (d ? dayjs(d).format('DD-MM-YYYY') : '')

  useEffect(() => {
    getEcaFees()
  }, [selectedYear])

  const getEcaFees = async () => {
    setIsLoading(true)
    try {
      const res = await axios.get(ecaFeeFetch, {
        params: { Year: selectedYear },
        headers: { Authorization: `Bearer ${token}` },
      })
      setEcaList(res.data)
    } catch (error) {
      setMessage('Failed to load ECA fees')
      setOpen(true); setColor(false); setStatus(false)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = (activity) => {
    setEditActivity(activity)
    const gradeAmounts = {}
    const removedGrades = new Set()
    grades.forEach((g) => {
      const val = activity.grades?.[g.sign.toLowerCase()]
      if (val === null || val === undefined) {
        removedGrades.add(g.sign)
      } else {
        gradeAmounts[g.sign] = val
      }
    })
    setEditFees({
      activityName: activity.activityName,
      activityCategory: activity.activityCategory,
      gradeAmounts,
      dueDate: activity.dueDate ? dayjs(activity.dueDate) : null,
    })
    setEditRemovedGrades(removedGrades)
    setEditOpen(true)
  }

  const handleEditGradeChange = (grade, value) => {
    if (!/^\d{0,8}$/.test(value)) return
    const cleaned = value.replace(/^0+(\d)/, '$1')
    setEditFees((prev) => ({
      ...prev,
      gradeAmounts: { ...prev.gradeAmounts, [grade]: cleaned },
    }))
  }

  const handleEditRemoveGrade = (gradeSign) => {
    setEditRemovedGrades((prev) => new Set([...prev, gradeSign]))
    setEditFees((prev) => {
      const newAmounts = { ...prev.gradeAmounts }
      delete newAmounts[gradeSign]
      return { ...prev, gradeAmounts: newAmounts }
    })
  }

  const handleEditRestoreGrade = (gradeSign) => {
    setEditRemovedGrades((prev) => {
      const next = new Set(prev)
      next.delete(gradeSign)
      return next
    })
  }

  const handleEditSubmit = async () => {
    if (!editFees.activityName.trim()) {
      setMessage('Activity Name is required'); setOpen(true); setColor(false); setStatus(false); return
    }
    if (!editFees.activityCategory.trim()) {
      setMessage('Activity Category is required'); setOpen(true); setColor(false); setStatus(false); return
    }
    setIsLoading(true)
    try {
      const gradePayload = {}
      grades.forEach((g) => {
        if (!editRemovedGrades.has(g.sign)) {
          gradePayload[g.sign.toLowerCase()] = Number(editFees.gradeAmounts[g.sign]) || 0
        }
      })
      const sendData = {
        ecaFeesID: editActivity.ecaFeesID || editActivity.id,
        rollNumber,
        year: selectedYear,
        activityCategory: editFees.activityCategory,
        activityName: editFees.activityName,
        paid: 'Y',
        ...gradePayload,
        dueDate: editFees.dueDate ? dayjs(editFees.dueDate).format('YYYY-MM-DD') : null,
      }
      await axios.put(ECAupdateSchoolFee, sendData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage('ECA Fee updated successfully')
      setOpen(true); setColor(true); setStatus(true)
      setEditOpen(false)
      getEcaFees()
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Failed to update ECA fee')
      setOpen(true); setColor(false); setStatus(false)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteClick = (activity) => {
    setDeleteTarget(activity)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsLoading(true)
    try {
      await axios.delete(deleteEcaFeesStructure, {
        params: {
          ecaFeesID: deleteTarget.ecaFeesID || deleteTarget.id,
          RollNumber: rollNumber,
        },
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage(userType === 'superadmin' ? 'ECA Fee deleted successfully' : 'Delete request sent successfully')
      setOpen(true); setColor(true); setStatus(true)
      setDeleteOpen(false); setDeleteTarget(null)
      getEcaFees()
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Failed to delete ECA fee')
      setOpen(true); setColor(false); setStatus(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Edit is allowed only when NO student has paid yet
  const canEditActivity = (activity) => {
    if (activity.isAnyStudentPaid === true) return false
    if (activity.isEditable === false) return false
    if (typeof activity.paidStudents === 'number') {
      return activity.paidStudents === 0
    }
    return true
  }

  if (!grades?.length) return null

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
              <Typography sx={{ fontWeight: '600', fontSize: '19px' }}>Created ECA Activity Fees</Typography>
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
              Editing and deleting fee details is only allowed before any student has paid. Once even one student has paid, both edit and delete options will not be visible.
            </Typography>
          </Box>

          {ecaList?.length === 0 ? (
            <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '10px', py: 5, px: 4, textAlign: 'center', mt: 2 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#333', mb: 1 }}>
                No ECA activities available
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#666', maxWidth: '420px', mx: 'auto' }}>
                ECA activities have not been configured for the selected academic year.
                Please check back later or create a new activity.
              </Typography>
            </Box>
          ) : (
            ecaList.map((activity) => (
              <React.Fragment key={activity.ecaFeesID || activity.activityName}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{
                    bgcolor: '#7B1FA2', color: '#fff', fontSize: '13px',
                    mt: '10px', px: 3, py: 0.2, ml: '15px', fontWeight: 600,
                    borderTopLeftRadius: '7px', borderTopRightRadius: '7px', width: 'fit-content',
                  }}>
                    {activity.activityCategory} - {activity.activityName}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: '10px' }}>
                    <Tooltip title={canEditActivity(activity) ? 'Edit Activity' : 'Cannot edit — a student has already paid'} arrow>
                      <span>
                        <IconButton
                          onClick={() => canEditActivity(activity) && handleEdit(activity)}
                          disabled={!canEditActivity(activity)}
                          sx={{
                            width: 30, height: 30, border: '1px solid #e0e0e0',
                            bgcolor: canEditActivity(activity) ? '#f5f5f5' : '#f0f0f0',
                            '&:hover': canEditActivity(activity) ? { bgcolor: '#E3F2FD', borderColor: '#1976D2' } : {},
                            '&.Mui-disabled': { opacity: 0.45 },
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16, color: canEditActivity(activity) ? '#1976D2' : '#bbb' }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={activity.isAnyStudentPaid ? 'Cannot delete — a student has already paid' : (userType === 'superadmin' ? 'Delete Activity' : 'Request for Delete')} arrow>
                      <span>
                        <IconButton
                          onClick={() => handleDeleteClick(activity)}
                          disabled={activity.isAnyStudentPaid === true}
                          sx={{
                            width: 30, height: 30, border: '1px solid #e0e0e0',
                            bgcolor: activity.isAnyStudentPaid ? '#f0f0f0' : '#f5f5f5',
                            '&:hover': activity.isAnyStudentPaid ? {} : { bgcolor: '#FFEBEE', borderColor: '#f44336' },
                            '&.Mui-disabled': { opacity: 0.45 },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16, color: activity.isAnyStudentPaid ? '#bbb' : '#f44336' }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                  
                </Box>

                <Box p={2} sx={{ backgroundColor: '#fff', border: '1px solid #E8DDEA', borderRadius: '5px' }}>
                  <TableContainer sx={{ border: '1px solid #E8DDEA', backgroundColor: '#fff', boxShadow: 'none', borderBottom: 'none' }}>
                    <Table stickyHeader sx={{ minWidth: '100%' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ borderRight: 1, borderColor: '#E8DDEA', textAlign: 'center', backgroundColor: '#faf6fc' }}>Activity Name</TableCell>
                          <TableCell sx={{ borderRight: 1, borderColor: '#E8DDEA', textAlign: 'center', backgroundColor: '#faf6fc' }}>Activity Category</TableCell>
                          <TableCell sx={{ textAlign: 'center', backgroundColor: '#faf6fc' }}>Due Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ borderRight: 1, borderColor: '#E8DDEA', textAlign: 'center' }}>{activity.activityName}</TableCell>
                          <TableCell sx={{ borderRight: 1, borderColor: '#E8DDEA', textAlign: 'center' }}>{activity.activityCategory}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{formatDate(activity.dueDate)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {activity.paid === 'Y' && (
                    <Box sx={{ backgroundColor: '#FFE5E5', p: 3, border: '1px solid #E8DDEA', borderTop: 'none' }}>
                      <Grid container spacing={2}>
                        {Object.entries(activity.grades || {}).filter(([, amount]) => amount !== null).map(([gradeKey, amount]) => (
                          <Grid size={{ lg: 1.5 }} key={gradeKey}>
                            <Typography sx={{ color: 'red', fontSize: '12px', mb: 0.5 }}>{gradeKey.toUpperCase()}</Typography>
                            <Box sx={{ border: '1px solid #0000003A', borderRadius: '5px', height: '30px', backgroundColor: '#F6F6F8', px: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              ₹ {amount}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
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
            <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>Edit ECA Activity Fee</Typography>
            <IconButton size="small" onClick={() => setEditOpen(false)}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ p: 2 }}>
            <Box sx={{ border: '1px solid #CCC', borderRadius: '5px' }}>
              <Grid container rowSpacing={2} columnSpacing={4} p={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Activity Name</Typography>
                  <TextField
                    size="small"
                    value={editFees.activityName}
                    onChange={(e) => setEditFees((prev) => ({ ...prev, activityName: e.target.value }))}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 }, width: '100%' }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Activity Category</Typography>
                  <TextField
                    size="small"
                    value={editFees.activityCategory}
                    onChange={(e) => setEditFees((prev) => ({ ...prev, activityCategory: e.target.value }))}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 }, width: '100%' }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={{ mb: 0.5, fontWeight: '600' }}>Due Date</Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      open={openCal}
                      onClose={() => setOpenCal(false)}
                      value={editFees.dueDate}
                      onChange={(newValue) => {
                        setEditFees((prev) => ({ ...prev, dueDate: newValue }))
                        setOpenCal(false)
                      }}
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

              {/* Removed grade chips */}
              {editRemovedGrades.size > 0 && (
                <Box sx={{ px: 3, pb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12, color: '#999' }}>Removed grades:</Typography>
                  {[...editRemovedGrades].map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      size="small"
                      onClick={() => handleEditRestoreGrade(g)}
                      icon={<AddIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{
                        fontSize: 12, height: 22, bgcolor: '#f5f5f5', border: '1px solid #ddd', cursor: 'pointer',
                        '&:hover': { bgcolor: '#ede7f6', borderColor: '#7B1FA2', color: '#7B1FA2' },
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* Grade amounts */}
              <Grid container spacing={2} sx={{ backgroundColor: '#FFE5E5', p: 3, borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px' }}>
                {grades.filter((g) => !editRemovedGrades.has(g.sign)).map((grade) => (
                  <Grid size={{ lg: 1.5 }} key={grade.sign}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ color: 'red', fontSize: '12px', ml: 0.5 }}>{grade.sign}</Typography>
                      <Tooltip title="Remove this grade" placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleEditRemoveGrade(grade.sign)}
                          sx={{
                            p: 0.3, color: '#bbb', bgcolor: 'rgba(0,0,0,0.04)', borderRadius: '50%',
                            transition: 'all 0.2s ease',
                            '&:hover': { color: '#fff', bgcolor: '#f44336', transform: 'scale(1.15)' },
                          }}
                        >
                          <ClearIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <TextField
                      size="small"
                      value={editFees.gradeAmounts[grade.sign] ?? ''}
                      onChange={(e) => handleEditGradeChange(grade.sign, e.target.value)}
                      variant="outlined"
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          inputMode: 'numeric',
                        }
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { height: 33, fontSize: 14, borderRadius: '5px', backgroundColor: '#F6F6F8' } }}
                    />
                  </Grid>
                ))}
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
                {userType === 'superadmin' ? 'Delete ECA Fee?' : 'Request for Delete?'}
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#6B7280', mb: 3, lineHeight: 1.6 }}>
                {userType === 'superadmin'
                  ? <>Are you sure you want to delete <strong>"{deleteTarget?.activityName}"</strong>?<br />This action cannot be undone.</>
                  : <>Are you sure you want to send a delete request for <strong>"{deleteTarget?.activityName}"</strong>?<br />This will be sent for admin approval.</>
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
