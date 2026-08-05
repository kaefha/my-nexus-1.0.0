# NIMS (Network Inventory Management System)
*Network Equipment & Infrastructure Supply Chain Management System*

| Field | Detail |
|---|---|
| **Version** | 1.0 |
| **Product Type** | Enterprise Inventory & Material Management System |
| **Industry** | Network Infrastructure / Telecommunication Infrastructure |
| **User Target** | Internal Only |

---

## 1. Product Overview

### 1.1 Vision

Membangun sistem inventory digital yang menjadi *single source of truth* untuk seluruh material jaringan perusahaan, mulai dari permintaan hingga konsumsi di lapangan, dengan kemampuan:

- *Real-time* visibility inventory.
- *End-to-end* material tracking.
- Digital approval workflow.
- Monitoring warehouse terpusat.
- Tracking konsumsi material per proyek.

### 1.2 Background

Dalam industri infrastruktur jaringan, kelancaran pembangunan sangat ditentukan oleh pengelolaan material yang efektif dan terstruktur. Material utama seperti kabel fiber optik, *joint closure*, tiang besi, pipa HDPE, *riser pipe*, dan perangkat pendukung lainnya harus dikelola secara profesional mulai dari proses permintaan, pengadaan, pelacakan pengiriman, penyimpanan di gudang, hingga distribusi ke lokasi proyek.

Setiap tahapan mulai dari pembuatan dokumen RFC (*Request for Consumption*), *approval*, hingga penerimaan di lapangan perlu terdokumentasi dengan baik agar stok tetap terkontrol dan kebutuhan proyek terpenuhi tepat waktu.

### 1.3 Core Business Flow

```
Project Requirement
        ↓
RFC (Request for Consumption)
        ↓
Approval Workflow
(Site Manager → Finance/Office)
        ↓
Material Allocation
        ↓
Procurement & Purchase Order
        ↓
Vendor Production
        ↓
Logistics Delivery & Tracking
        ↓
Warehouse Receiving & Storage
        ↓
Material Transfer / Issue
        ↓
Project Site Installation / Consumption
        ↓
Reporting
```

### 1.4 Product Scope

1. RFC Management
2. Approval Workflow
3. Procurement Tracking
4. Logistics Tracking
5. Warehouse Management
6. Material Transfer
7. Inventory Monitoring
8. Reporting

---

## 2. Problem Statement

### 2.1 Kondisi Existing

**2.1.1 Tidak ada *single source of truth***

Data material tersebar di: RFC Excel/PDF, Procurement, Logistics, Warehouse, dan Project. Akibatnya sulit mengetahui posisi material, histori, dan stok aktual.

**2.1.2 Material bernilai tinggi sulit dilacak**

Contoh: Fiber Optic Cable 6.421 meter — tidak diketahui status PO-nya, sudah dikirim atau belum, sudah masuk warehouse atau belum, sudah keluar berapa, dan dipakai proyek mana.

**2.1.3 Approval masih manual**

Alur approval saat ini: PMO → Site Manager → Finance → Procurement → Warehouse — dilakukan secara manual tanpa sistem digital.

**2.1.4 Tidak ada material traceability**

Tidak tersedia data: siapa yang meminta, kapan material datang, masuk warehouse mana, keluar untuk proyek apa, dan siapa yang menerima.

### 2.2 Objectives

**Business Objectives:**

- Meningkatkan akurasi data inventory.
- Mengurangi kehilangan atau ketidaksesuaian material.
- Mempercepat proses approval material.
- Menyediakan monitoring stok warehouse secara *real-time*.
- Memudahkan tracking perjalanan material dari procurement hingga site.

**User Objectives:**

- Project team dapat melakukan request material secara digital.
- Manager dapat melakukan approval melalui sistem.
- Procurement dapat melakukan tracking PO.
- Warehouse dapat mencatat material masuk dan keluar.
- Supervisor dapat melakukan request pemindahan material.

---

## 3. User Roles & Permissions

### 3.1 Super Admin / Administrator
- Manage user dan role.
- Manage warehouse dan master material.
- View seluruh laporan.

### 3.2 PMO / Project Team
- Membuat RFC (*Request for Consumption*).
- Melihat status kebutuhan material.
- Monitoring kebutuhan proyek.

### 3.3 Site Manager
- Approve RFC.
- Approve request pemindahan material.
- Monitoring kebutuhan site.

