import React, { useEffect } from 'react'
import { useSidebar } from '../providers/SidebarProvider'
import { useGuild } from '../providers/GuildProvider';
import { useParams } from 'react-router-dom';
import Members from '../components/Guild/Members/Members';
// import EditIcon from '@mui/icons-material/Edit';

const ManageGuild:React.FC = () => {
  const {id} = useParams()
  const {showSidebar} = useSidebar();
  const {getGuildInfo, guild} = useGuild()
  if(!id) return <div>Something went wrong...</div>
  useEffect(() => {
    const getGuild = async () => {
      const success: boolean = await getGuildInfo(id);
      if (success) {
        console.log(guild);
      } else {
        console.log("Failed to get guild info");
      }
    };
    getGuild();
    }, []);
    if(!guild) return <div>Loading...</div>
  return (
    <div className={`${showSidebar ? "max-w-6xl  mx-auto":"mx-10"}`}>
      <div className=" bg-zinc-800 text-white rounded-lg shadow-lg p-4">
        <div className="relative">
        <div className="relative">
            <img
              src={guild.cover_image}
              alt={`${guild.guild_name} Cover`}
              className="w-full h-20 sm:h-48 object-cover rounded-t-lg"
            />
            {/* <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-t-lg">
              <EditIcon className="text-white text-4xl cursor-pointer" />
            </div> */}
          </div>
          <div className='absolute left-4 bottom-0'>
          <div className="relative  w-16 sm:w-24 h-16 sm:h-24">
            <img
              src={guild.avatar}
              alt={`${guild.guild_name} Avatar`}
              className="w-16 sm:w-24 h-16 sm:h-24 rounded-full border-4 object-cover border-zinc-800 transform translate-y-1/2"
            />
            {/* Overlay on hover */}
            {/* <div className="w-16 sm:w-24 h-16 sm:h-24 rounded-full absolute top-8 sm:top-12 flex items-center justify-center bg-black bg-opacity-60 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <EditIcon className="text-white text-3xl cursor-pointer" />
            </div> */}
          </div>
          </div>
        </div>
        <div className="flex px-4 sm:px-40 gap-4 py-2">
          <div className="mt-6">
            <h2 className="text-md sm:text-2xl font-semibold">{guild.guild_name}</h2>
            <p className="mt-2 text-xs sm:text-lg text-gray-200">{guild.guild_description}</p>
          </div>
          {/* <button className='hover:bg-zinc-900 rounded-full flex justify-center items-center w-10 h-10 my-auto'>
            <EditIcon />
          </button> */}
        </div>
      </div>
      <div className={`p-4 bg-zinc-800 my-4 rounded-lg `}>
        <h1 className="p-2 border-b-2 border-red-500 w-full text-white text-3xl font-bold">Guild Members</h1>
          <Members guildId={guild.id} edit={true} />
      </div>
    </div>
  )
}

export default ManageGuild
