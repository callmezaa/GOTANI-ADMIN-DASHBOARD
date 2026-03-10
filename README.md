# GOTANI Admin Dashboard

Admin dashboard for **GOTANI POS System** used to manage products, transactions, and system data.
This web application is built with **React and Vite** for fast performance and modern development workflow, and deployed using **Cloudflare Pages**.

## Live Demo

Admin Panel:
https://web-admin-gotani.pages.dev/

## Login Access

Demo admin credentials:

Username: `kenzama123`
Password: `12345678`

_(For demonstration purposes only)_

## Tech Stack

This project was developed using modern frontend technologies:

- **React** – JavaScript library for building user interfaces
- **Vite** – Fast frontend build tool
- **JavaScript / TypeScript**
- **Firebase** – Backend services and database
- **Cloudflare Pages** – Deployment and hosting
- **CSS / Tailwind / Custom Styling**

## Features

- Secure admin authentication
- Dashboard overview
- Product management
- Transaction monitoring
- Data management system
- Responsive interface
- Fast loading with Vite build optimization

## Project Structure

```
gotani-admin/
│
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable components
│   ├── pages/             # Application pages
│   ├── services/          # API / Firebase logic
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   └── main.jsx           # Entry point
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Installation

Clone the repository:

```
git clone https://github.com/callmezaa/GOTANI-ADMIN-DASHBOARD.git
```

Go to the project directory:

```
cd gotani-admin
```

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

Open in browser:

```
http://localhost:5173
```

## Build for Production

```
npm run build
```

Preview production build:

```
npm run preview
```

## Deployment

This project is deployed using **Cloudflare Pages**.

Deployment steps:

1. Push project to GitHub
2. Connect repository to Cloudflare Pages
3. Configure build settings

Build command:

```
npm run build
```

Build output directory:

```
dist
```

Cloudflare will automatically deploy the application.

## Security Notice

The demo credentials provided in this repository are for **testing purposes only**.
For production environments, credentials and sensitive configuration should be managed securely using environment variables.

## Related Project

This admin dashboard is part of the **GOTANI POS System**, which includes:

- POS Mobile Application (React Native)
- Admin Web Dashboard (React + Vite)
- Firebase Backend
- QRIS Digital Payment Integration

## Author

Ken Zamariyan
Informatics Engineering

GitHub: https://github.com/callmezaa

## License

This project is available for educational and development purposes.
