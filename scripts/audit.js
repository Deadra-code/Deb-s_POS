#!/usr/bin/env node

/**
 * Enhanced Comprehensive Audit Script for Deb's POS
 * Checks: Security, Performance, Accessibility, Best Practices, UI/UX, Components
 * Usage: node scripts/audit.js [options]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

const args = process.argv.slice(2);
const securityOnly = args.includes('--security');
const performanceOnly = args.includes('--performance');
const a11yOnly = args.includes('--a11y');
const uionly = args.includes('--ui');
const componentsOnly = args.includes('--components');
const fullAudit = args.includes('--full') || (!securityOnly && !performanceOnly && !a11yOnly && !uionly && !componentsOnly);

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

    addError(message, file = null, severity = 'high') {
        this.errors.push({ message, file, severity });
        this.passed = false;
        this.score -= severity === 'high' ? 20 : severity === 'medium' ? 10 : 5;
    }

    addWarning(message, file = null) {
        this.warnings.push({ message, file });
        this.score -= 5;
    }

    addSuggestion(message) {
        this.suggestions.push(message);
    }

    addInfo(message) {
        this.suggestions.push(message);
    }
}

/**
 * Get all files with specific extensions
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
    } catch (error) { /* ignore */ }
    return files;
}

/**
 * Get directory size
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
    } catch (error) { /* ignore */ }
    return size;
}

/**
 * Parse JSX/JS file to find components
 */
