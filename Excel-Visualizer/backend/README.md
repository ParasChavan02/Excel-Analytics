# Excel Visualizer Backend

Node.js Express API server for the Excel Visualizer application.

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **SheetJS/xlsx** - Excel file parsing
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
backend/
├── middleware/          # Custom middleware
│   ├── auth.js         # Authentication middleware
│   └── upload.js       # File upload middleware
├── models/             # Database models
│   ├── User.js         # User model
│   ├── File.js         # File model
│   └── Chart.js        # Chart model
├── routes/             # API routes
│   ├── auth.js         # Authentication routes
│   ├── files.js        # File management routes
│   ├── charts.js       # Chart management routes
│   └── admin.js        # Admin routes
├── utils/              # Utility functions
│   ├── excelParser.js  # Excel parsing utilities
│   └── jwt.js          # JWT utilities
├── uploads/            # File upload directory
├── .env.example        # Environment variables template
├── server.js           # Server entry point
└── package.json        # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/excel-visualizer
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_complex
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Start the server**
   
   For development:
   ```bash
   npm run dev
   ```
   
   For production:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## 🔗 API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### File Routes (`/api/files`)

- `POST /api/files/upload` - Upload Excel file
- `GET /api/files` - Get user's files
- `GET /api/files/:id` - Get specific file
- `GET /api/files/:id/data` - Get file data for charts
- `PUT /api/files/:id` - Update file metadata
- `DELETE /api/files/:id` - Delete file
- `POST /api/files/:id/reprocess` - Reprocess failed file

### Chart Routes (`/api/charts`)

- `POST /api/charts` - Create new chart
- `GET /api/charts` - Get charts (user's or public)
- `GET /api/charts/:id` - Get specific chart
- `PUT /api/charts/:id` - Update chart
- `DELETE /api/charts/:id` - Delete chart
- `POST /api/charts/:id/like` - Toggle chart like

### Admin Routes (`/api/admin`) - Admin Only

- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `GET /api/admin/files` - Get all files
- `DELETE /api/admin/files/:id` - Delete any file
- `GET /api/admin/charts` - Get all charts
- `DELETE /api/admin/charts/:id` - Delete any chart
- `GET /api/admin/system-info` - Get system information

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📁 File Upload

- **Supported formats**: `.xls`, `.xlsx`
- **Maximum file size**: 10MB (configurable)
- **Upload directory**: `./uploads`
- **Processing**: Automatic parsing with SheetJS

## 🗃️ Database Models

### User Model
- Personal information (name, email, username)
- Authentication (hashed password)
- Role (user/admin)
- Account status

### File Model
- File metadata (name, size, type)
- Processed Excel data (headers, rows)
- Upload status tracking
- User associations

### Chart Model
- Chart configuration (type, axes, colors)
- Generated chart data
- Visualization settings
- Public/private visibility

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- File type validation
- CORS configuration
- Helmet security headers
- Input validation with express-validator

## 📊 Supported Chart Types

### 2D Charts
- Bar charts
- Line charts
- Pie charts
- Doughnut charts
- Scatter plots
- Bubble charts
- Area charts
- Radar charts
- Polar area charts

### 3D Charts
- 3D Bar charts
- 3D Line charts
- 3D Scatter plots
- 3D Surface charts

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/excel-visualizer` |
| `JWT_SECRET` | JWT signing secret | Required |
| `MAX_FILE_SIZE` | Maximum upload size in bytes | `10485760` (10MB) |
| `UPLOAD_PATH` | File upload directory | `./uploads` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 📈 Performance

- Pagination for large datasets
- Efficient file processing
- Optimized database queries
- Memory-conscious Excel parsing
- File size limitations

## 🐛 Error Handling

- Comprehensive error responses
- Validation error details
- File processing error handling
- Graceful failure recovery

## 🧪 Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (Jest)

### Adding New Features

1. Create new route files in `routes/`
2. Add models in `models/`
3. Create utilities in `utils/`
4. Add middleware in `middleware/`
5. Update server.js to include new routes

## 📝 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": {...},
  "pagination": {...}
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": [...],
  "error": "Development error details"
}
```

## 🔍 Health Check

The API includes a health check endpoint:

```
GET /api/health
```

Returns server status, uptime, and timestamp.

## 📚 Dependencies

### Core Dependencies
- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT implementation
- multer - File upload handling
- xlsx - Excel file parsing

### Security Dependencies
- cors - Cross-origin resource sharing
- helmet - Security headers
- express-rate-limit - Rate limiting
- express-validator - Input validation

### Development Dependencies
- nodemon - Development server
- jest - Testing framework

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## 📄 License

MIT License - see LICENSE file for details