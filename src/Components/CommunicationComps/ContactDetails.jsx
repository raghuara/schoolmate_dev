import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { getContactDetails, postContactDetails, updateContactDetailsById, deleteContactDetailsById } from '../../Api/Api';
import { selectAcademicYear } from '../../Redux/Slices/academicYearSlice';
import {
    Avatar, Box, Button, Checkbox, Chip, Collapse, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, FormControl, Grid, IconButton, InputAdornment, MenuItem, Select,
    TextField, Tooltip, Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../Redux/Slices/DropdownController';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import GroupsIcon from '@mui/icons-material/Groups';

const TOKEN = '123';

const AVATAR_COLORS = ['#0891B2', '#7C3AED', '#EA580C', '#DC2626', '#16A34A', '#2563EB', '#DB2777', '#CA8A04'];
const colorFor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const getInitials = (name = '') => name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

export default function ContactDetails() {
    const navigate = useNavigate();
    const grades = useSelector(selectGrades) || [];
    const websiteSettings = useSelector(selectWebsiteSettings);
    const academicYear = useSelector(selectAcademicYear);
    const authRollNumber = useSelector((state) => state?.auth?.rollNumber || '');
    const mainColor = websiteSettings?.mainColor || '#E30053';
    const textColor = websiteSettings?.textColor || '#fff';

    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ── View filter (header) ──────────────────────────────────────────────────
    const [filterGradeId, setFilterGradeId] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const filterGrade = grades.find((g) => g.id === filterGradeId) || null;

    // ── API: flatten one API contact header into N UI rows (one per contactPerson) ─
    const flattenApiContacts = (apiContacts) => {
        const rows = [];
        (apiContacts || []).forEach((header) => {
            const everyone = !!header.visibleToEveryone;
            // visibility[] → selectedIds: ['gradeID-section', ...]. isAllSections expands to every section of that grade.
            const selectedIds = [];
            (header.visibility || []).forEach((v) => {
                const grade = grades.find((g) => g.id === v.gradeID);
                if (v.isAllSections && grade) {
                    grade.sections.forEach((s) => selectedIds.push(`${v.gradeID}-${s}`));
                } else if (v.section) {
                    selectedIds.push(`${v.gradeID}-${v.section}`);
                }
            });
            // Dedupe (in case isAllSections + per-section rows both appear)
            const uniqueIds = [...new Set(selectedIds)];
            (header.contactPersons || []).forEach((p) => {
                rows.push({
                    id: p.contactID,
                    contactHeaderID: header.contactHeaderID,
                    name: p.contactName || '',
                    initials: p.initials || '',
                    numbers: (p.phoneNumbers || []).map((pn) => pn.phoneNumber).filter(Boolean),
                    everyone,
                    selectedIds: everyone ? [] : uniqueIds,
                    visibilityText: header.visibilityText || '',
                });
            });
        });
        return rows;
    };

    const fetchContacts = async () => {
        if (!academicYear) return;
        setIsLoading(true);
        try {
            const res = await axios.get(getContactDetails, {
                params: {
                    AcademicYear: academicYear,
                    GradeID: filterGradeId || 0,
                    Section: filterSection || 'All Sections',
                },
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            const list = flattenApiContacts(res.data?.contacts || []);
            setContacts(list);
        } catch (err) {
            console.error('Failed to load contact details:', err);
            setContacts([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear, filterGradeId, filterSection]);

    // Backend already filters by grade/section — pass through as-is for the rendering layer.
    const filteredContacts = contacts;

    // ── Create / Edit dialog ──────────────────────────────────────────────────
    const [createOpen, setCreateOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);   // null = create, else editing this contact
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Class/Section multi-select
    const [selectedIds, setSelectedIds] = useState([]);
    const [expandedGrade, setExpandedGrade] = useState(null);

    // Repeatable name + numbers blocks
    const [blocks, setBlocks] = useState([{ name: '', numbers: [''] }]);

    const resetCreate = () => {
        setSelectedIds([]);
        setExpandedGrade(null);
        setBlocks([{ name: '', numbers: [''] }]);
    };

    const openCreate = () => { resetCreate(); setEditingId(null); setCreateOpen(true); };
    const closeCreate = () => { setCreateOpen(false); setEditingId(null); };

    const openEdit = (c) => {
        setEditingId(c.id);
        setSelectedIds(c.everyone ? allSectionIds : [...c.selectedIds]);
        setExpandedGrade(null);
        setBlocks([{ name: c.name, numbers: c.numbers.length ? [...c.numbers] : [''] }]);
        setCreateOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await axios.delete(deleteContactDetailsById, {
                params: {
                    ContactHeaderID: deleteTarget.contactHeaderID,
                    DeletedByRollNumber: authRollNumber,
                },
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            setDeleteTarget(null);
            fetchContacts();
        } catch (err) {
            console.error('Failed to delete contact:', err);
            setDeleteTarget(null);
        }
    };

    // ── selectedIds (gradeId-section[]) → API's gradeSections shape ───────────
    // Groups by gradeID; if every section of that grade is selected → allSections: true.
    const toGradeSectionsPayload = () => {
        const byGrade = new Map();
        selectedIds.forEach((id) => {
            const [gradeIdStr, section] = id.split('-');
            const gradeID = Number(gradeIdStr);
            if (!byGrade.has(gradeID)) byGrade.set(gradeID, new Set());
            byGrade.get(gradeID).add(section);
        });
        return [...byGrade.entries()].map(([gradeID, sectionSet]) => {
            const grade = grades.find((g) => g.id === gradeID);
            const allSections = grade && sectionSet.size === grade.sections.length;
            return {
                gradeID,
                allSections: !!allSections,
                sections: allSections ? [] : [...sectionSet],
            };
        });
    };

    // Tree helpers
    const allSectionIds = useMemo(
        () => grades.flatMap((g) => g.sections.map((s) => `${g.id}-${s}`)),
        [grades]
    );
    const isEveryoneChecked = () => allSectionIds.length > 0 && selectedIds.length === allSectionIds.length;
    const isEveryoneIndeterminate = () => selectedIds.length > 0 && selectedIds.length < allSectionIds.length;
    const handleSelectAll = () => setSelectedIds(isEveryoneChecked() ? [] : allSectionIds);

    const isGradeSelected = (grade) => grade.sections.every((s) => selectedIds.includes(`${grade.id}-${s}`));
    const isGradeIndeterminate = (grade) =>
        grade.sections.some((s) => selectedIds.includes(`${grade.id}-${s}`)) && !isGradeSelected(grade);
    const handleGradeToggle = (grade) => {
        const ids = grade.sections.map((s) => `${grade.id}-${s}`);
        setSelectedIds((prev) => (isGradeSelected(grade) ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]));
    };
    const handleSectionToggle = (gradeId, section) => {
        const id = `${gradeId}-${section}`;
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const renderTreeValue = () => {
        if (isEveryoneChecked()) return 'Everyone';
        const data = grades
            .map((g) => {
                const secs = g.sections.filter((s) => selectedIds.includes(`${g.id}-${s}`));
                return secs.length ? `${g.sign} (${secs.join(', ')})` : null;
            })
            .filter(Boolean);
        return data.length ? data.join(', ') : 'Select Class & Section';
    };

    // Blocks helpers
    const setBlockName = (i, val) => setBlocks((prev) => prev.map((b, idx) => (idx === i ? { ...b, name: val } : b)));
    const setNumber = (i, j, val) => {
        const clean = val.replace(/[^\d+\-\s]/g, '');
        setBlocks((prev) => prev.map((b, idx) => (idx === i ? { ...b, numbers: b.numbers.map((n, nj) => (nj === j ? clean : n)) } : b)));
    };
    const addNumber = (i) => setBlocks((prev) => prev.map((b, idx) => (idx === i ? { ...b, numbers: [...b.numbers, ''] } : b)));
    const removeNumber = (i, j) =>
        setBlocks((prev) => prev.map((b, idx) => (idx === i ? { ...b, numbers: b.numbers.length > 1 ? b.numbers.filter((_, nj) => nj !== j) : b.numbers } : b)));
    const addBlock = () => setBlocks((prev) => [...prev, { name: '', numbers: [''] }]);
    const removeBlock = (i) => setBlocks((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

    const handleSaveAll = async () => {
        const everyone = isEveryoneChecked();
        if (!everyone && selectedIds.length === 0) {
            alert('Please select at least one class & section (or Everyone).');
            return;
        }
        const valid = blocks
            .map((b) => ({ name: b.name.trim(), numbers: b.numbers.map((n) => n.trim()).filter(Boolean) }))
            .filter((b) => b.name && b.numbers.length > 0);
        if (valid.length === 0) {
            alert('Add at least one name with one phone number.');
            return;
        }

        const gradeSections = everyone ? [] : toGradeSectionsPayload();

        // ─ EDIT — PUT updateContactDetailsById, single contactPerson per header (per (a)) ─
        if (editingId) {
            const target = contacts.find((c) => c.id === editingId);
            if (!target) { closeCreate(); return; }
            const b = valid[0];
            const payload = {
                contactHeaderID: target.contactHeaderID,
                academicYear,
                updatedByRollNumber: authRollNumber,
                visibleToEveryone: everyone,
                gradeSections,
                contacts: [{ contactName: b.name, phoneNumbers: b.numbers }],
            };
            try {
                await axios.put(updateContactDetailsById, payload, {
                    headers: { Authorization: `Bearer ${TOKEN}` },
                });
                closeCreate();
                fetchContacts();
            } catch (err) {
                console.error('Failed to update contact:', err);
                alert(err?.response?.data?.message || 'Failed to update contact.');
            }
            return;
        }

        // ─ CREATE — POST postContactDetails. One header per save; if the user added multiple
        //   name+number blocks, fire one POST per block (each becomes its own header).
        try {
            for (const b of valid) {
                const payload = {
                    academicYear,
                    createdByRollNumber: authRollNumber,
                    visibleToEveryone: everyone,
                    gradeSections,
                    contacts: [{ contactName: b.name, phoneNumbers: b.numbers }],
                };
                // eslint-disable-next-line no-await-in-loop
                await axios.post(postContactDetails, payload, {
                    headers: { Authorization: `Bearer ${TOKEN}` },
                });
            }
            closeCreate();
            fetchContacts();
        } catch (err) {
            console.error('Failed to create contact:', err);
            alert(err?.response?.data?.message || 'Failed to create contact.');
        }
    };

    return (
        <Box sx={{ border: '1px solid #ccc', borderRadius: '20px', p: 2, height: '86vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: 28, height: 28 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                    </IconButton>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: `${mainColor}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ContactPhoneIcon sx={{ fontSize: 18, color: mainColor }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#111827', lineHeight: 1.1 }}>Contact Details</Typography>
                        <Typography sx={{ fontSize: '11px', color: '#6B7280', mt: 0.2 }}>Important school contacts by class & section</Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {/* Class / Section view filter */}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                            value={filterGradeId}
                            displayEmpty
                            onChange={(e) => { setFilterGradeId(e.target.value); setFilterSection(''); }}
                            sx={{ borderRadius: '8px', height: 36, fontSize: 13, fontWeight: 600 }}
                        >
                            <MenuItem value="" sx={{ fontSize: 13 }}>All Classes</MenuItem>
                            {grades.map((g) => (
                                <MenuItem key={g.id} value={g.id} sx={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 600 }}>{g.sign}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 110 }} disabled={!filterGrade}>
                        <Select
                            value={filterSection}
                            displayEmpty
                            onChange={(e) => setFilterSection(e.target.value)}
                            sx={{ borderRadius: '8px', height: 36, fontSize: 13, fontWeight: 600 }}
                        >
                            <MenuItem value="" sx={{ fontSize: 13 }}>All Sections</MenuItem>
                            {(filterGrade?.sections || []).map((s) => (
                                <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        onClick={openCreate}
                        startIcon={<PersonAddAlt1Icon sx={{ fontSize: 18 }} />}
                        variant="contained"
                        disableElevation
                        sx={{ textTransform: 'none', fontSize: 13, fontWeight: 700, bgcolor: mainColor, color: textColor, borderRadius: '8px', px: 2, height: 36, '&:hover': { bgcolor: mainColor, filter: 'brightness(0.92)' } }}
                    >
                        Add Contact
                    </Button>
                </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* Contact list */}
            <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
                <Grid container spacing={1.5}>
                    {filteredContacts.map((c) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c.id}>
                            <Box sx={{ p: 1.6, borderRadius: '12px', border: '1px solid #E5E7EB', bgcolor: '#fff', height: '100%', transition: '0.2s', '&:hover': { boxShadow: '0 2px 10px rgba(0,0,0,0.07)' } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                                    <Avatar sx={{ width: 42, height: 42, bgcolor: colorFor(c.name), fontSize: 14, fontWeight: 700 }}>{getInitials(c.name)}</Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }} noWrap>{c.name}</Typography>
                                        <Chip
                                            size="small"
                                            icon={c.everyone ? <GroupsIcon sx={{ fontSize: '13px !important' }} /> : undefined}
                                            label={c.everyone ? 'Everyone' : `${c.selectedIds.length} class(es)`}
                                            sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: `${mainColor}14`, color: mainColor, mt: 0.3, '& .MuiChip-icon': { color: mainColor } }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.2 }}>
                                        <Tooltip title="Edit contact" arrow>
                                            <IconButton size="small" onClick={() => openEdit(c)} sx={{ width: 28, height: 28, color: '#6B7280', '&:hover': { color: mainColor, bgcolor: `${mainColor}14` } }}>
                                                <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete contact" arrow>
                                            <IconButton size="small" onClick={() => setDeleteTarget(c)} sx={{ width: 28, height: 28, color: '#9CA3AF', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}>
                                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                                <Divider sx={{ mb: 1 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                                    {c.numbers.map((n, i) => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                            <PhoneIcon sx={{ fontSize: 14, color: '#16A34A' }} />
                                            <Typography sx={{ fontSize: 13, color: '#374151', fontWeight: 600, fontFamily: 'monospace' }}>{n}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                    {filteredContacts.length === 0 && (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ p: 5, textAlign: 'center', borderRadius: '12px', border: '1px dashed #E5E7EB', bgcolor: '#FAFAFA' }}>
                                <ContactPhoneIcon sx={{ fontSize: 44, color: '#D1D5DB', mb: 1 }} />
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>No contacts found</Typography>
                                <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 0.4 }}>Add a contact or change the class filter.</Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Box>

            {/* ── Create Contact dialog ───────────────────────────────────────── */}
            <Dialog open={createOpen} onClose={closeCreate} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '14px' } } }}>
                <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: `${mainColor}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PersonAddAlt1Icon sx={{ fontSize: 18, color: mainColor }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{editingId ? 'Edit Contact' : 'Add Contact'}</Typography>
                            <Typography sx={{ fontSize: 11, color: '#6B7280' }}>{editingId ? 'Update the classes, name and numbers' : 'Choose classes, then add one or more names with numbers'}</Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={closeCreate}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 2 }}>
                    {/* Class / Section multi-select (Select Students style) */}
                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#374151', mb: 0.5 }}>Visible to (Class &amp; Section) *</Typography>
                    <Box sx={{ mb: 2, border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
                        {/* Everyone = select all */}
                        <Box
                            onClick={handleSelectAll}
                            sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.3, cursor: 'pointer', borderBottom: '1px solid #F0F0F0', bgcolor: isEveryoneChecked() ? `${mainColor}0F` : '#FAFAFA' }}
                        >
                            <Checkbox
                                size="small"
                                checked={isEveryoneChecked()}
                                indeterminate={isEveryoneIndeterminate()}
                                sx={{ color: mainColor, '&.Mui-checked': { color: mainColor }, '&.MuiCheckbox-indeterminate': { color: mainColor } }}
                            />
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Everyone</Typography>
                        </Box>

                        {/* Grades → expand to sections (contained, scrolls inside the box) */}
                        <Box sx={{ maxHeight: 230, overflowY: 'auto' }}>
                            {grades.map((grade) => {
                                const expanded = expandedGrade === grade.id;
                                return (
                                    <Box key={grade.id} sx={{ borderBottom: '1px solid #F5F5F5' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.2 }}>
                                            <Checkbox
                                                size="small"
                                                checked={isGradeSelected(grade)}
                                                indeterminate={isGradeIndeterminate(grade)}
                                                onChange={() => handleGradeToggle(grade)}
                                                sx={{ color: mainColor, '&.Mui-checked': { color: mainColor }, '&.MuiCheckbox-indeterminate': { color: mainColor } }}
                                            />
                                            <Typography
                                                onClick={() => setExpandedGrade(expanded ? null : grade.id)}
                                                sx={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#374151', textTransform: 'uppercase', cursor: 'pointer' }}
                                            >
                                                {grade.sign}
                                            </Typography>
                                            <IconButton size="small" onClick={() => setExpandedGrade(expanded ? null : grade.id)}>
                                                <ExpandMoreIcon sx={{ fontSize: 18, color: '#6B7280', transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                                            </IconButton>
                                        </Box>
                                        <Collapse in={expanded}>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, px: 2, pb: 1 }}>
                                                {grade.sections.map((section) => {
                                                    const checked = selectedIds.includes(`${grade.id}-${section}`);
                                                    return (
                                                        <Chip
                                                            key={section}
                                                            label={section}
                                                            size="small"
                                                            onClick={() => handleSectionToggle(grade.id, section)}
                                                            sx={{
                                                                cursor: 'pointer', height: 26, fontSize: 12, fontWeight: 700,
                                                                bgcolor: checked ? mainColor : '#F3F4F6', color: checked ? textColor : '#374151',
                                                                border: '1px solid', borderColor: checked ? mainColor : '#E5E7EB',
                                                                '&:hover': { bgcolor: checked ? mainColor : '#E5E7EB', filter: checked ? 'brightness(0.95)' : 'none' },
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        </Collapse>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Selected summary */}
                        <Box sx={{ px: 1.2, py: 0.6, borderTop: '1px solid #F0F0F0', bgcolor: '#FAFAFA' }}>
                            <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {renderTreeValue()}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Repeatable name + numbers blocks */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#374151' }}>{editingId ? 'Contact' : `Contacts (${blocks.length})`}</Typography>
                        {!editingId && (
                            <Button
                                onClick={addBlock}
                                size="small"
                                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                                sx={{ textTransform: 'none', fontSize: 12, fontWeight: 700, color: mainColor, borderRadius: '6px', '&:hover': { bgcolor: `${mainColor}14` } }}
                            >
                                Add Another Name
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                        {blocks.map((b, i) => (
                            <Box key={i} sx={{ p: 1.4, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#FAFAFA' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Designation / Name — e.g. Front Office"
                                        value={b.name}
                                        onChange={(e) => setBlockName(i, e.target.value)}
                                        slotProps={{ input: { startAdornment: (<InputAdornment position="start"><BadgeOutlinedIcon sx={{ fontSize: 18, color: '#9CA3AF' }} /></InputAdornment>) } }}
                                        sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 38, fontSize: 13, fontWeight: 600 } }}
                                    />
                                    {blocks.length > 1 && (
                                        <Tooltip title="Remove this name" arrow>
                                            <IconButton size="small" onClick={() => removeBlock(i)} sx={{ color: '#DC2626' }}>
                                                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>

                                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>Phone Numbers</Typography>
                                <Grid container spacing={1}>
                                    {b.numbers.map((n, j) => (
                                        <Grid size={{ xs: 12, sm: 6 }} key={j}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                placeholder="e.g. 9876543210"
                                                value={n}
                                                onChange={(e) => setNumber(i, j, e.target.value)}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (<InputAdornment position="start"><PhoneIcon sx={{ fontSize: 16, color: '#16A34A' }} /></InputAdornment>),
                                                        endAdornment: b.numbers.length > 1 ? (
                                                            <InputAdornment position="end">
                                                                <IconButton size="small" onClick={() => removeNumber(i, j)} sx={{ p: 0.3 }}>
                                                                    <CloseIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ) : null,
                                                    },
                                                }}
                                                sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 38, fontSize: 13 } }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                                <Button
                                    onClick={() => addNumber(i)}
                                    size="small"
                                    startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                                    sx={{ mt: 0.8, textTransform: 'none', fontSize: 11.5, fontWeight: 700, color: '#374151', borderRadius: '6px', '&:hover': { bgcolor: '#F3F4F6' } }}
                                >
                                    Add Number
                                </Button>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                    <Button onClick={closeCreate} sx={{ textTransform: 'none', fontWeight: 700, color: '#374151', border: '1px solid #E5E7EB', borderRadius: '8px', px: 2.5, height: 38 }}>Cancel</Button>
                    <Button onClick={handleSaveAll} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, bgcolor: mainColor, color: textColor, borderRadius: '8px', px: 3, height: 38, '&:hover': { bgcolor: mainColor, filter: 'brightness(0.92)' } }}>
                        {editingId ? 'Update Contact' : 'Save All'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirmation */}
            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '14px' } } }}>
                <DialogContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: '#FEE2E2', mx: 'auto', mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DeleteOutlineIcon sx={{ fontSize: 28, color: '#DC2626' }} />
                    </Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#111827', mb: 0.6 }}>Delete this contact?</Typography>
                    <Typography sx={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                        <strong>{deleteTarget?.name}</strong> and its {deleteTarget?.numbers?.length || 0} number(s) will be removed. This can’t be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => setDeleteTarget(null)} fullWidth sx={{ textTransform: 'none', fontWeight: 700, color: '#374151', border: '1px solid #E5E7EB', borderRadius: '8px', height: 38 }}>Cancel</Button>
                    <Button onClick={confirmDelete} fullWidth variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#DC2626', color: '#fff', borderRadius: '8px', height: 38, '&:hover': { bgcolor: '#B91C1C' } }}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