### 3.4 Finance / Office Approval
- Approval administrasi dan procurement.
- Approval budget/material.

### 3.5 Procurement
- Membuat dan mengelola Purchase Order.
- Upload dokumen PO.
- Update status procurement.
- Vendor management.

### 3.6 Logistics Team
- Tracking pengiriman material.
- Upload Delivery Order.
- Update status pengiriman.

### 3.7 Warehouse Supervisor
- Input material masuk dan keluar.
- Update stok.
- Upload foto bukti.
- Monitoring inventory warehouse.

### 3.8 Supervisor Site
- Request material dari warehouse.
- Request pemindahan material.
- Melihat status delivery.
- Konfirmasi penerimaan material.

### 3.9 Management
- Dashboard: inventory overview, project status, procurement status.

---

## 4. Information Architecture (Sidebar)

```
NEXUS INVENTORY

Dashboard

Project Management
 ├── Project List
 ├── Project Location
 └── Material Requirement

RFC Management
 ├── Create RFC
 ├── RFC Approval
 ├── RFC Tracking
 └── RFC History

Procurement
 ├── Purchase Order
 ├── Vendor
 ├── Production Tracking
 └── Procurement Status

Logistics
 ├── Delivery Tracking
 ├── Delivery Order
 └── Shipment History

Warehouse
 ├── Warehouse List
 ├── Material Receive
 ├── Material Issue
 ├── Stock Monitoring
 └── Stock Adjustment

Material Transfer
 ├── Transfer Request
 ├── Approval
 └── Delivery Status

Inventory
 ├── Material Catalog
 ├── Stock Balance
 └── Movement History

Reports
 ├── Inventory Report
 ├── RFC Report
 ├── Procurement Report
 ├── Warehouse Report
 └── Project Consumption Report

Master Data
 ├── Material
 ├── Unit
 ├── Warehouse
 ├── Vendor
 └── User
```

---

## 5. Module Specification

### 5.1 Dashboard

**Material Overview:** Total material, total quantity, kategori material.

**Warehouse Status:** Kapasitas warehouse, stok tersedia, material masuk.

**Transaction Monitoring:** Pending RFC, active PO, delivery progress, transfer request.

**Alerts:** Low stock, pending approval, delayed delivery.

---

### 5.2 Project Management

Menyimpan informasi proyek sebagai referensi RFC dan kebutuhan material.

**Tabel `project`:**

```
project_id
project_name
customer
region
storage_location
start_date
end_date
pic
status
```

Contoh proyek: NIQE 2026 TIF SUMUT
- Lokasi: Pagarantonga–Natal, Natal–Ujung Gading, Sibolga–Tarutung, Lahewa–Afulu.

---

### 5.3 RFC Management

RFC (*Request for Consumption*) adalah transaksi awal seluruh proses *supply chain* material.

**Tabel `rfc`:**

```
rfc_id
rfc_number
date
project_id
location
storage_location
requestor
status
```

**Tabel `rfc_item`** — satu RFC dapat memiliki banyak item:

```
rfc_item_id
rfc_id
item_code
material_name
description
unit
request_qty
approved_qty
notes
status
```

Contoh RFC Item:

| Item Code | Material | Unit | Request Qty |
|---|---|---|---|
| AC-OF-SM-48C | Fiber Optic Cable 48 Core | Meter | 6.421 |
| SC-OF-SM-48 | Joint Closure | PCS | 26 |
| PU-S7.0-140 | Tiang Besi 7 Meter | PCS | 147 |

**RFC Status:**

```
Draft → Submitted → Waiting Site Approval → Waiting Finance Approval → Approved → Completed
                                                                     ↘ Rejected
```

**RFC Workflow:**

```
Create RFC → Site Manager Approval → Finance/Office Approval → Approved → Procurement
```

---

### 5.4 Procurement Management

Tracking proses pengadaan material setelah RFC disetujui.

**Flow:**

```
Approved RFC → Generate Purchase Order → Vendor → Production → Ready for Delivery
```

**Tabel `purchase_order`:**

```
po_id
po_number
rfc_id
vendor_id
expected_date
status
```

**Tabel `po_item`:**

```
po_item_id
po_id
item_code
material_name
unit
quantity
```

**PO Status:**

```
Draft → Waiting Approval → Approved → Production → Completed
```

