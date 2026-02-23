"use client";

import { useState } from "react";
import Link from "next/link";

export default function R5Onboarding() {
  const [classroomGranted, setClassroomGranted] = useState(false);
  const [formsGranted, setFormsGranted] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1A1A2E", padding: 20 }}>
      <div className="r5-slide-in" style={{ maxWidth: 460, width: "100%" }}>
        <h1 className="r5-heading" style={{ fontSize: 26, marginBottom: 6 }}>Connect Integrations</h1>
        <p style={{ color: "#94A3B8", marginBottom: 28, fontSize: 15 }}>Grant access to your Google accounts to begin.</p>
        {[
          { name: "Google Classroom", desc: "Courses, roster, assignments", granted: classroomGranted, toggle: () => setClassroomGranted(true) },
          { name: "Google Forms", desc: "Responses, answer keys", granted: formsGranted, toggle: () => setFormsGranted(true) },
        ].map((item) => (
          <div key={item.name} className="r5-card" style={{ padding: 20, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#E8E4DB" }}>{item.name}</p>
                <p style={{ fontSize: 13, color: "#64748B" }}>{item.desc}</p>
              </div>
              <button className={item.granted ? "r5-btn-outline" : "r5-btn"} onClick={item.toggle} style={{ minWidth: 90 }}>
                {item.granted ? "Granted" : "Grant"}
              </button>
            </div>
          </div>
        ))}
        <Link href="/5/dashboard">
          <button className="r5-btn" style={{ width: "100%", marginTop: 12 }}>Continue to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}
