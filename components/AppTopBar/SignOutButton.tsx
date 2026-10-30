'use client';

import React, { useEffect, useState } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

/** Renders only when the site password gate is enabled. */
export const SignOutButton = ({ sx, iconSize = 16 }: { sx: SxProps<Theme>; iconSize?: number }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => (res.ok ? res.json() : { enabled: false }))
      .then((data) => setEnabled(Boolean(data.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;

  return (
    <Box component="form" method="post" action="/api/auth/logout" sx={{ display: 'contents' }}>
      <Box
        component="button"
        type="submit"
        sx={[
          { background: 'none', border: 'none', cursor: 'pointer', width: 'auto' },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}>
        <LogoutRoundedIcon sx={{ fontSize: iconSize }} />
        Sign out
      </Box>
    </Box>
  );
};
