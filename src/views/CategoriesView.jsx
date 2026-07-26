import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useInventory } from '../context/InventoryContext';
import { Plus, Tags, AlertCircle, Bookmark } from 'lucide-react';

const CategoriesView = () => {
  const { categories, products, addCategory } = useInventory();

  // Calculate product counts per category
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat).length;
    return acc;
  }, {});

  // Yup validation schema incorporating active categories closure
  const CategorySchema = Yup.object().shape({
    categoryName: Yup.string()
      .trim()
      .min(2, 'Category name must be at least 2 characters')
      .max(30, 'Category name must be under 30 characters')
      .required('Category name is required')
      .test(
        'unique-category',
        'This category already exists',
        value => {
          if (!value) return true;
          return !categories.some(cat => cat.toLowerCase() === value.trim().toLowerCase());
        }
      )
  });

  const handleSubmit = (values, { resetForm }) => {
    addCategory(values.categoryName);
    resetForm();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
      {/* Add Custom Category Form Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '1.15rem' }}>
            <Tags size={20} style={{ color: 'var(--primary)' }} />
            <span>Create Custom Category</span>
          </h3>

          <Formik
            initialValues={{ categoryName: '' }}
            validationSchema={CategorySchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <div className="form-group">
                  <label className="form-label" htmlFor="categoryName">Category Name</label>
                  <Field
                    id="categoryName"
                    name="categoryName"
                    type="text"
                    placeholder="e.g. Office Supplies"
                    className="form-control"
                    style={touched.categoryName && errors.categoryName ? { borderColor: 'var(--danger)' } : {}}
                  />
                  {touched.categoryName && errors.categoryName && (
                    <div className="form-error">
                      <AlertCircle size={14} />
                      <span>{errors.categoryName}</span>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSubmitting}
                  style={{ width: '100%' }}
                >
                  <Plus size={16} />
                  <span>Create Category</span>
                </button>
              </Form>
            )}
          </Formik>
        </div>

        <div className="glass-card" style={{ backgroundColor: 'var(--primary-light)', borderColor: 'rgba(99, 102, 241, 0.15)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>Organize Products</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Creating custom categories allows you to group products according to your business needs. Categories can be selected in the Add/Edit Product form and used as filters.
          </p>
        </div>
      </div>

      {/* Categories List View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Available Categories</h3>
        
        <div className="categories-grid">
          {categories.map(cat => {
            const count = categoryCounts[cat] || 0;
            return (
              <div key={cat} className="glass-card category-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Bookmark size={18} style={{ color: 'var(--primary)' }} />
                  <span className="category-title">{cat}</span>
                </div>
                <span className="category-count">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoriesView;
