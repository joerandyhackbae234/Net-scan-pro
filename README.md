# 📡 NetScan Pro - AI Network Diagnostics

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-4.5.0-emerald)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Gemini AI](https://img.shields.io/badge/Powered%20By-Google%20Gemini-orange?logo=google-gemini)

**NetScan Pro** adalah aplikasi diagnosa jaringan tingkat lanjut yang dirancang untuk menganalisis spektrum sinyal operator seluler di Indonesia (Telkomsel, XL, Indosat, dll) menggunakan kecerdasan buatan.

---

## ✨ Fitur Utama

- 🛡️ **Secure Token Gate**: Akses terbatas menggunakan sistem autentikasi token eksklusif.
- 📡 **Deep Spectrum Scan**: Simulasi pemindaian menara seluler terdekat dengan antarmuka radar futuristik.
- 🤖 **AI Insights**: Rekomendasi teknis cerdas berbasis lokasi menggunakan Google Gemini API (model `gemini-3-flash-preview`).
- ⚡ **Live Diagnostics**: Pengetesan latensi (Ping) real-time dan stabilitas jaringan.
- 📊 **Network Stability Chart**: Visualisasi fluktuasi sinyal secara real-time.
- 📜 **Scan History**: Penyimpanan riwayat pemindaian lokal untuk perbandingan performa.
- 📥 **Export Report**: Unduh hasil analisis dalam format JSON untuk pelaporan teknis.

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 19 (Hooks, Functional Components)
- **Styling**: Tailwind CSS dengan Glassmorphism Design
- **Icons**: Lucide React
- **Charts**: Recharts (Responsive Area Charts)
- **AI Engine**: @google/genai (Gemini 3 Series)
- **Maps/Geo**: Browser Geolocation API

## 🚀 Cara Instalasi

1. **Clone Repositori**
   ```bash
   git clone https://github.com/username/netscan-pro.git
   cd netscan-pro
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi API Key**
   Pastikan Anda memiliki API Key dari [Google AI Studio](https://aistudio.google.com/).
   Aplikasi ini mengharapkan API key tersedia melalui environment variable `process.env.API_KEY`.

4. **Jalankan Aplikasi**
   ```bash
   npm start
   ```

## 🔑 Akses Token Default
Untuk masuk ke dashboard utama, gunakan token berikut:
`NETSCAN-2025-ADMIN`

## 📁 Struktur Folder
- `/components`: Komponen UI modular (Radar, Card, History, dll).
- `App.tsx`: Logika utama dan manajemen state aplikasi.
- `types.ts`: Definisi interface TypeScript untuk konsistensi data.
- `index.html`: Entry point dengan konfigurasi Tailwind dan Glassmorphism CSS.

---

## 📄 Lisensi
Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---
*Didesain dengan ❤️ untuk diagnostik jaringan tingkat lanjut.*
