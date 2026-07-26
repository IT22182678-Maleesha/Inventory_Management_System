import React, { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext();

const DEFAULT_CATEGORIES = ['Electronics', 'Apparel', 'Home & Kitchen', 'Books', 'Sports'];

const DEFAULT_PRODUCTS = [
  { id: 'PRD-102948', name: 'MacBook Pro 14"', category: 'Electronics', price: 1999.99, stock: 15 },
  { id: 'PRD-582910', name: 'Cotton Crewneck Tee', category: 'Apparel', price: 29.99, stock: 120 },
  { id: 'PRD-372819', name: 'Chef Knife 8"', category: 'Home & Kitchen', price: 89.50, stock: 45 },
  { id: 'PRD-918273', name: 'Clean Code Book', category: 'Books', price: 34.99, stock: 8 },
  { id: 'PRD-645372', name: 'Yoga Mat Premium', category: 'Sports', price: 49.99, stock: 0 }
];

export const InventoryProvider = ({ children }) => {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('inventory_dark_mode');
    return saved ? JSON.parse(saved) : true; // Default to dark mode for rich aesthetics
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Categories state
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('inventory_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  // Products state
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('inventory_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  // Stock History Log state
  const [stockHistory, setStockHistory] = useState(() => {
    const saved = localStorage.getItem('inventory_stock_history');
    if (saved) return JSON.parse(saved);
    
    // Seed default history log for pre-populated products
    const seedLogs = DEFAULT_PRODUCTS.map((prod, idx) => ({
      id: `LOG-${Date.now() - idx * 60000}`,
      timestamp: new Date(Date.now() - idx * 60000).toISOString(),
      productId: prod.id,
      productName: prod.name,
      action: 'Initial Stock',
      quantityChanged: prod.stock,
      originalStock: 0,
      newStock: prod.stock
    }));
    return seedLogs;
  });

  // Apply theme to document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('inventory_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Persist products
  useEffect(() => {
    localStorage.setItem('inventory_products', JSON.stringify(products));
  }, [products]);

  // Persist categories
  useEffect(() => {
    localStorage.setItem('inventory_categories', JSON.stringify(categories));
  }, [categories]);

  // Persist history log
  useEffect(() => {
    localStorage.setItem('inventory_stock_history', JSON.stringify(stockHistory));
  }, [stockHistory]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Helper to generate SKU (Auto-generated SKU bonus feature)
  const generateSKU = () => {
    let sku;
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
      sku = `PRD-${randomNum}`;
      isUnique = !products.some(p => p.id === sku);
    }
    return sku;
  };

  // Add Product
  const addProduct = (productData) => {
    const newSku = generateSKU();
    const newProduct = {
      ...productData,
      id: newSku,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock, 10)
    };

    setProducts(prev => [newProduct, ...prev]);

    // Log action in history
    const logEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      productId: newSku,
      productName: newProduct.name,
      action: 'Creation & Stock',
      quantityChanged: newProduct.stock,
      originalStock: 0,
      newStock: newProduct.stock
    };
    setStockHistory(prev => [logEntry, ...prev]);
  };

  // Update Product
  const updateProduct = (productId, updatedData) => {
    let stockLogEntry = null;

    setProducts(prev => prev.map(prod => {
      if (prod.id === productId) {
        const newPrice = parseFloat(updatedData.price);
        const newStock = parseInt(updatedData.stock, 10);
        const stockDiff = newStock - prod.stock;

        // If stock level changed, we record it in the history
        if (stockDiff !== 0) {
          stockLogEntry = {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            productId: prod.id,
            productName: updatedData.name,
            action: stockDiff > 0 ? 'Restock' : 'Outgoing (Sale)',
            quantityChanged: Math.abs(stockDiff),
            originalStock: prod.stock,
            newStock: newStock
          };
        } else if (prod.name !== updatedData.name || prod.category !== updatedData.category || prod.price !== newPrice) {
          // General detail edit
          stockLogEntry = {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            productId: prod.id,
            productName: updatedData.name,
            action: 'Edit Details',
            quantityChanged: 0,
            originalStock: prod.stock,
            newStock: prod.stock
          };
        }

        return {
          ...prod,
          name: updatedData.name,
          category: updatedData.category,
          price: newPrice,
          stock: newStock
        };
      }
      return prod;
    }));

    if (stockLogEntry) {
      setStockHistory(prev => [stockLogEntry, ...prev]);
    }
  };

  // Delete Product
  const deleteProduct = (productId) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;

    setProducts(prev => prev.filter(p => p.id !== productId));

    // Log deletion
    const logEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      productId: productId,
      productName: productToDelete.name,
      action: 'Deletion',
      quantityChanged: -productToDelete.stock,
      originalStock: productToDelete.stock,
      newStock: 0
    };
    setStockHistory(prev => [logEntry, ...prev]);
  };

  // Adjust Stock (Increase / Decrease stock quantity safely)
  const adjustStock = (productId, amount, actionType) => {
    let stockLogEntry = null;

    setProducts(prev => prev.map(prod => {
      if (prod.id === productId) {
        const change = parseInt(amount, 10);
        let newStock = prod.stock;

        if (actionType === 'incoming') {
          newStock += change;
          stockLogEntry = {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            productId: prod.id,
            productName: prod.name,
            action: 'Restock',
            quantityChanged: change,
            originalStock: prod.stock,
            newStock: newStock
          };
        } else if (actionType === 'outgoing') {
          // Enforce stock cannot go below zero
          newStock = Math.max(0, prod.stock - change);
          const actualChange = prod.stock - newStock;
          
          if (actualChange > 0) {
            stockLogEntry = {
              id: `LOG-${Date.now()}`,
              timestamp: new Date().toISOString(),
              productId: prod.id,
              productName: prod.name,
              action: 'Outgoing (Sale)',
              quantityChanged: actualChange,
              originalStock: prod.stock,
              newStock: newStock
            };
          }
        }

        return { ...prod, stock: newStock };
      }
      return prod;
    }));

    if (stockLogEntry) {
      setStockHistory(prev => [stockLogEntry, ...prev]);
    }
  };

  // Add Custom Category
  const addCategory = (categoryName) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return false;
    
    // Case-insensitive duplicate check
    const exists = categories.some(cat => cat.toLowerCase() === trimmed.toLowerCase());
    if (exists) return false;

    setCategories(prev => [...prev, trimmed]);
    return true;
  };

  // Bulk Deletion
  const bulkDelete = (productIds) => {
    const productsToDelete = products.filter(p => productIds.includes(p.id));
    if (productsToDelete.length === 0) return;

    setProducts(prev => prev.filter(p => !productIds.includes(p.id)));

    // Create logs for each deleted product
    const timestamp = new Date().toISOString();
    const newLogs = productsToDelete.map((prod, idx) => ({
      id: `LOG-${Date.now()}-${idx}`,
      timestamp,
      productId: prod.id,
      productName: prod.name,
      action: 'Bulk Deletion',
      quantityChanged: -prod.stock,
      originalStock: prod.stock,
      newStock: 0
    }));

    setStockHistory(prev => [...newLogs, ...prev]);
  };

  // Bulk Restocking
  const bulkRestock = (productIds, amount) => {
    const change = parseInt(amount, 10);
    if (isNaN(change) || change <= 0) return;

    const timestamp = new Date().toISOString();
    const logsToAppend = [];

    setProducts(prev => prev.map(prod => {
      if (productIds.includes(prod.id)) {
        const newStock = prod.stock + change;
        logsToAppend.push({
          id: `LOG-${Date.now()}-${prod.id}`,
          timestamp,
          productId: prod.id,
          productName: prod.name,
          action: 'Bulk Restock',
          quantityChanged: change,
          originalStock: prod.stock,
          newStock: newStock
        });
        return { ...prod, stock: newStock };
      }
      return prod;
    }));

    if (logsToAppend.length > 0) {
      setStockHistory(prev => [...logsToAppend, ...prev]);
    }
  };

  return (
    <InventoryContext.Provider value={{
      darkMode,
      toggleDarkMode,
      activeTab,
      setActiveTab,
      categories,
      products,
      stockHistory,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      addCategory,
      bulkDelete,
      bulkRestock
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
