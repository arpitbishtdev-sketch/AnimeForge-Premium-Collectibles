import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditProduct.css";
import "../admin/styles/Addproductform.css"; // reuse variant modal styles

// ─────────────────────────────────────────────────────
//  Reuse VariantsSection + VariantModal from AddProductForm
// ─────────────────────────────────────────────────────
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
    placeholder: "e.g. Resin, PVC, Diecast",
    icon: "🧱",
  },
  {
    value: "custom",
    label: "✏️ Custom",
    placeholder: "e.g. Signed Edition, Bundle",
    icon: "✏️",
  },
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

const VARIANT_BLANK = {
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

// ── Variant Modal ────────────────────────────────────────────────────────────
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

  const set = (field, val) => setData((p) => ({ ...p, [field]: val }));

  const addImages = (files) => {
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setData((prev) => {
      const combined = [...(prev.imageFiles || []), ...imgs].slice(0, 8);
      const previews = combined.map((f, i) =>
        i < (prev.imagePreviews || []).length
          ? prev.imagePreviews[i]
          : URL.createObjectURL(f),
      );
      return { ...prev, imageFiles: combined, imagePreviews: previews };
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
          {/* Left — images */}
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
                    <img src={src} alt={`v-${i}`} />
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

          {/* Right — fields */}
          <div className="vmodal-right">
            {/* Type chips */}
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
                <span className="vmodal-field-hint">e.g. "Gold", "Large"</span>
              </label>
              <input
                className="apf-input"
                placeholder={typeInfo?.placeholder}
                value={data.value}
                onChange={(e) => set("value", e.target.value)}
              />
            </div>

            {/* Title */}
            <div className="vmodal-field">
              <label className="vmodal-label">
                Title <span className="vmodal-opt">(optional)</span>
              </label>
              <input
                className="apf-input"
                placeholder="e.g. Lightning McQueen Special Edition"
                value={data.title || ""}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="vmodal-field">
              <label className="vmodal-label">
                Tags <span className="vmodal-opt">(optional)</span>
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

            {/* Price modifier */}
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

            {/* Description */}
            <div className="vmodal-field">
              <label className="vmodal-label">
                Description <span className="vmodal-opt">(optional)</span>
              </label>
              <textarea
                className="apf-textarea"
                rows={3}
                style={{ minHeight: 70, maxHeight: 120 }}
                placeholder="Override product description for this variant…"
                value={data.description || ""}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            {/* Admin Notes */}
            <div className="vmodal-field">
              <label className="vmodal-label">
                Admin Notes <span className="vmodal-opt">(internal only)</span>
              </label>
              <textarea
                className="apf-textarea"
                rows={2}
                style={{ minHeight: 50, maxHeight: 80 }}
                placeholder="Internal notes…"
                value={data.adminNotes || ""}
                onChange={(e) => set("adminNotes", e.target.value)}
              />
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

// ── Variants Section ─────────────────────────────────────────────────────────
function VariantsSection({ variants, basePrice, onChange, productId }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

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
  const remove = (i) => onChange(variants.filter((_, idx) => idx !== i));

  const base = parseFloat(basePrice) || 0;

  return (
    <div>
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
                  ) : // Show saved image URL from backend if present
                  v.images?.[0]?.url || v.image?.url ? (
                    <>
                      <img
                        src={v.images?.[0]?.url || v.image?.url}
                        alt={v.value}
                        className="apf-vcard-img-fill"
                      />
                      <div className="apf-vcard-img-overlay">✏️ Edit</div>
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
                    className="apf-vcard-btn apf-vcard-promote"
                    title="Promote to independent product"
                    onClick={async () => {
                      if (
                        !window.confirm(
                          `Promote "${v.value}" as its own product in the collection?`,
                        )
                      )
                        return;
                      try {
                        const res = await fetch(
                          `/api/products/${productId}/promote-variant/${i}`,
                          {
                            method: "POST",
                          },
                        );
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message);
                        alert(
                          `✅ "${data.product.name}" created! You can edit it from Products list.`,
                        );
                      } catch (err) {
                        alert(`❌ Failed: ${err.message}`);
                      }
                    }}
                  >
                    ⬆️ Promote
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

      {isAddingNew && (
        <VariantModal
          variant={VARIANT_BLANK}
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
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  Variant Group Picker
// ─────────────────────────────────────────────────────
function VariantGroupPicker({ value, onChange }) {
  const [groups, setGroups] = useState([]); // { group, count }[]
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    fetch("/api/products?limit=50")
      .then((r) => r.json())
      .then((data) => {
        const products = Array.isArray(data) ? data : [];
        const map = {};
        products.forEach((p) => {
          if (p.variantGroup) {
            map[p.variantGroup] = (map[p.variantGroup] || 0) + 1;
          }
        });
        setGroups(
          Object.entries(map).map(([group, count]) => ({ group, count })),
        );
      })
      .catch(() => {})
      .finally(() => setLoadingGroups(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = groups.filter((g) =>
    g.group.includes((value || "").toLowerCase()),
  );

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <input
        type="text"
        className="ep-input"
        placeholder="e.g. dodge-challenger-series — or pick existing below"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        autoComplete="off"
      />

      {showDropdown && (
        <div className="ep-vg-dropdown">
          {loadingGroups ? (
            <div className="ep-vg-dropdown__loading">Loading groups…</div>
          ) : filtered.length === 0 && !value ? (
            <div className="ep-vg-dropdown__empty">
              No groups yet — type a name to create one
            </div>
          ) : filtered.length === 0 ? (
            <div className="ep-vg-dropdown__empty">
              Press Enter to create "{value}"
            </div>
          ) : (
            filtered.map(({ group, count }) => (
              <button
                key={group}
                type="button"
                className="ep-vg-dropdown__item"
                onClick={() => {
                  onChange(group);
                  setShowDropdown(false);
                }}
              >
                <span className="ep-vg-dropdown__name">{group}</span>
                <span className="ep-vg-dropdown__count">
                  {count} product{count !== 1 ? "s" : ""}
                </span>
              </button>
            ))
          )}
          {value && !groups.find((g) => g.group === value) && (
            <div className="ep-vg-dropdown__new">
              ✦ New group: <strong>{value}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  Main EditProduct
// ─────────────────────────────────────────────────────
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
  variantGroup: "",
  variants: [],
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
  const [tagInput, setTagInput] = useState("");
  const [allImages, setAllImages] = useState([]);

  const fileInputRef = useRef(null);
  const dragSrcIdx = useRef(null);

  // ── Fetch status colors ──
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data) => {
        const map = {};
        data.forEach((s) => {
          map[s.status] = s.color;
        });
        setStatusColors(map);
      })
      .catch(() => {});
  }, []);

  // ── Fetch product ──
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
          variantGroup: p.variantGroup ?? "",
          // Normalise variants: populate imagePreviews from saved image URLs
          variants: (p.variants ?? []).map((v) => ({
            ...v,
            imageFiles: [],
            imagePreviews: v.images?.length
              ? v.images.map((img) => img.url)
              : v.image?.url
                ? [v.image.url]
                : [],
          })),
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

  // ── Handlers ──
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

  const handleVariantGroupChange = useCallback((val) => {
    setForm((prev) => ({ ...prev, variantGroup: val }));
  }, []);

  const handleVariantsChange = useCallback((newVariants) => {
    setForm((prev) => ({ ...prev, variants: newVariants }));
  }, []);

  // Tags
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
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
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
      )
        setForm((prev) => ({ ...prev, tags: prev.tags.slice(0, -1) }));
    },
    [tagInput, form.tags, addTag],
  );

  // Images
  const addFiles = useCallback((files) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) =>
        setAllImages((prev) => [
          ...prev,
          { type: "new", url: e.target.result, file, name: file.name },
        ]);
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
  const removeImage = useCallback(
    (i) => setAllImages((prev) => prev.filter((_, idx) => idx !== i)),
    [],
  );
  const setPrimary = useCallback(
    (i) =>
      setAllImages((prev) => {
        const a = [...prev];
        const [m] = a.splice(i, 1);
        a.unshift(m);
        return a;
      }),
    [],
  );
  const handleThumbDragStart = useCallback((e, i) => {
    dragSrcIdx.current = i;
    e.dataTransfer.effectAllowed = "move";
  }, []);
  const handleThumbDragOver = useCallback((e, i) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(i);
  }, []);
  const handleThumbDrop = useCallback((e, i) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIdx(null);
    const from = dragSrcIdx.current;
    if (from === null || from === i) return;
    setAllImages((prev) => {
      const a = [...prev];
      const [m] = a.splice(from, 1);
      a.splice(i, 0, m);
      return a;
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

        // Variant Group
        const vg = (form.variantGroup || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
        formData.append("variantGroup", vg);

        // Variants metadata (no File objects)
        const variantsMeta = form.variants
          .filter((v) => v.value?.trim())
          .map((v) => ({
            type: v.type,
            value: v.value,
            priceModifier: Number(v.priceModifier) || 0,
            stock: Number(v.stock) || 0,
            ...(v.title?.trim() ? { title: v.title.trim() } : {}),
            ...(v.description?.trim()
              ? { description: v.description.trim() }
              : {}),
            ...(v.tags?.length ? { tags: v.tags } : {}),
            ...(v.adminNotes?.trim()
              ? { adminNotes: v.adminNotes.trim() }
              : {}),
            ...(v.category ? { category: v.category } : {}),
            ...(v.displaySection ? { displaySection: v.displaySection } : {}),
            ...(v.status ? { status: v.status } : {}),
            // Pass existing saved image references so backend doesn't wipe them
            ...(v.image?.url ? { image: v.image } : {}),
            ...(v.images?.length
              ? {
                  images: v.images.filter(
                    (img) => img.url && !img.url.startsWith("blob:"),
                  ),
                }
              : {}),
          }));
        formData.append("variants", JSON.stringify(variantsMeta));

        // Variant new image files
        form.variants.forEach((v, vi) => {
          const files = v.imageFiles?.length
            ? v.imageFiles
            : v.imageFile
              ? [v.imageFile]
              : [];
          files.forEach((f, fi) => {
            if (f instanceof File)
              formData.append(`variantImage_${vi}_${fi}`, f);
          });
        });

        // Main image order
        const savedOrder = allImages
          .filter((i) => i.type === "saved")
          .map((i) => i.public_id);
        formData.append("imageOrder", JSON.stringify(savedOrder));
        allImages
          .filter((i) => i.type === "new")
          .forEach((i) => formData.append("images", i.file));

        const res = await fetch(`/api/products/${id}`, {
          method: "PUT",
          body: formData,
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.message || errBody.error || "Update failed");
        }
        navigate("/admin/products");
      } catch (err) {
        setSaveError(err.message);
      } finally {
        setSaving(false);
      }
    },
    [form, allImages, id, navigate],
  );

  // ── Render guards ──
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

            {/* Tags */}
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

            {/* ── Variant Group ── */}
            <div className="ep-field">
              <label className="ep-label">
                Variant Group{" "}
                <span className="ep-hint">
                  (optional — links products as versions of each other)
                </span>
              </label>
              <VariantGroupPicker
                value={form.variantGroup}
                onChange={handleVariantGroupChange}
              />
              {form.variantGroup && (
                <button
                  type="button"
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: "var(--text-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  onClick={() => handleVariantGroupChange("")}
                >
                  ✕ Clear group
                </button>
              )}
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

        {/* ── Variants ── */}
        <div className="ep-section-divider">
          <span className="ep-section-divider__label">Product Variants</span>
        </div>
        <div style={{ padding: "0 0 24px" }}>
          <VariantsSection
            variants={form.variants}
            basePrice={form.basePrice}
            onChange={handleVariantsChange}
            productId={id}
          />
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

      {/* Dropdown CSS injected inline to avoid new CSS file */}
      <style>{`
        .ep-vg-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0; right: 0;
          background: #1a1a2e;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          z-index: 100;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .ep-vg-dropdown__loading,
        .ep-vg-dropdown__empty {
          padding: 12px 16px;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
        }
        .ep-vg-dropdown__item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 10px 16px;
          background: none;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: var(--text-primary, #fff);
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }
        .ep-vg-dropdown__item:hover { background: rgba(255,255,255,0.06); }
        .ep-vg-dropdown__name  { font-size: 13px; }
        .ep-vg-dropdown__count { font-size: 11px; color: rgba(255,255,255,0.35); }
        .ep-vg-dropdown__new {
          padding: 10px 16px;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          border-top: 1px solid rgba(255,255,255,0.06);
        }
      `}</style>
    </div>
  );
}
