import axios from "axios";
import { logger } from "../utils/logger.js";

const LANG_MAP = {
  en: "en", es: "es", fr: "fr", de: "de",
  hi: "hi", zh: "zh", ja: "ja", ko: "ko",
  pt: "pt", ru: "ru", ar: "ar", it: "it",
};

const normalizeLang = (lang) => LANG_MAP[lang] ?? lang;
const REQUEST_TIMEOUT = 12_000;

// ── Individual provider attempts ──────────────────────────────────────────────

async function tryLibreTranslate(text, source, target) {
  const response = await axios.post(
    "https://libretranslate.de/translate",
    { q: text, source, target, format: "text" },
    { headers: { "Content-Type": "application/json" }, timeout: REQUEST_TIMEOUT }
  );
  return response.data?.translatedText ?? null;
}

async function tryMyMemory(text, source, target) {
  const response = await axios.get("https://api.mymemory.translated.net/get", {
    params: { q: text.substring(0, 500), langpair: `${source}|${target}` },
    timeout: REQUEST_TIMEOUT,
  });
  const result = response.data?.responseData?.translatedText;
  // MyMemory returns the original text when it fails — treat that as a miss
  if (!result || result === text) return null;
  return result;
}

async function tryLingva(text, source, target) {
  const response = await axios.get(
    `https://lingva.ml/api/v1/${source}/${target}/${encodeURIComponent(text.substring(0, 1000))}`,
    { timeout: REQUEST_TIMEOUT }
  );
  return response.data?.translation ?? null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Translate text from sourceLang to targetLang.
 * Tries providers in order, returns original text if all fail.
 */
export const translateText = async (text, sourceLang, targetLang) => {
  const source = normalizeLang(sourceLang);
  const target = normalizeLang(targetLang);

  if (source === target || !text.trim()) {
    logger.debug("Translation skipped (same language or empty)");
    return text;
  }

  const providers = [
    { name: "LibreTranslate", fn: () => tryLibreTranslate(text, source, target) },
    { name: "MyMemory",       fn: () => tryMyMemory(text, source, target) },
    { name: "Lingva",         fn: () => tryLingva(text, source, target) },
  ];

  for (const { name, fn } of providers) {
    try {
      const result = await fn();
      if (result) {
        logger.info(`Translation successful via ${name}`, { source, target });
        return result;
      }
    } catch (err) {
      logger.warn(`${name} translation failed`, { message: err.message });
    }
  }

  logger.warn("All translation providers failed — returning original text");
  return text;
};
