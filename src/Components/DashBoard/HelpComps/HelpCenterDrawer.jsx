import React, { useEffect, useMemo, useState } from 'react';
import { Drawer, Box, Typography, IconButton, TextField, InputAdornment, Button, Divider } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
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
} from './helpContent';

const DRAWER_WIDTH = 460;

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
  const popular = useMemo(() => getPopularArticles(categories, 5), [categories]);

  const goTo = (route) => {
    onClose();
    navigate(route);
  };

  const toggle = (id) => (event, isExpanded) => setExpanded(isExpanded ? id : null);

  const isSearching = query.trim().length > 0;

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
            {activeCategory && !isSearching ? (
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
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                {activeCategory && !isSearching ? activeCategory.title : 'Help & Support'}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>
                {activeCategory && !isSearching
                  ? activeCategory.caption
                  : 'Find an answer or reach the SchoolMate team.'}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: '#6B7280' }}>
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
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
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.4, mb: 1.2 }}>
              {results.length} RESULT{results.length === 1 ? '' : 'S'}
            </Typography>
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
        ) : activeCategory ? (
          activeCategory.articles.map((article) => (
            <HelpArticle
              key={article.id}
              article={article}
              color={activeCategory.color}
              expanded={expanded === article.id}
              onToggle={toggle(article.id)}
              onNavigate={goTo}
            />
          ))
        ) : (
          <>
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.4, mb: 1.2 }}>
              POPULAR QUESTIONS
            </Typography>
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

            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.4, mt: 2.5, mb: 1.2 }}>
              BROWSE BY MODULE
            </Typography>
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
                    width: 34, height: 34, borderRadius: '8px', bgcolor: category.bg, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <category.icon sx={{ fontSize: 18, color: category.color }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>
                    {category.title}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: '#9CA3AF', lineHeight: 1.4 }} noWrap>
                    {category.articles.length} articles
                  </Typography>
                </Box>
                <ChevronRightRoundedIcon sx={{ fontSize: 20, color: '#D1D5DB' }} />
              </Box>
            ))}
          </>
        )}
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

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ fontSize: 11.5, color: '#9CA3AF' }}>{SUPPORT.hours}</Typography>
          <Button
            onClick={() => goTo('/dashboardmenu/help')}
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 15 }} />}
            sx={{ textTransform: 'none', fontSize: 12, fontWeight: 700, color: '#111827', minWidth: 0 }}
          >
            All articles
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
