# Excel Visualizer Frontend

React application for the Excel Visualizer platform - a powerful tool for creating interactive data visualizations from Excel files.

## 🛠️ Tech Stack

- **React 18** - UI Library with hooks and functional components
- **TypeScript** - Type safety and better developer experience
- **Redux Toolkit** - State management with RTK Query
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - 2D chart library with react-chartjs-2
- **Three.js** - 3D graphics with @react-three/fiber
- **React Hot Toast** - Beautiful notifications
- **React Icons** - Icon library
- **React Dropzone** - File upload component
- **Axios** - HTTP client for API calls

## 📁 Project Structure

```
frontend/
├── public/             # Static assets
│   ├── index.html     # HTML template
│   └── manifest.json  # PWA manifest
├── src/
│   ├── components/    # Reusable UI components
│   │   ├── Charts/    # Chart components (2D & 3D)
│   │   ├── Common/    # Shared components (buttons, modals, etc.)
│   │   ├── Files/     # File-related components
│   │   └── Layout/    # Layout components
│   ├── hooks/         # Custom React hooks
│   │   └── redux.ts   # Typed Redux hooks
│   ├── pages/         # Page components
│   │   ├── Auth/      # Authentication pages
│   │   ├── Charts/    # Chart pages
│   │   ├── Dashboard/ # Dashboard pages
│   │   ├── Files/     # File management pages
│   │   ├── Profile/   # User profile pages
│   │   └── Admin/     # Admin pages
│   ├── store/         # Redux store and slices
│   │   ├── slices/    # Redux Toolkit slices
│   │   └── index.ts   # Store configuration
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main App component
│   ├── index.tsx      # React entry point
│   └── index.css      # Global styles with Tailwind
├── package.json       # Dependencies and scripts
├── tailwind.config.js # Tailwind configuration
├── postcss.config.js  # PostCSS configuration
└── tsconfig.json      # TypeScript configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

The app will automatically reload when you make changes to the source code.

## 📦 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (one-way operation)

## 🎨 UI Components & Features

### Layout Components
- **Layout** - Main authenticated app layout with sidebar
- **PublicLayout** - Public pages layout with header/footer
- **Sidebar** - Navigation sidebar with responsive design
- **Header** - Top navigation with user menu

### Authentication
- **Login/Register** - User authentication forms
- **Protected Routes** - Route guards for authenticated areas
- **Profile Management** - User profile editing
- **Password Change** - Secure password updates

### File Management
- **File Upload** - Drag-and-drop Excel file upload
- **File List** - Paginated file browser with filters
- **File Details** - File metadata and data preview
- **File Actions** - Edit, delete, reprocess operations

### Chart Creation & Visualization
- **Chart Creator** - Interactive chart configuration
- **2D Charts** - Bar, line, pie, scatter, area, radar charts
- **3D Visualizations** - 3D bar, line, scatter, surface plots
- **Chart Gallery** - User's chart collection
- **Public Charts** - Browse community charts

### Dashboard & Analytics
- **User Dashboard** - Overview of files and charts
- **Statistics** - Usage analytics and insights
- **Recent Activity** - Latest uploads and charts
- **Quick Actions** - Common tasks shortcuts

### Admin Interface
- **Admin Dashboard** - System overview and metrics
- **User Management** - User roles and permissions
- **Content Moderation** - File and chart management
- **System Settings** - Platform configuration

## 🎯 State Management

### Redux Store Structure

```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  files: {
    files: FileData[],
    currentFile: FileData | null,
    isLoading: boolean,
    uploadProgress: number,
    pagination: PaginationInfo
  },
  charts: {
    charts: ChartData[],
    currentChart: ChartData | null,
    publicCharts: ChartData[],
    isCreating: boolean,
    error: string | null
  },
  ui: {
    isSidebarOpen: boolean,
    notifications: Notification[],
    modals: Modal[],
    theme: 'light' | 'dark',
    chartPreferences: ChartPreferences
  }
}
```

### Redux Slices

- **authSlice** - Authentication state and actions
- **fileSlice** - File management state
- **chartSlice** - Chart creation and management
- **uiSlice** - UI state and preferences

## 📊 Chart Integration

### Chart.js (2D Charts)
```typescript
// Supported chart types
const chartTypes = [
  'bar', 'line', 'pie', 'doughnut', 'scatter', 
  'bubble', 'area', 'radar', 'polarArea'
];

// Chart configuration
interface ChartConfig {
  type: ChartType;
  data: ChartData;
  options: ChartOptions;
}
```

### Three.js (3D Visualizations)
```typescript
// 3D chart components
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

// 3D chart types
const chart3DTypes = [
  'bar3d', 'line3d', 'scatter3d', 'surface3d'
];
```

### Chart Export Features
- **PNG Export** - High-resolution image download
- **PDF Export** - Vector-based PDF generation
- **SVG Export** - Scalable vector graphics
- **Data Export** - CSV/JSON data download

## 🎨 Styling & Theming

### Tailwind CSS Configuration
- **Custom Colors** - Brand color palette
- **Component Classes** - Reusable utility classes
- **Responsive Design** - Mobile-first approach
- **Dark Mode** - Theme switching support

### Design System
```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-600: #2563eb;

