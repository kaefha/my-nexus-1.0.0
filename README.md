# 🏢 MAI NIMS (Nexus Inventory Management System)

MAI NIMS (Nexus Inventory Management System) adalah aplikasi *enterprise-grade* berbasis web yang dirancang khusus untuk mengelola kompleksitas operasi gudang, inventaris, pengadaan barang, hingga logistik secara *real-time*.

Aplikasi ini dibangun menggunakan arsitektur modern untuk memastikan performa tinggi, keamanan yang solid, serta pengalaman pengguna (UX) yang sangat responsif layaknya aplikasi *desktop* asli.

---

## 🌟 Core Modules & Detailed Features

Aplikasi ini terbagi menjadi beberapa modul utama, baik yang bersifat transaksional maupun non-transaksional:

### 1. 📊 Dashboard & Analytics
- **Real-Time Overview**: Pantauan metrik utama secara langsung.
- **Recent RFC Activity**: Melacak permintaan konsumsi material (Request for Consumption) terbaru beserta status *approval*.
- **Low Stock Alerts**: Peringatan otomatis untuk material yang jumlahnya menipis di gudang tertentu.

### 2. 📦 Inventory & Warehouse Operations
- **Goods Receipt (Penerimaan Barang)**: Modul untuk mencatat barang yang masuk ke gudang, terhubung langsung dengan *Purchase Order*.
- **Material Issue (Pengeluaran Barang)**: Proses pengeluaran barang dari gudang berdasarkan persetujuan RFC.
- **Stock Monitoring**: Dasbor pemantauan stok per gudang dengan indikator kapasitas (CBM) dan status aktif.
- **Material Transfer**: Pemindahan material antar gudang secara sistematis.

### 3. 📝 RFC (Request for Consumption) & Project Management
- **End-to-End RFC Workflow**: Pembuatan, pengajuan, hingga persetujuan permintaan material oleh berbagai tingkatan manajemen (misal: Finance, Project Manager).
- **Document Generation**: Pencetakan otomatis form pengajuan RFC dalam format standar (A4) untuk keperluan tanda tangan basah dan arsip fisik.
- **Project Kanban**: Manajemen proyek dengan tampilan *board* untuk memantau status setiap fase proyek.
- **Project Requirements**: Perincian kebutuhan material untuk setiap proyek yang sedang berjalan.

### 4. 🛒 Procurement (Pengadaan)
- **Vendor Management**: Pengelolaan data pemasok/vendor.
- **Purchase Orders (PO)**: Pembuatan dan pelacakan status pesanan pembelian. Terintegrasi dengan penerimaan barang (*Goods Receipt*).
- **Delivery Order (DO) Generation**: Pencetakan surat jalan / Delivery Order secara otomatis (lengkap dengan data driver, nomor kendaraan, dan tujuan pengiriman) untuk mempercepat proses logistik.

### 5. 🚚 Logistics
- **Shipment Tracking**: Pemantauan pengiriman barang secara *real-time* menggunakan peta interaktif (*Map Tracking*).
- **Fleet & Route Management**: Mengatur rute dan armada logistik yang terhubung dengan *Purchase Order*.

### 6. ⚙️ Master Data Management
Pusat pengaturan data statis yang menjadi fondasi seluruh transaksi aplikasi:
- **Materials**: Katalog lengkap material beserta kode, kategori, dan spesifikasinya.
- **Warehouses**: Data gudang, lokasi, dan kapasitas.
- **Vendors**: Data mitra penyedia barang.
- **Users**: Manajemen hak akses (Role-Based Access Control) pengguna sistem.

### 7. 🔐 Security & Workflow Automation
- **Role-Based Access Control (RBAC)**: Pembatasan akses berdasarkan profil pengguna (misal: *Finance* hanya bisa *approve* pada tahap akhir).
- **Admin Override / Bypass**: Akun *Admin* dan *Super Admin* memiliki akses istimewa untuk mengawasi dan mengambil alih (*bypass*) semua alur persetujuan darurat di dalam sistem.
- **Notification Badges**: Indikator notifikasi *real-time* di *sidebar* untuk mengingatkan pengguna akan dokumen yang memerlukan persetujuan (*Pending Approvals*) atau barang yang harus segera diterima.

