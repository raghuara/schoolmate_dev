import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Chip
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Dot
} from 'recharts';

export default function AdvancedRevenueChart() {
    const [scale, setScale] = useState('lakhs');
    const [viewMode, setViewMode] = useState('month');

    // Mock data for current year (Primary)
    const revenueData2025 = [
        { month: 'Apr 2025', collection: 0, expenses: 0 },
        { month: 'May 2025', collection: 10, expenses: 5 },
        { month: 'June 2025', collection: 6, expenses: 8 },
        { month: 'July 2025', collection: 5, expenses: 16 },
        { month: 'Aug 2025', collection: 15, expenses: 20 },
        { month: 'Sep 2025', collection: 10, expenses: 10 },
        { month: 'Oct 2025', collection: 15, expenses: 25 },
        { month: 'Nov 2025', collection: 15, expenses: 20 },
        { month: 'Dec 2025', collection: 20, expenses: 25 },
        { month: 'Jan 2025', collection: 25, expenses: 30 },
        { month: 'Feb 2025', collection: 30, expenses: 35 },
        { month: 'Mar 2025', collection: 30, expenses: 30 },
    ];

    // Mock data for comparison year (Comparison - Dashed lines)
    const revenueDataComparison = [
        { month: 'Apr 2025', collectionComp: 0, expensesComp: 0 },
        { month: 'May 2025', collectionComp: 2, expensesComp: 3 },
        { month: 'June 2025', collectionComp: 8, expensesComp: 10 },
        { month: 'July 2025', collectionComp: 15, expensesComp: 12 },
        { month: 'Aug 2025', collectionComp: 20, expensesComp: 18 },
        { month: 'Sep 2025', collectionComp: 18, expensesComp: 22 },
        { month: 'Oct 2025', collectionComp: 32, expensesComp: 24 },
        { month: 'Nov 2025', collectionComp: 27, expensesComp: 30 },
        { month: 'Dec 2025', collectionComp: 30, expensesComp: 30 },
        { month: 'Jan 2025', collectionComp: 36, expensesComp: 35 },
        { month: 'Feb 2025', collectionComp: 25, expensesComp: 35 },
        { month: 'Mar 2025', collectionComp: 40, expensesComp: 30 },
    ];

    // Merge data for chart
    const chartData = revenueData2025.map((item, index) => ({
        ...item,
        collectionComp: revenueDataComparison[index].collectionComp,
        expensesComp: revenueDataComparison[index].expensesComp,
    }));

    // Scale conversion functions
    const getScaleMultiplier = () => {
        switch (scale) {
            case 'thousands':
                return 1;
            case 'lakhs':
                return 1;
            case 'crore':
                return 100;
            default:
                return 1;
        }
    };

    const getScaleLabel = () => {
        switch (scale) {
            case 'thousands':
                return 'Thousands';
            case 'lakhs':
                return 'Lakhs';
            case 'crore':
                return 'Crore';
            default:
                return 'Lakhs';
        }
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const collectionData = payload.find(p => p.dataKey === 'collection');
            const expensesData = payload.find(p => p.dataKey === 'expenses');

            return (
                <Box
                    sx={{
                        bgcolor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        p: 1.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                >
                    <Typography sx={{ fontSize: '13px', fontWeight: '600', mb: 1 }}>
                        {label}
                    </Typography>
                    {collectionData && (
                        <Typography sx={{ fontSize: '12px', color: '#7C3AED', mb: 0.5 }}>
                            Collection ₹ {collectionData.value}{getScaleLabel()}
                        </Typography>
                    )}
                    {expensesData && (
                        <Typography sx={{ fontSize: '12px', color: '#E91E63' }}>
                            Expenses ₹ {expensesData.value}{getScaleLabel()}
                        </Typography>
                    )}
                </Box>
            );
        }
        return null;
    };

    // Custom dot component
    const CustomDot = (props) => {
        const { cx, cy, stroke, payload, dataKey } = props;

        // Show dot for August and November
        if (payload.month === 'Aug 2025' || payload.month === 'Nov 2025') {
            return (
                <g>
                    <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={stroke}
                        stroke="#fff"
                        strokeWidth={2}
                    />
                </g>
            );
        }
        return null;
    };

    // Custom legend
    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 20, height: 3, bgcolor: '#7C3AED', borderRadius: '2px' }} />
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                        Collection (Primary)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 20, height: 3, bgcolor: '#E91E63', borderRadius: '2px' }} />
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                        Expenses (Primary)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                        sx={{
                            width: 20,
                            height: 3,
                            borderTop: '3px dashed #F97316',
                            borderRadius: '2px'
                        }}
                    />
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                        Collection (Comparison)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                        sx={{
                            width: 20,
                            height: 3,
                            borderTop: '3px dashed #0891B2',
                            borderRadius: '2px'
                        }}
                    />
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                        Expenses (Comparison)
                    </Typography>
                </Box>
            </Box>
        );
    };

    return (
        <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', height: '550px', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header with Scale and View Mode */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '14px', fontWeight: '500', color: '#666' }}>
                            Scale:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                                label="Thousands"
                                onClick={() => setScale('thousands')}
                                sx={{
                                    height: '28px',
                                    fontSize: '12px',
                                    bgcolor: scale === 'thousands' ? '#F0F9FA' : '#FAFAFA',
                                    color: scale === 'thousands' ? '#4DD0E1' : '#999',
                                    fontWeight: scale === 'thousands' ? '600' : '400',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: scale === 'thousands' ? '#D4F1F4' : '#E8E8E8',
                                    }
                                }}
                                icon={scale === 'thousands' ? <HelpOutlineIcon sx={{ fontSize: 14 }} /> : undefined}
                            />
                            <Chip
                                label="Lakhs"
                                onClick={() => setScale('lakhs')}
                                sx={{
                                    height: '28px',
                                    fontSize: '12px',
                                    bgcolor: scale === 'lakhs' ? '#F0F9FA' : '#FAFAFA',
                                    color: scale === 'lakhs' ? '#4DD0E1' : '#999',
                                    fontWeight: scale === 'lakhs' ? '600' : '400',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: scale === 'lakhs' ? '#D4F1F4' : '#E8E8E8',
                                    }
                                }}
                                icon={scale === 'lakhs' ? <HelpOutlineIcon sx={{ fontSize: 14 }} /> : undefined}
                            />
                            <Chip
                                label="Crore"
                                onClick={() => setScale('crore')}
                                sx={{
                                    height: '28px',
                                    fontSize: '12px',
                                    bgcolor: scale === 'crore' ? '#F0F9FA' : '#FAFAFA',
                                    color: scale === 'crore' ? '#4DD0E1' : '#999',
                                    fontWeight: scale === 'crore' ? '600' : '400',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: scale === 'crore' ? '#D4F1F4' : '#E8E8E8',
                                    }
                                }}
                                icon={scale === 'crore' ? <HelpOutlineIcon sx={{ fontSize: 14 }} /> : undefined}
                            />
                        </Box>
                    </Box>

                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, newValue) => newValue && setViewMode(newValue)}
                        size="small"
                        sx={{
                            '& .MuiToggleButton-root': {
                                textTransform: 'none',
                                fontSize: '12px',
                                px: 2,
                                py: 0.5,
                                border: '1px solid #E8E8E8',
                                color: '#999',
                                '&.Mui-selected': {
                                    bgcolor: '#4DD0E1',
                                    color: '#fff',
                                    border: '1px solid #4DD0E1',
                                    '&:hover': {
                                        bgcolor: '#26C6DA',
                                    }
                                }
                            }
                        }}
                    >
                        <ToggleButton value="day">Day</ToggleButton>
                        <ToggleButton value="month">Month</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Chart */}
                <Box sx={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                            <XAxis
                                dataKey="month"
                                stroke="#999"
                                style={{ fontSize: '11px' }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis
                                stroke="#999"
                                style={{ fontSize: '11px' }}
                                label={{
                                    value: `Amount in ${getScaleLabel()}`,
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { fontSize: '12px', fill: '#666' }
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={renderLegend} />

                            {/* Primary Lines (Solid) */}
                            <Line
                                type="linear"
                                dataKey="collection"
                                stroke="#7C3AED"
                                strokeWidth={2.5}
                                dot={<CustomDot />}
                                activeDot={{ r: 6 }}
                                name="Collection (Primary)"
                            />
                            <Line
                                type="linear"
                                dataKey="expenses"
                                stroke="#E91E63"
                                strokeWidth={2.5}
                                dot={<CustomDot />}
                                activeDot={{ r: 6 }}
                                name="Expenses (Primary)"
                            />

                            {/* Comparison Lines (Dashed) */}
                            <Line
                                type="linear"
                                dataKey="collectionComp"
                                stroke="#F97316"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                activeDot={{ r: 5 }}
                                name="Collection (Comparison)"
                            />
                            <Line
                                type="linear"
                                dataKey="expensesComp"
                                stroke="#0891B2"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                activeDot={{ r: 5 }}
                                name="Expenses (Comparison)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
}
