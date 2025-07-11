import React, { useState } from "react";
import { GuildDetailsType } from "@/types/guild.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, ImagePlus, UploadCloud } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const GuildSettings: React.FC<{ guild: GuildDetailsType }> = ({ guild }) => {
  const [description, setDescription] = useState(guild.description || "");
  const [tags, setTags] = useState<string[]>(guild.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isPrivate, setIsPrivate] = useState<boolean>(guild.isPrivate || false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "avatar" | "coverImage"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      field === "avatar" ? setAvatar(file) : setCoverImage(file);
    }
  };

  const saveSettings = () => {
    console.log("Saving settings:", { description, tags, isPrivate, avatar, coverImage });
  };

  return (
    <div className="w-full max-w-5xl shadow-lg  rounded-lg">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Guild Settings</h2>

      <div className="space-y-4 mt-4">
        <p>Change Avatar or Cover Image</p>
        <div className="flex justify-center items-center gap-4 w-full">
          {/* Avatar Upload */}
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-6 cursor-pointer h-[160px] w-[200px] hover:border-gray-600"
            onClick={() => document.getElementById("avatarUpload")?.click()}
            onDragOver={(e) => e.preventDefault()} // Prevent default browser behavior
            onDrop={(e) => {
              e.preventDefault(); // Prevent image from opening
              if (e.dataTransfer.files.length > 0) {
                handleFileChange(
                  { target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>,
                  "avatar"
                );
              }
            }}
          >
            {avatar ? (
              <img
                src={URL.createObjectURL(avatar)}
                alt="Avatar Preview"
                className="w-36 h-36 object-cover rounded-full"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <UploadCloud size={40} />
                <p className="text-sm text-center">Click or Drag to Upload Avatar</p>
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
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-6 cursor-pointer h-[160px] hover:border-gray-600 w-full"
            onClick={() => document.getElementById("coverImageUpload")?.click()}
            onDragOver={(e) => e.preventDefault()} // Prevent default behavior
            onDrop={(e) => {
              e.preventDefault(); // Prevent image from opening
              if (e.dataTransfer.files.length > 0) {
                handleFileChange(
                  { target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>,
                  "coverImage"
                );
              }
            }}
          >
            {coverImage ? (
              <img
                src={URL.createObjectURL(coverImage)}
                alt="Cover Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <ImagePlus size={40} />
                <p className="text-sm">Click or Drag to Upload Cover Image</p>
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
        </div>

        {/* Guild Description */}
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your guild..."
            rows={3}
          />
        </div>

        {/* Privacy Settings */}
        <div className="flex items-center gap-2">
          <Checkbox checked={isPrivate} onCheckedChange={(checked) => setIsPrivate(!!checked)} />
          <span className="text-zinc-800 dark:text-zinc-300">Make Guild Private</span>
        </div>

        {/* Tag Management */}
        <div>
          <h4 className="text-md font-medium text-zinc-800 dark:text-zinc-300">Tags</h4>
          <div className="flex gap-2 mt-1">
            <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add a tag..." />
            <Button onClick={addTag} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, idx) => (
              <div
                key={idx}
                className="flex items-center bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 text-sm px-2 py-1 rounded-full"
              >
                {tag}
                <X className="w-4 h-4 ml-2 cursor-pointer text-zinc-500 hover:text-red-600" onClick={() => removeTag(tag)} />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={saveSettings} className="w-full">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default GuildSettings;
