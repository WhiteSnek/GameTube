import React from 'react';
import { useUser } from '../../providers/UserProvider';

const LogoutButton: React.FC = () => {
  const { logout } = useUser();

  const handleSubmit = async () => {
    try {
      const success: boolean = await logout();
      if (success) {
        console.log('User logged out successfully');
        // Optionally, redirect or perform any additional actions here
      } else {
        console.log('Error logging out user');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <button 
      onClick={handleSubmit} 
      className='bg-red-500 px-4 py-2 text-sm rounded-lg font-bold text-white shadow-xl w-40'
    >
      Logout
    </button>
  );
};

export default LogoutButton;
