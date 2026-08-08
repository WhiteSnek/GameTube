import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn("bg-zinc-200 dark:bg-zinc-700/80", className)}
    />
  );
}

function VideoCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 p-2", className)}>
      <SkeletonBar className="aspect-video w-full rounded-xl" />
      <div className="space-y-2 px-1">
        <SkeletonBar className="h-4 w-4/5" />
        <SkeletonBar className="h-3 w-3/5" />
        <div className="flex items-center gap-2 pt-1">
          <SkeletonBar className="h-8 w-8 rounded-full" />
          <SkeletonBar className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function VideoGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8 py-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function VideoListItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/50">
      <SkeletonBar className="w-52 h-28 flex-shrink-0 rounded-lg" />
      <div className="flex flex-col justify-between flex-1 space-y-3 py-1">
        <div className="space-y-2">
          <SkeletonBar className="h-5 w-4/5" />
          <SkeletonBar className="h-4 w-2/5" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBar className="h-8 w-8 rounded-full" />
          <SkeletonBar className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export function VideoListSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <VideoListItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageHeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex items-end gap-4">
        <SkeletonBar className="h-10 w-10 rounded-lg" />
        <SkeletonBar className="h-12 w-64" />
      </div>
      {withAction && <SkeletonBar className="h-10 w-10 rounded-full" />}
    </div>
  );
}

export function SubscriptionRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 min-w-[70px]">
          <SkeletonBar className="h-14 w-14 rounded-full" />
          <SkeletonBar className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

export function JoinedPageSkeleton() {
  return (
    <div className="relative animate-in fade-in duration-300">
      <div className="px-10 space-y-4">
        <SubscriptionRowSkeleton />
        <SkeletonBar className="h-10 w-32" />
      </div>
      <VideoGridSkeleton />
    </div>
  );
}

export function HistoryPageSkeleton() {
  return (
    <div className="relative max-w-6xl mx-auto p-4 space-y-6 animate-in fade-in duration-300">
      <PageHeaderSkeleton withAction />
      <SkeletonBar className="h-px w-full bg-red-500/30" />
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-zinc-100 dark:bg-zinc-900 p-5 rounded-2xl shadow-lg space-y-4"
          >
            <SkeletonBar className="h-7 w-40" />
            <VideoListSkeleton count={2} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListPageSkeleton() {
  return (
    <div className="relative max-w-5xl mx-auto p-4 space-y-6 animate-in fade-in duration-300">
      <PageHeaderSkeleton />
      <SkeletonBar className="h-px w-full bg-red-500/30" />
      <VideoListSkeleton />
    </div>
  );
}

export function VideoPageSkeleton() {
  return (
    <div className="relative grid grid-cols-12 p-4 gap-4 animate-in fade-in duration-300">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <SkeletonBar className="aspect-video w-full rounded-2xl" />
        <div className="space-y-3">
          <SkeletonBar className="h-8 w-3/4" />
          <div className="flex items-center gap-3">
            <SkeletonBar className="h-10 w-10 rounded-full" />
            <SkeletonBar className="h-4 w-40" />
          </div>
          <SkeletonBar className="h-20 w-full rounded-xl" />
        </div>
        <div className="space-y-4 pt-4">
          <SkeletonBar className="h-6 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <SkeletonBar className="h-9 w-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBar className="h-4 w-28" />
                <SkeletonBar className="h-12 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4 space-y-4">
        <SkeletonBar className="h-8 w-48" />
        <SkeletonBar className="h-px w-full bg-red-500/30" />
        <VideoListSkeleton count={4} />
      </div>
    </div>
  );
}

export function GuildPageSkeleton() {
  return (
    <div className="relative px-6 py-2 animate-in fade-in duration-300">
      <div className="w-full space-y-6 px-4">
        <SkeletonBar className="h-48 w-full rounded-2xl" />
        <div className="flex items-center gap-4">
          <SkeletonBar className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <SkeletonBar className="h-8 w-48" />
            <SkeletonBar className="h-4 w-full max-w-md" />
          </div>
          <SkeletonBar className="h-10 w-32 rounded-md" />
        </div>
        <div className="flex items-center justify-between p-4">
          <SkeletonBar className="h-8 w-40" />
          <div className="flex gap-3">
            <SkeletonBar className="h-10 w-28 rounded-md" />
            <SkeletonBar className="h-10 w-28 rounded-md" />
          </div>
        </div>
        <SkeletonBar className="h-px w-full bg-red-500/30" />
        <VideoGridSkeleton count={6} className="px-0" />
      </div>
    </div>
  );
}

export function ExploreGuildsSkeleton() {
  return (
    <div className="p-10 relative space-y-8 animate-in fade-in duration-300">
      <SkeletonBar className="h-10 w-56" />
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-100 dark:bg-zinc-900 p-6 rounded-lg">
        <SkeletonBar className="h-10 w-full rounded-full" />
        <SkeletonBar className="h-10 w-[180px] rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden h-[370px] flex flex-col"
          >
            <SkeletonBar className="h-40 w-full rounded-none" />
            <div className="p-5 space-y-3 flex-1">
              <SkeletonBar className="h-6 w-3/4" />
              <SkeletonBar className="h-4 w-full" />
              <SkeletonBar className="h-4 w-2/3" />
              <div className="flex gap-2 pt-2">
                <SkeletonBar className="h-6 w-16 rounded-full" />
                <SkeletonBar className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatPageSkeleton() {
  return (
    <div className="px-10 animate-in fade-in duration-300">
      <div className="flex h-[calc(100vh-100px)] gap-4">
        <div className="w-1/5 min-w-[220px] flex flex-col bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow-lg overflow-hidden">
          <SkeletonBar className="h-14 w-full rounded-none" />
          <div className="flex-1 p-3 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <SkeletonBar className="h-11 w-11 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonBar className="h-4 w-24" />
                  <SkeletonBar className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
            <SkeletonBar className="h-10 w-10 rounded-full" />
            <SkeletonBar className="h-5 w-36" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn("flex gap-3", i % 3 === 2 && "flex-row-reverse")}
              >
                <SkeletonBar className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="space-y-2 max-w-[60%]">
                  <SkeletonBar className="h-3 w-20" />
                  <SkeletonBar className="h-14 w-48 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 flex gap-2">
            <SkeletonBar className="h-10 w-10 rounded-lg" />
            <SkeletonBar className="h-10 flex-1 rounded-lg" />
            <SkeletonBar className="h-10 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppPageSkeleton() {
  return (
    <div className="p-6 animate-in fade-in duration-300">
      <VideoGridSkeleton count={9} />
    </div>
  );
}

export function NavbarUserSkeleton() {
  return <SkeletonBar className="h-14 w-14 rounded-full" />;
}
