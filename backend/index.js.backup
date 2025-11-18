import express from "express"
import cors from "cors"
import multer from "multer"
import { v4 as uuidv4 } from "uuid"
import path from "path"
import fs from "fs"
import {exec} from "child_process"
import { stderr, stdout } from "process"
import fetch from "node-fetch"
import axios from "axios"

import dotenv from "dotenv"
dotenv.config();

const app = express()

//multer middleware
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, "./uploads")
  },
  filename: function(req, file, cb){
    cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname))
  }
})

// multer configuration
const upload = multer({storage: storage})

//middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true
  })
)

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*") 
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next()
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use("/uploads", express.static("uploads"))

// Translation function using free APIs
async function translateText(text, sourceLang, targetLang) {
  if (sourceLang === targetLang || !text.trim()) {
    return text;
  }
  
  // Convert language codes to proper format
  const convertLangCode = (lang) => {
    const langMap = {
      'en': 'en',
      'es': 'es', 
      'fr': 'fr',
      'de': 'de',
      'hi': 'hi',
      'zh': 'zh',
      'ja': 'ja',
      'ko': 'ko',
      'pt': 'pt',
      'ru': 'ru',
      'ar': 'ar',
      'it': 'it'
    };
    return langMap[lang] || lang;
  };

  const source = convertLangCode(sourceLang);
  const target = convertLangCode(targetLang);
  
  // Try LibreTranslate first (most reliable free option)
  try {
    console.log(`Translating with LibreTranslate from ${source} to ${target}...`);
    const response = await axios.post('https://libretranslate.de/translate', {
      q: text,
      source: source,
      target: target,
      format: 'text'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.translatedText) {
      console.log("LibreTranslate successful");
      return response.data.translatedText;
    }
  } catch (error) {
    console.error("LibreTranslate error:", error.message);
  }

  // Fallback to MyMemory API
  try {
    console.log(`Fallback to MyMemory translation...`);
    const langPair = `${source}|${target}`;
    const response = await axios.get(`https://api.mymemory.translated.net/get`, {
      params: {
        q: text.substring(0, 500), // MyMemory has text length limits
        langpair: langPair
      },
      timeout: 10000
    });
    
    if (response.data && response.data.responseData && response.data.responseData.translatedText) {
      console.log("MyMemory successful");
      return response.data.responseData.translatedText;
    }
  } catch (error) {
    console.error("MyMemory error:", error.message);
  }

  // Fallback to Lingva (alternative)
  try {
    console.log(`Fallback to Lingva translation...`);
    const response = await axios.get(`https://lingva.ml/api/v1/${source}/${target}/${encodeURIComponent(text.substring(0, 1000))}`, {
      timeout: 10000
    });
    
    if (response.data && response.data.translation) {
      console.log("Lingva successful");
      return response.data.translation;
    }
  } catch (error) {
    console.error("Lingva error:", error.message);
  }

  console.log("All translation services failed, returning original text");
  return text;
}

// Function to generate WebVTT subtitle file
function generateWebVTT(words, outputPath, translated = null) {
  let vttContent = "WEBVTT\n\n";
  
  if (!words || words.length === 0) {
    return null;
  }

  // Group words into subtitle chunks (every 5-8 words or by punctuation)
  const subtitleChunks = [];
  let currentChunk = {
    words: [],
    start: null,
    end: null
  };

  words.forEach((word, index) => {
    if (currentChunk.start === null) {
      currentChunk.start = word.start;
    }
    
    currentChunk.words.push(word.word);
    currentChunk.end = word.end;

    // Create new chunk every 8 words or at sentence end
    const isEndOfSentence = word.word.includes('.') || word.word.includes('!') || word.word.includes('?');
    const isChunkFull = currentChunk.words.length >= 8;
    const isLastWord = index === words.length - 1;

    if (isEndOfSentence || isChunkFull || isLastWord) {
      subtitleChunks.push({...currentChunk});
      currentChunk = {
        words: [],
        start: null,
        end: null
      };
    }
  });

  // Generate VTT content
  subtitleChunks.forEach((chunk, index) => {
    const startTime = formatTime(chunk.start);
    const endTime = formatTime(chunk.end);
    const text = chunk.words.join(' ');
    
    vttContent += `${index + 1}\n`;
    vttContent += `${startTime} --> ${endTime}\n`;
    vttContent += `${text}\n\n`;
  });

  // Write VTT file
  const vttPath = path.join(outputPath, 'subtitles.vtt');
  fs.writeFileSync(vttPath, vttContent);

  // Generate translated VTT if translation provided
  if (translated) {
    const translatedVttPath = path.join(outputPath, 'subtitles-translated.vtt');
    let translatedVttContent = "WEBVTT\n\n";
    
    // For simplicity, we'll split translated text proportionally
    const translatedWords = translated.split(' ');
    const wordsPerChunk = Math.ceil(translatedWords.length / subtitleChunks.length);
    
    subtitleChunks.forEach((chunk, index) => {
      const startTime = formatTime(chunk.start);
      const endTime = formatTime(chunk.end);
      const startIdx = index * wordsPerChunk;
      const endIdx = Math.min(startIdx + wordsPerChunk, translatedWords.length);
      const translatedText = translatedWords.slice(startIdx, endIdx).join(' ');
      
      translatedVttContent += `${index + 1}\n`;
      translatedVttContent += `${startTime} --> ${endTime}\n`;
      translatedVttContent += `${translatedText}\n\n`;
    });
    
    fs.writeFileSync(translatedVttPath, translatedVttContent);
    return { original: vttPath, translated: translatedVttPath };
  }

  return { original: vttPath };
}

// Helper function to format time for VTT
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

//routes
app.get('/', function(req, res){
  res.json({message: "Hello chai aur code"})
})

app.post("/upload", upload.single('file'), function(req, res){
  const lessonId = uuidv4()
  const videoPath = req.file.path
  const outputPath = `./uploads/courses/${lessonId}`
  const hlsPath = `${outputPath}/index.m3u8`
  console.log("hlsPath", hlsPath)

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, {recursive: true})
  }

  // ffmpeg HLS conversion
  const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.log(`exec error: ${error}`);
      return res.status(500).json({ error: "Video conversion failed" });
    }

    console.log(`HLS conversion done: ${hlsPath}`);

    // Now extract audio
    const audioPath = `${outputPath}/audio.mp3`;
    const audioExtractCommand = `ffmpeg -i ${videoPath} -vn -acodec libmp3lame -y ${audioPath}`;
    
    exec(audioExtractCommand, async (err, stdout, stderr) => {
      if(err) {
        console.error("Audio extraction error:", err);
        return res.status(500).json({error: "Audio extraction failed"});
      }

      console.log("Audio extracted:", audioPath);
      
      const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
      const userTargetLang = req.body.targetLang || "en";

      try {
        const audioBuffer = fs.readFileSync(audioPath);

        const response = await axios.post('https://api.deepgram.com/v1/listen', audioBuffer, {
          headers: {
            'Authorization': `Token ${deepgramApiKey}`,
            'Content-Type': 'audio/mp3'
          },
          params: {
            smart_format: true,
            punctuate: true,
            detect_language: true,
            diarize: false,
            utterances: true
          }
        });

        const alt = response.data.results.channels[0].alternatives[0];
        const transcript = alt.transcript || "";
        const words = alt.words || [];
        const detectedLang = response.data.results.channels[0].detected_language || req.body.sourceLang || "en";

        console.log("Transcript:", transcript);
        console.log("Detected Language:", detectedLang);
        console.log("Words with timing:", words.length);

        const translated = await translateText(transcript, detectedLang, userTargetLang);

        // Generate subtitle files
        const subtitlePaths = generateWebVTT(words, outputPath, translated);

        const videoUrl = `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`;
        const subtitleUrl = `http://localhost:8000/uploads/courses/${lessonId}/subtitles.vtt`;
        const translatedSubtitleUrl = translated !== transcript 
          ? `http://localhost:8000/uploads/courses/${lessonId}/subtitles-translated.vtt`
          : null;

        res.json({
          message: "Transcribed and subtitles generated",
          transcript,
          translatedText: translated,
          originalLang: detectedLang,
          videoUrl,
          subtitleUrl,
          translatedSubtitleUrl,
          lessonId,
          wordCount: words.length
        });

      } catch (err) {
        console.error("Deepgram or Translation error:", err);
        res.status(500).json({error: "Failed to process audio", details: err.message});
      }
    });
  });
});

app.listen(8000, function(){
  console.log("App is listening at port 8000...")
})