import React, { useEffect, useState } from 'react'
import { GuildMembers } from '../../../templates/guild_template'
import { useGuild } from '../../../providers/GuildProvider'
import Member from './Member'
import EditMember from './EditMember'
import LoadingMembers from './LoadingMembers'

interface GuildMembersProps {
    guildId: string
    edit: boolean
}

const Members:React.FC<GuildMembersProps> = ({guildId, edit}) => {
  const [members, setMembers] = useState<GuildMembers[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const {getGuildMembers} = useGuild()
    useEffect(()=>{
        const getMembers = async () =>{
          setLoading(true)
          const members = await getGuildMembers(guildId);
          if(members){
            setMembers(members)
          } else {
            console.log('Failed to fetch members')
          }
          setLoading(false)
        }
      getMembers()
    },[])
  return (
    <div className='h-96 overflow-scroll'>
      {loading ? <LoadingMembers /> :(!edit ? members.map(member => (
        <Member  key={member.userId} member={member} />
      )) : members.map(member => (
        <EditMember  key={member.userId} member={member} />
      )))}
    </div>
  )
}

export default Members
