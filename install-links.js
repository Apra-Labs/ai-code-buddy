// Install Links Configuration Script
// This script updates all install and review links based on config.js

document.addEventListener('DOMContentLoaded', function() {
  const installUrl = getInstallUrl();
  const installText = getInstallText();

  // Update all install links
  document.querySelectorAll('.install-link').forEach(link => {
    link.href = installUrl;
  });

  // Update install button text in hero (if exists)
  const installTextElement = document.querySelector('.install-text');
  if (installTextElement && INSTALL_SOURCE === 'chrome-web-store') {
    installTextElement.textContent = 'Add to Chrome - It\'s Free';
  } else if (installTextElement) {
    installTextElement.textContent = 'Download Latest Release';
  }

  // Handle review section visibility
  const reviewCard = document.querySelector('.review-card');
  if (!showReviewSection()) {
    if (reviewCard) {
      reviewCard.style.display = 'none';
    }
  } else {
    const reviewUrl = getReviewUrl();
    document.querySelectorAll('.review-link').forEach(link => {
      link.href = reviewUrl;
    });
  }
});
