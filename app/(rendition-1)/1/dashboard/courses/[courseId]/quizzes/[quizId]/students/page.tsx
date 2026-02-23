"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockStudents } from "@/lib/mock-data";
import type { RiskLevel } from "@/lib/types";

export default function R1Students() {
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
      <h1 className="r1-heading r1-fade-in" style={{ fontSize: 24, marginBottom: 20 }}>Students</h1>

      <div className="r1-fade-in r1-fade-in-delay-1" style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px 16px",
            border: "1px solid #E8E0D5",
            borderRadius: 6,
            fontSize: 15,
            flex: 1,
            maxWidth: 300,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as RiskLevel | "all")}
          style={{
            padding: "10px 16px",
            border: "1px solid #E8E0D5",
            borderRadius: 6,
            fontSize: 15,
            background: "#fff",
            fontFamily: "inherit",
          }}
        >
          <option value="all">All Risks</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="r1-card r1-fade-in r1-fade-in-delay-2" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
          <thead>
            <tr style={{ background: "#FAF7F2", borderBottom: "1px solid #E8E0D5" }}>
              <th style={{ padding: "12px 20px", textAlign: "left", fontWeight: 600 }}>Name</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontWeight: 600 }}>Score</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontWeight: 600 }}>Risk</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontWeight: 600 }}>Gaps</th>
              <th style={{ padding: "12px 20px", textAlign: "right", fontWeight: 600 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id} style={{ borderBottom: "1px solid #F0EAE0" }}>
                <td style={{ padding: "12px 20px" }}>
                  <p style={{ fontWeight: 600 }}>{student.name}</p>
                  <p style={{ fontSize: 12, color: "#8B7E7E" }}>{student.email}</p>
                </td>
                <td style={{ padding: "12px 20px" }}>
                  {student.score}/{student.totalScore}
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <span className={`r1-badge r1-badge-${student.riskLevel}`}>{student.riskLevel}</span>
                </td>
                <td style={{ padding: "12px 20px" }}>
                  {student.knowledgeGaps.length > 0
                    ? student.knowledgeGaps.map((g) => g.concept).join(", ")
                    : "None"}
                </td>
                <td style={{ padding: "12px 20px", textAlign: "right" }}>
                  <Link href={`/1/dashboard/courses/${courseId}/quizzes/${quizId}/students/${student.id}`}>
                    <button className="r1-btn-outline" style={{ padding: "6px 16px", fontSize: 13 }}>Details</button>
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
