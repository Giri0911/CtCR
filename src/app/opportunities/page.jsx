import { Suspense } from "react";
import Opportunities from "../../legacy-pages/Opportunities.jsx";

export default function Page() {
  return <Suspense fallback={null}><Opportunities /></Suspense>;
}
