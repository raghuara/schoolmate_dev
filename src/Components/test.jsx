import React, { useState, useEffect } from "react";
import {Box, Typography, Button, Grid, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, TextField, Card, CardContent, InputAdornment, IconButton,  Snackbar, Alert,} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const FeeDatePickerCell = ({ fee, index, handleDateChange, formatDate }) => {
  const [open, setOpen] = useState(false);

  return (
    <TableCell sx={{ border: "1px dotted #ccc" }}>
      <DatePicker
        open={open}
        onClose={() => setOpen(false)}
        value={fee.dueDate}
        onChange={(newValue) => handleDateChange(index, newValue)}
        slotProps={{
          textField: {
            hiddenLabel: true,
            size: "small",
            sx: { display: "none" },
          },
        }}
      />
      <Button
        variant="text"
        sx={{
          color: "#8e24aa",
          textTransform: "none",
          fontSize: 13,
          fontWeight: 500,
        }}
        endIcon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
        onClick={() => setOpen(true)}
      >
        {fee.dueDate ? formatDate(fee.dueDate) : "Add Due Date"}
      </Button>
    </TableCell>
  );
};

const grades = [
  "Prekg",
  "Lkg",
  "Ukg",
  "Grade I",
  "Grade II",
  "Grade III",
  "Grade IV",
  "Grade V",
  "Grade VI",
  "Grade VII",
  "Grade VIII",
  "Grade IX",
  "Grade X",
  "Grade XI",
  "Grade XII",
];

