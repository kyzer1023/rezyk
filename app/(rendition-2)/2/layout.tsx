import { Playfair_Display, Source_Sans_3 } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

export default function Rendition2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${playfair.variable} ${sourceSans.variable}`}
      style={{
        fontFamily: "var(--font-body), sans-serif",
        color: "#E8E5D8",
        minHeight: "100vh",
      }}
    >
      <style>{`
        .r2-heading {
          font-family: var(--font-heading), Georgia, serif;
          color: #F5F0E1;
        }
        .r2-card {
          background: rgba(42, 60, 42, 0.55);
          border: 1px solid rgba(139, 168, 120, 0.25);
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .r2-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .r2-board {
          background: linear-gradient(175deg, #2B3D2B 0%, #1F2E1F 50%, #233023 100%);
          border: 6px solid #4A3728;
          border-radius: 4px;
          box-shadow: inset 0 0 60px rgba(0,0,0,0.3), 0 4px 20px rgba(0,0,0,0.4);
          position: relative;
        }
        .r2-board::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          border-radius: 2px;
        }
        .r2-chalk {
          color: #F5F0E1;
          text-shadow: 0 0 3px rgba(245,240,225,0.15);
        }
        .r2-btn {
          background: #8BA878;
          color: #1A271A;
          border: none;
          padding: 10px 24px;
          border-radius: 4px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: all 0.15s;
        }
        .r2-btn:hover { background: #9DB98C; }
        .r2-btn:active { transform: translateY(1px); box-shadow: none; }
        .r2-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .r2-btn-outline {
          background: transparent;
          color: #8BA878;
          border: 1.5px solid #8BA878;
          padding: 10px 24px;
          border-radius: 4px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .r2-btn-outline:hover { background: rgba(139,168,120,0.1); }
        .r2-fade-in {
          animation: r2FadeIn 0.5s ease-out both;
        }
        .r2-fade-in-d1 { animation-delay: 0.12s; }
        .r2-fade-in-d2 { animation-delay: 0.24s; }
        .r2-fade-in-d3 { animation-delay: 0.36s; }
        @keyframes r2FadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes r2ChalkWrite {
          from { opacity: 0; letter-spacing: 3px; }
          to { opacity: 1; letter-spacing: 0; }
        }
        .r2-chalk-write {
          animation: r2ChalkWrite 0.6s ease-out both;
        }
        .r2-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 600;
        }
        .r2-badge-critical { background: rgba(244,67,54,0.2); color: #EF9A9A; }
        .r2-badge-high { background: rgba(255,152,0,0.2); color: #FFCC80; }
        .r2-badge-medium { background: rgba(255,235,59,0.2); color: #FFF59D; }
        .r2-badge-low { background: rgba(139,168,120,0.25); color: #A5D6A7; }
        .r2-badge-synced { background: rgba(139,168,120,0.25); color: #A5D6A7; }
        .r2-badge-not_synced { background: rgba(255,255,255,0.08); color: #BDBDBD; }
        .r2-badge-completed { background: rgba(100,181,246,0.2); color: #90CAF9; }
        .r2-badge-not_started { background: rgba(255,255,255,0.08); color: #BDBDBD; }
        .r2-badge-error { background: rgba(244,67,54,0.2); color: #EF9A9A; }
        .r2-badge-running { background: rgba(255,235,59,0.2); color: #FFF59D; }
        .r2-divider {
          height: 1px;
          background: rgba(139,168,120,0.2);
          border: none;
          margin: 16px 0;
        }
        .r2-input {
          padding: 8px 14px;
          border: 1px solid rgba(139,168,120,0.3);
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
          background: rgba(0,0,0,0.2);
          color: #E8E5D8;
          outline: none;
        }
        .r2-input:focus {
          border-color: #8BA878;
          box-shadow: 0 0 0 2px rgba(139,168,120,0.15);
        }
        .r2-input::placeholder { color: rgba(232,229,216,0.4); }
      `}</style>
      {children}
    </div>
  );
}
