import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminCollections.css";

const EMPTY_FORM = {
  tag: "",
  title: "",
  subtitle: "",
  tagLine: "",
  description: "",
  points: ["", "", ""],
  material: "",
  scaleFrom: "",
  scaleTo: "",
  logo: "", // kept for backwards compat
  bgImage: "",
  badge: "", // status key e.g. "new", "popular"
  accentColor: "#7c5cff",
  order: 0,
  isActive: true,
};

// ── Small stat box ──────────────────────────────────────────────────────────
function StatBox({ label, value, auto = false }) {
  return (
    <div className="ac-stat-box">
      <span className="ac-stat-box__val">{value ?? "—"}</span>
      <span className="ac-stat-box__label">
        {label}
        {auto && <span className="ac-stat-box__auto"> auto</span>}
      </span>
    </div>
  );
}

// ── Collection card preview ─────────────────────────────────────────────────
function CollectionRow({ col, onEdit, onDelete, deleting, statusColors }) {
  // Find the live color for this collection's badge (status key)
  const statusEntry = statusColors.find((s) => s.status === col.badge);
  const badgeColor = statusEntry?.color || col.accentColor || "#7c5cff";

  return (
    <div
      className="ac-row"
      style={{ "--row-accent": col.accentColor || "#7c5cff" }}
    >
      <div className="ac-row__strip" />

      <div className="ac-row__main">
        <div className="ac-row__top">
          <div className="ac-row__titles">
            <span className="ac-row__label">{col.label || "—"}</span>
            <h3 className="ac-row__title">{col.title}</h3>
            <span className="ac-row__subtitle">{col.subtitle}</span>
          </div>

          <div className="ac-row__meta">
            {col.badge && (
              <span
                className="ac-row__badge"
                style={{
                  color: badgeColor,
                  border: `1px solid ${badgeColor}55`,
                  background: `${badgeColor}18`,
                  boxShadow: `0 0 10px ${badgeColor}33`,
                }}
              >
                {col.badge.toUpperCase()}
              </span>
            )}
            <span
              className={`ac-row__status ${col.isActive ? "ac-row__status--on" : "ac-row__status--off"}`}
            >
              {col.isActive ? "Active" : "Hidden"}
            </span>
          </div>
        </div>

        <p className="ac-row__desc">
          {col.description || <em>No description</em>}
        </p>

        <div className="ac-row__points">
          {(col.points || []).map((pt, i) => (
            <span key={i} className="ac-row__point">
              <span className="ac-row__point-dot">◆</span>
              {pt || <em>Empty</em>}
            </span>
          ))}
        </div>

        <div className="ac-row__stats">
          <StatBox label="Tag" value={col.tag} />
          <StatBox label="Items" value={col.itemCount ?? 0} auto />
          <StatBox
            label="Price Range"
            value={
              col.priceMin != null
                ? `₹${col.priceMin} – ₹${col.priceMax}`
                : "No products"
            }
            auto
          />
          <StatBox label="Material" value={col.material || "—"} />
          <StatBox
            label="Scale"
            value={
              col.scaleFrom && col.scaleTo
                ? `${col.scaleFrom} – ${col.scaleTo}`
                : col.scaleFrom || "—"
            }
          />
          <div className="ac-stat-box">
            <span
              className="ac-stat-box__swatch"
              style={{ background: col.accentColor }}
            />
            <span className="ac-stat-box__label">
              {statusEntry ? statusEntry.status : "Accent"}
            </span>
          </div>
        </div>
      </div>

      <div className="ac-row__actions">
        <button className="ac-btn ac-btn--edit" onClick={() => onEdit(col)}>
          ✎ Edit
        </button>
        <button
          className="ac-btn ac-btn--delete"
          onClick={() => onDelete(col._id)}
          disabled={deleting === col._id}
        >
          {deleting === col._id ? "…" : "✕ Delete"}
        </button>
      </div>
    </div>
  );
}

