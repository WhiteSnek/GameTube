import { Suspense } from "react";
import VideoClient from "./VideoClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoClient />
    </Suspense>
  );
}