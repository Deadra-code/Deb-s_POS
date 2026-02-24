# Development Checklist - Deb's POS Project

This checklist tracks the technical and feature-wise progress of the development. Use this as a guide for future sprints.

## 🟢 PHASE 1: UI & UX POLISHING
- [ ] **Standardize UI Components**: Extract local UI functions into a dedicated `components/` folder.
- [ ] **Modernize Loading States**: Implement skeleton screens for Analytics and Inventory.
- [ ] **Enhanced Toast Notifications**: Support for "Error", "Warning", and "Info" variants with progress bars.
- [ ] **Responsive View Check**: Audit all pages on screen widths < 360px and > 1200px.

## 🔵 PHASE 2: CORE FEATURE EXPANSION
- [ ] **Manual Stock Adjustment Log**: Track *why* stock was changed (Restock, Return, Waste).
- [ ] **Advanced Filtering on History**: Date range picker (Today, Yesterday, Last 7 Days, Custom).
- [ ] **Category-based Analytics**: Revenue breakdown by Category in the dashboard.
- [ ] **Employee Attendance**: A simple clock-in/clock-out system using the existing auth.

## 🟡 PHASE 3: SYSTEM INTEGRITY & PERFORMANCE
- [ ] **Component Modularization**: Split `App.jsx` into smaller files (e.g., `POS.jsx`, `Inventory.jsx`).
- [ ] **Data Fetch Optimization**: Only fetch changed data using timestamps or versions.
- [ ] **Error Boundary**: Implement a global React Error Boundary to catch crashes gracefully.
- [ ] **GAS Logging**: Set up a "Log" sheet in Google Sheets to track API errors and critical actions.

## 🟠 PHASE 4: CONNECTIVITY & PWA
- [ ] **Bluetooth Printer Setup**: Research and implement simple receipt printing.
- [ ] **Offline Queue**: Store orders in `IndexedDB` when network is down; sync automatically when back online.
- [ ] **Push Notifications**: Notify "Kitchen" view via web push when a new order arrives.

## 🔴 MAINTENANCE (RECURRING)
- [ ] **Data Cleanup**: Archive transactions older than 1 year to a separate spreadsheet.
- [ ] **Dependency Update**: Check `npm outdated` and update Vite/React versions quarterly.
- [ ] **Backup**: Manually download a .XLSX backup of the main spreadsheet monthly.

---
*Last Updated: 2025-12-26*
