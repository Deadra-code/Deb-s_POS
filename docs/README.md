# Deb's POS Pro

Point of Sale (POS) system built with React 19, Vite, and IndexedDB.

## Features
- **Dashboard**: Real-time sales and profit analytics.
- **POS Interface**: Easy-to-use checkout with cart management.
- **Inventory**: Manage products, stock levels, and owners (Debby/Mama).
- **Kitchen Monitor**: Track orders in real-time.
- **PWA Support**: Installable on mobile and desktop devices.
- **Offline-First**: Powered by IndexedDB for local data storage.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Recharts, Lucide Icons.
- **Build Tool**: Vite.
- **Database**: IndexedDB (offline-first).

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

## Production Deployment
The application is set up for deployment to **GitHub Pages**.

1. Run build:
   ```bash
   npm run build
   ```
2. The contents of `dist/` are ready for hosting.

## Project Structure
- `src/services/api.js`: API communication layer.
- `src/components/ui/`: Reusable UI components.
- `src/pages/`: Individual page views.
- `src/layouts/`: Main application layouts.
- `src/App.jsx`: Main entry and routing logic.

## License
MIT
