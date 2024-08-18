import { Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import SidebarProvider from "./providers/SidebarProvider";

const App: React.FC = () => {
  return (
    <>
      <SidebarProvider>
        <Header />
        <Outlet />
      </SidebarProvider>
    </>
  );
};

export default App;
