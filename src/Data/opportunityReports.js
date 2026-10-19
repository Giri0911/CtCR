const STORAGE_KEY = "opportunityReports";
import { api } from "../api/client.js";

export function loadOpportunityReports() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];

    const reports = JSON.parse(saved);
    return Array.isArray(reports) ? reports : [];
  } catch {
    return [];
  }
}

export function saveOpportunityReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  api.saveCollection("opportunityReports", reports).catch((error) =>
    console.error("Unable to sync opportunity reports with the database.", error)
  );
}

export async function hydrateOpportunityReports() {
  try {
    const reports = await api.getCollection("opportunityReports");
    if (reports.length === 0) {
      const localReports = loadOpportunityReports();
      if (localReports.length > 0) {
        await api.saveCollection("opportunityReports", localReports);
        return localReports;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    return reports;
  } catch (error) {
    console.error("Unable to load opportunity reports from the database.", error);
    return loadOpportunityReports();
  }
}
