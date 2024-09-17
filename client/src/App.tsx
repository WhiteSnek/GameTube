import { Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import { useSidebar } from "./providers/SidebarProvider";
import UserProvider from "./providers/UserProvider";
import GuildProvider from "./providers/GuildProvider";
import { VideoProvider } from "./providers/VideoProvider";

const App: React.FC = () => {
  const { showSidebar } = useSidebar();
  return (
    <>
      <UserProvider>
        <GuildProvider>
          <VideoProvider>
            <Header />
            <div className={`${showSidebar ? "ml-[16.67%]" : ""} mt-[5rem]`}>
              <Outlet />

            </div>
          </VideoProvider>
        </GuildProvider>
      </UserProvider>
    </>
  );
};

export default App;
