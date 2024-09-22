import React from 'react'
import Skeleton from '@mui/material/Skeleton';
const LoadingState:React.FC = () => {
  return (
    <div>
      <Skeleton animation="wave" variant="rounded" width={100} height={30} sx={{ bgcolor: 'grey.800' }}/>
    </div>
  )
}

export default LoadingState
