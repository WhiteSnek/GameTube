import React from 'react'
import CreateGuild from '../components/Guild/CreateGuild'
import GuildDetails from '../components/Guild/GuildDetails'
import { useParams } from 'react-router-dom'

const Guild:React.FC = () => {
  const {id} = useParams()
  const guildId = id ? id: ""
  return (
    <div>
      {guildId === "" ? <CreateGuild /> : <GuildDetails guildId={guildId} /> }
      
    </div>
  )
}

export default Guild
