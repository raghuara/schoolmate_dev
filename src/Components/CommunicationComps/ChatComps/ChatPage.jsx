import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    IconButton,
    Typography,
    TextField,
    InputAdornment,
    Avatar,
    Badge,
    Divider,
    Tooltip,
    Menu,
    MenuItem,
    Popover,
    Button,
    Checkbox,
    Chip,
    Select,
    Dialog,
    DialogContent,
    DialogActions,
    CircularProgress,
    Drawer,
    Snackbar,
    Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CloseIcon from '@mui/icons-material/Close';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import PermMediaRoundedIcon from '@mui/icons-material/PermMediaRounded';
import SmartDisplayRoundedIcon from '@mui/icons-material/SmartDisplayRounded';
import NotificationsOffRoundedIcon from '@mui/icons-material/NotificationsOffRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import RemoveModeratorRoundedIcon from '@mui/icons-material/RemoveModeratorRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import ShortcutRoundedIcon from '@mui/icons-material/ShortcutRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import AddReactionOutlinedIcon from '@mui/icons-material/AddReactionOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import { setChatUnreadTotal } from '../../../Redux/Slices/chatSlice';
import { creategroup, fetchgroups, fetchgroupinfo, sendmessage, fetchmessages, getchatusers, markread, pinmessage, deletemessage, updategroup, updategroupmembers, mutegroup, updatememberrole, leavegroup, deletegroup, clearchat, editmessage, reactmessage, messagereadinfo, searchmessages, fetchmedia, chathub } from '../../../Api/Api';
import DashbrdHeader from '../../DashBoard/DashBoardHeader';
import chatBg from '../../../Images/chat-background.png';
import productLogo from '../../../Images/Login/SchoolMate Logo.png';

const MINE = '#2E2E2E';
const DARK_TEXT = '#1A1A1A';

const FORWARD_ENABLED = false;
const MUTE_ENABLED = false;

const MAX_FILE_MB = 25;
const MAX_FILE_SIZE = MAX_FILE_MB * 1024 * 1024;

const formatFileSize = (bytes) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
};

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'heif'];
const AUDIO_EXTENSIONS = ['mp3', 'm4a', 'aac', 'ogg', 'oga', 'opus', 'wav', 'amr', 'weba'];
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'mkv', '3gp', 'avi'];
const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf', 'xml', 'json', 'zip'];
const ALLOWED_EXTENSIONS = new Set([...IMAGE_EXTENSIONS, ...AUDIO_EXTENSIONS, ...VIDEO_EXTENSIONS, ...DOCUMENT_EXTENSIONS]);
const ALLOWED_ACCEPT = [...ALLOWED_EXTENSIONS].map((e) => `.${e}`).join(',');

const getExtension = (name) => {
    const m = String(name || '').toLowerCase().match(/\.([a-z0-9]+)(?:\?|$)/);
    return m ? m[1] : '';
};

const copyTextToClipboard = async (text) => {
    const str = String(text ?? '');
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(str);
            return true;
        } catch (e) {
            // fall through to the legacy method below
        }
    }
    try {
        const ta = document.createElement('textarea');
        ta.value = str;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
    } catch (e) {
        return false;
    }
};

const linkify = (text, mine) => {
    const str = String(text || '');
    if (!str) return str;
    return str.split(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi).map((part, i) => {
        if (!part) return null;
        if (/^(https?:\/\/|www\.)/i.test(part)) {
            const href = /^https?:\/\//i.test(part) ? part : `https://${part}`;
            return (
                <Box
                    component="a"
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    sx={{ color: mine ? '#9CD2FF' : '#1B74E4', textDecoration: 'underline', wordBreak: 'break-all' }}
                >
                    {part}
                </Box>
            );
        }
        return part;
    });
};

const classifyFile = (fileName) => {
    const ext = getExtension(fileName);
    let category = 'document';
    if (IMAGE_EXTENSIONS.includes(ext)) category = 'image';
    else if (AUDIO_EXTENSIONS.includes(ext)) category = 'audio';
    else if (VIDEO_EXTENSIONS.includes(ext)) category = 'video';
    return {
        ext,
        category,
        filetype: ext ? `${category}/${ext}` : category,
        allowed: ALLOWED_EXTENSIONS.has(ext),
    };
};

const avatarPalette = ['#FF6B35', '#3457D5', '#8600BB', '#00ACC1', '#7DC353', '#E30053', '#FF9800', '#009688', '#5C6BC0', '#795548'];

const colorFor = (key) => {
    const str = String(key || '');
    let sum = 0;
    for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
    return avatarPalette[sum % avatarPalette.length];
};

const senderNamePalette = [
    '#D32F2F', '#C2185B', '#7B1FA2', '#512DA8', '#303F9F', '#1976D2',
    '#0288D1', '#0097A7', '#00796B', '#388E3C', '#F57C00', '#5D4037',
    '#455A64', '#AD1457', '#6A1B9A', '#283593',
];

const nameColorFor = (key) => {
    const str = String(key || '');
    let sum = 0;
    for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
    return senderNamePalette[sum % senderNamePalette.length];
};

const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
};

const initials = (name) =>
    String(name || '')
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

const timePart = (sentOn) => {
    const t = String(sentOn || '').split(' ')[1];
    if (!t) return String(sentOn || '');
    const [hStr, m] = t.split(':');
    let h = parseInt(hStr, 10);
    if (isNaN(h)) return t;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
};

const parseTs = (s) => {
    const m = String(s || '').match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/);
    if (!m) return 0;
    return new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]).getTime();
};

const byRecent = (a, b) => (b.ts - a.ts) || ((b.lastId || 0) - (a.lastId || 0));

