import React, { useEffect, useState } from 'react'
import { GuildMembers } from '../../../templates/guild_template'
import { useGuild } from '../../../providers/GuildProvider'
import Member from './Member'

interface GuildMembersProps {
    guildId: string
}

const Members:React.FC<GuildMembersProps> = ({guildId}) => {
  const [members, setMembers] = useState<GuildMembers[]>([])
  const {getGuildMembers} = useGuild()
    useEffect(()=>{
        const getMembers = async () =>{
          const members = await getGuildMembers(guildId);
          if(members){
            setMembers(members)
          } else {
            console.log('Failed to fetch members')
          }
        }
      getMembers()
    },[])
  return (
    <div className='h-96 overflow-scroll'>
      {members.map(member => (
        <Member  key={member.userId} member={member} />
      ))}
    </div>
  )
}

export default Members
