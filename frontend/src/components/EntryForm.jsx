import { useState, useEffect } from "react";
import ProductSelector from "./ProductSelector";

const generateBillId = () => {
  const d = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BILL-${d}-${rand}`;
};

const today = new Date().toISOString().split("T")[0];
const nowTime = () => new Date().toTimeString().slice(0, 5);
const emptyRow = () => ({ id: Date.now() + Math.random(), productId: "", quantity: "" });

function BillForm({ bill, products, onSubmit, onClose }) {
  const isEdit = !!bill;
  const [billName, setBillName] = useState("");
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState([emptyRow()]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (bill) {
      setBillName(bill.billName || "");
      setDate(bill.date ? new Date(bill.date).toISOString().split("T")[0] : today);
      setRows(
        bill.items.map((e) => ({
          id: e._id,
          productId: e.productId?._id || e.productId || "",
          quantity: e.quantity,
        }))
      );
    }
  }, [bill]);

  const getProduct = (pid) => products.find((p) => p._id === pid);

  const grandTotal = rows.reduce((sum, r) => {
    const p = getProduct(r.productId);
    return sum + (p ? p.price * (Number(r.quantity) || 0) : 0);
  }, 0);

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  const updateRow = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setErrors((prev) => { const n = { ...prev }; delete n[`${id}_${field}`]; return n; });
  };

  const validate = () => {
    const errs = {};
    if (!billName.trim()) errs.billName = "Bill name is required";
    rows.forEach((r) => {
      if (!r.productId) errs[`${r.id}_productId`] = "Required";
      if (!r.quantity || Number(r.quantity) <= 0) errs[`${r.id}_quantity`] = "Must be > 0";
    });
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    const billId = isEdit ? bill.billId : generateBillId();
    const time = nowTime();
    const entries = rows.map((r) => ({
      productId: r.productId,
      quantity: Number(r.quantity),
      date,
      time,
      billId,
      billName,
    }));
    onSubmit(entries);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Edit Bill" : "Create New Bill"}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Bill Name + Date */}
          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label>Bill Name / Customer *</label>
              <input
                type="text"
                value={billName}
                onChange={(e) => { setBillName(e.target.value); setErrors((p) => ({ ...p, billName: "" })); }}
                placeholder="e.g. Morning Batch, Customer Name"
                className={errors.billName ? "input-err" : ""}
                autoFocus
              />
              {errors.billName && <span className="err-msg">{errors.billName}</span>}
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* Column Headers (Desktop Only) */}
          <div className="bill-prod-header">
            <span style={{ flex: 2.5 }}>Product *</span>
            <span style={{ flex: 1 }}>Qty *</span>
            <span style={{ flex: 1 }}>Unit Price</span>
            <span style={{ flex: 1 }}>Subtotal</span>
            <span style={{ width: 32 }} />
          </div>

          {/* Product Rows / Cards */}
          <div className="bill-prod-list">
            {rows.map((row) => {
              const prod = getProduct(row.productId);
              const sub = prod ? prod.price * (Number(row.quantity) || 0) : 0;
              return (
                <div key={row.id} className="bill-prod-row">
                  {/* Product */}
                  <div style={{ flex: 2.5 }}>
                    <ProductSelector
                      products={products}
                      value={row.productId}
                      onChange={(val) => updateRow(row.id, "productId", val)}
                      error={errors[`${row.id}_productId`]}
                    />
                    {errors[`${row.id}_productId`] && <span className="err-msg">{errors[`${row.id}_productId`]}</span>}
                  </div>

                  {/* Quantity */}
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                      placeholder="Qty"
                      min="0.01"
                      step="0.01"
                      className={`form-input ${errors[`${row.id}_quantity`] ? "input-err" : ""}`}
                    />
                    {errors[`${row.id}_quantity`] && <span className="err-msg">{errors[`${row.id}_quantity`]}</span>}
                  </div>

                  {/* Unit Price */}
                  <div style={{ flex: 1 }}>
                    <div className="price-cell" data-label="Unit Price">
                      {prod ? `₹${prod.price}/${prod.unit}` : "—"}
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div style={{ flex: 1 }}>
                    <div className={`price-cell ${sub > 0 ? "clr-green" : ""}`} data-label="Subtotal">
                      {sub > 0 ? `₹${sub.toFixed(2)}` : "—"}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    className="remove-row-btn"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    title="Remove item"
                  >×</button>
                </div>
              );
            })}
          </div>

          <button type="button" className="btn btn-ghost add-row-btn" style={{ width: "100%", marginTop: 12 }} onClick={addRow}>
            + Add Product
          </button>

          {/* Footer: Grand Total */}
          <div className="bill-form-footer">
            <div className="grand-total-box">
              <span>Grand Total</span>
              <strong>₹{grandTotal.toFixed(2)}</strong>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 16 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? "Update Bill" : `Create Bill (${rows.length} item${rows.length !== 1 ? "s" : ""})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BillForm;
