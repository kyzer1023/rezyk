"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { routes } from "@/lib/routes";

function ErrorContent() {
  const params = useSearchParams();
  const message = params.get("message");

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF6F0", padding: 20 }}>
      <div className="edu-fade-in" style={{ textAlign: "center", maxWidth: 400 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#A63D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <h1 className="edu-heading" style={{ fontSize: 24, marginBottom: 8 }}>
          Something went wrong
        </h1>
        <p className="edu-muted" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          {message || "An error occurred. Please retry or return to the dashboard."}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <a href="/api/auth/login">
            <button className="edu-btn">Retry Sign-in</button>
          </a>
          <Link href={routes.dashboard()}>
            <button className="edu-btn-outline">Back to Dashboard</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#FAF6F0" }} />}>
      <ErrorContent />
    </Suspense>
  );
}
