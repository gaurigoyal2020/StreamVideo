import React, { useState, useRef, useEffect } from 'react';
import { Upload, Film, Globe, Subtitles, CheckCircle, AlertCircle, Loader2, Play, Download } from 'lucide-react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import './index.css';

const VideoPlayer = ({ videoUrl, subtitleUrl, translatedSubtitleUrl }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current && videoUrl) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const tracks = [];
      if (subtitleUrl) {
        tracks.push({
          kind: 'subtitles',
          src: subtitleUrl,
          srclang: 'en',
          label: 'Original'
        });
      }
      if (translatedSubtitleUrl) {
        tracks.push({
          kind: 'subtitles',
          src: translatedSubtitleUrl,
          srclang: 'target',
          label: 'Translated'
        });
      }

      const player = playerRef.current = videojs(videoElement, {
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
          src: videoUrl,
          type: 'application/x-mpegURL'
        }],
        tracks: tracks
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
    <div className="video-player-wrapper" data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};

function App() {
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState('en');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'it', name: 'Italian' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a valid video file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a valid video file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a video file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetLang', targetLang);

    setUploading(true);
    setError(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setResult(data);
      setTimeout(() => setUploading(false), 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError('Failed to process video. Please try again.');
      setUploading(false);
      setProgress(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-title-wrapper">
            <Film className="header-icon" />
            <h1 className="header-title">VideoTranscribe</h1>
          </div>
          <p className="header-subtitle">
            Upload your videos and get automatic transcription with multilingual subtitle generation
          </p>
        </div>

        {!result ? (
          <div className="card">
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`upload-area ${dragActive ? 'drag-active' : ''}`}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
              
              <div className="upload-content">
                <Upload className="upload-icon" />
                <p className="upload-title">
                  {file ? file.name : 'Drop your video here'}
                </p>
                <p className="upload-subtitle">
                  or click to browse • MP4, MOV, AVI, MKV
                </p>
              </div>

              {file && (
                <div className="file-info">
                  <CheckCircle />
                  <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              )}
            </div>

            {/* Language Selection */}
            <div className="form-group">
              <label className="form-label">
                <Globe />
                Target Translation Language
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                disabled={uploading}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-error">
                <AlertCircle />
                <p>{error}</p>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="btn btn-primary"
              style={{ marginTop: '2rem' }}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Processing... {progress}%
                </>
              ) : (
                <>
                  <Subtitles />
                  Generate Subtitles
                </>
              )}
            </button>

            {/* Progress Bar */}
            {uploading && (
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Video Player */}
            <div className="card video-section">
              <h2 className="section-title">
                <Play />
                Your Video
              </h2>
              <VideoPlayer
                videoUrl={result.videoUrl}
                subtitleUrl={result.subtitleUrl}
                translatedSubtitleUrl={result.translatedSubtitleUrl}
              />
            </div>

            {/* Transcription Results */}
            <div className="grid grid-2">
              {/* Original Transcript */}
              <div className="transcript-card">
                <h3 className="transcript-title original">
                  <Subtitles />
                  Original Transcript ({result.originalLang})
                </h3>
                <div className="transcript-content">
                  <p className="transcript-text">{result.transcript}</p>
                </div>
                <a
                  href={result.subtitleUrl}
                  download
                  className="btn-download amber"
                >
                  <Download />
                  Download Subtitles
                </a>
              </div>

              {/* Translated Text */}
              {result.translatedText && result.translatedText !== result.transcript && (
                <div className="transcript-card">
                  <h3 className="transcript-title translated">
                    <Globe />
                    Translated Text
                  </h3>
                  <div className="transcript-content">
                    <p className="transcript-text">{result.translatedText}</p>
                  </div>
                  {result.translatedSubtitleUrl && (
                    <a
                      href={result.translatedSubtitleUrl}
                      download
                      className="btn-download emerald"
                    >
                      <Download />
                      Download Translated Subtitles
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="stats-card">
              <div className="stats-grid">
                <div className="stat-item">
                  <p>Word Count</p>
                  <p>{result.wordCount}</p>
                </div>
                <div className="stat-item">
                  <p>Original Language</p>
                  <p>{result.originalLang.toUpperCase()}</p>
                </div>
                <div className="stat-item">
                  <p>Status</p>
                  <p className="success">✓ Complete</p>
                </div>
                <div className="stat-item">
                  <p>Lesson ID</p>
                  <p className="truncate">{result.lessonId}</p>
                </div>
              </div>
            </div>

            {/* Upload Another */}
            <button
              onClick={resetForm}
              className="btn btn-secondary"
            >
              Upload Another Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;