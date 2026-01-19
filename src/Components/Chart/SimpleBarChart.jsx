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

function SimpleBarChartPage({ GraphData }) {
    const labels = GraphData.map(item => item.section);
    const values = GraphData.map(item => item.percentage);

    const isEmptyData = GraphData.every(item => item.percentage === 0);

    const gradientColors = [
        { start: '#B05DD0', end: '#8600BB' },
    ];

    const createGradient = (ctx, color) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, color.start);
        gradient.addColorStop(1, color.end);
        return gradient;
    };

    if (!GraphData || GraphData.length === 0 || isEmptyData) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: 'center', height: '250px' }}>
                <h3>No data to display</h3>
            </div>
        );
    }

    return (
        <div style={{ width: "100%", height: "300px" }}>
            <Bar
                data={{
                    labels: labels,
                    datasets: [
                        {
                            label: "Section Attendance",
                            data: values,
                            backgroundColor: (context) => {
                                const chart = context.chart;
                                const { ctx } = chart;
                                const colorIndex = context.dataIndex % gradientColors.length;
                                return createGradient(ctx, gradientColors[colorIndex]);
                            },
                            barThickness: 28,
                            borderRadius: 3,
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
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            enabled: false,
                            external: (context) => {
                                let tooltipEl = document.getElementById('custom-tooltip');

                                if (!tooltipEl) {
                                    tooltipEl = document.createElement('div');
                                    tooltipEl.id = 'custom-tooltip';
                                    tooltipEl.style.position = 'absolute';
                                    tooltipEl.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                                    tooltipEl.style.color = 'white';
                                    tooltipEl.style.padding = '8px';
                                    tooltipEl.style.borderRadius = '4px';
                                    tooltipEl.style.pointerEvents = 'none';
                                    tooltipEl.style.fontSize = '12px';
                                    tooltipEl.style.fontWeight = 'bold';
                                    tooltipEl.style.zIndex = '1000';
                                    document.body.appendChild(tooltipEl);
                                }

                                const tooltipModel = context.tooltip;
                                if (tooltipModel.opacity === 0) {
                                    tooltipEl.style.opacity = 0;
                                    return;
                                }

                                if (tooltipModel.dataPoints) {
                                    const dataIndex = tooltipModel.dataPoints[0].dataIndex;
                                    const item = GraphData[dataIndex];
                                    
                                    tooltipEl.innerHTML = `
                                        Section: ${item.section} <br>
                                        Percentage: ${item.percentage}%
                                    `;

                                    const chartPosition = context.chart.canvas.getBoundingClientRect();
                                    tooltipEl.style.left = chartPosition.left + window.pageXOffset + tooltipModel.caretX + 'px';
                                    tooltipEl.style.top = chartPosition.top + window.pageYOffset + tooltipModel.caretY - 40 + 'px';
                                }

                                tooltipEl.style.opacity = 1;
                            },
                        },
                    },
                    layout: {
                        padding: {
                            top: 0,
                            bottom: 20,
                        },
                    },
                    responsive: true,
                }}
            />
        </div>
    );
}

export default SimpleBarChartPage;
