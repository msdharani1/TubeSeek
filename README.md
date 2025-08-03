
# TubeSeek

TubeSeek is a Next.js application that allows users to search for YouTube videos, view refined results powered by Generative AI, and play them directly on the site.

## Getting Started

First, you need to set up your environment variables. Create a `.env.local` file in the root of the project by copying the example file:

```bash
cp .env.example .env.local
```

Next, open `.env.local` and add your YouTube Data API v3 key:

```
YOUTUBE_API_KEY="YOUR_YOUTUBE_API_KEY_HERE"
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Features

- **YouTube Search**: Search for any video on YouTube.
- **AI-Powered Filtering**: Search results are intelligently filtered by a GenAI model to provide the most relevant videos, removing spam or unrelated content.
- **In-App Video Playback**: Watch videos directly on TubeSeek without being redirected.
- **Responsive Design**: A beautiful, modern interface that works on all devices, built with Tailwind CSS and shadcn/ui.
- **Subtle Animations**: Smooth transitions and loading states for a polished user experience.
