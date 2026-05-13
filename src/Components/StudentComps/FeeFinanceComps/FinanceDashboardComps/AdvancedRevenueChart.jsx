import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import { monthlyCollectionByCategory } from '../../../../Api/Api';

const token = "123";

const toLakhs = (val) => {
    if (!val && val !== 0) return 0;
    return Number((val / 100000).toFixed(2));
};

const formatLakhs = (val) => {
    if (!val && val !== 0) return '₹0';
    if (val >= 1) return `₹${val.toFixed(2)}L`;
    if (val >= 0.01) return `₹${(val * 100000).toLocaleString()}`;
    return '₹0';
};

const seriesConfig = [
    { key: 'schoolFee', label: 'School Fee', color: '#E91E63', dashed: false },
    { key: 'transportFee', label: 'Transport Fee', color: '#7C3AED', dashed: false },
    { key: 'ecaFee', label: 'ECA Fee', color: '#F97316', dashed: true },
    { key: 'additionalFee', label: 'Additional Fee', color: '#0891B2', dashed: true },
];

export default function AdvancedRevenueChart({ selectedYear }) {
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [academicYear, setAcademicYear] = useState('');

    useEffect(() => {
        if (selectedYear) fetchMonthlyCollection();
    }, [selectedYear]);

    const fetchMonthlyCollection = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(monthlyCollectionByCategory, {
                params: { AcademicYear: selectedYear },
                headers: { Authorization: `Bearer ${token}` },
            });
            const months = res.data?.monthlyCollection || [];
            setAcademicYear(res.data?.academicYear || selectedYear);
            setChartData(
                months.map((m) => ({
                    month: m.month,
                    schoolFee: toLakhs(m.schoolFee),
                    transportFee: toLakhs(m.transportFee),
                    ecaFee: toLakhs(m.ecaFee),
                    additionalFee: toLakhs(m.additionalFee),
                    total: toLakhs(m.total),
                }))
            );
        } catch (error) {
            console.error(error);
            setChartData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Custom tooltip — shows all 4 categories + total
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Box
                    sx={{
                        bgcolor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        p: 1.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        minWidth: 180,
                    }}
                >
                    <Typography sx={{ fontSize: '13px', fontWeight: '700', mb: 1, color: '#1a1a1a' }}>
                        {label}
                    </Typography>
                    {seriesConfig.map((s) => (
                        <Box key={s.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                <Box sx={{
                                    width: 14, height: 0,
                                    borderTop: s.dashed ? `2px dashed ${s.color}` : `2px solid ${s.color}`,
                                }} />
                                <Typography sx={{ fontSize: '11px', color: '#666' }}>{s.label}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: s.color, ml: 1.5 }}>
                                {formatLakhs(data[s.key])}
                            </Typography>
                        </Box>
                    ))}
                    <Box sx={{ borderTop: '1px solid #EEE', mt: 0.7, pt: 0.7, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#1a1a1a' }}>Total</Typography>
                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#1a1a1a' }}>
                            {formatLakhs(data.total)}
                        </Typography>
                    </Box>
                </Box>
            );
        }
        return null;
    };

    // Custom legend
    const renderLegend = () => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, flexWrap: 'wrap' }}>
            {seriesConfig.map((s) => (
                <Box key={s.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Box sx={{
                        width: 22, height: 0,
                        borderTop: s.dashed ? `3px dashed ${s.color}` : `3px solid ${s.color}`,
                    }} />
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>{s.label}</Typography>
                </Box>
            ))}
        </Box>
    );

    return (
        <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', height: '550px', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box>
                        <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>
                            Monthly Collection by Category
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#888' }}>
                            Academic Year {academicYear || selectedYear || '—'}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ flex: 1 }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1.5 }}>
                            <CircularProgress size={32} sx={{ color: '#7C3AED' }} />
                            <Typography sx={{ fontSize: '12px', color: '#888' }}>Loading collection data...</Typography>
                        </Box>
                    ) : chartData.length === 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Typography sx={{ fontSize: '13px', color: '#999' }}>No collection data available</Typography>
                        </Box>
                    ) : (
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
                                        value: 'Amount in Lakhs',
                                        angle: -90,
                                        position: 'insideLeft',
                                        style: { fontSize: '12px', fill: '#666' },
                                    }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend content={renderLegend} />

                                {seriesConfig.map((s) => (
                                    <Line
                                        key={s.key}
                                        type="linear"
                                        dataKey={s.key}
                                        stroke={s.color}
                                        strokeWidth={s.dashed ? 2 : 2.5}
                                        strokeDasharray={s.dashed ? '5 5' : undefined}
                                        dot={s.dashed ? false : { r: 3, fill: s.color, stroke: '#fff', strokeWidth: 1 }}
                                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                        name={s.label}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
