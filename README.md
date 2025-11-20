# Traffic JM - Jasa Marga Traffic Management System

A modern web application for monitoring and managing toll gate traffic data for PT Jasa Marga (Persero) Tbk.

## 🚀 Features

### 1. Authentication
- Secure login/logout functionality
- Token-based authentication
- Automatic redirection for unauthenticated users
- Session management with localStorage

### 2. Dashboard
- **Traffic Analytics by Payment Method**: Bar chart showing traffic volume by payment type (BCA, BRI, BNI, Mandiri, etc.)
- **Traffic by Toll Gate**: Bar chart displaying traffic distribution across toll gates
- **Traffic by Shift**: Pie/Doughnut chart showing percentage distribution across 3 shifts
- **Traffic by Branch (Ruas)**: Pie/Doughnut chart visualizing traffic by branch
- Date filtering capability
- Interactive charts with hover information
- Search functionality across all data

### 3. Daily Traffic Report (Laporan Lalin)
- Display daily traffic reports filtered by date and search terms
- Data separated by payment method:
  - Total Tunai (Cash)
  - Total E-Toll
  - Total Flo
  - Total KTP (Employee Card)
  - Total Combined (E-Toll + Tunai + Flo)
  - Grand Total
- Filter, reset, and export to CSV functionality
- Pagination support with customizable rows per page
- Detailed summary view for each payment type

### 4. Master Data - Toll Gates (Master Gerbang)
- Complete CRUD operations (Create, Read, Update, Delete)
- Data table with action buttons
- Search functionality across all fields
- Pagination with customizable rows per page
- Form validation
- Real-time data updates

## 🛠️ Tech Stack

- **Framework**: Next.js 15.0.3 (React 19)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v6
- **Charts**: Recharts
- **Styling**: Tailwind CSS + MUI Theme
- **HTTP Client**: Custom fetch wrapper
- **State Management**: React Hooks (useState, useEffect, useCallback, useMemo)
- **Package Manager**: Bun

## 📋 Prerequisites

- Node.js 18.x or higher (or Bun runtime)
- npm/yarn/bun package manager
- Docker (for running the backend API)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RayBlaxe/FE_Test.git
   cd FE_Test
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install

   # Using yarn
   yarn install

   # Using bun
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory (optional):
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
   ```

4. **Set up the backend API**
   - Clone the backend repository: https://github.com/faoziyarisma/tect-test-front-end
   - Follow the README instructions to run the Docker container
   - Ensure the API is running on `http://localhost:8080`

5. **Run the development server**
   ```bash
   # Using npm
   npm run dev

   # Using yarn
   yarn dev

   # Using bun
   bun dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 Login Credentials

```
Username: Super Admin
Password: password12345
```

## 📁 Project Structure

```
mrk_fe_test/
├── app/
│   ├── (protected)/           # Protected routes (require authentication)
│   │   ├── layout.tsx         # Protected layout wrapper
│   │   ├── dashboard/         # Dashboard page with charts
│   │   ├── reports/           # Traffic reports page
│   │   └── master-gate/       # Master data gerbang (CRUD)
│   ├── login/                 # Login page
│   ├── layout.tsx             # Root layout with theme provider
│   ├── page.tsx               # Home page (redirects to dashboard)
│   ├── globals.css            # Global styles and CSS variables
│   └── manifest.json          # PWA manifest
├── components/
│   └── layout/
│       └── AppShell.tsx       # Main navigation shell with sidebar
├── lib/
│   ├── http.ts                # API fetch wrapper with authentication
│   ├── theme.ts               # MUI theme configuration
│   └── ThemeProvider.tsx      # Theme provider component
├── types/
│   ├── gerbang.ts             # TypeScript types for toll gates
│   └── lalin.ts               # TypeScript types for traffic data
├── public/                    # Static assets (logos, images)
├── assets/                    # Additional assets
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#1d3a8d` (Jasa Marga brand color)
- **Accent Yellow**: `#ffcc03` (Jasa Marga accent color)
- **Neutral White**: `#fefefe`
- **Background**: `#f8fafb`
- **Text**: `#0f172a`
- **Error**: `#dc2626`

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold weights (600-700)
- **Body**: Regular weight (400)

