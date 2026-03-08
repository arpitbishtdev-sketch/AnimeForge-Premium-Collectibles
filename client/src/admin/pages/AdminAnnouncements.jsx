import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminAnnouncements.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const EMPTY_FORM = {
  message: "",
  label: "",
  icon: "",
  linkText: "",
  linkUrl: "",
  accentColor: "#ff8c00",
  order: 0,
  isActive: true,
};

const ICON_PRESETS = [
  "🔥",
  "⚡",
  "🎁",
  "✦",
  "⭐",
  "🚀",
  "💎",
  "🛡️",
  "🎴",
  "⏳",
];

// ── Single announcement row ─────────────────────────────────────────────────
function AnnouncementRow({ ann, onEdit, onDelete, deleting }) {
  return (
    <div
      className="aa-row"
      style={{ "--row-accent": ann.accentColor || "#ff8c00" }}
    >
      <div className="aa-row__strip" />

      <div className="aa-row__main">
        <div className="aa-row__top">
          <div className="aa-row__preview">
            {ann.icon && (
              <span className="aa-row__preview-icon">{ann.icon}</span>
            )}
            {ann.label && (
              <span
                className="aa-row__preview-label"
                style={{
                  background: ann.accentColor,
                  boxShadow: `0 0 10px ${ann.accentColor}55`,
                }}
              >
                {ann.label}
              </span>
            )}
            <span className="aa-row__preview-msg">{ann.message}</span>
            {ann.linkText && (
              <span className="aa-row__preview-link">{ann.linkText} →</span>
            )}
          </div>

          <div className="aa-row__meta">
            <span className="aa-row__order">#{ann.order ?? 0}</span>
            <span
              className={`aa-row__status ${
                ann.isActive ? "aa-row__status--on" : "aa-row__status--off"
              }`}
            >
              {ann.isActive ? "Active" : "Hidden"}
            </span>
          </div>
        </div>
      </div>

      <div className="aa-row__actions">
        <button className="aa-btn aa-btn--edit" onClick={() => onEdit(ann)}>
          ✎ Edit
        </button>
        <button
          className="aa-btn aa-btn--delete"
          onClick={() => onDelete(ann._id)}
          disabled={deleting === ann._id}
        >
          {deleting === ann._id ? "…" : "✕ Delete"}
        </button>
      </div>
    </div>
  );
}

