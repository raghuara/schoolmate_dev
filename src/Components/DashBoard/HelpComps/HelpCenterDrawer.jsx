import React, { useEffect, useMemo, useState } from 'react';
import { Drawer, Box, Typography, IconButton, TextField, InputAdornment, Button, Divider, Chip, Tooltip } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { hasMainMenuAccess } from '../../../Redux/Slices/AuthSlice';
import HelpArticle from './HelpArticle';
import {
  SUPPORT,
  getVisibleCategories,
  getCategoryIdForPath,
  getPopularArticles,
  searchArticles,
  countArticles,
} from './helpContent';

const DRAWER_WIDTH = 470;

const SectionLabel = ({ children, icon: Icon, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2 }}>
    {Icon ? <Icon sx={{ fontSize: 15, color: color || '#9CA3AF' }} /> : null}
    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>
      {children}
    </Typography>
  </Box>
);

export default function HelpCenterDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = useSelector((state) => state.auth.permissions);

  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const categories = useMemo(
    () => getVisibleCategories((menu) => hasMainMenuAccess(permissions, menu)),
    [permissions]
  );

  useEffect(() => {
    if (!open) return;
    const suggested = getCategoryIdForPath(location.pathname);
    const exists = categories.some((c) => c.id === suggested);
    setActiveId(exists ? suggested : null);
    setQuery('');
    setExpanded(null);
  }, [open, location.pathname, categories]);

  const activeCategory = categories.find((c) => c.id === activeId) || null;
  const results = useMemo(() => searchArticles(categories, query), [categories, query]);
  const popular = useMemo(() => getPopularArticles(categories, 6), [categories]);
  const totalArticles = useMemo(
    () => categories.reduce((total, category) => total + countArticles(category), 0),
    [categories]
  );

  const goTo = (route) => {
    onClose();
    navigate(route);
  };

  const toggle = (id) => (event, isExpanded) => setExpanded(isExpanded ? id : null);

  const isSearching = query.trim().length > 0;
  const showCategoryView = activeCategory && !isSearching;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: DRAWER_WIDTH,
            maxWidth: '100vw',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#F9FAFB',
          },
        },
      }}
    >
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, bgcolor: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
            {showCategoryView ? (
              <IconButton
                size="small"
                onClick={() => { setActiveId(null); setExpanded(null); }}
                sx={{ border: '1px solid #E5E7EB', borderRadius: '6px', width: 30, height: 30 }}
              >
                <ArrowBackRoundedIcon sx={{ fontSize: 17, color: '#4B5563' }} />
              </IconButton>
            ) : (
              <Box
                sx={{
                  width: 30, height: 30, borderRadius: '6px', bgcolor: '#FFF7E5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <HelpOutlineRoundedIcon sx={{ fontSize: 18, color: '#EEA200' }} />
              </Box>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.3 }} noWrap>
                {showCategoryView ? activeCategory.title : 'Help & Support'}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }} noWrap>
                {showCategoryView ? activeCategory.caption : 'Find an answer or reach the SchoolMate team.'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <Tooltip title="Open the full Help Center" arrow placement="bottom">
              <Button
                size="small"
                onClick={() => goTo('/dashboardmenu/help')}
                endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14, color: '#2563EB' }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#111827',
                  bgcolor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  px: 1.1,
                  py: 0.35,
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  '& .MuiButton-endIcon': { ml: 0.5 },
                  '&:hover': { bgcolor: '#F5F8FF', borderColor: '#2563EB' },
                }}
              >
                All articles
              </Button>
            </Tooltip>
            <IconButton size="small" onClick={onClose} sx={{ color: '#6B7280' }}>
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search help articles"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setExpanded(null); }}
          sx={{
            mt: 1.8,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: 13,
              bgcolor: '#F9FAFB',
              '& input::placeholder': { color: '#9CA3AF', opacity: 1 },
              '& fieldset': { borderColor: '#E5E7EB' },
              '&:hover fieldset': { borderColor: '#D1D5DB' },
              '&.Mui-focused fieldset': { borderColor: '#EEA200' },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
        {isSearching ? (
          <>
            <SectionLabel>{results.length} RESULT{results.length === 1 ? '' : 'S'}</SectionLabel>
            {results.length ? (
              results.map((article) => (
                <HelpArticle
                  key={article.category.id + '-' + article.id}
                  article={article}
                  color={article.category.color}
                  expanded={expanded === article.id}
                  onToggle={toggle(article.id)}
                  onNavigate={goTo}
                  showCategory
                />
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 5, bgcolor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>
                  No article matches that
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: '#9CA3AF', mt: 0.5 }}>
                  Try a different word, or contact the team below.
                </Typography>
              </Box>
            )}
          </>
        ) : showCategoryView ? (
          activeCategory.topics.map((topic, index) => (
            <Box key={topic.id} sx={{ mt: index === 0 ? 0 : 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                <Box
                  sx={{
                    width: 3,
                    height: 15,
                    borderRadius: '2px',
                    bgcolor: activeCategory.color,
                    flexShrink: 0,
                  }}
                />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                  {topic.title}
                </Typography>
                <Box
                  sx={{
                    px: 0.8,
                    py: '1px',
                    borderRadius: '10px',
                    bgcolor: '#F3F4F6',
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: '#6B7280',
                    lineHeight: 1.6,
                  }}
                >
                  {topic.articles.length}
                </Box>
                <Box sx={{ flex: 1, height: '1px', bgcolor: '#E5E7EB' }} />
              </Box>
              {topic.articles.map((article) => (
                <HelpArticle
                  key={article.id}
                  article={article}
                  color={activeCategory.color}
                  expanded={expanded === article.id}
                  onToggle={toggle(article.id)}
                  onNavigate={goTo}
                />
              ))}
            </Box>
          ))
        ) : (
          <>
            <SectionLabel icon={LocalFireDepartmentRoundedIcon} color="#111827">
              MOST ASKED
            </SectionLabel>
            {popular.map((article) => (
              <HelpArticle
                key={article.category.id + '-' + article.id}
                article={article}
                color={article.category.color}
                expanded={expanded === article.id}
                onToggle={toggle(article.id)}
                onNavigate={goTo}
                showCategory
              />
            ))}

            <Box sx={{ mt: 3 }}>
              <SectionLabel>BROWSE BY MODULE</SectionLabel>
              {categories.map((category) => (
                <Box
                  key={category.id}
                  onClick={() => { setActiveId(category.id); setExpanded(null); }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.4,
                    mb: 1,
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    bgcolor: '#fff',
                    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
                    cursor: 'pointer',
                    transition: '0.2s',
                    '&:hover': { borderColor: category.color, bgcolor: category.bg, boxShadow: '0 2px 6px rgba(16,24,40,0.07)' },
                  }}
                >
                  <Box
                    sx={{
                      width: 36, height: 36, borderRadius: '8px', bgcolor: category.bg, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <category.icon sx={{ fontSize: 19, color: category.color }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }} noWrap>
                      {category.title}
                    </Typography>
                    <Typography sx={{ fontSize: 11.5, color: '#9CA3AF', lineHeight: 1.45 }} noWrap>
                      {category.topics.map((t) => t.title).join(', ')}
                    </Typography>
                  </Box>
                  <Chip
                    label={countArticles(category)}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      bgcolor: category.bg,
                      color: category.color,
                      '& .MuiChip-label': { px: 0.9 },
                    }}
                  />
                  <ChevronRightRoundedIcon sx={{ fontSize: 20, color: '#D1D5DB' }} />
                </Box>
              ))}
            </Box>
          </>
        )}

        <Box
          onClick={() => goTo('/dashboardmenu/help')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mt: 2.5,
            p: 1.6,
            borderRadius: '10px',
            border: '1px solid #E5E7EB',
            bgcolor: '#fff',
            cursor: 'pointer',
            transition: '0.2s',
            '&:hover': { borderColor: '#2563EB', bgcolor: '#F5F8FF', boxShadow: '0 2px 8px rgba(37,99,235,0.12)' },
          }}
        >
          <Box
            sx={{
              width: 36, height: 36, borderRadius: '8px', bgcolor: '#EFF6FF', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MenuBookRoundedIcon sx={{ fontSize: 19, color: '#2563EB' }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
              Open the full Help Center
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.45 }}>
              Browse all {totalArticles} articles on one page
            </Typography>
          </Box>
          <OpenInNewRoundedIcon sx={{ fontSize: 17, color: '#2563EB' }} />
        </Box>
      </Box>

      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #E5E7EB', bgcolor: '#fff' }}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#111827', mb: 1.2 }}>
          Still need help?
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[
            { icon: MailOutlineRoundedIcon, label: 'Email us', value: SUPPORT.email, href: 'mailto:' + SUPPORT.email },
            { icon: CallOutlinedIcon, label: 'Call us', value: SUPPORT.phone, href: 'tel:' + SUPPORT.phone.replace(/\s/g, '') },
          ].map((row) => (
            <Box
              key={row.label}
              component="a"
              href={row.href}
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.1,
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                bgcolor: '#F9FAFB',
                textDecoration: 'none',
                transition: '0.2s',
                '&:hover': { borderColor: '#FCBE3A', bgcolor: '#FFFBEB' },
              }}
            >
              <row.icon sx={{ fontSize: 17, color: '#EEA200', flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 10.5, color: '#9CA3AF' }}>{row.label}</Typography>
                <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: '#111827' }} noWrap>
                  {row.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 1.4 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ fontSize: 11.5, color: '#9CA3AF' }}>
            Support hours: {SUPPORT.hours}
          </Typography>
          <Button
            onClick={() => goTo('/dashboardmenu/help')}
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14, color: '#2563EB' }} />}
            sx={{
              textTransform: 'none',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#111827',
              borderRadius: '6px',
              px: 1,
              py: 0.3,
              minWidth: 0,
              whiteSpace: 'nowrap',
              '& .MuiButton-endIcon': { ml: 0.5 },
              '&:hover': { bgcolor: '#F5F8FF' },
            }}
          >
            All articles
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
