import { GuildsType } from "@/types/guild.types";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";

interface GuildCardProps {
  guilds: GuildsType[];
}

const GuildCard: React.FC<GuildCardProps> = ({ guilds }) => {
  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
        {guilds.map((guild, idx) => (
          <motion.div
            key={guild.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link href={`/guilds?guildId=${guild.id}`} className="block h-full">
              <Card className="group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-2xl hover:-translate-y-1 transition-transform duration-300 p-0 h-[370px] flex flex-col">
                {guild.avatar && (
                  <div className="w-full h-40 overflow-hidden">
                    <img
                      src={guild.avatar}
                      alt={guild.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <CardContent className="flex flex-col justify-between flex-grow px-5 py-4">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-white truncate">
                      {guild.name}
                    </h2>
                    {guild.description ? (
                      <div
                        className="prose dark:prose-invert mt-1 text-sm text-muted-foreground line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(guild.description),
                        }}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                        No Guild Description
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Badge className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                      👥 {guild.members}{" "}
                      {guild.members === 1 ? "Member" : "Members"}
                    </Badge>
                    <Button
                      size="sm"
                      variant={guild.joined ? "destructive" : "default"}
                      className="rounded-full px-4 text-sm font-semibold shadow-sm"
                    >
                      {guild.joined ? "Leave" : "Join"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default GuildCard;
