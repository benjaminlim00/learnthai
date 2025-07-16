# LearnThaiAI - AI-Powered Language Learning Platform

## Product Proposal & Vision

> **Core Concept**: User-driven Thai language learning powered by AI where learners choose their topics, and the system dynamically generates contextual vocabulary with scientifically-proven spaced repetition for optimal retention.

---

## 🎯 **Executive Summary**

LearnThaiAI is a revolutionary web-based language learning platform that combines the power of GPT-4o artificial intelligence with proven spaced repetition science to create a personalized, context-driven Thai learning experience. Unlike traditional language apps that follow rigid curricula, LearnThaiAI puts learners in control by allowing them to generate vocabulary around topics they're actually interested in, while intelligently tracking their progress and optimizing review schedules.

**Key Innovation**: Instead of pre-made lessons, users input real-world topics (like "ordering food at a restaurant" or "talking about hobbies") and receive AI-generated vocabulary with natural example sentences, romanization, and translations—all tailored to avoid words they've already mastered.

---

## 🏗️ **Current Implementation**

### **1. AI-Powered Vocabulary Generation**

- **Dynamic Topic Input**:
  - Topic-based generation (10 words per topic)
  - Single-word lookup mode
  - Daily limit of 5 generations (free tier)
- **GPT-4o Integration**: Natural language processing for authentic vocabulary generation
- **Intelligent Filtering**: Automatically excludes previously learned words
- **Gender-Appropriate Language**: Customizes examples based on user's preferred speaker gender
- **Comprehensive Word Data**: Each word includes:
  - Thai script
  - Romanization (Royal Thai system)
  - English translation
  - Natural example sentence in Thai
  - Romanized pronunciation of sentence
  - English translation of sentence

### **2. Scientific Spaced Repetition System**

- **SM-2 Algorithm**: Proven spaced repetition with personalized difficulty tracking
- **Smart Priority Scoring**: 0-100 point system considering:
  - Difficulty factor (ease of recall)
  - Learning efficiency (repetitions vs. time)
  - Status priority (new > learning > mastered)
  - Overdue bonus (forgotten words get priority)
  - Interval adjustment (recent reviews weighted higher)
- **Dual Review Modes**:
  - Smart Priority (difficulty-based)
  - Time-based (chronological due dates)
- **Visual Progress Tracking**: Star ratings, color coding, next review dates

### **3. AI-Powered Speaking Practice System**

- **Guided 4-Step Workflow**:
  1. **Vocabulary Selection**: Choose from your saved vocabulary words
  2. **Listen & Practice**: Hear correct pronunciation and select practice mode (word/sentence)
  3. **Record Pronunciation**: Record your attempt using browser microphone
  4. **AI Feedback Analysis**: Receive detailed feedback with audio comparison
- **OpenAI TTS Integration**: High-quality text-to-speech for reference pronunciation
- **Speech Recognition**: OpenAI Whisper (GPT-4o mini) transcription for pronunciation capture
- **Smart Pronunciation Analysis**:
  - Thai phonetic analysis (400+ lines of specialized code)
  - 5 tone detection with difficulty multipliers
  - Consonant classification (Low/Mid/High)
  - Syllable segmentation
  - Weighted scoring system
  - Error categorization (Critical/Major/Moderate/Minor)
  - Temporal weighting with exponential decay
  - Learning velocity tracking
- **Smart Audio Caching**: Cost-optimized system that caches reference pronunciations (shared) but never caches user transcriptions (privacy)
- **Audio Comparison**: Side-by-side playback of user pronunciation vs. correct pronunciation
- **Practice Modes**: Choose between practicing individual words or complete example sentences
- **Progress Tracking**: Store pronunciation session data for analytics and improvement tracking

### **4. Bidirectional Translation Tool**

- **English ↔ Thai Translation**: GPT-4o powered translation service
- **Automatic Romanization**: Thai text includes pronunciation guide
- **Rate Limited**: 30 translations per hour for cost control
- **Quick Direction Swapping**: One-click language direction change

### **5. User Progress & Analytics**

- **Learning Status Tracking**: new → learning → mastered progression
- **Vocabulary Management**: Browse, filter, and delete saved words
- **Session Statistics**: Review completion rates and performance metrics
- **Pronunciation Analytics**: Track speaking practice sessions and improvement over time
- **Historical Data**: Vocabulary generation, translation, and pronunciation practice history
- **Visual Difficulty Indicators**: 1-5 star system with color coding

### **6. Enterprise-Grade Security**

- **Supabase Authentication**: Email/password + magic link support
- **Row-Level Security**: Users can only access their own data
- **Audio Storage Security**: Separate buckets for cached TTS (shared) and user recordings (private)
- **Rate Limiting**:
  - 5 vocabulary generations per day
  - 10 translations per day
- **Input Validation**: Zod schema validation for all user inputs
- **Environment Security**: Proper secrets management

---

## 🧠 **Key Differentiators**

### _(Why This Isn't Just Duolingo)_

### **1. User-Controlled Learning Path**

- **No Fixed Curriculum**: Users choose what they want to learn based on their interests and needs
- **Real-World Context**: Vocabulary tied to actual situations users will encounter
- **Adaptive Content**: AI generates fresh content for any topic imaginable
- **Personal Relevance**: Learning becomes more engaging when tied to user interests

### **2. AI-Generated Authentic Content**

- **Natural Language**: Example sentences sound like real Thai conversations, not textbook phrases
- **Contextual Vocabulary**: Words are related to each other within the chosen topic
- **Infinite Variety**: Never run out of new content or practice material
- **Cultural Authenticity**: GPT-4o provides culturally appropriate language usage

### **3. Intelligent Progress Tracking**

- **Smart Avoidance**: System remembers learned words and avoids repetition
- **Scientific Scheduling**: SM-2 algorithm optimizes review timing for maximum retention
- **Difficulty Adaptation**: System learns user's strengths and weaknesses
- **Priority-Based Reviews**: Most difficult words get reviewed first

### **4. Comprehensive Language Support**

- **Full Thai Integration**: Native Thai script, romanization, and cultural context
- **Pronunciation Guide**: Every word and sentence includes phonetic spelling
- **Translation Context**: Understand not just words but how they're used
- **Bidirectional Learning**: Practice both understanding and production

---

## 🚀 **Future Development**

### **Phase 1: Core Enhancement** (In Progress)

- **🔒 Security Hardening**

  - Complete rate limiting implementation
  - Enhanced error handling
  - API monitoring and logging

- **📱 Mobile Optimization**

  - Progressive Web App (PWA) support
  - Mobile-first UI improvements
  - Touch-friendly interactions

- **🎯 Practice Improvements**
  - Focus mode for targeted practice
  - Enhanced feedback visualization
  - Progress tracking improvements

### **Phase 2: Advanced Features**

- **💬 Conversation Practice**

  - AI-powered chat conversations
  - Scenario-based dialogues
  - Grammar correction

- **📚 Grammar Integration**
  - Grammar rules tied to vocabulary
  - Pattern recognition training
  - Sentence structure analysis

### **Phase 3: Platform Growth**

- **👥 Social Learning**

  - Study groups
  - Peer progress sharing
  - Language exchange matching

- **🎨 Content Expansion**
  - Image-based vocabulary
  - Video content integration
  - Cultural context explanations

---

**Ready to revolutionize language learning? Let's make Thai accessible to everyone, one AI-generated word at a time.**
