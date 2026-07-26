import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import ProductFormModal from '../components/ProductFormModal';
import AdjustStockModal from '../components/AdjustStockModal';
import { 
  Search, 
  Plus, 
  Download, 
  Edit2, 
  Trash2, 
  Maximize2,
  List, 
  Grid,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';

const InventoryView = () => {
  const { 
    products, 
    categories, 
    deleteProduct, 
    adjustStock, 
    bulkDelete, 
    bulkRestock 
  } = useInventory();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');
  
  // Layout state
  const [viewType, setViewType] = useState('table'); // 'table' or 'card'
  
  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Sort state
  const [sortField, setSortField] = useState('name'); // 'name', 'price', 'stock'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc', 'desc'

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState(null);

  // Modal open handlers
  const handleOpenAddForm = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (product) => {
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  const handleOpenAdjustStock = (product) => {
    setProductToAdjust(product);
    setIsAdjustOpen(true);
  };

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filters application
  const filteredProducts = products
    .filter(prod => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = prod.name.toLowerCase().includes(query) || prod.id.toLowerCase().includes(query);
      
      // 2. Category Filter
      const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;

      // 3. Stock Status Filter
      let matchesStock = true;
      if (stockStatus === 'in_stock') {
        matchesStock = prod.stock > 10;
      } else if (stockStatus === 'low_stock') {
        matchesStock = prod.stock > 0 && prod.stock <= 10;
      } else if (stockStatus === 'out_of_stock') {
        matchesStock = prod.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Checklist Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allFilteredIds = filteredProducts.map(p => p.id);
      setSelectedIds(allFilteredIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Bulk Actions
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected products?`)) {
      bulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkRestock = () => {
    const amountStr = window.prompt(`Enter quantity to add to the ${selectedIds.length} selected products:`);
    if (amountStr === null) return; // user cancelled

    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive number.');
      return;
    }

    bulkRestock(selectedIds, amount);
    setSelectedIds([]);
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      alert('No products available to export.');
      return;
    }

    const headers = ['Product ID (SKU)', 'Product Name', 'Category', 'Price ($)', 'Stock Level', 'Status'];
    const rows = filteredProducts.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`, // Escape inner quotes
      p.category,
      p.price.toFixed(2),
      p.stock,
      p.stock === 0 ? 'Out of Stock' : p.stock <= 10 ? 'Low Stock' : 'In Stock'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Inline Stock Incrementor
  const handleInlineStockAdd = (productId) => {
    adjustStock(productId, 1, 'incoming');
  };

  const handleInlineStockSub = (productId, currentStock) => {
    if (currentStock === 0) return; // safety stop
    adjustStock(productId, 1, 'outgoing');
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <span className="badge badge-danger">Out of Stock</span>;
    if (stock <= 10) return <span className="badge badge-warning">Low Stock ({stock})</span>;
    return <span className="badge badge-success">In Stock ({stock})</span>;
  };

  return (
    <div>
      {/* Top Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          {/* Search Input */}
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select 
            className="select-input" 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select 
            className="select-input" 
            value={stockStatus} 
            onChange={(e) => setStockStatus(e.target.value)}
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock (&gt;10)</option>
            <option value="low_stock">Low Stock (1-10)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>
        </div>

        <div className="toolbar-right">
          {/* Toggle Layout (Table/Card View) */}
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button 
              className="btn btn-secondary btn-icon-only" 
              onClick={() => setViewType('table')}
              style={{ 
                borderRadius: 0,
                border: 'none',
                backgroundColor: viewType === 'table' ? 'var(--primary-light)' : 'transparent',
                color: viewType === 'table' ? 'var(--primary)' : 'var(--text-secondary)'
              }}
              title="Table View"
            >
              <List size={18} />
            </button>
            <button 
              className="btn btn-secondary btn-icon-only" 
              onClick={() => setViewType('card')}
              style={{ 
                borderRadius: 0,
                border: 'none',
                backgroundColor: viewType === 'card' ? 'var(--primary-light)' : 'transparent',
                color: viewType === 'card' ? 'var(--primary)' : 'var(--text-secondary)'
              }}
              title="Card View"
            >
              <Grid size={18} />
            </button>
          </div>

          {/* Export to CSV Button */}
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={18} />
            <span className="desktop-only">Export CSV</span>
          </button>

          {/* Add Product Button */}
          <button className="btn btn-primary" onClick={handleOpenAddForm}>
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bulk-bar">
          <div className="bulk-text">
            <span>{selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected</span>
          </div>
          <div className="bulk-actions-btns">
            <button className="btn bulk-btn btn-sm" onClick={handleBulkRestock}>
              Bulk Restock
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleBulkDelete} style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
              Bulk Delete
            </button>
            <button className="btn btn-secondary btn-sm bulk-btn" onClick={() => setSelectedIds([])}>
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area: Products List */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card empty-state">
          <AlertTriangle size={48} className="empty-icon" />
          <h4 className="empty-title">No Products Found</h4>
          <p className="empty-desc">Try clearing your filters, adjusting your search query, or add a new product to this category.</p>
          <button className="btn btn-primary" onClick={handleOpenAddForm}>Add Product</button>
        </div>
      ) : viewType === 'table' ? (
        /* Table View */
        <div className="table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input 
                    type="checkbox" 
                    className="custom-checkbox"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    SKU {sortField === 'id' && <ArrowUpDown size={14} />}
                  </div>
                </th>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Product Name {sortField === 'name' && <ArrowUpDown size={14} />}
                  </div>
                </th>
                <th>Category</th>
                <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Price {sortField === 'price' && <ArrowUpDown size={14} />}
                  </div>
                </th>
                <th onClick={() => handleSort('stock')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Stock Level {sortField === 'stock' && <ArrowUpDown size={14} />}
                  </div>
                </th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(prod => {
                const isChecked = selectedIds.includes(prod.id);
                return (
                  <tr key={prod.id} style={isChecked ? { backgroundColor: 'var(--primary-light)' } : {}}>
                    <td className="checkbox-cell">
                      <input 
                        type="checkbox" 
                        className="custom-checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectProduct(prod.id)}
                      />
                    </td>
                    <td className="product-cell-sku">{prod.id}</td>
                    <td className="product-cell-name">{prod.name}</td>
                    <td>
                      <span className="badge badge-category">{prod.category}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>${prod.price.toFixed(2)}</td>
                    <td>
                      {/* Inline Stock Adjustment Controls */}
                      <div className="stock-adjust-cell">
                        <button 
                          className="stock-adjust-btn"
                          onClick={() => handleInlineStockSub(prod.id, prod.stock)}
                          disabled={prod.stock === 0}
                          title="Decrease Stock (1)"
                        >
                          -
                        </button>
                        <span 
                          onClick={() => handleOpenAdjustStock(prod)}
                          style={{ cursor: 'pointer', fontWeight: 700, minWidth: '24px', textAlign: 'center', textDecoration: 'underline dotted' }}
                          title="Adjust Stock Level"
                        >
                          {prod.stock}
                        </span>
                        <button 
                          className="stock-adjust-btn"
                          onClick={() => handleInlineStockAdd(prod.id)}
                          title="Increase Stock (1)"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{getStockBadge(prod.stock)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary btn-icon-only" 
                          onClick={() => handleOpenEditForm(prod)}
                          title="Edit Details"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn btn-danger btn-icon-only" 
                          onClick={() => {
                            if (window.confirm(`Delete ${prod.name}?`)) deleteProduct(prod.id);
                          }}
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon-only"
                          onClick={() => handleOpenAdjustStock(prod)}
                          title="Detailed Stock Level Update"
                        >
                          <Maximize2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View */
        <div className="categories-grid">
          {filteredProducts.map(prod => {
            const isChecked = selectedIds.includes(prod.id);
            return (
              <div 
                key={prod.id} 
                className="glass-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  position: 'relative',
                  border: isChecked ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                  boxShadow: isChecked ? 'var(--shadow-premium)' : 'var(--glass-shadow)',
                  backgroundColor: isChecked ? 'var(--bg-card-hover)' : 'var(--bg-card)'
                }}
              >
                {/* Select Checkbox on Card */}
                <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                  <input 
                    type="checkbox" 
                    className="custom-checkbox"
                    checked={isChecked}
                    onChange={() => handleSelectProduct(prod.id)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem', paddingLeft: '2rem' }}>
                  <span className="badge badge-category" style={{ marginRight: 'auto' }}>{prod.category}</span>
                  {getStockBadge(prod.stock)}
                </div>

                <div>
                  <h4 className="product-cell-name" style={{ fontSize: '1.1rem', margin: '0.25rem 0' }}>{prod.name}</h4>
                  <p className="product-cell-sku">SKU: {prod.id}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Price</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>${prod.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Stock</p>
                    <div className="stock-adjust-cell" style={{ marginTop: '0.25rem' }}>
                      <button 
                        className="stock-adjust-btn"
                        onClick={() => handleInlineStockSub(prod.id, prod.stock)}
                        disabled={prod.stock === 0}
                      >
                        -
                      </button>
                      <strong 
                        style={{ cursor: 'pointer', textDecoration: 'underline dotted', minWidth: '20px', textAlign: 'center' }}
                        onClick={() => handleOpenAdjustStock(prod)}
                      >
                        {prod.stock}
                      </strong>
                      <button 
                        className="stock-adjust-btn"
                        onClick={() => handleInlineStockAdd(prod.id)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => handleOpenEditForm(prod)}
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => {
                      if (window.confirm(`Delete ${prod.name}?`)) deleteProduct(prod.id);
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals Containers */}
      <ProductFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        productToEdit={productToEdit} 
      />

      <AdjustStockModal 
        isOpen={isAdjustOpen} 
        onClose={() => setIsAdjustOpen(false)} 
        product={productToAdjust} 
      />
    </div>
  );
};

export default InventoryView;
