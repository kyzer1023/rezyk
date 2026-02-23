"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockStudents } from "@/lib/mock-data";
import type { RiskLevel } from "@/lib/types";

export default function R5Students() {
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
      <h1 className="r5-heading r5-slide-in" style={{ fontSize: 20, marginBottom: 14 }}>Students</h1>
      <div className="r5-slide-in r5-sd1" style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 14px", border: "1px solid rgba(201,169,110,0.15)", borderRadius: 6, fontSize: 13, flex: 1, maxWidth: 260, fontFamily: "inherit", background: "rgba(22,33,62,0.6)", color: "#E8E4DB" }} />
        <select value={filter} onChange={(e) => setFilter(e.target.value as RiskLevel | "all")}
          style={{ padding: "8px 14px", border: "1px solid rgba(201,169,110,0.15)", borderRadius: 6, fontSize: 13, fontFamily: "inherit", background: "rgba(22,33,62,0.6)", color: "#E8E4DB" }}>
          <option value="all">All Risks</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="r5-card r5-slide-in r5-sd2" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(201,169,110,0.1)" }}>
              <th style={{ padding: "8px 16px", textAlign: "left", fontWeight: 700, color: "#C9A96E", fontSize: 12 }}>Name</th>
              <th style={{ padding: "8px 16px", textAlign: "left", fontWeight: 700, color: "#C9A96E", fontSize: 12 }}>Score</th>
              <th style={{ padding: "8px 16px", textAlign: "left", fontWeight: 700, color: "#C9A96E", fontSize: 12 }}>Risk</th>
              <th style={{ padding: "8px 16px", textAlign: "left", fontWeight: 700, color: "#C9A96E", fontSize: 12 }}>Gaps</th>
              <th style={{ padding: "8px 16px" }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id} style={{ borderBottom: "1px solid rgba(201,169,110,0.06)" }}>
                <td style={{ padding: "8px 16px" }}>
                  <p style={{ fontWeight: 700 }}>{student.name}</p>
                  <p style={{ fontSize: 11, color: "#64748B" }}>{student.email}</p>
                </td>
                <td style={{ padding: "8px 16px" }}>{student.score}/{student.totalScore}</td>
                <td style={{ padding: "8px 16px" }}><span className={`r5-badge r5-badge-${student.riskLevel}`}>{student.riskLevel}</span></td>
                <td style={{ padding: "8px 16px", fontSize: 12 }}>{student.knowledgeGaps.length > 0 ? student.knowledgeGaps.map((g) => g.concept).join(", ") : "None"}</td>
                <td style={{ padding: "8px 16px", textAlign: "right" }}>
                  <Link href={`/5/dashboard/courses/${courseId}/quizzes/${quizId}/students/${student.id}`}>
                    <button className="r5-btn-outline" style={{ padding: "4px 12px", fontSize: 11 }}>Details</button>
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
