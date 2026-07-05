# PaperFlow - Web PDF Editor

A modern, fast, and fully client-side PDF viewer and editor built with React, Vite, and `pdf-lib`.

## Features
- **Client-Side Rendering:** Uses `pdf.js` for fast and accurate PDF rendering without a backend.
- **Rich Annotations:** Draw freehand, highlight text, add shapes (rectangles, circles, lines, arrows), and type text directly on the document.
- **Full History Management:** Undo and redo actions, with support for clearing history and annotations.
- **Persisted State:** Uses `localStorage` to save your annotations across sessions (tied to a file hash so changes aren't lost on reload).
- **Exporting:** Flatten and download the annotated PDF using `pdf-lib`.
- **Keyboard Shortcuts:** Fast toggling for all tools and undo/redo logic.
- **Touch Support:** Native zooming (pinch-to-zoom) and panning built in for trackpads and touchscreens.

## Tech Stack
- **Framework:** React + Vite
- **Styling:** Vanilla CSS (CSS Modules / Tokens)
- **State Management:** Zustand (History, Viewer, Annotations)
- **PDF Engines:** `pdf.js` (rendering) and `pdf-lib` (exporting)
- **Icons:** Lucide React

## Local Development
1. Clone the repository
2. Run `npm install`
3. Run `npm run dev` to start the development server
4. Open the provided localhost URL in your browser

## Deployment (Vercel)
This app is configured as a Single Page Application (SPA). A `vercel.json` file is included to properly route all requests to `index.html` and resolve 404 errors.

## Limitations (Demo Mode)
- This is a local-first demo, so cloud syncing and profile settings are mocked.
- PDF Text Outline and Search features are disabled for this demo version.
