import React from "react";
import Skeleton from "@mui/material/Skeleton";
import { useSidebar } from "../../providers/SidebarProvider";

const LoadingState: React.FC = () => {
    const {showSidebar} = useSidebar()
  const loadingItems = Array.from({ length: showSidebar ? 8 : 10 }).map((_, index) => (
    <div key={index} className="p-2 flex flex-col justify-center items-center">
      <Skeleton
        animation="wave"
        variant="rounded"
        width={270}
        height={170}
        sx={{ bgcolor: "grey.800" }}
      />
      <div className=" py-4 flex gap-2">
        <Skeleton
          animation="wave"
          variant="circular"
          width={40}
          height={40}
          sx={{ bgcolor: "grey.800" }}
        />
        <Skeleton
          animation="wave"
          variant="rounded"
          width={225}
          height={60}
          sx={{ bgcolor: "grey.800" }}
        />
      </div>
    </div>
  ));
  return <div className={`grid grid-cols-1 ${showSidebar ? "sm:grid-cols-4" : "sm:grid-cols-5"} p-2`}>{loadingItems}</div>;
};

export default LoadingState;
