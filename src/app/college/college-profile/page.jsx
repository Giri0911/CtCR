import { Suspense } from "react";
import CollegeDashboard from "../../../legacy-pages/collegeDashboard.jsx";

export default function Page() {
  return <Suspense fallback={null}><CollegeDashboard /></Suspense>;
}