// ── Form modal ──────────────────────────────────────────────────────────────
function AnnouncementForm({ initial, onSave, onCancel, saving, error }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  // Live preview bar style
  const previewStyle = {
    "--ann-accent": form.accentColor || "#ff8c00",
  };

  return (
    <div className="aa-modal-overlay">
      <div className="aa-modal">
        <div className="aa-modal__header">
          <h2 className="aa-modal__title">
            {initial?._id ? "Edit Announcement" : "New Announcement"}
          </h2>
          <button className="aa-modal__close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <form className="aa-modal__body" onSubmit={handleSubmit} noValidate>
          {/* Live preview */}
          <div className="aa-form-section">Live Preview</div>
          <div className="aa-preview-bar" style={previewStyle}>
            <div className="aa-preview-bar__shimmer" />
            <div className="aa-preview-bar__content">
              {form.icon && <span>{form.icon}</span>}
              {form.label && (
                <span
                  className="aa-preview-bar__label"
                  style={{ background: form.accentColor }}
                >
                  {form.label}
                </span>
              )}
              <span className="aa-preview-bar__msg">
                {form.message || "Your message will appear here…"}
              </span>
              {form.linkText && (
                <span className="aa-preview-bar__link">{form.linkText} →</span>
              )}
            </div>
            <div className="aa-preview-bar__shimmer aa-preview-bar__shimmer--r" />
          </div>

          {/* Message */}
          <div className="aa-form-section">Content</div>

          <div className="aa-field">
            <label className="aa-label">
              Message <span className="aa-req">*</span>
            </label>
            <input
              className="aa-input"
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Free shipping on orders above ₹999 — Limited time"
              required
              maxLength={120}
            />
            <span className="aa-char-count">{form.message.length} / 120</span>
          </div>

          <div className="aa-form-grid-2">
            <div className="aa-field">
              <label className="aa-label">Label Pill</label>
              <input
                className="aa-input"
                value={form.label}
                onChange={(e) => set("label", e.target.value.toUpperCase())}
                placeholder="SALE"
                maxLength={16}
              />
              <span className="aa-hint">
                Short uppercase text shown in colored pill
              </span>
            </div>

            <div className="aa-field">
              <label className="aa-label">Icon</label>
              <div className="aa-icon-row">
                <input
                  className="aa-input aa-input--icon"
                  value={form.icon}
                  onChange={(e) => set("icon", e.target.value)}
                  placeholder="🔥"
                  maxLength={4}
                />
                <div className="aa-icon-presets">
                  {ICON_PRESETS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      className={`aa-icon-preset ${form.icon === ic ? "aa-icon-preset--active" : ""}`}
                      onClick={() => set("icon", ic)}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="aa-form-section">
            Call to Action{" "}
            <span className="aa-form-section__hint">— optional</span>
          </div>

          <div className="aa-form-grid-2">
            <div className="aa-field">
              <label className="aa-label">Link Text</label>
              <input
                className="aa-input"
                value={form.linkText}
                onChange={(e) => set("linkText", e.target.value)}
                placeholder="Shop Now"
                maxLength={24}
              />
            </div>
            <div className="aa-field">
              <label className="aa-label">Link URL</label>
              <input
                className="aa-input"
                value={form.linkUrl}
                onChange={(e) => set("linkUrl", e.target.value)}
                placeholder="/collections or https://…"
              />
            </div>
          </div>

          <div className="aa-form-section">Style</div>

          <div className="aa-field" style={{ maxWidth: "200px" }}>
            <label className="aa-label">Display Order</label>
            <input
              className="aa-input"
              type="number"
              min="0"
              value={form.order}
              onChange={(e) => set("order", Number(e.target.value))}
            />

            <span className="aa-hint">
              Rotation sequence — 0 shows first, 1 shows second, and so on. Bar
              auto-rotates through all active announcements every 4 seconds.
            </span>
          </div>

          <div className="aa-field aa-field--checkbox">
            <label className="aa-checkbox-label">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
              />
              <span>Active (visible on frontend)</span>
            </label>
          </div>

          {error && (
            <div className="aa-save-error">
              <span>!</span> {error}
            </div>
          )}

          <div className="aa-modal__footer">
            <button
              type="button"
              className="aa-btn aa-btn--ghost"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="aa-btn aa-btn--primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="aa-spinner" /> Saving…
                </>
              ) : (
                <>
                  <span>✓</span> Save Announcement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function AdminAnnouncements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/announcements/admin/all`);
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (form) => {
    setSaveError(null);
    setSaving(true);
    try {
      const isEdit = !!editTarget?._id;
      const url = isEdit
        ? `${API_URL}/announcements/${editTarget._id}`
        : `${API_URL}/announcements`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");

      setShowForm(false);
      setEditTarget(null);
      load();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API_URL}/announcements/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (ann) => {
    setEditTarget(ann);
    setSaveError(null);
    setShowForm(true);
  };

  const openNew = () => {
    setEditTarget(null);
    setSaveError(null);
    setShowForm(true);
  };

  return (
    <div className="aa-page">
      {/* Header */}
      <div className="aa-header">
        <div className="aa-header__left">
          <button className="aa-back-btn" onClick={() => navigate("/admin")}>
            ←
          </button>
          <div>
            <p className="aa-header__eyebrow">Admin / Marketing</p>
            <h1 className="aa-header__title">Announcement Bar</h1>
          </div>
        </div>
        <div className="aa-header__right">
          <span className="aa-count-badge">
            {announcements.filter((a) => a.isActive).length} active
          </span>
          <button className="aa-btn aa-btn--primary" onClick={openNew}>
            + New Announcement
          </button>
        </div>
      </div>

      {/* Info strip */}
      <div className="aa-info-strip">
        <span className="aa-info-strip__icon">ℹ</span>
        <span>
          Active announcements rotate automatically on the storefront every 4
          seconds.
          <strong> Display Order</strong> decides the sequence — set it to{" "}
          <strong>0</strong> for the first announcement, <strong>1</strong> for
          the second, and so on. Use the <strong>Active</strong> toggle to
          show/hide an announcement without deleting it.
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="aa-loading">
          <span className="aa-spinner" /> Loading announcements…
        </div>
      ) : error ? (
        <div className="aa-error">
          <span>✦</span> {error}
        </div>
      ) : announcements.length === 0 ? (
        <div className="aa-empty">
          <span className="aa-empty__icon">📢</span>
          <p className="aa-empty__title">No Announcements Yet</p>
          <p className="aa-empty__sub">
            Create your first announcement to display at the top of the
            storefront.
          </p>
          <button className="aa-btn aa-btn--primary" onClick={openNew}>
            + Create First Announcement
          </button>
        </div>
      ) : (
        <div className="aa-list">
          {announcements
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((ann) => (
              <AnnouncementRow
                key={ann._id}
                ann={ann}
                onEdit={openEdit}
                onDelete={handleDelete}
                deleting={deleting}
              />
            ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <AnnouncementForm
          initial={editTarget || EMPTY_FORM}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditTarget(null);
          }}
          saving={saving}
          error={saveError}
        />
      )}
    </div>
  );
}
