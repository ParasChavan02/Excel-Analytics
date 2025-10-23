# Excel Visualizer - MERN Stack Application

A complete MERN stack application for uploading, parsing, and visualizing Excel data with interactive 2D and 3D charts.

## 🚀 Features

- **Excel File Upload & Parsing**: Upload .xls or .xlsx files with automatic parsing
- **Dynamic Data Mapping**: Choose X-axis and Y-axis columns dynamically
- **Interactive Charts**: 2D charts (Chart.js) and 3D visualizations (Three.js)
- **Export Capabilities**: Download charts as PNG or PDF
- **User Authentication**: JWT-based signup/login system
- **Admin Dashboard**: Admin can view and manage all user uploads
- **User Dashboard**: View upload history and generated graphs
- **Responsive Design**: Modern UI built with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- React.js
- Redux Toolkit (State Management)
- Chart.js (2D Charts)
- Three.js (3D Visualizations)
- Tailwind CSS (Styling)

### Backend
- Node.js
- Express.js
- MongoDB (Database)
- Mongoose (ODM)
- Multer (File Uploads)
- SheetJS/xlsx (Excel Parsing)
- JWT (Authentication)

## 📁 Project Structure

```
Excel-Visualizer/
├── frontend/          # React application
└── backend/           # Node.js Express API
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
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

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: ['user', 'admin'],
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date
}
```

### File Model
```javascript
{
  filename: String,
  originalName: String,
  path: String,
  size: Number,
  mimetype: String,
  uploadedBy: ObjectId (User),
  status: ['uploading', 'processing', 'completed', 'failed'],
  processedData: {
    headers: [String],
    rows: [Mixed],
    totalRows: Number,
    totalColumns: Number
  },
  metadata: Object,
  charts: [ObjectId (Chart)],
  isPublic: Boolean,
  tags: [String],
  description: String,
  createdAt: Date
}
```

### Chart Model
```javascript
{
  title: String,
  description: String,
  chartType: String,
  dimension: ['2d', '3d'],
  fileId: ObjectId (File),
  createdBy: ObjectId (User),
  config: {
    xAxis: Object,
    yAxis: Object,
    zAxis: Object,
    colors: Object,
    options: Object
  },
  chartData: Object,
  exportFormats: [String],
  isPublic: Boolean,
  views: Number,
  likes: [ObjectId (User)],
  tags: [String],
  createdAt: Date
}
```