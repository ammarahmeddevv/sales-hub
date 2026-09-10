import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0284c7, #7c3aed)",
          color: "#fff",
          fontSize: 260,
          fontWeight: 600,
          letterSpacing: "-0.02em",
        }}
      >
        AA
      </div>
    ),
    size,
  );
}
