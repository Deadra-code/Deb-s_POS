const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SRC_DIR = path.join(ROOT_DIR, 'src');

let stats = { filesChecked: 0, heavyAssets: 0, issuesFound: 0 };
let issues = [];

const MAX_ASSET_SIZE = 500 * 1024; // 500KB

// Check Assets
function checkAssets(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            checkAssets(fullPath);
        } else if (/\.(png|jpg|jpeg|gif|svg|webp)$/.test(file)) {
            stats.filesChecked++;
            if (stat.size > MAX_ASSET_SIZE) {
                issues.push({
                    type: 'HEAVY_ASSET',
                    file: path.relative(ROOT_DIR, fullPath),
                    message: `Asset is too heavy (${(stat.size / 1024).toFixed(2)}KB). Optimization required (Limit: 500KB).`
                });
                stats.heavyAssets++;
                stats.issuesFound++;
            }
        }
    });
}

// Check Code
function checkCode(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.git', 'dist', 'scripts'].includes(file)) checkCode(fullPath);
        } else if (/\.(jsx|js|tsx|ts)$/.test(file)) {
            stats.filesChecked++;
            const content = fs.readFileSync(fullPath, 'utf8');

            // Check for unoptimized heavy imports
            if (content.includes("from 'lodash'") || content.includes("from 'moment'")) {
                issues.push({
                    type: 'UNOPTIMIZED_IMPORT',
                    file: path.relative(ROOT_DIR, fullPath),
                    message: `Direct import of heavy library detected. Use cherry-picking or lighter alternatives.`
                });
                stats.issuesFound++;
            }

            // Simple heuristic for re-renders
            const lineCount = content.split('\n').length;
            if (lineCount > 300 && !content.includes('useMemo') && !content.includes('useCallback')) {
                issues.push({
                    type: 'PERF_RISK',
                    file: path.relative(ROOT_DIR, fullPath),
                    message: `Large component without memoization detected. Risk of performance degradation.`
                });
                stats.issuesFound++;
            }
        }
    });
}

console.log('\x1b[32m⚡ DEB\'S POS PERFORMANCE AUDIT v1.0\x1b[0m');
checkAssets(PUBLIC_DIR);
checkAssets(SRC_DIR);
checkCode(SRC_DIR);

const grouped = issues.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
}, {});

Object.keys(grouped).forEach(type => {
    console.log(`\x1b[1m\x1b[32m[${type}]\x1b[0m`);
    grouped[type].forEach(item => console.log(`  • ${item.file}: \x1b[90m${item.message}\x1b[0m`));
    console.log('');
});

console.log(`\x1b[32mPerformance Audit Summary: Found ${stats.issuesFound} issues in ${stats.filesChecked} files/assets.\x1b[0m`);
if (stats.issuesFound > 10) process.exit(1); // Fail only if significantly bad
