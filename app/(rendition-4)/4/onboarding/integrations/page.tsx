"use client";

import { useState } from "react";
import Link from "next/link";

export default function R4Onboarding() {
  const [classroomGranted, setClassroomGranted] = useState(false);
  const [formsGranted, setFormsGranted] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(165deg, #E8EDF2, #D5DEE8)", padding: 20 }}>
      <div className="r4-fade-in" style={{ maxWidth: 480, width: "100%" }}>
        <h1 className="r4-heading" style={{ fontSize: 28, marginBottom: 8 }}>Connect Your Tools</h1>
        <p className="r4-muted" style={{ marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
          Link Google Classroom and Forms to get started.
        </p>

        {[
          { label: "Google Classroom", desc: "Courses, roster, assignments", granted: classroomGranted, toggle: () => setClassroomGranted(true) },
          { label: "Google Forms", desc: "Responses, answer keys", granted: formsGranted, toggle: () => setFormsGranted(true) },
        ].map((item) => (
          <div key={item.label} className="r4-card" style={{ padding: 24, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 16 }}>{item.label}</p>
                <p className="r4-muted" style={{ fontSize: 13 }}>{item.desc}</p>
              </div>
              <button className={item.granted ? "r4-btn-outline" : "r4-btn"} onClick={item.toggle} style={{ minWidth: 100 }}>
                {item.granted ? "Granted" : "Grant"}
              </button>
            </div>
          </div>
        ))}

        <Link href="/4/dashboard" style={{ display: "block", marginTop: 20 }}>
          <button className="r4-btn" style={{ width: "100%" }}>Continue to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}
