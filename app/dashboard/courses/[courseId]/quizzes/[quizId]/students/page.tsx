"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockStudents } from "@/lib/mock-data";
import type { RiskLevel } from "@/lib/types";
import { routes } from "@/lib/routes";

export default function StudentsPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const [filter, setFilter] = useState<RiskLevel | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = mockStudents.filter((student) => {
    if (filter !== "all" && student.riskLevel !== filter) {
      return false;
    }
    if (search && !student.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 16 }}>
        Students
      </h1>

      <div className="edu-fade-in edu-fd1" style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="edu-input"
          style={{ flex: 1, maxWidth: 280 }}
        />
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as RiskLevel | "all")}
          className="edu-input"
        >
          <option value="all">All Risks</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="edu-fade-in edu-fd2" style={{ display: "grid", gap: 10 }}>
        {filtered.map((student) => (
          <div key={student.id} className="edu-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background:
                      student.riskLevel === "critical"
                        ? "#FBEAE5"
                        : student.riskLevel === "high"
                          ? "#FDF0E1"
                          : student.riskLevel === "medium"
                            ? "#FEF8E7"
                            : "#E9F3E5",
                    color:
                      student.riskLevel === "critical"
                        ? "#A63D2E"
                        : student.riskLevel === "high"
                          ? "#A25E1A"
                          : student.riskLevel === "medium"
                            ? "#8B6914"
                            : "#3D7A2E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {student.name
                    .split(" ")
                    .map((namePart) => namePart[0])
                    .join("")}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{student.name}</p>
                  <p className="edu-muted" style={{ fontSize: 12 }}>
                    {student.score}/{student.totalScore} &middot;{" "}
                    {student.knowledgeGaps.length > 0
                      ? student.knowledgeGaps.map((gap) => gap.concept).join(", ")
                      : "No gaps"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className={`edu-badge edu-badge-${student.riskLevel}`}>{student.riskLevel}</span>
                <Link href={routes.studentDetail(courseId, quizId, student.id)}>
                  <button className="edu-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }}>
                    Details
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
