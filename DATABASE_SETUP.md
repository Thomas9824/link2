# Configuration de la base de données

## 1. Choix de la base de données

Pour le déploiement sur Vercel, nous recommandons **Neon** (PostgreSQL gratuit) :

### Option 1: Neon (Recommandé)
1. Créer un compte sur [Neon](https://neon.tech)
2. Créer un nouveau projet
3. Copier l'URL de connexion fournie

### Option 2: Supabase
1. Créer un compte sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans Settings > Database
4. Copier l'URL de connexion PostgreSQL

### Option 3: Vercel Postgres
1. Dans votre projet Vercel, aller dans Storage
2. Créer une base Postgres
3. Copier les variables d'environnement

## 2. Configuration des variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
# Base de données (remplacer par votre URL)
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# NextAuth.js
NEXTAUTH_SECRET="votre-clé-secrète-très-longue-et-sécurisée"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID="votre-google-client-id"
GOOGLE_CLIENT_SECRET="votre-google-client-secret"
```

## 3. Générer et appliquer les migrations

```bash
# Générer le client Prisma
npx prisma generate

# Créer et appliquer les migrations
npx prisma migrate dev --name init

# (Optionnel) Visualiser la base de données
npx prisma studio
```

## 4. Configuration pour la production (Vercel)

### Variables d'environnement Vercel
Dans le dashboard Vercel, ajouter ces variables :

- `DATABASE_URL` : URL de votre base PostgreSQL
- `NEXTAUTH_SECRET` : Clé secrète pour NextAuth
- `NEXTAUTH_URL` : URL de votre site en production
- `GOOGLE_CLIENT_ID` : (optionnel) ID client Google
- `GOOGLE_CLIENT_SECRET` : (optionnel) Secret client Google

### Configuration Google OAuth (optionnel)

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un nouveau projet ou sélectionner un existant
3. Activer l'API Google+ 
4. Créer des identifiants OAuth 2.0
5. Ajouter vos domaines autorisés :
   - `http://localhost:3000` (développement)
   - `https://votre-domaine.vercel.app` (production)
6. Ajouter les URIs de redirection :
   - `http://localhost:3000/api/auth/callback/google`
   - `https://votre-domaine.vercel.app/api/auth/callback/google`

## 5. Déploiement

Une fois configuré :

```bash
# Construire le projet
npm run build

# Déployer sur Vercel
vercel --prod
```

## 6. Migration des données existantes (si applicable)

Si vous aviez des données dans `links-data.json`, créer un script de migration :

```bash
# Créer un script pour migrer les données
node scripts/migrate-json-to-db.js
```

## Notes importantes

- **Sécurité** : Ne jamais commiter le fichier `.env`
- **Performance** : Prisma gère automatiquement les connexions
- **Monitoring** : Utiliser `npx prisma studio` pour visualiser les données
- **Backup** : Les services cloud offrent des sauvegardes automatiques
