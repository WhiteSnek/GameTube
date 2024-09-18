import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import VideoList from '../components/SpecificPlaylist/VideoList';
import { useVideo } from '../providers/VideoProvider';
import { useGuild } from '../providers/GuildProvider';
import { AllGuilds } from '../templates/guild_template';
import SearchGuilds from '../components/Search/SearchGuilds';

const Search: React.FC = () => {
  const { searchVideos } = useVideo();
  const {searchGuild} = useGuild()
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('query') || '';
  const [guilds, setGuilds] = useState<AllGuilds[]|null>([])
  useEffect(() => {
    const getSearchResults = async() => {
    if (query && searchVideos) {
      console.log(query)
      await searchVideos(query);
      const response = await  searchGuild(query);
      if(response) setGuilds(response);
      else return;
    }
  }
  getSearchResults()
  }, [query, searchVideos]);

  return (
    <div className='p-8'>
      <h1 className='text-4xl font-bold text-white pb-3'>Search Results</h1>
      {guilds && <SearchGuilds guilds={guilds} />}
      <VideoList component="search" />
    </div>
  );
};

export default Search;
