import React, { useState, useRef, useEffect } from 'react';
import { Upload, Film, Globe, Subtitles, CheckCircle, AlertCircle, Loader2, Play, Download } from 'lucide-react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

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
    <div className="w-full rounded-xl overflow-hidden shadow-2xl" data-vjs-player>
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

    // Simulate progress
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Film className="w-12 h-12 text-emerald-700" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-800 via-emerald-700 to-stone-700 bg-clip-text text-transparent">
              VideoTranscribe
            </h1>
          </div>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Upload your videos and get automatic transcription with multilingual subtitle generation
          </p>
        </div>

        {!result ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-stone-200">
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-3 border-dashed rounded-xl p-12 transition-all duration-300 ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-stone-300 bg-stone-50/50 hover:border-amber-400 hover:bg-amber-50/30'
              }`}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              
              <div className="text-center">
                <Upload className={`mx-auto w-16 h-16 mb-4 ${dragActive ? 'text-emerald-600' : 'text-stone-400'}`} />
                <p className="text-xl font-semibold text-stone-700 mb-2">
                  {file ? file.name : 'Drop your video here'}
                </p>
                <p className="text-stone-500">
                  or click to browse • MP4, MOV, AVI, MKV
                </p>
              </div>

              {file && (
                <div className="mt-4 flex items-center justify-center gap-2 text-emerald-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              )}
            </div>

            {/* Language Selection */}
            <div className="mt-8">
              <label className="flex items-center gap-2 text-stone-700 font-semibold mb-3">
                <Globe className="w-5 h-5 text-emerald-600" />
                Target Translation Language
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-stone-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-stone-700 font-medium"
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
              <div className="mt-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full mt-8 py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-700 hover:to-emerald-700 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing... {progress}%
                </>
              ) : (
                <>
                  <Subtitles className="w-5 h-5" />
                  Generate Subtitles
                </>
              )}
            </button>

            {/* Progress Bar */}
            {uploading && (
              <div className="mt-4 bg-stone-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Video Player */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-stone-200">
              <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Play className="w-6 h-6 text-emerald-600" />
                Your Video
              </h2>
              <VideoPlayer
                videoUrl={result.videoUrl}
                subtitleUrl={result.subtitleUrl}
                translatedSubtitleUrl={result.translatedSubtitleUrl}
              />
            </div>

            {/* Transcription Results */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Transcript */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-stone-200">
                <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Subtitles className="w-5 h-5 text-amber-600" />
                  Original Transcript ({result.originalLang})
                </h3>
                <div className="bg-stone-50 rounded-lg p-4 max-h-64 overflow-y-auto border border-stone-200">
                  <p className="text-stone-700 leading-relaxed">{result.transcript}</p>
                </div>
                <a
                  href={result.subtitleUrl}
                  download
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Subtitles
                </a>
              </div>

              {/* Translated Text */}
              {result.translatedText && result.translatedText !== result.transcript && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-stone-200">
                  <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-600" />
                    Translated Text
                  </h3>
                  <div className="bg-stone-50 rounded-lg p-4 max-h-64 overflow-y-auto border border-stone-200">
                    <p className="text-stone-700 leading-relaxed">{result.translatedText}</p>
                  </div>
                  {result.translatedSubtitleUrl && (
                    <a
                      href={result.translatedSubtitleUrl}
                      download
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Translated Subtitles
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-amber-100 to-emerald-100 rounded-2xl shadow-lg p-6 border border-amber-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-stone-600 text-sm font-medium">Word Count</p>
                  <p className="text-2xl font-bold text-stone-800">{result.wordCount}</p>
                </div>
                <div>
                  <p className="text-stone-600 text-sm font-medium">Original Language</p>
                  <p className="text-2xl font-bold text-stone-800">{result.originalLang.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-stone-600 text-sm font-medium">Status</p>
                  <p className="text-2xl font-bold text-emerald-700">✓ Complete</p>
                </div>
                <div>
                  <p className="text-stone-600 text-sm font-medium">Lesson ID</p>
                  <p className="text-sm font-bold text-stone-800 truncate">{result.lessonId}</p>
                </div>
              </div>
            </div>

            {/* Upload Another */}
            <button
              onClick={resetForm}
              className="w-full py-4 px-6 rounded-xl font-semibold text-stone-700 bg-white hover:bg-stone-50 border-2 border-stone-300 transition-all duration-300 shadow-md hover:shadow-lg"
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