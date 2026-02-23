import { Playfair_Display, Lato } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-body",
});

export default function Rendition5Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${playfair.variable} ${lato.variable}`}
      style={{ fontFamily: "var(--font-body), sans-serif", color: "#E8E4DB", minHeight: "100vh", background: "#1A1A2E" }}
    >
      <style>{`
        .r5-heading { font-family: var(--font-heading), Georgia, serif; color: #E8E4DB; }
        .r5-gold { color: #C9A96E; }
        .r5-card {
          background: rgba(22,33,62,0.8);
          border: 1px solid rgba(201,169,110,0.15);
          border-radius: 8px;
          backdrop-filter: blur(8px);
          transition: border-color 0.2s, transform 0.2s;
        }
        .r5-card:hover {
          border-color: rgba(201,169,110,0.3);
          transform: translateY(-2px);
        }
        .r5-btn {
          background: #C9A96E;
          color: #1A1A2E;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .r5-btn:hover { background: #D4B87A; box-shadow: 0 0 16px rgba(201,169,110,0.3); }
        .r5-btn-outline {
          background: transparent;
          color: #C9A96E;
          border: 1.5px solid #C9A96E;
          padding: 10px 24px;
          border-radius: 6px;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .r5-btn-outline:hover { background: rgba(201,169,110,0.08); }
        .r5-slide-in { animation: r5SlideIn 0.4s ease-out both; }
        .r5-sd1 { animation-delay: 0.08s; }
        .r5-sd2 { animation-delay: 0.16s; }
        .r5-sd3 { animation-delay: 0.24s; }
        @keyframes r5SlideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .r5-badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; }
        .r5-badge-critical { background: rgba(220,38,38,0.2); color: #FCA5A5; }
        .r5-badge-high { background: rgba(234,88,12,0.2); color: #FDBA74; }
        .r5-badge-medium { background: rgba(217,119,6,0.2); color: #FCD34D; }
        .r5-badge-low { background: rgba(22,163,74,0.2); color: #86EFAC; }
        .r5-badge-synced { background: rgba(22,163,74,0.2); color: #86EFAC; }
        .r5-badge-not_synced { background: rgba(100,116,139,0.2); color: #94A3B8; }
        .r5-badge-completed { background: rgba(201,169,110,0.2); color: #C9A96E; }
        .r5-badge-not_started { background: rgba(100,116,139,0.2); color: #94A3B8; }
        .r5-badge-error { background: rgba(220,38,38,0.2); color: #FCA5A5; }
        .r5-badge-running { background: rgba(217,119,6,0.2); color: #FCD34D; }
      `}</style>
      {children}
    </div>
  );
}
