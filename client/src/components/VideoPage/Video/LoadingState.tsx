import React from "react";
import Skeleton from "@mui/material/Skeleton";
import { useSidebar } from "../../../providers/SidebarProvider";

const LoadingState: React.FC = () => {
    const {showSidebar} = useSidebar()
  return <div className="px-8 py-6">
    <Skeleton
        animation="wave"
        variant="rounded"
        width={showSidebar ?800 : 1000}
        height={400}
        sx={{ bgcolor: "grey.800" }}
      />
    <div className="py-4 flex gap-4">
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
    <Skeleton
          animation="wave"
          variant="rounded"
          width={showSidebar ?800 : 1000}
          height={100}
          sx={{ bgcolor: "grey.800" }}
        />
  </div>;
};

export default LoadingState;
