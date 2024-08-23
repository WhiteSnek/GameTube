import { Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import { useSidebar } from "./providers/SidebarProvider";

const App: React.FC = () => {
  const {showSidebar} = useSidebar()
  return (
    <>
        <Header />
        <div className={`${showSidebar ?'ml-[16.67%]' : ''} mt-[5rem]`}>
          <Outlet />
        </div>
    </>
  );
};

export default App;
