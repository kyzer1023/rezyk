"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function R5AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    const timers = [
      setTimeout(() => setStatus("Verifying credentials..."), 800),
      setTimeout(() => setStatus("Welcome, scholar."), 1600),
      setTimeout(() => router.push("/5/dashboard"), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1A1A2E" }}>
      <div className="r5-slide-in" style={{ textAlign: "center" }}>
        <div style={{
          width: 44, height: 44, border: "3px solid rgba(201,169,110,0.2)", borderTopColor: "#C9A96E",
          borderRadius: "50%", margin: "0 auto 20px", animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h2 className="r5-heading" style={{ fontSize: 20, marginBottom: 6 }}>{status}</h2>
        <p style={{ color: "#64748B", fontSize: 14 }}>Preparing your study...</p>
      </div>
    </div>
  );
}
