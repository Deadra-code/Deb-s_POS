# Testing Guide

Panduan testing untuk Deb's POS Pro.

## Testing Stack

- **Unit Tests**: Vitest
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright

---

## Running Tests

### Unit & Component Tests

```bash
# Run all tests
npm run test

# Run in watch mode
npm run test -- --watch

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- src/services/api.test.js

# Run tests matching pattern
npm run test -- -t "API"
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e -- --ui

# Run specific browser
npm run test:e2e -- --project=chromium

# Run in debug mode
npm run test:e2e -- --debug
```

---

## Test Structure

### Source Files

```
src/
├── services/
│   ├── api.js
│   └── api.test.js          # API service tests
├── utils/
│   ├── format.js
│   └── format.test.js       # Utility function tests
├── pages/
│   ├── POS.jsx
│   ├── POS.test.jsx         # POS page tests
│   ├── LoginPage.jsx
│   └── LoginPage.test.jsx   # Login page tests
├── components/
│   └── ErrorBoundary.jsx
│       └── ErrorBoundary.test.jsx
└── tests/
    └── setup.jsx            # Test configuration
```

### E2E Tests

```
e2e/
├── auth.spec.js             # Authentication tests
├── pos.spec.js              # POS flow tests
└── inventory.spec.js        # Inventory tests
```

---

## Writing Tests

### Unit Test Example

```javascript
// src/utils/format.test.js
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './format';

describe('formatCurrency', () => {
  it('should format number to IDR currency', () => {
    expect(formatCurrency(25000)).toBe('Rp 25.000');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('Rp 0');
  });
});
```

### Component Test Example

```javascript
// src/pages/LoginPage.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('Passcode')).toBeInTheDocument();
  });

  it('should call onLogin when form submitted', () => {
    const onLogin = vi.fn();
    render(<LoginPage onLogin={onLogin} />);
    
    fireEvent.change(screen.getByPlaceholderText('Passcode'), {
      target: { value: '1234' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    expect(onLogin).toHaveBeenCalledWith('1234');
  });
});
```

### E2E Test Example

```javascript
// e2e/auth.spec.js
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Analytics')).toBeVisible();
  });

  test('should show error for invalid passcode', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('text=Passcode Salah')).toBeVisible();
  });
});
```

---

## Test Coverage

### Current Coverage Targets

| File Type | Target |
|-----------|--------|
| Services | 80% |
| Utils | 90% |
| Pages | 70% |
| Components | 75% |

### Generate Coverage Report

```bash
npm run test -- --coverage
```

Output akan tersedia di `coverage/` folder.

---

## Mocking

### API Mocking

```javascript
// Mock fetchData in tests
vi.mock('../services/api', () => ({
  fetchData: vi.fn()
}));

// Usage
import { fetchData } from '../services/api';

fetchData.mockResolvedValue({ success: true });
```

### LocalStorage Mocking

```javascript
// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

global.localStorage = localStorageMock;
```

---

## Best Practices

1. **Test Isolation**: Setiap test harus independen
2. **Descriptive Names**: Gunakan nama test yang jelas
3. **AAA Pattern**: Arrange, Act, Assert
4. **Edge Cases**: Test null, undefined, empty values
5. **Async Handling**: Gunakan async/await dengan benar

---

## CI/CD Integration

Tests otomatis dijalankan di GitHub Actions pada:
- Push ke main branch
- Pull requests

Lihat `.github/workflows/deploy.yml` untuk konfigurasi.

---

## Debugging Tests

### VS Code Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest",
      "command": "npm run test",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Playwright Debug

```bash
# Debug specific test
npm run test:e2e -- --debug e2e/auth.spec.js

# Run with Playwright Inspector
PWDEBUG=1 npm run test:e2e
```

---

## Common Issues

### "Cannot find module"
- Pastikan path import benar
- Gunakan relative paths dari test file

### "React is not defined"
- Import React di component files
- Update Babel/Vite config jika perlu

### "Timeout exceeded"
- Increase timeout: `test.setTimeout(30000)`
- Check for unhandled async operations
