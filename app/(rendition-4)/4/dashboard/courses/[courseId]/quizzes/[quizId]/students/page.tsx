"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockStudents } from "@/lib/mock-data";
import type { RiskLevel } from "@/lib/types";

export default function R4Students() {
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
      <h1 className="r4-heading r4-fade-in" style={{ fontSize: 22, marginBottom: 16 }}>Students</h1>

      <div className="r4-fade-in r4-fd1" style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="r4-input" style={{ flex: 1, maxWidth: 280 }} />
        <select value={filter} onChange={(e) => setFilter(e.target.value as RiskLevel | "all")} className="r4-input">
          <option value="all">All Risks</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="r4-card r4-fade-in r4-fd2" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(160,178,196,0.15)" }}>
              {["Name", "Score", "Risk", "Gaps", ""].map((h) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, color: "#7A8A98" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id} style={{ borderBottom: "1px solid rgba(160,178,196,0.08)" }}>
                <td style={{ padding: "10px 16px" }}>
                  <p style={{ fontWeight: 500, fontSize: 14 }}>{student.name}</p>
                  <p className="r4-muted" style={{ fontSize: 11 }}>{student.email}</p>
                </td>
                <td style={{ padding: "10px 16px" }}>{student.score}/{student.totalScore}</td>
                <td style={{ padding: "10px 16px" }}>
                  <span className={`r4-badge r4-badge-${student.riskLevel}`}>{student.riskLevel}</span>
                </td>
                <td style={{ padding: "10px 16px", fontSize: 13, color: "#7A8A98" }}>
                  {student.knowledgeGaps.length > 0 ? student.knowledgeGaps.map((g) => g.concept).join(", ") : "None"}
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  <Link href={`/4/dashboard/courses/${courseId}/quizzes/${quizId}/students/${student.id}`}>
                    <button className="r4-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }}>Details</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
