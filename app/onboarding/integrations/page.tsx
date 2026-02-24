"use client";

import { useState } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";

export default function OnboardingIntegrationsPage() {
  const [classroomGranted, setClassroomGranted] = useState(false);
  const [formsGranted, setFormsGranted] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF6F0", padding: 20 }}>
      <div className="edu-fade-in" style={{ maxWidth: 480, width: "100%" }}>
        <h1 className="edu-heading" style={{ fontSize: 28, marginBottom: 8 }}>
          Connect Your Tools
        </h1>
        <p className="edu-muted" style={{ marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
          Link Google Classroom and Forms to start analyzing quizzes.
        </p>

        {[
          { label: "Google Classroom", desc: "Courses, roster, assignments", granted: classroomGranted, toggle: () => setClassroomGranted(true) },
          { label: "Google Forms", desc: "Responses, answer keys", granted: formsGranted, toggle: () => setFormsGranted(true) },
        ].map((item) => (
          <div key={item.label} className="edu-card" style={{ padding: 24, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16 }}>{item.label}</p>
                <p className="edu-muted" style={{ fontSize: 13 }}>
                  {item.desc}
                </p>
              </div>
              <button className={item.granted ? "edu-btn-outline" : "edu-btn"} onClick={item.toggle} style={{ minWidth: 100 }}>
                {item.granted ? "Granted" : "Grant"}
              </button>
            </div>
          </div>
        ))}

        <Link href={routes.dashboard()} style={{ display: "block", marginTop: 20 }}>
          <button className="edu-btn" style={{ width: "100%" }}>
            Continue to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
