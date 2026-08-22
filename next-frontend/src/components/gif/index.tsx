"use client";

import React, { useEffect, useRef, useState } from "react";
import GifProvider, { useGif } from "@/context/gif_provider";
import { Gif } from "@/types/gif.types";
import { Search, Loader2 } from "lucide-react";

interface GifPickerContentProps {
    onSelect?: (gif: Gif) => void;
}

const GifPickerContent: React.FC<GifPickerContentProps> = ({
    onSelect,
}) => {
    const { gifs, loading, hasMore, searchGifs, getTrendingGifs, loadMore } = useGif();
    const [query, setQuery] = useState("");
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        getTrendingGifs();
    }, []);

    // Infinite scroll: observe a sentinel div at the bottom of the grid
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { root: el.parentElement, threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loading, loadMore]);

    const runSearch = () => {
        if (!query.trim()) return;
        searchGifs(query);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            runSearch();
        }
    };

    return (
        <div className="w-[400px] rounded-xl border bg-background shadow-lg">
            {/* Search */}
            <div className="border-b p-3">
                <div className="flex items-center gap-2 rounded-lg border px-3">
                    <button
                        type="button"
                        onClick={runSearch}
                        className="flex items-center justify-center"
                    >
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </button>

                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search GIFs..."
                        className="h-10 w-full bg-transparent text-sm outline-none"
                    />
                </div>
            </div>

            {/* GIF Grid */}
            <div className="grid max-h-[400px] grid-cols-3 gap-1 overflow-y-auto p-2">
                {gifs.map((gif) => (
                    <button
                        key={gif.id}
                        type="button"
                        onClick={() => onSelect?.(gif)}
                        className="group relative aspect-square overflow-hidden rounded-md"
                    >
                        <img
                            src={gif.images.fixed_width.url}
                            alt={gif.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    </button>
                ))}

                {/* Sentinel for infinite scroll, only mounted when there's more to load */}
                {hasMore && gifs.length > 0 && (
                    <div ref={sentinelRef} className="col-span-3 flex h-10 items-center justify-center">
                        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                )}
            </div>

            {/* Empty state */}
            {gifs.length === 0 && !loading && (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                    No GIFs found
                </div>
            )}

            {/* Initial loading state */}
            {gifs.length === 0 && loading && (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
            )}

            {/* Giphy branding */}
            <div className="border-t px-3 py-2">
                <span className="text-[10px] text-muted-foreground">
                    Powered by GIPHY
                </span>
            </div>
        </div>
    );
};

interface GifPickerProps {
    onSelect?: (gif: Gif) => void;
}

const GifPicker: React.FC<GifPickerProps> = ({ onSelect }) => {
    return (
        <GifProvider>
            <GifPickerContent onSelect={onSelect} />
        </GifProvider>
    );
};

export default GifPicker;