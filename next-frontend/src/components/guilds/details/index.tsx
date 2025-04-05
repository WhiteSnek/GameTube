import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Crown, DoorOpen } from "lucide-react";
import GuildSettings from "./GuildSettings";
import ManageMembers from "./ManageMembers";
import { useGuild } from "@/context/guild_provider";
import { useUser } from "@/context/user_provider";
import { GuildDetailsType } from "@/types/guild.types";
import truncateText from "@/utils/truncate_text";
import Image from "next/image";
import { useEffect } from "react";

interface ManageGuildProps {
  guild: GuildDetailsType;
}

const ManageGuild: React.FC<ManageGuildProps> = ({ guild }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-500 text-white flex items-center gap-2 hover:bg-red-600">
          <Crown className="w-5 h-5" /> Manage Guild
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-3xl p-6 w-full">
        <DialogHeader>
          <DialogTitle>Manage Guild</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="flex w-full space-x-4 ">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
          <TabsContent value="settings">
            <GuildSettings guild={guild} />
          </TabsContent>
          <TabsContent value="members">
            <ManageMembers guildId={guild.id} userRole="leader" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface DetailsProps {
  guild: GuildDetailsType;
}

const Details: React.FC<DetailsProps> = ({ guild }) => {
  const { getGuildImages, images, joinGuild, leaveGuild } = useGuild();
  const [joined, setJoined] = useState<boolean>(guild.joined);
  const { User } = useUser();

  const toggleMembership = async () => {
    let response;
    if (joined) {
      response = await leaveGuild(guild.id);
      setJoined(false);
    } else {
      response = await joinGuild(guild.id);
      setJoined(true);
    }
    console.log(response);
  };

  useEffect(() => {
    getGuildImages(guild.id);
  }, [guild.id]);

  return (
    <div className="w-full bg-white dark:bg-zinc-800 shadow-lg rounded-2xl overflow-hidden">
      {/* Cover Image */}
      <div className="h-48 bg-gray-300 flex items-center justify-center">
        <Image
          src={images?.coverUrl || "/default-cover.png"}
          priority
          alt="Cover"
          width={1920}
          height={1080}
          placeholder="blur"
          className="w-full h-full object-cover"
          blurDataURL="/placeholder.jpg"
        />
      </div>

      {/* Avatar & Channel Info */}
      <div className="p-6 flex items-center space-x-4">
        <Image
          src={images?.avatarUrl || "/default-avatar.png"}
          alt="Avatar"
          width={40}
          height={40}
          priority
          placeholder="blur"
          blurDataURL="/placeholder.jpg"
          className="w-20 h-20 object-cover aspect-square rounded-full border-4 border-zinc-950 dark:border-white shadow-md"
        />
        <div>
          <h2 className="text-2xl font-semibold">{guild.name}</h2>
          {guild.description && (
            <p className="text-zinc-700 dark:text-zinc-300">
              {truncateText(guild.description, 200)}
            </p>
          )}
        </div>
      </div>

      {/* Manage Button */}
      <div className="p-6 flex justify-between">
        <div>
          {guild.tags &&
            guild.tags.map((tag, idx) => (
              <span key={idx} className="bg-red-500 text-sm text-white rounded-full px-2 py-1 mx-1">
                {tag}
              </span>
            ))}
        </div>
        <div>
          {guild.ownerId === User?.id ? (
            <ManageGuild guild={guild} />
          ) : (
            <button
              onClick={toggleMembership}
              className="px-4 bg-red-500 cursor-pointer text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
            >
              <DoorOpen className="w-5 h-5" />{joined ? "Leave Guild" : "Join Guild"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Details;
