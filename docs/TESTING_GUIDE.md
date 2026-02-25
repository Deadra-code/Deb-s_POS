# 🧪 Testing & Audit Guide

## Overview

Deb's POS uses a comprehensive testing strategy with:
- **Unit Tests** (Vitest) - Individual functions and components
- **Integration Tests** (Testing Library) - Component interactions
- **E2E Tests** (Playwright) - Full user flows
- **Audits** - Security, Performance, Accessibility

---

## 📋 Available Scripts

### Test Commands

```bash
# Run all tests once
npm run test:all

# Run tests in CI mode (no coverage, faster)
npm run test:ci

# Unit tests only
npm run test              # Same as 'vitest run'
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
npm run test:unit         # Unit tests in src/

# E2E tests only
npm run test:e2e          # Headless mode
npm run test:e2e:ui       # With UI
npm run test:e2e:headed   # Visible browser

# Run specific test file
npx vitest run src/utils/security.test.js
npx playwright test e2e/auth.spec.js
```

### Audit Commands

```bash
# Run all audits
npm run audit

# Specific audits
npm run audit:security     # Security audit
npm run audit:performance  # Performance audit
npm run audit:a11y         # Accessibility audit
```

### Lint Commands

```bash
npm run lint              # Check code
npm run lint:fix          # Auto-fix issues
```

---

## 📁 Test File Structure

```
src/
├── tests/
│   ├── setup.jsx              # Test configuration
│   └── integration.test.jsx   # Integration tests
├── utils/
│   ├── security.test.js       # Security function tests
│   ├── db-error-handler.test.js
│   ├── session-timeout.test.js
│   └── format.test.js
├── services/
│   ├── api.test.js            # API service tests
│   └── database.test.js       # Database tests
└── components/
    └── ui/                    # Component tests (future)

e2e/
├── auth.spec.js               # Authentication flows
├── inventory.spec.js          # Inventory management
├── pos.spec.js                # POS transactions
├── navigation.spec.js         # Navigation tests
├── analytics.spec.js          # Analytics dashboard
└── modifier-flow.spec.js      # Modifier/customization flows
```

---

## 🎯 Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| **Statements** | 80% | ~60% |
| **Branches** | 70% | ~50% |
| **Functions** | 80% | ~65% |
| **Lines** | 80% | ~60% |

### Critical Files (Must Test)

- [x] `src/utils/security.js` - Passcode hashing
- [x] `src/utils/db-error-handler.js` - Error handling
- [x] `src/utils/session-timeout.js` - Session management
- [ ] `src/services/database.js` - IndexedDB operations
- [ ] `src/services/indexeddb-api.js` - API layer
- [ ] `src/components/pos/CheckoutModal.jsx` - Checkout flow
- [ ] `src/pages/LoginPage.jsx` - Authentication

---

## 🔒 Security Audit Checks

The security audit (`npm run audit:security`) checks for:

### Sensitive Data
- API keys in code
- Hardcoded passwords/secrets
- Tokens in source files

### Vulnerabilities
- `eval()` usage
- `innerHTML` without sanitization
- `dangerouslySetInnerHTML` in React
- Synchronous XMLHttpRequest

### Dependencies
- Known vulnerabilities via `npm audit`
- Outdated packages

### Storage
- Sensitive data in localStorage
- Proper .env handling

---

## ⚡ Performance Audit Checks

The performance audit (`npm run audit:performance`) checks for:

### Bundle Size
- Dist folder > 5MB
- Individual chunks > 500KB
- Large dependencies

### Code Quality
- Synchronous operations
- Blocking require() calls
- Unoptimized images (> 500KB)

### Recommendations
- Lighter alternatives for heavy libraries
- Code splitting opportunities
- Lazy loading candidates

---

## ♿ Accessibility Audit Checks

The accessibility audit (`npm run audit:a11y`) checks for:

### Images
- Missing `alt` text

### Forms
- Inputs without labels
- Missing ARIA attributes

### Interactive Elements
- Buttons without accessible text
- Clickable divs without `role`
- Missing keyboard navigation

### Visual
- Font sizes < 10px
- Color contrast issues

---

## 📊 Reading Test Results

### Unit Test Output

```
✓ src/utils/security.test.js (12 tests) 45ms
✓ src/utils/db-error-handler.test.js (8 tests) 23ms
✓ src/services/database.test.js (6 tests) 18ms

Test Files  3 passed (3)
Tests       26 passed (26)
Time        1.23s
```

### Coverage Report

```
=============================== Coverage summary ===============================
Statements   : 75.3% ( 450/598 )
Branches     : 68.2% ( 189/277 )
Functions    : 82.1% ( 97/118 )
Lines        : 76.8% ( 421/548 )
================================================================================
```

### E2E Test Output

```
✓ auth.spec.js (6 tests) 12.5s
✓ inventory.spec.js (4 tests) 8.3s
✓ pos.spec.js (8 tests) 15.2s

Passed: 18
Failed: 0
Duration: 36.0s
```

---

## 🐛 Debugging Tests

### Unit Tests

```bash
# Run with verbose output
npx vitest run --reporter=verbose

# Run specific test
npx vitest run -t "should hash passcode"

# Debug with console logs
npx vitest run --no-coverage
```

### E2E Tests

```bash
# Run with visible browser
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/auth.spec.js

# Run with UI for debugging
npm run test:e2e:ui

# Generate HTML report
npx playwright show-report
```

---

## 📝 Writing Tests

### Unit Test Example

```javascript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('myFunction', () => {
    it('should return expected value', () => {
        const result = myFunction('input');
        expect(result).toBe('expected');
    });

    it('should handle edge cases', () => {
        expect(() => myFunction(null)).toThrow();
    });
});
```

### E2E Test Example

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
    test.beforeEach(async ({ page }) => {
        // Setup before each test
        await page.goto('/');
    });

    test('should do something', async ({ page }) => {
        await page.getByText('Click me').click();
        await expect(page.locator('text=Success')).toBeVisible();
    });
});
```

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Run E2E tests
        run: npx playwright install && npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📈 Improving Coverage

### 1. Identify Untested Code

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

### 2. Add Tests for Critical Paths

Priority order:
1. Authentication & Security
2. Data Operations (CRUD)
3. Payment/Checkout flows
4. Error handling
5. Edge cases

### 3. Mock External Dependencies

```javascript
// Mock IndexedDB
vi.mock('./database', () => ({
    getAll: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
}));
```

---

## 🎯 Best Practices

### DO ✅
- Write tests before fixing bugs (TDD)
- Test edge cases and error scenarios
- Use descriptive test names
- Keep tests independent and isolated
- Mock external services

### DON'T ❌
- Test implementation details
- Write tests that depend on each other
- Skip tests for "simple" code
- Hardcode sensitive data in tests
- Ignore failing tests

---

## 📞 Troubleshooting

### "Test suite failed to run"
- Check file path imports
- Ensure test setup is correct
- Verify mocks are properly configured

### "Timeout exceeded"
- Increase timeout: `test('name', async () => {...}, 30000)`
- Check for async operations not awaited
- Look for infinite loops

### "Coverage decreased"
- Run `npm run test:coverage`
- Check which files are not covered
- Add tests for uncovered branches/functions

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated:** 2026-02-25  
**Version:** 4.0.0
