import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/DashboardHome.css";

const STATS = [
  {
    icon: "🎴",
    value: "—",
    label: "Total Products",
    delta: "+8%",
    key: "products",
    color: "rgba(124,92,252,0.2)",
  },
  {
    icon: "📦",
    value: "24",
    label: "Pending Orders",
    delta: "+3",
    key: "orders",
    color: "rgba(245,158,11,0.2)",
  },
  {
    icon: "👥",
    value: "1,284",
    label: "Total Customers",
    delta: "+12%",
    key: "customers",
    color: "rgba(52,211,153,0.2)",
  },
  {
    icon: "💹",
    value: "₹4.2L",
    label: "Monthly Revenue",
    delta: "+22%",
    key: "revenue",
    color: "rgba(224,64,251,0.2)",
  },
];

const ACTIVITY = [
  {
    color: "#7c5cfc",
    text: (
      <>
        <strong>New order #1042</strong> placed by Arjun S.
      </>
    ),
    time: "2m ago",
  },
  {
    color: "#34d399",
    text: (
      <>
        <strong>Product added:</strong> Demon Slayer Figure
      </>
    ),
    time: "18m ago",
  },
  {
    color: "#f59e0b",
    text: (
      <>
        <strong>Low stock alert:</strong> Naruto Hoodie (3 left)
      </>
    ),
    time: "1h ago",
  },
  {
    color: "#e040fb",
    text: (
      <>
        <strong>New review</strong> on Dragon Ball Poster
      </>
    ),
    time: "3h ago",
  },
  {
    color: "#00e5ff",
    text: (
      <>
        <strong>Category updated:</strong> Ultra Rare
      </>
    ),
    time: "5h ago",
  },
];

const QUICK_ACTIONS = [
  {
    to: "/admin/products/add",
    icon: "✚",
    label: "Add Product",
    sub: "New catalog item",
  },
  { to: "/admin/orders", icon: "📦", label: "View Orders", sub: "24 pending" },
  { to: "/admin/customers", icon: "◎", label: "Customers", sub: "1,284 total" },
  {
    to: "/admin/analytics",
    icon: "▣",
    label: "Analytics",
    sub: "View metrics",
  },
];

export default function DashboardHome() {
  const statsRef = useRef([]);

  useEffect(() => {
    // Animate stat cards in on mount
    statsRef.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      setTimeout(() => {
        el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 80 * i);
    });
  }, []);

  return (
    <div>
      {/* Page Header */}
      <header className="dash-header">
        <p className="dash-header__greeting">Welcome back 👋</p>
        <h1 className="dash-header__title">
          Store <span>Overview</span>
        </h1>
        <p className="dash-header__sub">
          Here's what's happening with your anime store today.
        </p>
      </header>

      {/* Stats */}
      <div className="dash-stats">
        {STATS.map((s, i) => (
          <div
            key={s.key}
            className="stat-card"
            style={{ "--stat-color": s.color }}
            ref={(el) => (statsRef.current[i] = el)}
          >
            <div className="stat-card__icon">{s.icon}</div>
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
            <div className="stat-card__delta">↑ {s.delta}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="dash-grid">
        {/* Quick Actions */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <p className="dash-actions-title">Quick Actions</p>
          <div className="dash-actions">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.to} to={a.to} className="dash-action-btn">
                <span className="dash-action-btn__icon">{a.icon}</span>
                <span className="dash-action-btn__label">{a.label}</span>
                <span className="dash-action-btn__sub">{a.sub}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <p className="dash-actions-title">Recent Activity</p>
          {ACTIVITY.map((a, i) => (
            <div key={i} className="activity-item">
              <span
                className="activity-dot"
                style={{ background: a.color, boxShadow: `0 0 6px ${a.color}` }}
              />
              <span className="activity-text">{a.text}</span>
              <span className="activity-time">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
