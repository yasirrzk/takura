# PT Takura Manufacturing & Warehouse Monitoring System

Aplikasi Web Monitoring Siklus Produksi dan Pergudangan Manufaktur terintegrasi yang dirancang khusus sebagai sistem solusi untuk **PT Takura**. Aplikasi ini mengotomatisasi dan menghubungkan seluruh alur manufaktur dari hulu ke hilir, mulai dari pengelolaan bahan baku, perencanaan produksi (PPIC), eksekusi produksi & *Quality Control* (QC), hingga gudang barang jadi dan pengiriman ke pelanggan dalam satu panel kendali terpusat (**Single-Role Admin**).

---

## 🚀 Fitur Utama (Alur Sistem Terintegrasi)

Sistem ini melacak pergerakan material dan produk secara *real-time* melalui 4 modul utama yang saling terhubung:

1. **Gudang Bahan Baku (Raw Material)**
   * Manajemen inventaris stok bahan baku secara *real-time*.
   * Pencatatan log material masuk dari supplier dan material keluar.
2. **PPIC Planning (Perencanaan Produksi)**
   * Pembuatan rencana jadwal produksi (*Production Plan*).
   * Fitur kalkulasi otomatis kebutuhan bahan baku berdasarkan target kuantitas produk yang dipilih.
   * Validasi otomatis ketersediaan stok bahan baku sebelum rencana produksi disetujui (`Scheduled`).
3. **Eksekusi Produksi & Quality Control (QA/QC)**
   * *Monitoring* status kerja produksi yang sedang berjalan (`In Progress`).
   * Form input hasil inspeksi kualitas setelah produksi selesai.
   * Pemisahan otomatis output produksi menjadi produk **OK** (Lolos QC) dan produk **NG** (*Not Good*/Reject) beserta catatan jenis defect-nya.
   * **Trigger Sistem:** Input produk **OK** secara otomatis akan memotong stok bahan baku terkait dan langsung menambah kuantitas stok di Gudang Barang Jadi.
4. **Gudang Barang Jadi & Shipping (Finished Goods)**
   * Pemantauan stok produk jadi yang siap didistribusikan.
   * Formulir pencatatan pengiriman barang ke customer (mengurangi stok barang jadi secara otomatis berdasarkan nomor surat jalan).

---

## 💻 Tech Stack

### Front-End (Client)
* **Core Framework:** React.js (Vite)
* **Styling & UI:** Tailwind CSS
* **Routing:** React Router v6
* **Server State Management:** TanStack Query v5 (React Query) & Axios
* **Client State Management:** Zustand (Auth session & global UI state)
* **Data Visualization:** Recharts (Grafik monitoring real-time pada Dashboard)
