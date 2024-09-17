import React from "react";
import { GuildMembers } from "../../../templates/guild_template";
import { Link } from "react-router-dom";
import { formatDateFormat } from "../../../utils/formatDateFormat";
import { useUser } from "../../../providers/UserProvider";
import { useGuild } from "../../../providers/GuildProvider";


interface Members {
  member: GuildMembers;
}

interface EditMembership {
    userId: string;
    memberId: string;
  }

const EditMember: React.FC<Members> = ({ member }) => {

    const {user} = useUser();
    if(!user){
        console.log('Something went wrong')
        return 
    }
    const {promoteUser, demoteUser, kickUser} = useGuild()

    const userDetails: EditMembership = {
        userId: user?.id,
        memberId: member.userId
    }

    const promote = async () => {
        const successs:boolean = await promoteUser(userDetails)
        if(successs){
            console.log('Member promoted')
        } else {
            console.log('Failed to promote')
        }
    }

    const demote = async () => {
        const successs:boolean = await demoteUser(userDetails)
        if(successs){
            console.log('Member demoted')
        } else {
            console.log('Failed to demote')
        }
    }

    const kick = async () => {
        const successs:boolean = await kickUser(userDetails)
        if(successs){
            console.log('Member kicked')
        } else {
            console.log('Failed to kick')
        }
    }
  return (
    <Link
      to={`/profile/${member.userId}`}
      className={`flex justify-between items-center p-4 text-white rounded-lg my-2 shadow-md ${
        member.userRole === "leader"
          ? "bg-yellow-700"
          : member.userRole === "coleader"
          ? "bg-slate-700"
          : member.userRole === "elder"
          ? "bg-stone-700"
          : ""
      }`}
    >
      <img
        src={member.userAvatar}
        alt={member.userName}
        className="h-10 aspect-square object-cover rounded-full"
      />
      <div className="">
        <h1 className="text-md font-semibold">{member.userName}</h1>
        <p className="text-sm font-thin text-gray-300">{member.userRole}</p>
      </div>
      <p className="text-xs">{formatDateFormat(member.joinedAt)}</p>
      <div className="flex gap-3">
        <button onClick={promote} className={`text-sm px-4 py-2 ${member.userRole === 'leader'? 'opacity-50' : ' btn-5'} bg-green-700 rounded-lg `} disabled={member.userRole === 'leader'}>Promote</button>
        <button onClick={demote} className={`text-sm px-4 py-2 ${member.userRole === 'member' || member.userRole === 'leader' ? 'opacity-50' : ' btn-5'} bg-red-700 rounded-lg `} disabled={member.userRole === 'member' || member.userRole === 'leader'}>Demote</button>
        <button  onClick={kick}className={`text-sm px-4 py-2 ${member.userRole === 'leader'? 'opacity-50' : ' btn-5'} bg-zinc-700 rounded-lg `} disabled={member.userRole === 'leader'}>Kick</button>
      </div>
    </Link>
  );
};

export default EditMember;
