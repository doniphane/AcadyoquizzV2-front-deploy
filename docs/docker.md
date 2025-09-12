# Guide Docker - AcadyoQuizz

## Vue d'ensemble

Ce guide explique comment utiliser Docker pour développer, construire et déployer l'application AcadyoQuizz. L'application utilise une approche de conteneurisation multi-étapes avec Nginx pour servir les fichiers statiques.

## Prérequis Docker

### Installation de Docker

#### Windows
1. Téléchargez Docker Desktop depuis [docker.com](https://docs.docker.com/desktop/windows/install/)
2. Exécutez l'installateur et redémarrez votre machine
3. Vérifiez l'installation :
```bash
docker --version
docker-compose --version
```

#### macOS
```bash
# Avec Homebrew
brew install docker docker-compose

# Ou téléchargez Docker Desktop depuis docker.com
```

#### Linux (Ubuntu/Debian)
```bash
# Mettre à jour les paquets
sudo apt update

# Installer Docker
sudo apt install docker.io docker-compose

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrer la session ou la machine
```

### Vérification de l'installation
```bash
docker --version          # Docker version 24.x.x
docker-compose --version  # Docker Compose version 2.x.x
```

## Architecture Docker

### Dockerfile expliqué

Le projet utilise un Dockerfile multi-étapes :

```dockerfile
# Étape 1 : Build de l'application React
FROM node:22-alpine as build 
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm run build

# Étape 2 : Servir avec Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

#### Étape 1 : Build
- **Base** : `node:22-alpine` (image Node.js légère)
- **Gestionnaire** : pnpm (plus rapide que npm)
- **Build** : Compilation TypeScript + Vite

#### Étape 2 : Production
- **Base** : `nginx:alpine` (serveur web léger)
- **Contenu** : Fichiers statiques de l'étape build
- **Configuration** : nginx.conf personnalisé

## Docker Compose

### Configuration actuelle

Le fichier `docker-compose.yml` configure :

```yaml
version: "3.9"

services:
  frontend:
    build: .
    container_name: react-frontend
    ports:
      - "5173:80"
    networks:
      - app-network
    environment:
      - VITE_API_URL=https://acadyoquizz.noelsonnelly.xyz
    restart: unless-stopped

networks:
  app-network:
    driver: bridge
```

### Variables d'environnement

Variables supportées dans Docker :
- `VITE_API_URL` : URL de l'API backend
- `NODE_ENV` : Environnement (production par défaut)

## Commandes Docker

### Construction de l'image

```bash
# Construction simple
docker build -t acadyoquizz-frontend .

# Construction avec tag de version
docker build -t acadyoquizz-frontend:v1.0.0 .

# Construction sans cache
docker build --no-cache -t acadyoquizz-frontend .
```

### Exécution du conteneur

```bash
# Lancement simple
docker run -d -p 5173:80 acadyoquizz-frontend

# Avec variables d'environnement
docker run -d -p 5173:80 \
  -e VITE_API_URL=http://localhost:8000 \
  acadyoquizz-frontend

# Avec nom de conteneur
docker run -d -p 5173:80 \
  --name acadyoquizz-app \
  acadyoquizz-frontend
```

### Docker Compose

```bash
# Démarrage de tous les services
docker-compose up

# En arrière-plan (detached mode)
docker-compose up -d

# Reconstruction forcée
docker-compose up --build

# Voir les logs
docker-compose logs frontend

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

## Développement avec Docker

### Option 1 : Développement avec hot-reload

Créez un `docker-compose.dev.yml` :

```yaml
version: "3.9"

services:
  frontend-dev:
    build:
      context: .
      target: build  # S'arrêter à l'étape build
    container_name: react-frontend-dev
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:8000
    command: pnpm dev --host 0.0.0.0
    networks:
      - app-network
```

Utilisation :
```bash
docker-compose -f docker-compose.dev.yml up
```

### Option 2 : Développement hybride

```bash
# Installer localement pour l'IDE
pnpm install

# Lancer seulement les services externes via Docker
# (base de données, API, etc.)
```

## Configuration Nginx

### Configuration par défaut (`nginx.conf`)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gestion des routes React (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des assets statiques
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Sécurité
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

### Personnalisation Nginx

Pour modifier la configuration :

1. Éditez le fichier `nginx.conf`
2. Reconstruisez l'image Docker
3. Redéployez le conteneur

## Optimisations Docker

### Multi-stage builds

Avantages de notre approche multi-étapes :
- **Taille réduite** : Image finale sans Node.js ni sources
- **Sécurité** : Moins de surface d'attaque
- **Performance** : Nginx optimisé pour servir des fichiers statiques

### Optimisation de la taille

```dockerfile
# Utilisation d'images Alpine (plus légères)
FROM node:22-alpine as build
FROM nginx:alpine

# Nettoyage des caches
RUN apk --no-cache add ...

# Copy sélectif
COPY --from=build /app/dist /usr/share/nginx/html
```

### Optimisation du build

```dockerfile
# Cache des dépendances
COPY package*.json ./
RUN pnpm install

# Copy du code après (meilleur cache)
COPY . .
RUN pnpm run build
```

## Surveillance et Logs

### Monitoring des conteneurs

```bash
# Status des conteneurs
docker ps

# Logs en temps réel
docker-compose logs -f frontend

# Statistiques d'utilisation
docker stats

# Inspecter un conteneur
docker inspect react-frontend
```

### Debugging

```bash
# Accéder au shell du conteneur
docker exec -it react-frontend sh

# Copier des fichiers depuis le conteneur
docker cp react-frontend:/usr/share/nginx/html ./output

# Vérifier la configuration Nginx
docker exec react-frontend nginx -t
```

## Déploiement avec Docker

### Registry Docker

```bash
# Tag pour un registry
docker tag acadyoquizz-frontend:latest registry.example.com/acadyoquizz-frontend:latest

# Push vers le registry
docker push registry.example.com/acadyoquizz-frontend:latest

# Pull depuis le registry
docker pull registry.example.com/acadyoquizz-frontend:latest
```

### Docker Swarm (Cluster)

```yaml
# docker-stack.yml
version: "3.8"

services:
  frontend:
    image: registry.example.com/acadyoquizz-frontend:latest
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
    ports:
      - "80:80"
    networks:
      - app-network
```

Déploiement :
```bash
docker stack deploy -c docker-stack.yml acadyoquizz
```

## Variables d'environnement pour Docker

### Fichier .env pour Docker Compose

Créez un fichier `.env` :

```env
# Version de l'application
APP_VERSION=1.0.0

# Configuration réseau
FRONTEND_PORT=5173
NGINX_PORT=80

# API Configuration
API_URL=https://api.example.com

# Environnement
NODE_ENV=production
```

### Utilisation dans docker-compose.yml

```yaml
version: "3.9"

services:
  frontend:
    build: .
    ports:
      - "${FRONTEND_PORT}:80"
    environment:
      - VITE_API_URL=${API_URL}
      - NODE_ENV=${NODE_ENV}
```

## Sécurité Docker

### Bonnes pratiques

```dockerfile
# Utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Scan de vulnérabilités
RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init", "--"]
```

### Secrets et variables sensibles

```bash
# Utiliser Docker secrets en production
echo "ma-cle-secrete" | docker secret create app-secret -

# Référencer dans docker-compose.yml
secrets:
  - app-secret
```

## Troubleshooting

### Problèmes courants

#### Build qui échoue
```bash
# Vérifier les logs de build
docker build -t acadyoquizz-frontend . --no-cache

# Problème de permissions
sudo docker build -t acadyoquizz-frontend .
```

#### Port déjà utilisé
```bash
# Changer le port
docker run -p 3000:80 acadyoquizz-frontend

# Ou arrêter les autres services
docker stop $(docker ps -q)
```

#### Problèmes de réseau
```bash
# Lister les réseaux
docker network ls

# Créer un réseau custom
docker network create acadyoquizz-network
```

## Maintenance

### Nettoyage Docker

```bash
# Nettoyer les images non utilisées
docker image prune

# Nettoyer tout ce qui n'est pas utilisé
docker system prune -a

# Nettoyer les volumes
docker volume prune

# Nettoyage complet
docker system prune -a --volumes
```

### Mise à jour des images

```bash
# Mettre à jour les images de base
docker pull node:22-alpine
docker pull nginx:alpine

# Reconstruire l'application
docker-compose build --no-cache
docker-compose up -d
```