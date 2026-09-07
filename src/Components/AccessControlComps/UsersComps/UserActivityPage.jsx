import {
    Box, Button, Chip, IconButton, InputAdornment, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Typography, Skeleton,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SnackBar from "../../SnackBar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { useSelector } from "react-redux";
import { LoginList } from "../../../Api/Api";
import axios from "axios";
import * as XLSX from 'xlsx';
import { DASH, RADIUS, BRAND, Panel, EmptyNote } from "../../DashBoardComps/dashboardTheme";

const TH = ({ children, align }) => (
    <TableCell
        align={align}
        sx={{
            bgcolor: DASH.surface,
            borderBottom: `1px solid ${DASH.line}`,
            color: DASH.muted,
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            py: 1,
            whiteSpace: "nowrap",
        }}
    >
        {children}
    </TableCell>
);

const TD = ({ children, align }) => (
    <TableCell align={align} sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, py: 1 }}>
        {children}
    </TableCell>
);

const searchFieldSx = (accent) => ({
    width: { xs: "100%", sm: 280 },
    "& .MuiOutlinedInput-root": {
        height: 32,
        fontSize: "12.5px",
        borderRadius: RADIUS,
        bgcolor: "#fff",
        "& fieldset": { borderColor: DASH.line },
        "&:hover fieldset": { borderColor: DASH.faint },
        "&.Mui-focused fieldset": { borderColor: accent, borderWidth: "1px" },
    },
});

// Both tabs show the same table - only the rows and the file name differ.
const UserTable = ({ rows, search, onSearch, onClearSearch, onExport, accent, emptyText }) => (
    <>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 1.5, flexWrap: "wrap" }}>
            <TextField
                variant="outlined"
                placeholder="Search by name, roll number or user type"
                value={search}
                onChange={onSearch}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                            </InputAdornment>
                        ),
                        endAdornment: search ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={onClearSearch} sx={{ p: 0.2 }}>
                                    <HighlightOffIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    },
                }}
                sx={searchFieldSx(accent)}
            />

            <Button
                onClick={onExport}
                disabled={rows.length === 0}
                startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                    textTransform: "none",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    height: 32,
                    px: 1.8,
                    borderRadius: RADIUS,
                    color: DASH.cyan,
                    bgcolor: DASH.cyanLight,
                    border: "1px solid #A5F3FC",
                    boxShadow: "none",
                    "&:hover": { bgcolor: DASH.cyanLight, borderColor: DASH.cyan },
                    "&.Mui-disabled": { color: DASH.faint, bgcolor: DASH.surface, borderColor: DASH.lineSoft },
                }}
            >
                Export to Excel
            </Button>
        </Box>

        <TableContainer sx={{ maxHeight: "62vh" }}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TH align="center">S.No</TH>
                        <TH>Roll Number</TH>
                        <TH>Name</TH>
                        <TH>User Type</TH>
                        <TH align="center">Class</TH>
                        <TH align="center">Section</TH>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} sx={{ borderBottom: "none" }}>
                                <EmptyNote text={emptyText} />
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row, index) => (
                            <TableRow
                                key={row.rollNumber || index}
                                sx={{ transition: "background-color 0.15s", "&:hover": { bgcolor: DASH.surface } }}
                            >
                                <TD align="center">
                                    <Typography sx={{ fontSize: "12px", color: DASH.faint }}>{index + 1}</Typography>
                                </TD>
                                <TD>
                                    <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.text, whiteSpace: "nowrap" }}>
                                        {row.rollNumber}
                                    </Typography>
                                </TD>
                                <TD>
                                    <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: row.name ? DASH.ink : DASH.red }}>
                                        {row.name || "Name not provided"}
                                    </Typography>
                                </TD>
                                <TD>
                                    <Chip
                                        size="small"
                                        label={row.userType ? row.userType.charAt(0).toUpperCase() + row.userType.slice(1) : "-"}
                                        sx={{
                                            height: 20,
                                            borderRadius: RADIUS,
                                            bgcolor: DASH.lineSoft,
                                            color: DASH.muted,
                                            fontSize: "10.5px",
                                            fontWeight: 700,
                                        }}
                                    />
                                </TD>
                                <TD align="center">
                                    <Typography sx={{ fontSize: "12px", color: row.grade ? DASH.text : DASH.faint }}>
                                        {row.grade || "-"}
                                    </Typography>
                                </TD>
                                <TD align="center">
                                    <Typography sx={{ fontSize: "12px", color: row.section ? DASH.text : DASH.faint }}>
                                        {row.section || "-"}
                                    </Typography>
                                </TD>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </>
);


