const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const COLORS = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
};

function log(color, msg) {
    console.log(`${color}${msg}${COLORS.reset}`);
}

function run(command, errorMsg) {
    try {
        return execSync(command, { stdio: 'inherit', encoding: 'utf-8' });
    } catch (e) {
        if (errorMsg) log(COLORS.red, `❌ ${errorMsg}`);
        throw e;
    }
}

function runSilent(command) {
    try {
        return execSync(command, { stdio: 'pipe', encoding: 'utf-8' }).trim();
    } catch (e) {
        return null;
    }
}

async function main() {
    log(COLORS.cyan, "🚀 Starting Smart Deployment...");

    // ==========================================
    // 1. BACKEND DEPLOYMENT (Google Apps Script)
    // ==========================================
    log(COLORS.yellow, "\n📦 [Back-end] Checking Google Apps Script status...");

    // Check if logged in (Smart Check)
    const homeDir = os.homedir();
    const clasprcPath = path.join(homeDir, '.clasprc.json');
    const isLoggedFile = fs.existsSync(clasprcPath);

    // Fallback: Check process.env.USERPROFILE for Windows if homedir misses
    const userProfileClasprc = process.env.USERPROFILE ? path.join(process.env.USERPROFILE, '.clasprc.json') : null;
    const isLoggedFileWindows = userProfileClasprc && fs.existsSync(userProfileClasprc);

    if (isLoggedFile || isLoggedFileWindows) {
        log(COLORS.green, "✅ Clasp credentials found (.clasprc.json).");
        try {
            log(COLORS.cyan, "   Pushing backend code...");
            run('npx clasp push -f', "Failed to push backend code.");
            log(COLORS.green, "✅ Backend deployed successfully!");
        } catch (e) {
            log(COLORS.red, "⚠️ Backend deployment failed. You might need to re-login if credentials are expired.");
            log(COLORS.yellow, "   Run 'npm run clasp:login' to refresh credentials.");
        }
    } else {
        log(COLORS.red, "🛑 [Back-end] Clasp credentials not found.");
        log(COLORS.yellow, `   Checked: ${clasprcPath}`);
        log(COLORS.yellow, "   👉 Action Required: Run 'npm run clasp:login' in your terminal to authenticate with Google.");
        log(COLORS.yellow, "   Skipping backend deployment for now...");
    }

    // ==========================================
    // 2. FRONTEND DEPLOYMENT (GitHub Pages)
    // ==========================================
    log(COLORS.yellow, "\n✨ [Front-end] preparing for GitHub Pages deployment...");

    try {
        // Build
        log(COLORS.cyan, "   Building project...");
        run('npm run build', "Build failed.");

        // Get Remote URL
        const remoteUrl = runSilent('git remote get-url origin');
        if (!remoteUrl) {
            throw new Error("Could not find git remote 'origin'. Is this a git repo?");
        }

        // Deploy from dist folder
        const distDir = path.resolve(__dirname, '../dist');
        if (!fs.existsSync(distDir)) {
            throw new Error("Dist folder not found after build!");
        }

        // Create .nojekyll to bypass Jekyll processing (Crucial for Vite/Single Page Apps)
        fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
        log(COLORS.cyan, "   Created .nojekyll file.");

        log(COLORS.cyan, `   Deploying to ${remoteUrl} (gh-pages)...`);

        // Navigate to dist, init git, add, commit, force push
        // We use a temporary git repo in dist to strictly deploy that folder
        process.chdir(distDir);

        runSilent('git init');
        runSilent('git checkout -b gh-pages');
        runSilent('git add -A');
        runSilent('git commit -m "Smart Deploy: ' + new Date().toISOString() + '"');

        log(COLORS.cyan, "   Pushing to GitHub Pages...");
        run(`git push -f ${remoteUrl} gh-pages`, "Failed to push to GitHub Pages.");

        log(COLORS.green, "✅ Frontend deployed successfully!");

        // Cleanup .git in dist (optional, but good practice if checking locally)
        // fs.rmSync(path.join(distDir, '.git'), { recursive: true, force: true });

    } catch (e) {
        log(COLORS.red, `❌ Frontend deployment failed: ${e.message}`);
    }

    log(COLORS.bright, "\n🎉 Smart Deployment Sequence Completed.");
}

main();
