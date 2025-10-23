# Installation & Setup Guide

Complete setup instructions for the Excel Visualizer MERN stack application.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v14.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version` && `npm --version`

- **MongoDB** (v4.4 or higher)
  - **Option 1**: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
  - **Option 2**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Cloud)
  - Verify installation: `mongod --version`

- **Git** (for cloning the repository)
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Excel-Visualizer
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/excel-visualizer
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_complex
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CLIENT_URL=http://localhost:3000
```

Start the backend server:
```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the frontend development server:
```bash
npm start
```

The frontend will be running on `http://localhost:3000`

## 🐳 Docker Setup (Alternative)

### Using Docker Compose

1. **Ensure Docker is installed**
   - Download from [docker.com](https://www.docker.com/)

2. **Create docker-compose.yml in the root directory:**

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:5.0
    container_name: excel-visualizer-mongo
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=excel-visualizer

  backend:
    build: ./backend
    container_name: excel-visualizer-backend
    restart: always
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongodb:27017/excel-visualizer
      - JWT_SECRET=your_super_secret_jwt_key_here
      - CLIENT_URL=http://localhost:3000
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    container_name: excel-visualizer-frontend
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

3. **Create Dockerfile for backend:**

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

4. **Create Dockerfile for frontend:**

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

5. **Run with Docker Compose:**

```bash
docker-compose up --build
```

## 🗄️ Database Configuration

### Local MongoDB Setup

1. **Start MongoDB service:**
   ```bash
   # On Windows
   net start MongoDB

   # On macOS (with Homebrew)
   brew services start mongodb-community

   # On Linux
   sudo systemctl start mongod
   ```

2. **Create database and initial admin user:**
   ```bash
   mongosh
   ```

   ```javascript
   use excel-visualizer
   
   // Create admin user
   db.users.insertOne({
     username: "admin",
     email: "admin@example.com",
     password: "$2a$12$hashedPasswordHere", // Use bcrypt to hash
     firstName: "Admin",
     lastName: "User",
     role: "admin",
     isActive: true,
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

### MongoDB Atlas (Cloud) Setup

1. **Create Atlas account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a cluster:**
   - Choose M0 Sandbox (free tier)
   - Select your preferred region
   - Create cluster

3. **Setup database access:**
   - Go to Database Access
   - Add a new database user
   - Choose password authentication
   - Grant read/write permissions

4. **Configure network access:**
   - Go to Network Access
   - Add IP address (0.0.0.0/0 for development)

5. **Get connection string:**
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Update your `.env` file:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/excel-visualizer?retryWrites=true&w=majority
   ```

## 🔐 Security Configuration

### JWT Secret Generation

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/excel-visualizer
JWT_SECRET=your_generated_jwt_secret_here
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CLIENT_URL=http://localhost:3000
```

**Frontend (if needed):**
```env
REACT_APP_API_URL=http://localhost:5000
```

## 📁 File Structure After Setup

```
Excel-Visualizer/
├── backend/
│   ├── node_modules/      # Backend dependencies
│   ├── uploads/           # File upload directory (created automatically)
│   ├── .env              # Environment variables (you create this)
│   └── ...
├── frontend/
│   ├── node_modules/      # Frontend dependencies
│   ├── build/            # Production build (after npm run build)
│   └── ...
└── docker-compose.yml     # Docker configuration (optional)
```

## 🧪 Testing the Installation

### 1. Verify Backend

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 2. Verify Frontend

Navigate to `http://localhost:3000` in your browser. You should see the Excel Visualizer home page.

### 3. Test Full Stack

1. Register a new user account
2. Upload an Excel file
3. Create a chart from the uploaded data
4. Verify the chart displays correctly

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

**MongoDB Connection Issues:**
- Verify MongoDB is running: `mongosh` (should connect without errors)
- Check the connection string in `.env`
- Ensure network access is configured (for Atlas)

**Module Not Found Errors:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Build Errors:**
- Ensure Node.js version is 14+ 
- Check for TypeScript errors in IDE
- Clear build cache: `npm run build -- --clean`

### Performance Issues

**Slow File Upload:**
- Increase `MAX_FILE_SIZE` in backend `.env`
- Check available disk space
- Verify network connection

**Chart Rendering Issues:**
- Check browser console for JavaScript errors
- Ensure Chart.js and Three.js libraries loaded correctly
- Verify data format is correct

## 🔧 Development Tips

### Hot Reloading

Both frontend and backend support hot reloading:
- **Frontend**: Changes automatically trigger browser refresh
- **Backend**: Uses nodemon to restart server on file changes

### Debugging

**Backend Debugging:**
```bash
# Start with debug logging
DEBUG=* npm run dev
```

**Frontend Debugging:**
- Use React Developer Tools browser extension
- Use Redux DevTools extension
- Check browser console for errors

### Database Management

**View Database Contents:**
```bash
mongosh
use excel-visualizer
db.users.find().pretty()
db.files.find().pretty()
db.charts.find().pretty()
```

**Reset Database:**
```bash
mongosh
use excel-visualizer
db.dropDatabase()
```

## 📦 Production Deployment

### Environment Setup

**Backend Production Environment:**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...atlas.mongodb.net/excel-visualizer
JWT_SECRET=your_production_jwt_secret
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CLIENT_URL=https://your-domain.com
```

### Build Commands

**Frontend Production Build:**
```bash
cd frontend
npm run build
```

**Backend Production Setup:**
```bash
cd backend
npm ci --only=production
```

### Deployment Options

1. **Traditional VPS/Server**
   - Use PM2 for process management
   - Set up Nginx as reverse proxy
   - Configure SSL certificates

2. **Heroku**
   - Use Heroku CLI for deployment
   - Configure environment variables in dashboard
   - Use MongoDB Atlas for database

3. **AWS/Digital Ocean**
   - Use Docker containers
   - Configure load balancers
   - Set up CI/CD pipelines

4. **Vercel (Frontend) + Railway (Backend)**
   - Deploy frontend to Vercel
   - Deploy backend to Railway
   - Use MongoDB Atlas for database

## 🔍 Health Checks

### System Health Endpoints

**Backend Health:**
- `GET /api/health` - Server status
- `GET /api/admin/system-info` - System information (admin only)

**Database Health:**
```javascript
// Check MongoDB connection
mongoose.connection.readyState === 1 // Connected
```

**Frontend Health:**
- Navigate to any route
- Check browser console for errors
- Verify API calls are successful

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)

## 🆘 Getting Help

If you encounter issues during setup:

1. **Check the logs:**
   - Backend: Console output from `npm run dev`
   - Frontend: Browser developer console
   - Database: MongoDB logs

2. **Common solutions:**
   - Restart all services
   - Clear caches and reinstall dependencies  
   - Check environment variables
   - Verify network connectivity

3. **Documentation:**
   - Review README files in frontend/ and backend/
   - Check API documentation
   - Review error messages carefully

The application should now be fully functional with both frontend and backend running successfully!