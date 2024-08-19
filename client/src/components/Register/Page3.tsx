import React, { useCallback } from "react";
import { RegisterTemplate } from "../../templates/user_template";

interface RegisterProps {
  userInfo: RegisterTemplate;
  setUserInfo: React.Dispatch<React.SetStateAction<RegisterTemplate>>;
}

const Page3: React.FC<RegisterProps> = ({ userInfo, setUserInfo }) => {
  const handleFileChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      field: "avatar" | "coverImage"
    ) => {
      const file = e.target.files ? e.target.files[0] : null;
      const fileUrl = file ? URL.createObjectURL(file) : "";

      if (field === "avatar") {
        setUserInfo({ ...userInfo, avatar: file, avatarUrl: fileUrl });
      } else if (field === "coverImage") {
        setUserInfo({ ...userInfo, coverImage: file, coverImageUrl: fileUrl });
      }
    },
    [userInfo, setUserInfo]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, field: "avatar" | "coverImage") => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files ? e.dataTransfer.files[0] : null;
      const fileUrl = file ? URL.createObjectURL(file) : "";

      if (field === "avatar") {
        setUserInfo({ ...userInfo, avatar: file, avatarUrl: fileUrl });
      } else if (field === "coverImage") {
        setUserInfo({ ...userInfo, coverImage: file, coverImageUrl: fileUrl });
      }
    },
    [userInfo, setUserInfo]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const openFileDialog = (field: "avatar" | "coverImage") => {
    const inputElement = document.querySelector<HTMLInputElement>(
      field === "avatar" ? 'input[name="avatar"]' : 'input[name="coverImage"]'
    );
    if (inputElement) {
      inputElement.click();
    }
  };

  const register = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (
      userInfo.username === "" ||
      userInfo.password === "" ||
      userInfo.email === "" ||
      userInfo.name === "" ||
      userInfo.dob === new Date() ||
      userInfo.gender === "" ||
      userInfo.avatar === null ||
      userInfo.avatarUrl === "" ||
      userInfo.coverImage === null ||
      userInfo.coverImageUrl === ""
    ) {
      alert("Please fill in all the fields");
    } else {
      console.log(userInfo);
    }
  };

  return (
    <form
      className="p-4 border-b-2 border-x-2 border-red-400 rounded-b-md"
      onSubmit={register}
    >
      <div className="mb-6">
        <label className="block text-white mb-2">Avatar:</label>
        <div
          className="border-dashed border-2 border-zinc-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "avatar")}
        >
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "avatar")}
            className="hidden"
          />
          {userInfo.avatarUrl ? (
            <img
              src={userInfo.avatarUrl}
              alt="Avatar Preview"
              className="rounded-full h-24 w-24 object-cover"
            />
          ) : (
            <span className="text-white">
              Drag & Drop Avatar or Click to Upload
            </span>
          )}
          <button
            type="button"
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            onClick={() => openFileDialog("avatar")}
          >
            Select Avatar
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-white mb-2">Cover Image:</label>
        <div
          className="border-dashed border-2 border-zinc-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "coverImage")}
        >
          <input
            type="file"
            name="coverImage"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "coverImage")}
            className="hidden"
          />
          {userInfo.coverImageUrl ? (
            <img
              src={userInfo.coverImageUrl}
              alt="Cover Image Preview"
              className="rounded h-32 w-full object-cover"
            />
          ) : (
            <span className="text-white">
              Drag & Drop Cover Image or Click to Upload
            </span>
          )}
          <button
            type="button"
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            onClick={() => openFileDialog("coverImage")}
          >
            Select Cover Image
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Register
      </button>
    </form>
  );
};

export default Page3;
