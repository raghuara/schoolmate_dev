import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Loader from '../../../Loader'
import SnackBar from '../../../SnackBar'
import { Accordion, AccordionDetails, AccordionSummary, Button, Card, CardContent, Grid, IconButton, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const dummyData1 = [
  { feeName: "Admission Fee", amount: 5000 },
  { feeName: "Notebook & Supplies Fee", amount: 15000 },
  { feeName: "Term Fee 1", amount: 5000 },
  { feeName: "Term Fee 2", amount: 5000 },
  { feeName: "Term Fee 3", amount: 5000 },
];


export default function ConcessionPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const grades = useSelector(selectGrades);
  const websiteSettings = useSelector(selectWebsiteSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(false);
  const [color, setColor] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedGrade, setSelectedGrade] = useState(grades?.[0]?.sign || null);
  const [tabIndex, setTabIndex] = useState(0);
  const [gradeFees, setGradeFees] = useState({});

  const [rows, setRows] = useState(
    dummyData1.map((item) => ({
      ...item,
      concessionPercent: "",
      concessionAmount: "",
      finalFee: item.amount,
    }))
  );

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    let row = { ...updatedRows[index] };
    const amount = parseFloat(row.amount);

    if (field === "percent") {
      const percent = parseFloat(value) || 0;
      const concessionAmount = (amount * percent) / 100;
      row.concessionPercent = value;
      row.concessionAmount = concessionAmount.toFixed(2);
      row.finalFee = (amount - concessionAmount).toFixed(2);
    } else if (field === "amount") {
      const concessionAmount = parseFloat(value) || 0;
      const percent = ((concessionAmount / amount) * 100).toFixed(2);
      row.concessionAmount = value;
      row.concessionPercent = percent;
      row.finalFee = (amount - concessionAmount).toFixed(2);
    }

    updatedRows[index] = row;
    setRows(updatedRows);
  };

  const total =
    gradeFees[selectedGrade]?.reduce(
      (sum, f) => sum + Number(f.amount || 0),
      0
    ) || 0;
  const totalAmount = rows.reduce((sum, r) => sum + parseFloat(r.finalFee || r.amount), 0);

  return (
    <Box>
      <Box sx={{ width: "100%", }}>
        <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
        {isLoading && <Loader />}
        <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1.5, borderBottom: "1px solid #ddd", mb: 0.13, }}>
          <Grid container>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px', }}>
                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
              </IconButton>
              <Typography sx={{ fontWeight: "600", fontSize: "19px" }} >Concession Range</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: 'end' }}>
              <Button sx={{
                textTransform: "none",
                border: "1px solid #8600BB",
                borderRadius: "50px",
                px: 3,
                color: "#8600BB",
                height: "30px",
                mr: "10px"
              }}>
                Removed Concession
              </Button>
              <Link to="create">
                <Button sx={{
                  textTransform: "none",
                  backgroundColor: "#000",
                  borderRadius: "5px",
                  px: 3,
                  color: "#fff",
                  height: "30px",
                }}>
                  Create Concession
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ p: 2, height: "79vh", overflowY: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>

            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#00ADA4", py: 0.3, width: "fit-content", px: 3, borderTopLeftRadius: "5px", borderTopRightRadius: "5px", ml: "5px" }}>
              <Typography sx={{ color: "#fff", fontSize: "14px" }}> Parent Concession - Community based</Typography>
            </Box>
            <Box sx={{ margin: "0px", display: "flex", alignItems: "end" }}>
              <Typography sx={{ color: "#767676", fontSize: "10px", }}> Edited Today, 10 mins ago | Edited by Super Admin   </Typography>
            </Box>
          </Box>
          <Accordion
            sx={{
              backgroundColor: '#fff7f7',
              borderRadius: "3px",
              boxShadow: "none",
              border: "1px solid #ccc",
              mb: 2,

              "&:before": {
                display: "none",
              },

              "&.Mui-expanded": {
                marginTop: 0,
              },

            }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon style={{ color: "#E60154" }} />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Grid container spacing={3} sx={{ width: "100%" }}>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff designation / Staff category</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>Teaching Staff / Teacher</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Employment Status</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>Permanent</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Working Status</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>Active </Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff experience</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>2 years</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff Religion</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>All Religion</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff social category</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>All Category</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff annual income</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>0</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff marital status</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>All Status </Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>No.of.childerns studing in same school</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>0</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Student grade</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>Prekg / Grade 1 / Grade 10</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: '#fff', px: 2, pb: 2, pt: 3 }}>
              <Box sx={{ border: "1px solid #ccc", p: 2, borderRadius: "10px" }}>
                <Grid container spacing={4}>
                  {grades.map((g, index) => (
                    <Grid size={{ lg: 1.5 }} key={g.sign}>
                      <Tab
                        label={g.sign}
                        value={index}
                        onClick={() => {
                          setTabIndex(index);
                          setSelectedGrade(g.sign);
                        }}
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
                          fontWeight: "600",
                          color: selectedGrade === g.sign ? "#fff" : "#444",
                          opacity: 1,
                          backgroundColor:
                            selectedGrade === g.sign
                              ? "#8600BB"
                              : "transparent",
                          boxShadow:
                            selectedGrade === g.sign
                              ? "0 1px 3px rgba(0,0,0,0.2)"
                              : "none",
                          "&:hover": {
                            backgroundColor:
                              selectedGrade === g.sign
                                ? "#8600BB"
                                : "rgba(0,0,0,0.04)",
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>

                {grades.map((g, idx) => {
                  if (tabIndex !== idx) return null;
                  return (
                    <Box
                      key={g.sign}
                      sx={{
                        position: "relative",
                        width: "100%",
                        mx: "auto",
                        mt: 3,
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#8600BB", py: 0.3, width: "fit-content", px: 3, borderTopLeftRadius: "5px", borderTopRightRadius: "5px", ml: "5px" }}>
                        <Typography sx={{ color: "#fff", fontSize: "14px" }}>{g.sign} - Concession School Fee Detail</Typography>
                      </Box>

                      <Card
                        sx={{
                          borderRadius: "0",
                          overflow: "hidden",
                          boxShadow: "none",
                        }}
                      >
                        <TableContainer
                          sx={{
                            border: "1px solid #E601542A",
                            boxShadow: "none",
                            backgroundColor: "#fff",
                            width: "99.7%"
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
                              {rows.map((row, rowIndex) => (
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
                                      value={row.concessionPercent}
                                      onChange={(e) =>
                                        handleChange(rowIndex, "percent", e.target.value)
                                      }
                                      sx={{ width: "120px" }}
                                      slotProps={{
                                        input: {
                                          endAdornment: (
                                            <Typography sx={{ ml: 0.5, fontSize: 13 }}>%</Typography>
                                          ),
                                        }
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
                                      value={row.concessionAmount}
                                      onChange={(e) =>
                                        handleChange(rowIndex, "amount", e.target.value)
                                      }
                                      sx={{ width: "120px" }}
                                      slotProps={{
                                        input: {
                                          startAdornment: (
                                            <Typography sx={{ mr: 0.5, fontSize: 13 }}>₹</Typography>
                                          ),
                                        }
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
                                    ₹ {row.finalFee}
                                  </TableCell>
                                </TableRow>
                              ))}

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
                                  ₹ {totalAmount.toLocaleString("en-IN")}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>

                      </Card>
                    </Box>
                  );
                })}


              </Box>
            </AccordionDetails>
          </Accordion>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#DB4700", py: 0.3, width: "fit-content", px: 3, borderTopLeftRadius: "5px", borderTopRightRadius: "5px", ml: "5px" }}>
              <Typography sx={{ color: "#fff", fontSize: "14px" }}> Parent Concession - Community based</Typography>
            </Box>
            <Box sx={{ margin: "0px", display: "flex", alignItems: "end" }}>
              <Typography sx={{ color: "#767676", fontSize: "10px", }}> Edited Today, 10 mins ago | Edited by Super Admin   </Typography>
            </Box>
          </Box>
          <Accordion
            sx={{
              backgroundColor: '#fff7f7',
              borderRadius: "3px",
              boxShadow: "none",
              border: "1px solid #ccc",
              mb: 2,

              "&:before": {
                display: "none",
              },

              "&.Mui-expanded": {
                marginTop: 0,
              },

            }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon style={{ color: "#E60154" }} />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Grid container spacing={3} sx={{ width: "100%" }}>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff designation / Staff category</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>Teaching Staff / Teacher</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Employment Status</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>Permanent</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Working Status</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>Active </Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff experience</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>2 years</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff Religion</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>All Religion</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff social category</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>All Category</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff annual income</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>0</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff marital status</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>All Status </Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>No.of.childerns studing in same school</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>0</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Student grade</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>Prekg / Grade 1 / Grade 10</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: '#fff', px: 2, pb: 2, pt: 3 }}>
              <Box sx={{ border: "1px solid #ccc", p: 2, borderRadius: "10px" }}>
                <Grid container spacing={4}>
                  {grades.map((g, index) => (
                    <Grid size={{ lg: 1.5 }} key={g.sign}>
                      <Tab
                        label={g.sign}
                        value={index}
                        onClick={() => {
                          setTabIndex(index);
                          setSelectedGrade(g.sign);
                        }}
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
                          fontWeight: "600",
                          color: selectedGrade === g.sign ? "#fff" : "#444",
                          opacity: 1,
                          backgroundColor:
                            selectedGrade === g.sign
                              ? "#8600BB"
                              : "transparent",
                          boxShadow:
                            selectedGrade === g.sign
                              ? "0 1px 3px rgba(0,0,0,0.2)"
                              : "none",
                          "&:hover": {
                            backgroundColor:
                              selectedGrade === g.sign
                                ? "#8600BB"
                                : "rgba(0,0,0,0.04)",
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>

                {grades.map((g, idx) => {
                  if (tabIndex !== idx) return null;
                  return (
                    <Box
                      key={g.sign}
                      sx={{
                        position: "relative",
                        width: "100%",
                        mx: "auto",
                        mt: 3,
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#8600BB", py: 0.3, width: "fit-content", px: 3, borderTopLeftRadius: "5px", borderTopRightRadius: "5px", ml: "5px" }}>
                        <Typography sx={{ color: "#fff", fontSize: "14px" }}>{g.sign} - Concession School Fee Detail</Typography>
                      </Box>

                      <Card
                        sx={{
                          borderRadius: "0",
                          overflow: "hidden",
                          boxShadow: "none",
                        }}
                      >
                        <TableContainer
                          sx={{
                            border: "1px solid #E601542A",
                            boxShadow: "none",
                            backgroundColor: "#fff",
                            width: "99.7%"
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
                              {rows.map((row, rowIndex) => (
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
                                      value={row.concessionPercent}
                                      onChange={(e) =>
                                        handleChange(rowIndex, "percent", e.target.value)
                                      }
                                      sx={{ width: "120px" }}
                                      slotProps={{
                                        input: {
                                          endAdornment: (
                                            <Typography sx={{ ml: 0.5, fontSize: 13 }}>%</Typography>
                                          ),
                                        }
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
                                      value={row.concessionAmount}
                                      onChange={(e) =>
                                        handleChange(rowIndex, "amount", e.target.value)
                                      }
                                      sx={{ width: "120px" }}
                                      slotProps={{
                                        input: {
                                          startAdornment: (
                                            <Typography sx={{ mr: 0.5, fontSize: 13 }}>₹</Typography>
                                          ),
                                        }
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
                                    ₹ {row.finalFee}
                                  </TableCell>
                                </TableRow>
                              ))}

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
                                  ₹ {totalAmount.toLocaleString("en-IN")}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>

                      </Card>
                    </Box>
                  );
                })}


              </Box>
            </AccordionDetails>
          </Accordion>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#8600BB", py: 0.3, width: "fit-content", px: 3, borderTopLeftRadius: "5px", borderTopRightRadius: "5px", ml: "5px" }}>
              <Typography sx={{ color: "#fff", fontSize: "14px" }}> Parent Concession - Community based</Typography>
            </Box>
            <Box sx={{ margin: "0px", display: "flex", alignItems: "end" }}>
              <Typography sx={{ color: "#767676", fontSize: "10px", }}> Edited Today, 10 mins ago | Edited by Super Admin   </Typography>
            </Box>
          </Box>
          <Accordion
            sx={{
              backgroundColor: '#fff7f7',
              borderRadius: "3px",
              boxShadow: "none",
              border: "1px solid #ccc",
              mb: 2,

              "&:before": {
                display: "none",
              },

              "&.Mui-expanded": {
                marginTop: 0,
              },

            }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon style={{ color: "#E60154" }} />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Grid container spacing={3} sx={{ width: "100%" }}>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff designation / Staff category</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>Teaching Staff / Teacher</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Employment Status</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>Permanent</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Working Status</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>Active </Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff experience</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>2 years</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff Religion</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>All Religion</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff social category</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>All Category</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff annual income</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>0</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Staff marital status</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>All Status </Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>No.of.childerns studing in same school</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>0</Typography>
                </Grid>
                <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 6 }}>
                  <Typography sx={{ color: "#777", fontSize: "12px" }}>Student grade</Typography>
                  <Typography sx={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>Prekg / Grade 1 / Grade 10</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: '#fff', px: 2, pb: 2, pt: 3 }}>
              <Box sx={{ border: "1px solid #ccc", p: 2, borderRadius: "10px" }}>
                <Grid container spacing={4}>
                  {grades.map((g, index) => (
                    <Grid size={{ lg: 1.5 }} key={g.sign}>
                      <Tab
                        label={g.sign}
                        value={index}
                        onClick={() => {
                          setTabIndex(index);
                          setSelectedGrade(g.sign);
                        }}
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
                          fontWeight: "600",
                          color: selectedGrade === g.sign ? "#fff" : "#444",
                          opacity: 1,
                          backgroundColor:
                            selectedGrade === g.sign
                              ? "#8600BB"
                              : "transparent",
                          boxShadow:
                            selectedGrade === g.sign
                              ? "0 1px 3px rgba(0,0,0,0.2)"
                              : "none",
                          "&:hover": {
                            backgroundColor:
                              selectedGrade === g.sign
                                ? "#8600BB"
                                : "rgba(0,0,0,0.04)",
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>

                {grades.map((g, idx) => {
                  if (tabIndex !== idx) return null;
                  return (
                    <Box
                      key={g.sign}
                      sx={{
                        position: "relative",
                        width: "100%",
                        mx: "auto",
                        mt: 3,
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#8600BB", py: 0.3, width: "fit-content", px: 3, borderTopLeftRadius: "5px", borderTopRightRadius: "5px", ml: "5px" }}>
                        <Typography sx={{ color: "#fff", fontSize: "14px" }}>{g.sign} - Concession School Fee Detail</Typography>
                      </Box>

                      <Card
                        sx={{
                          borderRadius: "0",
                          overflow: "hidden",
                          boxShadow: "none",
                        }}
                      >
                        <TableContainer
                          sx={{
                            border: "1px solid #E601542A",
                            boxShadow: "none",
                            backgroundColor: "#fff",
                            width: "99.7%"
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
                              {rows.map((row, rowIndex) => (
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
                                      value={row.concessionPercent}
                                      onChange={(e) =>
                                        handleChange(rowIndex, "percent", e.target.value)
                                      }
                                      sx={{ width: "120px" }}
                                      slotProps={{
                                        input: {
                                          endAdornment: (
                                            <Typography sx={{ ml: 0.5, fontSize: 13 }}>%</Typography>
                                          ),
                                        }
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
                                      value={row.concessionAmount}
                                      onChange={(e) =>
                                        handleChange(rowIndex, "amount", e.target.value)
                                      }
                                      sx={{ width: "120px" }}
                                      slotProps={{
                                        input: {
                                          startAdornment: (
                                            <Typography sx={{ mr: 0.5, fontSize: 13 }}>₹</Typography>
                                          ),
                                        }
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
                                    ₹ {row.finalFee}
                                  </TableCell>
                                </TableRow>
                              ))}

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
                                  ₹ {totalAmount.toLocaleString("en-IN")}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>

                      </Card>
                    </Box>
                  );
                })}


              </Box>
            </AccordionDetails>
          </Accordion>

        </Box>
      </Box>
    </Box>
  )
}
