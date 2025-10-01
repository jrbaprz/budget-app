# Supabase Authentication Setup

This guide will help you configure Supabase authentication for your budget app.

## Step 1: Get Your Supabase Credentials

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create a new account
3. Create a new project (or select your existing project)
4. Go to **Project Settings** (gear icon in the sidebar)
5. Click on **API** in the left menu
6. You'll find two important values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

## Step 2: Configure Environment Variables

Open the `.env.local` file in the root of your project and replace the placeholder values:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## Step 3: Configure Email Authentication in Supabase

By default, Supabase requires email confirmation for new signups. You have two options:

### Option A: Disable Email Confirmation (for development)
1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Email** provider
3. Scroll down and toggle **"Confirm email"** to OFF
4. Click **Save**

### Option B: Configure Email Templates (for production)
1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation email template
3. Users will receive a confirmation email when they sign up

## Step 4: Test the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal)

3. Test the authentication flow:
   - **Sign Up**: Create a new account with an email and password
   - **Login**: Log in with your credentials
   - **Logout**: Click on the budget name in the sidebar → Logout

## Features Implemented

✅ **Sign Up**: Create new accounts with email and password  
✅ **Login**: Sign in with existing credentials  
✅ **Logout**: Sign out and return to login screen  
✅ **Session Management**: Automatic session persistence across page refreshes  
✅ **Protected Routes**: App content only visible to authenticated users  
✅ **User Email Display**: Shows logged-in user's email in the sidebar  

## Troubleshooting

### "Missing Supabase environment variables" Error
- Make sure your `.env.local` file is in the project root
- Ensure variable names start with `VITE_` (required for Vite)
- Restart the dev server after changing environment variables

### Email Confirmation Issues
- Check if email confirmation is required in Supabase settings
- For development, disable email confirmation (see Option A above)
- Check your spam folder for confirmation emails

### Authentication Not Working
- Verify your Supabase URL and anon key are correct
- Check the browser console for error messages
- Ensure your Supabase project is active and not paused

## Next Steps

Consider implementing these additional features:

- **Password Reset**: Add forgot password functionality
- **Social Auth**: Add Google, GitHub, or other OAuth providers
- **User Profiles**: Store additional user data in Supabase
- **Database Integration**: Store budgets and transactions in Supabase
- **Real-time Sync**: Sync data across devices using Supabase real-time features
