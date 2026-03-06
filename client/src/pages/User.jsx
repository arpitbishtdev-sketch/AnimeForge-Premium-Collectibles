import { useState, useCallback } from "react";
import "../styles/user.css";

const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const StarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <polygon points="12 2 15.09 10.26 24 10.26 17.55 15.23 20.64 23.74 12 18.77 3.36 23.74 6.45 15.23 0 10.26 8.91 10.26 12 2" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const TrophyIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 4 18 9" />
    <path d="M18 9v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9m3 5h8" />
    <circle cx="12" cy="18" r="2" />
  </svg>
);

export default function User({
  accentColor = "#ff8c00",
  accentGlow = "rgba(255, 200, 0, 0.8)",
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const userData = {
    name: "Anime Collector",
    email: "collector@animeforge.com",
    joinDate: "March 2022",
    memberStatus: "Gold Member",
    avatar:
      "https://images.unsplash.com/photo-1535713566543-8c5c1e8fed41?w=200&h=200&fit=crop",
    phone: "+1 (555) 123-4567",
    location: "Tokyo, Japan",
  };

  const stats = [
    { label: "Total Orders", value: "24", icon: "📦" },
    { label: "Total Spent", value: "$8,340", icon: "💰" },
    { label: "Loyalty Points", value: "3,480", icon: "⭐" },
    { label: "Referral Bonus", value: "$420", icon: "🎁" },
  ];

  const orders = [
    {
      id: "ORD-2024-001",
      date: "Jan 15, 2024",
      items: 2,
      total: "$449.98",
      status: "Delivered",
      items_list: "Naruto Statue, AOT Figure",
    },
    {
      id: "ORD-2024-002",
      date: "Feb 28, 2024",
      items: 1,
      total: "$199.99",
      status: "Delivered",
      items_list: "Death Note Box Set",
    },
    {
      id: "ORD-2024-003",
      date: "Mar 10, 2024",
      items: 3,
      total: "$599.97",
      status: "Processing",
      items_list: "Limited Edition Figures (3)",
    },
  ];

  const loyaltyTiers = [
    { tier: "Silver", spent: "$0 - $1000", benefits: "5% Discount" },
    {
      tier: "Gold",
      spent: "$1000 - $5000",
      benefits: "10% Discount + Priority Support",
      current: true,
    },
    {
      tier: "Platinum",
      spent: "$5000+",
      benefits: "15% Discount + VIP Access",
    },
  ];

  return (
    <div
      className="user-container"
      style={{ "--accent-color": accentColor, "--accent-glow": accentGlow }}
    >
      {/* Background Gradient */}
      <div className="user-bg-gradient" />

      {/* Profile Header */}
      <div className="user-profile-header">
        <div className="profile-card">
          <div className="profile-avatar-wrapper">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="profile-avatar"
            />
            <div className="profile-avatar-ring" />
            <div className="profile-status-online" />
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{userData.name}</h1>
            <p className="profile-status">{userData.memberStatus}</p>
            <p className="profile-joined">Joined {userData.joinDate}</p>
          </div>

          <button
            className="profile-edit-btn"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
          >
            <EditIcon />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="profile-divider" />
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="stat-card"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="user-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <span>Overview</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <span>Orders</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "loyalty" ? "active" : ""}`}
          onClick={() => setActiveTab("loyalty")}
        >
          <span>Loyalty</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <span>Settings</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="tab-pane active">
            <div className="content-grid">
              {/* Quick Links */}
              <div className="section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-links">
                  <button className="quick-link-btn">Continue Shopping</button>
                  <button className="quick-link-btn">Track Orders</button>
                  <button className="quick-link-btn">Wishlist (8)</button>
                  <button className="quick-link-btn">Saved Addresses</button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="section">
                <h2 className="section-title">Contact Information</h2>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{userData.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{userData.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{userData.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="tab-pane active">
            <div className="orders-container">
              <h2 className="section-title">Recent Orders</h2>
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-id-section">
                        <span className="order-id">{order.id}</span>
                        <span
                          className={`order-status ${order.status.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <span className="order-date">{order.date}</span>
                    </div>

                    <div className="order-body">
                      <div className="order-details">
                        <div className="order-detail">
                          <span className="detail-label">Items</span>
                          <span className="detail-value">{order.items}</span>
                        </div>
                        <div className="order-detail">
                          <span className="detail-label">Total</span>
                          <span className="detail-value amount">
                            {order.total}
                          </span>
                        </div>
                      </div>
                      <div className="order-items-summary">
                        {order.items_list}
                      </div>
                    </div>

                    <div className="order-footer">
                      <button className="order-action-btn">View Details</button>
                      <button className="order-action-btn">
                        Track Shipment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loyalty Tab */}
        {activeTab === "loyalty" && (
          <div className="tab-pane active">
            <div className="loyalty-container">
              {/* Loyalty Points Card */}
              <div className="loyalty-points-card">
                <div className="points-header">
                  <StarIcon />
                  <div className="points-info">
                    <h3 className="points-title">Loyalty Points</h3>
                    <p className="points-subtitle">Gold Member</p>
                  </div>
                </div>
                <div className="points-display">
                  <div className="points-value">3,480</div>
                  <div className="points-label">Points Earned</div>
                </div>
                <div className="points-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "65%" }} />
                  </div>
                  <div className="progress-labels">
                    <span>3,480 / 5,000</span>
                    <span>Platinum Tier</span>
                  </div>
                </div>
              </div>

              {/* Loyalty Tiers */}
              <div className="loyalty-tiers">
                <h2 className="section-title">Membership Tiers</h2>
                <div className="tiers-grid">
                  {loyaltyTiers.map((item, idx) => (
                    <div
                      key={idx}
                      className={`tier-card ${item.current ? "current" : ""}`}
                    >
                      <div className="tier-header">
                        <TrophyIcon />
                        <span className="tier-name">{item.tier}</span>
                      </div>
                      <p className="tier-requirement">Spent: {item.spent}</p>
                      <p className="tier-benefits">{item.benefits}</p>
                      {item.current && (
                        <div className="tier-badge">Current</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards */}
              <div className="rewards-section">
                <h2 className="section-title">Available Rewards</h2>
                <div className="rewards-grid">
                  <div className="reward-item">
                    <div className="reward-icon">🎯</div>
                    <div className="reward-text">
                      <span className="reward-title">500 Points Discount</span>
                      <span className="reward-cost">500 pts</span>
                    </div>
                  </div>
                  <div className="reward-item">
                    <div className="reward-icon">🎁</div>
                    <div className="reward-text">
                      <span className="reward-title">Free Shipping</span>
                      <span className="reward-cost">1,000 pts</span>
                    </div>
                  </div>
                  <div className="reward-item">
                    <div className="reward-icon">👑</div>
                    <div className="reward-text">
                      <span className="reward-title">VIP Exclusive Item</span>
                      <span className="reward-cost">2,500 pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="tab-pane active">
            <div className="settings-container">
              <div className="settings-section">
                <h2 className="section-title">Account Settings</h2>
                <div className="settings-group">
                  <label className="settings-item">
                    <div className="settings-label">
                      <span>Email Notifications</span>
                      <p className="settings-desc">
                        Receive order updates and promotions
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="toggle-switch"
                    />
                  </label>

                  <label className="settings-item">
                    <div className="settings-label">
                      <span>SMS Alerts</span>
                      <p className="settings-desc">
                        Get shipment tracking via SMS
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="toggle-switch"
                    />
                  </label>

                  <label className="settings-item">
                    <div className="settings-label">
                      <span>Marketing Emails</span>
                      <p className="settings-desc">
                        Exclusive deals and new collections
                      </p>
                    </div>
                    <input type="checkbox" className="toggle-switch" />
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="section-title">Security</h2>
                <div className="security-group">
                  <button className="security-btn">
                    <ShieldIcon />
                    <span>Change Password</span>
                  </button>
                  <button className="security-btn">
                    <ShieldIcon />
                    <span>Two-Factor Authentication</span>
                  </button>
                  <button className="security-btn">
                    <ShieldIcon />
                    <span>Active Sessions</span>
                  </button>
                </div>
              </div>

              <div className="settings-section danger-zone">
                <h2 className="section-title">Danger Zone</h2>
                <button className="logout-btn">
                  <LogoutIcon />
                  <span>Logout</span>
                </button>
                <button className="delete-account-btn">Delete Account</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