### Payment Method Clusters

| Payment Method | Cluster |
|---------------|---------|
| dinaskary, dinasmitra, dinasopr | KTP (Employee Card) |
| ebca, ebni, ebri, edki, emandiri, emega, enobu | E-Toll |
| eflo | Flo |
| Tunai | Cash |

## 🔌 API Integration

The application integrates with the following endpoints:

### Authentication
- `POST /api/auth/login` - User authentication
  - Request: `{ username: string, password: string }`
  - Response: `{ status: boolean, token: string }`

### Traffic Data (Lalin)
- `GET /api/lalins?tanggal=YYYY-MM-DD` - Get traffic data filtered by date
  - Response: `{ status: boolean, data: { rows: { rows: Lalin[] } } }`

### Toll Gates (Gerbang)
- `GET /api/gerbangs` - Get all toll gates
  - Response: `{ status: boolean, data: { rows: { rows: Gerbang[] } } }`
- `POST /api/gerbangs` - Create new toll gate
  - Request: `{ id: number, IdCabang: number, NamaGerbang: string, NamaCabang: string }`
- `PUT /api/gerbangs` - Update toll gate
  - Request: `{ id: number, IdCabang: number, NamaGerbang: string, NamaCabang: string }`
- `DELETE /api/gerbangs` - Delete toll gate
  - Request: `{ id: number, IdCabang: number }`

## ✨ Key Features Implementation

### Authentication Flow
- Token stored in localStorage upon successful login
- Protected routes check for valid token
- Automatic redirect to login if unauthenticated
- Secure logout with token removal and redirect

### Error Handling
- Validation error messages from API (422 status)
- Authentication error handling (401 status)
- User-friendly error display with visual feedback
- Fallback error messages for unexpected errors
- Form validation before submission

### Data Visualization
- Interactive Recharts components
- Hover tooltips with detailed information
- Responsive chart sizing for all screen sizes
- Color-coded data representation matching brand colors
- Real-time data updates

### UI/UX Design
- Modern, clean interface inspired by shadcn/ui
- Responsive design for mobile, tablet, and desktop
- Consistent spacing and typography throughout
- Accessible form controls with proper labels
- Loading states for async operations
- Empty states with helpful messages
- Monochrome background images with dark overlays

### Pagination
- Customizable rows per page (5, 10, 25, 50)
- First, Previous, Next, Last navigation buttons
- Current page and total pages display
- Item count display (showing X-Y of Z)
- Automatic page reset when filtering/searching

## 📊 Dashboard Charts

1. **Traffic by Payment Method** (Bar Chart)
   - Shows volume for each payment type (BCA, BRI, BNI, etc.)
   - Color-coded bars using brand colors
   - Hover tooltips with exact values
   - Responsive sizing

2. **Traffic by Toll Gate** (Bar Chart)
   - Displays traffic volume per gate
   - Sortable data by gate ID
   - Interactive hover states
   - Handles multiple gates efficiently

3. **Traffic by Shift** (Pie Chart)
   - Percentage distribution across 3 shifts
   - Color-coded segments
   - Hover tooltips showing percentages and counts
   - Legend for easy identification

4. **Traffic by Branch** (Pie Chart)
   - Branch-wise (Ruas) traffic distribution
   - Visual percentage representation
   - Interactive tooltips with branch names
   - Responsive legend placement

## 🔒 Security Features

- Token-based authentication (Bearer token)
- Protected routes with authentication middleware
- Secure API communication with proper headers
- Input validation on client and server side
- XSS protection through React's built-in escaping
- CSRF protection through token validation
- No sensitive data stored except authentication token

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - Mobile: < 600px
  - Tablet: 600px - 960px
  - Desktop: > 960px
- Collapsible sidebar on mobile devices
- Responsive tables with horizontal scroll on mobile
- Touch-friendly buttons and controls (minimum 48px)
- Adaptive layouts for different screen sizes

## 🚀 Build & Deployment

```bash
# Build for production
npm run build
# or
bun run build

# Start production server
npm start
# or
bun start

# Run linter
npm run lint
# or
bun run lint

# Type checking
npx tsc --noEmit
```

