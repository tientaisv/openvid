# Openvid AI Agent Guidelines

## Deployment Environment
- **Platform:** **Vercel** (Hệ thống chạy và build trên Vercel, không chạy production trên máy local).
- **Architecture:** Next.js App Router (Client-side Canvas Editor + Vercel Serverless API Routes).
- **AI Engine:** Google Gemini 2.5 Flash via `@google/genai`.
- **Environment Variables:** Cấu hình trên Vercel Project Settings (VD: `GEMINI_API_KEY`).
- **Workflow:** Code $\rightarrow$ Test/Lint $\rightarrow$ Commit & Push to GitHub `main` $\rightarrow$ Vercel auto-deploys.
