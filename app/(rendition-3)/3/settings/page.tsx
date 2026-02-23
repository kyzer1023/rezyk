"use client";

import Link from "next/link";
import { mockUser } from "@/lib/mock-data";

export default function R3Settings() {
  return (
    <div style={{ minHeight: "100vh", padding: 40, maxWidth: 560, margin: "0 auto", background: "#FAF6F0" }}>
      <h1 className="r3-heading r3-fade-in" style={{ fontSize: 24, marginBottom: 20 }}>Settings</h1>

      <div className="r3-card r3-fade-in r3-fd1" style={{ padding: 24, marginBottom: 14 }}>
        <h3 className="r3-heading" style={{ fontSize: 17, marginBottom: 14 }}>Account</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg, #C17A56, #D4956E)",
            color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15,
          }}>{mockUser.avatar}</div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 15 }}>{mockUser.name}</p>
            <p className="r3-muted" style={{ fontSize: 13 }}>{mockUser.email}</p>
          </div>
        </div>
      </div>

      <div className="r3-card r3-fade-in r3-fd2" style={{ padding: 24, marginBottom: 14 }}>
        <h3 className="r3-heading" style={{ fontSize: 17, marginBottom: 14 }}>Integrations</h3>
        {["Google Classroom", "Google Forms"].map((name) => (
          <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F0ECE5" }}>
            <span style={{ fontSize: 14 }}>{name}</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="r3-badge r3-badge-low">Connected</span>
              <button className="r3-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }}>Reconnect</button>
            </div>
          </div>
        ))}
      </div>

      <div className="r3-fade-in r3-fd3" style={{ display: "flex", gap: 10 }}>
        <Link href="/3/dashboard"><button className="r3-btn-outline">Back to Dashboard</button></Link>
        <Link href="/3"><button className="r3-btn" style={{ background: "#A63D2E" }}>Sign Out</button></Link>
      </div>
    </div>
  );
}
