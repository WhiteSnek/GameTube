import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, UploadCloud, X } from "lucide-react";
import { useVideo } from "@/context/video_provider";
import { useUser } from "@/context/user_provider";
import { UploadVideoType } from "@/types/video.types";
import { Checkbox } from "../ui/checkbox";
import { formatText } from "@/utils/formatText";
import styles from "./styles.module.css";
import RichTextEditor from "../rich_text_editor/RichTextEditor";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
type UploadVideoProps = {
  open: boolean;
  onClose: () => void;
  guildName: string;
  guildId: string;
};

const UploadVideo: React.FC<UploadVideoProps> = ({
  open,
  onClose,
  guildName,
  guildId,
}) => {
  const [step, setStep] = useState("details");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [openTags, setOpenTags] = useState(false);
  const [tagList, setTagList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<boolean>(false);
  const { getSignedUrls, uploadFiles, addVideo, getGuildTags } = useVideo();
  const { User } = useUser();
  const [guildTags, setGuildTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchGuildTags = async () => {
      try {
        const response = await getGuildTags(guildId);
        setGuildTags(response);
      } catch (error) {
        console.error("Failed to fetch guild tags:", error);
      }
    };
    console.log("guildId:", guildId);
    if (guildId) {
      fetchGuildTags();
    }
  }, [guildId]);

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setFile: (file: File | null) => void,
  ) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const toggleTag = (tag: string) => {
    setTagList((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const removeFile = (setFile: (file: File | null) => void) => {
    setFile(null);
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement("video");
      const objectURL = URL.createObjectURL(file);

      videoElement.preload = "metadata";
      videoElement.src = objectURL;

      videoElement.onloadedmetadata = () => {
        const duration = videoElement.duration;
        URL.revokeObjectURL(objectURL);
        resolve(duration);
      };

      videoElement.onerror = () => {
        console.error("Error loading video metadata");
        reject(new Error("Failed to load video metadata"));
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!User) {
        console.error("User is not authenticated.");
        return;
      }

      const guild = formatText(guildName);
      console.log("Formatted Guild Name:", guild);

      const signedUrls = await getSignedUrls(User.email, guild);
      if (!signedUrls) {
        console.error("Failed to retrieve signed URLs.");
        return;
      }

      const { videoUrl, videoKey, thumbnailUrl, thumbnailKey } = signedUrls;

      if (!videoUrl || !videoKey || !thumbnailUrl || !thumbnailKey) {
        console.error("Missing signed URLs or keys.", signedUrls);
        return;
      }

      if (!video || !thumbnail) {
        console.error("Video or Thumbnail file is missing.");
        return;
      }

      console.log("Uploading files...");
      setLoading(true);
      const response = await uploadFiles(
        videoUrl,
        thumbnailUrl,
        video,
        thumbnail,
        setProgress,
      );

      if (!response) {
        setLoading(false);
        console.error("File upload failed.");
        return;
      }

      console.log("Getting video duration...");
      const duration = await getVideoDuration(video);

      if (!duration) {
        setLoading(false);
        console.error("Failed to retrieve video duration.");
        return;
      }
      const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;
      const data: UploadVideoType = {
        title,
        description,
        thumbnail: `${CLOUDFRONT_URL}/${thumbnailKey}`,
        videoUrl: `${CLOUDFRONT_URL}/${videoKey}`,
        duration: Math.round(duration),
        guildId,
        isPrivate,
        tags: tagList,
      };

      console.log("Uploading video metadata...", data);
      await addVideo(data);
      console.log("Video uploaded successfully!");
    } catch (error) {
      console.error("An error occurred during upload:", error);
    } finally {
      setLoading(false);
      setUploaded(true);
      onClose();
    }
  };

  useEffect(() => {
    if (uploaded) {
      setTitle("");
      setDescription("");
      setTagList([]);
      setThumbnail(null);
      setVideo(null);
      setIsPrivate(false);
      setStep("details");
      const timeout = setTimeout(() => {
        setUploaded(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [uploaded]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-6 sm:max-w-7xl h-[700px] overflow-y-scroll bg-zinc-200 dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle>
            <div className="flex justify-center items-center gap-4">
              <Upload /> Upload Video in {guildName}
            </div>
            <hr className="border-t border-red-700 m-4" />
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex flex-col items-center gap-5">
            <span className={styles.loader}></span>
            <div className="w-full max-w-xs relative">
              <progress
                className="w-full h-3 rounded-full bg-red-300"
                value={progress}
                max={100}
                style={{
                  background: `linear-gradient(to right, #f44336 ${progress}%, #ddd ${progress}%)`,
                }}
              ></progress>
              <div
                className="absolute top-2 left-0 right-0 bottom-0 bg-red-600 rounded-l-full"
                style={{
                  width: `${progress}%`,
                  height: "12px",
                  transition: "width 0.3s ease-out",
                }}
              ></div>
            </div>
            <span className="text-lg text-white font-semibold">
              {progress}%
            </span>
            <h1 className="text-xl font-bold">
              Video upload initiated — prepare for glory...
            </h1>
          </div>
        ) : uploaded ? (
          <div className={styles.noticeWrapper}>
            <div className={styles.icon}>🚀</div>
            <h2 className={styles.heading}>Upload Successful!</h2>
            <p className={styles.text}>
              Your video has been uploaded to the servers. It’s now being
              processed and will be available once it's ready.
            </p>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Section */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Video Title
                    </label>
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
                    <div className="rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700 shadow-lg">
                      <RichTextEditor
                        value={description}
                        placeholder="Describe your Guild..."
                        onChange={setDescription}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Tags</label>

                    <Popover open={openTags} onOpenChange={setOpenTags}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {tagList.length > 0
                            ? `${tagList.length} tag(s) selected`
                            : "Select tags"}

                          <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Search tags..." />

                          <CommandEmpty>No tag found.</CommandEmpty>

                          <CommandGroup className="max-h-64 overflow-y-auto">
                            {guildTags?.map((tag: string) => (
                              <CommandItem
                                key={tag}
                                value={tag}
                                onSelect={() => toggleTag(tag)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    tagList.includes(tag)
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />

                                {tag}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {tagList.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {tagList.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1 px-3 py-1"
                          >
                            {tag}

                            <button
                              type="button"
                              onClick={() => toggleTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Thumbnail */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Thumbnail
                    </label>

                    <div
                      className="h-52 rounded-xl border-2 border-dashed border-zinc-500 hover:border-red-500 transition-all cursor-pointer relative overflow-hidden flex items-center justify-center"
                      onDrop={(e) => handleDrop(e, setThumbnail)}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      {thumbnail ? (
                        <>
                          <img
                            src={URL.createObjectURL(thumbnail)}
                            alt="thumbnail"
                            className="w-full h-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(setThumbnail);
                            }}
                            className="absolute top-3 right-3 bg-red-600 rounded-full p-1 text-white"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center space-y-3">
                          <UploadCloud
                            size={42}
                            className="mx-auto text-zinc-500"
                          />
                          <p className="text-sm text-zinc-500">
                            Click or drag an image
                          </p>
                        </div>
                      )}

                      <Input
                        type="file"
                        accept="image/*"
                        ref={thumbnailInputRef}
                        onChange={(e) =>
                          setThumbnail(e.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Video */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Video</label>

                    <div
                      className="h-52 rounded-xl border-2 border-dashed border-zinc-500 hover:border-red-500 transition-all cursor-pointer relative overflow-hidden flex items-center justify-center"
                      onDrop={(e) => handleDrop(e, setVideo)}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => videoInputRef.current?.click()}
                    >
                      {video ? (
                        <>
                          <video
                            controls
                            className="w-full h-full object-cover"
                          >
                            <source
                              src={URL.createObjectURL(video)}
                              type={video.type}
                            />
                          </video>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(setVideo);
                            }}
                            className="absolute top-3 right-3 bg-red-600 rounded-full p-1 text-white"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center space-y-3">
                          <UploadCloud
                            size={42}
                            className="mx-auto text-zinc-500"
                          />
                          <p className="text-sm text-zinc-500">
                            Click or drag a video
                          </p>
                        </div>
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
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <Checkbox
                      checked={isPrivate}
                      onCheckedChange={(checked) => setIsPrivate(!!checked)}
                    />

                    <div>
                      <p className="font-medium">Members only</p>
                      <p className="text-sm text-zinc-500">
                        Only guild members can watch this video.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 flex justify-end gap-4 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 cursor-pointer px-8"
                >
                  Upload Video
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadVideo;
