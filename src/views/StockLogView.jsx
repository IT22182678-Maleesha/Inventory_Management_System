import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  Search, 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  Edit3, 
  Trash2,
  ListRestart
} from 'lucide-react';

const StockLogView = () => {
  const { stockHistory } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logs by name or SKU
  const filteredLogs = stockHistory.filter(log => {
    const query = searchQuery.toLowerCase().trim();
    return log.productName.toLowerCase().includes(query) || log.productId.toLowerCase().includes(query);
  });

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

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search Filter Header */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search history by product or SKU..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Showing {filteredLogs.length} audit {filteredLogs.length === 1 ? 'record' : 'records'}
        </div>
      </div>

      {/* Audit Log Table */}
      {filteredLogs.length === 0 ? (
        <div className="glass-card empty-state">
          <History size={48} className="empty-icon" />
          <h4 className="empty-title">No Audit Logs Found</h4>
          <p className="empty-desc">No events match your current search query or no stock adjustments have been made yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>Type</th>
                <th>Product Info</th>
                <th>Action Logged</th>
                <th>Quantity Shift</th>
                <th>Delta State</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const { date, time } = formatDateTime(log.timestamp);
                const isReduce = log.action.includes('Outgoing') || log.action.includes('Deletion');
                
                return (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {getLogIcon(log.action)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="product-cell-name">{log.productName}</span>
                        <span className="product-cell-sku">SKU: {log.productId}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getLogColorClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      {log.quantityChanged === 0 ? (
                        <span style={{ color: 'var(--text-muted)' }}>Details Edit</span>
                      ) : (
                        <strong className={isReduce ? 'history-out' : 'history-in'}>
                          {isReduce ? '-' : '+'}{Math.abs(log.quantityChanged)}
                        </strong>
                      )}
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {log.originalStock} → {log.newStock}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{date}</span>
                        <span className="log-time">{time}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockLogView;
