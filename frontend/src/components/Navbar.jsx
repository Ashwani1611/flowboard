import { useAuth } from "../context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";

const NAV_LINKS = [
  { path: "/dashboard",      label: "Board" },
  { path: "/analytics",      label: "Analytics" },
  { path: "/priority-queue", label: "Priority Queue" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="border-b border-surface-border bg-surface-card px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-md flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs font-mono">FB</span>
          </div>
          <span className="font-bold text-sm tracking-tight">FlowBoard</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                location.pathname === link.path
                  ? "bg-brand-500/15 text-brand-500 font-medium"
                  : "text-gray-400 hover:text-white hover:bg-surface-border"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop user */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {user?.first_name} {user?.last_name}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white
                       hover:bg-surface-border px-3 py-1.5 rounded-md transition-colors"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-1.5 text-gray-400 hover:text-white"
          onClick={() => setMenuOpen((p) => !p)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden mt-3 pb-2 border-t border-surface-border pt-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm px-3 py-2 rounded-md transition-colors ${
                location.pathname === link.path
                  ? "bg-brand-500/15 text-brand-500 font-medium"
                  : "text-gray-400 hover:text-white hover:bg-surface-border"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-2 w-full"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}