// Single source of truth for API communication.
// Route fix: backend is /api/upload, not /upload

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/**
 * Upload a video file for processing.
 * @param {File} file
 * @param {string} targetLang  e.g. "es"
 * @param {(pct: number) => void} onProgress  called with 0-90 during upload
 * @returns {Promise<object>} API response data
 */
export async function uploadVideo(file, targetLang, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("targetLang", targetLang);

  // Use XMLHttpRequest so we get real upload progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        // Upload is ~70% of total work; rest is server processing
        const pct = Math.round((e.loaded / e.total) * 70);
        onProgress?.(pct);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid JSON response from server"));
        }
      } else {
        let message = "Upload failed";
        try {
          const body = JSON.parse(xhr.responseText);
          message = body.error ?? message;
        } catch { /* ignore */ }
        reject(new Error(message));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error — is the server running?")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.open("POST", `${BASE_URL}/api/upload`);
    xhr.send(formData);
  });
}

export const healthCheck = () =>
  fetch(`${BASE_URL}/health`).then((r) => r.json());
