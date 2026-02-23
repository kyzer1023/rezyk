"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockStudents } from "@/lib/mock-data";
import type { RiskLevel } from "@/lib/types";

export default function R2Students() {
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
      <h1 className="r2-heading r2-fade-in" style={{ fontSize: 22, marginBottom: 16, fontWeight: 500 }}>
        Students
      </h1>

      <div className="r2-fade-in r2-fade-in-d1" style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="r2-input"
          style={{ flex: 1, maxWidth: 280 }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as RiskLevel | "all")}
          className="r2-input"
        >
          <option value="all">All Risks</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="r2-card r2-fade-in r2-fade-in-d2" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(139,168,120,0.2)" }}>
              {["Name", "Score", "Risk", "Gaps", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    color: "rgba(232,229,216,0.5)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr
                key={student.id}
                style={{ borderBottom: "1px solid rgba(139,168,120,0.08)" }}
              >
                <td style={{ padding: "10px 16px" }}>
                  <p className="r2-chalk" style={{ fontWeight: 500, fontSize: 14 }}>{student.name}</p>
                  <p style={{ fontSize: 11, color: "rgba(232,229,216,0.35)" }}>{student.email}</p>
                </td>
                <td style={{ padding: "10px 16px" }}>
                  {student.score}/{student.totalScore}
                </td>
                <td style={{ padding: "10px 16px" }}>
                  <span className={`r2-badge r2-badge-${student.riskLevel}`}>{student.riskLevel}</span>
                </td>
                <td style={{ padding: "10px 16px", fontSize: 13, color: "rgba(232,229,216,0.5)" }}>
                  {student.knowledgeGaps.length > 0
                    ? student.knowledgeGaps.map((g) => g.concept).join(", ")
                    : "None"}
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  <Link href={`/2/dashboard/courses/${courseId}/quizzes/${quizId}/students/${student.id}`}>
                    <button className="r2-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }}>
                      Details
                    </button>
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
