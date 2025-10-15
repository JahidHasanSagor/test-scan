/**
 * Utility functions to extract metadata from tool.features array
 * Features are stored with prefixes like:
 * - developer:Name
 * - developer_website:URL
 * - screenshots:url1|url2|url3
 * - pros:advantage1|advantage2
 * - cons:limitation1|limitation2
 */

export interface ToolMetadata {
  developerName: string | null;
  developerWebsite: string | null;
  developerDescription: string | null;
  screenshots: string[];
  currentVersion: string | null;
  releaseNotes: string | null;
  pros: string[];
  cons: string[];
  actualFeatures: string[];
}

/**
 * Extract all metadata from tool.features array at once
 */
export function extractToolMetadata(features: string[] | null): ToolMetadata {
  if (!features || !Array.isArray(features)) {
    return {
      developerName: null,
      developerWebsite: null,
      developerDescription: null,
      screenshots: [],
      currentVersion: null,
      releaseNotes: null,
      pros: [],
      cons: [],
      actualFeatures: [],
    };
  }

  const developerName = extractDeveloperName(features);
  const developerWebsite = extractDeveloperWebsite(features);
  const developerDescription = extractDeveloperDescription(features);
  const screenshots = extractScreenshots(features);
  const currentVersion = extractVersion(features);
  const releaseNotes = extractReleaseNotes(features);
  const pros = extractPros(features);
  const cons = extractCons(features);
  const actualFeatures = extractActualFeatures(features);

  return {
    developerName,
    developerWebsite,
    developerDescription,
    screenshots,
    currentVersion,
    releaseNotes,
    pros,
    cons,
    actualFeatures,
  };
}

/**
 * Extract developer name only
 */
export function extractDeveloperName(features: string[] | null): string | null {
  if (!features || !Array.isArray(features)) return null;
  
  const devFeature = features.find((f) => String(f).startsWith("developer:"));
  return devFeature ? String(devFeature).replace("developer:", "").trim() : null;
}

/**
 * Extract developer website only
 */
export function extractDeveloperWebsite(features: string[] | null): string | null {
  if (!features || !Array.isArray(features)) return null;
  
  const websiteFeature = features.find((f) => String(f).startsWith("developer_website:"));
  return websiteFeature ? String(websiteFeature).replace("developer_website:", "").trim() : null;
}

/**
 * Extract developer description only
 */
export function extractDeveloperDescription(features: string[] | null): string | null {
  if (!features || !Array.isArray(features)) return null;
  
  const descFeature = features.find((f) => String(f).startsWith("developer_desc:"));
  return descFeature ? String(descFeature).replace("developer_desc:", "").trim() : null;
}

/**
 * Extract version number only
 */
export function extractVersion(features: string[] | null): string | null {
  if (!features || !Array.isArray(features)) return null;
  
  const versionFeature = features.find((f) => String(f).startsWith("version:"));
  return versionFeature ? String(versionFeature).replace("version:", "").trim() : null;
}

/**
 * Extract release notes only
 */
export function extractReleaseNotes(features: string[] | null): string | null {
  if (!features || !Array.isArray(features)) return null;
  
  const notesFeature = features.find((f) => String(f).startsWith("release_notes:"));
  return notesFeature ? String(notesFeature).replace("release_notes:", "").trim() : null;
}

/**
 * Extract screenshot URLs only
 */
export function extractScreenshots(features: string[] | null): string[] {
  if (!features || !Array.isArray(features)) return [];
  
  const screenshotFeature = features.find((f) => String(f).startsWith("screenshots:"));
  if (!screenshotFeature) return [];
  
  return String(screenshotFeature)
    .replace("screenshots:", "")
    .split("|")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
}

/**
 * Extract pros from features array
 */
export function extractPros(features: string[] | null): string[] {
  if (!features) return [];
  const prosEntry = features.find((f) => f.startsWith("pros:"));
  if (!prosEntry) return [];
  const prosString = prosEntry.replace("pros:", "");
  return prosString.split("|").filter((p) => p.trim().length > 0);
}

/**
 * Extract cons from features array
 */
export function extractCons(features: string[] | null): string[] {
  if (!features) return [];
  const consEntry = features.find((f) => f.startsWith("cons:"));
  if (!consEntry) return [];
  const consString = consEntry.replace("cons:", "");
  return consString.split("|").filter((c) => c.trim().length > 0);
}

/**
 * Extract actual features (filter out metadata prefixes)
 */
export function extractActualFeatures(features: string[] | null): string[] {
  if (!features || !Array.isArray(features)) return [];
  
  return features
    .filter((f) => {
      const featureStr = String(f);
      return (
        !featureStr.startsWith("developer:") &&
        !featureStr.startsWith("developer_website:") &&
        !featureStr.startsWith("developer_desc:") &&
        !featureStr.startsWith("version:") &&
        !featureStr.startsWith("release_notes:") &&
        !featureStr.startsWith("screenshots:")
      );
    })
    .map((f) => String(f).trim())
    .filter((f) => f.length > 0);
}

/**
 * Get developer initials for avatar display
 */
export function getDeveloperInitials(developerName: string | null, fallback: string = "??") {
  if (!developerName || developerName.length === 0) return fallback;
  
  const words = developerName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}