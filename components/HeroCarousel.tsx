'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { WeaviateGenericObject } from 'weaviate-client';
import { Testimonies } from '@/types/weaviate';
import { getMuxPlaybackId } from '@/app/utils/converters';
import { durationFormatHandler } from '@/app/utils/util';

const AUTOPLAY_MS = 5000;

type FeaturedStory = WeaviateGenericObject<Testimonies, any>;

const muxThumbUrl = (videoUrl: string | null | undefined, width = 1280, height = 720): string | null => {
  if (!videoUrl) return null;
  const id = getMuxPlaybackId(videoUrl);
  if (!id) return null;
  return `https://image.mux.com/${id}/thumbnail.jpg?time=12&width=${width}&height=${height}&fit_mode=crop`;
};

const stripInterviewSuffix = (title: string): string => title.replace(/\s*interview\s*$/i, '').trim();

const truncate = (s: string, n: number): string => {
  if (!s) return '';
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > n - 30 ? lastSpace : n).trim()}…`;
};

type SlideProps = {
  story: FeaturedStory;
  visible: boolean;
};

const Slide = ({ story, visible }: SlideProps) => {
  const title = stripInterviewSuffix(story.properties.interview_title || '');
  const eyebrow = 'Featured Interview';
  const description = truncate(story.properties.interview_description || '', 220);
  const duration = durationFormatHandler(story.properties.interview_duration);
  const thumb = muxThumbUrl(story.properties.video_url);
  const initial = (title[0] || '·').toUpperCase();

  return (
    <Box
      aria-hidden={!visible}
      sx={{
        position: 'absolute',
        inset: 0,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
        pointerEvents: visible ? 'auto' : 'none',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
        gridTemplateRows: { xs: 'minmax(260px, 320px) 1fr', md: '100%' },
      }}>
      {/* Portrait */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(120% 90% at 30% 18%, rgba(255,255,255,.16), transparent 60%), linear-gradient(160deg, #1c3a52 0%, #0b1a28 78%), #0b1a28',
        }}>
        {thumb && (
          <Box
            component="img"
            src={thumb}
            alt=""
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.85,
              mixBlendMode: 'luminosity',
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(160deg, rgba(11,26,40,.10) 0%, rgba(11,26,40,.55) 78%), linear-gradient(180deg, rgba(0,163,218,.10), rgba(241,173,20,.10))',
            mixBlendMode: 'multiply',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,.08) 0 1px, transparent 1px 3px)',
            opacity: 0.45,
            mixBlendMode: 'multiply',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg, rgba(0,0,0,.55), transparent 55%)',
          }}
        />
        <Typography
          component="span"
          aria-hidden
          sx={{
            position: 'absolute',
            right: '-3%',
            bottom: '-8%',
            fontFamily: 'var(--font-display), "Archivo", sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(80px, 22vw, 260px)',
            lineHeight: 0.8,
            letterSpacing: '-0.04em',
            color: 'rgba(255,255,255,0.08)',
            userSelect: 'none',
          }}>
          {initial}
        </Typography>
        <Box
          component={Link}
          href={`/story/${story.uuid}`}
          aria-label={`Watch ${title}`}
          sx={{
            position: 'absolute',
            left: { xs: 18, md: 32 },
            bottom: { xs: 18, md: 32 },
            width: { xs: 48, md: 60 },
            height: { xs: 48, md: 60 },
            borderRadius: '50%',
            background: 'var(--gold)',
            color: 'var(--ink)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,.35)',
            transition: 'transform .15s',
            textDecoration: 'none',
            '&:hover': { transform: 'scale(1.06)' },
          }}>
          <PlayArrowRoundedIcon sx={{ fontSize: { xs: 30, md: 38 } }} />
        </Box>
        {duration && (
          <Box
            sx={{
              position: 'absolute',
              right: { xs: 12, md: 22 },
              bottom: { xs: 18, md: 32 },
              background: 'rgba(11,26,40,.6)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,.18)',
              color: '#fff',
              fontFamily: 'var(--font-cond), "Oswald", sans-serif',
              fontWeight: 600,
              letterSpacing: '0.08em',
              fontSize: '12px',
              padding: '5px 10px',
              borderRadius: '999px',
            }}>
            {duration}
          </Box>
        )}
      </Box>

      {/* Copy */}
      <Box
        sx={{
          color: '#fff',
          background: 'var(--navy)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 3, sm: 4, md: 6 },
          py: { xs: 4, md: 6 },
        }}>
        <Typography
          component="span"
          sx={{
            fontFamily: 'var(--font-cond), "Oswald", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            fontWeight: 600,
            fontSize: '12.5px',
            color: 'var(--gold)',
            mb: 1.5,
          }}>
          {eyebrow}
        </Typography>
        <Typography
          component="h2"
          sx={{
            margin: 0,
            fontFamily: 'var(--font-display), "Archivo", sans-serif',
            fontWeight: 900,
            letterSpacing: '-0.01em',
            lineHeight: 1.02,
            fontSize: { xs: '30px', sm: '38px', md: 'clamp(36px, 3.6vw, 52px)' },
            color: '#fff',
            textWrap: 'balance',
            mb: 2,
          }}>
          {title}
        </Typography>
        {description && (
          <Typography
            component="p"
            sx={{
              margin: 0,
              color: 'rgba(255,255,255,.78)',
              fontSize: { xs: '15px', md: '17px' },
              lineHeight: 1.6,
              maxWidth: 480,
              mb: 3.5,
            }}>
            {description}
          </Typography>
        )}
        <Box
          component={Link}
          href={`/story/${story.uuid}`}
          sx={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '6px',
            background: 'var(--gold)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-body), "Public Sans", sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'all .18s',
            '&:hover': { background: 'var(--gold-deep)', transform: 'translateY(-1px)' },
          }}>
          <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />
          Watch the interview
        </Box>
      </Box>
    </Box>
  );
};

export const HeroCarousel = ({ stories }: { stories: FeaturedStory[] }) => {
  const slides = useMemo(() => stories, [stories]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  const goPrev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);
  const goNext = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);

  if (slides.length === 0) return null;

  return (
    <Box
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      sx={{
        position: 'relative',
        background: 'var(--navy)',
        overflow: 'hidden',
        flexShrink: 0,
        width: '100%',
        height: { xs: 600, sm: 640, md: 'clamp(440px, 60vh, 600px)' },
      }}>
      {slides.map((story, i) => (
        <Slide key={story.uuid} story={story} visible={i === index} />
      ))}

      {slides.length > 1 && (
        <>
          <Box
            component="button"
            type="button"
            aria-label="Previous"
            onClick={goPrev}
            sx={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              left: { xs: 8, md: 18 },
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(11,26,40,.45)',
              backdropFilter: 'blur(6px)',
              border: '1.5px solid rgba(255,255,255,.35)',
              color: '#fff',
              display: { xs: 'none', sm: 'inline-flex' },
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 4,
              transition: 'all .18s',
              '&:hover': { background: 'var(--gold)', borderColor: 'var(--gold)', color: 'var(--ink)' },
            }}>
            <ChevronLeftIcon />
          </Box>
          <Box
            component="button"
            type="button"
            aria-label="Next"
            onClick={goNext}
            sx={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              left: { md: 'calc(52.5% - 60px)' },
              right: { xs: 8, md: 'auto' },
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(11,26,40,.45)',
              backdropFilter: 'blur(6px)',
              border: '1.5px solid rgba(255,255,255,.35)',
              color: '#fff',
              display: { xs: 'none', sm: 'inline-flex' },
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 4,
              transition: 'all .18s',
              '&:hover': { background: 'var(--gold)', borderColor: 'var(--gold)', color: 'var(--ink)' },
            }}>
            <ChevronRightIcon />
          </Box>
          <Box
            role="tablist"
            aria-label="Featured interviews"
            sx={{
              position: 'absolute',
              right: { xs: 14, md: 26 },
              bottom: { xs: 14, md: 22 },
              display: 'inline-flex',
              gap: '8px',
              zIndex: 4,
            }}>
            {slides.map((_, i) => {
              const on = i === index;
              return (
                <Box
                  key={i}
                  component="button"
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-label={`Show slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  sx={{
                    width: on ? 26 : 9,
                    height: 9,
                    padding: 0,
                    border: 'none',
                    borderRadius: on ? '5px' : '50%',
                    background: on ? 'var(--gold)' : 'rgba(255,255,255,.35)',
                    cursor: 'pointer',
                    transition: 'width .2s ease, background .2s ease',
                  }}
                />
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
};
