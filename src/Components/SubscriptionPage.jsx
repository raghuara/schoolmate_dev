import {
    Box,
    Typography,
    Button,
    Paper,
    Stack,
    Chip,
    Grid
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";

/* ---------- COLOR SYSTEM ---------- */

const colors = {
    bg: "#F8FAFC",

    lite: {
        bg: "linear-gradient(135deg, #E0F2FE, #F0F9FF)",
        border: "#38BDF8"
    },
    pro: {
        bg: "linear-gradient(135deg, #ECFDF5, #F0FDF4)",
        border: "#10B981"
    },
    plus: {
        bg: "linear-gradient(135deg, #FFF7ED, #FFFBEB)",
        border: "#FB923C"
    },
    premium: {
        bg: "linear-gradient(135deg, #F5F3FF, #EDE9FE)",
        border: "#8B5CF6"
    },

    primary: "#6366F1",
    muted: "#6B7280"
};

export default function SubscriptionPage() {
    const navigate = useNavigate();
    const currentPlan = "Lite"; // dynamic later

    const handleNavigate = (packageType) => {
        navigate("/dashboardmenu/dashboard/page", {
            state: { packageType }
        });
    };


    return (
        <Box
            sx={{
                bgcolor: colors.bg,
                display: "flex",
                justifyContent: "center",
                p: 4
            }}
        >

            <Box>
                <Stack spacing={2} alignItems="center" mb={3}>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: "24px",
                            background:
                                "linear-gradient(135deg, #6366F1, #8B5CF6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 12px 30px rgba(99,102,241,0.35)"
                        }}
                    >
                        <LockIcon sx={{ fontSize: 25, color: "#fff" }} />
                    </Box>

                    <Typography fontWeight={800} fontSize={26}>
                        Feature Locked
                    </Typography>

                    <Typography
                        color={colors.muted}
                        textAlign="center"
                        maxWidth={520}
                    >
                        This feature is not included in your current subscription.
                        Upgrade your plan to unlock advanced tools designed for
                        modern, growing schools.
                    </Typography>
                </Stack>

                {/* PLAN GRID */}
                <Typography fontWeight={700} mb={3}>
                    Choose the plan that fits your school’s journey
                </Typography>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Plan
                            title="SchoolMate Lite"
                            tagline="Start conversations, not paperwork."
                            bg={colors.lite.bg}
                            border={colors.lite.border}
                            active={currentPlan === "Lite"}
                            packageType="lite"
                            onClick={handleNavigate}
                            features={[
                                "Parent communication & notifications",
                                "Circulars, reminders",
                                "Digital attendance",
                                "Timetable & academic calendar"
                            ]}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Plan
                            title="SchoolMate Pro"
                            tagline="Let your ERP work for you."
                            bg={colors.pro.bg}
                            border={colors.pro.border}
                            packageType="pro"
                            onClick={handleNavigate}
                            features={[
                                "Student & staff profiles",
                                "Online fee collection",
                                "Payroll & leave management",
                                "Inventory & order management"
                            ]}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Plan
                            title="SchoolMate Plus"
                            tagline="Operational efficiency with safety."
                            bg={colors.plus.bg}
                            border={colors.plus.border}
                            packageType="plus"
                            onClick={handleNavigate}
                            features={[
                                "Live GPS bus tracking",
                                "Pickup & drop alerts",
                                "Route planning",
                                "Transport-linked attendance"
                            ]}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Plan
                            title="SchoolMate Premium"
                            tagline="Complete academic intelligence."
                            bg={colors.premium.bg}
                            border={colors.premium.border}
                            highlight
                            packageType="premium"
                            onClick={handleNavigate}
                            features={[
                                "Exam planning & mark entry",
                                "Auto report cards",
                                "Academic analytics dashboard",
                                "Task & workload management"
                            ]}
                        />
                    </Grid>
                </Grid>


                {/* CTA */}
                <Stack alignItems="center" mt={6}>
                    <Button
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            bgcolor: colors.primary,
                            color: "#fff",
                            px: 7,
                            py: 1.4,
                            borderRadius: 4,
                            fontWeight: 600,
                            "&:hover": { bgcolor: "#4F46E5" }
                        }}
                    >
                        Upgrade or Contact Sales
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}

/* ================= PLAN CARD ================= */

const Plan = ({
    title,
    tagline,
    features,
    bg,
    border,
    active,
    highlight,
    packageType,
    onClick
}) => (
    <Paper
        onClick={() => onClick(packageType)}
        sx={{
            cursor: "pointer",
            borderRadius: 4,
            overflow: "hidden",
            border: `2px solid ${border}`,
            background: bg,
            transition: "0.3s",
            "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.12)"
            }
        }}
    >
        {/* HEADER */}
        <Box
            sx={{
                px: 2.5,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "rgba(255,255,255,0.6)",
                borderBottom: "1px solid rgba(0,0,0,0.08)"
            }}
        >
            <Typography fontWeight={800} fontSize={17}>
                {title}
            </Typography>

            <Box sx={{ minWidth: 110, display: "flex", justifyContent: "flex-end" }}>
                {active && (
                    <Chip label="Current Plan" size="small" color="primary" />
                )}

                {!active && highlight && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <StarIcon sx={{ fontSize: 15, color: "#F59E0B" }} />
                        <Typography fontSize={12} fontWeight={600} color="#F59E0B">
                            Premium
                        </Typography>
                    </Stack>
                )}
            </Box>
        </Box>

        {/* BODY */}
        <Box sx={{ p: 2.5 }}>
            <Typography fontSize={13} color="#444" mb={2}>
                {tagline}
            </Typography>

            <Stack spacing={1}>
                {features.map((item, index) => (
                    <Box key={index} sx={{ display: "flex", gap: 1.2 }}>
                        <Box
                            sx={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                bgcolor: border,
                                mt: "7px"
                            }}
                        />
                        <Typography fontSize={13}>{item}</Typography>
                    </Box>
                ))}
            </Stack>
        </Box>
    </Paper>
);
