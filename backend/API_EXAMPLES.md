# 📡 API Examples & Testing

Quick reference for testing all API endpoints.

## 🔐 Authentication APIs

### Register New User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "grade": "Grade 10"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "grade": "Grade 10",
    "isPremium": false
  }
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "demo@student.com",
  "password": "demo123"
}
```

### Get Current User
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN
```

## 👤 Learner Profile APIs

### Get Profile
```bash
GET http://localhost:5000/api/learner/profile
Authorization: Bearer YOUR_TOKEN
```

### Update Profile
```bash
PUT http://localhost:5000/api/learner/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "fullName": "John Updated",
  "phone": "0821234567",
  "grade": "Grade 11",
  "goals": "Get 80%+ in all subjects"
}
```

### Get Study Streak
```bash
GET http://localhost:5000/api/learner/streak
Authorization: Bearer YOUR_TOKEN
```

## 📚 Subjects APIs

### Get All Subjects
```bash
GET http://localhost:5000/api/subjects
```

### Search Subjects
```bash
GET http://localhost:5000/api/subjects?search=math
GET http://localhost:5000/api/subjects?category=Sciences
```

### Get Subject Categories
```bash
GET http://localhost:5000/api/subjects/categories
```

### Get User's Subjects
```bash
GET http://localhost:5000/api/learner/subjects
Authorization: Bearer YOUR_TOKEN
```

### Add Subject to User
```bash
POST http://localhost:5000/api/learner/subjects
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "subjectName": "Mathematics"
}
```

### Remove Subject
```bash
DELETE http://localhost:5000/api/learner/subjects/1
Authorization: Bearer YOUR_TOKEN
```

## 📝 Notes APIs

### Get All Notes
```bash
GET http://localhost:5000/api/notes
Authorization: Bearer YOUR_TOKEN
```

### Get Notes by Category
```bash
GET http://localhost:5000/api/notes?category=mathematics
```

### Create Note
```bash
POST http://localhost:5000/api/notes
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Algebra Notes",
  "body": "Quadratic equations: ax² + bx + c = 0",
  "category": "mathematics"
}
```

### Update Note
```bash
PUT http://localhost:5000/api/notes/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "body": "Updated content",
  "category": "science"
}
```

### Delete Note
```bash
DELETE http://localhost:5000/api/notes/1
Authorization: Bearer YOUR_TOKEN
```

## 📅 Calendar APIs

### Get All Events
```bash
GET http://localhost:5000/api/calendar
Authorization: Bearer YOUR_TOKEN
```

### Get Upcoming Events Only
```bash
GET http://localhost:5000/api/calendar?upcoming=true
Authorization: Bearer YOUR_TOKEN
```

### Create Event
```bash
POST http://localhost:5000/api/calendar
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Math Tutorial Session",
  "eventDate": "2025-10-15",
  "eventTime": "14:00",
  "type": "tutorial"
}
```

### Update Event
```bash
PUT http://localhost:5000/api/calendar/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "completed": true
}
```

### Delete Event
```bash
DELETE http://localhost:5000/api/calendar/1
Authorization: Bearer YOUR_TOKEN
```

## 🔔 Notifications APIs

### Get All Notifications
```bash
GET http://localhost:5000/api/notifications
Authorization: Bearer YOUR_TOKEN
```

### Get Unread Only
```bash
GET http://localhost:5000/api/notifications?unreadOnly=true
Authorization: Bearer YOUR_TOKEN
```

### Mark as Read
```bash
PUT http://localhost:5000/api/notifications/1/read
Authorization: Bearer YOUR_TOKEN
```

### Clear All Notifications
```bash
DELETE http://localhost:5000/api/notifications
Authorization: Bearer YOUR_TOKEN
```

## 🎓 Tutorials APIs

### Get All Tutorials
```bash
GET http://localhost:5000/api/tutorials
```

### Filter Tutorials
```bash
GET http://localhost:5000/api/tutorials?subject=Mathematics&grade=Grade 10
GET http://localhost:5000/api/tutorials?difficulty=beginner
GET http://localhost:5000/api/tutorials?search=algebra
GET http://localhost:5000/api/tutorials?sortBy=popular
```

### Get Single Tutorial
```bash
GET http://localhost:5000/api/tutorials/1
```

### Bookmark Tutorial
```bash
POST http://localhost:5000/api/tutorials/bookmarks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "tutorialId": 1
}
```

### Get My Bookmarks
```bash
GET http://localhost:5000/api/tutorials/bookmarks/my
Authorization: Bearer YOUR_TOKEN
```

### Remove Bookmark
```bash
DELETE http://localhost:5000/api/tutorials/bookmarks/1
Authorization: Bearer YOUR_TOKEN
```

## 💬 Messages APIs

### Get All Conversations
```bash
GET http://localhost:5000/api/messages
Authorization: Bearer YOUR_TOKEN
```

### Get Chat with Tutor
```bash
GET http://localhost:5000/api/messages/1
Authorization: Bearer YOUR_TOKEN
```

### Send Message
```bash
POST http://localhost:5000/api/messages
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "tutorId": 1,
  "content": "Hello, I'd like to book a session"
}
```

---

## 🧪 Testing with Postman or Thunder Client

1. Import these examples
2. Create environment variable for TOKEN
3. After login, copy token to environment
4. All protected routes will use the token automatically

## 📊 Response Format

All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev mode only)"
}
```

---

**Happy Testing! 🎉**






