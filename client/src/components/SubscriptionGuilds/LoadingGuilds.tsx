import React from "react";
import Skeleton from "@mui/material/Skeleton";

const LoadingGuilds: React.FC = () => {
  const loadingItems = Array.from({ length: 14}).map((_, index) => (
    <div key={index} className="p-2">
        <Skeleton
          animation="wave"
          variant="circular"
          width={70}
          height={70}
          sx={{ bgcolor: "grey.800" }}
        />
    </div>
  ));
  return <div className={`flex px-4`}>{loadingItems}</div>;
};

export default LoadingGuilds;
