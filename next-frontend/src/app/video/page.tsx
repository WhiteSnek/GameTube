import { Suspense } from "react";
import VideoClient from "./VideoClient";
import { VideoPageSkeleton } from "@/components/skeletons";

export default function Page() {
  return (
    <Suspense fallback={<VideoPageSkeleton />}>
      <VideoClient />
    </Suspense>
  );
}