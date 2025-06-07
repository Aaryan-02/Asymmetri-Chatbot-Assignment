# AI Landing Page Generator

Generate beautiful, responsive landing pages with AI. Just describe what you want and get clean HTML & CSS code instantly.

🚀 **[Live Demo](https://ai-landing-page-generator-gamma.vercel.app/)**

## Quick Setup

1. **Clone and install**
   ```bash
   git clone <your-repo-url>
   cd ai-landing-page-generator
   npm install
   ```

2. **Environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys:
   ```
   GROQ_API_KEY=your_groq_key_here
   NEXTAUTH_SECRET=your_secret_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` and start generating landing pages!

## Features

- 🎨 AI-powered HTML & CSS generation
- 📱 Responsive design templates
- ⚡ Live preview
- 🔧 Customizable system prompts
- 💾 User authentication & chat history

Built with Next.js, Supabase, and AI SDK.
