"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function R1AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    const timers = [
      setTimeout(() => setStatus("Validating session..."), 800),
      setTimeout(() => setStatus("Session established!"), 1600),
      setTimeout(() => router.push("/1/dashboard"), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div className="r1-fade-in" style={{ textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            border: "3px solid #E8E0D5",
            borderTopColor: "#C1694F",
            borderRadius: "50%",
            margin: "0 auto 24px",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h2 className="r1-heading" style={{ fontSize: 22, marginBottom: 8 }}>{status}</h2>
        <p style={{ color: "#8B7E7E", fontSize: 15 }}>Redirecting you to the dashboard...</p>
      </div>
    </div>
  );
}
