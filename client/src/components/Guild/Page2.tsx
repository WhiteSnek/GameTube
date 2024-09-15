import React, { useCallback, useState } from "react";
import { CreateGuildTemplate } from "../../templates/guild_template";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useUser } from "../../providers/UserProvider";
import { useGuild } from "../../providers/GuildProvider";
import { UserDetails } from "../../templates/user_template";
// import { useNavigate } from "react-router-dom";
interface CreateGuildProps {
  guildInfo: CreateGuildTemplate;
  setGuildInfo: React.Dispatch<React.SetStateAction<CreateGuildTemplate>>;
}

const Page2: React.FC<CreateGuildProps> = ({ guildInfo, setGuildInfo }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [severity, setSeverity] = useState<"success" | "error">("success");
  const { user, setUser } = useUser()
  const { guild, createGuild } = useGuild();
  //   const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleFileChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      field: "avatar" | "cover_image"
    ) => {
      const file = e.target.files ? e.target.files[0] : null;
      const fileUrl = file ? URL.createObjectURL(file) : "";

      if (field === "avatar") {
        setGuildInfo({ ...guildInfo, avatar: file, avatarUrl: fileUrl });
      } else if (field === "cover_image") {
        setGuildInfo({
          ...guildInfo,
          cover_image: file,
          cover_imageUrl: fileUrl,
        });
      }
    },
    [guildInfo, setGuildInfo]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, field: "avatar" | "cover_image") => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files ? e.dataTransfer.files[0] : null;
      const fileUrl = file ? URL.createObjectURL(file) : "";

      if (field === "avatar") {
        setGuildInfo({ ...guildInfo, avatar: file, avatarUrl: fileUrl });
      } else if (field === "cover_image") {
        setGuildInfo({
          ...guildInfo,
          cover_image: file,
          cover_imageUrl: fileUrl,
        });
      }
    },
    [guildInfo, setGuildInfo]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const openFileDialog = (field: "avatar" | "cover_image") => {
    const inputElement = document.querySelector<HTMLInputElement>(
      field === "avatar" ? 'input[name="avatar"]' : 'input[name="cover_image"]'
    );
    if (inputElement) {
      inputElement.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      guildInfo.name === "" ||
      guildInfo.description === "" ||
      guildInfo.avatar === null ||
      guildInfo.cover_image === null
    ) {
      setMessage("Please fill in all the fields");
      setSeverity("error");
      handleOpen();
      return;
    }
    const formData: FormData = new FormData();
    formData.append("name", guildInfo.name);
    formData.append("description", guildInfo.description);
    formData.append("privacy", String(guildInfo.private));
    formData.append("avatar", guildInfo.avatar);
    formData.append("cover_image", guildInfo.cover_image);
    const userId = user?.id;
    const success = await createGuild({formData, userId});
    if (success) {
        const guildId = guild?.id || '';
      if (user) {
        const updatedUser: UserDetails = {
          ...user,
          guild: guildId,
        };

        setUser(updatedUser);
      }
      setMessage("Guild Created Successfully!");
      setSeverity("success");
    } else {
      setMessage("Failed to create guild!");
      setSeverity("error");
    }
    handleOpen();
  };
  return (
    <form
      className="p-4 border-b-2 border-x-2 border-red-400 rounded-b-md"
      onSubmit={handleSubmit}
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
          {guildInfo.avatarUrl ? (
            <img
              src={guildInfo.avatarUrl}
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
          onDrop={(e) => handleDrop(e, "cover_image")}
        >
          <input
            type="file"
            name="cover_image"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "cover_image")}
            className="hidden"
          />
          {guildInfo.cover_imageUrl ? (
            <img
              src={guildInfo.cover_imageUrl}
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
            onClick={() => openFileDialog("cover_image")}
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

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </form>
  );
};

export default Page2;
