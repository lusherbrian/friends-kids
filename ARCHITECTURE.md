# Friends Kids - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                    https://friends-kids.vercel.app              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                      VERCEL CDN / EDGE                           │
│  - SSL/TLS Termination                                          │
│  - Global Content Delivery                                      │
│  - Automatic deployments from GitHub                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                    NEXT.JS APPLICATION                           │
│                    (Server + Client)                             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SERVER SIDE (Next.js App Router)                       │   │
│  │  - app/page.tsx (Landing page)                          │   │
│  │  - app/dashboard/page.tsx (Main dashboard)              │   │
│  │  - app/dashboard/friend/[id]/page.tsx (Friend details)  │   │
│  │  - app/auth/callback/route.ts (OAuth handler)           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CLIENT SIDE (React Components)                         │   │
│  │  - User interactions                                     │   │
│  │  - Form handling                                         │   │
│  │  - Real-time updates                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Supabase Client
                             │ (@supabase/supabase-js)
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                      SUPABASE BACKEND                            │
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │   AUTHENTICATION     │      │   POSTGRESQL DB      │        │
│  │   - Google OAuth     │      │   - friends table    │        │
│  │   - Session mgmt     │      │   - kids table       │        │
│  │   - JWT tokens       │      │   - gifts table      │        │
│  └──────────────────────┘      │   - parties table    │        │
│                                 │   - pregnancies tbl  │        │
│  ┌──────────────────────┐      └──────────────────────┘        │
│  │  ROW LEVEL SECURITY  │                                       │
│  │  - User isolation    │                                       │
│  │  - Policy enforcement│                                       │
│  └──────────────────────┘                                       │
│                                                                  │
│  ┌──────────────────────┐                                       │
│  │   REALTIME (future)  │                                       │
│  │   - Live updates     │                                       │
│  │   - Subscriptions    │                                       │
│  └──────────────────────┘                                       │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Authentication Flow
```
User clicks "Sign in with Google"
    ↓
Next.js initiates OAuth with Supabase
    ↓
Redirected to Google OAuth
    ↓
User authorizes
    ↓
Google redirects to /auth/callback with code
    ↓
Supabase exchanges code for session
    ↓
User redirected to /dashboard
    ↓
Session stored in cookies (httpOnly, secure)
```

### 2. Data Fetch Flow (e.g., Dashboard)
```
User visits /dashboard
    ↓
Next.js checks authentication (session from cookies)
    ↓
If authenticated:
  ├─ Fetch friends (SELECT * FROM friends WHERE user_id = ?)
  ├─ For each friend, fetch kids
  └─ Calculate upcoming birthdays
    ↓
Render page with data
    ↓
Client-side React hydrates and becomes interactive
```

### 3. Data Create Flow (e.g., Add Friend)
```
User fills form and clicks "Add Friend"
    ↓
React handles form submission
    ↓
Supabase client.from('friends').insert(...)
    ↓
Supabase checks RLS policy (user_id = auth.uid())
    ↓
If authorized:
  ├─ Insert into PostgreSQL
  ├─ Return success
  └─ Trigger updated_at
    ↓
React updates UI with new friend
```

## Security Layers

### Layer 1: Network Security
- All traffic over HTTPS (TLS 1.3)
- Vercel Edge Network DDoS protection
- Rate limiting on API routes

### Layer 2: Authentication
- OAuth 2.0 via Google
- JWT tokens (signed, httpOnly cookies)
- Session expiry (configurable)
- No password storage (delegated to Google)

### Layer 3: Authorization (RLS)
- Row Level Security on all tables
- Policies enforce user_id = auth.uid()
- Users can only access their own data
- CASCADE deletes protect referential integrity

### Layer 4: Application Security
- TypeScript for type safety
- Input validation on forms
- XSS protection (React escaping)
- CSRF protection (SameSite cookies)
- No sensitive data in client code

## Database Schema Relationships

