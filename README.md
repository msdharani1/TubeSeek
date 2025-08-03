
# TubeSeek: An Intelligent YouTube Portal

[![TubeSeek Logo](https://res.cloudinary.com/diwu3avy6/image/upload/v1716384592/logo_tube_seek_g262so.png)](https://tubeseek.dev.msdharani.com/)

**TubeSeek** is a modern, feature-rich web application built with Next.js that offers an enhanced, distraction-free interface for searching and watching YouTube videos. It serves as an intelligent portal to YouTube, prioritizing user experience with features like playlist management, personalized history, and robust user data controls, all wrapped in a sleek, customizable UI.

This project is not just a YouTube client; it's a demonstration of building a full-stack application with modern web technologies, including server-side rendering, secure authentication, third-party API integration, and real-time database management.

## Table of Contents

- [Key Features](#key-features)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation & Running](#installation--running)
- [Architectural Overview](#architectural-overview)
  - [Frontend](#frontend)
  - [Backend (Server Actions)](#backend-server-actions)
  - [Database](#database)
- [API & Logic](#api--logic)
  - [YouTube Data API](#youtube-data-api)
  - [Client-Side Caching](#client-side-caching)
  - [Suggestion Engine](#suggestion-engine)
- [Firebase Setup](#firebase-setup)
  - [Authentication](#authentication)
  - [Realtime Database Rules](#realtime-database-rules)

## Key Features

- **📺 Enhanced Video Search**: Utilizes the YouTube Data API v3 to provide relevant video search results.
- **✨ Distraction-Free Player**: A custom, full-featured video player that keeps you focused on the content, with "Up Next" suggestions.
- **🕒 Clickable Timestamps**: Automatically detects and makes timestamps in video descriptions clickable for easy navigation.
- **📂 Playlist Management**:
  - Create custom playlists.
  - Add or remove any video from multiple playlists with a user-friendly interface.
  - A special "Favorite" playlist for quick access.
- **📜 Personalized Watch History**: Automatically saves videos you watch and displays them in a dedicated history page, sorted by most recent.
- **💡 Personalized Suggestions**: A smart, non-AI-based recommendation system that analyzes your watch history, likes, and subscriptions to suggest relevant content on the homepage.
- **🔐 Secure Authentication**: Employs Google Sign-In via Firebase Authentication for a secure and seamless login experience.
- **🎨 Customizable Themes**: Choose between **Light**, **Dark**, and **System** themes to personalize your viewing experience.
- **⚙️ User Data Control**: The settings page gives users full control over their data, including the ability to:
  - View account information and membership date.
  - **Permanently delete** their entire watch history.
  - **Permanently delete** all of their playlists.
- **🔒 Privacy-Focused**: Requires user agreement to the Privacy Policy before sign-in.
- **🚀 Performance Optimized**: Implements client-side caching for API responses to reduce load times and API usage on repeated searches.
- **📱 Fully Responsive Design**: A beautiful, modern interface built with Tailwind CSS and shadcn/ui that works on all devices.
- **👑 Admin Dashboard**: A special, access-controlled dashboard for the admin user to view user search histories.

## Live Demo

Experience TubeSeek live: [tubeseek.dev.msdharani.com](https://tubeseek.dev.msdharani.com/)

*Note: The live demo uses a shared YouTube API key. If you encounter quota errors, please follow the setup instructions below to use your own key.*

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database**: [Firebase Realtime Database](https://firebase.google.com/docs/database)
- **State Management**: React Context API & Hooks
- **Linting & Formatting**: ESLint, Prettier (via Next.js defaults)

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A Google Account to create Firebase projects and YouTube API keys.

### Environment Variables

1.  **Create `.env` file**: In the root of the project, create a file named `.env`.
2.  **Get Firebase Config**:
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Create a new project (or use an existing one).
    - In your project, create a new Web App.
    - Go to Project Settings > General, and find the "Firebase SDK snippet" section.
    - Select the "Config" option to see your Firebase configuration keys.
3.  **Get YouTube API Key**:
    - Go to the [Google Cloud Console](https://console.cloud.google.com/).
    - Select your Firebase project.
    - Go to "APIs & Services" > "Credentials".
    - Click "Create credentials" > "API key".
    - **Important**: Go to the "Enabled APIs & services" tab and ensure the **YouTube Data API v3** is enabled for your project.
4.  **Populate `.env`**: Add your keys to the `.env` file.

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
NEXT_PUBLIC_FIREBASE_DATABASE_URL="YOUR_FIREBASE_DB_URL" # e.g., https://your-project-id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID" # Optional

# YouTube API Key
YOUTUBE_API_KEY="YOUR_YOUTUBE_API_KEY"
```

### Installation & Running

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run the development server**:
    ```bash
    npm run dev
    ```
3.  **Open the app**: Open [http://localhost:9002](http://localhost:9002) in your browser.

## Architectural Overview

### Frontend

The frontend is built using **Next.js with the App Router**. Components are server-rendered by default, improving performance. Client-side interactivity is enabled with the `"use client"` directive where needed.

-   **`src/app`**: Contains all pages and routes.
-   **`src/components`**: Contains reusable React components, including UI elements from `shadcn/ui` and custom components like `VideoPlayer`, `VideoCard`, etc.
-   **`src/context/auth-context.tsx`**: Manages the user's authentication state globally using React Context.
-   **`src/lib`**: Contains utility functions (`utils.ts`) and Firebase initialization (`firebase.ts`).
-   **`src/hooks`**: Contains custom React hooks like `use-toast.ts`.

### Backend (Server Actions)

The application uses **Next.js Server Actions** for all backend logic, eliminating the need for traditional API routes. These actions are secure, server-only functions that can be called directly from client components.

-   **`src/app/actions.ts`**: Handles YouTube API calls, saving user search history, and generating suggestions.
-   **`src/app/actions/playlist.ts`**: Contains all logic for creating, reading, and updating user playlists in Firebase.
-   **`src/app/actions/user-data.ts`**: Contains logic for deleting user history and playlists.

### Database

**Firebase Realtime Database** is used for storing all user-specific data. The schema is structured to be scalable and secure:

```json
{
  "user-searches": {
    "$uid": {
      "profile": { "email": "...", "displayName": "..." },
      "searches": { "$searchId": { "query": "...", "timestamp": "..." } }
    }
  },
  "user-watch-history": {
    "$uid": {
      "$videoId": { "videoId": "...", "title": "...", "watchedAt": "..." }
    }
  },
  "user-playlists": {
    "$uid": {
      "playlists": { "$playlistId": { "name": "...", "videoCount": 0 } },
      "items": {
        "$playlistId": {
          "$itemId": { "videoId": "...", "title": "..." }
        }
      }
    }
  }
}
```

## API & Logic

### YouTube Data API

The application interacts with two main endpoints of the YouTube Data API v3:

1.  **/search**: Used to get a list of video IDs for a given search query.
2.  **/videos**: Used to fetch detailed information (like statistics and duration) for a list of video IDs obtained from the search endpoint.

This two-step process ensures we get comprehensive data for each video shown to the user. All API calls are made from the server via Server Actions to protect the API key.

### Client-Side Caching

To enhance performance and reduce API usage, the app implements a simple client-side caching strategy using `localStorage`.

-   When a search is performed, the app first checks `localStorage` for a cached result for that specific query.
-   Each cache entry is stored with a timestamp.
-   If a cached result exists and is less than **1 hour old**, it is used directly.
-   Otherwise, a fresh API call is made, and the new result is stored in the cache.

### Suggestion Engine

The homepage features a personalized suggestion system to recommend content. This system operates without a machine learning model and instead uses direct user activity to generate relevant recommendations.

The logic, handled in the `getSuggestedVideos` server action, follows these steps:

1.  **Data Gathering**: It fetches the user's most recent activity in parallel from Firebase:
    -   Last 20 search queries.
    -   Last 50 liked videos.
    -   Last 50 watched videos.
    -   All channel subscriptions.

2.  **Keyword Extraction**: It creates a list of search topics with a clear priority:
    -   **P1 - Search History**: The last 5 search terms are used first, as they are the strongest signal of current interest.
    -   **P2 - Subscriptions**: The titles of the 5 most recent subscriptions are added.
    -   **P3 - Liked Videos**: The channel names from the 3 most recently liked videos are added.
    -   **P4 - Watch History**: If the list of topics is still small, channel names from the 3 most recent videos in history are added to round out the list.

3.  **Fallback for New Users**: If a user has no activity, a default list of diverse topics (e.g., "Tech reviews," "Cooking tutorials") is used to prevent an empty homepage.

4.  **Fetching & Compiling**: It performs a YouTube search for each topic, taking the top 4 videos from each to ensure variety. All results are compiled, and duplicates are removed.

5.  **Final Presentation**: The system presents a final list of up to 20 unique videos on the homepage.

## Firebase Setup

### Authentication

-   **Method**: Google Sign-In is the only authentication method enabled.
-   **Implementation**: Firebase Authentication is initialized in `src/lib/firebase.ts`. The `useAuth` hook provides the user's authentication state throughout the app.
-   **Protected Routes**: A Higher-Order Component (`withAuth`) is used to protect pages that require a user to be logged in.

### Realtime Database Rules

The `database.rules.json` file enforces security. Key rules include:

-   Users can only read and write their own data (e.g., `user-playlists/$uid`, `user-watch-history/$uid`).
-   Data is indexed on specific fields (like `videoId`) for efficient querying.
-   The admin user (`msdharaniofficial@gmail.com`) has special read access to all `user-searches` for the admin dashboard.
