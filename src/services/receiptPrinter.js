/**
 * Receipt Printer Service
 * Supports thermal Bluetooth printers via Web Bluetooth API
 * Fallback: Browser print dialog
 */

const RECEIPT_WIDTH = 48; // 48 characters for 58mm thermal printer

/**
 * Format text for receipt (center, left, right align)
 */
const alignText = (text, width = RECEIPT_WIDTH, align = 'left') => {
    if (!text) text = '';
    text = String(text);
    
    if (align === 'center') {
        const padding = Math.max(0, Math.floor((width - text.length) / 2));
        return ' '.repeat(padding) + text;
    }
    
    if (align === 'right') {
        const padding = Math.max(0, width - text.length);
        return ' '.repeat(padding) + text;
    }
    
    return text.substring(0, width);
};

/**
 * Format line with left and right text
 */
const formatLine = (left, right, width = RECEIPT_WIDTH) => {
    left = String(left || '');
    right = String(right || '');
    
    const rightStart = width - right.length;
    let result = left;
    
    if (right.length > 0) {
        const padding = Math.max(0, rightStart - result.length);
        result += ' '.repeat(padding) + right;
    }
    
    return result.substring(0, width);
};

/**
 * Create divider line
 */
const divider = (char = '-', width = RECEIPT_WIDTH) => char.repeat(width);

/**
 * Generate receipt text from order data
 */
export const generateReceiptText = (order, storeName = "Deb's Kitchen") => {
    const lines = [];
    
    // Header
    lines.push(alignText(storeName, RECEIPT_WIDTH, 'center'));
    lines.push(alignText('================================', RECEIPT_WIDTH, 'center'));
    lines.push('');
    
    // Order info
    lines.push(formatLine('No Order:', order.id || 'ORD-' + Date.now().toString().slice(-6)));
    lines.push(formatLine('Tanggal:', new Date().toLocaleDateString('id-ID')));
    lines.push(formatLine('Jam:', new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })));
    lines.push(formatLine('Kasir:', order.cashier || 'Admin'));
    lines.push('');
    lines.push(divider());
    lines.push('');
    
    // Items header
    lines.push(formatLine('Item', 'Qty', 20));
    lines.push(formatLine('', 'Harga', 28));
    lines.push(divider('-', 20));
    
    // Items
    let subtotal = 0;
    if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
            const itemTotal = (item.harga || 0) * (item.qty || 1);
            subtotal += itemTotal;
            
            // Item name (truncate if too long)
            const name = String(item.nama || 'Item').substring(0, 18);
            lines.push(formatLine(name, `x${item.qty}`, 20));
            
            // Price and total
            const priceStr = `Rp ${(item.harga || 0).toLocaleString('id-ID')}`;
            const totalStr = `Rp ${itemTotal.toLocaleString('id-ID')}`;
            lines.push(formatLine('', formatLine(priceStr, totalStr, 26), 48));
            lines.push('');
        });
    }
    
    lines.push(divider());
    
    // Totals
    lines.push(formatLine('Subtotal', `Rp ${subtotal.toLocaleString('id-ID')}`));
    
    if (order.tax && order.tax > 0) {
        lines.push(formatLine(`Tax (${order.taxRate || 0}%)`, `Rp ${order.tax.toLocaleString('id-ID')}`));
    }
    
    if (order.service && order.service > 0) {
        lines.push(formatLine(`Service (${order.serviceRate || 0}%)`, `Rp ${order.service.toLocaleString('id-ID')}`));
    }
    
    lines.push('');
    lines.push(formatLine('TOTAL', `Rp ${order.total.toLocaleString('id-ID')}`, RECEIPT_WIDTH));
    lines.push(formatLine('', `(${order.paymentMethod || 'Cash'})`));
    lines.push('');
    
    // Footer
    lines.push(divider());
    lines.push(alignText('Terima kasih atas kunjungan Anda!', RECEIPT_WIDTH, 'center'));
    lines.push(alignText('Simpan struk ini sebagai bukti pembayaran', RECEIPT_WIDTH, 'center'));
    lines.push('');
    
    return lines.join('\n');
};

/**
 * Print receipt via Web Bluetooth API (for thermal printers)
 */
export const printReceiptBluetooth = async (receiptText) => {
    // Check Web Bluetooth API support
    if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth API not supported in this browser');
    }
    
    try {
        // Request Bluetooth device
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }] // ESC/POS service
        });
        
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
        
        // Convert text to bytes for ESC/POS printer
        const encoder = new TextEncoder();
        const data = encoder.encode(receiptText);
        
        // Send to printer
        await characteristic.writeValue(data);
        
        // Cut paper
        const cutCommand = new Uint8Array([0x1D, 0x56, 0x00]);
        await characteristic.writeValue(cutCommand);
        
        return { success: true };
    } catch (error) {
        console.error('Bluetooth printing failed:', error);
        throw error;
    }
};

/**
 * Print receipt via browser print dialog (fallback)
 */
export const printReceiptBrowser = (receiptText, orderData = {}) => {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
    }
    
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Receipt - ${orderData.id || 'ORD-' + Date.now().toString().slice(-6)}</title>
    <style>
        @media print {
            body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px;
                margin: 0;
                padding: 10px;
                width: 80mm;
            }
            .receipt { white-space: pre-wrap; }
            @page { margin: 0; size: auto; }
        }
        body { 
            font-family: 'Courier New', monospace; 
            font-size: 12px;
            margin: 20px;
            max-width: 300px;
        }
        .receipt { white-space: pre-wrap; }
        .btn { 
            margin-top: 20px; 
            padding: 10px 20px; 
            cursor: pointer;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
        }
        .btn:hover { background: #059669; }
    </style>
</head>
<body>
    <div class="receipt">${receiptText}</div>
    <button class="btn" onclick="window.print()">🖨️ Print Receipt</button>
    <script>
        // Auto-print on load (optional)
        // window.onload = () => window.print();
    </script>
</body>
</html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    return { success: true, window: printWindow };
};

/**
 * Main print function - tries Bluetooth first, falls back to browser print
 */
export const printReceipt = async (orderData, storeName = "Deb's Kitchen", useBluetooth = false) => {
    const receiptText = generateReceiptText(orderData, storeName);
    
    if (useBluetooth && navigator.bluetooth) {
        try {
            return await printReceiptBluetooth(receiptText);
        } catch (error) {
            console.warn('Bluetooth print failed, falling back to browser print:', error);
        }
    }
    
    // Fallback to browser print
    return printReceiptBrowser(receiptText, orderData);
};

/**
 * Check if printer is available
 */
export const isPrinterAvailable = () => {
    return navigator.bluetooth !== undefined;
};

export default {
    printReceipt,
    printReceiptBluetooth,
    printReceiptBrowser,
    generateReceiptText,
    isPrinterAvailable
};
