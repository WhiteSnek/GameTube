import React from "react";
import Skeleton from "@mui/material/Skeleton";
import { useSidebar } from "../../../providers/SidebarProvider";

const LoadingState: React.FC = () => {
  const { showSidebar } = useSidebar();
  
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="py-4 flex gap-4">
          <Skeleton
            variant="circular"
            width={50}
            height={50}
            sx={{ bgcolor: "grey.800" }}
          />
          <Skeleton
            animation="wave"
            variant="rounded"
            width={showSidebar ? 760 : 1000}
            height={50}
            sx={{ bgcolor: "grey.800" }}
          />
        </div>
      ))}
    </>
  );
};

export default LoadingState;
