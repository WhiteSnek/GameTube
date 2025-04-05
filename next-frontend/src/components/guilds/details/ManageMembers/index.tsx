import React, { useEffect, useState } from "react";
import { GuildMembersType } from "@/types/guild.types";
import { Button } from "@/components/ui/button";
import { UserMinus, ArrowUp, ArrowDown } from "lucide-react";
import { useGuild } from "@/context/guild_provider";
import { useUser } from "@/context/user_provider";

const ManageMembers: React.FC<{ guildId: string; userRole: string }> = ({
  guildId,
  userRole,
}) => {
  const [members, setMembers] = useState<GuildMembersType[]>([]);
  const { getGuildMembers, manageRoles } = useGuild();
  const { getMultipleUserAvatars } = useUser();

  useEffect(() => {
    const fetchMembers = async () => {
      const response = await getGuildMembers(guildId);
      const userKeys = response.map((user) => user.userAvatar);
      const avatars = await getMultipleUserAvatars(userKeys);
      if (!avatars) return;
      const updatedMembers = response.map((res, idx) => ({
        ...res,
        userAvatar: avatars[idx],
      }));
      setMembers(updatedMembers);
    };
    fetchMembers();
  }, []);

  const changeRoles = async (
    memberId: string,
    action: "promote" | "demote" | "kick"
  ) => {
    console.log(memberId, action)
    const response = await manageRoles(guildId, memberId, action);
    console.log(response)
    if (!response) return;
    let newMembers: GuildMembersType[];
    switch (action) {
      case "promote":
        newMembers = members.map((member) => {
          if (member.userId !== memberId) return member;
          switch (member.role.toLowerCase()) {
            case "member":
              return { ...member, role: "elder" };
            case "elder":
              return { ...member, role: "coleader" };
            default:
              return member;
          }
          
        });
        break
        case "demote":
          newMembers = members.map((member) => {
            if (member.userId !== memberId) return member;
            switch (member.role.toLowerCase()) {
              case "elder":
                return { ...member, role: "member" };
              case "coleader":
                return { ...member, role: "elder" };
              default:
                return member;
            }
          });
          break
        case "kick":
          newMembers = members.filter((member) => member.userId !== memberId)
          break
        default:
          return;
    }
    setMembers(newMembers)
  };

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Manage Members
      </h3>
      <div className="overflow-x-auto h-[465px] overflow-y-scroll rounded-lg border border-gray-300 dark:border-zinc-700">
        <table className="min-w-full bg-white dark:bg-zinc-800 rounded-lg">
          <thead className="bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-white">
            <tr>
              <th className="px-6 py-3 text-left">Avatar</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr
                key={member.userId}
                className={`border-b border-gray-300 dark:border-zinc-700 transition duration-300 hover:bg-gray-100 dark:hover:bg-zinc-600 ${
                  index % 2 === 0
                    ? "bg-gray-50 dark:bg-zinc-900"
                    : "bg-white dark:bg-zinc-800"
                }`}
              >
                <td className="px-6 py-4">
                  <img
                    src={member.userAvatar}
                    alt={member.username}
                    className="w-12 h-12 rounded-full shadow-md object-cover"
                  />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {member.username}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      member.role.toLowerCase() === "leader"
                        ? "bg-red-500 text-white"
                        : member.role.toLowerCase() === "co-leader"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-400 text-gray-900 dark:bg-gray-600 dark:text-white"
                    }`}
                  >
                    {member.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3 items-center">
                    {userRole === "leader" &&
                      member.role.toLowerCase() !== "coleader" &&
                      member.role.toLowerCase() !== "leader" && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="hover:bg-green-500 hover:text-white transition-transform transform hover:scale-110"
                          onClick={() => changeRoles(member.userId, "promote")}
                        >
                          <ArrowUp className="w-5 h-5" />
                        </Button>
                      )}
                    {userRole === "leader" &&
                      member.role.toLowerCase() !== "member" &&
                      member.role.toLowerCase() !== "leader" && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="hover:bg-yellow-500 hover:text-white transition-transform transform hover:scale-110"
                          onClick={() => changeRoles(member.userId, "demote")}
                        >
                          <ArrowDown className="w-5 h-5" />
                        </Button>
                      )}
                    {(userRole === "leader" || userRole === "co-leader") &&
                      member.role.toLowerCase() !== "leader" && (
                        <Button
                          size="icon"
                          variant="destructive"
                          className="hover:bg-red-600 transition-transform transform hover:scale-110"
                          onClick={() => changeRoles(member.userId, "kick")}
                        >
                          <UserMinus className="w-5 h-5" />
                        </Button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageMembers;
