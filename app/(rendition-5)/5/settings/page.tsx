"use client";

import Link from "next/link";
import { mockUser } from "@/lib/mock-data";

export default function R5Settings() {
  return (
    <div style={{ minHeight: "100vh", padding: 40, maxWidth: 520, margin: "0 auto" }}>
      <h1 className="r5-heading r5-slide-in" style={{ fontSize: 22, marginBottom: 18 }}>Settings</h1>
      <div className="r5-card r5-slide-in r5-sd1" style={{ padding: 20, marginBottom: 12 }}>
        <h3 className="r5-heading" style={{ fontSize: 15, marginBottom: 10 }}>Account</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", border: "1.5px solid #C9A96E", color: "#C9A96E", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{mockUser.avatar}</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{mockUser.name}</p>
            <p style={{ fontSize: 12, color: "#64748B" }}>{mockUser.email}</p>
          </div>
        </div>
      </div>
      <div className="r5-card r5-slide-in r5-sd2" style={{ padding: 20, marginBottom: 12 }}>
        <h3 className="r5-heading" style={{ fontSize: 15, marginBottom: 10 }}>Integrations</h3>
        {["Google Classroom", "Google Forms"].map((name) => (
          <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(201,169,110,0.08)" }}>
            <span style={{ fontSize: 13 }}>{name}</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="r5-badge r5-badge-low">Connected</span>
              <button className="r5-btn-outline" style={{ padding: "3px 10px", fontSize: 11 }}>Reconnect</button>
            </div>
          </div>
        ))}
      </div>
      <div className="r5-slide-in r5-sd3" style={{ display: "flex", gap: 8 }}>
        <Link href="/5/dashboard"><button className="r5-btn-outline">Back to Dashboard</button></Link>
        <Link href="/5"><button className="r5-btn" style={{ background: "#991B1B", color: "#FCA5A5" }}>Sign Out</button></Link>
      </div>
    </div>
  );
}
