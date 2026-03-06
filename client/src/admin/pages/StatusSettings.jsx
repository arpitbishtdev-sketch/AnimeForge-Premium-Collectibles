// import { useEffect, useState } from "react";
// import "../styles/StatusSettings.css";

// export default function StatusSettings() {
//   const [statuses, setStatuses] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch("/api/status")
//       .then((res) => res.json())
//       .then((data) => {
//         setStatuses(data);
//         setLoading(false);
//       });
//   }, []);

//   const handleColorChange = (id, color) => {
//     setStatuses((prev) =>
//       prev.map((s) => (s._id === id ? { ...s, color } : s)),
//     );
//   };

//   const handleSave = async (id, color) => {
//     await fetch(`/api/status/${id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ color }),
//     });

//     window.dispatchEvent(new Event("statusUpdated"));
//   };

//   if (loading) return <div className="ss-loading">Loading Statuses...</div>;

//   return (
//     <div className="ss-page">
//       <h1 className="ss-title">Marketing Status Settings</h1>

//       <div className="ss-grid">
//         {statuses.map((status) => (
//           <div key={status._id} className="ss-card">
//             <div
//               className="ss-badge-preview"
//               style={{ background: status.color }}
//             >
//               {status.status.toUpperCase()}
//             </div>

//             <div className="ss-controls">
//               <input
//                 type="color"
//                 value={status.color}
//                 onChange={(e) => handleColorChange(status._id, e.target.value)}
//               />

//               <input
//                 type="text"
//                 value={status.color}
//                 onChange={(e) => handleColorChange(status._id, e.target.value)}
//                 maxLength={7}
//               />

//               <button
//                 onClick={() => handleSave(status._id, status.color)}
//                 className="ss-save-btn"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StatusSettings.css";

const STATUS_META = {
  new: { label: "New", icon: "✦" },
  popular: { label: "Popular", icon: "◈" },
  rare: { label: "Rare", icon: "◆" },
  featured: { label: "Featured", icon: "★" },
  bestseller: { label: "Bestseller", icon: "▲" },
  "ultra-rare": { label: "Ultra Rare", icon: "⬡" },
};

export default function StatusColors() {
  const navigate = useNavigate();

  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Track per-row saving state and success flash
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [errors, setErrors] = useState({});

  // Local color edits before saving: { [id]: "#xxxxxx" }
  const [localColors, setLocalColors] = useState({});

  /* ── Fetch all statuses ── */
  useEffect(() => {
    setLoading(true);
    fetch("/api/status")
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setStatuses(data);
        const initial = {};
        data.forEach((s) => {
          initial[s._id] = s.color;
        });
        setLocalColors(initial);
      })
      .catch((err) => setFetchError(err.message || "Failed to load statuses"))
      .finally(() => setLoading(false));
  }, []);

  /* ── Save one status color ── */
  const handleSave = async (statusItem) => {
    const color = localColors[statusItem._id];
    if (!color) return;

    setSaving((prev) => ({ ...prev, [statusItem._id]: true }));
    setErrors((prev) => ({ ...prev, [statusItem._id]: null }));

    try {
      const res = await fetch(`/api/status/${statusItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Update failed");
      }

      const updated = await res.json();

      // Update the statuses list with new color
      setStatuses((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s)),
      );

      // Flash success
      setSaved((prev) => ({ ...prev, [statusItem._id]: true }));
      window.dispatchEvent(new Event("statusUpdated"));
      setTimeout(() => {
        setSaved((prev) => ({ ...prev, [statusItem._id]: false }));
      }, 2000);
    } catch (err) {
      setErrors((prev) => ({ ...prev, [statusItem._id]: err.message }));
    } finally {
      setSaving((prev) => ({ ...prev, [statusItem._id]: false }));
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="sc-page">
        <div className="sc-loading">
          <span className="sc-loading__spinner" />
          <span className="sc-loading__text">Loading statuses…</span>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (fetchError) {
    return (
      <div className="sc-page">
        <div className="sc-fetch-error">
          <p>{fetchError}</p>
          <button className="sc-btn sc-btn--ghost" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sc-page">
      {/* Header */}
      <div className="sc-header">
        <div className="sc-header__left">
          <button
            className="sc-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ←
          </button>
          <div>
            <p className="sc-header__eyebrow">Admin / Settings</p>
            <h1 className="sc-header__title">Status Colors</h1>
          </div>
        </div>
        <p className="sc-header__desc">
          Changing a color here updates <em>all</em> existing products with that
          status instantly.
        </p>
      </div>

      {/* Cards grid */}
      <div className="sc-grid">
        {statuses.map((statusItem) => {
          const meta = STATUS_META[statusItem.status] || {
            label: statusItem.status,
            icon: "●",
          };
          const currentColor = localColors[statusItem._id] || statusItem.color;
          const isSaving = saving[statusItem._id];
          const isSaved = saved[statusItem._id];
          const err = errors[statusItem._id];
          const isDirty =
            currentColor.toLowerCase() !== statusItem.color.toLowerCase();

          return (
            <div
              key={statusItem._id}
              className="sc-card"
              style={{ "--status-color": currentColor }}
            >
              <div className="sc-card__accent" />

              <div className="sc-card__top">
                <span className="sc-card__icon">{meta.icon}</span>
                <div>
                  <p className="sc-card__label">{meta.label}</p>
                  <p className="sc-card__slug">{statusItem.status}</p>
                </div>
                {/* Live badge preview */}
                <span
                  className="sc-badge-preview"
                  style={{
                    borderColor: currentColor,
                    color: currentColor,
                    boxShadow: `0 0 10px ${currentColor}55`,
                  }}
                >
                  {meta.icon} {meta.label}
                </span>
              </div>

              <div className="sc-card__body">
                <div className="sc-color-row">
                  <input
                    type="color"
                    className="sc-color-picker"
                    value={currentColor}
                    onChange={(e) =>
                      setLocalColors((prev) => ({
                        ...prev,
                        [statusItem._id]: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    className="sc-color-text"
                    value={currentColor}
                    maxLength={9}
                    placeholder="#000000"
                    onChange={(e) => {
                      const hex = e.target.value.startsWith("#")
                        ? e.target.value
                        : `#${e.target.value}`;
                      setLocalColors((prev) => ({
                        ...prev,
                        [statusItem._id]: hex,
                      }));
                    }}
                  />
                  <span
                    className="sc-swatch"
                    style={{ background: currentColor }}
                  />
                </div>

                {err && <p className="sc-error">{err}</p>}
              </div>

              <div className="sc-card__footer">
                <button
                  className={`sc-btn sc-btn--save ${isSaved ? "sc-btn--saved" : ""}`}
                  onClick={() => handleSave(statusItem)}
                  disabled={isSaving || !isDirty}
                >
                  {isSaving ? (
                    <>
                      <span className="sc-btn__spinner" />
                      Saving…
                    </>
                  ) : isSaved ? (
                    <>✓ Saved — all products updated</>
                  ) : (
                    <>
                      <span className="sc-btn__icon">↑</span>
                      {isDirty ? "Save & Sync Products" : "No Changes"}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="sc-note">
        <span className="sc-note__icon">ℹ</span>
        <p>
          When you save a new color, the server automatically updates{" "}
          <strong>every product</strong> in the database that shares that status
          — no manual re-editing needed.
        </p>
      </div>
    </div>
  );
}
