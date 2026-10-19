const STORAGE_KEY = "driveRequests";
import { api } from "../api/client.js";

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
  api.saveCollection("driveRequests", requests).catch((error) =>
    console.error("Unable to sync drive requests with the database.", error)
  );
}

export async function hydrateDriveRequests() {
  try {
    const requests = await api.getCollection("driveRequests");
    if (requests.length === 0) {
      const localRequests = loadDriveRequests();
      if (localRequests.length > 0) {
        await api.saveCollection("driveRequests", localRequests);
        return localRequests;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    return requests;
  } catch (error) {
    console.error("Unable to load drive requests from the database.", error);
    return loadDriveRequests();
  }
}
