const STORAGE_KEY = "opportunityReports";

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
}
