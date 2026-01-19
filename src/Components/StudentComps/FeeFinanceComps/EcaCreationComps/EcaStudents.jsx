import React from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";


const students = [
  {
    id: 1,
    name: "Nisha Preethi S.",
    roll: "10203040",
    cls: "III",
    section: "A1",
    activity: "Performing Arts- Silambam",
    paidStatus: "Paid Activity",
    img: "https://via.placeholder.com/300x300.png?text=IMG+1",
  },
  {
    id: 2,
    name: "Nisha Preethi S.",
    roll: "10203040",
    cls: "III",
    section: "A1",
    activity: "Performing Arts- Silambam",
    paidStatus: "Paid Activity",
    img: "https://via.placeholder.com/300x300.png?text=IMG+2",
  },
  {
    id: 3,
    name: "Nisha Preethi S.",
    roll: "10203040",
    cls: "III",
    section: "A1",
    activity: "Performing Arts- Silambam",
    paidStatus: "Paid Activity",
    img: "https://via.placeholder.com/300x300.png?text=IMG+3",
  },
  {
    id: 4,
    name: "Nisha Preethi S.",
    roll: "10203040",
    cls: "III",
    section: "A1",
    activity: "Performing Arts- Silambam",
    paidStatus: "Paid Activity",
    img: "https://via.placeholder.com/300x300.png?text=IMG+4",
  },
];

export default function EcaStudents() {
  const [openImage, setOpenImage] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState(null);
  const navigate = useNavigate();

  const handleViewImage = (student) => {
    setSelectedStudent(student);
    setOpenImage(true);
  };

  const handleClose = () => {
    setOpenImage(false);
    setSelectedStudent(null);
  };

  return (
    <Box sx={{ bgcolor: "#fafafa", p: 3 }}>
      {/* TOP BAR */}
      <Box
        sx={{
          // borderRadius: 999,
          // border: "1px solid #e0e0e0",
          // bgcolor: "#fff",
          // px: 3,
          // py: 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                                 <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                             </IconButton>
          <Typography fontWeight={600} fontSize={20}>
            Students under Chess Activity
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}
        >
          <Typography fontSize={12}>Select Class &amp; Section</Typography>

          <Select
            size="small"
            value="PreKG"
            sx={{
              minWidth: 90,
              borderRadius: 999,
              "& .MuiSelect-select": { py: 0.7 },
            }}
          >
            <MenuItem value="PreKG">PreKG</MenuItem>
            <MenuItem value="I">I</MenuItem>
            <MenuItem value="II">II</MenuItem>
          </Select>

          <Select
            size="small"
            value="A1"
            sx={{
              minWidth: 70,
              borderRadius: 999,
              "& .MuiSelect-select": { py: 0.7 },
            }}
          >
            <MenuItem value="A1">A1</MenuItem>
            <MenuItem value="A2">A2</MenuItem>
          </Select>

          <TextField
            size="small"
            placeholder="Search by Student Name or Roll Number"
            sx={{
              minWidth: 260,
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                fontSize: 12,
                py: 0.3,
              },
            }}
          />
        </Stack>
      </Box>

      {/* MAIN CARD */}
      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #f0f0f0",
          boxShadow: "0 0 0 0 rgba(0,0,0,0)",
          bgcolor: "#fff",
          px: 4,
          py: 3,
        }}
      >
        {students.map((s, index) => (
          <StudentRow
            key={s.id}
            student={s}
            showDivider={index !== students.length - 1}
            onViewImage={() => handleViewImage(s)}
          />
        ))}
      </Card>

      {/* IMAGE VIEW DIALOG */}
      <Dialog open={openImage} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ flex: 1 }}>
            {selectedStudent?.name || "Student Image"}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center", pb: 3 }}>
          {selectedStudent && (
            <Box
              component="img"
              src={selectedStudent.img}
              alt={selectedStudent.name}
              sx={{
                maxWidth: "100%",
                borderRadius: 2,
                boxShadow: 2,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

/* --------- ONE STUDENT ROW (image + 6 data cols + view + 2 buttons) ---------- */

function StudentRow({ student, showDivider, onViewImage }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns:
          "90px 1.4fr 1fr 0.8fr 1.7fr 1.1fr auto auto auto", 
        alignItems: "center",
        columnGap: 4,
        py: 2.5,
        borderBottom: showDivider ? "1px dashed #e0e0e0" : "none",
      }}
    >
      {/* 1. IMAGE COLUMN (click to view) */}
      <Box
        component="img"
        src={student.img}
        alt={student.name}
        onClick={onViewImage}
        sx={{
          width: 80,
          height: 80,
          borderRadius: 2,
          objectFit: "cover",
          justifySelf: "start",
          cursor: "pointer",
          "&:hover": { opacity: 0.85 },
        }}
      />

      {/* 2–6 TEXT COLUMNS */}
      <InfoColumn label="Student Name" value={student.name} />
      <InfoColumn label="Student Roll No" value={student.roll} />
      <InfoColumn
        label="Class /section"
        value={`${student.cls}  ${student.section}`}
      />
      <InfoColumn label="ECA activity Chosen" value={student.activity} />
      <InfoColumn
        label="ECA Activity Paid status"
        value={student.paidStatus}
      />

      {/* NEW COLUMN: IMAGE VIEW BUTTON */}
      <Box sx={{ justifySelf: "end" }}>
        <Button
          variant="outlined"
          onClick={onViewImage}
          sx={{
            textTransform: "none",
            borderRadius: 999,
            fontSize: 11,
            px: 3,
            py: 0.4,
          }}
        >
          Image View
        </Button>
      </Box>

      {/* BUTTON COLUMNS */}
      <Box sx={{ justifySelf: "end" }}>
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: 999,
            fontSize: 11,
            px: 3,
            py: 0.5,
            bgcolor: "#ffc107",
            color: "#333",
            "&:hover": { bgcolor: "#ffca2c" },
          }}
        >
          Transfer
        </Button>
      </Box>

      <Box sx={{ justifySelf: "end" }}>
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: 999,
            fontSize: 11,
            px: 3,
            py: 0.5,
            bgcolor: "#ff2d2d",
            "&:hover": { bgcolor: "#ff5252" },
          }}
        >
          Remove
        </Button>
      </Box>
    </Box>
  );
}

/* --------- SMALL COLUMN COMPONENT ---------- */

function InfoColumn({ label, value }) {
  return (
    <Box>
      <Typography fontSize={10} color="text.secondary" mb={0.3}>
        {label}
      </Typography>
      <Typography fontSize={13} fontWeight={700} sx={{ whiteSpace: "nowrap" }}>
        {value}
      </Typography>
    </Box>
  );
}