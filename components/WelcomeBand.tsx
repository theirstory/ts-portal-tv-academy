'use client';

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { organizationConfig } from '@/config/organizationConfig';

const splitDescription = (desc: string): { lead: string; tagline: string | null } => {
  if (!desc) return { lead: '', tagline: null };
  const match = desc.match(/([A-Z][A-Z\s,.'-]{12,})\s*$/);
  if (match) {
    const tagline = match[1].trim();
    const lead = desc.slice(0, match.index).trim().replace(/[.,;:]+$/, '');
    return { lead: lead || desc, tagline };
  }
  return { lead: desc, tagline: null };
};

export const WelcomeBand = () => {
  const { lead, tagline } = useMemo(() => splitDescription(organizationConfig.description || ''), []);

  return (
    <Box
      sx={{
        background: 'var(--paper)',
        borderBottom: '1px solid var(--rule)',
      }}>
      <Box
        sx={{
          maxWidth: '1440px',
          mx: 'auto',
          px: { xs: 2, md: 4 },
          py: { xs: 4, md: 7 },
        }}>
        <Typography
          component="span"
          sx={{
            display: 'inline-block',
            fontFamily: 'var(--font-cond), "Oswald", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            fontWeight: 600,
            fontSize: '12.5px',
            color: 'var(--blue-ink)',
            mb: 2,
          }}>
          Foundation Archive
        </Typography>
        <Typography
          component="p"
          sx={{
            fontFamily: 'var(--font-serif), "Source Serif 4", Georgia, serif',
            fontSize: { xs: '20px', sm: '22px', md: '26px' },
            lineHeight: 1.4,
            color: 'var(--ink)',
            margin: 0,
            maxWidth: '880px',
            textWrap: 'balance',
          }}>
          {lead}
        </Typography>
        {tagline && (
          <Typography
            component="p"
            sx={{
              mt: 2.5,
              fontFamily: 'var(--font-cond), "Oswald", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--gold-ink)',
              fontWeight: 600,
              fontSize: { xs: '11.5px', md: '13px' },
              margin: 0,
            }}>
            {tagline}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