```
users (Supabase Auth - managed)
  │
  │ 1:N
  ↓
friends
  ├─ id (PK)
  ├─ user_id (FK → auth.users)
  ├─ name
  ├─ email
  ├─ phone
  ├─ notes
  └─ reminder_enabled
  │
  ├─ 1:N → kids
  │   ├─ id (PK)
  │   ├─ friend_id (FK → friends)
  │   ├─ name
  │   ├─ birthdate
  │   └─ reminder_enabled
  │   │
  │   ├─ 1:N → gifts
  │   │   ├─ id (PK)
  │   │   ├─ kid_id (FK → kids)
  │   │   ├─ description
  │   │   ├─ purchased
  │   │   ├─ purchase_date
  │   │   └─ price
  │   │
  │   └─ 1:N → parties
  │       ├─ id (PK)
  │       ├─ kid_id (FK → kids)
  │       ├─ party_date
  │       ├─ location
  │       └─ gift_purchased
  │
  └─ 1:N → pregnancies
      ├─ id (PK)
      ├─ friend_id (FK → friends)
      ├─ due_date
      ├─ baby_born
      └─ birth_date
```

## File Structure & Responsibilities

```
app/
├── page.tsx                    # Landing page, OAuth initiation
├── layout.tsx                  # Root layout, global styles
├── globals.css                 # Tailwind CSS setup
├── dashboard/
│   ├── page.tsx               # Main dashboard (friends list, upcoming birthdays)
│   └── friend/[id]/
│       └── page.tsx           # Friend detail (kids list, add kid)
└── auth/
    └── callback/
        └── route.ts           # OAuth callback handler

lib/
└── supabase.ts                # Supabase client initialization

types/
└── database.ts                # TypeScript interfaces for DB tables

components/ (future)
├── FriendCard.tsx             # Reusable friend display
├── KidCard.tsx                # Reusable kid display
├── Modal.tsx                  # Reusable modal component
└── DatePicker.tsx             # Custom date picker
```

## Environment Variables

### Required Variables
```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Public anon key (RLS protected)
NEXT_PUBLIC_SITE_URL            # Your app URL (for OAuth redirect)
```

### Why "NEXT_PUBLIC_"?
- Prefix makes variables available in browser
- Supabase client needs these on client-side
- Safe because RLS protects data access
- Never expose service_role key this way!

## Performance Optimizations

### Current
- ✅ Static page generation where possible
- ✅ Automatic code splitting (Next.js)
- ✅ Edge caching via Vercel CDN
- ✅ Image optimization (Next.js Image)
- ✅ Minimal JavaScript bundles

### Future Improvements
- [ ] React Server Components for data fetching
- [ ] Database indexes on frequently queried columns
- [ ] Lazy loading for long lists
- [ ] Optimistic UI updates
- [ ] Service worker for offline support
- [ ] Supabase Realtime for live updates

## Scalability Considerations

### Current Limits (Free Tiers)
- Vercel: Unlimited deployments, 100GB bandwidth
- Supabase: 500MB database, 50K monthly active users
- Good for: ~1,000 active users

### Scaling Path
1. **1K-10K users**: Stay on free tiers, might need Supabase Pro
2. **10K-100K users**: Vercel Pro ($20/mo) + Supabase Pro ($25/mo)
3. **100K+ users**: Team plans, dedicated infrastructure

### Bottlenecks to Watch
1. Database size (500MB limit on free)
2. Bandwidth (100GB/month on free Vercel)
3. Concurrent connections to Supabase
4. Authentication rate limits

---

## Deployment Pipeline

```
Local Development
    ↓ (git commit)
GitHub Repository
    ↓ (webhook)
Vercel Build System
    ↓ (build & test)
Vercel Edge Network
    ↓ (deployed)
Production URL (live)
```

**Deployment time**: ~2-3 minutes from git push to live

---

This architecture provides:
- ✅ Security by default
- ✅ Scalability path
- ✅ Developer experience
- ✅ Cost efficiency
- ✅ Modern best practices
