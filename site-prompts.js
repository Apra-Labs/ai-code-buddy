// Site-Specific System Prompts Module
// Manages custom AI behavior per website/domain

/**
 * Match a URL hostname against a site pattern
 * Patterns supported:
 * - Exact: "rport.io"
 * - Wildcard subdomain: "*.example.com"
 * - Wildcard prefix: "*github.com" (matches github.com, my.github.com)
 *
 * @param {string} hostname - The hostname to match (e.g., "app.rport.io")
 * @param {string} pattern - The pattern to match against
 * @returns {boolean} - True if hostname matches pattern
 */
function matchHostnamePattern(hostname, pattern) {
  if (!hostname || !pattern) return false;

  // Normalize both to lowercase
  hostname = hostname.toLowerCase();
  pattern = pattern.toLowerCase();

  // Exact match
  if (hostname === pattern) return true;

  // Wildcard patterns
  if (pattern.includes('*')) {
    // Convert pattern to regex
    // *.example.com -> ^.*\.example\.com$
    // *github.com -> ^.*github\.com$
    const regexPattern = pattern
      .replace(/\./g, '\\.')  // Escape dots
      .replace(/\*/g, '.*');  // * becomes .*

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(hostname);
  }

  return false;
}

/**
 * Find the best matching site prompt for a given URL
 * Returns the most specific match (exact > wildcard > default)
 *
 * @param {string} url - The full URL or hostname
 * @param {Object} sitePrompts - Map of {pattern: {name, prompt, enabled}}
 * @returns {Object|null} - The matching prompt config or null
 */
function findMatchingPrompt(url, sitePrompts) {
  if (!url || !sitePrompts) return null;

  // Extract hostname from URL
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch (e) {
    // If not a full URL, treat as hostname
    hostname = url;
  }

  let bestMatch = null;
  let bestSpecificity = -1;

  for (const [pattern, config] of Object.entries(sitePrompts)) {
    // Skip disabled prompts
    if (config.enabled === false) continue;

    // Check if pattern matches
    if (matchHostnamePattern(hostname, pattern)) {
      // Calculate specificity (more specific = higher priority)
      // Exact match > wildcard with more chars > wildcard with fewer chars
      const specificity = pattern.includes('*')
        ? pattern.length  // Wildcards: longer is more specific
        : 1000 + pattern.length;  // Exact: always higher than wildcards

      if (specificity > bestSpecificity) {
        bestSpecificity = specificity;
        bestMatch = { pattern, ...config };
      }
    }
  }

  return bestMatch;
}

/**
 * Get the system prompt to use for a given URL
 *
 * @param {string} url - The URL or hostname
 * @param {Object} sitePrompts - Map of site-specific prompts
 * @param {string} defaultPrompt - Fallback prompt if no match
 * @returns {string} - The prompt to use
 */
function getPromptForUrl(url, sitePrompts, defaultPrompt) {
  const match = findMatchingPrompt(url, sitePrompts);

  if (match && match.prompt) {
    return match.prompt;
  }

  return defaultPrompt || '';
}

/**
 * Validate a site pattern
 *
 * @param {string} pattern - The pattern to validate
 * @returns {Object} - {valid: boolean, error: string}
 */
function validateSitePattern(pattern) {
  if (!pattern || pattern.trim() === '') {
    return { valid: false, error: 'Pattern cannot be empty' };
  }

  pattern = pattern.trim();

  // Check for invalid characters
  if (/[^a-z0-9.*\-_]/.test(pattern)) {
    return { valid: false, error: 'Pattern contains invalid characters' };
  }

  // Check for multiple consecutive wildcards
  if (pattern.includes('**')) {
    return { valid: false, error: 'Multiple consecutive wildcards not allowed' };
  }

  // Check wildcard position (only at start)
  const wildcardIndex = pattern.indexOf('*');
  if (wildcardIndex > 0) {
    return { valid: false, error: 'Wildcard (*) must be at the beginning' };
  }

  // Must have at least one dot if using wildcard
  if (pattern.includes('*') && !pattern.includes('.')) {
    return { valid: false, error: 'Wildcard pattern must include domain (e.g., *.example.com)' };
  }

  return { valid: true };
}

/**
 * Normalize a site pattern
 *
 * @param {string} pattern - The pattern to normalize
 * @returns {string} - Normalized pattern
 */
function normalizeSitePattern(pattern) {
  return pattern.trim().toLowerCase();
}

// Export for both browser extension and Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    matchHostnamePattern,
    findMatchingPrompt,
    getPromptForUrl,
    validateSitePattern,
    normalizeSitePattern
  };
}
