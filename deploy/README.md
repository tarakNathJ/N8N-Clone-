# Deployment Guide

## Prerequisites
- DigitalOcean Droplet (Ubuntu 22.04/24.04)
- 1GB RAM, 25GB SSD
- SSH Access

## 1. Connect to Server
```bash
ssh root@<your-droplet-ip>
```

## 2. Clone Repository
```bash
git clone https://github.com/tarakNathJ/N8N-Clone-.git
cd N8N-Clone-
```

## 3. Run Setup Script
This will create a 4GB swap file (critical) and install Docker.
```bash
chmod +x deploy/setup.sh
./deploy/setup.sh
```
*Note: You might need to logout and login again after this step.*

## 4. Environment Configuration
Create the `.env` file for the production environment.
```bash
cp apps/primary_backend/.env.example apps/primary_backend/.env
# Repeat for other services and update values
```

## 5. Build & Run
We use the production compose file.

```bash
# Build the images (this might take time on 1GB RAM, consider building locally and pushing to a registry if it fails)
docker compose -f deploy/docker-compose.prod.yml build

# Start services
docker compose -f deploy/docker-compose.prod.yml up -d
```

## 6. Frontend Deployment
Since we are on a low-resource machine, build the frontend locally and copy it to the server.

**Local Machine:**
```bash
cd apps/fontend
npm run build
scp -r dist/* root@<your-droplet-ip>:/var/www/html/
```

**Server:**
Ensure Nginx container mounts the `/var/www/html` volume if you want to serve it via the Nginx container, or install Nginx on the host.

*Alternative: The provided nginx.conf assumes Nginx is running as a container or service mapping ports. Adjust as needed.*
