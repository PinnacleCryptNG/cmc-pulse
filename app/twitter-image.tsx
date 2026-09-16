import { ImageResponse } from "next/og";

export const alt = "UnderScope — RWA intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", background: "#0d0f10", color: "#f1f2ee", padding: "70px", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 20, color: "#7fe0a4", letterSpacing: 4 }}>UNDERSCOPE / CMC PULSE</div>
        <div style={{ fontSize: 62, lineHeight: 1.05, fontWeight: 700, marginTop: 22, maxWidth: 920 }}>See what&apos;s actually behind a tokenized asset.</div>
        <div style={{ fontSize: 25, color: "#aeb5b1", marginTop: 26 }}>Trace the asset. Identify the issuer. Verify the market.</div>
      </div>
    ),
    { ...size },
  );
}
