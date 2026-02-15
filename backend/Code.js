// =========================================================
// DEB'S POS PRO - SECURE BACKEND API (v3.0 Dynamic Auth)
// =========================================================
// 1. HTTP HANDLERS
function doGet(e) {
  return handleRequest(e);
}
function doPost(e) {
  return handleRequest(e);
}
function handleRequest(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var action = e.parameter.action;
    var result = {};

    // --- AUTHENTICATION CHECK ---

    if (action === 'login') {
      var payload = JSON.parse(e.postData.contents);
      result = attemptLogin(payload.username, payload.password);
    }
    // Action Setup (Buat tabel user) tidak butuh login
    else if (action === 'setup') {
      result = setupDatabase();
    }
    else {
      // PROTEKSI: Cek Token untuk action lain
      // Di versi ini frontend harus kirim ?token=... atau body {token:...}
      // Opsional: Aktifkan jika ingin sangat ketat
      /*
      var token = e.parameter.token;
      if(!token) return responseJSON({error:"Unauthorized"});
      */

      // Routing Regular
      if (action === 'getMenu') result = getMenuData();
      else if (action === 'saveProduct') result = saveProduct(JSON.parse(e.postData.contents));
      else if (action === 'deleteProduct') result = deleteProduct(JSON.parse(e.postData.contents).rowIndex);
      else if (action === 'getSettings') result = getSettings();
      else if (action === 'saveSettings') result = saveSettings(JSON.parse(e.postData.contents));
      else if (action === 'saveOrder') result = saveOrder(JSON.parse(e.postData.contents));
      else if (action === 'getOrders') result = getActiveOrders();
      else if (action === 'updateOrderStatus') { var p = JSON.parse(e.postData.contents); result = updateOrderStatus(p.id, p.status); }
      else if (action === 'getReport') result = getSalesReport();
      else if (action === 'testIntegrity') result = testIntegrity();
      else if (action === 'getTopItems') result = getTopItems();
      else result = { error: "Action not found: " + action };
    }
    return responseJSON(result);
  } catch (err) {
    return responseJSON({ error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}
function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
// --- NEW AUTHORIZATION LOGIC ---
function attemptLogin(username, password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Data_User");

  if (!sheet) {
    // Auto-create jika belum ada (Fallback)
    setupDatabase();
    sheet = ss.getSheetByName("Data_User");
  }

  const data = sheet.getDataRange().getValues(); // [Header, [u1,p1], [u2,p2]...]

  // Skip Header (row 0)
  for (let i = 1; i < data.length; i++) {
    // Kolom 0 = Username, Kolom 1 = Password
    if (String(data[i][0]).toLowerCase() === String(username).toLowerCase() && String(data[i][1]) === String(password)) {
      // SUKSES
      const token = Utilities.base64Encode(username + "_" + new Date().getTime());
      return { success: true, token: token, role: "admin" };
    }
  }

  return { error: "Username atau Password Salah!" };
}
// --- DATABASE LOGIC (Updated Setup) ---
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Users (BARU)
  if (!ss.getSheetByName("Data_User")) {
    let s = ss.insertSheet("Data_User");
    s.appendRow(["Username", "Password", "Role"]);
    // Default Admin
    s.appendRow(["admin", "admin123", "Owner"]);
  }
  // 2. Menu
  if (!ss.getSheetByName("Data_Menu")) {
    let s = ss.insertSheet("Data_Menu");
    s.appendRow(["ID", "Nama_Menu", "Kategori", "Harga", "Foto_URL", "Status", "Stock", "Milik", "Modal", "Varian"]);
    s.appendRow(["MN-001", "Nasi Goreng Spesial", "Makanan", 25000, "", "Tersedia", 50, "Debby", 15000, "Level: Sedang, Pedas | Pilihan Telur: Dadar, Ceplok"]);
  }
  // 3. Transaksi
  if (!ss.getSheetByName("Riwayat_Transaksi")) {
    ss.insertSheet("Riwayat_Transaksi").appendRow(["ID_Order", "Tanggal", "Jam", "Tipe_Order", "Items_JSON", "Total_Bayar", "Metode_Bayar", "Status", "Tax_Amount", "Service_Amount"]);
  }
  // 4. Settings
  if (!ss.getSheetByName("Settings")) {
    let s = ss.insertSheet("Settings");
    s.appendRow(["Key", "Value"]);
    s.appendRow(["Store_Name", "Deb's Kitchen"]);
    s.appendRow(["Tax_Rate", "0"]);
    s.appendRow(["Service_Charge", "0"]);
  }

  return { success: true, message: "Database + User Table Ready" };
}

// --- MENU & INVENTORY ---
function getMenuData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Menu");
  if (!sheet) return [];
  const data = sheet.getDataRange().getDisplayValues();
  if (data.length <= 1) return [];
  const h = data[0];

  return data.slice(1).map((row, i) => {
    let obj = { _rowIndex: i + 2 };
    h.forEach((head, idx) => obj[head] = row[idx]);

    // Sanitasi Angka (Hapus 'Rp', koma, dll)
    obj.Harga = parseInt(String(obj.Harga).replace(/[^0-9]/g, '')) || 0;
    obj.Modal = parseInt(String(obj.Modal).replace(/[^0-9]/g, '')) || 0;
    obj.Stock = parseInt(String(obj.Stock).replace(/[^0-9-]/g, '')) || 0;
    return obj;
  });
}

