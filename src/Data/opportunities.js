function getSeedExpiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 60);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

const seedExpiryDate = getSeedExpiryDate();

export const defaultOpportunities = [
  {
    id: 1,
    type: "Job",
    title: "Software Developer",
    company: "TechNova Technologies",
    location: "Guntur",
    mode: "Full Time",
    openings: 5,
    salary: "₹4 - ₹7 LPA",
    expiryDate: seedExpiryDate,
    verified: true
  },
  {
    id: 2,
    type: "Internship",
    title: "Web Development Intern",
    company: "TechNova Technologies",
    location: "Guntur",
    mode: "Hybrid",
    openings: 3,
    duration: "3 Months",
    expiryDate: seedExpiryDate,
    verified: true
  },
  {
    id: 3,
    type: "Job",
    title: "Data Analyst",
    company: "DataVision Analytics",
    location: "Guntur",
    mode: "Full Time",
    openings: 3,
    salary: "₹5 - ₹8 LPA",
    expiryDate: seedExpiryDate,
    verified: true
  },
  {
    id: 4,
    type: "Internship",
    title: "Data Analytics Intern",
    company: "DataVision Analytics",
    location: "Guntur",
    mode: "Online",
    openings: 4,
    duration: "6 Months",
    expiryDate: seedExpiryDate,
    verified: true
  },
  {
    id: 5,
    type: "Job",
    title: "Frontend Developer",
    company: "CloudSoft Solutions",
    location: "Vijayawada",
    mode: "Hybrid",
    openings: 4,
    salary: "₹4 - ₹6 LPA",
    expiryDate: seedExpiryDate,
    verified: true
  },
  {
    id: 6,
    type: "Internship",
    title: "Cloud Computing Intern",
    company: "CloudSoft Solutions",
    location: "Vijayawada",
    mode: "Online",
    openings: 2,
    duration: "3 Months",
    expiryDate: seedExpiryDate,
    verified: true
  }
];

const STORAGE_KEY = "opportunities";

export function loadOpportunities() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return defaultOpportunities;

    const opportunities = JSON.parse(saved);
    return Array.isArray(opportunities) ? opportunities : defaultOpportunities;
  } catch {
    return defaultOpportunities;
  }
}

export function saveOpportunities(opportunities) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
}

export function isOpportunityExpired(opportunity, now = new Date()) {
  if (!opportunity.expiryDate) return false;

  const expiry = new Date(`${opportunity.expiryDate}T23:59:59`);
  return !Number.isNaN(expiry.getTime()) && expiry < now;
}

export function isOpportunityActive(opportunity, now = new Date()) {
  return opportunity.status !== "rejected" && !isOpportunityExpired(opportunity, now);
}