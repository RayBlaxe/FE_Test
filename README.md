***

# Traffic Jasa Marga

A web application for monitoring and managing toll gate traffic data for PT Jasa Marga (Persero) Tbk.

## Tech Stack

- Next.js 15.0.3 with TypeScript
- Material-UI v6
- Recharts for data visualization
- Tailwind CSS
- Bun package manager

## Features

### Authentication
Secure login/logout with token-based authentication and automatic session management.[3][4]

### Dashboard
- Traffic analytics by payment method (bar chart)
- Traffic distribution by toll gate (bar chart)
- Traffic by shift (pie chart)
- Traffic by branch/ruas (pie chart)
- Date filtering and search functionality

### Daily Traffic Report
View and filter daily traffic reports with breakdown by payment method (Cash, E-Toll, Flo, KTP). Export data to CSV format.

### Master Data Management
Complete CRUD operations for toll gate data with search and pagination support.
## Prerequisites

- Node.js 18.x or higher
- Docker (for backend API)

## Installation

Clone the repository:
```bash
git clone https://github.com/RayBlaxe/FE_Test.git
cd FE_Test
```

Install dependencies:
```bash
bun install
```

Set up environment variables (optional):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Run the backend API:
- Clone and follow setup instructions from [backend repository](https://github.com/faoziyarisma/tect-test-front-end)
- Ensure API runs on `http://localhost:8080`

Start development server:
```bash
bun dev
```

Open `http://localhost:3000` in your browser.



## Build

```bash
bun run build
bun start
```


## License

Developed for PT Jasa Marga (Persero) Tbk technical test.

***

Built by [RayBlaxe](https://github.com/RayBlaxe)
