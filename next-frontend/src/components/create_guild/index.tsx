import React, { useState } from "react";
import { PlusCircle, Castle, X, UploadCloud, ImagePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user_provider";
import { useGuild } from "@/context/guild_provider";

const CreateGuild: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    avatar: null as File | null,
    coverImage: null as File | null,
    isPrivate: false,
  });
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "avatar" | "coverImage"
  ) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, [field]: e.target.files[0] });
    }
  };
  const {User} = useUser()
  const {getSignedUrls, createGuild, uploadImages} = useGuild()
  const handleCreateGuild = async () => {
    try {
      if (!form.avatar || !form.coverImage) {
        console.error("Avatar and Cover Image are required");
        return;
      }

      // Generate unique keys based on user email
      const emailPrefix = User?.email.split("@")[0];
      const avatarKey = `guild/avatar/${emailPrefix}`;
      const coverImageKey = `guild/coverImage/${emailPrefix}`;

      // Request Presigned URLs from backend
      const { avatarUrl, coverUrl } = await getSignedUrls(
        avatarKey,
        coverImageKey
      );
      if (!avatarUrl || !coverUrl) {
        console.error("Failed to get presigned URLs");
        return;
      }
      // Send signup request with image keys
      const createGuildData = {
        name: form.name,
        description: form.description,
        isPrivate: form.isPrivate,
        avatar: avatarKey, 
        cover_image: coverImageKey,
      };

      await createGuild(createGuildData);
      // Upload files to S3
      const uploadResult = await uploadImages(
        avatarUrl,
        coverUrl,
        form.avatar,
        form.coverImage
      );
      if (!uploadResult.success) {
        console.error("Image upload failed", uploadResult.error);
        return;
      }

      console.log("Guild creation successful!");

      setIsOpen(false);
    } catch (error) {
      console.error("Error during guild creation:", error);
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full text-center">
      <div className=" p-8 flex flex-col items-center gap-4">
        <Castle size={48} className="text-zinc-600 dark:text-zinc-100" />
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          You don't seem to have a Guild
        </h1>
        <p className="text-zinc-500">Start by creating your own community!</p>

        {/* Dialog Trigger */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-5 py-3 text-lg rounded-full flex items-center gap-2 transition-all">
              <PlusCircle size={20} />
              Create One
            </button>
          </DialogTrigger>

          {/* Dialog Content */}
          <DialogContent className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex gap-4 items-center justify-center font-semibold text-zinc-900 dark:text-zinc-100">
                <Castle /> Create a New Guild
              </DialogTitle>
            </DialogHeader>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Guild Name */}
              <div className="flex flex-col gap-1">
                <Label className="text-zinc-700 dark:text-zinc-300">
                  Guild Name
                </Label>
                <Input
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  type="text"
                  placeholder="Enter guild name"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <Label className="text-zinc-700 dark:text-zinc-300">
                  Description
                </Label>
                <Textarea
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe your guild"
                />
              </div>

              {/* Avatar Upload */}
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-6 cursor-pointer hover:border-gray-600"
                onClick={() => document.getElementById("avatarUpload")?.click()}
                onDragOver={(e) => e.preventDefault()} // Prevent default browser behavior
                onDrop={(e) => {
                  e.preventDefault(); // Prevent image from opening
                  if (e.dataTransfer.files.length > 0) {
                    handleFileChange(
                      {
                        target: { files: e.dataTransfer.files },
                      } as React.ChangeEvent<HTMLInputElement>,
                      "avatar"
                    );
                  }
                }}
              >
                {form.avatar ? (
                  <img
                    src={URL.createObjectURL(form.avatar)}
                    alt="Avatar Preview"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <UploadCloud size={40} />
                    <p className="text-sm">Click or Drag to Upload Avatar</p>
                  </div>
                )}
                <Input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "avatar")}
                />
              </div>

              {/* Cover Image Upload */}
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-6 cursor-pointer hover:border-gray-600"
                onClick={() =>
                  document.getElementById("coverImageUpload")?.click()
                }
                onDragOver={(e) => e.preventDefault()} // Prevent default behavior
                onDrop={(e) => {
                  e.preventDefault(); // Prevent image from opening
                  if (e.dataTransfer.files.length > 0) {
                    handleFileChange(
                      {
                        target: { files: e.dataTransfer.files },
                      } as React.ChangeEvent<HTMLInputElement>,
                      "coverImage"
                    );
                  }
                }}
              >
                {form.coverImage ? (
                  <img
                    src={URL.createObjectURL(form.coverImage)}
                    alt="Cover Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <ImagePlus size={40} />
                    <p className="text-sm">
                      Click or Drag to Upload Cover Image
                    </p>
                  </div>
                )}
                <Input
                  id="coverImageUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "coverImage")}
                />
              </div>

              {/* Is Private Switch */}
              <div className="flex items-center justify-between">
                <Label className="text-zinc-700 dark:text-zinc-300">
                  Private Guild?
                </Label>
                <Switch
                  checked={form.isPrivate}
                  onCheckedChange={(value) =>
                    setForm({ ...form, isPrivate: value })
                  }
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="text-zinc-700 dark:text-zinc-300"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateGuild} className="bg-red-500 hover:bg-red-600 text-white">
                Create Guild
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CreateGuild;
