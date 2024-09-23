import React from 'react';
import { AllGuilds } from '../../templates/guild_template';
import { Link } from 'react-router-dom';

interface SearchGuildResultProps {
  guild: AllGuilds;
}

const SearchGuildResult: React.FC<SearchGuildResultProps> = ({ guild }) => {
  return (
    <Link
      to={`/guilds/${guild.id}`}
      className="flex items-center space-x-6 px-3 sm:px-40 rounded-lg p-4 hover:bg-zinc-800 transition-transform transform"
    >
      {/* Avatar Image */}
      <img
        src={guild.avatar}
        alt={guild.guild_name}
        className="h-16 sm:h-36 w-16 sm:w-36 aspect-square rounded-full object-cover border-2 sm:border-4 border-red-600"
      />

      {/* Guild Info */}
      <div className="flex flex-col justify-between">
        <h1 className="text-white text-lg sm:text-3xl font-bold">
          {guild.guild_name}
        </h1>
        <p className="text-gray-400 text-sm sm:text-lg font-medium">{guild.username}</p>
      </div>
    </Link>
  );
};

export default SearchGuildResult;
