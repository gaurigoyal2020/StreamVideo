import axios from "axios";
import { readFileAsBuffer } from "../utils/file.utils.js";

/**
 * Transcribe audio using Deepgram API
 */
export const transcribeAudio = async (audioPath) => {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

  if (!deepgramApiKey) {
    throw new Error("DEEPGRAM_API_KEY is not set in environment variables");
  }

  try {
    const audioBuffer = readFileAsBuffer(audioPath);

    const response = await axios.post(
      'https://api.deepgram.com/v1/listen',
      audioBuffer,
      {
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
      }
    );

    const alt = response.data.results.channels[0].alternatives[0];
    const transcript = alt.transcript || "";
    const words = alt.words || [];
    const detectedLang = response.data.results.channels[0].detected_language || "en";

    console.log("Transcript:", transcript);
    console.log("Detected Language:", detectedLang);
    console.log("Words with timing:", words.length);

    return {
      transcript,
      words,
      detectedLang
    };
  } catch (error) {
    console.error("Deepgram transcription error:", error.message);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
};