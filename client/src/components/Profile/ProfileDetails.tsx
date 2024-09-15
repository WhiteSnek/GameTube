import React from "react";
import { UserDetails } from "../../templates/user_template";

interface ProfileDetailsProps {
  user: UserDetails
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({user}) => {
  console.log(user);
  return (
    <div className=" bg-zinc-800 text-white rounded-lg shadow-lg p-4">
      <div className="relative">
        <img
          src={user?.cover_image}
          alt={`${user?.username} Cover`}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <img
          src={user?.avatar}
          alt={`${user?.username} Avatar`}
          className="w-24 h-24 rounded-full border-4 border-zinc-800 absolute bottom-0 left-4 transform translate-y-1/2"
        />
      </div>
      <div className="flex justify-around items-center">
        <div className="mt-6">
          <h2 className="text-2xl font-semibold">{user?.username}</h2>
          <p className="mt-2 text-gray-200 text-sm">{user?.email}</p>
        </div>
        <button className="bg-red-500 px-4 py-2 text-lg rounded-lg font-bold text-white shadow-xl btn-5">
          Manage
        </button>
      </div>
    </div>
  );
};

export default ProfileDetails;
