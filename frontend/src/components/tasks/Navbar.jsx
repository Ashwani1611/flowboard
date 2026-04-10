import { useAuth } from "../context/AuthContext";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const NAV_LINKS = [
  { path: "/dashboard",  label: "Board" },
  { path: "/analytics",  label: "Analytics" },
  { path: "/priority-queue", label: "Priority Queue" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="border-b border-surface-border bg-surface-card px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs font-mono">FB</span>
          </div>
          <span className="font-bold text-sm tracking-tight">FlowBoard</span>
        </div>

        {/* Nav links */}
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
      </div>

      {/* User */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 hidden sm:block">
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
    </nav>
  );
}