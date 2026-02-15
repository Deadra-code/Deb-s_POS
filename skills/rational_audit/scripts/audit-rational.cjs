const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../../../src'); // Adjust path to project src
let issues = [];
let stats = {
    evaluatedFiles: 0,
    semanticTags: 0,
    divTags: 0,
    accessibleButtons: 0,
    inaccessibleClickables: 0,
    resilientFetches: 0,
    fragileCatches: 0,
    perfIssues: 0
};

function auditFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(SRC_DIR, filePath);

    // Skip tests and styles
    if (filePath.includes('.test.') || filePath.includes('.css')) return;

    stats.evaluatedFiles++;

    // 1. Semantic Analysis
    const emptyDivs = (content.match(/<div/g) || []).length;
    const semanticTags = (content.match(/<(main|article|section|nav|aside|header|footer)/g) || []).length;
    stats.divTags += emptyDivs;
    stats.semanticTags += semanticTags;

    if (semanticTags === 0 && emptyDivs > 20 && filePath.includes('pages')) {
        issues.push({ type: 'SEMANTICS', level: 'WARN', file: relativePath, detail: `Page has ${emptyDivs} divs but 0 semantic tags.` });
    }

    // 2. Accessibility Check (a11y)
    // Robust check for onClick on non-button elements without role
    const tagMatches = content.match(/<[a-zA-Z0-9]+[^>]*onClick=[^>]*>/gs) || [];
    tagMatches.forEach(tag => {
        const tagName = tag.match(/<([a-zA-Z0-9]+)/)[1];

        // Skip custom components (Uppercase) as they handle a11y internally
        if (tagName[0] === tagName[0].toUpperCase()) return;

        // Skip tags where onClick only stops propagation
        if (/onClick=\{?\(?e\)?\s*=>\s*e\.stopPropagation\(\)\}?/.test(tag)) return;

        if (!tag.startsWith('<button') && !tag.includes('role="button"') && !tag.includes('role="menuitem"') && !tag.includes('role="dialog"') && !tag.includes('role="presentation"')) {
            if (!tag.includes('onKeyDown') && !tag.includes('onKeyUp')) {
                stats.inaccessibleClickables++;
                const lineIndex = content.substring(0, content.indexOf(tag)).split('\n').length;
                issues.push({
                    type: 'A11Y',
                    level: 'CRITICAL',
                    file: relativePath,
                    line: lineIndex,
                    detail: `Inaccessible tag <${tagName}> found. Missing role="button" or keyboard support.`
                });
            }
        }
    });

    // Check for Icon-only buttons without aria-label
    // Heuristic: <button> contains <Icon and no other text
    if (content.match(/<button[^>]*>\s*<Icon[^>]*\/>\s*<\/button>/)) {
        if (!content.includes('aria-label') && !content.includes('title=')) {
            issues.push({ type: 'A11Y', level: 'WARN', file: relativePath, detail: 'Icon-only button might be missing aria-label.' });
        }
    } else {
        stats.accessibleButtons++;
    }

    // 3. Resilience Check
    // Empty catch blocks
    if (content.match(/catch\s*\(\w+\)\s*\{\s*\}/) || content.match(/catch\s*\{\s*\}/)) {
        stats.fragileCatches++;
        issues.push({ type: 'RESILIENCE', level: 'ERROR', file: relativePath, detail: 'Empty catch block found. Errors are being swallowed silently.' });
    }

    // 4. Performance Heuristics
    // String manipulation in render body (naive check)
    // Only flag explicit map/filter/reduce chains on split strings in render path
    if (/\.split\(.*\)\.(map|filter|reduce)\(/.test(content) && !filePath.includes('utils')) {
        // Check if it's likely inside a component return
        if (content.includes('return') && content.includes('=>')) {
            stats.perfIssues++;
            issues.push({ type: 'PERF', level: 'WARN', file: relativePath, detail: 'Potential expensive string chain detected in component.' });
        }
    }
}

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            auditFile(fullPath);
        }
    });
}

console.log('\x1b[36m🧠 Starting Rational & Critical Audit...\x1b[0m\n');

if (fs.existsSync(SRC_DIR)) {
    walk(SRC_DIR);
} else {
    console.error(`Source directory not found at ${SRC_DIR}`);
    process.exit(1);
}

// SCORE CALCULATION
// 100 Base
// -5 per Critical A11y
// -5 per Empty Catch
// -2 per Semantic Warning
// -2 per Perf Warning
let score = 100;
score -= (issues.filter(i => i.level === 'CRITICAL').length * 5);
score -= (issues.filter(i => i.level === 'ERROR').length * 5);
score -= (issues.filter(i => i.level === 'WARN').length * 2);

score = Math.max(0, score);

console.log('\x1b[35m--- AUDIT FINDINGS ---\x1b[0m');
console.log(`Files Evaluated: ${stats.evaluatedFiles}`);
console.log(`- Semantic Health: ${stats.semanticTags} tags vs ${stats.divTags} divs (Ratio: ${(stats.semanticTags / stats.divTags * 100).toFixed(1)}%)`);
console.log(`- A11y Gaps: ${stats.inaccessibleClickables} inaccessible interactables found`);
console.log(`- Resilience: ${stats.fragileCatches} silent error handlers found`);
console.log(`- Performance: ${stats.perfIssues} potential render bottlenecks`);

if (issues.length > 0) {
    console.log('\n\x1b[33m--- TOP PRIORITY ISSUES ---\x1b[0m');
    const sortedIssues = issues.sort((a, b) => (a.level === 'CRITICAL' ? -1 : 1));
    sortedIssues.slice(0, 10).forEach(msg => {
        const color = msg.level === 'CRITICAL' ? '\x1b[31m' : msg.level === 'ERROR' ? '\x1b[31m' : '\x1b[33m';
        console.log(`${color}[${msg.level}] [${msg.type}] \x1b[0m${msg.file}: ${msg.detail}`);
        if (msg.line) console.log(`    Line: ${msg.line}`);
    });
    if (issues.length > 10) console.log(`...and ${issues.length - 10} more issues.`);
}

console.log(`\n\x1b[1mRational Score: ${score.toFixed(0)}/100\x1b[0m`);

if (score < 50) {
    console.log('\x1b[31m❌ status: CRITICAL GAPS. The application is fragile or inaccessible.\x1b[0m');
} else if (score < 80) {
    console.log('\x1b[33m⚠️ status: FUNCTIONAL BUT FLAWED. Needs engineering polish.\x1b[0m');
} else {
    console.log('\x1b[32m✅ status: ROBUST. Engineering standards are high.\x1b[0m');
}
