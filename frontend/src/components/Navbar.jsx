import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/", icon: "📊", label: "Dashboard" },
  { to: "/products", icon: "🧴", label: "Products" },
  { to: "/bills", icon: "🧾", label: "Bills" },
];

function Navbar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <nav className={`navbar${isOpen ? " open" : ""}`}>
      <div className="brand">
        <div className="brand-icon">🥛</div>
        <div className="brand-info">
          <div className="brand-name">DairyPro</div>
          <div className="brand-sub">Shop Manager</div>
        </div>
      </div>
      
      <ul className="nav-list">
        {NAV.map(({ to, icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
        <li style={{ marginTop: 'auto' }}>
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none' }}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </li>
      </ul>

      <div className="nav-footer">
        <span className="status-dot" />
        <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {user ? user.name : 'System Online'}
        </span>
      </div>
    </nav>
  );
}
export default Navbar;
