const STORAGE_KEY = "verificationRequests";

export const MAX_VERIFICATION_DOCUMENTS = 3;
export const MAX_VERIFICATION_DOCUMENT_SIZE = 300 * 1024;

export function readVerificationDocument(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      dataUrl: reader.result
    });
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export function loadVerificationRequests() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];

    const requests = JSON.parse(saved);
    return Array.isArray(requests) ? requests : [];
  } catch {
    return [];
  }
}

export function saveVerificationRequests(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}
