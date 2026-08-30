# InstaReel Analytics Dashboard

A production-quality Instagram Reel Promotion Analytics Dashboard built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts, and Supabase PostgreSQL.

## Features

### 🔐 Authentication & Authorization
- **Supabase Auth** with email/password authentication
- **Role-based access control**: Admin Panel vs Read-Only User Panel
- **Row Level Security (RLS)** policies for data protection
- Protected routes with middleware

### 📊 User Dashboard (Read-Only)
- **KPI Cards**: Total promotion spend, total reels, total views, likes, comments, engagement, avg views/reel, CPM, engagement rate
- **Charts**: 
  - Spend vs Views (scatter)
  - Views over time (area)
  - Engagement over time (line)
  - Campaign comparison (bar)
- **Top Performing Reels Table** with ranking, metrics, spend, and CPM
- **Highlight Cards**: Most viewed, liked, commented, highest engagement, highest spend, most cost-efficient
- **Global Filters**: Date range, campaign, username, engagement rate
- **Export**: Excel (.xlsx) and PDF reports
- **Print-friendly** layout

### 🛠 Admin Panel
- **Bulk XLSX Import**:
  - Column validation
  - Data preview with invalid row detection
  - Duplicate Reel URL detection
  - Insert new / update existing records
  - Import history tracking
- **Campaign Management**:
  - Create/edit/delete campaigns
  - Set total promotion budget (₹4,27,000 default)
  - Assign reels to campaigns
  - Budget allocation strategies:
    - Manual entry
    - Equal distribution
    - Proportional to views
    - Proportional to likes
    - Proportional to engagement
- **User Management**: Create users, assign roles (admin/user)

### 📁 Data Model
- **Reels** (organic metrics): URL, username, title, description, hashtags, caption, views, likes, comments, plays, duration, published date
- **Campaigns**: Name, description, total budget, spent budget, dates, status
- **Campaign Reels** (paid metrics): Promotion spend, views, clicks, impressions, engagement
- **Import History**: Filename, rows processed, new/updated/skipped/error counts, status

### 💰 Currency & Localization
- **Indian Rupee (₹)** formatting throughout
- Compact number formatting (K, L, Cr)
- Date formatting for Indian locale

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| File Upload | XLSX (SheetJS) |
| Export | ExcelJS + jsPDF |
| Forms | React Hook Form + Zod |
| State | TanStack Query |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone and install dependencies**
```bash
cd insta-reel-analytics
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. **Set up Supabase Database**
- Create a new Supabase project
- Run the migrations in `supabase/migrations/` in order:
  - `20240115000000_initial_schema.sql`
  - `20240115000001_seed_data.sql` (optional, for demo data)

4. **Enable Supabase Auth**
- Go to Authentication > Settings
- Enable Email provider
- Configure email templates if needed

5. **Run development server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials
After running seed data:
- **Admin**: admin@insta-reel.com / admin123
- **User**: user@insta-reel.com / user123

## Project Structure

```
insta-reel-analytics/
├── src/
│   ├── app/
│   │   ├── (auth)/login/          # Login page
│   │   ├── admin/                  # Admin panel routes
│   │   │   ├── import/             # XLSX bulk import
│   │   │   ├── campaigns/          # Campaign management
│   │   │   └── users/              # User management
│   │   ├── dashboard/              # User dashboard
│   │   ├── reel/[id]/              # Reel detail page
│   │   ├── api/                    # API routes
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home (redirects)
│   │   ├── globals.css             # Global styles
│   │   └── providers.tsx           # Context providers
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── layout/                 # Layout components
│   │   ├── dashboard/              # Dashboard components
│   │   └── admin/                  # Admin components
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.tsx             # Authentication
│   │   ├── useReels.ts             # Reel data fetching
│   │   ├── useCampaigns.ts         # Campaign data fetching
│   │   ├── useDashboard.ts         # Dashboard metrics
│   │   ├── useImport.ts            # XLSX import logic
│   │   └── useToast.ts             # Toast notifications
│   ├── lib/
│   │   ├── supabase/               # Supabase clients
│   │   ├── utils.ts                # Utility functions
│   │   └── validations.ts          # Zod schemas
│   ├── types/                      # TypeScript types
│   └── middleware.ts               # Auth middleware
├── supabase/
│   └── migrations/                 # SQL migrations
├── scripts/                        # Utility scripts
├── public/                         # Static assets
├── .env.example                    # Environment template
├── render.yaml                     # Render deployment config
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json
```

## Database Schema

### Key Tables
- `profiles` - User profiles extending Supabase auth
- `campaigns` - Promotion campaigns
- `reels` - Organic reel metrics
- `campaign_reels` - Paid promotion metrics per reel per campaign
- `import_history` - Bulk import audit trail

### Views
- `reel_analytics` - Combined organic + paid metrics per reel
- `campaign_analytics` - Aggregated campaign performance

### Indexes
- `reels.reel_url` (unique)
- `reels.published_date`
- `reels.username`
- `campaign_reels.campaign_id`
- `campaign_reels.reel_id`

### RLS Policies
- Users can view own profile
- Admins can manage all profiles
- Anyone can view reels and campaign data
- Admins can manage campaigns, reels, campaign_reels, import_history

## XLSX Import Format

### Required Columns
| Column | Type | Example |
|--------|------|---------|
| Reel URL | URL | `https://www.instagram.com/reel/ABC123/` |
| Username | String | `fashionista_isha` |
| Likes | Integer | `45200` |
| Comments | Integer | `1250` |
| Published Date | Date (YYYY-MM-DD) | `2024-03-15` |
| Views/Plays | Integer | `1250000` |

### Optional Columns
| Column | Type | Example |
|--------|------|---------|
| Title | String | `Summer Vibes Outfit` |
| Description | String | `Check out this amazing summer outfit!` |
| Hashtags | String (comma-separated) | `summer, fashion, ootd, style` |
| Full Caption | String | `Check out this amazing summer outfit! #summer #fashion` |
| Duration | Integer (seconds) | `30` |

Download template from the Import page.

## Budget Allocation Strategies

| Strategy | Description |
|----------|-------------|
| `manual` | Admin enters spend per reel manually |
| `equal` | Budget divided equally among selected reels |
| `proportional_views` | Based on organic views proportion |
| `proportional_likes` | Based on organic likes proportion |
| `proportional_engagement` | Based on (likes + comments) proportion |

## Deployment

### Render (Recommended)

1. **Connect repository to Render**
2. **Create PostgreSQL database** (or use Supabase)
3. **Set environment variables** in Render dashboard
4. **Deploy using `render.yaml`**

The `render.yaml` includes:
- Web service (Next.js)
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variables

### Vercel
```bash
npm i -g vercel
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server) | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | No |
| `NEXT_PUBLIC_APP_NAME` | App name for branding | No |

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run db:push      # Push migrations to Supabase
npm run db:reset     # Reset database
npm run db:seed      # Run seed script
```

## API Routes

- `GET /api/reels` - List reels with filters
- `GET /api/reels/[id]` - Get reel details
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `POST /api/import` - Process XLSX import
- `GET /api/export` - Export data

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please open a GitHub issue.

---

Built with ❤️ for Instagram marketing analytics