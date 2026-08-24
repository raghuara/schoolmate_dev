import React, { useEffect, useState } from 'react';
import { Box, Button, InputAdornment, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import dayjs from 'dayjs';
import axios from 'axios';
import Loader from '../../../Loader';
import SnackBar from '../../../SnackBar';
import { selectAcademicYear } from '../../../../Redux/Slices/academicYearSlice';
import { APPROVAL_SUBMENUS, approvalRoleFor, selectApprovalMatrix } from '../../../../Redux/Slices/approvalMatrixSlice';
import { selectUserTypeID, findSubMenuPermissions } from '../../../../Redux/Slices/AuthSlice';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import { getFees, schoolFee, updateSchoolFee } from '../../../../Api/Api';
import { DASH, RADIUS, SEVERITY, PageHeader, Panel } from '../../../DashBoardComps/dashboardTheme';

const ACCENT = "#8600BB";

const HEAD_CELL = {
  fontSize: "10.5px",
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: DASH.muted,
  bgcolor: DASH.surface,
  borderBottom: `1px solid ${DASH.line}`,
  whiteSpace: "nowrap",
  py: 1.2,
};

const BODY_CELL = {
  borderBottom: `1px solid ${DASH.lineSoft}`,
  py: 1,
  verticalAlign: "top",
};

const FIELD_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: RADIUS,
    fontSize: "13px",
    bgcolor: "#fff",
    "& fieldset": { borderColor: DASH.line },
    "&:hover fieldset": { borderColor: `${ACCENT}59` },
    "&.Mui-focused fieldset": { borderColor: ACCENT },
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: DASH.ink,
  },
  "& .Mui-disabled fieldset": { borderColor: DASH.lineSoft },
};