**Fitur:** Create & upload PO document, vendor management, PO status tracking.

---

### 5.5 Logistics Tracking

Melacak perjalanan material dari vendor menuju warehouse.

**Flow:**

```
Production → Material On Delivery → Warehouse Arrival → Material Received
```

**Tabel `delivery_order`:**

```
do_id
do_number
po_id
vehicle
driver
destination_warehouse_id
delivery_date
status
photo_evidence
```

**DO Status:**

```
Pending → On Delivery → Arrived → Received
```

---

### 5.6 Warehouse Management

Mengelola stok material di seluruh warehouse.

**Material Incoming — field input:**

```
do_number
rfc_number
po_number
material_name
quantity
date_received
warehouse_id
photo_evidence
```

**Material Out — field input:**

```
material_name
quantity
destination_project_id
request_reference
receiver
photo_evidence
```

**Stock Monitoring — tampilan:**

```
material_name
available_stock
reserved_stock
incoming
outgoing
last_updated
warehouse_id
```

---

### 5.7 Material Transfer

Mengelola perpindahan material dari warehouse utama ke site.

**Flow:**

```
Supervisor Request → Site Manager Approval → Delivery Process → Material Received at Site
```

**Tabel `material_transfer`:**

```
transfer_id
transfer_number
project_id
destination
material_name
quantity
requested_by
receiver
approval_status
delivery_status
```

**Transfer Status:**

```
Draft → Waiting Approval → Approved → On Delivery → Received
```

---

### 5.8 Inventory Monitoring

Menampilkan status stok dan histori pergerakan material secara keseluruhan.

**Tabel `inventory`:**

```
inventory_id
material_id
warehouse_id
available_stock
reserved_stock
minimum_stock
last_updated
```

**Tabel `stock_movement`:**

```
movement_id
material_id
warehouse_id
movement_type   -- IN | OUT | TRANSFER
reference_type  -- RFC | PO | DO | TRANSFER
reference_id
quantity
date
created_by
```

---

### 5.9 Reporting

| Laporan | Isi |
|---|---|
| **Inventory Report** | Current stock, stock movement, warehouse balance |
| **RFC Report** | RFC history, approval status, material requested |
| **Procurement Report** | PO progress, delivery status |
| **Warehouse Report** | Material masuk, keluar, stok aktual |
| **Project Consumption Report** | Material usage per project, remaining material |

---

## 6. Master Data

### 6.1 Material Master

**Tabel `material_master`:**

```
material_code
material_name
category
specification
unit
minimum_stock
```

**Kategori:** Fiber Optic, Cable, Joint Closure, Pole, Pipe, Accessories.

### 6.2 Warehouse Master

**Tabel `warehouse`:**

```
warehouse_id
warehouse_name
location
pic
capacity
```

### 6.3 Vendor Master

**Tabel `vendor`:**

```
vendor_id
vendor_name
contact
address
```

---

## 7. Data Model

```
user ─── role
  │
project
  │
 rfc ─── rfc_item
  │
purchase_order ─── po_item
  │
delivery_order
  │
warehouse ─── inventory ─── stock_movement
  │
material_transfer
  │
material_master
```

---

## 8. Material Traceability

Setiap material memiliki histori penuh dari awal hingga konsumsi:

```
RFC Created → Approved → PO Generated → Delivered to Warehouse
                                                 ↓
                                        Stored in Warehouse
                                                 ↓
                                        Issued / Transferred
                                                 ↓
                                        Consumed at Project Site
```

Contoh:

| Stage | Detail |
|---|---|
| Material | Fiber Optic Cable 48 Core |
| RFC | RFC-NIQE-SUMUT-2026 |
| PO | PO-001 |
| Delivery | DO-001 → Warehouse Medan |
| Stock masuk | 6.421 Meter |
| Issued | 3.000 Meter |
| Remaining | 3.421 Meter |

---

## 9. Evidence & Document Management

Setiap transaksi wajib mendukung upload dokumen berikut:

| Dokumen | Modul |
|---|---|
| Foto material | Warehouse, Material Transfer |
| Delivery Order | Logistics, Warehouse |
| Purchase Order | Procurement |
| Dokumen RFC | RFC Management |
| Bukti penerimaan | Warehouse, Material Transfer |

Semua dokumen tersimpan dengan referensi ke `reference_type` dan `reference_id` dari transaksi terkait, dan dapat diakses melalui audit trail.

