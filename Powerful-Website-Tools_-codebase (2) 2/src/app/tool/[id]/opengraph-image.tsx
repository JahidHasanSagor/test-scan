import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tool Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function getToolData(toolId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(`${baseUrl}/api/tools/${toolId}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.tool || data;
  } catch (error) {
    console.error("Error fetching tool for OG image:", error);
    return null;
  }
}

export default async function Image({ params }: { params: { id: string } }) {
  const tool = await getToolData(params.id);

  if (!tool) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Tool Not Found
        </div>
      ),
      {
        ...size,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "60px 80px",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              padding: "12px 24px",
              fontSize: "24px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {tool.category}
          </div>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              padding: "12px 24px",
              fontSize: "24px",
              fontWeight: "600",
              textTransform: "capitalize",
            }}
          >
            {tool.pricing}
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            flex: 1,
            justifyContent: "center",
            maxWidth: "900px",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: "900",
              lineHeight: "1.1",
              margin: 0,
              textShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
          >
            {tool.title}
          </h1>
          <p
            style={{
              fontSize: "32px",
              lineHeight: "1.4",
              margin: 0,
              opacity: 0.95,
              fontWeight: "400",
              maxWidth: "800px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {tool.description}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "white",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🚀
            </div>
            Powerful Websites
          </div>
          <div
            style={{
              fontSize: "24px",
              opacity: 0.9,
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              👁️ {tool.popularity.toLocaleString("en-US")} views
            </div>
            {tool.isFeatured && (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.3)",
                  borderRadius: "12px",
                  padding: "8px 16px",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                ⭐ Featured
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}