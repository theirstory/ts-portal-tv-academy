'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, IconButton, Drawer, InputBase } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { config, organizationConfig, isChatEnabled, isZoteroEnabled } from '@/config/organizationConfig';
import { ZoteroAuthButton } from '@/components/zotero/ZoteroAuthButton';
import { useSemanticSearchStore } from '@/app/stores/useSemanticSearchStore';

export interface NavLink {
  name: string;
  href: string;
  icon?: React.ReactElement;
}

const NAV_LINK_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  px: 1.5,
  py: 1.1,
  fontFamily: 'var(--font-body), "Public Sans", system-ui, sans-serif',
  fontSize: '13.5px',
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: 'rgba(255,255,255,.78)',
  borderRadius: '6px',
  position: 'relative',
  transition: 'color .15s',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  '&:hover': { color: '#fff' },
  '&.active': { color: '#fff' },
  '&.active::after': {
    content: '""',
    position: 'absolute',
    left: '12px',
    right: '12px',
    bottom: '4px',
    height: '3px',
    background: 'var(--gold)',
    borderRadius: '2px',
  },
} as const;

const DRAWER_LINK_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  px: 2,
  py: 1.75,
  borderRadius: '8px',
  fontFamily: 'var(--font-body), "Public Sans", system-ui, sans-serif',
  fontSize: '16px',
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: 'rgba(255,255,255,.85)',
  textDecoration: 'none',
  '&:hover': { background: 'rgba(255,255,255,.06)', color: '#fff' },
  '&.active': { color: 'var(--gold)' },
} as const;

