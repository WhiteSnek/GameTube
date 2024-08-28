import React, { useState } from "react";
import { RegisterTemplate } from "../../templates/user_template";
import { formatDateFormat } from "../../utils/formatDateFormat";

interface RegisterProps {
  userInfo: RegisterTemplate;
  setUserInfo: React.Dispatch<React.SetStateAction<RegisterTemplate>>;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
}

const Page2: React.FC<RegisterProps> = ({
  userInfo,
  setUserInfo,
  setActiveTab,
}) => {
  const [error, setError] = useState<string>("");
  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (userInfo.name === "") {
      setError("Name is required!!");
      return;
    }

    const today = new Date();
    const dob = new Date(userInfo.dob);

    // Check if DOB is a valid date
    if (isNaN(dob.getTime())) {
      setError("Invalid date of birth!!");
      return;
    } else {
      // Check if user is at least 13 years old
      const age = today.getFullYear() - dob.getFullYear();
      const monthDifference = today.getMonth() - dob.getMonth();
      const dayDifference = today.getDate() - dob.getDate();

      if (
        age < 13 ||
        (age === 13 &&
          (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)))
      ) {
        setError("You must be at least 13 years old!!");
        return;
      }
    }
    if (userInfo.gender === "") {
      setError("Gender is required!!");
      return;
    } else {
      setActiveTab(3);
    }
  };

  return (
    <form
      className="p-4 border-b-2  border-x-2 border-red-400 rounded-b-md"
      onSubmit={handleNext}
    >
      <div className="mb-6">
        <label className="block text-white mb-2">Full Name:</label>
        <input
          type="text"
          value={userInfo.name}
          onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
          className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-white mb-2">Date of Birth:</label>
        <input
          type="date"
          value={userInfo.dob ? formatDateFormat(userInfo.dob) : "2023-03-21"}
          onChange={(e) => setUserInfo({ ...userInfo, dob: e.target.value })}
          className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-white mb-2">Gender:</label>
        <select
          value={userInfo.gender}
          onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}
          className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="" disabled>
            Select your gender
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      {error !== "" && <p className="text-sm text-red-600 pb-2">{error}</p>}
      <button
        type="submit"
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        NEXT
      </button>
    </form>
  );
};

export default Page2;
