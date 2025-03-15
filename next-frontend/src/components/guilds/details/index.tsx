import truncateText from "@/utils/truncate_text";
import React from "react";

const Details = () => {
  return (
    <div className="w-full bg-white dark:bg-zinc-800 shadow-lg rounded-2xl overflow-hidden">
      {/* Cover Image */}
      <div className="h-48 bg-gray-300 flex items-center justify-center">
        <img
          src="https://preview.redd.it/whats-your-opinion-on-daigo-dojima-leadership-of-the-tojo-v0-h1qhgpyhy9kb1.png?auto=webp&s=5a82895d44d1ae2de2fde8233c35b560c8df2516"
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Avatar & Channel Info */}
      <div className="p-6 flex items-center space-x-4">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpv9seV7n56aoMI_1npK7I9W-GbSYF8iEstA&s"
          alt="Avatar"
          className="w-20 h-20 rounded-full border-4 border-zinc-950 dark:border-white shadow-md"
        />
        <div>
          <h2 className="text-2xl font-semibold">Tojo Clan</h2>
          
          <p className="text-zinc-700 dark:text-zinc-300">{truncateText("Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe aspernatur cum ipsam! Quisquam suscipit nisi tempore eum vitae provident minima quas voluptatibus dignissimos accusantium, reprehenderit excepturi porro dolorum assumenda ipsam.", 200)}</p>
        </div>
      </div>
      
      {/* Manage Button */}
      <div className="p-6 flex justify-end">
        <button className="px-4 bg-red-500 cursor-pointer text-white py-2 rounded-lg hover:bg-red-600 transition">
          Manage Channel
        </button>
      </div>
    </div>
  );
};

export default Details;