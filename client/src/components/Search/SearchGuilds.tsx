import React from 'react'
import { AllGuilds } from '../../templates/guild_template'
import SearchGuildResult from './SearchGuildResult'

interface SearchGuildsProps {
    guilds: AllGuilds[]
}

const SearchGuilds:React.FC<SearchGuildsProps> = ({guilds}) => {
  return (
    <div className=''>
      {
        guilds.map((guild) => (
            <SearchGuildResult guild={guild} />
        ))
      }
    </div>
  )
}

export default SearchGuilds
