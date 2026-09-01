import React, { useMemo, useState } from 'react';
import { Box, Grid, Typography, IconButton, TextField, InputAdornment, Divider, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { hasMainMenuAccess } from '../../../Redux/Slices/AuthSlice';
import HelpArticle from './HelpArticle';
import { SUPPORT, getVisibleCategories, searchArticles } from './helpContent';

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const permissions = useSelector((state) => state.auth.permissions);

  const categories = useMemo(
    () => getVisibleCategories((menu) => hasMainMenuAccess(permissions, menu)),
    [permissions]
  );

  const [activeId, setActiveId] = useState(categories[0]?.id || null);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(null);

  const activeCategory = categories.find((c) => c.id === activeId) || categories[0] || null;
  const results = useMemo(() => searchArticles(categories, query), [categories, query]);
  const isSearching = query.trim().length > 0;

  const toggle = (id) => (event, isExpanded) => setExpanded(isExpanded ? id : null);

  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: '20px', p: 2, height: '86vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography sx={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
              Help Center
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
              Step by step answers for every module in SchoolMate.
            </Typography>
          </Box>
        </Box>

        <TextField
          size="small"
          placeholder="Search help articles"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setExpanded(null); }}
          sx={{
            width: { xs: '100%', sm: 320 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: 13,
              bgcolor: '#F9FAFB',
              '& fieldset': { borderColor: '#E5E7EB' },
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

      <Divider sx={{ mt: 2 }} />

      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0, mt: 0 }}>
        <Grid
          size={{ xs: 12, sm: 12, md: 4, lg: 3 }}
          sx={{ height: '100%', overflowY: 'auto', pt: 2 }}
        >
          <Box sx={{ minHeight: '100%', bgcolor: '#F9FAFB', borderRadius: '12px', p: 1.5 }}>
          {categories.map((category) => {
            const active = !isSearching && activeCategory && activeCategory.id === category.id;
            return (
              <Box
                key={category.id}
                onClick={() => { setActiveId(category.id); setQuery(''); setExpanded(null); }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.3,
                  mb: 1,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: active ? category.color : '#E5E7EB',
                  bgcolor: active ? category.bg : '#fff',
                  transition: '0.2s',
                  '&:hover': { borderColor: category.color, bgcolor: category.bg },
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
                  <Typography sx={{ fontSize: '13.5px', fontWeight: '600', color: '#111827' }}>
                    {category.title}
                  </Typography>
                  <Typography sx={{ fontSize: '11.5px', color: '#9CA3AF' }}>
                    {category.articles.length} articles
                  </Typography>
                </Box>
              </Box>
            );
          })}

          <Box sx={{ mt: 2, p: 1.6, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontSize: '12.5px', fontWeight: '700', color: '#111827', mb: 1 }}>
              Still need help?
            </Typography>
            {[
              { icon: MailOutlineRoundedIcon, value: SUPPORT.email, href: 'mailto:' + SUPPORT.email },
              { icon: CallOutlinedIcon, value: SUPPORT.phone, href: 'tel:' + SUPPORT.phone.replace(/\s/g, '') },
            ].map((row) => (
              <Box
                key={row.value}
                component="a"
                href={row.href}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, mb: 0.8,
                  textDecoration: 'none', color: '#111827',
                }}
              >
                <row.icon sx={{ fontSize: 16, color: '#EEA200' }} />
                <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>{row.value}</Typography>
              </Box>
            ))}
            <Typography sx={{ fontSize: '11px', color: '#9CA3AF', mt: 0.6 }}>{SUPPORT.hours}</Typography>
          </Box>
          </Box>
        </Grid>

        <Grid
          size={{ xs: 12, sm: 12, md: 8, lg: 9 }}
          sx={{ height: '100%', overflowY: 'auto', pt: 2, pr: 0.5 }}
        >
          <Box sx={{ minHeight: '100%', bgcolor: '#F9FAFB', borderRadius: '12px', p: 1.75 }}>
          {isSearching ? (
            <>
              <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', mb: 1.5 }}>
                {results.length} result{results.length === 1 ? '' : 's'} for "{query}"
              </Typography>
              {results.map((article) => (
                <HelpArticle
                  key={article.category.id + '-' + article.id}
                  article={article}
                  color={article.category.color}
                  expanded={expanded === article.id}
                  onToggle={toggle(article.id)}
                  onNavigate={(route) => navigate(route)}
                  showCategory
                />
              ))}
              {!results.length ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    No article matches that
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: '#9CA3AF', mt: 0.5 }}>
                    Try a different word, or write to {SUPPORT.email}.
                  </Typography>
                </Box>
              ) : null}
            </>
          ) : activeCategory ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.8 }}>
                <Typography sx={{ fontSize: '17px', fontWeight: '700', color: '#111827' }}>
                  {activeCategory.title}
                </Typography>
                <Chip
                  label={activeCategory.articles.length + ' articles'}
                  size="small"
                  sx={{
                    fontSize: '11px',
                    fontWeight: '600',
                    bgcolor: activeCategory.bg,
                    color: activeCategory.color,
                  }}
                />
              </Box>
              {activeCategory.articles.map((article) => (
                <HelpArticle
                  key={article.id}
                  article={article}
                  color={activeCategory.color}
                  expanded={expanded === article.id}
                  onToggle={toggle(article.id)}
                  onNavigate={(route) => navigate(route)}
                />
              ))}
            </>
          ) : null}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
