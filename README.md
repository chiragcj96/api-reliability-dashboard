# API Reliability Dashboard

A Next.js application for monitoring the health and performance of multiple APIs in real-time. Track latency, uptime status, and health scores for your monitored services.

## Features

- 🟢 **Real-time Health Monitoring** - Get instant status updates (UP, SLOW, DOWN) for your APIs
- ⏱️ **Latency Tracking** - Monitor response times and identify performance issues
- 📊 **Health Scores** - Automatic scoring based on status and latency metrics
- ➕ **Easy Service Management** - Add, remove, and refresh monitored services
- 💾 **Persistent Storage** - Services are saved locally and survive restarts
- 🚀 **Fast & Lightweight** - Built with Next.js and React for optimal performance

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Usually comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/api-reliability-dashboard.git
cd api-reliability-dashboard
```

### 2. Install Dependencies

Using npm (recommended):
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Start the Development Server

```bash
npm run dev
```

Or with yarn:
```bash
yarn dev
```

The application will be available at **`http://localhost:3000`**

## Building for Production

### Build the Project

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Project Structure

```
api-reliability-dashboard/
├── app/
│   ├── api/
│   │   └── services/
│   │       ├── route.ts              # GET/POST endpoints
│   │       └── [id]/
│   │           ├── route.ts          # DELETE endpoint
│   │           └── refresh/
│   │               └── route.ts      # Refresh health check
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── components/
│   └── dashboard.tsx                 # Main dashboard component
├── lib/
│   ├── default-services.ts           # Default monitored services
│   ├── health.ts                     # Health check logic
│   ├── storage.ts                    # Data persistence
│   └── types.ts                      # TypeScript type definitions
├── data/
│   └── services.json                 # Services data (auto-generated)
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## Usage

### Adding a Service

1. Navigate to the **"Add a service"** section in the left panel
2. Enter the service name and URL
3. Click **"Add Service"**
4. The dashboard will automatically run an initial health check

### Monitoring Services

Once added, services will display:
- **Status Badge** - Shows UP (🟢), SLOW (🟡), or DOWN (🔴)
- **Latency** - Response time in milliseconds
- **Health Score** - Score from 0-100 based on status and latency
- **Last Checked** - Timestamp of the most recent health check

### Refreshing Service Status

Click the **"Refresh"** button on any service card to perform an immediate health check.

### Deleting a Service

Click the **"Delete"** button to remove a service from monitoring.

## Configuration

### Add Default Services

Modify `lib/default-services.ts` to change which services are loaded by default.

### Change Request Timeout

Edit `REQUEST_TIMEOUT_MS` in `lib/health.ts` (default: 5000ms)

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Next.js 15** - React framework with built-in API routes
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **CSS3** - Styling (no external UI library)

## License

This project is open source and available under the MIT License.

## Notes

- On the first load, the app seeds the assignment's sample public APIs and checks them.
- Services are persisted locally, so added services remain after restarting the app.
