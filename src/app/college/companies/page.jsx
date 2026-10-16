import { Suspense } from "react";
import CompanyDirectory from "../../../CompanyDirectory.jsx";

export default function Page() {
  return <Suspense fallback={null}><CompanyDirectory /></Suspense>;
}
