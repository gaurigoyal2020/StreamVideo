import axios from "axios";

/**
 * Convert language codes to proper format
 */
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

/**
 * Try LibreTranslate API
 */
const tryLibreTranslate = async (text, source, target) => {
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
  return null;
};

/**
 * Try MyMemory API
 */
const tryMyMemory = async (text, source, target) => {
  try {
    console.log(`Fallback to MyMemory translation...`);
    const langPair = `${source}|${target}`;
    const response = await axios.get(`https://api.mymemory.translated.net/get`, {
      params: {
        q: text.substring(0, 500),
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
  return null;
};

/**
 * Try Lingva API
 */
const tryLingva = async (text, source, target) => {
  try {
    console.log(`Fallback to Lingva translation...`);
    const response = await axios.get(
      `https://lingva.ml/api/v1/${source}/${target}/${encodeURIComponent(text.substring(0, 1000))}`,
      { timeout: 10000 }
    );

    if (response.data && response.data.translation) {
      console.log("Lingva successful");
      return response.data.translation;
    }
  } catch (error) {
    console.error("Lingva error:", error.message);
  }
  return null;
};

/**
 * Translate text using multiple free translation APIs with fallback
 */
export const translateText = async (text, sourceLang, targetLang) => {
  if (sourceLang === targetLang || !text.trim()) {
    return text;
  }

  const source = convertLangCode(sourceLang);
  const target = convertLangCode(targetLang);

  // Try services in order
  let translated = await tryLibreTranslate(text, source, target);
  if (translated) return translated;

  translated = await tryMyMemory(text, source, target);
  if (translated) return translated;

  translated = await tryLingva(text, source, target);
  if (translated) return translated;

  console.log("All translation services failed, returning original text");
  return text;
};