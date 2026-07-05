import { Suspense } from "react";
import GuildClient from "./GuildClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GuildClient />
    </Suspense>
  );
}