import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditProduct.css";

const EMPTY_FORM = {
  name: "",
  slug: "",
  category: "",
  basePrice: "",
  originalPrice: "",
  stock: "",
  themeColor: "#7c5cff",
  description: "",
  tags: [],
  status: "new",
};

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [statusColors, setStatusColors] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  // Tag input state
  const [tagInput, setTagInput] = useState("");

  const [allImages, setAllImages] = useState([]);

  const fileInputRef = useRef(null);
  const dragSrcIdx = useRef(null);

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        data.forEach((s) => {
          map[s.status] = s.color;
        });
        setStatusColors(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const p = data.data || data;
        setForm({
          name: p.name ?? "",
          slug: p.slug ?? "",
          category: p.category ?? "",
          basePrice: p.basePrice ?? "",
          originalPrice: p.originalPrice ?? "",
          stock: p.stock ?? "",
          description: p.description ?? "",
          tags: p.tags ?? [],
          status: p.status ?? "new",
          themeColor: p.themeColor ?? "#7c5cff",
        });
        setAllImages(
          (p.images ?? []).map((img) => ({
            type: "saved",
            url: img.url,
            public_id: img.public_id,
          })),
        );
      })
      .catch((err) => {
        if (!cancelled) setFetchError(err.message || "Failed to load product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (name === "name") {
        const slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");
        setForm((prev) => ({ ...prev, name: value, slug }));
        return;
      }
      if (name === "status") {
        const autoColor = statusColors[value];
        setForm((prev) => ({
          ...prev,
          status: value,
          ...(autoColor ? { themeColor: autoColor } : {}),
        }));
        return;
      }
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    [statusColors],
  );

  // ── Tag helpers ──
  const addTag = useCallback((raw) => {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(trimmed) ? prev.tags : [...prev.tags, trimmed],
    }));
    setTagInput("");
  }, []);

  const removeTag = useCallback((tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }, []);

  const handleTagKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(tagInput);
      } else if (
        e.key === "Backspace" &&
        tagInput === "" &&
        form.tags.length > 0
      ) {
        setForm((prev) => ({ ...prev, tags: prev.tags.slice(0, -1) }));
      }
    },
    [tagInput, form.tags, addTag],
  );

  // ── Image helpers ──
  const addFiles = useCallback((files) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAllImages((prev) => [
          ...prev,
          { type: "new", url: e.target.result, file, name: file.name },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDropZone = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const removeImage = useCallback((index) => {
    setAllImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const setPrimary = useCallback((index) => {
    setAllImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.unshift(moved);
      return updated;
    });
  }, []);

  const handleThumbDragStart = useCallback((e, index) => {
    dragSrcIdx.current = index;
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleThumbDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(index);
  }, []);

  const handleThumbDrop = useCallback((e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIdx(null);
    const from = dragSrcIdx.current;
    if (from === null || from === index) return;
    setAllImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    dragSrcIdx.current = null;
  }, []);

  const handleThumbDragEnd = useCallback(() => {
    setDragOverIdx(null);
    dragSrcIdx.current = null;
  }, []);

  // ── Submit ──
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSaveError(null);
      setSaving(true);
      try {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("slug", form.slug);
        formData.append("category", form.category);
        formData.append("basePrice", form.basePrice);
        formData.append("originalPrice", form.originalPrice);
        formData.append("stock", form.stock);
        formData.append("description", form.description);
        formData.append("status", form.status);
        formData.append("themeColor", form.themeColor);
        formData.append("tags", JSON.stringify(form.tags));

        // Send order of saved images
        const savedOrder = allImages
          .filter((img) => img.type === "saved")
          .map((img) => img.public_id);
        formData.append("imageOrder", JSON.stringify(savedOrder));

        // Append new files in the order they appear in allImages
        allImages
          .filter((img) => img.type === "new")
          .forEach((img) => formData.append("images", img.file));

        const res = await fetch(`/api/products/${id}`, {
          method: "PUT",
          body: formData,
        });
        if (!res.ok) throw new Error("Update failed");
        navigate("/admin/products");
      } catch (err) {
        setSaveError(err.message);
      } finally {
        setSaving(false);
      }
    },
    [form, allImages, id, navigate],
  );

  if (loading)
    return (
      <div className="ep-page">
        <div className="ep-loading">
          <span className="ep-loading__spinner" />
          <span className="ep-loading__text">Loading product…</span>
        </div>
      </div>
    );

  if (fetchError)
    return (
      <div className="ep-page">
        <div className="ep-fetch-error">
          <span className="ep-fetch-error__icon">✦</span>
          <p className="ep-fetch-error__msg">{fetchError}</p>
          <button
            className="ep-btn ep-btn--ghost"
            onClick={() => navigate("/admin/products")}
          >
            ← Back to Products
          </button>
        </div>
      </div>
    );

  const savedCount = allImages.filter((i) => i.type === "saved").length;
  const newCount = allImages.filter((i) => i.type === "new").length;

  return (
    <div className="ep-page">
      <div className="ep-header">
        <div className="ep-header__left">
          <button
            className="ep-back-btn"
            onClick={() => navigate("/admin/products")}
            aria-label="Go back"
          >
            ←
          </button>
          <div>
            <p className="ep-header__eyebrow">Admin / Products</p>
            <h1 className="ep-header__title">Edit Product</h1>
          </div>
        </div>
        <div className="ep-header__right">
          <div className="ep-header__id">
            <span className="ep-header__id-label">ID</span>
            <span className="ep-header__id-value">{id}</span>
          </div>
          <button
            type="button"
            className="ep-btn ep-btn--ghost ep-btn--small"
            onClick={() => navigate("/admin/status")}
          >
            ✦ Manage Status Colors
          </button>
        </div>
      </div>

      <form className="ep-card" onSubmit={handleSubmit} noValidate>
        <div className="ep-card__accent-bar" />

        <div className="ep-grid">
          {/* ── Left column ── */}
          <div className="ep-col">
            <div className="ep-col__label">Core Details</div>
            <div className="ep-field">
              <label className="ep-label" htmlFor="ep-name">
                Product Name <span className="ep-required">*</span>
              </label>
              <input
                id="ep-name"
                name="name"
                type="text"
                className="ep-input"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Naruto Shippuden Statue"
                required
                maxLength={200}
              />
            </div>
            <div className="ep-field">
              <label className="ep-label" htmlFor="ep-slug">
                Slug <span className="ep-required">*</span>
              </label>
              <input
                id="ep-slug"
                name="slug"
                type="text"
                className="ep-input ep-input--mono"
                value={form.slug}
                onChange={handleChange}
                placeholder="e.g. naruto-shippuden-statue"
                required
                maxLength={200}
              />
            </div>
            <div className="ep-field">
              <label className="ep-label" htmlFor="ep-category">
                Category
              </label>
              <input
                id="ep-category"
                name="category"
                type="text"
                className="ep-input"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Figures"
              />
            </div>

            {/* ── TAG PILL EDITOR ── */}
            <div className="ep-field">
              <label className="ep-label">Tags</label>
              <div className="ep-tags-wrap">
                {form.tags.map((tag) => (
                  <span key={tag} className="ep-tag-pill">
                    {tag}
                    <button
                      type="button"
                      className="ep-tag-pill__remove"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="ep-tags-input"
                  placeholder={
                    form.tags.length === 0
                      ? "Type a tag and press Enter or ,"
                      : "Add another…"
                  }
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => tagInput.trim() && addTag(tagInput)}
                />
              </div>
              <span
                className="ep-hint"
                style={{ marginTop: 4, display: "block" }}
              >
                Press{" "}
                <kbd
                  style={{
                    padding: "1px 5px",
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,255,0.15)",
                    fontSize: 10,
                  }}
                >
                  Enter
                </kbd>{" "}
                or{" "}
                <kbd
                  style={{
                    padding: "1px 5px",
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,255,0.15)",
                    fontSize: 10,
                  }}
                >
                  ,
                </kbd>{" "}
                to add · Backspace to remove last
              </span>
            </div>

            <div className="ep-field">
              <label className="ep-label" htmlFor="ep-status">
                Product Status
              </label>
              <div className="ep-status-wrap">
                <select
                  id="ep-status"
                  name="status"
                  className="ep-select"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="new">New</option>
                  <option value="popular">Popular</option>
                  <option value="rare">Rare</option>
                  <option value="featured">Featured</option>
                  <option value="bestseller">Bestseller</option>
                  <option value="ultra-rare">Ultra Rare</option>
                </select>
                {statusColors[form.status] && (
                  <span
                    className="ep-status-badge-preview"
                    style={{
                      borderColor: statusColors[form.status],
                      color: statusColors[form.status],
                      boxShadow: `0 0 8px ${statusColors[form.status]}44`,
                    }}
                  >
                    ● {form.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="ep-col">
            <div className="ep-col__label">Pricing &amp; Inventory</div>
            <div className="ep-field">
              <label className="ep-label" htmlFor="ep-basePrice">
                Base Price (₹) <span className="ep-required">*</span>
              </label>
              <div className="ep-input-prefix-wrap">
                <span className="ep-input-prefix">₹</span>
                <input
                  id="ep-basePrice"
                  name="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  className="ep-input ep-input--prefixed"
                  value={form.basePrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="ep-field">
              <label className="ep-label" htmlFor="ep-originalPrice">
                Original Price (₹){" "}
                <span className="ep-hint">
                  optional — used for strike-through
                </span>
              </label>
              <div className="ep-input-prefix-wrap">
                <span className="ep-input-prefix">₹</span>
                <input
                  id="ep-originalPrice"
                  name="originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  className="ep-input ep-input--prefixed"
                  value={form.originalPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="ep-field">
              <label className="ep-label" htmlFor="ep-stock">
                Stock <span className="ep-required">*</span>
              </label>
              <input
                id="ep-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                className="ep-input"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
            <div className="ep-field">
              <label className="ep-label">
                Theme Color{" "}
                <span className="ep-hint">auto-set from status</span>
              </label>
              <div className="ep-color-wrap">
                <span
                  className="ep-color-swatch"
                  style={{
                    background: form.themeColor,
                    width: 42,
                    height: 42,
                    borderRadius: 9,
                    border: "1px solid rgba(255,255,255,0.1)",
                    flexShrink: 0,
                  }}
                />
                <span
                  className="ep-input ep-input--mono ep-input--color-text"
                  style={{
                    opacity: 0.4,
                    cursor: "not-allowed",
                    userSelect: "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {form.themeColor}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.18)",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Managed via Status Colors
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Images ── */}
        <div className="ep-section-divider" style={{ marginTop: 32 }}>
          <span className="ep-section-divider__label">Product Images</span>
        </div>

        <div className="ep-img-section">
          <div className="ep-img-stats">
            <span className="ep-img-stat">
              <span className="ep-img-stat__val">{savedCount}</span> saved
            </span>
            <span className="ep-img-stat__sep">·</span>
            <span className="ep-img-stat">
              <span className="ep-img-stat__val">{newCount}</span> queued
            </span>
            {allImages.length > 0 && (
              <>
                <span className="ep-img-stat__sep">·</span>
                <span className="ep-img-stat ep-img-stat--tip">
                  drag anything to reorder · first = primary
                </span>
              </>
            )}
          </div>

          {allImages.length > 0 && (
            <div className="ep-img-grid">
              {allImages.map((img, index) => (
                <div
                  key={
                    img.type === "saved"
                      ? img.public_id
                      : `new-${index}-${img.name}`
                  }
                  className={[
                    "ep-img-thumb",
                    index === 0 ? "ep-img-thumb--primary" : "",
                    img.type === "new" ? "ep-img-thumb--new" : "",
                    dragOverIdx === index ? "ep-img-thumb--dragover" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  draggable
                  onDragStart={(e) => handleThumbDragStart(e, index)}
                  onDragOver={(e) => handleThumbDragOver(e, index)}
                  onDrop={(e) => handleThumbDrop(e, index)}
                  onDragEnd={handleThumbDragEnd}
                >
                  {index === 0 && (
                    <span className="ep-img-badge ep-img-badge--primary">
                      ✦ Primary
                    </span>
                  )}
                  {img.type === "new" && index !== 0 && (
                    <span className="ep-img-badge ep-img-badge--new">New</span>
                  )}
                  {img.type === "new" && index === 0 && (
                    <span className="ep-img-badge ep-img-badge--new-primary">
                      ✦ New · Primary
                    </span>
                  )}

                  <img
                    src={img.url}
                    alt={`product-${index}`}
                    draggable={false}
                  />

                  <div className="ep-img-thumb__overlay">
                    {index !== 0 && (
                      <button
                        type="button"
                        className="ep-img-action ep-img-action--star"
                        onClick={() => setPrimary(index)}
                        title="Set as primary"
                      >
                        ✦
                      </button>
                    )}
                    <button
                      type="button"
                      className="ep-img-action ep-img-action--remove"
                      onClick={() => removeImage(index)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>

                  <span className="ep-img-drag-handle">⠿</span>
                </div>
              ))}
            </div>
          )}

          <div
            className={`ep-img-dropzone${dragOver ? " ep-img-dropzone--active" : ""}`}
            onDrop={handleDropZone}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && fileInputRef.current?.click()
            }
          >
            <div className="ep-img-dropzone__icon">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="ep-img-dropzone__title">
              Drop images here or{" "}
              <span className="ep-img-dropzone__link">browse files</span>
            </p>
            <p className="ep-img-dropzone__sub">
              PNG · JPG · WEBP · Multiple supported
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>
        </div>

        {/* ── Description ── */}
        <div className="ep-section-divider">
          <span className="ep-section-divider__label">Description</span>
        </div>
        <div className="ep-field ep-field--full">
          <label className="ep-label" htmlFor="ep-description">
            Description
          </label>
          <textarea
            id="ep-description"
            name="description"
            className="ep-textarea"
            value={form.description}
            onChange={handleChange}
            placeholder="Write a detailed product description…"
            rows={6}
            maxLength={2000}
          />
          <span className="ep-char-count">
            {form.description.length} / 2000
          </span>
        </div>

        {saveError && (
          <div className="ep-save-error" role="alert">
            <span className="ep-save-error__icon">!</span>
            {saveError}
          </div>
        )}

        <div className="ep-actions">
          <button
            type="button"
            className="ep-btn ep-btn--ghost"
            onClick={() => navigate("/admin/products")}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ep-btn ep-btn--primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="ep-btn__spinner" />
                Saving…
              </>
            ) : (
              <>
                <span className="ep-btn__icon">✓</span>Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
