# Friends Kids - Setup Guide

This guide will walk you through setting up your Friends Kids app from scratch.

## Prerequisites

- A Google account (lusher.brian@gmail.com)
- Basic familiarity with using a web browser
- About 15-20 minutes

---

## Step 1: Create Accounts (5 minutes)

### 1.1 GitHub Account
1. Go to https://github.com/signup
2. Click "Sign up"
3. Use your Google account: lusher.brian@gmail.com
4. Follow the prompts to create your account
5. Verify your email

### 1.2 Vercel Account
1. Go to https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub account
4. Complete the signup

### 1.3 Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Click "Continue with GitHub"
4. Authorize Supabase to access your GitHub account

---

## Step 2: Set Up Supabase Database (5 minutes)

### 2.1 Create a New Project
1. In Supabase dashboard, click "New Project"
2. Enter project details:
   - **Name**: friends-kids
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you (e.g., "US East" for Charlotte, NC)
3. Click "Create new project"
4. Wait 2-3 minutes for setup to complete

### 2.2 Set Up Database Schema
1. In your project dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the ENTIRE contents of `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click "Run" (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned"

### 2.3 Enable Google OAuth
1. Go to "Authentication" → "Providers" in the left sidebar
2. Find "Google" in the list
3. Toggle it ON
4. Open a new tab and go to https://console.cloud.google.com
5. Create a new project (or use existing):
   - Click "Select a project" → "New Project"
   - Name it "Friends Kids"
   - Click "Create"
6. Enable Google+ API:
   - Search for "Google+ API" in the search bar
   - Click "Enable"
7. Create OAuth credentials:
   - Go to "Credentials" in left sidebar
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure consent screen:
     - Choose "External"
     - Fill in app name: "Friends Kids"
     - Add your email: lusher.brian@gmail.com
     - Click "Save and Continue" through the steps
   - Back to Create OAuth client ID:
     - Application type: "Web application"
     - Name: "Friends Kids"
     - Authorized redirect URIs: (Get this from Supabase - it shows on the Google provider page)
       - Should look like: `https://your-project-ref.supabase.co/auth/v1/callback`
     - Click "Create"
8. Copy the Client ID and Client Secret
9. Back in Supabase, paste them into the Google provider settings
10. Click "Save"

### 2.4 Get Your Supabase Credentials
1. Go to "Project Settings" → "API" in Supabase
2. You'll need these values (keep this tab open):
   - **Project URL**: Something like `https://abcdefgh.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

---

## Step 3: Deploy to GitHub and Vercel (7 minutes)

### 3.1 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `friends-kids`
3. Description: "Birthday tracking app for friends' kids"
4. Choose "Private" (recommended)
5. Click "Create repository"
6. **DON'T** close this page - you'll need it

### 3.2 Upload Code to GitHub
1. Download the `friends-kids` folder to your computer
2. Open Terminal (Mac) or Command Prompt (Windows)
3. Navigate to the downloaded folder:
   ```bash
   cd path/to/friends-kids
   ```
4. Initialize git and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/friends-kids.git
   git push -u origin main
   ```
   Replace `YOUR-USERNAME` with your GitHub username

### 3.3 Deploy to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Find "friends-kids" in the list and click "Import"
4. **Add Environment Variables** (this is critical!):
   - Click "Environment Variables"
   - Add these three variables (get values from Supabase):
     
     Name: `NEXT_PUBLIC_SUPABASE_URL`
     Value: Your Supabase Project URL (from Step 2.4)
     
     Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     Value: Your Supabase anon public key (from Step 2.4)
     
     Name: `NEXT_PUBLIC_SITE_URL`
     Value: `https://friends-kids.vercel.app` (or your custom domain)
     
5. Click "Deploy"
6. Wait 2-3 minutes for deployment
7. You'll get a URL like `https://friends-kids-xyz.vercel.app`

### 3.4 Update Supabase Redirect URLs
1. Go back to Supabase → "Authentication" → "URL Configuration"
2. Add your Vercel URL to "Site URL": `https://your-vercel-url.vercel.app`
3. Add to "Redirect URLs": `https://your-vercel-url.vercel.app/auth/callback`
4. Click "Save"

### 3.5 Update Google OAuth Redirect
1. Go back to Google Cloud Console
2. Go to "Credentials"
3. Click on your OAuth 2.0 Client ID
4. Add to "Authorized redirect URIs":
   - `https://your-vercel-url.vercel.app/auth/callback`
5. Click "Save"

---

## Step 4: Test Your App! (2 minutes)

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should see the Friends Kids landing page
3. Click "Sign in with Google"
4. Authorize with your Google account
5. You should be redirected to the dashboard!

---

## What You've Built

✅ Fully functional web app
✅ Secure Google OAuth login
✅ PostgreSQL database with proper security
✅ Automatic HTTPS and global CDN
✅ Free hosting (within limits)

---

## Next Steps - Adding Features

The current app has:
- ✅ Add/view friends
- ✅ Add/view kids with birthdays
- ✅ Upcoming birthdays sidebar
- ✅ Birthday reminders toggle

### To add later (in order of complexity):

1. **Gift Tracking** (Easy)
   - Track gifts purchased for each kid
   - Mark if you've gotten a party gift

2. **Pregnancy Tracking** (Easy)
   - Track due dates for pregnant friends
   - Prompt to add kid after birth

3. **Party Tracking** (Medium)
   - Track upcoming birthday parties
   - Location and RSVP status

4. **Email Reminders** (Medium)
   - Set up SendGrid or Resend
   - Automated birthday reminder emails

5. **CSV Import** (Medium)
   - Import contacts from CSV file
   - Parse and add multiple kids at once

6. **iOS App** (Advanced)
   - Build with React Native
   - Contact integration
   - Push notifications

---

## Troubleshooting

### "Invalid credentials" error
- Double-check environment variables in Vercel
- Make sure Supabase URLs are correct
- Redeploy after fixing

### Google sign-in doesn't work
- Check redirect URLs match exactly
- Make sure Google OAuth is enabled in Supabase
- Check Google Cloud Console credentials

### Database errors
- Make sure SQL schema ran successfully
- Check RLS policies are enabled

### App not loading
- Check Vercel deployment logs
- Make sure all dependencies installed
- Try redeploying

---

## Costs

### Current Setup (FREE):
- Vercel: Free tier (unlimited hobby projects)
- Supabase: Free tier (500MB database, 50K users)
- Total: **$0/month**

### If you scale to 1000+ users:
- Vercel Pro: $20/month
- Supabase Pro: $25/month  
- Email service: $10/month
- Total: **~$55/month**

---

## Support & Updates

To update the app:
1. Make changes to code
2. Commit to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
3. Vercel will auto-deploy (usually 2-3 min)

For help:
- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs

---

## Security Notes

🔒 **Keep these SECRET:**
- Supabase service_role key (DON'T use in frontend)
- Database password
- Google OAuth client secret

✅ **Safe to share:**
- Supabase URL
- Supabase anon key (it's protected by RLS)
- Vercel deployment URL

Your data is protected by:
- Row Level Security (users can only see their own data)
- HTTPS encryption
- OAuth authentication
- Supabase's enterprise-grade security

---

Enjoy tracking your friends' kids birthdays! 🎂
