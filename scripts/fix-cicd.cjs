#!/usr/bin/env node

/**
 * CI/CD Auto-Fix Script
 * Automatically diagnoses and fixes common deployment issues
 * 
 * Usage: npm run fix:cicd
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function log(msg, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    fix: '🔧'
  };
  console.log(`${icons[type] || ''} ${msg}`);
}

function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('\n🚀 Deb\'s POS - CI/CD Auto-Fix Tool\n');
  console.log('This script will diagnose and fix common deployment issues.\n');

  const projectRoot = path.join(__dirname, '..');
  let issuesFound = 0;
  let issuesFixed = 0;

  // Check 1: Verify .clasp.json exists
  log('Checking .clasp.json...');
  const claspConfigPath = path.join(projectRoot, '.clasp.json');
  if (fs.existsSync(claspConfigPath)) {
    const claspConfig = JSON.parse(fs.readFileSync(claspConfigPath, 'utf8'));
    log(`✓ .clasp.json found (Script ID: ${claspConfig.scriptId})`, 'success');
  } else {
    log('.clasp.json not found!', 'error');
    issuesFound++;
    const scriptId = await question('Enter your GAS Script ID: ');
    fs.writeFileSync(claspConfigPath, JSON.stringify({
      scriptId: scriptId,
      rootDir: './backend'
    }, null, 2));
    log('Created .clasp.json', 'fix');
    issuesFixed++;
  }

  // Check 2: Verify service account file exists
  log('Checking service account credentials...');
  const serviceAccountFiles = fs.readdirSync(projectRoot).filter(f => f.includes('debs-pos-deployment') && f.endsWith('.json'));
  if (serviceAccountFiles.length > 0) {
    const saFile = serviceAccountFiles[0];
    log(`✓ Service account file found: ${saFile}`, 'success');
    
    // Verify JSON is valid
    try {
      const saData = JSON.parse(fs.readFileSync(path.join(projectRoot, saFile), 'utf8'));
      log(`✓ Service account valid (Email: ${saData.client_email})`, 'success');
    } catch (e) {
      log('Service account file is corrupted!', 'error');
      issuesFound++;
    }
  } else {
    log('Service account file not found!', 'error');
    issuesFound++;
    log('Please create service account following docs/GAS_CICD_SETUP.md', 'warning');
  }

  // Check 3: Verify GitHub Actions workflow exists
  log('Checking GitHub Actions workflow...');
  const workflowPath = path.join(projectRoot, '.github', 'workflows', 'deploy-gas.yml');
  if (fs.existsSync(workflowPath)) {
    log('✓ deploy-gas.yml workflow found', 'success');
    
    // Check workflow content
    const workflow = fs.readFileSync(workflowPath, 'utf8');
    if (workflow.includes('environment: google-apps-script')) {
      log('✓ Workflow has environment configuration', 'success');
    }
  } else {
    log('deploy-gas.yml workflow not found!', 'error');
    issuesFound++;
  }

  // Check 4: Verify backend code exists
  log('Checking backend code...');
  const backendFiles = ['Code.gs', 'Code.js'];
  const backendPath = path.join(projectRoot, 'backend');
  let backendFound = false;
  
  for (const file of backendFiles) {
    if (fs.existsSync(path.join(backendPath, file))) {
      log(`✓ Backend code found: ${file}`, 'success');
      backendFound = true;
      break;
    }
  }
  
  if (!backendFound) {
    log('No backend code found!', 'error');
    issuesFound++;
  }

  // Check 5: Verify package.json has required scripts
  log('Checking package.json scripts...');
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  const requiredScripts = ['deploy:backend', 'deploy:all', 'setup:gascicd'];
  
  for (const script of requiredScripts) {
    if (packageJson.scripts && packageJson.scripts[script]) {
      log(`✓ Script "${script}" found`, 'success');
    } else {
      log(`Script "${script}" missing!`, 'warning');
    }
  }

  // Check 6: Test CLASP installation
  log('Checking CLASP installation...');
  const claspVersion = runCommand('clasp --version');
  if (claspVersion) {
    log(`✓ CLASP installed (v${claspVersion.trim()})`, 'success');
  } else {
    log('CLASP not installed!', 'warning');
    log('Installing CLASP globally...', 'fix');
    runCommand('npm install -g @google/clasp');
    issuesFixed++;
  }

  // Check 7: Verify GitHub remote
  log('Checking GitHub remote...');
  const gitRemote = runCommand('git remote get-url origin');
  if (gitRemote && gitRemote.includes('github.com')) {
    log('✓ GitHub remote configured', 'success');
    
    // Extract repo info
    const repoMatch = gitRemote.match(/github\.com[:/]([^/]+)\/([^.]+)\.git/);
    if (repoMatch) {
      const [, owner, repo] = repoMatch;
      log(`✓ Repository: ${owner}/${repo}`, 'success');
      
      // Provide GitHub URLs
      console.log('\n📋 Important URLs:');
      console.log(`   Actions: https://github.com/${owner}/${repo}/actions`);
      console.log(`   Secrets: https://github.com/${owner}/${repo}/settings/secrets/actions`);
      console.log(`   Settings: https://github.com/${owner}/${repo}/settings`);
    }
  } else {
    log('GitHub remote not configured!', 'error');
    issuesFound++;
  }

  // Check 8: Verify documentation exists
  log('Checking documentation...');
  const docsPath = path.join(projectRoot, 'docs');
  if (fs.existsSync(docsPath)) {
    const docs = fs.readdirSync(docsPath).filter(f => f.endsWith('.md'));
    log(`✓ Documentation found (${docs.length} files)`, 'success');
    
    if (docs.includes('GAS_CICD_SETUP.md')) {
      log('✓ GAS_CICD_SETUP.md found', 'success');
    }
    if (docs.includes('BACKEND_DEPLOYMENT_TROUBLESHOOTING.md')) {
      log('✓ BACKEND_DEPLOYMENT_TROUBLESHOOTING.md found', 'success');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  log('DIAGNOSIS COMPLETE', 'info');
  console.log('='.repeat(60));
  console.log(`Issues Found: ${issuesFound}`);
  console.log(`Issues Fixed: ${issuesFixed}`);
  console.log('');

  if (issuesFound === 0) {
    log('All checks passed! 🎉', 'success');
    console.log('\n✅ Your CI/CD is ready!');
    console.log('\nNext steps:');
    console.log('1. Ensure GitHub Secrets are set (see docs/GAS_CICD_SETUP.md)');
    console.log('2. Share Google Apps Script with service account');
    console.log('3. Push to main to trigger deployment');
    console.log('');
  } else {
    log(`${issuesFound} issue(s) need attention`, 'warning');
    console.log('\nPlease fix the issues above, then run this script again.');
    console.log('');
  }

  // Offer to create GitHub Secrets setup helper
  if (serviceAccountFiles.length > 0) {
    const saFile = serviceAccountFiles[0];
    console.log('📝 To setup GitHub Secrets:');
    console.log('');
    console.log('1. Go to: https://github.com/Deadra-code/Deb-s_POS/settings/secrets/actions');
    console.log('');
    console.log('2. Add repository secret "GAS_SERVICE_ACCOUNT_KEY":');
    console.log('   Copy ENTIRE content from:');
    console.log(`   ${path.join(projectRoot, saFile)}`);
    console.log('');
    console.log('3. Add repository secret "GAS_SCRIPT_ID":');
    const claspConfig = JSON.parse(fs.readFileSync(claspConfigPath, 'utf8'));
    console.log(`   Value: ${claspConfig.scriptId}`);
    console.log('');
  }

  rl.close();
}

main().catch(err => {
  log(`Error: ${err.message}`, 'error');
  process.exit(1);
});
