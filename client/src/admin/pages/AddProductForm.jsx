import { useRef, useState } from "react";
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

const VARIANT_TYPES = [
  {
    value: "size",
    label: "📐 Size",
    placeholder: "e.g. 1/6, 1/12, 30cm, Large",
    icon: "📐",
  },
  {
    value: "color",
    label: "🎨 Color / Edition",
    placeholder: "e.g. Gold, Silver, Black",
    icon: "🎨",
  },
  {
    value: "material",
    label: "🧱 Material",
    placeholder: "e.g. Resin, PVC, Diecast Metal",
    icon: "🧱",
  },
  {
    value: "custom",
    label: "✏️ Custom",
    placeholder: "e.g. Signed Edition, Bundle",
    icon: "✏️",
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
          fontSize: 16,
          padding: 4,
        }}
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

// ─────────────────────────────────────────────────────
//  VARIANT MODAL
// ─────────────────────────────────────────────────────
function VariantModal({ variant, index, basePrice, onSave, onClose }) {
  const fileRef = useRef(null);
  const [data, setData] = useState({
    ...variant,
    imageFiles:
      variant.imageFiles || (variant.imageFile ? [variant.imageFile] : []),
    imagePreviews:
      variant.imagePreviews ||
      (variant.imagePreview ? [variant.imagePreview] : []),
  });
  const [dragOver, setDragOver] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const set = (field, val) => setData((prev) => ({ ...prev, [field]: val }));

  const addImages = (files) => {
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setData((prev) => {
      const combined = [...(prev.imageFiles || []), ...imgs];
      const capped = combined.slice(0, 8);
      const previews = capped.map((f, i) =>
        i < (prev.imagePreviews || []).length
          ? prev.imagePreviews[i]
          : URL.createObjectURL(f),
      );
      return { ...prev, imageFiles: capped, imagePreviews: previews };
    });
  };

  const removeImg = (i) => {
    setData((prev) => {
      if (prev.imagePreviews[i]) URL.revokeObjectURL(prev.imagePreviews[i]);
      return {
        ...prev,
        imageFiles: prev.imageFiles.filter((_, idx) => idx !== i),
        imagePreviews: prev.imagePreviews.filter((_, idx) => idx !== i),
      };
    });
  };

  const addTag = () => {
    const v = tagInput.trim().toLowerCase();
    if (!v || (data.tags || []).includes(v)) {
      setTagInput("");
      return;
    }
    set("tags", [...(data.tags || []), v]);
    setTagInput("");
  };

  const base = parseFloat(basePrice) || 0;
  const finalPrice = base + Number(data.priceModifier || 0);
  const typeInfo = VARIANT_TYPES.find((t) => t.value === data.type);
  const canSave = data.value.trim() && String(data.stock).trim() !== "";

  const buildSaveData = () => ({
    ...data,
    imageFile: data.imageFiles?.[0] || null,
    imagePreview: data.imagePreviews?.[0] || null,
  });

  return (
    <div className="vmodal-overlay" onClick={onClose}>
      <div className="vmodal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="vmodal-header">
          <div className="vmodal-header-left">
            <span className="vmodal-num">#{index + 1}</span>
            <div>
              <p className="vmodal-title">Variant Details</p>
              <p className="vmodal-sub">What makes this version different?</p>
            </div>
          </div>
          <button type="button" className="vmodal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="vmodal-body">
          {/* Left col: images */}
          <div className="vmodal-left">
            <p className="vmodal-section-label">
              Variant Images <span className="vmodal-opt">(up to 8)</span>
            </p>

            {(data.imagePreviews || []).length === 0 ? (
              <div
                className={`vmodal-dz ${dragOver ? "vmodal-dz--drag" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  addImages(e.dataTransfer.files);
                }}
              >
                <span className="vmodal-dz-icon">🖼️</span>
                <p className="vmodal-dz-text">Drop images here</p>
                <p className="vmodal-dz-sub">
                  or <em>click to upload</em>
                </p>
              </div>
            ) : (
              <div className="vmodal-img-grid">
                {(data.imagePreviews || []).map((src, i) => (
                  <div key={i} className="vmodal-img-thumb">
                    <img src={src} alt={`variant-${i}`} />
                    {i === 0 && <span className="vmodal-img-cover">COVER</span>}
                    <button
                      type="button"
                      className="vmodal-img-del"
                      onClick={() => removeImg(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {(data.imagePreviews || []).length < 8 && (
                  <div
                    className="vmodal-img-add"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      addImages(e.dataTransfer.files);
                    }}
                  >
                    <span>+</span>
                  </div>
                )}
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                addImages(e.target.files);
                e.target.value = "";
              }}
            />

            {base > 0 && (
              <div className="vmodal-price-preview">
                <span className="vmodal-price-label">Final Price</span>
                <span className="vmodal-price-value">
                  ₹{finalPrice.toLocaleString("en-IN")}
                  {Number(data.priceModifier) !== 0 && (
                    <span className="vmodal-price-diff">
                      {Number(data.priceModifier) > 0 ? "+" : ""}₹
                      {Number(data.priceModifier).toLocaleString("en-IN")}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Right col: fields */}
          <div className="vmodal-right">
            {/* Variant Type chips */}
            <div className="vmodal-field">
              <label className="vmodal-label">Variant Type</label>
              <div className="vmodal-type-chips">
                {VARIANT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`vmodal-type-chip ${data.type === t.value ? "vmodal-type-chip--active" : ""}`}
                    onClick={() => set("type", t.value)}
                  >
                    {t.icon}{" "}
                    {t.value.charAt(0).toUpperCase() + t.value.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Value */}
            <div className="vmodal-field">
              <label className="vmodal-label">
                Value <span className="vmodal-req">*</span>
                <span className="vmodal-field-hint">
                  Chip pe dikhega — e.g. "Gold", "Large"
                </span>
              </label>
              <input
                className="apf-input"
                placeholder={typeInfo?.placeholder}
                value={data.value}
                onChange={(e) => set("value", e.target.value)}
              />
            </div>

            {/* Title — NEW */}
            <div className="vmodal-field">
              <label className="vmodal-label">
                Title <span className="vmodal-opt">(optional)</span>
                <span className="vmodal-field-hint">
                  Product ka title replace karega jab yeh variant select ho
                </span>
              </label>
              <input
                className="apf-input"
                placeholder="e.g. Lightning McQueen Special Edition — Hot Wheels"
                value={data.title || ""}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>

            {/* Tags — customer facing */}
            <div className="vmodal-field">
              <label className="vmodal-label">
                Tags <span className="vmodal-opt">(optional)</span>
                <span className="vmodal-field-hint">
                  Product page pe dikhenye jab variant select ho
                </span>
              </label>
              <div className="apf-tag-container">
                {(data.tags || []).length > 0 && (
                  <div className="apf-tag-list">
                    {(data.tags || []).map((tag, idx) => (
                      <span key={idx} className="apf-tag-chip">
                        {tag}
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "tags",
                              data.tags.filter((_, i) => i !== idx),
                            )
                          }
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  className="apf-input"
                  placeholder="Type tag and press Enter or comma"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                    if (e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
              </div>
            </div>

            <div className="vmodal-row">
              {/* Category */}
              <div className="vmodal-field">
                <label className="vmodal-label">
                  Category <span className="vmodal-opt">(override)</span>
                </label>
                <select
                  className="apf-select"
                  value={data.category || ""}
                  onChange={(e) => set("category", e.target.value)}
                >
                  <option value="">Same as product</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div className="vmodal-field">
                <label className="vmodal-label">
                  Stock <span className="vmodal-req">*</span>
                </label>
                <input
                  className="apf-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.stock}
                  onChange={(e) => set("stock", e.target.value)}
                />
              </div>
            </div>

            {/* Price diff */}
            <div className="vmodal-field">
              <label className="vmodal-label">
                Price Difference (₹){" "}
                <span className="vmodal-opt">(+ or −)</span>
              </label>
              <div className="vmodal-price-row">
                <div style={{ position: "relative", flex: 1 }}>
                  <span className="vmodal-price-prefix">₹</span>
                  <input
                    className="apf-input vmodal-price-input"
                    type="number"
                    placeholder="0"
                    value={data.priceModifier}
                    onChange={(e) => set("priceModifier", e.target.value)}
                  />
                </div>
                <span className="vmodal-price-hint">
                  {Number(data.priceModifier) > 0 && (
                    <span className="vmodal-hint-up">↑ more expensive</span>
                  )}
                  {Number(data.priceModifier) < 0 && (
                    <span className="vmodal-hint-down">↓ cheaper</span>
                  )}
                  {Number(data.priceModifier) === 0 && (
                    <span className="vmodal-hint-same">= same price</span>
                  )}
                </span>
              </div>
            </div>

            {/* Description — customer facing, replaces product desc */}
            <div className="vmodal-field">
              <label className="vmodal-label">
                Description <span className="vmodal-opt">(optional)</span>
                <span className="vmodal-field-hint">
                  Product ka description replace karega jab yeh variant select
                  ho
                </span>
              </label>
              <textarea
                className="apf-textarea"
                rows={3}
                style={{ minHeight: 70, maxHeight: 120 }}
                placeholder="Is variant ki khaas baat kya hai? Customer ko yeh dikhega…"
                value={data.description || ""}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            {/* Admin Notes — internal only */}
            <div className="vmodal-field">
              <label className="vmodal-label">
                Admin Notes <span className="vmodal-opt">(internal only)</span>
                <span className="vmodal-field-hint">
                  🔒 Sirf admin ke liye — customer ko nahi dikhega
                </span>
              </label>
              <textarea
                className="apf-textarea"
                rows={2}
                style={{ minHeight: 50, maxHeight: 80 }}
                placeholder="e.g. Supplier se 2 weeks mein aayega, fragile packaging…"
                value={data.adminNotes || ""}
                onChange={(e) => set("adminNotes", e.target.value)}
              />
            </div>

            {/* Placement override */}
            <div className="vmodal-field">
              <label className="vmodal-label">
                Placement <span className="vmodal-opt">(override)</span>
              </label>
              <div className="vmodal-chip-row">
                {[
                  { value: "", label: "Same as product" },
                  { value: "shop", label: "🏠 Homepage Shop" },
                  { value: "collection", label: "📦 Collection Page" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`vmodal-chip ${(data.displaySection || "") === opt.value ? "vmodal-chip--active" : ""}`}
                    onClick={() => set("displaySection", opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status override */}
            <div className="vmodal-field">
              <label className="vmodal-label">
                Status <span className="vmodal-opt">(override)</span>
              </label>
              <div className="vmodal-chip-row vmodal-chip-row--wrap">
                <button
                  type="button"
                  className={`vmodal-chip ${!data.status ? "vmodal-chip--active" : ""}`}
                  onClick={() => set("status", "")}
                >
                  Same as product
                </button>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`vmodal-chip vmodal-chip--status ${data.status === opt.value ? "vmodal-chip--status-active" : ""}`}
                    style={{ "--sc": opt.color, "--sc-rgb": opt.rgb }}
                    onClick={() => set("status", opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="vmodal-footer">
          <button type="button" className="vmodal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="vmodal-save"
            disabled={!canSave}
            onClick={() => {
              onSave(buildSaveData());
              onClose();
            }}
          >
            ✓ Save Variant
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  VARIANTS SECTION
// ─────────────────────────────────────────────────────
function VariantsSection({ variants, basePrice, onChange, error }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const BLANK = {
    type: "size",
    value: "",
    title: "",
    priceModifier: 0,
    stock: "",
    imageFile: null,
    imagePreview: null,
    imageFiles: [],
    imagePreviews: [],
    tags: [],
    category: "",
    description: "",
    adminNotes: "",
    displaySection: "",
    status: "",
  };

  const openAdd = () => {
    setIsAddingNew(true);
    setEditingIndex(null);
  };
  const openEdit = (i) => {
    setEditingIndex(i);
    setIsAddingNew(false);
  };
  const close = () => {
    setEditingIndex(null);
    setIsAddingNew(false);
  };

  const saveNew = (data) => {
    onChange([...variants, data]);
    close();
  };
  const saveEdit = (i, data) => {
    onChange(variants.map((v, idx) => (idx === i ? data : v)));
    close();
  };
  const remove = (i) => {
    if (variants[i]?.imagePreview)
      URL.revokeObjectURL(variants[i].imagePreview);
    onChange(variants.filter((_, idx) => idx !== i));
  };

  const base = parseFloat(basePrice) || 0;

  return (
    <section className="apf-section">
      <div className="apf-variants-header">
        <div>
          <h2 className="apf-section-title" style={{ marginBottom: 6 }}>
            Product Variants
          </h2>
          <p className="apf-variants-hint">
            Same product, <strong>different size, color or material?</strong>
            &nbsp;
            <em>Leave empty if product has only one version.</em>
          </p>
        </div>
        <button type="button" className="apf-variant-add-btn" onClick={openAdd}>
          + Add Variant
        </button>
      </div>

      {variants.length === 0 ? (
        <div
          className="apf-variant-empty"
          onClick={openAdd}
          style={{ cursor: "pointer" }}
        >
          <span className="apf-variant-empty-icon">🎴</span>
          <p>No variants yet</p>
          <p className="apf-variant-empty-sub">
            e.g. Zoro figure in <strong>Gold</strong> and{" "}
            <strong>Silver</strong>?<br />
            Click <strong>+ Add Variant</strong> to get started.
          </p>
        </div>
      ) : (
        <div className="apf-variant-grid">
          {variants.map((v, i) => {
            const finalPrice = base + Number(v.priceModifier || 0);
            const typeInfo = VARIANT_TYPES.find((t) => t.value === v.type);
            return (
              <div key={i} className="apf-vcard">
                <div className="apf-vcard-img" onClick={() => openEdit(i)}>
                  {v.imagePreviews?.[0] || v.imagePreview ? (
                    <>
                      <img
                        src={v.imagePreviews?.[0] || v.imagePreview}
                        alt={v.value}
                        className="apf-vcard-img-fill"
                      />
                      <div className="apf-vcard-img-overlay">✏️ Edit</div>
                      {(v.imagePreviews?.length || 0) > 1 && (
                        <span className="apf-vcard-img-count">
                          +{v.imagePreviews.length - 1}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="apf-vcard-img-empty">
                      <span style={{ fontSize: 30, opacity: 0.35 }}>
                        {typeInfo?.icon}
                      </span>
                      <span className="apf-vcard-img-empty-text">
                        Click to add image
                      </span>
                    </div>
                  )}
                  <span className="apf-vcard-type-badge">
                    {typeInfo?.icon} {v.type}
                  </span>
                </div>

                <div className="apf-vcard-info">
                  <p className="apf-vcard-value">
                    {v.value || <em style={{ opacity: 0.35 }}>No value</em>}
                  </p>
                  {v.title && <p className="apf-vcard-title">{v.title}</p>}
                  <div className="apf-vcard-meta">
                    <span className="apf-vcard-price">
                      {base > 0
                        ? `₹${finalPrice.toLocaleString("en-IN")}`
                        : "—"}
                      {Number(v.priceModifier) !== 0 && (
                        <span
                          className={`apf-vcard-diff ${Number(v.priceModifier) > 0 ? "up" : "down"}`}
                        >
                          {Number(v.priceModifier) > 0 ? "+" : ""}₹
                          {Number(v.priceModifier).toLocaleString("en-IN")}
                        </span>
                      )}
                    </span>
                    <span className="apf-vcard-stock">📦 {v.stock || 0}</span>
                  </div>
                  {(v.tags || []).length > 0 && (
                    <div className="apf-vcard-tags">
                      {v.tags.slice(0, 3).map((t, ti) => (
                        <span key={ti} className="apf-vcard-tag">
                          {t}
                        </span>
                      ))}
                      {v.tags.length > 3 && (
                        <span className="apf-vcard-tag">
                          +{v.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="apf-vcard-actions">
                  <button
                    type="button"
                    className="apf-vcard-btn apf-vcard-edit"
                    onClick={() => openEdit(i)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="apf-vcard-btn apf-vcard-del"
                    onClick={() => remove(i)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}

          <div className="apf-vcard apf-vcard--add" onClick={openAdd}>
            <span className="apf-vcard-add-icon">+</span>
            <span className="apf-vcard-add-text">Add Variant</span>
          </div>
        </div>
      )}

      <FieldError error={error} />

      {isAddingNew && (
        <VariantModal
          variant={BLANK}
          index={variants.length}
          basePrice={basePrice}
          onSave={saveNew}
          onClose={close}
        />
      )}
      {editingIndex !== null && (
        <VariantModal
          variant={variants[editingIndex]}
          index={editingIndex}
          basePrice={basePrice}
          onSave={(data) => saveEdit(editingIndex, data)}
          onClose={close}
        />
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────────────
export default function AddProductForm() {
  const {
    form,
    errors,
    status,
    message,
    isFormValid,
    handleChange,
    handleVariantsChange,
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
      <header className="apf-page-header">
        <h1 className="apf-page-title">Add New Product</h1>
        <p className="apf-page-sub">
          Fill in the details below to add a new item to your catalog.
        </p>
      </header>

      <Toast status={status} message={message} onClose={handleReset} />

      <form onSubmit={handleSubmit} noValidate>
        <div className="apf-layout">
          <div className="glass-card apf-form-card">
            {/* ── Basic Information ── */}
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
              </div>
              <div className="apf-field">
                <label className="apf-label">
                  Tags <span>*</span>
                </label>
                <div className="apf-tag-container">
                  <div className="apf-tag-list">
                    {form.tags.map((tag, index) => (
                      <span key={index} className="apf-tag-chip">
                        {tag}
                        <button
                          type="button"
                          onClick={() =>
                            handleChange({
                              target: {
                                name: "tags",
                                value: form.tags.filter((_, i) => i !== index),
                              },
                            })
                          }
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
                        const v = e.target.value.trim().toLowerCase();
                        if (!v || form.tags.includes(v)) return;
                        handleChange({
                          target: { name: "tags", value: [...form.tags, v] },
                        });
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
                <FieldError error={errors.tags} />
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
              <div className="apf-field">
                <label htmlFor="variantGroup" className="apf-label">
                  Variant Group{" "}
                  <span style={{ opacity: 0.45, fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <input
                  id="variantGroup"
                  name="variantGroup"
                  type="text"
                  className="apf-input"
                  placeholder="e.g. dodge-challenger-series — links products as versions of each other"
                  value={form.variantGroup || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  Same group name on two products = they appear as "Other
                  Versions" on each other's page. Both still show as separate
                  cards everywhere.
                </p>
              </div>
            </section>

            {/* ── Pricing & Inventory ── */}
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
                      handleFileChange({
                        target: { files: e.dataTransfer.files },
                      });
                    }}
                  >
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                    />
                    <p className="apf-dropzone-text">
                      Drag & drop images here or <span>click to upload</span>
                    </p>
                    <small>Maximum 8 images</small>
                  </div>
                  {imageFiles?.length > 0 && (
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
                            )
                              reorderImages(
                                dragItem.current,
                                dragOverItem.current,
                              );
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
                  <FieldError error={errors.image} />
                </div>
              </div>
            </section>

            {/* ── Product Placement ── */}
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

            {/* ── Product Status ── */}
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

            {/* ── Variants ── */}
            <VariantsSection
              variants={form.variants}
              basePrice={form.basePrice}
              onChange={handleVariantsChange}
              error={errors.variants}
            />

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

          {/* Preview Card */}
          <aside className="glass-card apf-preview-card">
            <p className="preview-title">Live Preview</p>
            <div className="preview-img">
              {imageFiles?.length > 0 ? (
                <img
                  src={URL.createObjectURL(imageFiles[0])}
                  onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                  alt="Preview"
                />
              ) : (
                "🎴"
              )}
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
            {form.variants.length > 0 && (
              <div className="apf-preview-variants">
                <p className="apf-preview-variants-label">
                  Variants ({form.variants.length})
                </p>
                <div className="apf-preview-variants-chips">
                  {form.variants
                    .filter((v) => v.value)
                    .map((v, i) => (
                      <span key={i} className="apf-preview-variant-chip">
                        {v.imagePreview && (
                          <img
                            src={v.imagePreview}
                            alt={v.value}
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 2,
                              objectFit: "cover",
                            }}
                          />
                        )}
                        {v.value}
                        {Number(v.priceModifier) !== 0 && (
                          <span className="apf-preview-variant-mod">
                            {Number(v.priceModifier) > 0 ? "+" : ""}₹
                            {Number(v.priceModifier).toLocaleString("en-IN")}
                          </span>
                        )}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </form>
    </div>
  );
}
