import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Entries from "./pages/Entries";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

const MainLayout = ({ isNavOpen, setIsNavOpen }) => {
  const toggleNav = () => setIsNavOpen(!isNavOpen);
  const closeNav = () => setIsNavOpen(false);

  return (
    <div className="layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="brand" style={{ border: "none", margin: 0, padding: 0 }}>
          <div className="brand-icon" style={{ width: 34, height: 34, fontSize: 16 }}>🥛</div>
          <div className="brand-name" style={{ fontSize: 13, letterSpacing: -0.2 }}>DairyPro</div>
        </div>
        <button className="menu-toggle" onClick={toggleNav}>
          {isNavOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile Overlay */}
      <div className={`mobile-overlay ${isNavOpen ? "open" : ""}`} onClick={closeNav} />

      <Navbar isOpen={isNavOpen} onClose={closeNav} />
      
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/bills" element={<Entries />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toast />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
