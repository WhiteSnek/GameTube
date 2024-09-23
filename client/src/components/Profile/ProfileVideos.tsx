import React, { useEffect, useState } from 'react'
import VideoGrid from '../VideoGrid/VideoGrid'
import { VideoCardTemplate } from '../../templates/video_templates'
import { useVideo } from '../../providers/VideoProvider'
import { useUser } from '../../providers/UserProvider'

interface ProfileVideosProps {
    userId: string
}

const ProfileVideos:React.FC<ProfileVideosProps> = ({userId}) => {
    const {user} = useUser()
    const {getUserVideos} = useVideo()
    const [video, setVideo] = useState<VideoCardTemplate[]>([])
    useEffect(()=>{
        const getVideos = async () => {
            const response = await getUserVideos(userId)
            if(response){
                setVideo(response)
            } else {
                console.log('Failed to fetch videos!!!')
            }
        }
        getVideos()
    },[])
  return (
    <div className='my-4'>        
        <h1 className="sm:p-2  w-full border-b-2 border-red-500 text-white text-lg sm:text-3xl font-bold mb-2">{user?.username}'s Videos</h1>
      <VideoGrid videos={video} />
      </div>
  )
}

export default ProfileVideos
