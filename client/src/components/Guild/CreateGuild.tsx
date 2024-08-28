import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../providers/UserProvider";
import { CreateGuildTemplate } from "../../templates/guild_template";
import Page1 from "./Page1";
import Page2 from "./Page2";
import { Castle } from "@mui/icons-material";
const CreateGuild: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [guildInfo, setGuildInfo] = useState<CreateGuildTemplate>({
    name: "",
    description: "",
    avatar: null,
    avatarUrl: "",
    coverImage: null,
    coverImageUrl: "",
    private: false,
  });
  const [activeTab, setActiveTab] = useState<number>(1);
  useEffect(() => {
    if (!user) navigate("/login");
  }, []);
  return (
    <div className="flex justify-center items-center bg-zinc-900">
      <div className="bg-zinc-800 p-8 rounded-lg border border-red-500 w-full max-w-xl">
        <h1 className="text-3xl text-red-500 mb-6 font-bold text-center">
        <Castle /> Create your Guild 
        </h1>
        <div className="grid grid-cols-2 items-center text-red-400 font-bold text-lg">
          <button
            onClick={() => setActiveTab(1)}
            className={`px-4 py-2  text-center ${
              activeTab === 1
                ? "bg-zinc-800 border-t-2 border-x-2 rounded-t-lg"
                : "bg-zinc-900 border-b-2"
            } border-red-400 transition-all`}
          >
            General Details
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`px-4 py-2 text-center ${
              activeTab === 2
                ? "bg-zinc-800 border-t-2 border-x-2 rounded-t-lg"
                : "bg-zinc-900 border-b-2"
            } border-red-400 transition-all`}
          >
            Set Profile Image
          </button>
        </div>
        {activeTab === 1 && (
          <Page1
            guildInfo={guildInfo}
            setGuildInfo={setGuildInfo}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 2 && (
          <Page2 guildInfo={guildInfo} setGuildInfo={setGuildInfo} />
        )}
      </div>
    </div>
  );
};

export default CreateGuild;