const fmtDur = (s) => {
    if (!s || isNaN(s) || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss < 10 ? '0' : ''}${ss}`;
};

function AudioMessage({ src, mine, accent, accentFill }) {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [cur, setCur] = useState(0);
    const [dur, setDur] = useState(0);

    const toggle = () => {
        const a = audioRef.current;
        if (!a) return;
        if (playing) a.pause();
        else a.play();
    };

    const onSeek = (e) => {
        const a = audioRef.current;
        if (!a || !dur) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        a.currentTime = ratio * dur;
        setCur(a.currentTime);
    };

    const pct = dur ? (cur / dur) * 100 : 0;
    const barColor = mine ? 'rgba(255,255,255,0.9)' : accent;
    const trackColor = mine ? 'rgba(255,255,255,0.28)' : '#e2e2e6';

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 230 }}>
            <IconButton
                onClick={toggle}
                size="small"
                sx={{
                    width: 30,
                    height: 30,
                    flexShrink: 0,
                    backgroundColor: mine ? 'rgba(255,255,255,0.18)' : accentFill,
                    '&:hover': { backgroundColor: mine ? 'rgba(255,255,255,0.3)' : accent },
                }}
            >
                {playing ? (
                    <PauseRoundedIcon sx={{ fontSize: 18, color: mine ? '#fff' : '#1A1A1A' }} />
                ) : (
                    <PlayArrowRoundedIcon sx={{ fontSize: 18, color: mine ? '#fff' : '#1A1A1A' }} />
                )}
            </IconButton>
            <Box onClick={onSeek} sx={{ flexGrow: 1, minWidth: 0, height: 5, borderRadius: 3, backgroundColor: trackColor, cursor: 'pointer', position: 'relative' }}>
                <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: 3 }} />
                <Box sx={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)', width: 11, height: 11, borderRadius: '50%', backgroundColor: barColor, boxShadow: '0 1px 2px rgba(0,0,0,0.25)' }} />
            </Box>
            <Typography sx={{ fontSize: '11px', flexShrink: 0, minWidth: 30, textAlign: 'right', color: mine ? 'rgba(255,255,255,0.75)' : '#888' }}>
                {playing || cur ? fmtDur(cur) : fmtDur(dur)}
            </Typography>
            <audio
                ref={audioRef}
                src={src}
                preload="metadata"
                style={{ display: 'none' }}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => { setPlaying(false); setCur(0); }}
                onTimeUpdate={(e) => setCur(e.target.currentTime)}
                onLoadedMetadata={(e) => setDur(e.target.duration)}
            />
        </Box>
    );
}

export default function ChatPage({ embedded = false }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const settings = useSelector(selectWebsiteSettings);
    const auth = useSelector((state) => state.auth);

    const rollNumber = auth?.rollNumber;
    const userType = auth?.userType;
    const canCreateGroup = ['admin', 'superadmin'].includes(String(userType || '').toLowerCase().replace(/\s/g, ''));
    const token = '123';

    const ACCENT = settings?.darkColor || '#EEA200';
    const ACCENT_FILL = settings?.mainColor || '#FCBE3A';
    const ACCENT_SOFT = settings?.lightColor || '#FFF7E5';
    const ACCENT_SOFT_HOVER = '#FBEFCD';

    const fillBtnSx = {
        backgroundColor: ACCENT_FILL,
        '&:hover': { backgroundColor: ACCENT },
    };

    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#F7F7F9',
            transition: 'background-color 0.2s, box-shadow 0.2s',
            '& fieldset': { borderColor: '#E6E6EC' },
            '&:hover': { backgroundColor: '#F2F2F5' },
            '&:hover fieldset': { borderColor: '#D6D6DE' },
            '&.Mui-focused': { backgroundColor: '#fff', boxShadow: `0 0 0 3px ${ACCENT}22` },
            '&.Mui-focused fieldset': { borderColor: ACCENT, borderWidth: '1.5px' },
        },
    };

    const fieldLabelSx = { fontSize: '11px', fontWeight: 700, color: '#9A9AA3', mb: 0.6, letterSpacing: 0.4, textTransform: 'uppercase' };

    const menuPaperSx = { borderRadius: '12px', border: '1px solid #ececf1', boxShadow: '0 10px 30px rgba(16,24,40,0.16)' };
    const menuListSx = {
        px: 0.7,
        py: 0.7,
        '& .MuiMenuItem-root': {
            borderRadius: '9px',
            px: 1.2,
            py: 0.9,
            minHeight: 'auto',
            transition: '0.15s',
            '&:hover': { backgroundColor: '#f3f3f5' },
        },
    };
    const menuSlot = (minWidth) => ({ paper: { sx: { ...menuPaperSx, mt: 0.5, minWidth } }, list: { sx: menuListSx } });

    const [search, setSearch] = useState('');
    const [conversations, setConversations] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState({});
    const [draft, setDraft] = useState('');
    const [activeGroupInfo, setActiveGroupInfo] = useState(null);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [hasMoreNewer, setHasMoreNewer] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingNewer, setLoadingNewer] = useState(false);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const [newMsgCount, setNewMsgCount] = useState(0);
    const [unreadDivider, setUnreadDivider] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchIndex, setSearchIndex] = useState(-1);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchHasMore, setSearchHasMore] = useState(false);
    const [searchLoadingMore, setSearchLoadingMore] = useState(false);
    const [infoMsg, setInfoMsg] = useState(null);
    const [infoData, setInfoData] = useState(null);
    const [infoLoading, setInfoLoading] = useState(false);
    const [reactAnchor, setReactAnchor] = useState(null);
    const [reactTarget, setReactTarget] = useState(null);
    const [reactMoreOpen, setReactMoreOpen] = useState(false);
    const [reactInfoAnchor, setReactInfoAnchor] = useState(null);
    const [reactInfoList, setReactInfoList] = useState([]);
    const [reactInfoMsg, setReactInfoMsg] = useState(null);
    const [highlightMsgId, setHighlightMsgId] = useState(null);
    const [pinMenuPos, setPinMenuPos] = useState(null);
    const [typingName, setTypingName] = useState(null);
    const [onlineRolls, setOnlineRolls] = useState(() => new Set());
    const [readByAllUpTo, setReadByAllUpTo] = useState(0);

    const [menuAnchor, setMenuAnchor] = useState(null);
    const [groupOpen, setGroupOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupUserType, setGroupUserType] = useState('All');
    const [groupSearch, setGroupSearch] = useState('');
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [allChatUsers, setAllChatUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [groupNameEmoji, setGroupNameEmoji] = useState(false);
    const [groupDesc, setGroupDesc] = useState('');
    const [groupIconFile, setGroupIconFile] = useState(null);
    const [groupIconPreview, setGroupIconPreview] = useState('');

    const [isRecording, setIsRecording] = useState(false);
    const [recordSeconds, setRecordSeconds] = useState(0);

    const [showEmoji, setShowEmoji] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const [attachCaption, setAttachCaption] = useState('');
    const [attachShowEmoji, setAttachShowEmoji] = useState(false);
    const [sendingAttach, setSendingAttach] = useState(false);
    const [viewerImage, setViewerImage] = useState(null);
    const [docMenuAnchor, setDocMenuAnchor] = useState(null);
    const [docMenuTarget, setDocMenuTarget] = useState(null);
    const [docViewer, setDocViewer] = useState(null);

    const [msgMenuAnchor, setMsgMenuAnchor] = useState(null);
    const [msgMenuTarget, setMsgMenuTarget] = useState(null);
    const [groupMenuAnchor, setGroupMenuAnchor] = useState(null);
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [memberMenuAnchor, setMemberMenuAnchor] = useState(null);
    const [memberMenuTarget, setMemberMenuTarget] = useState(null);
    const [listMenuAnchor, setListMenuAnchor] = useState(null);
    const [listMenuGroup, setListMenuGroup] = useState(null);
    const [muteSubAnchor, setMuteSubAnchor] = useState(null);
    const [headerMuteSubAnchor, setHeaderMuteSubAnchor] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });
    const [copied, setCopied] = useState(false);
    const [savingMembers, setSavingMembers] = useState(false);
    const [leaveTargetId, setLeaveTargetId] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [forwardMsg, setForwardMsg] = useState(null);
    const [forwardSelected, setForwardSelected] = useState([]);
    const [forwardSearch, setForwardSearch] = useState('');
    const [forwardSending, setForwardSending] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [editingDesc, setEditingDesc] = useState(false);

    const [infoOpen, setInfoOpen] = useState(false);
    const [media, setMedia] = useState([]);
    const [mediaLoading, setMediaLoading] = useState(false);
    const [mediaHasMore, setMediaHasMore] = useState(false);
    const [mediaLoadingMore, setMediaLoadingMore] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const [manageSearch, setManageSearch] = useState('');
    const [manageAdd, setManageAdd] = useState([]);
    const [manageRemove, setManageRemove] = useState([]);

    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);
    const menuButtonRef = useRef(null);
    const groupIconInputRef = useRef(null);
    const groupInfoIconInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordTimerRef = useRef(null);
    const recordCancelledRef = useRef(false);
    const staffCacheRef = useRef({});
    const connRef = useRef(null);
    const activeIdRef = useRef(null);
    const typingTimerRef = useRef(null);
    const emojiBoxRef = useRef(null);
    const emojiBtnRef = useRef(null);
    const prependingRef = useRef(false);
    const prevScrollHeightRef = useRef(0);
    const keepScrollRef = useRef(false);
    const messagesRef = useRef({});
    const convListRef = useRef([]);
    const composerRef = useRef(null);
    const jumpRef = useRef(null);
    const keepPosRef = useRef(false);
    const lastMarkedReadRef = useRef({});
    const lastReadSnapshotRef = useRef({});
    const scrollRafRef = useRef(false);
    const copiedTimerRef = useRef(null);
    const swipeStartXRef = useRef(0);
    const swipeElRef = useRef(null);
    const swipeMsgRef = useRef(null);

    const activeChat = conversations.find((c) => c.id === activeId);
    const activeMessages = messages[activeId] || [];

    const filtered = conversations.filter(
        (c) =>
            (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.role || '').toLowerCase().includes(search.toLowerCase())
    );

    const isTuitionType = (t) => /tu[i]?tion\s*teacher/i.test(String(t || ''));
    const userTypeOptions = ['All', ...Array.from(new Set(allChatUsers.map((u) => u.userType).filter(Boolean))).filter((t) => !isTuitionType(t))];

    const matchUser = (s, q) => {
        const t = (q || '').toLowerCase();
        return !t || (s.name || '').toLowerCase().includes(t) || (s.role || '').toLowerCase().includes(t) || (s.userType || '').toLowerCase().includes(t) || String(s.rollNumber || '').toLowerCase().includes(t);
    };

    const groupFilteredStaff = allChatUsers.filter(
        (s) => (groupUserType === 'All' || s.userType === groupUserType) && matchUser(s, groupSearch)
    );

    const manageExisting = new Set((activeGroupInfo?.members || []).map((m) => m.rollNumber));
    const manageFilteredStaff = allChatUsers.filter((s) => !manageExisting.has(s.rollNumber) && matchUser(s, manageSearch));

    const selectedStaffObjects = selectedStaff.map((id) => staffCacheRef.current[id]).filter(Boolean);

    const mapMessage = (m) => {
        if (m.messageType === 'system') {
            return {
                id: m.messageId,
                type: 'system',
                text: m.messageText,
                systemEventType: m.systemEventType,
                senderRollNumber: m.senderRollNumber,
                senderName: m.senderName,
                time: timePart(m.sentOn),
                sentOn: m.sentOn,
            };
        }
        const ft = (m.filetype || '').toLowerCase();
        const nameForExt = `${m.filename || ''} ${m.filepath || ''}`.toLowerCase();
        const isImage = ft.startsWith('image') || /^(jpe?g|png|gif|webp|bmp|heic|heif|svg)$/.test(ft) || /\.(jpe?g|png|gif|webp|bmp|heic|heif|svg)(\?|$|\s)/i.test(nameForExt);
        const isAudio = ft === 'audio' || ft.startsWith('audio') || /\.(mp3|m4a|aac|ogg|oga|opus|wav|amr|webm|weba)(\?|$|\s)/i.test(nameForExt);
        let type = 'text';
        if (m.filepath) type = isImage ? 'image' : isAudio ? 'audio' : 'file';
        return {
            id: m.messageId,
            type,
            text: m.messageText,
            caption: m.filepath ? m.messageText : undefined,
            fileUrl: m.filepath,
            fileName: m.filename,
            fileSize: '',
            sender: m.senderRollNumber === rollNumber ? 'me' : 'them',
            senderName: m.senderName,
            senderRollNumber: m.senderRollNumber,
            time: timePart(m.sentOn),
            sentOn: m.sentOn,
            isDeleted: m.isDeleted,
            isPinned: m.isPinned,
            isEdited: m.isEdited,
            deletedByName: m.deletedByName,
            deletedByRollNumber: m.deletedByRollNumber,
            deletedByRole: m.deletedByRole,
            replyToMessageId: m.replyToMessageId,
            replyToText: m.replyToText,
            replyToSenderName: m.replyToSenderName,
            reactions: m.reactions || [],
        };
    };

    const firstName = (full) => String(full || '').trim().split(' ')[0] || full || '';

    const showSnack = (message, severity = 'info') => setSnack({ open: true, message, severity });

    const showCopied = () => {
        setCopied(true);
        clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = setTimeout(() => setCopied(false), 1300);
    };

    const attachmentLabel = (dto) => {
        const t = String(dto.filetype || '').toLowerCase();
        const name = String(dto.filename || '').toLowerCase();
        const isImage = t === 'image' || t.startsWith('image/') || /\.(jpe?g|png|gif|webp|bmp|heic)$/.test(name);
        const isAudio = t === 'audio' || t.startsWith('audio/') || /\.(webm|mp3|wav|ogg|m4a|aac)$/.test(name);
        if (isImage) return '📷 Photo';
        if (isAudio) return '🎤 Voice message';
        return '📎 Document';
    };

    const reactionPreview = (dto) => {
        const reactions = dto.reactions || [];
        if (!reactions.length) return '';
        let pick = reactions.find((r) => (r.rollNumbers || []).includes(rollNumber));
        const reactorRoll = pick ? rollNumber : (reactions[0].rollNumbers || [])[0];
        const emoji = (pick || reactions[0]).emoji;
        if (reactorRoll === rollNumber) return `You reacted ${emoji} to message`;
        const yours = dto.senderRollNumber === rollNumber;
        const nm = firstName(nameForRoll(reactorRoll));
        return `${nm} reacted ${emoji} to ${yours ? 'your message' : 'message'}`;
    };

    const messagePreview = (dto) => {
        if (!dto) return '';
        if (dto.isDeleted) return 'This message was deleted';
        if (dto.messageType === 'system') return dto.messageText || '';
        const rx = reactionPreview(dto);
        if (rx) return rx;
        const body = dto.messageText || (dto.filepath ? attachmentLabel(dto) : '');
        if (!body) return '';
        if (dto.senderRollNumber === rollNumber) return body;
        return firstName(dto.senderName) ? `${firstName(dto.senderName)}: ${body}` : body;
    };

    const mapGroup = (g) => ({
        id: g.groupId,
        name: g.name,
        role: g.description || `${g.memberCount || 0} members`,
        avatar: initials(g.name),
        color: colorFor(g.name),
        iconPath: g.hasLeft ? null : g.iconPath,
        lastMessage: messagePreview(g.lastMessage),
        time: g.lastMessage ? timePart(g.lastMessage.sentOn) : '',
        ts: g.lastMessage ? parseTs(g.lastMessage.sentOn) : 0,
        lastId: g.lastMessage?.messageId || 0,
        unread: g.unreadCount || 0,
        online: false,
        isGroup: true,
        myRole: g.myRole,
        isMuted: g.isMuted,
        isCreator: g.isCreator,
        hasLeft: g.hasLeft,
        memberCount: g.memberCount,
    });

    const loadGroups = async () => {
        setLoadingGroups(true);
        try {
            const res = await axios.get(fetchgroups, {
                params: { rollNumber, userType },
                headers: { Authorization: `Bearer ${token}` },
            });
            const list = (res.data?.groups || []).map(mapGroup).sort(byRecent);
            setConversations(list);
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingGroups(false);
        }
    };

    const PAGE_SIZE = 50;

    const loadMessages = async (groupId, showLoader = true) => {
        if (!groupId) return;
        if (showLoader) setLoadingMessages(true);
        
        try {
            const res = await axios.get(fetchmessages, {
                params: { groupId, rollNumber, userType, pageSize: PAGE_SIZE },
                headers: { Authorization: `Bearer ${token}` },
            });
            const raw = res.data?.messages || [];
            const list = raw.map(mapMessage);
            const readAllUpTo = res.data?.readByAllUpToMessageId || 0;
            prependingRef.current = false;
            setMessages((prev) => {
                const existing = prev[groupId] || [];
                const serverKeys = new Set(
                    list.filter((m) => m.sender === 'me').map((m) => `${m.type}|${m.text || m.caption || m.fileName || ''}`)
                );
                const keptTemps = existing.filter(
                    (m) => m.pending && String(m.id).startsWith('tmp-') && !serverKeys.has(`${m.type}|${m.text || m.caption || m.fileName || ''}`)
                );
                return { ...prev, [groupId]: [...list, ...keptTemps] };
            });
            setHasMore(Boolean(res.data?.hasMore));
            setHasMoreNewer(false);
            if (readAllUpTo) setReadByAllUpTo((v) => Math.max(v, readAllUpTo));
            const lastServerId = raw.reduce((max, m) => Math.max(max, m.messageId || 0), 0);
            if (showLoader) {
                const myLastReadId = Number(res.data?.myLastReadMessageId) || 0;
                const apiUnread = Number(res.data?.unreadCount) || 0;
                const unreadList = list.filter(
                    (m) => typeof m.id === 'number' && m.id > myLastReadId && m.sender !== 'me' && m.type !== 'system'
                );
                const unreadN = apiUnread || unreadList.length;
                lastReadSnapshotRef.current[groupId] = myLastReadId;
                if (unreadN > 0 && unreadList.length) {
                    setUnreadDivider({ id: unreadList[0].id, count: unreadN });
                    jumpRef.current = unreadList[0].id;
                } else {
                    setUnreadDivider(null);
                }
            }
            if (lastServerId) {
                setConversations((prev) => prev.map((c) => (c.id === groupId ? { ...c, unread: 0 } : c)));
            }
        } catch (e) {
            console.log(e);
        } finally {
            if (showLoader) setLoadingMessages(false);
        }
    };

    const loadOlderMessages = async () => {
        const gid = activeIdRef.current;
        if (!gid || loadingMore || !hasMore) return;
        const current = messages[gid] || [];
        const ids = current.map((m) => m.id).filter((x) => typeof x === 'number');
        if (!ids.length) return;
        const before = Math.min(...ids);
        setLoadingMore(true);
        prevScrollHeightRef.current = scrollRef.current?.scrollHeight || 0;
        prependingRef.current = true;
        try {
            const res = await axios.get(fetchmessages, {
                params: { groupId: gid, rollNumber, userType, before, pageSize: PAGE_SIZE },
                headers: { Authorization: `Bearer ${token}` },
            });
            const older = (res.data?.messages || []).map(mapMessage);
            setMessages((prev) => {
                const list = prev[gid] || [];
                const existing = new Set(list.map((m) => m.id));
                const merged = [...older.filter((m) => !existing.has(m.id)), ...list];
                return { ...prev, [gid]: merged };
            });
            setHasMore(Boolean(res.data?.hasMore));
        } catch (e) {
            console.log(e);
            prependingRef.current = false;
        } finally {
            setLoadingMore(false);
        }
    };

    const loadNewerMessages = async () => {
        const gid = activeIdRef.current;
        if (!gid || loadingNewer || !hasMoreNewer) return;
        const current = messages[gid] || [];
        const ids = current.map((m) => m.id).filter((x) => typeof x === 'number');
        if (!ids.length) return;
        const after = Math.max(...ids);
        setLoadingNewer(true);
        keepScrollRef.current = true;
        try {
            const res = await axios.get(fetchmessages, {
                params: { groupId: gid, rollNumber, userType, after, pageSize: PAGE_SIZE },
                headers: { Authorization: `Bearer ${token}` },
            });
            const newer = (res.data?.messages || []).map(mapMessage);
            setMessages((prev) => {
                const list = prev[gid] || [];
                const existing = new Set(list.map((m) => m.id));
                const temps = list.filter((m) => m.pending);
                const real = list.filter((m) => !m.pending);
                const merged = [...real, ...newer.filter((m) => !existing.has(m.id)), ...temps];
                return { ...prev, [gid]: merged };
            });
            setHasMoreNewer(Boolean(res.data?.hasMore));
        } catch (e) {
            console.log(e);
            keepScrollRef.current = false;
        } finally {
            setLoadingNewer(false);
        }
    };

    const updateScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollDown(distanceFromBottom > 250);
        const gid = activeIdRef.current;
        const list = messagesRef.current[gid] || [];
        const contRect = el.getBoundingClientRect();
        let lastVisibleId = 0;
        for (const m of list) {
            const node = document.getElementById(`msg-${m.id}`);
            if (!node) continue;
            if (node.getBoundingClientRect().top < contRect.bottom - 8 && typeof m.id === 'number') {
                lastVisibleId = Math.max(lastVisibleId, m.id);
            }
        }
        if (lastVisibleId) markRead(gid, lastVisibleId);
        const snapshot = lastReadSnapshotRef.current[gid] || 0;
        let belowUnread = 0;
        for (const m of list) {
            if (typeof m.id === 'number' && m.id > lastVisibleId && m.id > snapshot && m.sender !== 'me' && m.type !== 'system') {
                belowUnread += 1;
            }
        }
        setNewMsgCount(belowUnread);
    };

    const handleMessagesScroll = (e) => {
        const el = e.target;
        if (el.scrollTop < 60 && hasMore && !loadingMore) {
            loadOlderMessages();
        }
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom < 60 && hasMoreNewer && !loadingNewer) {
            loadNewerMessages();
        }
        if (!scrollRafRef.current) {
            scrollRafRef.current = true;
            requestAnimationFrame(() => { scrollRafRef.current = false; updateScrollState(); });
        }
    };

    const scrollToBottom = () => {
        const el = scrollRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        setShowScrollDown(false);
    };

    const downloadFile = async (url, name) => {
        if (!url) return;
        let fileName = name;
        if (!fileName) {
            try {
                fileName = decodeURIComponent(String(url).split('?')[0].split('/').pop()) || 'download';
            } catch {
                fileName = 'download';
            }
        }
        try {
            const res = await fetch(url, { mode: 'cors' });
            if (!res.ok) throw new Error('fetch failed');
            const blob = await res.blob();
            const objUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(objUrl), 4000);
        } catch (e) {
            window.open(url, '_blank', 'noopener');
        }
    };

    const openDocMenu = (e, m) => {
        e.stopPropagation();
        setDocMenuTarget(m);
        setDocMenuAnchor(e.currentTarget);
    };

    const handleScrollDownClick = () => {
        scrollToBottom();
        const gid = activeIdRef.current;
        const ids = (messagesRef.current[gid] || []).map((m) => m.id).filter((x) => typeof x === 'number');
        if (ids.length) markRead(gid, Math.max(...ids));
        setNewMsgCount(0);
    };

    const markRead = async (groupId, lastReadMessageId) => {
        if (!groupId || !lastReadMessageId) return;
        if ((lastMarkedReadRef.current[groupId] || 0) >= lastReadMessageId) return;
        lastMarkedReadRef.current[groupId] = lastReadMessageId;
        try {
            await axios.put(
                markread,
                { rollNumber, userType, groupId, lastReadMessageId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (e) {
            lastMarkedReadRef.current[groupId] = 0;
            console.log(e);
        }
    };

    const loadGroupInfo = async (groupId) => {
        if (!groupId) return;
        try {
            const res = await axios.get(fetchgroupinfo, {
                params: { groupId, rollNumber, userType },
                headers: { Authorization: `Bearer ${token}` },
            });
            setActiveGroupInfo(res.data?.group || null);
        } catch (e) {
            console.log(e);
        }
    };

    const MEDIA_PAGE_SIZE = 20;

    const loadMedia = async (groupId) => {
        if (!groupId) return;
        setMediaLoading(true);
        try {
            const res = await axios.get(fetchmedia, {
                params: { groupId, rollNumber, userType },
                headers: { Authorization: `Bearer ${token}` },
            });
            setMedia(res.data?.media || []);
            setMediaHasMore(Boolean(res.data?.hasMore));
        } catch (e) {
            console.log(e);
        } finally {
            setMediaLoading(false);
        }
    };

    const loadMoreMedia = async () => {
        const gid = activeIdRef.current;
        const ids = media.map((m) => m.messageId).filter((x) => typeof x === 'number');
        if (!gid || mediaLoadingMore || !mediaHasMore || ids.length === 0) return;
        const before = Math.min(...ids);
        setMediaLoadingMore(true);
        try {
            const res = await axios.get(fetchmedia, {
                params: { groupId: gid, rollNumber, userType, pageSize: MEDIA_PAGE_SIZE, before },
                headers: { Authorization: `Bearer ${token}` },
            });
            const more = res.data?.media || [];
            setMedia((prev) => {
                const seen = new Set(prev.map((x) => x.messageId));
                return [...prev, ...more.filter((x) => !seen.has(x.messageId))];
            });
            setMediaHasMore(Boolean(res.data?.hasMore));
        } catch (e) {
            console.log(e);
        } finally {
            setMediaLoadingMore(false);
        }
    };

    const loadChatUsers = async () => {
        if (allChatUsers.length > 0) return;
        setLoadingUsers(true);
        try {
            const res = await axios.get(getchatusers, {
                params: { rollNumber, userType },
                headers: { Authorization: `Bearer ${token}` },
            });
            const raw = Array.isArray(res.data) ? res.data : res.data?.users || res.data?.data || [];
            const list = raw.map((u) => ({
                id: u.rollNumber,
                rollNumber: u.rollNumber,
                name: u.name,
                role: u.subUserType || u.userType || '',
                userType: u.userType,
                avatar: initials(u.name),
                color: colorFor(u.rollNumber),
            }));
            list.forEach((s) => { staffCacheRef.current[s.id] = s; });
            setAllChatUsers(list);
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        (async () => {
            await loadChatUsers();
            loadGroups();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const total = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
        dispatch(setChatUnreadTotal(total));
        convListRef.current = conversations;
    }, [conversations, dispatch]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        activeIdRef.current = activeId;
        setTypingName(null);
        setReplyTo(null);
        setReadByAllUpTo(0);
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        setSearchIndex(-1);
        setSearchHasMore(false);
        setNewMsgCount(0);
        setUnreadDivider(null);
        setMedia([]);
        setMediaHasMore(false);
        keepPosRef.current = false;
        if (activeId) {
            loadMessages(activeId);
            loadGroupInfo(activeId);
            const t = setTimeout(() => composerRef.current?.focus(), 250);
            return () => clearTimeout(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId]);

    useEffect(() => {
        if (editingMsgId && composerRef.current) {
            const el = composerRef.current;
            el.focus();
            const len = el.value.length;
            el.setSelectionRange(len, len);
        }
    }, [editingMsgId]);

    useEffect(() => {
        if (groupOpen || manageOpen) loadChatUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupOpen, manageOpen]);

    useEffect(() => {
        if (infoOpen && activeId) loadMedia(activeId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [infoOpen, activeId]);

    useEffect(() => {
        if (!searchOpen) return;
        const t = setTimeout(() => runSearch(searchQuery), 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, searchOpen]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        if (jumpRef.current) {
            const id = jumpRef.current;
            jumpRef.current = null;
            requestAnimationFrame(() => { scrollToMessage(id); requestAnimationFrame(updateScrollState); });
        } else if (prependingRef.current) {
            el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
            prependingRef.current = false;
            requestAnimationFrame(updateScrollState);
        } else if (keepScrollRef.current) {
            keepScrollRef.current = false;
            requestAnimationFrame(updateScrollState);
        } else if (keepPosRef.current) {
            keepPosRef.current = false;
            requestAnimationFrame(updateScrollState);
        } else {
            el.scrollTop = el.scrollHeight;
            requestAnimationFrame(updateScrollState);
        }
    }, [activeMessages.length, activeId]);

    useEffect(() => {
        if (!showEmoji) return;
        const handler = (e) => {
            if (
                emojiBoxRef.current && !emojiBoxRef.current.contains(e.target) &&
                emojiBtnRef.current && !emojiBtnRef.current.contains(e.target)
            ) {
                setShowEmoji(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showEmoji]);

    useEffect(() => {
        if (!rollNumber) return;
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${chathub}?access_token=${token}&rollNumber=${rollNumber}`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveMessage', (dto) => {
            const gid = dto.groupId;
            const isActive = gid === activeIdRef.current;
            if (isActive) {
                const mapped = mapMessage(dto);
                const el = scrollRef.current;
                const nearBottom = el ? el.scrollHeight - el.scrollTop - el.clientHeight < 150 : true;
                const stayPut = mapped.sender !== 'me' && !nearBottom;
                if (stayPut) {
                    keepPosRef.current = true;
                }
                setMessages((prev) => {
                    const list = prev[gid] || [];
                    if (list.some((m) => m.id === dto.messageId)) return prev;
                    let cleaned = list;
                    if (mapped.sender === 'me') {
                        if (mapped.type === 'text') {
                            cleaned = list.filter((m) => !(m.pending && String(m.id).startsWith('tmp-') && m.type === 'text' && (m.text || '') === (mapped.text || '')));
                        } else {
                            let removed = false;
                            cleaned = list.filter((m) => {
                                if (!removed && m.pending && String(m.id).startsWith('tmp-') && m.type === mapped.type) {
                                    removed = true;
                                    return false;
                                }
                                return true;
                            });
                        }
                    }
                    return { ...prev, [gid]: [...cleaned, mapped] };
                });
                if (!stayPut) markRead(gid, dto.messageId);
            }
            if (!convListRef.current.some((c) => c.id === gid)) {
                loadGroups();
                return;
            }
            const preview = messagePreview(dto);
            setConversations((prev) =>
                prev
                    .map((c) =>
                        c.id === gid
                            ? { ...c, lastMessage: preview, time: timePart(dto.sentOn), ts: parseTs(dto.sentOn), lastId: dto.messageId || c.lastId, unread: isActive ? 0 : (c.unread || 0) + 1 }
                            : c
                    )
                    .sort(byRecent)
            );
            if (/member|left/i.test(dto.systemEventType || '')) {
                loadGroups();
                if (isActive) loadGroupInfo(gid);
            }
        });

        connection.on('MessageRead', (r) => {
            if (r.groupId !== activeIdRef.current || r.rollNumber === rollNumber) return;
            if (r.readByAllUpToMessageId) setReadByAllUpTo((v) => Math.max(v, r.readByAllUpToMessageId));
        });

        connection.on('Typing', (t) => {
            if (t.groupId !== activeIdRef.current || t.rollNumber === rollNumber) return;
            setTypingName(t.name);
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = setTimeout(() => setTypingName(null), 3000);
        });

        connection.on('UserOnline', (u) => setOnlineRolls((s) => { const n = new Set(s); n.add(u.rollNumber); return n; }));
        connection.on('UserOffline', (u) => setOnlineRolls((s) => { const n = new Set(s); n.delete(u.rollNumber); return n; }));

        connection.on('MessageDeleted', (d) => {
            setMessages((prev) => {
                const list = prev[d.groupId];
                if (!list) return prev;
                return { ...prev, [d.groupId]: list.map((m) => (m.id === d.messageId ? { ...m, isDeleted: true } : m)) };
            });
            loadGroups();
        });

        connection.on('MessagePinned', (p) => {
            setMessages((prev) => {
                const list = prev[p.groupId];
                if (!list) return prev;
                return { ...prev, [p.groupId]: list.map((m) => (m.id === p.messageId ? { ...m, isPinned: p.isPinned } : m)) };
            });
        });

        connection.on('MessageEdited', (dto) => {
            setMessages((prev) => {
                const list = prev[dto.groupId];
                if (!list) return prev;
                return { ...prev, [dto.groupId]: list.map((m) => (m.id === dto.messageId ? { ...m, ...mapMessage(dto) } : m)) };
            });
            loadGroups();
        });

        const applyReaction = (p) => {
            if (!p) return;
            const gid = p.groupId;
            const mid = p.messageId;
            if (gid && mid && Array.isArray(p.reactions)) {
                setMessages((prev) => {
                    const list = prev[gid];
                    if (!list) return prev;
                    return { ...prev, [gid]: list.map((m) => (m.id === mid ? { ...m, reactions: p.reactions } : m)) };
                });
            } else if (gid === activeIdRef.current) {
                loadMessages(gid, false);
            }
            if (gid && p.emoji) {
                const reactedMsg = (messagesRef.current[gid] || []).find((m) => m.id === mid);
                const yours = reactedMsg && reactedMsg.sender === 'me';
                const preview =
                    p.rollNumber === rollNumber
                        ? `You reacted ${p.emoji} to message`
                        : `${firstName(nameForRoll(p.rollNumber))} reacted ${p.emoji} to ${yours ? 'your message' : 'message'}`;
                setConversations((prev) => prev.map((c) => (c.id === gid ? { ...c, lastMessage: preview } : c)));
            }
        };
        connection.on('MessageReacted', applyReaction);
        connection.on('ReactionUpdated', applyReaction);
        connection.on('MessageReaction', applyReaction);
        connection.on('MessageReactionUpdated', applyReaction);

        connection.on('MemberRoleChanged', (d) => {
            if (d.groupId === activeIdRef.current) loadGroupInfo(d.groupId);
            if (d.rollNumber === rollNumber) loadGroups();
        });

        connection.on('AddedToGroup', (g) => { loadGroups(); });
        connection.on('RemovedFromGroup', (g) => {
            setConversations((prev) => prev.map((c) => (c.id === g.groupId ? { ...c, hasLeft: true, iconPath: null } : c)));
            if (g.groupId === activeIdRef.current) setInfoOpen(false);
            loadGroups();
        });
        connection.on('GroupDeleted', (g) => {
            setConversations((prev) => prev.filter((c) => c.id !== g.groupId));
            if (g.groupId === activeIdRef.current) {
                setActiveId(null);
                setInfoOpen(false);
            }
        });
        connection.on('GroupUpdated', (g) => {
            loadGroups();
            if (g.groupId === activeIdRef.current) loadGroupInfo(g.groupId);
        });

        connection.on('ChatCleared', (d) => {
            const gid = d?.groupId;
            if (!gid) return;
            if (d.rollNumber && d.rollNumber !== rollNumber) return;
            setMessages((prev) => ({ ...prev, [gid]: [] }));
            setConversations((prev) => prev.map((c) => (c.id === gid ? { ...c, lastMessage: '', time: '', ts: 0, lastId: 0, unread: 0 } : c)));
        });

        connection.onreconnecting((e) => console.log('[chat] reconnecting…', e));
        connection.onreconnected(() => {
            console.log('[chat] reconnected');
            if (activeIdRef.current) loadMessages(activeIdRef.current, false);
            loadGroups();
        });
        connection.onclose((e) => console.log('[chat] connection closed', e));

        console.log('[chat] connecting to', `${chathub}?rollNumber=${rollNumber}`);
        connection
            .start()
            .then(() => console.log('[chat] socket CONNECTED, state =', connection.state))
            .catch((e) => console.log('[chat] socket FAILED:', e));
        connRef.current = connection;

        return () => {
            connection.stop();
            connRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rollNumber]);

    const pushMessage = (msg) => {
        setMessages((prev) => ({
            ...prev,
            [activeId]: [...(prev[activeId] || []), { id: Date.now(), ...msg }],
        }));
    };

    const pushOptimistic = (gid, msg) => {
        const tmpId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setMessages((prev) => ({
            ...prev,
            [gid]: [...(prev[gid] || []), { id: tmpId, sender: 'me', time: 'Now', pending: true, ...msg }],
        }));
    };

    const socketLive = () => connRef.current?.state === signalR.HubConnectionState.Connected;

    const handleSend = async () => {
        if (editingMsgId) {
            saveEdit();
            return;
        }
        if (!draft.trim() || !activeId) return;
        const text = draft.trim();
        const gid = activeId;
        const reply = replyTo;
        setDraft('');
        setShowEmoji(false);
        setReplyTo(null);
        pushOptimistic(gid, {
            type: 'text',
            text,
            replyToMessageId: reply?.id,
            replyToText: reply?.text,
            replyToSenderName: reply?.name,
        });
        try {
            const form = new FormData();
            form.append('rollNumber', rollNumber);
            form.append('userType', userType);
            form.append('groupId', gid);
            form.append('messageText', text);
            if (reply?.id) form.append('replyToMessageId', reply.id);
            await axios.post(sendmessage, form, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            if (!socketLive()) {
                loadMessages(gid, false);
                loadGroups();
            }
        } catch (e) {
            console.log(e);
        }
    };

    const handleType = (e) => {
        setDraft(e.target.value);
        const c = connRef.current;
        if (c && c.state === signalR.HubConnectionState.Connected && activeId) {
            c.invoke('Typing', activeId).catch(() => {});
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const meta = classifyFile(file.name);
        if (!meta.allowed) {
            showSnack(`"${file.name}" is not a supported file type.`, 'error');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            showSnack(`"${file.name}" is ${formatFileSize(file.size)}. Maximum allowed file size is ${MAX_FILE_MB}MB.`, 'error');
            return;
        }
        const url = URL.createObjectURL(file);
        setAttachment({
            type: meta.category === 'image' ? 'image' : 'file',
            category: meta.category,
            filetype: meta.filetype,
            fileName: file.name,
            fileUrl: url,
            fileSize: formatFileSize(file.size),
            file,
        });
        setAttachCaption('');
        setAttachShowEmoji(false);
    };

    const closeAttachment = () => {
        setAttachment(null);
        setAttachCaption('');
        setAttachShowEmoji(false);
    };

    const sendAttachment = async () => {
        if (!attachment || !attachment.file || !activeId || sendingAttach) return;
        setSendingAttach(true);
        const gid = activeId;
        const caption = attachCaption.trim();
        const att = attachment;
        const reply = replyTo;
        pushOptimistic(gid, {
            type: att.type,
            caption,
            fileUrl: att.fileUrl,
            fileName: att.fileName,
            fileSize: att.fileSize,
            replyToMessageId: reply?.id,
            replyToText: reply?.text,
            replyToSenderName: reply?.name,
        });
        closeAttachment();
        setReplyTo(null);
        try {
            const form = new FormData();
            form.append('rollNumber', rollNumber);
            form.append('userType', userType);
            form.append('groupId', gid);
            form.append('messageText', caption);
            form.append('filename', att.file.name);
            form.append('filetype', att.filetype || classifyFile(att.file.name).filetype);
            form.append('file', att.file);
            if (reply?.id) form.append('replyToMessageId', reply.id);
            await axios.post(sendmessage, form, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            if (!socketLive()) {
                loadMessages(gid, false);
                loadGroups();
            }
        } catch (e) {
            console.log(e);
            alert('Failed to send attachment. Please try again.');
        } finally {
            setSendingAttach(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            audioChunksRef.current = [];
            recordCancelledRef.current = false;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                if (recordCancelledRef.current) return;
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const gid = activeIdRef.current;
                if (!gid) return;
                const localUrl = URL.createObjectURL(blob);
                pushOptimistic(gid, { type: 'audio', fileUrl: localUrl });
                try {
                    const file = new File([blob], `voice_${Date.now()}.weba`, { type: 'audio/webm' });
                    const form = new FormData();
                    form.append('rollNumber', rollNumber);
                    form.append('userType', userType);
                    form.append('groupId', gid);
                    form.append('filename', file.name);
                    form.append('filetype', 'audio/weba');
                    form.append('file', file);
                    await axios.post(sendmessage, form, {
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
                    });
                    if (!socketLive()) {
                        loadMessages(gid, false);
                        loadGroups();
                    }
                } catch (err) {
                    console.log(err);
                }
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
            setRecordSeconds(0);
            recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
        } catch (err) {
            alert('Microphone access denied. Please allow microphone permission to record voice messages.');
        }
    };

    const stopRecording = (cancelled) => {
        recordCancelledRef.current = cancelled;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        clearInterval(recordTimerRef.current);
        setIsRecording(false);
        setRecordSeconds(0);
    };

    const toggleStaff = (id) => {
        setSelectedStaff((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const openGroupPopover = () => {
        setMenuAnchor(null);
        if (!canCreateGroup) return;
        setGroupOpen(true);
    };

    const resetGroupForm = () => {
        setGroupName('');
        setGroupUserType('All');
        setGroupSearch('');
        setSelectedStaff([]);
        setGroupNameEmoji(false);
        setGroupDesc('');
        setGroupIconFile(null);
        setGroupIconPreview('');
    };

    const handleGroupIcon = (e) => {
        const f = e.target.files?.[0];
        e.target.value = '';
        if (!f) return;
        if (classifyFile(f.name).category !== 'image') {
            showSnack('Please choose an image file (JPG, PNG, GIF, etc.).', 'error');
            return;
        }
        if (f.size > MAX_FILE_SIZE) {
            showSnack(`Image is ${formatFileSize(f.size)}. Maximum allowed size is ${MAX_FILE_MB}MB.`, 'error');
            return;
        }
        setGroupIconFile(f);
        setGroupIconPreview(URL.createObjectURL(f));
    };

    const closeGroupPopover = () => {
        setGroupOpen(false);
        resetGroupForm();
    };

    const handleCreateGroup = async () => {
        try {
            const form = new FormData();
            form.append('rollNumber', rollNumber);
            form.append('userType', userType);
            form.append('name', groupName.trim());
            form.append('description', groupDesc.trim());
            form.append('memberRollNumbers', selectedStaff.join(','));
            if (groupIconFile) form.append('iconFile', groupIconFile);
            await axios.post(creategroup, form, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            setGroupOpen(false);
            resetGroupForm();
            loadGroups();
        } catch (e) {
            console.log(e);
        }
    };

    const openMsgMenu = (e, msg) => {
        setMsgMenuTarget(msg);
        setMsgMenuAnchor(e.currentTarget);
    };

    const handlePin = async () => {
        const msg = msgMenuTarget;
        setMsgMenuAnchor(null);
        if (!msg) return;
        const willPin = !msg.isPinned;
        const gid = activeId;
        try {
            if (willPin) {
                const others = (messages[gid] || []).filter((m) => m.isPinned && m.id !== msg.id);
                for (const o of others) {
                    await axios.put(pinmessage, { rollNumber, userType, messageId: o.id, pin: false }, { headers: { Authorization: `Bearer ${token}` } });
                }
            }
            await axios.put(pinmessage, { rollNumber, userType, messageId: msg.id, pin: willPin }, { headers: { Authorization: `Bearer ${token}` } });
            loadMessages(gid, false);
        } catch (e) {
            console.log(e);
        }
    };

    const unpinAll = async () => {
        setPinMenuPos(null);
        const gid = activeId;
        const pinned = (messages[gid] || []).filter((m) => m.isPinned);
        try {
            for (const o of pinned) {
                await axios.put(pinmessage, { rollNumber, userType, messageId: o.id, pin: false }, { headers: { Authorization: `Bearer ${token}` } });
            }
            loadMessages(gid, false);
        } catch (e) {
            console.log(e);
        }
    };

    const scrollToMessage = (id) => {
        const el = document.getElementById(`msg-${id}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightMsgId(id);
            setTimeout(() => setHighlightMsgId(null), 1600);
        }
    };

    const toPngBlob = (blob) =>
        new Promise((resolve, reject) => {
            if (blob.type === 'image/png') return resolve(blob);
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.getContext('2d').drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
            };
            img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
            img.src = url;
        });

    const handleCopy = async () => {
        const m = msgMenuTarget;
        setMsgMenuAnchor(null);
        if (!m) return;
        if (m.type === 'image') {
            try {
                if (!navigator.clipboard?.write || !window.ClipboardItem) {
                    throw new Error('Clipboard image API not supported');
                }
                const pngBlob = (async () => {
                    const res = await fetch(m.fileUrl, { mode: 'cors' });
                    if (!res.ok) throw new Error('Image fetch failed');
                    return toPngBlob(await res.blob());
                })();
                await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': pngBlob })]);
                showSnack('Image copied', 'success');
            } catch (e) {
                console.log(e);
                if (m.caption) {
                    try {
                        await navigator.clipboard.writeText(m.caption);
                        showSnack('Caption copied', 'info');
                        return;
                    } catch {}
                }
                showSnack('Could not copy this image', 'error');
            }
            return;
        }
        const ok = await copyTextToClipboard(m.text || m.caption || '');
        if (ok) showCopied();
        else showSnack('Could not copy', 'error');
    };

    const handleDeleteMessage = async () => {
        const msg = msgMenuTarget;
        setMsgMenuAnchor(null);
        if (!msg) return;
        try {
            await axios.put(
                deletemessage,
                { rollNumber, userType, messageId: msg.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadMessages(activeId, false);
            loadGroups();
        } catch (e) {
            console.log(e);
        }
    };

    const parseSentOn = (s) => {
        const parts = String(s || '').split(' ');
        if (parts.length < 2) return null;
        const [dd, mm, yyyy] = parts[0].split('-').map(Number);
        const [hh, mi] = parts[1].split(':').map(Number);
        if (!yyyy) return null;
        return new Date(yyyy, (mm || 1) - 1, dd || 1, hh || 0, mi || 0);
    };

    const canEditMsg = (m) => {
        if (!m || m.sender !== 'me' || m.type !== 'text' || m.isDeleted) return false;
        const dt = parseSentOn(m.sentOn);
        if (!dt) return true;
        return Date.now() - dt.getTime() < 15 * 60 * 1000;
    };

    const startEditMessage = () => {
        const msg = msgMenuTarget;
        setMsgMenuAnchor(null);
        if (!msg) return;
        setEditingMsgId(msg.id);
        setDraft(msg.text || '');
        setShowEmoji(false);
    };

    const cancelEdit = () => {
        setEditingMsgId(null);
        setDraft('');
    };

    const replyPreviewText = (m) => {
        if (m.text) return m.text;
        if (m.type === 'image') return 'Photo';
        if (m.type === 'file') return m.fileName || 'File';
        if (m.type === 'audio') return 'Voice message';
        return '';
    };

    const startReply = (m) => {
        if (!m || m.isDeleted || activeChat?.hasLeft) return;
        setMsgMenuAnchor(null);
        setReplyTo({ id: m.id, name: m.sender === 'me' ? 'You' : m.senderName, text: replyPreviewText(m) });
    };

    const cancelReply = () => setReplyTo(null);

    const openForward = (m) => {
        setMsgMenuAnchor(null);
        if (!m || m.isDeleted) return;
        setForwardMsg(m);
        setForwardSelected([]);
        setForwardSearch('');
    };

    const closeForward = () => {
        setForwardMsg(null);
        setForwardSelected([]);
        setForwardSearch('');
    };

    const toggleForward = (id) =>
        setForwardSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

    const forwardToGroups = async () => {
        if (!forwardMsg || forwardSelected.length === 0 || forwardSending) return;
        setForwardSending(true);
        const m = forwardMsg;
        const targets = [...forwardSelected];
        try {
            for (const gid of targets) {
                const form = new FormData();
                form.append('rollNumber', rollNumber);
                form.append('userType', userType);
                form.append('groupId', gid);
                form.append('messageText', m.text || m.caption || '');
                if (m.type !== 'text' && m.fileUrl) {
                    form.append('filepath', m.fileUrl);
                    form.append('filename', m.fileName || '');
                    form.append('filetype', m.type);
                    form.append('forwardMessageId', m.id);
                }
                await axios.post(sendmessage, form, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
                });
            }
            if (!socketLive()) {
                loadGroups();
                if (targets.includes(activeIdRef.current)) loadMessages(activeIdRef.current, false);
            }
            showSnack(`Forwarded to ${targets.length} chat${targets.length > 1 ? 's' : ''}`, 'success');
            closeForward();
        } catch (e) {
            console.log(e);
            showSnack('Could not forward the message', 'error');
        } finally {
            setForwardSending(false);
        }
    };

    const onMsgPointerDown = (e, m) => {
        swipeStartXRef.current = e.clientX;
        swipeElRef.current = e.currentTarget;
        swipeMsgRef.current = m;
    };

    const onMsgPointerMove = (e) => {
        if (!swipeElRef.current) return;
        const dx = e.clientX - swipeStartXRef.current;
        if (dx > 0) swipeElRef.current.style.transform = `translateX(${Math.min(dx, 80)}px)`;
    };

    const onMsgPointerUp = (e) => {
        const el = swipeElRef.current;
        if (!el) return;
        const dx = e.clientX - swipeStartXRef.current;
        el.style.transition = 'transform 0.15s ease';
        el.style.transform = 'translateX(0)';
        setTimeout(() => { if (el) el.style.transition = ''; }, 160);
        if (dx > 55) startReply(swipeMsgRef.current);
        swipeElRef.current = null;
        swipeMsgRef.current = null;
    };

    const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

    const myReactionOf = (m) => {
        const r = (m?.reactions || []).find((x) => (x.rollNumbers || []).includes(rollNumber));
        return r ? r.emoji : null;
    };

    const openReactPicker = (e, m) => {
        e.stopPropagation();
        setReactTarget(m);
        setReactMoreOpen(false);
        setReactAnchor(e.currentTarget);
    };

    const reactToMessage = async (emoji, targetArg) => {
        const target = targetArg || reactTarget;
        setReactAnchor(null);
        setReactInfoAnchor(null);
        setReactMoreOpen(false);
        setMsgMenuAnchor(null);
        if (!target) return;
        const finalEmoji = emoji && myReactionOf(target) === emoji ? '' : emoji;
        try {
            await axios.put(
                reactmessage,
                { rollNumber, userType, messageId: target.id, emoji: finalEmoji },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadMessages(activeId, false);
        } catch (e) {
            console.log(e);
        }
    };

    const groupReactions = (reactions) => {
        if (!Array.isArray(reactions)) return [];
        return reactions
            .filter((r) => r && r.emoji)
            .map((r) => ({ emoji: r.emoji, count: r.count || (r.rollNumbers ? r.rollNumbers.length : 1), rollNumbers: r.rollNumbers || [] }));
    };

    const nameForRoll = (roll) => {
        const mem = (activeGroupInfo?.members || []).find((x) => x.rollNumber === roll);
        if (mem) return mem.name;
        const cached = staffCacheRef.current[roll];
        if (cached) return cached.name;
        return roll;
    };

    const openReactInfo = (e, m) => {
        e.stopPropagation();
        const list = [];
        groupReactions(m.reactions).forEach((r) => {
            (r.rollNumbers || []).forEach((roll) => list.push({ roll, emoji: r.emoji, name: nameForRoll(roll), isMe: roll === rollNumber }));
        });
        setReactInfoList(list);
        setReactInfoMsg(m);
        setReactInfoAnchor(e.currentTarget);
    };

    const openMessageInfo = async () => {
        const m = msgMenuTarget;
        setMsgMenuAnchor(null);
        if (!m) return;
        setInfoMsg(m);
        setInfoData(null);
        setInfoLoading(true);
        try {
            const res = await axios.get(messagereadinfo, {
                params: { messageId: m.id, rollNumber, userType },
                headers: { Authorization: `Bearer ${token}` },
            });
            setInfoData(res.data?.data || null);
        } catch (e) {
            console.log(e);
        } finally {
            setInfoLoading(false);
        }
    };

    const jumpToMessage = async (id) => {
        const gid = activeIdRef.current;
        if (!gid || !id) return;
        const loaded = (messagesRef.current[gid] || []).some((m) => m.id === id);
        if (loaded) {
            scrollToMessage(id);
            return;
        }
        setLoadingMessages(true);
        try {
            const [olderRes, newerRes] = await Promise.all([
                axios.get(fetchmessages, {
                    params: { groupId: gid, rollNumber, userType, before: id + 1, pageSize: 25 },
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(fetchmessages, {
                    params: { groupId: gid, rollNumber, userType, after: id, pageSize: 25 },
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            const older = (olderRes.data?.messages || []).map(mapMessage);
            const newer = (newerRes.data?.messages || []).map(mapMessage);
            const seen = new Set();
            const merged = [...older, ...newer]
                .filter((m) => (seen.has(m.id) ? false : seen.add(m.id)))
                .sort((a, b) => a.id - b.id);
            setMessages((prev) => ({ ...prev, [gid]: merged }));
            setHasMore(Boolean(olderRes.data?.hasMore));
            setHasMoreNewer(Boolean(newerRes.data?.hasMore));
            jumpRef.current = id;
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingMessages(false);
        }
    };

    const loadMoreMatches = async () => {
        const q = searchQuery.trim();
        const oldest = searchResults[searchResults.length - 1];
        if (!q || !activeId || !oldest || searchLoadingMore || !searchHasMore) return searchResults;
        setSearchLoadingMore(true);
        try {
            const res = await axios.get(searchmessages, {
                params: { groupId: activeId, rollNumber, userType, query: q, before: oldest.id, pageSize: 30 },
                headers: { Authorization: `Bearer ${token}` },
            });
            const more = (res.data?.messages || [])
                .filter((m) => m.messageType !== 'system')
                .map(mapMessage)
                .sort((a, b) => b.id - a.id);
            const existing = new Set(searchResults.map((m) => m.id));
            const combined = [...searchResults, ...more.filter((m) => !existing.has(m.id))];
            setSearchResults(combined);
            setSearchHasMore(Boolean(res.data?.hasMore));
            return combined;
        } catch (e) {
            console.log(e);
            return searchResults;
        } finally {
            setSearchLoadingMore(false);
        }
    };

    const gotoMatch = async (idx) => {
        if (idx < 0) return;
        let list = searchResults;
        if (idx >= list.length) {
            if (!searchHasMore || searchLoadingMore) return;
            list = await loadMoreMatches();
        }
        if (idx >= list.length) return;
        setSearchIndex(idx);
        jumpToMessage(list[idx].id);
    };

    const runSearch = async (q) => {
        if (!activeId || !q.trim()) {
            setSearchResults([]);
            setSearchIndex(-1);
            setSearchHasMore(false);
            return;
        }
        setSearchLoading(true);
        try {
            const res = await axios.get(searchmessages, {
                params: { groupId: activeId, rollNumber, userType, query: q.trim(), pageSize: 30 },
                headers: { Authorization: `Bearer ${token}` },
            });
            const list = (res.data?.messages || [])
                .filter((m) => m.messageType !== 'system')
                .map(mapMessage)
                .sort((a, b) => b.id - a.id);
            setSearchResults(list);
            setSearchHasMore(Boolean(res.data?.hasMore));
            setSearchIndex(list.length ? 0 : -1);
            if (list.length) jumpToMessage(list[0].id);
        } catch (e) {
            console.log(e);
        } finally {
            setSearchLoading(false);
        }
    };

    const openSearch = () => {
        setGroupMenuAnchor(null);
        setSearchQuery('');
        setSearchResults([]);
        setSearchIndex(-1);
        setSearchHasMore(false);
        setSearchOpen(true);
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        setSearchIndex(-1);
        setSearchHasMore(false);
    };

    const saveEdit = async () => {
        if (!draft.trim() || !editingMsgId) return;
        const text = draft.trim();
        const msgId = editingMsgId;
        cancelEdit();
        try {
            await axios.put(
                editmessage,
                { rollNumber, userType, messageId: msgId, messageText: text },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadMessages(activeId, false);
            loadGroups();
        } catch (e) {
            console.log(e);
            alert('Could not edit the message (the 15-minute window may have passed).');
        }
    };

    const clearChatById = async (groupId) => {
        if (!groupId) return;
        try {
            await axios.put(clearchat, { rollNumber, userType, groupId }, { headers: { Authorization: `Bearer ${token}` } });
            setMessages((prev) => ({ ...prev, [groupId]: [] }));
            setConversations((prev) => prev.map((c) => (c.id === groupId ? { ...c, lastMessage: '', time: '', ts: 0, lastId: 0, unread: 0 } : c)));
            showSnack('Chat cleared', 'success');
        } catch (e) {
            showSnack(e.response?.data?.message || 'Could not clear the chat', 'error');
        }
    };

    const leaveGroupById = async (groupId) => {
        if (!groupId) return;
        try {
            await axios.put(leavegroup, { rollNumber, userType, groupId }, { headers: { Authorization: `Bearer ${token}` } });
            setConversations((prev) => prev.map((c) => (c.id === groupId ? { ...c, hasLeft: true, iconPath: null } : c)));
            setInfoOpen(false);
            showSnack('You left the group', 'success');
        } catch (e) {
            showSnack(e.response?.data?.message || 'Could not leave the group', 'error');
        }
    };

    const deleteGroupById = async (groupId) => {
        if (!groupId) return;
        try {
            await axios.put(deletegroup, { rollNumber, userType, groupId }, { headers: { Authorization: `Bearer ${token}` } });
            setConversations((prev) => prev.filter((c) => c.id !== groupId));
            if (activeIdRef.current === groupId) {
                setActiveId(null);
                setInfoOpen(false);
            }
            showSnack('Group deleted', 'success');
        } catch (e) {
            showSnack(e.response?.data?.message || 'Could not delete the group', 'error');
        }
    };

    const handleClearChat = () => { setGroupMenuAnchor(null); clearChatById(activeId); };

    const openMemberMenu = (e, member) => {
        e.stopPropagation();
        setMemberMenuTarget(member);
        setMemberMenuAnchor(e.currentTarget);
    };

    const handleGroupInfoIcon = async (e) => {
        const f = e.target.files?.[0];
        e.target.value = '';
        if (!f || !activeId) return;
        if (classifyFile(f.name).category !== 'image') {
            showSnack('Please choose an image file (JPG, PNG, GIF, etc.).', 'error');
            return;
        }
        if (f.size > MAX_FILE_SIZE) {
            showSnack(`Image is ${formatFileSize(f.size)}. Maximum allowed size is ${MAX_FILE_MB}MB.`, 'error');
            return;
        }
        try {
            const form = new FormData();
            form.append('rollNumber', rollNumber);
            form.append('userType', userType);
            form.append('groupId', activeId);
            form.append('name', activeChat?.name || '');
            form.append('description', activeGroupInfo?.description || '');
            form.append('iconFile', f);
            await axios.put(updategroup, form, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            loadGroups();
            loadGroupInfo(activeId);
        } catch (err) {
            console.log(err);
        }
    };

    const handleRoleChange = async (role) => {
        const member = memberMenuTarget;
        setMemberMenuAnchor(null);
        if (!member || !activeId) return;
        if (isCreatorMember(member)) {
            showSnack("The group creator's admin role can't be changed", 'error');
            return;
        }
        try {
            await axios.put(
                updatememberrole,
                { rollNumber, userType, groupId: activeId, targetRollNumber: member.rollNumber, role },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadGroupInfo(activeId);
        } catch (e) {
            showSnack(e.response?.data?.message || 'Could not update the role', 'error');
        }
    };

    const removeMember = async (member) => {
        setMemberMenuAnchor(null);
        if (!member || !activeId) return;
        if (member.rollNumber === rollNumber) {
            showSnack("You can't remove yourself; use Leave group instead", 'error');
            return;
        }
        if (isCreatorMember(member)) {
            showSnack("The group creator can't be removed", 'error');
            return;
        }
        try {
            await axios.put(
                updategroupmembers,
                { rollNumber, userType, groupId: activeId, add: '', remove: member.rollNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadGroupInfo(activeId);
            loadGroups();
            showSnack(`${firstName(member.name)} removed from the group`, 'success');
        } catch (e) {
            showSnack(e.response?.data?.message || 'Could not remove the member', 'error');
        }
    };

    const openEditGroup = () => {
        setGroupMenuAnchor(null);
        setInfoOpen(false);
        setEditName(activeChat?.name || '');
        setEditDesc(activeGroupInfo?.description || '');
        setEditOpen(true);
    };

    const saveGroupEdit = async () => {
        try {
            const form = new FormData();
            form.append('rollNumber', rollNumber);
            form.append('userType', userType);
            form.append('groupId', activeId);
            form.append('name', editName.trim());
            form.append('description', editDesc.trim());
            await axios.put(updategroup, form, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            setEditOpen(false);
            loadGroups();
            loadGroupInfo(activeId);
        } catch (e) {
            console.log(e);
        }
    };

    const startEditName = () => {
        setEditName(activeChat?.name || '');
        setEditDesc(activeGroupInfo?.description || '');
        setEditingDesc(false);
        setEditingName(true);
    };

    const startEditDesc = () => {
        setEditName(activeChat?.name || '');
        setEditDesc(activeGroupInfo?.description || '');
        setEditingName(false);
        setEditingDesc(true);
    };

    const saveGroupInline = async () => {
        try {
            const form = new FormData();
            form.append('rollNumber', rollNumber);
            form.append('userType', userType);
            form.append('groupId', activeId);
            form.append('name', editName.trim());
            form.append('description', editDesc.trim());
            await axios.put(updategroup, form, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            setEditingName(false);
            setEditingDesc(false);
            loadGroups();
            loadGroupInfo(activeId);
        } catch (e) {
            console.log(e);
        }
    };

    const muteGroupById = async (groupId, muteHours) => {
        if (!groupId) return;
        try {
            await axios.put(
                mutegroup,
                { rollNumber, userType, groupId, muteHours },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadGroups();
        } catch (e) {
            console.log(e);
        }
    };

    const handleMute = (muteHours) => {
        setGroupMenuAnchor(null);
        setHeaderMuteSubAnchor(null);
        muteGroupById(activeId, muteHours);
    };

    const openListMenu = (e, group) => {
        e.stopPropagation();
        setListMenuGroup(group);
        setListMenuAnchor(e.currentTarget);
    };

    const closeListMenu = () => {
        setListMenuAnchor(null);
        setMuteSubAnchor(null);
    };

    const chooseMute = (hours) => {
        const g = listMenuGroup;
        closeListMenu();
        muteGroupById(g?.id, hours);
    };

    const openManage = () => {
        setGroupMenuAnchor(null);
        setInfoOpen(false);
        setManageSearch('');
        setManageAdd([]);
        setManageRemove([]);
        setManageOpen(true);
    };

    const toggleAdd = (id) => setManageAdd((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    const toggleRemove = (id) => setManageRemove((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

    const saveMembers = async () => {
        if (!manageAdd.length && !manageRemove.length) { setManageOpen(false); return; }
        setSavingMembers(true);
        try {
            await axios.put(
                updategroupmembers,
                { rollNumber, userType, groupId: activeId, add: manageAdd.join(','), remove: manageRemove.join(',') },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setManageOpen(false);
            loadGroupInfo(activeId);
            loadGroups();
            showSnack('Members updated', 'success');
        } catch (e) {
            showSnack(e.response?.data?.message || 'Could not update members', 'error');
        } finally {
            setSavingMembers(false);
        }
    };

    const isGroupAdmin = activeChat?.myRole === 'admin' || activeGroupInfo?.myRole === 'admin';
    const activeLeft = !!activeChat?.hasLeft;
    const creatorRoll = activeGroupInfo?.createdByRollNumber || (activeGroupInfo?.members || []).find((m) => m.isCreator)?.rollNumber || null;
    const isCreatorMember = (mem) => mem?.isCreator === true || (!!creatorRoll && mem?.rollNumber === creatorRoll);
    const isGroupCreator = activeChat?.isCreator === true || activeGroupInfo?.isCreator === true || (!!creatorRoll && creatorRoll === rollNumber);
    const pinnedMessages = activeMessages.filter((m) => m.isPinned && !m.isDeleted);
    const activeMembers = activeGroupInfo?.members || [];
    const onlineCount = activeMembers.filter((m) => m.isOnline || onlineRolls.has(m.rollNumber)).length;
    const isSeenByAll = (m) => typeof m.id === 'number' && readByAllUpTo >= m.id;

    const deletedLabel = (m) => {
        const by = m.deletedByName;
        const deletedByOther = by && m.deletedByRollNumber && m.deletedByRollNumber !== m.senderRollNumber;
        if (deletedByOther) {
            const adminTag = m.deletedByRole === 'admin' ? ' (admin)' : '';
            return m.senderRollNumber === rollNumber
                ? `Your message was deleted by ${by}${adminTag}`
                : `This message was deleted by ${by}${adminTag}`;
        }
        return 'This message was deleted';
    };

    const systemIcon = (type) => {
        const sx = { fontSize: 13, color: '#7a6a3a', flexShrink: 0 };
        switch (type) {
            case 'member_added': return <PersonAddAlt1RoundedIcon sx={sx} />;
            case 'member_removed': return <PersonRemoveRoundedIcon sx={sx} />;
            case 'member_left': return <LogoutRoundedIcon sx={sx} />;
            case 'message_pinned': return <PushPinRoundedIcon sx={sx} />;
            case 'message_unpinned': return <PushPinOutlinedIcon sx={sx} />;
            default: return <InfoOutlinedIcon sx={sx} />;
        }
    };

    return (
        <Box className="chat-emoji" sx={{ minHeight: embedded ? 'auto' : '100vh', backgroundColor: '#F6F6F8' }}>
            {!embedded && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1201 }}>
                    <DashbrdHeader />
                </Box>
            )}

            <Box sx={{ pt: embedded ? 0 : '60px' }}>
                <Box
                    sx={{
                        m: embedded ? 0 : { xs: 1, md: 2 },
                        border: embedded ? 'none' : '1px solid #e6e6ea',
                        borderRadius: embedded ? 0 : '20px',
                        overflow: 'hidden',
                        height: embedded ? 'calc(100vh - 60px)' : 'calc(100vh - 92px)',
                        display: 'flex',
                        backgroundColor: '#fff',
                    }}
                >
                    <Box
                        sx={{
                            width: { xs: '100%', sm: '220px', md: '240px', lg: '260px' },
                            flexShrink: 0,
                            display: { xs: activeChat ? 'none' : 'flex', sm: 'flex' },
                            flexDirection: 'column',
                            borderRight: '1px solid #eee',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, pt: 1.5, pb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
                                <Tooltip title="Back" arrow>
                                    <IconButton
                                        size="small"
                                        onClick={() => navigate(-1)}
                                        sx={{ width: 30, height: 30, backgroundColor: ACCENT_SOFT, '&:hover': { backgroundColor: ACCENT_SOFT_HOVER } }}
                                    >
                                        <ArrowBackIcon sx={{ color: ACCENT, fontSize: '17px' }} />
                                    </IconButton>
                                </Tooltip>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: '17px', fontWeight: '700', lineHeight: 1.15, color: DARK_TEXT }}>Chats</Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#888', lineHeight: 1.3 }}>Staff Messages</Typography>
                                </Box>
                            </Box>

                            {canCreateGroup && (
                            <Tooltip title="Options" arrow>
                                <IconButton
                                    ref={menuButtonRef}
                                    size="small"
                                    onClick={(e) => setMenuAnchor(e.currentTarget)}
                                    sx={{ width: 30, height: 30, backgroundColor: '#F4F4F6', '&:hover': { backgroundColor: '#ececf2' } }}
                                >
                                    <MoreVertIcon sx={{ color: '#555', fontSize: '18px' }} />
                                </IconButton>
                            </Tooltip>
                            )}

                            <Menu
                                anchorEl={menuAnchor}
                                open={Boolean(menuAnchor)}
                                onClose={() => setMenuAnchor(null)}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                slotProps={{
                                    paper: {
                                        sx: {
                                            mt: 1,
                                            minWidth: 220,
                                            borderRadius: '10px',
                                            border: '1px solid #ECECF1',
                                            boxShadow: '0 8px 28px rgba(16,24,40,0.14)',
                                            overflow: 'hidden',
                                        },
                                    },
                                    list: { sx: { py: 1 } },
                                }}
                            >
                                <MenuItem
                                    onClick={openGroupPopover}
                                    sx={{
                                        px: 2,
                                        py: 1.1,
                                        gap: 1.6,
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: DARK_TEXT,
                                        '&:hover': { backgroundColor: '#F6F6F8' },
                                    }}
                                >
                                    <GroupAddRoundedIcon sx={{ fontSize: 20, color: '#555' }} />
                                    New group
                                </MenuItem>
                            </Menu>
                        </Box>

                        <Box sx={{ px: 1.5, pb: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search chats..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ fontSize: '17px', color: '#999' }} />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: '50px', backgroundColor: '#F4F4F6', fontSize: '13px', height: 36 },
                                    },
                                }}
                            />
                        </Box>

                        <Divider />

                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            {loadingGroups && conversations.length === 0 ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                                    <CircularProgress size={28} sx={{ color: ACCENT }} />
                                </Box>
                            ) : (
                              <>
                            {filtered.length === 0 && (
                                <Typography sx={{ fontSize: '13px', color: '#999', textAlign: 'center', py: 4 }}>
                                    No chats yet
                                </Typography>
                            )}
                            {filtered.map((c) => {
                                const isActive = c.id === activeId;
                                return (
                                    <Box
                                        key={c.id}
                                        onClick={() => setActiveId(c.id)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.1,
                                            px: 1.5,
                                            py: 0.9,
                                            cursor: 'pointer',
                                            position: 'relative',
                                            borderLeft: isActive ? `3px solid ${ACCENT}` : '3px solid transparent',
                                            borderBottom: '1px solid #f3f3f5',
                                            backgroundColor: isActive ? ACCENT_SOFT : 'transparent',
                                            transition: '0.2s',
                                            '&:hover': { backgroundColor: isActive ? ACCENT_SOFT : '#FAFAFA' },
                                            '&:hover .chatMore': { opacity: 1 },
                                            '&:hover .chatTime': { opacity: 0 },
                                        }}
                                    >
                                        <IconButton
                                            className="chatMore"
                                            size="small"
                                            onClick={(e) => openListMenu(e, c)}
                                            sx={{ position: 'absolute', top: 6, right: 6, p: 0.4, opacity: 0, transition: '0.2s', zIndex: 3, backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', '&:hover': { backgroundColor: '#f2f2f2' } }}
                                        >
                                            <MoreVertIcon sx={{ fontSize: 18, color: '#444' }} />
                                        </IconButton>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            variant="dot"
                                            invisible={c.isGroup}
                                            sx={{
                                                '& .MuiBadge-dot': {
                                                    backgroundColor: c.online ? '#43C57E' : '#bbb',
                                                    border: '2px solid #fff',
                                                    width: 9,
                                                    height: 9,
                                                    borderRadius: '50%',
                                                },
                                            }}
                                        >
                                            <Avatar src={c.iconPath || undefined} sx={{ bgcolor: c.color, width: 40, height: 40, fontSize: '14px', fontWeight: 600 }}>
                                                {c.isGroup ? <GroupsRoundedIcon sx={{ fontSize: 19 }} /> : c.avatar}
                                            </Avatar>
                                        </Badge>

                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: DARK_TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pr: 0.8 }}>
                                                    {c.name}
                                                </Typography>
                                                <Typography
                                                    className="chatTime"
                                                    sx={{ fontSize: '10.5px', fontWeight: c.unread > 0 ? 700 : 400, color: c.unread > 0 ? ACCENT : '#999', flexShrink: 0, transition: '0.2s', pointerEvents: 'none' }}
                                                >
                                                    {c.time}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.2, gap: 0.8 }}>
                                                <Typography sx={{ fontSize: '13px', color: '#8a8a8a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexGrow: 1 }}>
                                                    {c.lastMessage}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                                                    {c.isMuted && <NotificationsOffRoundedIcon sx={{ fontSize: 14, color: '#bbb' }} />}
                                                    {c.unread > 0 && (
                                                        <Box
                                                            sx={{
                                                                minWidth: 17,
                                                                height: 17,
                                                                px: 0.6,
                                                                borderRadius: '9px',
                                                                backgroundColor: ACCENT_FILL,
                                                                color: DARK_TEXT,
                                                                fontSize: '10px',
                                                                fontWeight: 700,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            {c.unread > 99 ? '99+' : c.unread}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })}
                              </>
                            )}
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            flexGrow: 1,
                            position: 'relative',
                            display: { xs: activeChat ? 'flex' : 'none', sm: 'flex' },
                            flexDirection: 'column',
                            backgroundColor: '#F6F6F8',
                        }}
                    >
                        {activeChat ? (
                            <>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        px: 2,
                                        py: 1.2,
                                        backgroundColor: '#fff',
                                        borderBottom: '1px solid #eee',
                                    }}
                                >
                                    <Box
                                        onClick={() => { if (!activeLeft) setInfoOpen(true); }}
                                        sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1.5, cursor: activeLeft ? 'default' : 'pointer', borderRadius: '8px', p: 0.5, ml: -0.5, '&:hover': { backgroundColor: activeLeft ? 'transparent' : '#F6F6F8' } }}
                                    >
                                        <Avatar src={activeChat.iconPath || undefined} sx={{ bgcolor: activeChat.color, width: 42, height: 42, fontSize: '14px', fontWeight: 600 }}>
                                            {activeChat.isGroup ? <GroupsRoundedIcon sx={{ fontSize: 22 }} /> : activeChat.avatar}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                            <Box>
                                                <Typography sx={{ fontSize: '15px', fontWeight: '600', color: DARK_TEXT }}>{activeChat.name}</Typography>
                                                <Typography sx={{ fontSize: '12px', color: '#999' }} component="div">
                                                    {activeLeft ? (
                                                        'You are no longer a member'
                                                    ) : typingName ? (
                                                        <Box component="span" sx={{ color: '#43C57E', fontWeight: 700, fontStyle: 'italic' }}>
                                                            {typingName} is typing…
                                                        </Box>
                                                    ) : activeGroupInfo ? (
                                                        <>
                                                            {activeGroupInfo.memberCount} members
                                                            {onlineCount > 0 && (
                                                                <>
                                                                    {' · '}
                                                                    <Box component="span" sx={{ color: '#43C57E', fontWeight: 700 }}>
                                                                        {onlineCount} online
                                                                    </Box>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        activeChat.role
                                                    )}
                                                </Typography>
                                            </Box>
                                            {activeChat.isMuted && !activeLeft && <NotificationsOffRoundedIcon sx={{ fontSize: 16, color: '#aaa' }} />}
                                        </Box>
                                    </Box>
                                    {!activeLeft && (
                                        <>
                                            <Tooltip title="Search messages" arrow>
                                                <IconButton onClick={openSearch}>
                                                    <SearchIcon sx={{ color: '#888' }} />
                                                </IconButton>
                                            </Tooltip>
                                            <IconButton onClick={(e) => setGroupMenuAnchor(e.currentTarget)}>
                                                <MoreVertIcon sx={{ color: '#888' }} />
                                            </IconButton>
                                        </>
                                    )}

                                    <Menu
                                        anchorEl={groupMenuAnchor}
                                        open={Boolean(groupMenuAnchor)}
                                        onClose={() => setGroupMenuAnchor(null)}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        slotProps={menuSlot(210)}
                                    >
                                        {isGroupAdmin && (
                                            <MenuItem onClick={openEditGroup} onMouseEnter={() => setHeaderMuteSubAnchor(null)} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                                                <EditRoundedIcon sx={{ fontSize: 19, color: '#5a5a5a' }} /> Edit Group
                                            </MenuItem>
                                        )}
                                        {isGroupAdmin && (
                                            <MenuItem onClick={openManage} onMouseEnter={() => setHeaderMuteSubAnchor(null)} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                                                <PersonAddAlt1RoundedIcon sx={{ fontSize: 19, color: '#5a5a5a' }} /> Manage Members
                                            </MenuItem>
                                        )}
                                        {MUTE_ENABLED && (activeChat.isMuted ? (
                                            <MenuItem onClick={() => handleMute(0)} onMouseEnter={() => setHeaderMuteSubAnchor(null)} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                                                <NotificationsActiveRoundedIcon sx={{ fontSize: 19, color: '#5a5a5a' }} /> Unmute
                                            </MenuItem>
                                        ) : (
                                            <MenuItem
                                                onMouseEnter={(e) => setHeaderMuteSubAnchor(e.currentTarget)}
                                                sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT, justifyContent: 'space-between' }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                    <NotificationsOffRoundedIcon sx={{ fontSize: 19, color: '#5a5a5a' }} /> Mute notifications
                                                </Box>
                                                <ChevronRightRoundedIcon sx={{ fontSize: 18, color: '#999' }} />
                                            </MenuItem>
                                        ))}
                                        <Divider sx={{ my: 0.5 }} />
                                        <MenuItem onClick={handleClearChat} onMouseEnter={() => setHeaderMuteSubAnchor(null)} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                                            <DeleteSweepRoundedIcon sx={{ fontSize: 19, color: '#5a5a5a' }} /> Clear chat
                                        </MenuItem>
                                    </Menu>

                                    <Menu
                                        anchorEl={headerMuteSubAnchor}
                                        open={Boolean(headerMuteSubAnchor)}
                                        onClose={() => setHeaderMuteSubAnchor(null)}
                                        hideBackdrop
                                        disableAutoFocus
                                        disableEnforceFocus
                                        disableAutoFocusItem
                                        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        slotProps={{ root: { sx: { pointerEvents: 'none' } }, paper: { sx: { ...menuPaperSx, minWidth: 150, pointerEvents: 'auto' } }, list: { sx: menuListSx, onMouseLeave: () => setHeaderMuteSubAnchor(null) } }}
                                    >
                                        <MenuItem onClick={() => { setHeaderMuteSubAnchor(null); handleMute(8); }} sx={{ fontSize: '14px' }}>8 hours</MenuItem>
                                        <MenuItem onClick={() => { setHeaderMuteSubAnchor(null); handleMute(168); }} sx={{ fontSize: '14px' }}>1 week</MenuItem>
                                        <MenuItem onClick={() => { setHeaderMuteSubAnchor(null); handleMute(-1); }} sx={{ fontSize: '14px' }}>Always</MenuItem>
                                    </Menu>
                                </Box>

                                {pinnedMessages.length > 0 && (
                                    <Box
                                        onClick={() => scrollToMessage(pinnedMessages[pinnedMessages.length - 1].id)}
                                        onContextMenu={(e) => { e.preventDefault(); if (isGroupAdmin) setPinMenuPos({ top: e.clientY, left: e.clientX }); }}
                                        sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, backgroundColor: ACCENT_SOFT, borderBottom: `1px solid ${ACCENT}22`, cursor: 'pointer', '&:hover': { backgroundColor: ACCENT_SOFT_HOVER } }}
                                    >
                                        <PushPinRoundedIcon sx={{ fontSize: 16, color: ACCENT }} />
                                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: ACCENT }}>
                                                Pinned message
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {pinnedMessages[pinnedMessages.length - 1].text || pinnedMessages[pinnedMessages.length - 1].caption || pinnedMessages[pinnedMessages.length - 1].fileName || 'Attachment'}
                                            </Typography>
                                        </Box>
                                        {isGroupAdmin && (
                                            <Tooltip title="Unpin" arrow>
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); unpinAll(); }}>
                                                    <PushPinOutlinedIcon sx={{ fontSize: 16, color: ACCENT }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                )}

                                <Box
                                    ref={scrollRef}
                                    onScroll={handleMessagesScroll}
                                    sx={{
                                        flexGrow: 1,
                                        overflowY: 'auto',
                                        p: 2,
                                        backgroundColor: '#F6F6F8',
                                        backgroundImage: `linear-gradient(rgba(246,246,248,0.88), rgba(246,246,248,0.88)), url(${chatBg})`,
                                        backgroundRepeat: 'no-repeat, repeat',
                                        backgroundSize: 'auto, 300px',
                                    }}
                                >
                                    {loadingMore && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                                            <CircularProgress size={22} sx={{ color: ACCENT }} />
                                        </Box>
                                    )}
                                    {loadingMessages && activeMessages.length === 0 ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                            <CircularProgress size={28} sx={{ color: ACCENT }} />
                                        </Box>
                                    ) : !loadingMessages && activeMessages.length === 0 ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 1 }}>
                                            <ForumRoundedIcon sx={{ fontSize: 40, color: '#cfcfd6' }} />
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#9a9aa3' }}>No messages yet</Typography>
                                            <Typography sx={{ fontSize: '12px', color: '#b3b3bb' }}>Send a message to start the conversation</Typography>
                                        </Box>
                                    ) : (
                                      <>
                                    {activeMessages.map((m) => {
                                        const dividerEl = unreadDivider && m.id === unreadDivider.id ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
                                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: ACCENT, backgroundColor: ACCENT_SOFT, px: 1.8, py: 0.5, borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                                    {unreadDivider.count} unread message{unreadDivider.count > 1 ? 's' : ''}
                                                </Typography>
                                            </Box>
                                        ) : null;
                                        if (m.type === 'system') {
                                            return (
                                                <React.Fragment key={m.id}>
                                                    {dividerEl}
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                                                        <Box
                                                            sx={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: 0.6,
                                                                backgroundColor: ACCENT_SOFT,
                                                                px: 1.5,
                                                                py: 0.4,
                                                                borderRadius: '10px',
                                                                maxWidth: '85%',
                                                            }}
                                                        >
                                                            {systemIcon(m.systemEventType)}
                                                            <Typography sx={{ fontSize: '11px', color: '#7a6a3a', textAlign: 'center' }}>
                                                                {m.text}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </React.Fragment>
                                            );
                                        }
                                        const mine = m.sender === 'me';
                                        const reacts = groupReactions(m.reactions);
                                        const reactTotal = reacts.reduce((s, r) => s + r.count, 0);
                                        return (
                                            <React.Fragment key={m.id}>
                                            {dividerEl}
                                            <Box id={`msg-${m.id}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.3, justifyContent: mine ? 'flex-end' : 'flex-start', mb: reacts.length ? 2.4 : 1.2, borderRadius: '10px', pl: mine ? 0.5 : 2, pr: mine ? 2.5 : 0.5, transition: 'background-color 0.4s', backgroundColor: highlightMsgId === m.id ? `${ACCENT}33` : 'transparent', '&:hover .msgMore': { opacity: 1 } }}>
                                                {mine && !m.isDeleted && !activeLeft && (
                                                    <IconButton className="msgMore" size="small" onClick={(e) => openMsgMenu(e, m)} sx={{ opacity: 0, transition: '0.2s', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', '&:hover': { backgroundColor: '#f2f2f2' } }}>
                                                        <MoreVertIcon sx={{ fontSize: 17, color: '#444' }} />
                                                    </IconButton>
                                                )}
                                                {mine && !m.isDeleted && !activeLeft && (
                                                    <IconButton className="msgMore" size="small" onClick={(e) => openReactPicker(e, m)} sx={{ opacity: 0, transition: '0.2s', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', '&:hover': { backgroundColor: '#f2f2f2' } }}>
                                                        <AddReactionOutlinedIcon sx={{ fontSize: 17, color: ACCENT }} />
                                                    </IconButton>
                                                )}
                                                <Box
                                                    onDoubleClick={() => startReply(m)}
                                                    onPointerDown={(e) => onMsgPointerDown(e, m)}
                                                    onPointerMove={onMsgPointerMove}
                                                    onPointerUp={onMsgPointerUp}
                                                    onPointerLeave={onMsgPointerUp}
                                                    sx={{
                                                        maxWidth: '72%',
                                                        px: m.type === 'image' && !m.isDeleted ? 0.6 : 1.6,
                                                        py: m.type === 'image' && !m.isDeleted ? 0.6 : 1,
                                                        borderRadius: mine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                                                        backgroundColor: mine ? MINE : '#fff',
                                                        color: mine ? '#fff' : DARK_TEXT,
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                                        touchAction: 'pan-y',
                                                        position: 'relative',
                                                    }}
                                                >
                                                    {!mine && m.senderName && (
                                                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: nameColorFor(m.senderRollNumber || m.senderName), mb: 0.3, px: m.type === 'image' && !m.isDeleted ? 0.6 : 0 }}>
                                                            {m.senderName}
                                                            {m.senderRollNumber && (
                                                                <Box component="span" sx={{ fontWeight: 500, color: '#999' }}> · {m.senderRollNumber}</Box>
                                                            )}
                                                        </Typography>
                                                    )}

                                                    {m.replyToMessageId && !m.isDeleted && (
                                                        <Box
                                                            sx={{
                                                                borderLeft: `3px solid ${mine ? 'rgba(255,255,255,0.6)' : ACCENT}`,
                                                                backgroundColor: mine ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)',
                                                                borderRadius: '6px',
                                                                px: 1,
                                                                py: 0.5,
                                                                mb: 0.6,
                                                            }}
                                                        >
                                                            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: mine ? 'rgba(255,255,255,0.9)' : ACCENT }}>
                                                                {m.replyToSenderName}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '12px', color: mine ? 'rgba(255,255,255,0.75)' : '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 230 }}>
                                                                {m.replyToText}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {m.isDeleted && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                                            <BlockRoundedIcon sx={{ fontSize: 15, opacity: 0.6 }} />
                                                            <Typography sx={{ fontSize: '13px', lineHeight: 1.4, fontStyle: 'italic', opacity: 0.75 }}>
                                                                {deletedLabel(m)}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {!m.isDeleted && m.type === 'text' && (
                                                        <Typography sx={{ fontSize: '14px', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{linkify(m.text, mine)}</Typography>
                                                    )}

                                                    {!m.isDeleted && m.type === 'image' && (
                                                        <Box>
                                                            <img
                                                                src={m.fileUrl}
                                                                alt={m.fileName}
                                                                onClick={() => setViewerImage(m.fileUrl)}
                                                                style={{ maxWidth: '240px', borderRadius: '10px', display: 'block', cursor: 'pointer' }}
                                                            />
                                                            {m.caption && (
                                                                <Typography sx={{ fontSize: '14px', lineHeight: 1.4, px: 1, pt: 0.8, whiteSpace: 'pre-wrap' }}>
                                                                    {linkify(m.caption, mine)}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    )}

                                                    {!m.isDeleted && m.type === 'file' && (
                                                        <Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.3 }}>
                                                                <Box
                                                                    sx={{
                                                                        width: 38,
                                                                        height: 38,
                                                                        borderRadius: '8px',
                                                                        backgroundColor: mine ? 'rgba(255,255,255,0.18)' : ACCENT_SOFT,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                    }}
                                                                >
                                                                    <InsertDriveFileRoundedIcon sx={{ color: mine ? '#fff' : ACCENT, fontSize: 20 }} />
                                                                </Box>
                                                                <Box sx={{ minWidth: 0 }}>
                                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                                                                        {m.fileName}
                                                                    </Typography>
                                                                    {m.fileSize && <Typography sx={{ fontSize: '11px', opacity: 0.8 }}>{m.fileSize}</Typography>}
                                                                </Box>
                                                                <IconButton
                                                                    onClick={(e) => openDocMenu(e, m)}
                                                                    size="small"
                                                                    sx={{ color: mine ? '#fff' : ACCENT }}
                                                                >
                                                                    <DownloadRoundedIcon sx={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </Box>
                                                            {m.caption && (
                                                                <Typography sx={{ fontSize: '14px', lineHeight: 1.4, pt: 0.6, whiteSpace: 'pre-wrap' }}>
                                                                    {linkify(m.caption, mine)}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    )}

                                                    {!m.isDeleted && m.type === 'audio' && (
                                                        <AudioMessage src={m.fileUrl} mine={mine} accent={ACCENT} accentFill={ACCENT_FILL} />
                                                    )}

                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.4, mt: 0.3, px: m.type === 'image' ? 0.6 : 0 }}>
                                                        {m.isEdited && !m.isDeleted && (
                                                            <Typography sx={{ fontSize: '10px', fontStyle: 'italic', color: mine ? 'rgba(255,255,255,0.6)' : '#bbb' }}>edited</Typography>
                                                        )}
                                                        {m.isPinned && !m.isDeleted && <PushPinRoundedIcon sx={{ fontSize: 12, color: mine ? 'rgba(255,255,255,0.85)' : ACCENT }} />}
                                                        <Typography sx={{ fontSize: '10px', color: mine ? 'rgba(255,255,255,0.7)' : '#999' }}>{m.time}</Typography>
                                                        {mine && !m.isDeleted && (
                                                            m.pending ? (
                                                                <AccessTimeRoundedIcon sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }} />
                                                            ) : (
                                                                <DoneAllIcon sx={{ fontSize: '14px', color: isSeenByAll(m) ? ACCENT_FILL : 'rgba(255,255,255,0.55)' }} />
                                                            )
                                                        )}
                                                    </Box>

                                                    {!m.isDeleted && reacts.length > 0 && (
                                                        <Box
                                                            onClick={(e) => openReactInfo(e, m)}
                                                            sx={{
                                                                position: 'absolute',
                                                                bottom: '-13px',
                                                                [mine ? 'right' : 'left']: 8,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.2,
                                                                height: 22,
                                                                px: 0.6,
                                                                backgroundColor: '#fff',
                                                                border: '1px solid #ececf1',
                                                                borderRadius: '12px',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                                                                cursor: 'pointer',
                                                                zIndex: 1,
                                                            }}
                                                        >
                                                            {reacts.map((r) => (
                                                                <Box component="span" key={r.emoji} sx={{ fontSize: '13px', fontFamily: "'Noto Color Emoji', sans-serif", lineHeight: 1 }}>
                                                                    {r.emoji}
                                                                </Box>
                                                            ))}
                                                            {reactTotal > 1 && (
                                                                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#666', ml: 0.2 }}>{reactTotal}</Typography>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                                {!mine && !m.isDeleted && !activeLeft && (
                                                    <IconButton className="msgMore" size="small" onClick={(e) => openReactPicker(e, m)} sx={{ opacity: 0, transition: '0.2s', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', '&:hover': { backgroundColor: '#f2f2f2' } }}>
                                                        <AddReactionOutlinedIcon sx={{ fontSize: 17, color: ACCENT }} />
                                                    </IconButton>
                                                )}
                                                {!mine && !m.isDeleted && !activeLeft && (
                                                    <IconButton className="msgMore" size="small" onClick={(e) => openMsgMenu(e, m)} sx={{ opacity: 0, transition: '0.2s', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', '&:hover': { backgroundColor: '#f2f2f2' } }}>
                                                        <MoreVertIcon sx={{ fontSize: 17, color: '#444' }} />
                                                    </IconButton>
                                                )}
                                            </Box>
                                            </React.Fragment>
                                        );
                                    })}
                                      </>
                                    )}
                                </Box>

                                {activeLeft ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', px: 2, py: 2.5, backgroundColor: '#fff', borderTop: '1px solid #eee' }}>
                                        <Typography sx={{ fontSize: '13px', color: '#777', backgroundColor: '#F0F0F2', px: 2, py: 1, borderRadius: '20px', textAlign: 'center' }}>
                                            You're no longer a member of this group
                                        </Typography>
                                    </Box>
                                ) : (
                                  <>
                                {editingMsgId && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, backgroundColor: ACCENT_SOFT, borderTop: `1px solid ${ACCENT}22` }}>
                                        <EditOutlinedIcon sx={{ fontSize: 18, color: ACCENT }} />
                                        <Typography sx={{ flexGrow: 1, fontSize: '12px', fontWeight: 700, color: ACCENT }}>Editing message</Typography>
                                        <IconButton size="small" onClick={cancelEdit}>
                                            <CloseIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Box>
                                )}

                                {replyTo && !editingMsgId && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, backgroundColor: '#fff', borderTop: '1px solid #eee' }}>
                                        <Box sx={{ width: 3, alignSelf: 'stretch', borderRadius: '3px', backgroundColor: ACCENT }} />
                                        <ReplyRoundedIcon sx={{ fontSize: 18, color: ACCENT }} />
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: ACCENT }}>
                                                Replying to {replyTo.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {replyTo.text}
                                            </Typography>
                                        </Box>
                                        <IconButton size="small" onClick={cancelReply}>
                                            <CloseIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Box>
                                )}

                                {isRecording ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            p: 1.5,
                                            backgroundColor: '#fff',
                                            borderTop: '1px solid #eee',
                                        }}
                                    >
                                        <Tooltip title="Cancel" arrow>
                                            <IconButton onClick={() => stopRecording(true)} sx={{ color: '#f44336' }}>
                                                <DeleteOutlineRoundedIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.2,
                                                flexGrow: 1,
                                                px: 1.5,
                                                py: 0.8,
                                                borderRadius: '24px',
                                                backgroundColor: '#FDECEC',
                                            }}
                                        >
                                            <MicRoundedIcon
                                                sx={{
                                                    fontSize: 20,
                                                    color: '#f44336',
                                                    animation: 'recPulse 1.2s ease-in-out infinite',
                                                    '@keyframes recPulse': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.4, transform: 'scale(0.85)' } },
                                                }}
                                            />
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#f44336', minWidth: 52 }}>
                                                {formatTime(recordSeconds)}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', flexGrow: 1 }}>
                                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                                    <Box
                                                        key={i}
                                                        sx={{
                                                            width: 3,
                                                            borderRadius: 2,
                                                            backgroundColor: '#f4433688',
                                                            animation: `recWave 1s ease-in-out ${i * 0.1}s infinite`,
                                                            '@keyframes recWave': { '0%,100%': { height: 6 }, '50%': { height: 18 } },
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>

                                        <Tooltip title="Send recording" arrow>
                                            <IconButton onClick={() => stopRecording(false)} sx={fillBtnSx}>
                                                <SendIcon sx={{ color: DARK_TEXT, fontSize: '20px' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            p: 1.5,
                                            backgroundColor: '#fff',
                                            borderTop: '1px solid #eee',
                                        }}
                                    >
                                        {showEmoji && (
                                            <Box ref={emojiBoxRef} sx={{ position: 'absolute', bottom: '64px', left: 8, zIndex: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
                                                <EmojiPicker
                                                    onEmojiClick={(emojiData) => setDraft((d) => d + emojiData.emoji)}
                                                    height={360}
                                                    width={320}
                                                    emojiStyle={EmojiStyle.GOOGLE}
                                                    previewConfig={{ showPreview: false }}
                                                />
                                            </Box>
                                        )}
                                        <Tooltip title="Emoji" arrow>
                                            <IconButton ref={emojiBtnRef} onClick={() => setShowEmoji((v) => !v)}>
                                                <EmojiEmotionsOutlinedIcon sx={{ color: showEmoji ? ACCENT : '#888' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Attach file" arrow>
                                            <IconButton onClick={() => { setShowEmoji(false); fileInputRef.current?.click(); }}>
                                                <AttachFileIcon sx={{ color: '#888' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <input ref={fileInputRef} type="file" accept={ALLOWED_ACCEPT} hidden onChange={handleFileChange} />
                                        <TextField
                                            fullWidth
                                            size="small"
                                            inputRef={composerRef}
                                            placeholder="Type a message..."
                                            value={draft}
                                            onChange={handleType}
                                            onKeyDown={handleKeyDown}
                                            multiline
                                            maxRows={4}
                                            slotProps={{ input: { sx: { borderRadius: '24px', backgroundColor: '#F4F4F6' } } }}
                                        />
                                        {draft.trim() || editingMsgId ? (
                                            <IconButton onClick={handleSend} sx={fillBtnSx}>
                                                <SendIcon sx={{ color: DARK_TEXT, fontSize: '20px' }} />
                                            </IconButton>
                                        ) : (
                                            <Tooltip title="Record voice" arrow>
                                                <IconButton onClick={startRecording} sx={fillBtnSx}>
                                                    <MicRoundedIcon sx={{ color: DARK_TEXT, fontSize: '20px' }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                )}
                                  </>
                                )}

                                {(showScrollDown || newMsgCount > 0) && (
                                    <Badge
                                        badgeContent={newMsgCount}
                                        invisible={newMsgCount === 0}
                                        max={99}
                                        sx={{
                                            position: 'absolute',
                                            bottom: 88,
                                            right: 20,
                                            zIndex: 5,
                                            '& .MuiBadge-badge': { backgroundColor: ACCENT_FILL, color: DARK_TEXT, fontWeight: 700, fontSize: '11px' },
                                        }}
                                    >
                                        <IconButton
                                            onClick={handleScrollDownClick}
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                backgroundColor: '#fff',
                                                color: ACCENT,
                                                border: '1px solid #ececf1',
                                                boxShadow: '0 3px 12px rgba(0,0,0,0.18)',
                                                '&:hover': { backgroundColor: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.22)' },
                                            }}
                                        >
                                            <KeyboardArrowDownRoundedIcon />
                                        </IconButton>
                                    </Badge>
                                )}

                                {searchOpen && (
                                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 8, backgroundColor: '#fff', borderBottom: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 1 }}>
                                        <TextField
                                            fullWidth
                                            autoFocus
                                            size="small"
                                            placeholder="Search in conversation..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (e.shiftKey) gotoMatch(searchIndex - 1);
                                                    else gotoMatch(searchIndex + 1);
                                                }
                                            }}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon sx={{ fontSize: 20, color: '#999' }} />
                                                        </InputAdornment>
                                                    ),
                                                    sx: { borderRadius: '50px', backgroundColor: '#F4F4F6' },
                                                },
                                            }}
                                        />
                                        <Box sx={{ minWidth: 64, textAlign: 'center', flexShrink: 0 }}>
                                            {searchLoading ? (
                                                <CircularProgress size={16} sx={{ color: ACCENT }} />
                                            ) : searchQuery.trim() && searchResults.length === 0 ? (
                                                <Typography sx={{ fontSize: '12px', color: '#999' }}>None</Typography>
                                            ) : searchResults.length ? (
                                                <Typography sx={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>
                                                    {searchIndex + 1} of {searchResults.length}{searchHasMore ? '+' : ''}
                                                </Typography>
                                            ) : null}
                                        </Box>
                                        <Tooltip title="Previous (older)" arrow>
                                            <span>
                                                <IconButton size="small" disabled={(searchIndex >= searchResults.length - 1 && !searchHasMore) || !searchResults.length || searchLoadingMore} onClick={() => gotoMatch(searchIndex + 1)}>
                                                    <KeyboardArrowUpRoundedIcon sx={{ color: '#555' }} />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Next (newer)" arrow>
                                            <span>
                                                <IconButton size="small" disabled={searchIndex <= 0 || !searchResults.length} onClick={() => gotoMatch(searchIndex - 1)}>
                                                    <KeyboardArrowDownRoundedIcon sx={{ color: '#555' }} />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <IconButton size="small" onClick={closeSearch}>
                                            <CloseIcon sx={{ fontSize: 20, color: '#555' }} />
                                        </IconButton>
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    px: 3,
                                    backgroundColor: '#F6F6F8',
                                }}
                            >
                                <Box
                                    sx={{
                                        mb: 3,
                                        px: 4,
                                        pt: 2.5,
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={productLogo}
                                        alt="SchoolMate"
                                        sx={{ width: 200, maxWidth: '60vw', display: 'block' }}
                                    />
                                </Box>

                                <Typography sx={{ fontSize: '14px', color: '#8a8a8a', maxWidth: 380, lineHeight: 1.6 }}>
                                    Select a conversation from the left, or create a new group to start messaging your staff and teams.
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1.5, mt: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {[
                                        { icon: <GroupsRoundedIcon sx={{ fontSize: 22, color: ACCENT }} />, label: 'Group chats' },
                                        { icon: <AttachFileIcon sx={{ fontSize: 20, color: ACCENT }} />, label: 'Share files' },
                                        { icon: <DoneAllIcon sx={{ fontSize: 22, color: ACCENT }} />, label: 'Read receipts' },
                                    ].map((f, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                width: 108,
                                                py: 1.8,
                                                borderRadius: '14px',
                                                backgroundColor: '#fff',
                                                border: '1px solid #ececf1',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 0.9,
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                            }}
                                        >
                                            <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: ACCENT_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {f.icon}
                                            </Box>
                                            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>{f.label}</Typography>
                                        </Box>
                                    ))}
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mt: 4, color: '#b0b0b0' }}>
                                    <LockOutlinedIcon sx={{ fontSize: 14 }} />
                                    <Typography sx={{ fontSize: '12px' }}>Your messages stay within your school</Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            <Popover
                open={groupOpen}
                anchorEl={menuButtonRef.current}
                onClose={(e, reason) => { if (reason === 'backdropClick' || reason === 'escapeKeyDown') return; closeGroupPopover(); }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        sx: {
                            width: { xs: '92vw', sm: 360 },
                            maxWidth: '92vw',
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column',
                            mt: 1,
                            borderRadius: '16px',
                            border: '1px solid #ECECF1',
                            boxShadow: '0 14px 38px rgba(16,24,40,0.18)',
                            overflow: 'hidden',
                        },
                    },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, backgroundColor: ACCENT_SOFT, borderBottom: `1px solid ${ACCENT}22`, flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 34,
                                height: 34,
                                borderRadius: '10px',
                                background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_FILL} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 4px 10px ${ACCENT}55`,
                            }}
                        >
                            <GroupAddRoundedIcon sx={{ color: DARK_TEXT, fontSize: 19 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.1, color: DARK_TEXT }}>Create New Group</Typography>
                            <Typography sx={{ fontSize: '11px', color: '#8a7b52' }}>Select multiple staff to add</Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={closeGroupPopover}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar src={groupIconPreview || undefined} sx={{ width: 56, height: 56, bgcolor: ACCENT_SOFT, color: ACCENT }}>
                                {!groupIconPreview && <GroupsRoundedIcon sx={{ fontSize: 26 }} />}
                            </Avatar>
                            <IconButton
                                onClick={() => groupIconInputRef.current?.click()}
                                sx={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, backgroundColor: ACCENT_FILL, '&:hover': { backgroundColor: ACCENT } }}
                            >
                                <PhotoCameraRoundedIcon sx={{ fontSize: 14, color: DARK_TEXT }} />
                            </IconButton>
                            <input ref={groupIconInputRef} type="file" accept="image/*" hidden onChange={handleGroupIcon} />
                        </Box>
                    </Box>

                    <Typography sx={fieldLabelSx}>Group Name</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g. Grade 5 Coordination"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <GroupsRoundedIcon sx={{ color: ACCENT, fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setGroupNameEmoji((v) => !v)}>
                                            <EmojiEmotionsOutlinedIcon sx={{ color: groupNameEmoji ? ACCENT : '#999', fontSize: 20 }} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{ mb: groupNameEmoji ? 1 : 1.4, ...fieldSx }}
                    />

                    {groupNameEmoji && (
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                            <EmojiPicker
                                onEmojiClick={(emojiData) => setGroupName((n) => n + emojiData.emoji)}
                                height={300}
                                width={300}
                                emojiStyle={EmojiStyle.GOOGLE}
                                previewConfig={{ showPreview: false }}
                            />
                        </Box>
                    )}

                    <Typography sx={fieldLabelSx}>Description</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        placeholder="Group description (optional)"
                        value={groupDesc}
                        onChange={(e) => setGroupDesc(e.target.value)}
                        sx={{ mb: 1.4, ...fieldSx }}
                    />

                    <Typography sx={fieldLabelSx}>User Type</Typography>
                    <Select
                        fullWidth
                        size="small"
                        value={groupUserType}
                        onChange={(e) => setGroupUserType(e.target.value)}
                        sx={{
                            mb: 1.4,
                            borderRadius: '12px',
                            backgroundColor: '#F7F7F9',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E6E6EC' },
                            '&:hover': { backgroundColor: '#F2F2F5' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D6D6DE' },
                            '&.Mui-focused': { backgroundColor: '#fff', boxShadow: `0 0 0 3px ${ACCENT}22` },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT, borderWidth: '1.5px' },
                        }}
                    >
                        {userTypeOptions.map((t) => (
                            <MenuItem key={t} value={t}>
                                {t === 'All' ? 'All Members' : t}
                            </MenuItem>
                        ))}
                    </Select>

                    <Typography sx={fieldLabelSx}>Add Staff</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search staff by name or role..."
                        value={groupSearch}
                        onChange={(e) => setGroupSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 19, color: '#999' }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{ mb: 1.2, ...fieldSx }}
                    />

                    {selectedStaffObjects.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.2, maxHeight: 64, overflowY: 'auto' }}>
                            {selectedStaffObjects.map((s) => (
                                <Chip
                                    key={s.id}
                                    avatar={<Avatar sx={{ bgcolor: s.color }}>{s.avatar}</Avatar>}
                                    label={s.name}
                                    onDelete={() => toggleStaff(s.id)}
                                    size="small"
                                    sx={{ backgroundColor: ACCENT_SOFT, fontSize: '11px' }}
                                />
                            ))}
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#888' }}>
                            STAFF ({groupFilteredStaff.length})
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: ACCENT, fontWeight: 700 }}>
                            {selectedStaff.length} selected
                        </Typography>
                    </Box>

                    <Box sx={{ maxHeight: 165, overflowY: 'auto', border: '1px solid #eee', borderRadius: '10px' }}>
                        {loadingUsers && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
                                <CircularProgress size={22} sx={{ color: ACCENT }} />
                            </Box>
                        )}
                        {!loadingUsers && groupFilteredStaff.length === 0 && (
                            <Typography sx={{ fontSize: '12px', color: '#999', textAlign: 'center', py: 2.5 }}>
                                No staff found
                            </Typography>
                        )}
                        {groupFilteredStaff.map((s) => {
                            const checked = selectedStaff.includes(s.id);
                            return (
                                <Box
                                    key={s.id}
                                    onClick={() => toggleStaff(s.id)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        px: 1,
                                        py: 0.6,
                                        cursor: 'pointer',
                                        backgroundColor: checked ? ACCENT_SOFT : 'transparent',
                                        '&:hover': { backgroundColor: checked ? ACCENT_SOFT : '#FAFAFA' },
                                    }}
                                >
                                    <Checkbox
                                        checked={checked}
                                        size="small"
                                        sx={{ p: 0.5, color: '#ccc', '&.Mui-checked': { color: ACCENT } }}
                                    />
                                    <Avatar sx={{ bgcolor: s.color, width: 32, height: 32, fontSize: '12px', fontWeight: 600 }}>
                                        {s.avatar}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: DARK_TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {s.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {s.rollNumber}{s.userType ? ` · ${s.userType}` : ''}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, p: 2, pt: 1.5, borderTop: '1px solid #eee', flexShrink: 0 }}>
                    <Button
                        fullWidth
                        onClick={closeGroupPopover}
                        sx={{ textTransform: 'none', borderRadius: '50px', color: DARK_TEXT, border: '1px solid #d8d8de' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        disableElevation
                        disabled={!groupName.trim() || selectedStaff.length === 0}
                        onClick={handleCreateGroup}
                        sx={{ textTransform: 'none', borderRadius: '50px', bgcolor: ACCENT_FILL, color: DARK_TEXT, fontWeight: 700, '&:hover': { bgcolor: ACCENT } }}
                    >
                        Create
                    </Button>
                </Box>
            </Popover>

            {attachment && (
                <Box
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1400,
                        backgroundColor: 'rgba(15,15,15,0.96)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
                        <IconButton onClick={closeAttachment} sx={{ color: '#fff' }}>
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>
                            {activeChat ? activeChat.name : 'Preview'}
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', px: 2 }}>
                        {attachment.type === 'image' ? (
                            <img
                                src={attachment.fileUrl}
                                alt={attachment.fileName}
                                style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '10px', objectFit: 'contain' }}
                            />
                        ) : (
                            <Box sx={{ textAlign: 'center', color: '#fff' }}>
                                <InsertDriveFileRoundedIcon sx={{ fontSize: 90, color: ACCENT_FILL }} />
                                <Typography sx={{ fontSize: '16px', fontWeight: 600, mt: 1 }}>{attachment.fileName}</Typography>
                                <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{attachment.fileSize}</Typography>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1, p: 2, pb: 3 }}>
                        {attachShowEmoji && (
                            <Box sx={{ position: 'absolute', bottom: '78px', left: 16, zIndex: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.4)', borderRadius: '12px', overflow: 'hidden' }}>
                                <EmojiPicker
                                    onEmojiClick={(emojiData) => setAttachCaption((c) => c + emojiData.emoji)}
                                    height={360}
                                    width={320}
                                    emojiStyle={EmojiStyle.GOOGLE}
                                    previewConfig={{ showPreview: false }}
                                    theme="dark"
                                />
                            </Box>
                        )}
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Add a caption..."
                            value={attachCaption}
                            onChange={(e) => setAttachCaption(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendAttachment();
                                }
                            }}
                            multiline
                            maxRows={4}
                            slotProps={{
                                input: {
                                    sx: { borderRadius: '24px', backgroundColor: '#2A2A2A', color: '#fff' },
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton size="small" onClick={() => setAttachShowEmoji((v) => !v)}>
                                                <EmojiEmotionsOutlinedIcon sx={{ color: attachShowEmoji ? ACCENT_FILL : 'rgba(255,255,255,0.7)' }} />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                        />
                        <IconButton onClick={sendAttachment} sx={{ ...fillBtnSx, width: 48, height: 48, '&:hover': { backgroundColor: sendingAttach ? ACCENT_FILL : ACCENT } }}>
                            {sendingAttach ? <CircularProgress size={22} thickness={5} sx={{ color: DARK_TEXT }} /> : <SendIcon sx={{ color: DARK_TEXT }} />}
                        </IconButton>
                    </Box>
                </Box>
            )}

            <Menu
                anchorEl={docMenuAnchor}
                open={Boolean(docMenuAnchor)}
                onClose={() => setDocMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { borderRadius: '12px', minWidth: 170 } } }}
            >
                <MenuItem
                    onClick={() => { setDocViewer({ url: docMenuTarget?.fileUrl, name: docMenuTarget?.fileName }); setDocMenuAnchor(null); }}
                    sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}
                >
                    <VisibilityRoundedIcon sx={{ fontSize: 19, color: '#5a5a5a' }} /> Open
                </MenuItem>
                <MenuItem
                    onClick={() => { downloadFile(docMenuTarget?.fileUrl, docMenuTarget?.fileName); setDocMenuAnchor(null); }}
                    sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}
                >
                    <DownloadRoundedIcon sx={{ fontSize: 19, color: '#5a5a5a' }} /> Save to device
                </MenuItem>
            </Menu>

            <Dialog open={Boolean(docViewer)} onClose={() => setDocViewer(null)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: '14px', height: '85vh' } } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.2, borderBottom: '1px solid #eee' }}>
                    <InsertDriveFileRoundedIcon sx={{ color: ACCENT, fontSize: 20 }} />
                    <Typography sx={{ flexGrow: 1, fontSize: '14px', fontWeight: 600, color: DARK_TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {docViewer?.name || 'Document'}
                    </Typography>
                    <Tooltip title="Save to device" arrow>
                        <IconButton size="small" onClick={() => downloadFile(docViewer?.url, docViewer?.name)}>
                            <DownloadRoundedIcon sx={{ fontSize: 20, color: ACCENT }} />
                        </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => setDocViewer(null)}>
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Box>
                {docViewer?.url && (
                    <Box component="iframe" src={docViewer.url} title={docViewer?.name || 'Document'} sx={{ flexGrow: 1, width: '100%', border: 'none' }} />
                )}
            </Dialog>

            {viewerImage && (
                <Box
                    onClick={() => setViewerImage(null)}
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1500,
                        backgroundColor: 'rgba(0,0,0,0.92)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <IconButton
                        onClick={() => setViewerImage(null)}
                        sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', backgroundColor: 'rgba(255,255,255,0.12)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' } }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <IconButton
                        onClick={(e) => { e.stopPropagation(); downloadFile(viewerImage); }}
                        sx={{ position: 'absolute', top: 16, right: 64, color: '#fff', backgroundColor: 'rgba(255,255,255,0.12)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' } }}
                    >
                        <DownloadRoundedIcon />
                    </IconButton>
                    <img
                        src={viewerImage}
                        alt="preview"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '8px' }}
                    />
                </Box>
            )}

            <Menu
                anchorEl={msgMenuAnchor}
                open={Boolean(msgMenuAnchor)}
                onClose={() => setMsgMenuAnchor(null)}
                slotProps={menuSlot(190)}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, pb: 0.5 }}>
                    {quickEmojis.map((e) => (
                        <Box
                            key={e}
                            onClick={() => reactToMessage(e, msgMenuTarget)}
                            sx={{ cursor: 'pointer', fontSize: '20px', fontFamily: "'Noto Color Emoji', sans-serif", px: 0.4, borderRadius: '8px', transition: '0.15s', '&:hover': { transform: 'scale(1.25)' } }}
                        >
                            {e}
                        </Box>
                    ))}
                </Box>
                <Divider sx={{ mb: 0.5 }} />
                <MenuItem onClick={() => startReply(msgMenuTarget)} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                    <ReplyRoundedIcon sx={{ fontSize: 18, color: '#5a5a5a' }} /> Reply
                </MenuItem>
                {FORWARD_ENABLED && !msgMenuTarget?.isDeleted && (
                    <MenuItem onClick={() => openForward(msgMenuTarget)} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                        <ShortcutRoundedIcon sx={{ fontSize: 18, color: '#5a5a5a' }} /> Forward
                    </MenuItem>
                )}
                {!msgMenuTarget?.isDeleted && msgMenuTarget?.type === 'text' && (
                    <MenuItem onClick={handleCopy} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                        <ContentCopyRoundedIcon sx={{ fontSize: 18, color: '#5a5a5a' }} /> Copy
                    </MenuItem>
                )}
                {isGroupAdmin && (
                    <MenuItem onClick={handlePin} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                        {msgMenuTarget?.isPinned ? (
                            <PushPinOutlinedIcon sx={{ fontSize: 18, color: '#5a5a5a' }} />
                        ) : (
                            <PushPinRoundedIcon sx={{ fontSize: 18, color: '#5a5a5a' }} />
                        )}
                        {msgMenuTarget?.isPinned ? 'Unpin' : 'Pin'}
                    </MenuItem>
                )}
                {canEditMsg(msgMenuTarget) && (
                    <MenuItem onClick={startEditMessage} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                        <EditOutlinedIcon sx={{ fontSize: 18, color: '#5a5a5a' }} /> Edit
                    </MenuItem>
                )}
                {msgMenuTarget?.sender === 'me' && !msgMenuTarget?.isDeleted && (
                    <MenuItem onClick={openMessageInfo} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                        <InfoOutlinedIcon sx={{ fontSize: 18, color: '#5a5a5a' }} /> Message info
                    </MenuItem>
                )}
                {(msgMenuTarget?.sender === 'me' || isGroupAdmin) && (
                    <MenuItem onClick={handleDeleteMessage} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 18, color: '#5a5a5a' }} /> Delete
                    </MenuItem>
                )}
            </Menu>

            <Popover
                open={Boolean(reactAnchor)}
                anchorEl={reactAnchor}
                onClose={() => { setReactAnchor(null); setReactMoreOpen(false); }}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                slotProps={{ paper: { sx: { borderRadius: reactMoreOpen ? '16px' : '24px', px: reactMoreOpen ? 0 : 1, py: reactMoreOpen ? 0 : 0.5, boxShadow: '0 6px 20px rgba(0,0,0,0.18)', overflow: 'hidden' } } }}
            >
                {reactMoreOpen ? (
                    <EmojiPicker
                        onEmojiClick={(emojiData) => reactToMessage(emojiData.emoji)}
                        height={360}
                        width={320}
                        emojiStyle={EmojiStyle.GOOGLE}
                        previewConfig={{ showPreview: false }}
                    />
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        {quickEmojis.map((e) => {
                            const selected = myReactionOf(reactTarget) === e;
                            return (
                                <Box
                                    key={e}
                                    onClick={() => reactToMessage(e)}
                                    sx={{
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        fontFamily: "'Noto Color Emoji', sans-serif",
                                        px: 0.5,
                                        py: 0.3,
                                        borderRadius: '50%',
                                        transition: '0.15s',
                                        backgroundColor: selected ? '#dcdcdc' : 'transparent',
                                        '&:hover': { backgroundColor: selected ? '#dcdcdc' : '#efefef' },
                                    }}
                                >
                                    {e}
                                </Box>
                            );
                        })}
                        <IconButton size="small" onClick={() => setReactMoreOpen(true)} sx={{ ml: 0.3, backgroundColor: '#F0F0F3', '&:hover': { backgroundColor: '#e4e4e9' } }}>
                            <AddRoundedIcon sx={{ fontSize: 18, color: '#555' }} />
                        </IconButton>
                    </Box>
                )}
            </Popover>

            <Menu
                open={Boolean(pinMenuPos)}
                onClose={() => setPinMenuPos(null)}
                anchorReference="anchorPosition"
                anchorPosition={pinMenuPos || undefined}
                slotProps={menuSlot(140)}
            >
                <MenuItem onClick={unpinAll} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                    <PushPinOutlinedIcon sx={{ fontSize: 18, color: '#5a5a5a' }} /> Unpin
                </MenuItem>
            </Menu>

            <Popover
                open={Boolean(reactInfoAnchor)}
                anchorEl={reactInfoAnchor}
                onClose={() => setReactInfoAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                slotProps={{ paper: { sx: { borderRadius: '14px', minWidth: 220, maxWidth: 280, boxShadow: '0 8px 28px rgba(16,24,40,0.16)' } } }}
            >
                <Box sx={{ px: 2, py: 1.2, borderBottom: '1px solid #eee' }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#888' }}>
                        Reactions ({reactInfoList.length})
                    </Typography>
                </Box>
                <Box sx={{ maxHeight: 240, overflowY: 'auto', py: 0.5 }}>
                    {reactInfoList.map((p) => (
                        <Box
                            key={p.roll + p.emoji}
                            onClick={p.isMe ? () => reactToMessage(p.emoji, reactInfoMsg) : undefined}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 2, py: 0.8, cursor: p.isMe ? 'pointer' : 'default', '&:hover': { backgroundColor: p.isMe ? '#FBECEC' : 'transparent' } }}
                        >
                            <Avatar sx={{ bgcolor: colorFor(p.roll), width: 32, height: 32, fontSize: '12px', fontWeight: 600 }}>
                                {initials(p.name)}
                            </Avatar>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: DARK_TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {p.name}{p.isMe ? ' (You)' : ''}
                                </Typography>
                                {p.isMe && <Typography sx={{ fontSize: '10px', color: '#f44336' }}>Tap to remove</Typography>}
                            </Box>
                            <Box component="span" sx={{ fontSize: '16px', fontFamily: "'Noto Color Emoji', sans-serif" }}>{p.emoji}</Box>
                        </Box>
                    ))}
                </Box>
            </Popover>

            <Dialog open={Boolean(infoMsg)} onClose={() => setInfoMsg(null)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, backgroundColor: ACCENT_SOFT }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: DARK_TEXT }}>Message Info</Typography>
                    <IconButton size="small" onClick={() => setInfoMsg(null)}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
                <DialogContent sx={{ pt: 2 }}>
                    {infoMsg && (
                        <Box sx={{ backgroundColor: '#F4F4F6', borderRadius: '10px', px: 1.5, py: 1, mb: 2 }}>
                            <Typography sx={{ fontSize: '13px', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {infoMsg.text || infoMsg.caption || infoMsg.fileName || (infoMsg.type === 'audio' ? 'Voice message' : 'Attachment')}
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#999', mt: 0.3 }}>{infoMsg.time}</Typography>
                        </Box>
                    )}
                    {infoLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={26} sx={{ color: ACCENT }} />
                        </Box>
                    ) : infoData ? (
                        <>
                            <Typography sx={{ ...fieldLabelSx, color: '#43C57E' }}>
                                Read by {infoData.readCount}/{infoData.totalRecipients}
                            </Typography>
                            {(infoData.readBy || []).map((p) => (
                                <Box key={p.rollNumber} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.7 }}>
                                    <Avatar src={p.photoPath || undefined} sx={{ bgcolor: colorFor(p.rollNumber), width: 34, height: 34, fontSize: '12px', fontWeight: 600 }}>
                                        {initials(p.name)}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: DARK_TEXT }}>{p.name}</Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#999' }}>{p.readOn}</Typography>
                                    </Box>
                                    <DoneAllIcon sx={{ fontSize: 16, color: '#43C57E' }} />
                                </Box>
                            ))}
                            {(infoData.notReadBy || []).length > 0 && (
                                <>
                                    <Typography sx={{ ...fieldLabelSx, mt: 2 }}>Not read by</Typography>
                                    {infoData.notReadBy.map((p) => (
                                        <Box key={p.rollNumber} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.7 }}>
                                            <Avatar src={p.photoPath || undefined} sx={{ bgcolor: colorFor(p.rollNumber), width: 34, height: 34, fontSize: '12px', fontWeight: 600 }}>
                                                {initials(p.name)}
                                            </Avatar>
                                            <Typography sx={{ flexGrow: 1, fontSize: '13px', fontWeight: 600, color: DARK_TEXT }}>{p.name}</Typography>
                                            <DoneAllIcon sx={{ fontSize: 16, color: '#bbb' }} />
                                        </Box>
                                    ))}
                                </>
                            )}
                        </>
                    ) : (
                        <Typography sx={{ fontSize: '13px', color: '#999', textAlign: 'center', py: 2 }}>No info available</Typography>
                    )}
                </DialogContent>
            </Dialog>

            <Menu
                anchorEl={listMenuAnchor}
                open={Boolean(listMenuAnchor)}
                onClose={closeListMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={menuSlot(220)}
            >
                {MUTE_ENABLED && (listMenuGroup?.isMuted ? (
                    <MenuItem onClick={() => chooseMute(0)} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                        <NotificationsActiveRoundedIcon sx={{ fontSize: 19, color: '#5a5a5a' }} /> Unmute notifications
                    </MenuItem>
                ) : (
                    <MenuItem onMouseEnter={(e) => setMuteSubAnchor(e.currentTarget)} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT, justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <NotificationsOffRoundedIcon sx={{ fontSize: 19, color: '#5a5a5a' }} /> Mute notifications
                        </Box>
                        <ChevronRightRoundedIcon sx={{ fontSize: 18, color: '#999' }} />
                    </MenuItem>
                ))}
                {MUTE_ENABLED && <Divider sx={{ my: 0.5 }} />}
                <MenuItem onMouseEnter={() => setMuteSubAnchor(null)} onClick={() => { const g = listMenuGroup; closeListMenu(); clearChatById(g?.id); }} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                    <DeleteSweepRoundedIcon sx={{ fontSize: 19, color: '#5a5a5a' }} /> Clear chat
                </MenuItem>
                {!listMenuGroup?.isCreator && (
                    <MenuItem onMouseEnter={() => setMuteSubAnchor(null)} onClick={() => { const g = listMenuGroup; closeListMenu(); setLeaveTargetId(g?.id); }} sx={{ fontSize: '14px', gap: 1.2, color: DARK_TEXT }}>
                        <LogoutRoundedIcon sx={{ fontSize: 19, color: '#5a5a5a' }} /> Leave group
                    </MenuItem>
                )}
            </Menu>

            <Menu
                anchorEl={muteSubAnchor}
                open={Boolean(muteSubAnchor)}
                onClose={() => setMuteSubAnchor(null)}
                hideBackdrop
                disableAutoFocus
                disableEnforceFocus
                disableAutoFocusItem
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{ root: { sx: { pointerEvents: 'none' } }, paper: { sx: { ...menuPaperSx, minWidth: 150, pointerEvents: 'auto' } }, list: { sx: menuListSx, onMouseLeave: () => setMuteSubAnchor(null) } }}
            >
                <MenuItem onClick={() => chooseMute(8)} sx={{ fontSize: '14px' }}>8 hours</MenuItem>
                <MenuItem onClick={() => chooseMute(168)} sx={{ fontSize: '14px' }}>1 week</MenuItem>
                <MenuItem onClick={() => chooseMute(-1)} sx={{ fontSize: '14px' }}>Always</MenuItem>
            </Menu>

            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, backgroundColor: ACCENT_SOFT }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: DARK_TEXT }}>Edit Group</Typography>
                    <IconButton size="small" onClick={() => setEditOpen(false)}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
                <DialogContent sx={{ pt: 2.5 }}>
                    <Typography sx={fieldLabelSx}>Group Name</Typography>
                    <TextField fullWidth size="small" value={editName} onChange={(e) => setEditName(e.target.value)} sx={{ mb: 2, ...fieldSx }} />
                    <Typography sx={fieldLabelSx}>Description</Typography>
                    <TextField fullWidth size="small" multiline minRows={2} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} sx={{ ...fieldSx }} />
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2 }}>
                    <Button onClick={() => setEditOpen(false)} sx={{ textTransform: 'none', borderRadius: '50px', color: DARK_TEXT, border: '1px solid #d8d8de', px: 2.5 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" disableElevation disabled={!editName.trim()} onClick={saveGroupEdit} sx={{ textTransform: 'none', borderRadius: '50px', bgcolor: ACCENT_FILL, color: DARK_TEXT, fontWeight: 700, px: 2.5, '&:hover': { bgcolor: ACCENT } }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={manageOpen} onClose={() => setManageOpen(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, backgroundColor: ACCENT_SOFT }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: DARK_TEXT }}>Manage Members</Typography>
                    <IconButton size="small" onClick={() => setManageOpen(false)}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography sx={fieldLabelSx}>Current Members ({(activeGroupInfo?.members || []).length})</Typography>
                    <Box sx={{ maxHeight: 160, overflowY: 'auto', border: '1px solid #eee', borderRadius: '10px', mb: 2 }}>
                        {(activeGroupInfo?.members || []).map((mem) => {
                            const willRemove = manageRemove.includes(mem.rollNumber);
                            const isSelf = mem.rollNumber === rollNumber;
                            return (
                                <Box key={mem.rollNumber} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6, opacity: willRemove ? 0.5 : 1 }}>
                                    <Avatar sx={{ bgcolor: colorFor(mem.rollNumber), width: 32, height: 32, fontSize: '12px', fontWeight: 600 }}>
                                        {initials(mem.name)}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: DARK_TEXT }}>
                                            {mem.name} {mem.memberRole === 'admin' && <span style={{ color: ACCENT, fontSize: 11 }}>• admin</span>}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#888' }}>
                                            {mem.rollNumber}{mem.userType ? ` · ${mem.userType}` : ''}
                                        </Typography>
                                    </Box>
                                    {!isSelf && !isCreatorMember(mem) && (
                                        <Tooltip title={willRemove ? 'Undo remove' : 'Remove member'} arrow>
                                            <IconButton size="small" onClick={() => toggleRemove(mem.rollNumber)} sx={{ color: willRemove ? '#f44336' : '#bbb' }}>
                                                <PersonRemoveRoundedIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>

                    <Typography sx={fieldLabelSx}>Add Members</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search staff..."
                        value={manageSearch}
                        onChange={(e) => setManageSearch(e.target.value)}
                        slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 19, color: '#999' }} /></InputAdornment>) } }}
                        sx={{ mb: 1, ...fieldSx }}
                    />
                    <Box sx={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #eee', borderRadius: '10px' }}>
                        {loadingUsers && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={20} sx={{ color: ACCENT }} />
                            </Box>
                        )}
                        {!loadingUsers && manageFilteredStaff.length === 0 && (
                            <Typography sx={{ fontSize: '12px', color: '#999', textAlign: 'center', py: 2 }}>No staff found</Typography>
                        )}
                        {manageFilteredStaff.map((s) => {
                            const checked = manageAdd.includes(s.id);
                            return (
                                <Box key={s.id} onClick={() => toggleAdd(s.id)} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6, cursor: 'pointer', backgroundColor: checked ? ACCENT_SOFT : 'transparent', '&:hover': { backgroundColor: checked ? ACCENT_SOFT : '#FAFAFA' } }}>
                                    <Checkbox checked={checked} size="small" sx={{ p: 0.5, color: '#ccc', '&.Mui-checked': { color: ACCENT } }} />
                                    <Avatar sx={{ bgcolor: s.color, width: 32, height: 32, fontSize: '12px', fontWeight: 600 }}>{s.avatar}</Avatar>
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: DARK_TEXT }}>{s.name}</Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#888' }}>
                                            {s.rollNumber}{s.userType ? ` · ${s.userType}` : ''}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2 }}>
                    <Button onClick={() => setManageOpen(false)} disabled={savingMembers} sx={{ textTransform: 'none', borderRadius: '50px', color: DARK_TEXT, border: '1px solid #d8d8de', px: 2.5 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" disableElevation disabled={savingMembers || (manageAdd.length === 0 && manageRemove.length === 0)} onClick={saveMembers} startIcon={savingMembers ? <CircularProgress size={15} sx={{ color: DARK_TEXT }} /> : null} sx={{ textTransform: 'none', borderRadius: '50px', bgcolor: ACCENT_FILL, color: DARK_TEXT, fontWeight: 700, px: 2.5, '&:hover': { bgcolor: ACCENT } }}>
                        {savingMembers ? 'Saving…' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Drawer
                anchor="right"
                open={infoOpen}
                onClose={() => { setInfoOpen(false); setEditingName(false); setEditingDesc(false); }}
                slotProps={{ paper: { sx: { width: { xs: '100%', sm: 360 } } } }}
            >
                {activeChat && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, borderBottom: '1px solid #eee' }}>
                            <IconButton onClick={() => setInfoOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                            <Typography sx={{ fontSize: '16px', fontWeight: 700, color: DARK_TEXT }}>Group Info</Typography>
                        </Box>

                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, px: 2 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar
                                        src={activeChat.iconPath || undefined}
                                        onClick={() => { if (activeChat.iconPath) setViewerImage(activeChat.iconPath); }}
                                        sx={{
                                            bgcolor: activeChat.color,
                                            width: 96,
                                            height: 96,
                                            fontSize: '34px',
                                            fontWeight: 600,
                                            cursor: activeChat.iconPath ? 'pointer' : 'default',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': activeChat.iconPath ? { transform: 'scale(1.04)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' } : {},
                                        }}
                                    >
                                        {activeChat.isGroup ? <GroupsRoundedIcon sx={{ fontSize: 48 }} /> : activeChat.avatar}
                                    </Avatar>
                                    {isGroupAdmin && (
                                        <>
                                            <IconButton
                                                onClick={() => groupInfoIconInputRef.current?.click()}
                                                sx={{ position: 'absolute', bottom: 2, right: 2, width: 32, height: 32, backgroundColor: ACCENT_FILL, boxShadow: '0 2px 6px rgba(0,0,0,0.2)', '&:hover': { backgroundColor: ACCENT } }}
                                            >
                                                <PhotoCameraRoundedIcon sx={{ fontSize: 18, color: DARK_TEXT }} />
                                            </IconButton>
                                            <input ref={groupInfoIconInputRef} type="file" accept="image/*" hidden onChange={handleGroupInfoIcon} />
                                        </>
                                    )}
                                </Box>
                                {editingName ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5, width: '100%', px: 1 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') saveGroupInline(); }}
                                            autoFocus
                                            sx={fieldSx}
                                        />
                                        <IconButton size="small" onClick={saveGroupInline} sx={{ color: '#43C57E' }}>
                                            <CheckRoundedIcon />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => setEditingName(false)}>
                                            <CloseIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1.5 }}>
                                        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: DARK_TEXT, textAlign: 'center' }}>
                                            {activeChat.name}
                                        </Typography>
                                        {isGroupAdmin && (
                                            <IconButton size="small" onClick={startEditName}>
                                                <EditRoundedIcon sx={{ fontSize: 18, color: ACCENT }} />
                                            </IconButton>
                                        )}
                                    </Box>
                                )}
                                <Typography sx={{ fontSize: '13px', color: '#888', mt: 0.3 }}>
                                    Group · {activeGroupInfo?.memberCount ?? activeChat.memberCount ?? 0} members
                                </Typography>
                            </Box>

                            <Divider />

                            <Box sx={{ px: 2.5, py: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography sx={fieldLabelSx}>Description</Typography>
                                    {isGroupAdmin && !editingDesc && (
                                        <IconButton size="small" onClick={startEditDesc}>
                                            <EditRoundedIcon sx={{ fontSize: 16, color: ACCENT }} />
                                        </IconButton>
                                    )}
                                </Box>
                                {editingDesc ? (
                                    <Box>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            multiline
                                            minRows={2}
                                            placeholder="Add a group description"
                                            value={editDesc}
                                            onChange={(e) => setEditDesc(e.target.value)}
                                            autoFocus
                                            sx={{ mb: 1, ...fieldSx }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                            <Button size="small" onClick={() => setEditingDesc(false)} sx={{ textTransform: 'none', borderRadius: '50px', color: DARK_TEXT }}>
                                                Cancel
                                            </Button>
                                            <Button size="small" variant="contained" disableElevation onClick={saveGroupInline} sx={{ textTransform: 'none', borderRadius: '50px', bgcolor: ACCENT_FILL, color: DARK_TEXT, fontWeight: 700, '&:hover': { bgcolor: ACCENT } }}>
                                                Save
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Typography sx={{ fontSize: '14px', color: activeGroupInfo?.description ? DARK_TEXT : '#aaa', lineHeight: 1.5 }}>
                                        {activeGroupInfo?.description || 'No description'}
                                    </Typography>
                                )}
                            </Box>

                            <Divider />

                            <Box sx={{ px: 2.5, py: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PermMediaRoundedIcon sx={{ fontSize: 18, color: ACCENT }} />
                                        <Typography sx={fieldLabelSx}>Media, docs & links</Typography>
                                    </Box>
                                    {media.length > 0 && (
                                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#999' }}>
                                            {media.length}{mediaHasMore ? '+' : ''}
                                        </Typography>
                                    )}
                                </Box>

                                {mediaLoading && media.length === 0 ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                        <CircularProgress size={22} sx={{ color: ACCENT }} />
                                    </Box>
                                ) : media.length === 0 ? (
                                    <Typography sx={{ fontSize: '13px', color: '#aaa' }}>No media shared yet</Typography>
                                ) : (
                                    <Box
                                        onScroll={(e) => {
                                            const el = e.currentTarget;
                                            if (el.scrollWidth - el.scrollLeft - el.clientWidth < 80) loadMoreMedia();
                                        }}
                                        sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#ddd', borderRadius: 3 } }}
                                    >
                                        {media.map((item) => {
                                            const ft = (item.filetype || '').toLowerCase();
                                            const isImg = ft.startsWith('image');
                                            const isAud = ft.startsWith('audio');
                                            const isVid = ft.startsWith('video');
                                            if (isImg) {
                                                return (
                                                    <Box
                                                        key={item.messageId}
                                                        component="img"
                                                        src={item.filepath}
                                                        alt={item.filename}
                                                        onClick={() => setViewerImage(item.filepath)}
                                                        sx={{ width: 72, height: 72, borderRadius: '10px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer', border: '1px solid #eee' }}
                                                    />
                                                );
                                            }
                                            const Icon = isAud ? MicRoundedIcon : isVid ? SmartDisplayRoundedIcon : InsertDriveFileRoundedIcon;
                                            const onTileClick = isVid
                                                ? () => window.open(item.filepath, '_blank', 'noopener')
                                                : isAud
                                                ? () => downloadFile(item.filepath, item.filename)
                                                : () => setDocViewer({ url: item.filepath, name: item.filename });
                                            return (
                                                <Box
                                                    key={item.messageId}
                                                    onClick={onTileClick}
                                                    sx={{ width: 72, height: 72, borderRadius: '10px', flexShrink: 0, cursor: 'pointer', backgroundColor: ACCENT_SOFT, border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.4, p: 0.5, '&:hover': { backgroundColor: ACCENT_SOFT_HOVER } }}
                                                >
                                                    <Icon sx={{ fontSize: 24, color: ACCENT }} />
                                                    <Typography sx={{ fontSize: '9px', color: '#777', maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', px: 0.3 }}>
                                                        {item.filename || 'file'}
                                                    </Typography>
                                                </Box>
                                            );
                                        })}
                                        {mediaLoadingMore && (
                                            <Box sx={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <CircularProgress size={20} sx={{ color: ACCENT }} />
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Box>

                            <Divider />

                            {(activeGroupInfo?.createdBy || activeGroupInfo?.createdOn) && (
                                <>
                                    <Box sx={{ px: 2.5, py: 1.5 }}>
                                        <Typography sx={{ fontSize: '12px', color: '#888' }}>
                                            Created by <b style={{ color: DARK_TEXT }}>{activeGroupInfo?.createdBy}</b>
                                            {activeGroupInfo?.createdOn ? ` · ${activeGroupInfo.createdOn}` : ''}
                                        </Typography>
                                    </Box>
                                    <Divider />
                                </>
                            )}

                            <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#888' }}>
                                    {(activeGroupInfo?.members || []).length} Members
                                </Typography>
                                {isGroupAdmin && (
                                    <Button
                                        size="small"
                                        onClick={openManage}
                                        startIcon={<PersonAddAlt1RoundedIcon sx={{ fontSize: 16 }} />}
                                        sx={{ textTransform: 'none', color: ACCENT, fontWeight: 700 }}
                                    >
                                        Add
                                    </Button>
                                )}
                            </Box>

                            <Box sx={{ pb: 1 }}>
                                {(activeGroupInfo?.members || []).map((mem) => (
                                    <Box key={mem.rollNumber} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1 }}>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            variant="dot"
                                            invisible={!(mem.isOnline || onlineRolls.has(mem.rollNumber))}
                                            sx={{ '& .MuiBadge-dot': { backgroundColor: '#43C57E', border: '2px solid #fff', width: 11, height: 11, borderRadius: '50%' } }}
                                        >
                                            <Avatar src={mem.photoPath || undefined} sx={{ bgcolor: colorFor(mem.rollNumber), width: 40, height: 40, fontSize: '13px', fontWeight: 600 }}>
                                                {initials(mem.name)}
                                            </Avatar>
                                        </Badge>
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: DARK_TEXT }}>
                                                {mem.name}{mem.rollNumber === rollNumber ? ' (You)' : ''}
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', color: '#888' }}>
                                                {mem.rollNumber}
                                            </Typography>
                                        </Box>
                                        {mem.memberRole === 'admin' && (
                                            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: ACCENT, backgroundColor: ACCENT_SOFT, px: 1, py: 0.2, borderRadius: '6px' }}>
                                                Admin
                                            </Typography>
                                        )}
                                        {isGroupAdmin && mem.rollNumber !== rollNumber && !isCreatorMember(mem) && (
                                            <IconButton size="small" onClick={(e) => openMemberMenu(e, mem)}>
                                                <MoreVertIcon sx={{ fontSize: 18, color: '#999' }} />
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                            </Box>

                            <Menu
                                anchorEl={memberMenuAnchor}
                                open={Boolean(memberMenuAnchor)}
                                onClose={() => setMemberMenuAnchor(null)}
                                slotProps={{ paper: { sx: { borderRadius: '12px', minWidth: 180 } } }}
                            >
                                {memberMenuTarget?.memberRole === 'admin' ? (
                                    <MenuItem onClick={() => handleRoleChange('member')} sx={{ fontSize: '14px', gap: 1.2 }}>
                                        <RemoveModeratorRoundedIcon sx={{ fontSize: 19, color: '#777' }} /> Dismiss as admin
                                    </MenuItem>
                                ) : (
                                    <MenuItem onClick={() => handleRoleChange('admin')} sx={{ fontSize: '14px', gap: 1.2 }}>
                                        <AdminPanelSettingsRoundedIcon sx={{ fontSize: 19, color: ACCENT }} /> Make admin
                                    </MenuItem>
                                )}
                                <Divider sx={{ my: 0.5 }} />
                                <MenuItem onClick={() => removeMember(memberMenuTarget)} sx={{ fontSize: '14px', gap: 1.2, color: '#f44336' }}>
                                    <PersonRemoveRoundedIcon sx={{ fontSize: 19, color: '#f44336' }} /> Remove from group
                                </MenuItem>
                            </Menu>

                            {MUTE_ENABLED && (
                                <>
                                    <Divider />

                                    <Box
                                        onClick={() => handleMute(activeChat.isMuted ? 0 : 8)}
                                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.8, cursor: 'pointer', '&:hover': { backgroundColor: '#FAFAFA' } }}
                                    >
                                        {activeChat.isMuted ? (
                                            <NotificationsActiveRoundedIcon sx={{ color: ACCENT }} />
                                        ) : (
                                            <NotificationsOffRoundedIcon sx={{ color: ACCENT }} />
                                        )}
                                        <Typography sx={{ fontSize: '14px', color: DARK_TEXT }}>
                                            {activeChat.isMuted ? 'Unmute notifications' : 'Mute notifications'}
                                        </Typography>
                                    </Box>
                                </>
                            )}

                            {!isGroupCreator && (
                                <>
                                    <Divider />
                                    <Box
                                        onClick={() => setLeaveTargetId(activeId)}
                                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.8, cursor: 'pointer', '&:hover': { backgroundColor: '#FDECEC' } }}
                                    >
                                        <LogoutRoundedIcon sx={{ color: '#f44336' }} />
                                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#f44336' }}>
                                            Leave group
                                        </Typography>
                                    </Box>
                                </>
                            )}

                            {isGroupCreator && (
                                <>
                                    <Divider />
                                    <Box
                                        onClick={() => setDeleteConfirmOpen(true)}
                                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.8, cursor: 'pointer', '&:hover': { backgroundColor: '#FDECEC' } }}
                                    >
                                        <DeleteForeverRoundedIcon sx={{ color: '#f44336' }} />
                                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#f44336' }}>
                                            Delete group
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box>
                )}
            </Drawer>

            <Dialog open={Boolean(leaveTargetId)} onClose={() => setLeaveTargetId(null)} slotProps={{ paper: { sx: { borderRadius: '16px', maxWidth: 360 } } }}>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: DARK_TEXT, mb: 0.5 }}>Leave group?</Typography>
                    <Typography sx={{ fontSize: '13px', color: '#666' }}>
                        Are you sure you want to leave this group? You'll still be able to see the chat history.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2 }}>
                    <Button onClick={() => setLeaveTargetId(null)} sx={{ textTransform: 'none', borderRadius: '50px', color: DARK_TEXT, border: '1px solid #d8d8de', px: 2.5 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" disableElevation onClick={() => { const id = leaveTargetId; setLeaveTargetId(null); leaveGroupById(id); }} sx={{ textTransform: 'none', borderRadius: '50px', bgcolor: '#f44336', color: '#fff', fontWeight: 700, px: 2.5, '&:hover': { bgcolor: '#d32f2f' } }}>
                        Leave
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} slotProps={{ paper: { sx: { borderRadius: '16px', maxWidth: 380 } } }}>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.3, mb: 1.5 }}>
                        <Box sx={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: '#FDECEC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <DeleteForeverRoundedIcon sx={{ color: '#f44336', fontSize: 23 }} />
                        </Box>
                        <Typography sx={{ fontSize: '17px', fontWeight: 700, color: DARK_TEXT }}>Delete this group?</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '13px', color: '#666', lineHeight: 1.7 }}>
                        This will permanently delete <b>{activeChat?.name}</b> for <b>all {activeGroupInfo?.memberCount ?? activeChat?.memberCount ?? ''} members</b>. Every message, photo and file in this chat will be removed for everyone. This action <b>cannot be undone</b>.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ textTransform: 'none', borderRadius: '50px', color: DARK_TEXT, border: '1px solid #d8d8de', px: 2.5 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disableElevation
                        startIcon={<DeleteForeverRoundedIcon />}
                        onClick={() => { const id = activeId; setDeleteConfirmOpen(false); deleteGroupById(id); }}
                        sx={{ textTransform: 'none', borderRadius: '50px', bgcolor: '#f44336', color: '#fff', fontWeight: 700, px: 2.5, '&:hover': { bgcolor: '#d32f2f' } }}
                    >
                        Delete group
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(forwardMsg)} onClose={closeForward} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, backgroundColor: ACCENT_SOFT }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShortcutRoundedIcon sx={{ color: ACCENT }} />
                        <Typography sx={{ fontSize: '16px', fontWeight: 700, color: DARK_TEXT }}>Forward to</Typography>
                    </Box>
                    <IconButton size="small" onClick={closeForward}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
                <DialogContent sx={{ pt: 2 }}>
                    {forwardMsg && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#F4F4F6', borderRadius: '10px', px: 1.2, py: 1, mb: 1.5 }}>
                            {forwardMsg.type === 'image' ? (
                                <Box component="img" src={forwardMsg.fileUrl} alt="" sx={{ width: 36, height: 36, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                                <Box sx={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: ACCENT_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {forwardMsg.type === 'audio' ? (
                                        <MicRoundedIcon sx={{ fontSize: 18, color: ACCENT }} />
                                    ) : forwardMsg.type === 'file' ? (
                                        <InsertDriveFileRoundedIcon sx={{ fontSize: 18, color: ACCENT }} />
                                    ) : (
                                        <ShortcutRoundedIcon sx={{ fontSize: 18, color: ACCENT }} />
                                    )}
                                </Box>
                            )}
                            <Typography sx={{ fontSize: '13px', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {forwardMsg.text || forwardMsg.caption || forwardMsg.fileName || (forwardMsg.type === 'audio' ? 'Voice message' : 'Attachment')}
                            </Typography>
                        </Box>
                    )}

                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search name or number"
                        value={forwardSearch}
                        onChange={(e) => setForwardSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 19, color: '#999' }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{ mb: 1, ...fieldSx }}
                    />

                    <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #eee', borderRadius: '10px' }}>
                        {(() => {
                            const targets = conversations.filter(
                                (c) => !c.hasLeft && (c.name || '').toLowerCase().includes(forwardSearch.toLowerCase())
                            );
                            if (targets.length === 0) {
                                return <Typography sx={{ fontSize: '13px', color: '#999', textAlign: 'center', py: 3 }}>No chats found</Typography>;
                            }
                            return targets.map((c) => {
                                const checked = forwardSelected.includes(c.id);
                                return (
                                    <Box
                                        key={c.id}
                                        onClick={() => toggleForward(c.id)}
                                        sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 1.2, py: 0.8, cursor: 'pointer', backgroundColor: checked ? ACCENT_SOFT : 'transparent', '&:hover': { backgroundColor: checked ? ACCENT_SOFT : '#FAFAFA' } }}
                                    >
                                        <Checkbox checked={checked} size="small" sx={{ p: 0.5, color: '#ccc', '&.Mui-checked': { color: ACCENT } }} />
                                        <Avatar src={c.iconPath || undefined} sx={{ bgcolor: c.color, width: 38, height: 38, fontSize: '13px', fontWeight: 600 }}>
                                            {c.isGroup ? <GroupsRoundedIcon sx={{ fontSize: 20 }} /> : c.avatar}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: DARK_TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {c.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {c.memberCount ? `${c.memberCount} members` : c.role}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            });
                        })()}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2, justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: forwardSelected.length ? ACCENT : '#999' }}>
                        {forwardSelected.length} selected
                    </Typography>
                    <Button
                        variant="contained"
                        disableElevation
                        disabled={!forwardSelected.length || forwardSending}
                        onClick={forwardToGroups}
                        startIcon={forwardSending ? <CircularProgress size={15} sx={{ color: DARK_TEXT }} /> : <SendIcon sx={{ fontSize: 18 }} />}
                        sx={{ textTransform: 'none', borderRadius: '50px', bgcolor: ACCENT_FILL, color: DARK_TEXT, fontWeight: 700, px: 3, '&:hover': { bgcolor: ACCENT } }}
                    >
                        {forwardSending ? 'Sending…' : 'Send'}
                    </Button>
                </DialogActions>
            </Dialog>

            {copied && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 78,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.8,
                        backgroundColor: 'rgba(30,30,30,0.92)',
                        color: '#fff',
                        px: 1.8,
                        py: 0.7,
                        borderRadius: '20px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                        fontSize: '13px',
                        fontWeight: 600,
                        pointerEvents: 'none',
                        animation: 'copiedPop 0.18s ease',
                        '@keyframes copiedPop': {
                            from: { opacity: 0, transform: 'translate(-50%, -6px)' },
                            to: { opacity: 1, transform: 'translate(-50%, 0)' },
                        },
                    }}
                >
                    <CheckRoundedIcon sx={{ fontSize: 16, color: '#7DC353' }} />
                    Copied
                </Box>
            )}

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={snack.severity}
                    variant="filled"
                    onClose={() => setSnack((s) => ({ ...s, open: false }))}
                    sx={{ borderRadius: '10px', fontSize: '13px' }}
                >
                    {snack.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
