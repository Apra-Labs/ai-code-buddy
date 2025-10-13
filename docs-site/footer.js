// Common Footer Component for AI Code Buddy Documentation
// Maintains DRY principle by defining footer HTML in one place

document.addEventListener('DOMContentLoaded', function() {
  // Check if footer already exists (to avoid duplication)
  if (document.querySelector('.footer')) {
    console.log('Footer already exists, skipping injection');
    return;
  }

  const footerHTML = `
  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <h3>AI Code Buddy</h3>
          <p>Built by <a href="https://www.apralabs.com" target="_blank">Apra Labs</a></p>
          <p class="footer-tagline">Streamline your terminal workflows with AI assistance</p>
        </div>
        <div class="footer-links">
          <div class="footer-column">
            <h4>Product</h4>
            <a href="index.html#features">Features</a>
            <a href="quick-start.html">Quick Start</a>
            <a href="#" target="_blank" class="install-link">Install</a>
          </div>
          <div class="footer-column">
            <h4>Documentation</h4>
            <a href="site-specific-prompts.html">Site-Specific Prompts</a>
            <a href="api-keys.html">API Keys</a>
            <a href="site-permissions.html">Site Permissions</a>
            <a href="security.html">Security</a>
            <a href="troubleshooting.html">Troubleshooting</a>
            <a href="privacy.html">Privacy Policy</a>
          </div>
          <div class="footer-column">
            <h4>Community</h4>
            <a href="https://github.com/Apra-Labs/ai-code-buddy" target="_blank">GitHub</a>
            <a href="https://github.com/Apra-Labs/ai-code-buddy/issues" target="_blank">Issues</a>
            <a href="index.html#feedback">Feedback</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 <a href="https://www.apralabs.com" target="_blank">Apra Labs</a>. Open Source Project.</p>
        <p>🔒 Your API keys are safe - stored locally, never sent to us. <a href="privacy.html">Privacy Policy</a></p>
      </div>
    </div>
  </footer>
  `;

  // Insert footer before the closing body tag
  document.body.insertAdjacentHTML('beforeend', footerHTML);
});
