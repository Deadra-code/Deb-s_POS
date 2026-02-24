# CI/CD Automation Skill

## Description

Automated deployment skill for Google Apps Script backend with full CI/CD pipeline integration.

## Capabilities

1. **Auto-Diagnosis**: Detects configuration issues in CI/CD setup
2. **Auto-Fix**: Automatically fixes common deployment problems
3. **Secrets Management**: Helps setup GitHub Secrets correctly
4. **Workflow Optimization**: Creates and maintains GitHub Actions workflows
5. **Deployment Verification**: Tests and verifies successful deployments

## Usage

### Quick Fix
```bash
# Run auto-diagnosis and fix
npm run fix:cicd
```

### Interactive Setup
```bash
# Interactive setup wizard
npm run setup:gascicd
```

### Manual Deployment
```bash
# Deploy frontend + backend
npm run deploy:all

# Deploy backend only
npm run deploy:backend
```

## Scripts

### `fix-cicd.js`
Automatically diagnoses and fixes common CI/CD issues:
- Verifies `.clasp.json` configuration
- Checks service account credentials
- Validates GitHub Actions workflow
- Tests CLASP installation
- Provides GitHub URLs for manual setup

### `setup-gas-cicd.cjs`
Interactive wizard for initial CI/CD setup:
- Creates service account configuration
- Guides through Google Cloud setup
- Helps add GitHub Secrets
- Shares GAS project with service account

### `backup-data.js`
Automated backup script:
- Creates timestamped backups
- Cleans old backups (>30 days)
- Provides manual backup instructions

## Files Structure

```
scripts/
├── fix-cicd.js              # Auto-fix script
├── setup-gas-cicd.cjs       # Interactive setup
├── backup-data.js           # Backup automation
└── deploy-smart.cjs         # Smart deployment

.github/workflows/
└── deploy-gas.yml           # Backend deployment workflow

backend/
└── Code.gs                  # Google Apps Script code

docs/
├── GAS_CICD_SETUP.md        # Setup guide
├── BACKEND_DEPLOYMENT_TROUBLESHOOTING.md
└── CONSTRAINTS.md           # Anti-patterns guide
```

## Environment Variables

Required GitHub Secrets:
- `GAS_SCRIPT_ID` - Google Apps Script ID
- `GAS_SERVICE_ACCOUNT_KEY` - Service account JSON key
- `GAS_DEPLOYMENT_ID` (optional) - Existing deployment ID

## Troubleshooting

### Backend Deployment Fails

1. Run diagnostic:
   ```bash
   npm run fix:cicd
   ```

2. Check GitHub Actions logs:
   https://github.com/Deadra-code/Deb-s_POS/actions

3. Verify secrets format:
   - No extra whitespace in JSON
   - Complete JSON structure
   - Valid private key format

4. Re-run workflow after fixing secrets

### Frontend Deployment Fails

1. Check build locally:
   ```bash
   npm run build
   ```

2. Review GitHub Actions logs

3. Fix build errors and push again

## Best Practices

1. **Always test locally first:**
   ```bash
   clasp login
   clasp push
   ```

2. **Keep credentials secure:**
   - Never commit service account JSON
   - Use GitHub Secrets
   - Rotate credentials every 90 days

3. **Monitor deployments:**
   - Check Actions tab after push
   - Test API endpoints after deploy
   - Keep deployment logs for debugging

4. **Version control:**
   - Tag releases with version numbers
   - Include deployment timestamp
   - Document breaking changes

## Success Criteria

Deployment is successful when:
- ✅ GitHub Actions workflow completes without errors
- ✅ Backend API responds to test endpoint
- ✅ Frontend can connect to backend
- ✅ All features work in production

## Resources

- [CLASP Documentation](https://github.com/google/clasp)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Google Apps Script API](https://developers.google.com/apps-script/api)

## Example Output

```
ℹ️  Checking .clasp.json...
✅ ✓ .clasp.json found (Script ID: 1cQm7W...)
ℹ️  Checking service account credentials...
✅ ✓ Service account file found: debs-pos-deployment-*.json
✅ ✓ Service account valid (Email: github-deployer@...)
ℹ️  Checking GitHub Actions workflow...
✅ ✓ deploy-gas.yml workflow found
✅ ✓ Workflow has environment configuration
ℹ️  Checking backend code...
✅ ✓ Backend code found: Code.gs
ℹ️  Checking CLASP installation...
✅ ✓ CLASP installed (v3.2.0)
ℹ️  Checking GitHub remote...
✅ ✓ GitHub remote configured
✅ ✓ Repository: Deadra-code/Deb-s_POS

📋 Important URLs:
   Actions: https://github.com/Deadra-code/Deb-s_POS/actions
   Secrets: https://github.com/Deadra-code/Deb-s_POS/settings/secrets/actions

============================================================
✅ DIAGNOSIS COMPLETE
============================================================
Issues Found: 0
Issues Fixed: 0

All checks passed! 🎉

✅ Your CI/CD is ready!
```
