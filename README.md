# Background Removal App

A modern Next.js app for removing image backgrounds with a beautiful green theme, 3D effects, and privacy-first API key handling.

## Features
- Remove image backgrounds using the Remove.bg API
- Modern, Gen Z-inspired UI with green color palette
- Animated 3D wireframe cubes and particles background (Three.js)
- Responsive, mobile-friendly design
- Drag & drop or click-to-upload images (PNG, JPG, WEBP, up to 10MB)
- Download processed images instantly
- All secrets and API keys are kept private in `.env` (never committed)

## Screenshots
![App Screenshot](./screenshot.png)

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
```

### 4. Run the development server
```bash
pnpm dev
# or
yarn dev
# or
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment
You can deploy this app to Vercel, Netlify, or any platform that supports Next.js. Make sure to set your `REMOVE_BG_API_KEY` in the platform's environment variables.

## Privacy & Security
- `.env` and all secrets are git-ignored by default.
- Never commit your API keys or sensitive data.

## License
MIT

---

**Made by Lokesh❤️ using Next.js, React, Tailwind CSS, and Three.js**
