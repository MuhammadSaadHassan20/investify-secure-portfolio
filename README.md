# 📘 Investify – Secure Stock & Crypto Portfolio Tracker

A secure **FinTech web application** built using **React (Vite + TypeScript)**, **Tailwind CSS**, and a **local IndexedDB database**.  
It enables users to manage their stock and crypto holdings while demonstrating modern **secure coding practices** and **manual cybersecurity testing**.

---

## 🧠 Overview

**Investify** is a browser-based portfolio tracker designed for retail investors who want to securely manage their financial assets.  
It focuses on **data confidentiality**, **integrity**, and **user authentication**, all within a **local-first architecture**.

This project was developed for **CY4053 – Secure Application Development (Assignment 2)**.

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React + TypeScript + Vite |
| **Styling** | Tailwind CSS |
| **Local Database** | IndexedDB (via custom `localdb.ts`) |
| **Encryption** | CryptoJS (AES-256) |
| **Auth Context** | Custom (AuthContext.tsx) |
| **API Integration** | Live crypto prices (via API) |
| **Testing** | Manual Cybersecurity Tests (20 total) |

---

## 🗄️ Local Database (IndexedDB)

Investify uses **IndexedDB** for secure, local data persistence inside the browser.  
No external database (like MySQL or Supabase) is required.

### 🧱 Object Stores Created

The database (`investify_db`) automatically initializes on first load, creating:
- `users` — stores user credentials and security info  
- `activity_logs` — stores user activity (actions, IPs, timestamps)  
- `portfolios` — stores portfolio assets (crypto & stocks)
