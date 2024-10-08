import React from 'react'
import { Link } from 'react-router-dom';
import { GetGuilds } from '../../templates/guild_template';
import truncateText from '../../utils/truncate_text';

interface SubscriptionChannelProps {
    guilds: GetGuilds[]|null

}
const SubscriptionChannels:React.FC<SubscriptionChannelProps> = ({guilds}) => {
  return (
    <div className='flex items-center gap-4 px-2 sm:px-8 overflow-x-auto w-full'>
       {guilds?.map((guild)=>(
        <div className='flex flex-col items-center justify-center'>
            <Link to={`/guilds/${guild.guildId}`}>
                <img src={guild.guildAvatar} alt={guild.guildName} className='h-10 sm:h-16 aspect-square rounded-full object-cover' />
            </Link>
            <h1 className='text-white font-thin text-xs sm:text-lg'>{truncateText(guild.guildName, 15)}</h1>
        </div>
       ))}
    </div>
  )
}

export default SubscriptionChannels
