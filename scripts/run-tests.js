#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Deb's POS
 * Runs all tests with coverage report
 * Usage: node scripts/run-tests.js [options]
 * 
 * Options:
 *   --unit       Run only unit tests
 *   --e2e        Run only E2E tests
 *   --coverage   Generate coverage report (default)
 *   --watch      Run tests in watch mode
 *   --ci         Run in CI mode (no coverage, single run)
 */

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const isCI = process.env.CI === 'true' || args.includes('--ci');
const watchMode = args.includes('--watch');
const unitOnly = args.includes('--unit');
const e2eOnly = args.includes('--e2e');
const noCoverage = args.includes('--no-coverage');

const ROOT_DIR = path.join(__dirname, '..');

/**
 * Run command and handle output
 */
function runCommand(command, description) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 ${description}`);
    console.log('='.repeat(60));
    console.log(`📍 Command: ${command}\n`);

    try {
        execSync(command, {
            stdio: 'inherit',
            cwd: ROOT_DIR,
            env: { ...process.env, FORCE_COLOR: '1' }
        });
        return true;
    } catch (error) {
        console.error(`\n❌ ${description} failed!`);
        return false;
    }
}

/**
 * Run unit tests with vitest
 */
function runUnitTests() {
    let command = 'npx vitest run';

    if (watchMode) {
        command = 'npx vitest --watch';
    }

    if (!noCoverage && !watchMode && !isCI) {
        command += ' --coverage';
    }

    if (isCI) {
        command += ' --reporter=verbose --reporter=junit --outputFile.junit=reports/junit-unit.xml';
    }

    return runCommand(command, 'Running Unit Tests');
}

/**
 * Run E2E tests with Playwright
 */
function runE2ETests() {
    let command = 'npx playwright test';

    if (isCI) {
        command += ' --reporter=list,html,junit --output=reports/playwright';
    } else {
        command += ' --reporter=list,html';
    }

    return runCommand(command, 'Running E2E Tests');
}

/**
 * Generate coverage summary
 */
function generateCoverageSummary() {
    const coverageDir = path.join(ROOT_DIR, 'coverage');
    const coverageFile = path.join(coverageDir, 'coverage-summary.json');

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Coverage Summary');
    console.log('='.repeat(60));

    try {
        // Try to read coverage summary
        const fs = require('fs');
        if (fs.existsSync(coverageFile)) {
            const summary = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
            const total = summary.total;

            console.log('\n📈 Coverage Results:');
            console.log(`   Statements:   ${total.statements.pct.toFixed(1)}%`);
            console.log(`   Branches:     ${total.branches.pct.toFixed(1)}%`);
            console.log(`   Functions:    ${total.functions.pct.toFixed(1)}%`);
            console.log(`   Lines:        ${total.lines.pct.toFixed(1)}%`);

            // Check if coverage meets threshold
            const minCoverage = 70;
            const avgCoverage = (
                total.statements.pct +
                total.branches.pct +
                total.functions.pct +
                total.lines.pct
            ) / 4;

            if (avgCoverage >= minCoverage) {
                console.log(`\n✅ Coverage meets minimum threshold (${minCoverage}%)`);
            } else {
                console.log(`\n⚠️  Coverage below minimum threshold (${minCoverage}%)`);
                console.log(`   Current: ${avgCoverage.toFixed(1)}%`);
            }

            // Open HTML report
            const htmlReport = path.join(coverageDir, 'index.html');
            if (fs.existsSync(htmlReport)) {
                console.log(`\n📄 HTML Report: ${htmlReport}`);
            }
        } else {
            console.log('⚠️  No coverage report found. Run with --coverage flag.');
        }
    } catch (error) {
        console.error('❌ Failed to generate coverage summary');
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('\n' + '🚀'.repeat(30));
    console.log('   Deb\'s POS - Test Runner');
    console.log('🚀'.repeat(30) + '\n');

    const startTime = Date.now();
    let allPassed = true;

    // Determine which tests to run
    if (e2eOnly) {
        allPassed = runE2ETests();
    } else if (unitOnly) {
        allPassed = runUnitTests();
    } else {
        // Run both unit and E2E tests
        const unitPassed = runUnitTests();
        const e2ePassed = runE2ETests();
        allPassed = unitPassed && e2ePassed;
    }

    // Generate coverage summary
    if (!noCoverage && !watchMode && !isCI && !e2eOnly) {
        generateCoverageSummary();
    }

    // Print final summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n${'='.repeat(60)}`);
    console.log('📋 Test Summary');
    console.log('='.repeat(60));
    console.log(`   Duration: ${duration}s`);
    console.log(`   Status: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('='.repeat(60) + '\n');

    process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(err => {
    console.error('❌ Test runner failed:', err.message);
    process.exit(1);
});
