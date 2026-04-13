import { useState, useEffect } from "react";

const UNITS = [
  "0.17 Litre",
  "0.2 Litre",
  "0.25 Litre",
  "0.48 Litre",
  "0.5 Litre",
  "1 Litre",
  "6 Litre",
  "0.4 kg",
  "5 kg",
  "kg",
  "packet",
  "piece",
];
const CATS = [
  "Milk",
  "Milk Products",
  "Buttermilk",
  "Curd",
  "Lassi",
  "Fermented",
  "Cheese",
  "Spreads",
  "General",
];

function ProductForm({ product, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    unit: "0.5 Litre",
    category: "General",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product)
      setForm({
        name: product.name,
        price: product.price,
        unit: product.unit,
        category: product.category,
      });
  }, [product]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = "Valid price required";
    return e;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    
    const data = { 
      name: form.name.trim(), 
      price: Number(form.price), 
      unit: form.unit,
      category: form.category
    };
    
    onSubmit(data);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? "Edit Product" : "Add Product"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Full Cream Milk"
              className={errors.name ? "input-err" : ""}
            />
            {errors.name && <span className="err-msg">{errors.name}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={errors.price ? "input-err" : ""}
              />
              {errors.price && <span className="err-msg">{errors.price}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Unit</label>
              <select name="unit" value={form.unit} onChange={handleChange}>
                {UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {product ? "Update" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ProductForm;
