
# TubeSeek

TubeSeek is a Next.js application that allows users to search for YouTube videos, view refined results powered by Generative AI, and play them directly on the site.

## Getting Started

First, you need to set up your environment variables. Create a `.env` file in the root of the project. You can copy the contents from the `.env.example` file if one exists, or create it from scratch.

Next, open `.env` and add your Firebase project configuration and your YouTube Data API v3 key:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
# ... and so on for all Firebase config keys

# YouTube API Key
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

