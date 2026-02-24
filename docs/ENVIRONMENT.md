# Environment Setup

Panduan setup environment untuk development dan production.

## Environment Variables

### Required Variables

```env
# Google Apps Script Web App URL
VITE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### Optional Variables

```env
# App configuration
VITE_APP_NAME=Deb's POS Pro
VITE_APP_VERSION=3.15.1

# Feature flags
VITE_ENABLE_PWA=true
VITE_ENABLE_HAPTICS=true

# Debug mode
VITE_DEBUG_MODE=false
```

---

## File Structure

```
project-root/
├── .env                  # Local environment (gitignored)
├── .env.example          # Template for environment variables
├── .env.development      # Development-specific
├── .env.production       # Production-specific
└── .env.test            # Testing-specific
```

---

## Setup Instructions

### 1. Development Setup

```bash
# Clone repository
git clone <repository-url>
cd debs-pos

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values
# VITE_API_URL=<your_gas_url>

# Start development server
npm run dev
```

### 2. Production Setup

```bash
# Build for production
npm run build

# The build will use .env.production if available
# Or .env if .env.production doesn't exist
```

### 3. Testing Setup

```bash
# Tests use .env.test if available
npm run test
```

---

## Getting API URL

### Step 1: Deploy Backend

1. Buka Google Apps Script
2. Deploy sebagai Web App
3. Copy Web App URL

### Step 2: Update .env

```env
VITE_API_URL=https://script.google.com/macros/s/ABC123xyz/exec
```

### Step 3: Verify

```bash
# Check if URL is accessible
curl "https://script.google.com/macros/s/ABC123xyz/exec?action=testIntegrity"
```

---

## Environment-Specific Configs

### Development (.env.development)

```env
VITE_API_URL=https://script.google.com/macros/s/DEV_ID/exec
VITE_DEBUG_MODE=true
VITE_ENABLE_HAPTICS=false
```

### Production (.env.production)

```env
VITE_API_URL=https://script.google.com/macros/s/PROD_ID/exec
VITE_DEBUG_MODE=false
VITE_ENABLE_HAPTICS=true
```

### Testing (.env.test)

```env
VITE_API_URL=https://script.google.com/macros/s/TEST_ID/exec
VITE_DEBUG_MODE=true
```

---

## Vite Environment Variables

Vite exposes environment variables via `import.meta.env`:

```javascript
// Access in code
const apiUrl = import.meta.env.VITE_API_URL;
const debugMode = import.meta.env.VITE_DEBUG_MODE;
```

### TypeScript Support

Create `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DEBUG_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Security Best Practices

1. **Never commit .env**: Pastikan `.env` ada di `.gitignore`
2. **Use .env.example**: Template tanpa sensitive values
3. **Rotate URLs**: Regenerate GAS Web App URL periodically
4. **Limit Access**: Restrict GAS Web App access jika possible

---

## Troubleshooting

### "VITE_API_URL is undefined"

1. Pastikan file `.env` ada di root
2. Restart dev server setelah edit .env
3. Check variable name (harus prefix `VITE_`)

### "CORS Error"

1. Verify GAS Web App URL benar
2. Check GAS deployment: **ANYONE_ANONYMOUS**
3. Ensure Content-Type: text/plain untuk POST

### Build Using Wrong Environment

```bash
# Specify mode explicitly
npm run build -- --mode production
npm run build -- --mode development
```

---

## Environment Validation Script

```javascript
// scripts/validate-env.cjs
const fs = require('fs');
require('dotenv').config();

function validateEnv() {
  const required = ['VITE_API_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    process.exit(1);
  }
  
  console.log('Environment validation passed');
}

validateEnv();
```

Add to package.json:

```json
{
  "scripts": {
    "validate:env": "node scripts/validate-env.cjs"
  }
}
```

---

## Quick Reference

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_URL | GAS Web App URL | Yes |
| VITE_DEBUG_MODE | Enable debug logging | No |
| VITE_ENABLE_PWA | Enable PWA features | No |
| VITE_ENABLE_HAPTICS | Enable haptic feedback | No |

---

## Checklist

- [ ] Create `.env` from `.env.example`
- [ ] Set `VITE_API_URL` dengan GAS Web App URL
- [ ] Verify API connection
- [ ] Test login functionality
- [ ] Build production version
- [ ] Deploy and verify
