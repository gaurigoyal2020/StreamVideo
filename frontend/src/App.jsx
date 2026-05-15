import React, { useState } from 'react';
import {
  Upload, CheckCircle, AlertCircle,
  Captions, ChevronDown, LayoutDashboard,
  FolderOpen, Settings, CreditCard
} from 'lucide-react';
import ResultsPage from './ResultsPage';
import ProcessingPage from './ProcessingPage';
import './index.css';

/* ─── Pixel Sun Cat ──────────────────────────────────────────────── */
const SunCat = ({ className = '' }) => (
  <svg
    className={className}
    width="56" height="56"
    viewBox="0 0 21 16"
    style={{ imageRendering: 'pixelated' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Ears */}
    <rect x="4" y="0" width="2" height="1" fill="#e8821a"/>
    <rect x="3" y="1" width="3" height="1" fill="#e8821a"/>
    <rect x="4" y="1" width="1" height="1" fill="#f5a84b"/>
    <rect x="15" y="0" width="2" height="1" fill="#e8821a"/>
    <rect x="15" y="1" width="3" height="1" fill="#e8821a"/>
    <rect x="16" y="1" width="1" height="1" fill="#f5a84b"/>
    {/* Head */}
    <rect x="3" y="2" width="15" height="1" fill="#e8821a"/>
    <rect x="2" y="3" width="17" height="2" fill="#e8821a"/>
    {/* Tabby stripes */}
    <rect x="8"  y="2" width="1" height="2" fill="#c45f0a"/>
    <rect x="10" y="2" width="1" height="2" fill="#c45f0a"/>
    <rect x="12" y="2" width="1" height="2" fill="#c45f0a"/>
    {/* Eyes */}
    <rect x="1" y="5" width="19" height="3" fill="#e8821a"/>
    <rect x="3" y="5" width="5"  height="3" fill="#ffffff"/>
    <rect x="13" y="5" width="5" height="3" fill="#ffffff"/>
    <rect x="5"  y="5" width="1" height="3" fill="#1a2e3d"/>
    <rect x="15" y="5" width="1" height="3" fill="#1a2e3d"/>
    {/* Below eyes / nose */}
    <rect x="2" y="8" width="17" height="1" fill="#e8821a"/>
    <rect x="2" y="9" width="17" height="1" fill="#e8821a"/>
    <rect x="9" y="9" width="3"  height="1" fill="#d4622a"/>
    {/* Mouth */}
    <rect x="2"  y="10" width="17" height="1" fill="#e8821a"/>
    <rect x="6"  y="10" width="1"  height="1" fill="#ffe4b5"/>
    <rect x="7"  y="10" width="7"  height="1" fill="#1a2e3d"/>
    <rect x="14" y="10" width="1"  height="1" fill="#ffe4b5"/>
    <rect x="3"  y="11" width="15" height="1" fill="#e8821a"/>
    <rect x="7"  y="11" width="1"  height="1" fill="#ffe4b5"/>
    <rect x="8"  y="11" width="5"  height="1" fill="#1a2e3d"/>
    <rect x="13" y="11" width="1"  height="1" fill="#ffe4b5"/>
    <rect x="4"  y="12" width="13" height="1" fill="#e8821a"/>
    <rect x="8"  y="12" width="1"  height="1" fill="#ffe4b5"/>
    <rect x="9"  y="12" width="3"  height="1" fill="#1a2e3d"/>
    <rect x="12" y="12" width="1"  height="1" fill="#ffe4b5"/>
    <rect x="5"  y="13" width="11" height="1" fill="#e8821a"/>
    <rect x="10" y="13" width="1"  height="1" fill="#ffe4b5"/>
    {/* Whiskers */}
    <rect x="0"  y="7" width="2" height="1" fill="#f5a84b"/>
    <rect x="19" y="7" width="2" height="1" fill="#f5a84b"/>
  </svg>
);

/* ─── Scene Background ───────────────────────────────────────────── */
const SceneBg = () => (
  <div className="scene-bg" aria-hidden="true">
    <div className="scene-moon">🌙</div>
    <div className="scene-star s1">✦</div>
    <div className="scene-star s2">✦</div>
    <div className="scene-star s3">·</div>
    <div className="scene-hydrangea h1">❋</div>
    <div className="scene-hydrangea h2">❋</div>
    <div className="scene-hydrangea h3">❋</div>
    <div className="scene-mascot-left"><SunCat /></div>
  </div>
);

/* ─── Sidebar ────────────────────────────────────────────────────── */
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard'  },
  { icon: FolderOpen,      label: 'Projects'   },
  { icon: Upload,          label: 'Uploads', active: true },
  { icon: Captions,        label: 'Subtitles'  },
  { icon: CreditCard,      label: 'My Plan'    },
  { icon: Settings,        label: 'Settings'   },
];

const Sidebar = () => (
  <aside className="sidebar">
    <div className="sidebar-logo">
      <SunCat />
      <span className="logo-text">HydraSubs</span>
    </div>
    <nav className="sidebar-nav">
      {navItems.map(({ icon: Icon, label, active }) => (
        <div key={label} className={`nav-item ${active ? 'nav-item--active' : ''}`}>
          <Icon size={18} />
          <span>{label}</span>
        </div>
      ))}
    </nav>
    <div className="sidebar-footer">
      <div className="plan-label">Free Plan</div>
      <div className="plan-sub">2 of 5 uploads used</div>
      <div className="plan-bar">
        <div className="plan-bar-fill" style={{ width: '40%' }} />
      </div>
      <button className="btn-upgrade">Upgrade Plan</button>
    </div>
  </aside>
);