// ── Form modal ──────────────────────────────────────────────────────────────
function CollectionForm({
  initial,
  onSave,
  onCancel,
  saving,
  error,
  statusColorsProp,
}) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  // Use colors passed from parent (already loaded + kept in sync with statusUpdated event)
  const statusColors = statusColorsProp || [];

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const setPoint = (i, val) =>
    setForm((p) => {
      const pts = [...p.points];
      pts[i] = val;
      return { ...p, points: pts };
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="ac-modal-overlay">
      <div className="ac-modal">
        <div className="ac-modal__header">
          <h2 className="ac-modal__title">
            {initial?._id ? "Edit Collection" : "New Collection"}
          </h2>
          <button className="ac-modal__close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <form className="ac-modal__body" onSubmit={handleSubmit} noValidate>
          {/* ── Core ── */}
          <div className="ac-form-section">Core Details</div>

          <div className="ac-form-grid-2">
            <div className="ac-field">
              <label className="ac-label">
                Tag <span className="ac-req">*</span>
                <span className="ac-hint">
                  {" "}
                  (matches product tags, e.g. "naruto")
                </span>
              </label>
              <input
                className="ac-input ac-input--mono"
                value={form.tag}
                onChange={(e) =>
                  set("tag", e.target.value.toLowerCase().trim())
                }
                placeholder="naruto"
                required
              />
            </div>
            <div className="ac-field">
              <label className="ac-label">
                Status Badge
                <span className="ac-hint"> — shown on the collection card</span>
              </label>
              {statusColors.length === 0 ? (
                <div className="ac-input ac-input--disabled">
                  Loading statuses…
                </div>
              ) : (
                <div className="ac-status-picker">
                  {statusColors.map((s) => {
                    const isActive = form.badge === s.status;
                    return (
                      <button
                        key={s._id}
                        type="button"
                        className={`ac-status-chip ${isActive ? "ac-status-chip--active" : ""}`}
                        style={{ "--chip-color": s.color }}
                        onClick={() => {
                          // Picking a status badge auto-sets the accent color to match
                          setForm((p) => ({
                            ...p,
                            badge: s.status,
                            accentColor: s.color,
                          }));
                        }}
                      >
                        <span className="ac-status-chip__dot" />
                        <span className="ac-status-chip__label">
                          {s.status}
                        </span>
                        {isActive && (
                          <span className="ac-status-chip__check">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Live badge preview */}
              {form.badge &&
                (() => {
                  const entry = statusColors.find(
                    (s) => s.status === form.badge,
                  );
                  const c = entry?.color || "#7c5cff";
                  return (
                    <div
                      className="ac-badge-preview"
                      style={{ "--badge-c": c }}
                    >
                      <span className="ac-badge-preview__pill">
                        {form.badge.toUpperCase()}
                      </span>
                      <span className="ac-badge-preview__note">
                        Live preview of badge on card
                      </span>
                    </div>
                  );
                })()}
            </div>
          </div>

          <div className="ac-form-grid-2">
            <div className="ac-field">
              <label className="ac-label">
                Main Title <span className="ac-req">*</span>
              </label>
              <input
                className="ac-input"
                value={form.title}
                onChange={(e) => set("title", e.target.value.toUpperCase())}
                placeholder="NARUTO"
                required
              />
            </div>
            <div className="ac-field">
              <label className="ac-label">Small Subtitle</label>
              <input
                className="ac-input"
                value={form.subtitle}
                onChange={(e) => set("subtitle", e.target.value)}
                placeholder="Shinobi Universe"
              />
            </div>
          </div>

          <div className="ac-field">
            <label className="ac-label">Tag Line</label>
            <input
              className="ac-input"
              value={form.tagLine}
              onChange={(e) => set("tagLine", e.target.value)}
              placeholder="Hokage Edition"
            />
          </div>

          <div className="ac-field">
            <label className="ac-label">
              Description <span className="ac-hint">(1 line)</span>
            </label>
            <input
              className="ac-input"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="From Shadow Clones to Sage Mode…"
              maxLength={120}
            />
          </div>

          {/* ── 3 Points ── */}
          <div className="ac-form-section">
            Featured Points
            <span className="ac-form-section__hint"> — exactly 3 required</span>
          </div>

          <div className="ac-points-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="ac-field">
                <label className="ac-label">Point {i + 1}</label>
                <input
                  className="ac-input"
                  value={form.points[i]}
                  onChange={(e) => setPoint(i, e.target.value)}
                  placeholder={
                    ["Naruto Sage Mode", "Kurama Awakening", "Pain God Realm"][
                      i
                    ]
                  }
                  required
                />
              </div>
            ))}
          </div>

          {/* ── Stats ── */}
          <div className="ac-form-section">
            Stats
            <span className="ac-form-section__hint">
              {" "}
              — Items &amp; Price Range are auto-computed from products with the
              tag above
            </span>
          </div>

          <div className="ac-auto-stat-preview">
            <span className="ac-auto-icon">⟳</span>
            <span>
              <strong>Items</strong> and <strong>Price Range</strong> are
              automatically pulled from your product catalogue using the tag you
              entered above. No manual input needed.
            </span>
          </div>

          <div className="ac-form-grid-3">
            {/* Col 1 — Items (auto) */}
            <div className="ac-field ac-field--locked">
              <label className="ac-label">
                Items
                <span className="ac-hint"> auto from products</span>
              </label>
              <div className="ac-input ac-input--disabled">
                Calculated automatically
              </div>
            </div>

            {/* Col 2 — Material (manual) */}
            <div className="ac-field">
              <label className="ac-label">Material</label>
              <input
                className="ac-input"
                value={form.material}
                onChange={(e) => set("material", e.target.value)}
                placeholder="Premium Resin"
              />
            </div>

            {/* Col 3 — Scale range (manual) */}
            <div className="ac-field">
              <label className="ac-label">Scale Range</label>
              <div className="ac-scale-wrap">
                <input
                  className="ac-input ac-input--half"
                  value={form.scaleFrom}
                  onChange={(e) => set("scaleFrom", e.target.value)}
                  placeholder="1/6"
                />
                <span className="ac-scale-sep">to</span>
                <input
                  className="ac-input ac-input--half"
                  value={form.scaleTo}
                  onChange={(e) => set("scaleTo", e.target.value)}
                  placeholder="1/50"
                />
              </div>
            </div>
          </div>

          {/* ── Misc ── */}
          <div className="ac-form-section">Other</div>

          <div className="ac-form-grid-2">
            <div className="ac-field">
              <label className="ac-label">
                Card Background Image
                <span className="ac-hint">
                  {" "}
                  (optional — shown dimmed, brightens on hover)
                </span>
              </label>
              <div className="ac-bg-upload">
                {form.bgImage ? (
                  <div className="ac-bg-preview">
                    <img
                      src={form.bgImage}
                      alt="bg preview"
                      className="ac-bg-preview__img"
                    />
                    <button
                      type="button"
                      className="ac-bg-preview__remove"
                      onClick={() => set("bgImage", "")}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <label className="ac-bg-dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        set("bgImage", "__uploading__");
                        try {
                          const fd = new FormData();
                          fd.append("file", file);
                          const res = await fetch("/api/upload", {
                            method: "POST",
                            body: fd,
                          });
                          const data = await res.json();
                          const url =
                            data.url || data.secure_url || data.imageUrl;
                          if (!url) throw new Error("No URL returned");
                          set("bgImage", url);
                        } catch (err) {
                          set("bgImage", "");
                          alert("Upload failed: " + err.message);
                        }
                      }}
                    />
                    {form.bgImage === "__uploading__" ? (
                      <>
                        <span className="ac-spinner" /> Uploading…
                      </>
                    ) : (
                      <>
                        <span className="ac-bg-dropzone__icon">↑</span> Click to
                        upload image
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>
            <div className="ac-field">
              <label className="ac-label">Display Order</label>
              <input
                className="ac-input"
                type="number"
                min="0"
                value={form.order}
                onChange={(e) => set("order", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="ac-field ac-field--checkbox">
            <label className="ac-checkbox-label">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
              />
              <span>Active (visible on frontend)</span>
            </label>
          </div>

          {error && (
            <div className="ac-save-error">
              <span>!</span> {error}
            </div>
          )}

          <div className="ac-modal__footer">
            <button
              type="button"
              className="ac-btn ac-btn--ghost"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ac-btn ac-btn--primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="ac-spinner" /> Saving…
                </>
              ) : (
                <>
                  <span>✓</span> Save Collection
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
export default function AdminCollections() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [statusColors, setStatusColors] = useState([]);

  const loadStatusColors = useCallback(async () => {
    try {
      // Use the existing /api/status endpoint — already working, no new route needed
      const res = await fetch("/api/status");
      if (!res.ok) return;
      const data = await res.json();
      setStatusColors(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  // Also re-load when admin updates a status color from the Status Colors page
  useEffect(() => {
    loadStatusColors();
    const handler = () => loadStatusColors();
    window.addEventListener("statusUpdated", handler);
    return () => window.removeEventListener("statusUpdated", handler);
  }, [loadStatusColors]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/collections/admin/all");
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      setCollections(data);
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
        ? `/api/collections/${editTarget._id}`
        : "/api/collections";
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
    if (!window.confirm("Delete this collection?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const openNew = () => {
    if (collections.length >= 6) {
      alert("Maximum 6 collections. Delete one first.");
      return;
    }
    setEditTarget(null);
    setSaveError(null);
    setShowForm(true);
  };

  const openEdit = (col) => {
    setEditTarget(col);
    setSaveError(null);
    setShowForm(true);
  };

  return (
    <div className="ac-page">
      {/* Header */}
      <div className="ac-header">
        <div className="ac-header__left">
          <button className="ac-back-btn" onClick={() => navigate("/admin")}>
            ←
          </button>
          <div>
            <p className="ac-header__eyebrow">Admin / Catalog</p>
            <h1 className="ac-header__title">Collections</h1>
          </div>
        </div>
        <div className="ac-header__right">
          <span className="ac-count-badge">{collections.length} / 6</span>
          <button
            className="ac-btn ac-btn--primary"
            onClick={openNew}
            disabled={collections.length >= 6}
          >
            + New Collection
          </button>
        </div>
      </div>

      {/* Info strip */}
      <div className="ac-info-strip">
        <span className="ac-info-strip__icon">ℹ</span>
        <span>
          <strong>Items</strong> and <strong>Price Range</strong> are
          auto-computed from products whose tags match each collection's tag.
          <strong> Status Badge</strong> colors reflect whatever you set in the
          Status Colors admin page — changes sync live.
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="ac-loading">
          <span className="ac-spinner" /> Loading collections…
        </div>
      ) : error ? (
        <div className="ac-error">
          <span>✦</span> {error}
        </div>
      ) : collections.length === 0 ? (
        <div className="ac-empty">
          <span className="ac-empty__icon">⊞</span>
          <p className="ac-empty__title">No Collections Yet</p>
          <p className="ac-empty__sub">
            Create your first collection to display on the homepage.
          </p>
          <button className="ac-btn ac-btn--primary" onClick={openNew}>
            + Create First Collection
          </button>
        </div>
      ) : (
        <div className="ac-list">
          {collections.map((col) => (
            <CollectionRow
              key={col._id}
              col={col}
              onEdit={openEdit}
              onDelete={handleDelete}
              deleting={deleting}
              statusColors={statusColors}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <CollectionForm
          initial={
            editTarget
              ? {
                  ...editTarget,
                  points:
                    editTarget.points?.length === 3
                      ? editTarget.points
                      : ["", "", ""],
                }
              : EMPTY_FORM
          }
          onSave={handleSave}
          statusColorsProp={statusColors}
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
