import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { ListPageSkeleton } from "@/components/skeletons";

export default function SearchPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <SearchClient />
    </Suspense>
  );
}
