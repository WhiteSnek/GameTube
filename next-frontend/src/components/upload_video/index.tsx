import React, { useState, useRef, useEffect } from "react";
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
import { useVideo } from "@/context/video_provider";
import { useUser } from "@/context/user_provider";
import { UploadVideoType } from "@/types/video.types";
import { Checkbox } from "../ui/checkbox";
import { formatText } from "@/utils/formatText";
import styles from "./styles.module.css";
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
  const [tags, setTags] = useState<string>("");
  const [tagList, setTagList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<boolean>(false);
  const { getSignedUrls, uploadFiles, addVideo } = useVideo();
  const { User } = useUser();
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
      e.preventDefault();
      setTagList([...tagList, tags.trim()]);
      setTags("");
    }
  };

  const removeTag = (index: number) => {
    setTagList(tagList.filter((_, i) => i !== index));
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
        setProgress
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

      const data: UploadVideoType = {
        title,
        description,
        thumbnail: thumbnailKey,
        videoUrl: videoKey,
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
      setTags("");
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
      <DialogContent className="p-6 sm:max-w-3xl h-[600px] overflow-y-scroll bg-zinc-200 dark:bg-zinc-900">
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
                  height: '12px',
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
          <Tabs value={step} onValueChange={setStep}>
            <TabsList className="flex space-x-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <form className="space-y-6">
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
                  <div className="space-y-2 flex  items-end gap-4">
                    <label className="block text-sm font-medium">
                      Do you want this video to be members only?
                    </label>
                    <Checkbox
                      onCheckedChange={(prev) => setIsPrivate(!prev)}
                      className="border border-white"
                    />
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
                      onChange={(e) =>
                        setThumbnail(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Video File
                  </label>
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
                  onClick={handleSubmit}
                  className="w-full mt-10 bg-red-500 text-white cursor-pointer hover:bg-red-700"
                >
                  Upload
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadVideo;
