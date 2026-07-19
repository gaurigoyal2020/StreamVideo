import { processVideo } from "../services/ffmpeg.service.js";
import { transcribeAudio } from "../services/transcription.service.js";
import { translateText } from "../services/translation.service.js";
import { generateWebVTT, groupWordsIntoChunks, buildTranslatedChunks } from "../services/subtitle.service.js";
import {
  generateLessonId,
  ensureDirectoryExists,
  deleteFile,
} from "../utils/file.utils.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

export const uploadVideo = async (req, res, next) => {
  const uploadedFilePath = req.file?.path ?? null;
  const pipelineStart = Date.now();

  // Small helper: run a stage, log how long it took, return its result.
  // This is the only thing that changed in this step — no processing
  // logic is different, we're just wrapping each await with a stopwatch.
  const timedStage = async (label, fn) => {
    const start = Date.now();
    const result = await fn();
    const seconds = ((Date.now() - start) / 1000).toFixed(1);
    logger.info(`[timing] ${label}`, { seconds: Number(seconds) });
    return result;
  };

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
    await timedStage("ffmpeg (HLS + audio)", () =>
      processVideo(videoPath, outputPath, hlsPath, audioPath)
    );

    // Step 2 — Transcription
    const { transcript, words, detectedLang } = await timedStage(
      "transcription (Deepgram)",
      () => transcribeAudio(audioPath)
    );

    // Step 3 — Translation
    const targetLang = req.body.targetLang ?? "en";
    const translatedText = await timedStage("translation", () =>
      translateText(transcript, detectedLang, targetLang)
    );

    logger.info("Transcript", { detectedLang, chars: transcript.length });
    logger.debug("Translated", { targetLang, chars: translatedText.length });

    // Step 4 — Subtitles
    generateWebVTT(words, outputPath, translatedText);

    // Real timestamped cues for the frontend's subtitle list/editor — same
    // chunking logic used to build the .vtt file above, so the on-screen
    // table and the actual video captions always agree with each other.
    const chunks = groupWordsIntoChunks(words);
    const subtitleCues = chunks.map((chunk) => ({
      start: chunk.start,
      end: chunk.end,
      text: chunk.words.join(" "),
    }));
    // Translated cues too — this is what was missing before: without this,
    // the frontend table could only ever show the original language,
    // regardless of what target language the user picked.
    const translatedCues =
      translatedText !== transcript ? buildTranslatedChunks(chunks, translatedText) : null;

    // Step 5 — Cleanup original upload (no longer needed)
    deleteFile(uploadedFilePath);

    logger.info("[timing] TOTAL", {
      seconds: Number(((Date.now() - pipelineStart) / 1000).toFixed(1)),
    });

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
        subtitles: subtitleCues,
        translatedSubtitles: translatedCues,
      },
    });
  } catch (err) {
    // Always clean up the raw upload on error
    if (uploadedFilePath) deleteFile(uploadedFilePath);
    next(err);
  }
};