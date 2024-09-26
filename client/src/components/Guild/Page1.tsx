import React from 'react';
import { CreateGuildTemplate } from '../../templates/guild_template';

interface RegisterProps {
  guildInfo: CreateGuildTemplate;
  setGuildInfo: React.Dispatch<React.SetStateAction<CreateGuildTemplate>>;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
}

const Page1: React.FC<RegisterProps> = ({ guildInfo, setGuildInfo, setActiveTab }) => {

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActiveTab((prev) => prev + 1);
  };

  return (
    <form className="p-4 border-b-2 border-x-2 border-red-400 rounded-b-md" onSubmit={handleNext}>
      <div className="mb-6">
        <label className="block text-white mb-2">Name your Guild:</label>
        <input
          type="text"
          value={guildInfo.name}
          onChange={(e) => setGuildInfo({ ...guildInfo, name: e.target.value })}
          className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-white mb-2">A short description:</label>
        <textarea
          value={guildInfo.description}
          onChange={(e) => setGuildInfo({ ...guildInfo, description: e.target.value })}
          className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-white mb-2">Privacy:</label>
        <div className="flex justify-around items-center">
          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="private"
              name="privacy"
              checked={guildInfo.private}
              onChange={() => setGuildInfo({ ...guildInfo, private: true })}
              className="mr-2 hidden"
            />
            <label htmlFor="private" className="flex items-center cursor-pointer">
              <span className={`w-5 h-5 inline-block rounded-full border-2 ${guildInfo.private ? 'bg-red-500 border-red-500' : 'border-gray-400'}`}></span>
              <span className="ml-2 text-white">Private</span>
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="public"
              name="privacy"
              checked={!guildInfo.private}
              onChange={() => setGuildInfo({ ...guildInfo, private: false })}
              className="mr-2 hidden"
            />
            <label htmlFor="public" className="flex items-center cursor-pointer">
              <span className={`w-5 h-5 inline-block rounded-full border-2 ${!guildInfo.private ? 'bg-red-500 border-red-500' : 'border-gray-400'}`}></span>
              <span className="ml-2 text-white">Public</span>
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        NEXT
      </button>
    </form>
  );
};

export default Page1;
