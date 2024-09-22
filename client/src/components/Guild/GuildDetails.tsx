import React, { useEffect, useState } from "react";
import { useGuild } from "../../providers/GuildProvider";
import { useUser } from "../../providers/UserProvider";
import { useVideo } from "../../providers/VideoProvider";
import VideoGrid from "../VideoGrid/VideoGrid";
import { VideoCardTemplate } from "../../templates/video_templates";
import { Snackbar, Alert } from '@mui/material';
import Members from "./Members/Members";
import { useSidebar } from "../../providers/SidebarProvider";
import { Link, useNavigate } from "react-router-dom";
import LoadingGuildDetails from "./LoadingGuildDetails";
import LoadingVideo from "./LoadingVideo";

interface GuildDetailsProps {
  guildId: string;
}

const GuildDetails: React.FC<GuildDetailsProps> = ({ guildId }) => {
  const [video, setVideo] = useState<VideoCardTemplate[]>([]);
  const [isAMember, setIsAMember] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [loadingInfo, setLoadingInfo] = useState<boolean>(false);
  const [loadingVideo, setLoadingVideo] = useState<boolean>(false);
  const { getGuildInfo, guild } = useGuild();
  const { user, checkMembership, joinGuild, leaveGuild } = useUser();
  const { getGuildVideos } = useVideo();
  const { showSidebar } = useSidebar();
  const navigate = useNavigate();
  useEffect(()=>{
    if(!user){
      navigate('/login');
    }
  },[])
  useEffect(() => {
    const check = async () => {
      if (video) {
        const response = await checkMembership(guildId);
        setIsAMember(response);
      }
    };
    check();
  }, [video, checkMembership]);

  useEffect(() => {
    const getGuild = async () => {
      setLoadingInfo(true);
      const success: boolean = await getGuildInfo(guildId);
      if (!success) {
        setSnackbarMessage("Failed to get guild info");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
      setLoadingInfo(false);
    };

    const fetchGuildVideos = async () => {
      setLoadingVideo(true);
      const response: VideoCardTemplate[] | null = await getGuildVideos(guildId);
      if (response) {
        setVideo(response);
      } else {
        setSnackbarMessage("Failed to get videos");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
      setLoadingVideo(false);
    };

    getGuild();
    fetchGuildVideos();
  }, []);

  const toggleSubscription = async () => {
    if (!user) {
      setSnackbarMessage('Login to join guild!!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    let success: string;
    if (isAMember) {
      success = await leaveGuild(guildId);
    } else {
      success = await joinGuild(guildId);
    }
    setSnackbarMessage(success);
    if (success.includes('successfully')) {
      setSnackbarSeverity('success');
    } else {
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (!guild) {
      setSnackbarMessage('Failed to get guild!!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [guild]);

  return (
    <div className={`${showSidebar ? "max-w-6xl mx-auto" : "mx-10"}`}>
      {loadingInfo ? (
        <LoadingGuildDetails />
      ) : (
        <div className="bg-zinc-800 text-white rounded-lg shadow-lg p-4">
          <div className="relative">
            <img
              src={guild?.cover_image}
              alt={`${guild?.guild_name} Cover`}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <img
              src={guild?.avatar}
              alt={`${guild?.guild_name} Avatar`}
              className="w-24 h-24 rounded-full border-4 border-zinc-800 absolute bottom-0 left-4 transform translate-y-1/2"
            />
          </div>
          <div className="flex px-40 justify-between items-center">
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-semibold">{guild?.guild_name}</h2>
              <p className="mt-2 text-gray-200">{guild?.guild_description}</p>
            </div>
            {user?.guild === guildId ? (
              <Link
                to={`/guilds/manage/${guildId}`}
                className="bg-red-500 px-4 py-2 text-lg rounded-lg font-bold text-white shadow-xl btn-5"
              >
                Manage
              </Link>
            ) : (
              <button
                onClick={toggleSubscription}
                className="bg-red-500 px-4 py-2 text-md rounded-lg font-bold text-white shadow-xl btn-5"
              >
                {isAMember ? 'Leave Guild' : 'Join Guild'}
              </button>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-12 gap-4">
        <div className={`p-4 ${showSidebar ? 'col-span-8' : 'col-span-9'}`}>
          <div className="flex justify-between items-center border-b-2 border-red-500 p-2">
            <h1 className="p-2 w-full text-white text-3xl font-bold">Guild Videos</h1>
            <Link
              to={`/upload-video/${guild?.id}`}
              className="bg-red-500 px-4 py-2 text-lg rounded-lg font-bold text-white shadow-xl btn-5"
            >
              Upload
            </Link>
          </div>
          {loadingVideo ? <LoadingVideo /> : <VideoGrid gridSize={3} videos={video} />}
        </div>
        <div className={`p-4 ${showSidebar ? 'col-span-4' : 'col-span-3'} bg-zinc-800 my-4 rounded-lg`}>
          <h1 className="p-2 border-b-2 border-red-500 w-full text-white text-3xl font-bold">Guild Members</h1>
          {guild && <Members guildId={guild.id} edit={false} />}
        </div>
      </div>

      {/* Snackbar for feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default GuildDetails;
