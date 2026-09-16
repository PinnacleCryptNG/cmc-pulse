import { ImageResponse } from "next/og";

export const alt = "CMC Pulse — Underlier Desk";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#111417",
          color: "#f1f2ee",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 28, height: 28, background: "#f1f2ee", display: "flex" }} />
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 3 }}>CMC PULSE</div>
          <div style={{ fontSize: 18, color: "#8d9490", letterSpacing: 2 }}>UNDERLIER DESK</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <div style={{ fontSize: 18, color: "#7fe0a4", letterSpacing: 4, marginBottom: 20 }}>RWA INTELLIGENCE</div>
          <div style={{ fontSize: 64, lineHeight: 1.05, fontWeight: 700, letterSpacing: -2 }}>Understand what&apos;s actually behind tokenized assets.</div>
          <div style={{ fontSize: 25, lineHeight: 1.4, color: "#aeb5b1", marginTop: 24 }}>Trace tokenized assets back to the underlying asset, issuer and market.</div>
        </div>
        <div style={{ display: "flex", fontSize: 16, color: "#8d9490", letterSpacing: 2 }}>FIND  →  RESOLVE  →  TRACE  →  VERIFY</div>
      </div>
    ),
    { ...size },
  );
}
