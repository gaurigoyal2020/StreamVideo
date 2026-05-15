import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Download, Edit2, Search, RefreshCw,
  Settings, Plus, ChevronRight, MoreHorizontal,
  AlignLeft, Captions, Sparkles, Globe, Clock,
  CheckCircle, BarChart2, Languages, SlidersHorizontal,
  Maximize2, Volume2, SkipBack, SkipForward
} from 'lucide-react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import './ResultsPage.css';

/* ─── Pixel Mascots (same as App.jsx) ────────────────────────────── */
const SunCat = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }} xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="0" width="4" height="1" fill="#f59e0b"/>
    <rect x="1" y="1" width="6" height="1" fill="#f59e0b"/>
    <rect x="1" y="2" width="6" height="3" fill="#fbbf24"/>
    <rect x="2" y="2" width="1" height="1" fill="#1e1040"/>
    <rect x="5" y="2" width="1" height="1" fill="#1e1040"/>
    <rect x="3" y="4" width="2" height="1" fill="#f97316"/>
    <rect x="1" y="5" width="6" height="2" fill="#f59e0b"/>
    <rect x="0" y="3" width="1" height="2" fill="#fde68a"/>
    <rect x="7" y="3" width="1" height="2" fill="#fde68a"/>
    <rect x="1" y="1" width="1" height="1" fill="#fbbf24"/>
    <rect x="6" y="1" width="1" height="1" fill="#fbbf24"/>
  </svg>
);

const MoonCat = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }} xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="0" width="4" height="1" fill="#1e1040"/>
    <rect x="1" y="1" width="6" height="5" fill="#2d1b69"/>
    <rect x="2" y="2" width="1" height="1" fill="#c084fc"/>
    <rect x="5" y="2" width="1" height="1" fill="#c084fc"/>
    <rect x="3" y="4" width="2" height="1" fill="#1e1040"/>
    <rect x="0" y="5" width="8" height="2" fill="#1e1040"/>
    <rect x="0" y="2" width="1" height="2" fill="#2d1b69"/>
    <rect x="7" y="2" width="1" height="2" fill="#2d1b69"/>
  </svg>
);

/* ─── Video Player ───────────────────────────────────────────────── */
const VideoPlayer = ({ videoUrl, subtitleUrl, translatedSubtitleUrl }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current && videoUrl) {
      const el = document.createElement('video-js');
      el.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(el);

      const tracks = [];
      if (subtitleUrl) tracks.push({ kind: 'subtitles', src: subtitleUrl, srclang: 'en', label: 'Original' });
      if (translatedSubtitleUrl) tracks.push({ kind: 'subtitles', src: translatedSubtitleUrl, srclang: 'target', label: 'Translated' });

      playerRef.current = videojs(el, {
        controls: true, responsive: true, fluid: true,
        sources: [{ src: videoUrl, type: 'application/x-mpegURL' }],
        tracks,
      });
    }
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoUrl, subtitleUrl, translatedSubtitleUrl]);

  return (
    <div className="rp-vjs-wrap" data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};

/* ─── Helpers ────────────────────────────────────────────────────── */
const fmtTime = (sec) => {
  const h = Math.floor(sec / 3600).toString().padStart(2, '0');
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
  return `${h}:${m}:${s},${ms}`;
};

const parseSubtitles = (transcript) => {
  if (!transcript) return [];
  const raw = transcript.match(/[^.!?]+[.!?]+/g) || transcript.split('\n').filter(Boolean);
  return raw.slice(0, 30).map((text, i) => {
    const avg = 3 + Math.random() * 3;
    const start = raw.slice(0, i).reduce((a, _, j) => a + 3 + (j % 3), 0);
    return {
      id: i + 1,
      start: fmtTime(start),
      end: fmtTime(start + avg),
      text: text.trim(),
      duration: `${avg.toFixed(1)}s`,
    };
  });
};

