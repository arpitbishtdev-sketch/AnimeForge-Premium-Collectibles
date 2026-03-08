import { useEffect, useRef } from "react";
import { useProductForm } from "../hooks/useProductForm";
import "../styles/Addproductform.css";

const CATEGORIES = [
  "Figurines",
  "Apparel",
  "Posters",
  "Accessories",
  "Collectibles",
  "Manga",
  "Home Decor",
  "Limited Edition",
];

const STATUS_OPTIONS = [
  { value: "new", label: "✦ New", color: "#22d3ee", rgb: "34,211,238" },
  {
    value: "popular",
    label: "🔥 Popular",
    color: "#f59e0b",
    rgb: "245,158,11",
  },
  { value: "rare", label: "⬡ Rare", color: "#a78bfa", rgb: "167,139,250" },
  {
    value: "featured",
    label: "⭐ Featured",
    color: "#34d399",
    rgb: "52,211,153",
  },
  {
    value: "bestseller",
    label: "📈 Bestseller",
    color: "#f97316",
    rgb: "249,115,22",
  },
  {
    value: "ultra-rare",
    label: "💎 Ultra Rare",
    color: "#e040fb",
    rgb: "224,64,251",
  },
];

function Toast({ status, message, onClose }) {
  if (status !== "success" && status !== "error") return null;

  const isSuccess = status === "success";
  return (
    <div
      className={`apf-toast ${!isSuccess ? "apf-toast--error" : ""}`}
      role="alert"
    >
      <span className="apf-toast__icon">{isSuccess ? "✅" : "❌"}</span>
      <div className="apf-toast__text">
        <p className="apf-toast__title">
          {isSuccess ? "Product Added!" : "Error"}
        </p>
        <p className="apf-toast__sub">{message}</p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: "16px",
          padding: "4px",
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

function FieldError({ error }) {
  if (!error) return null;
  return <p className="apf-error-msg">⚠ {error}</p>;
}

export default function AddProductForm() {
  const {
    form,
    errors,
    status,
    message,
    isFormValid,
    handleChange,
    handleSubmit,
    handleFileChange,
    imageFiles,
    removeImage,
    reorderImages,
    handleReset,
  } = useProductForm();

  const isLoading = status === "loading";
  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === form.status);

  const dragItem = useRef();
  const dragOverItem = useRef();

  return (
    <div>
      {/* Page Header */}
      <header className="apf-page-header">
        <h1 className="apf-page-title">Add New Product</h1>
        <p className="apf-page-sub">
          Fill in the details below to add a new item to your catalog.
        </p>
      </header>

      {/* Toast */}
      <Toast status={status} message={message} onClose={handleReset} />

      <form onSubmit={handleSubmit} noValidate>
        <div className="apf-layout">
          {/* ---- Main Form Card ---- */}
          <div className="glass-card apf-form-card">
            {/* Basic Info */}
            <section className="apf-section">
              <h2 className="apf-section-title">Basic Information</h2>

              <div className="apf-field-row">
                <div className="apf-field">
                  <label htmlFor="name" className="apf-label">
                    Name <span>*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={`apf-input ${errors.name ? "error" : ""}`}
                    placeholder="e.g. Demon Slayer Tanjiro Figure"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <FieldError error={errors.name} />
                </div>

                <div className="apf-field">
                  <label htmlFor="slug" className="apf-label">
                    Slug <span>*</span>
                  </label>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    className={`apf-input ${errors.slug ? "error" : ""}`}
                    placeholder="auto-generated from name"
                    value={form.slug}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <FieldError error={errors.slug} />
                </div>
                <div className="apf-field">
                  <label className="apf-label">Tags *</label>
                  <div className="apf-tag-container">
                    <div className="apf-tag-list">
                      {form.tags.map((tag, index) => (
                        <span key={index} className="apf-tag-chip">
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = form.tags.filter(
                                (_, i) => i !== index,
                              );
                              handleChange({
                                target: { name: "tags", value: updated },
                              });
                            }}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    <input
                      type="text"
                      className="apf-input"
                      placeholder="Type tag and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const value = e.target.value.trim().toLowerCase();
                          if (!value) return;

                          if (!form.tags.includes(value)) {
                            handleChange({
                              target: {
                                name: "tags",
                                value: [...form.tags, value],
                              },
                            });
                          }

                          e.target.value = "";
                        }
                      }}
                    />
                  </div>

                  <FieldError error={errors.tags} />
                </div>
              </div>

              <div className="apf-field">
                <label htmlFor="description" className="apf-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="apf-textarea"
                  placeholder="Describe the product in detail…"
                  value={form.description}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </section>

            {/* Pricing & Inventory */}
            <section className="apf-section">
              <h2 className="apf-section-title">Pricing & Inventory</h2>

              <div className="apf-field-row">
                <div className="apf-field">
                  <label htmlFor="category" className="apf-label">
                    Category <span>*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    className={`apf-select ${errors.category ? "error" : ""}`}
                    value={form.category}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="">Select category…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <FieldError error={errors.category} />
                </div>

                <div className="apf-field">
                  <label htmlFor="basePrice" className="apf-label">
                    Base Price (₹) <span>*</span>
                  </label>
                  <input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    className={`apf-input ${errors.basePrice ? "error" : ""}`}
                    placeholder="e.g. 1499"
                    value={form.basePrice}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <FieldError error={errors.basePrice} />
                </div>
              </div>

              <div className="apf-field-row">
                <div className="apf-field">
                  <label htmlFor="stock" className="apf-label">
                    Stock Quantity <span>*</span>
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    className={`apf-input ${errors.stock ? "error" : ""}`}
                    placeholder="e.g. 50"
                    value={form.stock}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <FieldError error={errors.stock} />
                </div>

                <div className="apf-field">
                  <label className="apf-label">
                    Product Image <span>*</span>
                  </label>

                  <div
                    className="apf-dropzone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = e.dataTransfer.files;

                      if (files && files.length) {
                        handleFileChange({ target: { files } });
                      }
                    }}
                  >
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e)}
                    />

                    <p className="apf-dropzone-text">
                      Drag & drop images here or <span>click to upload</span>
                    </p>

                    <small>Maximum 8 images</small>
                  </div>

                  {/* Preview + Reorder */}
                  {imageFiles && imageFiles.length > 0 && (
                    <div className="apf-image-grid">
                      {imageFiles.map((file, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={() => (dragItem.current = index)}
                          onDragEnter={() => (dragOverItem.current = index)}
                          onDragEnd={() => {
                            if (
                              dragItem.current !== undefined &&
                              dragOverItem.current !== undefined
                            ) {
                              reorderImages(
                                dragItem.current,
                                dragOverItem.current,
                              );
                            }

                            dragItem.current = null;
                            dragOverItem.current = null;
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          className="apf-image-item"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                            alt="preview"
                            className="apf-image-preview"
                            onClick={() =>
                              window.open(URL.createObjectURL(file), "_blank")
                            }
                          />

                          {index === 0 && (
                            <span className="apf-cover-badge">COVER</span>
                          )}

                          <button
                            type="button"
                            className="apf-image-remove"
                            onClick={() => removeImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <FieldError error={errors.image} />
              </div>
            </section>

            {/* Product Placement */}
            <section className="apf-section">
              <h2 className="apf-section-title">Product Placement</h2>

              <div className="apf-status-grid">
                <label className="apf-status-option">
                  <input
                    type="radio"
                    name="displaySection"
                    value="shop"
                    checked={form.displaySection === "shop"}
                    onChange={handleChange}
                  />
                  <span
                    className="apf-status-label"
                    style={{
                      "--status-color": "#f59e0b",
                      "--status-rgb": "245,158,11",
                    }}
                  >
                    🏠 Homepage Shop (Max 6)
                  </span>
                </label>

                <label className="apf-status-option">
                  <input
                    type="radio"
                    name="displaySection"
                    value="collection"
                    checked={form.displaySection === "collection"}
                    onChange={handleChange}
                  />
                  <span
                    className="apf-status-label"
                    style={{
                      "--status-color": "#6366f1",
                      "--status-rgb": "99,102,241",
                    }}
                  >
                    📦 Collection Page
                  </span>
                </label>
              </div>
              <FieldError error={errors.displaySection} />
            </section>

            {/* Product Status */}
            <section className="apf-section">
              <h2 className="apf-section-title">Product Status</h2>

              <div className="apf-status-grid">
                {STATUS_OPTIONS.map((opt) => (
                  <label key={opt.value} className="apf-status-option">
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={form.status === opt.value}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <span
                      className="apf-status-label"
                      style={{
                        "--status-color": opt.color,
                        "--status-rgb": opt.rgb,
                      }}
                    >
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
              <FieldError error={errors.status} />
            </section>

            <div className="apf-actions">
              <button
                type="submit"
                className="apf-submit-btn"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? "⏳ Adding Product…" : "✚ Add Product"}
              </button>
              <button
                type="button"
                className="apf-reset-btn"
                onClick={handleReset}
                disabled={isLoading}
              >
                Clear
              </button>
            </div>
          </div>

          {/* ---- Preview Card ---- */}
          <aside className="glass-card apf-preview-card">
            <p className="preview-title">Live Preview</p>

            <div className="preview-img">
              {imageFiles && imageFiles.length > 0 ? (
                <img
                  src={URL.createObjectURL(imageFiles[0])}
                  onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                  alt="Preview"
                />
              ) : (
                "🎴"
              )}{" "}
            </div>

            {selectedStatus && (
              <div style={{ marginBottom: 10 }}>
                <span
                  className={`pt-badge pt-badge--${selectedStatus.value}`}
                  style={{ fontSize: 11 }}
                >
                  <span className="pt-badge__dot" />
                  {selectedStatus.value}
                </span>
              </div>
            )}

            <p className="preview-name">{form.name || "Product Name"}</p>
            <p className="preview-slug">/{form.slug || "product-slug"}</p>

            {form.category && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginBottom: 8,
                }}
              >
                {form.category}
              </p>
            )}

            {form.basePrice && (
              <p className="preview-price">
                ₹{parseFloat(form.basePrice).toLocaleString("en-IN")}
              </p>
            )}

            {form.stock && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  marginTop: 6,
                }}
              >
                {form.stock} units in stock
              </p>
            )}
          </aside>
        </div>
      </form>
    </div>
  );
}
