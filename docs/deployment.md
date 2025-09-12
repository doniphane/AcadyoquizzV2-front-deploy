# Guide de Déploiement - AcadyoQuizz

## Vue d'ensemble

Ce guide détaille les différentes méthodes de déploiement de l'application AcadyoQuizz en production. L'application peut être déployée sur différents environnements : serveurs traditionnels, plateformes cloud, ou services d'hébergement spécialisés.

## Prérequis de déploiement

### Environnement cible

- **Serveur** : Linux (Ubuntu 20.04+, CentOS 8+, Debian 10+)
- **RAM** : Minimum 1GB, recommandé 2GB+
- **Stockage** : 10GB minimum
- **Processeur** : 1 vCPU minimum, 2+ recommandé
- **Réseau** : Accès Internet, ports 80/443 ouverts

### Logiciels requis

- Docker et Docker Compose
- Nginx (si déployé sans Docker)
- Certificats SSL (Let's Encrypt recommandé)
- Nom de domaine configuré

## Méthodes de déploiement

### 1. Déploiement avec Docker (Recommandé)

#### Configuration production

Créez un fichier `docker-compose.prod.yml` :

```yaml
version: "3.9"

services:
  frontend:
    build: .
    container_name: acadyoquizz-frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    environment:
      - NODE_ENV=production
      - VITE_API_URL=https://api.votre-domaine.com
    networks:
      - acadyoquizz-network

  nginx-proxy:
    image: nginx:alpine
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
    networks:
      - acadyoquizz-network

networks:
  acadyoquizz-network:
    driver: bridge
```

#### Déploiement étape par étape

```bash
# 1. Cloner le projet sur le serveur
git clone <URL_DU_REPO> /var/www/acadyoquizz
cd /var/www/acadyoquizz/AcadyoquizzV2-front-deploy

# 2. Configurer les variables d'environnement
cp .env.example .env.production
nano .env.production

# 3. Construire et lancer
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Vérifier le statut
docker-compose -f docker-compose.prod.yml ps
```

### 2. Déploiement traditionnel (sans Docker)

#### Installation des dépendances

```bash
# 1. Installer Node.js et pnpm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm

# 2. Installer Nginx
sudo apt update
sudo apt install nginx

# 3. Cloner et construire l'application
git clone <URL_DU_REPO> /var/www/acadyoquizz
cd /var/www/acadyoquizz/AcadyoquizzV2-front-deploy
pnpm install
pnpm build

# 4. Copier les fichiers construits
sudo cp -r dist/* /var/www/html/acadyoquizz/
```

#### Configuration Nginx

Créez `/etc/nginx/sites-available/acadyoquizz` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    root /var/www/html/acadyoquizz;
    index index.html;

    # Redirection HTTPS (après configuration SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des assets statiques
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }

    # Compression gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Headers de sécurité
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

Activation de la configuration :

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/acadyoquizz /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Configuration SSL/HTTPS

### Let's Encrypt avec Certbot

```bash
# 1. Installer Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 2. Obtenir le certificat
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# 3. Test de renouvellement automatique
sudo certbot renew --dry-run

# 4. Configurer le renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

### Configuration SSL manuelle

Si vous avez vos propres certificats :

```nginx
server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /etc/ssl/certs/votre-domaine.com.crt;
    ssl_certificate_key /etc/ssl/private/votre-domaine.com.key;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Configuration du site...
}
```

## Variables d'environnement de production

### Fichier .env.production

```env
# Environnement
NODE_ENV=production

# API Configuration
VITE_API_URL=https://api.votre-domaine.com
VITE_APP_NAME=AcadyoQuizz
VITE_APP_VERSION=1.0.0

# Sécurité
VITE_APP_SECURE_COOKIES=true
VITE_APP_HTTPS_ONLY=true

# Analytics (optionnel)
VITE_ANALYTICS_ID=your-analytics-id

# Configuration CORS
VITE_ALLOWED_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com
```

### Configuration pour différents environnements

```bash
# Staging
VITE_API_URL=https://api-staging.votre-domaine.com

# Production
VITE_API_URL=https://api.votre-domaine.com

# Development
VITE_API_URL=http://localhost:8000
```

### GitHub Actions

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: |
          cd AcadyoquizzV2-front-deploy
          pnpm install

      - name: Build
        run: |
          cd AcadyoquizzV2-front-deploy
          pnpm build
        env:
          NODE_ENV: production
          VITE_API_URL: ${{ secrets.API_URL }}

      - name: Deploy to server
        uses: easingthemes/ssh-deploy@main
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: "-rlgoDzvc -i --delete"
          SOURCE: "AcadyoquizzV2-front-deploy/dist/"
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: "/var/www/html/acadyoquizz/"
```

### Script de déploiement

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Début du déploiement..."

# Variables
PROJECT_DIR="/var/www/acadyoquizz/AcadyoquizzV2-front-deploy"
BACKUP_DIR="/var/backups/acadyoquizz"
NGINX_CONFIG="/etc/nginx/sites-enabled/acadyoquizz"

# Backup de l'ancienne version
echo "📦 Sauvegarde de l'ancienne version..."
mkdir -p $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)
cp -r /var/www/html/acadyoquizz/* $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)/

# Mise à jour du code
echo "🔄 Mise à jour du code..."
cd $PROJECT_DIR
git pull origin main

# Installation des dépendances
echo "📋 Installation des dépendances..."
pnpm install

# Build de production
echo "🏗️ Build de production..."
pnpm build

# Déploiement des fichiers
echo "📁 Copie des fichiers..."
rm -rf /var/www/html/acadyoquizz/*
cp -r dist/* /var/www/html/acadyoquizz/

# Test de la configuration Nginx
echo "🔧 Test de la configuration Nginx..."
nginx -t

# Rechargement de Nginx
echo "♻️ Rechargement de Nginx..."
systemctl reload nginx

echo "✅ Déploiement terminé avec succès!"
```

## Rollback et récupération

### Processus de rollback

```bash
#!/bin/bash
# rollback.sh

BACKUP_DIR="/var/backups/acadyoquizz"
LATEST_BACKUP=$(ls -t $BACKUP_DIR | head -n1)

echo "🔄 Rollback vers la version: $LATEST_BACKUP"

# Arrêter les services si nécessaire
# systemctl stop nginx

# Restaurer les fichiers
rm -rf /var/www/html/acadyoquizz/*
cp -r $BACKUP_DIR/$LATEST_BACKUP/* /var/www/html/acadyoquizz/

# Redémarrer les services
systemctl restart nginx

echo "✅ Rollback terminé"
```

### Monitoring post-déploiement

```bash
# Script de vérification
#!/bin/bash
# health-check.sh

URL="https://votre-domaine.com"
EXPECTED_STATUS=200

echo "🔍 Vérification de l'application..."

STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $STATUS -eq $EXPECTED_STATUS ]; then
    echo "✅ Application accessible ($STATUS)"
else
    echo "❌ Problème détecté ($STATUS)"
    echo "🔄 Déclenchement du rollback..."
    ./rollback.sh
    exit 1
fi

echo "✅ Déploiement vérifié avec succès"
```
