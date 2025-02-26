import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import {
  Home,
  Login,
  Register,
  Search,
  Subscriptions,
  VideoPage,
  Guild,
  Profile,
  UploadVideo,
  ManageGuild,
  History,
  WatchLater,
  LikedVideos,
} from "./pages";
import SidebarProvider from "./providers/SidebarProvider.tsx";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_SERVER;

const Layout: React.FC = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<App />}>
        <Route path="" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="videos/:videoId" element={<VideoPage />} />
        <Route path="search" element={<Search />} />
        <Route path="guilds/:id" element={<Guild />} />
        <Route path="guilds/manage/:id" element={<ManageGuild />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="upload-video/:id" element={<UploadVideo />} />
        <Route path="/history" element={<History />} />
        <Route path="/watch-later" element={<WatchLater />} />
        <Route path="/liked-videos" element={<LikedVideos />} />
        
      </Route>
    )
  );
  return (
    <SidebarProvider>
      <RouterProvider router={router} />
    </SidebarProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout />
  </StrictMode>
);
