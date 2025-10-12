// Installation Configuration
// Toggle this between 'github' and 'chrome-web-store' based on publication status
const INSTALL_SOURCE = 'github'; // Options: 'github' or 'chrome-web-store'

const CONFIG = {
  github: {
    installUrl: 'https://github.com/Apra-Labs/ai-code-buddy/releases/latest',
    installText: 'Download Latest Release',
    reviewUrl: null, // No reviews on GitHub
    showReviewSection: false
  },
  'chrome-web-store': {
    installUrl: 'https://chrome.google.com/webstore', // Update this with actual store URL after publication
    installText: 'Install Extension',
    reviewUrl: 'https://chrome.google.com/webstore', // Update this with actual store URL after publication
    showReviewSection: true
  }
};

// Get current configuration
function getInstallConfig() {
  return CONFIG[INSTALL_SOURCE];
}

// Get install URL
function getInstallUrl() {
  return getInstallConfig().installUrl;
}

// Get install button text
function getInstallText() {
  return getInstallConfig().installText;
}

// Check if review section should be shown
function showReviewSection() {
  return getInstallConfig().showReviewSection;
}

// Get review URL (for Chrome Web Store)
function getReviewUrl() {
  return getInstallConfig().reviewUrl;
}
