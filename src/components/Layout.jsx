import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <div className="main-wrapper">
        <Header onMenuOpen={openSidebar} />
        
        <main className="content-body">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
