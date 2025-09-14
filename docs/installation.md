# Guide d'Installation - AcadyoQuizz

## Prérequis

Avant de commencer l'installation, assurez-vous d'avoir les éléments suivants installés sur votre système :

### Système d'exploitation
- **Windows** : Windows 10/11 (64-bit)
- **macOS** : macOS 10.15 ou plus récent
- **Linux** : Ubuntu 20.04+, Debian 10+, CentOS 8+

### Logiciels requis

#### Node.js et pnpm
- **Node.js** : Version 18.x ou plus récente
- **pnpm** : Gestionnaire de paquets recommandé

```bash
# Vérifier les versions installées
node --version  # Doit afficher v18.x.x ou plus
pnpm --version  # Doit afficher la version de pnpm
```

#### Installation de Node.js
1. Téléchargez Node.js depuis [nodejs.org](https://nodejs.org/)
2. Choisissez la version LTS (Long Term Support)
3. Suivez l'assistant d'installation

#### Installation de pnpm
```bash
# Via npm (si Node.js est déjà installé)
npm install -g pnpm

# Ou via le script d'installation
curl -fsSL https://get.pnpm.io/install.sh | sh

# Vérification
pnpm --version
```

### Git (Optionnel)
Pour cloner le projet depuis un dépôt :
```bash
git --version
```

## Installation du projet

### Étape 1 : Obtenir le code source

#### Option A : Clonage depuis Git
```bash
# Cloner le dépôt
git clone <URL_DU_DEPOT>
cd AcadyoquizzV2-front-deploy
```

#### Option B : Téléchargement direct
1. Téléchargez l'archive du projet
2. Extrayez-la dans le dossier de votre choix
3. Naviguez vers le dossier du projet

### Étape 2 : Installation des dépendances

```bash
# Se placer dans le dossier du projet
cd AcadyoquizzV2-front-deploy

# Installer toutes les dépendances
pnpm install
```

Cette commande va installer automatiquement :
- Toutes les dépendances de production
- Les dépendances de développement
- Les types TypeScript

### Étape 3 : Configuration des variables d'environnement

#### Créer le fichier de configuration
```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Ou créer manuellement le fichier
touch .env.local
```

#### Configurer les variables
Éditez le fichier `.env.local` et ajoutez les variables suivantes :

```env
# URL de l'API backend
VITE_API_URL=http://localhost:8000

# Environnement (development, production)
NODE_ENV=development

# Clé de chiffrement pour les sessions (optionnel)
VITE_APP_SECRET=votre-cle-secrete

# Configuration CORS (si nécessaire)
VITE_CORS_ORIGIN=http://localhost:5173
```

### Étape 4 : Vérification de l'installation

```bash
# Lancer le serveur de développement
pnpm dev

# L'application devrait être accessible sur :
# http://localhost:5173
```

Si tout fonctionne correctement, vous devriez voir :
- L'application se lance sans erreurs
- Le navigateur s'ouvre automatiquement
- La page d'accueil s'affiche correctement

## Scripts de développement disponibles

```bash
# Démarrer le serveur de développement
pnpm dev

# Construire pour la production
pnpm build

# Prévisualiser le build de production
pnpm preview

# Lancer le linter
pnpm lint
```

## Structure des dépendances

### Dépendances principales
- **React 19** : Framework principal
- **TypeScript** : Langage de programmation
- **Vite** : Outil de build
- **TailwindCSS** : Framework CSS
- **React Router Dom** : Navigation
- **Axios** : Client HTTP
- **Zustand** : Gestion d'état

### Dépendances de développement
- **ESLint** : Linting du code
- **TypeScript** : Vérification des types
- **Vite plugins** : Extensions Vite

## Configuration de l'éditeur (Recommandé)

### Visual Studio Code
Extensions recommandées :
- TypeScript and JavaScript Language Features
- ESLint
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer

### Paramètres VSCode (`.vscode/settings.json`)
```json
{
  "typescript.preferences.quoteStyle": "single",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## Résolution des problèmes courants

### Erreur : "Node version not supported"
```bash
# Vérifier la version de Node.js
node --version

# Si version < 18, mettre à jour Node.js
# Utiliser nvm pour gérer plusieurs versions
nvm install 18
nvm use 18
```

### Erreur : "pnpm command not found"
```bash
# Installer pnpm globalement
npm install -g pnpm

# Ou utiliser npx
npx pnpm install
```

### Erreur de permissions (Linux/macOS)
```bash
# Changer les permissions du dossier
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP node_modules
```

### Port 5173 déjà utilisé
```bash
# Utiliser un autre port
pnpm dev --port 3000

# Ou modifier vite.config.ts
export default defineConfig({
  server: {
    port: 3000
  }
})
```

### Problèmes de cache
```bash
# Nettoyer le cache de pnpm
pnpm store prune

# Supprimer node_modules et réinstaller
rm -rf node_modules
pnpm install
```

## Étapes suivantes

Une fois l'installation terminée :

1. **Configurez votre backend** : Assurez-vous que l'API est accessible
2. **Testez les fonctionnalités** : Connectez-vous et testez l'application
3. **Consultez la documentation Docker** : Pour le déploiement en conteneurs
4. **Lisez le guide de déploiement** : Pour la mise en production

## Support

Si vous rencontrez des problèmes lors de l'installation :

1. Vérifiez que toutes les prérequis sont installés
2. Consultez les logs d'erreur dans la console
3. Vérifiez les issues sur le dépôt du projet
4. Consultez la documentation officielle des outils utilisés