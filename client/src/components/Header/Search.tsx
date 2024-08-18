import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

const Search: React.FC = () => {
  const [search, setSearch] = useState<string>('');
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(search);
    }
  return (
    <div>
      <form className='flex border-2 border-red-400 rounded-3xl' onSubmit={handleSubmit}>
        <input 
          type='text' 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder='Search...'
          className='w-full bg-transparent  py-2 px-6 text-lg font-thin outline-none text-red-400' 
        />
        <button className='py-1.5 px-4 m-1 bg-red-400 rounded-r-3xl'><SearchIcon sx={{color: '#111827'}} /></button>
      </form>
    </div>
  );
};

export default Search;
