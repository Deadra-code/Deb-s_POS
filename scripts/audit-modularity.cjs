const fs = require('fs');
const path = require('path');

const MAX_LINES = 150;
const SRC_DIR = path.join(__dirname, '../src');
let issues = 0;

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'assets' && file !== 'tests') {
                walk(fullPath);
            }
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n').length;
            if (lines > MAX_LINES) {
                console.log(`\x1b[31m[FAIL]\x1b[0m ${path.relative(SRC_DIR, fullPath)}: ${lines} lines (Max: ${MAX_LINES})`);
                issues++;
            } else {
                // console.log(`\x1b[32m[PASS]\x1b[0m ${path.relative(SRC_DIR, fullPath)}: ${lines} lines`);
            }
        }
    });
}

console.log('\x1b[36m--- Modularity Audit ---\x1b[0m');
walk(SRC_DIR);

if (issues > 0) {
    console.log(`\n\x1b[31mFound ${issues} modularity issues.\x1b[0m Please refactor large files.`);
    process.exit(1);
} else {
    console.log('\n\x1b[32mModularity check passed!\x1b[0m');
}
