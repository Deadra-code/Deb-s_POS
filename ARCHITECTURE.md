# Architecture Documentation

## Overview
Deb's POS is a React-based Progressive Web App (PWA) designed for Point of Sale management. It connects to a Google Apps Script (GAS) backend, utilizing Google Sheets as a database for transactions, inventory, and authentication.

## Tech Stack
- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, PostCSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Backend**: Google Apps Script (GAS) deployed as a Web App
- **Database**: Google Sheets (via GAS)

## Project Structure
```
root/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and other source assets
│   ├── App.jsx             # Main application logic (Monolith)
│   ├── App.css             # Component-specific styles
│   ├── index.css           # Global styles & Tailwind directives
│   ├── main.jsx            # Application entry point
├── .github/workflows/      # CI/CD (Deploy to GitHub Pages)
├── ARCHITECTURE.md         # This file
├── RDP.md                  # Requirements Definition & Roadmap
├── CHECKLIST.md            # Development Task Checklist
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
└── vite.config.js          # Vite configuration
```

## Key Components

### `src/App.jsx`
This is currently a monolithic file containing the entire application logic. It includes:
1.  **Helper Functions**: `fetchData` for communicating with the GAS backend.
2.  **UI Components**: Reusable components like `Icon`, `Modal`, `Toast`, and `ProductImage`.
3.  **Page Components**:
    -   `Analytics`: Dashboard showing revenue, profit, and charts.
    -   `Inventory`: CRUD interface for managing product data.
    -   `POS`: The main Point of Sale interface with cart and checkout functionality.
    -   `Kitchen`: Real-time kitchen monitor for viewing incoming orders.
    -   `LoginPage`: Authentication handling.
    -   `SettingsModal`: Application configuration (Tax, Service Charge).
4.  **Main Layout**: `DashboardLayout` handles navigation and state management for the active view.

## Data Flow
1.  **Frontend**: React components manage local state (`useState`, `useEffect`).
2.  **API Layer**: The `fetchData` function sends GET/POST requests to the Google Apps Script Web App URL.
    -   GET requests use query parameters (e.g., `?action=getMenu`).
    -   POST requests send a JSON body (handled as text/plain to avoid GAS CORS preflight issues).
3.  **Backend**: Google Apps Script receives the requests, interacts with Google Sheets (reading/writing rows), and returns JSON responses.

## Deployment
- The application is built using `npm run build` (Vite).
- It is deployed to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`).
