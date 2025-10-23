# Production Deployment Guide

Complete guide for deploying the Excel Visualizer MERN stack application to production environments.

## 🌐 Deployment Overview

This guide covers multiple deployment strategies:
- Traditional VPS/Server deployment
- Docker containerization
- Cloud platforms (Heroku, AWS, Vercel, Railway)
- CI/CD pipeline setup

## 🛡️ Pre-Deployment Checklist

### Security Audit
- [ ] JWT secrets are secure and environment-specific
- [ ] Database credentials are not hardcoded
- [ ] File upload restrictions are properly configured
- [ ] CORS settings are configured for production domain
- [ ] Rate limiting is enabled
- [ ] Input validation is comprehensive
- [ ] Error messages don't expose sensitive information

### Performance Optimization
- [ ] Frontend is built for production (`npm run build`)
- [ ] Static assets are compressed
- [ ] Database indexes are created
- [ ] File upload size limits are appropriate
- [ ] MongoDB connection pooling is configured
- [ ] Proper logging is implemented

### Environment Configuration
- [ ] Production environment variables are set
- [ ] Database is production-ready (Atlas or dedicated server)
- [ ] SSL certificates are ready
- [ ] Domain names are configured
- [ ] Monitoring tools are set up

## 🖥️ Traditional VPS Deployment

### Server Requirements

**Minimum Specifications:**
- 2 CPU cores
- 4GB RAM
- 20GB SSD storage
- Ubuntu 20.04+ or CentOS 8+

**Recommended Specifications:**
- 4 CPU cores
- 8GB RAM
- 50GB SSD storage
- Load balancer for high availability

### 1. Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Application Deployment

```bash
# Clone repository
git clone <your-repo-url>
cd Excel-Visualizer

# Backend setup
cd backend
npm ci --only=production

# Create production environment file
sudo nano .env
```

**Production .env file:**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://localhost:27017/excel-visualizer-prod
JWT_SECRET=your_super_secure_production_jwt_secret_here
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/uploads
CLIENT_URL=https://yourdomain.com
```

```bash
# Create upload directory
sudo mkdir -p /var/www/uploads
sudo chown -R $USER:$USER /var/www/uploads
sudo chmod 755 /var/www/uploads

# Start backend with PM2
pm2 start server.js --name "excel-visualizer-backend"
pm2 save
pm2 startup

# Frontend setup
cd ../frontend
npm ci
REACT_APP_API_URL=https://yourdomain.com npm run build

# Copy build to web directory
sudo mkdir -p /var/www/excel-visualizer
sudo cp -r build/* /var/www/excel-visualizer/
sudo chown -R www-data:www-data /var/www/excel-visualizer
```

### 3. Nginx Configuration

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/excel-visualizer
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend static files
    location / {
        root /var/www/excel-visualizer;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase upload size limit
        client_max_body_size 10M;
    }

    # File uploads
    location /uploads {
        alias /var/www/uploads;
        expires 1d;
        add_header Cache-Control "public";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/excel-visualizer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate Setup

```bash
# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Set up auto-renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 5. MongoDB Production Setup

```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Secure MongoDB installation
mongo
```

```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password_here",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
})

use excel-visualizer-prod
db.createUser({
  user: "excelapp",
  pwd: "app_password_here",
  roles: [{ role: "readWrite", db: "excel-visualizer-prod" }]
})
```

Update MongoDB configuration:
```bash
sudo nano /etc/mongod.conf
```

```yaml
# Enable authentication
security:
  authorization: enabled

# Bind to specific IP
net:
  bindIp: 127.0.0.1
```

```bash
sudo systemctl restart mongod
```

Update backend .env with authenticated connection:
```env
MONGO_URI=mongodb://excelapp:app_password_here@localhost:27017/excel-visualizer-prod?authSource=excel-visualizer-prod
```

## 🐳 Docker Production Deployment

### 1. Multi-stage Production Dockerfile

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .
USER nodejs
EXPOSE 5000
CMD ["node", "server.js"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Frontend nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    server {
        listen       80;
        server_name  localhost;
        
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
}
```

### 2. Production Docker Compose

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: excel-visualizer-mongo-prod
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: excel-visualizer-prod
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - excel-visualizer-network
    command: mongod --auth

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: excel-visualizer-backend-prod
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGO_URI: mongodb://excelapp:${MONGO_APP_PASSWORD}@mongodb:27017/excel-visualizer-prod?authSource=excel-visualizer-prod
      JWT_SECRET: ${JWT_SECRET}
      MAX_FILE_SIZE: 10485760
      UPLOAD_PATH: /app/uploads
      CLIENT_URL: ${CLIENT_URL}
    volumes:
      - uploads_data:/app/uploads
    networks:
      - excel-visualizer-network
    depends_on:
      - mongodb
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: ${REACT_APP_API_URL}
    container_name: excel-visualizer-frontend-prod
    restart: unless-stopped
    networks:
      - excel-visualizer-network
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    container_name: excel-visualizer-nginx-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - uploads_data:/var/www/uploads:ro
    networks:
      - excel-visualizer-network
    depends_on:
      - frontend
      - backend

volumes:
  mongodb_data:
  uploads_data:

networks:
  excel-visualizer-network:
    driver: bridge
```

**Environment file (.env.prod):**
```env
MONGO_ROOT_PASSWORD=super_secure_root_password
MONGO_APP_PASSWORD=secure_app_password
JWT_SECRET=your_production_jwt_secret_64_characters_minimum_length_here
CLIENT_URL=https://yourdomain.com
REACT_APP_API_URL=https://yourdomain.com/api
```

### 3. Deploy with Docker Compose

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Update deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build
```

## ☁️ Cloud Platform Deployments

### Heroku Deployment

**1. Backend on Heroku:**

Create `Procfile` in backend directory:
```
web: node server.js
```

```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create excel-visualizer-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/excel-visualizer
heroku config:set CLIENT_URL=https://excel-visualizer-frontend.vercel.app

# Deploy
cd backend
git init
git add .
git commit -m "Initial backend deployment"
heroku git:remote -a excel-visualizer-backend
git push heroku main
```

**2. Frontend on Vercel:**

Install Vercel CLI:
```bash
npm i -g vercel
```

Create `vercel.json` in frontend directory:
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://excel-visualizer-backend.herokuapp.com"
  }
}
```

Deploy:
```bash
cd frontend
vercel --prod
```

### AWS ECS Deployment

**1. Create ECR repositories:**
```bash
aws ecr create-repository --repository-name excel-visualizer/backend
aws ecr create-repository --repository-name excel-visualizer/frontend
```

**2. Build and push Docker images:**
```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Backend
cd backend
docker build -t excel-visualizer/backend .
docker tag excel-visualizer/backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/excel-visualizer/backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/excel-visualizer/backend:latest

# Frontend
cd ../frontend
docker build -t excel-visualizer/frontend .
docker tag excel-visualizer/frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/excel-visualizer/frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/excel-visualizer/frontend:latest
```

**3. Create ECS task definition:**
```json
{
  "family": "excel-visualizer",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/excel-visualizer/backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5000"
        }
      ],
      "secrets": [
        {
          "name": "MONGO_URI",
          "valueFrom": "arn:aws:ssm:us-east-1:<account-id>:parameter/excel-visualizer/mongo-uri"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:ssm:us-east-1:<account-id>:parameter/excel-visualizer/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/excel-visualizer",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    },
    {
      "name": "frontend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/excel-visualizer/frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/excel-visualizer",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## 🔄 CI/CD Pipeline Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: '**/package-lock.json'
      
      - name: Install backend dependencies
        working-directory: ./backend
        run: npm ci
      
      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run backend tests
        working-directory: ./backend
        run: npm test
        env:
          NODE_ENV: test
          MONGO_URI: mongodb://localhost:27017/excel-visualizer-test
          JWT_SECRET: test-secret
      
      - name: Run frontend tests
        working-directory: ./frontend
        run: npm test -- --coverage --watchAll=false
      
      - name: Build frontend
        working-directory: ./frontend
        run: npm run build
        env:
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push backend image
        working-directory: ./backend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: excel-visualizer/backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Build and push frontend image
        working-directory: ./frontend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: excel-visualizer/frontend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster excel-visualizer-cluster --service excel-visualizer-service --force-new-deployment

  notify:
    needs: [test, deploy]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

