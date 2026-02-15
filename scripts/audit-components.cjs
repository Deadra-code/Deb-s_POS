const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
let issues = 0;

// Regex rules
const RULES = [
    {
        name: 'Hardcoded Hex Colors',
        regex: /#[0-9A-Fa-f]{3,6}/g,
        message: 'Avoid hardcoded hex colors. Use Tailwind classes instead.'
    },
    {
        name: 'Raw SVG Tags',
        regex: /<svg/g,
        message: 'Avoid raw <svg> tags. Use the <Icon /> component.'
    },
    {
        name: 'Inline Spacing Styles',
        regex: /style=\{\{.*(margin|padding).*:.*\}/g,
        message: 'Avoid inline margin/padding styles. Use Tailwind utility classes.'
    }
];

// Exemptions (files that are allowed to have certain patterns)
const EXEMPTIONS = [
    'Icon.jsx', // Icon component obviously contains SVGs
    'index.css',
    'App.css'
];

function checkFile(filePath) {
    if (EXEMPTIONS.some(ex => filePath.includes(ex))) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(SRC_DIR, filePath);

    RULES.forEach(rule => {
        const matches = content.match(rule.regex);
        if (matches) {
            console.log(`\x1b[33m[WARN]\x1b[0m ${relativePath}: Found ${matches.length} matches for "${rule.name}"`);
            console.log(`       -> ${rule.message}`);
            issues++;
        }
    });
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'assets') walk(fullPath);
        } else if (file.endsWith('.jsx')) {
            checkFile(fullPath);
        }
    });
}

console.log('\x1b[36m--- Design System Audit ---\x1b[0m');
walk(SRC_DIR);

if (issues > 0) {
    console.log(`\n\x1b[33mDesign System Check: Found ${issues} warnings.\x1b[0m`);
    // We don't exit(1) for warnings, just alert.
} else {
    console.log('\n\x1b[32mDesign System check passed!\x1b[0m');
}
