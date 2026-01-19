import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Typography, useMediaQuery } from '@mui/material';

export default function StyledPieChart({ pieData, primary }) {
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const isMediumScreen = useMediaQuery('(max-width:960px)');

  if (
    !pieData ||
    !pieData.overallLate ||
    !pieData.overallLeave ||
    !pieData.overallAbsent ||
    !pieData.overallPresent
  ) {
    return <Typography variant="h6" style={{ textAlign: 'center', marginTop: '20px' }}>No data available</Typography>;
  }

  const data = [
    { name: 'Late', value: parseInt(pieData.overallLate.late), color: 'url(#lateGradient)', total: pieData.overallLate.totalStudents },
    { name: 'Leave', value: parseInt(pieData.overallLeave.leave), color: 'url(#leaveGradient)', total: pieData.overallLeave.totalStudents },
    { name: 'Absent', value: parseInt(pieData.overallAbsent.absent), color: 'url(#absentGradient)', total: pieData.overallAbsent.totalStudents },
    { name: 'Present', value: parseInt(pieData.overallPresent.present), color: 'url(#presentGradient)', total: pieData.overallPresent.totalStudents },
  ];

  const totalStudents = parseInt(pieData.overallLate.totalStudents);

  const customTooltip = ({ payload }) => {
    if (payload && payload.length) {
      const { name, value, color, total } = payload[0];
      return (
        <div style={{
          padding: '10px',
          background: '#000',
          zIndex: 10000,
          borderRadius: '5px',
          textAlign: 'left',
          color: "#fff",
          minWidth: '150px',
          wordWrap: 'break-word',
          position: 'relative',
        }}>
          <Typography variant="subtitle1" color="inherit">{name}</Typography>
          <Typography variant="body2">• Total Students: {totalStudents}</Typography>
          <Typography variant="body2">• {name} Students: {value}</Typography>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <PieChart width={320} height={250}>
        <defs>
          <linearGradient id="lateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="20%" stopColor="#3B48D5" />
            <stop offset="80%" stopColor="#1F266F" />
          </linearGradient>
          <linearGradient id="leaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A09BD" />
            <stop offset="100%" stopColor="#400457" />
          </linearGradient>
          <linearGradient id="absentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DA0000" />
            <stop offset="100%" stopColor="#740000" />
          </linearGradient>
          <linearGradient id="presentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00963C" />
            <stop offset="100%" stopColor="#00CF53" />
          </linearGradient>
        </defs>

        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          fill="#8884d8"
          isAnimationActive={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
          ))}
        </Pie>

        <Tooltip content={customTooltip} wrapperStyle={{ zIndex: 10001 }} />
      </PieChart>
      {totalStudents > 0 ? (
        <div style={{
          position: "absolute",
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 999,
        }}>
          <Typography sx={{fontSize:isSmallScreen ? "16px" : isMediumScreen ? "18px" : "28px", fontWeight:"800", marginTop:"-20px"}} component="div">
            {totalStudents}
          </Typography>
          {primary ? (
            <>
              <Typography fontWeight={600} sx={{fontSize:isSmallScreen ? "12px" : isMediumScreen ? "14px" : "14px"}}>Nursery & Primary</Typography>
              <Typography sx={{fontSize:"12px"}}>(PreKG - Grade V)</Typography>
            </>
          ) : (
            <>
              <Typography fontWeight={600} sx={{fontSize:isSmallScreen ? "12px" : isMediumScreen ? "14px" : "14px"}}>Secondary</Typography>
              <Typography sx={{fontSize:"12px"}}>(Grade IV - Grade X)</Typography>
            </>
          )}
        </div>
      ) : (<Typography variant="h6" style={{ textAlign: 'center', marginLeft: '-300px' }}>No data available</Typography>)}
    </div>
  );
}
