# Portfolio with Meeting Backgrounds

A modern portfolio website featuring a meeting backgrounds gallery. Built with Next.js 14, Tailwind CSS, and TypeScript.

## Features

- 📱 **Responsive Design** - Sidebar on desktop, mobile-friendly navigation
- 🖼️ **Meeting Backgrounds Gallery** - Professional virtual backgrounds for video calls
- 📝 **Blog Support** - MDX and Markdown support
- 🚀 **SEO Optimized** - Sitemap, robots.txt, JSON-LD schema
- 📊 **Analytics** - Vercel Speed Insights & Web Analytics
- 🎨 **Modern UI** - Clean design with dark mode support
- ⚡ **Fast Performance** - Optimized images and build

## Live Demo

Deploy your own version to see it in action!

## How to Use

You can choose from one of the following two methods to use this repository:

### Quick Start

1. **Clone this repository**
```bash
git clone <your-repo-url>
cd Fun
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Run development server**
```bash
npm run dev
# or
pnpm dev
```

4. **Open [http://localhost:3000](http://localhost:3000)** to see the result

### Deploy to Vercel

The easiest way to deploy your app is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. Vercel will automatically detect Next.js and configure the build settings
4. Your app will be deployed and you'll get a live URL

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── sidebar.tsx     # Navigation sidebar
│   ├── image-gallery.tsx  # Meeting backgrounds gallery
│   └── meeting-backgrounds-card.tsx
├── meeting-backgrounds/ # Meeting backgrounds page
├── blog/               # Blog pages and posts
└── layout.tsx          # Root layout with sidebar

public/
└── images/
    └── meeting-backgrounds/  # Background images
```

## Adding Meeting Backgrounds

The app automatically scans the `/public/meeting-backgrounds/` directory and generates optimized thumbnails on-demand:

1. **Add images**: Simply drop `.jpg`, `.png`, `.webp`, or `.gif` files in `/public/meeting-backgrounds/`
2. **Automatic thumbnails**: The system generates optimized 480x270 thumbnails automatically using Sharp
3. **Auto-detection**: New images appear instantly without any code changes
4. **Smart caching**: Thumbnails are cached for optimal performance
5. **Format support**: Supports all common image formats with automatic filename formatting

### Directory Structure:
```
public/
└── meeting-backgrounds/
    ├── image1.jpg          # Full-size image
    ├── image2.png          # Full-size image
    └── vacation-photo.webp # Any supported format
```

### How It Works:
- **Drop images** → App detects automatically
- **View thumbnails** → Generated at 480x270 with 80% quality  
- **Download originals** → Full-size images available for download
- **Zero manual work** → No need to create thumbnails manually

## Customization

- **Update navigation**: Edit the `navigation` array in `components/sidebar.tsx`
- **Modify styling**: Update Tailwind classes throughout the components
- **Add new pages**: Create new directories under `app/`
- **API customization**: Modify `/app/api/images/route.ts` to change image detection logic
