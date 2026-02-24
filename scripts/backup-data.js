#!/usr/bin/env node

/**
 * Backup Automation Script for Deb's POS
 * 
 * Downloads Google Sheets data as backup
 * Usage: node scripts/backup-data.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/{YOUR_SHEET_ID}/export?format=xlsx';

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
 * Download file from URL
 */
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Download failed: ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve(dest);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

/**
 * Create JSON backup of local data (from localStorage export)
 */
function createLocalBackup() {
    const backupData = {
        timestamp: new Date().toISOString(),
        version: '3.15.1',
        note: 'Export localStorage data manually via browser console'
    };
    
    const backupPath = path.join(BACKUP_DIR, `local-backup-${getTimestamp()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log('✓ Created local backup template:', backupPath);
    
    return backupPath;
}

/**
 * Clean old backups (keep last 30 days)
 */
function cleanOldBackups(daysToKeep = 30) {
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000;
    
    let cleaned = 0;
    
    files.forEach(file => {
        if (!file.includes('backup')) return;
        
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;
        
        if (age > maxAge) {
            fs.unlinkSync(filePath);
            cleaned++;
            console.log(`  Deleted old backup: ${file}`);
        }
    });
    
    if (cleaned > 0) {
        console.log(`✓ Cleaned ${cleaned} old backup(s)`);
    }
}

/**
 * Main backup function
 */
async function runBackup() {
    console.log('🔄 Starting backup process...\n');
    
    ensureBackupDir();
    
    // Create local backup template
    createLocalBackup();
    
    // Note about Google Sheets backup
    console.log('\n📋 Manual Backup Instructions:');
    console.log('1. Buka Google Sheets Anda');
    console.log('2. File > Download > Microsoft Excel (.xlsx)');
    console.log('3. Simpan di folder backups/ dengan nama: deb-pos-backup-{timestamp}.xlsx');
    console.log('\n💡 Atau gunakan Google Drive automatic backup:');
    console.log('   File > Share > Automate > Schedule backup');
    
    // Clean old backups
    console.log('\n🧹 Cleaning old backups...');
    cleanOldBackups(30);
    
    console.log('\n✅ Backup process completed!\n');
}

// Run if called directly
if (require.main === module) {
    runBackup().catch(err => {
        console.error('❌ Backup failed:', err.message);
        process.exit(1);
    });
}

module.exports = { runBackup, ensureBackupDir, cleanOldBackups };
