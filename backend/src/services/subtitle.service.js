import path from "path";
import { formatTime } from "../utils/time.utils.js";
import { writeFile } from "../utils/file.utils.js";

/**
 * Group words into subtitle chunks
 */
const groupWordsIntoChunks = (words) => {
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

    const isEndOfSentence = word.word.includes('.') || word.word.includes('!') || word.word.includes('?');
    const isChunkFull = currentChunk.words.length >= 8;
    const isLastWord = index === words.length - 1;

    if (isEndOfSentence || isChunkFull || isLastWord) {
      subtitleChunks.push({ ...currentChunk });
      currentChunk = {
        words: [],
        start: null,
        end: null
      };
    }
  });

  return subtitleChunks;
};

/**
 * Generate VTT content from subtitle chunks
 */
const generateVTTContent = (subtitleChunks) => {
  let vttContent = "WEBVTT\n\n";

  subtitleChunks.forEach((chunk, index) => {
    const startTime = formatTime(chunk.start);
    const endTime = formatTime(chunk.end);
    const text = chunk.words.join(' ');

    vttContent += `${index + 1}\n`;
    vttContent += `${startTime} --> ${endTime}\n`;
    vttContent += `${text}\n\n`;
  });

  return vttContent;
};

/**
 * Generate translated VTT content
 */
const generateTranslatedVTT = (translatedText, subtitleChunks) => {
  let translatedVttContent = "WEBVTT\n\n";
  
  const translatedWords = translatedText.split(' ');
  const wordsPerChunk = Math.ceil(translatedWords.length / subtitleChunks.length);

  subtitleChunks.forEach((chunk, index) => {
    const startTime = formatTime(chunk.start);
    const endTime = formatTime(chunk.end);
    const startIdx = index * wordsPerChunk;
    const endIdx = Math.min(startIdx + wordsPerChunk, translatedWords.length);
    const text = translatedWords.slice(startIdx, endIdx).join(' ');

    translatedVttContent += `${index + 1}\n`;
    translatedVttContent += `${startTime} --> ${endTime}\n`;
    translatedVttContent += `${text}\n\n`;
  });

  return translatedVttContent;
};

/**
 * Generate WebVTT subtitle files
 */
export const generateWebVTT = (words, outputPath, translatedText = null) => {
  if (!words || words.length === 0) {
    return null;
  }

  const subtitleChunks = groupWordsIntoChunks(words);
  
  // Generate original VTT
  const vttContent = generateVTTContent(subtitleChunks);
  const vttPath = path.join(outputPath, 'subtitles.vtt');
  writeFile(vttPath, vttContent);

  // Generate translated VTT if translation provided
  if (translatedText) {
    const translatedVttContent = generateTranslatedVTT(translatedText, subtitleChunks);
    const translatedVttPath = path.join(outputPath, 'subtitles-translated.vtt');
    writeFile(translatedVttPath, translatedVttContent);
    return { original: vttPath, translated: translatedVttPath };
  }

  return { original: vttPath };
};