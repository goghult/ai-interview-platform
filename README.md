# AI Interview Platform

A full-stack AI interview application that combines a React frontend with an Express backend to generate questions, evaluate answers, and present a dashboard for interview sessions.

## Features

- AI-powered interview question generation
- Real-time answer evaluation
- Interview session dashboard
- Voice/audio utilities for the client experience
- Supabase and Groq integration
- Vercel-ready frontend configuration

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- AI: Groq API
- Data: Supabase
- Hosting: Vercel-ready frontend, Node backend deployable to server hosting

## Project Structure

```text
.
├── api/
│   ├── evaluate-answer.js
│   ├── generate-question.js
│   └── health.js
├── client/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

## Prerequisites

- Node.js 18+
- npm
- Groq API key
- Supabase project URL and service role key

## Local Setup

1. Install root dependencies:

```bash
npm install
```

2. Install client dependencies:

```bash
npm --prefix client install
```

3. Install server dependencies:

```bash
npm --prefix server install
```

4. Create your environment file in the server folder:

```bash
copy server\.env.example server\.env
```

Then update the values with your real credentials.

## Environment Variables

Create a `server/.env` file with the following variables:

```env
PORT=5001
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Run the App

Start the backend:

```bash
npm --prefix server run dev
```

Start the frontend:

```bash
npm --prefix client run dev
```

You can also run the project from the root using:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

This project includes a Vercel configuration file, so it is ready to deploy as a frontend app on Vercel.

Current deployment status:
- No live production URL is currently verified for this repo.
- The repo is connected to GitHub and is ready to be deployed from the Vercel dashboard or GitHub integration.

Expected Vercel-style URL after deployment:

```text
https://ai-interview-platform.vercel.app
```

## GitHub

Repository:

```text
https://github.com/goghult/ai-interview-platform
```

## License

This project is provided for educational and personal use.
