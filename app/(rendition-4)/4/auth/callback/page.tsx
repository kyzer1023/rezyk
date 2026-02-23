"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function R4AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    const timers = [
      setTimeout(() => setStatus("Verifying credentials..."), 800),
      setTimeout(() => setStatus("Welcome, Sarah."), 1600),
      setTimeout(() => router.push("/4/dashboard"), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(165deg, #E8EDF2, #D5DEE8)" }}>
      <div className="r4-fade-in" style={{ textAlign: "center" }}>
        <div style={{
          width: 44, height: 44, border: "2px solid rgba(160,178,196,0.3)", borderTopColor: "#5C7D99",
          borderRadius: "50%", margin: "0 auto 24px", animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h2 className="r4-heading" style={{ fontSize: 22, marginBottom: 8 }}>{status}</h2>
        <p className="r4-muted" style={{ fontSize: 14 }}>Preparing your workspace...</p>
      </div>
    </div>
  );
}
