# Quick Setup Guide

## ⚠️ Important: Node.js Version Requirement

This app requires **Node.js 18+** (recommended: Node.js 20+). You're currently using Node.js 16.15.1.

### To upgrade Node.js:

**Option 1: Using nvm (recommended)**

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal, then:
nvm install 18
nvm use 18
```

**Option 2: Download from nodejs.org**
Visit [nodejs.org](https://nodejs.org) and download Node.js 18 LTS.

## 🚀 Quick Start (after upgrading Node.js)

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up Supabase:**

   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Run the SQL from `supabase-setup.sql` in your Supabase SQL Editor
   - Get your project URL and anon key from Settings > API

3. **Configure environment:**

   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase and OpenAI API keys

4. **Run the app:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## 🔑 Required API Keys

- **Supabase**: Get from your project settings
- **OpenAI**: Get from [platform.openai.com](https://platform.openai.com)

## 📱 App Features

- ✅ User authentication (email/password + magic link)
- ✅ AI vocabulary generation with GPT-4o
- ✅ Save and manage vocabulary words
- ✅ Spaced repetition review system
- ✅ Progress tracking
- ✅ Responsive design

## 🆘 Need Help?

Check the main [README.md](README.md) for detailed documentation.
