import { feature, product, priceItem, featureItem, pricedFeatureItem } from "atmn";

export const toolSubmissions = feature({
  id: "tool_submissions",
  name: "Tool Submissions",
  type: "single_use",
});

export const priorityReview = feature({
  id: "priority_review",
  name: "Priority Review",
  type: "boolean",
});

export const dedicatedSupport = feature({
  id: "dedicated_support",
  name: "Dedicated Support",
  type: "boolean",
});

export const customBranding = feature({
  id: "custom_branding",
  name: "Custom Branding",
  type: "boolean",
});

export const free = product({
  id: "free",
  name: "Free",
  is_default: true,
  items: [
    featureItem({
      feature_id: toolSubmissions.id,
      included_usage: 100,
      interval: "month",
    }),
  ],
});

export const payPerTool = product({
  id: "pay-per-tool",
  name: "Pay-Per-Tool",
  items: [
    pricedFeatureItem({
      feature_id: toolSubmissions.id,
      price: 1900, // $19.00 in cents
      billing_units: 1,
      usage_model: "prepaid",
    }),
  ],
});

export const pro = product({
  id: "pro",
  name: "Pro",
  items: [
    priceItem({
      price: 9900, // $99.00 in cents
      interval: "month",
    }),
    featureItem({
      feature_id: toolSubmissions.id,
      included_usage: 100,
      interval: "month",
    }),
    featureItem({
      feature_id: priorityReview.id,
    }),
  ],
});

export const enterprise = product({
  id: "enterprise",
  name: "Enterprise",
  items: [
    featureItem({
      feature_id: toolSubmissions.id,
      included_usage: 200,
      interval: "month",
    }),
    featureItem({
      feature_id: priorityReview.id,
    }),
    featureItem({
      feature_id: dedicatedSupport.id,
    }),
    featureItem({
      feature_id: customBranding.id,
    }),
  ],
});