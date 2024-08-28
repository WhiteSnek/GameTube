import React, { useState } from "react";
import { useUser } from "../../providers/UserProvider";
import LogoutButton from "./LogoutButton";
const Dropdown: React.FC = () => {
  return (
    <div className="absolute z-50 top-16 right-0 bg-zinc-800 p-4">
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
