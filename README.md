# 🏆 Towel Analyst - Sport Monitoring System

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white)

**Towel Analyst** adalah platform pemantauan performa atlet yang canggih, dirancang untuk memberikan wawasan mendalam tentang beban latihan, kesehatan, dan perkembangan fisik atlet secara real-time melalui integrasi data yang efisien.

[Fitur Utama](#-fitur-utama) • [Teknologi Stack](#-teknologi-stack) • [Metrik Performa](#-metrik-yang-dipantau)

---

## ✨ Fitur Utama

- 📊 **Dashboard Interaktif**: Visualisasi data performa menggunakan Recharts (Radar Chart, Line Chart, Pie Chart) yang memudahkan analisis perkembangan atlet.
- 🔗 **Integrasi Google Sheets**: Kontrol penuh data logbook secara langsung melalui Google Spreadsheet untuk fleksibilitas input data.
- ⚡ **Analitik Performa**: Perhitungan otomatis metrik kritis seperti ACWR, Monotony, dan Strain untuk mendeteksi risiko cedera dan kelelahan.
- 🧘 **BMI Analyst**: Pemantauan komposisi tubuh dan status kesehatan atlet secara periodik.
- 🛡️ **Sistem Multi-Role**: Workflow yang disesuaikan untuk peran Coach (Pelatih) dan Atlet untuk kolaborasi yang lebih baik.
- 🎨 **Desain Premium**: Antarmuka modern yang responsif dengan fokus pada keterbacaan data yang optimal.

---

## 🛠️ Teknologi Stack

| Komponen | Teknologi |
| --- | --- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Integrasi Data** | [Google Sheets API](https://developers.google.com/sheets/api) |
| **Visualisasi** | [Recharts](https://recharts.org/) |
| **Ikonografi** | [Lucide React](https://lucide.dev/) |
| **State Management** | [TanStack Query v5](https://tanstack.com/query/latest) |

---

## 📈 Metrik yang Dipantau

Sistem ini melakukan pemrosesan data otomatis untuk menghasilkan metrik performa objektif:

- **Weekly Load**: Akumulasi total beban latihan yang dilakukan atlet dalam siklus 7 hari terakhir.
- **ACWR (Acute:Chronic Workload Ratio)**: Rasio perbandingan beban kerja jangka pendek vs jangka panjang untuk memprediksi kesiapan tanding dan meminimalisir risiko cedera.
- **Monotony**: Indikator variasi beban latihan. Nilai tinggi menunjukkan kurangnya variasi yang berisiko pada kelelahan kronis.
- **Strain**: Ukuran stres fisik keseluruhan yang dihitung dari kombinasi beban mingguan dan intensitas latihan.

---

## 📁 Struktur Proyek

```bash
├── app/              # Navigasi, API, dan Tata Letak Aplikasi
├── components/       # Antarmuka Pengguna & Visualisasi Chart
├── hooks/            # Logika Pemrosesan Data & Autentikasi
├── lib/              # Mesin Perhitungan Metrik Olahraga
├── public/           # Aset Visual & Branding
└── types/            # Definisi Integritas Data
```

---

Dibuat untuk memberikan solusi analitik olahraga yang akurat dan efisien.


