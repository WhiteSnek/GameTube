import React from "react";
import Skeleton from "@mui/material/Skeleton";
import { useSidebar } from "../../../providers/SidebarProvider";

const LoadingState: React.FC = () => {
    const {showSidebar} = useSidebar()
  const loadingItems = Array.from({ length: showSidebar ? 8 : 10 }).map((_, index) => (
    <div key={index} className="p-2">
      <Skeleton
        animation="wave"
        variant="rounded"
        width={showSidebar ? 350 : 400}
        height={120}
        sx={{ bgcolor: "grey.800" }}
      />
    </div>
  ));
  return <div className={`p-4`}>{loadingItems}</div>;
};

export default LoadingState;
