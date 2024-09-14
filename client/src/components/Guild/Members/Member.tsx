import React from "react";
import { GuildMembers } from "../../../templates/guild_template";
import { Link } from "react-router-dom";
import { formatDateFormat } from "../../../utils/formatDateFormat";

interface Members {
  member: GuildMembers;
}

const Member: React.FC<Members> = ({ member }) => {
  return (
    <Link
      to={`/${member.userId}`}
      className={`flex justify-between items-center p-4 text-white rounded-lg my-2 shadow-md ${
        member.userRole === "leader"
          ? "bg-yellow-700"
          : member.userRole === "coleader"
          ? "bg-slate-700"
          : member.userRole === "elder"
          ? "bg-stone-700"
          : ""
      }`}
    >
      <img
        src={member.userAvatar}
        alt={member.userName}
        className="h-10 aspect-square object-cover rounded-full"
      />
      <div className="">
        <h1 className="text-md font-semibold">{member.userName}</h1>
        <p className="text-sm font-thin text-gray-300">{member.userRole}</p>
      </div>
      <p className="text-xs">{formatDateFormat(member.joinedAt)}</p>
    </Link>
  );
};

export default Member;
