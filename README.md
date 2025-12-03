# PixelSwap - Background Remover & AI Scene Generator

A modern Next.js app for removing image backgrounds and swapping them with AI-generated scenes. Features a beautiful green theme, 3D effects, mobile optimization, and privacy-first API key handling.

## Features

### 1. Remove Background
- Remove image backgrounds using the Remove.bg API
- Premium quality background removal with smooth edges
- Supports person, product, and auto detection

### 2. Change Background (AI-Powered)
- Upload a photo with a person/subject
- Enter an AI prompt describing the new background (e.g., "Beach sunset", "Mountain landscape")
- AI generates a perfect background and composites your subject onto it
- Results look like the photo was actually taken in that scene

### General Features
- Modern, Gen Z-inspired UI with green color palette (#A3C9A8, #C7E8C5)
- Animated 3D wireframe cubes and particles background (Three.js)
- Responsive, mobile-friendly design
- Drag & drop or click-to-upload images (PNG, JPG, WEBP, up to 10MB)
- Download processed images instantly
- All secrets and API keys are kept private in `.env` (never committed)


## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Install dependencies
```bash
pnpm install
# or
yarn install
# or
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```env
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
HUGGING_FACE_API_KEY=your_hugging_face_key_here
```

**Get your API keys:**
- Remove.bg API: https://www.remove.bg/api (free tier available)
- Hugging Face (optional): https://huggingface.co/settings/tokens

### 4. Run the development server
```bash
pnpm dev
# or
yarn dev
# or
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

## How to Use

### Remove Background
1. Click "Remove Background" tab
2. Upload or drag an image
3. Image background is automatically removed
4. Download the transparent PNG

### Change Background
1. Click "Change Background" tab
2. Upload or drag an image with a person/subject
3. Enter a prompt describing the new background (e.g., "Tropical beach with palm trees", "Modern office building")
4. Click "Change Background"
5. AI generates the background and composites your subject onto it
6. Download the final result

## Deployment
You can deploy this app to Vercel, Netlify, or any platform that supports Next.js. Make sure to set your `REMOVE_BG_API_KEY` and `HUGGING_FACE_API_KEY` in the platform's environment variables.

## Tech Stack
- **Framework**: Next.js 16 (Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js with @react-three/fiber
- **APIs**: Remove.bg, Pollinations.ai
- **Deployment**: Vercel-ready

## API Services Used
- **Remove.bg**: Professional background removal with premium quality
- **Pollinations.ai**: Free AI image generation for background scenes

## Privacy & Security
- `.env` and all secrets are git-ignored by default.
- Never commit your API keys or sensitive data.

## License
MIT

---

**Made by Lokesh❤️ using Next.js, React, Tailwind CSS, and Three.js**
