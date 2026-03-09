'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import MuxPlayer from '@mux/mux-player-react';
import MuxPlayerElement from '@mux/mux-player';
import { useChatStore } from '@/app/stores/useChatStore';
import { colors } from '@/lib/theme';
import { Transcription, Section, Word } from '@/types/transcription';

type TranscriptData = {
  transcription: Transcription;
  videoUrl: string;
  isAudioFile: boolean;
  interviewTitle: string;
};

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Hyperaudio-lite inspired word-level transcript component
const TranscriptWord = ({
  word,
  isActive,
  isPast,
  isHighlighted,
  isActiveMatch,
  matchKey,
  onClick,
}: {
  word: Word;
  isActive: boolean;
  isPast: boolean;
  isHighlighted: boolean;
  isActiveMatch?: boolean;
  matchKey?: string;
  onClick: () => void;
}) => (
  <span
    onClick={onClick}
    data-start={word.start}
    {...(matchKey ? { 'data-match-key': matchKey } : {})}
    style={{
      cursor: 'pointer',
      display: 'inline',
      backgroundColor: isActiveMatch
        ? colors.warning.main
        : isActive
          ? colors.warning.main
          : isHighlighted
            ? `${colors.warning.main}40`
            : 'transparent',
      color: isPast && !isActive && !isHighlighted && !isActiveMatch ? colors.text.secondary : colors.text.primary,
      borderRadius: isActive || isActiveMatch ? '2px' : undefined,
      outline: isActiveMatch ? `2px solid ${colors.primary.main}` : undefined,
      transition: 'background-color 0.1s, color 0.1s',
    }}>
    {word.text}{' '}
  </span>
);

