import { processVideo } from "../services/ffmpeg.service.js";
import { transcribeAudio } from "../services/transcription.service.js";
import { translateText } from "../services/translation.service.js";
import { generateWebVTT } from "../services/subtitle.service.js";
import {
  generateLessonId,
  ensureDirectoryExists,
  deleteFile,
} from "../utils/file.utils.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

export const uploadVideo = async (req, res, next) => {
  const uploadedFilePath = req.file?.path ?? null;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const lessonId = generateLessonId();
    const videoPath = req.file.path;
    const outputPath = `./uploads/courses/${lessonId}`;
    const hlsPath = `${outputPath}/index.m3u8`;
    const audioPath = `${outputPath}/audio.mp3`;

    logger.info("Processing video", { lessonId, originalName: req.file.originalname });

    ensureDirectoryExists(outputPath);

    // Step 1 — HLS conversion + audio extraction (single ffmpeg pass)
    await processVideo(videoPath, outputPath, hlsPath, audioPath);

    // Step 2 — Transcription
    const { transcript, words, detectedLang } = await transcribeAudio(audioPath);

    // Step 3 — Translation
    const targetLang = req.body.targetLang ?? "en";
    const translatedText = await translateText(transcript, detectedLang, targetLang);

    logger.info("Transcript", { detectedLang, chars: transcript.length });
    logger.debug("Translated", { targetLang, chars: translatedText.length });

    // Step 4 — Subtitles
    generateWebVTT(words, outputPath, translatedText);

    // Step 5 — Cleanup original upload (no longer needed)
    deleteFile(uploadedFilePath);

    // Step 6 — Build response URLs from env.baseUrl (no hardcoding)
    const base = `${env.baseUrl}/uploads/courses/${lessonId}`;
    const videoUrl = `${base}/index.m3u8`;
    const subtitleUrl = `${base}/subtitles.vtt`;
    const translatedSubtitleUrl =
      translatedText !== transcript ? `${base}/subtitles-translated.vtt` : null;

    return res.status(201).json({
      success: true,
      message: "Video processed successfully",
      data: {
        lessonId,
        videoUrl,
        subtitleUrl,
        translatedSubtitleUrl,
        transcript,
        translatedText,
        originalLang: detectedLang,
        targetLang,
        wordCount: words.length,
      },
    });
  } catch (err) {
    // Always clean up the raw upload on error
    if (uploadedFilePath) deleteFile(uploadedFilePath);
    next(err);
  }
};