---

## 10. Notification System

| Trigger | Pesan Notifikasi |
|---|---|
| RFC menunggu approval Site Manager | "RFC [nomor] membutuhkan approval Site Manager." |
| Material dalam pengiriman | "PO-[nomor] material sedang dalam perjalanan." |
| Stok mendekati minimum | "[Nama material] mencapai batas minimum stok." |
| Transfer menunggu approval | "Transfer Request [nomor] menunggu persetujuan." |

---

## 11. Non-Functional Requirements

### Performance
- Response time < 3 detik.
- Multi-warehouse support.
- Mendukung concurrent users.

### Security
- Role-Based Access Control (RBAC).
- Audit trail seluruh transaksi.
- Document access control.

### Availability
- Backup database terjadwal.
- Recovery mechanism.

---

## 12. Acceptance Criteria

Sistem dianggap berhasil jika:

1. PMO dapat membuat RFC digital dan melacak statusnya.
2. Approval berjalan otomatis melalui sistem (Site Manager → Finance).
3. Procurement dapat membuat dan melacak PO.
4. Logistics dapat mencatat dan melacak pengiriman.
5. Warehouse mengetahui stok secara *real-time*.
6. Setiap material memiliki histori perjalanan yang lengkap.
7. Management memiliki dashboard monitoring KPI.

---

## 13. Dashboard KPI

| Indikator | Keterangan |
|---|---|
| Total Material | Jumlah jenis material aktif |
| Active Project | Proyek yang sedang berjalan |
| Pending RFC | RFC yang menunggu approval |
| Active PO | Purchase Order yang sedang berjalan |
| Material On Delivery | Material dalam perjalanan ke warehouse |
| Low Stock Alert | Material di bawah minimum stok |

---

## 14. Success Metrics

| Metric | Target |
|---|---|
| Inventory accuracy | > 95% |
| Digital RFC adoption | 100% |
| Material traceability | 100% |
| Approval time reduction | 50% |
| Lost material reduction | 80% |

---

## 15. Tech Stack

### 15.1 Stack Utama

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js (React) |
| **UI Components** | shadcn/ui |
| **Backend** | NestJS (Node.js) |
| **ORM** | Prisma |
| **Database** | PostgreSQL (via Supabase — fase awal) |
| **Cache** | Redis |
| **File Storage** | Supabase Storage (fase awal) → MinIO / Object Storage IDCloudHost |
| **Auth** | JWT / NextAuth |
| **Deploy Frontend** | Vercel |
| **Deploy Backend** | VPS IDCloudHost (fase scale-up) |
| **CDN** | Cloudflare |

### 15.2 Strategi Infrastruktur

**Fase Awal (MVP — 0–6 bulan)**

Fokus pada kecepatan development. Seluruh infrastruktur dikelola via platform managed service:

- Database, Auth, dan Storage menggunakan **Supabase** (PostgreSQL managed)
- Frontend di-deploy ke **Vercel** (integrasi GitHub, auto-deploy)
- Tidak memerlukan manajemen server manual

**Fase Scale-up (6 bulan+)**

Setelah sistem stabil dan jumlah pengguna bertambah, infrastruktur dipindahkan ke VPS mandiri:

- VPS **IDCloudHost**: 2–4 Core CPU, 4–8 GB RAM, 80–200 GB SSD
- **Object Storage IDCloudHost** (terpisah dari VPS) untuk foto *evidence* dan dokumen
- Domain subdomain: `nims.mitraaksesinsani.co.id` → A Record pointing ke IP VPS
- SSL: **Let's Encrypt (Certbot)** — gratis
- Proses server: **PM2** (Node.js process manager)
- Reverse proxy: **Nginx**

**Catatan migrasi Supabase → VPS:**
Karena Supabase menggunakan PostgreSQL murni, migrasi database dilakukan via `pg_dump` / `pg_restore`. File storage dipindahkan via script otomatis. Auth dan Storage perlu diganti ke implementasi mandiri.

### 15.3 Deployment & Versioning

**Alur Deploy (CI/CD via GitHub + Vercel)**

```
Kode (Antigravity / VS Code)
        ↓
Commit & Push ke GitHub
        ↓
Vercel detect perubahan di branch main
        ↓
Auto build & deploy ke production
```

**Strategi Branching**

