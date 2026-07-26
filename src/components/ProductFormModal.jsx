import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { X, AlertCircle } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

const ProductSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters')
    .required('Product name is required'),
  category: Yup.string()
    .required('Please select a category'),
  price: Yup.number()
    .typeError('Price must be a number')
    .positive('Price must be greater than zero')
    .required('Price is required'),
  stock: Yup.number()
    .typeError('Stock must be a number')
    .integer('Stock must be an integer')
    .min(0, 'Stock cannot be less than 0')
    .required('Stock quantity is required')
});

const ProductFormModal = ({ isOpen, onClose, productToEdit }) => {
  const { categories, addProduct, updateProduct } = useInventory();

  if (!isOpen) return null;

  const isEditMode = !!productToEdit;

  const initialValues = {
    name: productToEdit ? productToEdit.name : '',
    category: productToEdit ? productToEdit.category : '',
    price: productToEdit ? productToEdit.price : '',
    stock: productToEdit ? productToEdit.stock : ''
  };

  const handleSubmit = (values, { resetForm }) => {
    if (isEditMode) {
      updateProduct(productToEdit.id, values);
    } else {
      addProduct(values);
    }
    resetForm();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEditMode ? 'Edit Product Details' : 'Add New Product'}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={ProductSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Product Name</label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Wireless Headphones"
                  className={`form-control ${touched.name && errors.name ? 'input-error' : ''}`}
                  style={touched.name && errors.name ? { borderColor: 'var(--danger)' } : {}}
                />
                {touched.name && errors.name && (
                  <div className="form-error">
                    <AlertCircle size={14} />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <Field
                  id="category"
                  name="category"
                  as="select"
                  className="form-control select-input"
                  style={touched.category && errors.category ? { borderColor: 'var(--danger)', width: '100%' } : { width: '100%' }}
                >
                  <option value="" disabled hidden>Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Field>
                {touched.category && errors.category && (
                  <div className="form-error">
                    <AlertCircle size={14} />
                    <span>{errors.category}</span>
                  </div>
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Need a custom category? You can create one in the Categories tab.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="price">Price ($)</label>
                  <Field
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="form-control"
                    style={touched.price && errors.price ? { borderColor: 'var(--danger)' } : {}}
                  />
                  {touched.price && errors.price && (
                    <div className="form-error">
                      <AlertCircle size={14} />
                      <span>{errors.price}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="stock">Stock Quantity</label>
                  <Field
                    id="stock"
                    name="stock"
                    type="number"
                    placeholder="0"
                    className="form-control"
                    style={touched.stock && errors.stock ? { borderColor: 'var(--danger)' } : {}}
                  />
                  {touched.stock && errors.stock && (
                    <div className="form-error">
                      <AlertCircle size={14} />
                      <span>{errors.stock}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProductFormModal;
