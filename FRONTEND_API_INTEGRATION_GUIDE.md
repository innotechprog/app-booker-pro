# 🔗 Frontend-Backend Integration Guide

## ✅ Current Status

- ✅ **Backend**: Complete API ready at http://localhost:5000
- ✅ **Database**: MySQL with all tables and sample data
- ✅ **API Service**: Created `src/services/api.ts` for frontend
- ⏳ **Frontend**: Still using localStorage (needs update)

---

## 🎯 Quick Setup

### 1. Create `.env.local` in Root Folder

Create a file named `.env.local` in the root of your project (same level as `package.json`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Start Backend Server

```bash
cd backend
npm install        # If not done yet
npm run dev        # Start backend
```

Backend runs on: **http://localhost:5000**

### 3. Start Frontend

In another terminal:

```bash
npm run dev
```

Frontend runs on: **http://localhost:8080**

---

## 🔄 How It Works Now

### **Currently (localStorage):**
```javascript
// Login
localStorage.setItem('learner_current', JSON.stringify(user));

// Get notes
const notes = JSON.parse(localStorage.getItem('notes_email') || '[]');
```

### **With API (Already Created!):**
```javascript
// Login
import { authAPI } from '@/services/api';
const result = await authAPI.login(email, password);
// Token and user data saved automatically

// Get notes
import { notesAPI } from '@/services/api';
const result = await notesAPI.getAll();
const notes = result.notes;
```

---

## 📝 API Service Functions Available

I've already created `src/services/api.ts` with these functions:

### **Authentication:**
- `authAPI.register(userData)` - Register new user
- `authAPI.login(email, password)` - Login
- `authAPI.logout()` - Logout
- `authAPI.getCurrentUser()` - Get current user

### **Profile:**
- `learnerAPI.getProfile()` - Get profile
- `learnerAPI.updateProfile(data)` - Update profile
- `learnerAPI.getSubjects()` - Get subjects
- `learnerAPI.addSubject(name)` - Add subject
- `learnerAPI.removeSubject(id)` - Remove subject
- `learnerAPI.getStreak()` - Get study streak

### **Notes:**
- `notesAPI.getAll(category?)` - Get notes
- `notesAPI.create(noteData)` - Create note
- `notesAPI.update(id, noteData)` - Update note
- `notesAPI.delete(id)` - Delete note

### **Calendar:**
- `calendarAPI.getAll(upcomingOnly?)` - Get events
- `calendarAPI.create(eventData)` - Create event
- `calendarAPI.update(id, data)` - Update event
- `calendarAPI.delete(id)` - Delete event

### **Notifications:**
- `notificationsAPI.getAll(unreadOnly?)` - Get notifications
- `notificationsAPI.markAsRead(id)` - Mark as read
- `notificationsAPI.clearAll()` - Clear all

### **Tutorials:**
- `tutorialsAPI.getAll(filters?)` - Get tutorials
- `tutorialsAPI.getById(id)` - Get single tutorial
- `tutorialsAPI.bookmark(id)` - Bookmark
- `tutorialsAPI.removeBookmark(id)` - Remove bookmark
- `tutorialsAPI.getBookmarks()` - Get bookmarks

### **Messages:**
- `messagesAPI.getConversations()` - Get all chats
- `messagesAPI.getChat(tutorId)` - Get specific chat
- `messagesAPI.send(tutorId, content)` - Send message

### **Subjects:**
- `subjectsAPI.getAll(filters?)` - Get all subjects
- `subjectsAPI.getCategories()` - Get categories

---

## 🧪 Test Backend First

Before integrating, test the backend is working:

### Option 1: Browser
Visit: http://localhost:5000
Should show: Welcome message with API endpoints

### Option 2: Test Login
Open browser console on your frontend and run:

```javascript
// Test login API
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'demo@student.com',
    password: 'demo123'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Backend working!', data))
.catch(err => console.error('❌ Backend error:', err));
```

If you see success response, backend is ready! ✅

---

## 🔌 Next: Connect Frontend Pages

To connect your frontend to the backend, I can:

1. **Update LearnerLogin.tsx** - Use `authAPI.login()` instead of localStorage
2. **Update LearnerRegister.tsx** - Use `authAPI.register()`
3. **Update LearnerDashboard.tsx** - Use `notesAPI`, `calendarAPI`, etc.
4. **Update all components** - Replace localStorage with API calls

---

## ⚡ Quick Integration Example

### Before (localStorage):
```typescript
// LearnerLogin.tsx
const handleLogin = () => {
  const learners = JSON.parse(localStorage.getItem('learners') || '[]');
  const user = learners.find(l => l.email === email);
  // ... check password
  localStorage.setItem('learner_current', JSON.stringify(user));
};
```

### After (API):
```typescript
// LearnerLogin.tsx
import { authAPI } from '@/services/api';

const handleLogin = async () => {
  try {
    const result = await authAPI.login(email, password);
    // Token saved automatically
    navigate('/learner/dashboard');
  } catch (error) {
    alert(error.message);
  }
};
```

---

## 🎯 Should I Proceed?

Would you like me to:

**Option A**: Update ALL frontend pages to use the API now?
- I'll replace localStorage with API calls throughout the app
- Login, Register, Profile, Notes, Calendar, etc.
- Full database integration

**Option B**: Update one page at a time so you can test?
- Start with Login/Register
- Then Profile
- Then Notes, Calendar, etc.

**Option C**: Keep localStorage for now and test backend separately?
- Test API with Postman/browser first
- Integrate frontend later

Let me know which option you prefer! 🚀


