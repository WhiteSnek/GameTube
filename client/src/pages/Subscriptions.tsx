import React, { useEffect, useState } from 'react'
import VideoGrid from '../components/VideoGrid/VideoGrid'
import SubscriptionChannels from '../components/SubscriptionGuilds/SubscriptionGuilds'
import { useUser } from '../providers/UserProvider'
import { GetGuilds } from '../templates/guild_template'
import { VideoCardTemplate } from '../templates/video_templates'
import { useVideo } from '../providers/VideoProvider'

const Subscriptions: React.FC = () => {
  const [guilds, setGuilds] = useState<GetGuilds[] | null>([]);
  const [videos, setVideos] = useState<VideoCardTemplate[]>([]);
  const { getUserGuilds } = useUser();
  const { getGuildVideos } = useVideo();

  useEffect(() => {
    const fetchGuilds = async () => {
      const response = await getUserGuilds();
      setGuilds(response);
      console.log(response);
    };
    fetchGuilds();
  }, [getUserGuilds]);

  useEffect(() => {
    if (guilds && guilds.length > 0) {
      const fetchVideos = async () => {
        const videoPromises = guilds.map(async (guild) => {
          const response = await getGuildVideos(guild.guildId);
          return response || [];
        });

        const allVideos = await Promise.all(videoPromises);
        setVideos(allVideos.flat());
      };

      fetchVideos();
    }
  }, [guilds, getGuildVideos]);

  return (
    <div>
      <SubscriptionChannels guilds={guilds} />
      <h1 className='px-6 py-4 text-white text-3xl font-bold'>Latest</h1>
      <VideoGrid videos={videos} /> {/* Displaying videos */}
    </div>
  );
};

export default Subscriptions;
