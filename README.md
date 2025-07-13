# LearnThaiAI - AI-Powered Thai Language Learning App

An AI-powered Thai language learning web application that generates personalized Thai vocabulary based on topics using GPT-4o and implements spaced repetition for effective learning.

## 🚀 Features

- **AI Thai Vocabulary Generation**: Generate contextually relevant Thai vocabulary words using OpenAI GPT-4o
- **Spaced Repetition Learning**: Review saved words with intelligent progress tracking
- **Topic-Based Learning**: Learn Thai vocabulary organized by topics and contexts
- **User Authentication**: Secure login with email/password or magic link
- **Progress Tracking**: Monitor your learning progress with status-based categorization
- **Dark Theme by Default**: Professional dark mode with light theme toggle
- **Modern UI Components**: Built with shadcn/ui for consistent, accessible design
- **Enhanced Loading Animations**: Engaging step-by-step vocabulary generation process
- **Professional Typography**: Inter and JetBrains Mono fonts for optimal readability
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Theme Toggle**: Switch between light and dark modes with persistent preference

## 🧱 Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS v3
- **UI Components**: shadcn/ui, Radix UI primitives
- **Styling**: TailwindCSS with custom design tokens
- **Theme Management**: next-themes for seamless theme switching
- **Icons**: Lucide React for consistent iconography
- **Typography**: Inter (sans-serif) and JetBrains Mono (monospace)
- **Backend**: Supabase (Auth + Database), Next.js API Routes
- **AI**: OpenAI GPT-4o for Thai vocabulary generation
- **Authentication**: Supabase Auth with SSR support

## 📋 Prerequisites

- **Node.js 18+** (recommended: 20+) - **Required for Next.js 15**
- npm or yarn
- Supabase account
- OpenAI API key

> ⚠️ **Important**: This app requires Node.js 18+ due to Next.js 15 dependencies. If you're using an older version, please upgrade before proceeding.

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd learnthai
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL from `supabase-setup.sql` in your Supabase SQL Editor to create the required tables and policies

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

### 4. Configure Supabase Auth

1. In your Supabase dashboard, go to Authentication > Settings
2. Add your local development URL to the Site URL: `http://localhost:3000`
3. Add `http://localhost:3000/auth/callback` to the Redirect URLs

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
learnthai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── generate-vocab/ # GPT vocabulary generation
│   │   │   └── vocabulary/     # CRUD operations
│   │   ├── auth/              # Authentication routes
│   │   ├── topic/             # Topic input page
│   │   ├── review/            # Spaced repetition review
│   │   ├── account/           # User account page
│   │   ├── globals.css        # Global styles with theme variables
│   │   └── layout.tsx         # Root layout with theme provider
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── theme-provider.tsx # Theme management
│   │   ├── theme-toggle.tsx   # Theme toggle button
│   │   ├── vocabulary-loading.tsx # Enhanced loading animation
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx   # Authentication context
│   ├── lib/                   # Utility libraries
│   │   ├── supabase.ts       # Supabase client configuration
│   │   └── utils.ts          # Utility functions
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── components.json            # shadcn/ui configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── supabase-setup.sql         # Database schema
└── package.json
```

## 🎯 Core Features Explained

### 1. Topic Input Screen (`/topic`)

- Users enter topics like "Ordering food at a restaurant"
- Enhanced loading animation shows generation progress with step-by-step updates
- AI generates ~10 relevant Thai vocabulary words with English translations and Thai example sentences
- Users can save words to their personal vocabulary list
- Smart word filtering avoids repeating previously learned vocabulary

### 2. Vocabulary Builder

- Save generated words to Supabase database
- Track learning status: new → learning → mastered
- Delete words you no longer want to study
- Visual progress indicators and status badges

### 3. Spaced Repetition Review (`/review`)

- Review saved words with intelligent progress tracking
- Filter words by learning status (all, new, learning, mastered)
- Update word status based on your confidence level
- Progress tracking with visual indicators
- Easy navigation back to topic generation

### 4. User Account Management (`/account`)

- View learning statistics and progress
- Account information and settings
- App version and feature information
- Secure sign-out functionality

## 🎨 UI/UX Features

### Theme System

- **Dark theme by default** for comfortable learning sessions
- **Light theme available** via toggle button in navigation
- **Persistent theme preference** saved in localStorage
- **Smooth transitions** between themes without flash

### Typography

- **Inter font** for optimal readability in UI text
- **JetBrains Mono** for code and monospace elements
- **Enhanced font rendering** with antialiasing and ligatures
- **Responsive typography** that scales across devices

### Loading Experience

- **Step-by-step progress indicators** during vocabulary generation
- **Animated progress bars** showing completion percentage
- **Thai-themed animations** with flag emoji and cultural elements
- **Engaging status messages** explaining each generation step

### Component Design

- **shadcn/ui components** for consistency and accessibility
- **Radix UI primitives** for robust interaction patterns
- **Custom design tokens** for cohesive color schemes
- **Responsive layouts** that work on all screen sizes

## 🔧 API Endpoints

### Generate Vocabulary

- **POST** `/api/generate-vocab`
- Generates Thai vocabulary using GPT-4o based on topic
- Avoids repeating words the user has already learned
- Enhanced error handling with specific error messages
- Input validation for topic and user authentication

### Vocabulary Management

- **GET** `/api/vocabulary?userId=...&status=...` - Fetch user's vocabulary
- **POST** `/api/vocabulary` - Save new vocabulary word
- **PUT** `/api/vocabulary` - Update word status
- **DELETE** `/api/vocabulary?id=...` - Delete vocabulary word

## 🔒 Security Features

- **Row Level Security**: Users can only access their own data
- **Protected Routes**: Authentication required for all learning features
- **Environment Variables**: Secure API key management
- **Input Validation**: Server-side validation for all API endpoints
- **Error Handling**: Graceful error handling without exposing sensitive information

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Dependencies

```json
{
  "next": "15.3.5",
  "react": "^19.0.0",
  "tailwindcss": "^3.4.14",
  "next-themes": "^0.4.6",
  "@radix-ui/react-*": "Various versions",
  "lucide-react": "^0.525.0",
  "openai": "^5.9.0",
  "@supabase/supabase-js": "^2.50.5"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check that you're using Node.js 18+ (required for Next.js 15)
2. Verify all environment variables are properly configured
3. Check the [Issues](https://github.com/yourusername/learnthai/issues) page
4. Create a new issue with detailed information

## 🔮 Future Enhancements

- [ ] Speech recognition and pronunciation practice
- [ ] Gamification elements (points, streaks, achievements)
- [ ] Social features (share progress, compete with friends)
- [ ] Advanced spaced repetition algorithms
- [ ] Offline support with PWA
- [ ] Multiple learning modes (flashcards, quizzes, etc.)
- [ ] Integration with external Thai language learning APIs
- [ ] Mobile app versions (React Native)
- [ ] Audio pronunciation guides
- [ ] Cultural context explanations

---

Built with ❤️ using Next.js, Supabase, OpenAI, and shadcn/ui
