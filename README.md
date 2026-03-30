# 🏢 PayrollPro — Enterprise Payroll & Tax Processing System

> **Full-Stack Production-Ready System** | Spring Boot 3 + React + MySQL

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![Java](https://img.shields.io/badge/Java-23-ED8B00?logo=openjdk)](https://openjdk.org/projects/jdk/23/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://mysql.com)

---

## 📋 Overview

PayrollPro is a comprehensive enterprise solution for automated salary calculations, leave management, and Indian income tax compliance. It features a **Premium Dark Hub UI** designed with modern glassmorphism and real-time data visualizations.

---

## ✨ Features

### 🔐 Secure Architecture
- **JWT Authentication**: Secure stateless authentication with refresh token logic.
- **Role-Based Access (RBAC)**: Distinct portals for **Employee**, **HR Manager**, and **System Admin**.
- **HR-Only Registration**: Removed public signup to ensure organizational integrity.

### 👤 Employee Self-Service (ESS)
- **Interactive Dashboard**: Real-time KPI charts and salary growth stats.
- **Smart Profile**: Self-service updates for personal contact details (Address & Phone).
- **Dynamic Payslips**: View and download automated monthly payslips in PDF format.
- **Leave Desk**: Apply for leaves, track balances, and view approval status.

### 🏢 HR & Administrative Control
- **Employee Directory**: Centralized management of specialized employee profiles.
- **Global Payroll Run**: One-click payroll processing for the entire organization.
- **Automatic Tax Compliance**: Built-in tax engines for both **Old and New Indian Tax Regimes (FY 2024-25)**.
- **Decision Engine**: Streamlined approval workflow for leave applications.

### 🎨 Premium Aesthetics
- **Antigravity Dark Mode**: Deep Zinc-Black theme with Violet accents.
- **Glassmorphism UI**: High-blur backdrops and animated background orbs for a high-end feel.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Spring Boot 3.2.3, Spring Security 6, JPA/Hibernate |
| **Frontend** | React 18, Vite, Redux Toolkit |
| **Styling** | Material UI (MUI) v5, Vanilla CSS3 (Custom Glassmorphism) |
| **Database** | MySQL 8.0 (Optimized indexing for large datasets) |
| **Visualization** | Recharts (Responsive SVG charts) |
| **Reporting** | jsPDF (Dynamic PDF generation) |

---

## 🚀 Quick Start

### 🔧 Backend Environment
1. **Database**: Create `payroll_db` in MySQL.
2. **Properties**: Configure `src/main/resources/application.properties`.
3. **Run**:
   ```bash
   cd payroll-backend
   ./mvnw spring-boot:run
   ```

### 🖥️ Frontend Environment
1. **Install**: `npm install`
2. **Run**: `npm run dev`
3. **Visit**: `http://localhost:5173`

---

## 📊 Business Logic: Indian Tax Engine
The system automatically calculates deductions based on:
- **New Tax Regime (Default)**: Slabs starting from 5% up to 30%, including standard deduction of ₹75,000.
- **Old Tax Regime**: Supports full 80C deductions (handled via backend persistence).
- **Surcharge & Cess**: Automatic application of 4% Health & Education Cess.
- **EPF Calculation**: 12% contribution with statutory ceilings.

---

## 📑 Default Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@payroll.com` | `Admin@123` |
| **HR Manager** | `hr@payroll.com` | `Hr@12345` |

---

## 📄 License
Internal Enterprise License — Unauthorized distribution is prohibited.
