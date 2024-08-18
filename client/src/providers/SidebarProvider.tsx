import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
    showSidebar: boolean;
    setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = (): SidebarContextType => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

interface SidebarProviderProps {
    children: ReactNode;
}

const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState<boolean>(true);

    return (
        <SidebarContext.Provider value={{ showSidebar, setShowSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

export default SidebarProvider;
