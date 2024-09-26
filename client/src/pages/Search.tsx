import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useVideo } from '../providers/VideoProvider';
import { useGuild } from '../providers/GuildProvider';
import { AllGuilds } from '../templates/guild_template';
import SearchGuilds from '../components/Search/SearchGuilds';
import LoadingState from '../components/History/LoadingState';
import VideoList from '../components/History/VideoList';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import LoadingVideo from '../components/Guild/LoadingVideo';
const Search: React.FC = () => {
  const { searchVideos, video } = useVideo();
  const {searchGuild} = useGuild()
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(false)
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('query') || '';
  const [guilds, setGuilds] = useState<AllGuilds[]|null>([])
  useEffect(() => {
    const getSearchResults = async() => {
      setLoading(true)
    if (query && searchVideos) {
      await searchVideos(query);
      const response = await  searchGuild(query);
      if(response) setGuilds(response);
      else setGuilds(null)
    }
    setLoading(false)
  }
  getSearchResults()
  }, [query]);

  return (
    <div className='px-4 sm:p-8'>
      <h1 className='text-xl sm:text-4xl font-bold text-white pb-3'>Search Results</h1>
      {guilds && <SearchGuilds guilds={guilds} />}
      {loading ? window.innerWidth > 768 ? <LoadingState /> : <LoadingVideo /> : !video ? <div className='text-white sm:text-3xl text-xl text-center'>No videos found. Try searching something else</div> :  window.innerWidth > 768 ? <VideoList videos={video} /> : <VideoGrid videos={video} />}
    </div>
  );
};

export default Search;
