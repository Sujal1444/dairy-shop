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

  // Group entries by billId into bill objects
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
  const paidBills = useMemo(() => allBills.filter((b) => b.status === "paid"), [allBills]);

  const totalRevenue = useMemo(() => allBills.reduce((s, b) => s + b.total, 0), [allBills]);

  const handleSubmit = async (newEntries) => {
    try {
      if (editBill) {
        await Promise.all(editBill.items.map((e) => deleteEntry(e._id)));
      }
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
      const name = item.productId?.name || "Item";
      const unit = item.productId?.unit || "";
      const price = item.productId?.price || 0;
      const qty = item.quantity;
      const sub = (price * qty).toFixed(2);
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
      download: `Bill_${(bill.billName || "Customer").replace(/\s+/g, '_')}_${bill.billId.substring(0,8)}.txt` 
    });
    a.click();
    addToast(`Bill downloaded successfully!`);
  };

  const exportCSV = () => {
    const rows = [
      ["Bill ID", "Bill Name", "Status", "Time", "Product", "Qty", "Price", "Subtotal"],
      ...entries.map((e) => [
        e.billId, e.billName, e.status, e.time, e.productId?.name, e.quantity, e.productId?.price,
        (e.productId?.price * e.quantity).toFixed(2)
      ]),
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `bills-${date}.csv` });
    a.click();
  };

  const BillTable = ({ billsList, title }) => (
    <>
      <div className="bill-section-header">
        <h2>{title} ({billsList.length})</h2>
        <div className="bill-section-line" />
      </div>
      <div className="card">
        {billsList.length === 0 ? (
          <div className="empty-state">
            <p>No {title.toLowerCase()} for today.</p>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th className="desktop-only" style={{ width: 36 }} />
                <th>Bill Name</th>
                <th className="desktop-only">Bill ID</th>
                <th>Time</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {billsList.map((bill) => (
                <>
                  <tr
                    key={bill.billId}
                    className={`bill-row ${expandedBill === bill.billId ? "bill-row-open" : ""}`}
                    onClick={() => setExpandedBill(expandedBill === bill.billId ? null : bill.billId)}
                  >
                    <td className="desktop-only">
                      <span className={`expand-arr ${expandedBill === bill.billId ? "open" : ""}`}>▶</span>
                    </td>
                    <td data-label="Bill Name"><strong>{bill.billName}</strong></td>
                    <td className="desktop-only" data-label="Bill ID"><span className="bill-id-badge">{bill.billId}</span></td>
                    <td className="clr-muted" data-label="Time">{bill.time}</td>
                    <td data-label="Total"><strong className="clr-green">₹{bill.total.toFixed(2)}</strong></td>
                    <td data-label="Status">
                      <span className={`status-badge status-${bill.status}`}>
                        {bill.status === "paid" ? "✓ Paid" : "⚠ Unpaid"}
                      </span>
                    </td>
                    <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                      <div className="actions">
                        <button
                          className={`icon-btn ${bill.status === "paid" ? "edit" : "success"}`}
                          title={bill.status === "paid" ? "Mark as Unpaid" : "Mark as Paid"}
                          onClick={() => handleToggleStatus(bill.billId, bill.status)}
                          style={{ color: bill.status === "paid" ? "var(--txt2)" : "var(--green)" }}
                        >
                          {bill.status === "paid" ? "↩" : "✓"}
                        </button>
                        <button className="icon-btn edit" title="Download Receipt" onClick={(e) => { e.stopPropagation(); downloadBillReceipt(bill); }}>📥</button>
                        <button className="icon-btn edit" title="Edit Bill" onClick={(e) => { e.stopPropagation(); setEditBill(bill); setShowForm(true); }}>✏️</button>
                        <button className="icon-btn del" onClick={() => setDeleteBillId(bill.billId)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                  {expandedBill === bill.billId && (
                    <tr key={bill.billId + "-exp"} className="bill-detail-row">
                      <td colSpan={7}>
                        <div className="bill-detail">
                          <table className="bill-inner-tbl">
                            <thead>
                              <tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                            </thead>
                            <tbody>
                              {bill.items.map((item) => (
                                <tr key={item._id}>
                                  <td><strong>{item.productId?.name}</strong></td>
                                  <td>{item.quantity} {item.productId?.unit}</td>
                                  <td>₹{item.productId?.price}</td>
                                  <td className="clr-green">₹{(item.productId?.price * item.quantity).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bills</h1>
          <p className="page-sub">Manage your dairy shop sales</p>
        </div>
        <div className="header-right">
          <div className="date-filter">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button className="btn btn-ghost" onClick={exportCSV}>📥 Export</button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create Bill</button>
        </div>
      </div>

      {!loading && (
        <div className="bills-summary">
          <div className="bill-stat"><span>Pending</span><strong>{pendingBills.length}</strong></div>
          <div className="bill-stat"><span>Paid</span><strong>{paidBills.length}</strong></div>
          <div className="bill-stat"><span>Today's Total</span><strong className="clr-green">₹{totalRevenue.toFixed(2)}</strong></div>
        </div>
      )}

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : (
        <>
          <BillTable billsList={pendingBills} title="Pending Bills" />
          
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <button 
              className={`paid-toggle-btn ${showPastBills ? 'active' : ''}`}
              onClick={() => setShowPastBills(!showPastBills)}
            >
              {showPastBills ? "Hide Past Bills" : `Show Past Bills (${paidBills.length})`}
            </button>
          </div>

          {showPastBills && (
            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              <BillTable billsList={paidBills} title="Past Bills" />
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
