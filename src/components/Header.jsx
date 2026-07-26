import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Menu, Calendar } from 'lucide-react';

const Header = ({ onMenuOpen }) => {
  const { activeTab } = useInventory();

  // Get active page title
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'System Dashboard';
      case 'inventory':
        return 'Inventory Management';
      case 'categories':
        return 'Product Categories';
      case 'stock_log':
        return 'Stock History Audit';
      default:
        return 'StockSphere';
    }
  };

  const formatDate = () => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="mobile-menu-btn" onClick={onMenuOpen} aria-label="Open menu" style={{ border: 'none', background: 'none' }}>
          <Menu size={24} />
        </button>
        <h1 className="header-title">{getPageTitle()}</h1>
      </div>

      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
          <Calendar size={16} />
          <span>{formatDate()}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
