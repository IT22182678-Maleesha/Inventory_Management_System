import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { X, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

const AdjustStockModal = ({ isOpen, onClose, product }) => {
  const { adjustStock } = useInventory();

  if (!isOpen || !product) return null;

  const currentStock = product.stock;

  // Validation Schema defined inline to capture currentStock closure
  const AdjustStockSchema = Yup.object().shape({
    type: Yup.string()
      .oneOf(['incoming', 'outgoing'], 'Invalid transaction type')
      .required('Transaction type is required'),
    quantity: Yup.number()
      .typeError('Quantity must be a number')
      .integer('Quantity must be a whole number')
      .positive('Quantity must be greater than zero')
      .required('Quantity is required')
      .test(
        'check-limit',
        `Quantity cannot exceed available stock (${currentStock})`,
        function(value) {
          const { type } = this.parent;
          if (type === 'outgoing' && value > currentStock) {
            return false;
          }
          return true;
        }
      )
  });

  const handleSubmit = (values, { resetForm }) => {
    adjustStock(product.id, values.quantity, values.type);
    resetForm();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Adjust Stock Level</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Product Name</p>
          <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{product.name}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>SKU: <code style={{ fontFamily: 'monospace' }}>{product.id}</code></span>
            <span style={{ color: 'var(--text-secondary)' }}>Current Stock: <strong style={{ color: 'var(--text-primary)' }}>{currentStock}</strong></span>
          </div>
        </div>

        <Formik
          initialValues={{ type: 'incoming', quantity: '' }}
          validationSchema={AdjustStockSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label className="form-label">Transaction Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className={`btn ${values.type === 'incoming' ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => setFieldValue('type', 'incoming')}
                    style={{ gap: '0.35rem' }}
                  >
                    <ArrowUpRight size={16} />
                    <span>Incoming (Restock)</span>
                  </button>
                  <button
                    type="button"
                    className={`btn ${values.type === 'outgoing' ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => setFieldValue('type', 'outgoing')}
                    style={{ gap: '0.35rem' }}
                    disabled={currentStock === 0}
                  >
                    <ArrowDownRight size={16} />
                    <span>Outgoing (Sale)</span>
                  </button>
                </div>
                {currentStock === 0 && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 500 }}>
                    Product is out of stock. You can only restock it.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="quantity">Quantity to Adjust</label>
                <Field
                  id="quantity"
                  name="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  className="form-control"
                  style={touched.quantity && errors.quantity ? { borderColor: 'var(--danger)' } : {}}
                />
                {touched.quantity && errors.quantity && (
                  <div className="form-error">
                    <AlertCircle size={14} />
                    <span>{errors.quantity}</span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  Submit Adjustment
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AdjustStockModal;
