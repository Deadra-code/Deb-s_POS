#!/usr/bin/env node

/**
 * Interactive setup script for Google Apps Script CI/CD
 * Run: npm run setup:gascicd
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🚀 Google Apps Script CI/CD Setup\n');
  console.log('This script will help you setup automatic deployment to GAS\n');

  // Check if .clasp.json exists
  const claspConfigPath = path.join(__dirname, '..', '.clasp.json');
  if (!fs.existsSync(claspConfigPath)) {
    console.log('❌ .clasp.json not found!');
    console.log('Please run "clasp login" and "clasp create" first, or ensure .clasp.json exists.\n');
    const scriptId = await question('Enter your GAS Script ID: ');
    
    fs.writeFileSync(claspConfigPath, JSON.stringify({
      scriptId: scriptId,
      rootDir: './backend'
    }, null, 2));
    console.log('✓ Created .clasp.json\n');
  }

  // Read existing config
  const claspConfig = JSON.parse(fs.readFileSync(claspConfigPath, 'utf8'));
  console.log(`✓ Script ID: ${claspConfig.scriptId}\n`);

  console.log('📋 Next Steps:\n');
  console.log('1. Create Google Cloud Project:');
  console.log('   https://console.cloud.google.com/\n');

  console.log('2. Enable Google Apps Script API\n');

  console.log('3. Create Service Account:');
  console.log('   - Name: github-deployer');
  console.log('   - Download JSON key\n');

  console.log('4. Share GAS project with service account email:\n');
  console.log('   github-deployer@YOUR_PROJECT.iam.gserviceaccount.com\n');

  console.log('5. Add GitHub Secrets:\n');
  console.log('   Go to: https://github.com/Deadra-code/Deb-s_POS/settings/secrets/actions\n');
  console.log('   Add these secrets:');
  console.log(`   - GAS_SCRIPT_ID: ${claspConfig.scriptId}`);
  console.log('   - GAS_SERVICE_ACCOUNT_KEY: [Paste JSON key content]');
  console.log('   - GAS_DEPLOYMENT_ID: [Optional - Web App deployment ID]\n');

  console.log('✅ Setup complete!\n');
  console.log('After adding secrets, push to main to trigger automatic deployment.\n');

  console.log('📖 Full documentation: docs/GAS_CICD_SETUP.md\n');

  rl.close();
}

main().catch(console.error);