export default function SchoolFeeStructure() {
  const navigate = useNavigate();
  const token = "123";
  const user = useSelector((state) => state.auth)
  const rollNumber = user.rollNumber;
  // createfeesstructure is an approval module: the matrix decides whether this
  // role posts straight through or has to raise a request.
  const userTypeID = useSelector(selectUserTypeID);
  const approvalMatrix = useSelector(selectApprovalMatrix);
  const canActDirect = approvalRoleFor(approvalMatrix, APPROVAL_SUBMENUS.FEE_STRUCTURE, userTypeID).canPublishDirect;
  const feePerms = findSubMenuPermissions(user.permissions, "feeandfinance", "createfeesstructure") || {};
  const rbacReady = (user.permissions?.mainMenus || []).length > 0;
  const canCreate = !rbacReady || feePerms.create === "Y";
  const canEdit = !rbacReady || feePerms.edit === "Y";

  const grades = useSelector(selectGrades);
  const [selectedGrade, setSelectedGrade] = useState(grades?.[0]?.sign || null);
  const websiteSettings = useSelector(selectWebsiteSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(false);
  const [color, setColor] = useState(false);
  const [message, setMessage] = useState('');
  const [gradeFees, setGradeFees] = useState({});

  const [primeSchoolFeesID, setPrimeSchoolFeesID] = useState(null);

  // The academic year comes from the header - one picker for the whole site.
  const selectedYear = useSelector(selectAcademicYear);
  const [hasApprovedFees, setHasApprovedFees] = useState(false);
  const [isAnyStudentPaid, setIsAnyStudentPaid] = useState(false);
  // "create" is the right to set up a structure for a grade that has none;
  // changing one that already exists is "edit". hasApprovedFees tells the two
  // apart, so view-only sees the figures with no way to alter them.
  const canSubmitNew = canCreate && !hasApprovedFees;
  const canUpdateExisting = canEdit && hasApprovedFees;
  const fieldsEditable = (hasApprovedFees ? canEdit : canCreate) && !isAnyStudentPaid;
  const showActionButton = (canSubmitNew || canUpdateExisting) && !isAnyStudentPaid;

  const makeInitialFeesForGrades = (gradesArr = []) => {
    const initialFees = {};
    gradesArr.forEach((g) => {
      initialFees[g.sign] = [
        {
          feeName: "Admission Fee *",
          desc: "",
          amount: "",
          dueDate: null,
          mandatory: true,
          openCal: false,
        },
      ];
    });
    return initialFees;
  };

  // Detects the protected Admission Fee row regardless of trailing "*" / casing / whitespace.
  // Backend stores it with the asterisk because we send it as "Admission Fee *" on create.
  const isAdmissionFeeRow = (name = "") =>
    name.replace(/\*/g, "").trim().toLowerCase() === "admission fee";

  const normalizeBackendFees = (backendFees = []) => {
    return backendFees.map((f) => ({
      feeName: f.feeDetails || "",
      desc: f.feeDescription || "",
      amount: f.feeAmount != null ? String(f.feeAmount) : "",
      dueDate: f.dueDate ? dayjs(f.dueDate) : null,
      // Lock Admission Fee on edit too — its name must match what was created
      mandatory: isAdmissionFeeRow(f.feeDetails),
      openCal: false,
    }));
  };

  const fetchFeesForGrade = async (gradeSign) => {
    try {
      setIsLoading(true);
      const gradeObj = grades.find((g) => g.sign === gradeSign) || {};
      const gradeId = gradeObj.id || gradeObj.gradeId || gradeObj._id || gradeSign;

      const res = await axios.get(getFees, {
        params: { gradeId: gradeId, year: selectedYear, status: "Approved" },
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res?.data;
      const backendFees = data?.fees || [];

      setPrimeSchoolFeesID(data?.primeSchoolFeesID || null);
      setIsAnyStudentPaid(data?.isAnyStudentPaid === true);

      setGradeFees((prev) => {
        const updated = { ...prev };
        updated[gradeSign] = backendFees.length ? normalizeBackendFees(backendFees) : [
          {
            feeName: "Admission Fee *",
            desc: "",
            amount: "",
            dueDate: null,
            mandatory: true,
            openCal: false,
          },
        ];
        return updated;
      });

      setHasApprovedFees(backendFees.length > 0);
      if (!backendFees.length) {
        setPrimeSchoolFeesID(null);
        setIsAnyStudentPaid(false);
      }

    } catch (err) {
      // API returns 400/404 when no fee structure exists yet — reset to blank editable form
      setHasApprovedFees(false);
      setPrimeSchoolFeesID(null);
      setIsAnyStudentPaid(false);
      setGradeFees((prev) => ({
        ...prev,
        [gradeSign]: [
          {
            feeName: "Admission Fee *",
            desc: "",
            amount: "",
            dueDate: null,
            mandatory: true,
            openCal: false,
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (grades?.length) {
      const initial = makeInitialFeesForGrades(grades);
      setGradeFees(initial);
      const first = grades[0].sign;
      setSelectedGrade(first);

      fetchFeesForGrade(first);
    }
  }, [grades]);

  useEffect(() => {
    if (!selectedGrade || !grades?.length) return;
    fetchFeesForGrade(selectedGrade);
  }, [selectedGrade]);

  const formatDate = (date) => (date ? dayjs(date).format("DD-MM-YYYY") : "");

  const total =
    gradeFees[selectedGrade]?.reduce(
      (sum, f) => sum + Number(f.amount || 0),
      0
    ) || 0;

  const handleChange = (grade, index, key, value) => {
    // Reject duplicate "Admission Fee" name on any non-mandatory row.
    // The seeded mandatory row already owns this name (with or without "*").
    if (key === "feeName") {
      const row = gradeFees[grade]?.[index];
      if (row && !row.mandatory && isAdmissionFeeRow(value)) {
        setOpen(true);
        setStatus(false);
        setColor(false);
        setMessage('"Admission Fee" is already added by default. Please choose a different fee name.');
        return; // do not update state
      }
    }

    setGradeFees((prev) => {
      const updated = { ...prev };
      updated[grade][index][key] = value;
      return updated;
    });
  };

  const handleAddFee = (grade) => {
    setGradeFees((prev) => {
      const fees = prev[grade];
      const lastFee = fees[fees.length - 1];
      if (
        !lastFee.feeName.trim() &&
        !lastFee.desc.trim() &&
        (!lastFee.amount || Number(lastFee.amount) === 0)
      ) {
        setOpen(true)
        setStatus(false)
        setMessage("Please fill the current fee row before adding a new one.")
        setColor(false)
        return prev;
      }
      const newFee = {
        feeName: "",
        desc: "",
        amount: "",
        dueDate: null,
        mandatory: false,
        openCal: false,
      };
      return { ...prev, [grade]: [...fees, newFee] };
    });
  };

  const handleRemoveFee = (grade) => {
    setGradeFees((prev) => {
      const fees = prev[grade];
      if (fees[fees.length - 1].mandatory) return prev;
      return { ...prev, [grade]: fees.slice(0, -1) };
    });
  };

  const handleDateChange = (grade, index, newValue) => {
    setGradeFees((prev) => {
      const updated = { ...prev };
      updated[grade][index].dueDate = newValue;
      updated[grade][index].openCal = false;
      return updated;
    });
  };

  const handleClearDate = (grade, index) => {
    setGradeFees((prev) => {
      const updated = { ...prev };
      updated[grade][index].dueDate = null;
      return updated;
    });
  };

  if (!grades?.length) return null;

  const handleResetAll = () => {
    const initialFees = {};
    grades.forEach((g) => {
      initialFees[g.sign] = [
        {
          feeName: "Admission Fee *",
          desc: "",
          amount: "",
          dueDate: null,
          mandatory: true,
          openCal: false,
        },
      ];
    });
    setGradeFees(initialFees);
    setSelectedGrade(grades?.[0]?.sign || null);
    setOpen(true);
    setStatus(true);
    setColor(true);
    setMessage("All fee rows reset.");
  };

  const handleSubmit = async () => {
    // Block duplicate "Admission Fee" — it's seeded by default, only one allowed
    const feesForGradePreCheck = gradeFees[selectedGrade] || [];
    const admissionCount = feesForGradePreCheck.filter((f) => isAdmissionFeeRow(f.feeName)).length;
    if (admissionCount > 1) {
      setOpen(true);
      setStatus(false);
      setColor(false);
      setMessage('"Admission Fee" is already added by default. Please rename or remove the duplicate row before saving.');
      return;
    }

    setIsLoading(true);
    try {
      const gradeObj = grades.find((g) => g.sign === selectedGrade) || {};
      const gradeId = gradeObj.id || gradeObj.gradeId || gradeObj._id || selectedGrade;
      const feesForGrade = gradeFees[selectedGrade] || [];
      const filtered = feesForGrade.filter(
        (f) => (f.feeName && f.feeName.toString().trim()) || (f.amount && Number(f.amount) > 0)
      );

      const sendData = {
        gradeId: String(gradeId),
        year: selectedYear,
        rollNumber: rollNumber,
        fees: filtered.map((f) => ({
          feeDetails: f.feeName,
          feeDescription: f.desc,
          feeAmount: Number(f.amount || 0),
          dueDate: f.dueDate ? dayjs(f.dueDate).format("YYYY-MM-DD") : null,
        })),
      };

      const res = await axios.post(schoolFee, sendData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success === false) {
        setOpen(true);
        setColor(false);
        setStatus(false);
        setMessage(res.data?.message || "Failed to save fee structure.");
        return;
      }

      setOpen(true);
      setColor(true);
      setStatus(true);
      setMessage(canActDirect ? 'School fee created successfully' : 'Requested successfully');
      await fetchFeesForGrade(selectedGrade);

    } catch (error) {
      const apiMsg = error?.response?.data?.message;
      setOpen(true);
      setColor(false);
      setStatus(false);
      setMessage(apiMsg || "Failed to save fee structure.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    // Block duplicate "Admission Fee" — it's seeded by default, only one allowed
    const feesForGradePreCheck = gradeFees[selectedGrade] || [];
    const admissionCount = feesForGradePreCheck.filter((f) => isAdmissionFeeRow(f.feeName)).length;
    if (admissionCount > 1) {
      setOpen(true);
      setStatus(false);
      setColor(false);
      setMessage('"Admission Fee" is already added by default. Please rename or remove the duplicate row before updating.');
      return;
    }

    setIsLoading(true);
    try {

      const gradeObj = grades.find(g => g.sign === selectedGrade) || {};
      const gradeId =
        gradeObj.id || gradeObj.gradeId || gradeObj._id || selectedGrade;

      const feesForGrade = gradeFees[selectedGrade] || [];

      const filteredFees = feesForGrade.filter(
        f =>
          f.feeName?.trim() ||
          (f.amount && Number(f.amount) > 0)
      );

      const sendData = {
        primeSchoolFeesID: primeSchoolFeesID,
        gradeId: String(gradeId),
        year: selectedYear,
        rollNumber: rollNumber,
        fees: filteredFees.map(f => ({
          feeDetails: f.feeName,
          feeDescription: f.desc,
          feeAmount: Number(f.amount || 0),
          dueDate: f.dueDate
            ? dayjs(f.dueDate).format("YYYY-MM-DD")
            : null,
        })),

      };

      const res = await axios.put(updateSchoolFee, sendData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success === false) {
        setOpen(true);
        setColor(false);
        setStatus(false);
        setMessage(res.data?.message || "Failed to update fee structure.");
        return;
      }

      setOpen(true);
      setColor(true);
      setStatus(true);
      setMessage(canActDirect ? 'School fee updated successfully' : 'Requested successfully');
      await fetchFeesForGrade(selectedGrade);

    } catch (error) {
      const apiMsg = error?.response?.data?.message;
      setOpen(true);
      setColor(false);
      setStatus(false);
      setMessage(apiMsg || "Failed to update fee structure.");
    } finally {
      setIsLoading(false);
    }
  };

  const fees = gradeFees[selectedGrade] || [];
  const viewOnly = rbacReady && !fieldsEditable && !isAnyStudentPaid;

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 3 },
        pt: { xs: 1.5, md: 2 },
        pb: 4,
        bgcolor: DASH.canvas,
        boxSizing: "border-box",
      }}
    >
      <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
      {isLoading && <Loader />}

      <PageHeader
        title="Create School Fee"
        subtitle={selectedYear ? `Grade-wise fee heads for ${selectedYear}` : "Grade-wise fee heads"}
        onBack={() => navigate(-1)}
        right={
          <>
            {fieldsEditable && (
              <Button
                onClick={handleResetAll}
                startIcon={<RestartAltIcon sx={{ fontSize: 18 }} />}
                sx={{
                  textTransform: "none",
                  fontSize: "13px",
                  fontWeight: 700,
                  height: 34,
                  px: 1.8,
                  borderRadius: RADIUS,
                  color: DASH.text,
                  bgcolor: "#fff",
                  border: `1px solid ${DASH.line}`,
                  "&:hover": { bgcolor: DASH.lineSoft },
                }}
              >
                Reset All
              </Button>
            )}

            {showActionButton && (
              <Button
                onClick={hasApprovedFees ? handleUpdate : handleSubmit}
                disableElevation
                sx={{
                  textTransform: "none",
                  fontSize: "13px",
                  fontWeight: 700,
                  height: 34,
                  px: 2.2,
                  borderRadius: RADIUS,
                  bgcolor: websiteSettings.mainColor,
                  color: websiteSettings.textColor,
                  border: "1px solid rgba(0,0,0,0.08)",
                  "&:hover": { bgcolor: websiteSettings.mainColor, filter: "brightness(0.95)" },
                }}
              >
                {hasApprovedFees
                  ? "Update Fees"
                  : canActDirect
                    ? `Apply for ${selectedGrade}`
                    : "Request Approval"}
              </Button>
            )}
          </>
        }
      />

      {isAnyStudentPaid && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            bgcolor: SEVERITY.warning.bg,
            border: `1px solid ${SEVERITY.warning.border}`,
            borderRadius: RADIUS,
            px: 1.6,
            py: 1,
            mb: 2,
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 18, color: SEVERITY.warning.color, flexShrink: 0 }} />
          <Typography sx={{ fontSize: "12.5px", color: DASH.text }}>
            One or more students have already paid for {selectedGrade}. Editing is disabled for this grade.
          </Typography>
        </Box>
      )}

      {viewOnly && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            bgcolor: SEVERITY.info.bg,
            border: `1px solid ${SEVERITY.info.border}`,
            borderRadius: RADIUS,
            px: 1.6,
            py: 1,
            mb: 2,
          }}
        >
          <VisibilityOutlinedIcon sx={{ fontSize: 18, color: SEVERITY.info.color, flexShrink: 0 }} />
          <Typography sx={{ fontSize: "12.5px", color: DASH.text }}>
            You have view only access to fee structures.
          </Typography>
        </Box>
      )}

      <Panel
        title="Choose Grade"
        subtitle="Fee heads are saved one grade at a time"
        accent={ACCENT}
        sx={{ mb: 2 }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {grades.map((g) => {
            const active = selectedGrade === g.sign;
            return (
              <Box
                key={g.sign}
                onClick={() => setSelectedGrade(g.sign)}
                sx={{
                  minWidth: 62,
                  px: 1.6,
                  py: 0.6,
                  textAlign: "center",
                  borderRadius: RADIUS,
                  cursor: "pointer",
                  bgcolor: active ? `${ACCENT}14` : "#fff",
                  border: `1px solid ${active ? `${ACCENT}59` : DASH.line}`,
                  transition: "background-color 0.15s ease, border-color 0.15s ease",
                  "&:hover": { bgcolor: `${ACCENT}0A`, borderColor: `${ACCENT}59` },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "12.5px",
                    fontWeight: active ? 700 : 600,
                    color: active ? ACCENT : DASH.text,
                  }}
                >
                  {g.sign}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Panel>

      <Panel
        title={`${selectedGrade} Fee Heads`}
        subtitle={hasApprovedFees ? "Approved structure" : "Not set up yet"}
        accent={ACCENT}
        right={fieldsEditable && (
          <Box sx={{ display: "flex", gap: 0.8 }}>
            <Button
              onClick={() => handleAddFee(selectedGrade)}
              startIcon={<AddIcon sx={{ fontSize: 17 }} />}
              sx={{
                textTransform: "none",
                fontSize: "12px",
                fontWeight: 700,
                height: 30,
                px: 1.4,
                borderRadius: RADIUS,
                color: ACCENT,
                bgcolor: `${ACCENT}0F`,
                border: `1px solid ${ACCENT}24`,
                "&:hover": { bgcolor: `${ACCENT}1F`, borderColor: `${ACCENT}59` },
              }}
            >
              Add Row
            </Button>
            {fees.length > 1 && (
              <Button
                onClick={() => handleRemoveFee(selectedGrade)}
                startIcon={<RemoveIcon sx={{ fontSize: 17 }} />}
                sx={{
                  textTransform: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                  height: 30,
                  px: 1.4,
                  borderRadius: RADIUS,
                  color: DASH.muted,
                  bgcolor: "#fff",
                  border: `1px solid ${DASH.line}`,
                  "&:hover": { bgcolor: DASH.lineSoft },
                }}
              >
                Remove Row
              </Button>
            )}
          </Box>
        )}
        bodySx={{ p: 0 }}
      >
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 780 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...HEAD_CELL, width: "24%" }}>Fee Details</TableCell>
                <TableCell sx={{ ...HEAD_CELL, width: "36%" }}>Fee Description</TableCell>
                <TableCell sx={{ ...HEAD_CELL, width: "18%" }}>Fee Amount</TableCell>
                <TableCell sx={{ ...HEAD_CELL, width: "22%" }}>Due Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fees.map((fee, i) => (
                <TableRow key={i} sx={{ "&:hover": { bgcolor: DASH.surface } }}>
                  <TableCell sx={BODY_CELL}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Fee name"
                      value={fee.feeName}
                      onChange={(e) => handleChange(selectedGrade, i, "feeName", e.target.value)}
                      disabled={fee.mandatory || !fieldsEditable}
                      sx={{
                        ...FIELD_SX,
                        ...(fee.mandatory && {
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: DASH.ink,
                            fontWeight: 700,
                          },
                        }),
                      }}
                    />
                  </TableCell>

                  <TableCell sx={BODY_CELL}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="What is this fee for"
                      multiline
                      rows={2}
                      value={fee.desc}
                      onChange={(e) => handleChange(selectedGrade, i, "desc", e.target.value)}
                      disabled={!fieldsEditable}
                      sx={FIELD_SX}
                    />
                  </TableCell>

                  <TableCell sx={BODY_CELL}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="0"
                      value={fee.amount ? Number(fee.amount).toLocaleString("en-IN") : ""}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 8) {
                          handleChange(selectedGrade, i, "amount", value);
                        }
                      }}
                      disabled={!fieldsEditable}
                      sx={FIELD_SX}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography sx={{ fontSize: "13px", color: DASH.muted }}>₹</Typography>
                            </InputAdornment>
                          ),
                          inputMode: "numeric",
                        },
                        htmlInput: {
                          maxLength: 8,
                          pattern: "[0-9]*",
                        },
                      }}
                    />
                  </TableCell>

                  <TableCell sx={BODY_CELL}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        open={fee.openCal || false}
                        onClose={() =>
                          setGradeFees((prev) => {
                            const updated = { ...prev };
                            if (updated[selectedGrade][i])
                              updated[selectedGrade][i].openCal = false;
                            return updated;
                          })
                        }
                        value={fee.dueDate}
                        onChange={(newValue) => handleDateChange(selectedGrade, i, newValue)}
                        disablePast
                        views={['year', 'month', 'day']}
                        sx={{ opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                        slotProps={{
                          day: {
                            sx: {
                              '&.Mui-selected': {
                                backgroundColor: `${websiteSettings.mainColor} !important`,
                                color: '#000',
                                border: `1px solid ${websiteSettings.mainColor}`,
                              },
                              '&.MuiPickersDay-today': {
                                border: `1px solid ${websiteSettings.mainColor}`,
                                color: '#000',
                              },
                              '&.Mui-selected.MuiPickersDay-today': {
                                backgroundColor: `${websiteSettings.mainColor} !important`,
                                border: `1px solid ${websiteSettings.mainColor}`,
                                color: '#000',
                              },
                            },
                          },
                        }}
                      />

                      {!fieldsEditable ? (
                        <Typography sx={{ fontSize: "12.5px", color: DASH.text, fontWeight: 600, pt: 1 }}>
                          {fee.dueDate ? formatDate(fee.dueDate) : "-"}
                        </Typography>
                      ) : (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                          <Button
                            onClick={() =>
                              setGradeFees((prev) => {
                                const updated = { ...prev };
                                updated[selectedGrade][i].openCal = true;
                                return updated;
                              })
                            }
                            endIcon={<CalendarMonthIcon sx={{ fontSize: 17 }} />}
                            sx={{
                              flex: 1,
                              justifyContent: "space-between",
                              textTransform: "none",
                              fontSize: "12.5px",
                              fontWeight: 600,
                              height: 38,
                              px: 1.2,
                              borderRadius: RADIUS,
                              color: fee.dueDate ? DASH.ink : DASH.faint,
                              bgcolor: "#fff",
                              border: `1px solid ${DASH.line}`,
                              "&:hover": { bgcolor: `${ACCENT}0A`, borderColor: `${ACCENT}59` },
                            }}
                          >
                            {fee.dueDate ? formatDate(fee.dueDate) : "Add Due Date"}
                          </Button>
                          {fee.dueDate ? (
                            <Tooltip title="Clear Due Date">
                              <IconButton
                                onClick={() => handleClearDate(selectedGrade, i)}
                                sx={{ width: 30, height: 30, flexShrink: 0 }}
                              >
                                <HighlightOffIcon sx={{ fontSize: 18, color: DASH.red }} />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Box sx={{ width: 30, flexShrink: 0 }} />
                          )}
                        </Box>
                      )}
                    </LocalizationProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 2,
            px: 2,
            py: 1.4,
            bgcolor: DASH.surface,
            borderTop: `1px solid ${DASH.line}`,
          }}
        >
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: DASH.muted,
            }}
          >
            Total Fees Amount
          </Typography>
          <Typography sx={{ fontSize: "18px", fontWeight: 800, color: DASH.green }}>
            ₹{total.toLocaleString("en-IN")}
          </Typography>
        </Box>
      </Panel>
    </Box>
  )
}
