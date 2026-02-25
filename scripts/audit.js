#!/usr/bin/env node

/**
 * Comprehensive Audit Script for Deb's POS
 * Checks: Security, Performance, Accessibility, Best Practices
 * Usage: node scripts/audit.js [options]
 * 
 * Options:
 *   --security    Run only security audit
 *   --performance Run only performance audit
 *   --a11y        Run only accessibility audit
 *   --all         Run all audits (default)
 *   --output      Output format (json|text|html)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const securityOnly = args.includes('--security');
const performanceOnly = args.includes('--performance');
const a11yOnly = args.includes('--a11y');
const outputFormat = args.includes('--output=json') ? 'json' : 'text';

const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Audit result structure
 */
class AuditResult {
    constructor(category) {
        this.category = category;
        this.passed = true;
        this.warnings = [];
        this.errors = [];
        this.suggestions = [];
        this.score = 100;
    }

    addError(message, file = null) {
        this.errors.push({ message, file });
        this.passed = false;
        this.score -= 20;
    }

    addWarning(message, file = null) {
        this.warnings.push({ message, file });
        this.score -= 5;
    }

    addSuggestion(message) {
        this.suggestions.push(message);
    }
}

/**
 * Security Audit
 */
function auditSecurity() {
    console.log('\n🔒 Security Audit\n');
    const result = new AuditResult('Security');

    // Check for sensitive data in code
    const sensitivePatterns = [
        { pattern: /API_KEY\s*=\s*['"][^'"]+['"]/i, name: 'API Key' },
        { pattern: /SECRET\s*=\s*['"][^'"]+['"]/i, name: 'Secret' },
        { pattern: /PASSWORD\s*=\s*['"][^'"]+['"]/i, name: 'Password' },
        { pattern: /TOKEN\s*=\s*['"][^'"]+['"]/i, name: 'Token' },
        { pattern: /PRIVATE_KEY/i, name: 'Private Key' },
    ];

    const filesToCheck = getAllFiles(SRC_DIR, ['.js', '.jsx', '.ts', '.tsx']);

    filesToCheck.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(ROOT_DIR, file);

        // Check for sensitive data
        sensitivePatterns.forEach(({ pattern, name }) => {
            if (pattern.test(content)) {
                // Skip if it's in .env.example or documentation
                if (!file.includes('.env.example') && !file.includes('.md')) {
                    result.addWarning(`Possible ${name} found in code`, relativePath);
                }
            }
        });

        // Check for console.log in production code
        if (/console\.(log|info|debug)/.test(content) && !file.includes('.test.')) {
            // This is now handled by logger.js
            if (!content.includes('from') || !content.includes('logger')) {
                result.addSuggestion(`Consider using logger.js instead of console in: ${relativePath}`);
            }
        }

        // Check for eval()
        if (/\beval\s*\(/.test(content)) {
            result.addError('eval() is used - security risk!', relativePath);
        }

        // Check for innerHTML
        if (/\.innerHTML\s*=/.test(content)) {
            result.addWarning('innerHTML usage detected - potential XSS risk', relativePath);
        }

        // Check for dangerouslySetInnerHTML
        if (/dangerouslySetInnerHTML/.test(content)) {
            result.addWarning('dangerouslySetInnerHTML usage - ensure content is sanitized', relativePath);
        }
    });

    // Check .env.example for sensitive keys
    const envExample = path.join(ROOT_DIR, '.env.example');
    if (fs.existsSync(envExample)) {
        const envContent = fs.readFileSync(envExample, 'utf8');
        if (/SECRET|PASSWORD|PRIVATE/i.test(envContent)) {
            result.addSuggestion('Ensure sensitive env vars are not committed to .env (only .env.example)');
        }
    }

    // Check localStorage usage
    filesToCheck.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(ROOT_DIR, file);

        if (/localStorage\.(setItem|getItem)/.test(content)) {
            // localStorage is okay for non-sensitive data
            if (/token|password|secret|key/i.test(content)) {
                result.addWarning('Sensitive data might be stored in localStorage', relativePath);
            }
        }
    });

    // Check package.json for outdated/vulnerable packages
    try {
        console.log('   Checking for vulnerable dependencies...');
        execSync('npm audit --production --json', { 
            cwd: ROOT_DIR, 
            stdio: ['pipe', 'pipe', 'pipe'] 
        });
    } catch (error) {
        if (error.stdout) {
            const audit = JSON.parse(error.stdout.toString());
            if (audit.metadata && audit.metadata.vulnerabilities) {
                const vulns = audit.metadata.vulnerabilities;
                const total = vulns.high + vulns.critical;
                if (total > 0) {
                    result.addError(`${total} high/critical vulnerabilities found in dependencies`);
                } else if (vulns.moderate > 0) {
                    result.addWarning(`${vulns.moderate} moderate vulnerabilities in dependencies`);
                }
            }
        }
    }

    result.score = Math.max(0, result.score);
    return result;
}

