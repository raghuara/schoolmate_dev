import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { Autocomplete, Button, Card, CardContent, Grid, IconButton, InputAdornment, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';

const dummyData1 = [
  { feeName: "Admission Fee", amount: 5000 },
  { feeName: "Notebook & Supplies Fee", amount: 15000 },
  { feeName: "Term Fee 1", amount: 5000 },
  { feeName: "Term Fee 2", amount: 5000 },
  { feeName: "Term Fee 3", amount: 5000 },
  { feeName: "Late Fee", amount: 100 },
];

export default function CreateConcessionPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const grades = useSelector(selectGrades);
  const websiteSettings = useSelector(selectWebsiteSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(false);
  const [color, setColor] = useState(false);
  const [message, setMessage] = useState('');
  const [concessionName, setConcessionName] = useState("");
  const [staffCategory, setStaffCategory] = useState("");
  const [staffDesignation, setStaffDesignation] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState(grades?.[0]?.sign || null);
  const [gradeConcessions, setGradeConcessions] = useState({});

  const handleChange = (grade, feeName, field, value, baseAmount) => {
    setGradeConcessions((prev) => {
      const updated = { ...prev };
      const gradeData = updated[grade] ? { ...updated[grade] } : {};

      const existingRow = gradeData[feeName] || {
        concessionPercent: "",
        concessionAmount: "",
        finalFee: baseAmount,
      };

      let percent = parseFloat(existingRow.concessionPercent) || 0;
      let concessionAmt = parseFloat(existingRow.concessionAmount) || 0;

      if (field === "percent") {
        percent = parseFloat(value) || 0;
        concessionAmt = (baseAmount * percent) / 100;
      } else if (field === "amount") {
        concessionAmt = parseFloat(value) || 0;
        percent = ((concessionAmt / baseAmount) * 100).toFixed(2);
      }

      gradeData[feeName] = {
        concessionPercent: percent,
        concessionAmount: concessionAmt,
        finalFee: baseAmount - concessionAmt,
      };

      updated[grade] = gradeData;
      return updated;
    });
  };

  const getTotalAmount = (grade) => {
    const data = gradeConcessions[grade] || {};
    return dummyData1.reduce((sum, row) => {
      const finalFee = data[row.feeName]?.finalFee ?? row.amount;
      return sum + finalFee;
    }, 0);
  };

  const designationOptions = {
    "Teaching Staff": ["Teacher"],
    "Non Teaching Staff": ["Accountant", "Librarian", "Clerk", "Billing Staff"],
    "Supporting Staff": ["Cleaner", "Helper", "Driver", "Sweeper", "Security",],
  };

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
              <Typography sx={{ fontWeight: "600", fontSize: "19px" }} >Create Concession Range</Typography>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ px: 2, pb: 2, pt: "68px" }}>
          <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: "5px" }}>
            <Grid container spacing={3}>
              <Grid size={{ lg: 2.4, md: 3, sm: 6, xs: 12 }}>
                <Typography sx={{ fontSize: "16px", color: "#000" }} component="span">Concession Name</Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter Concession Name"
                  value={concessionName}
                  onChange={(e) => setConcessionName(e.target.value)}

                />
              </Grid>
              <Grid size={{ lg: 2.4, md: 3, sm: 6, xs: 12 }}>
                <Typography sx={{ fontSize: "16px", color: "#000" }} component="span">Staff Category</Typography>
                <Autocomplete
                  disablePortal
                  options={["Teaching Staff", "Non Teaching Staff", "Supporting Staff"]}
                  value={staffCategory}
                  onChange={(event, newValue) => {
                    setStaffCategory(newValue || "");
                    setStaffDesignation("");
                  }}
                  sx={{ width: "100%", mt: 0.5 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 41,
                          fontSize: 14,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ lg: 2.4, md: 3, sm: 6, xs: 12 }}>
                <Typography sx={{ fontSize: "16px", color: "#000" }} component="span">Staff Designation</Typography>
                <Autocomplete
                  disablePortal
                  options={designationOptions[staffCategory] || []}
                  value={staffDesignation}
                  onChange={(event, newValue) => setStaffDesignation(newValue || "")}
                  sx={{ width: "100%", mt: 0.5 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 41,
                          fontSize: 14,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Box py={2}>
              <Typography sx={{ fontSize: "16px", color: "#000", py: 2, fontWeight: "600" }} component="span">Choose Grade</Typography>
            </Box>
            <Grid container spacing={4}>
              {grades.map((g, index) => (
                <Grid size={{ lg: 1.5 }} key={g.sign}>
                  <Tab
                    label={g.sign}
                    value={g.sign}
                    onClick={() => setSelectedGrade(g.sign)}
                    sx={{
                      width: "100%",
                      height: "30px",
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: 13,
                      minHeight: 5,
                      borderRadius: "5px",
                      transition: "all 0.2s ease-in-out",
                      border: "1px solid rgba(0,0,0,0.1)",
                      color: selectedGrade === g.sign ? "#000" : "#444",
                      opacity: 1,
                      backgroundColor:
                        selectedGrade === g.sign
                          ? websiteSettings.mainColor
                          : "transparent",
                      boxShadow:
                        selectedGrade === g.sign
                          ? "0 1px 3px rgba(0,0,0,0.2)"
                          : "none",
                      "&:hover": {
                        backgroundColor:
                          selectedGrade === g.sign
                            ? websiteSettings.mainColor
                            : "rgba(0,0,0,0.04)",
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 3, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#8600BB", py: 0.3, width: "fit-content", px: 3, borderTopLeftRadius: "5px", borderTopRightRadius: "5px", ml: "5px" }}>
              <Typography sx={{ color: "#fff", fontSize: "14px" }}>{selectedGrade}</Typography>
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
                  {dummyData1.map((row, rowIndex) => {
                    const currentGradeData = gradeConcessions[selectedGrade] || {};
                    const feeData = currentGradeData[row.feeName] || {
                      concessionPercent: "",
                      concessionAmount: "",
                      finalFee: row.amount,
                    };

                    return (
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
                            value={feeData.concessionPercent}
                            onChange={(e) =>
                              handleChange(
                                selectedGrade,
                                row.feeName,
                                "percent",
                                e.target.value,
                                row.amount
                              )
                            }
                            sx={{ width: "120px" }}
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <Typography sx={{ ml: 0.5, fontSize: 13 }}>%</Typography>
                                ),
                              },
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
                            value={feeData.concessionAmount}
                            onChange={(e) =>
                              handleChange(
                                selectedGrade,
                                row.feeName,
                                "amount",
                                e.target.value,
                                row.amount
                              )
                            }
                            sx={{ width: "120px" }}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <Typography sx={{ mr: 0.5, fontSize: 13 }}>₹</Typography>
                                ),
                              },
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
                          ₹ {feeData.finalFee}
                        </TableCell>
                      </TableRow>
                    );
                  })}

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
                      ₹ {getTotalAmount(selectedGrade).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

          </Box>
        </Box>
      </Box>
    </Box>
  )
}