function findComponents(content) {
    const components = [];
    // Match function components
    const funcCompRegex = /(?:export\s+)?(?:const|function)\s+([A-Z][a-zA-Z0-9]*)\s*(?:=\s*)?\(?/g;
    let match;
    while ((match = funcCompRegex.exec(content)) !== null) {
        components.push(match[1]);
    }
    return components;
}

/**
 * Check for common UI/UX issues
 */
function auditUIUX() {
    console.log('\n🎨 UI/UX Audit\n');
    const result = new AuditResult('UI/UX');

    const filesToCheck = getAllFiles(SRC_DIR, ['.jsx', '.tsx']);

    filesToCheck.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(ROOT_DIR, file);

        // Check for hardcoded colors (should use theme)
        const hardcodedColors = content.match(/#[0-9a-fA-F]{3,6}/g);
        if (hardcodedColors && hardcodedColors.length > 5) {
            result.addWarning(`Many hardcoded colors (${hardcodedColors.length}) - consider using theme`, relativePath);
        }

        // Check for inline styles (should use Tailwind classes)
        const inlineStyles = content.match(/style=\{{/g);
        if (inlineStyles && inlineStyles.length > 3) {
            result.addWarning(`Many inline styles (${inlineStyles.length}) - use Tailwind classes`, relativePath);
        }

        // Check for missing loading states
        if (/async|await|fetch|\.get\(/.test(content) && !/loading|Loading|isLoading|spinner|Spinner/.test(content)) {
            result.addSuggestion(`Consider adding loading state for async operations`, relativePath);
        }

        // Check for missing error handling
        if (/async|await|fetch|\.get\(/.test(content) && !/catch|error|Error|try/.test(content)) {
            result.addError('Missing error handling for async operations', relativePath, 'medium');
        }

        // Check for proper button types
        if (/<button(?!.*type=)/.test(content) && !/<button.*type=/.test(content)) {
            result.addWarning('Buttons without explicit type attribute', relativePath);
        }

        // Check for text contrast (small text)
        const smallText = content.match(/text-\[?[6-8]px\]?/g);
        if (smallText) {
            result.addWarning(`Very small text sizes found - accessibility issue`, relativePath);
        }

        // Check for proper form labels
        if (/<input/.test(content) && !/(<label|aria-label|id=.*htmlFor)/.test(content)) {
            result.addError('Input without proper label', relativePath, 'medium');
        }

        // Check for disabled button states
        if (/<button.*disabled/.test(content) && !/(opacity|cursor|pointer-events)/.test(content)) {
            result.addSuggestion('Add visual feedback for disabled buttons', relativePath);
        }
    });

    // Check for consistent component patterns
    const componentFiles = getAllFiles(path.join(SRC_DIR, 'components'), ['.jsx', '.tsx']);
    const exportPatterns = new Set();
    
    componentFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (/export\s+default/.test(content)) {
            exportPatterns.add('default');
        }
        if (/export\s+(?:const|function)\s+[A-Z]/.test(content)) {
            exportPatterns.add('named');
        }
    });

    if (exportPatterns.size > 1) {
        result.addSuggestion('Inconsistent export patterns - use either default or named exports');
    }

    result.score = Math.max(0, result.score);
    return result;
}

/**
 * Check for component functionality issues
 */
function auditComponents() {
    console.log('\n🧩 Component Functionality Audit\n');
    const result = new AuditResult('Components');

    const componentDirs = [
        path.join(SRC_DIR, 'components'),
        path.join(SRC_DIR, 'pages'),
        path.join(SRC_DIR, 'layouts'),
    ];

    const allComponentFiles = [];
    componentDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            allComponentFiles.push(...getAllFiles(dir, ['.jsx', '.tsx']));
        }
    });

    allComponentFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(ROOT_DIR, file);

        // Check for React hooks usage
        const hasHooks = /useState|useEffect|useCallback|useMemo|useRef/.test(content);
        const hasDeps = /useState|useEffect|useCallback|useMemo/.test(content);
        
        if (hasHooks && !/\[\s*\]/.test(content) && /useEffect|useCallback|useMemo/.test(content)) {
            result.addWarning('Hook without dependency array', relativePath);
        }

        // Check for missing keys in lists
        if (/.map\(/.test(content) && !/key=/.test(content)) {
            result.addError('Missing key prop in mapped elements', relativePath, 'high');
        }

        // Check for proper event handlers
        if (/onClick|onChange|onSubmit/.test(content) && !/(handle|on[A-Z]|dispatch)/.test(content)) {
            result.addSuggestion('Consider naming event handlers consistently (handleX or onX)', relativePath);
        }

        // Check for console statements in components (only production code)
        if (/console\.(log|warn|error)/.test(content) && !file.includes('.test.')) {
            // Allow console statements wrapped in development checks
            if (!/process\.env\.NODE_ENV.*development/.test(content)) {
                result.addWarning('Console statements in component code (consider using logger.js)', relativePath);
            }
        }

        // Check for prop-types or TypeScript (suggestion only, not error)
        if (!/propTypes|PropTypes|interface|type\s+\w+\s*=/.test(content) && !file.includes('.test.')) {
            // Only add as info, not suggestion (too many would clutter)
            // result.addSuggestion('Consider adding prop validation (PropTypes or TypeScript)', relativePath);
        }

        // Check for proper cleanup in useEffect
        if (/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{/.test(content)) {
            const useEffectMatch = content.match(/useEffect\s*\([^)]+\{[^}]*\}/gs);
            if (useEffectMatch && !/return\s*\(\s*\(\s*\)\s*=>|return\s*\(\s*\)/.test(content)) {
                result.addSuggestion('Consider cleanup function in useEffect', relativePath);
            }
        }

        // Check for proper async handling
        if (/async\s+\w+\s*=|async\s+function/.test(content)) {
            if (!/try\s*\{|\.catch\(/.test(content)) {
                result.addWarning('Async function without error handling', relativePath);
            }
        }
    });

    // Check for component re-renders optimization
    const pagesDir = path.join(SRC_DIR, 'pages');
    if (fs.existsSync(pagesDir)) {
        const pageFiles = getAllFiles(pagesDir, ['.jsx', '.tsx']);
        pageFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const relativePath = path.relative(ROOT_DIR, file);

            // Check for useMemo/useCallback on expensive computations
            if (/.map\([^)]+\{[^}]+\}/.test(content) && !/useMemo|useCallback/.test(content)) {
                result.addSuggestion('Consider memoizing expensive list renders', relativePath);
            }
        });
    }

    result.score = Math.max(0, result.score);
    return result;
}

/**
 * Security Audit
 */
