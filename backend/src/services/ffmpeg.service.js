import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "../utils/logger.js";

const execPromise = promisify(exec);

// 30 minute timeout for large videos
const FFMPEG_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Convert video to HLS format (.m3u8 + .ts segments)
 */
export const convertToHLS = async (videoPath, outputPath, hlsPath) => {
  // Quote paths to handle spaces in filenames
  const cmd = [
    "ffmpeg -y",
    `-i "${videoPath}"`,
    "-codec:v libx264",
    "-codec:a aac",
    "-hls_time 10",
    "-hls_playlist_type vod",
    `-hls_segment_filename "${outputPath}/segment%03d.ts"`,
    "-start_number 0",
    `"${hlsPath}"`,
  ].join(" ");

  try {
    await execPromise(cmd, { timeout: FFMPEG_TIMEOUT_MS });
    logger.info("HLS conversion complete", { hlsPath });
  } catch (err) {
    logger.error("FFmpeg HLS conversion failed", err, { videoPath });
    throw new Error("Video conversion failed. Ensure the file is a valid video.");
  }
};

/**
 * Extract audio track as MP3
 */
export const extractAudio = async (videoPath, audioPath) => {
  const cmd = `ffmpeg -y -i "${videoPath}" -vn -acodec libmp3lame "${audioPath}"`;

  try {
    await execPromise(cmd, { timeout: FFMPEG_TIMEOUT_MS });
    logger.info("Audio extracted", { audioPath });
  } catch (err) {
    logger.error("FFmpeg audio extraction failed", err, { videoPath });
    throw new Error("Audio extraction failed. The video may have no audio track.");
  }
};
