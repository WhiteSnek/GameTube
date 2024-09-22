import React, { useEffect, useState } from 'react';
import { useVideo } from '../providers/VideoProvider';
import { useUser } from '../providers/UserProvider';
import VideoList from '../components/History/VideoList';
import { UserHistory, VideoCardTemplate } from '../templates/video_templates';
import formatHistoryDate from '../utils/formatHistoryDate';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../components/History/LoadingState';

const History: React.FC = () => {
  const [groupedVideos, setGroupedVideos] = useState<{ [key: string]: VideoCardTemplate[] }>({});
  const [loading ,setLoading] = useState<boolean>(false)
  const { user } = useUser();
  const navigate = useNavigate()
  const { getHistory } = useVideo();

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else {
    const getUserHistory = async () => {
      setLoading(true)
      const response = await getHistory(user.id);
      if (response) {
        const grouped = groupVideosByDate(response);
        setGroupedVideos(grouped);
      }
      setLoading(false)
    };
    getUserHistory();
  }
  }, []);

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
    <div className="p-6">
      <h1 className="text-white text-5xl font-bold mb-10">History</h1>
      {loading ? <LoadingState /> : Object.keys(groupedVideos).map((date) => (
        <div key={date} className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">{formatHistoryDate(date)}</h2>
          <VideoList videos={groupedVideos[date]} />
        </div>
      ))}
    </div>
  );
};

export default History;
