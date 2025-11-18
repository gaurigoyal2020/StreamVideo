import fs from "fs";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate unique lesson ID
 */
export const generateLessonId = () => {
  return uuidv4();
};

/**
 * Create directory if it doesn't exist
 */
export const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Read file as buffer
 */
export const readFileAsBuffer = (filePath) => {
  return fs.readFileSync(filePath);
};

/**
 * Write content to file
 */
export const writeFile = (filePath, content) => {
  fs.writeFileSync(filePath, content);
};