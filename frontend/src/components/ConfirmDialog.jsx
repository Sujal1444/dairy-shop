function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
    if (!isOpen) return null;
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal confirm-box" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">⚠️</div>
        <h2>Confirm Delete</h2>
        <p className="confirm-msg">{message || "Are you sure? This action cannot be undone."}</p>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary btn-del-confirm" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
export default ConfirmDialog;
