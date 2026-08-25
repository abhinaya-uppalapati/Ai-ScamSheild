import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/scan/url", label: "URL Scanner", icon: "🔗" },
  { to: "/scan/email", label: "Email Analyzer", icon: "✉️" },
  { to: "/scan/conversation", label: "Conversation Analyzer", icon: "🧠" },
  { to: "/investigate", label: "Investigate", icon: "🕵️" },
  { to: "/history", label: "Scan History", icon: "📜" },
  { to: "/analytics", label: "Analytics", icon: "📊" },
  { to: "/assistant", label: "AI Assistant", icon: "🤖" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 bg-ink min-h-screen flex flex-col">
      <div className="p-5 border-b border-ink-border flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand"></span>
        </span>
        <h1 className="font-display font-semibold text-lg text-white tracking-tight">
          ScamShield
        </h1>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-ink-soft text-white"
                  : "text-slate-400 hover:bg-ink-soft hover:text-slate-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-brand" />
                )}
                <span>{item.icon}</span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-ink-soft text-white"
                  : "text-slate-400 hover:bg-ink-soft hover:text-slate-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-brand" />
                )}
                <span>👨‍💼</span>
                Admin Panel
              </>
            )}
          </NavLink>
        )}
      </nav>

      <div className="p-3 border-t border-ink-border">
        <p className="text-xs text-slate-500 mb-2 truncate px-2 font-mono">
          {user?.email}
        </p>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-ink-soft hover:text-slate-200 transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}