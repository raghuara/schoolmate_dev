import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

function FullWidthBarChartPage({ teachersData }) {
    const attendanceData = teachersData;
    const labels = attendanceData.map(item => item.grade);
    const values = attendanceData.map(item => item.percentage);

    const isEmptyData = attendanceData.every(item => item.percentage === 0);

    const groupRanges = {
        Nursery: { range: [0, 2], label: "Nursery" },
        Primary: { range: [3, 7], label: "Primary" },
        Secondary: { range: [8, 12], label: "Secondary" },
    };

    const gradientColors = {
        Nursery: { start: '#8338EC', end: '#4A2086' },
        Primary: { start: '#B05DD0', end: '#8600BB' },
        Secondary: { start: '#FCAA67', end: '#CE5C00' },
    };

    const createGradient = (ctx, color) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, color.start);
        gradient.addColorStop(1, color.end);
        return gradient;
    };

    if (!teachersData || teachersData.length === 0 || attendanceData.every(item => parseFloat(item.percentage) === 0)) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: 'center', height: '250px' }}>
                <h3>No data to display</h3>
            </div>
        );
    }
    

    return (
        <div 
        style={{ 
            width: "100%", 
            minWidth: "500px", 
            overflowX: "auto", 
            height: "300px", 
            display: "flex", 
            justifyContent: "center" 
        }}
    >
            <Bar
                data={{
                    labels: labels,
                    datasets: [
                        {
                            label: "Total Attendance (%)",
                            data: values,
                            backgroundColor: (context) => {
                                const chart = context.chart;
                                const { ctx } = chart;
                                const item = attendanceData[context.dataIndex];
                                const group = Object.keys(groupRanges).find(key =>
                                    context.dataIndex >= groupRanges[key].range[0] &&
                                    context.dataIndex <= groupRanges[key].range[1]
                                );
                                const color = gradientColors[group] || gradientColors.Primary;
                                return createGradient(ctx, color);
                            },
                            barThickness: 28,
                            borderRadius: 3
                        },
                    ],
                }}
                options={{
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            stacked: true,
                            ticks: { autoSkip: false },
                            grid: { display: false },
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 10 },
                            grid: { color: "rgba(200, 200, 200, 0.2)" },
                        },
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: (context) => {
                                    const item = attendanceData[context.dataIndex];
                                    return `${item.grade}: ${item.percentage}%`;
                                }
                            }
                        }
                    },
                    layout: {
                        padding: { top: 0, bottom: 50 },
                    },
                    responsive: true,
                }}
                plugins={[
                    {
                        id: 'groupLabels',
                        afterDraw(chart) {
                            const { ctx } = chart;
                            const xScale = chart.scales.x;
                            const yScale = chart.scales.y;

                            ctx.save();
                            ctx.font = 'bold 12px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillStyle = '#000';

                            Object.keys(groupRanges).forEach((key) => {
                                const { range, label } = groupRanges[key];
                                const start = xScale.getPixelForValue(range[0]);
                                const end = xScale.getPixelForValue(range[1]);
                                const center = (start + end) / 2;

                                ctx.fillStyle = '#000';
                                ctx.fillText(
                                    label,
                                    center,
                                    yScale.bottom + 50
                                );

                                const bulletColor = gradientColors[key].start;
                                ctx.beginPath();
                                ctx.arc(center - 40, yScale.bottom + 45, 5, 0, 2 * Math.PI);
                                ctx.fillStyle = bulletColor;
                                ctx.fill();
                                ctx.closePath();
                            });

                            ctx.restore();
                        },
                    },
                ]}
            />
        </div>
    );
}

export default FullWidthBarChartPage;
