# Deb's POS Pro

Point of Sale (POS) system built with React 19, Vite, and Google Apps Script.

## Features
- **Dashboard**: Real-time sales and profit analytics.
- **POS Interface**: Easy-to-use checkout with cart management.
- **Inventory**: Manage products, stock levels, and owners (Debby/Mama).
- **Kitchen Monitor**: Track orders in real-time.
- **PWA Support**: Installable on mobile and desktop devices.
- **Cloud Backend**: Powered by Google Sheets for easy management.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Recharts, Lucide Icons.
- **Build Tool**: Vite.
- **Backend**: Google Apps Script (GAS).
- **Database**: Google Sheets.

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
3. Create a `.env` file based on `.env.example` (or just use the provided `.env`):
   ```
   VITE_API_URL=your_gas_web_app_url
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## Production Deployment
The application is set up for deployment to **GitHub Pages**.

1. Ensure `VITE_API_URL` is correctly set in your environment variables.
2. Run build:
   ```bash
   npm run build
   ```
3. The contents of `dist/` are ready for hosting.

## Project Structure
- `src/services/api.js`: API communication layer.
- `src/components/ui/`: Reusable UI components.
- `src/pages/`: Individual page views.
- `src/layouts/`: Main application layouts.
- `src/App.jsx`: Main entry and routing logic.

## License
MIT
