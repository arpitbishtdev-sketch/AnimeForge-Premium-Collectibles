
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminOrders.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("adminToken") || localStorage.getItem("animeforge-token");

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  confirmed:  { label: "Confirmed",  color: "#00e5ff", bg: "rgba(0,229,255,0.1)" },
  processing: { label: "Processing", color: "#7c5cfc", bg: "rgba(124,92,252,0.12)" },
  shipped:    { label: "Shipped",    color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  delivered:  { label: "Delivered",  color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  refunded:   { label: "Refunded",   color: "#f97316", bg: "rgba(249,115,22,0.1)" },
};

const PAYMENT_CONFIG = {
  paid:    { label: "Paid",    color: "#34d399" },
  pending: { label: "Pending", color: "#f59e0b" },
  failed:  { label: "Failed",  color: "#ef4444" },
  refunded:{ label: "Refunded",color: "#f97316" },
};

const ALL_STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

// ── Order Detail Modal ─────────────────────────────────────────────────────
function OrderModal({ order, onClose, onStatusUpdate }) {
  const [newStatus, setNewStatus] = useState(order.orderStatus);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (newStatus === order.orderStatus) return;
    setUpdating(true);
    try {
      await apiFetch(`/orders/${order._id}/status`, {
        method: "PUT",
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      onStatusUpdate(order._id, newStatus);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const s = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
  const p = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.pending;

  return (
    <div className="ao-modal-overlay" onClick={onClose}>
      <div className="ao-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ao-modal-header">
          <div>
            <h2 className="ao-modal-title">{order.orderNumber}</h2>
            <p className="ao-modal-date">
              {new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button className="ao-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="ao-modal-body">
          {/* Status badges */}
          <div className="ao-modal-badges">
            <span className="ao-badge" style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}40` }}>{s.label}</span>
            <span className="ao-badge" style={{ color: p.color, background: `${p.color}18`, border: `1px solid ${p.color}40` }}>💳 {p.label}</span>
            <span className="ao-badge" style={{ color: "#a78bfa", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)" }}>
              {order.paymentMethod?.toUpperCase()}
            </span>
          </div>

          {/* Customer Info */}
          <div className="ao-modal-section">
            <h3 className="ao-modal-section-title">👤 Customer</h3>
            <div className="ao-info-grid">
              <div><span className="ao-info-label">Name</span><span className="ao-info-value">{order.shippingAddress?.fullName}</span></div>
              <div><span className="ao-info-label">Phone</span><span className="ao-info-value">{order.shippingAddress?.phone}</span></div>
              <div><span className="ao-info-label">Email</span><span className="ao-info-value">{order.user?.email || "—"}</span></div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="ao-modal-section">
            <h3 className="ao-modal-section-title">📍 Shipping Address</h3>
            <p className="ao-address">
              {order.shippingAddress?.addressLine1}{order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}<br />
              {order.shippingAddress?.country}
            </p>
          </div>

          {/* Items */}
          <div className="ao-modal-section">
            <h3 className="ao-modal-section-title">🛍️ Items ({order.items?.length})</h3>
            <div className="ao-items-list">
              {order.items?.map((item, idx) => (
                <div key={idx} className="ao-item-row">
                  {item.image && <img src={item.image} alt={item.name} className="ao-item-img" />}
                  <div className="ao-item-info">
                    <span className="ao-item-name">{item.name}</span>
                    {item.variantValue && <span className="ao-item-variant">{item.variantType}: {item.variantValue}</span>}
                    <span className="ao-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="ao-item-price">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="ao-modal-section">
            <h3 className="ao-modal-section-title">💰 Price Breakdown</h3>
            <div className="ao-price-breakdown">
              <div className="ao-price-row"><span>Subtotal</span><span>₹{order.itemsTotal?.toLocaleString("en-IN")}</span></div>
              <div className="ao-price-row"><span>Shipping</span><span>{order.shippingCharge === 0 ? "FREE" : `₹${order.shippingCharge}`}</span></div>
              {order.discount > 0 && <div className="ao-price-row" style={{ color: "#34d399" }}><span>Discount</span><span>-₹{order.discount?.toLocaleString("en-IN")}</span></div>}
              <div className="ao-price-row ao-price-total"><span>Total</span><span>₹{order.totalAmount?.toLocaleString("en-IN")}</span></div>
            </div>
          </div>

          {/* Update Status */}
          <div className="ao-modal-section">
            <h3 className="ao-modal-section-title">🔄 Update Status</h3>
            <div className="ao-status-update">
              <select className="ao-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <button className="ao-update-btn" onClick={handleUpdate} disabled={updating || newStatus === order.orderStatus}>
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const LIMIT = 15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (search.trim()) params.append("search", search.trim());
      const data = await apiFetch(`/orders?${params}`);
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotalOrders(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Reset page on filter/search change
  useEffect(() => { setPage(1); }, [filterStatus, search]);

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
  };

  const filtered = orders; // already filtered by backend

  // Stats
  const stats = {
    total: totalOrders,
    pending: orders.filter(o => ["pending","confirmed"].includes(o.orderStatus)).length,
    processing: orders.filter(o => o.orderStatus === "processing").length,
    delivered: orders.filter(o => o.orderStatus === "delivered").length,
  };

  return (
    <div className="ao-root">
      {/* Header */}
      <div className="ao-header">
        <div>
          <h1 className="ao-title">Order Management</h1>
          <p className="ao-subtitle">Track, manage and update all customer orders</p>
        </div>
        <div className="ao-header-stats">
          <div className="ao-hstat"><span className="ao-hstat-val">{totalOrders}</span><span className="ao-hstat-label">Total</span></div>
          <div className="ao-hstat" style={{ "--hs-color": "#f59e0b" }}><span className="ao-hstat-val">{stats.pending}</span><span className="ao-hstat-label">Pending</span></div>
          <div className="ao-hstat" style={{ "--hs-color": "#7c5cfc" }}><span className="ao-hstat-val">{stats.processing}</span><span className="ao-hstat-label">Processing</span></div>
          <div className="ao-hstat" style={{ "--hs-color": "#34d399" }}><span className="ao-hstat-val">{stats.delivered}</span><span className="ao-hstat-label">Delivered</span></div>
        </div>
      </div>

      {/* Filters */}
      <div className="ao-filters glass-card">
        <input
          className="ao-search"
          placeholder="Search by order number, customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="ao-filter-tabs">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              className={`ao-filter-tab ${filterStatus === s ? "active" : ""}`}
              onClick={() => setFilterStatus(s)}
              style={filterStatus === s && s !== "all" ? { color: STATUS_CONFIG[s]?.color, borderColor: STATUS_CONFIG[s]?.color } : {}}
            >
              {s === "all" ? "All Orders" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="ao-table-wrap glass-card">
        {loading ? (
          <div className="ao-loading">
            <div className="ao-spinner" />
            <span>Loading orders...</span>
          </div>
        ) : error ? (
          <div className="ao-error">⚠️ {error}</div>
        ) : filtered.length === 0 ? (
          <div className="ao-empty">
            <span style={{ fontSize: 40 }}>📦</span>
            <p>Koi order nahi mila</p>
          </div>
        ) : (
          <table className="ao-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const s = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
                const p = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.pending;
                return (
                  <tr key={order._id} className="ao-row" onClick={() => setSelectedOrder(order)}>
                    <td><span className="ao-order-num">{order.orderNumber}</span></td>
                    <td>
                      <div className="ao-customer">
                        <span className="ao-customer-name">{order.shippingAddress?.fullName || "—"}</span>
                        <span className="ao-customer-email">{order.user?.email || "—"}</span>
                      </div>
                    </td>
                    <td><span className="ao-items-count">{order.items?.length} item{order.items?.length > 1 ? "s" : ""}</span></td>
                    <td><span className="ao-amount">₹{order.totalAmount?.toLocaleString("en-IN")}</span></td>
                    <td><span className="ao-payment-badge" style={{ color: p.color }}>● {p.label}</span></td>
                    <td>
                      <span className="ao-status-badge" style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}30` }}>
                        {s.label}
                      </span>
                    </td>
                    <td><span className="ao-date">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></td>
                    <td>
                      <button className="ao-view-btn" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
                        View →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="ao-pagination">
          <button className="ao-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span className="ao-page-info">Page {page} of {totalPages}</span>
          <button className="ao-page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
        </div>
      )}

      {/* Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}