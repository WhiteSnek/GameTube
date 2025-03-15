import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, UploadCloud, X } from "lucide-react";

type UploadVideoProps = {
  open: boolean;
  onClose: () => void;
  guildName: string;
};

const UploadVideo: React.FC<UploadVideoProps> = ({
  open,
  onClose,
  guildName,
}) => {
  const [step, setStep] = useState("details");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [tagList, setTagList] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setFile: (file: File | null) => void
  ) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tags.trim() !== "") {
      setTagList([...tagList, tags.trim()]);
      setTags("");
      e.preventDefault();
    }
  };

  const removeTag = (index: number) => {
    setTagList(tagList.filter((_, i) => i !== index));
  };

  const removeFile = (setFile: (file: File | null) => void) => {
    setFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, description, tagList, thumbnail, video });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-6 sm:max-w-3xl  bg-zinc-200 dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle>
            <div className="flex justify-center items-center gap-4">
              <Upload /> Upload Video in {guildName}
            </div>
            <hr className="border-t border-red-700 m-4" />
          </DialogTitle>
        </DialogHeader>
        <Tabs value={step} onValueChange={setStep}>
          <TabsList className="flex space-x-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Video Title</label>
                <Input
                  type="text"
                  placeholder="Enter video title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Video Description
                </label>
                <Textarea
                  placeholder="Enter video description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Tags</label>
                <Input
                  type="text"
                  placeholder="Enter a tag and press Enter"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  onKeyDown={handleTagInput}
                />
                <div className="flex flex-wrap mt-2 gap-2">
                  {tagList.map((tag, index) => (
                    <div
                      key={index}
                      className="flex text-white items-center bg-red-500 px-2 py-1 rounded-full"
                    >
                      <span className="text-sm mr-2">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-white hover:text-gray-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </form>
            <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setStep("media")}
              className="w-full mt-10 border-2 bg-transparent border-red-500 cursor-pointer dark:text-white text-black"
              disabled
            >
              Back
            </Button>
            <Button
              onClick={() => setStep("media")}
              className="w-full mt-10 bg-red-500 text-white cursor-pointer hover:bg-red-700"
            >
              Next
            </Button>
            </div>
          </TabsContent>
          <TabsContent value="media">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Thumbnail</label>
                <div
                  className="border-2 border-dashed border-gray-700 dark:border-gray-300 rounded-lg p-3 text-center cursor-pointer relative h-50 flex items-center justify-center"
                  onDrop={(e) => handleDrop(e, setThumbnail)}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  {thumbnail ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(thumbnail)}
                        alt="Thumbnail Preview"
                        className="h-full w-full object-cover rounded-lg"
                      />
                      <button
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        onClick={() => removeFile(setThumbnail)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud
                        className="mx-auto text-gray-500"
                        size={40}
                      />
                      <p className="text-sm">
                        Drag & drop thumbnail here or click to upload
                      </p>
                    </>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    ref={thumbnailInputRef}
                    onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Video File</label>
                <div
                  className="border-2 border-dashed border-gray-700 dark:border-gray-300  rounded-lg p-3 text-center cursor-pointer relative h-50 flex items-center justify-center"
                  onDrop={(e) => handleDrop(e, setVideo)}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => videoInputRef.current?.click()}
                >
                  {video ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <video
                        controls
                        className="h-full w-full object-cover rounded-lg"
                      >
                        <source
                          src={URL.createObjectURL(video)}
                          type={video.type}
                        />
                      </video>
                      <button
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        onClick={() => removeFile(setVideo)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud
                        className="mx-auto text-gray-500"
                        size={40}
                      />
                      <p className="text-sm">
                        Drag & drop video here or click to upload
                      </p>
                    </>
                  )}
                  <Input
                    type="file"
                    accept="video/*"
                    ref={videoInputRef}
                    onChange={(e) => setVideo(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setStep("details")}
              className="w-full mt-10 border-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 border-red-500 cursor-pointer dark:text-white text-black"
              
            >
              Back
            </Button>
            <Button
              type="submit"
              className="w-full mt-10 bg-red-500 text-white cursor-pointer hover:bg-red-700"
            >
              Upload
            </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UploadVideo;
