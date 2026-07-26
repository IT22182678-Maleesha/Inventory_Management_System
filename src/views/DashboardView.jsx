import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  AlertOctagon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  Edit3,
  Trash2,
  ListRestart
} from 'lucide-react';

const DashboardView = () => {
  const { products, stockHistory, setActiveTab } = useInventory();

  // 1. Calculations for Stats Cards
  const totalProducts = products.length;
  
  const totalValue = products.reduce((sum, prod) => {
    return sum + (prod.price * prod.stock);
  }, 0);

  // Low stock threshold: <= 10 and > 0
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  // 2. Category distribution
  const categoryCounts = products.reduce((acc, prod) => {
    acc[prod.category] = (acc[prod.category] || 0) + 1;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);

  const maxCategoryCount = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;

  // 3. Stock status distribution for Donut Chart
  const inStockCount = products.filter(p => p.stock > 10).length;

  const stockStates = [
    { label: 'In Stock (>10)', count: inStockCount, color: '#10b981' },
    { label: 'Low Stock (1-10)', count: lowStockCount, color: '#f59e0b' },
    { label: 'Out of Stock', count: outOfStockCount, color: '#ef4444' }
  ];

  const totalStockStatuses = inStockCount + lowStockCount + outOfStockCount;

  // Donut chart calculations
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // 314.159

  let accumulatedPercentage = 0;
  const donutSegments = stockStates.map(state => {
    const percentage = totalStockStatuses > 0 ? (state.count / totalStockStatuses) : 0;
    const strokeLength = percentage * circumference;
    const strokeOffset = circumference - strokeLength + (accumulatedPercentage * circumference);
    accumulatedPercentage += percentage;

    return {
      ...state,
      percentage,
      strokeLength,
      strokeOffset
    };
  });

  // Recent Stock logs (limit to 5)
  const recentLogs = stockHistory.slice(0, 5);

  const getLogIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'creation & stock':
        return <PlusCircle size={16} className="history-in" />;
      case 'restock':
      case 'bulk restock':
      case 'initial stock':
        return <ArrowUpRight size={16} className="history-in" />;
      case 'outgoing (sale)':
        return <ArrowDownRight size={16} className="history-out" />;
      case 'edit details':
        return <Edit3 size={16} style={{ color: 'var(--primary)' }} />;
      case 'deletion':
      case 'bulk deletion':
        return <Trash2 size={16} className="history-out" />;
      default:
        return <ListRestart size={16} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const getLogColorClass = (action) => {
    const act = action.toLowerCase();
    if (act.includes('restock') || act.includes('initial') || act.includes('creation')) return 'badge-success';
    if (act.includes('outgoing') || act.includes('deletion')) return 'badge-danger';
    return 'badge-category';
  };

  return (
    <div>
      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon primary">
            <Package size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Products</span>
            <span className="stat-value">{totalProducts}</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon success">
            <DollarSign size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Value</span>
            <span className="stat-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="glass-card stat-card" onClick={() => setActiveTab('inventory')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon warning">
            <AlertTriangle size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Low Stock Items</span>
            <span className="stat-value">{lowStockCount}</span>
          </div>
        </div>

        <div className="glass-card stat-card" onClick={() => setActiveTab('inventory')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon danger">
            <AlertOctagon size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Out of Stock</span>
            <span className="stat-value">{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="dashboard-grid">
        {/* Category Breakdown Horizontal Bar Chart */}
        <div className="glass-card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Products Per Category</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Distribution</span>
          </div>
          {sortedCategories.length === 0 ? (
            <div className="chart-container" style={{ color: 'var(--text-secondary)' }}>
              No categories found. Add products to populate categories.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center', height: '100%' }}>
              {sortedCategories.map(([cat, count]) => {
                const percentage = maxCategoryCount > 0 ? (count / maxCategoryCount) * 100 : 0;
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-primary)' }}>{cat}</span>
                      <span style={{ color: 'var(--primary)' }}>{count} {count === 1 ? 'product' : 'products'}</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        background: 'var(--primary-gradient)', 
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.8s ease-out'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stock Status Donut Chart */}
        <div className="glass-card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Stock Availability</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status Share</span>
          </div>
          
          {totalProducts === 0 ? (
            <div className="chart-container" style={{ color: 'var(--text-secondary)' }}>
              No stock data available.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div className="chart-container" style={{ height: '160px', width: '160px', minHeight: 'auto' }}>
                <svg className="svg-chart" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="var(--border-color)"
                    strokeWidth={strokeWidth}
                  />
                  {/* Segments */}
                  {donutSegments.map((segment, index) => (
                    <circle
                      key={index}
                      className="donut-chart-segment"
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${segment.strokeLength} ${circumference}`}
                      strokeDashoffset={-segment.strokeOffset}
                      transform="rotate(-90 60 60)"
                      strokeLinecap="round"
                    />
                  ))}
                  {/* Middle Text label */}
                  <text x="60" y="58" textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontWeight="800">
                    {totalProducts}
                  </text>
                  <text x="60" y="74" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontWeight="600" letterSpacing="0.05em">
                    PRODUCTS
                  </text>
                </svg>
              </div>

              <div className="chart-legends" style={{ width: '100%', marginTop: '1.5rem' }}>
                {donutSegments.map((segment, index) => (
                  <div key={index} className="legend-item" style={{ justifyContent: 'center' }}>
                    <span className="legend-color" style={{ backgroundColor: segment.color }}></span>
                    <span>{segment.label}: <strong>{segment.count}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="glass-card">
        <div className="chart-header" style={{ marginBottom: '1.25rem' }}>
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
            <span>Recent Inventory Activities</span>
          </h3>
          <button 
            onClick={() => setActiveTab('stock_log')} 
            className="btn btn-secondary btn-sm"
          >
            View Full Audit Trail
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <p className="empty-desc">No activities logged yet. Activities will appear as stock changes occur.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Type</th>
                  <th>Product</th>
                  <th>Action</th>
                  <th>Quantity Changed</th>
                  <th>Stock Delta (Before → After)</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {getLogIcon(log.action)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="product-cell-name">{log.productName}</span>
                        <span className="product-cell-sku">{log.productId}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getLogColorClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      {log.quantityChanged === 0 ? (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      ) : (
                        <strong className={log.action.includes('Outgoing') || log.action.includes('Deletion') ? 'history-out' : 'history-in'}>
                          {log.action.includes('Outgoing') || log.action.includes('Deletion') ? '-' : '+'}{log.quantityChanged}
                        </strong>
                      )}
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {log.originalStock} → {log.newStock}
                      </span>
                    </td>
                    <td className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
