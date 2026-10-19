const STORAGE_KEY = "organizationReports";
import { api } from "../api/client.js";

export function loadOrganizationReports() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];

    const reports = JSON.parse(saved);
    return Array.isArray(reports) ? reports : [];
  } catch {
    return [];
  }
}

export function saveOrganizationReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  api.saveCollection("organizationReports", reports).catch((error) =>
    console.error("Unable to sync organization reports with the database.", error)
  );
}

export async function hydrateOrganizationReports() {
  try {
    const reports = await api.getCollection("organizationReports");
    if (reports.length === 0) {
      const localReports = loadOrganizationReports();
      if (localReports.length > 0) {
        await api.saveCollection("organizationReports", localReports);
        return localReports;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    return reports;
  } catch (error) {
    console.error("Unable to load organization reports from the database.", error);
    return loadOrganizationReports();
  }
}
