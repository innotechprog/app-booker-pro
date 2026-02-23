# IBIS - Innovative Business Solutions

A comprehensive business solutions platform built with React, TypeScript, and modern web technologies.

## Features

- **Education Services**: University applications, tutoring, and academic support
- **Send Me Services**: Personal errand running, delivery services, and on-demand assistance
- **IT Solutions**: Professional IT services including web development and technical support
- **Agent Registration**: Platform for agents and service providers to join and offer services
- **Booking System**: Easy service booking and management
- **Admin Dashboard**: Comprehensive admin panel for managing applications and services

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - Modern UI library
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend-as-a-Service for database and authentication
- **React Router** - Client-side routing
- **React Helmet Async** - SEO meta tag management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd app-booker-pro
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy .env.example and set your values
cp .env.example .env

# Backend: this app uses ib-backend for all API calls (auth, Smart Apply, contact, etc.).
# Point VITE_API_URL to your running ib-backend (default: http://localhost:5000/api).
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

### Backend (ib-backend)

All API requests (auth, Smart Apply, contact, bookings, etc.) go to **ib-backend**, not a backend inside this repo. Run the backend from `C:\xampp\htdocs\ib-backend` (or your ib-backend path) and set `VITE_API_URL` in `.env` to its base URL (e.g. `http://localhost:5000/api`).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
└── main.tsx           # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push to the branch
6. Create a Pull Request

## License

This project is licensed under the MIT License.