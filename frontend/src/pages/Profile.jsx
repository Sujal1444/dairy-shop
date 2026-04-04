import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, updateProfile, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    dairyName: "",
    email: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      dairyName: user.dairyName || "",
      email: user.email || "",
      password: "",
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const result = await updateProfile({
      name: form.name,
      dairyName: form.dairyName,
      email: form.email,
      password: form.password,
    });

    if (result.ok) {
      setForm((current) => ({ ...current, password: "" }));
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const success = await deleteAccount();
    setDeleting(false);
    setShowDeleteDialog(false);

    if (success) {
      navigate("/signup");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ flex: 1 }}>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-sub">Update your account details and dairy information</p>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost" style={{ gap: '10px' }}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      <div className="profile-layout">
        <section className="card profile-card">
          <div className="profile-card-head">
            <div>
              <h2>Account Information</h2>
              <p>Edit name, dairy name, email, or set a new password.</p>
            </div>
            <div className="badge">Live Account</div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>Owner Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Owner name"
                />
              </div>
              <div className="form-group">
                <label>Dairy Name</label>
                <input
                  type="text"
                  name="dairyName"
                  value={form.dairyName}
                  onChange={handleChange}
                  required
                  placeholder="Dairy name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@domain.com"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  placeholder="Leave blank to keep current password"
                />
              </div>
            </div>

            <div className="profile-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        <section className="card profile-card danger-card">
          <div className="profile-card-head">
            <div>
              <h2>Danger Zone</h2>
              <p>Delete your account and remove your saved dairy data.</p>
            </div>
          </div>

          <div className="danger-copy">
            This permanently deletes your account, products, and bills. This action cannot be undone.
          </div>

          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
        </section>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        message="Delete your account and all dairy records permanently?"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

export default Profile;
