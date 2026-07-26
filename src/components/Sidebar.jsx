import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  History, 
  Sun, 
  Moon, 
  X,
  Boxes
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, darkMode, toggleDarkMode } = useInventory();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'stock_log', label: 'Stock History', icon: History }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose(); // Close mobile drawer
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <Boxes size={28} className="logo-icon" />
          <span>StockSphere</span>
          {onClose && (
            <button className="modal-close-btn mobile-menu-btn" style={{ marginLeft: 'auto', display: 'block' }} onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={{ background: 'none', border: '1px solid transparent', textAlign: 'left', width: '100%' }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={toggleDarkMode} className="theme-toggle-btn">
            {darkMode ? (
              <>
                <Sun size={18} />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={18} />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