/**
 * Performance Audit
 */
function auditPerformance() {
    console.log('\n⚡ Performance Audit\n');
    const result = new AuditResult('Performance');

    // Check dist folder size
    const distDir = path.join(ROOT_DIR, 'dist');
    if (fs.existsSync(distDir)) {
        const distSize = getDirectorySize(distDir);
        const distSizeMB = (distSize / 1024 / 1024).toFixed(2);

        console.log(`   📦 Dist folder size: ${distSizeMB} MB`);

        if (distSize > 5 * 1024 * 1024) { // 5MB
            result.addWarning(`Dist folder is large (${distSizeMB} MB). Consider code splitting.`);
        }

        // Check individual chunk sizes
        const jsFiles = fs.readdirSync(distDir)
            .filter(f => f.endsWith('.js'))
            .map(f => {
                const filePath = path.join(distDir, f);
                return { name: f, size: fs.statSync(filePath).size };
            });

        jsFiles.forEach(file => {
            const sizeKB = (file.size / 1024).toFixed(2);
            if (file.size > 500 * 1024) { // 500KB
                result.addWarning(`Large chunk: ${file.name} (${sizeKB} KB)`);
            }
        });
    } else {
        result.addSuggestion('Run "npm run build" to analyze production bundle');
    }

    // Check for large dependencies
    const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    console.log('   📦 Checking dependency sizes...');
    
    const largeDeps = ['moment', 'lodash', 'jquery', 'bootstrap'];
    largeDeps.forEach(dep => {
        if (deps[dep]) {
            result.addSuggestion(`Consider lighter alternative for: ${dep}`);
        }
    });

    // Check for synchronous operations
    const filesToCheck = getAllFiles(SRC_DIR, ['.js', '.jsx']);
    filesToCheck.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(ROOT_DIR, file);

        // Check for sync XHR
        if (/XMLHttpRequest/.test(content) && /async:\s*false/.test(content)) {
            result.addError('Synchronous XMLHttpRequest detected!', relativePath);
        }

        // Check for blocking operations
        if (/require\(/.test(content) && !content.includes('import')) {
            result.addSuggestion('Consider using ES6 imports instead of require()', relativePath);
        }
    });

    // Check image optimization (if public folder exists)
    const publicDir = path.join(ROOT_DIR, 'public');
    if (fs.existsSync(publicDir)) {
        const images = getAllFiles(publicDir, ['.png', '.jpg', '.jpeg', '.gif']);
        images.forEach(img => {
            const stats = fs.statSync(img);
            if (stats.size > 500 * 1024) { // 500KB
                result.addWarning(`Large image file: ${path.relative(ROOT_DIR, img)} (${(stats.size / 1024).toFixed(0)} KB)`);
            }
        });
    }

    result.score = Math.max(0, result.score);
    return result;
}

/**
 * Accessibility Audit (Basic)
 */
function auditAccessibility() {
    console.log('\n♿ Accessibility Audit\n');
    const result = new AuditResult('Accessibility');

    const filesToCheck = getAllFiles(SRC_DIR, ['.jsx', '.tsx']);

    filesToCheck.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(ROOT_DIR, file);

        // Check for alt text in images
        if (/<img[^>]*>/.test(content)) {
            if (!/alt\s*=\s*["'][^"']*["']/.test(content) && !/alt\s*=\s*\{/.test(content)) {
                result.addWarning('Images should have alt text', relativePath);
            }
        }

        // Check for button accessibility
        if (/<button[^>]*>/.test(content)) {
            if (!/aria-label|aria-labelledby/.test(content) && 
                !/>[^<]+</.test(content.replace(/\n/g, ' '))) {
                result.addSuggestion('Ensure buttons have accessible text', relativePath);
            }
        }

        // Check for form labels
        if (/<input[^>]*>/.test(content)) {
            if (!/label|aria-label|id/.test(content)) {
                result.addWarning('Form inputs should have labels', relativePath);
            }
        }

        // Check for role attributes
        if (/<div[^>]*onClick/.test(content)) {
            if (!/role\s*=\s*["']button/.test(content) && !/role\s*=\s*["']link/.test(content)) {
                result.addSuggestion('Clickable divs should have role attribute', relativePath);
            }
        }
    });

    // Check for color contrast (basic check)
    const cssFiles = getAllFiles(SRC_DIR, ['.css']);
    cssFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(ROOT_DIR, file);

        // Check for very small font sizes
        if (/font-size:\s*8px/.test(content)) {
            result.addWarning('Very small font size (8px) may be hard to read', relativePath);
        }
    });

    result.score = Math.max(0, result.score);
    return result;
}

/**
 * Best Practices Audit
 */
