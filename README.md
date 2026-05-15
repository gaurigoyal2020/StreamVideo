# VideoTranscribe

Upload a video → get HLS streaming + auto-transcription + translated subtitles.

---

## Quick Start

### Prerequisites
- Node.js 18+
- ffmpeg installed (`brew install ffmpeg` / `sudo apt install ffmpeg`)
- A free [Deepgram](https://deepgram.com) account for the API key

### Backend

```bash
cd backend
cp .env.example .env        # then fill in DEEPGRAM_API_KEY
npm install
npm run dev                 # starts on http://localhost:8000
```

### Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:8000
npm install
npm run dev                 # starts on http://localhost:5173
```

### Health check
```
GET http://localhost:8000/health
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `DEEPGRAM_API_KEY` | ✅ | — | From deepgram.com dashboard |
| `PORT` | No | `8000` | Server port |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173,...` | Comma-separated CORS origins |
| `BASE_URL` | No | `http://localhost:8000` | Public URL of this server |
| `MAX_FILE_SIZE_MB` | No | `500` | Max video upload size |

### Frontend (`frontend/.env`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:8000` | Backend URL |

---

## API

### `POST /api/upload`
Upload a video file for processing.

**Form fields:**
- `file` — video file (mp4, mov, avi, mkv, webm)
- `targetLang` — ISO 639-1 language code (e.g. `es`, `fr`, `hi`)

**Response:**
```json
{
  "success": true,
  "data": {
    "lessonId": "uuid",
    "videoUrl": "http://…/index.m3u8",
    "subtitleUrl": "http://…/subtitles.vtt",
    "translatedSubtitleUrl": "http://…/subtitles-translated.vtt",
    "transcript": "…",
    "translatedText": "…",
    "originalLang": "en",
    "targetLang": "es",
    "wordCount": 142
  }
}
```

### `GET /health`
Returns server status.

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # env, cors, multer
│   │   ├── controllers/    # video.controller.js
│   │   ├── middlewares/    # error.middleware.js
│   │   ├── routes/         # video.routes.js
│   │   ├── services/       # ffmpeg, transcription, translation, subtitle
│   │   ├── utils/          # file, logger, time
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api.js          # all API calls (single source of truth)
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

---

## 5-Day Production Plan

| Day | Status | Goal |
|-----|--------|------|
| **1** | ✅ Done | Fix core issues — routes, env, CORS, cleanup, real progress |
| **2** | 🔜 | Supabase Auth — user login/signup, protect upload endpoint |
| **3** | 🔜 | Cloudflare R2 storage + DeepL translation |
| **4** | 🔜 | Job queue (Upstash + BullMQ) + WebSocket progress |
| **5** | 🔜 | Deploy — Railway (backend) + Vercel (frontend) |

---

## What Changed in Day 1

- ✅ **Route mismatch fixed** — frontend now calls `/api/upload` (was `/upload`)
- ✅ **No hardcoded URLs** — both sides read from `.env` files
- ✅ **CORS fixed** — no more wildcard + credentials conflict
- ✅ **File cleanup** — raw upload deleted after processing, on error too
- ✅ **File validation** — type + size checked before processing starts
- ✅ **Real upload progress** — XHR gives actual bytes progress (not fake interval)
- ✅ **Crash-on-startup** — missing env vars kill the process immediately with clear message
- ✅ **Error handling** — multer errors, Deepgram auth errors, all have clear messages
- ✅ **Health endpoint** — `GET /health` for monitoring
- ✅ **Structured logging** — replaces console.log, includes timestamps and log levels
