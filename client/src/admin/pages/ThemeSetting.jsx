import React, { useEffect, useState } from "react";
import { useRef } from "react";
// ─── Helpers ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  status: "New",
  edition: "",
  subtitle: "",
  description: "",
  price: "",
  carouselImages: [],
  accent: "#00f0ff",
  glow: "#00f0ff",
  particle: "#ffffff",
  radialGradient: "",
  linearGradient: "",
  image: "",
  model3d: "",
};
// ─── Live Preview Card ───────────────────────────────────────────────────────

const PreviewCard = ({ form }) => {
  const bg =
    form.radialGradient ||
    `radial-gradient(ellipse at 60% 40%, ${form.accent}22 0%, #0a0a0a 70%)`;

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${form.accent}55`,
        boxShadow: `0 0 24px ${form.glow}33`,
        borderRadius: "12px",
        padding: "24px",
        minHeight: "180px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      {/* Glow orb */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: form.glow,
          opacity: 0.15,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {form.image && (
        <img
          src={form.image}
          alt="preview"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            objectFit: "cover",
            border: `2px solid ${form.accent}`,
            boxShadow: `0 0 12px ${form.glow}88`,
          }}
        />
      )}

      <div>
        <p
          style={{
            color: "#888",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          Theme Preview
        </p>
        <h3
          style={{
            margin: "4px 0 0",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: form.accent,
            textShadow: `0 0 12px ${form.glow}`,
          }}
        >
          {form.name || "Untitled Theme"}
        </h3>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {[
          { label: "Accent", value: form.accent },
          { label: "Glow", value: form.glow },
          { label: "Particle", value: form.particle },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "#ffffff0f",
              border: `1px solid ${value}55`,
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "11px",
              color: value,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: value,
                display: "inline-block",
                boxShadow: `0 0 6px ${value}`,
              }}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Color Input Row ─────────────────────────────────────────────────────────

const ColorField = ({ label, name, value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={styles.label}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <input
        type="color"
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: "42px",
          height: "42px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          padding: "2px",
          background: "transparent",
        }}
      />
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        style={{ ...styles.input, flex: 1, fontFamily: "monospace" }}
        placeholder="#000000"
      />
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const ThemeSettings = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [themes, setThemes] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [uploadingCarousel, setUploadingCarousel] = useState(false);

  const dragItem = useRef();
  const dragOverItem = useRef();

  const themeDragItem = useRef();
  const themeDragOver = useRef();
  // ── Data fetching ──────────────────────────────────────────────────────────

  const loadThemes = async () => {
    try {
      const res = await fetch("/api/themes");
      const data = await res.json();
      setThemes(data);
    } catch {
      setError("Failed to load themes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThemes();
  }, []);

  // ── Form handlers ──────────────────────────────────────────────────────────

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const [uploadingCharacter, setUploadingCharacter] = useState(false);

  const handleCharacterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCharacter(true);
    setForm((prev) => ({ ...prev, image: "" }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload?type=character", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setForm((prev) => ({ ...prev, image: data.url }));
    } catch {
      setError("Character image upload failed.");
    } finally {
      setUploadingCharacter(false);
      e.target.value = "";
    }
  };

  // AFTER
  const handleModelUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setForm((prev) => ({
      ...prev,
      model3d: data.url,
    }));
  };

  const handleCarouselUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    setUploadingCarousel(true);

    try {
      const uploaded = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload?type=hero", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        uploaded.push(data.url);

        // update progress
        setUploadProgress(Math.round((uploaded.length / files.length) * 100));
      }

      setForm((prev) => ({
        ...prev,
        carouselImages: [...prev.carouselImages, ...uploaded],
      }));
    } finally {
      setUploadingCarousel(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleEdit = (theme) => {
    setEditingId(theme._id);
    setForm({
      name: theme.name || "",
      status: theme.status || "New",
      edition: theme.edition || "",
      subtitle: theme.subtitle || "",
      description: theme.description || "",
      price: theme.price || "",
      carouselImages: theme.carouselImages || [],
      accent: theme.accent || "#00f0ff",
      glow: theme.glow || "#00f0ff",
      particle: theme.particle || "#ffffff",
      radialGradient: theme.radialGradient || "",
      linearGradient: theme.linearGradient || "",
      image: theme.image || "",
      model3d: theme.model3d || "",
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Theme name is required.");
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = editingId ? `/api/themes/${editingId}` : "/api/themes";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          model3d: form.model3d || undefined,
          carouselImages: form.carouselImages?.length
            ? form.carouselImages
            : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Request failed");
      }
      setSuccess(editingId ? "Theme updated!" : "Theme created!");
      resetForm();
      loadThemes();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this theme?")) return;
    try {
      const res = await fetch(`/api/themes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSuccess("Theme deleted.");
      if (editingId === id) resetForm();
      loadThemes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleActivate = async (id) => {
    try {
      const res = await fetch(`/api/themes/${id}/activate`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Activation failed");
      setSuccess("Theme activated!");
      loadThemes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleThemeSort = async () => {
    if (
      themeDragItem.current === undefined ||
      themeDragOver.current === undefined
    )
      return;

    const copy = [...themes];

    const dragged = copy.splice(themeDragItem.current, 1)[0];
    copy.splice(themeDragOver.current, 0, dragged);

    setThemes(copy);

    try {
      await fetch("/api/themes/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: copy.map((t) => t._id),
        }),
      });
    } catch (err) {
      console.error(err);
    }

    themeDragItem.current = null;
    themeDragOver.current = null;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Theme Settings</h1>
        <p style={styles.subtitle}>
          Manage character themes for the storefront.
        </p>
      </div>

      <div style={styles.grid}>
        {/* ── Left: Form ── */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            {editingId ? "Edit Theme" : "New Theme"}
          </h2>

          {error && <div style={styles.alert("error")}>{error}</div>}
          {success && <div style={styles.alert("success")}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Name */}
            <div style={styles.field}>
              <label style={styles.label}>Theme Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g. Naruto, Gojo, Levi"
              />
            </div>

            {/* Status */}
            <div style={styles.field}>
              <label style={styles.label}>Status Badge</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={styles.input}
              >
                <option>New</option>
                <option>Popular</option>
                <option>Rare</option>
                <option>Featured</option>
                <option>Bestseller</option>
                <option>Ultra Rare</option>
              </select>
            </div>

            {/* Edition */}
            <div style={styles.field}>
              <label style={styles.label}>Edition</label>
              <input
                type="text"
                name="edition"
                value={form.edition}
                onChange={handleChange}
                style={styles.input}
                placeholder="Sage Mode Edition"
              />
            </div>

            {/* Subtitle */}
            <div style={styles.field}>
              <label style={styles.label}>Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                style={styles.input}
                placeholder="Uzumaki Naruto"
              />
            </div>

            {/* Description */}
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                style={styles.input}
                placeholder="Product description"
              />
            </div>

            {/* Price */}
            <div style={styles.field}>
              <label style={styles.label}>Price</label>
              <input
                type="text"
                name="price"
                value={form.price}
                onChange={handleChange}
                style={styles.input}
                placeholder="$349"
              />
            </div>

            {/* Color pickers */}
            <div style={styles.twoCol}>
              <ColorField
                label="Accent Color"
                name="accent"
                value={form.accent}
                onChange={handleChange}
              />
              <ColorField
                label="Glow Color"
                name="glow"
                value={form.glow}
                onChange={handleChange}
              />
            </div>
            <div style={styles.field}>
              <ColorField
                label="Particle Color"
                name="particle"
                value={form.particle}
                onChange={handleChange}
              />
            </div>

            {/* Gradients */}
            <div style={styles.field}>
              <label style={styles.label}>Radial Gradient (CSS)</label>
              <input
                type="text"
                name="radialGradient"
                value={form.radialGradient}
                onChange={handleChange}
                style={styles.input}
                placeholder="radial-gradient(ellipse at 60% 40%, #0a1628 0%, #000 70%)"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Linear Gradient (CSS)</label>
              <input
                type="text"
                name="linearGradient"
                value={form.linearGradient}
                onChange={handleChange}
                style={styles.input}
                placeholder="linear-gradient(135deg, #0a1628 0%, #000 100%)"
              />
            </div>

            {/* Character Image Upload */}

            <div style={styles.field}>
              <label style={styles.label}>Character Image</label>
              <input
                type="file"
                accept="image/png,image/webp,image/jpeg"
                onChange={handleCharacterUpload}
                style={styles.input}
                disabled={uploadingCharacter}
              />
              {uploadingCharacter && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      border: "2px solid #6c63ff",
                      borderTopColor: "transparent",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#aaa" }}>
                    Uploading…
                  </span>
                </div>
              )}
              {form.image && !uploadingCharacter && (
                <img
                  src={form.image}
                  alt="character preview"
                  style={{
                    marginTop: "10px",
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #333",
                  }}
                />
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>3D Model (GLB)</label>

              <input
                type="file"
                accept=".glb"
                onChange={handleModelUpload}
                style={styles.input}
              />
            </div>

            {/* Carousel Images Upload */}
            <div style={styles.field}>
              <label style={styles.label}>Hero Carousel Images</label>

              <input
                type="file"
                multiple
                accept="image/png,image/webp"
                onChange={handleCarouselUpload}
                style={styles.input}
                disabled={uploadingCarousel}
              />

              {uploadingCarousel && (
                <div
                  style={{
                    height: "6px",
                    width: "100%",
                    background: "#222",
                    borderRadius: "4px",
                    overflow: "hidden",
                    marginTop: "6px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${uploadProgress}%`,
                      background: "#6c63ff",
                      transition: "width 0.2s",
                    }}
                  />
                </div>
              )}

              {form.carouselImages.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginTop: "8px",
                  }}
                >
                  {form.carouselImages.map((img, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={() => (dragItem.current = i)}
                      onDragEnter={() => (dragOverItem.current = i)}
                      onDragEnd={() => {
                        const copy = [...form.carouselImages];
                        const dragged = copy.splice(dragItem.current, 1)[0];
                        copy.splice(dragOverItem.current, 0, dragged);

                        setForm((prev) => ({
                          ...prev,
                          carouselImages: copy,
                        }));
                      }}
                      style={{
                        position: "relative",
                        width: "50px",
                        height: "50px",
                        cursor: "grab",
                      }}
                    >
                      <img
                        src={img}
                        alt="carousel preview"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #333",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            carouselImages: prev.carouselImages.filter(
                              (_, idx) => idx !== i,
                            ),
                          }))
                        }
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          border: "none",
                          background: "#e74c3c",
                          color: "#fff",
                          fontSize: "10px",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview */}
            <div style={styles.field}>
              <label style={styles.label}>Live Preview</label>
              <PreviewCard form={form} />
            </div>

            {/* Actions */}
            <div style={styles.buttonRow}>
              <button type="submit" style={styles.btnPrimary} disabled={saving}>
                {saving
                  ? "Saving…"
                  : editingId
                    ? "Update Theme"
                    : "Create Theme"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={styles.btnSecondary}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── Right: Theme List ── */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>All Themes</h2>
          {loading ? (
            <p style={{ color: "#888" }}>Loading…</p>
          ) : themes.length === 0 ? (
            <p style={{ color: "#888" }}>No themes yet. Create one!</p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {themes.map((theme, index) => (
                <div
                  key={theme._id}
                  draggable
                  onDragStart={() => (themeDragItem.current = index)}
                  onDragEnter={() => (themeDragOver.current = index)}
                  onDragEnd={handleThemeSort}
                  onDragOver={(e) => e.preventDefault()}
                  style={{
                    ...styles.themeRow,
                    border: `1px solid ${theme.active ? theme.accent : "#2a2a3a"}`,
                    boxShadow: theme.active
                      ? `0 0 12px ${theme.glow}33`
                      : "none",
                  }}
                >
                  {/* Color swatch + name */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: theme.image
                          ? `url(${theme.image}) center/cover`
                          : theme.accent,
                        boxShadow: `0 0 10px ${theme.glow}88`,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          color: "#eee",
                          fontSize: "0.95rem",
                        }}
                      >
                        {theme.name.split(" ")[0]}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "11px",
                          color: theme.accent,
                          fontFamily: "monospace",
                        }}
                      >
                        {theme.accent}
                      </p>
                    </div>
                    {theme.active && <span style={styles.badge}>Active</span>}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    {!theme.active && (
                      <button
                        onClick={() => handleActivate(theme._id)}
                        style={styles.btnSmall("activate")}
                        title="Set as active theme"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(theme)}
                      style={styles.btnSmall("edit")}
                      title="Edit theme"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(theme._id)}
                      style={styles.btnSmall("delete")}
                      title="Delete theme"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = {
  page: {
    padding: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
    color: "#eee",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 8px",
  },
  subtitle: {
    color: "#888",
    margin: 0,
    fontSize: "0.9rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    alignItems: "start",
  },
  card: {
    background: "#12121e",
    border: "1px solid #2a2a3a",
    borderRadius: "12px",
    padding: "28px",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#fff",
    margin: "0 0 20px",
    paddingBottom: "12px",
    borderBottom: "1px solid #2a2a3a",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  input: {
    background: "#0d0d1a",
    border: "1px solid #2a2a3a",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#eee",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  alert: (type) => ({
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "0.875rem",
    marginBottom: "4px",
    background: type === "error" ? "#2d0c0c" : "#0c2d1a",
    border: `1px solid ${type === "error" ? "#c0392b55" : "#27ae6055"}`,
    color: type === "error" ? "#e74c3c" : "#2ecc71",
  }),
  buttonRow: {
    display: "flex",
    gap: "12px",
    marginTop: "4px",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "11px 24px",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    flex: 1,
  },
  btnSecondary: {
    background: "transparent",
    color: "#aaa",
    border: "1px solid #3a3a4a",
    borderRadius: "8px",
    padding: "11px 20px",
    fontWeight: 500,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  themeRow: {
    background: "#0d0d1a",
    borderRadius: "10px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  badge: {
    background: "#1a2e1a",
    color: "#2ecc71",
    border: "1px solid #2ecc7155",
    borderRadius: "20px",
    padding: "2px 10px",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  btnSmall: (variant) => ({
    background:
      variant === "activate"
        ? "#1a2d1a"
        : variant === "edit"
          ? "#1a1a2d"
          : "#2d1a1a",
    color:
      variant === "activate"
        ? "#2ecc71"
        : variant === "edit"
          ? "#a78bfa"
          : "#e74c3c",
    border: `1px solid ${
      variant === "activate"
        ? "#2ecc7144"
        : variant === "edit"
          ? "#a78bfa44"
          : "#e74c3c44"
    }`,
    borderRadius: "6px",
    padding: "5px 12px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  }),
};

export default ThemeSettings;
