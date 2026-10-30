'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { config, organizationConfig } from '@/config/organizationConfig';

export const LoginForm = ({ next, hasError }: { next: string; hasError: boolean }) => {
  const [submitting, setSubmitting] = useState(false);
  const logoPath = config.organization.logo?.path?.trim();
  const logoAlt = config.organization.logo?.alt?.trim() || `${organizationConfig.displayName} logo`;

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: 'var(--navy)',
      }}>
      <Box
        component="form"
        method="post"
        action="/api/auth/login"
        onSubmit={() => setSubmitting(true)}
        sx={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--paper)',
          borderRadius: '12px',
          borderTop: '4px solid var(--gold)',
          boxShadow: '0 24px 60px rgba(0,0,0,.35)',
          p: { xs: 3, sm: 5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}>
        {logoPath ? (
          <Box component="img" src={logoPath} alt={logoAlt} sx={{ maxHeight: 56, maxWidth: 260, objectFit: 'contain' }} />
        ) : (
          <Box
            sx={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '24px',
              color: 'var(--blue-ink)',
            }}>
            {organizationConfig.displayName}
          </Box>
        )}

        <Box>
          <Box
            component="h1"
            sx={{
              m: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '22px',
              color: 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
            <LockRoundedIcon sx={{ fontSize: 22, color: 'var(--gold-deep)' }} />
            Password required
          </Box>
          <Box component="p" sx={{ m: 0, mt: 1, fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--body)' }}>
            Enter the password to access this archive.
          </Box>
        </Box>

        <input type="hidden" name="next" value={next} />
        <Box
          component="input"
          type="password"
          name="password"
          autoFocus
          required
          autoComplete="current-password"
          aria-label="Password"
          aria-invalid={hasError}
          placeholder="Password"
          sx={{
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            px: 2,
            py: 1.5,
            borderRadius: '8px',
            border: `1px solid ${hasError ? '#c62828' : 'var(--rule)'}`,
            outline: 'none',
            '&:focus': { borderColor: 'var(--blue)', boxShadow: '0 0 0 3px var(--blue-tint)' },
          }}
        />
        {hasError && (
          <Box role="alert" sx={{ mt: -1, fontFamily: 'var(--font-body)', fontSize: '14px', color: '#c62828' }}>
            Incorrect password. Please try again.
          </Box>
        )}

        <Box
          component="button"
          type="submit"
          disabled={submitting}
          sx={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            py: 1.5,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'var(--navy)',
            background: 'var(--gold)',
            transition: 'background .15s',
            '&:hover': { background: 'var(--gold-deep)' },
            '&:disabled': { opacity: 0.7, cursor: 'default' },
          }}>
          {submitting ? 'Checking…' : 'Enter'}
        </Box>
      </Box>
    </Box>
  );
};