/* Component Classes */
.btn-primary { @apply bg-primary-600 hover:bg-primary-700 ... }
.card { @apply bg-white rounded-lg shadow-soft ... }
.input-field { @apply block w-full px-3 py-2 border ... }
```

## 🔌 API Integration

### Axios Configuration
```typescript
// API base configuration
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Authentication interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Endpoints
- **Authentication**: `/api/auth/*`
- **Files**: `/api/files/*`
- **Charts**: `/api/charts/*`
- **Admin**: `/api/admin/*`

## 📱 Responsive Design

### Breakpoints
- **sm**: 640px (Mobile landscape)
- **md**: 768px (Tablet)
- **lg**: 1024px (Desktop)
- **xl**: 1280px (Large desktop)

### Mobile Features
- **Touch-friendly** - Optimized for touch interactions
- **Responsive Charts** - Charts adapt to screen size
- **Mobile Navigation** - Collapsible sidebar
- **Swipe Gestures** - Touch-based interactions

## 🔒 Security Features

### Client-Side Security
- **JWT Token Management** - Secure token storage
- **Route Protection** - Authentication guards
- **XSS Prevention** - Input sanitization
- **CSRF Protection** - Cross-site request forgery prevention

### Data Validation
- **Form Validation** - Client-side input validation
- **File Type Validation** - Excel file type checking
- **Size Limits** - File size restrictions
- **Input Sanitization** - Prevent malicious input

## 🧪 Testing

### Testing Setup
```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Testing Libraries
- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing
- **MSW** - API mocking for tests

## 🚀 Production Build

### Build Process
```bash
# Create production build
npm run build

# The build folder contains:
# - Optimized JavaScript bundles
# - Minified CSS files
# - Optimized images and assets
# - Service worker for PWA features
```

### Performance Optimizations
- **Code Splitting** - Lazy loading with React.lazy()
- **Bundle Analysis** - Webpack bundle analyzer
- **Image Optimization** - WebP format support
- **Caching Strategy** - Aggressive caching headers

## 📈 Performance Monitoring

### Metrics to Track
- **Core Web Vitals** - Loading, interactivity, visual stability
- **Bundle Size** - JavaScript and CSS bundle sizes
- **API Response Times** - Network request performance
- **Chart Rendering** - Visualization performance

## 🔧 Development Tools

### VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **ESLint**

### Browser Extensions
- **React Developer Tools**
- **Redux DevTools**
- **Lighthouse** - Performance auditing

## 🌐 PWA Features

### Progressive Web App
- **Service Worker** - Offline functionality
- **App Manifest** - Installable web app
- **Caching Strategy** - Cache-first for assets
- **Background Sync** - Offline data sync

## 🎯 Accessibility

### A11y Features
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader** - ARIA labels and descriptions
- **Color Contrast** - WCAG AA compliance
- **Focus Management** - Logical tab order

## 📚 Dependencies

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.16.0",
  "@reduxjs/toolkit": "^1.9.7",
  "react-redux": "^8.1.3",
  "axios": "^1.5.0",
  "tailwindcss": "^3.3.3"
}
```

### Chart Libraries
```json
{
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "three": "^0.157.0",
  "@react-three/fiber": "^8.15.8",
  "@react-three/drei": "^9.88.17"
}
```

### UI Libraries
```json
{
  "react-hot-toast": "^2.4.1",
  "react-icons": "^4.11.0",
  "react-dropzone": "^14.2.3",
  "date-fns": "^2.30.0"
}
```

## 🤝 Contributing

### Development Workflow
1. **Feature Branch** - Create feature branches from main
2. **Code Style** - Follow Prettier and ESLint rules
3. **Component Structure** - Use functional components with hooks
4. **TypeScript** - Maintain strict type checking
5. **Testing** - Write tests for new features

### Code Style Guidelines
```typescript
// Component naming: PascalCase
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // Custom hooks at the top
  const dispatch = useAppDispatch();
  const { data, isLoading } = useAppSelector(state => state.slice);
  
  // Event handlers
  const handleClick = () => {
    // Logic here
  };
  
  // Render
  return (
    <div className="component-class">
      {/* JSX here */}
    </div>
  );
};
```

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
- Clear node_modules and reinstall dependencies
- Check TypeScript errors in IDE
- Verify all imports are correct

**Runtime Errors**
- Check browser console for errors
- Verify API server is running
- Check network requests in DevTools

**Styling Issues**
- Ensure Tailwind is properly configured
- Check for CSS conflicts
- Verify responsive breakpoints

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Useful Links

- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Three.js Documentation](https://threejs.org/)