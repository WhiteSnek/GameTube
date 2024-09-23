import React, { useEffect, useState } from 'react';
import { useVideo } from '../providers/VideoProvider';
import { useUser } from '../providers/UserProvider';
import VideoList from '../components/History/VideoList';
import { UserHistory, VideoCardTemplate } from '../templates/video_templates';
import formatHistoryDate from '../utils/formatHistoryDate';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../components/History/LoadingState';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import LoadingVideo from '../components/Guild/LoadingVideo';

const History: React.FC = () => {
  const [groupedVideos, setGroupedVideos] = useState<{ [key: string]: VideoCardTemplate[] }>({});
  const [loading ,setLoading] = useState<boolean>(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const { getHistory } = useVideo();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      const getUserHistory = async () => {
        setLoading(true);
        const response = await getHistory(user.id);
        if (response) {
          const sortedVideos = sortVideosByDate(response); // Sort videos first
          const grouped = groupVideosByDate(sortedVideos); // Then group them
          setGroupedVideos(grouped);
        }
        setLoading(false);
      };
      getUserHistory();
    }
  }, [user, navigate, getHistory]);

  // Helper function to sort videos by viewed_at date in descending order
  const sortVideosByDate = (videos: UserHistory[]) => {
    return videos.sort((a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime());
  };

  // Helper function to group videos by date
  const groupVideosByDate = (videos: UserHistory[]) => {
    return videos.reduce((groups: { [key: string]: VideoCardTemplate[] }, video) => {
      const date = video.viewed_at.split('T')[0]; // Use the date part for grouping
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(video.video_details); // Only push video_details
      return groups;
    }, {});
  };

  return (
    <div className="px-6 sm:p-6">
      <h1 className="text-white text-2xl sm:text-5xl font-bold mb-2 sm:mb-10">History</h1>
      {loading ? window.innerWidth > 768 ? <LoadingState /> : <LoadingVideo /> : Object.keys(groupedVideos).map((date) => (
        <div key={date} className="sm:mb-10">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-300 mb-2 sm:mb-4">{formatHistoryDate(date)}</h2>
          {window.innerWidth > 768 ? <VideoList videos={groupedVideos[date]} /> : <VideoGrid videos={groupedVideos[date]} />}
        </div>
      ))}
    </div>
  );
};

export default History;
