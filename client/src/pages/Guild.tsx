import React from 'react'
import CreateGuild from '../components/Guild/CreateGuild'
import GuildDetails from '../components/Guild/GuildDetails'
import { useParams } from 'react-router-dom'
import { useUser } from '../providers/UserProvider'

const Guild:React.FC = () => {
  const {id} = useParams()
  const {user} = useUser()
  console.log(user)
  const guildId = id ? id : ""
  return (
    <div>
      {!user?.guild && guildId === "" ? <CreateGuild /> : <GuildDetails guildId={guildId} /> }
    </div>
  )
}

export default Guild
