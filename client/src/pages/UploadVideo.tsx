import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../providers/UserProvider";
import { UploadVideoTemplate } from "../templates/video_templates";
import { useSidebar } from "../providers/SidebarProvider";
import CloseIcon from "@mui/icons-material/Close";
import { useVideo } from "../providers/VideoProvider";
import VideoUploadLoader from "../components/Loader/VideoUploadLoader";

const UploadVideo: React.FC = () => {
  const { id } = useParams();
  const { user } = useUser();
  const { showSidebar } = useSidebar();
  const {uploadVideo} = useVideo()
  if (!id) return <div>Something went wrong...</div>;
  if (!user) return <div>Login...</div>;
  const navigate = useNavigate()
  const [details, setDetails] = useState<UploadVideoTemplate>({
    title: "",
    description: "",
    video: null,
    videoUrl: "",
    owner: user.id,
    guild: id,
    thumbnail: null,
    thumbnailUrl: "",
    tags: [],
    duration: 0,
  });
  const [tagInput, setTagInput] = useState("");
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const videoURL = URL.createObjectURL(file);

      // Set video file in details
      setDetails((prevDetails) => ({
        ...prevDetails,
        video: file, // This sets the video file in state
      }));

      setVideoPreview(videoURL);

      const tempVideo = document.createElement("video");
      tempVideo.src = videoURL;

      tempVideo.onloadedmetadata = () => {
        setDetails((prevDetails) => ({
          ...prevDetails,
          duration: tempVideo.duration,
        }));
      };
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDetails({ ...details, thumbnail: file });
      setThumbnailPreview(URL.createObjectURL(file)); // Show thumbnail preview
    }
  };

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  // Modified function to handle "Enter" keypress
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      addTag(); // Add tag
    }
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setDetails({ ...details, tags: [...details.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Video Details:", details);
    const formData = new FormData();
    formData.append("title", details.title);
    formData.append("description", details.description);

    if (details.video) {
      formData.append("video", details.video); // Ensure this is not null
    } else {
      console.log("No video selected");
    }
    if (details.thumbnail) {
      formData.append("thumbnail", details.thumbnail);
    }

    formData.append("owner", details.owner);
    formData.append("guild", details.guild);
    formData.append("duration", details.duration.toString());

    details.tags.forEach((tag) => {
      formData.append("tags[]", tag);
    });
    setLoading(true)
    const success = await uploadVideo(formData);
    if(success) {
        console.log('Video uploaded successfully!!')
        setLoading(false)
        navigate(`/profile/${user.id}`)
    } else {
        console.log('Error uploading video!!!')
        setLoading(false)
    } 

  };

  // Function to delete the selected video
  const deleteVideo = () => {
    setDetails({ ...details, video: null });
    setVideoPreview(null);
  };

  // Function to delete the selected thumbnail
  const deleteThumbnail = () => {
    setDetails({ ...details, thumbnail: null });
    setThumbnailPreview(null);
  };

  return (
    <div
      className={`${
        showSidebar ? "max-w-6xl mx-auto" : "max-w-7xl"
      } bg-zinc-800 text-white rounded-lg shadow-lg p-4 mx-auto`}
    >
      <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-white mb-2">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={details.title}
            onChange={handleChange}
            className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-white mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={details.description}
            onChange={handleChange}
            className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label className="block text-white mb-2">Video</label>
          <div className="flex justify-center items-center flex-col-reverse gap-3 p-4 border-2 border-dashed border-zinc-600 rounded-lg">
            <button
              type="button"
              onClick={() => document.getElementById("videoUpload")?.click()}
              className="bg-red-500 px-4 py-2 text-lg hover:bg-red-700 transition-colors rounded-md"
            >
              Choose Video
            </button>
            <input
              id="videoUpload"
              name="video"
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
            {videoPreview && (
              <div className="mt-4 relative">
                <video controls width="400">
                  <source src={videoPreview} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button
                  type="button"
                  onClick={deleteVideo}
                  className="absolute top-0 right-0 rounded-full text-white bg-red-600 aspect-square flex justify-center items-center"
                >
                  <CloseIcon />
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-white mb-2">Thumbnail</label>
          <div className="flex justify-center items-center flex-col-reverse gap-3 p-4 border-2 border-dashed border-zinc-600 rounded-lg">
            <button
              type="button"
              onClick={() =>
                document.getElementById("thumbnailUpload")?.click()
              }
              className="bg-red-500 px-4 py-2 text-lg hover:bg-red-700 transition-colors rounded-md"
            >
              Choose Thumbnail
            </button>
            <input
              id="thumbnailUpload"
              name="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="hidden"
            />
            {thumbnailPreview && (
              <div className="mt-4 relative">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  className="w-32 h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={deleteThumbnail}
                  className="absolute top-0 right-0 rounded-full text-white bg-red-600 aspect-square flex justify-center items-center"
                >
                  <CloseIcon />
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="tags" className="block text-white mb-2">
            Tags
          </label>
          <div className="space-x-2 grid grid-cols-12">
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={handleTagInput}
              onKeyDown={handleTagKeyPress} // Handle "Enter" keypress
              className="w-full p-3 col-span-10 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="button"
              onClick={addTag}
              className="bg-red-500 px-3 py-1 text-lg hover:bg-red-700 transition-colors rounded-md col-span-2"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap">
            {details.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-600 px-2 py-1 rounded-full mr-2 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-red-500 py-2 rounded-md text-lg font-semibold"
        >
          Upload Video
        </button>
      </form>
      {loading && <VideoUploadLoader />}
    </div>
  );
};

export default UploadVideo;
