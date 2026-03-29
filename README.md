# 🏢 PayrollPro — Enterprise Payroll & Tax Processing System

> **Full-Stack Production-Ready System** | Spring Boot 3 + React + MySQL

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk)](https://openjdk.org/projects/jdk/17/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://mysql.com)

---

## 📋 Overview

PayrollPro automates salary calculation, leave management, and Indian income tax deduction for enterprises. It supports both Employee and HR/Admin roles with a modern, enterprise-grade UI.

---

## ✨ Features

### 🔐 Authentication
- JWT-based auth with refresh token support
- RBAC (Employee / HR / Admin)
- BCrypt password encryption

### 👤 Employee Portal
- Personal dashboard with salary KPIs & trend charts
- Monthly payslip with PDF download
- Apply/cancel leave with balance tracking
- Indian tax breakdown (Old & New Regime)

### 🏢 HR/Admin Panel
- Organization analytics dashboard
- Add/Edit/Deactivate employees
- Approve/Reject leave requests
- Run monthly payroll for all/individual employees
- Department distribution charts

### 💰 Payroll & Tax Engine
- **Indian New Regime (FY 2024-25):** 0% / 5% / 10% / 15% / 20% / 30%
  - ₹75,000 standard deduction
  - Rebate u/s 87A for income ≤ ₹7L
- **Indian Old Regime:** 0% / 5% / 20% / 30%
  - ₹50,000 standard deduction
  - Rebate u/s 87A for income ≤ ₹5L
- 4% Health & Education Cess
- PF: 12% of basic (capped at ₹15,000)
- Professional Tax slab (Karnataka)
- Pro-rate salary by working days & LOP

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Spring Boot 3.2.3, Spring Security, Hibernate JPA |
| Auth | JWT (JJWT 0.12.3), BCrypt |
| Database | MySQL 8.0 |
| API Docs | SpringDoc OpenAPI (Swagger UI) |
| Frontend | React 18 + Vite |
| State | Redux Toolkit |
| UI | Material UI v5 + Recharts |
| PDF | jsPDF + jspdf-autotable |
| HTTP | Axios |
| Email | Spring Mail (HTML templates) |

---

## 🚀 Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8.0+

---

### 🔧 Backend Setup

1. **Create the database:**
```sql
CREATE DATABASE payroll_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Configure environment variables** (or edit `application.properties`):
```bash
DB_URL=jdbc:mysql://localhost:3306/payroll_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=your_256bit_secret_key
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your_app_password
```

3. **Run the backend:**
```bash
cd payroll-backend
mvn spring-boot:run
```

The app starts at `http://localhost:8080/api/v1`  
Swagger UI: `http://localhost:8080/api/v1/swagger-ui.html`

> **Default Admin:** `admin@payroll.com` / `Admin@123`  
> **Default HR:** `hr@payroll.com` / `Hr@12345`

---

### 🖥️ Frontend Setup

```bash
cd payroll-frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login → JWT token |
| POST | `/auth/logout` | Invalidate token |

### Employee
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/employee/profile` | Employee |
| GET | `/employee/dashboard` | Employee |
| GET | `/employee/payroll` | Employee |
| GET | `/employee/payroll/{month}/{year}` | Employee |
| POST | `/employee/leaves` | Employee |
| GET | `/employee/leaves` | Employee |
| DELETE | `/employee/leaves/{id}/cancel` | Employee |

### HR/Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/hr/employees` | HR/Admin |
| GET | `/hr/employees` | HR/Admin |
| PUT | `/hr/employees/{id}` | HR/Admin |
| DELETE | `/hr/employees/{id}` | HR/Admin |
| GET | `/hr/leaves` | HR/Admin |
| PATCH | `/hr/leaves/{id}/approve` | HR/Admin |
| PATCH | `/hr/leaves/{id}/reject` | HR/Admin |
| POST | `/hr/payroll/process` | HR/Admin |
| POST | `/hr/payroll/process/{employeeId}` | HR/Admin |
| GET | `/hr/dashboard` | HR/Admin |

---

## 🗄️ Database Schema

```
users (id, name, email, password, role, active, last_login_at, refresh_token)
employees (id, employee_code, department, designation, basic_salary, hra, special_allowance, ...)
leaves (id, employee_id, leave_type, status, start_date, end_date, total_days, ...)
payrolls (id, employee_id, month, year, gross_salary, net_salary, pf_deduction, income_tax_tds, ...)
tax_slabs (id, regime, financial_year, min_income, max_income, tax_rate)
audit_logs (id, user_id, action, entity_type, entity_id, description, ...)
```

---

## 🐳 Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: payroll_db
    ports: ["3306:3306"]

  backend:
    build: ./payroll-backend
    ports: ["8080:8080"]
    environment:
      DB_URL: jdbc:mysql://mysql:3306/payroll_db?useSSL=false&serverTimezone=UTC
      DB_USERNAME: root
      DB_PASSWORD: root
      JWT_SECRET: your_secret_here
    depends_on: [mysql]

  frontend:
    build: ./payroll-frontend
    ports: ["5173:80"]
    depends_on: [backend]
```

---

## 📄 License

Private — Enterprise Internal Use Only
