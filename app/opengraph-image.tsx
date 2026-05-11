import { ImageResponse } from "next/og";

const title = "LinguaLayer";
const tagline = "Rights, licensing, and royalties for African language AI.";
const bg = "#0c1812";
const bg2 = "#143224";
const accent = "#5ee9a8";
const accent2 = "#c8f59f";

export const alt = "LinguaLayer \u2014 Rights, licensing, and royalties for African language AI.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `linear-gradient(148deg, ${bg} 0%, ${bg2} 52%, ${bg} 100%)`,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div
            style={{
              width: "92px",
              height: "92px",
              borderRadius: "24px",
              background: `linear-gradient(145deg, ${accent}55, ${accent2}66)`,
              border: `2px solid ${accent}aa`,
              boxShadow: `0 28px 96px ${accent}44`,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#f8fafc",
              }}
            >
              {title}
            </span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: accent,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Stellar · Soroban
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "940px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "38px",
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: "-0.032em",
              color: "#f1f5f9",
            }}
          >
            {tagline}
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "17px", color: "rgba(148,163,184,0.95)" }}>
          <span>GrantFox protocol suite</span>
          <span style={{ color: accent, fontWeight: 600 }}>Explore the app →</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
