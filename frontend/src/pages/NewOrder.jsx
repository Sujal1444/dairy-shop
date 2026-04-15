import { useEffect, useRef, useState } from "react";
import { getProducts, createEntry } from "../services/api";
import { useToast } from "../context/ToastContext";

const ROW_COLORS = [
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#06b6d4",
  "#8b5cf6",
  "#eab308",
  "#ec4899",
  "#84cc16",
  "#14b8a6",
  "#94a3b8",
  "#f97316",
  "#a16207",
];

const todayStr = () => new Date().toISOString().split("T")[0];
const formatOrderDate = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const CUSTOMER_ID = "3292";

function NewOrder() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(todayStr());
  const dateInputRef = useRef(null);
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
      prods.forEach((p) => {
        init[p._id] = 0;
      });
      setQuantities(init);
    } catch {
      addToast("Error loading products", "error");
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
    0,
  );
  const totalQty = orderedItems.reduce((sum, p) => sum + quantities[p._id], 0);

  const handleReset = () => {
    const init = {};
    products.forEach((p) => {
      init[p._id] = 0;
    });
    setQuantities(init);
  };

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;

    input.focus();
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
    input.click();
  };

  const handleSubmit = async () => {
    if (orderedItems.length === 0) {
      addToast("Add at least one product", "error");
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

      await Promise.all(entries.map((entry) => createEntry(entry)));
      addToast(`Order saved! (Customer No: ${CUSTOMER_ID})`, "success");
      handleReset();
    } catch (err) {
      addToast(err.response?.data?.message || "Error saving order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="no-page">
      <div className="no-header">
        <div className="no-header-left">
          <span className="no-header-kicker">Order Desk</span>
          <span className="no-header-title">New Order</span>
          <span className="no-header-sub">
            Build the order, review totals, and save the bill in one clean flow.
          </span>
        </div>

        <div className="no-header-right">
          <div className="no-header-card">
            <span className="no-header-card-label">Customer</span>
            <strong>#{CUSTOMER_ID}</strong>
          </div>

          <label
            className="no-header-card no-header-card-date"
            onClick={openDatePicker}
          >
            <span className="no-header-card-label">Delivery Date</span>
            <strong>{formatOrderDate(date)}</strong>
            <input
              ref={dateInputRef}
              type="date"
              className="no-date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="no-summary-grid">
        <div className="no-summary-card">
          <span className="no-summary-label">Products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="no-summary-card">
          <span className="no-summary-label">Selected Items</span>
          <strong>{orderedItems.length}</strong>
        </div>
        <div className="no-summary-card">
          <span className="no-summary-label">Total Quantity</span>
          <strong>{totalQty}</strong>
        </div>
        <div className="no-summary-card no-summary-card-highlight">
          <span className="no-summary-label">Order Value</span>
          <strong>Rs {totalAmount.toFixed(2)}</strong>
        </div>
      </div>

      <div className="no-list-head">
        <div>
          <span className="no-list-kicker">Product Selection</span>
          <h2>Choose quantities</h2>
        </div>
        <span className="no-list-caption">Tap plus or minus, or type a number directly.</span>
      </div>

      {loading ? (
        <div className="loader" style={{ margin: "40px auto" }}>
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div className="no-empty">
          <span>Products</span>
          <p>No products yet. Please add products first.</p>
        </div>
      ) : (
        <div className="no-list">
          {products.map((p, i) => {
            const accent = ROW_COLORS[i % ROW_COLORS.length];
            const qty = quantities[p._id] || 0;
            const isActive = qty > 0;

            return (
              <div
                key={p._id}
                className={`no-row ${isActive ? "no-row-active" : ""}`}
                style={{
                  "--row-accent": accent,
                  "--row-accent-soft": `${accent}22`,
                }}
              >
                <div className="no-row-main">
                  <div className="no-row-swatch" />
                  <div className="no-row-copy">
                    <span className="no-row-name">{p.name}</span>
                    <div className="no-row-meta">
                      <span>{p.unit}</span>
                      <span>Rs {p.price.toFixed(2)} each</span>
                      {qty > 0 && <span>Line total Rs {(p.price * qty).toFixed(2)}</span>}
                    </div>
                  </div>
                </div>

                <div className="qty-control-group">
                  <button
                    className="qty-btn"
                    onClick={() => handleQtyChange(p._id, qty - 1)}
                    disabled={qty <= 0}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    className="no-row-input"
                    value={qty === 0 ? "" : qty}
                    placeholder="0"
                    onChange={(e) => handleQtyChange(p._id, e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    className="qty-btn"
                    onClick={() => handleQtyChange(p._id, qty + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && (
        <div className="no-footer">
          <div className="no-footer-summary">
            <div className="no-footer-stat">
              <span>Items</span>
              <strong>{orderedItems.length}</strong>
            </div>
            <div className="no-footer-divider" />
            <div className="no-footer-stat">
              <span>Quantity</span>
              <strong>{totalQty}</strong>
            </div>
            <div className="no-footer-divider" />
            <div className="no-footer-stat">
              <span>Total</span>
              <strong className="no-footer-amount">Rs {totalAmount.toFixed(2)}</strong>
            </div>
          </div>
          <div className="no-footer-actions">
            <button
              className="no-btn-reset"
              onClick={handleReset}
              disabled={submitting}
              title="Clear all quantities"
            >
              Clear
            </button>
            <button
              id="place-order-btn"
              className="no-btn-submit"
              onClick={handleSubmit}
              disabled={submitting || orderedItems.length === 0}
            >
              {submitting ? "Saving..." : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewOrder;
