import React from 'react'
import Skeleton from "@mui/material/Skeleton";
import { useSidebar } from '../../providers/SidebarProvider';
const LoadingGuildDetails:React.FC = () => {
  const {showSidebar} = useSidebar()
  return (
    <div className="relative p-2">
      <Skeleton
        animation="wave"
        variant="rounded"
        width={ showSidebar ? 1130: 1420}
        height={170}
        sx={{ bgcolor: "grey.800" }}
      />
      <div className=" py-4 flex gap-2">
        <div className='absolute top-36 left-10 border-4 border-zinc-900 rounded-full'>
        <Skeleton
          animation="wave"
          variant="circular"
          width={100}
          height={100}
          sx={{ bgcolor: "grey.800" }}
        />
        </div>
        <Skeleton
          animation="wave"
          variant="rounded"
          width={showSidebar ? 970: 1260}
          height={60}
          sx={{ bgcolor: "grey.800", marginLeft: 20 }}
        />
      </div>
    </div>
  )
}

export default LoadingGuildDetails
