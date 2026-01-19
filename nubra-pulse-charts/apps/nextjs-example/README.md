# Next.js Example App

This is a Next.js example application for testing the Celeris charts web package.

## Getting Started

First, install dependencies from the root of the monorepo:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
# or from the root
pnpm --filter nextjs-example dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Uses `@pulse/engine` for charting logic
- Uses `@pulse/web` for web-based chart rendering
- Built with Next.js 15 and React 19
- TypeScript support

## Project Structure

- `app/` - Next.js app directory with pages and layouts
- `components/` - React components for chart examples
- `package.json` - Dependencies and scripts