---

## 🛠️ Technology Stack & Architecture

Aplikasi ini dibangun menggunakan kombinasi teknologi terbaik di kelasnya:

### Frontend (Client-Side)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router) - *React framework* mutakhir.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - *Utility-first CSS framework* untuk desain yang sangat kustom.
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - Komponen UI yang elegan dan dapat diakses (aksesibilitas tinggi).
- **Icons**: [Lucide React](https://lucide.dev/) - Kumpulan ikon *open-source* yang konsisten.
- **Charts**: [Recharts](https://recharts.org/) - Visualisasi data dan grafik analitik.
- **Maps**: Terintegrasi dengan Leaflet/React-Leaflet untuk pelacakan logistik.

### Language & Tooling
- **Language**: [TypeScript](https://www.typescriptlang.org/) - *Type-safe JavaScript* untuk mencegah *bug* skala besar.
- **Package Manager**: NPM / PNPM.

### UI/UX Design Philosophy
- **Responsive App-like UI**: Dirancang secara khusus untuk terasa seperti aplikasi *desktop*. Halaman luar (Sidebar & Header) bersifat *fixed/sticky*, mengunci pergerakan *browser* secara global untuk mencegah efek *bouncing* atau *overscroll*, sementara hanya konten tabel yang dapat digulir.
- **Fluid Tables**: Tabel data dikonfigurasi secara pintar untuk merentang secara dinamis (*whitespace-nowrap*) dan hanya akan memunculkan *horizontal scroll* jika ukuran layar benar-benar sempit atau di-*zoom*.

---

## 📂 Project Structure

```text
mai-nims/
├── src/
│   ├── app/                # Next.js App Router (Pages, API Routes, Layouts)
│   │   ├── (auth)/         # Halaman otentikasi (Login)
│   │   ├── (dashboard)/    # Halaman utama aplikasi (Dilindungi autentikasi)
│   │   └── api/            # Backend API endpoints
│   ├── components/         # Komponen Reusable (UI, Layout, Map)
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Konfigurasi Database, Utils, API Clients
│   └── types/              # Deklarasi antarmuka TypeScript (Interfaces)
├── public/                 # Aset statis (Gambar, Logo, SVG)
└── ...                     # Konfigurasi (Tailwind, Next.js, TSConfig, package.json)
```

---

## 💻 Getting Started (Installation & Setup)

### 1. Prerequisites
Pastikan lingkungan pengembang Anda telah terinstal:
- [Node.js](https://nodejs.org/) (Versi 18+ direkomendasikan)
- Git

### 2. Clone Repository
Unduh repositori dari Github ke komputer lokal Anda:
```bash
git clone https://github.com/kaefha/my-nexus-1.0.0.git
cd mai-nims
```

### 3. Install Dependencies
Instal seluruh paket yang dibutuhkan aplikasi:
```bash
npm install
```

### 4. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local` dan isi parameter *database* serta *auth* rahasia Anda:
```bash
cp .env.example .env.local
```

### 5. Jalankan Development Server
Mulai *server* lokal untuk pengembangan:
```bash
npm run dev
```
Aplikasi kini dapat diakses melalui peramban (*browser*) pada alamat:  
👉 **http://localhost:3000**

> **💡 Tips Akses Perangkat Lain (Local Area Network):**  
> Jika Anda ingin mengakses aplikasi ini dari HP, Tablet, atau Laptop lain di jaringan WiFi yang sama, jalankan *server* dengan perintah:  
> `npm run dev -- -H 0.0.0.0`  
> Lalu akses melalui `http://<IP_LOCAL_KOMPUTER_ANDA>:3000` (contoh: `http://192.168.1.29:3000`).

---

## 🚀 Deployment (Production)

Untuk meluncurkan aplikasi ini ke server produksi (VPS, Vercel, AWS, dll):

1. **Build Aplikasi**:
   Mengkompilasi kode TypeScript dan Next.js menjadi paket produksi yang optimal.
   ```bash
   npm run build
   ```

2. **Jalankan Production Server**:
   ```bash
   npm run start
   ```

---

*Hak Cipta &copy; 2026 MAI (Nexus Inventory Management System). Seluruh hak dilindungi.*
