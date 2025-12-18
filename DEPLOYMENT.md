# Hướng dẫn CI/CD Frontend với PM2

## 1. Chuẩn bị VPS cho Frontend

### 1.1. Cài đặt serve (static server)

```bash
# SSH vào VPS
ssh ubuntu@datavis.site

# Cài PM2 serve
sudo npm install -g pm2 serve
```

### 1.2. Setup Frontend folder

```bash
# Tạo thư mục
sudo mkdir -p /var/www/fe-datavis
sudo chown -R ubuntu:ubuntu /var/www/fe-datavis

# Clone repo
cd /var/www
git clone git@github.com:Capstone-DataVis-FA25/FE_WEB_CUSTOMER.git fe-datavis
cd fe-datavis
```

## 2. Cấu hình Frontend

### 2.1. Tạo file .env.production

```bash
nano .env.production
```

Nội dung:

```env
NODE_ENV=production
VITE_API_BASE_URL=https://be.datavis.site
VITE_GOOGLE_CLIENT_ID=your-prod-google-client-id
VITE_APP_NAME=DataVis
```

### 2.2. Build và deploy lần đầu

```bash
# Cài dependencies
npm install

# Build production
npm run build

# Chạy với PM2
pm2 start ecosystem.config.js --env production

# Lưu PM2 list
pm2 save
```

## 3. Cấu hình Nginx cho Frontend

```bash
sudo nano /etc/nginx/sites-available/fe-datavis
```

Nội dung:

```nginx
server {
    listen 80;
    server_name datavis.site www.datavis.site;

    root /var/www/fe-datavis/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (nếu cần)
    location /api {
        proxy_pass https://be.datavis.site;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/fe-datavis /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## 4. Setup SSL

```bash
sudo certbot --nginx -d datavis.site -d www.datavis.site
```

## 5. Deploy Scripts

### 5.1. Tạo script deploy tự động

```bash
nano /var/www/fe-datavis/deploy.sh
```

Nội dung:

```bash
#!/bin/bash
set -e

echo "🚀 Starting Frontend Deployment..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build production
echo "🔨 Building production..."
npm run build

# Reload PM2 (nếu dùng PM2 serve)
# pm2 reload ecosystem.config.js --env production

echo "✅ Deployment completed!"
echo "🌐 Site: https://datavis.site"
```

```bash
# Phân quyền execute
chmod +x deploy.sh
```

### 5.2. Deploy từ local với PM2

```bash
# Setup lần đầu
pm2 deploy ecosystem.config.js production setup

# Deploy
pm2 deploy ecosystem.config.js production
```

### 5.3. Hoặc deploy thủ công trên VPS

```bash
cd /var/www/fe-datavis
./deploy.sh
```

## 6. CI/CD với GitHub Actions

Tạo file `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'FE_WEB_CUSTOMER/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Build
        working-directory: ./FE_WEB_CUSTOMER
        run: |
          npm install
          npm run build
        env:
          VITE_API_BASE_URL: https://be.datavis.site
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}

      - name: Deploy to VPS
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: 'FE_WEB_CUSTOMER/dist/*'
          target: '/var/www/fe-datavis/'
          strip_components: 2

      - name: Restart Services
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/fe-datavis
            pm2 reload fe-datavis || pm2 start ecosystem.config.js --env production
```

## 7. Alternative: Nginx Only (Không dùng PM2 serve)

Nếu bạn chỉ muốn dùng Nginx serve static files (khuyến nghị):

```bash
# Build
npm run build

# Copy dist sang /var/www/html hoặc custom path
sudo cp -r dist/* /var/www/fe-datavis/dist/

# Nginx sẽ tự serve từ root /var/www/fe-datavis/dist
```

## 8. Monitoring

```bash
# Xem PM2 status (nếu dùng PM2 serve)
pm2 status

# Xem logs
pm2 logs fe-datavis

# Xem Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Xem Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## 9. Setup cả BE và FE trên cùng VPS

### Cấu trúc thư mục:

```
/var/www/
├── be-datavis/          # Backend NestJS
│   ├── dist/
│   ├── node_modules/
│   └── ecosystem.config.js
├── fe-datavis/          # Frontend React
│   ├── dist/
│   ├── node_modules/
│   └── ecosystem.config.js
```

### PM2 List:

```bash
pm2 list
# ┌─────┬──────────────┬─────────┬─────────┬──────────┐
# │ id  │ name         │ mode    │ status  │ port     │
# ├─────┼──────────────┼─────────┼─────────┼──────────┤
# │ 0   │ be-datavis   │ fork    │ online  │ 1011     │
# │ 1   │ fe-datavis   │ fork    │ online  │ 5173     │
# └─────┴──────────────┴─────────┴─────────┴──────────┘
```

### Nginx config cho cả 2:

```nginx
# Backend
server {
    listen 80;
    server_name be.datavis.site;
    location / {
        proxy_pass http://localhost:1011;
        # ... proxy settings
    }
}

# Frontend
server {
    listen 80;
    server_name datavis.site www.datavis.site;
    root /var/www/fe-datavis/dist;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 10. Quick Deploy Commands

```bash
# Deploy Backend
cd /var/www/be-datavis && git pull && npm install && npm run build && pm2 reload be-datavis

# Deploy Frontend
cd /var/www/fe-datavis && git pull && npm install && npm run build

# Restart all PM2
pm2 restart all

# Reload Nginx
sudo systemctl reload nginx
```
