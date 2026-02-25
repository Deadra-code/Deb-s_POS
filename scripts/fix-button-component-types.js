#!/usr/bin/env node
/**
 * Batch fix: Add type="button" to Button components (capital B)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, '..', 'src');

function getAllFiles(dir, ext) {
    let files = [];
    try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            if (item === 'node_modules' || item === 'dist' || item.startsWith('.')) continue;
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                files = files.concat(getAllFiles(fullPath, ext));
            } else if (item.endsWith(ext)) {
                files.push(fullPath);
            }
        }
    } catch { /* ignore */ }
    return files;
}

const files = getAllFiles(SRC_DIR, '.jsx');
let fixedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    // Fix Button components (capital B) without type
    // Pattern: <Button followed by props but no type=
    content = content.replace(
        /<Button(?![^>]*\btype\s*=)([^>]*onClick=[^>]*)>/g,
        '<Button type="button"$1>'
    );
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        fixedCount++;
        console.log(`✓ Fixed: ${path.relative(SRC_DIR, file)}`);
    }
});

console.log(`\n✅ Fixed ${fixedCount} files with missing Button type attributes`);
