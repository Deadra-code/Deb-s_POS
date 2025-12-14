import { useState, useEffect } from 'react'
import { Activity, Archive, BarChart2, ChevronRight, LayoutGrid, Loader, LogOut, Minus, Plus, Search, Settings, ShoppingCart, Trash2, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './App.css'

// URL BACKEND GOOGLE APPS SCRIPT ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbzJqpegECiFzW8NkBo3qnvv7OcvoFiLH8HsRnHah1u6M7KkpMSrMwEauHX2L8md9rs9sg/exec";

// --- HELPER FUNCTION UNTUK FETCH DATA ---
const fetchData = async (action, method = 'GET', body = null) => {
  let url = `${API_URL}?action=${action}`;
  const options = {
    method: method,
  };

  if (method === 'POST') {
    // PENTING: Saat POST ke GAS dari luar, gunakan teknik Beacon atau fetch no-cors jika memungkinkan, 
    // tapi untuk data JSON response, kita pakai fetch standard dengan body stringified.
    // Google Apps Script doPost(e) akan menangkap e.postData.contents

    return fetch(url, {
      method: "POST",
      body: JSON.stringify(body)
    }).then(res => res.json());
  }

  return fetch(url).then(res => res.json());
};

function App() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Menunggu Kode...");

  useEffect(() => {
    // Contoh tes koneksi
    setLoading(true);
    fetchData('getMenu')
      .then(data => {
        console.log("Data menu:", data);
        setStatus("Koneksi ke Google Sheets Berhasil!");
      })
      .catch(err => {
        console.error(err);
        setStatus("Gagal terkoneksi: " + err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Deb's POS Pro</h1>
        <p className="text-gray-600 mb-6">Setup Frontend PWA Berhasil.</p>

        <div className={`p-4 rounded-lg mb-4 ${loading ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
          {loading ? "Sedang mengecek koneksi..." : status}
        </div>

        <div className="border-t pt-4 text-left">
          <p className="text-sm font-semibold mb-2">Langkah Selanjutnya (Tahap 4):</p>
          <p className="text-sm text-gray-600">
            Silakan paste seluruh kode React komponen Anda (dari <code>JS-App.html</code> lama) ke dalam file <code>src/App.jsx</code> ini.
            <br /><br />
            Gunakan search & replace:
            <ul className="list-disc ml-4 mt-2">
              <li>Ganti <code>google.script.run...</code> dengan <code>fetchData(...)</code></li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
