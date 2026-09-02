import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Box, Typography, Button, Chip } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function HelpArticle({ article, color = '#EEA200', expanded, onToggle, onNavigate, showCategory = false }) {
  const video = article.video;

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      disableGutters
      elevation={0}
      square
      sx={{
        border: '1px solid',
        borderColor: expanded ? color : '#E5E7EB',
        borderRadius: '8px',
        bgcolor: '#fff',
        mb: 1,
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:before': { display: 'none' },
        '&:hover': { borderColor: expanded ? color : '#D1D5DB', boxShadow: '0 2px 6px rgba(16,24,40,0.07)' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 20, color: expanded ? color : '#9CA3AF' }} />}
        sx={{
          minHeight: 48,
          px: 1.75,
          '& .MuiAccordionSummary-content': { my: 1.25, mr: 1 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {showCategory && article.category ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 0.35 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: article.category.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#111827' }} noWrap>
                {article.category.title}
              </Typography>
              {article.topic ? (
                <>
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#D1D5DB', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }} noWrap>
                    {article.topic.title}
                  </Typography>
                </>
              ) : null}
            </Box>
          ) : null}
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#111827', lineHeight: 1.45 }}>
            {article.q}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 1.75, pt: 0, pb: 1.75 }}>
        <Box component="ol" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
          {(article.steps || []).map((step, index) => (
            <Box
              key={step}
              component="li"
              sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', mb: 0.9 }}
            >
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  flexShrink: 0,
                  mt: '2px',
                  bgcolor: color,
                  color: '#fff',
                  fontSize: 10.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {index + 1}
              </Box>
              <Typography sx={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{step}</Typography>
            </Box>
          ))}
        </Box>

        {article.note ? (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'flex-start',
              mt: 1.4,
              p: 1.2,
              borderRadius: '6px',
              bgcolor: '#F9FAFB',
              border: '1px solid #F3F4F6',
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#9CA3AF', mt: '1px' }} />
            <Typography sx={{ fontSize: 12.2, color: '#6B7280', lineHeight: 1.55 }}>{article.note}</Typography>
          </Box>
        ) : null}

        {video && expanded ? (
          <Box
            sx={{
              mt: 1.6,
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #E5E7EB',
              position: 'relative',
              pt: '56.25%',
            }}
          >
            <Box
              component="iframe"
              src={video.url}
              title={article.q}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            />
          </Box>
        ) : null}

        {(article.route && onNavigate) || video ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.6 }}>
            {article.route && onNavigate ? (
              <Button
                onClick={() => onNavigate(article.route)}
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: 12.5,
                  fontWeight: 600,
                  borderRadius: '6px',
                  color: color,
                  border: '1px solid',
                  borderColor: color,
                  px: 1.5,
                  py: 0.4,
                  '&:hover': { bgcolor: color, color: '#fff', borderColor: color },
                }}
              >
                Open this screen
              </Button>
            ) : null}
            {video ? (
              <Chip
                icon={<PlayCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                label={video.duration ? 'Demo video ' + video.duration : 'Demo video'}
                size="small"
                sx={{ fontSize: 11.5, fontWeight: 600, bgcolor: '#F3F4F6', color: '#4B5563' }}
              />
            ) : null}
          </Box>
        ) : null}
      </AccordionDetails>
    </Accordion>
  );
}
