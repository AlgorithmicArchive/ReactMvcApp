# Sahayata Nidhi

**Sahayata Nidhi** is a government-backed financial assistance platform developed under the **Social Welfare Department**. It is designed to help economically weaker sections of society apply for and receive financial aid through a transparent, multi-level approval system involving users and officers.

This portal streamlines the application, review, and sanctioning process using modern technology—ensuring efficiency, accountability, and ease of access.

---

## 📌 Project Overview

Sahayata Nidhi consists of two core modules:

- **Users:** Citizens can register, fill application forms, and track their status.
- **Officers:** Government officers handle the review, verification, and sanctioning of applications.

---

## ⚙️ Technology Stack

- **Backend:** ASP.NET Core MVC
- **Frontend:** React.js
- **Database:** SQL Server
- **Authentication:** Role-based (User, Officer, Admin)
- **Architecture:** MVC (Model-View-Controller) + API integration
- **Deployment:** IIS / Azure / Docker (as per choice)

---

## 🚀 Key Features

- 📄 Form submission for financial aid
- 🔍 Multi-level application review by officers
- 🔐 Secure authentication and role-based access
- 📊 Admin and officer dashboards
- ⏳ Application status tracking for users
- 📬 Notifications and alerts

---

## 🏗️ Modules

### 1. User Module

- User registration and login
- Application form submission
- Document uploads
- Status tracking of submitted applications

### 2. Officer Module

- Officer login and dashboard
- View, verify, and approve/reject applications
- Add review comments and update status
- Sanction recommendation and tracking

---

## 🛠️ Installation & Setup

### Prerequisites

- [.NET SDK 7+](https://dotnet.microsoft.com/)
- [Node.js & npm](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/)
- Visual Studio 2022 or later

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/AlgorithmicArchive/ReactMvcApp.git
cd ReactMvcApp

# Restore node_modules
npm install

# Restore NuGet packages
dotnet restore

# Run migrations (or update database via EF Core)
dotnet ef database update

# Run the application
dotnet run
```
