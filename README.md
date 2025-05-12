# CryptoPro Platform

A Next.js-based cryptocurrency investment and management platform with user portfolio tracking, deposit/withdrawal management, and real-time pricing data.

## Tech Stack

- **Frontend**: Next.js 15, React, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **APIs**: CoinGecko (proxied through server-side API)

## Local Development

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd crypto-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (copy `.env.example` to `.env.local`):
   ```bash
   cp .env.example .env.local
   ```

4. Install and set up a local PostgreSQL database, then update the `DATABASE_URL` in `.env.local`

5. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## VPS Deployment Guide

This guide explains how to deploy the Crypto Platform to a VPS using PostgreSQL and system environment variables.

### 1. Server Preparation

1. SSH into your VPS:
   ```bash
   ssh root@144.172.109.10
   ```

2. Update the system:
   ```bash
   apt update && apt upgrade -y
   ```

3. Install required dependencies:
   ```bash
   apt install -y curl git build-essential postgresql postgresql-contrib nginx
   ```

4. Install Node.js 18 (or newer):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs
   ```

5. Verify installations:
   ```bash
   node -v
   npm -v
   postgres --version
   ```

### 2. PostgreSQL Database Setup

1. Start and enable PostgreSQL service:
   ```bash
   systemctl start postgresql
   systemctl enable postgresql
   ```

2. Switch to the PostgreSQL user:
   ```bash
   sudo -i -u postgres
   ```

3. Create a database user and set a password:
   ```bash
   createuser --interactive --pwprompt
   # Enter name of role to add: cryptouser
   # Enter password for new role: [your-secure-password]
   # Enter it again: [your-secure-password]
   # Shall the new role be a superuser? (y/n) n
   # Shall the new role be allowed to create databases? (y/n) y
   # Shall the new role be allowed to create more new roles? (y/n) n
   ```

4. Create a database:
   ```bash
   createdb cryptodb -O cryptouser
   ```

5. Exit PostgreSQL user:
   ```bash
   exit
   ```

6. Configure PostgreSQL to accept connections with password:
   ```bash
   nano /etc/postgresql/*/main/pg_hba.conf
   ```
   
   Find the lines that look like this:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            peer
   ```
   
   And change `peer` to `md5`:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            md5
   ```

7. Restart PostgreSQL:
   ```bash
   systemctl restart postgresql
   ```

### 3. Application Deployment

1. Create a directory for the application:
   ```bash
   mkdir -p /var/www/crypto-platform
   ```

2. Clone the repository:
   ```bash
   cd /var/www/crypto-platform
   git clone https://github.com/your-username/crypto-platform.git .
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables system-wide (instead of using .env files):
   ```bash
   nano /etc/environment
   ```
   
   Add these lines (update values as needed):
   ```
   DATABASE_URL="postgresql://cryptouser:password@localhost:5432/cryptodb"
   NEXTAUTH_URL="https://your-domain.com"
   NEXTAUTH_SECRET="your-secure-random-string"
   NODE_ENV="production"
   ```

5. Apply the environment variables:
   ```bash
   source /etc/environment
   ```

6. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

7. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

8. Build the application:
   ```bash
   npm run build
   ```

### 4. Setting Up Process Manager (PM2)

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Create a PM2 configuration file:
   ```bash
   nano ecosystem.config.js
   ```
   
   Add the following content:
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'crypto-platform',
         script: 'npm',
         args: 'start',
         env: {
           NODE_ENV: 'production',
           PORT: 3000
         }
       }
     ]
   };
   ```

3. Start the application with PM2:
   ```bash
   pm2 start ecosystem.config.js
   ```

4. Set up PM2 to start on boot:
   ```bash
   pm2 startup
   pm2 save
   ```

### 5. Setting Up Nginx as a Reverse Proxy

1. Create a new Nginx configuration file:
   ```bash
   nano /etc/nginx/sites-available/crypto-platform
   ```
   
   Add the following configuration (replace with your domain):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. Enable the site by creating a symbolic link:
   ```bash
   ln -s /etc/nginx/sites-available/crypto-platform /etc/nginx/sites-enabled/
   ```

3. Test Nginx configuration:
   ```bash
   nginx -t
   ```

4. Restart Nginx:
   ```bash
   systemctl restart nginx
   ```

### 6. Setting Up SSL with Certbot (Optional but Recommended)

1. Install Certbot and Nginx plugin:
   ```bash
   apt install -y certbot python3-certbot-nginx
   ```

2. Obtain an SSL certificate:
   ```bash
   certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. Follow the prompts to complete SSL setup

4. Certbot will automatically update your Nginx configuration

### 7. Firewall Configuration (Optional)

1. Configure UFW to allow necessary traffic:
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

### 8. Maintenance and Updates

To update the application with the latest changes:

1. SSH into your server
2. Navigate to the application directory:
   ```bash
   cd /var/www/crypto-platform
   ```

3. Pull latest changes:
   ```bash
   git pull
   ```

4. Install dependencies (if any new ones):
   ```bash
   npm install
   ```

5. Apply any database migrations:
   ```bash
   npx prisma migrate deploy
   ```

6. Rebuild the application:
   ```bash
   npm run build
   ```

7. Restart the application:
   ```bash
   pm2 restart crypto-platform
   ```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `systemctl status postgresql`
- Check connection string in environment variables
- Ensure the database user has proper permissions

### Application Not Starting

- Check PM2 logs: `pm2 logs crypto-platform`
- Verify Next.js build was successful
- Check system resources (memory, CPU)

### Nginx Not Serving the Application

- Check Nginx status: `systemctl status nginx`
- Review Nginx error logs: `cat /var/log/nginx/error.log`
- Ensure the proxy settings are correct
