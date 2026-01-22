import { Box, Button, Grid, IconButton, Tab, Tabs, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import Loader from "../../Loader";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import SettingsIcon from '@mui/icons-material/Settings';
import AirlineStopsIcon from '@mui/icons-material/AirlineStops';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function TrasnportAssetPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [newsIntimation, setNewsIntimation] = useState(false);
  const user = useSelector((state) => state.auth);
  const rollNumber = user.rollNumber
  const userType = user.userType
  const userName = user.name
  const websiteSettings = useSelector(selectWebsiteSettings);
  const token = "123"

  const items = [
    { color: "#A749CC", icon: SettingsIcon, text: "Vehicle Details", bgColor: "#FBF9FC", iconBgColor: "#F7F0F9", path: 'details', },
    { color: "#ED9146", icon: AirlineStopsIcon, text: "Route Management", bgColor: "#FCFBF9", iconBgColor: "#FBF4EF", path: 'route', },
    { color: "#7DC353", icon: AccountTreeIcon, text: "Student Mapping", bgColor: "#F9FBF7", iconBgColor: "#F2F8EE", path: 'student-map' },
    // { color: "#E10052", icon: AccountTreeIcon, text: "Vehicle Safety & Compliance", bgColor: "#FCF8F9", iconBgColor: "#FBEBF1", path: 'safety-compliance', },
  ];

  if (userType !== "superadmin" && userType !== "admin" && userType !== "staff") {
    return <Navigate to="/dashboardmenu/dashboard" replace />;
  }

  return (
    <Box sx={{ width: "100%", }}>
      {isLoading && <Loader />}
      <Box sx={{ backgroundColor: "#f2f2f2", p: 1.5, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", }}>
        <Grid container sx={{ width: "100%" }}>
          <Grid
            sx={{ display: "flex", alignItems: "center", }}
            size={{
              xs: 6,
              sm: 6,
              md: 3,
              lg: 3
            }}>
            <IconButton onClick={() => navigate(-1)} sx={{ width: "30px", height: "30px", marginTop: '2px', }}>
              <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
            </IconButton>
            <Typography sx={{ fontWeight: "600", fontSize: "20px", ml: 0.5}} >Transport Asset</Typography>
          </Grid>
          <Grid
            sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            size={{
              xs: 6,
              sm: 6,
              md: 3,
              lg: 6
            }}>
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Box sx={{ p: 2, }}>
          <Box sx={{ display: "flex", justifyContent: "center", height: "70vh", overflowY: "auto" }}>
            <Grid container spacing={2} sx={{ width: "100%" }}>
              {items.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Grid
                    sx={{ display: "flex", justifyContent: "center" }}
                    key={index}
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3
                    }}>
                    <Link
                      to={item.path}
                      state={{ value: 'N' }}
                      style={{
                        textDecoration: 'none',
                        height: "60px",
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          backgroundColor: item.bgColor,
                          boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                          borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                          width: "100%",
                          height: "105px",
                          borderRadius: "7px",
                          cursor: "pointer",
                          '&:hover': {
                            '.arrowIcon': {
                              opacity: 1,
                            },
                          },
                        }}
                      >
                        <Grid container spacing={1} sx={{ height: '100%', px: 2, }}>
                          <Grid
                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            size={{
                              md: 0.5
                            }}>
                            <Box
                              sx={{
                                width: '7px',
                                backgroundColor: item.color,
                                height: '100%',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                borderTopLeftRadius: '5px',
                                borderBottomLeftRadius: '5px',
                              }}
                            />
                          </Grid>
                          <Grid
                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            size={{
                              md: 2
                            }}>
                            <Box sx={{
                              backgroundColor: item.iconBgColor,
                              borderRadius: "50px",
                              width: "25px",
                              height: "25px",
                              p: 1.3,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center"
                            }}>
                              {/* <img src={item.icon} width={25} height={25} /> */}
                              <IconComponent sx={{ color: item.color, fontSize: "23px" }} />
                            </Box>
                          </Grid>
                          <Grid
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                            size={{
                              md: 7
                            }}>
                            <Typography sx={{ fontWeight: "600", color: "#000" }}>
                              {item.text}
                            </Typography>
                          </Grid>
                          <Grid
                            sx={{
                              display: 'flex',
                              justifyContent: "center",
                              alignItems: 'center',
                              height: '100%'
                            }}
                            size={{
                              md: 2
                            }}>
                            <ArrowForwardIcon className="arrowIcon" sx={{
                              opacity: 0,
                              transition: 'opacity 0.3s ease',
                              color: item.color,
                            }} />
                          </Grid>
                        </Grid>
                      </Box>
                    </Link>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}