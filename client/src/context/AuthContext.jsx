import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  authApi,
  getToken,
  setToken,
  setRefreshToken,
  removeToken,
  removeRefreshToken,
} from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── On mount: restore user from localStorage if token exists ──────────────
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const stored = localStorage.getItem("animeforge-user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        removeToken();
        removeRefreshToken();
        localStorage.removeItem("animeforge-user");
      }
    } else {
      removeToken();
      removeRefreshToken();
    }

    setLoading(false);
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register({ name, email, password });
    return data;
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    if (data?.accessToken) {
      setToken(data.accessToken);
      if (data.refreshToken) setRefreshToken(data.refreshToken);
    }
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem("animeforge-user", JSON.stringify(data.user));
    }
    return data;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {}
    setUser(null);
    removeToken();
    removeRefreshToken();
    localStorage.removeItem("animeforge-user");
  }, []);

  // ── Update profile ─────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (body) => {
    const data = await authApi.updateProfile(body);
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem("animeforge-user", JSON.stringify(data.user));
    }
    return data;
  }, []);

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}