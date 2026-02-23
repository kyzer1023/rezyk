import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-heading",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-body",
});

export default function Rendition1Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${libreBaskerville.variable} ${sourceSans.variable}`}
      style={{
        fontFamily: "var(--font-body), Georgia, serif",
        background: "#FAF7F2",
        color: "#3B2F2F",
        minHeight: "100vh",
      }}
    >
      <style>{`
        .r1-fade-in {
          animation: r1FadeIn 0.5s ease-out both;
        }
        .r1-fade-in-delay-1 { animation-delay: 0.1s; }
        .r1-fade-in-delay-2 { animation-delay: 0.2s; }
        .r1-fade-in-delay-3 { animation-delay: 0.3s; }
        .r1-fade-in-delay-4 { animation-delay: 0.4s; }
        @keyframes r1FadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .r1-card {
          background: #FFFFFF;
          border: 1px solid #E8E0D5;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(59,47,47,0.06);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .r1-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59,47,47,0.1);
        }
        .r1-heading {
          font-family: var(--font-heading), Georgia, serif;
          color: #3B2F2F;
        }
        .r1-accent { color: #C1694F; }
        .r1-btn {
          background: #C1694F;
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
        .r1-btn:hover { background: #A85A42; transform: translateY(-1px); }
        .r1-btn-outline {
          background: transparent;
          color: #C1694F;
          border: 1.5px solid #C1694F;
          padding: 10px 24px;
          border-radius: 6px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .r1-btn-outline:hover { background: rgba(193,105,79,0.08); }
        .r1-grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .r1-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .r1-badge-critical { background: #FEE2E2; color: #991B1B; }
        .r1-badge-high { background: #FFEDD5; color: #9A3412; }
        .r1-badge-medium { background: #FEF3C7; color: #92400E; }
        .r1-badge-low { background: #DCFCE7; color: #166534; }
        .r1-badge-synced { background: #DCFCE7; color: #166534; }
        .r1-badge-not_synced { background: #F3F4F6; color: #6B7280; }
        .r1-badge-error { background: #FEE2E2; color: #991B1B; }
        .r1-badge-completed { background: #DBEAFE; color: #1E40AF; }
        .r1-badge-running { background: #FEF3C7; color: #92400E; }
        .r1-badge-not_started { background: #F3F4F6; color: #6B7280; }
      `}</style>
      <div className="r1-grain" />
      {children}
    </div>
  );
}
