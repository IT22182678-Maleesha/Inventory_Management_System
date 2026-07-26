import React from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import Layout from './components/Layout';
import DashboardView from './views/DashboardView';
import InventoryView from './views/InventoryView';
import CategoriesView from './views/CategoriesView';
import StockLogView from './views/StockLogView';

const AppContent = () => {
  const { activeTab } = useInventory();

  // Dynamically render active tab view
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'inventory':
        return <InventoryView />;
      case 'categories':
        return <CategoriesView />;
      case 'stock_log':
        return <StockLogView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <Layout>
      {renderActiveView()}
    </Layout>
  );
};

const App = () => {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
};

export default App;
