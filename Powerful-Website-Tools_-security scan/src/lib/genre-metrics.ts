// Genre-specific metrics configuration
// Each tool category has unique performance metrics relevant to its use case

export type MetricKey = string;

export type GenreMetrics = {
  metrics: {
    key: MetricKey;
    label: string;
    icon: string;
  }[];
  color: string;
};

export const GENRE_METRICS: Record<string, GenreMetrics> = {
  // AI & Machine Learning Tools
  "AI Writing": {
    metrics: [
      { key: "contentQuality", label: "Content Quality", icon: "✨" },
      { key: "speedEfficiency", label: "Generation Speed", icon: "⚡" },
      { key: "creativeFeatures", label: "Creativity", icon: "🎨" },
      { key: "integrationOptions", label: "Integrations", icon: "🔗" },
    ],
    color: "#8b5cf6",
  },
  "AI Tools": {
    metrics: [
      { key: "contentQuality", label: "Accuracy", icon: "🎯" },
      { key: "speedEfficiency", label: "Speed", icon: "⚡" },
      { key: "integrationOptions", label: "API Access", icon: "🔗" },
      { key: "valueForMoney", label: "Value", icon: "💰" },
    ],
    color: "#8b5cf6",
  },
  "Machine Learning": {
    metrics: [
      { key: "contentQuality", label: "Model Quality", icon: "🧠" },
      { key: "speedEfficiency", label: "Training Speed", icon: "⚡" },
      { key: "integrationOptions", label: "Framework Support", icon: "🔗" },
      { key: "learningCurve", label: "Ease of Use", icon: "📚" },
    ],
    color: "#6366f1",
  },

  // Design & Creative Tools
  "Design": {
    metrics: [
      { key: "creativeFeatures", label: "Creative Tools", icon: "🎨" },
      { key: "speedEfficiency", label: "Performance", icon: "⚡" },
      { key: "integrationOptions", label: "Plugins", icon: "🔗" },
      { key: "learningCurve", label: "Ease of Use", icon: "📚" },
    ],
    color: "#ec4899",
  },
  "Video Editing": {
    metrics: [
      { key: "contentQuality", label: "Export Quality", icon: "🎬" },
      { key: "speedEfficiency", label: "Rendering Speed", icon: "⚡" },
      { key: "creativeFeatures", label: "Effects Library", icon: "✨" },
      { key: "learningCurve", label: "User Friendly", icon: "📚" },
    ],
    color: "#f59e0b",
  },
  "Photo Editing": {
    metrics: [
      { key: "contentQuality", label: "Output Quality", icon: "📷" },
      { key: "creativeFeatures", label: "Filters & Tools", icon: "🎨" },
      { key: "speedEfficiency", label: "Processing Speed", icon: "⚡" },
      { key: "valueForMoney", label: "Value", icon: "💰" },
    ],
    color: "#10b981",
  },

  // Productivity Tools
  "Productivity": {
    metrics: [
      { key: "speedEfficiency", label: "Efficiency", icon: "⚡" },
      { key: "integrationOptions", label: "Integrations", icon: "🔗" },
      { key: "learningCurve", label: "Ease of Use", icon: "📚" },
      { key: "valueForMoney", label: "Value", icon: "💰" },
    ],
    color: "#3b82f6",
  },
  "Project Management": {
    metrics: [
      { key: "creativeFeatures", label: "Features", icon: "📊" },
      { key: "integrationOptions", label: "Integrations", icon: "🔗" },
      { key: "learningCurve", label: "Team Adoption", icon: "👥" },
      { key: "valueForMoney", label: "Value", icon: "💰" },
    ],
    color: "#0ea5e9",
  },
  "Time Management": {
    metrics: [
      { key: "speedEfficiency", label: "Efficiency", icon: "⏱️" },
      { key: "creativeFeatures", label: "Features", icon: "📋" },
      { key: "integrationOptions", label: "Calendar Sync", icon: "🔗" },
      { key: "learningCurve", label: "Simplicity", icon: "📚" },
    ],
    color: "#06b6d4",
  },

  // Development Tools
  "Development": {
    metrics: [
      { key: "speedEfficiency", label: "Build Speed", icon: "⚡" },
      { key: "creativeFeatures", label: "Features", icon: "🛠️" },
      { key: "integrationOptions", label: "Extensions", icon: "🔗" },
      { key: "learningCurve", label: "Developer UX", icon: "📚" },
    ],
    color: "#14b8a6",
  },
  "Code Editor": {
    metrics: [
      { key: "speedEfficiency", label: "Performance", icon: "⚡" },
      { key: "creativeFeatures", label: "Features", icon: "💻" },
      { key: "integrationOptions", label: "Extensions", icon: "🔗" },
      { key: "learningCurve", label: "Ease of Use", icon: "📚" },
    ],
    color: "#10b981",
  },
  "API Tools": {
    metrics: [
      { key: "contentQuality", label: "Reliability", icon: "🎯" },
      { key: "speedEfficiency", label: "Response Time", icon: "⚡" },
      { key: "integrationOptions", label: "Endpoints", icon: "🔗" },
      { key: "valueForMoney", label: "Pricing", icon: "💰" },
    ],
    color: "#8b5cf6",
  },

  // Marketing & Business
  "Marketing": {
    metrics: [
      { key: "contentQuality", label: "Campaign Quality", icon: "📈" },
      { key: "integrationOptions", label: "Platform Support", icon: "🔗" },
      { key: "creativeFeatures", label: "Automation", icon: "🤖" },
      { key: "valueForMoney", label: "ROI", icon: "💰" },
    ],
    color: "#f59e0b",
  },
  "SEO": {
    metrics: [
      { key: "contentQuality", label: "Data Accuracy", icon: "🎯" },
      { key: "creativeFeatures", label: "Analysis Tools", icon: "📊" },
      { key: "integrationOptions", label: "Integrations", icon: "🔗" },
      { key: "valueForMoney", label: "Value", icon: "💰" },
    ],
    color: "#10b981",
  },
  "Analytics": {
    metrics: [
      { key: "contentQuality", label: "Data Quality", icon: "📊" },
      { key: "speedEfficiency", label: "Real-time Data", icon: "⚡" },
      { key: "integrationOptions", label: "Data Sources", icon: "🔗" },
      { key: "creativeFeatures", label: "Visualization", icon: "📈" },
    ],
    color: "#3b82f6",
  },

  // Communication & Collaboration
  "Communication": {
    metrics: [
      { key: "speedEfficiency", label: "Message Speed", icon: "💬" },
      { key: "integrationOptions", label: "Integrations", icon: "🔗" },
      { key: "learningCurve", label: "User Friendly", icon: "📚" },
      { key: "valueForMoney", label: "Value", icon: "💰" },
    ],
    color: "#06b6d4",
  },
  "Collaboration": {
    metrics: [
      { key: "speedEfficiency", label: "Real-time Sync", icon: "🔄" },
      { key: "creativeFeatures", label: "Features", icon: "🤝" },
      { key: "integrationOptions", label: "Tool Support", icon: "🔗" },
      { key: "learningCurve", label: "Adoption", icon: "👥" },
    ],
    color: "#8b5cf6",
  },

  // E-commerce
  "E-commerce": {
    metrics: [
      { key: "creativeFeatures", label: "Store Features", icon: "🛍️" },
      { key: "integrationOptions", label: "Payment Options", icon: "💳" },
      { key: "speedEfficiency", label: "Load Speed", icon: "⚡" },
      { key: "valueForMoney", label: "Value", icon: "💰" },
    ],
    color: "#f59e0b",
  },

  // Default fallback for uncategorized tools
  "Other": {
    metrics: [
      { key: "contentQuality", label: "Quality", icon: "✨" },
      { key: "speedEfficiency", label: "Speed", icon: "⚡" },
      { key: "integrationOptions", label: "Integrations", icon: "🔗" },
      { key: "valueForMoney", label: "Value", icon: "💰" },
    ],
    color: "#6366f1",
  },
};

// Helper function to get metrics for a category
export function getMetricsForCategory(category: string): GenreMetrics {
  return GENRE_METRICS[category] || GENRE_METRICS["Other"];
}

// Helper to extract metric value from tool spider metrics
export function getMetricValue(
  spiderMetrics: Record<string, number>,
  metricKey: string
): number {
  return spiderMetrics[metricKey as keyof typeof spiderMetrics] || 0;
}