import { Suspense } from "react";
import GuildClient from "./GuildClient";
import { GuildPageSkeleton } from "@/components/skeletons";

export default function Page() {
  return (
    <Suspense fallback={<GuildPageSkeleton />}>
      <GuildClient />
    </Suspense>
  );
}