import path from "path";
import { formatTime } from "../utils/time.utils.js";
import { writeFile } from "../utils/file.utils.js";

const MAX_WORDS_PER_CHUNK = 8;

function groupWordsIntoChunks(words) {
  const chunks = [];
  let current = { words: [], start: null, end: null };

  words.forEach((word, index) => {
    if (current.start === null) current.start = word.start;

    current.words.push(word.word);
    current.end = word.end;

    const endsWithPunctuation =
      word.word.includes(".") || word.word.includes("!") || word.word.includes("?");
    const isFull = current.words.length >= MAX_WORDS_PER_CHUNK;
    const isLast = index === words.length - 1;

    if (endsWithPunctuation || isFull || isLast) {
      chunks.push({ ...current });
      current = { words: [], start: null, end: null };
    }
  });

  return chunks;
}

function buildVTT(chunks, textsFn) {
  let vtt = "WEBVTT\n\n";
  chunks.forEach((chunk, i) => {
    vtt += `${i + 1}\n`;
    vtt += `${formatTime(chunk.start)} --> ${formatTime(chunk.end)}\n`;
    vtt += `${textsFn(chunk, i)}\n\n`;
  });
  return vtt;
}

export const generateWebVTT = (words, outputPath, translatedText = null) => {
  if (!words?.length) return null;

  const chunks = groupWordsIntoChunks(words);

  // Original subtitles
  const originalVtt = buildVTT(chunks, (chunk) => chunk.words.join(" "));
  const vttPath = path.join(outputPath, "subtitles.vtt");
  writeFile(vttPath, originalVtt);

  if (!translatedText) return { original: vttPath };

  // Translated subtitles — distribute translated words proportionally
  const translatedWords = translatedText.split(" ");
  const wordsPerChunk = Math.ceil(translatedWords.length / chunks.length);

  const translatedVtt = buildVTT(chunks, (_chunk, i) => {
    const start = i * wordsPerChunk;
    const end = Math.min(start + wordsPerChunk, translatedWords.length);
    return translatedWords.slice(start, end).join(" ");
  });

  const translatedVttPath = path.join(outputPath, "subtitles-translated.vtt");
  writeFile(translatedVttPath, translatedVtt);

  return { original: vttPath, translated: translatedVttPath };
};