export const AppTopBar = () => {
  const { collections, loadCollections } = useSemanticSearchStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navQuery, setNavQuery] = useState('');

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';

  const submitNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = navQuery.trim();
    if (!trimmed) return;
    router.push(`/discover?q=${encodeURIComponent(trimmed)}`);
    setNavQuery('');
    setMobileOpen(false);
  };

  useEffect(() => {
    if (collections.length === 0) {
      loadCollections();
    }
  }, [collections.length, loadCollections]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isEmbed) return null;

  const isHomePage = pathname === '/';
  const isIndexPage = pathname.startsWith('/indexes');
  const isCollectionsPage = pathname.startsWith('/collections');
  const isDiscoverPage = pathname.startsWith('/discover');

  const showCollectionsLink = collections.length > 1;
  const organizationLogoPath = config.organization.logo?.path?.trim();
  const shouldUseCustomLogo = Boolean(organizationLogoPath);
  const logoAlt = config.organization.logo?.alt?.trim() || `${organizationConfig.displayName} logo`;

  return (
    <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 60 }}>
      <Box
        sx={{
          background: 'var(--navy-2)',
          boxShadow: '0 1px 0 rgba(0,0,0,.25)',
        }}>
        <Box
          sx={{
            maxWidth: '1440px',
            mx: 'auto',
            px: { xs: 2, md: 4 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: { xs: 72, md: 88 },
            gap: 2,
          }}>
          <Link
            href="/"
            style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}>
            {shouldUseCustomLogo ? (
              <Box
                component="img"
                src={organizationLogoPath}
                alt={logoAlt}
                sx={{
                  maxHeight: { xs: 44, md: 56 },
                  maxWidth: { xs: 200, sm: 260, md: 340 },
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '14px',
                  lineHeight: 1,
                }}>
                <Box
                  sx={{
                    fontFamily: 'var(--font-display), "Archivo", sans-serif',
                    fontWeight: 800,
                    color: 'var(--gold-ink)',
                    fontSize: { xs: '13px', md: '15px' },
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    lineHeight: 1.05,
                  }}>
                  <Box component="span" sx={{ display: 'block' }}>
                    Foundation
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: '2px',
                    alignSelf: 'stretch',
                    background: 'var(--gold)',
                    opacity: 0.9,
                  }}
                />
                <Box
                  sx={{
                    fontFamily: 'var(--font-display), "Archivo", sans-serif',
                    fontWeight: 800,
                    color: 'var(--blue-ink)',
                    fontSize: { xs: '18px', md: '24px' },
                    letterSpacing: '0.01em',
                  }}>
                  {organizationConfig.displayName}
                </Box>
              </Box>
            )}
          </Link>

          {/* Search field (between logo and nav) */}
          <Box
            component="form"
            role="search"
            onSubmit={submitNavSearch}
            sx={{
              display: { xs: 'none', md: 'flex' },
              flex: 1,
              maxWidth: 460,
              ml: 4,
              mr: 'auto',
              alignItems: 'center',
              gap: 1,
              background: 'rgba(255,255,255,.06)',
              border: '1.5px solid rgba(255,255,255,.16)',
              borderRadius: '8px',
              px: 1.5,
              height: 40,
              boxSizing: 'border-box',
              transition: 'border-color .15s, background .15s',
              '&:hover': { borderColor: 'rgba(255,255,255,.32)' },
              '&:focus-within': {
                borderColor: 'var(--gold)',
                background: 'rgba(255,255,255,.08)',
              },
            }}>
            <SearchRoundedIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,.6)' }} />
            <InputBase
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              placeholder="Ask the archive…"
              inputProps={{ 'aria-label': 'Search the archive' }}
              sx={{
                flex: 1,
                fontFamily: 'var(--font-body), "Public Sans", system-ui, sans-serif',
                fontSize: '14px',
                color: '#fff',
                '& input::placeholder': {
                  color: 'rgba(255,255,255,.5)',
                  opacity: 1,
                },
              }}
            />
          </Box>

          {/* Desktop nav */}
          <Box
            component="nav"
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 0.5,
            }}>
            <Box component={Link} href="/" className={isHomePage ? 'active' : ''} sx={NAV_LINK_SX}>
              Recordings
            </Box>
            <Box component={Link} href="/indexes" className={isIndexPage ? 'active' : ''} sx={NAV_LINK_SX}>
              Indexes
            </Box>
            {showCollectionsLink && (
              <Box
                component={Link}
                href="/collections"
                className={isCollectionsPage ? 'active' : ''}
                sx={NAV_LINK_SX}>
                Collections
              </Box>
            )}
            {isChatEnabled && (
              <Box
                component={Link}
                href="/discover"
                className={isDiscoverPage ? 'active' : ''}
                sx={NAV_LINK_SX}>
                <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                Discover
              </Box>
            )}
            {isZoteroEnabled && (
              <Box sx={{ ml: 1, display: 'inline-flex', alignItems: 'center' }}>
                <ZoteroAuthButton />
              </Box>
            )}
            <Box
              sx={{
                ml: 2,
                pl: 2,
                borderLeft: '1px solid rgba(255,255,255,.16)',
                fontFamily: 'var(--font-body), "Public Sans", system-ui, sans-serif',
                fontSize: '12px',
                color: 'rgba(255,255,255,.55)',
                whiteSpace: 'nowrap',
              }}>
              Powered by{' '}
              <Box
                component="a"
                href="https://theirstory.io/welcome"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'var(--gold)',
                  fontWeight: 700,
                  textDecoration: 'none',
                  '&:hover': { color: '#fff' },
                }}>
                TheirStory
              </Box>
            </Box>
          </Box>

          {/* Mobile hamburger */}
          <Box
            component="button"
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
            sx={{
              display: { xs: 'inline-flex', md: 'none' },
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background: 'rgba(255,255,255,.06)',
              border: '1.5px solid rgba(255,255,255,.28)',
              borderRadius: '8px',
              width: 44,
              height: 44,
              flexShrink: 0,
              cursor: 'pointer',
              padding: 0,
              transition: 'all .15s',
              '&:hover': { borderColor: 'var(--gold)', color: 'var(--gold)' },
            }}>
            {mobileOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
          </Box>
        </Box>
      </Box>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 'min(86vw, 320px)',
            background: 'var(--navy)',
            color: '#fff',
            borderLeft: '1px solid rgba(255,255,255,.08)',
          },
        }}
        sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderBottom: '1px solid rgba(255,255,255,.08)',
          }}>
          <Box
            sx={{
              fontFamily: 'var(--font-cond), "Oswald", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              fontWeight: 600,
              fontSize: '11.5px',
              color: 'var(--gold)',
            }}>
            Menu
          </Box>
          <IconButton
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            sx={{ color: '#fff', '&:hover': { color: 'var(--gold)' } }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 1.5, pb: 0 }}>
          <Box
            component="form"
            role="search"
            onSubmit={submitNavSearch}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              background: 'rgba(255,255,255,.06)',
              border: '1.5px solid rgba(255,255,255,.16)',
              borderRadius: '8px',
              px: 1.5,
              height: 44,
              '&:focus-within': {
                borderColor: 'var(--gold)',
                background: 'rgba(255,255,255,.08)',
              },
            }}>
            <SearchRoundedIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,.6)' }} />
            <InputBase
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              placeholder="Ask the archive…"
              inputProps={{ 'aria-label': 'Search the archive' }}
              sx={{
                flex: 1,
                fontFamily: 'var(--font-body), "Public Sans", system-ui, sans-serif',
                fontSize: '15px',
                color: '#fff',
                '& input::placeholder': {
                  color: 'rgba(255,255,255,.5)',
                  opacity: 1,
                },
              }}
            />
          </Box>
        </Box>
        <Box component="nav" sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box component={Link} href="/" className={isHomePage ? 'active' : ''} sx={DRAWER_LINK_SX}>
            Recordings
          </Box>
          <Box component={Link} href="/indexes" className={isIndexPage ? 'active' : ''} sx={DRAWER_LINK_SX}>
            Indexes
          </Box>
          {showCollectionsLink && (
            <Box
              component={Link}
              href="/collections"
              className={isCollectionsPage ? 'active' : ''}
              sx={DRAWER_LINK_SX}>
              Collections
            </Box>
          )}
          {isChatEnabled && (
            <Box
              component={Link}
              href="/discover"
              className={isDiscoverPage ? 'active' : ''}
              sx={{
                ...DRAWER_LINK_SX,
                mt: 1,
                border: '1.5px solid rgba(255,255,255,.22)',
                '&.active': {
                  background: 'var(--blue)',
                  borderColor: 'var(--blue)',
                  color: '#fff',
                },
              }}>
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
              Discover
            </Box>
          )}
          {isZoteroEnabled && (
            <Box sx={{ mt: 1, px: 1 }}>
              <ZoteroAuthButton />
            </Box>
          )}
        </Box>
        <Box
          sx={{
            mt: 'auto',
            px: 2,
            py: 2,
            borderTop: '1px solid rgba(255,255,255,.08)',
            fontFamily: 'var(--font-body), "Public Sans", system-ui, sans-serif',
            fontSize: '12px',
            color: 'rgba(255,255,255,.55)',
          }}>
          Powered by{' '}
          <Box
            component="a"
            href="https://theirstory.io/welcome"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'var(--gold)',
              fontWeight: 700,
              textDecoration: 'none',
              '&:hover': { color: '#fff' },
            }}>
            TheirStory
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};
