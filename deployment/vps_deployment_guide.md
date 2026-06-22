# ClinicOS VPS Staging Deployment & Operations Guide
# Platform: Ubuntu 24.04 LTS

This guide provides step-by-step instructions to configure, deploy, run, and verify **ClinicOS** on a clean VPS instance in a secure staging environment.

---

## 📋 Table of Contents
1. [Server Preparation & Firewalling](#1-server-preparation--firewalling)
2. [Docker & Docker Compose Installation](#2-docker--docker-compose-installation)
3. [Environment Configuration](#3-environment-configuration)
4. [Nginx & SSL (Let's Encrypt) Setup](#4-nginx--ssl-lets-encrypt-setup)
5. [Staging Stack Deployment](#5-staging-stack-deployment)
6. [Database Backup Automation Cron Setup](#6-database-backup-automation-cron-setup)
7. [Prometheus & Grafana Monitoring Launch](#7-prometheus--grafana-monitoring-launch)
8. [Security Headers Verification Commands](#8-security-headers-verification-commands)
9. [Error Tracking Integration (Sentry)](#9-error-tracking-integration-sentry)
10. [Rollback Procedures](#10-rollback-procedures)
11. [Staging Acceptance Checklist](#11-staging-acceptance-checklist)

---

## 1. Server Preparation & Firewalling

Log in to your VPS as root and configure basic security.

### Step 1.1: System Update & Core Packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git software-properties-common ufw unattended-upgrades
```

### Step 1.2: Hardening Firewall (UFW)
Only expose port 80 (HTTP), 443 (HTTPS), and your custom SSH port (default 22). **Block public access to Postgres (5432) and Redis (6379)**.
```bash
# Set defaults
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow standard services
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Enable firewall
sudo ufw enable
sudo ufw status verbose
```

---

## 2. Docker & Docker Compose Installation

Follow official Docker repositories to install Docker Engine on Ubuntu 24.04.

### Step 2.1: Add GPG Key and Repo
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

### Step 2.2: Install Docker Engine
```bash
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Step 2.3: Configure Non-Root Docker Access
Create a deploy user (`ubuntu` or `deploy`) and join the `docker` group.
```bash
sudo usermod -aG docker $USER
newgrp docker
docker run hello-world
```

---

## 3. Environment Configuration

### Step 3.1: Repository Setup
Clone the repository into `/home/ubuntu/clinicos` on the VPS:
```bash
cd /home/ubuntu
git clone https://github.com/your-org/clinicos.git
cd clinicos/deployment
```

### Step 3.2: Configure Environment File
Copy the provided template and populate it with secure passwords and DSN credentials.
```bash
cp .env.production.template .env
nano .env
```
Ensure the values for `DB_PASSWORD`, `JWT_SECRET`, and `ENCRYPTION_KEY` are long, secure strings.

---

## 4. Nginx & SSL (Let's Encrypt) Setup

Deploy Nginx on the host and acquire SSL certificates using Certbot.

### Step 4.1: Install Nginx & Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Step 4.2: Initial Let's Encrypt Certificate Request
Request a certificate for your domain (`staging.clinicos.internal` or your public staging domain).
```bash
sudo certbot certonly --nginx -d staging.clinicos.internal
```

### Step 4.3: Configure Nginx config
Copy the secure `nginx.conf` generated in the deployment repository to `/etc/nginx/nginx.conf`:
```bash
sudo cp /home/ubuntu/clinicos/deployment/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4.4: Auto-Renewal Verification
Let's Encrypt certs last 90 days. Verify the system timer for auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## 5. Staging Stack Deployment

Initialize the application services.

### Step 5.1: Create External Bridge Network
Ensure the shared network exists before booting:
```bash
docker network create clinicos-net || true
```

### Step 5.2: Build and Run Application containers
Run Docker Compose in detached mode:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Step 5.3: Verify Running Services
```bash
docker compose -f docker-compose.prod.yml ps
docker exec -it clinicos-backend npx prisma db push
```

---

## 6. Database Backup Automation Cron Setup

Set up daily automated PostgreSQL backups and rotation schedules.

### Step 6.1: Copy Scripts and Set Executable Permissions
Move scripts to secure locations outside the application directories:
```bash
sudo cp backup-cron.sh /usr/local/bin/clinicos-backup-cron.sh
sudo cp backup-rotation.sh /usr/local/bin/clinicos-backup-rotation.sh

sudo chmod +x /usr/local/bin/clinicos-backup-cron.sh
sudo chmod +x /usr/local/bin/clinicos-backup-rotation.sh
```

### Step 6.2: Add Cronjobs (Run Daily at 2:00 AM)
Open the host system crontab:
```bash
sudo crontab -e
```
Add the following lines at the bottom of the crontab:
```cron
# Run backup at 2:00 AM every day
0 2 * * * /usr/local/bin/clinicos-backup-cron.sh >> /var/log/clinicos-backup-cron.err 2>&1

# Run backup rotation immediately after at 2:30 AM
30 2 * * * /usr/local/bin/clinicos-backup-rotation.sh >> /var/log/clinicos-backup-rotation.err 2>&1
```

### Step 6.3: Create Backup Log File
Ensure the cron user has access to write to the backup log:
```bash
sudo touch /var/log/clinicos-backup.log
sudo chmod 644 /var/log/clinicos-backup.log
```

---

## 7. Prometheus & Grafana Monitoring Launch

Launch the monitoring dashboard.

### Step 7.1: Start Monitoring Containers
```bash
docker compose -f docker-compose.monitoring.yml up -d
```

### Step 7.2: Access Dashboard Interfaces
- **Prometheus UI**: Port `9090` (Tunnel to `http://localhost:9090` or access locally)
- **Grafana UI**: Port `3002` (User `admin` with password defined in `.env`).

---

## 8. Security Headers Verification Commands

Audit your reverse proxy configuration from a remote client machine to verify that secure HTTP headers are correctly set by Nginx.

```bash
# Verify HSTS, CSP, and Clickjacking protection headers
curl -I -k https://staging.clinicos.internal
```

### Expected Header Validation Checklist

| Target Header | Expected Output / Parameter | Purpose |
| :--- | :--- | :--- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS connectivity |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' ...` | Blocks Cross-Site Scripting (XSS) |
| `X-Frame-Options` | `DENY` | Prevents Clickjacking |
| `X-Content-Type-Options` | `nosniff` | Blocks mime-type sniffing |
| `Referrer-Policy` | `no-referrer-when-downgrade` | Controls metadata leakage in link tags |
| `Permissions-Policy` | `camera=(), microphone=() ...` | Disables browser hardware permissions |

---

## 9. Error Tracking Integration (Sentry)

Integrate error reporting to capture runtime stacktraces.

### Setup Checklist
1. Create a Sentry account and initialize a new project for `NextJS` (Frontend) and `Node` (Backend).
2. Grab the Sentry DSN URLs.
3. Configure the DSN tokens inside `/home/ubuntu/clinicos/deployment/.env`:
   - `BACKEND_SENTRY_DSN`
   - `FRONTEND_SENTRY_DSN`
4. Rebuild the application containers using the setup guidelines in [error_tracking_guide.md](file:///C:/Users/AANCHAL%20SINGH/.gemini/antigravity/scratch/deployment/error_tracking_guide.md).
5. Trigger a mock error by navigating to `/api/health` or rendering a custom test error to confirm Sentry receives the event payload.

---

## 10. Rollback Procedures

If a deployment fails, follow these steps to instantly restore services.

### Scenario A: Reverting Container Code Version
```bash
# 1. Revert Git repository to previous stable commit tag
git checkout tags/v1.2.0

# 2. Pull stable images or rebuild
docker compose -f docker-compose.prod.yml build

# 3. Recreate app containers
docker compose -f docker-compose.prod.yml up -d --no-deps backend frontend
```

### Scenario B: Database Recovery (Restoring Backup)
If a schema migration corrupts database tables, restore the last clean compressed `.gz` backup:
```bash
# 1. Stop app containers to terminate connections
docker compose -f docker-compose.prod.yml stop backend frontend

# 2. Re-create a clean postgres database
docker exec -t clinicos-db dropdb -U clinicos_admin --if-exists clinicos
docker exec -t clinicos-db createdb -U clinicos_admin clinicos

# 3. Restore backup archive
gunzip -c /var/backups/clinicos/clinicos-db-YYYY-MM-DD_HHMMSS.sql.gz | docker exec -i clinicos-db psql -U clinicos_admin -d clinicos

# 4. Restart app containers
docker compose -f docker-compose.prod.yml start backend frontend
```

---

## 11. Staging Acceptance Checklist

Before flagging the staging environment as **STAGING READY**, verify that all checks pass.

- [ ] **HTTPS Working**: Nginx routes traffic securely with a valid SSL cert.
- [ ] **JWT Authentication Working**: Registration and login return valid tokens.
- [ ] **PostgreSQL Healthy**: Container is running and responding to prisma schema queries.
- [ ] **Redis Healthy**: Session cache and WebSockets pub/sub function normally.
- [ ] **Uploads Working**: Laboratory PDFs and documents are saved in local folders correctly.
- [ ] **WebSockets Working**: Live OPD queue updates broadcast successfully to listening clients.
- [ ] **Queue Working**: Receptionist token issue updates the lobby queue.
- [ ] **Prescriptions Working**: SOAP notes generate PDF prescriptions on completion.
- [ ] **Reports Working**: Statistics page aggregates real Postgres records.
- [ ] **Backups Working**: Daily pg_dump cron jobs execute and rotate files older than 30 days.
- [ ] **Monitoring Working**: Prometheus scrapes nodes and Grafana dashboards display graphs.
- [ ] **Error Tracking Working**: Sentry intercepts backend errors and browser exceptions.