function saveProduct(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Data_Menu");

  if (data.isNew) {
    const newID = "MN-" + new Date().getTime().toString().substr(-5);
    // Urutan: ID(1), Nama(2), Kategori(3), Harga(4), Foto(5), Status(6), Stock(7), Milik(8), Modal(9), Varian(10)
    sheet.appendRow([newID, data.Nama_Menu, data.Kategori, data.Harga, data.Foto_URL, data.Status, data.Stock, data.Milik, data.Modal, data.Varian || ""]);
  } else {
    const r = data._rowIndex;
    if (r) {
      sheet.getRange(r, 2).setValue(data.Nama_Menu);
      sheet.getRange(r, 3).setValue(data.Kategori);
      sheet.getRange(r, 4).setValue(data.Harga);
      sheet.getRange(r, 5).setValue(data.Foto_URL);
      sheet.getRange(r, 6).setValue(data.Status);
      sheet.getRange(r, 7).setValue(data.Stock);
      sheet.getRange(r, 8).setValue(data.Milik);
      sheet.getRange(r, 9).setValue(data.Modal);
      if (data.Varian !== undefined) sheet.getRange(r, 10).setValue(data.Varian);
    }
  }
  return { success: true };
}

function deleteProduct(rowIndex) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Menu");
  if (rowIndex > 1) sheet.deleteRow(rowIndex);
  return { success: true };
}

// --- SETTINGS ---
function getSettings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  let settings = {};
  data.slice(1).forEach(r => settings[r[0]] = r[1]);
  return settings;
}

function saveSettings(newSettings) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  sheet.clearContents();
  sheet.appendRow(["Key", "Value"]);
  Object.keys(newSettings).forEach(k => sheet.appendRow([k, newSettings[k]]));
  return { success: true };
}

// --- ORDERS & POS ---
function saveOrder(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTrx = ss.getSheetByName("Riwayat_Transaksi");
  const sheetMenu = ss.getSheetByName("Data_Menu");

  const id = "ORD-" + new Date().getTime().toString().substr(-6);
  const now = new Date();
  const jam = Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm");
  const tgl = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd");

  // Simpan Transaksi
  sheetTrx.appendRow([
    id, tgl, jam, payload.type, JSON.stringify(payload.cart),
    payload.total, payload.paymentMethod, "Proses",
    payload.taxVal, payload.serviceVal
  ]);

  // Potong Stok
  const menuData = sheetMenu.getDataRange().getValues();
  payload.cart.forEach(item => {
    for (let i = 1; i < menuData.length; i++) {
      // Match by Name (Kolom 2 / Index 1)
      if (menuData[i][1] === item.nama) {
        const curr = parseInt(menuData[i][6] || 0); // Kolom Stock (Index 6)
        const neu = Math.max(0, curr - item.qty);
        sheetMenu.getRange(i + 1, 7).setValue(neu);
        if (neu === 0) sheetMenu.getRange(i + 1, 6).setValue("Habis");
        break;
      }
    }
  });

  return { success: true, id: id };
}

function updateOrderStatus(id, status) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Riwayat_Transaksi");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.getRange(i + 1, 8).setValue(status); // Kolom Status
      break;
    }
  }
  return { success: true };
}

