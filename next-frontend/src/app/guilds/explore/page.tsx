'use client'
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import GuildCard from "@/components/guild_card";
import { GuildsType } from "@/types/guild.types";
import { Search } from "lucide-react";
import { useGuild } from "@/context/guild_provider";

export default function ExploreGuilds() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [guilds, setGuilds] = useState<GuildsType[]>([]);
  const { searchGuilds, getGuildAvatars } = useGuild();

  // Debounce search/filter trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchGuilds = async () => {
        const tags = tagFilter
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag !== "");
  
        const res = await searchGuilds({
          query: query.trim(),
          filter: filter !== "all" ? (filter as "joined" | "not_joined") : undefined,
          tags: tags.length > 0 ? tags : undefined,
          limit: 20,
          skip: 0,
        });
  
        if (res) {
          const guildIds = res.map(guild => guild.id);
          const guildAvatars = await getGuildAvatars(guildIds);
          if(!guildAvatars) return;
          const updatedGuilds = res.map((guild, idx) => ({
            ...guild,
            avatar: guildAvatars[idx],
          }));
          setGuilds(updatedGuilds);
        }
      };
  
      fetchGuilds();
    }, 400);
  
    return () => clearTimeout(delayDebounce);
  }, [query, filter, tagFilter]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  };

  return (
    <div className="p-10 relative">
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight">Explore Guilds</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-lg">
        <form className="relative w-full" onSubmit={handleSubmit}>
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400"
            size={20}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for guilds..."
            className="w-full px-12 py-2 rounded-full text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-400 transition-all bg-white text-black border border-zinc-300 dark:bg-zinc-800 dark:text-white"
          />
        </form>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="shadow-sm w-[180px]">Filter</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Filter Guilds</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-60 pr-2">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Joined Status</label>
                  <div className="space-y-2 mt-2">
                    {["all", "joined", "not_joined"].map(option => (
                      <div key={option} className="flex items-center gap-2">
                        <Checkbox
                          id={option}
                          checked={filter === option}
                          onCheckedChange={() => setFilter(option)}
                        />
                        <label htmlFor={option} className="text-sm capitalize">
                          {option.replace("_", " ")}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Filter by Tag</label>
                  <Input
                    placeholder="e.g. warriors, code"
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <GuildCard guilds={guilds} />
    </div>
  );
}
