import React, { useState } from 'react';
import {
  Upload, CheckCircle, AlertCircle,
  Captions, ChevronDown, LayoutDashboard,
  FolderOpen, Settings, CreditCard
} from 'lucide-react';
import ResultsPage from './ResultsPage';
import ProcessingPage from './ProcessingPage';
import Mascot from './Mascot';
import { uploadVideo } from './api';
import './index.css';

/* ─── Scene Background ───────────────────────────────────────────── */
const SceneBg = () => (
  <div className="scene-bg" aria-hidden="true">
    <div className="scene-sparkle">✦</div>
    <div className="scene-star s1">✦</div>
    <div className="scene-star s2">✦</div>
    <div className="scene-star s3">·</div>
    <div className="scene-hydrangea h1">❋</div>
    <div className="scene-hydrangea h2">❋</div>
    <div className="scene-hydrangea h3">❋</div>
    <div className="scene-mascot-left"><Mascot size={56} state="idle" /></div>
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
      <Mascot size={32} state="idle" />
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

  /* ── Upload ──
     Uses the shared uploadVideo() helper from api.js, which:
       - reads the backend URL from VITE_API_URL (no hardcoding)
       - reports real upload progress via XHR (0-70%), leaving
         70-100% for server-side processing
  */
  const handleUpload = async () => {
    if (!file) { setError('Please select a video file'); return; }

    setUploading(true); setError(null); setProgress(0);

    // Simulate the server-processing tail (70 -> 99%) while we wait
    // for the response, since the backend doesn't stream progress yet.
    const tailInterval = setInterval(() => {
      setProgress((p) => (p >= 99 ? 99 : p + 1));
    }, 600);

    try {
      const json = await uploadVideo(file, targetLang, (pct) => {
        // XHR progress only covers the upload phase (0-70%)
        setProgress((prev) => Math.max(prev, pct));
      });
      clearInterval(tailInterval);
      setProgress(100);
      setResult(json.data);
      setTimeout(() => setUploading(false), 500);
    } catch (err) {
      clearInterval(tailInterval);
      setError(err.message || 'Failed to process video. Please try again.');
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
              <Mascot size={56} state="idle" className="header-mascot" />
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