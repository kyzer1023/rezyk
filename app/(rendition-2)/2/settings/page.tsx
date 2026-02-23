"use client";

import Link from "next/link";
import { mockUser } from "@/lib/mock-data";

export default function R2Settings() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 40,
        maxWidth: 560,
        margin: "0 auto",
        background: "linear-gradient(175deg, #1A271A 0%, #0E180E 100%)",
      }}
    >
      <h1 className="r2-heading r2-fade-in" style={{ fontSize: 24, marginBottom: 20, fontWeight: 500 }}>
        Settings
      </h1>

      <div className="r2-card r2-fade-in r2-fade-in-d1" style={{ padding: 24, marginBottom: 14 }}>
        <h3 className="r2-heading" style={{ fontSize: 16, marginBottom: 14, fontWeight: 500 }}>Account</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 6,
              background: "rgba(139,168,120,0.2)",
              color: "#8BA878",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {mockUser.avatar}
          </div>
          <div>
            <p className="r2-chalk" style={{ fontWeight: 600, fontSize: 15 }}>{mockUser.name}</p>
            <p style={{ fontSize: 13, color: "rgba(232,229,216,0.45)" }}>{mockUser.email}</p>
          </div>
        </div>
      </div>

      <div className="r2-card r2-fade-in r2-fade-in-d2" style={{ padding: 24, marginBottom: 14 }}>
        <h3 className="r2-heading" style={{ fontSize: 16, marginBottom: 14, fontWeight: 500 }}>
          Integrations
        </h3>
        {["Google Classroom", "Google Forms"].map((name) => (
          <div
            key={name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid rgba(139,168,120,0.1)",
            }}
          >
            <span style={{ fontSize: 14 }}>{name}</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="r2-badge r2-badge-low">Connected</span>
              <button className="r2-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }}>
                Reconnect
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="r2-fade-in r2-fade-in-d3" style={{ display: "flex", gap: 10 }}>
        <Link href="/2/dashboard">
          <button className="r2-btn-outline">Back to Dashboard</button>
        </Link>
        <Link href="/2">
          <button className="r2-btn" style={{ background: "rgba(239,154,154,0.3)", color: "#EF9A9A" }}>
            Sign Out
          </button>
        </Link>
      </div>
    </div>
  );
}
