import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import VideoList from '../components/VideoPage/Recommended/VideoList';
import { useVideo } from '../providers/VideoProvider';
import { useGuild } from '../providers/GuildProvider';
import { AllGuilds } from '../templates/guild_template';
import SearchGuilds from '../components/Search/SearchGuilds';
import LoadingState from '../components/History/LoadingState';

const Search: React.FC = () => {
  const { searchVideos } = useVideo();
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
      console.log(query)
      await searchVideos(query);
      const response = await  searchGuild(query);
      setLoading(false)
      if(response) setGuilds(response);
      else return;
    }
    
  }
  getSearchResults()
  }, []);

  return (
    <div className='p-8'>
      <h1 className='text-4xl font-bold text-white pb-3'>Search Results</h1>
      {guilds && <SearchGuilds guilds={guilds} />}
      {loading ? <LoadingState /> :<VideoList component="search" />}
    </div>
  );
};

export default Search;
