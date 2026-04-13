import { useState, useEffect } from "react";
import { getProducts, createEntry } from "../services/api";
import { useToast } from "../context/ToastContext";

const ROW_COLORS = [
  "#b9f6ca",
  "#ffe0b2",
  "#bbdefb",
  "#b3e5fc",
  "#d1c4e9",
  "#fff9c4",
  "#f8bbd0",
  "#dcedc8",
  "#b2ebf2",
  "#cfd8dc",
  "#ffe082",
  "#d7ccc8",
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
      prods.forEach((p) => {
        init[p._id] = 0;
      });
      setQuantities(init);
    } catch {
      addToast("પ્રોડક્ટ્સ લોડ કરવામાં સમસ્યા આવી", "error");
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
  const totalQty = orderedItems.reduce((sum, p) => sum + quantities[p._id], 0);

  const handleReset = () => {
    const init = {};
    products.forEach((p) => {
      init[p._id] = 0;
    });
    setQuantities(init);
  };

  const handleSubmit = async () => {
    if (orderedItems.length === 0) {
      addToast("ઓછામાં ઓછો એક પ્રોડક્ટ ઉમેરો", "error");
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
      addToast(`ઓર્ડર સચવાયો! (ગ્રાહક નં: ${CUSTOMER_ID})`, "success");
      handleReset();
    } catch (err) {
      addToast(err.response?.data?.message || "ઓર્ડર સચવવામાં સમસ્યા આવી", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="no-page">
      <div className="no-header">
        <div className="no-header-left">
          <span className="no-header-title">નવો ઓર્ડર</span>
          <span className="no-header-sub">ઓર્ડર નોંધ</span>
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

      <div className="no-col-labels">
        <span>વિગત</span>
        <span>જથ્થો</span>
      </div>

      {loading ? (
        <div className="loader" style={{ margin: "40px auto" }}>
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div className="no-empty">
          <span>દૂધ</span>
          <p>હજુ સુધી કોઈ પ્રોડક્ટ નથી. પહેલા પ્રોડક્ટ ઉમેરો.</p>
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
              <span>આઇટમ</span>
              <strong>{orderedItems.length}</strong>
            </div>
            <div className="no-footer-divider" />
            <div className="no-footer-stat">
              <span>જથ્થો</span>
              <strong>{totalQty}</strong>
            </div>
            <div className="no-footer-divider" />
            <div className="no-footer-stat">
              <span>કુલ</span>
              <strong className="no-footer-amount">₹{totalAmount.toFixed(2)}</strong>
            </div>
          </div>
          <div className="no-footer-actions">
            <button
              className="no-btn-reset"
              onClick={handleReset}
              disabled={submitting}
              title="બધા જથ્થા સાફ કરો"
            >
              ↺ સાફ કરો
            </button>
            <button
              id="place-order-btn"
              className="no-btn-submit"
              onClick={handleSubmit}
              disabled={submitting || orderedItems.length === 0}
            >
              {submitting ? "સચવાઈ રહ્યું છે..." : "✓ ઓર્ડર મૂકો"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewOrder;
