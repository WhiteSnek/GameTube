import React from "react";
import Skeleton from "@mui/material/Skeleton";
import { useSidebar } from "../../providers/SidebarProvider";

const LoadingVideo: React.FC = () => {
    const {showSidebar} = useSidebar()
  const loadingItems = Array.from({ length: showSidebar ? 6 : 8 }).map((_, index) => (
    <div key={index} className="p-2">
      <Skeleton
        animation="wave"
        variant="rounded"
        width={window.innerWidth > 768 ? showSidebar ? 220 : 240 : 300}
        height={120}
        sx={{ bgcolor: "grey.800" }}
      />
      <div className=" py-4 flex gap-2">
        <Skeleton
          animation="wave"
          variant="circular"
          width={30}
          height={30}
          sx={{ bgcolor: "grey.800" }}
        />
        <Skeleton
          animation="wave"
          variant="rounded"
          width={window.innerWidth > 768 ? showSidebar ? 180 : 200 : 300}
          height={30}
          sx={{ bgcolor: "grey.800" }}
        />
      </div>
    </div>
  ));
  return <div className={`grid grid-cols-1 ${showSidebar ? "sm:grid-cols-3" : "sm:grid-cols-4"} p-2 sm:p-4`}>{loadingItems}</div>;
};

export default LoadingVideo;
