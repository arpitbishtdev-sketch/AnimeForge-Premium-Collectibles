import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/Admin.css";
import "../styles/AdminLayout.css";

const BREADCRUMB_MAP = {
  "/admin": ["Dashboard"],
  "/admin/products": ["Catalog", "Products"],
  "/admin/products/add": ["Catalog", "Add Product"],
  "/admin/categories": ["Catalog", "Categories"],
  "/admin/orders": ["Orders"],
  "/admin/customers": ["Customers"],
  "/admin/reviews": ["Customers", "Reviews"],
  "/admin/analytics": ["System", "Analytics"],
  "/admin/settings": ["System", "Settings"],
  "/admin/themes": ["System", "Themes"],
};

function getBreadcrumbs(pathname) {
  return BREADCRUMB_MAP[pathname] ?? ["Admin"];
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const crumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="admin-root">
      {/* Ambient mesh background */}
      <div className="admin-mesh" aria-hidden="true" />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-layout__main">
        {/* Sticky Header */}
        <header className="admin-header">
          <div className="admin-header__left">
            <button
              className="admin-header__hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              ☰
            </button>

            <nav className="admin-header__breadcrumb" aria-label="Breadcrumb">
              {crumbs.map((crumb, i) => (
                <span key={crumb} className="admin-header__breadcrumb-item">
                  {i < crumbs.length - 1 ? (
                    <>
                      <span>{crumb}</span>
                      <span>›</span>
                    </>
                  ) : (
                    <span className="admin-header__breadcrumb-current">
                      {crumb}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          </div>

          <div className="admin-header__right">
            <div
              className="admin-header__status-dot"
              title="API Connected"
              aria-label="API Connected"
            />
            <button
              className="admin-header__action-btn"
              title="Notifications"
              aria-label="Notifications"
            >
              🔔
            </button>
            <button
              className="admin-header__action-btn"
              title="Settings"
              aria-label="Settings"
            >
              ⚙
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
