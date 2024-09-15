import React from 'react'
import ProfileDetails from '../components/Profile/ProfileDetails'
import { useSidebar } from '../providers/SidebarProvider'
import { useUser } from '../providers/UserProvider'
import ProfileVideos from '../components/Profile/ProfileVideos'

const Profile:React.FC = () => {
  const {showSidebar} = useSidebar()
  const {user} = useUser()
  if(!user) return <div>Please login first...</div>
  return (
    <div className={`${showSidebar ? "max-w-6xl  mx-auto":"mx-10"}`}>
      <ProfileDetails user={user} />
      <ProfileVideos userId={user.id} />
    </div>
  )
}

export default Profile
