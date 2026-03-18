import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { orderApi } from "../utils/api";
import "../styles/user.css";

// ── Icons ──────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
    <polygon points="12 2 15.09 10.26 24 10.26 17.55 15.23 20.64 23.74 12 18.77 3.36 23.74 6.45 15.23 0 10.26 8.91 10.26 12 2" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const TrophyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 4 18 9" />
    <path d="M18 9v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9m3 5h8" />
    <circle cx="12" cy="18" r="2" />
  </svg>
);
const EyeIcon = ({ show }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {show ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

// ── Order status CSS class map ─────────────────────────────────────────────
const statusClass = {
  pending: "processing",
  confirmed: "processing",
  processing: "processing",
  shipped: "processing",
  delivered: "delivered",
  cancelled: "cancelled",
  refunded: "cancelled",
};

// ── Loyalty tier logic ─────────────────────────────────────────────────────
const loyaltyTiers = [
  { tier: "Bronze", min: 0, max: 2000, benefits: "Free shipping above ₹999" },
  { tier: "Silver", min: 2000, max: 10000, benefits: "5% Discount + Priority Support" },
  { tier: "Gold", min: 10000, max: 25000, benefits: "10% Discount + Early Access" },
  { tier: "Platinum", min: 25000, max: Infinity, benefits: "15% Discount + VIP Access" },
];

function getTier(totalSpent) {
  return loyaltyTiers.findLast((t) => totalSpent >= t.min) || loyaltyTiers[0];
}
function getNextTier(totalSpent) {
  return loyaltyTiers.find((t) => totalSpent < t.max) || null;
}

// ── useTheme hook se accent/glow nikalna ───────────────────────────────────
function useAccent() {
  const { activeCharacter } = useTheme();
  const accent = activeCharacter?.gradient?.accent || "#ff8c00";
  const glow = activeCharacter?.gradient?.glow || "rgba(255,140,0,0.8)";
  return { accent, glow };
}

// ══════════════════════════════════════════════════════════════════════════
// LOGIN / REGISTER FORM
// ══════════════════════════════════════════════════════════════════════════
function AuthForm() {
  const { login, register } = useAuth();
  const { accent, glow } = useAccent();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!form.email || !form.password) { setError("Email aur password dono zaroori hain"); return; }
    if (mode === "register" && !form.name) { setError("Naam daalna zaroori hai"); return; }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
        setSuccess("Account bana! Email verify karo phir login karo.");
        setMode("login");
        setForm((p) => ({ ...p, name: "", password: "" }));
      }
    } catch (err) {
      setError(err.message || "Kuch galat hua, dobara try karo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-container" style={{ "--accent-color": accent, "--accent-glow": glow }}>
      <div className="user-bg-gradient" />
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-logo">⚔️</div>
          <h1 className="auth-title">{mode === "login" ? "Welcome Back" : "Join AnimeForge"}</h1>
          <p className="auth-subtitle">{mode === "login" ? "Apne account mein login karo" : "Naya account banao"}</p>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <div className="auth-fields">
            {mode === "register" && (
              <div className="auth-field">
                <label className="auth-label">Naam</label>
                <input className="auth-input" name="name" placeholder="Apna naam daalo" value={form.name} onChange={handleChange} />
              </div>
            )}
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input className="auth-input" name="email" type="email" placeholder="email@example.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-pass-wrap">
                <input
                  className="auth-input"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button className="auth-eye" onClick={() => setShowPass((p) => !p)}>
                  <EyeIcon show={showPass} />
                </button>
              </div>
            </div>
          </div>

          <button
            className="auth-submit"
            onClick={handleSubmit}
            disabled={loading}
            style={{ background: `linear-gradient(135deg, ${accent}, ${glow})` }}
          >
            {loading ? "Loading..." : mode === "login" ? "Login Karo" : "Account Banao"}
          </button>

          <button className="auth-toggle" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}>
            {mode === "login" ? "Naya account chahiye? Register karo" : "Already account hai? Login karo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN USER PAGE (logged in)
// ══════════════════════════════════════════════════════════════════════════
export default function User() {
  const navigate = useNavigate();
  const { user, loading, isLoggedIn, logout, updateProfile } = useAuth();
  const { accent, glow } = useAccent();
  const [activeTab, setActiveTab] = useState("overview");

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    if (activeTab === "orders" && isLoggedIn && orders.length === 0) {
      setOrdersLoading(true);
      orderApi.getMyOrders()
        .then((data) => setOrders(data.orders || []))
        .catch(console.error)
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, isLoggedIn]);

  useEffect(() => {
    if (user) setEditForm({ name: user.name || "", phone: user.phone || "" });
  }, [user]);

  const totalSpent = orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalAmount, 0);
  const currentTier = getTier(totalSpent);
  const nextTier = getNextTier(totalSpent);
  const toNext = nextTier ? nextTier.min - totalSpent : 0;
  const tierPct = nextTier ? Math.min(((totalSpent - currentTier.min) / (nextTier.min - currentTier.min)) * 100, 100) : 100;

  const stats = [
    { label: "Total Orders", value: orders.length, icon: "📦" },
    { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, icon: "💰" },
    { label: "Delivered", value: orders.filter((o) => o.orderStatus === "delivered").length, icon: "✅" },
    { label: "Member Tier", value: currentTier.tier, icon: "⭐" },
  ];

  const handleLogout = useCallback(async () => { await logout(); }, [logout]);

  const handleSaveProfile = async () => {
    setEditError("");
    setEditLoading(true);
    try {
      await updateProfile(editForm);
      setEditing(false);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");
    if (pwForm.newPassword !== pwForm.confirm) { setPwError("Naye passwords match nahi kar rahe"); return; }
    setPwLoading(true);
    try {
      const { authApi } = await import("../utils/api");
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSuccess("Password badal gaya! ✅");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Kya aap ye order cancel karna chahte ho?")) return;
    try {
      await orderApi.cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, orderStatus: "cancelled" } : o));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="user-container" style={{ "--accent-color": accent, "--accent-glow": glow, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="user-bg-gradient" />
        <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Rajdhani, sans-serif", fontSize: 18 }}>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) return <AuthForm />;

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="user-container" style={{ "--accent-color": accent, "--accent-glow": glow }}>
      <div className="user-bg-gradient" />

      {/* ── Profile Header ── */}
      <div className="user-profile-header">
        <div className="profile-card">
          <div className="profile-avatar-wrapper">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=${accent.replace("#", "")}&color=fff&size=200`}
              alt={user?.name}
              className="profile-avatar"
            />
            <div className="profile-avatar-ring" />
            <div className="profile-status-online" />
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user?.name || "Collector"}</h1>
            <p className="profile-status">{currentTier.tier} Member</p>
            <p className="profile-joined">Joined {joinDate}</p>
          </div>
          <button className="profile-edit-btn" onClick={() => { setEditing(!editing); setActiveTab("settings"); }}>
            <EditIcon />
            <span>Edit Profile</span>
          </button>
        </div>
        <div className="profile-divider" />
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="user-tabs">
        {["overview", "orders", "loyalty", "settings"].map((tab) => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
            <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="tab-content">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="tab-pane active">
            <div className="content-grid">
              <div className="section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-links">
                  <button className="quick-link-btn" onClick={() => navigate("/collections")}>Continue Shopping</button>
                  <button className="quick-link-btn" onClick={() => setActiveTab("orders")}>Track Orders</button>
                  <button className="quick-link-btn" onClick={() => navigate("/cart")}>Go to Cart</button>
                  <button className="quick-link-btn" onClick={() => setActiveTab("settings")}>Account Settings</button>
                </div>
              </div>
              <div className="section">
                <h2 className="section-title">Contact Information</h2>
                <div className="info-list">
                  <div className="info-item"><span className="info-label">Email</span><span className="info-value">{user?.email}</span></div>
                  <div className="info-item"><span className="info-label">Phone</span><span className="info-value">{user?.phone || "—"}</span></div>
                  <div className="info-item"><span className="info-label">Member Since</span><span className="info-value">{joinDate}</span></div>
                  <div className="info-item">
                    <span className="info-label">Verified</span>
                    <span className="info-value" style={{ color: user?.isVerified ? "#22c55e" : "#ff6464" }}>
                      {user?.isVerified ? "✅ Verified" : "❌ Not Verified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <div className="tab-pane active">
            <div className="orders-container">
              <h2 className="section-title">My Orders</h2>
              {ordersLoading ? (
                <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Rajdhani,sans-serif" }}>Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="section" style={{ textAlign: "center", padding: 40 }}>
                  <p style={{ fontSize: 40 }}>📦</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Rajdhani,sans-serif" }}>Abhi koi order nahi hai</p>
                  <button className="quick-link-btn" style={{ marginTop: 16 }} onClick={() => navigate("/collections")}>Shop Karo</button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <div className="order-id-section">
                          <span className="order-id">{order.orderNumber}</span>
                          <span className={`order-status ${statusClass[order.orderStatus] || "processing"}`}>{order.orderStatus}</span>
                        </div>
                        <span className="order-date">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <div className="order-body">
                        <div className="order-details">
                          <div className="order-detail"><span className="detail-label">Items</span><span className="detail-value">{order.items?.length}</span></div>
                          <div className="order-detail"><span className="detail-label">Total</span><span className="detail-value amount">₹{order.totalAmount?.toLocaleString("en-IN")}</span></div>
                          <div className="order-detail"><span className="detail-label">Payment</span><span className="detail-value">{order.paymentMethod?.toUpperCase()}</span></div>
                        </div>
                        <div className="order-items-summary">{order.items?.map((i) => i.name).join(", ")}</div>
                      </div>
                      <div className="order-footer">
                        {order.trackingNumber && <button className="order-action-btn">🚚 {order.trackingNumber}</button>}
                        {["pending", "confirmed"].includes(order.orderStatus) && (
                          <button className="order-action-btn" style={{ color: "#ff6464", borderColor: "rgba(255,100,100,0.3)" }} onClick={() => handleCancelOrder(order._id)}>
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOYALTY */}
        {activeTab === "loyalty" && (
          <div className="tab-pane active">
            <div className="loyalty-container">
              <div className="loyalty-points-card">
                <div className="points-header">
                  <StarIcon />
                  <div className="points-info">
                    <h3 className="points-title">{currentTier.tier} Member</h3>
                    <p className="points-subtitle">{currentTier.benefits}</p>
                  </div>
                </div>
                <div className="points-display">
                  <div className="points-value">₹{totalSpent.toLocaleString("en-IN")}</div>
                  <div className="points-label">Total Spent</div>
                </div>
                {nextTier && (
                  <div className="points-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${tierPct}%` }} />
                    </div>
                    <div className="progress-labels">
                      <span>₹{totalSpent.toLocaleString("en-IN")}</span>
                      <span>₹{toNext.toLocaleString("en-IN")} more for {nextTier.tier}</span>
                    </div>
                  </div>
                )}
                {!nextTier && (
                  <p style={{ textAlign: "center", color: accent, fontFamily: "Rajdhani,sans-serif", fontWeight: 700, marginTop: 12 }}>
                    🎉 Highest Tier — Platinum Member!
                  </p>
                )}
              </div>
              <div className="loyalty-tiers">
                <h2 className="section-title">Membership Tiers</h2>
                <div className="tiers-grid">
                  {loyaltyTiers.map((item) => (
                    <div key={item.tier} className={`tier-card ${item.tier === currentTier.tier ? "current" : ""}`}>
                      <div className="tier-header"><TrophyIcon /><span className="tier-name">{item.tier}</span></div>
                      <p className="tier-requirement">₹{item.min.toLocaleString("en-IN")}{item.max === Infinity ? "+" : ` – ₹${item.max.toLocaleString("en-IN")}`}</p>
                      <p className="tier-benefits">{item.benefits}</p>
                      {item.tier === currentTier.tier && <div className="tier-badge">Current</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="tab-pane active">
            <div className="settings-container">
              <div className="settings-section">
                <h2 className="section-title">Edit Profile</h2>
                {editError && <div className="auth-error" style={{ marginBottom: 16 }}>{editError}</div>}
                <div className="auth-fields">
                  <div className="auth-field">
                    <label className="auth-label">Naam</label>
                    <input className="auth-input" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Phone</label>
                    <input className="auth-input" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
                <button className="auth-submit" style={{ marginTop: 16, background: `linear-gradient(135deg, ${accent}, ${glow})` }} onClick={handleSaveProfile} disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>

              <div className="settings-section">
                <h2 className="section-title">Change Password</h2>
                {pwError && <div className="auth-error" style={{ marginBottom: 12 }}>{pwError}</div>}
                {pwSuccess && <div className="auth-success" style={{ marginBottom: 12 }}>{pwSuccess}</div>}
                <div className="auth-fields">
                  {["currentPassword", "newPassword", "confirm"].map((field) => (
                    <div key={field} className="auth-field">
                      <label className="auth-label">
                        {field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password"}
                      </label>
                      <input className="auth-input" type="password" value={pwForm[field]} onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))} placeholder="••••••••" />
                    </div>
                  ))}
                </div>
                <button className="auth-submit" style={{ marginTop: 16, background: "rgba(100,200,255,0.15)", border: "1px solid rgba(100,200,255,0.3)", color: "#fff" }} onClick={handleChangePassword} disabled={pwLoading}>
                  {pwLoading ? "Changing..." : "Change Password"}
                </button>
              </div>

              <div className="settings-section">
                <h2 className="section-title">Security</h2>
                <div className="security-group">
                  <div className="security-btn" style={{ cursor: "default" }}><ShieldIcon /><span>Email: {user?.email}</span></div>
                  <div className="security-btn" style={{ cursor: "default" }}><ShieldIcon /><span>Account: {user?.isVerified ? "✅ Verified" : "❌ Not Verified"}</span></div>
                </div>
              </div>

              <div className="settings-section danger-zone">
                <h2 className="section-title">Danger Zone</h2>
                <button className="logout-btn" onClick={handleLogout}><LogoutIcon /><span>Logout</span></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}