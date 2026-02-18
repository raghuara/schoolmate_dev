import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Grid, IconButton, Divider,
    Card, CardContent, Switch, InputAdornment, Chip, Tab, Tabs,
    Table, TableBody, TableCell, TableHead, TableRow, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SecurityIcon from '@mui/icons-material/Security';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// Color theme
const PRIMARY = '#2563EB';
const PRIMARY_LIGHT = '#EFF6FF';
const PRIMARY_DARK = '#1D4ED8';
const CARD_RADIUS = '12px';

export default function ComplianceSettings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);

    // PF Settings
    const [pfSettings, setPfSettings] = useState({
        enabled: true,
        employeeContribution: 12,
        employerContribution: 12,
        wageLimit: 15000,
        adminCharges: 0.5,
        edliCharges: 0.5,
    });

    // ESI Settings
    const [esiSettings, setEsiSettings] = useState({
        enabled: true,
        employeeContribution: 0.75,
        employerContribution: 3.25,
        wageLimit: 21000,
    });

    // PT Settings
    const [ptSettings, setPtSettings] = useState({
        enabled: true,
        monthlyDeduction: 200,
        annualDeduction: 2400,
        applicableFrom: 15000,
    });

    // TDS Settings
    const [tdsSettings, setTdsSettings] = useState({
        enabled: true,
        standardDeduction: 50000,
        section80C: 150000,
        section80D: 25000,
        hraExemption: true,
    });

    // Mock employee compliance data with incentives and additional salary
    const [employeeData, setEmployeeData] = useState([
        {
            id: 1,
            employeeId: 'EMP001',
            name: 'Rajesh Kumar',
            designation: 'Senior Teacher',
            department: 'Mathematics',
            basicSalary: 45000,
            grossSalary: 70500,
            incentive: 5000,
            additionalSalary: 0,
            compliance: {
                pfApplicable: true,
                pfPercentage: 12,
                esiApplicable: false,
                esiPercentage: 0.75,
                ptApplicable: true,
                ptAmount: 200,
                tdsApplicable: true,
                tdsPercentage: 10
            }
        },
        {
            id: 2,
            employeeId: 'EMP002',
            name: 'Priya Sharma',
            designation: 'Teacher',
            department: 'Science',
            basicSalary: 30000,
            grossSalary: 48600,
            incentive: 3000,
            additionalSalary: 2000,
            compliance: {
                pfApplicable: true,
                pfPercentage: 12,
                esiApplicable: true,
                esiPercentage: 0.75,
                ptApplicable: true,
                ptAmount: 200,
                tdsApplicable: false,
                tdsPercentage: 10
            }
        },
        {
            id: 3,
            employeeId: 'EMP003',
            name: 'Amit Patel',
            designation: 'Lab Assistant',
            department: 'Chemistry',
            basicSalary: 18000,
            grossSalary: 25600,
            incentive: 0,
            additionalSalary: 0,
            compliance: {
                pfApplicable: true,
                pfPercentage: 12,
                esiApplicable: true,
                esiPercentage: 0.75,
                ptApplicable: false,
                ptAmount: 0,
                tdsApplicable: false,
                tdsPercentage: 10
            }
        },
        {
            id: 4,
            employeeId: 'EMP004',
            name: 'Sunita Verma',
            designation: 'Principal',
            department: 'Administration',
            basicSalary: 65000,
            grossSalary: 95000,
            incentive: 10000,
            additionalSalary: 5000,
            compliance: {
                pfApplicable: true,
                pfPercentage: 12,
                esiApplicable: false,
                esiPercentage: 0.75,
                ptApplicable: true,
                ptAmount: 200,
                tdsApplicable: true,
                tdsPercentage: 15
            }
        },
        {
            id: 5,
            employeeId: 'EMP005',
            name: 'Mohammed Ali',
            designation: 'Sports Teacher',
            department: 'Physical Education',
            basicSalary: 28000,
            grossSalary: 42000,
            incentive: 2000,
            additionalSalary: 0,
            compliance: {
                pfApplicable: true,
                pfPercentage: 12,
                esiApplicable: true,
                esiPercentage: 0.75,
                ptApplicable: true,
                ptAmount: 200,
                tdsApplicable: false,
                tdsPercentage: 10
            }
        },
        {
            id: 6,
            employeeId: 'EMP006',
            name: 'Kavita Desai',
            designation: 'Librarian',
            department: 'Library',
            basicSalary: 22000,
            grossSalary: 32000,
            incentive: 0,
            additionalSalary: 1000,
            compliance: {
                pfApplicable: true,
                pfPercentage: 12,
                esiApplicable: true,
                esiPercentage: 0.75,
                ptApplicable: false,
                ptAmount: 0,
                tdsApplicable: false,
                tdsPercentage: 10
            }
        },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editedCompliance, setEditedCompliance] = useState(null);

    // Filter employees based on search
    const filteredEmployees = employeeData.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Statistics
    const totalEmployees = employeeData.length;
    const pfApplicableCount = employeeData.filter(e => e.compliance.pfApplicable).length;
    const esiApplicableCount = employeeData.filter(e => e.compliance.esiApplicable).length;
    const ptApplicableCount = employeeData.filter(e => e.compliance.ptApplicable).length;
    const tdsApplicableCount = employeeData.filter(e => e.compliance.tdsApplicable).length;
    const totalIncentives = employeeData.reduce((sum, e) => sum + e.incentive, 0);
    const totalAdditionalSalary = employeeData.reduce((sum, e) => sum + e.additionalSalary, 0);
    const employeesWithIncentive = employeeData.filter(e => e.incentive > 0).length;
    const employeesWithAdditionalSalary = employeeData.filter(e => e.additionalSalary > 0).length;

    const handleEditEmployee = (employee) => {
        setSelectedEmployee(employee);
        setEditedCompliance({ ...employee.compliance });
        setEditDialogOpen(true);
    };

    const handleSaveEmployeeCompliance = () => {
        if (selectedEmployee && editedCompliance) {
            setEmployeeData(employeeData.map(emp =>
                emp.id === selectedEmployee.id
                    ? { ...emp, compliance: editedCompliance }
                    : emp
            ));
            toast.success(`Compliance settings updated for ${selectedEmployee.name}!`);
            setEditDialogOpen(false);
            setSelectedEmployee(null);
            setEditedCompliance(null);
        }
    };

    const handleExportCompliance = () => {
        const excelData = employeeData.map((emp, index) => ({
            'S.No': index + 1,
            'Employee ID': emp.employeeId,
            'Employee Name': emp.name,
            'Designation': emp.designation,
            'Department': emp.department,
            'Basic Salary': emp.basicSalary,
            'Gross Salary': emp.grossSalary,
            'Incentive': emp.incentive,
            'Additional Salary': emp.additionalSalary,
            'PF Applicable': emp.compliance.pfApplicable ? 'Yes' : 'No',
            'PF %': emp.compliance.pfApplicable ? `${emp.compliance.pfPercentage}%` : 'N/A',
            'ESI Applicable': emp.compliance.esiApplicable ? 'Yes' : 'No',
            'ESI %': emp.compliance.esiApplicable ? `${emp.compliance.esiPercentage}%` : 'N/A',
            'PT Applicable': emp.compliance.ptApplicable ? 'Yes' : 'No',
            'PT Amount': emp.compliance.ptApplicable ? `₹${emp.compliance.ptAmount}` : 'N/A',
            'TDS Applicable': emp.compliance.tdsApplicable ? 'Yes' : 'No',
            'TDS %': emp.compliance.tdsApplicable ? `${emp.compliance.tdsPercentage}%` : 'N/A',
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        const colWidths = [
            { wch: 6 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 15 },
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 14 },
            { wch: 8 }, { wch: 14 }, { wch: 8 }, { wch: 14 }, { wch: 10 },
            { wch: 14 }, { wch: 8 }
        ];
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, 'Employee Compliance');
        const fileName = `Employee_Compliance_Settings_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success('Employee compliance data exported successfully!');
    };

    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            fontSize: '13px',
            bgcolor: '#FAFAFA',
            '&:hover': { bgcolor: '#fff' },
            '&.Mui-focused': { bgcolor: '#fff' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PRIMARY, borderWidth: '2px' },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: PRIMARY },
    };

    const handleSave = () => {
        toast.success('Global compliance settings saved successfully!');
    };

    const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
        <Card sx={{
            border: '1px solid #E8E8E8',
            borderRadius: CARD_RADIUS,
            boxShadow: 'none',
            mb: 3
        }}>
            <Box sx={{
                p: 2.5,
                borderBottom: '2px solid #F1F5F9',
                bgcolor: '#FAFAFA',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
            }}>
                <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    bgcolor: PRIMARY_LIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${PRIMARY}30`
                }}>
                    <Icon sx={{ fontSize: 20, color: PRIMARY }} />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>
                        {title}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#94A3B8', mt: 0.3 }}>
                        {subtitle}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ p: 2.5 }}>
                {children}
            </Box>
        </Card>
    );

    const renderPFTab = () => (
        <Box>
            <SectionCard
                icon={AccountBalanceIcon}
                title="Provident Fund (PF) Configuration"
                subtitle="Configure employee and employer PF contribution rates"
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                            Enable PF Deduction
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.5 }}>
                            Automatically deduct PF from employee salary
                        </Typography>
                    </Box>
                    <Switch
                        checked={pfSettings.enabled}
                        onChange={(e) => setPfSettings({ ...pfSettings, enabled: e.target.checked })}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: PRIMARY },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: PRIMARY }
                        }}
                    />
                </Box>

                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            label="Employee Contribution"
                            value={pfSettings.employeeContribution}
                            onChange={(e) => setPfSettings({ ...pfSettings, employeeContribution: e.target.value })}
                            size="small"
                            fullWidth
                            type="number"
                            disabled={!pfSettings.enabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }
                            }}
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            label="Employer Contribution"
                            value={pfSettings.employerContribution}
                            onChange={(e) => setPfSettings({ ...pfSettings, employerContribution: e.target.value })}
                            size="small"
                            fullWidth
                            type="number"
                            disabled={!pfSettings.enabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }
                            }}
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            label="Wage Ceiling Limit"
                            value={pfSettings.wageLimit}
                            onChange={(e) => setPfSettings({ ...pfSettings, wageLimit: e.target.value })}
                            size="small"
                            fullWidth
                            type="number"
                            disabled={!pfSettings.enabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }
                            }}
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            label="Admin Charges"
                            value={pfSettings.adminCharges}
                            onChange={(e) => setPfSettings({ ...pfSettings, adminCharges: e.target.value })}
                            size="small"
                            fullWidth
                            type="number"
                            disabled={!pfSettings.enabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }
                            }}
                            sx={fieldSx}
                        />
                    </Grid>
                </Grid>
            </SectionCard>
        </Box>
    );

    const renderESITab = () => (
        <Box>
            <SectionCard
                icon={SecurityIcon}
                title="Employee State Insurance (ESI) Configuration"
                subtitle="Configure ESI contribution rates and wage limits"
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                            Enable ESI Deduction
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.5 }}>
                            Automatically deduct ESI if salary is below wage limit
                        </Typography>
                    </Box>
                    <Switch
                        checked={esiSettings.enabled}
                        onChange={(e) => setEsiSettings({ ...esiSettings, enabled: e.target.checked })}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: PRIMARY },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: PRIMARY }
                        }}
                    />
                </Box>

                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            label="Employee Contribution"
                            value={esiSettings.employeeContribution}
                            onChange={(e) => setEsiSettings({ ...esiSettings, employeeContribution: e.target.value })}
                            size="small"
                            fullWidth
                            type="number"
                            disabled={!esiSettings.enabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }
                            }}
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            label="Employer Contribution"
                            value={esiSettings.employerContribution}
                            onChange={(e) => setEsiSettings({ ...esiSettings, employerContribution: e.target.value })}
                            size="small"
                            fullWidth
                            type="number"
                            disabled={!esiSettings.enabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }
                            }}
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            label="Wage Ceiling Limit"
                            value={esiSettings.wageLimit}
                            onChange={(e) => setEsiSettings({ ...esiSettings, wageLimit: e.target.value })}
                            size="small"
                            fullWidth
                            type="number"
                            disabled={!esiSettings.enabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }
                            }}
                            helperText="ESI applicable if gross salary is below this limit"
                            sx={fieldSx}
                        />
                    </Grid>
                </Grid>
            </SectionCard>
        </Box>
    );

    const renderPTTab = () => (
        <Box>
            <SectionCard
                icon={ReceiptIcon}
                title="Professional Tax (PT) Configuration"
                subtitle="Configure state-specific professional tax slabs"
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                            Enable Professional Tax
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.5 }}>
                            Deduct PT as per state regulations
                        </Typography>
                    </Box>
                    <Switch
                        checked={ptSettings.enabled}
                        onChange={(e) => setPtSettings({ ...ptSettings, enabled: e.target.checked })}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: PRIMARY },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: PRIMARY }
                        }}
                    />
                </Box>

                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            label="Monthly PT Deduction"
                            value={ptSettings.monthlyDeduction}
                            onChange={(e) => setPtSettings({ ...ptSettings, monthlyDeduction: e.target.value })}
                            size="small"
                            fullWidth
                            type="number"
                            disabled={!ptSettings.enabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }
                            }}
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            label="Annual PT Deduction"
                            value={ptSettings.annualDeduction}
                            onChange={(e) => setPtSettings({ ...ptSettings, annualDeduction: e.target.value })}
                            size="small"
                            fullWidth
                            type="number"
                            disabled={!ptSettings.enabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }
                            }}
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            label="Applicable From Salary"
                            value={ptSettings.applicableFrom}
                            onChange={(e) => setPtSettings({ ...ptSettings, applicableFrom: e.target.value })}
                            size="small"
                            fullWidth
                            type="number"
                            disabled={!ptSettings.enabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }
                            }}
                            helperText="PT applicable if gross salary is above this limit"
                            sx={fieldSx}
                        />
                    </Grid>
                </Grid>
            </SectionCard>
        </Box>
    );

    const renderTDSTab = () => (
        <Box>
            <SectionCard
                icon={AccountBalanceWalletIcon}
                title="Tax Deducted at Source (TDS) Configuration"
                subtitle="Configure income tax deduction settings and exemptions"
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                            Enable TDS Calculation
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.5 }}>
                            Calculate and deduct income tax as per IT Act
                        </Typography>
                    </Box>
                    <Switch
                        checked={tdsSettings.enabled}
                        onChange={(e) => setTdsSettings({ ...tdsSettings, enabled: e.target.checked })}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: PRIMARY },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: PRIMARY }
                        }}
                    />
                </Box>

                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            label="Standard Deduction"
                            value={tdsSettings.standardDeduction}
                            onChange={(e) => setTdsSettings({ ...tdsSettings, standardDeduction: e.target.value })}
                            size="small"
                            fullWidth
                            type="number"
                            disabled={!tdsSettings.enabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }
                            }}
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            label="Section 80C Limit"
                            value={tdsSettings.section80C}
                            onChange={(e) => setTdsSettings({ ...tdsSettings, section80C: e.target.value })}
                            size="small"
                            fullWidth
                            type="number"
                            disabled={!tdsSettings.enabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }
                            }}
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            label="Section 80D Limit (Medical Insurance)"
                            value={tdsSettings.section80D}
                            onChange={(e) => setTdsSettings({ ...tdsSettings, section80D: e.target.value })}
                            size="small"
                            fullWidth
                            type="number"
                            disabled={!tdsSettings.enabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }
                            }}
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <Box sx={{
                            p: 2,
                            border: '1px solid #E8E8E8',
                            borderRadius: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                Enable HRA Exemption
                            </Typography>
                            <Switch
                                checked={tdsSettings.hraExemption}
                                onChange={(e) => setTdsSettings({ ...tdsSettings, hraExemption: e.target.checked })}
                                disabled={!tdsSettings.enabled}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': { color: PRIMARY },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: PRIMARY }
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </SectionCard>
        </Box>
    );

    const renderEmployeeComplianceTab = () => (
        <Box>
            {/* Statistics Cards - Row 1 */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{
                        border: '1px solid #2563EB30',
                        borderRadius: CARD_RADIUS,
                        bgcolor: PRIMARY_LIGHT,
                        boxShadow: 'none'
                    }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', color: PRIMARY, fontWeight: 600, mb: 1 }}>
                                        Total Employees
                                    </Typography>
                                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>
                                        {totalEmployees}
                                    </Typography>
                                </Box>
                                <PeopleIcon sx={{ fontSize: 32, color: PRIMARY, opacity: 0.6 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{
                        border: '1px solid #8600BB30',
                        borderRadius: CARD_RADIUS,
                        bgcolor: '#f9f4fc',
                        boxShadow: 'none'
                    }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#8600BB', fontWeight: 600, mb: 1 }}>
                                        PF Applicable
                                    </Typography>
                                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>
                                        {pfApplicableCount}
                                    </Typography>
                                </Box>
                                <AccountBalanceIcon sx={{ fontSize: 32, color: '#8600BB', opacity: 0.6 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{
                        border: '1px solid #10B98130',
                        borderRadius: CARD_RADIUS,
                        bgcolor: '#ECFDF5',
                        boxShadow: 'none'
                    }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#10B981', fontWeight: 600, mb: 1 }}>
                                        ESI Applicable
                                    </Typography>
                                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>
                                        {esiApplicableCount}
                                    </Typography>
                                </Box>
                                <SecurityIcon sx={{ fontSize: 32, color: '#10B981', opacity: 0.6 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{
                        border: '1px solid #FF980030',
                        borderRadius: CARD_RADIUS,
                        bgcolor: '#FFF4E6',
                        boxShadow: 'none'
                    }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#FF9800', fontWeight: 600, mb: 1 }}>
                                        PT Applicable
                                    </Typography>
                                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>
                                        {ptApplicableCount}
                                    </Typography>
                                </Box>
                                <ReceiptIcon sx={{ fontSize: 32, color: '#FF9800', opacity: 0.6 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Statistics Cards - Row 2: Incentives & Additional Salary */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                    <Card sx={{
                        border: '1px solid #7DC35330',
                        borderRadius: CARD_RADIUS,
                        bgcolor: '#F0FDF4',
                        boxShadow: 'none'
                    }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: '12px', color: '#7DC353', fontWeight: 600, mb: 1 }}>
                                        Total Incentives
                                    </Typography>
                                    <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a' }}>
                                        ₹{totalIncentives.toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 0.5 }}>
                                        {employeesWithIncentive} employees receiving incentives
                                    </Typography>
                                </Box>
                                <CheckCircleIcon sx={{ fontSize: 38, color: '#7DC353', opacity: 0.6 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                    <Card sx={{
                        border: '1px solid #E3005330',
                        borderRadius: CARD_RADIUS,
                        bgcolor: '#FCF8F9',
                        boxShadow: 'none'
                    }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: '12px', color: '#E30053', fontWeight: 600, mb: 1 }}>
                                        Total Additional Salary
                                    </Typography>
                                    <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a' }}>
                                        ₹{totalAdditionalSalary.toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 0.5 }}>
                                        {employeesWithAdditionalSalary} employees with additional salary
                                    </Typography>
                                </Box>
                                <AccountBalanceWalletIcon sx={{ fontSize: 38, color: '#E30053', opacity: 0.6 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search and Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, gap: 2 }}>
                <TextField
                    placeholder="Search by name, ID, or designation..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 20, color: '#94A3B8' }} />
                                </InputAdornment>
                            )
                        }
                    }}
                    sx={{
                        flex: 1,
                        maxWidth: '400px',
                        ...fieldSx
                    }}
                />
                <Button
                    variant="outlined"
                    onClick={handleExportCompliance}
                    sx={{
                        textTransform: 'none',
                        borderColor: PRIMARY,
                        color: PRIMARY,
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '700',
                        '&:hover': { borderColor: PRIMARY_DARK, bgcolor: PRIMARY_LIGHT }
                    }}
                >
                    Export to Excel
                </Button>
            </Box>

            {/* Employee Compliance Table */}
            <Card sx={{
                border: '1px solid #E8E8E8',
                borderRadius: CARD_RADIUS,
                boxShadow: 'none'
            }}>
                <Box sx={{
                    p: 2.5,
                    borderBottom: '2px solid #F1F5F9',
                    bgcolor: '#FAFAFA',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                }}>
                    <VerifiedUserIcon sx={{ fontSize: 20, color: PRIMARY }} />
                    <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>
                        Employee Compliance Settings
                    </Typography>
                </Box>
                <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Employee</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Basic Salary</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B', textAlign: 'center' }}>Incentive</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B', textAlign: 'center' }}>Add. Salary</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B', textAlign: 'center' }}>PF</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B', textAlign: 'center' }}>ESI</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B', textAlign: 'center' }}>PT</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B', textAlign: 'center' }}>TDS</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEmployees.map((emp) => (
                                <TableRow
                                    key={emp.id}
                                    sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{
                                                width: 36,
                                                height: 36,
                                                bgcolor: PRIMARY_LIGHT,
                                                color: PRIMARY
                                            }}>
                                                {emp.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                    {emp.name}
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                                                    {emp.employeeId} • {emp.designation}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>
                                        ₹{emp.basicSalary.toLocaleString()}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Chip
                                            label={emp.incentive > 0 ? `₹${emp.incentive.toLocaleString()}` : 'Nil'}
                                            size="small"
                                            sx={{
                                                bgcolor: emp.incentive > 0 ? '#F0FDF4' : '#F1F5F9',
                                                color: emp.incentive > 0 ? '#7DC353' : '#94A3B8',
                                                fontWeight: 600,
                                                fontSize: '11px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Chip
                                            label={emp.additionalSalary > 0 ? `₹${emp.additionalSalary.toLocaleString()}` : 'Nil'}
                                            size="small"
                                            sx={{
                                                bgcolor: emp.additionalSalary > 0 ? '#FCF8F9' : '#F1F5F9',
                                                color: emp.additionalSalary > 0 ? '#E30053' : '#94A3B8',
                                                fontWeight: 600,
                                                fontSize: '11px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Chip
                                            label={emp.compliance.pfApplicable ? `${emp.compliance.pfPercentage}%` : 'N/A'}
                                            size="small"
                                            sx={{
                                                bgcolor: emp.compliance.pfApplicable ? '#f9f4fc' : '#F1F5F9',
                                                color: emp.compliance.pfApplicable ? '#8600BB' : '#94A3B8',
                                                fontWeight: 600,
                                                fontSize: '11px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Chip
                                            label={emp.compliance.esiApplicable ? `${emp.compliance.esiPercentage}%` : 'N/A'}
                                            size="small"
                                            sx={{
                                                bgcolor: emp.compliance.esiApplicable ? '#ECFDF5' : '#F1F5F9',
                                                color: emp.compliance.esiApplicable ? '#10B981' : '#94A3B8',
                                                fontWeight: 600,
                                                fontSize: '11px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Chip
                                            label={emp.compliance.ptApplicable ? `₹${emp.compliance.ptAmount}` : 'N/A'}
                                            size="small"
                                            sx={{
                                                bgcolor: emp.compliance.ptApplicable ? '#FFF4E6' : '#F1F5F9',
                                                color: emp.compliance.ptApplicable ? '#FF9800' : '#94A3B8',
                                                fontWeight: 600,
                                                fontSize: '11px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Chip
                                            label={emp.compliance.tdsApplicable ? `${emp.compliance.tdsPercentage}%` : 'N/A'}
                                            size="small"
                                            sx={{
                                                bgcolor: emp.compliance.tdsApplicable ? '#EFF6FF' : '#F1F5F9',
                                                color: emp.compliance.tdsApplicable ? '#2563EB' : '#94A3B8',
                                                fontWeight: 600,
                                                fontSize: '11px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditEmployee(emp)}
                                            sx={{
                                                bgcolor: PRIMARY_LIGHT,
                                                '&:hover': { bgcolor: PRIMARY, '& .MuiSvgIcon-root': { color: '#fff' } }
                                            }}
                                        >
                                            <EditIcon sx={{ fontSize: 18, color: PRIMARY }} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Card>
        </Box>
    );

    return (
        <Box sx={{
            height: '86vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FAFAFA',
            borderRadius: '20px',
            border: '1px solid #E8E8E8',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <Box sx={{
                bgcolor: '#fff',
                borderBottom: '2px solid #F1F5F9',
                px: 3,
                py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            width: '40px',
                            height: '40px',
                            bgcolor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '10px',
                            '&:hover': { bgcolor: PRIMARY_LIGHT, borderColor: PRIMARY }
                        }}
                    >
                        <ArrowBackIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a' }}>
                            Auto-Deductions & Compliance
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.3 }}>
                            Configure statutory compliance settings
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={handleSave}
                    sx={{
                        textTransform: 'none',
                        bgcolor: PRIMARY,
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '700',
                        px: 3,
                        '&:hover': { bgcolor: PRIMARY_DARK }
                    }}
                >
                    Save Settings
                </Button>
            </Box>

            <Divider />

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fff', px: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            minHeight: '48px'
                        },
                        '& .Mui-selected': {
                            color: `${PRIMARY} !important`
                        },
                        '& .MuiTabs-indicator': {
                            bgcolor: PRIMARY
                        }
                    }}
                >
                    <Tab label="Employee Compliance" />
                    <Tab label="Provident Fund (PF)" />
                    <Tab label="ESI" />
                    <Tab label="Professional Tax" />
                    <Tab label="TDS" />
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
                {activeTab === 0 && renderEmployeeComplianceTab()}
                {activeTab === 1 && renderPFTab()}
                {activeTab === 2 && renderESITab()}
                {activeTab === 3 && renderPTTab()}
                {activeTab === 4 && renderTDSTab()}
            </Box>

            {/* Edit Employee Compliance Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }
                }}
            >
                <DialogTitle sx={{
                    bgcolor: '#FAFAFA',
                    borderBottom: '2px solid #F1F5F9',
                    pb: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            bgcolor: PRIMARY_LIGHT,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${PRIMARY}30`
                        }}>
                            <EditIcon sx={{ fontSize: 20, color: PRIMARY }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>
                                Edit Compliance Settings
                            </Typography>
                            {selectedEmployee && (
                                <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.3 }}>
                                    {selectedEmployee.name} ({selectedEmployee.employeeId})
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3, mt: 2 }}>
                    {editedCompliance && selectedEmployee && (
                        <Grid container spacing={3}>
                            {/* Incentive & Additional Salary Section */}
                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '12px', bgcolor: '#FAFAFA' }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', mb: 2 }}>
                                            Salary Components
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                                <TextField
                                                    label="Performance Incentive"
                                                    value={selectedEmployee.incentive}
                                                    onChange={(e) => {
                                                        const newData = employeeData.map(emp =>
                                                            emp.id === selectedEmployee.id
                                                                ? { ...emp, incentive: parseFloat(e.target.value) || 0 }
                                                                : emp
                                                        );
                                                        setEmployeeData(newData);
                                                        setSelectedEmployee({ ...selectedEmployee, incentive: parseFloat(e.target.value) || 0 });
                                                    }}
                                                    size="small"
                                                    fullWidth
                                                    type="number"
                                                    slotProps={{
                                                        inputLabel: { shrink: true },
                                                        input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }
                                                    }}
                                                    sx={fieldSx}
                                                    helperText="Monthly performance-based incentive"
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                                <TextField
                                                    label="Additional Salary"
                                                    value={selectedEmployee.additionalSalary}
                                                    onChange={(e) => {
                                                        const newData = employeeData.map(emp =>
                                                            emp.id === selectedEmployee.id
                                                                ? { ...emp, additionalSalary: parseFloat(e.target.value) || 0 }
                                                                : emp
                                                        );
                                                        setEmployeeData(newData);
                                                        setSelectedEmployee({ ...selectedEmployee, additionalSalary: parseFloat(e.target.value) || 0 });
                                                    }}
                                                    size="small"
                                                    fullWidth
                                                    type="number"
                                                    slotProps={{
                                                        inputLabel: { shrink: true },
                                                        input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }
                                                    }}
                                                    sx={fieldSx}
                                                    helperText="One-time or special allowance"
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* PF Section */}
                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <Card sx={{ border: '1px solid #8600BB30', borderRadius: '12px', bgcolor: '#f9f4fc' }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AccountBalanceIcon sx={{ fontSize: 20, color: '#8600BB' }} />
                                                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>
                                                    Provident Fund (PF)
                                                </Typography>
                                            </Box>
                                            <Switch
                                                checked={editedCompliance.pfApplicable}
                                                onChange={(e) => setEditedCompliance({
                                                    ...editedCompliance,
                                                    pfApplicable: e.target.checked
                                                })}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#8600BB' },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8600BB' }
                                                }}
                                            />
                                        </Box>
                                        <TextField
                                            label="PF Percentage"
                                            value={editedCompliance.pfPercentage}
                                            onChange={(e) => setEditedCompliance({
                                                ...editedCompliance,
                                                pfPercentage: parseFloat(e.target.value) || 0
                                            })}
                                            size="small"
                                            fullWidth
                                            type="number"
                                            disabled={!editedCompliance.pfApplicable}
                                            slotProps={{
                                                inputLabel: { shrink: true },
                                                input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }
                                            }}
                                            sx={fieldSx}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* ESI Section */}
                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <Card sx={{ border: '1px solid #10B98130', borderRadius: '12px', bgcolor: '#ECFDF5' }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <SecurityIcon sx={{ fontSize: 20, color: '#10B981' }} />
                                                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>
                                                    Employee State Insurance (ESI)
                                                </Typography>
                                            </Box>
                                            <Switch
                                                checked={editedCompliance.esiApplicable}
                                                onChange={(e) => setEditedCompliance({
                                                    ...editedCompliance,
                                                    esiApplicable: e.target.checked
                                                })}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10B981' }
                                                }}
                                            />
                                        </Box>
                                        <TextField
                                            label="ESI Percentage"
                                            value={editedCompliance.esiPercentage}
                                            onChange={(e) => setEditedCompliance({
                                                ...editedCompliance,
                                                esiPercentage: parseFloat(e.target.value) || 0
                                            })}
                                            size="small"
                                            fullWidth
                                            type="number"
                                            disabled={!editedCompliance.esiApplicable}
                                            slotProps={{
                                                inputLabel: { shrink: true },
                                                input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }
                                            }}
                                            sx={fieldSx}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* PT Section */}
                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <Card sx={{ border: '1px solid #FF980030', borderRadius: '12px', bgcolor: '#FFF4E6' }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ReceiptIcon sx={{ fontSize: 20, color: '#FF9800' }} />
                                                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>
                                                    Professional Tax (PT)
                                                </Typography>
                                            </Box>
                                            <Switch
                                                checked={editedCompliance.ptApplicable}
                                                onChange={(e) => setEditedCompliance({
                                                    ...editedCompliance,
                                                    ptApplicable: e.target.checked
                                                })}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#FF9800' },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#FF9800' }
                                                }}
                                            />
                                        </Box>
                                        <TextField
                                            label="PT Amount"
                                            value={editedCompliance.ptAmount}
                                            onChange={(e) => setEditedCompliance({
                                                ...editedCompliance,
                                                ptAmount: parseFloat(e.target.value) || 0
                                            })}
                                            size="small"
                                            fullWidth
                                            type="number"
                                            disabled={!editedCompliance.ptApplicable}
                                            slotProps={{
                                                inputLabel: { shrink: true },
                                                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }
                                            }}
                                            sx={fieldSx}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* TDS Section */}
                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <Card sx={{ border: '1px solid #2563EB30', borderRadius: '12px', bgcolor: PRIMARY_LIGHT }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AccountBalanceWalletIcon sx={{ fontSize: 20, color: PRIMARY }} />
                                                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>
                                                    Tax Deducted at Source (TDS)
                                                </Typography>
                                            </Box>
                                            <Switch
                                                checked={editedCompliance.tdsApplicable}
                                                onChange={(e) => setEditedCompliance({
                                                    ...editedCompliance,
                                                    tdsApplicable: e.target.checked
                                                })}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: PRIMARY },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: PRIMARY }
                                                }}
                                            />
                                        </Box>
                                        <TextField
                                            label="TDS Percentage"
                                            value={editedCompliance.tdsPercentage}
                                            onChange={(e) => setEditedCompliance({
                                                ...editedCompliance,
                                                tdsPercentage: parseFloat(e.target.value) || 0
                                            })}
                                            size="small"
                                            fullWidth
                                            type="number"
                                            disabled={!editedCompliance.tdsApplicable}
                                            slotProps={{
                                                inputLabel: { shrink: true },
                                                input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }
                                            }}
                                            sx={fieldSx}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#FAFAFA', borderTop: '2px solid #F1F5F9' }}>
                    <Button
                        onClick={() => setEditDialogOpen(false)}
                        sx={{
                            textTransform: 'none',
                            color: '#64748B',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '700'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveEmployeeCompliance}
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            bgcolor: PRIMARY,
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '700',
                            px: 3,
                            '&:hover': { bgcolor: PRIMARY_DARK }
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
