import { useState, useEffect } from "react";
import { getProducts, createEntry } from "../services/api";
import { useToast } from "../context/ToastContext";

// Color palette cycling through rows — matches the screenshot style
const ROW_COLORS = [
  "#b9f6ca", // green
  "#ffe0b2", // orange
  "#bbdefb", // blue
  "#b3e5fc", // sky blue
  "#d1c4e9", // lavender
  "#fff9c4", // yellow
  "#f8bbd0", // pink
  "#dcedc8", // lime
  "#b2ebf2", // teal
  "#cfd8dc", // blue-grey
  "#ffe082", // amber
  "#d7ccc8", // brown-grey
];

const todayStr = () => new Date().toISOString().split("T")[0];

const CUSTOMER_ID = "3292";

function NewOrder() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(todayStr());
  const { addToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      const prods = res.data.data || [];
      setProducts(prods);
      const init = {};
      prods.forEach((p) => (init[p._id] = 0));
      setQuantities(init);
    } catch {
      addToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (id, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setQuantities((prev) => ({ ...prev, [id]: num }));
  };

  const orderedItems = products.filter((p) => (quantities[p._id] || 0) > 0);
  const totalAmount = orderedItems.reduce(
    (sum, p) => sum + p.price * quantities[p._id],
    0
  );
  const totalQty = orderedItems.reduce((s, p) => s + quantities[p._id], 0);

  const handleReset = () => {
    const init = {};
    products.forEach((p) => (init[p._id] = 0));
    setQuantities(init);
  };

  const handleSubmit = async () => {
    if (orderedItems.length === 0) {
      addToast("Please add at least one product", "error");
      return;
    }
    setSubmitting(true);
    try {
      const billId = `BILL-${Date.now()}`;
      const time = new Date().toTimeString().slice(0, 5);
      const entries = orderedItems.map((p) => ({
        productId: p._id,
        quantity: quantities[p._id],
        billId,
        billName: CUSTOMER_ID,
        date,
        time,
        status: "unpaid",
      }));
      await Promise.all(entries.map((e) => createEntry(e)));
      addToast(`Order placed! (ગ્રાહક નં: ${CUSTOMER_ID})`, "success");
      handleReset();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to place order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="no-page">
      {/* ── Top Header Bar ── */}
      <div className="no-header">
        <div className="no-header-left">
          <span className="no-header-title">નવો ઓર્ડર</span>
          <span className="no-header-sub">New Order</span>
        </div>
        <div className="no-header-right">
          <div className="no-customer-wrap">
            <span className="no-customer-label">ગ્રાહક નં:</span>
            <span className="no-customer-static">{CUSTOMER_ID}</span>
          </div>
          <input
            type="date"
            className="no-date-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* ── Column Labels ── */}
      <div className="no-col-labels">
        <span>Product</span>
        <span>Qty</span>
      </div>

      {/* ── Product List ── */}
      {loading ? (
        <div className="loader" style={{ margin: "40px auto" }}>
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div className="no-empty">
          <span>🧴</span>
          <p>No products yet. Add products first.</p>
        </div>
      ) : (
        <div className="no-list">
          {products.map((p, i) => {
            const bgColor = ROW_COLORS[i % ROW_COLORS.length];
            const qty = quantities[p._id] || 0;
            const isActive = qty > 0;

            return (
              <div
                key={p._id}
                className={`no-row ${isActive ? "no-row-active" : ""}`}
                style={{ background: bgColor }}
              >
                <span className="no-row-name">{p.name}</span>
                <input
                  type="number"
                  min="0"
                  className="no-row-input"
                  value={qty === 0 ? "" : qty}
                  placeholder="0"
                  onChange={(e) => handleQtyChange(p._id, e.target.value)}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer Summary + Actions ── */}
      {!loading && (
        <div className="no-footer">
          <div className="no-footer-summary">
            <div className="no-footer-stat">
              <span>Items</span>
              <strong>{orderedItems.length}</strong>
            </div>
            <div className="no-footer-divider" />
            <div className="no-footer-stat">
              <span>Qty</span>
              <strong>{totalQty}</strong>
            </div>
            <div className="no-footer-divider" />
            <div className="no-footer-stat">
              <span>Total</span>
              <strong className="no-footer-amount">₹{totalAmount.toFixed(2)}</strong>
            </div>
          </div>
          <div className="no-footer-actions">
            <button
              className="no-btn-reset"
              onClick={handleReset}
              disabled={submitting}
              title="Reset all quantities"
            >
              ↺ Reset
            </button>
            <button
              id="place-order-btn"
              className="no-btn-submit"
              onClick={handleSubmit}
              disabled={submitting || orderedItems.length === 0}
            >
              {submitting ? "Saving…" : "✓ Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewOrder;
