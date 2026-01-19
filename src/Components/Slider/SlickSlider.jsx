import React from "react";
import Slider from "react-slick";
import { Grid, Box, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../../Css/OverWrite.css';
import { Link } from "react-router-dom";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { useSelector } from "react-redux";
import ReactPlayer from "react-player";

const SliderComponent = ({ items, title, subtitle, link }) => {



    const websiteSettings = useSelector(selectWebsiteSettings);
    if (!items || items.length === 0) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "160px",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
                    borderRadius: "6px",
                }}
            >
                <Typography variant="h6">No data to display</Typography>
            </Box>
        );
    }

    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 3500,
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 1, slidesToScroll: 1 },
            },
            {
                breakpoint: 600,
                settings: { slidesToShow: 1, slidesToScroll: 1 },
            },
            {
                breakpoint: 480,
                settings: { slidesToShow: 1, slidesToScroll: 1 },
            },
        ],
    };

    return (
        <Box sx={{ backgroundColor: "#fff", borderRadius: "6px" }}>
            <style>
                {`
                ..slick-dots li button {
                    color: ${websiteSettings.mainColor} !important;
                }
                .slick-dots li button:before {
                    color: ${websiteSettings.mainColor} !important;
                }
                .slick-dots li.slick-active button:before {
                background-color: ${websiteSettings.mainColor} !important;
                }
                `}
            </style>
            <Slider {...settings}>
                {items.map((item, index) => (
                    <Box
                        key={index}
                        sx={{ borderRadius: "6px", position: "relative" }}
                    >
                        <Box
                            m={1}
                            px={1}
                            mb={3}
                            sx={{
                                height: "150px",
                                maxHeight: "130px", 
                                overflow: "hidden", 
                                position: "relative",
                            }}
                        >
                           
                            <Grid container spacing={2} py={1}>
                                {item.fileType === "image" && (
                                    <Grid
                                        sx={{display:"flex", alignItems:"center"}}
                                        size={{
                                            xs: 12,
                                            sm: 12,
                                            lg: 3
                                        }}>
                                        <img
                                            src={item.image}
                                            width="100%"
                                            height="110px"
                                            alt="news"
                                            style={{ borderRadius: "3px" }}
                                        />
                                    </Grid>
                                )}
                                {item.fileType === "link" && (
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 12,
                                            lg: 3
                                        }}>
                                        <ReactPlayer
                                            url={item.image}
                                            width="100%"
                                            height="110px"
                                            playing={false}
                                        />
                                    </Grid>
                                )}
                                {item.fileType !== "empty" && (
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 12,
                                            lg: 9
                                        }}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: "700",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap", // Ensure single-line truncation
                                            }}
                                        >
                                            {item.heading.split(" ").slice(0, 8).join(" ")}
                                            {item.heading.split(" ").length > 8 ? "..." : ""}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "#777",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                            }}
                                        >
                                            {item.posted}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontSize: "14px",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 3, // Limits to 3 lines
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                        />
                                    </Grid>
                                )}
                                {item.fileType === "empty" && (
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 12,
                                            lg: 12
                                        }}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: "700",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {item.heading.split(" ").slice(0, 8).join(" ")}
                                            {item.heading.split(" ").length > 8 ? "..." : ""}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "#777",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                            }}
                                        >
                                            {item.posted}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontSize: "14px",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 3, // Limits to 3 lines
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </Box>

                    </Box>
                ))}
            </Slider>
        </Box>
    );
};

export default SliderComponent;