function auditBestPractices() {
    console.log('\n📋 Best Practices Audit\n');
    const result = new AuditResult('Best Practices');

    // Check for .env file (should not exist)
    const envFile = path.join(ROOT_DIR, '.env');
    if (fs.existsSync(envFile)) {
        result.addWarning('.env file exists - ensure it\'s in .gitignore');
    }

    // Check .gitignore
    const gitignore = path.join(ROOT_DIR, '.gitignore');
    if (fs.existsSync(gitignore)) {
        const gitignoreContent = fs.readFileSync(gitignore, 'utf8');
        const requiredIgnores = ['.env', 'node_modules', 'dist', 'coverage'];
        
        requiredIgnores.forEach(ignore => {
            if (!gitignoreContent.includes(ignore)) {
                result.addWarning(`${ignore} should be in .gitignore`);
            }
        });
    }

    // Check for TODO/FIXME comments
    const filesToCheck = getAllFiles(SRC_DIR, ['.js', '.jsx', '.ts', '.tsx']);
    let todoCount = 0;
    
    filesToCheck.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(/(TODO|FIXME|XXX|HACK)/g);
        if (matches) {
            todoCount += matches.length;
        }
    });

    if (todoCount > 10) {
        result.addWarning(`${todoCount} TODO/FIXME comments found - consider addressing them`);
    } else if (todoCount > 0) {
        result.addSuggestion(`${todoCount} TODO/FIXME comments found`);
    }

    // Check for consistent naming
    const componentFiles = getAllFiles(SRC_DIR, ['.jsx', '.tsx']);
    componentFiles.forEach(file => {
        const fileName = path.basename(file);
        if (fileName[0] !== fileName[0].toUpperCase()) {
            result.addSuggestion(`Component file should be PascalCase: ${fileName}`);
        }
    });

    result.score = Math.max(0, result.score);
    return result;
}

/**
 * Helper: Get all files with specific extensions
 */
function getAllFiles(dir, extensions) {
    let files = [];
    
    try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            if (item === 'node_modules' || item === 'dist' || item.startsWith('.')) continue;
            
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files = files.concat(getAllFiles(fullPath, extensions));
            } else if (extensions.some(ext => item.endsWith(ext))) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        // Ignore errors
    }
    
    return files;
}

/**
 * Helper: Get directory size
 */
function getDirectorySize(dir) {
    let size = 0;
    
    try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                size += getDirectorySize(fullPath);
            } else {
                size += stat.size;
            }
        }
    } catch (error) {
        // Ignore errors
    }
    
    return size;
}

/**
 * Print audit result
 */
function printResult(result) {
    const emoji = result.score >= 80 ? '✅' : result.score >= 60 ? '⚠️' : '❌';
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${emoji} ${result.category} Audit: ${result.score}/100`);
    console.log('='.repeat(60));

    if (result.errors.length > 0) {
        console.log(`\n❌ Errors (${result.errors.length}):`);
        result.errors.forEach(err => {
            console.log(`   • ${err.message}${err.file ? ` (${err.file})` : ''}`);
        });
    }

    if (result.warnings.length > 0) {
        console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
        result.warnings.forEach(warn => {
            console.log(`   • ${warn.message}${warn.file ? ` (${warn.file})` : ''}`);
        });
    }

    if (result.suggestions.length > 0) {
        console.log(`\n💡 Suggestions (${result.suggestions.length}):`);
        result.suggestions.forEach(sug => {
            console.log(`   • ${sug}`);
        });
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
        console.log('\n🎉 No issues found!');
    }
}

/**
 * Save report to file
 */
function saveReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(REPORTS_DIR, `audit-${timestamp}.json`);

    const report = {
        timestamp,
        results: results.map(r => ({
            category: r.category,
            score: r.score,
            passed: r.passed,
            errors: r.errors.length,
            warnings: r.warnings.length,
            suggestions: r.suggestions.length,
        })),
        averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
    };

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved: ${reportFile}`);
}

/**
 * Main audit function
 */
function runAudit() {
    console.log('\n' + '🔍'.repeat(30));
    console.log('   Deb\'s POS - Comprehensive Audit');
    console.log('🔍'.repeat(30) + '\n');

    const startTime = Date.now();
    const results = [];

    if (!securityOnly && !performanceOnly && !a11yOnly) {
        // Run all audits
        results.push(auditSecurity());
        results.push(auditPerformance());
        results.push(auditAccessibility());
        results.push(auditBestPractices());
    } else {
        if (securityOnly) results.push(auditSecurity());
        if (performanceOnly) results.push(auditPerformance());
        if (a11yOnly) results.push(auditAccessibility());
    }

    // Print results
    results.forEach(printResult);

    // Save report
    saveReport(results);

    // Print summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const avgScore = (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1);
    const allPassed = results.every(r => r.passed);

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Audit Summary');
    console.log('='.repeat(60));
    console.log(`   Duration: ${duration}s`);
    console.log(`   Average Score: ${avgScore}/100`);
    console.log(`   Status: ${allPassed ? '✅ PASSED' : '⚠️  NEEDS ATTENTION'}`);
    console.log('='.repeat(60) + '\n');

    process.exit(allPassed ? 0 : 1);
}

// Run audit
runAudit();