```
main        → Branch production (selalu versi live)
develop     → Branch development sehari-hari
feature/*   → Branch per fitur baru
v2.0        → Branch versi mayor baru
```

Alur update versi baru:

1. Buat branch baru dari `main` (misal: `v2.0`)
2. Kerjakan fitur baru di branch tersebut — *production tidak terganggu*
3. Setelah testing selesai, *merge* ke `main`
4. Vercel otomatis deploy versi terbaru
5. Tandai rilis resmi dengan **Git Tag**: `git tag v2.0`

**Rollback:** Jika versi baru bermasalah, dapat di-*revert* ke commit sebelumnya melalui GitHub tanpa downtime berkepanjangan.

### 15.4 API Strategy

NIMS menggunakan **REST API** sebagai komunikasi antara frontend dan backend.

**Endpoint utama:**

```
/api/auth              → login, logout, refresh token
/api/projects          → project management
/api/rfc               → RFC CRUD + approval workflow
/api/purchase-orders   → PO management
/api/delivery-orders   → logistics tracking
/api/warehouses        → warehouse & stock
/api/transfers         → material transfer
/api/inventory         → stock monitoring
/api/reports           → laporan
/api/master            → material, vendor, unit
```

Dokumentasi API otomatis menggunakan **Swagger** (built-in NestJS), dapat diakses di `/api/docs`.

### 15.5 Strategi Performa

Prinsip yang diterapkan dari awal untuk memastikan sistem berjalan cepat (target response time < 3 detik):

**Database:**
- Index wajib pada kolom yang sering di-filter: `status`, `project_id`, `warehouse_id`, `rfc_id`
- Selalu gunakan pagination — tidak ada endpoint yang mengembalikan data tanpa batas
- Query hanya kolom yang dibutuhkan, hindari `SELECT *`
- Hindari query N+1 dengan menggunakan `include` Prisma secara spesifik

**Caching (Redis):**
- Dashboard & KPI → cache 30 detik–1 menit
- Master data (material, vendor, unit) → cache 10–30 menit
- Invalidate cache otomatis saat ada perubahan data

**Upload File:**
- Foto dan dokumen di-upload langsung dari browser ke Supabase Storage
- Backend hanya menerima dan menyimpan URL, tidak memproses file
- Mengurangi beban server secara signifikan

**Frontend:**
- TanStack Query untuk client-side caching — data tidak di-request ulang selama masih valid
- Lazy load komponen dan halaman berat
- Tabel besar menggunakan virtual scrolling

**Target performa:**

| Aksi | Target Waktu |
|---|---|
| Buka dashboard | < 1 detik |
| Load daftar RFC (20 item) | < 500ms |
| Submit form baru | < 1 detik |
| Upload foto evidence | < 3 detik |
| Generate laporan | < 3 detik |

### 15.6 Local Development & Deployment Plan

Sebelum deploy ke production, sistem wajib melalui tahapan berikut:

**Tahap 1 — Local Development**

```
Developer setup environment lokal:
  ├── Node.js + npm
  ├── PostgreSQL lokal atau Supabase (mode dev)
  ├── Redis lokal
  └── Next.js + NestJS berjalan di localhost

Frontend  : http://localhost:3000
Backend   : http://localhost:3001
API Docs  : http://localhost:3001/api/docs
```

Seluruh fitur dikembangkan dan diuji di lingkungan lokal terlebih dahulu.

**Tahap 2 — Demo & Review Internal**

- Sistem didemonstrasikan kepada tim manajemen kantor
- Feedback dikumpulkan dan diimplementasikan
- Pengujian fungsional seluruh modul (RFC, approval, warehouse, reporting)
- User Acceptance Testing (UAT) bersama calon pengguna internal

**Tahap 3 — Deploy ke Production**

Setelah mendapat persetujuan dari tim manajemen:

```
Push ke branch main di GitHub
        ↓
Vercel otomatis build & deploy frontend
        ↓
Backend & database aktif di Supabase
        ↓
Domain: nims.mitraaksesinsani.co.id
        ↓
Sistem live & siap digunakan
```

**Environment variables** yang perlu dikonfigurasi saat deploy:

```
DATABASE_URL        → Supabase PostgreSQL connection string
SUPABASE_URL        → URL project Supabase
SUPABASE_ANON_KEY   → Public API key Supabase
REDIS_URL           → Redis connection string
JWT_SECRET          → Secret key untuk token autentikasi
NEXT_PUBLIC_API_URL → URL backend (untuk frontend)
```

