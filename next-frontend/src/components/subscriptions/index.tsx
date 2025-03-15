import React from 'react'
import Link from 'next/link'
import truncateText from '@/utils/truncate_text'

interface SubscriptionListProps {
    guilds: {
        guildId: string;
        guildAvatar: string;
        guildName: string;
    }[]
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ guilds }) => {
  return (
    <div className='sm:w-[calc(100vw-330px)] overflow-x-auto scrollbar-hide py-3'>
      <div className='flex items-center gap-4 flex-nowrap whitespace-nowrap'>
        {guilds?.map((guild) => (
          <div key={guild.guildId} className='flex flex-col items-center justify-center min-w-[70px] sm:min-w-[100px]' title={guild.guildName}>
            <Link href={`/guilds/${guild.guildId}`}>
              <img 
                src={guild.guildAvatar} 
                alt={guild.guildName} 
                className='h-10 sm:h-16 aspect-square rounded-full object-cover' 
              />
            </Link>
            <h1 className='dark:text-white font-thin text-xs sm:text-lg'>
              {truncateText(guild.guildName, 10)}
            </h1>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubscriptionList
