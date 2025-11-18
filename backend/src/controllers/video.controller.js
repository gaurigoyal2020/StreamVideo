import { convertToHLS, extractAudio } from "../services/ffmpeg.service.js";
import { transcribeAudio } from "../services/transcription.service.js";
import { translateText } from "../services/translation.service.js";
import { generateWebVTT } from "../services/subtitle.service.js";
import { generateLessonId, ensureDirectoryExists } from "../utils/file.utils.js";

/**
 * Upload video, convert to HLS, transcribe, translate, and generate subtitles
 */
export const uploadVideo = async (req, res, next) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const lessonId = generateLessonId();
    const videoPath = req.file.path;
    const outputPath = `./uploads/courses/${lessonId}`;
    const hlsPath = `${outputPath}/index.m3u8`;
    const audioPath = `${outputPath}/audio.mp3`;

    console.log("Processing video:", videoPath);
    console.log("Lesson ID:", lessonId);

    // Create output directory
    ensureDirectoryExists(outputPath);

    // Step 1: Convert video to HLS
    await convertToHLS(videoPath, outputPath, hlsPath);

    // Step 2: Extract audio
    await extractAudio(videoPath, audioPath);

    // Step 3: Transcribe audio
    const { transcript, words, detectedLang } = await transcribeAudio(audioPath);

    // Step 4: Translate transcript
    const userTargetLang = req.body.targetLang || "en";
    const translatedText = await translateText(transcript, detectedLang, userTargetLang);

    // Step 5: Generate subtitle files
    const subtitlePaths = generateWebVTT(words, outputPath, translatedText);

    // Step 6: Build response URLs
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;
    const videoUrl = `${baseUrl}/uploads/courses/${lessonId}/index.m3u8`;
    const subtitleUrl = `${baseUrl}/uploads/courses/${lessonId}/subtitles.vtt`;
    const translatedSubtitleUrl = translatedText !== transcript
      ? `${baseUrl}/uploads/courses/${lessonId}/subtitles-translated.vtt`
      : null;

    // Send success response
    res.json({
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
        targetLang: userTargetLang,
        wordCount: words.length
      }
    });

  } catch (error) {
    console.error("Upload video error:", error);
    next(error);
  }
};