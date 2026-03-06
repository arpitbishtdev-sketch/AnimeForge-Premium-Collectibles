import { NavLink, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";

const NAV_ITEMS = [
  {
    section: "Overview",
    items: [
      { to: "/admin", icon: "⬡", label: "Dashboard" },
      { to: "/admin/orders", icon: "📦", label: "Orders", badge: "12" },
    ],
  },
  {
    section: "Catalog",
    items: [
      { to: "/admin/products", icon: "🎴", label: "Products" },
      { to: "/admin/products/add", icon: "+", label: "Add Product" },
      { to: "/admin/categories", icon: "⊞", label: "Categories" },
    ],
  },
  {
    section: "Customers",
    items: [
      { to: "/admin/customers", icon: "◎", label: "Customers" },
      { to: "/admin/reviews", icon: "✦", label: "Reviews" },
    ],
  },
  {
    section: "System",
    items: [
      { to: "/admin/analytics", icon: "▣", label: "Analytics" },
      { to: "/admin/settings", icon: "⚙", label: "Settings" },
      { to: "/admin/status", icon: "◈", label: "Status Colors" },
      { to: "/admin/themes", icon: "🎨", label: "Themes" },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      <div
        className={`sidebar__overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`} role="navigation">
        {/* Logo */}
        <NavLink to="/admin" className="sidebar__logo" onClick={onClose}>
          <div className="sidebar__logo-icon">⚡</div>
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-title">AniStore</span>
            <span className="sidebar__logo-sub">Admin Panel</span>
          </div>
        </NavLink>

        <div className="glow-divider" />

        {/* Navigation */}
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ section, items }) => (
            <div key={section}>
              <p className="sidebar__section-label">{section}</p>
              {items.map(({ to, icon, label, badge }) => {
                const isActive =
                  to === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(to);

                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={`sidebar__nav-item ${isActive ? "active" : ""}`}
                    onClick={onClose}
                    end={to === "/admin"}
                  >
                    <span className="sidebar__nav-icon">{icon}</span>
                    <span>{label}</span>
                    {badge && (
                      <span className="sidebar__nav-badge">{badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="glow-divider" />
        <footer className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">👤</div>
            <div>
              <p className="sidebar__user-name">Admin</p>
              <p className="sidebar__user-role">Super Admin</p>
            </div>
          </div>
        </footer>
      </aside>
    </>
  );
}