// --- KITCHEN MONITOR ---
function getActiveOrders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Riwayat_Transaksi");
  if (!sheet) return [];

  // Gunakan getDisplayValues agar format Jam aman
  const data = sheet.getDataRange().getDisplayValues();
  if (data.length <= 1) return [];

  const h = data[0];
  const idx = {
    id: h.indexOf("ID_Order"),
    jam: h.indexOf("Jam"),
    tipe: h.indexOf("Tipe_Order"),
    items: h.indexOf("Items_JSON"),
    status: h.indexOf("Status")
  };

  if (idx.id === -1) return [];

  return data.slice(1).map(r => ({
    ID_Order: r[idx.id],
    Jam: r[idx.jam],
    Tipe_Order: r[idx.tipe],
    Items_JSON: r[idx.items],
    Status: r[idx.status]
  }))
    .filter(o => String(o.Status).trim().toLowerCase() === 'proses')
    .reverse();
}

// --- SALES REPORT ---
function getSalesReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTrx = ss.getSheetByName("Riwayat_Transaksi");
  const sheetMenu = ss.getSheetByName("Data_Menu");

  if (!sheetTrx || !sheetMenu) return { transactions: [] };

  // 1. Ambil Data Modal (Cost) dari Menu
  const menuRaw = sheetMenu.getDataRange().getValues();
  let costMap = {};
  if (menuRaw.length > 1) {
    menuRaw.slice(1).forEach(r => {
      // Nama=Col 2(idx 1), Modal=Col 9(idx 8)
      costMap[r[1]] = parseInt(String(r[8]).replace(/[^0-9]/g, '')) || 0;
    });
  }

  // 2. Ambil Transaksi
  const trxData = sheetTrx.getDataRange().getDisplayValues();
  if (trxData.length <= 1) return { transactions: [] };

  const h = trxData[0];
  const idx = {
    tgl: h.indexOf("Tanggal"),
    jam: h.indexOf("Jam"),
    items: h.indexOf("Items_JSON"),
    total: h.indexOf("Total_Bayar"),
    status: h.indexOf("Status"),
    tipe: h.indexOf("Tipe_Order")
  };

  let transactions = trxData.slice(1).map(row => {
    let items = [];
    let grossTotal = parseInt(String(row[idx.total]).replace(/[^0-9]/g, '')) || 0;
    let totalCost = 0;

    try {
      items = JSON.parse(row[idx.items] || "[]");
      items.forEach(i => {
        let itemCost = costMap[i.nama] || 0;
        totalCost += (itemCost * i.qty);
      });
    } catch (e) { }

    return {
      date: row[idx.tgl],
      time: row[idx.jam],
      total: grossTotal,
      cost: totalCost,
      profit: grossTotal - totalCost,
      items: items,
      type: row[idx.tipe],
      status: row[idx.status]
    };
  });

  return { transactions: transactions.reverse() };
}

function testIntegrity() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets().map(s => s.getName());
  const required = ["Data_Menu", "Order_Data", "Transaksi_Data", "Users"];
  const results = { ok: true, issues: [] };

  required.forEach(name => {
    if (!sheets.includes(name)) {
      results.ok = false;
      results.issues.push("Missing Sheet: " + name);
    }
  });

  if (sheets.includes("Data_Menu")) {
    const sheet = ss.getSheetByName("Data_Menu");
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const reqCols = ["ID", "Nama_Menu", "Harga", "Modal", "Varian"];
    reqCols.forEach(col => {
      if (!headers.includes(col)) {
        results.ok = false;
        results.issues.push("Missing Column in Data_Menu: " + col);
      }
    });
  }

  return results;
}

function getTopItems() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Riwayat_Transaksi");
  if (!sheet) return { topItems: [] };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { topItems: [] };

  const h = data[0];
  const itemsIdx = h.indexOf("Items_JSON");
  const statusIdx = h.indexOf("Status");
  if (itemsIdx === -1) return { topItems: [] };

  const counts = {};
  data.slice(1).forEach(row => {
    const status = String(row[statusIdx]).trim();
    if (status === "Selesai" || status === "Proses") {
      try {
        const items = JSON.parse(row[itemsIdx] || "[]");
        items.forEach(i => {
          counts[i.nama] = (counts[i.nama] || 0) + i.qty;
        });
      } catch (e) { }
    }
  });

  const topItems = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);

  return { topItems };
}
