const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.resolve(__dirname, '../.env');

async function sync() {
    try {
        console.log('🔍 Mengambil daftar deployment dari clasp...');
        // Gunakan cmd /c untuk menghindari masalah execution policy di Windows
        const output = execSync('cmd /c "npx clasp deployments"', { encoding: 'utf8' });

        // Output clasp deployments biasanya:
        // - <ID> @<VER> - <DESC>
        const lines = output.split('\n').filter(line => line.trim().startsWith('- '));

        if (lines.length === 0) {
            console.error('❌ Tidak ada deployment yang ditemukan.');
            return;
        }

        // Ambil ID dari baris pertama (terbaru)
        const match = lines[0].match(/- ([A-Za-z0-9_-]+)/);
        if (!match) {
            console.error('❌ Tidak dapat memparsing ID deployment.');
            return;
        }

        const deploymentId = match[1];
        const newUrl = `https://script.google.com/macros/s/${deploymentId}/exec`;

        console.log(`✅ ID Deployment Ditemukan: ${deploymentId}`);

        if (!fs.existsSync(ENV_PATH)) {
            fs.writeFileSync(ENV_PATH, `VITE_API_URL=${newUrl}\n`);
        } else {
            let content = fs.readFileSync(ENV_PATH, 'utf8');
            if (content.match(/VITE_API_URL=/)) {
                content = content.replace(/VITE_API_URL=.*/, `VITE_API_URL=${newUrl}`);
            } else {
                content += `\nVITE_API_URL=${newUrl}\n`;
            }
            fs.writeFileSync(ENV_PATH, content);
        }

        console.log(`🚀 .env telah diperbarui ke: ${newUrl}`);
        console.log('Siap untuk dideploy!');

    } catch (error) {
        console.error('❌ Gagal sinkronisasi URL API:', error.message);
        console.log('\nTips: Pastikan Anda sudah login clasp (npx clasp login) dan berada di folder project.');
    }
}

sync();
