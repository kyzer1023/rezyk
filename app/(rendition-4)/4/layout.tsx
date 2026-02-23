import { Outfit, Figtree } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heading",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

export default function Rendition4Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${outfit.variable} ${figtree.variable}`}
      style={{ fontFamily: "var(--font-body), sans-serif", color: "#2C3540", minHeight: "100vh" }}
    >
      <style>{`
        .r4-heading { font-family: var(--font-heading), sans-serif; color: #1A2430; font-weight: 500; }
        .r4-card {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(160,178,196,0.2);
          border-radius: 10px;
          box-shadow: 0 1px 6px rgba(28,40,56,0.04);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .r4-card:hover {
          box-shadow: 0 4px 16px rgba(28,40,56,0.07);
          transform: translateY(-1px);
        }
        .r4-btn {
          background: #5C7D99;
          color: #FFFFFF;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .r4-btn:hover { background: #4A6B85; }
        .r4-btn:active { transform: scale(0.98); }
        .r4-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .r4-btn-outline {
          background: transparent;
          color: #5C7D99;
          border: 1.5px solid rgba(92,125,153,0.4);
          padding: 10px 24px;
          border-radius: 8px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .r4-btn-outline:hover { background: rgba(92,125,153,0.06); }
        .r4-fade-in { animation: r4FadeIn 0.4s ease-out both; }
        .r4-fd1 { animation-delay: 0.1s; }
        .r4-fd2 { animation-delay: 0.2s; }
        .r4-fd3 { animation-delay: 0.3s; }
        @keyframes r4FadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .r4-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .r4-badge-critical { background: rgba(198,68,60,0.1); color: #C6443C; }
        .r4-badge-high { background: rgba(210,140,60,0.1); color: #B8762A; }
        .r4-badge-medium { background: rgba(190,170,90,0.12); color: #907A1E; }
        .r4-badge-low { background: rgba(80,140,110,0.1); color: #3A7D5E; }
        .r4-badge-synced { background: rgba(80,140,110,0.1); color: #3A7D5E; }
        .r4-badge-not_synced { background: rgba(140,158,176,0.12); color: #6B7F90; }
        .r4-badge-completed { background: rgba(92,125,153,0.1); color: #4A6B85; }
        .r4-badge-not_started { background: rgba(140,158,176,0.12); color: #6B7F90; }
        .r4-badge-error { background: rgba(198,68,60,0.1); color: #C6443C; }
        .r4-badge-running { background: rgba(190,170,90,0.12); color: #907A1E; }
        .r4-muted { color: #7A8A98; }
        .r4-input {
          padding: 8px 14px;
          border: 1px solid rgba(160,178,196,0.3);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          background: rgba(255,255,255,0.6);
          color: #2C3540;
          outline: none;
          backdrop-filter: blur(8px);
        }
        .r4-input:focus { border-color: #5C7D99; box-shadow: 0 0 0 2px rgba(92,125,153,0.12); }
        .r4-input::placeholder { color: #A0B2C4; }
        .r4-grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
        }
      `}</style>
      <div className="r4-grain" />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
