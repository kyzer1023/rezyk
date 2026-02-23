"use client";

import Link from "next/link";
import { mockUser } from "@/lib/mock-data";

export default function R1Settings() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 40,
        maxWidth: 600,
        margin: "0 auto",
        position: "relative",
        zIndex: 2,
      }}
    >
      <h1 className="r1-heading r1-fade-in" style={{ fontSize: 26, marginBottom: 24 }}>Settings</h1>

      <div className="r1-card r1-fade-in r1-fade-in-delay-1" style={{ padding: 24, marginBottom: 20 }}>
        <h3 className="r1-heading" style={{ fontSize: 18, marginBottom: 16 }}>Account</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#C1694F",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {mockUser.avatar}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 16 }}>{mockUser.name}</p>
            <p style={{ fontSize: 14, color: "#8B7E7E" }}>{mockUser.email}</p>
          </div>
        </div>
      </div>

      <div className="r1-card r1-fade-in r1-fade-in-delay-2" style={{ padding: 24, marginBottom: 20 }}>
        <h3 className="r1-heading" style={{ fontSize: 18, marginBottom: 16 }}>Integrations</h3>
        {[
          { name: "Google Classroom", status: "Connected" },
          { name: "Google Forms", status: "Connected" },
        ].map((integration) => (
          <div
            key={integration.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid #F0EAE0",
            }}
          >
            <span style={{ fontSize: 15 }}>{integration.name}</span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span className="r1-badge r1-badge-low">{integration.status}</span>
              <button className="r1-btn-outline" style={{ padding: "6px 16px", fontSize: 13 }}>Reconnect</button>
            </div>
          </div>
        ))}
      </div>

      <div className="r1-fade-in r1-fade-in-delay-3" style={{ display: "flex", gap: 12 }}>
        <Link href="/1/dashboard">
          <button className="r1-btn-outline">Back to Dashboard</button>
        </Link>
        <Link href="/1">
          <button className="r1-btn" style={{ background: "#991B1B" }}>Sign Out</button>
        </Link>
      </div>
    </div>
  );
}
