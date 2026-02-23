"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function R3AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    const timers = [
      setTimeout(() => setStatus("Verifying credentials..."), 800),
      setTimeout(() => setStatus("Welcome, Sarah."), 1600),
      setTimeout(() => router.push("/3/dashboard"), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF6F0" }}>
      <div className="r3-fade-in" style={{ textAlign: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            border: "2px solid #E0D6CA",
            borderTopColor: "#C17A56",
            borderRadius: "50%",
            margin: "0 auto 24px",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h2 className="r3-heading" style={{ fontSize: 22, marginBottom: 8 }}>{status}</h2>
        <p className="r3-muted" style={{ fontSize: 14 }}>Setting up your workspace...</p>
      </div>
    </div>
  );
}
