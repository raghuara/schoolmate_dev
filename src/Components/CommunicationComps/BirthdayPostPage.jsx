import React, { useEffect, useState, useMemo } from 'react';
import {
    Box, Grid, Typography, IconButton, Button, Chip, TextField, Avatar,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    InputAdornment, Tooltip, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CakeIcon from '@mui/icons-material/Cake';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InstagramIcon from '@mui/icons-material/Instagram';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';
import { BirthdayInstagramPost } from '../../Api/Api';
import Loader from '../Loader';
import SnackBar from '../SnackBar';
import ProfileImage from '../../Images/PagesImage/dummy-image.jpg';

// Initials helper for the student avatar fallback
const getInitials = (name = '') =>
    name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

const AVATAR_PALETTE = ['#0891B2', '#7C3AED', '#EA580C', '#DC2626', '#16A34A', '#2563EB', '#DB2777', '#CA8A04'];
const colorFor = (name = '') => AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];

export default function BirthdayPostPage() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber;
    const userType = user.userType;
    const token = '123';

    const today = dayjs();
    const [selectedDate, setSelectedDate] = useState(today);
    const apiDate = selectedDate.format('YYYY-MM-DD'); // new API expects ISO date

    const [isLoading, setIsLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');

    // Snackbar
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    // Instagram post info — populated by the BirthdayInstagramPost API.
    // viewedRollNumbers stays [] until the backend ships the acknowledgement-tracking
    // endpoint that records mobile-app views.
    const [postInfo, setPostInfo] = useState({
        postUrl: '',
        images: [],          // array of { imageUrl, thumbnailUrl } from the API
        viewedRollNumbers: [],
    });
    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    useEffect(() => {
        fetchInstagramPost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiDate]);

    const fetchInstagramPost = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(BirthdayInstagramPost, {
                params: { date: apiDate },
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res.data || {};

            const list = (data.students || []).map(s => ({
                rollNumber: String(s.rollNumber),
                name: s.name || '—',
                grade: s.grade || '',
                section: s.section || '',
                photoUrl: s.profilePhoto || '',
            }));
            setStudents(list);

            setCurrentImageIdx(0);

            if (data.found && data.instagramPermalink) {
                setPostInfo({
                    postUrl: data.instagramPermalink,
                    images: data.instagramImages || [],
                    viewedRollNumbers: data.viewedRollNumbers || [],
                });
            } else {
                setPostInfo({ postUrl: '', images: [], viewedRollNumbers: [] });
            }
        } catch (error) {
            console.error('Failed to load Instagram birthday post:', error);
            setStudents([]);
            setPostInfo({ postUrl: '', images: [], viewedRollNumbers: [] });
            showSnack('Failed to load birthday post for this date.', false);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevImage = () => {
        setCurrentImageIdx(i => (i > 0 ? i - 1 : postInfo.images.length - 1));
    };
    const handleNextImage = () => {
        setCurrentImageIdx(i => (i < postInfo.images.length - 1 ? i + 1 : 0));
    };

    const viewedSet = useMemo(
        () => new Set(postInfo.viewedRollNumbers),
        [postInfo.viewedRollNumbers]
    );

    const filteredStudents = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return students;
        return students.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.rollNumber.toLowerCase().includes(q)
        );
    }, [students, search]);

    const viewedCount = students.filter(s => viewedSet.has(s.rollNumber)).length;
    const totalCount = students.length;
    const viewRate = totalCount > 0 ? Math.round((viewedCount / totalCount) * 100) : 0;

    const showSnack = (msg, success) => {
        setMessage(msg);
        setOpen(true);
        setStatus(success);
        setColor(success);
    };

    const handleOpenPost = () => {
        if (!postInfo.postUrl) return;
        window.open(postInfo.postUrl, '_blank', 'noopener,noreferrer');
    };

    const hasPost = !!postInfo.postUrl;

    return (
        <Box sx={{ p: 2, height: '86vh', overflowY: 'auto', bgcolor: '#fafafa' }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}

            {/* Header */}
            <Box sx={{
                bgcolor: '#fff',
                border: '1px solid #E8DDEA',
                borderRadius: '10px',
                p: 1.5,
                mb: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 1.5,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: 32, height: 32 }}>
                        <ArrowBackIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '10px',
                        bgcolor: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <CakeIcon sx={{ color: '#E91E8C', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111', lineHeight: 1.1 }}>
                            Birthday Post
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: '#666' }}>
                            See the post sent to students whose birthday is on the selected date — and who's viewed it
                        </Typography>
                    </Box>
                </Box>

                {/* Date picker */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon sx={{ fontSize: 18, color: '#666' }} />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            value={selectedDate}
                            onChange={(v) => v && setSelectedDate(v)}
                            format="DD/MM/YYYY"
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    sx: {
                                        width: 180,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px', fontSize: 13, bgcolor: '#fff',
                                        },
                                    }
                                }
                            }}
                        />
                    </LocalizationProvider>
                </Box>
            </Box>

           
            <Grid container spacing={2} sx={{ mb: 2 }}>
              
                <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                    <Box sx={{
                        bgcolor: '#fff',
                        border: '1px solid #E8DDEA',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        height: '100%',
                    }}>
                        <Box sx={{
                            px: 2, py: 1, bgcolor: '#FCE7F3',
                            borderBottom: '1px solid #E8DDEA',
                            display: 'flex', alignItems: 'center', gap: 1,
                        }}>
                            <CameraAltIcon sx={{ fontSize: 16, color: '#E91E8C' }} />
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#9F1239' }}>
                                Post Preview
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <Box sx={{
                                width: '100%', aspectRatio: '1 / 1',
                                borderRadius: '10px', overflow: 'hidden',
                                border: '1px solid #f0e3ef',
                                bgcolor: '#FFF7FB',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative',
                            }}>
                                {postInfo.images.length > 0 ? (
                                    <>
                                        <img
                                            key={currentImageIdx}
                                            src={postInfo.images[currentImageIdx]?.imageUrl
                                                || postInfo.images[currentImageIdx]?.thumbnailUrl
                                                || ''}
                                            alt={`Birthday post ${currentImageIdx + 1} of ${postInfo.images.length}`}
                                            style={{
                                                width: '100%', height: '100%', objectFit: 'cover',
                                                transition: 'opacity 0.2s ease',
                                            }}
                                            onError={(e) => { e.currentTarget.style.opacity = '0.2'; }}
                                        />

                                        {/* Counter chip (top-right) */}
                                        {postInfo.images.length > 1 && (
                                            <Chip
                                                size="small"
                                                label={`${currentImageIdx + 1} / ${postInfo.images.length}`}
                                                sx={{
                                                    position: 'absolute', top: 8, right: 8,
                                                    fontSize: 11, fontWeight: 700, height: 24,
                                                    bgcolor: 'rgba(0,0,0,0.65)', color: '#fff',
                                                    backdropFilter: 'blur(4px)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                }}
                                            />
                                        )}

                                        {/* Prev / Next arrows — only when there are multiple images */}
                                        {postInfo.images.length > 1 && (
                                            <>
                                                <IconButton
                                                    onClick={handlePrevImage}
                                                    aria-label="Previous image"
                                                    sx={{
                                                        position: 'absolute', left: 8,
                                                        top: '50%', transform: 'translateY(-50%)',
                                                        width: 36, height: 36,
                                                        bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
                                                        backdropFilter: 'blur(4px)',
                                                        border: '1px solid rgba(255,255,255,0.25)',
                                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                                                    }}
                                                >
                                                    <ChevronLeftIcon sx={{ fontSize: 22 }} />
                                                </IconButton>
                                                <IconButton
                                                    onClick={handleNextImage}
                                                    aria-label="Next image"
                                                    sx={{
                                                        position: 'absolute', right: 8,
                                                        top: '50%', transform: 'translateY(-50%)',
                                                        width: 36, height: 36,
                                                        bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
                                                        backdropFilter: 'blur(4px)',
                                                        border: '1px solid rgba(255,255,255,0.25)',
                                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                                                    }}
                                                >
                                                    <ChevronRightIcon sx={{ fontSize: 22 }} />
                                                </IconButton>

                                                {/* Dot indicators (bottom) */}
                                                <Box sx={{
                                                    position: 'absolute', bottom: 10, left: 0, right: 0,
                                                    display: 'flex', justifyContent: 'center', gap: 0.6,
                                                }}>
                                                    {postInfo.images.map((_, i) => (
                                                        <Box
                                                            key={i}
                                                            onClick={() => setCurrentImageIdx(i)}
                                                            sx={{
                                                                width: i === currentImageIdx ? 18 : 6,
                                                                height: 6, borderRadius: 3,
                                                                bgcolor: i === currentImageIdx ? '#fff' : 'rgba(255,255,255,0.55)',
                                                                cursor: 'pointer',
                                                                transition: 'width 0.2s ease, background-color 0.2s ease',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </>
                                        )}
                                    </>
                                ) : hasPost ? (
                                    // Placeholder when we have a post URL but no image yet
                                    <Box sx={{ textAlign: 'center', px: 3 }}>
                                        <Box sx={{
                                            width: 84, height: 84, borderRadius: '50%',
                                            bgcolor: '#FFE4F0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 12px',
                                        }}>
                                            <CakeIcon sx={{ fontSize: 42, color: '#E91E8C' }} />
                                        </Box>
                                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#9F1239' }}>
                                            Happy Birthday!
                                        </Typography>
                                        <Typography sx={{ fontSize: 12, color: '#9F1239', opacity: 0.7, mt: 0.5 }}>
                                            Image preview not yet loaded
                                        </Typography>
                                    </Box>
                                ) : (
                                   
                                    <Box sx={{ textAlign: 'center', px: 3 }}>
                                        <ImageNotSupportedIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>
                                            No Instagram post for this date
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                
                <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                    <Box sx={{
                        bgcolor: '#fff',
                        border: '1px solid #E8DDEA',
                        borderRadius: '10px',
                        height: '100%',
                        display: 'flex', flexDirection: 'column',
                    }}>
                        <Box sx={{
                            px: 2, py: 1, bgcolor: '#F3F4F6',
                            borderBottom: '1px solid #E8DDEA',
                            display: 'flex', alignItems: 'center', gap: 1,
                        }}>
                            <PeopleIcon sx={{ fontSize: 16, color: '#374151' }} />
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                                Acknowledgement Summary
                            </Typography>
                        </Box>

                        <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                           
                            <Grid container spacing={1.5}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <KpiTile
                                        label="Date"
                                        value={selectedDate.format('DD MMM YYYY')}
                                        icon={<CalendarMonthIcon sx={{ fontSize: 18, color: '#1976D2' }} />}
                                        bgColor="#E3F2FD"
                                        textColor="#1565C0"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <KpiTile
                                        label="Birthday Students"
                                        value={totalCount}
                                        icon={<CakeIcon sx={{ fontSize: 18, color: '#E91E8C' }} />}
                                        bgColor="#FCE7F3"
                                        textColor="#9F1239"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <KpiTile
                                        label="Post Viewed"
                                        value={hasPost ? `${viewedCount} / ${totalCount}` : '—'}
                                        sublabel={hasPost && totalCount > 0 ? `${viewRate}% of students` : 'No post sent'}
                                        icon={<CheckCircleIcon sx={{ fontSize: 18, color: '#16A34A' }} />}
                                        bgColor="#F0FDF4"
                                        textColor="#15803D"
                                    />
                                </Grid>
                            </Grid>

                            
                            <Box sx={{
                                mt: 'auto',
                                p: 1.5,
                                borderRadius: '8px',
                                bgcolor: hasPost ? '#FFF7FB' : '#FAFAFA',
                                border: `1px solid ${hasPost ? '#FBCFE8' : '#E5E7EB'}`,
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                flexWrap: 'wrap',
                            }}>
                                <InstagramIcon sx={{ fontSize: 22, color: hasPost ? '#C13584' : '#9CA3AF' }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                        Instagram Post Link
                                    </Typography>
                                    <Typography
                                        sx={{ fontSize: 13, fontWeight: 600, color: hasPost ? '#9F1239' : '#9CA3AF', wordBreak: 'break-all' }}
                                        noWrap
                                    >
                                        {postInfo.postUrl || 'No post link available for this date'}
                                    </Typography>
                                </Box>
                                <Button
                                    disabled={!hasPost}
                                    onClick={handleOpenPost}
                                    startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: 13, fontWeight: 700,
                                        color: '#fff',
                                        background: hasPost
                                            ? 'linear-gradient(90deg, #F77737, #FD1D1D, #C13584)'
                                            : '#E5E7EB',
                                        borderRadius: '8px',
                                        px: 2, height: 36,
                                        boxShadow: hasPost ? '0 2px 6px rgba(193,53,132,0.35)' : 'none',
                                        '&:hover': hasPost
                                            ? { opacity: 0.92, boxShadow: '0 4px 12px rgba(193,53,132,0.5)' }
                                            : {},
                                        '&.Mui-disabled': { color: '#9CA3AF', background: '#E5E7EB' },
                                    }}
                                >
                                    Visit Instagram
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

          
            <Box sx={{
                bgcolor: '#fff',
                border: '1px solid #E8DDEA',
                borderRadius: '10px',
                overflow: 'hidden',
            }}>
                <Box sx={{
                    px: 2, py: 1.2, bgcolor: '#F9FAFB',
                    borderBottom: '1px solid #E8DDEA',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 1,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CakeIcon sx={{ fontSize: 16, color: '#E91E8C' }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                            Birthday Students
                        </Typography>
                        <Chip
                            label={totalCount}
                            size="small"
                            sx={{ bgcolor: '#FCE7F3', color: '#9F1239', fontWeight: 700, fontSize: 11, height: 20 }}
                        />
                    </Box>
                    <TextField
                        size="small"
                        placeholder="Search name or roll no…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                    </InputAdornment>
                                ),
                            }
                        }}
                        sx={{ width: 220, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13, bgcolor: '#fff' } }}
                    />
                </Box>

                {filteredStudents.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <CakeIcon sx={{ fontSize: 36, color: '#E5E7EB', mb: 1 }} />
                        <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>
                            {search
                                ? `No students match "${search}".`
                                : 'No birthdays on this date.'}
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer sx={{ maxHeight: 420 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                    {['#', 'Roll No', 'Student', 'Class', 'Acknowledgement'].map(h => (
                                        <TableCell key={h} sx={{
                                            fontWeight: 700, fontSize: 11, color: '#6B7280',
                                            textTransform: 'uppercase', letterSpacing: 0.4, bgcolor: '#F9FAFB',
                                        }}>
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents.map((s, idx) => {
                                    const viewed = viewedSet.has(s.rollNumber);
                                    return (
                                        <TableRow key={s.rollNumber} sx={{ '&:hover': { bgcolor: '#FAFAFA' } }}>
                                            <TableCell sx={{ fontSize: 12, color: '#9CA3AF' }}>{idx + 1}</TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#374151' }}>
                                                    {s.rollNumber}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar
                                                        src={s.photoUrl || ProfileImage}
                                                        onError={(e) => { e.target.src = ProfileImage; }}
                                                        sx={{ width: 30, height: 30, bgcolor: colorFor(s.name), fontSize: 11, fontWeight: 700 }}
                                                    >
                                                        {getInitials(s.name)}
                                                    </Avatar>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#111' }}>
                                                        {s.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {(s.grade || s.section) ? (
                                                    <Chip
                                                        size="small"
                                                        label={`${s.grade || ''}${s.grade && s.section ? ' · ' : ''}${s.section || ''}`}
                                                        sx={{
                                                            fontSize: 11, fontWeight: 700, height: 22,
                                                            bgcolor: '#F3F4F6', color: '#374151',
                                                            border: '1px solid #E5E7EB',
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography sx={{ fontSize: 12, color: '#9CA3AF' }}>—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {!hasPost ? (
                                                    <Chip
                                                        size="small"
                                                        label="No post"
                                                        sx={{
                                                            fontSize: 11, fontWeight: 700, height: 22,
                                                            bgcolor: '#F3F4F6', color: '#6B7280',
                                                            border: '1px solid #E5E7EB',
                                                        }}
                                                    />
                                                ) : viewed ? (
                                                    <Chip
                                                        size="small"
                                                        icon={<VisibilityIcon sx={{ fontSize: '14px !important', color: '#16A34A !important' }} />}
                                                        label="Viewed"
                                                        sx={{
                                                            fontSize: 11, fontWeight: 700, height: 22,
                                                            bgcolor: '#F0FDF4', color: '#15803D',
                                                            border: '1px solid #A7F3D0',
                                                        }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        size="small"
                                                        icon={<VisibilityOffIcon sx={{ fontSize: '14px !important', color: '#C2410C !important' }} />}
                                                        label="Not viewed"
                                                        sx={{
                                                            fontSize: 11, fontWeight: 700, height: 22,
                                                            bgcolor: '#FFF7ED', color: '#C2410C',
                                                            border: '1px solid #FED7AA',
                                                        }}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* View-tracking notice — shows when there IS a post but no acknowledgement data yet */}
                {hasPost && filteredStudents.length > 0 && postInfo.viewedRollNumbers.length === 0 && (
                    <Box sx={{
                        px: 2, py: 1,
                        borderTop: '1px solid #E8DDEA',
                        bgcolor: '#FFFBEB',
                        display: 'flex', alignItems: 'center', gap: 1,
                    }}>
                        <CheckCircleIcon sx={{ fontSize: 14, color: '#D97706' }} />
                        <Typography sx={{ fontSize: 11, color: '#92400E', fontWeight: 600 }}>
                            View tracking will appear here once the student mobile app records "post viewed" events.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

// Compact KPI tile used in the header summary card
const KpiTile = ({ label, value, sublabel, icon, bgColor, textColor }) => (
    <Box sx={{
        p: 1.2,
        borderRadius: '8px',
        bgcolor: bgColor,
        border: `1px solid ${textColor}22`,
        display: 'flex', alignItems: 'center', gap: 1,
        height: '100%',
    }}>
        <Box sx={{
            width: 34, height: 34, borderRadius: '8px',
            bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: textColor, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: textColor, lineHeight: 1.1 }} noWrap>
                {value}
            </Typography>
            {sublabel && (
                <Typography sx={{ fontSize: 10, color: textColor, opacity: 0.75 }} noWrap>
                    {sublabel}
                </Typography>
            )}
        </Box>
    </Box>
);
