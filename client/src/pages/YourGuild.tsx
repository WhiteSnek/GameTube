import React from 'react'
import CreateGuild from '../components/Guild/CreateGuild'
import { useUser } from '../providers/UserProvider'
import GuildDetails from '../components/Guild/GuildDetails'

const YourGuild:React.FC = () => {
  const {user} = useUser()
  const guildId = user?.guild ? user.guild : "";
  console.log(user)
  return (
    <div>
      {guildId === "" ? <CreateGuild /> : <GuildDetails guildId={guildId} /> }
      
    </div>
  )
}

export default YourGuild
