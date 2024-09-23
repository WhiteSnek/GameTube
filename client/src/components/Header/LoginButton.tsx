import React from 'react'
import { Link } from 'react-router-dom'

const LoginButton: React.FC = () => {
  return (
    <div>
      <Link to='/login'><button className='bg-red-500 px-4 py-2 text-sm sm:text-lg rounded-lg font-bold text-white shadow-xl btn-5 sm:w-40'>Login</button></Link>
    </div>
  )
}

export default LoginButton
