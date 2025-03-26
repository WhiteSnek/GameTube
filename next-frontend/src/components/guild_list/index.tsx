import { useUser } from '@/context/user_provider'
import { GuildsType } from '@/types/guild.types'
import { Crown, DoorOpen } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface GuildListProps {
    guilds: GuildsType[]
}

const GuildList:React.FC<GuildListProps> = ({guilds}) => {
    const {User} = useUser()
  return (
    <div className="space-y-3 px-10">
      {guilds.map((guild, index) => (
        <Link
          key={index}
          href={`/guilds/${guild.id}`}
          className="flex items-center justify-between gap-6 p-6 rounded-lg hover:bg-gray-300/80 dark:hover:bg-zinc-800/80 transition"
        >
          {/* Guild Avatar */}
          <div className="relative w-20 h-20">
            <img src={guild.avatar} alt='guild avatar' className='w-full h-full object-cover rounded-full' />
          </div>

          {/* Guild Details */}
          <div className="flex flex-col justify-center flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {guild.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {guild.description}
            </p>
          </div>

          {/* Action Button */}
          <button className="px-4 bg-red-500 cursor-pointer text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2">
            {guild.ownerId === User?.id ? (
              <>
                <Crown className="w-5 h-5" /> Manage Guild
              </>
            ) : (
              <>
                <DoorOpen className="w-5 h-5" /> Enter Guild
              </>
            )}
          </button>
        </Link>
      ))}
    </div>
  )
}

export default GuildList
