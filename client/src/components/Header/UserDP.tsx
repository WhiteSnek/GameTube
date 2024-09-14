import React, { useState } from "react";
import { useUser } from "../../providers/UserProvider";
import LogoutButton from "./LogoutButton";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from "react-router-dom";
const Dropdown: React.FC = () => {
  const {user} = useUser()
  return (
    <div className="absolute z-50 top-16 right-0 bg-zinc-800 p-4 flex flex-col">
      <Link to={`/profile/${user?.id}`} className="text-white text-lg p-2 mb-4 hover:bg-zinc-900 transition-colors rounded-lg flex items-center gap-3">
      <AccountCircleIcon/> Profile</Link>
      <LogoutButton />
    </div>
  );
};

const UserDP: React.FC = () => {
  const { user } = useUser();
  const [dropdown, setDropdown] = useState<boolean>(false);
  const toggleDropdwon = () => {
    setDropdown(!dropdown);
  };
  return (
    <div className="cursor-pointer" onClick={toggleDropdwon}>
      <img
        src={user?.avatar}
        alt={user?.name}
        className="h-10 w-10 object-cover rounded-full"
      />
      <div
        className={`${
          dropdown ? "opacity-100" : "opacity-0"
        } transition-all duration-200 ease-in-out `}
      >
        <Dropdown />
      </div>
    </div>
  );
};

export default UserDP;
