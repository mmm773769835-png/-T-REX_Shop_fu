import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// Supabase Configuration
// ==========================================
const SUPABASE_URL = 'https://udqnrsrwzifrzseixrcj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcW5yc3J3emlmcnpzZWl4cmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2MjcwMDAsImV4cCI6MjA1MTIwMzAwMH0.cNZtDBzqP3gGDMxJsvcvuA_iYOO-d4e_pG4eR9BD0zI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// Categories List
// ==========================================
const CATEGORIES = [
  'إلكترونيات',
  'ملابس',
  'أحذية',
  'إكسسوارات',
  'منزل',
  'رياضة',
  'صحة وجمال',
  'كتب',
  'ألعاب',
  'طعام',
  'سيارات'
];

// ==========================================
// Main App Component
// ==========================================
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  
  // Form states
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    original_price: '',
    category: CATEGORIES[0],
    description: '',
    image_url: '',
    currency: 'OMR'
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // ==========================================
  // Check Auth Status on Mount
  // ==========================================
  useEffect(() => {
    checkUser();
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Verify admin role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.role === 'admin') {
          setUser(session.user);
        } else {
          await supabase.auth.signOut();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Load Dashboard Data
  // ==========================================
  const loadDashboardData = async () => {
    await Promise.all([
      loadProducts(),
      loadStats()
    ]);
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      setStats({
        totalProducts: productCount || 0,
        totalOrders: 0,
        totalRevenue: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // ==========================================
  // Handle Login
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Verify admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('غير مصرح لك بالدخول كمسؤول');
      }
      
      setUser(data.user);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'خطأ في تسجيل الدخول' });
    }
  };

  // ==========================================
  // Handle Logout
  // ==========================================
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProducts([]);
  };

  // ==========================================
  // Handle Form Input Changes
  // ==========================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ==========================================
  // Add or Update Product
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category: formData.category,
        description: formData.description,
        image_url: formData.image_url || null,
        currency: formData.currency,
        is_new: true,
        rating: 0,
        review_count: 0
      };
      
      if (editingId) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);
        
        if (error) throw error;
        setMessage({ type: 'success', text: '✅ تم تحديث المنتج بنجاح!' });
      } else {
        // Add new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
        setMessage({ type: 'success', text: '✅ تم إضافة المنتج بنجاح!' });
      }
      
      // Reset form and reload
      resetForm();
      loadProducts();
      loadStats();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ' });
    }
  };

  // ==========================================
  // Edit Product
  // ==========================================
  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      original_price: product.original_price || '',
      category: product.category || CATEGORIES[0],
      description: product.description || '',
      image_url: product.image_url || '',
      currency: product.currency || 'OMR'
    });
    window.scrollTo(0, 0);
  };

  // ==========================================
  // Delete Product
  // ==========================================
  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: '✅ تم حذف المنتج بنجاح!' });
      loadProducts();
      loadStats();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ' });
    }
  };

  // ==========================================
  // Reset Form
  // ==========================================
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      original_price: '',
      category: CATEGORIES[0],
      description: '',
      image_url: '',
      currency: 'OMR'
    });
    setMessage({ type: '', text: '' });
  };

  // ==========================================
  // Render Login Screen
  // ==========================================
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="logo">
            <h1>🦖 T-REX Admin</h1>
            <p style={{ color: '#FFD700', marginTop: '10px' }}>لوحة تحكم المتجر</p>
          </div>
          
          {message.type === 'error' && (
            <div className="error-message">{message.text}</div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>كلمة المرور</label>
              <input 
                type="password" 
                name="password" 
                required 
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn-primary">
              تسجيل الدخول
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '0.85rem' }}>
            © 2025 T-REX Shop - للمشرفين فقط
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Render Dashboard
  // ==========================================
  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        <div>
          <h2>🦖 لوحة تحكم T-REX Shop</h2>
          <p className="user-info">المشرف: {user.email}</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          🚪 تسجيل الخروج
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalProducts}</h3>
          <p>📦 إجمالي المنتجات</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalOrders}</h3>
          <p>🛒 الطلبات</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalRevenue}</h3>
          <p>💰 الإيرادات</p>
        </div>
      </div>

      {/* Product Form */}
      <div className="product-form">
        <h3>{editingId ? '✏️ تعديل منتج' : '➕ إضافة منتج جديد'}</h3>
        
        {message.text && (
          <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>اسم المنتج *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name}
                onChange={handleInputChange}
                required 
                placeholder="مثال: iPhone 15 Pro"
              />
            </div>
            <div className="form-group">
              <label>السعر *</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price}
                onChange={handleInputChange}
                required 
                min="0" 
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>السعر الأصلي (للخصم)</label>
              <input 
                type="number" 
                name="original_price" 
                value={formData.original_price}
                onChange={handleInputChange}
                min="0" 
                step="0.01"
                placeholder="اختياري"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>الفئة *</label>
              <select 
                name="category" 
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>العملة</label>
              <select 
                name="currency" 
                value={formData.currency}
                onChange={handleInputChange}
              >
                <option value="OMR">🇴🇲 ريال عماني</option>
                <option value="SAR">🇸🇦 ريال سعودي</option>
                <option value="AED">🇦🇪 درهم إماراتي</option>
                <option value="USD">🇺🇸 دولار أمريكي</option>
              </select>
            </div>
            <div className="form-group">
              <label>رابط الصورة</label>
              <input 
                type="url" 
                name="image_url" 
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>وصف المنتج</label>
            <textarea 
              name="description" 
              value={formData.description}
              onChange={handleInputChange}
              placeholder="وصف تفصيلي للمنتج..."
              rows="3"
            />
          </div>
          
          <button type="submit" className="btn-submit">
            {editingId ? '💾 حفظ التعديلات' : '➕ إضافة المنتج'}
          </button>
          
          {editingId && (
            <button 
              type="button" 
              className="btn-submit btn-cancel" 
              onClick={resetForm}
            >
              ❌ إلغاء
            </button>
          )}
        </form>
      </div>

      {/* Products Table */}
      <div className="products-table">
        <h3>📋 قائمة المنتجات ({products.length})</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>الصورة</th>
                <th>الاسم</th>
                <th>الفئة</th>
                <th>السعر</th>
                <th>العملة</th>
                <th>تاريخ الإضافة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-products">
                    لا توجد منتجات حالياً. أضف منتج جديد!
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td>
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="product-img"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                          }}
                        />
                      ) : (
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          background: '#333', 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666'
                        }}>
          لا صورة
                        </div>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td style={{ color: '#FFD700', fontWeight: 'bold' }}>
                      {product.price}
                    </td>
                    <td>{product.currency || 'OMR'}</td>
                    <td>
                      {new Date(product.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td>
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEdit(product)}
                      >
                        ✏️ تعديل
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(product.id)}
                      >
                        🗑️ حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
