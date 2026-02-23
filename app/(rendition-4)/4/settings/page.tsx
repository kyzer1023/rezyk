"use client";

import Link from "next/link";
import { mockUser } from "@/lib/mock-data";

export default function R4Settings() {
  return (
    <div style={{ minHeight: "100vh", padding: 40, maxWidth: 560, margin: "0 auto", background: "linear-gradient(165deg, #E8EDF2, #D5DEE8)" }}>
      <h1 className="r4-heading r4-fade-in" style={{ fontSize: 24, marginBottom: 20 }}>Settings</h1>

      <div className="r4-card r4-fade-in r4-fd1" style={{ padding: 24, marginBottom: 14 }}>
        <h3 className="r4-heading" style={{ fontSize: 16, marginBottom: 14 }}>Account</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: "linear-gradient(135deg, #5C7D99, #7B9BB5)",
            color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15,
          }}>{mockUser.avatar}</div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 15 }}>{mockUser.name}</p>
            <p className="r4-muted" style={{ fontSize: 13 }}>{mockUser.email}</p>
          </div>
        </div>
      </div>

      <div className="r4-card r4-fade-in r4-fd2" style={{ padding: 24, marginBottom: 14 }}>
        <h3 className="r4-heading" style={{ fontSize: 16, marginBottom: 14 }}>Integrations</h3>
        {["Google Classroom", "Google Forms"].map((name) => (
          <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(160,178,196,0.1)" }}>
            <span style={{ fontSize: 14 }}>{name}</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="r4-badge r4-badge-low">Connected</span>
              <button className="r4-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }}>Reconnect</button>
            </div>
          </div>
        ))}
      </div>

      <div className="r4-fade-in r4-fd3" style={{ display: "flex", gap: 10 }}>
        <Link href="/4/dashboard"><button className="r4-btn-outline">Back to Dashboard</button></Link>
        <Link href="/4"><button className="r4-btn" style={{ background: "#C6443C" }}>Sign Out</button></Link>
      </div>
    </div>
  );
}
