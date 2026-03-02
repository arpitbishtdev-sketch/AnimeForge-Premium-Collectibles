import "../styles/Characterswitcher.css";

export default function CharacterSwitcher({ characters, activeId, onSelect }) {
  return (
    <div className="character-switcher">
      {characters.map((char, index) => (
        <div
          key={char.id}
          style={{ display: "flex", alignItems: "center", gap: "14px" }}
        >
          <button
            className={`switcher-btn ${activeId === char.id ? "active" : ""}`}
            onClick={() => onSelect(char.id)}
            aria-label={`Switch to ${char.name}`}
            style={{
              "--btn-accent": char.gradient.accent,
              "--btn-glow": char.gradient.glow,
            }}
          >
            <div className="switcher-avatar">
              <img src={char.mainImage} alt={char.name} loading="lazy" />
            </div>
            <span className="switcher-label">
              {char.id === "luffy" ? "GEAR 5" : char.id.toUpperCase()}
            </span>
            <span className="switcher-dot" />
          </button>

          {index < characters.length - 1 && (
            <div className="switcher-divider" />
          )}
        </div>
      ))}
    </div>
  );
}
