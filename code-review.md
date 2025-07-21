Act like a senior full-stack engineer conducting a comprehensive production-readiness review of this Thai language learning app. Focus on actionable improvements and implementation-ready recommendations.

## 🔍 Review Scope

### Core Architecture

- **Next.js 15 App Router** implementation and routing patterns
- **Supabase integration** (auth, database, RLS policies, storage)
- **AI Services** (OpenAI GPT-4o, Whisper STT, Azure TTS) usage and optimization
- **Component architecture** (shadcn/ui, React 19 patterns, TypeScript 5)

### Learning Systems Intelligence

- **Spaced Repetition** SM-2 algorithm implementation (`src/lib/services/spaced-repetition.ts`)
- **Thai Pronunciation Analysis** phonetic scoring and tone detection (`src/lib/services/thai-scoring.ts`)
- **Smart Coaching** system analytics and recommendation engine
- **Caching Strategy** for TTS audio (85%+ hit rate target)

### Production Concerns

- **Security**: RLS policies, JWT handling, environment variable protection
- **Performance**: Turbopack dev, production build optimization, API response times
- **Rate Limiting**: Daily usage controls (5 vocab generations, 10 translations)
- **Error Handling**: AI service failures, network issues, validation errors
- **Mobile UX**: Responsive design across all learning modes

## 🎯 Review Criteria

### 1. Learning System Accuracy

- Validate SM-2 algorithm implementation for optimal retention
- Review Thai phonetic analysis accuracy (tones: 25pts, vowels: 20pts, consonants: 15pts)
- Assess smart coaching recommendation quality
- Check pronunciation scoring calibration

### 2. Production Architecture

- Evaluate API route structure and validation (Zod schemas)
- Review database schema and migration safety
- Assess caching implementation effectiveness
- Check authentication flow completeness

### 3. Code Quality & Maintainability

- TypeScript type safety and precision
- Component reusability and separation of concerns
- Error boundary coverage for AI services
- Environment configuration management

### 4. Performance & Scalability

- API response times and optimization opportunities
- Bundle size and code splitting effectiveness
- Database query efficiency
- Audio caching hit rates

### 5. User Experience

- Mobile responsiveness across learning modes
- Loading states and error messaging
- Accessibility compliance
- Thai language display handling

## 📋 Required Deliverables

### Executive Summary

- Production readiness score (1-10)
- Top 3 critical issues requiring immediate attention
- Key architectural strengths to maintain

### Issue Categories

**🔴 Critical (Security/Data Loss)**

- Authentication vulnerabilities
- Data integrity risks
- Environment variable exposure

**🟡 High Priority (Performance/UX)**

- Learning algorithm inaccuracies
- Mobile experience gaps
- API reliability issues

**🔵 Medium Priority (Code Quality)**

- TypeScript improvements
- Component refactoring opportunities
- Test coverage gaps

**⚪ Low Priority (Enhancement)**

- Code organization improvements
- Documentation gaps
- Development experience enhancements

### Implementation Plan

- Concrete code fixes with file paths and line numbers
- Database migration scripts if needed
- Configuration updates required
- Testing strategy recommendations

## 🧠 Intelligence Enhancement Focus

### Thai Language Specifics

- Tone detection algorithm improvements
- Phonetic pattern recognition enhancements
- Romanization accuracy validation
- Context-aware error categorization

### Learning Optimization

- SM-2 parameter tuning recommendations
- Priority scoring algorithm refinements
- Session analytics improvements
- Personalized difficulty adjustment

### Smart Coaching Evolution

- Temporal analysis pattern detection
- Trend-based recommendation improvements
- Error type classification accuracy
- Progress tracking enhancements

## 📝 Output Requirements

1. **Immediate Action Items** - Critical fixes needed before production
2. **Code Changes** - Specific file modifications with before/after examples
3. **Database Updates** - SQL scripts for schema improvements
4. **Configuration Changes** - Environment and build configuration updates
5. **Testing Strategy** - Unit, integration, and e2e test recommendations
6. **Monitoring Setup** - Production observability recommendations

Focus on implementing improvements directly in the codebase when possible, providing production-ready solutions that maintain the app's Thai language learning intelligence while ensuring enterprise-grade reliability and performance.
