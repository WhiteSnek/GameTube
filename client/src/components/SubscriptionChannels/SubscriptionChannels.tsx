import React from 'react'
import { UserVideoCard } from '../../templates/video_templates'
import { Link } from 'react-router-dom';

interface SubscriptionChannelProps {
    userDetails: UserVideoCard[];

}
const SubscriptionChannels:React.FC<SubscriptionChannelProps> = ({userDetails}) => {
  return (
    <div className='flex items-center gap-4 px-8 overflow-x-auto w-full'>
       {userDetails.map((user)=>(
        <div className='flex flex-col items-center justify-center'>
            <Link to={`/channel/${user.userId}`}>
                <img src={user.avatar} alt={user.name} className='h-16 aspect-square rounded-full object-cover' />
            </Link>
            <h1 className='text-white font-thin '>{user.name}</h1>
        </div>
       ))}
    </div>
  )
}

export default SubscriptionChannels
