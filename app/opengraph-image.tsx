import { ImageResponse } from "next/og";

export const alt = "UnderScope — RWA intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0d0f10", color: "#f1f2ee", padding: "64px 72px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 40, height: 40, border: "2px solid #7fe0a4", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#7fe0a4" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 25, fontWeight: 700, letterSpacing: 4 }}>UNDERSCOPE</div>
            <div style={{ fontSize: 13, color: "#8d9490", letterSpacing: 2 }}>CMC PULSE · RWA INTELLIGENCE</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
          <div style={{ fontSize: 17, color: "#7fe0a4", letterSpacing: 4, marginBottom: 18 }}>SEE WHAT&apos;S BEHIND THE TOKEN</div>
          <div style={{ fontSize: 62, lineHeight: 1.06, fontWeight: 700, letterSpacing: -2 }}>Trace tokenized assets back to the real-world asset.</div>
          <div style={{ fontSize: 24, lineHeight: 1.4, color: "#aeb5b1", marginTop: 22 }}>Underlying asset · issuer · tokenized representation · market</div>
        </div>
        <div style={{ display: "flex", fontSize: 15, color: "#8d9490", letterSpacing: 2 }}>FIND  →  RESOLVE  →  TRACE  →  VERIFY</div>
      </div>
    ),
    { ...size },
  );
}