const SchoolFeeStructure = () => {
  const storedData = JSON.parse(localStorage.getItem("feeStructureData")) || {};
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [academicYear, setAcademicYear] = useState(null);
  const [fees, setFees] = useState(
    storedData.fees || [
      {
        name: "Admission Fee *",
        desc: "Tuition fee +1st term book + ECA fee",
        amount: 5000,
        dueDate: null,
        mandatory: true,
      },
    ]
  );

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const total = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);

  useEffect(() => {
    localStorage.setItem(
      "feeStructureData",
      JSON.stringify({ selectedGrade, academicYear, fees })
    );
  }, [selectedGrade, academicYear, fees]);

  const handleDateChange = (index, date) => {
    const updatedFees = [...fees];
    updatedFees[index].dueDate = date;
    setFees(updatedFees);
  };

  const handleAddFee = () => {
    const lastFee = fees[fees.length - 1];
    if (
      !lastFee.name.trim() &&
      !lastFee.desc.trim() &&
      (!lastFee.amount || Number(lastFee.amount) === 0)
    ) {
      setToastMessage(
        "Please fill the current fee row before adding a new one."
      );
      setToastOpen(true);
      return;
    }
    setFees([
      ...fees,
      { name: "", desc: "", amount: 0, dueDate: null, mandatory: false },
    ]);
  };

  const handleRemoveFee = () => {
    const lastFee = fees[fees.length - 1];
    if (lastFee.mandatory) return;
    setFees(fees.slice(0, -1));
  };

  const handleChange = (index, key, value) => {
    const updatedFees = [...fees];
    updatedFees[index][key] = value;
    setFees(updatedFees);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleReset = () => {
    localStorage.removeItem("feeStructureData");
    setSelectedGrade("Grade II");
    setAcademicYear("2025");
    setFees([
      {
        name: "Admission Fee *",
        desc: "Tuition fee +1st term book + ECA fee",
        amount: 5000,
        dueDate: null,
        mandatory: true,
      },
    ]);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh", p: 3 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <ArrowBackIcon
              sx={{ cursor: "pointer", color: "text.primary" }}
              onClick={() => console.log("Go back")}
            />
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="text.primary"
            >
              Set School Fee Structure
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography fontSize={14} color="text.secondary">
              Select Academic Year
            </Typography>
            <Select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              size="small"
              sx={{
                height: 32,
                borderRadius: 2,
                bgcolor: "#fff",
                "& .MuiSelect-select": { fontSize: 14, py: 0.5 },
              }}
            >
              <MenuItem value="2025">2025</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
            </Select>
          </Box>
        </Box>

        {/* Main Container */}
        <Box
          sx={{
            maxWidth: 1400,
            mx: "auto",
            border: "1px solid #ddd",
            borderRadius: 3,
            p: 3,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            bgcolor: "#fff",
          }}
        >
          {/* Grade Selection */}
          <Typography fontWeight={600} mb={1}>
            Choose Grade
          </Typography>
          <Grid container spacing={1} mb={3}>
            {grades.map((g) => (
              <Grid item key={g}>
                <Button
                  variant={selectedGrade === g ? "contained" : "outlined"}
                  color={selectedGrade === g ? "warning" : "inherit"}
                  size="small"
                  onClick={() => setSelectedGrade(g)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    width: 100,
                    height: 28,
                    fontWeight: 500,
                    fontSize: 13,
                    bgcolor: selectedGrade === g ? "#fbc02d" : "#fff",
                    color: selectedGrade === g ? "#000" : "#444",
                    borderColor:
                      selectedGrade === g ? "transparent" : "rgba(0,0,0,0.1)",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: selectedGrade === g ? "#f9a825" : "#f5f5f5",
                      boxShadow: "none",
                    },
                  }}
                >
                  {g}
                </Button>
              </Grid>
            ))}
          </Grid>

          {/* Grade Tab */}
          <Box
            sx={{
              bgcolor: "#7B1FA2",
              color: "#fff",
              px: 3,
              py: 0.4,
              ml: 4,
              fontWeight: 600,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              width: "fit-content",
            }}
          >
            {selectedGrade}
          </Box>

          {/* Table with floating Add/Remove */}
          <Box sx={{ position: "relative", width: "95%", mx: "auto" }}>
            {/* Add/Remove Icons */}
            <IconButton
              onClick={handleAddFee}
              sx={{
                position: "absolute",
                left: -50,
                bottom: 70,
                ml: 1,
              }}
            >
              <AddCircleOutlineIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleRemoveFee}
              sx={{
                position: "absolute",
                right: -50,
                bottom: 70,
                mr: 1,
              }}
            >
              <RemoveCircleOutlineIcon fontSize="small" />
            </IconButton>

            <Card
              sx={{
                py: 0,
                borderRadius: "0px 16px 16px 16px",
                overflow: "hidden",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Table sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
                  <TableHead sx={{ bgcolor: "#f3e5f5" }}>
                    <TableRow>
                      {[
                        "Fee Details",
                        "Fee Description",
                        "Fee Amount",
                        "Due Date",
                      ].map((header, i) => (
                        <TableCell
                          key={i}
                          sx={{
                            fontWeight: 600,
                            color: "#4a148c",
                            fontSize: 14,
                            py: 1.2,
                            border: "1px dotted #ccc",
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fees.map((fee, i) => (
                      <TableRow
                        key={i}
                        sx={{ "&:hover": { bgcolor: "#fafafa" } }}
                      >
                        <TableCell sx={{ border: "1px dotted #ccc" }}>
                          <TextField
                            fullWidth
                            size="small"
                            value={fee.name}
                            onChange={(e) =>
                              handleChange(i, "name", e.target.value)
                            }
                            disabled={fee.mandatory}
                            variant="outlined"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                fontSize: 14,
                                "& fieldset": { border: "none" },
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ border: "1px dotted #ccc" }}>
                          <TextField
                            fullWidth
                            size="small"
                            value={fee.desc}
                            onChange={(e) =>
                              handleChange(i, "desc", e.target.value)
                            }
                            variant="outlined"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                fontSize: 14,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ border: "1px dotted #ccc" }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={fee.amount}
                            onChange={(e) =>
                              handleChange(i, "amount", e.target.value)
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                            variant="outlined"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                fontSize: 14,
                              },
                            }}
                          />
                        </TableCell>
                        <FeeDatePickerCell
                          fee={fee}
                          index={i}
                          handleDateChange={handleDateChange}
                          formatDate={formatDate}
                        />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>

              {/* Total */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  px: 3,
                  py: 2,
                  borderRadius: 2,
                  mt: 0,
                }}
              >
                <Typography fontWeight={600} color="green" fontSize={15}>
                  Total Fees Amount
                </Typography>
                <Typography
                  fontWeight={600}
                  color="green"
                  fontSize={15}
                  sx={{ ml: 6 }}
                >
                  Rs.{total.toLocaleString()}
                </Typography>
              </Box>
            </Card>
          </Box>
        </Box>

        {/* Footer Buttons */}
        <Box
          display="flex"
          justifyContent="center"
          gap={2}
          p={2}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            bgcolor: "background.paper",
            zIndex: 1000,
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            sx={{ textTransform: "none", borderRadius: "50px", py: 0, px: 2 }}
            onClick={handleReset}
          >
            Reset All
          </Button>
          <Button
            variant="contained"
            color="warning"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "50px",
              py: 0,
              px: 3,
            }}
          >
            Apply for {selectedGrade}
          </Button>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={toastOpen}
          autoHideDuration={3000}
          onClose={() => setToastOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setToastOpen(false)}
            severity="warning"
            sx={{ width: "100%" }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default SchoolFeeStructure;
