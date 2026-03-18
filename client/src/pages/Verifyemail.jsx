import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const called = useRef(false); 

  useEffect(() => {
     if (called.current) return;  // ← add karo
  called.current = true; 
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    fetch(`${BASE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          setTimeout(() => navigate("/user"), 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Try again.");
      });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a14 0%, #140f23 100%)",
        fontFamily: "Rajdhani, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 40,
          background: "rgba(20,15,40,0.9)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          backdropFilter: "blur(30px)",
          boxShadow: "0 0 60px rgba(255,140,0,0.1)",
          textAlign: "center",
        }}
      >
        {status === "loading" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 style={{ color: "#fff", fontSize: 24, letterSpacing: 2, margin: "0 0 8px" }}>
              VERIFYING...
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
              Please wait
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: "#22c55e", fontSize: 24, letterSpacing: 2, margin: "0 0 8px" }}>
              VERIFIED!
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 24 }}>
              {message}
            </p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
              Redirecting to login in 3 seconds...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ color: "#ff6464", fontSize: 24, letterSpacing: 2, margin: "0 0 8px" }}>
              FAILED
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 24 }}>
              {message}
            </p>
            <button
              onClick={() => navigate("/user")}
              style={{
                padding: "12px 32px",
                background: "linear-gradient(135deg, #ff8c00, rgba(255,200,0,0.8))",
                border: "none",
                borderRadius: 10,
                color: "#000",
                fontFamily: "Rajdhani, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: 1.5,
                cursor: "pointer",
              }}
            >
              GO TO LOGIN
            </button>
          </>
        )}
      </div>
    </div>
  );
}