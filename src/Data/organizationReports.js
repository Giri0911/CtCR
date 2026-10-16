const STORAGE_KEY = "organizationReports";

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
}