function auditSecurity() {
    console.log('\n🔒 Security Audit\n');
    const result = new AuditResult('Security');

    const sensitivePatterns = [
        { pattern: /API_KEY\s*=\s*['"][^'"]+['"]/i, name: 'API Key' },
        { pattern: /SECRET\s*=\s*['"][^'"]+['"]/i, name: 'Secret' },
        { pattern: /PASSWORD\s*=\s*['"][^'"]+['"]/i, name: 'Password' },
        { pattern: /TOKEN\s*=\s*['"][^'"]+['"]/i, name: 'Token' },
    ];

    const filesToCheck = getAllFiles(SRC_DIR, ['.js', '.jsx', '.ts', '.tsx']);

    filesToCheck.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(ROOT_DIR, file);

        sensitivePatterns.forEach(({ pattern, name }) => {
            if (pattern.test(content) && !file.includes('.env.example')) {
                result.addWarning(`Possible ${name} found in code`, relativePath);
            }
        });

        if (/\beval\s*\(/.test(content)) {
            result.addError('eval() is used - security risk!', relativePath);
        }

        if (/\.innerHTML\s*=/.test(content)) {
            result.addWarning('innerHTML usage - potential XSS risk', relativePath);
        }

        if (/dangerouslySetInnerHTML/.test(content)) {
            result.addWarning('dangerouslySetInnerHTML - ensure content is sanitized', relativePath);
        }

        if (/localStorage\.(setItem|getItem)/.test(content) && /token|password|secret/i.test(content)) {
            result.addWarning('Sensitive data might be stored in localStorage', relativePath);
        }
    });

    try {
        console.log('   Checking for vulnerable dependencies...');
        execSync('npm audit --production --json', { cwd: ROOT_DIR, stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (error) {
        if (error.stdout) {
            const audit = JSON.parse(error.stdout.toString());
            if (audit.metadata && audit.metadata.vulnerabilities) {
                const vulns = audit.metadata.vulnerabilities;
                const total = vulns.high + vulns.critical;
                if (total > 0) {
                    result.addError(`${total} high/critical vulnerabilities in dependencies`);
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

    const distDir = path.join(ROOT_DIR, 'dist');
    if (fs.existsSync(distDir)) {
        const distSize = getDirectorySize(distDir);
        const distSizeMB = (distSize / 1024 / 1024).toFixed(2);
        console.log(`   📦 Dist folder size: ${distSizeMB} MB`);

        if (distSize > 5 * 1024 * 1024) {
            result.addWarning(`Dist folder is large (${distSizeMB} MB)`);
        }

        const jsFiles = fs.readdirSync(distDir)
            .filter(f => f.endsWith('.js'))
            .map(f => {
                const filePath = path.join(distDir, f);
                return { name: f, size: fs.statSync(filePath).size };
            });

        jsFiles.forEach(file => {
            const sizeKB = (file.size / 1024).toFixed(2);
            if (file.size > 500 * 1024) {
                result.addWarning(`Large chunk: ${file.name} (${sizeKB} KB)`);
            }
        });
    } else {
        result.addSuggestion('Run "npm run build" to analyze production bundle');
    }

    const filesToCheck = getAllFiles(SRC_DIR, ['.js', '.jsx']);
    filesToCheck.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(ROOT_DIR, file);

        // Check for large inline objects
        const largeObjects = content.match(/\{\s*[a-zA-Z]+\s*:\s*[^}]{100,}\s*\}/g);
        if (largeObjects && largeObjects.length > 3) {
            result.addSuggestion('Consider extracting large objects/constants', relativePath);
        }

        // Check for unnecessary re-renders
        if (/useState.*\[\]/.test(content) || /useState.*\{\}/.test(content)) {
            result.addSuggestion('Consider using useMemo for object/array state', relativePath);
        }
    });

    result.score = Math.max(0, result.score);
    return result;
}

/**
 * Accessibility Audit
 */
function auditAccessibility() {
    console.log('\n♿ Accessibility Audit\n');
    const result = new AuditResult('Accessibility');

    const filesToCheck = getAllFiles(SRC_DIR, ['.jsx', '.tsx']);

    filesToCheck.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(ROOT_DIR, file);

        if (/<img[^>]*>/.test(content) && !/(alt\s*=|aria-label)/.test(content)) {
            result.addError('Images should have alt text', relativePath, 'high');
        }

        if (/<button[^>]*>/.test(content) && !/(aria-label|children|>.*<|icon|Icon)/i.test(content)) {
            result.addWarning('Buttons should have accessible text', relativePath);
        }

        if (/<input[^>]*>/.test(content) && !/(label|aria-label|id.*htmlFor|aria-labelledby)/i.test(content)) {
            result.addError('Form inputs should have labels', relativePath, 'medium');
        }

        if (/<div[^>]*onClick/.test(content) && !/role\s*=/.test(content)) {
            result.addWarning('Clickable divs should have role attribute', relativePath);
        }

        if (/onKeyDown|onKeyUp/.test(content) && !/onKeyPress|Enter/.test(content)) {
            result.addSuggestion('Ensure keyboard event handlers check for Enter key', relativePath);
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

    const envFile = path.join(ROOT_DIR, '.env');
    if (fs.existsSync(envFile)) {
        result.addWarning('.env file exists - ensure it\'s in .gitignore');
    }

    const gitignore = path.join(ROOT_DIR, '.gitignore');
    if (fs.existsSync(gitignore)) {
        const content = fs.readFileSync(gitignore, 'utf8');
        const required = ['.env', 'node_modules', 'dist', 'coverage'];
        required.forEach(ignore => {
            if (!content.includes(ignore)) {
                result.addWarning(`${ignore} should be in .gitignore`);
            }
        });
    }

    const filesToCheck = getAllFiles(SRC_DIR, ['.js', '.jsx', '.ts', '.tsx']);
    let todoCount = 0;
    filesToCheck.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(/(TODO|FIXME|XXX|HACK)/g);
        if (matches) todoCount += matches.length;
    });

    if (todoCount > 10) {
        result.addWarning(`${todoCount} TODO/FIXME comments found`);
    } else if (todoCount > 0) {
        result.addSuggestion(`${todoCount} TODO/FIXME comments found`);
    }

    result.score = Math.max(0, result.score);
    return result;
}

/**
 * Print audit result
 */
function printResult(result) {
    const emoji = result.score >= 80 ? '✅' : result.score >= 60 ? '⚠️' : '❌';
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${emoji} ${result.category} Audit: ${Math.max(0, result.score)}/100`);
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
        result.suggestions.slice(0, 10).forEach(sug => {
            console.log(`   • ${sug}`);
        });
        if (result.suggestions.length > 10) {
            console.log(`   ... and ${result.suggestions.length - 10} more`);
        }
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
        console.log('\n🎉 No issues found!');
    }
}

/**
 * Save report
 */
function saveReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(REPORTS_DIR, `audit-${timestamp}.json`);
    const report = {
        timestamp,
        results: results.map(r => ({
            category: r.category,
            score: Math.max(0, r.score),
            passed: r.passed,
            errors: r.errors.length,
            warnings: r.warnings.length,
            suggestions: r.suggestions.length,
        })),
        averageScore: results.reduce((sum, r) => Math.max(0, sum + r.score), 0) / results.length,
    };
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved: ${reportFile}`);
}

/**
 * Main function
 */
function runAudit() {
    console.log('\n' + '🔍'.repeat(30));
    console.log('   Deb\'s POS - Enhanced Comprehensive Audit');
    console.log('🔍'.repeat(30) + '\n');

    const startTime = Date.now();
    const results = [];

    if (fullAudit || securityOnly) results.push(auditSecurity());
    if (fullAudit || performanceOnly) results.push(auditPerformance());
    if (fullAudit || a11yOnly) results.push(auditAccessibility());
    if (fullAudit || uionly) results.push(auditUIUX());
    if (fullAudit || componentsOnly) results.push(auditComponents());
    if (fullAudit) results.push(auditBestPractices());

    results.forEach(printResult);
    saveReport(results);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const avgScore = results.reduce((sum, r) => Math.max(0, sum + r.score), 0) / results.length;
    const allPassed = results.every(r => r.passed);

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Audit Summary');
    console.log('='.repeat(60));
    console.log(`   Duration: ${duration}s`);
    console.log(`   Average Score: ${avgScore.toFixed(1)}/100`);
    console.log(`   Status: ${allPassed ? '✅ PASSED' : '⚠️  NEEDS ATTENTION'}`);
    console.log('='.repeat(60) + '\n');

    process.exit(allPassed ? 0 : 1);
}

runAudit();
