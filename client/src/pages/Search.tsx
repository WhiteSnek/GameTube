import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import VideoList from '../components/SpecificPlaylist/VideoList';
import { useVideo } from '../providers/VideoProvider';

const Search: React.FC = () => {
  const { searchVideos } = useVideo();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('query') || '';

  useEffect(() => {
    if (query && searchVideos) {
      console.log(query)
      searchVideos(query);
    }
  }, [query, searchVideos]);

  return (
    <div>
      {/* Display video results for the search */}
      <VideoList component="search" />
    </div>
  );
};

export default Search;
