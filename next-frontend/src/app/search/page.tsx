import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <SearchClient />
    </Suspense>
  );
}
