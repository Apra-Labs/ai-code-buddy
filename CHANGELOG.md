# Changelog

All notable changes to AI Code Buddy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-10-13

### Added
- **Site-Specific System Prompts**: Configure different AI behavior for different websites
  - Supports exact domain matches (e.g., `rport.io`)
  - Supports wildcard subdomains (e.g., `*.example.com`)
  - Supports wildcard prefixes (e.g., `*github.com`)
  - Specificity-based matching (most specific pattern wins)
  - Enable/disable individual prompts with toggle switches
  - Full UI in Advanced tab for managing site prompts
  - Backend integration automatically applies correct prompt per site
- New `site-prompts.js` module with URL pattern matching logic
- 45 comprehensive tests for site-specific prompts functionality

### Changed
- Redesigned popup footer for cleaner, more compact appearance
  - Reduced from 4 lines to 2 compact rows
  - Increased base font size from 8px to 9px for better readability
  - Added GitHub icon with "Open source" link
  - Better use of horizontal space with flexbox layout
  - More professional appearance without requiring additional space
- Updated build scripts (`.sh` and `.bat`) to include `site-prompts.js`
- Renamed "Custom System Prompt" to "Default System Prompt" for clarity

### Technical
- All 184 tests passing (139 existing + 45 new)
- Zero regressions
- Updated content.js to pass current page URL to background.js
- Updated background.js to retrieve and apply site-specific prompts
- Updated package.json to include site-prompts tests

## [2.1.3] - 2025-10-13

### Fixed
- **Improve Selected Text feature** now works correctly
  - Fixed modal display issue
  - Removed false error messages in popup
  - Fixed "Improve Further" button visibility in modal
  - Implemented fire-and-forget message pattern for better UX
  - Fixed syntax error (extra closing parenthesis)
  - Fixed async response error handling

### Technical
- Updated content.js message listener for improveSelected action
- Updated popup-multi.js with proper fire-and-forget messaging
- Fixed event listener logic for "Improve Further" button

## [2.1.2] - 2025-10-13

### Fixed
- **Clear All Settings button** now works correctly
  - Replaced native `confirm()` dialog with custom modal
  - Fixed z-index and positioning issues
  - OK and Cancel buttons are now clickable

### Changed
- Export filename changed from "rport-ai-config.json" to "apralabs-ai-code-buddy.json" for brand consistency

### Added
- Custom confirmation modal with proper styling and animations
- 15 tests for Clear Settings Modal functionality
- 32 tests for Export/Import configuration functionality

### Security
- API keys are never included in configuration exports

## [2.1.1] - 2025-10-13

### Fixed
- Critical input detection bug fixes
- Enhanced modal UX

## [2.1.0] - 2025-10-13

### Fixed
- Critical bug fixes
- Modal UX enhancements

## [2.0.0] - 2025-10-11

### Added
- Multi-AI provider support (Claude, OpenAI, Gemini, Ollama, and more)
- Universal web terminal integration (RPort, Cloud Shell, GitPod, AWS CloudShell)
- Privacy-first architecture with local encrypted storage
- Modern { } branding with Apra Labs green
- Comprehensive documentation and GDPR/CCPA compliant privacy policy
- One-click AI analysis and script insertion
- Context-aware error detection and fixes
- Conversation history for iterative improvements
- Custom selectors for any web terminal
- Export/Import configuration
- Keyboard shortcuts (Alt+Shift+A, Alt+Shift+I)

---

## Release Types

- **Major** (x.0.0): Breaking changes, major new features
- **Minor** (0.x.0): New features, backwards compatible
- **Patch** (0.0.x): Bug fixes, minor improvements

## Categories

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes
- **Technical**: Internal improvements, testing, build changes
