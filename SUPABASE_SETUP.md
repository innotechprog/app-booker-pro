# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a name for your project (e.g., "ibis-booking-system")
4. Set a database password
5. Choose a region closest to your users

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Navigate to Settings > API
3. Copy your:
   - Project URL
   - Anon (public) key

## 3. Set Up Environment Variables

Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Set Up Database Schema

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Run the SQL script

## 5. Configure Authentication

1. Go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:8080`)
3. Add redirect URLs:
   - `http://localhost:8080/auth/callback`
   - `http://localhost:8080/dashboard`

## 6. Set Up Email Templates (Optional)

1. Go to Authentication > Email Templates
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Magic link

## 7. Test the Integration

1. Start your development server: `npm run dev`
2. Try registering a new user
3. Test the booking flow
4. Check that data is being saved to Supabase

## Database Tables Overview

### Core Tables:
- **users**: Extended user profiles
- **services**: Available services with pricing
- **bookings**: All booking records
- **invoices**: Generated invoices for bank transfers
- **payments**: Payment records
- **agents**: Service agents/providers
- **areas**: Service areas and cities
- **booking_assignments**: Agent assignments to bookings

### Key Features:
- **Row Level Security (RLS)**: Users can only access their own data
- **Real-time subscriptions**: Live updates for booking status
- **Automatic timestamps**: Created/updated timestamps
- **Invoice generation**: Automatic invoice numbering
- **Payment tracking**: Complete payment history

## Security Features

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Row Level Security policies
- **Data validation**: Type-safe database operations
- **API security**: Secure API endpoints

## Next Steps

1. **Customize the schema** based on your specific needs
2. **Add more services** to the services table
3. **Configure PayFast integration** for payments
4. **Set up email notifications** for booking updates
5. **Add admin dashboard** for managing bookings and agents

## Troubleshooting

### Common Issues:

1. **Environment variables not loading**:
   - Restart your development server
   - Check that `.env` file is in the root directory

2. **Authentication errors**:
   - Verify your Supabase URL and key
   - Check redirect URLs in Supabase settings

3. **Database permission errors**:
   - Ensure RLS policies are correctly set up
   - Check that users are authenticated

4. **Real-time not working**:
   - Verify your Supabase project is active
   - Check network connectivity

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
