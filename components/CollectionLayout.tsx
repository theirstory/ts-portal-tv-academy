'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useSemanticSearchStore } from '@/app/stores/useSemanticSearchStore';
import { CircularProgress } from '@mui/material';
import { WeaviateReturn } from 'weaviate-client';
import { Testimonies } from '@/types/weaviate';
import { ListView } from './ListView';
import { GridView } from './GridView';
import { SearchTable } from './SearchTable';
import { SearchBox } from './SearchBox';
import { ActiveFiltersDisplay } from './ActiveFiltersDisplay';
import { Pagination } from './Pagination';
import { NoInterviewsMessage } from './NoInterviewsMessage';
import { WelcomeBand } from './WelcomeBand';
import { HeroCarousel } from './HeroCarousel';

export default function CollectionLayout() {
  const { loading: semanticSearchLoading, stories, result, currentPage, hasSearched } = useSemanticSearchStore();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const searchParams = useSearchParams();
  const collectionParam = searchParams.get('collection');
  const isUnfilteredHome = !hasSearched && !collectionParam;

  const storiesTestimonies = stories as WeaviateReturn<Testimonies, any> | null;
  const results = result?.objects || [];

  const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: 'list' | 'grid') => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }} id="collection-layout-container">
      {isUnfilteredHome && storiesTestimonies?.objects && storiesTestimonies.objects.length > 0 && (
        <>
          <HeroCarousel stories={storiesTestimonies.objects} />
          <WelcomeBand />
        </>
      )}

      <Box
        sx={{
          maxWidth: '1440px',
          mx: 'auto',
          width: '100%',
          paddingX: { xs: 2, sm: 3, md: 4 },
          paddingTop: { xs: 3, md: 5 },
          paddingBottom: { xs: 3, md: 5 },
        }}>
        {isUnfilteredHome && storiesTestimonies?.objects && storiesTestimonies.objects.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 2,
              mb: { xs: 2, md: 3 },
              flexWrap: 'wrap',
            }}>
            <Box>
              <Typography
                component="span"
                sx={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-cond), "Oswald", sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  color: 'var(--gold-ink)',
                  mb: 1,
                }}>
                The Collection
              </Typography>
              <Typography
                component="h2"
                sx={{
                  margin: 0,
                  fontFamily: 'var(--font-display), "Archivo", sans-serif',
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  fontSize: { xs: '26px', md: '34px' },
                  color: 'var(--ink)',
                }}>
                Browse the Archive
              </Typography>
            </Box>
          </Box>
        )}

        <SearchBox viewMode={viewMode} onViewChange={handleViewChange} />

        <ActiveFiltersDisplay />

        {semanticSearchLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: { xs: 6, md: 10 } }}>
            <CircularProgress size={'50px'} />
          </Box>
        )}

        {!semanticSearchLoading && hasSearched && results.length > 0 && <SearchTable />}

        {!semanticSearchLoading &&
          !hasSearched &&
          storiesTestimonies?.objects &&
          storiesTestimonies.objects.length > 0 && (
            <>
              {viewMode === 'list' ? <ListView /> : <GridView />}
              <Box sx={{ mt: { xs: 2, md: 3 } }}>
                <Pagination />
              </Box>
            </>
          )}

        {!semanticSearchLoading && hasSearched && results.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: { xs: 4, md: 8 },
            }}>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                textAlign: 'center',
              }}>
              {currentPage > 1 ? 'There are no more stories available.' : 'No stories available.'}
            </Typography>
          </Box>
        )}

        {!semanticSearchLoading &&
          !hasSearched &&
          storiesTestimonies?.objects &&
          storiesTestimonies.objects.length === 0 &&
          (currentPage > 1 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: { xs: 4, md: 8 },
              }}>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  textAlign: 'center',
                }}>
                There are no more stories available.
              </Typography>
            </Box>
          ) : (
            <NoInterviewsMessage />
          ))}
      </Box>
    </Box>
  );
}
