#!/bin/bash
# AI Code Buddy - Test Runner (Unix/Linux/Mac)
# Run all unit tests locally

echo ""
echo "================================================"
echo "  AI Code Buddy - Running Unit Tests"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Display Node version
echo "Node.js version:"
node --version
echo ""

# Run unit tests only (fast)
echo "Running unit tests..."
echo ""
npm test

if [ $? -ne 0 ]; then
    echo ""
    echo "================================================"
    echo "  ❌ UNIT TESTS FAILED!"
    echo "================================================"
    echo ""
    echo "Please fix the failing tests before committing."
    echo ""
    exit 1
fi

echo ""
echo "================================================"
echo "  ✅ ALL UNIT TESTS PASSED!"
echo "================================================"
echo ""
echo "To run full validation (images + links):"
echo "  npm run test:all"
echo ""
echo "You can safely commit your changes."
echo ""
exit 0
