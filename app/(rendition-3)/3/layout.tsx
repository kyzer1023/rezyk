import { Crimson_Pro, Nunito } from "next/font/google";

const crimson = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

export default function Rendition3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${crimson.variable} ${nunito.variable}`}
      style={{
        fontFamily: "var(--font-body), sans-serif",
        color: "#3D3229",
        minHeight: "100vh",
        background: "#FAF6F0",
      }}
    >
      <style>{`
        .r3-heading { font-family: var(--font-heading), Georgia, serif; color: #3D3229; }
        .r3-card {
          background: #FFFFFF;
          border: 1px solid #E8DFD4;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(61,50,41,0.05);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .r3-card:hover {
          box-shadow: 0 3px 12px rgba(61,50,41,0.08);
          transform: translateY(-1px);
        }
        .r3-btn {
          background: #C17A56;
          color: #FFFFFF;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .r3-btn:hover { background: #A96842; }
        .r3-btn:active { transform: scale(0.98); }
        .r3-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .r3-btn-outline {
          background: transparent;
          color: #C17A56;
          border: 1.5px solid #C17A56;
          padding: 10px 24px;
          border-radius: 6px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .r3-btn-outline:hover { background: rgba(193,122,86,0.06); }
        .r3-fade-in { animation: r3FadeIn 0.45s ease-out both; }
        .r3-fd1 { animation-delay: 0.1s; }
        .r3-fd2 { animation-delay: 0.2s; }
        .r3-fd3 { animation-delay: 0.3s; }
        @keyframes r3FadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes r3SlideRight {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .r3-slide-right { animation: r3SlideRight 0.4s ease-out both; }
        .r3-badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .r3-badge-critical { background: #FBEAE5; color: #A63D2E; }
        .r3-badge-high { background: #FDF0E1; color: #A25E1A; }
        .r3-badge-medium { background: #FEF8E7; color: #8B6914; }
        .r3-badge-low { background: #E9F3E5; color: #3D7A2E; }
        .r3-badge-synced { background: #E9F3E5; color: #3D7A2E; }
        .r3-badge-not_synced { background: #F0ECE5; color: #8A7D6F; }
        .r3-badge-completed { background: #E3EDF7; color: #2B5E9E; }
        .r3-badge-not_started { background: #F0ECE5; color: #8A7D6F; }
        .r3-badge-error { background: #FBEAE5; color: #A63D2E; }
        .r3-badge-running { background: #FEF8E7; color: #8B6914; }
        .r3-muted { color: #8A7D6F; }
        .r3-input {
          padding: 8px 14px;
          border: 1px solid #E0D6CA;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          background: #FFFFFF;
          color: #3D3229;
          outline: none;
        }
        .r3-input:focus { border-color: #C17A56; box-shadow: 0 0 0 2px rgba(193,122,86,0.12); }
        .r3-accent { color: #C17A56; }
        .r3-divider { height: 1px; background: #E8DFD4; border: none; margin: 16px 0; }
      `}</style>
      {children}
    </div>
  );
}
