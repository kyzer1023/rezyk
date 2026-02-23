"use client";

import { useState } from "react";
import Link from "next/link";

export default function R1Onboarding() {
  const [classroomGranted, setClassroomGranted] = useState(false);
  const [formsGranted, setFormsGranted] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
        zIndex: 2,
      }}
    >
      <div className="r1-fade-in" style={{ maxWidth: 480, width: "100%" }}>
        <h1 className="r1-heading" style={{ fontSize: 28, marginBottom: 8 }}>Connect Your Accounts</h1>
        <p style={{ color: "#6B5E5E", marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          EduInsight needs access to Google Classroom and Google Forms to pull quiz data
          and generate insights.
        </p>

        <div className="r1-card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16 }}>Google Classroom</p>
              <p style={{ fontSize: 13, color: "#8B7E7E" }}>Access courses, roster, and assignments</p>
            </div>
            <button
              className={classroomGranted ? "r1-btn-outline" : "r1-btn"}
              onClick={() => setClassroomGranted(true)}
              style={{ minWidth: 100 }}
            >
              {classroomGranted ? "Granted" : "Grant"}
            </button>
          </div>
        </div>

        <div className="r1-card" style={{ padding: 24, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16 }}>Google Forms</p>
              <p style={{ fontSize: 13, color: "#8B7E7E" }}>Access quiz responses and answer keys</p>
            </div>
            <button
              className={formsGranted ? "r1-btn-outline" : "r1-btn"}
              onClick={() => setFormsGranted(true)}
              style={{ minWidth: 100 }}
            >
              {formsGranted ? "Granted" : "Grant"}
            </button>
          </div>
        </div>

        <Link href="/1/dashboard">
          <button className="r1-btn" style={{ width: "100%" }}>Continue to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}
