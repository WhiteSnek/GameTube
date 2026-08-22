"use client";

import { giphyApi } from "@/lib/axios";
import { Gif } from "@/types/gif.types";
import React, { createContext, ReactNode, useContext, useRef, useState } from "react";

const LIMIT = 25;

interface GifContextType {
  gifs: Gif[];
  loading: boolean;
  hasMore: boolean;
  searchGifs: (query: string) => Promise<void>;
  getTrendingGifs: () => Promise<void>;
  loadMore: () => Promise<void>;
}

const GifContext = createContext<GifContextType | undefined>(undefined);

export const useGif = () => {
  const context = useContext(GifContext);

  if (!context) {
    throw new Error("useGif must be used within a GifProvider");
  }

  return context;
};

interface GifProviderProps {
  children: ReactNode;
}

type Mode = "trending" | "search";

const GifProvider: React.FC<GifProviderProps> = ({ children }) => {
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

  // Track pagination state without triggering re-renders on their own
  const offsetRef = useRef(0);
  const modeRef = useRef<Mode>("trending");
  const queryRef = useRef("");
  const loadingRef = useRef(false);

  const mapGifs = (data: any[]): Gif[] =>
    data.map((gif) => ({
      id: gif.id,
      title: gif.title,
      images: {
        fixed_width: {
          url: gif.images.fixed_width.url,
          width: gif.images.fixed_width.width,
          height: gif.images.fixed_width.height,
        },
      },
    }));

  const fetchGifs = async (mode: Mode, query: string, offset: number, append: boolean) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const endpoint = mode === "search" ? "/search" : "/trending";
      const params =
        mode === "search"
          ? {
              api_key: apiKey,
              q: query,
              limit: LIMIT,
              offset,
              lang: "en",
              bundle: "messaging_non_clips",
            }
          : {
              api_key: apiKey,
              limit: LIMIT,
              offset,
              country_code: "IN",
              bundle: "messaging_non_clips",
            };

      const response = await giphyApi.get(endpoint, { params });
      const newGifs = mapGifs(response.data.data);

      setGifs((prev) => (append ? [...prev, ...newGifs] : newGifs));
      setHasMore(newGifs.length === LIMIT);

      modeRef.current = mode;
      queryRef.current = query;
      offsetRef.current = offset + newGifs.length;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const searchGifs = async (query: string): Promise<void> => {
    await fetchGifs("search", query, 0, false);
  };

  const getTrendingGifs = async (): Promise<void> => {
    await fetchGifs("trending", "", 0, false);
  };

  const loadMore = async (): Promise<void> => {
    if (!hasMore || loadingRef.current) return;
    await fetchGifs(modeRef.current, queryRef.current, offsetRef.current, true);
  };

  return (
    <GifContext.Provider
      value={{ gifs, loading, hasMore, searchGifs, getTrendingGifs, loadMore }}
    >
      {children}
    </GifContext.Provider>
  );
};

export default GifProvider;