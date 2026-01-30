# Friends Kids 🎂

A web application to track your friends' kids, their birthdays, gifts, and upcoming parties. Never forget a birthday again!

## Features

- 🔐 **Secure Google OAuth Login** - Sign in with your Google account
- 👥 **Friend Management** - Keep track of all your friends and their contact info
- 👶 **Kids Tracking** - Add kids with names and birthdates
- 🎈 **Birthday Calendar** - See upcoming birthdays at a glance
- 🎁 **Gift Tracking** - Track what gifts you've purchased (coming soon)
- 🔔 **Smart Reminders** - Toggle reminders on/off per kid
- 🤰 **Pregnancy Tracking** - Track due dates for expecting friends (coming soon)
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 14 (React), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Hosting**: Vercel
- **Deployment**: Automatic via GitHub

## Getting Started

See [SETUP-GUIDE.md](./SETUP-GUIDE.md) for detailed setup instructions.

### Quick Start

1. Clone this repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials
4. Run development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
friends-kids/
├── app/                          # Next.js 14 App Router
│   ├── auth/
│   │   └── callback/            # OAuth callback handler
│   ├── dashboard/               # Main app pages
│   │   ├── friend/[id]/        # Friend detail page
│   │   └── page.tsx            # Dashboard home
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing/login page
├── components/                  # React components (future)
├── lib/
│   └── supabase.ts             # Supabase client setup
├── types/
│   └── database.ts             # TypeScript types
├── supabase-schema.sql         # Database schema
├── SETUP-GUIDE.md              # Detailed setup instructions
└── package.json
```

## Database Schema

- **friends** - Your friends list with contact info
- **kids** - Kids linked to friends with birthdays
- **gifts** - Gift tracking for each kid
- **parties** - Birthday party details
- **pregnancies** - Track due dates for expecting friends

All tables have Row Level Security (RLS) enabled to ensure users can only see their own data.

## Roadmap

### Current Version (v1.0) ✅
- [x] Google OAuth login
- [x] Add/view friends
- [x] Add/view kids
- [x] Birthday tracking
- [x] Upcoming birthdays sidebar
- [x] Reminder toggles

### Coming Soon (v1.1)
- [ ] Gift tracking functionality
- [ ] Party tracking
- [ ] Pregnancy/due date tracking
- [ ] Edit friends and kids
- [ ] Email reminders
- [ ] CSV import for bulk adding

### Future (v2.0)
- [ ] iOS mobile app (React Native)
- [ ] iOS Contacts integration
- [ ] Push notifications
- [ ] Gift ideas suggestions
- [ ] Sharing lists with spouse/partner
- [ ] Photo gallery per kid

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

## License

MIT License - feel free to use this for your own projects

## Support

For issues or questions, check the setup guide or create an issue on GitHub.

---

Built with ❤️ using Next.js, Supabase, and Vercel
"# friends-kids" 
"# friends-kids" 
"# friends-kids" 
"# friends-kids" 
"# friends-kids" 
