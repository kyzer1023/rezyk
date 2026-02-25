"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace("/dashboard");
        } else {
          router.replace("/?error=auth_failed");
        }
      })
      .catch(() => router.replace("/?error=auth_failed"));
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF6F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid #E8DFD4",
            borderTopColor: "#C17A56",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ color: "#8A7D6F", fontSize: 14 }}>
          Completing sign-in…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
