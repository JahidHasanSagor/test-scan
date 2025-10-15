import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Blog Post Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function getBlogPost(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(`${baseUrl}/api/blog/${slug}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.post;
  } catch (error) {
    console.error("Error fetching blog post for OG image:", error);
    return null;
  }
}

function formatDate(isoString: string) {
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Post Not Found
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
          {post.category && (
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
              {post.category.name}
            </div>
          )}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              padding: "12px 24px",
              fontSize: "20px",
              fontWeight: "500",
            }}
          >
            📖 {post.readTime}
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
              fontSize: "64px",
              fontWeight: "900",
              lineHeight: "1.1",
              margin: 0,
              textShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {post.title}
          </h1>
          <p
            style={{
              fontSize: "28px",
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
            {post.excerpt}
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
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {post.author && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "rgba(255, 255, 255, 0.3)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "700",
                  }}
                >
                  {post.author.name.charAt(0)}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ fontSize: "24px", fontWeight: "600" }}>
                    {post.author.name}
                  </div>
                  <div style={{ fontSize: "18px", opacity: 0.9 }}>
                    {formatDate(post.publishedAt)}
                  </div>
                </div>
              </div>
            )}
          </div>
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
              📝
            </div>
            Powerful Websites
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}