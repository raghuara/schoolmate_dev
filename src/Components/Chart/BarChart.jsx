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
import CircleIcon from '@mui/icons-material/Circle';
import { useMediaQuery, useTheme } from '@mui/material';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

function BarChartPage({ teachersData }) {
    const groupColors = [
        "rgba(128, 0, 128, 1)",
        "rgba(0, 128, 128, 1)",
        "rgba(255, 165, 0, 1)",
        "rgba(34, 139, 34, 1)",
        "rgba(70, 130, 180, 1)"
    ];
    const theme = useTheme();
    const attendanceData = teachersData;
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));
    const labels = attendanceData.map(item => item.subUserType);
    const values = attendanceData.map(item => item.percentage);
    const backgroundColors = groupColors.slice(0, labels.length);

    const isEmptyData = teachersData.every(item => item.percentage === 0);

    if (!teachersData || teachersData.length === 0 || isEmptyData) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: 'center',  height: '400px', }}>
                <h3>No data to display</h3>
            </div>
        );
    }

    return (
        <div className="App">
            <div style={{ maxWidth: "45rem", height: "100%", overflowX: "auto" }}>
                <div style={{ minWidth: "calc(50px * " + labels.length + ")" }}>
                    <Bar
                        data={{
                            labels: labels,
                            datasets: [
                                {
                                    label: "Total Teachers",
                                    data: values,
                                    backgroundColor: backgroundColors,
                                    borderColor: backgroundColors,
                                    borderWidth: 1,
                                    barThickness: 30,
                                },
                            ],
                        }}
                        height={400}
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
                                    ticks: { stepSize: 5 },
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
                                            tooltipEl.style.padding = '10px';
                                            tooltipEl.style.borderRadius = '8px';
                                            tooltipEl.style.pointerEvents = 'none';
                                            tooltipEl.style.display = 'flex';
                                            tooltipEl.style.alignItems = 'center';
                                            tooltipEl.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
                                            tooltipEl.style.zIndex = '1000';
                                            document.body.appendChild(tooltipEl);
                                        }

                                        tooltipEl.innerHTML = '';

                                        let arrowEl = document.getElementById('tooltip-arrow');
                                        if (!arrowEl) {
                                            arrowEl = document.createElement('div');
                                            arrowEl.id = 'tooltip-arrow';
                                            arrowEl.style.position = 'absolute';
                                            arrowEl.style.width = '0';
                                            arrowEl.style.height = '0';
                                            arrowEl.style.borderLeft = '10px solid transparent';
                                            arrowEl.style.borderRight = '10px solid transparent';
                                            tooltipEl.appendChild(arrowEl);
                                        }

                                        const tooltipModel = context.tooltip;
                                        if (tooltipModel.opacity === 0) {
                                            tooltipEl.style.opacity = 0;
                                            return;
                                        }

                                        if (tooltipModel.dataPoints) {
                                            const dataIndex = tooltipModel.dataPoints[0].dataIndex;
                                            const item = attendanceData[dataIndex];
                                            const percentage = Math.round((item.present / item.total) * 100);

                                            tooltipEl.innerHTML = `
                                                    <div style="display: flex; align-items: center;">
                                                        <div style="padding-right: 30px;">
                                                            <div style="display: flex; align-items: center;">
                                                                
                                                                <div style="font-weight:700; font-size:12px">${item.subUserType}</div>
                                                            </div>
                                                            <div style="display: flex; align-items: center;">
                                                                <div style="background-color: #632AB3; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; margin-top: 2px;"></div>
                                                                <div style="font-size:12px">Total Teachers (${item.total})</div>
                                                            </div>
                                                            <div style="display: flex; align-items: center;">
                                                                <div style="background-color:#00963C; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; margin-top: 3px;"></div>
                                                                <div style="font-size:12px">Present (${item.present})</div>
                                                            </div>
                                                            <div style="display: flex; align-items: center;">
                                                                <div style="background-color:#FFD400; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; margin-top: 3px;"></div>
                                                                <div style="font-size:12px">Late (${item.late})</div>
                                                            </div>
                                                            <div style="display: flex; align-items: center;">
                                                                <div style="background-color: #FF0004; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; margin-top: 3px;"></div>
                                                                <div style="font-size:12px">Leave (${item.leave})</div>
                                                            </div>
                                                        </div>
                                                        <div style="background-color: #28a745; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold;">
                                                            ${percentage}%
                                                        </div>
                                                    </div>
                                                    `;


                                            const chartPosition = context.chart.canvas.getBoundingClientRect();
                                            const tooltipWidth = tooltipEl.offsetWidth;
                                            const tooltipPosition = chartPosition.left + window.pageXOffset + tooltipModel.caretX;

                                            if (tooltipPosition + tooltipWidth > window.innerWidth) {
                                                tooltipEl.style.left = tooltipPosition - tooltipWidth - 20 + 'px'; 
                                                arrowEl.style.borderBottom = '10px solid rgba(0, 0, 0, 0.8)';
                                                arrowEl.style.top = '50%'; 
                                                arrowEl.style.left = '100%'; 
                                            } else {
                                                tooltipEl.style.left = tooltipPosition + 20 + 'px'; 
                                                arrowEl.style.borderTop = '10px solid rgba(0, 0, 0, 0.8)'; 
                                                arrowEl.style.top = '50%'; 
                                                arrowEl.style.right = '100%'; 
                                            }

                                            tooltipEl.style.top = chartPosition.top + window.pageYOffset + tooltipModel.caretY - 20 + 'px';
                                        }

                                        tooltipEl.style.opacity = 1;
                                    },
                                },
                            },
                            layout: {
                                padding: {
                                    top: 20,
                                    bottom: 50,
                                },
                            },
                            responsive: true,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default BarChartPage;
