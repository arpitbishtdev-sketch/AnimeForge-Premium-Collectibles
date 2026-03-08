import React, { useEffect, useState, useRef, useCallback } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const CAROUSEL_LIMIT = 4;

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

// ─── Drop Zone ───────────────────────────────────────────────────────────────

const DropZone = ({ onFiles, accept, disabled, children, hint }) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      accept.some((a) =>
        f.type.includes(a.replace("image/", "").replace(".", "")),
      ),
    );
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragOver ? "#6c63ff" : "#3a3a4a"}`,
        borderRadius: "10px",
        padding: "20px",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        background: dragOver ? "#6c63ff11" : "#0d0d1a",
        transition: "all 0.2s ease",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(",")}
        multiple={hint?.includes("multiple")}
        style={{ display: "none" }}
        onChange={(e) => onFiles(Array.from(e.target.files))}
        disabled={disabled}
      />
      <div style={{ fontSize: "28px", marginBottom: "6px" }}>📁</div>
      <div style={{ fontSize: "12px", color: "#aaa" }}>{children}</div>
      {hint && (
        <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>
          {hint}
        </div>
      )}
    </div>
  );
};

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
  const [uploadingCharacter, setUploadingCharacter] = useState(false);

  // drag refs for carousel reorder
  const dragItem = useRef();
  const dragOverItem = useRef();

  // drag refs for theme list reorder
  const themeDragItem = useRef();
  const themeDragOver = useRef();

  // ── Data fetching ────────────────────────────────────────────────────────

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

  // ── Form handlers ────────────────────────────────────────────────────────

  // FIX 1: Theme name — block spacebar, only allow first word
  const handleNameChange = (e) => {
    const val = e.target.value.replace(/\s.*/, ""); // strip everything after first space
    setForm((prev) => ({ ...prev, name: val }));
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // FIX 4: Character image — drag & drop
  const handleCharacterFiles = useCallback(async (files) => {
    const file = files[0];
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
    }
  }, []);

  const handleModelUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setForm((prev) => ({ ...prev, model3d: data.url }));
  };

  // FIX 2 & 4: Carousel — drag & drop + smart 4-slot logic
  const handleCarouselFiles = useCallback(
    async (files) => {
      if (!files.length) return;

      const current = form.carouselImages;
      const slots = CAROUSEL_LIMIT; // always 4 total

      // How many of each existing image do we need?
      // New image fills remaining slots, existing images share the rest
      const newCount = files.length; // typically 1
      const existingCount = current.length;

      if (existingCount === 0 && newCount === 0) return;

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
          setUploadProgress(Math.round((uploaded.length / files.length) * 100));
        }

        setForm((prev) => {
          const existing = prev.carouselImages;
          const combined = [...existing, ...uploaded];

          // Build a balanced 4-slot array
          // Distribute slots: new images get 1 slot each, existing share rest
          const totalUnique = combined.length;
          if (totalUnique === 0) return prev;

          // Each unique image gets Math.floor(4/totalUnique) slots minimum
          // Remainder goes to first images
          const base = Math.floor(slots / totalUnique);
          const remainder = slots % totalUnique;

          const result = [];
          combined.forEach((img, idx) => {
            const count = base + (idx < remainder ? 1 : 0);
            for (let i = 0; i < count; i++) result.push(img);
          });

          // Trim/pad to exactly 4
          return { ...prev, carouselImages: result.slice(0, slots) };
        });
      } finally {
        setUploadingCarousel(false);
        setUploadProgress(0);
      }
    },
    [form.carouselImages],
  );

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
        body: JSON.stringify({ order: copy.map((t) => t._id) }),
      });
    } catch (err) {
      console.error(err);
    }
    themeDragItem.current = null;
    themeDragOver.current = null;
  };

  // FIX 3: Remove one instance of an image from carousel (reduces its count)
  const removeCarouselInstance = (idx) => {
    setForm((prev) => ({
      ...prev,
      carouselImages: prev.carouselImages.filter((_, i) => i !== idx),
    }));
  };

  // Get unique images with counts for display
  const carouselSummary = form.carouselImages.reduce((acc, url) => {
    const existing = acc.find((x) => x.url === url);
    if (existing) existing.count++;
    else acc.push({ url, count: 1 });
    return acc;
  }, []);

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
            {/* FIX 1: Name — no spaces allowed */}
            <div style={styles.field}>
              <label style={styles.label}>Theme Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleNameChange}
                onKeyDown={(e) => {
                  if (e.key === " ") e.preventDefault();
                }}
                style={styles.input}
                placeholder="e.g. Naruto, Gojo, Levi"
              />
              <span style={{ fontSize: "11px", color: "#555" }}>
                Single word only — spaces are disabled
              </span>
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

            {/* Colors */}
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

            {/* FIX 4: Character Image — drag & drop */}
            <div style={styles.field}>
              <label style={styles.label}>Character Image</label>
              <DropZone
                onFiles={handleCharacterFiles}
                accept={["image/png", "image/webp", "image/jpeg"]}
                disabled={uploadingCharacter}
              >
                {uploadingCharacter
                  ? "Uploading…"
                  : "Drag & drop or click to upload"}
              </DropZone>
              {form.image && !uploadingCharacter && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "8px",
                  }}
                >
                  <img
                    src={form.image}
                    alt="character preview"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #333",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, image: "" }))}
                    style={{ ...styles.btnSmall("delete"), fontSize: "11px" }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* 3D Model */}
            <div style={styles.field}>
              <label style={styles.label}>3D Model (GLB)</label>
              <input
                type="file"
                accept=".glb"
                onChange={handleModelUpload}
                style={styles.input}
              />
            </div>

            {/* FIX 2, 3, 4: Carousel — drag & drop + smart slots + reorder */}
            <div style={styles.field}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label style={styles.label}>Hero Carousel Images</label>
                <span
                  style={{
                    fontSize: "11px",
                    color:
                      form.carouselImages.length >= CAROUSEL_LIMIT
                        ? "#e74c3c"
                        : "#6c63ff",
                    fontWeight: 600,
                  }}
                >
                  {form.carouselImages.length} / {CAROUSEL_LIMIT} slots
                </span>
              </div>

              <DropZone
                onFiles={handleCarouselFiles}
                accept={["image/png", "image/webp"]}
                disabled={uploadingCarousel}
                hint="hint:multiple"
              >
                {uploadingCarousel
                  ? `Uploading… ${uploadProgress}%`
                  : form.carouselImages.length >= CAROUSEL_LIMIT
                    ? `4/4 slots full — add new image to replace existing`
                    : "Drag & drop or click to upload carousel images"}
              </DropZone>

              {uploadingCarousel && (
                <div
                  style={{
                    height: "4px",
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

              {/* Unique image summary with counts */}
              {carouselSummary.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#555",
                      margin: "0 0 8px",
                    }}
                  >
                    Drag thumbnails to reorder • Each image shows how many slots
                    it occupies
                  </p>
                  <div
                    style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                  >
                    {carouselSummary.map((item, si) => (
                      <div
                        key={item.url}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <div
                          draggable
                          onDragStart={() => (dragItem.current = si)}
                          onDragEnter={() => (dragOverItem.current = si)}
                          onDragEnd={() => {
                            // Reorder unique images, rebuild the full 4-slot array
                            const reordered = [...carouselSummary];
                            const dragged = reordered.splice(
                              dragItem.current,
                              1,
                            )[0];
                            reordered.splice(dragOverItem.current, 0, dragged);

                            // Redistribute slots proportionally
                            const total = reordered.reduce(
                              (s, x) => s + x.count,
                              0,
                            );
                            const result = [];
                            reordered.forEach((item) => {
                              for (let i = 0; i < item.count; i++)
                                result.push(item.url);
                            });
                            setForm((prev) => ({
                              ...prev,
                              carouselImages: result.slice(0, CAROUSEL_LIMIT),
                            }));
                            dragItem.current = null;
                            dragOverItem.current = null;
                          }}
                          style={{ position: "relative", cursor: "grab" }}
                        >
                          <img
                            src={item.url}
                            alt={`carousel-${si}`}
                            style={{
                              width: "64px",
                              height: "64px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "2px solid #3a3a4a",
                            }}
                          />
                          {/* Count badge */}
                          <div
                            style={{
                              position: "absolute",
                              top: "-6px",
                              left: "-6px",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: "#6c63ff",
                              color: "#fff",
                              fontSize: "11px",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {item.count}
                          </div>
                          {/* Remove one slot button */}
                          <button
                            type="button"
                            onClick={() => {
                              // Remove last occurrence of this image
                              const imgs = [...form.carouselImages];
                              const lastIdx = imgs.lastIndexOf(item.url);
                              if (lastIdx !== -1) imgs.splice(lastIdx, 1);
                              setForm((prev) => ({
                                ...prev,
                                carouselImages: imgs,
                              }));
                            }}
                            style={{
                              position: "absolute",
                              top: "-6px",
                              right: "-6px",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              border: "none",
                              background: "#e74c3c",
                              color: "#fff",
                              fontSize: "10px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: 1,
                            }}
                          >
                            ✕
                          </button>
                        </div>
                        {/* Slot controls */}
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            type="button"
                            disabled={
                              form.carouselImages.length >= CAROUSEL_LIMIT
                            }
                            onClick={() => {
                              if (form.carouselImages.length < CAROUSEL_LIMIT) {
                                setForm((prev) => ({
                                  ...prev,
                                  carouselImages: [
                                    ...prev.carouselImages,
                                    item.url,
                                  ],
                                }));
                              }
                            }}
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "4px",
                              background:
                                form.carouselImages.length >= CAROUSEL_LIMIT
                                  ? "#222"
                                  : "#1a2d1a",
                              color:
                                form.carouselImages.length >= CAROUSEL_LIMIT
                                  ? "#444"
                                  : "#2ecc71",
                              border: "1px solid #2a2a3a",
                              fontSize: "14px",
                              cursor:
                                form.carouselImages.length >= CAROUSEL_LIMIT
                                  ? "not-allowed"
                                  : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: 1,
                            }}
                            title="Add one more slot"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            disabled={item.count <= 1}
                            onClick={() => {
                              const imgs = [...form.carouselImages];
                              const lastIdx = imgs.lastIndexOf(item.url);
                              if (lastIdx !== -1) imgs.splice(lastIdx, 1);
                              setForm((prev) => ({
                                ...prev,
                                carouselImages: imgs,
                              }));
                            }}
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "4px",
                              background: item.count <= 1 ? "#222" : "#2d1a1a",
                              color: item.count <= 1 ? "#444" : "#e74c3c",
                              border: "1px solid #2a2a3a",
                              fontSize: "14px",
                              cursor:
                                item.count <= 1 ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: 1,
                            }}
                            title="Remove one slot"
                          >
                            −
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Slot visualization */}
                  <div
                    style={{ display: "flex", gap: "6px", marginTop: "12px" }}
                  >
                    {Array.from({ length: CAROUSEL_LIMIT }).map((_, i) => {
                      const img = form.carouselImages[i];
                      return (
                        <div
                          key={i}
                          style={{
                            width: "40px",
                            height: "8px",
                            borderRadius: "4px",
                            background: img ? "#6c63ff" : "#2a2a3a",
                            transition: "background 0.2s",
                          }}
                          title={
                            img
                              ? `Slot ${i + 1}: occupied`
                              : `Slot ${i + 1}: empty`
                          }
                        />
                      );
                    })}
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#555",
                        marginLeft: "4px",
                        lineHeight: "8px",
                      }}
                    >
                      {form.carouselImages.length === CAROUSEL_LIMIT
                        ? "✓ Full"
                        : `${CAROUSEL_LIMIT - form.carouselImages.length} empty`}
                    </span>
                  </div>
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
  header: { marginBottom: "32px" },
  title: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 8px",
  },
  subtitle: { color: "#888", margin: 0, fontSize: "0.9rem" },
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
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
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
  buttonRow: { display: "flex", gap: "12px", marginTop: "4px" },
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
    border: `1px solid ${variant === "activate" ? "#2ecc7144" : variant === "edit" ? "#a78bfa44" : "#e74c3c44"}`,
    borderRadius: "6px",
    padding: "5px 12px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  }),
};

export default ThemeSettings;
