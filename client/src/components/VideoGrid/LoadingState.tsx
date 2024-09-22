import React from "react";
import Skeleton from "@mui/material/Skeleton";
import { useSidebar } from "../../providers/SidebarProvider";

const LoadingState: React.FC = () => {
    const {showSidebar} = useSidebar()
  const loadingItems = Array.from({ length: showSidebar ? 8 : 10 }).map((_, index) => (
    <div key={index} className="p-2">
      <Skeleton
        animation="wave"
        variant="rounded"
        width={290}
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
          width={240}
          height={60}
          sx={{ bgcolor: "grey.800" }}
        />
      </div>
    </div>
  ));
  return <div className={`grid ${showSidebar ? "grid-cols-4" : "grid-cols-5"} p-4`}>{loadingItems}</div>;
};

export default LoadingState;