const TranscriptSection = ({
  section,
  sectionIndex,
  currentTime,
  highlightStart,
  highlightEnd,
  searchTerm,
  activeMatchKey,
  isExpanded,
  onToggle,
  onWordClick,
}: {
  section: Section;
  sectionIndex: number;
  currentTime: number;
  highlightStart: number;
  highlightEnd: number;
  searchTerm: string;
  activeMatchKey: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onWordClick: (time: number) => void;
}) => {
  const searchLower = searchTerm.toLowerCase();

  return (
    <Accordion
      expanded={isExpanded}
      onChange={onToggle}
      disableGutters
      sx={{
        '&:before': { display: 'none' },
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        data-section-start={section.start}
        sx={{
          bgcolor: colors.primary.main,
          color: colors.primary.contrastText,
          minHeight: 40,
          '&.Mui-expanded': { minHeight: 40 },
          '& .MuiAccordionSummary-content': { my: 0.75 },
          '& .MuiAccordionSummary-expandIconWrapper': { color: colors.primary.contrastText },
        }}>
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {formatTimestamp(section.start)} &middot; {section.title}
          </Typography>
          {section.synopsis && (
            <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mt: 0.25 }}>
              {section.synopsis}
            </Typography>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, py: 1.5 }}>
        {section.paragraphs.map((para, pIdx) => (
          <Box key={pIdx} sx={{ mb: 1.5 }}>
            {para.speaker && (
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ display: 'block', mb: 0.25 }}>
                {para.speaker} &middot; {formatTimestamp(para.start)}
              </Typography>
            )}
            <Typography variant="body2" component="div" sx={{ lineHeight: 1.8 }}>
              {para.words.map((word, wIdx) => {
                const isPlaying =
                  currentTime >= word.start &&
                  currentTime < (para.words[wIdx + 1]?.start ?? word.end);
                const isPast = currentTime >= word.end;
                const isCitationHighlight =
                  word.start >= highlightStart && word.end <= highlightEnd;
                const isSearchMatch =
                  !!searchLower && word.text.toLowerCase().includes(searchLower);
                const matchKey = isSearchMatch ? `${sectionIndex}-${pIdx}-${wIdx}` : undefined;
                const isActiveMatch = matchKey !== undefined && matchKey === activeMatchKey;

                return (
                  <TranscriptWord
                    key={wIdx}
                    word={word}
                    isActive={isPlaying}
                    isPast={isPast}
                    isHighlighted={isCitationHighlight || isSearchMatch}
                    isActiveMatch={isActiveMatch}
                    matchKey={matchKey}
                    onClick={() => onWordClick(word.start)}
                  />
                );
              })}
            </Typography>
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

export const SidePanelTranscriptView = () => {
  const transcriptCitation = useChatStore((s) => s.transcriptCitation);
  const previousMode = useChatStore((s) => s.previousMode);
  const goBack = useChatStore((s) => s.goBack);

  const [data, setData] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const videoRef = useRef<MuxPlayerElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const storyId = transcriptCitation?.theirstoryId;
  const highlightStart = transcriptCitation?.startTime ?? 0;
  const highlightEnd = transcriptCitation?.endTime ?? 0;

  // Fetch transcript data
  useEffect(() => {
    if (!storyId) return;
    setLoading(true);
    setError(null);
    hasScrolledRef.current = false;

    fetch(`/api/transcript?storyId=${encodeURIComponent(storyId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch transcript');
        return res.json();
      })
      .then((d: TranscriptData) => {
        setData(d);
        // Expand all sections by default
        const allSections = new Set<number>(d.transcription.sections.map((_, i) => i));
        setExpandedSections(allSections);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [storyId, highlightStart]);

  // Scroll to the active word after data loads and sections expand
  useEffect(() => {
    if (!data || hasScrolledRef.current) return;
    hasScrolledRef.current = true;

    // Retry until the word elements are rendered (sections may still be expanding)
    let attempts = 0;
    const tryScroll = () => {
      const container = transcriptContainerRef.current;
      if (!container) return;

      const words = container.querySelectorAll('[data-start]');
      let closest: Element | null = null;
      let closestDist = Infinity;

      for (const el of words) {
        const start = parseFloat(el.getAttribute('data-start') || '0');
        const dist = Math.abs(start - highlightStart);
        if (dist < closestDist) {
          closestDist = dist;
          closest = el;
        }
        // Once we pass the target, the previous closest is good enough
        if (start > highlightStart + 1) break;
      }

      if (closest) {
        closest.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (attempts < 5) {
        attempts++;
        setTimeout(tryScroll, 200);
      }
    };

    setTimeout(tryScroll, 300);
  }, [data, highlightStart]);

  // Throttled time update from player
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleWordClick = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  }, []);

  const toggleSection = useCallback((index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  // Compute search matches as a flat list of word keys (sectionIdx-paraIdx-wordIdx)
  const searchMatches = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q || !data) return [];
    const matches: string[] = [];
    data.transcription.sections.forEach((section, sIdx) => {
      section.paragraphs.forEach((para, pIdx) => {
        para.words.forEach((word, wIdx) => {
          if (word.text.toLowerCase().includes(q)) {
            matches.push(`${sIdx}-${pIdx}-${wIdx}`);
          }
        });
      });
    });
    return matches;
  }, [searchTerm, data]);

  // Reset active match when search changes
  useEffect(() => {
    setActiveMatchIndex(0);
  }, [searchTerm]);

  const totalMatches = searchMatches.length;
  const activeMatchKey = searchMatches[activeMatchIndex] ?? null;

  // Scroll to active match
  useEffect(() => {
    if (!activeMatchKey || !transcriptContainerRef.current) return;
    // Ensure the section containing the match is expanded
    const sectionIdx = parseInt(activeMatchKey.split('-')[0], 10);
    setExpandedSections((prev) => {
      if (prev.has(sectionIdx)) return prev;
      const next = new Set(prev);
      next.add(sectionIdx);
      return next;
    });
    // Scroll after expansion renders
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = transcriptContainerRef.current?.querySelector(`[data-match-key="${activeMatchKey}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    });
  }, [activeMatchKey]);

  const goToNextMatch = useCallback(() => {
    if (totalMatches === 0) return;
    setActiveMatchIndex((prev) => (prev + 1) % totalMatches);
  }, [totalMatches]);

  const goToPrevMatch = useCallback(() => {
    if (totalMatches === 0) return;
    setActiveMatchIndex((prev) => (prev - 1 + totalMatches) % totalMatches);
  }, [totalMatches]);

  if (!transcriptCitation) return null;

  const backLabel = previousMode === 'search' ? 'Back to results' : 'Back to source';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          bgcolor: colors.background.paper,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 1,
          py: 0.5,
        }}>
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={goBack}
          sx={{ textTransform: 'none' }}>
          {backLabel}
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {error && (
        <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      )}

      {data && (
        <>
          {/* Video player — compact to maximize transcript space */}
          <Box sx={{ flexShrink: 0, bgcolor: colors.common.black }}>
            <MuxPlayer
              ref={videoRef}
              src={data.videoUrl}
              audio={data.isAudioFile}
              startTime={highlightStart}
              forwardSeekOffset={10}
              backwardSeekOffset={10}
              accentColor={colors.secondary.main}
              onTimeUpdate={handleTimeUpdate}
              style={{ width: '100%', aspectRatio: data.isAudioFile ? 'auto' : '21/9' }}
            />
          </Box>

          {/* Search field with navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.75, flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (e.shiftKey) goToPrevMatch();
                  else goToNextMatch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm.trim() && totalMatches > 0 ? (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', mr: 0.5 }}>
                      {activeMatchIndex + 1}/{totalMatches}
                    </Typography>
                  </InputAdornment>
                ) : searchTerm.trim() ? (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.secondary">
                      0
                    </Typography>
                  </InputAdornment>
                ) : null,
              }}
              sx={{ bgcolor: colors.background.default, borderRadius: '8px' }}
            />
            <Box
              component="button"
              onClick={goToPrevMatch}
              disabled={totalMatches === 0}
              sx={{
                border: 'none',
                bgcolor: 'transparent',
                cursor: totalMatches > 0 ? 'pointer' : 'default',
                opacity: totalMatches > 0 ? 1 : 0.3,
                p: 0.5,
                borderRadius: 1,
                display: 'flex',
                '&:hover': totalMatches > 0 ? { bgcolor: colors.grey[100] } : {},
              }}>
              <KeyboardArrowUpIcon fontSize="small" />
            </Box>
            <Box
              component="button"
              onClick={goToNextMatch}
              disabled={totalMatches === 0}
              sx={{
                border: 'none',
                bgcolor: 'transparent',
                cursor: totalMatches > 0 ? 'pointer' : 'default',
                opacity: totalMatches > 0 ? 1 : 0.3,
                p: 0.5,
                borderRadius: 1,
                display: 'flex',
                '&:hover': totalMatches > 0 ? { bgcolor: colors.grey[100] } : {},
              }}>
              <KeyboardArrowDownIcon fontSize="small" />
            </Box>
          </Box>

          {/* Transcript */}
          <Box ref={transcriptContainerRef} sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            {data.transcription.sections.map((section, idx) => (
              <TranscriptSection
                key={idx}
                section={section}
                sectionIndex={idx}
                currentTime={currentTime}
                highlightStart={highlightStart}
                highlightEnd={highlightEnd}
                searchTerm={searchTerm}
                activeMatchKey={activeMatchKey}
                isExpanded={expandedSections.has(idx)}
                onToggle={() => toggleSection(idx)}
                onWordClick={handleWordClick}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};
