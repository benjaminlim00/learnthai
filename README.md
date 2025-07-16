# LearnThaiAI - AI-Powered Thai Language Learning Platform

An intelligent Thai language learning web application with AI-powered vocabulary generation, advanced pronunciation coaching, and scientifically-proven spaced repetition learning.

## 🚀 Quick Setup

### Prerequisites

- Node.js 18+
- Supabase account (free tier)
- OpenAI API key (pay-per-use)

### Installation

```bash
git clone <repo-url>
cd learnthai
npm install
```

### Environment Setup

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Azure Speech Service Configuration (for Thai TTS)
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_azure_speech_region

# Rate Limiting (Optional)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### Database Setup

1. Create Supabase project
2. Run `supabase-clean-setup.sql` in SQL Editor
3. Set Site URL: `http://localhost:3000`
4. Set Redirect URL: `http://localhost:3000/auth/callback`

### Start Development

```bash
npm run dev
```

## 🏗️ Technical Architecture

### **Technology Stack**

- **Frontend**: Next.js 15, React 19, TypeScript 5, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth + Storage)
- **AI Services**: OpenAI GPT-4o, Whisper (STT), TTS
- **Infrastructure**: Vercel (hosting), Upstash Redis (rate limiting)

### **Core Systems**

1. **Vocabulary Management**: SM-2 spaced repetition algorithm with enhanced priority scoring
2. **AI Content Generation**: GPT-4o powered vocabulary with context filtering
3. **Translation Service**: Bidirectional Thai-English with romanization
4. **Smart Pronunciation Coaching**: Advanced Thai phonetic analysis (400+ lines)
5. **Speaking Practice**: Audio recording, transcription, AI feedback

### **Database Schema**

- **vocabulary**: User's words with SM-2 data (interval, ease_factor, repetitions, next_review)
- **user_profiles**: User preferences for TTS voice gender
- **generation_logs**: Daily usage tracking for rate limiting
- **pronunciation_sessions**: Speaking practice history and analysis
- **cached_audio**: TTS audio caching for cost optimization

### **Security**

- Row Level Security (RLS) on all tables
- JWT authentication via Supabase Auth
- Redis-based rate limiting (in progress)
- Zod schema validation
- Protected routes with authentication

### **Smart Pronunciation Coaching**

**Components:**

- `thai-scoring.ts`: Thai phonetic analysis (400+ lines)
- `pronunciation-analysis.ts`: Temporal analysis, trend detection
- `SmartCoach.tsx`: Modular UI with separate results components
- `SmartCoachResults.tsx`: Detailed analysis display

**Thai Linguistic Intelligence:**

- 5 tone detection with difficulty multipliers
- Consonant classification (Low/Mid/High)
- Syllable segmentation
- Weighted scoring (tones: 25pts, vowels: 20pts, consonants: 15pts)

**Analysis Features:**

- Temporal weighting with exponential decay
- Linear regression for learning velocity
- Error categorization (Critical/Major/Moderate/Minor)
- Personalized improvement recommendations

### **Speaking Practice Pipeline**

1. **Recording**: MediaRecorder API
2. **Transcription**: OpenAI Whisper
3. **Analysis**: GPT-4o pronunciation comparison
4. **Feedback**: AI-generated advice
5. **TTS Comparison**: Side-by-side audio playback

### **Spaced Repetition (SM-2)**

- **Priority Scoring**: Difficulty + efficiency + status + overdue
- **Adaptive Learning**: Ease factor adjustments (1.3-3.0+)
- **Review Modes**: Priority-based vs. time-based
- **Visual Progress**: Star ratings, color coding

## 🔧 API Endpoints

### **Vocabulary**

- `POST /api/vocabulary` - Save vocabulary
- `GET /api/vocabulary/due` - Get review words (priority/time modes)
- `POST /api/vocabulary/rate` - Update SM-2 values

### **AI Services**

- `POST /api/generate-vocab` - Generate topic vocabulary
- `POST /api/translate` - Translate with romanization
- `POST /api/speak-feedback` - Pronunciation analysis
- `GET /api/pronunciation-analysis` - Smart coaching analytics

### **Audio**

- `POST /api/speak-tts` - Generate TTS audio

## 🎯 Core Algorithms

### **SM-2 Spaced Repetition**

- Ease factor tracking (1.3-3.0+)
- Interval calculation based on performance
- Priority scoring (0-100 points)

### **Thai Pronunciation Scoring**

- Tone error penalties (highest weight)
- Vowel length accuracy
- Consonant pronunciation
- Difficulty multipliers by tone complexity

### **TTS Caching Strategy**

- Reference audio: Permanent cache (shared)
- User transcriptions: Temporary generation
- 85%+ cache hit rate for cost optimization

## 🚀 Performance & Optimization

### **Recent Improvements**

- Removed unnecessary in-memory cache service (460 lines)
- Modularized SmartCoach: 429 → 178 lines + 3 reusable components
- Added Thai linguistic intelligence (400+ lines phonetic analysis)
- Simplified API routes, removed redundant caching

### **Performance Targets**

- Page load: <2s
- API response: <500ms
- TTS cache hit rate: 85%+
- Uptime: 99.9%

### **Optimizations**

- Database indexes on user_id + next_review
- Component code splitting
- Redis rate limiting
- Supabase Storage for audio files

## 🔒 Security Features

- Row Level Security on all tables
- JWT token validation
- Rate limiting:
  - 5 vocabulary generations/day
  - 10 translations/day
- Input validation with Zod schemas
- Protected routes with authentication

### **Key Dependencies**

- `next`: 15.3.5
- `react`: 19.0.0
- `typescript`: 5
- `openai`: 5.9.0
- `@supabase/supabase-js`: 2.50.5
- `tailwindcss`: 3.4.14
- `zod`: 3.25.76

### **Architecture Notes**

**Design Decisions**

- **No Global State Library**: React Context + local state sufficient
- **Server-Side AI Processing**: Better accuracy and privacy
- **Modular Components**: Single responsibility, testable
- **Thai-Specific Intelligence**: Custom phonetic analysis vs. generic
- **Cost-Optimized Caching**: Strategic TTS caching for 85% hit rate

**Current Development Focus**

- Rate limiting implementation for key endpoints
- Focus mode for targeted pronunciation practice
- React Query integration for better cache management
- Enhanced error handling and user feedback
- Mobile responsiveness improvements

**Data Flow**

```
User Input → Auth → API Routes → Business Logic → DB/AI → Response
```

---

**Built for Thai language learners with modern web technologies and proven learning science.**
