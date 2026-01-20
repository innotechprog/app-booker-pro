# 🚀 Backend Setup Guide

Step-by-step guide to get your backend running.

## 📝 Step 1: Install Node.js Packages

Open terminal in the `backend` folder:

```bash
cd backend
npm install
```

This will install all required packages:
- express, mysql2, bcryptjs, jsonwebtoken, cors, dotenv, etc.

## 🗄️ Step 2: Start MySQL in XAMPP

1. Open **XAMPP Control Panel**
2. Click **Start** next to **MySQL**
3. Wait for it to turn green
4. Click **Admin** to open phpMyAdmin (optional, to view database)

## ⚙️ Step 3: Configure Environment

Create `.env` file in `backend` folder with this content:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=app_booker_pro
DB_PORT=3306

JWT_SECRET=ibis-innovative-solutions-2025-secret-key
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:8080
```

> **Note**: If your MySQL has a password, add it to `DB_PASSWORD`

## 🏗️ Step 4: Create Database

Run the setup script to create database and tables:

```bash
npm run db:setup
```

You should see:
```
✅ Database created successfully!
✅ Users table created
✅ Subjects table created
... (all tables)
🎉 All tables created successfully!
```

## 🌱 Step 5: Seed Sample Data

Add subjects, tutors, achievements, and demo user:

```bash
npm run db:seed
```

You should see:
```
✅ Subjects added
✅ Tutors added
✅ Achievements added
✅ Demo user created
```

**Demo Login:**
- Email: `demo@student.com`
- Password: `demo123`

## 🎯 Step 6: Start the Server

```bash
npm run dev
```

You should see:
```
✅ Database connected successfully!
🚀 ========================================
🚀 Server running in development mode
🚀 Server is running on port 5000
🚀 API: http://localhost:5000
🚀 Health: http://localhost:5000/health
🚀 ========================================
```

## ✅ Step 7: Test the API

Open browser and visit:
- http://localhost:5000 - Welcome message
- http://localhost:5000/health - Health check

Or use command line:

```bash
# Test health
curl http://localhost:5000/health

# Test login
curl -X POST https://ib-backend.ib-innovativesolutions.com/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"demo@student.com\",\"password\":\"demo123\"}"
```

## 🔧 Troubleshooting

### ❌ "Database connection failed"
- Make sure XAMPP MySQL is running
- Check `.env` file has correct DB settings
- Default MySQL password in XAMPP is empty

### ❌ "Port 5000 already in use"
- Change `PORT=5000` to `PORT=5001` in `.env`
- Or stop other services using port 5000

### ❌ "Cannot find module"
- Run `npm install` again
- Make sure you're in the `backend` folder

### ❌ "Table doesn't exist"
- Run `npm run db:setup` to create tables
- Run `npm run db:seed` to add data

## 📊 Verify Database

Open phpMyAdmin (http://localhost/phpmyadmin):
1. Click on `app_booker_pro` database
2. You should see 15 tables
3. Click on `users` table - should have 1 demo user
4. Click on `subjects` table - should have 16 subjects

## 🎉 Success!

Your backend is now running! The server will:
- ✅ Handle user registration and login
- ✅ Manage learner profiles
- ✅ Store notes, calendar events, messages
- ✅ Track study streaks and achievements
- ✅ Provide tutorial data
- ✅ Send notifications

## 📱 Next: Connect Frontend

Update your React app to use the API instead of localStorage. Replace:
- `localStorage.setItem('learner_current', ...)` → `POST /api/auth/login`
- `localStorage.getItem('notes_...')` → `GET /api/notes`
- etc.

---

**Need help?** Check the main README.md for API documentation!









