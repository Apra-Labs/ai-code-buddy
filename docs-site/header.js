// Common header component for all documentation pages
function renderHeader() {
  const header = document.createElement('header');
  header.className = 'header';

  header.innerHTML = `
    <div class="container">
      <div class="logo">
        <svg class="logo-icon" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#94BA33;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#7a9b2a;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="128" height="128" rx="26" fill="url(#grad1)"/>
          <g transform="translate(64, 64)">
            <path d="M -28 -20 L -35 -20 Q -40 -20 -40 -15 L -40 15 Q -40 20 -35 20 L -28 20"
                  stroke="white" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.95"/>
            <path d="M 28 -20 L 35 -20 Q 40 -20 40 -15 L 40 15 Q 40 20 35 20 L 28 20"
                  stroke="white" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.95"/>
            <circle cx="0" cy="0" r="6" fill="#b5d957" opacity="0.9"/>
            <circle cx="0" cy="0" r="3.5" fill="white"/>
            <line x1="0" y1="-12" x2="0" y2="-18" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
            <line x1="0" y1="12" x2="0" y2="18" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
            <line x1="-12" y1="0" x2="-18" y2="0" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
            <line x1="12" y1="0" x2="18" y2="0" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
          </g>
        </svg>
        <div>
          <h1 class="logo-text">AI Code Buddy</h1>
          <p class="logo-tagline">by <a href="https://www.apralabs.com" target="_blank">Apra Labs</a></p>
        </div>
      </div>
      <nav class="nav">
        <a href="index.html">Home</a>
        <a href="index.html#features">Features</a>
        <a href="index.html#quick-start">Quick Start</a>
        <a href="index.html#docs">Docs</a>
        <a href="index.html#feedback">Feedback</a>
        <a href="#" target="_blank" class="btn-primary install-link">Install Extension</a>
      </nav>
    </div>
  `;

  return header;
}

// Insert header at the beginning of body when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const existingHeader = document.querySelector('header.header');
  if (existingHeader) {
    existingHeader.replaceWith(renderHeader());
  } else {
    document.body.insertBefore(renderHeader(), document.body.firstChild);
  }
});
