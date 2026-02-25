#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Deb's POS
 * Runs all tests with coverage report
 * Usage: node scripts/run-tests.js [options]
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const args = process.argv.slice(2);
const isCI = process.env.CI === 'true' || args.includes('--ci');
const watchMode = args.includes('--watch');
const unitOnly = args.includes('--unit');
const e2eOnly = args.includes('--e2e');
const noCoverage = args.includes('--no-coverage');

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
    let command = 'node node_modules/vitest/vitest.mjs run';

    if (watchMode) {
        command = 'node node_modules/vitest/vitest.mjs --watch';
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
    let command = 'node node_modules/@playwright/test/cli.js test';

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
        if (fs.existsSync(coverageFile)) {
            const summary = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
            const total = summary.total;

            console.log('\n📈 Coverage Results:');
            console.log(`   Statements:   ${total.statements.pct.toFixed(1)}%`);
            console.log(`   Branches:     ${total.branches.pct.toFixed(1)}%`);
            console.log(`   Functions:    ${total.functions.pct.toFixed(1)}%`);
            console.log(`   Lines:        ${total.lines.pct.toFixed(1)}%`);

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

    if (e2eOnly) {
        allPassed = runE2ETests();
    } else if (unitOnly) {
        allPassed = runUnitTests();
    } else {
        const unitPassed = runUnitTests();
        const e2ePassed = runE2ETests();
        allPassed = unitPassed && e2ePassed;
    }

    if (!noCoverage && !watchMode && !isCI && !e2eOnly) {
        await generateCoverageSummary();
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n${'='.repeat(60)}`);
    console.log('📋 Test Summary');
    console.log('='.repeat(60));
    console.log(`   Duration: ${duration}s`);
    console.log(`   Status: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('='.repeat(60) + '\n');

    process.exit(allPassed ? 0 : 1);
}

runTests().catch(err => {
    console.error('❌ Test runner failed:', err.message);
    process.exit(1);
});
