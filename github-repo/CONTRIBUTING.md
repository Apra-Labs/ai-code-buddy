# Contributing to AI Code Buddy

Thank you for your interest in contributing to AI Code Buddy! 🎉

## 📋 Table of Contents

- [How Can I Contribute?](#how-can-i-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Asking Questions](#asking-questions)
- [Documentation Improvements](#documentation-improvements)
- [Community Guidelines](#community-guidelines)

---

## 🤝 How Can I Contribute?

While the AI Code Buddy extension source code is maintained privately, we welcome and value community contributions in these areas:

### 1. 🐛 Bug Reports
Help us identify and fix issues by reporting bugs you encounter.

### 2. 💡 Feature Suggestions
Share your ideas for making AI Code Buddy better.

### 3. 📖 Documentation Improvements
Help improve our documentation for all users.

### 4. 💬 Community Support
Help other users in GitHub Discussions.

### 5. ⭐ Spread the Word
Share AI Code Buddy with colleagues and on social media.

---

## 🐛 Reporting Bugs

Found a bug? Help us squash it!

### Before Reporting

1. **Check existing issues**: Search [existing issues](https://github.com/Apra-Labs/ai-code-buddy/issues) to avoid duplicates
2. **Read documentation**: Check our [Troubleshooting Guide](https://apra-labs.github.io/ai-code-buddy/troubleshooting.html)
3. **Try basic fixes**: Restart browser, reload extension, clear cache
4. **Test in clean environment**: Try in incognito mode or fresh browser profile

### How to Report

1. Use the **[Bug Report template](https://github.com/Apra-Labs/ai-code-buddy/issues/new?template=bug_report.md)**
2. Provide clear steps to reproduce
3. Include error messages from browser console (F12)
4. Add screenshots if applicable
5. Specify your environment (browser, OS, extension version)

### Good Bug Report Example

```
Title: [BUG] Send to AI button not appearing on GitPod terminal

Description:
The "Send to AI" button doesn't appear on GitPod's terminal interface.

Steps to Reproduce:
1. Open GitPod workspace
2. Run command: `ls -la`
3. Expected: "Send to AI" button appears
4. Actual: No button visible

Environment:
- Browser: Chrome 120.0.6099.109
- Extension Version: 2.0.0
- Platform: GitPod (gitpod.io)
- OS: Windows 11

Console Errors:
No errors in console

Screenshots:
[Screenshot showing terminal without button]
```

---

## 💡 Suggesting Features

Have an idea to make AI Code Buddy better?

### Before Suggesting

1. **Check if it already exists**: Review current features in [documentation](https://apra-labs.github.io/ai-code-buddy/)
2. **Search existing requests**: Look through [feature requests](https://github.com/Apra-Labs/ai-code-buddy/labels/enhancement)
3. **Consider the scope**: Is this useful for most users?

### How to Suggest

1. Use the **[Feature Request template](https://github.com/Apra-Labs/ai-code-buddy/issues/new?template=feature_request.md)**
2. Describe the problem it solves
3. Explain your proposed solution
4. Provide use cases and examples
5. Consider alternatives

### Good Feature Request Example

```
Title: [FEATURE] Add keyboard shortcuts for common actions

Problem:
Having to click buttons interrupts my workflow. Keyboard shortcuts would be faster.

Proposed Solution:
- Ctrl+Shift+A: Send to AI
- Ctrl+Shift+I: Insert improved script
- Ctrl+Shift+E: Open extension popup

Use Case:
As a developer working in Cloud Shell, I frequently send errors to AI.
With keyboard shortcuts, I could:
1. See error
2. Press Ctrl+Shift+A (no mouse needed)
3. Review response
4. Press Ctrl+Shift+I to insert

Benefits:
- Faster workflow
- No context switching
- Power user friendly
```

---

## ❓ Asking Questions

Need help or clarification?

### Before Asking

1. Read the [Quick Start Guide](https://apra-labs.github.io/ai-code-buddy/quick-start.html)
2. Check the [Troubleshooting Guide](https://apra-labs.github.io/ai-code-buddy/troubleshooting.html)
3. Browse [GitHub Discussions](https://github.com/Apra-Labs/ai-code-buddy/discussions)
4. Search existing [questions](https://github.com/Apra-Labs/ai-code-buddy/labels/question)

### Where to Ask

**For general questions**: Use [GitHub Discussions](https://github.com/Apra-Labs/ai-code-buddy/discussions)

**For specific issues**: Use the [Question template](https://github.com/Apra-Labs/ai-code-buddy/issues/new?template=question.md)

### Good Question Example

```
Title: [QUESTION] How to use custom AI models with Ollama?

Question:
I want to use my fine-tuned Llama model with AI Code Buddy. Is this possible?

What I've Tried:
- Read the Quick Start Guide
- Checked API Keys documentation
- Found Ollama section but unclear about custom models

Context:
- Running Ollama locally
- Have custom model: my-llama-v2
- Model works in command line: `ollama run my-llama-v2`

Specific Question:
Can I enter "my-llama-v2" in the model field, or does it only work
with official Ollama models?
```

---

## 📖 Documentation Improvements

Help make our documentation better!

### Types of Improvements

1. **Fix typos or grammar**
2. **Clarify confusing sections**
3. **Add missing information**
4. **Improve examples**
5. **Update outdated content**

### How to Contribute

Since this is a documentation-only repository:

1. **Open an issue** describing the improvement
2. **Provide specific suggestions** for wording changes
3. **Link to the page** that needs updating

### Example Documentation Issue

```
Title: [DOCS] Clarify Gemini API key creation steps

Page: api-keys.html - Gemini section

Issue:
Step 2 says "Click Create API Key" but the actual button
text is "Get API key" in Google AI Studio.

Suggested Fix:
Change step 2 to:
"Click 'Get API key' button (top right)"

Also add note:
"Note: Google AI Studio interface may vary slightly.
Look for 'Get API key' or 'Create API Key' button."
```

---

## 💬 Community Guidelines

### Be Respectful

- Treat everyone with respect
- Welcome newcomers warmly
- Assume good intentions
- Provide constructive feedback

### Be Clear

- Write clear, specific issues
- Provide context and examples
- Use proper formatting
- Include relevant details

### Be Patient

- Response times may vary
- Complex issues take time to investigate
- We're a small team doing our best

### Be Helpful

- Help other users when you can
- Share your solutions
- Upvote useful suggestions
- Provide feedback on proposals

---

## 🚫 What We Cannot Accept

- Source code contributions (extension is proprietary)
- Pull requests to main codebase
- Requests for free premium features
- Demands for immediate responses
- Abuse, harassment, or spam

---

## 📊 Issue Priority

We triage issues based on:

1. **Critical** - Extension broken for many users
2. **High** - Major feature not working
3. **Medium** - Feature partially working or affecting some users
4. **Low** - Minor issues, cosmetic problems, or edge cases

---

## ⏱️ Response Time

We aim to:
- Acknowledge new issues within **24-48 hours**
- Respond to questions within **2-3 business days**
- Fix critical bugs as soon as possible
- Evaluate feature requests within **1 week**

---

## 🎖️ Recognition

Contributors who help the community will be:
- Acknowledged in release notes
- Featured in documentation (with permission)
- Given credit for significant improvements

---

## 📞 Contact

- **GitHub Issues**: [Report bugs or suggest features](https://github.com/Apra-Labs/ai-code-buddy/issues)
- **GitHub Discussions**: [Community discussions](https://github.com/Apra-Labs/ai-code-buddy/discussions)
- **Website**: [apralabs.com](https://www.apralabs.com)
- **Documentation**: [apra-labs.github.io/ai-code-buddy](https://apra-labs.github.io/ai-code-buddy/)

---

## 📜 License

This repository (documentation) is:

**Copyright © 2025 Apra Labs. All Rights Reserved.**

See [LICENSE](LICENSE) for details.

---

**Thank you for helping make AI Code Buddy better! 🙌**

Your contributions help thousands of developers work more efficiently.

---

<div align="center">

Built with ❤️ by [Apra Labs](https://www.apralabs.com)

[Report Issue](https://github.com/Apra-Labs/ai-code-buddy/issues) · [Documentation](https://apra-labs.github.io/ai-code-buddy/) · [Discussions](https://github.com/Apra-Labs/ai-code-buddy/discussions)

</div>
