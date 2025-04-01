import React, { useState } from "react";
import { GuildDetailsType } from "@/types/guild.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Image } from "lucide-react";
import{ Textarea }from "@/components/ui/textarea";

const GuildSettings: React.FC<{ guild: GuildDetailsType }> = ({ guild }) => {
  const [description, setDescription] = useState(guild.description || "");
  const [tags, setTags] = useState<string[]>(guild.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isPrivate, setIsPrivate] = useState<boolean>(guild.isPrivate || false);
  const [requireApproval, setRequireApproval] = useState<boolean>(false);
  const [isNSFW, setIsNSFW] = useState<boolean>(false);
  const [banner, setBanner] = useState<string | null>(null);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBanner(URL.createObjectURL(file));
    }
  };

  const saveSettings = () => {
    console.log("Saving settings:", { description, tags, isPrivate, requireApproval, isNSFW, banner });
  };

  return (
    <div className="w-full max-w-5xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Guild Settings</h2>

      <div className="space-y-5 mt-4">

        <div className="flex flex-col items-center">
          {banner ? (
            <img src={banner} alt="Guild Banner" className="w-full h-32 object-cover rounded-lg mb-2" />
          ) : (
            <div className="w-full h-32 bg-gray-200 dark:bg-zinc-800 flex items-center justify-center rounded-lg">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" id="banner-upload" />
          <label htmlFor="banner-upload" className="cursor-pointer text-blue-500 hover:underline mt-2">
            Upload Banner
          </label>
        </div>

        {/* Guild Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
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
          <span className="text-gray-800 dark:text-gray-300">Make Guild Private</span>
        </div>
        {/* Tag Management */}
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-300">Tags</h4>
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
                className="flex items-center bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-100 text-sm px-2 py-1 rounded-full"
              >
                {tag}
                <X className="w-4 h-4 ml-2 cursor-pointer text-gray-500 hover:text-red-600" onClick={() => removeTag(tag)} />
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
