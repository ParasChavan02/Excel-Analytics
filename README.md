# Excel Visualizer - Modern MERN Stack Analytics Platform

A powerful, enterprise-ready MERN stack application for sophisticated data analysis and visualization of Excel data with interactive 2D and 3D charts. Transform your spreadsheet data into meaningful insights with our advanced visualization tools.

## ⭐ Key Features

- **Smart Excel Processing**
  - Support for .xls, .xlsx, and .csv files
  - Automatic column type detection
  - Intelligent data cleaning and validation
  - Handles large datasets efficiently

- **Advanced Visualization**
  - Interactive 2D charts powered by Chart.js
  - Immersive 3D visualizations using Three.js
  - Real-time data updates
  - Custom chart templates

- **Enterprise Features**
  - Role-based access control (RBAC)
  - Secure JWT authentication
  - Data encryption at rest
  - Audit logging
  - API rate limiting

- **Modern UI/UX**
  - Responsive Tailwind CSS design
  - Dark/Light theme support
  - Accessible (WCAG 2.1 compliant)
  - Progressive Web App (PWA) ready

## 🛠️ Tech Stack

### Frontend
- React.js 18+ with TypeScript
- Redux Toolkit & RTK Query
- Chart.js v4 (2D Charts)
- Three.js r160+ (3D Visualizations)
- Tailwind CSS v3
- Jest & React Testing Library
- PWA with Workbox
- WebAssembly for heavy computations

### Backend
- Node.js v18+ with Express.js
- TypeScript for type safety
- MongoDB with Mongoose ODM
- Redis for caching
- Multer for file uploads
- SheetJS/xlsx for Excel parsing
- JWT & OAuth2 authentication
- Socket.IO for real-time updates
- Jest for testing
- PM2 for process management

## 📁 Project Structure

```
Excel-Visualizer/
├── frontend/          # React application
└── backend/           # Node.js Express API
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v7.0+)
- npm (v9+) or yarn (v4+)
- Git

### Environment Setup
1. Clone the repository
```bash
git clone https://github.com/ParasChavan02/Excel-Analytics.git
cd Excel-Analytics
```

2. Set up environment variables
```bash
# Backend (.env)
cp backend/.env.example backend/.env
# Frontend (.env)
cp frontend/.env.example frontend/.env
```

### Backend Setup
```bash
cd backend
npm install
# Development mode
npm run dev
# Production mode
npm run build && npm start
```

### Frontend Setup
```bash
cd frontend
npm install
# Development mode
npm start
# Production build
npm run build
```

### Docker Setup (Optional)
```bash
# Build and run using Docker Compose
docker-compose up -d
```

## 📖 Documentation

See individual README files in `frontend/` and `backend/` directories for detailed setup instructions.

## 🏗️ Architecture

```
Excel-Visualizer/
├── frontend/          # React Application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store & slices
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
│
├── backend/           # Node.js API Server
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── uploads/           # File upload directory
│   └── package.json       # Backend dependencies
│
└── README.md          # Project documentation
```

## 🔗 API Integration

The frontend communicates with the backend through RESTful APIs:

- **Authentication**: JWT-based auth system
- **File Operations**: Upload, parse, manage Excel files
- **Chart Management**: Create, update, delete visualizations
- **User Management**: Profile and settings management
- **Admin Operations**: System administration features

## 🎨 Key Features Implemented

### ✅ Authentication System
- User registration and login
- JWT token management
- Protected routes
- Role-based access control (User/Admin)

### ✅ File Management
- Excel file upload (.xls, .xlsx)
- Automatic file parsing with SheetJS
- File metadata management
- Error handling and validation

### ✅ Data Visualization
- 2D Charts: Bar, Line, Pie, Scatter, Area, Radar
- 3D Visualizations: 3D Bar, Line, Scatter, Surface
- Dynamic axis mapping
- Color customization
- Interactive chart options

### ✅ User Dashboard
- File upload history
- Chart gallery
- Quick actions
- Usage statistics

### ✅ Admin Panel
- User management
- System statistics
- File and chart moderation
- System health monitoring

### ✅ Export Capabilities
- PNG image export
- PDF document export
- SVG vector export
- Raw data export (CSV/JSON)

## 💾 Database Schema

All models are strictly typed using TypeScript interfaces and Mongoose schemas.

### User Model
```typescript
interface IUser {
  username: string;
  email: string;
  password: string; // Argon2 hashed
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'analyst';
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLogin: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    defaultChartType: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### File Model
```typescript
interface IFile {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  uploadedBy: Types.ObjectId;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  processedData: {
    headers: string[];
    rows: unknown[];
    totalRows: number;
    totalColumns: number;
    dataTypes: Record<string, string>;
    summary: {
      numericalColumns: string[];
      categoricalColumns: string[];
      dateColumns: string[];
    };
  };
  metadata: Record<string, unknown>;
  charts: Types.ObjectId[];
  isPublic: boolean;
  tags: string[];
  description: string;
  version: number;
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Chart Model
```typescript
interface IChart {
  title: string;
  description: string;
  chartType: string;
  dimension: '2d' | '3d';
  fileId: Types.ObjectId;
  createdBy: Types.ObjectId;
  config: {
    xAxis: ChartAxisConfig;
    yAxis: ChartAxisConfig;
    zAxis?: ChartAxisConfig;
    colors: ColorConfig;
    animations: AnimationConfig;
    options: ChartOptions;
  };
  chartData: unknown;
  exportFormats: string[];
  isPublic: boolean;
  views: number;
  likes: Types.ObjectId[];
  tags: string[];
  thumbnail: string;
  sharing: {
    isShareable: boolean;
    password?: string;
    expiresAt?: Date;
  };
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔒 Security Features

- **Authentication & Authorization**
  - JWT with automatic refresh tokens
  - OAuth2 integration (Google, GitHub)
  - Two-factor authentication (2FA)
  - Role-based access control (RBAC)

- **Data Security**
  - AES-256 encryption for sensitive data
  - HTTPS-only communication
  - CORS protection
  - Rate limiting and brute force protection
  - Input validation and sanitization
  - XSS and CSRF protection

- **Compliance**
  - GDPR-ready data handling
  - Configurable data retention policies
  - Audit logging
  - Data export capabilities

## 📊 Performance Optimization

- **Frontend**
  - Code splitting and lazy loading
  - Service Worker caching
  - WebAssembly for heavy computations
  - Virtual scrolling for large datasets
  - Optimized bundle size

- **Backend**
  - Redis caching layer
  - Database indexing
  - Stream processing for large files
  - Horizontal scaling support
  - Load balancing ready

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Support

If you found this project helpful, please consider giving it a star ⭐️

---
Built with ❤️ by [Paras Chavan](https://github.com/ParasChavan02)
```