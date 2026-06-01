'use client';

import { useEffect, useCallback, useState } from 'react';
import { Button, Popover, Box, Typography, IconButton, Tooltip, CircularProgress } from '@mui/material';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useZoteroStore } from '@/app/stores/useZoteroStore';
import { ZoteroIcon } from './ZoteroIcon';

export const ZoteroAuthButton = () => {
  const { isAuthenticated, username, isCheckingAuth, checkAuthStatus, logout } = useZoteroStore();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Check auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Listen for postMessage from the OAuth popup
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data?.type === 'zotero-auth' && event.data.status === 'connected') {
        checkAuthStatus();
      }
    },
    [checkAuthStatus],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/zotero/auth/request-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnTo: window.location.pathname + window.location.search }),
      });
      const data = await res.json();
      if (data.authorizationUrl) {
        // Open in a centered popup
        const w = 600;
        const h = 700;
        const left = window.screenX + (window.outerWidth - w) / 2;
        const top = window.screenY + (window.outerHeight - h) / 2;
        window.open(
          data.authorizationUrl,
          'zotero-auth',
          `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`,
        );
      } else {
        console.error('No authorization URL returned:', data.error);
      }
    } catch (error) {
      console.error('Failed to start Zotero OAuth:', error);
    }
  };

  const handleDisconnect = async () => {
    setAnchorEl(null);
    await logout();
  };

  if (isCheckingAuth) {
    return <CircularProgress size={16} sx={{ color: '#fff', mx: 1 }} />;
  }

  if (!isAuthenticated) {
    return (
      <Tooltip title="Connect your Zotero account to save citations">
        <Button
          onClick={handleConnect}
          variant="text"
          disableRipple
          startIcon={<ZoteroIcon size={16} />}
          sx={{
            textTransform: 'none',
            fontFamily: 'var(--font-body), "Public Sans", system-ui, sans-serif',
            fontSize: '13.5px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            px: 1.5,
            py: 1.1,
            minWidth: 0,
            gap: '4px',
            color: 'rgba(255,255,255,.78)',
            background: 'transparent',
            '&:hover': {
              color: '#fff',
              background: 'transparent',
            },
          }}>
          Connect Zotero
        </Button>
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip title={`Zotero: ${username || 'Connected'}`}>
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            color: 'rgba(255,255,255,.78)',
            background: 'transparent',
            border: 'none',
            borderRadius: '6px',
            px: 1.5,
            py: 1.1,
            gap: 0.75,
            fontFamily: 'var(--font-body), "Public Sans", system-ui, sans-serif',
            fontSize: '13.5px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            '&:hover': {
              color: '#fff',
              background: 'transparent',
            },
          }}>
          <ZoteroIcon size={16} />
          <Box component="span" sx={{ display: { xs: 'none', md: 'inline' }, fontSize: '13.5px', fontWeight: 700 }}>
            {username || 'Zotero'}
          </Box>
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
            Zotero Connected
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {username || 'Unknown user'}
          </Typography>
          <Button
            onClick={handleDisconnect}
            size="small"
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<LinkOffIcon fontSize="small" />}
            sx={{ textTransform: 'none' }}>
            Disconnect
          </Button>
        </Box>
      </Popover>
    </>
  );
};
