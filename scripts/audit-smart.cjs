const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const EXEMPTIONS = [
    'audit-smart.cjs',
    'setupTests.js',
    'reportWebVitals.js'
];

let stats = {
    filesChecked: 0,
    issuesFound: 0
};

let issues = [];

// ==========================================
// HEURISTIC DEFINITIONS
// ==========================================

const CHECKS = [
    {
        id: 'VISUAL_LEAK',
        name: 'Potential Visual Leak (Overflow)',
        // Logic: Container has rounding + background/shadow BUT missing overflow-hidden
        // This causes child elements (images/headers/footers) to bleed out of the corners.
        check: (content) => {
            // Find all className="..." blocks
            const classMatches = content.match(/className="([^"]*)"/g) || [];
            let failures = [];

            classMatches.forEach(match => {
                const classes = match;
                const hasRounding = /rounded-(lg|xl|2xl|3xl)/.test(classes);
                const hasBackground = /(bg-|shadow-)/.test(classes);
                const isContainer = /(flex|grid|block|rating|card)/.test(classes);
                const hasOverflowControl = /overflow-(hidden|clip)/.test(classes);

                const isButton = /<button/.test(classes) || /type="button"/.test(classes);

                if (hasRounding && hasBackground && isContainer && !hasOverflowControl && !isButton) {
                    failures.push(`Container with '${classes.match(/rounded-[^ ]+/)[0]}' might leak children (missing overflow-hidden)`);
                }
            });
            return failures;
        }
    },
    {
        id: 'Z_INDEX_WAR',
        name: 'Z-Index Conflict Risk',
        // Logic: specific arbitrary z-indexes > 50 are dangerous.
        check: (content) => {
            const zMatches = content.match(/z-\[(\d+)\]/g) || [];
            let failures = [];
            zMatches.forEach(z => {
                const val = parseInt(z.match(/\d+/)[0]);
                if (val > 50 && val !== 999) { // Allow 999 as a common "top" layer
                    failures.push(`High arbitrary z-index '${z}' found. Use standard z-10/20/30/40/50 hierarchy.`);
                }
            });
            return failures;
        }
    },
    {
        id: 'GHOST_INTERACTION',
        name: 'Ghost Interaction (Small Tap Target)',
        // Logic: onClick present but sizing seems missing or small.
        check: (content) => {
            const lines = content.split('\n');
            let failures = [];
            lines.forEach((line, idx) => {
                // Heuristic: line has onClick, but check if we're in a button tag context
                if (line.includes('onClick=')) {
                    // Look back locally or check if the line itself is a button
                    const isInsideButton = line.includes('<button') || (idx > 0 && lines[idx - 1].includes('<button')) || (idx > 1 && lines[idx - 2].includes('<button'));

                    if (!isInsideButton) {
                        const hasSize = /(p-\d|h-\d|w-\d|py-\d|px-\d|padding|height|width)/.test(line);
                        if (!hasSize) {
                            failures.push(`Line ${idx + 1}: Clickable element might be too small (missing padding/height/width classes).`);
                        }
                    }
                }
            });
            return failures;
        }
    },
    {
        id: 'DEV_POLLUTION',
        name: 'Development Code in Production',
        check: (content) => {
            if (content.includes('console.log(')) return ['Found console.log() call.'];
            if (content.includes('debugger')) return ['Found debugger statement.'];
            return [];
        }
    },
    {
        id: 'REACT_KEY',
        name: 'Missing Key in Map',
        check: (content) => {
            // Heuristic: .map( followed by return ( implicit or explicit without key=
            if (/\.map\(\s*(\([^\)]*\)|[a-z]+)\s*=>\s*(\(|{)/.test(content) && !content.includes('key=')) {
                return ['File uses .map() but "key=" prop was not detected in file text.'];
            }
            return [];
        }
    },
    {
        id: 'ACCESSIBILITY_FAIL',
        name: 'Inaccessible Button (Silent Button)',
        check: (content) => {
            const failures = [];
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
                // Check for <button ... > with no "aria-label" and no text content pattern
                // This is a naive check. We look for buttons that likely only contain an Icon
                if (line.includes('<button') && !line.includes('aria-label=') && !line.includes('title=')) {

                    // Heuristic: If button has text content on the same line, it's valid.
                    const contentMatch = line.match(/>([^<]+)</);
                    const hasText = contentMatch && contentMatch[1].trim().length > 0;

                    if (!hasText) {
                        // Double check next line if it looks like an icon-only button
                        if (line.includes('<Icon') || (lines[idx + 1] && lines[idx + 1].includes('<Icon') && !lines[idx + 1].includes('span'))) {
                            failures.push(`Line ${idx + 1}: Icon-only button detected without 'aria-label'. Screen readers cannot read this.`);
                        }
                    }
                }
            });
            return failures;
        }
    },
    {
        id: 'COMPLEXITY_RISK',
        name: 'File Too Large (Maintainability Risk)',
        check: (content) => {
            const lineCount = content.split('\n').length;
            if (lineCount > 200) {
                return [`File has ${lineCount} lines (Limit: 200). Consider refactoring/splitting.`];
            }
            return [];
        }
    }
];

// ==========================================
// ENGINE
// ==========================================

function auditFile(filePath) {
    if (EXEMPTIONS.some(ex => filePath.includes(ex))) return;
    stats.filesChecked++;

    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(SRC_DIR, filePath);

    CHECKS.forEach(rule => {
        const errors = rule.check(content);
        if (errors.length > 0) {
            errors.forEach(err => {
                issues.push({
                    type: rule.id,
                    name: rule.name,
                    file: relativePath,
                    message: err
                });
                stats.issuesFound++;
            });
        }
    });
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['assets', '__tests__', 'services'].includes(file)) walk(fullPath);
        } else if (/\.(jsx|js|tsx)$/.test(file)) {
            auditFile(fullPath);
        }
    });
}

// ==========================================
// MAIN
// ==========================================

console.log('\n\x1b[36m🔍 Starting DEB\'S POS SMART AUDIT v1.0\x1b[0m');
console.log('\x1b[90mScanning codebase for patterns, leaks, and quality issues...\x1b[0m\n');

walk(SRC_DIR);

// Group issues by type
const grouped = issues.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
}, {});

// Print Report
Object.keys(grouped).forEach(type => {
    const group = grouped[type];
    const color = type === 'VISUAL_LEAK' ? '\x1b[31m' : (type === 'DEV_POLLUTION' ? '\x1b[33m' : '\x1b[36m');
    console.log(`${color}[${type}] ${group[0].name}\x1b[0m`);

    group.forEach(item => {
        console.log(`  • ${item.file}: \x1b[90m${item.message}\x1b[0m`);
    });
    console.log('');
});

console.log('\x1b[35m--- AUDIT SUMMARY ---\x1b[0m');
console.log(`Files Scanned: ${stats.filesChecked}`);
console.log(`Issues Found:  ${stats.issuesFound}`);

if (stats.issuesFound === 0) {
    console.log('\n\x1b[32m✅ PRESTINE CODEBASE. No smart issues detected.\x1b[0m');
} else {
    // If only warnings, pass. If critical (Visual Leak), fail?
    // For now, allow CI to pass but warn user.
    console.log(`\n\x1b[33m⚠️  Codebase clean-up recommended.\x1b[0m`);
}
