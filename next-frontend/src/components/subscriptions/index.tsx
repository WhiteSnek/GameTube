import React from 'react'
import Link from 'next/link'
import truncateText from '@/utils/truncate_text'
import { JoinedGuildType } from '@/types/guild.types'

interface SubscriptionListProps {
    guilds: JoinedGuildType[]
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ guilds }) => {
  return (
    <div className='sm:w-[calc(100vw-330px)] overflow-x-auto scrollbar-hide py-3'>
      <div className='flex items-center gap-4 flex-nowrap whitespace-nowrap'>
        {guilds?.map((guild) => (
          <div key={guild.id} className='flex flex-col items-center justify-center min-w-[70px] sm:min-w-[100px]' title={guild.name}>
            <Link href={`/guilds/${guild.id}`}>
              <img 
                src={guild.avatar} 
                alt={guild.name} 
                className='h-10 sm:h-16 aspect-square rounded-full object-cover' 
              />
            </Link>
            <h1 className='dark:text-white font-thin text-xs sm:text-lg'>
              {truncateText(guild.name, 10)}
            </h1>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubscriptionList
