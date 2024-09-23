import React from "react";
import Skeleton from "@mui/material/Skeleton";

const LoadingGuilds: React.FC = () => {
  const loadingItems = Array.from({ length: window.innerWidth > 768 ? 14 : 5}).map((_, index) => (
    <div key={index} className="p-2">
        <Skeleton
          animation="wave"
          variant="circular"
          width={window.innerWidth > 768 ? 70 : 50}
          height={window.innerWidth > 768 ? 70 : 50}
          sx={{ bgcolor: "grey.800" }}
        />
    </div>
  ));
  return <div className={`flex sm:px-4`}>{loadingItems}</div>;
};

export default LoadingGuilds;
