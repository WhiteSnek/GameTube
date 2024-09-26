import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

interface SearchProps {
  toggleSearch?: () => void; // Making toggleSearch optional
}

const Search: React.FC<SearchProps> = ({ toggleSearch }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const encodedSearch = encodeURIComponent(search);
    navigate(`/search?query=${encodedSearch}`);
  };

  const clearSearch = () => {
    setSearch('');
    if (toggleSearch) {
      toggleSearch(); // Call toggleSearch only if it's provided
    }
  };

  return (
    <div>
      <form className='relative flex border-2 border-red-400 rounded-3xl' onSubmit={handleSubmit}>
        <input 
          type='text' 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder='Search...'
          className='w-full bg-transparent py-2 px-6 text-lg font-thin outline-none text-red-400' 
        />
        <button className='py-1.5 px-4 m-1 bg-red-400 rounded-r-3xl'><SearchIcon sx={{color: '#111827'}} /></button>
        {search !== '' && (
          <button onClick={clearSearch} className='absolute top-1 right-16 aspect-square rounded-full flex justify-center items-center p-2 hover:bg-zinc-800'>
            <CloseIcon sx={{color: '#f87171'}} />
          </button>
        )}
      </form>
    </div>
  );
};

export default Search;