const MemberTableSkeleton = ({ rows = 8 }) => (
    <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
            <Skeleton variant="rounded" width={260} height={34} sx={{ bgcolor: DASH.lineSoft, borderRadius: RADIUS }} />
            <Skeleton variant="rounded" width={140} height={34} sx={{ bgcolor: DASH.lineSoft, borderRadius: RADIUS }} />
        </Box>

        <TableContainer sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, bgcolor: "#fff" }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {[...Array(6)].map((_, i) => (
                            <TableCell key={i} sx={{ bgcolor: DASH.surface, borderBottom: `1px solid ${DASH.line}`, py: 1.1 }}>
                                <Skeleton variant="rounded" height={9} width="65%" sx={{ bgcolor: DASH.lineSoft, mx: "auto" }} />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {[...Array(rows)].map((_, r) => (
                        <TableRow key={r}>
                            {[...Array(6)].map((_, c) => (
                                <TableCell key={c} sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, py: 1.3 }}>
                                    <Skeleton variant="rounded" height={11} width={c === 2 ? "80%" : "55%"} sx={{ bgcolor: DASH.lineSoft, mx: "auto" }} />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
);

export default function UserActivityPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [loginStudentDetails, setLoginStudentDetails] = useState([]);
    const [loginOthersDetails, setLoginOthersDetails] = useState([]);
    const [notLoggedInStudents, setNotLoggedInStudents] = useState([]);
    const [notLoggedInOthers, setNotLoggedInOthers] = useState([]);
    const [value, setValue] = useState(0);
    const token = "123"
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [searchQueryNotLogged, setSearchQueryNotLogged] = useState("");
    const [filteredDataNotLogged, setFilteredDataNotLogged] = useState([]);

    const mainColor = websiteSettings.mainColor || DASH.primary;
    const ACCENT = BRAND.purple.main;

    useEffect(() => {
        fetcDetails()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetcDetails = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(LoginList, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLoginStudentDetails(res.data.studentData || []);
            setLoginOthersDetails(res.data.othersDate || []);
            setNotLoggedInStudents(res.data.notLoggedInstudentData || []);
            setNotLoggedInOthers(res.data.notLOggedInothersDate || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setFilteredData([
            ...(loginStudentDetails || []),
            ...(loginOthersDetails || []),
        ]);
        setFilteredDataNotLogged([
            ...(notLoggedInStudents || []),
            ...(notLoggedInOthers || []),
        ]);
    }, [loginStudentDetails, loginOthersDetails, notLoggedInStudents, notLoggedInOthers, value]);

    const loggedInTotal = (loginStudentDetails?.length || 0) + (loginOthersDetails?.length || 0);
    const notLoggedInTotal = (notLoggedInStudents?.length || 0) + (notLoggedInOthers?.length || 0);

    const applySearch = (query, source) => {
        if (!query) return source;
        return source.filter(
            (item) =>
                item.rollNumber?.toString().toLowerCase().includes(query) ||
                item.name?.toLowerCase().includes(query) ||
                item.userType?.toLowerCase().includes(query)
        );
    };

    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredData(applySearch(query, [...loginStudentDetails, ...loginOthersDetails]));
    };

    const handleSearchChangeNotLogged = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQueryNotLogged(query);
        setFilteredDataNotLogged(applySearch(query, [...notLoggedInStudents, ...notLoggedInOthers]));
    };

    const exportRows = (rows, sheetName, fileName) => {
        const header = ['S.No', 'Roll Number', 'Name', 'User Type', 'Class', 'Section'];

        const data = rows.map((row, index) => [
            index + 1,
            row.rollNumber || '',
            row.name || '',
            row.userType || '',
            row.grade || '',
            row.section || ''
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        XLSX.writeFile(workbook, fileName);
    };

    const handleExport = () => exportRows(filteredData, 'Users', 'logged_in_users.xlsx');
    const handleExportNotLoggedIn = () => exportRows(filteredDataNotLogged, 'NotLoggedInUsers', 'not_logged_in_users.xlsx');

    const TABS = [
        { key: 0, label: "Logged-In Users", icon: HowToRegOutlinedIcon, count: loggedInTotal, accent: ACCENT },
        { key: 1, label: "Not Logged-In", icon: PersonOffOutlinedIcon, count: notLoggedInTotal, accent: ACCENT },
    ];

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%", boxSizing: "border-box" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <Box sx={{ display: "flex", alignItems: "center", minWidth: 0, mb: 2 }}>
                <Link style={{ textDecoration: "none" }} to="/dashboardmenu/access/users">
                    <IconButton sx={{ width: 28, height: 28 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.ink }} />
                    </IconButton>
                </Link>
                <Box sx={{ ml: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "20px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                        Member Download Report
                    </Typography>
                    <Typography sx={{ fontSize: "11.5px", color: DASH.muted, whiteSpace: "nowrap" }}>
                        See who is using SchoolMate, and who has not signed in yet
                    </Typography>
                </Box>
            </Box>

            {/* Segmented control - the same treatment the dashboards use */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    p: 0.5,
                    mb: 2,
                    width: "fit-content",
                    maxWidth: "100%",
                    bgcolor: DASH.lineSoft,
                    border: `1px solid ${DASH.line}`,
                    borderRadius: "999px",
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                }}
            >
                {TABS.map((tab) => {
                    const TabIcon = tab.icon;
                    const active = value === tab.key;
                    return (
                        <Box
                            key={tab.key}
                            onClick={() => setValue(tab.key)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.7,
                                flexShrink: 0,
                                height: 28,
                                px: 1.8,
                                borderRadius: "999px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                bgcolor: active ? tab.accent : "transparent",
                                boxShadow: active ? `0 1px 3px ${tab.accent}4D` : "none",
                                transition: "background-color .18s ease, color .18s ease",
                                "&:hover": { bgcolor: active ? tab.accent : "rgba(17,24,39,0.04)" },
                            }}
                        >
                            <TabIcon sx={{ fontSize: 15, color: active ? "#fff" : DASH.faint }} />
                            <Typography sx={{ fontSize: "12.5px", fontWeight: active ? 700 : 600, color: active ? "#fff" : DASH.muted }}>
                                {tab.label}
                            </Typography>
                            <Box
                                sx={{
                                    px: 0.7,
                                    height: 17,
                                    display: "flex",
                                    alignItems: "center",
                                    borderRadius: "999px",
                                    bgcolor: active ? "rgba(255,255,255,0.24)" : "#fff",
                                    color: active ? "#fff" : DASH.faint,
                                    fontSize: "10px",
                                    fontWeight: 700,
                                }}
                            >
                                {isLoading ? (
                                    <Skeleton
                                        variant="text"
                                        width={22}
                                        sx={{ bgcolor: active ? "rgba(255,255,255,0.45)" : DASH.lineSoft, fontSize: "10px" }}
                                    />
                                ) : (
                                    tab.count
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {value === 0 ? (
                <Panel
                    title="Logged-In Users"
                    subtitle={isLoading ? "Loading…" : `${filteredData.length} of ${loggedInTotal} member${loggedInTotal === 1 ? "" : "s"} have signed in`}
                    accent={ACCENT}
                >
                    {isLoading ? (
                        <MemberTableSkeleton />
                    ) : (
                    <UserTable
                        rows={filteredData}
                        search={searchQuery}
                        onSearch={handleSearchChange}
                        onClearSearch={() => handleSearchChange({ target: { value: "" } })}
                        onExport={handleExport}
                        accent={ACCENT}
                        emptyText={searchQuery ? `No member matches “${searchQuery}”.` : "Nobody has signed in yet."}
                    />
                    )}
                </Panel>
            ) : (
                <Panel
                    title="Not Logged-In Users"
                    subtitle={isLoading ? "Loading…" : `${filteredDataNotLogged.length} of ${notLoggedInTotal} member${notLoggedInTotal === 1 ? "" : "s"} have never signed in`}
                    accent={ACCENT}
                >
                    {isLoading ? (
                        <MemberTableSkeleton />
                    ) : (
                    <UserTable
                        rows={filteredDataNotLogged}
                        search={searchQueryNotLogged}
                        onSearch={handleSearchChangeNotLogged}
                        onClearSearch={() => handleSearchChangeNotLogged({ target: { value: "" } })}
                        onExport={handleExportNotLoggedIn}
                        accent={ACCENT}
                        emptyText={searchQueryNotLogged ? `No member matches “${searchQueryNotLogged}”.` : "Everyone has signed in at least once."}
                    />
                    )}
                </Panel>
            )}
        </Box>
    );
}
