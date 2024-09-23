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
        width={ showSidebar ? window.innerWidth > 768 ? 1130 : 310 : window.innerWidth > 768 ? 1420 : 310}
        height={window.innerWidth > 768 ? 170 : 80}
        sx={{ bgcolor: "grey.800" }}
      />
      <div className="py-2 sm:py-4 flex gap-2">
        <div className='absolute top-16 sm:top-36 left-6 sm:left-10 border-4 border-zinc-900 rounded-full'>
        <Skeleton
          animation="wave"
          variant="circular"
          width={window.innerWidth > 768 ? 100 : 40}
          height={window.innerWidth > 768 ? 100 : 40}
          sx={{ bgcolor: "grey.800" }}
        />
        </div>
        <Skeleton
          animation="wave"
          variant="rounded"
          width={showSidebar ? window.innerWidth > 768 ? 970 : 245 : window.innerWidth > 768 ? 1260 : 245 }
          height={window.innerWidth > 768 ? 60 : 30}
          sx={{ bgcolor: "grey.800", marginLeft: window.innerWidth > 768 ? 20 : 8 }}
        />
      </div>
    </div>
  )
}

export default LoadingGuildDetails
