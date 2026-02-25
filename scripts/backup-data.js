#!/usr/bin/env node

/**
 * Backup Automation Script for Deb's POS v4+
 *
 * Exports IndexedDB data to JSON backup files
 * Usage: node scripts/backup-data.js [export|import|list]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DEFAULT_BACKUP_FILE = path.join(BACKUP_DIR, 'debs-pos-backup.json');

/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        console.log('✓ Created backup directory:', BACKUP_DIR);
    }
}

/**
 * Generate timestamp for backup filename
 */
function getTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

/**
 * Export data from IndexedDB (to be run in browser console)
 * This generates a script that users can paste in browser console
 */
function generateExportScript() {
    const script = `
// Deb's POS v4 - Data Export Script
// Paste this in browser console (F12) on the app page

(async function exportData() {
    const DB_NAME = 'debs-pos-db';
    const DB_VERSION = 1;

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function getAllFromStore(db, storeName) {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    try {
        const db = await openDB();
        const stores = ['products', 'orders', 'settings', 'users'];
        const backup = {
            version: '4.0.0',
            timestamp: new Date().toISOString(),
            data: {}
        };

        for (const store of stores) {
            backup.data[store] = await getAllFromStore(db, store);
            console.log('Exported', backup.data[store].length, 'records from', store);
        }

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'debs-pos-backup-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ Backup exported successfully!');
    } catch (err) {
        console.error('❌ Export failed:', err);
    }
})();
`;

    const scriptPath = path.join(BACKUP_DIR, 'export-in-browser.js');
    fs.writeFileSync(scriptPath, script);
    console.log('✓ Generated browser export script:', scriptPath);
    return scriptPath;
}

/**
 * Validate backup file structure
 */
function validateBackup(backupData) {
    const required = ['version', 'timestamp', 'data'];
    const requiredStores = ['products', 'orders', 'settings', 'users'];

    for (const field of required) {
        if (!backupData[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    for (const store of requiredStores) {
        if (!Array.isArray(backupData.data[store])) {
            throw new Error(`Invalid or missing store: ${store}`);
        }
    }

    return true;
}

/**
 * List existing backups
 */
function listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) {
        console.log('No backup directory found.');
        return [];
    }

    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => {
            const filePath = path.join(BACKUP_DIR, f);
            const stats = fs.statSync(filePath);
            const size = (stats.size / 1024).toFixed(2);
            return { name: f, size: `${size} KB`, date: stats.mtime.toISOString() };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log('\n📦 Available Backups:\n');
    console.log('File'.padEnd(40) + 'Size'.padEnd(12) + 'Created');
    console.log('─'.repeat(70));
    
    files.forEach(f => {
        console.log(f.name.padEnd(40) + f.size.padEnd(12) + f.date.slice(0, 10));
    });

    console.log('');
    return files;
}

/**
 * Clean old backups (keep last N files)
 */
function cleanOldBackups(keepCount = 10) {
    if (!fs.existsSync(BACKUP_DIR)) return 0;

    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => ({
            name: f,
            path: path.join(BACKUP_DIR, f),
            mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs
        }))
        .sort((a, b) => b.mtime - a.mtime);

    let deleted = 0;
    files.slice(keepCount).forEach(file => {
        fs.unlinkSync(file.path);
        deleted++;
        console.log(`  Deleted: ${file.name}`);
    });

    if (deleted > 0) {
        console.log(`✓ Cleaned ${deleted} old backup(s), kept ${Math.min(files.length, keepCount)} recent`);
    }
    return deleted;
}

/**
 * Show import instructions
 */
function showImportInstructions() {
    console.log('\n📥 To import backup data:\n');
    console.log('1. Open Deb\'s POS in your browser');
    console.log('2. Open browser console (F12)');
    console.log('3. Paste the following code:\n');
    console.log(`
// Import backup data
const backupFile = '${DEFAULT_BACKUP_FILE}';
// Use file input in app: Settings > Backup & Restore > Import
// Or paste this in console:
(async function importBackup() {
    const DB_NAME = 'debs-pos-db';
    const backup = ${JSON.stringify({ example: 'paste your backup JSON here' })};
    
    // Use the app's import function via UI
    console.log('Please use Settings > Backup & Restore > Import in the app');
})();
`);
}

/**
 * Main function
 */
function runBackup(command = 'export') {
    console.log('🔄 Deb\'s POS Backup Utility v4.0.0\n');

    ensureBackupDir();

    switch (command) {
        case 'export':
            console.log('📤 Generating export script...\n');
            generateExportScript();
            console.log('\n📋 To create backup:');
            console.log('1. Open Deb\'s POS in browser');
            console.log('2. Open console (F12)');
            console.log('3. Copy-paste content from: backups/export-in-browser.js');
            console.log('4. Press Enter - backup will download automatically');
            break;

        case 'list':
            listBackups();
            break;

        case 'import':
            showImportInstructions();
            break;

        case 'clean':
            console.log('🧹 Cleaning old backups...\n');
            cleanOldBackups(10);
            break;

        default:
            console.log('Usage: node scripts/backup-data.js [export|import|list|clean]');
            console.log('\nCommands:');
            console.log('  export  - Generate browser script to export IndexedDB data');
            console.log('  import  - Show import instructions');
            console.log('  list    - List existing backup files');
            console.log('  clean   - Remove old backups (keep last 10)');
            console.log('\n💡 In the app: Settings > Backup & Restore');
    }

    console.log('');
}

// Run if called directly
if (require.main === module) {
    const command = process.argv[2] || 'export';
    runBackup(command);
}

module.exports = { runBackup, ensureBackupDir, listBackups, cleanOldBackups };
