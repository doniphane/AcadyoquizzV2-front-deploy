# AcadyoQuizz - Application de Quiz Éducatif

## Description

AcadyoQuizz est une application web complète de gestion de quiz éducatifs développée avec React.js et TypeScript. Cette plateforme permet aux enseignants de créer des quiz interactifs et aux étudiants de les passer en temps réel.

### Fonctionnalités principales

- **Authentification sécurisée** : Système de connexion avec gestion des rôles (Admin/Étudiant)
- **Gestion des quiz** : Création, modification et suppression de quiz par les administrateurs
- **Interface intuitive** : Interface utilisateur moderne avec TailwindCSS et Radix UI
- **Résultats en temps réel** : Affichage instantané des scores et statistiques
- **Export PDF** : Génération de rapports de résultats au format PDF
- **Responsive Design** : Compatible mobile et desktop
- **Gestion des sessions** : Authentification par JWT avec cookies sécurisés

### Technologies utilisées

#### Frontend
- **React 19** - Framework principal
- **TypeScript** - Typage statique
- **Vite** - Build tool moderne
- **TailwindCSS** - Framework CSS utilitaire
- **Radix UI** - Composants accessibles
- **React Router Dom** - Navigation
- **Zustand** - Gestion d'état
- **React Hook Form** - Gestion des formulaires
- **Axios** - Client HTTP
- **jsPDF** - Génération de PDF

#### Outils de développement
- **ESLint** - Linting du code
- **TypeScript** - Vérification de types
- **Vite HMR** - Hot Module Replacement

#### Infrastructure
- **Docker** - Conteneurisation
- **Nginx** - Serveur web
- **Docker Compose** - Orchestration des conteneurs

## Architecture du projet

```
AcadyoquizzV2-front-deploy/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── pages/         # Pages de l'application
│   ├── services/      # Services API
│   ├── store/         # Gestion d'état Zustand
│   ├── types/         # Types TypeScript
│   ├── utils/         # Utilitaires
│   └── lib/           # Configuration des librairies
├── public/            # Assets statiques
├── docs/             # Documentation
├── docker-compose.yml # Configuration Docker
├── Dockerfile        # Image Docker
└── nginx.conf        # Configuration Nginx
```

## Documentation

Pour plus d'informations détaillées, consultez la documentation dans le dossier `docs/` :

- **[Installation](./docs/installation.md)** - Guide d'installation et de configuration
- **[Docker](./docs/docker.md)** - Containerisation et déploiement Docker
- **[Déploiement](./docs/deployment.md)** - Guide de déploiement en production
- **[Tests](./docs/testing.md)** - Guide des tests et validation

## Démarrage rapide

### Prérequis
- Node.js (version 18 ou plus)
- pnpm (gestionnaire de paquets)
- Docker et Docker Compose (pour le déploiement)

### Installation locale
```bash
# Cloner le projet
git clone <url-du-repo>
cd AcadyoquizzV2-front-deploy

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Lancer en mode développement
pnpm dev
```

### Avec Docker
```bash
# Démarrer l'application avec Docker Compose
docker-compose up -d
```

L'application sera accessible sur `http://localhost:5173`

## Scripts disponibles

- `pnpm dev` - Démarre le serveur de développement
- `pnpm build` - Build de production
- `pnpm preview` - Prévisualise le build
- `pnpm lint` - Vérification du code avec ESLint

## Variables d'environnement

Créez un fichier `.env.local` avec les variables suivantes :

```env
VITE_API_URL=https://votre-api-url.com
```

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## Support

Pour toute question ou problème, veuillez consulter la documentation dans le dossier `docs/` ou créer une issue sur le dépôt.

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.