# IB Innovative Solutions - Backend API

Complete Node.js + Express + MySQL backend for the App Booker Pro platform.

## 🚀 Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **User Management**: Learner profiles, subjects, progress tracking
- **Tutorial System**: Browse, bookmark, and track tutorials
- **Notes**: Create, organize, and categorize study notes
- **Calendar**: Schedule and manage study sessions
- **Messages**: Chat with tutors in real-time
- **Notifications**: Smart notification system
- **Achievements**: Gamification with badges and streaks
- **Analytics**: Track progress and performance

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- XAMPP (or any MySQL server)

## ⚙️ Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file by copying `env.example`:

```bash
# Copy the example file (Windows)
copy env.example .env

# Or manually create .env with these values:
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

### 3. Setup MySQL Database

Make sure XAMPP MySQL is running, then:

```bash
# Create database and tables
npm run db:setup

# Seed with sample data
npm run db:seed
```

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Server will run on: **http://localhost:5000**

## 🗄️ Database Schema

### Tables Created:

1. **users** - Learner accounts
2. **subjects** - Subject catalog (Mathematics, Science, etc.)
3. **user_subjects** - User's enrolled subjects
4. **tutors** - Tutor profiles
5. **tutorials** - Tutorial content
6. **notes** - User notes with categories
7. **calendar_events** - Scheduled events
8. **messages** - Chat messages
9. **bookmarks** - Saved tutorials
10. **notifications** - User notifications
11. **study_streaks** - Streak tracking
12. **achievements** - Available achievements
13. **user_achievements** - Earned achievements
14. **bookings** - Tutor session bookings
15. **user_progress** - Tutorial progress tracking

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new learner
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Learner Profile
- `GET /api/learner/profile` - Get profile
- `PUT /api/learner/profile` - Update profile
- `GET /api/learner/subjects` - Get user's subjects
- `POST /api/learner/subjects` - Add subject
- `DELETE /api/learner/subjects/:id` - Remove subject
- `GET /api/learner/streak` - Get study streak

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Calendar
- `GET /api/calendar` - Get events
- `POST /api/calendar` - Create event
- `PUT /api/calendar/:id` - Update event
- `DELETE /api/calendar/:id` - Delete event

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications` - Clear all

### Tutorials
- `GET /api/tutorials` - Get all tutorials (with filters)
- `GET /api/tutorials/:id` - Get single tutorial
- `POST /api/tutorials/bookmarks` - Bookmark tutorial
- `DELETE /api/tutorials/bookmarks/:id` - Remove bookmark
- `GET /api/tutorials/bookmarks/my` - Get bookmarked tutorials

### Messages
- `GET /api/messages` - Get all conversations
- `GET /api/messages/:tutorId` - Get chat with tutor
- `POST /api/messages` - Send message

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/categories` - Get categories

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### How to use:

1. **Register or Login** to get a token
2. **Include token** in all protected requests:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN_HERE'
}
```

## 🧪 Testing

### Demo Account:
- **Email**: demo@student.com
- **Password**: demo123

### Test the API:

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@student.com","password":"demo123"}'

# Get profile (replace TOKEN with actual token)
curl http://localhost:5000/api/learner/profile \
  -H "Authorization: Bearer TOKEN"
```

## 📊 Sample Data Included

After running `npm run db:seed`, you'll have:

- **16 Subjects** (Mathematics, Science, English, etc.)
- **4 Expert Tutors** (Dr. Sarah Johnson, Prof. Michael Chen, etc.)
- **10 Achievements** (Welcome, Streaks, Note Taker, etc.)
- **1 Demo User** (demo@student.com / demo123)

## 🔧 Troubleshooting

### Database Connection Failed
- Make sure XAMPP MySQL is running
- Check `.env` file has correct credentials
- Default MySQL port is 3306

### Port Already in Use
- Change PORT in `.env` file
- Or stop other services using port 5000

### Tables Not Created
- Run: `npm run db:setup`
- Check MySQL user has CREATE privileges

## 📝 Next Steps

1. **Frontend Integration**: Update React app to use API instead of localStorage
2. **Real-time Features**: Add Socket.io for live chat
3. **File Uploads**: Implement file upload for profile pictures, notes attachments
4. **Email Notifications**: Add email service for important alerts
5. **Payment Integration**: Add Stripe/PayPal for premium subscriptions

## 🛡️ Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input validation

## 📞 Support

For issues or questions, contact: innocent38318@gmail.com

---

**Built with ❤️ by IB Innovative Solutions**


