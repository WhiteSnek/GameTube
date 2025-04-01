import React, { useState } from "react";
import { GuildDetailsType } from "@/types/guild.types";
import { Button } from "@/components/ui/button";
import { UserMinus, ArrowUp, ArrowDown } from "lucide-react";

const dummyMembers = [
  { id: "1", name: "John Doe", role: "admin" },
  { id: "2", name: "Alice Smith", role: "member" },
  { id: "3", name: "Bob Johnson", role: "member" },
  { id: "4", name: "Charlie Brown", role: "admin" },
  { id: "5", name: "David Lee", role: "member" },
];

const ManageMembers: React.FC<{ guild: GuildDetailsType }> = ({ guild }) => {
  const [members, setMembers] = useState(dummyMembers);

  const promoteMember = (id: string) => {
    setMembers(
      members.map((member) =>
        member.id === id ? { ...member, role: "admin" } : member
      )
    );
  };

  const demoteMember = (id: string) => {
    setMembers(
      members.map((member) =>
        member.id === id ? { ...member, role: "member" } : member
      )
    );
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((member) => member.id !== id));
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 shadow-lg rounded-lg">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Manage Members
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-zinc-700">
          <thead className="bg-gray-200 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Name</th>
              <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Role</th>
              <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr
                key={member.id}
                className={`border-b border-gray-300 dark:border-zinc-700 ${
                  index % 2 === 0 ? "bg-gray-100 dark:bg-zinc-800" : "bg-white dark:bg-zinc-900"
                }`}
              >
                <td className="px-4 py-3 text-gray-900 dark:text-white">{member.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      member.role === "admin"
                        ? "bg-red-500 text-white"
                        : "bg-gray-400 text-gray-900 dark:bg-gray-600 dark:text-white"
                    }`}
                  >
                    {member.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {member.role === "member" && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="hover:bg-green-500 hover:text-white"
                        onClick={() => promoteMember(member.id)}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                    )}
                    {member.role === "admin" && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="hover:bg-yellow-500 hover:text-white"
                        onClick={() => demoteMember(member.id)}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="hover:bg-red-600"
                      onClick={() => removeMember(member.id)}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
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
