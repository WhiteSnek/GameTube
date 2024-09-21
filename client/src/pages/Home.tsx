import React, { useEffect, useState } from 'react';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import TagList from '../components/TagList/TagList';
import { useVideo } from '../providers/VideoProvider';

const Home: React.FC = () => {
  const { video, getAllVideos, getVideosByTags } = useVideo();
  const [activeTag, setActiveTag] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let success: boolean;
      if (activeTag !== 'all') {
        success = await getVideosByTags(activeTag);
      } else {
        success = await getAllVideos();
      }

      if (success) {
        console.log('Successfully fetched videos');
      } else {
        throw new Error('Error loading videos');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [activeTag]);

  return (
    <div className="mt-[8rem]">
      <TagList activeTag={activeTag} setActiveTag={setActiveTag} />
      {loading ? (
        <p>Loading videos...</p>
      ) : error ? (
        <p className="text-red-500">Failed to load videos: {error}</p>
      ) : (
        <VideoGrid videos={video} />
      )}
    </div>
  );
};

export default Home;
