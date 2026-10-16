import { Suspense } from "react";
import AdminDashboard from "../../legacy-pages/adminDashboard.jsx";

export default function Page() {
  return <Suspense fallback={null}><AdminDashboard /></Suspense>;
}
