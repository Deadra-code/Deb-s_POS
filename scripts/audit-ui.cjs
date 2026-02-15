const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const PUBLIC_DIR = path.join(__dirname, '../public');
const ROOT_DIR = path.join(__dirname, '../');

let issues = [];
let features = {
    darkModeFiles: 0,
    touchTargets: 0,
    motion: 0,
    glassmorphism: 0,
    modernRounding: 0,
    haptics: 0,
    pullToRefresh: 0,
    pwa: 0
};
let filesChecked = 0;

function auditFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(SRC_DIR, filePath);

    // Ignore small utility files or icons
    if (content.length < 300 && !filePath.includes('components')) return;

    filesChecked++;

    // 1. Dark Mode Check (Density based)
    const hasColors = /(bg|text|border|ring)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)/.test(content);
    const darkModeClasses = (content.match(/dark:/g) || []).length;

    if (hasColors) {
        if (darkModeClasses < 1 && !filePath.includes('ui/Icon')) {
            issues.push({ type: 'DARK_MODE', file: relativePath, detail: `File has color classes but very few dark: variants (${darkModeClasses}).` });
        } else features.darkModeFiles++;
    }

    // 2. Touch Target Check
    if (content.includes('<button') || content.includes('onClick')) {
        const hasTouchSize = /h-(11|12|14|16|20|24)|p-(3|4|5|6)|py-(3|4|5|6)|p-2\.5|rounded-full|w-11|w-12/.test(content);
        if (!hasTouchSize) {
            if (filePath.includes('components/pos') || filePath.includes('pages/')) {
                issues.push({ type: 'TOUCH_TARGET', file: relativePath, detail: `Buttons/Clickables might be too small for mobile.` });
            }
        } else features.touchTargets++;
    }

    // 3. Modern Rounding Check
    if (content.match(/rounded-(xl|2xl|3xl|full)/)) features.modernRounding++;

    // 4. Glassmorphism & Motion
    if (content.includes('backdrop-blur')) features.glassmorphism++;
    if (content.includes('framer-motion') || content.includes('motion.')) features.motion++;

    // 5. Native Feel Checks (Haptics & Gestures)
    if (content.includes('haptics.')) features.haptics++;
    if (content.includes('PullToRefresh')) features.pullToRefresh++;
}

function checkPWA() {
    try {
        const manifestPath = path.join(PUBLIC_DIR, 'manifest.json');
        const indexHtmlPath = path.join(ROOT_DIR, 'index.html');
        const indexCssPath = path.join(SRC_DIR, 'index.css');

        if (fs.existsSync(manifestPath)) features.pwa++;

        const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
        if (indexHtml.includes('theme-color') && indexHtml.includes('apple-mobile-web-app-capable')) features.pwa++;

        const indexCss = fs.readFileSync(indexCssPath, 'utf8');
        if (indexCss.includes('overscroll-behavior-y: contain') && indexCss.includes('tap-highlight-color: transparent')) features.pwa++;
    } catch (e) {
        // PWA check failed silently
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'assets' && file !== 'services' && file !== '__tests__') walk(fullPath);
        } else if (file.endsWith('.jsx')) {
            auditFile(fullPath);
        }
    });
}

console.log('\x1b[36m🚀 Starting Smart UI/UX God-Tier Audit (v3 - Native Edition)...\x1b[0m\n');

walk(SRC_DIR);
checkPWA();

// Calculate Score
const dmScore = (features.darkModeFiles / filesChecked) * 20;
const touchScore = (features.touchTargets / Math.max(1, features.touchTargets + issues.filter(i => i.type === 'TOUCH_TARGET').length)) * 20;
const motionScore = features.motion > 0 ? 15 : 0;
const stylingScore = (features.modernRounding / filesChecked) * 15;
const nativeScore = (Math.min(features.haptics, 5) * 2) + (features.pullToRefresh > 0 ? 10 : 0) + (features.pwa >= 3 ? 10 : 0);

const finalScore = Math.min(100, dmScore + touchScore + motionScore + stylingScore + nativeScore + 10); // +10 Base

console.log('\x1b[35m--- AUDIT SUMMARY ---\x1b[0m');
console.log(`Files Analyzed: ${filesChecked}`);
console.log(`- Dark Mode Coverage: ${Math.round((features.darkModeFiles / filesChecked) * 100)}%`);
console.log(`- Touch Target Coverage: ${features.touchTargets} components`);
console.log(`- Motion Engine: ${features.motion > 0 ? 'ACTIVE (Framer Motion)' : 'INACTIVE'}`);
console.log(`- Modern Aesthetics: ${features.modernRounding} rounded-xl+`);
console.log(`- Native Feel: ${features.haptics} Haptic pts, ${features.pullToRefresh > 0 ? 'PullToRefresh Active' : 'No Gestures'}, ${features.pwa >= 3 ? 'PWA Ready' : 'Web Only'}`);

if (issues.length > 0) {
    console.log('\n\x1b[33m--- REMAINING POLISH AREAS ---\x1b[0m');
    issues.slice(0, 5).forEach(msg => console.log(`[${msg.type}] \x1b[0m${msg.file}`));
    if (issues.length > 5) console.log(`...and ${issues.length - 5} minor items.`);
}

console.log(`\n\x1b[1mModernity Score: ${finalScore.toFixed(1)}/100\x1b[0m`);

if (finalScore >= 98) {
    console.log('\x1b[32m✅ status: GOD TIER NATIVE (10+/10). Flawless App Experience.\x1b[0m');
} else if (finalScore >= 90) {
    console.log('\x1b[32m✅ status: GOD TIER WEB (9/10). Excellent visual, lacks native feel.\x1b[0m');
} else if (finalScore >= 80) {
    console.log('\x1b[33m⚠️ status: MODERN (8/10). Very good, slight gaps found.\x1b[0m');
} else {
    console.log('\x1b[31m❌ status: NEEDS MODERNIZATION. Below current standards.\x1b[0m');
}
