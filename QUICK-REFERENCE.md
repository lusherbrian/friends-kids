# Quick Reference - Friends Kids

## Your Live App URLs

- **Production**: https://friends-kids-xyz.vercel.app (your actual URL)
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Repo**: https://github.com/YOUR-USERNAME/friends-kids

---

## Making Changes to Your App

### 1. Local Development (Recommended)

**Setup once:**
```bash
# Clone your repo
git clone https://github.com/YOUR-USERNAME/friends-kids.git
cd friends-kids

# Install dependencies
npm install

# Create .env.local file (copy from .env.local.example)
# Add your Supabase credentials

# Run locally
npm run dev
```

Open http://localhost:3000 to see changes in real-time!

**Make changes:**
1. Edit files in your code editor
2. Save - changes appear instantly at localhost:3000
3. When satisfied, commit and push:
   ```bash
   git add .
   git commit -m "Description of what you changed"
   git push
   ```
4. Vercel will auto-deploy in ~2 minutes

### 2. Direct Edit on GitHub (Quick fixes only)

1. Go to your repo on GitHub
2. Navigate to the file you want to edit
3. Click the pencil icon (Edit)
4. Make changes
5. Click "Commit changes"
6. Vercel auto-deploys in ~2 minutes

---

## Common Changes

### Add a New Page

Create file: `app/your-page/page.tsx`
```typescript
export default function YourPage() {
  return <div>Your content here</div>
}
```
Access at: `https://yourapp.com/your-page`

### Change Color Scheme

Edit: `tailwind.config.js`
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color', // Main color
      },
    },
  },
},
```

### Add a Database Table

1. Go to Supabase → SQL Editor
2. Write your SQL:
```sql
CREATE TABLE your_table (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Add policy
CREATE POLICY "Users can view their own data"
  ON your_table FOR SELECT
  USING (auth.uid() = user_id);
```
3. Run it
4. Update TypeScript types in `types/database.ts`

---

## Viewing Logs & Debugging

### Vercel Logs
1. Go to Vercel Dashboard
2. Click on your project
3. Click on a deployment
4. Click "Functions" or "Runtime Logs"

### Supabase Logs
1. Go to Supabase Dashboard
2. Click "Logs" in left sidebar
3. View API requests, errors, etc.

### Local Development
- Open browser console (F12)
- Look at Terminal where you ran `npm run dev`

---

## Database Queries (Supabase Dashboard)

View your data:
1. Supabase → Table Editor
2. Select a table
3. View/edit rows directly

Run SQL:
1. Supabase → SQL Editor
2. New query
3. Write SQL and run

---

## Adding Environment Variables

### In Vercel:
1. Project Settings → Environment Variables
2. Add variable name and value
3. Click "Save"
4. **Important**: Redeploy for changes to take effect!

### Locally:
1. Edit `.env.local` file
2. Add: `VARIABLE_NAME=value`
3. Restart dev server

---

## Rollback to Previous Version

1. Vercel Dashboard → Deployments
2. Find a working deployment
3. Click "⋯" → "Promote to Production"

---

## Cost Monitoring

### Vercel Usage:
- Dashboard → Usage
- Free tier: Unlimited deployments, 100GB bandwidth

### Supabase Usage:
- Project Settings → Usage & Billing
- Free tier: 500MB database, 50K monthly active users

Set up alerts when approaching limits!

---

## Security Checklist

✅ Never commit `.env.local` to GitHub (it's in .gitignore)
✅ Keep your Supabase service_role key secret
✅ Use environment variables for all secrets
✅ Review RLS policies before adding tables
✅ Keep dependencies updated: `npm update`

---

## Getting Help

- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs  
- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Useful Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (test before deploying)
npm run build

# Start production build locally
npm start

# Lint code
npm run lint

# Git commands
git status                    # See what changed
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push                      # Push to GitHub (triggers deploy)
git pull                      # Pull latest from GitHub
git log                       # View commit history
```

---

## Feature Development Workflow

1. **Plan** - Write down what you want to build
2. **Branch** (optional): `git checkout -b feature-name`
3. **Code** - Make changes locally, test at localhost:3000
4. **Test** - Click around, test edge cases
5. **Commit**: `git add . && git commit -m "Add feature"`
6. **Push**: `git push` (or `git push -u origin feature-name` for new branch)
7. **Verify** - Check Vercel deployment
8. **Monitor** - Watch for errors in first few hours

---

Keep this file handy! 📌
