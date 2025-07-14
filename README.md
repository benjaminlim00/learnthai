# LearnThaiAI - AI-Powered Thai Language Learning Platform

An intelligent Thai language learning web application that leverages OpenAI GPT-4o for contextual vocabulary generation and implements the SM-2 spaced repetition algorithm for scientifically-proven learning optimization.

## 🚀 Quick Setup Guide

### ⚠️ Prerequisites Check

**Required:**

- **Node.js 18+** (required for Next.js 15)
- **npm/yarn** package manager
- **Supabase account** (free tier available)
- **OpenAI API key** (pay-per-use)

### 1. **Clone and Install**

```bash
git clone <your-repo-url>
cd learnthai
npm install
```

### 2. **Database Setup**

- Create a Supabase project at [supabase.com](https://supabase.com)
- Run the SQL from `supabase-setup.sql` in your Supabase SQL Editor
- Get your project URL and keys from Settings > API

### 3. **Environment Configuration**

Create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Rate Limiting (Optional - for production)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### 4. **Authentication Setup**

- In Supabase Dashboard → Authentication → Settings
- Add Site URL: `http://localhost:3000`
- Add Redirect URL: `http://localhost:3000/auth/callback`

### 5. **Start Development**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### 🔧 Getting Your API Keys

**Supabase Keys:**

1. Project Dashboard → Settings → API
2. Copy Project URL, anon key

**OpenAI API Key:**

1. Visit [platform.openai.com](https://platform.openai.com)
2. Create account → API Keys → Create new key
3. **Note**: Usage-based billing, typically $1-5/month for normal use

**Upstash Redis (Optional):**

1. Visit [upstash.com](https://upstash.com) → Create Redis database
2. Copy REST URL and token
3. Only needed for production rate limiting

### 🚨 Common Setup Issues

| Issue             | Solution                                  |
| ----------------- | ----------------------------------------- |
| Build fails       | Ensure Node.js 18+ installed              |
| Auth errors       | Check Supabase site URL and redirect URLs |
| No words generate | Verify OpenAI API key and billing setup   |
| Database errors   | Re-run `supabase-setup.sql` completely    |

## ✨ Key Features

### 🧠 **AI-Powered Learning**

- **Smart Vocabulary Generation**: Generate contextually relevant Thai vocabulary using OpenAI GPT-4o
- **Intelligent Word Filtering**: Avoids repeating words you've already learned
- **Natural Language Examples**: Casual, conversational Thai sentences that real people use

### 📚 **Advanced Spaced Repetition**

- **SM-2 Algorithm Implementation**: Scientific spaced repetition with personalized difficulty tracking
- **Smart Priority System**: Reviews hardest words first with intelligent priority scoring (0-100 points)
- **Progress Tracking**: Visual difficulty indicators with 1-5 star ratings and color coding
- **Flexible Review Modes**: Smart Priority (difficulty-based) vs Time-based (chronological)

### 🎯 **Multi-Modal Learning**

- **Topic-Based Generation**: Learn vocabulary organized by real-world contexts
- **Translation Tool**: Bidirectional Thai ↔ English translation with romanization
- **Comprehensive Review System**: Browse all vocabulary with status tracking and deletion
- **Progress Analytics**: Detailed learning statistics and achievement tracking

### 🎨 **Modern User Experience**

- **Professional Theme System**: Dark theme by default with seamless light mode toggle
- **Responsive Design**: Beautiful UI that works perfectly on all devices
- **Enhanced Loading**: Step-by-step progress animations with Thai cultural elements
- **Component-Based Architecture**: Organized into page-specific component folders

### 🔒 **Enterprise-Grade Security**

- **Supabase Authentication**: Email/password + magic link support
- **Row-Level Security**: Users can only access their own data
- **Rate Limiting**: API protection with Upstash Redis
- **Input Validation**: Comprehensive Zod schema validation
- **Protected Routes**: Authentication-required learning features

## 🏗️ Technical Architecture

### **Frontend Stack**

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3.4 with custom design tokens
- **UI Components**: shadcn/ui + Radix UI primitives
- **Icons**: Lucide React (525+ icons)
- **Fonts**: Inter (UI) + JetBrains Mono (code)
- **Theme**: next-themes with persistent preferences

### **Backend Infrastructure**

- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Supabase Auth with SSR support
- **API**: Next.js API Routes with middleware
- **AI Integration**: OpenAI GPT-4o for vocabulary generation and translation
- **Rate Limiting**: Upstash Redis for API protection
- **Validation**: Zod schemas for type-safe data validation

### **Advanced Features**

- **Spaced Repetition**: Custom SM-2 algorithm implementation
- **Priority Scoring**: Difficulty factor + learning efficiency + status priority + overdue bonus
- **Component Organization**: Page-based folder structure for maintainability
- **Performance**: Optimized with Next.js 15 turbopack for development

## 📊 Application Architecture

```
LearnThaiAI Platform
├── Authentication Layer (Supabase Auth)
├── API Layer (Next.js + Rate Limiting)
│   ├── Vocabulary Management (CRUD)
│   ├── AI Generation (GPT-4o)
│   ├── Translation Service
│   └── Spaced Repetition Engine
├── Frontend (Next.js + TypeScript)
│   ├── Topic Generation Page
│   ├── Review System (SM-2)
│   ├── Translation Tool
│   ├── Browse & Manage
│   └── Account Dashboard
└── Database (Supabase PostgreSQL)
    ├── User Management
    ├── Vocabulary Storage
    └── Learning Analytics
```

## 📁 Project Structure

```
learnthai/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # Backend API routes
│   │   │   ├── generate-vocab/       # GPT-4o vocabulary generation
│   │   │   ├── translate/            # Translation service
│   │   │   └── vocabulary/           # CRUD + spaced repetition
│   │   │       ├── due/              # Smart review scheduling
│   │   │       └── rate/             # SM-2 algorithm updates
│   │   ├── auth/callback/            # Supabase auth callback
│   │   ├── topic/                    # AI vocabulary generation
│   │   ├── translate/                # Translation tool
│   │   ├── review/                   # Spaced repetition system
│   │   ├── account/                  # User dashboard
│   │   ├── globals.css               # Global styles + theme variables
│   │   └── layout.tsx                # Root layout with providers
│   ├── components/                   # Organized component library
│   │   ├── review/                   # Review page components
│   │   │   ├── BrowseVocabulary.tsx
│   │   │   ├── DeleteConfirmationModal.tsx
│   │   │   ├── PriorityModeSelector.tsx
│   │   │   ├── ReviewSession.tsx
│   │   │   └── SessionStats.tsx
│   │   ├── shared/                   # Cross-page components
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── SidebarLayout.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── topic/                    # Topic page components
│   │   │   └── vocabulary-loading.tsx
│   │   └── ui/                       # shadcn/ui components
│   ├── contexts/                     # React contexts
│   │   └── AuthContext.tsx           # Authentication state
│   ├── lib/                          # Core utilities
│   │   ├── middleware.ts             # API middleware & auth
│   │   ├── rate-limit.ts             # Redis rate limiting
│   │   ├── spaced-repetition.ts      # SM-2 algorithm
│   │   ├── supabase.ts               # Database client
│   │   ├── utils.ts                  # Helper functions
│   │   └── validation.ts             # Zod schemas
│   └── types/                        # TypeScript definitions
│       └── database.ts               # Database types
├── public/                           # Static assets
├── supabase-setup.sql                # Database schema
├── components.json                   # shadcn/ui config
├── tailwind.config.js                # Tailwind configuration
└── package.json                      # Dependencies
```

## 🎯 Feature Deep Dive

### 1. **Smart Vocabulary Generation** (`/topic`)

- Enter any topic (e.g., "Ordering food at a restaurant")
- AI generates 10 contextually relevant Thai words
- Includes word, romanization, translation, example sentence
- Filters out words you've already learned
- Save selected words to personal collection

### 2. **Advanced Review System** (`/review`)

- **Smart Priority Mode**: Reviews most difficult words first
- **Time-based Mode**: Reviews by due date (oldest first)
- **SM-2 Algorithm**: Scientific spaced repetition scheduling
- **Visual Progress**: Star ratings and color-coded difficulty
- **Session Management**: Progress tracking with quit/resume

### 3. **Translation Tool** (`/translate`)

- Bidirectional Thai ↔ English translation
- Romanization for Thai text
- Translation history with persistence
- Sample texts for quick testing
- Direction swapping with one click

### 4. **Vocabulary Management** (`/review` browse mode)

- Browse all saved vocabulary
- Filter by status (new/learning/mastered)
- Delete words with progress loss warning
- Difficulty visualization with stars
- Next review date tracking

### 5. **Account Dashboard** (`/account`)

- Learning statistics breakdown
- Progress visualization
- Account management
- Feature overview
- Secure sign-out

## 🔧 API Endpoints

### **Vocabulary Management**

- `POST /api/vocabulary` - Save new vocabulary word
- `GET /api/vocabulary` - Fetch user's vocabulary (with filtering)
- `PUT /api/vocabulary` - Update word status
- `DELETE /api/vocabulary` - Delete vocabulary word
- `GET /api/vocabulary/due` - Get words due for review (smart/time priority)
- `POST /api/vocabulary/rate` - Rate word and update SM-2 values

### **AI Services**

- `POST /api/generate-vocab` - Generate topic-based vocabulary
- `POST /api/translate` - Translate text with romanization

### **Security Features**

- Authentication middleware on all endpoints
- Rate limiting with Redis
- Input validation with Zod schemas
- User-scoped data access

## 🧮 SM-2 Spaced Repetition Algorithm

### **Core Implementation**

- **Ease Factor**: Tracks word difficulty (1.3-3.0+)
- **Interval Calculation**: Days until next review
- **Repetition Count**: Successful review tracking
- **Rating System**: 0-5 scale for recall quality

### **Priority Scoring** (0-100 points)

- **Difficulty Factor** (0-30): Lower ease = higher priority
- **Learning Efficiency** (0-25): Low repetitions vs time studied
- **Status Priority** (0-20): new > learning > mastered
- **Overdue Bonus** (0-15): More overdue = higher priority
- **Interval Adjustment** (0-10): Shorter intervals = higher priority

### **Smart Features**

- Automatic difficulty adjustment based on performance
- Visual indicators (stars, colors) for user feedback
- Flexible scheduling (priority vs chronological)
- Progress persistence across sessions

## 🎨 Design System

### **Theme System**

- **Default**: Professional dark theme
- **Toggle**: Seamless light/dark mode switching
- **Persistence**: Theme preferences saved locally
- **Transitions**: Smooth animations without flash

### **Typography**

- **Inter**: Primary UI font with optimal readability
- **JetBrains Mono**: Code and monospace elements
- **Responsive**: Scales appropriately across devices
- **Accessibility**: Proper contrast and sizing

### **Components**

- **shadcn/ui**: Consistent, accessible component library
- **Radix UI**: Robust interaction primitives
- **Custom Design**: Tailored for language learning
- **Responsive**: Mobile-first approach

## 🚀 Deployment

### **Recommended: Vercel**

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### **Environment Variables for Production**

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
OPENAI_API_KEY=your_openai_api_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### **Alternative Platforms**

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🛠️ Development

### **Available Scripts**

```bash
npm run dev          # Development server with turbopack
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint code checking
```

### **Key Dependencies**

```json
{
  "next": "15.3.5",
  "react": "^19.0.0",
  "typescript": "^5",
  "tailwindcss": "^3.4.14",
  "openai": "^5.9.0",
  "@supabase/supabase-js": "^2.50.5",
  "next-themes": "^0.4.6",
  "zod": "^3.25.76"
}
```

## 📈 Performance & Security

### **Performance Optimizations**

- Next.js 15 with turbopack for fast development
- Component code-splitting for optimal loading
- Image optimization with Next.js
- Efficient database queries with proper indexing

### **Security Measures**

- Row-level security in Supabase
- Rate limiting on all API endpoints
- Input validation and sanitization
- Secure environment variable management
- Protected routes with authentication

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the component organization structure
4. Add proper TypeScript types
5. Test your changes thoroughly
6. Commit with clear messages
7. Push and create Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### **Common Issues**

- **Node.js Version**: Ensure you're using Node.js 18+
- **Environment Variables**: Verify all required keys are set
- **Supabase Setup**: Check database schema and auth configuration
- **OpenAI Limits**: Monitor API usage and billing

### **Getting Help**

1. Check existing [Issues](https://github.com/yourusername/learnthai/issues)
2. Review the troubleshooting section
3. Create detailed issue with error logs
4. Join our community discussions

## 🔮 Roadmap

### **Planned Features**

- [ ] Audio pronunciation with speech synthesis
- [ ] Mobile app (React Native)
- [ ] Gamification (streaks, achievements, leaderboards)
- [ ] Social features (friend challenges, shared progress)
- [ ] Advanced analytics (learning patterns, optimization)
- [ ] Offline support with PWA
- [ ] Multi-language support (Lao, Khmer, Vietnamese)
- [ ] Cultural context explanations
- [ ] Writing practice with character recognition

### **Technical Improvements**

- [ ] Real-time collaborative learning
- [ ] Advanced caching strategies
- [ ] Performance monitoring
- [ ] A/B testing framework
- [ ] Advanced AI models integration

---

**Built with ❤️ by language learning enthusiasts**  
_Powered by Next.js • Supabase • OpenAI • shadcn/ui_
