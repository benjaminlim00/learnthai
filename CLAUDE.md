# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

### Database Setup
- Run `supabase-clean-setup.sql` in Supabase SQL Editor for initial database setup
- Set Site URL: `http://localhost:3000`
- Set Redirect URL: `http://localhost:3000/auth/callback`

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 App Router, React 19, TypeScript 5, TailwindCSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Backend**: Next.js API Routes with Supabase (PostgreSQL + Auth)
- **AI Services**: OpenAI GPT-4o, Whisper STT, Azure Speech Services (TTS)
- **State Management**: React Context + local state (no global state library)

### Core Learning Systems

#### 1. Spaced Repetition (SM-2 Algorithm)
- **Service**: `src/lib/services/spaced-repetition.ts`
- **Key Functions**: `calculateSM2()`, `calculateEnhancedPriorityScore()`, `sortByDifficultyPriority()`
- **Priority Scoring**: 5 factors (difficulty, efficiency, status, overdue, interval) with max 100 points
- **Algorithm**: Enhanced SM-2 with ease factor 1.3-3.0+, priority-based and time-based review modes

#### 2. Thai Pronunciation Analysis
- **Main Service**: `src/lib/services/thai-scoring.ts` (400+ lines of Thai phonetic analysis)
- **Analysis Service**: `src/lib/services/pronunciation-analysis.ts`
- **Phonetic Engine**: `src/lib/services/phonetic.ts`
- **Scoring**: Weighted system (tones: 25pts, vowels: 20pts, consonants: 15pts)
- **Features**: 5 tone detection, consonant classification, syllable segmentation, difficulty multipliers

#### 3. Smart Coaching System
- **Components**: `src/components/speak/smart-coach/`
- **Core**: `SmartCoach.tsx`, `SmartCoachResults.tsx`
- **Analytics**: Temporal analysis, trend detection, personalized recommendations
- **Error Types**: 10 categories from tone errors to overall fluency

### Database Schema (Supabase)

#### Key Tables
- `vocabulary`: User words with SM-2 fields (interval, ease_factor, repetitions, next_review)
- `user_profiles`: TTS voice preferences
- `pronunciation_sessions`: Speaking practice history and analysis
- `cached_audio`: TTS audio caching (85%+ hit rate for cost optimization)
- `generation_logs`: Daily usage tracking for rate limiting

#### Security
- Row Level Security (RLS) enabled on all tables
- JWT authentication via Supabase Auth
- Protected routes with `src/components/shared/ProtectedRoute.tsx`

### API Architecture

#### Vocabulary Management
- `POST /api/vocabulary` - Save vocabulary with SM-2 defaults
- `GET /api/vocabulary/due` - Get review words (priority/time modes)
- `POST /api/vocabulary/rate` - Update SM-2 values after review

#### AI Services
- `POST /api/generate-vocab` - GPT-4o topic vocabulary generation
- `POST /api/translate` - Thai-English translation with romanization
- `POST /api/speak-feedback` - Pronunciation analysis with AI feedback
- `GET /api/pronunciation-analysis` - Smart coaching analytics

#### Audio Services
- `POST /api/speak-tts` - Generate TTS audio with caching
- `GET /api/azure-speech-token` - Azure Speech token management

### Component Structure

#### Page Components
- `src/app/generate/page.tsx` - AI vocabulary generation
- `src/app/review/page.tsx` - Spaced repetition review
- `src/app/speak/page.tsx` - Pronunciation practice
- `src/app/translate/page.tsx` - Translation tool

#### Shared Components
- `src/components/shared/` - Common UI components
- `src/components/ui/` - shadcn/ui components
- `src/contexts/AuthContext.tsx` - Authentication context

### Key Services & Utilities

#### Authentication
- `src/lib/supabase.ts` - Supabase client setup with SSR support
- `authenticateRequest()` - API route authentication helper
- `createServerSupabaseClient()` - Server-side client factory

#### Validation & Types
- `src/lib/validation.ts` - Zod schemas for API validation
- `src/types/database.ts` - Database type definitions
- `src/types/pronunciation.ts` - Pronunciation analysis types

#### Thai Language Processing
- Tone analysis with difficulty multipliers
- Phonetic pattern recognition
- Romanization system integration
- Context-aware error categorization

### Performance & Optimization

#### Caching Strategy
- TTS audio caching in Supabase Storage
- Reference audio: permanent cache (shared across users)
- User transcriptions: temporary generation
- Cache hit rate target: 85%+

#### Code Organization
- Modular component architecture
- Single responsibility principle
- Thai-specific intelligence vs generic solutions
- Cost-optimized AI API usage

### Environment Setup

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key for GPT-4o and Whisper
- `AZURE_SPEECH_KEY` - Azure Speech Services key
- `AZURE_SPEECH_REGION` - Azure Speech Services region
- `UPSTASH_REDIS_REST_URL` - Redis for rate limiting (optional)
- `UPSTASH_REDIS_REST_TOKEN` - Redis token (optional)

### Development Notes

#### Design Decisions
- No global state library - React Context sufficient for this app's complexity
- Server-side AI processing for accuracy and privacy
- Thai-specific phonetic analysis over generic speech recognition
- Modular Smart Coach components for maintainability

#### Rate Limiting
- 5 vocabulary generations per day
- 10 translations per day
- Redis-based implementation (in progress)

#### Testing & Quality
- Run `npm run lint` before commits
- TypeScript strict mode enabled
- Zod validation for all API inputs
- Error boundaries for AI service failures