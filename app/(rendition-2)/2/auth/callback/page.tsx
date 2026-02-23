"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function R2AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    const timers = [
      setTimeout(() => setStatus("Verifying credentials..."), 800),
      setTimeout(() => setStatus("Welcome back, Sarah."), 1600),
      setTimeout(() => router.push("/2/dashboard"), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(175deg, #1A271A 0%, #0E180E 100%)",
      }}
    >
      <div className="r2-fade-in" style={{ textAlign: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            border: "2px solid rgba(139,168,120,0.3)",
            borderTopColor: "#8BA878",
            borderRadius: "50%",
            margin: "0 auto 28px",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h2 className="r2-heading" style={{ fontSize: 22, marginBottom: 8 }}>{status}</h2>
        <p style={{ color: "rgba(232,229,216,0.5)", fontSize: 14 }}>Preparing your workspace...</p>
      </div>
    </div>
  );
}
