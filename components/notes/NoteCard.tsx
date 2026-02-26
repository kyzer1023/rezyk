"use client";

import { useRef } from "react";

interface NoteData {
  displayName: string;
  riskLevel: string;
  note: {
    topWeaknesses: { concept: string; errorType: string }[];
    rootIssue: string;
    improvementTips: string[];
    followUpAction: string;
  };
  generatedAt: number;
}

const RISK_STYLE: Record<string, { bg: string; color: string }> = {
  critical: { bg: "#FDECEA", color: "#A63D2E" },
  high: { bg: "#FEF4E5", color: "#A25E1A" },
  medium: { bg: "#FEF8E7", color: "#8B6914" },
  low: { bg: "#E9F3E5", color: "#3D7A2E" },
};

const ERROR_COLORS: Record<string, string> = {
  conceptual: "#A63D2E",
  procedural: "#A25E1A",
  careless: "#2B5E9E",
};

export default function NoteCard({
  data,
  onRegenerate,
  regenerating,
}: {
  data: NoteData;
  onRegenerate?: () => void;
  regenerating?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const risk = RISK_STYLE[data.riskLevel] ?? RISK_STYLE.low;

  function handleCopy() {
    const lines = [
      `Student: ${data.displayName}`,
      `Risk Level: ${data.riskLevel}`,
      "",
      "Top Weaknesses:",
      ...data.note.topWeaknesses.map((w) => `  - ${w.concept} (${w.errorType})`),
      "",
      `Root Issue: ${data.note.rootIssue}`,
      "",
      "Improvement Tips:",
      ...data.note.improvementTips.map((t, i) => `  ${i + 1}. ${t}`),
      "",
      `Follow-up Action: ${data.note.followUpAction}`,
      "",
      `Generated: ${new Date(data.generatedAt).toLocaleString()}`,
      "— AI-generated draft via EduInsight AI",
    ];
    navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
  }

  function handlePrint() {
    const el = cardRef.current;
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Note: ${data.displayName}</title>
      <style>body{font-family:system-ui;padding:40px;max-width:700px;margin:0 auto;color:#3A2E24}
      h2{margin-bottom:4px}h3{margin-top:20px;margin-bottom:8px;color:#C17A56}
      ul{padding-left:20px}li{margin-bottom:6px}
      .badge{display:inline-block;padding:2px 10px;border-radius:4px;font-size:12px;font-weight:600}
      .tag{display:inline-block;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600;margin-left:6px}
      .footer{margin-top:24px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:12px}</style></head><body>`);
    w.document.write(el.innerHTML);
    w.document.write(`<div class="footer">AI-generated draft via EduInsight AI &middot; ${new Date(data.generatedAt).toLocaleString()}</div>`);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  }

  return (
    <div ref={cardRef} className="edu-card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, textTransform: "capitalize" }}>
            {data.displayName}
          </h3>
          <p className="edu-muted" style={{ fontSize: 11, marginTop: 4 }}>
            Generated {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 4, background: risk.bg, color: risk.color, textTransform: "capitalize" }}>
          {data.riskLevel}
        </span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: "#8A7D6F", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
          Top Weaknesses
        </h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {data.note.topWeaknesses.map((w, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 6, background: "#F5F0E9", fontSize: 13 }}>
              {w.concept}
              <span style={{ fontSize: 10, fontWeight: 600, color: ERROR_COLORS[w.errorType] ?? "#8A7D6F", textTransform: "uppercase" }}>
                {w.errorType}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: "#8A7D6F", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
          Root Issue
        </h4>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#5A5048", margin: 0 }}>{data.note.rootIssue}</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: "#8A7D6F", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
          Improvement Tips
        </h4>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {data.note.improvementTips.map((tip, i) => (
            <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: "#5A5048", marginBottom: 4 }}>{tip}</li>
          ))}
        </ol>
      </div>

      <div style={{ marginBottom: 16, padding: "12px 16px", background: "#E9F3E5", borderRadius: 8 }}>
        <h4 style={{ fontSize: 12, fontWeight: 600, color: "#3D7A2E", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
          Follow-up Action
        </h4>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: "#3D7A2E", margin: 0 }}>{data.note.followUpAction}</p>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="edu-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }} onClick={handleCopy}>
          Copy
        </button>
        <button className="edu-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }} onClick={handlePrint}>
          Print
        </button>
        {onRegenerate && (
          <button className="edu-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }} onClick={onRegenerate} disabled={regenerating}>
            {regenerating ? "Regenerating…" : "Regenerate"}
          </button>
        )}
      </div>

      <p style={{ fontSize: 10, color: "#C5BAB0", marginTop: 10, fontStyle: "italic" }}>
        AI-generated draft — review before sharing
      </p>
    </div>
  );
}
