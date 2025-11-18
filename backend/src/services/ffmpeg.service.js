import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

/**
 * Convert video to HLS format
 */
export const convertToHLS = async (videoPath, outputPath, hlsPath) => {
  const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

  try {
    const { stdout, stderr } = await execPromise(ffmpegCommand);
    console.log(`HLS conversion done: ${hlsPath}`);
    return { success: true, hlsPath };
  } catch (error) {
    console.error(`FFmpeg HLS error: ${error.message}`);
    throw new Error("Video conversion failed");
  }
};

/**
 * Extract audio from video
 */
export const extractAudio = async (videoPath, audioPath) => {
  const audioExtractCommand = `ffmpeg -i ${videoPath} -vn -acodec libmp3lame -y ${audioPath}`;

  try {
    const { stdout, stderr } = await execPromise(audioExtractCommand);
    console.log("Audio extracted:", audioPath);
    return { success: true, audioPath };
  } catch (error) {
    console.error("Audio extraction error:", error.message);
    throw new Error("Audio extraction failed");
  }
};