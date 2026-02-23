"use client";

import { useState } from "react";
import Link from "next/link";

export default function R2Onboarding() {
  const [classroomGranted, setClassroomGranted] = useState(false);
  const [formsGranted, setFormsGranted] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(175deg, #1A271A 0%, #0E180E 100%)",
        padding: 20,
      }}
    >
      <div className="r2-fade-in" style={{ maxWidth: 480, width: "100%" }}>
        <h1 className="r2-heading" style={{ fontSize: 28, marginBottom: 8 }}>
          Connect Your Tools
        </h1>
        <p style={{ color: "rgba(232,229,216,0.6)", marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
          Grant access to pull roster and quiz data from Google.
        </p>

        {[
          { label: "Google Classroom", desc: "Courses, roster, assignments", granted: classroomGranted, toggle: () => setClassroomGranted(true) },
          { label: "Google Forms", desc: "Responses, answer keys", granted: formsGranted, toggle: () => setFormsGranted(true) },
        ].map((item) => (
          <div key={item.label} className="r2-card" style={{ padding: 24, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p className="r2-chalk" style={{ fontWeight: 600, fontSize: 16 }}>{item.label}</p>
                <p style={{ fontSize: 13, color: "rgba(232,229,216,0.5)" }}>{item.desc}</p>
              </div>
              <button
                className={item.granted ? "r2-btn-outline" : "r2-btn"}
                onClick={item.toggle}
                style={{ minWidth: 100 }}
              >
                {item.granted ? "Granted" : "Grant"}
              </button>
            </div>
          </div>
        ))}

        <Link href="/2/dashboard" style={{ display: "block", marginTop: 20 }}>
          <button className="r2-btn" style={{ width: "100%" }}>Continue to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}