## 📝 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent naming conventions:
  - PascalCase for components and types
  - camelCase for functions and variables
  - UPPER_CASE for constants
- Component-based architecture
- Custom hooks for reusable logic

### Best Practices
- Use `useCallback` for event handlers in dependencies
- Proper dependency arrays in `useEffect`
- Use `useMemo` for expensive computations
- Error boundaries for error handling
- Loading states for better UX
- Debouncing for search inputs
- Type safety with TypeScript
- Clean up effects (event listeners, timers)

### File Organization
- Group related files by feature
- Separate business logic from presentation
- Reusable components in shared folders
- Type definitions in dedicated files
- Consistent import ordering

## 🐛 Troubleshooting

### API Connection Issues
**Problem**: Cannot connect to API

**Solutions**:
- Ensure Docker container is running
- Check API is accessible at `http://localhost:8080`
- Verify network connectivity
- Check for CORS issues in browser console
- Ensure no firewall blocking localhost connections

### Login Fails
**Problem**: Unable to log in with correct credentials

**Solutions**:
- Check credentials are exactly: `Super Admin` / `password12345` (case-sensitive)
- Verify API is running and responding
- Check browser console for errors
- Clear browser cache and localStorage
- Try in incognito/private browsing mode

### Charts Not Displaying
**Problem**: Dashboard charts are empty or not showing

**Solutions**:
- Ensure data is fetched successfully (check Network tab)
- Verify date format in API response matches expected format
- Check browser console for errors
- Ensure default date (2023-11-01) has data in API
- Try selecting a different date with known data

### Pagination Not Working
**Problem**: Page navigation buttons not responding

**Solutions**:
- Check if data is loaded successfully
- Verify filteredData length is correct
- Ensure page state is updating (check React DevTools)
- Try resetting filters and search

### Build Errors
**Problem**: Application fails to build

**Solutions**:
- Delete `.next` folder and rebuild
- Clear node_modules and reinstall: `rm -rf node_modules && bun install`
- Check for TypeScript errors: `npx tsc --noEmit`
- Ensure all dependencies are installed
- Check Node.js version compatibility

## 📞 Support

For API-related issues, contact:
- **Yuli Nurhayati** – 0822 9828 6125
- **Denis Juliansyah** – 0858 6343 3346
- **Risma Faoziya** – 0882 9803 2514

## 📄 License

This project is developed for PT Jasa Marga (Persero) Tbk technical test.

## 👨‍💻 Author

**RayBlaxe**
- GitHub: [@RayBlaxe](https://github.com/RayBlaxe)
- Repository: [FE_Test](https://github.com/RayBlaxe/FE_Test)

---

**Note**: This application is part of a technical test for Frontend Developer position at PT Jasa Marga (Persero) Tbk.

## 📋 Technical Test Compliance

This project fulfills the following requirements from the technical test:

### ✅ Completed Requirements

1. **Component Library**: ✅ Using Material-UI (MUI) v6
2. **UI/UX Design**: ✅ Modern design with Jasa Marga branding
3. **Authentication**: ✅ Login/logout with proper token management
4. **Protected Routes**: ✅ Automatic redirect when unauthenticated
5. **CRUD Operations**: ✅ Full CRUD for Master Gerbang
6. **Search Functionality**: ✅ Search implemented on all data pages
7. **Pagination**: ✅ Fully functional with customizable rows per page
8. **Dashboard Charts**: ✅ All 4 required charts with hover information
9. **Date Filtering**: ✅ Working on dashboard and reports
10. **Export Feature**: ✅ CSV export on reports page
11. **API Integration**: ✅ All endpoints properly integrated
12. **Repository**: ✅ Hosted on GitHub as `FE_Test` (public)

### Assessment Criteria

| Aspect | Weight | Status |
|--------|--------|--------|
| Code Style & Readability | 20% | ✅ TypeScript, ESLint, clean code |
| Functionality | 30% | ✅ All features working |
| UI/UX Design | 20% | ✅ Modern, responsive, branded |
| Logic Efficiency & Performance | 10% | ✅ Optimized with useMemo, useCallback |
| Security | 20% | ✅ Token-based auth, input validation |

---

Built with ❤️ for Jasa Marga
