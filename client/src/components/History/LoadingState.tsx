import React from "react";
import Skeleton from "@mui/material/Skeleton";
import { useSidebar } from "../../providers/SidebarProvider";

const LoadingState: React.FC = () => {
    const {showSidebar} = useSidebar()
  const loadingItems = Array.from({ length:8 }).map((_, index) => (
    <div key={index} className="p-2 flex gap-3">
      <Skeleton
        animation="wave"
        variant="rounded"
        width={290}
        height={170}
        sx={{ bgcolor: "grey.800" }}
      />
      <div className="flex py-4 gap-3">
      <Skeleton
          variant="circular"
          width={40}
          height={40}
          sx={{ bgcolor: "grey.800" }}
        />
      <div className="flex flex-col gap-3">
      <Skeleton
          animation="wave"
          variant="rounded"
          width={showSidebar ? 800 : 1050}
          height={40}
          sx={{ bgcolor: "grey.800" }}
        />
        <Skeleton
          animation="wave"
          variant="rounded"
          width={showSidebar ? 800 : 1050}
          height={40}
          sx={{ bgcolor: "grey.800" }}
        />
      </div>
      
        </div>
    </div>
  ));
  return <div className={`p-4`}>{loadingItems}</div>;
};

export default LoadingState;