---

## 16. Development Roadmap

### Phase 1 — Core System *(Current)*

Seluruh modul yang tercantum dalam Product Scope (Bagian 1.4).

### Phase 2 — Enhancement

- QR Code per material.
- Barcode scanner.
- Mobile warehouse app.
- Digital signature.

### Phase 3 — Intelligence & Integration

- AI demand forecasting.
- Auto reorder.
- ERP financial integration.
- IoT warehouse sensor.
- Vendor payment module.
- Accounting system integration.

---

## 17. Development Tooling

### 17.1 Agent Skills (skills.sh)

Skill-skill berikut diinstall ke AI coding agent (Antigravity, Claude Code, Cursor, dll.) untuk membantu proses development NIMS secara lebih akurat dan konsisten.

**Install semua sekaligus:**

```bash
npx skills add supabase/agent-skills
npx skills add prisma/skills
npx skills add shadcn/ui
npx skills add Kadajett/agent-nestjs-skills
npx skills add obra/superpowers
npx skills add anthropics/skills
npx skills add mattpocock/skills
npx skills add 101-skills/skills
```

**Detail per package:**

| Package | Skill yang Dicakup |
|---|---|
| `supabase/agent-skills` | Setup Supabase, PostgreSQL best practices, storage, auth |
| `prisma/skills` | `prisma-database-setup`, `prisma-client-api`, `prisma-cli`, `prisma-postgres`, `prisma-postgres-setup` |
| `shadcn/ui` | Panduan komponen shadcn/ui, pattern, CLI, theming |
| `Kadajett/agent-nestjs-skills` | Arsitektur NestJS: folder structure, module design, pagination, RBAC |
| `obra/superpowers` | `systematic-debugging`, `writing-plans`, `finishing-a-development-branch`, `requesting-code-review`, `receiving-code-review` |
| `anthropics/skills` | `webapp-testing`, `pptx`, `pdf`, `docx`, `xlsx` |
| `mattpocock/skills` | `domain-modeling`, `codebase-design`, `tdd`, `git-guardrails-claude-code`, `to-prd`, `to-issues`, `to-tickets`, `to-spec` |
| `101-skills/skills` | `frontend-design`, `improve-codebase-architecture`, `vercel-react-best-practices` |

---

### 17.2 obra/superpowers — Development Workflow

**Source:** https://github.com/obra/superpowers

**Install:**

```bash
npx skills add obra/superpowers
```

**Skill yang digunakan dalam workflow NIMS:**

| Skill | Kapan Dipakai |
|---|---|
| `writing-plans` | Sebelum mulai coding — buat plan detail per fitur |
| `systematic-debugging` | Saat ada bug — diagnosis terstruktur, bukan trial-error |
| `finishing-a-development-branch` | Sebelum merge ke main — checklist kelengkapan |
| `requesting-code-review` | Saat membuat PR — format deskripsi yang jelas |
| `receiving-code-review` | Saat ada feedback — cara proses dan respond review |
| `using-superpowers` | Meta-skill — cara pakai superpowers secara optimal |

**Alur penggunaan harian:**

```
Mau bikin fitur baru (misal: RFC Module)
        ↓
1. Panggil skill: writing-plans
   → Agent bantu buat plan detail sebelum nulis kode
        ↓
2. Coding sesuai plan
        ↓
3. Ada bug? Panggil: systematic-debugging
   → Diagnosis root cause, bukan trial-error
        ↓
4. Fitur selesai? Panggil: finishing-a-development-branch
   → Checklist sebelum push ke GitHub
        ↓
5. Siap merge? Panggil: requesting-code-review
   → Format PR yang jelas
```

**Catatan penting:**
- Superpowers tidak masuk ke kode aplikasi — hanya dipakai oleh AI agent selama development
- Tidak ada dependency di `package.json`
- Tambahkan ke `.gitignore` jika di-clone manual:

```
# .gitignore
.superpowers/
```

**Cleanup — saat sudah tidak diperlukan:**

```bash
# Hapus skill dari agent
npx skills remove obra/superpowers

# Jika di-clone manual, hapus folder
rm -rf .superpowers

# Verifikasi sudah bersih (output harus kosong)
find . -name "*superpowers*" -not -path "*/node_modules/*"
```
