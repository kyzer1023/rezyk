"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockStudents } from "@/lib/mock-data";
import type { RiskLevel } from "@/lib/types";

export default function R3Students() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const [filter, setFilter] = useState<RiskLevel | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = mockStudents.filter((s) => {
    if (filter !== "all" && s.riskLevel !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <h1 className="r3-heading r3-fade-in" style={{ fontSize: 22, marginBottom: 16 }}>Students</h1>

      <div className="r3-fade-in r3-fd1" style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="r3-input" style={{ flex: 1, maxWidth: 280 }} />
        <select value={filter} onChange={(e) => setFilter(e.target.value as RiskLevel | "all")} className="r3-input">
          <option value="all">All Risks</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="r3-fade-in r3-fd2" style={{ display: "grid", gap: 10 }}>
        {filtered.map((student) => (
          <div key={student.id} className="r3-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: student.riskLevel === "critical" ? "#FBEAE5" : student.riskLevel === "high" ? "#FDF0E1" : student.riskLevel === "medium" ? "#FEF8E7" : "#E9F3E5",
                    color: student.riskLevel === "critical" ? "#A63D2E" : student.riskLevel === "high" ? "#A25E1A" : student.riskLevel === "medium" ? "#8B6914" : "#3D7A2E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {student.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{student.name}</p>
                  <p className="r3-muted" style={{ fontSize: 12 }}>
                    {student.score}/{student.totalScore} &middot; {student.knowledgeGaps.length > 0 ? student.knowledgeGaps.map((g) => g.concept).join(", ") : "No gaps"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className={`r3-badge r3-badge-${student.riskLevel}`}>{student.riskLevel}</span>
                <Link href={`/3/dashboard/courses/${courseId}/quizzes/${quizId}/students/${student.id}`}>
                  <button className="r3-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }}>Details</button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