const FLAG = { ja: '🇯🇵', ko: '🇰🇷', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', zh: '🇨🇳', hi: '🇮🇳', pt: '🇧🇷', ru: '🇷🇺', ar: '🇸🇦' };
const LANG_NAME = { ja: 'Japanese (日本語)', ko: 'Korean (한국어)', es: 'Spanish (Español)', fr: 'French (Français)', de: 'German (Deutsch)', zh: 'Chinese (中文)', hi: 'Hindi (हिन्दी)', pt: 'Portuguese (Português)', ru: 'Russian (Русский)', ar: 'Arabic (العربية)', en: 'English' };

/* ─── Main Component ─────────────────────────────────────────────── */
const ResultsPage = ({ result, file, targetLang, onReset }) => {
  const [activeTab, setActiveTab]   = useState('subtitles');
  const [exportFmt, setExportFmt]   = useState('SRT');
  const [searchQ, setSearchQ]       = useState('');

  const subtitles  = parseSubtitles(result?.transcript);
  const filtered   = subtitles.filter(s => s.text.toLowerCase().includes(searchQ.toLowerCase()));
  const langCode   = result?.originalLang || 'en';
  const targetCode = targetLang || result?.targetLang || 'en';
  const fileName   = file?.name?.replace(/\.[^.]+$/, '') || 'My Awesome Video';
  const fileSizeMB = file?.size ? (file.size / (1024 * 1024)).toFixed(2) : '—';
  const wordCount  = result?.wordCount || subtitles.length * 8;

  const statCards = [
    {
      icon: '〰️', color: '#8b5cf6', label: 'Transcription',
      badge: 'Completed', badge_color: '#22c55e',
      sub: 'High accuracy', value: '98.6%', unit: '', note: `${subtitles.length} segments`,
    },
    {
      icon: 'Aₐ', color: '#a78bfa', label: 'Translation',
      badge: 'Completed', badge_color: '#22c55e',
      sub: 'Languages', value: '3', unit: '', note: `EN, ${targetCode.toUpperCase()}, KO`,
    },
    {
      icon: 'CC', color: '#c084fc', label: 'Subtitles',
      badge: 'Completed', badge_color: '#22c55e',
      sub: 'Total lines', value: `${subtitles.length}`, unit: '', note: 'SRT format',
    },
    {
      icon: '⏱', color: '#f59e0b', label: 'Processing Time',
      badge: null,
      sub: 'Total time', value: '02:34', unit: '', note: 'Completed just now',
    },
  ];

  return (
    <div className="rp-root">

      {/* ── Breadcrumb ── */}
      <nav className="rp-breadcrumb">
        <span className="rp-bc-link" onClick={onReset}>Projects</span>
        <ChevronRight size={13} className="rp-bc-sep" />
        <span className="rp-bc-link">{fileName}</span>
        <ChevronRight size={13} className="rp-bc-sep" />
        <span className="rp-bc-cur">Results</span>
      </nav>

      {/* ── Page header ── */}
      <div className="rp-page-header">
        <div>
          <h1 className="rp-title">Results <Sparkles size={18} className="rp-title-spark" /></h1>
          <p className="rp-sub">Your subtitles are ready! Review, translate, and export.</p>
        </div>
        <div className="rp-header-actions">
          <button className="rp-btn-outline"><Edit2 size={15} /> Edit Subtitles</button>
          <button className="rp-btn-primary"><Download size={15} /> Export</button>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="rp-body">

        {/* ═══ LEFT ═══ */}
        <div className="rp-left">

          {/* Video + subtitle panel */}
          <div className="rp-card rp-media-row">
            {/* Video */}
            <div className="rp-video-col">
              <VideoPlayer
                videoUrl={result?.videoUrl}
                subtitleUrl={result?.subtitleUrl}
                translatedSubtitleUrl={result?.translatedSubtitleUrl}
              />
            </div>

            {/* Subtitle Panel */}
            <div className="rp-sub-panel">
              {/* Tabs */}
              <div className="rp-tabs">
                {['subtitles', 'transcript', 'ai-summary'].map(t => (
                  <button
                    key={t}
                    className={`rp-tab ${activeTab === t ? 'rp-tab--active' : ''}`}
                    onClick={() => setActiveTab(t)}
                  >
                    {t === 'subtitles' ? 'Subtitles' : t === 'transcript' ? 'Transcript' : 'AI Summary'}
                  </button>
                ))}
              </div>

              {/* Subtitles Tab */}
              {activeTab === 'subtitles' && (
                <>
                  <div className="rp-search-row">
                    <div className="rp-search-wrap">
                      <Search size={13} className="rp-search-icon" />
                      <input
                        className="rp-search"
                        placeholder="Search in subtitles..."
                        value={searchQ}
                        onChange={e => setSearchQ(e.target.value)}
                      />
                    </div>
                    <button className="rp-icon-btn"><SlidersHorizontal size={14} /></button>
                    <button className="rp-icon-btn"><MoreHorizontal size={14} /></button>
                  </div>

                  <div className="rp-sub-list">
                    {filtered.map(s => (
                      <div key={s.id} className="rp-sub-row">
                        <span className="rp-sub-num">{s.id}</span>
                        <div className="rp-sub-body">
                          <span className="rp-sub-ts">{s.start} --&gt; {s.end}</span>
                          <span className="rp-sub-text">{s.text}</span>
                        </div>
                        <span className="rp-sub-dur">{s.duration}</span>
                        <button className="rp-icon-btn rp-sub-edit"><Edit2 size={13} /></button>
                      </div>
                    ))}
                  </div>

                  <div className="rp-sub-footer">
                    <span>{subtitles.length} subtitles</span>
                    <span>Total Duration: {fmtTime(subtitles.length * 4)}</span>
                  </div>
                </>
              )}

              {/* Transcript Tab */}
              {activeTab === 'transcript' && (
                <div className="rp-transcript-body">
                  <p className="rp-transcript-text">
                    {result?.transcript || 'Transcript not available.'}
                  </p>
                  {result?.translatedText && result.translatedText !== result.transcript && (
                    <>
                      <div className="rp-transcript-divider">
                        <Globe size={13} /> Translated ({LANG_NAME[targetCode] || targetCode})
                      </div>
                      <p className="rp-transcript-text" style={{ color: '#c4b5fd' }}>
                        {result.translatedText}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* AI Summary Tab */}
              {activeTab === 'ai-summary' && (
                <div className="rp-aisummary">
                  <p className="rp-aisummary-text">
                    {result?.transcript
                      ? `This video covers: "${result.transcript.slice(0, 200)}…" — transcribed with high accuracy across ${subtitles.length} segments.`
                      : 'AI summary not available.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AI Summary card */}
          <div className="rp-card rp-aisummary-card">
            <div className="rp-aisummary-left">
              <div className="rp-aisummary-head">
                <Sparkles size={16} className="rp-spark" />
                <span>AI Summary</span>
                <button className="rp-btn-ghost rp-regen">
                  <RefreshCw size={13} /> Regenerate
                </button>
              </div>
              <p className="rp-aisummary-body">
                {result?.transcript
                  ? `This video is an engaging introduction where the creator covers key topics. ${result.transcript.slice(0, 180).trim()}…`
                  : 'AI summary will appear here once processing is complete.'}
              </p>
            </div>
            <div className="rp-aisummary-mascots">
              <SunCat size={52} />
              <MoonCat size={44} />
              <div className="rp-campfire">🔥</div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="rp-stat-grid">
            {statCards.map(s => (
              <div key={s.label} className="rp-stat-card">
                <div className="rp-stat-top">
                  <div className="rp-stat-icon" style={{ background: `${s.color}22`, color: s.color }}>
                    {s.icon}
                  </div>
                  <span className="rp-stat-label">{s.label}</span>
                  {s.badge && (
                    <span className="rp-stat-badge" style={{ color: s.badge_color }}>
                      {s.badge}
                    </span>
                  )}
                </div>
                <div className="rp-stat-sub">{s.sub}</div>
                <div className="rp-stat-val" style={{ color: s.color }}>{s.value}<span className="rp-stat-unit">{s.unit}</span></div>
                <div className="rp-stat-note">{s.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ RIGHT ═══ */}
        <div className="rp-right">

          {/* Project Summary */}
          <div className="rp-card rp-project-card">
            <div className="rp-card-title">
              <span className="rp-card-icon">🎬</span> Project Summary
            </div>
            <div className="rp-project-thumb">
              <div className="rp-thumb-placeholder">
                <span>🌙</span>
              </div>
              <div className="rp-project-info">
                <div className="rp-project-name">
                  {fileName} <Edit2 size={11} className="rp-edit-icon" />
                </div>
                {[
                  { label: 'Duration',  value: fmtTime(subtitles.length * 4) },
                  { label: 'File Size', value: `${fileSizeMB} MB` },
                  { label: 'Uploaded',  value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                  { label: 'Status',    value: '● Completed', green: true },
                ].map(r => (
                  <div key={r.label} className="rp-proj-row">
                    <span className="rp-proj-key">{r.label}</span>
                    <span className={`rp-proj-val ${r.green ? 'rp-proj-val--green' : ''}`}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detected Language */}
          <div className="rp-card rp-lang-card">
            <div className="rp-card-title">
              <span className="rp-card-icon">🔍</span> Detected Language
            </div>
            <div className="rp-lang-body">
              <div className="rp-lang-info">
                <span className="rp-lang-badge">
                  {LANG_NAME[langCode] || langCode.toUpperCase()}
                </span>
                <span className="rp-lang-conf">Confidence: 98.6%</span>
              </div>
              <div className="rp-lang-mascot">
                <MoonCat size={40} />
                <div className="rp-speech-bubble">✓</div>
              </div>
            </div>
          </div>

          {/* Translations */}
          <div className="rp-card rp-trans-card">
            <div className="rp-card-title">
              <span className="rp-card-icon">🌐</span> Translations
              <div className="rp-trans-mascots">
                <SunCat size={32} />
                <MoonCat size={28} />
              </div>
            </div>

            {result?.translatedText
              ? [targetCode, 'ko', 'es'].slice(0, 3).map((code, i) => (
                <div key={code} className="rp-trans-row">
                  <span className="rp-trans-flag">{FLAG[code] || '🌍'}</span>
                  <span className="rp-trans-name">{LANG_NAME[code] || code}</span>
                  <span className="rp-trans-status">Completed</span>
                  {i === 0 && result.translatedSubtitleUrl ? (
                    <a href={result.translatedSubtitleUrl} download className="rp-trans-dl">
                      <Download size={13} />
                    </a>
                  ) : (
                    <button className="rp-trans-dl"><Download size={13} /></button>
                  )}
                </div>
              ))
              : (
                <p className="rp-no-trans">No translations available for this upload.</p>
              )
            }

            <button className="rp-btn-add-lang">
              <Plus size={13} /> Add Language
            </button>
          </div>

          {/* Export */}
          <div className="rp-card rp-export-card">
            <div className="rp-card-title">
              <span className="rp-card-icon">📤</span> Export Subtitles
            </div>
            <p className="rp-export-sub">Choose format and export your subtitles</p>

            <div className="rp-fmt-grid">
              {['SRT', 'VTT', 'ASS', 'TXT'].map(fmt => (
                <button
                  key={fmt}
                  className={`rp-fmt-btn ${exportFmt === fmt ? 'rp-fmt-btn--active' : ''}`}
                  onClick={() => setExportFmt(fmt)}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {result?.subtitleUrl ? (
              <a href={result.subtitleUrl} download className="rp-btn-export-all">
                <Download size={15} /> Export All
              </a>
            ) : (
              <button className="rp-btn-export-all">
                <Download size={15} /> Export All
              </button>
            )}

            <button className="rp-btn-ghost rp-customize">
              <Settings size={13} /> Customize Export Settings
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultsPage;