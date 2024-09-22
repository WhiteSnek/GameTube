import React from "react";
import Skeleton from "@mui/material/Skeleton";

const LoadingMembers: React.FC = () => {
  const loadingItems = Array.from({ length: 5 }).map((_, index) => (
    <div key={index} className="p-2">
      <Skeleton
        animation="wave"
        variant="rounded"
        width={320}
        height={60}
        sx={{ bgcolor: "grey.800" }}
      />
    </div>
  ));
  return <div className="pt-1">{loadingItems}</div>;
};

export default LoadingMembers;
