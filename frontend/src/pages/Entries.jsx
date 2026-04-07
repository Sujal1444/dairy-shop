import { useState, useEffect, useMemo } from "react";
import { getEntries, createEntry, deleteEntry, getProducts, updateBillStatus } from "../services/api";
import BillForm from "../components/EntryForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";

const todayStr = () => new Date().toISOString().split("T")[0];

function Bills() {
  const [date, setDate] = useState(todayStr());
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [deleteBillId, setDeleteBillId] = useState(null);
  const [expandedBill, setExpandedBill] = useState(null);
  const [showPastBills, setShowPastBills] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { fetchEntries(); }, [date]);

  const fetchProducts = async () => {
    try { setProducts((await getProducts()).data.data || []); } catch {}
  };

  const fetchEntries = async () => {
    setLoading(true);
    try { setEntries((await getEntries(date)).data.data || []); }
    catch { addToast("Failed to load bills", "error"); }
    finally { setLoading(false); }
  };

  const allBills = useMemo(() => {
    const map = {};
    entries.forEach((e) => {
      const bid = e.billId || e._id;
      if (!map[bid]) {
        map[bid] = {
          billId: bid,
          billName: e.billName || e.customerName || "Unnamed Bill",
          date: e.date,
          time: e.time,
          status: e.status || "unpaid",
          items: [],
          total: 0,
        };
      }
      map[bid].items.push(e);
      map[bid].total += (e.productId?.price || 0) * e.quantity;
    });
    return Object.values(map).sort((a, b) => (b.time || "").localeCompare(a.time || ""));
  }, [entries]);

  const pendingBills = useMemo(() => allBills.filter((b) => b.status === "unpaid"), [allBills]);
  const paidBills   = useMemo(() => allBills.filter((b) => b.status === "paid"),   [allBills]);
  const totalRevenue = useMemo(() => allBills.reduce((s, b) => s + b.total, 0), [allBills]);

  const handleSubmit = async (newEntries) => {
    try {
      if (editBill) await Promise.all(editBill.items.map((e) => deleteEntry(e._id)));
      await Promise.all(newEntries.map((e) => createEntry(e)));
      addToast(editBill ? "Bill updated!" : "Bill created!");
      setShowForm(false);
      setEditBill(null);
      fetchEntries();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save bill", "error");
    }
  };

  const handleDeleteBill = async () => {
    const toDelete = entries.filter((e) => (e.billId || e._id) === deleteBillId);
    try {
      await Promise.all(toDelete.map((e) => deleteEntry(e._id)));
      addToast("Bill deleted");
      setDeleteBillId(null);
      fetchEntries();
    } catch {
      addToast("Failed to delete bill", "error");
    }
  };

  const handleToggleStatus = async (billId, currentStatus) => {
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid";
    try {
      await updateBillStatus(billId, newStatus);
      addToast(`Bill marked as ${newStatus}`);
      fetchEntries();
    } catch {
      addToast("Failed to update status", "error");
    }
  };

  const downloadBillReceipt = (bill) => {
    let text = `========================\r\n`;
    text += `       DAIRYPRO         \r\n`;
    text += `========================\r\n`;
    text += `Bill: ${bill.billName || "Customer"}\r\n`;
    text += `Date: ${date}  Time: ${bill.time}\r\n`;
    text += `------------------------\r\n`;
    bill.items.forEach((item) => {
      const name  = item.productId?.name || "Item";
      const unit  = item.productId?.unit || "";
      const price = item.productId?.price || 0;
      const qty   = item.quantity;
      const sub   = (price * qty).toFixed(2);
      text += `${name.substring(0, 15).padEnd(15)} ${qty}${unit}  ₹${sub}\r\n`;
    });
    text += `------------------------\r\n`;
    text += `TOTAL:            ₹${bill.total.toFixed(2)}\r\n`;
    text += `STATUS:           ${bill.status === "paid" ? "PAID" : "UNPAID"}\r\n`;
    text += `========================\r\n`;
    text += `      Thank You!        \r\n`;
    const blob = new Blob([text], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `Bill_${(bill.billName || "Customer").replace(/\s+/g, "_")}_${bill.billId.substring(0, 8)}.txt`,
    });
    a.click();
    addToast("Bill downloaded successfully!");
  };

  const exportCSV = () => {
    const rows = [
      ["Bill ID", "Bill Name", "Status", "Time", "Product", "Qty", "Price", "Subtotal"],
      ...entries.map((e) => [
        e.billId, e.billName, e.status, e.time, e.productId?.name, e.quantity,
        e.productId?.price, (e.productId?.price * e.quantity).toFixed(2),
      ]),
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `bills-${date}.csv`,
    });
    a.click();
  };

  /* ─── Bill Card Component ─────────────────────── */
  const BillCard = ({ bill }) => {
    const isExpanded = expandedBill === bill.billId;
    const isPaid = bill.status === "paid";
    return (
      <div className={`bill-card ${isPaid ? "bill-card-paid" : "bill-card-unpaid"} ${isExpanded ? "bill-card-open" : ""}`}>
        {/* Card Header — clickable to expand */}
        <div className="bill-card-head" onClick={() => setExpandedBill(isExpanded ? null : bill.billId)}>
          <div className="bill-card-left">
            <div className={`bill-avatar ${isPaid ? "bill-avatar-paid" : "bill-avatar-unpaid"}`}>
              {bill.billName.charAt(0).toUpperCase()}
            </div>
            <div className="bill-card-info">
              <div className="bill-card-name">{bill.billName}</div>
              <div className="bill-card-meta">
                <span className="bill-meta-time">🕐 {bill.time}</span>
                <span className="bill-meta-items">{bill.items.length} item{bill.items.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
          <div className="bill-card-right">
            <div className="bill-card-total">₹{bill.total.toFixed(2)}</div>
            <span className={`status-badge status-${bill.status}`}>
              {isPaid ? "✓ Paid" : "⚠ Unpaid"}
            </span>
          </div>
          <div className={`bill-card-chevron ${isExpanded ? "open" : ""}`}>›</div>
        </div>

        {/* Expanded item details */}
        {isExpanded && (
          <div className="bill-card-body">
            <div className="bill-items-list">
              {bill.items.map((item) => (
                <div className="bill-item-row" key={item._id}>
                  <div className="bill-item-name">{item.productId?.name}</div>
                  <div className="bill-item-detail">
                    <span className="bill-item-qty">{item.quantity} {item.productId?.unit}</span>
                    <span className="bill-item-x">×</span>
                    <span className="bill-item-price">₹{item.productId?.price}</span>
                    <span className="bill-item-sub">= ₹{(item.productId?.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bill-card-total-row">
              <span>Total</span>
              <span className="bill-grand-total">₹{bill.total.toFixed(2)}</span>
            </div>
            {/* Action buttons */}
            <div className="bill-card-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className={`bill-action-btn ${isPaid ? "bill-act-warn" : "bill-act-success"}`}
                onClick={() => handleToggleStatus(bill.billId, bill.status)}
              >
                {isPaid ? "↩ Unmark" : "✓ Mark Paid"}
              </button>
              <button
                className="bill-action-btn bill-act-neutral"
                onClick={() => downloadBillReceipt(bill)}
              >
                📥 Receipt
              </button>
              <button
                className="bill-action-btn bill-act-neutral"
                onClick={() => { setEditBill(bill); setShowForm(true); }}
              >
                ✏️ Edit
              </button>
              <button
                className="bill-action-btn bill-act-danger"
                onClick={() => setDeleteBillId(bill.billId)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ─── Bill Section ────────────────────────────── */
  const BillSection = ({ billsList, title, icon, emptyMsg }) => (
    <>
      <h2 className="section-title">{icon} {title} <span className="section-count">{billsList.length}</span></h2>
      {billsList.length === 0 ? (
        <div className="bills-empty">
          <div className="bills-empty-icon">🧾</div>
          <p>{emptyMsg}</p>
        </div>
      ) : (
        <div className="bills-list">
          {billsList.map((bill) => <BillCard key={bill.billId} bill={bill} />)}
        </div>
      )}
    </>
  );

  return (
    <div className="page">
      {/* ─── Header ─────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bills</h1>
          <p className="page-sub">Manage your dairy shop sales</p>
        </div>
        <div className="header-right">
          <div className="date-filter">
            <label htmlFor="bills-date">📅</label>
            <input id="bills-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button className="btn btn-ghost" onClick={exportCSV}>📥 Export</button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create Bill</button>
        </div>
      </div>

      {/* ─── Summary Pills ───────────────────────── */}
      {!loading && (
        <div className="bills-summary-row">
          <div className="bill-pill bill-pill-warn">
            <span className="bill-pill-icon">⚠</span>
            <div>
              <div className="bill-pill-val">{pendingBills.length}</div>
              <div className="bill-pill-label">Pending</div>
            </div>
          </div>
          <div className="bill-pill bill-pill-success">
            <span className="bill-pill-icon">✓</span>
            <div>
              <div className="bill-pill-val">{paidBills.length}</div>
              <div className="bill-pill-label">Paid</div>
            </div>
          </div>
          <div className="bill-pill bill-pill-total">
            <span className="bill-pill-icon">₹</span>
            <div>
              <div className="bill-pill-val">₹{totalRevenue.toFixed(2)}</div>
              <div className="bill-pill-label">Today's Total</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Content ─────────────────────────────── */}
      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : (
        <>
          <BillSection
            billsList={pendingBills}
            title="Pending Bills"
            icon="⚠"
            emptyMsg="No pending bills for today."
          />

          <div className="bills-past-toggle">
            <button
              className={`paid-toggle-btn ${showPastBills ? "active" : ""}`}
              onClick={() => setShowPastBills(!showPastBills)}
            >
              {showPastBills ? "▲ Hide Paid Bills" : `▼ Show Paid Bills (${paidBills.length})`}
            </button>
          </div>

          {showPastBills && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <BillSection
                billsList={paidBills}
                title="Paid Bills"
                icon="✓"
                emptyMsg="No paid bills for today."
              />
            </div>
          )}
        </>
      )}

      {showForm && (
        <BillForm
          bill={editBill}
          products={products}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditBill(null); }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteBillId}
        message="Delete this entire bill?"
        onConfirm={handleDeleteBill}
        onCancel={() => setDeleteBillId(null)}
      />
    </div>
  );
}

export default Bills;
