const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const EXEMPTIONS = ['.test.', '.spec.', 'audit-', 'setupTests.js'];

let stats = { filesChecked: 0, issuesFound: 0 };
let issues = [];

const SECURITY_CHECKS = [
    {
        id: 'HARDCODED_SECRET',
        name: 'Potential Hardcoded Secret',
        check: (content) => {
            const secretPatterns = [
                /(const|let|var)\s+\w*(KEY|TOKEN|SECRET|PASSWORD)\w*\s*=\s*['"`][\w-]{10,}['"`]/gi,
                /['"`](ghp_|AIza|sk-)[a-zA-Z0-9_-]+['"`]/g
            ];
            let failures = [];
            secretPatterns.forEach(pattern => {
                const matches = content.match(pattern) || [];
                matches.forEach(match => failures.push(`Found potential secret: ${match.trim()}`));
            });
            return failures;
        }
    },
    {
        id: 'UNSAFE_HTML',
        name: 'Unsafe HTML Injection',
        check: (content) => {
            if (content.includes('dangerouslySetInnerHTML')) {
                return ['Usage of dangerouslySetInnerHTML detected. Ensure content is sanitized.'];
            }
            return [];
        }
    },
    {
        id: 'UNSAFE_LINK',
        name: 'Unsafe External Link',
        check: (content) => {
            const failures = [];
            const linkMatches = content.match(/<a[^>]+target="_blank"[^>]*>/g) || [];
            linkMatches.forEach(link => {
                if (!link.includes('rel=') || (!link.includes('noopener') && !link.includes('noreferrer'))) {
                    failures.push(`External link missing rel="noopener noreferrer": ${link}`);
                }
            });
            return failures;
        }
    },
    {
        id: 'SENSITIVE_LOGS',
        name: 'Sensitive Debug Logs',
        check: (content) => {
            const failures = [];
            if (content.includes('console.log(') && !content.includes('//')) {
                failures.push('Found console.log(). Cleanup debug logs before production.');
            }
            if (content.includes('alert(') && !content.includes('Toast')) {
                failures.push('Found alert() call. Use professional Toast notifications instead.');
            }
            return failures;
        }
    }
];

function auditFile(filePath) {
    if (EXEMPTIONS.some(ex => filePath.includes(ex))) return;
    stats.filesChecked++;
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(SRC_DIR, filePath);

    SECURITY_CHECKS.forEach(rule => {
        const errors = rule.check(content);
        errors.forEach(err => {
            issues.push({ type: rule.id, name: rule.name, file: relativePath, message: err });
            stats.issuesFound++;
        });
    });
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.git', 'dist'].includes(file)) walk(fullPath);
        } else if (/\.(jsx|js|tsx|ts)$/.test(file)) {
            auditFile(fullPath);
        }
    });
}

console.log('\x1b[31m🛡️  DEB\'S POS SECURITY AUDIT v1.0\x1b[0m');
walk(SRC_DIR);

const grouped = issues.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
}, {});

Object.keys(grouped).forEach(type => {
    const group = grouped[type];
    console.log(`\x1b[1m\x1b[31m[${type}]\x1b[0m \x1b[31m${group[0].name}\x1b[0m`);
    group.forEach(item => console.log(`  • ${item.file}: \x1b[90m${item.message}\x1b[0m`));
    console.log('');
});

console.log(`\x1b[31mSecurity Audit Summary: Found ${stats.issuesFound} potential vulnerabilities in ${stats.filesChecked} files.\x1b[0m`);
if (stats.issuesFound > 0) process.exit(1);
