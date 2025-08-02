# **App Name**: TubeSeek

## Core Features:

- Search Input: Centralized search bar for entering video search queries. API key read from .env.
- Search Results: Displays 10-20 search results based on query to the YouTube Data API v3.
- Video Preview: Displays thumbnail image, title, short description, and duration for each result.
- Video Playback: Clicking 'Play' initiates video playback.
- Responsive Design: Display results in a responsive layout.
- Enhanced Results Filtering: Uses generative AI as a tool, to refine search results. The AI tool will filter videos to improve results based on title, view count, likes and content to improve user relevance. The tool will exclude irrelevant videos.

## Style Guidelines:

- Primary color: Vibrant purple (#A06CD5) to represent creativity and digital media.
- Background color: Light gray (#F0F2F5), a desaturated near-neutral providing a clean backdrop.
- Accent color: Cyan (#73D1FF), an analogous hue for interactive elements like the play button and search prompts.
- Body and headline font: 'Inter', a sans-serif font, for clear readability and a modern aesthetic.
- Use modern, minimalist icons for controls and actions.
- Ensure a clean and intuitive layout using TailwindCSS grid and flexbox utilities, optimizing for different screen sizes.
- Incorporate subtle animations for search loading, video transitions, and interactive elements.