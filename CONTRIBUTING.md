# Contributing to AI Code Buddy

Thank you for your interest in contributing to AI Code Buddy! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Be respectful and considerate of others
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/ai-code-buddy.git
   cd ai-code-buddy
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Apra-Labs/ai-code-buddy.git
   ```

## Development Setup

1. **Prerequisites**:
   - Chrome/Chromium browser (latest version)
   - Node.js 14+ (for running tests)
   - Git

2. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select your local repository directory

3. **Install development dependencies**:
   ```bash
   npm install
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

## How to Contribute

### Reporting Bugs

Before creating a bug report:
- Check the [existing issues](https://github.com/Apra-Labs/ai-code-buddy/issues)
- Check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md)

When creating a bug report, include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser version and OS
- Extension version
- Screenshots (if applicable)
- Console errors (if any)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:
- Clear description of the proposed feature
- Use cases and benefits
- Possible implementation approach
- Any alternatives you've considered

### Areas for Contribution

We welcome contributions in these areas:

1. **New AI Provider Integrations**
   - Add support for additional AI services
   - Improve existing provider implementations

2. **Terminal Support**
   - Add support for new web-based terminals
   - Improve detection and selector logic

3. **Features**
   - Implement items from the roadmap
   - Propose and implement new features

4. **Bug Fixes**
   - Fix reported issues
   - Improve error handling

5. **Documentation**
   - Improve existing documentation
   - Add examples and use cases
   - Translate documentation

6. **Testing**
   - Add unit tests
   - Add integration tests
   - Improve test coverage

## Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clear, maintainable code
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**:
   ```bash
   npm test
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add feature: description of your changes"
   ```
   - Use clear, descriptive commit messages
   - Follow conventional commits format if possible

5. **Keep your fork updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**:
   - Go to your fork on GitHub
   - Click "Pull Request"
   - Provide a clear title and description
   - Reference any related issues

8. **Code Review**:
   - Address any feedback from reviewers
   - Make requested changes
   - Keep the discussion focused and professional

9. **Merge**:
   - Once approved, your PR will be merged
   - Your contribution will be included in the next release!

## Coding Standards

### JavaScript Style

- Use ES6+ features where appropriate
- Use `const` for variables that don't change, `let` for those that do
- Avoid `var`
- Use descriptive variable and function names
- Add comments for complex logic
- Keep functions small and focused

### File Organization

- Keep related functionality together
- Use meaningful file names
- Avoid creating unnecessary files

### Extension-Specific Guidelines

1. **Content Scripts** (`content.js`):
   - Minimize DOM manipulation
   - Use event delegation where possible
   - Clean up event listeners properly

2. **Background Script** (`background.js`):
   - Keep API calls clean and well-structured
   - Handle errors gracefully
   - Log meaningful messages

3. **Providers** (`providers.js`):
   - Follow the existing provider pattern
   - Include proper error handling
   - Test with the provider's API

4. **Popup** (`popup-multi.js`):
   - Keep UI logic separate from business logic
   - Validate user input
   - Provide clear feedback

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:validate
npm run test:images
npm run test:links
```

### Writing Tests

- Add tests for new features
- Test edge cases
- Test error conditions
- Keep tests focused and independent

### Manual Testing

Before submitting a PR:
1. Test with multiple AI providers
2. Test with different web terminals
3. Test edge cases
4. Check browser console for errors
5. Verify the extension icon and popup work correctly

## Documentation

### Code Documentation

- Add comments for complex logic
- Document function parameters and return values
- Include usage examples for public APIs

### User Documentation

When adding features:
- Update the README.md
- Add examples to documentation
- Update troubleshooting guide if needed

### Documentation Style

- Use clear, simple language
- Include code examples
- Add screenshots for UI changes
- Keep it up-to-date

## Questions?

If you have questions:
- Check the [documentation](https://apra-labs.github.io/ai-code-buddy/)
- Search [existing issues](https://github.com/Apra-Labs/ai-code-buddy/issues)
- Create a new issue with the "question" label

## License

By contributing to AI Code Buddy, you agree that your contributions will be licensed under:
- Source code: MIT License
- Documentation: Creative Commons Attribution 4.0 International (CC BY 4.0)

## Thank You!

Your contributions help make AI Code Buddy better for everyone. We appreciate your time and effort!