## 📊 Production Monitoring

### Health Checks

**Backend health endpoint:**
```javascript
// Add to backend routes
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    
    // Check disk space for uploads
    const stats = await fs.promises.stat(process.env.UPLOAD_PATH);
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbState === 1 ? 'connected' : 'disconnected',
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      error: error.message
    });
  }
});
```

### Logging Setup

**Production logging with Winston:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Performance Monitoring

**Setup with New Relic:**
```javascript
// Add to beginning of server.js
if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}
```

**Setup with DataDog:**
```javascript
const tracer = require('dd-trace').init({
  logInjection: true,
  env: process.env.NODE_ENV
});
```

## 🚨 Production Troubleshooting

### Common Issues

**1. Memory Leaks:**
```bash
# Monitor memory usage
pm2 monit

# Restart if memory usage is high
pm2 restart excel-visualizer-backend
```

**2. Database Connection Issues:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection logs
tail -f /var/log/mongodb/mongod.log
```

**3. File Upload Issues:**
```bash
# Check disk space
df -h

# Check upload directory permissions
ls -la /var/www/uploads

# Clear old uploaded files (if needed)
find /var/www/uploads -type f -mtime +30 -delete
```

### Performance Optimization

**1. Enable compression:**
```javascript
const compression = require('compression');
app.use(compression());
```

**2. Optimize database queries:**
```javascript
// Add indexes for frequently queried fields
db.users.createIndex({ email: 1 });
db.files.createIndex({ userId: 1, createdAt: -1 });
db.charts.createIndex({ userId: 1, fileId: 1 });
```

**3. Configure connection pooling:**
```javascript
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

## 📈 Scaling Considerations

### Horizontal Scaling

**Load Balancer Configuration:**
```nginx
upstream backend {
    least_conn;
    server backend1.example.com:5000 max_fails=3 fail_timeout=30s;
    server backend2.example.com:5000 max_fails=3 fail_timeout=30s;
    server backend3.example.com:5000 max_fails=3 fail_timeout=30s;
}

server {
    location /api {
        proxy_pass http://backend;
        # ... other proxy settings
    }
}
```

### Database Scaling

**MongoDB Replica Set:**
```javascript
// Connection string for replica set
const mongoUri = 'mongodb://user:pass@mongo1:27017,mongo2:27017,mongo3:27017/excel-visualizer?replicaSet=rs0';
```

### CDN Setup

**Configure CloudFront for static assets:**
```javascript
// Add to frontend build process
const CDN_URL = process.env.REACT_APP_CDN_URL || '';

// In React components
const assetUrl = `${CDN_URL}/static/images/logo.png`;
```

This completes the production deployment guide. Your Excel Visualizer application is now ready for production use with proper security, monitoring, and scaling capabilities!