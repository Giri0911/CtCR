const STORAGE_KEY = "driveRequests";

export function loadDriveRequests() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];

    const requests = JSON.parse(saved);
    return Array.isArray(requests) ? requests : [];
  } catch {
    return [];
  }
}

export function saveDriveRequests(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}
