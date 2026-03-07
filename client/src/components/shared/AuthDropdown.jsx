import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import "./AuthDropdown.css";

// ── Icons ─────────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const LogoutIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ProfileIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Auth field ─────────────────────────────────────────────────────────────
function AuthField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  accent,
  error,
}) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPw = type === "password";

  return (
    <div
      className={`af-field${focused ? " is-focused" : ""}${error ? " is-error" : ""}`}
      style={{ "--af-acc": accent }}
    >
      <label className="af-field__label">{label}</label>
      <div className="af-field__wrap">
        <input
          className="af-field__input"
          type={isPw && showPw ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
        />
        {isPw && (
          <button
            type="button"
            className="af-field__eye"
            onClick={() => setShowPw((s) => !s)}
            tabIndex={-1}
          >
            <EyeIcon open={showPw} />
          </button>
        )}
        <div className="af-field__bar" />
      </div>
      {error && <span className="af-field__err">{error}</span>}
    </div>
  );
}

// ── Dropdown animations ────────────────────────────────────────────────────
const dropVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
  },
};

const panelVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Main component ─────────────────────────────────────────────────────────
export default function AuthDropdown() {
  const navigate = useNavigate();
  const { activeCharacter } = useTheme();
  const accent = activeCharacter?.gradient?.accent || "#ff8c00";
  const glow = activeCharacter?.gradient?.glow || "rgba(255,140,0,0.3)";

  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState("menu"); // menu | login | register
  const [user, setUser] = useState(null); // null = logged out
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});

  const wrapRef = useRef(null);
  const btnRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setTimeout(() => setPanel("menu"), 220);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset panel when closing
  const handleToggle = () => {
    if (open) {
      setOpen(false);
      setTimeout(() => setPanel("menu"), 220);
    } else {
      setOpen(true);
    }
  };

  const goPanel = (p) => {
    setErrors({});
    setPanel(p);
  };

  // ── Validate ──────────────────────────────────────────────────────────
  const validateLogin = () => {
    const e = {};
    if (!loginForm.email) e.email = "Required";
    if (!loginForm.password) e.password = "Required";
    if (loginForm.email && !/\S+@\S+\.\S+/.test(loginForm.email))
      e.email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateRegister = () => {
    const e = {};
    if (!registerForm.name) e.name = "Required";
    if (!registerForm.email) e.email = "Required";
    if (!registerForm.password) e.password = "Required";
    if (registerForm.email && !/\S+@\S+\.\S+/.test(registerForm.email))
      e.email = "Invalid email";
    if (registerForm.password && registerForm.password.length < 6)
      e.password = "Min 6 characters";
    if (registerForm.password !== registerForm.confirm)
      e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true);
    // Simulate API call — replace with your real auth
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 700));
    setUser({
      name: loginForm.email.split("@")[0],
      email: loginForm.email,
      avatar: null,
    });
    setSuccess(false);
    setOpen(false);
    setTimeout(() => setPanel("menu"), 220);
    setLoginForm({ email: "", password: "" });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 700));
    setUser({
      name: registerForm.name,
      email: registerForm.email,
      avatar: null,
    });
    setSuccess(false);
    setOpen(false);
    setTimeout(() => setPanel("menu"), 220);
    setRegisterForm({ name: "", email: "", password: "", confirm: "" });
  };

  const handleLogout = () => {
    setUser(null);
    setOpen(false);
    setTimeout(() => setPanel("menu"), 220);
  };

  const handleViewProfile = () => {
    setOpen(false);
    setTimeout(() => setPanel("menu"), 220);
    navigate("/profile");
  };

  const onLoginChange = useCallback(
    (e) => setLoginForm((f) => ({ ...f, [e.target.name]: e.target.value })),
    [],
  );
  const onRegisterChange = useCallback(
    (e) => setRegisterForm((f) => ({ ...f, [e.target.name]: e.target.value })),
    [],
  );

  // Avatar initials
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "?";

  return (
    <div
      className="auth-dropdown"
      ref={wrapRef}
      style={{ "--acc": accent, "--glow": glow }}
    >
      {/* ── Trigger button ── */}
      <button
        ref={btnRef}
        className={`auth-trigger${open ? " is-open" : ""}${user ? " is-logged" : ""}`}
        onClick={handleToggle}
        aria-label="Account"
        style={
          open ? { borderColor: accent, boxShadow: `0 0 18px ${glow}` } : {}
        }
      >
        {user ? (
          <div
            className="auth-trigger__avatar"
            style={{
              background: `linear-gradient(135deg, ${accent}, color-mix(in srgb,${accent} 60%,#fff))`,
            }}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <span>{initials}</span>
            )}
            <div className="auth-trigger__online" />
          </div>
        ) : (
          <UserIcon />
        )}
      </button>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="auth-panel"
            variants={dropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Glow top border */}
            <div
              className="auth-panel__glow-bar"
              style={{
                background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
              }}
            />

            <AnimatePresence mode="wait">
              {/* ══ LOGGED OUT: MENU ══════════════════════════════════════ */}
              {panel === "menu" && !user && (
                <motion.div
                  key="menu"
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="auth-panel__inner"
                >
                  <div className="auth-panel__head">
                    <div
                      className="auth-panel__icon"
                      style={{ color: accent, boxShadow: `0 0 20px ${glow}` }}
                    >
                      <UserIcon />
                    </div>
                    <div>
                      <div className="auth-panel__title">Welcome</div>
                      <div className="auth-panel__sub">
                        Sign in to your account
                      </div>
                    </div>
                  </div>

                  <div className="auth-panel__divider" />

                  <div className="auth-menu-btns">
                    <button
                      className="auth-menu-btn auth-menu-btn--primary"
                      onClick={() => goPanel("login")}
                      style={{ "--btn-acc": accent }}
                    >
                      <span className="auth-menu-btn__icon">
                        <UserIcon />
                      </span>
                      <span className="auth-menu-btn__text">
                        <span className="auth-menu-btn__label">Login</span>
                        <span className="auth-menu-btn__hint">
                          Access your account
                        </span>
                      </span>
                      <span className="auth-menu-btn__arrow">→</span>
                    </button>

                    <button
                      className="auth-menu-btn auth-menu-btn--secondary"
                      onClick={() => goPanel("register")}
                      style={{ "--btn-acc": accent }}
                    >
                      <span className="auth-menu-btn__icon">✦</span>
                      <span className="auth-menu-btn__text">
                        <span className="auth-menu-btn__label">Register</span>
                        <span className="auth-menu-btn__hint">
                          Create new account
                        </span>
                      </span>
                      <span className="auth-menu-btn__arrow">→</span>
                    </button>
                  </div>

                  <div className="auth-panel__footer">
                    <span>🔒</span> Secured with 256-bit encryption
                  </div>
                </motion.div>
              )}

              {/* ══ LOGGED IN: MENU ═══════════════════════════════════════ */}
              {panel === "menu" && user && (
                <motion.div
                  key="loggedin"
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="auth-panel__inner"
                >
                  {/* User card */}
                  <div
                    className="auth-user-card"
                    style={{
                      borderColor: `color-mix(in srgb,${accent} 30%,transparent)`,
                    }}
                  >
                    <div
                      className="auth-user-card__avatar"
                      style={{
                        background: `linear-gradient(135deg, ${accent}, color-mix(in srgb,${accent} 60%,#fff))`,
                      }}
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span>{initials}</span>
                      )}
                      <div className="auth-user-card__online" />
                    </div>
                    <div className="auth-user-card__info">
                      <div className="auth-user-card__name">{user.name}</div>
                      <div className="auth-user-card__email">{user.email}</div>
                      <div
                        className="auth-user-card__badge"
                        style={{
                          color: accent,
                          borderColor: `color-mix(in srgb,${accent} 40%,transparent)`,
                        }}
                      >
                        ◆ Active Member
                      </div>
                    </div>
                  </div>

                  <div className="auth-panel__divider" />

                  <div className="auth-menu-btns">
                    <button
                      className="auth-menu-btn auth-menu-btn--primary"
                      onClick={handleViewProfile}
                      style={{ "--btn-acc": accent }}
                    >
                      <span className="auth-menu-btn__icon">
                        <ProfileIcon />
                      </span>
                      <span className="auth-menu-btn__text">
                        <span className="auth-menu-btn__label">
                          View Profile
                        </span>
                        <span className="auth-menu-btn__hint">
                          Orders, rewards & settings
                        </span>
                      </span>
                      <span className="auth-menu-btn__arrow">→</span>
                    </button>

                    <button
                      className="auth-menu-btn auth-menu-btn--logout"
                      onClick={handleLogout}
                    >
                      <span className="auth-menu-btn__icon">
                        <LogoutIcon />
                      </span>
                      <span className="auth-menu-btn__text">
                        <span className="auth-menu-btn__label">Logout</span>
                        <span className="auth-menu-btn__hint">
                          Sign out of your account
                        </span>
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ══ LOGIN FORM ════════════════════════════════════════════ */}
              {panel === "login" && (
                <motion.div
                  key="login"
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="auth-panel__inner"
                >
                  <div className="auth-form-head">
                    <button
                      className="auth-back"
                      onClick={() => goPanel("menu")}
                    >
                      ← Back
                    </button>
                    <div className="auth-form-head__title">Login</div>
                  </div>

                  <div className="auth-panel__divider" />

                  <form className="auth-form" onSubmit={handleLogin}>
                    <AuthField
                      label="Email"
                      name="email"
                      type="email"
                      value={loginForm.email}
                      onChange={onLoginChange}
                      placeholder="you@example.com"
                      accent={accent}
                      error={errors.email}
                    />
                    <AuthField
                      label="Password"
                      name="password"
                      type="password"
                      value={loginForm.password}
                      onChange={onLoginChange}
                      placeholder="••••••••"
                      accent={accent}
                      error={errors.password}
                    />

                    <button
                      type="button"
                      className="auth-forgot"
                      style={{ color: accent }}
                    >
                      Forgot password?
                    </button>

                    <button
                      type="submit"
                      className={`auth-submit${loading ? " is-loading" : ""}${success ? " is-success" : ""}`}
                      style={{ "--btn-acc": accent }}
                      disabled={loading || success}
                    >
                      {success ? (
                        <span className="auth-submit__ok">
                          <CheckIcon /> Welcome back!
                        </span>
                      ) : loading ? (
                        <span className="auth-submit__loading">
                          <span className="auth-dots">
                            <b />
                            <b />
                            <b />
                          </span>
                        </span>
                      ) : (
                        <span>Login →</span>
                      )}
                    </button>
                  </form>

                  <div className="auth-switch">
                    Don't have an account?{" "}
                    <button
                      onClick={() => goPanel("register")}
                      style={{ color: accent }}
                    >
                      Register
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ══ REGISTER FORM ════════════════════════════════════════ */}
              {panel === "register" && (
                <motion.div
                  key="register"
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="auth-panel__inner"
                >
                  <div className="auth-form-head">
                    <button
                      className="auth-back"
                      onClick={() => goPanel("menu")}
                    >
                      ← Back
                    </button>
                    <div className="auth-form-head__title">Register</div>
                  </div>

                  <div className="auth-panel__divider" />

                  <form className="auth-form" onSubmit={handleRegister}>
                    <AuthField
                      label="Full Name"
                      name="name"
                      type="text"
                      value={registerForm.name}
                      onChange={onRegisterChange}
                      placeholder="Naruto Uzumaki"
                      accent={accent}
                      error={errors.name}
                    />
                    <AuthField
                      label="Email"
                      name="email"
                      type="email"
                      value={registerForm.email}
                      onChange={onRegisterChange}
                      placeholder="you@example.com"
                      accent={accent}
                      error={errors.email}
                    />
                    <AuthField
                      label="Password"
                      name="password"
                      type="password"
                      value={registerForm.password}
                      onChange={onRegisterChange}
                      placeholder="Min 6 characters"
                      accent={accent}
                      error={errors.password}
                    />
                    <AuthField
                      label="Confirm Password"
                      name="confirm"
                      type="password"
                      value={registerForm.confirm}
                      onChange={onRegisterChange}
                      placeholder="Repeat password"
                      accent={accent}
                      error={errors.confirm}
                    />

                    <button
                      type="submit"
                      className={`auth-submit${loading ? " is-loading" : ""}${success ? " is-success" : ""}`}
                      style={{ "--btn-acc": accent }}
                      disabled={loading || success}
                    >
                      {success ? (
                        <span className="auth-submit__ok">
                          <CheckIcon /> Account created!
                        </span>
                      ) : loading ? (
                        <span className="auth-submit__loading">
                          <span className="auth-dots">
                            <b />
                            <b />
                            <b />
                          </span>
                        </span>
                      ) : (
                        <span>Create Account →</span>
                      )}
                    </button>
                  </form>

                  <div className="auth-switch">
                    Already have an account?{" "}
                    <button
                      onClick={() => goPanel("login")}
                      style={{ color: accent }}
                    >
                      Login
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
