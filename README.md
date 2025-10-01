# Legendary Heroes

A modern Next.js application built with Supabase for backend services and Redux for state management. This project demonstrates a scalable, well-organized architecture without a traditional backend.

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Redux Toolkit with Redux Persist
- **Backend**: Supabase (Database, Auth, Storage)
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom component library with CVA
- **Language**: TypeScript

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (if needed)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── forms/            # Form components
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client and helpers
│   └── utils.ts          # Utility functions
├── store/                # Redux store configuration
│   ├── slices/           # Redux slices
│   └── index.ts          # Store setup
└── types/                # TypeScript type definitions
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

1. Copy `.env.local.example` to `.env.local`
2. Get your Supabase credentials from your project dashboard
3. Fill in the environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the following SQL in your Supabase SQL editor to create the users table:

```sql
-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Architecture Overview

### State Management
- **Redux Toolkit**: Modern Redux with less boilerplate
- **Redux Persist**: Automatically persist auth state
- **TypeScript**: Fully typed state and actions

### Authentication Flow
1. User signs in/up through Supabase Auth
2. Auth state is managed in Redux store
3. Session is automatically persisted
4. Protected routes can check auth state

### Database Operations
- **Supabase Client**: Configured with TypeScript types
- **Helper Functions**: Organized database operations
- **Row Level Security**: Secure data access

### UI Components
- **Design System**: Consistent, reusable components
- **Tailwind CSS**: Utility-first styling
- **CVA**: Component variant management
- **Form Handling**: React Hook Form with validation

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📝 Key Features

- ✅ **Authentication**: Sign up, sign in, sign out
- ✅ **State Persistence**: Auth state survives page reloads
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Form Validation**: Client-side validation with Zod
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Scalable Structure**: Easy to extend and maintain

## 🚀 Next Steps

This foundation provides:
- User authentication system
- Basic UI components
- Redux state management
- Supabase integration
- Type-safe development environment

You can now build upon this structure to add:
- User profiles
- File uploads
- Real-time subscriptions
- Protected routes
- Additional data models
- API endpoints

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)