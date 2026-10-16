import { Suspense } from "react";
import CompanyDashboard from "../../legacy-pages/companyDashboard.jsx";

export default function Page() {
  return <Suspense fallback={null}><CompanyDashboard /></Suspense>;
}