/* ─── Feature Cards Data ─────────────────────────────────────────── */
const features = [
  { icon: '🧠', title: 'AI-Powered',      desc: 'Advanced AI for high accuracy transcription' },
  { icon: '🌍', title: 'Multi-Language',  desc: 'Translate to 100+ languages' },
  { icon: 'T',  title: 'Customizable',   desc: 'Edit and style your subtitles' },
  { icon: '⬇',  title: 'Export Anywhere', desc: 'SRT, VTT, ASS and more' },
];

/* ─── Languages ──────────────────────────────────────────────────── */
const languages = [
  { code: 'en', name: 'English'    }, { code: 'es', name: 'Spanish'    },
  { code: 'fr', name: 'French'     }, { code: 'de', name: 'German'     },
  { code: 'hi', name: 'Hindi'      }, { code: 'zh', name: 'Chinese'    },
  { code: 'ja', name: 'Japanese'   }, { code: 'ko', name: 'Korean'     },
  { code: 'pt', name: 'Portuguese' }, { code: 'ru', name: 'Russian'    },
  { code: 'ar', name: 'Arabic'     }, { code: 'it', name: 'Italian'    },
];

/* ─── App ────────────────────────────────────────────────────────── */
function App() {
  const [file,       setFile]       = useState(null);
  const [targetLang, setTargetLang] = useState('en');
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState(null);
  const [dragActive, setDragActive] = useState(false);

  /* ── Drag handlers ── */
  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (f.type.startsWith('video/')) { setFile(f); setError(null); }
    else setError('Please upload a valid video file');
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type.startsWith('video/')) { setFile(f); setError(null); }
    else setError('Please upload a valid video file');
  };

  /* ── Upload ── */
  const handleUpload = async () => {
    if (!file) { setError('Please select a video file'); return; }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetLang', targetLang);

    setUploading(true); setError(null); setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + 10;
      });
    }, 500);

    try {
      // AFTER
      const res = await fetch('http://localhost:8000/api/upload', { method: 'POST', body: formData });
      clearInterval(interval); setProgress(100);
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      setResult(json.data);
      setTimeout(() => setUploading(false), 500);
    } catch {
      clearInterval(interval);
      setError('Failed to process video. Please try again.');
      setUploading(false);
      setProgress(0);
    }
  };

  /* ── Reset ── */
  const resetForm = () => {
    setFile(null); setResult(null);
    setError(null); setProgress(0); setUploading(false);
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">

        {/* ════ STATE 1 — Processing ════ */}
        {uploading ? (
          <ProcessingPage
            progress={progress}
            file={file}
            onBackground={() => {}}
          />

        /* ════ STATE 2 — Results ════ */
        ) : result ? (
          <ResultsPage
            result={result}
            file={file}
            targetLang={targetLang}
            onReset={resetForm}
          />

        /* ════ STATE 3 — Upload page ════ */
        ) : (
          <>
            {/* Page header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">
                  Upload Your Video
                  <span className="title-icon" aria-hidden="true"> 🎬</span>
                </h1>
                <p className="page-sub">Let HydraSubs generate accurate subtitles for you</p>
              </div>
              <SunCat className="header-mascot" />
            </div>

            {/* Two-column layout */}
            <div className="upload-grid">

              {/* LEFT — drop zone + features */}
              <div className="upload-left">
                <div className="drop-card">
                  <SceneBg />
                  <div
                    className={`drop-zone ${dragActive ? 'drop-zone--active' : ''} ${file ? 'drop-zone--has-file' : ''}`}
                    onDragEnter={handleDrag} onDragLeave={handleDrag}
                    onDragOver={handleDrag}  onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="drop-input"
                    />
                    <div className="drop-inner">
                      <div className="drop-cloud-icon">☁</div>
                      {file ? (
                        <>
                          <p className="drop-title" style={{ color: '#a78bfa' }}>{file.name}</p>
                          <p className="drop-hint" style={{ color: '#22c55e' }}>
                            <CheckCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
                            {(file.size / (1024 * 1024)).toFixed(2)} MB — ready
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="drop-title">Drag &amp; drop your video here</p>
                          <p className="drop-or">or</p>
                          <button className="btn-browse" type="button">📁 Browse Files</button>
                          <p className="drop-hint">Supports: MP4, MOV, MKV, AVI, WEBM · Max 5 GB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Why HydraSubs */}
                <div className="features-section">
                  <h2 className="features-title">✦ Why HydraSubs?</h2>
                  <div className="features-grid">
                    {features.map(f => (
                      <div key={f.title} className="feature-card">
                        <div className="feature-icon">{f.icon}</div>
                        <div className="feature-name">{f.title}</div>
                        <div className="feature-desc">{f.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT — settings */}
              <div className="settings-panel">
                <div className="settings-card">
                  <h2 className="settings-title">Upload Settings</h2>

                  <div className="field-group">
                    <label className="field-label">Translate To</label>
                    <div className="select-wrap">
                      <select
                        value={targetLang}
                        onChange={e => setTargetLang(e.target.value)}
                        className="hy-select"
                      >
                        {languages.map(l => (
                          <option key={l.code} value={l.code}>{l.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="select-arrow" />
                    </div>
                    <span className="field-hint">Target language for subtitles</span>
                  </div>

                  {error && (
                    <div className="alert-error">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={handleUpload}
                    disabled={!file}
                    className="btn-generate"
                  >
                    <Captions size={18} /> Generate Subtitles
                  </button>

                  <div className="tips-card">
                    <div className="tips-title">Tips for better results</div>
                    {['Use high quality audio', 'Clear speech works best', 'Avoid heavy background noise'].map(t => (
                      <div key={t} className="tip-row">
                        <CheckCircle size={13} className="tip-check" /> {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default App;