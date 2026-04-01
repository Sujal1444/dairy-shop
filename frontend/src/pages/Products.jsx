import { useState, useEffect } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/api";
import ProductForm from "../components/ProductForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      setProducts((await getProducts()).data.data || []);
    } catch {
      addToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editItem) {
        await updateProduct(editItem._id, data);
        addToast("Product updated!");
      } else {
        await createProduct(data);
        addToast("Product added!");
      }
      setShowForm(false);
      setEditItem(null);
      fetchProducts();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to save product",
        "error",
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteId);
      addToast("Product deleted");
      setDeleteId(null);
      fetchProducts();
    } catch {
      addToast("Failed to delete", "error");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-sub">Manage your dairy product catalog</p>
        </div>
        <button
          id="add-product-btn"
          className="btn btn-primary"
          onClick={() => {
            setEditItem(null);
            setShowForm(true);
          }}
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="loader">
          <div className="spinner" />
        </div>
      ) : (
        <div className="card">
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧴</div>
              <p>No products yet. Add your first dairy product!</p>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th className="desktop-only">#</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Unit</th>
                  <th className="desktop-only">Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p._id}>
                    <td className="desktop-only" data-label="#">{i + 1}</td>
                    <td data-label="Name">
                      <strong>{p.name}</strong>
                    </td>
                    <td className="clr-green" data-label="Price">₹{p.price}</td>
                    <td data-label="Unit">
                      <span className="badge">{p.unit}</span>
                    </td>
                    <td className="desktop-only clr-muted" data-label="Category">{p.category}</td>
                    <td data-label="Actions">
                      <div className="actions">
                        <button
                          id={`edit-product-${p._id}`}
                          className="icon-btn edit"
                          onClick={() => {
                            setEditItem(p);
                            setShowForm(true);
                          }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          id={`del-product-${p._id}`}
                          className="icon-btn del"
                          onClick={() => setDeleteId(p._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editItem}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditItem(null);
          }}
        />
      )}
      <ConfirmDialog
        isOpen={!!deleteId}
        message="This will permanently delete this product."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
export default Products;
