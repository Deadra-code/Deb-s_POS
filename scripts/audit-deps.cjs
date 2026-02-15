const { execSync } = require('child_process');

console.log('\x1b[36m--- Dependency Health Audit ---\x1b[0m');

try {
    console.log('Running npm audit...');
    const output = execSync('npm audit', { encoding: 'utf8' });
    console.log(output);
    console.log('\x1b[32mDependency check passed!\x1b[0m');
} catch (error) {
    if (error.stdout) {
        console.log(error.stdout);
        console.log('\n\x1b[33mWarning: Found dependency vulnerabilities.\x1b[0m Please run "npm audit fix".');
    } else {
        console.error('Failed to run npm audit:', error.message);
    }
}
