# 🚀 Guide de Déploiement Carflex - Production Ready

## ✅ Corrections Appliquées (28 Oct 2025)

Toutes les corrections pour le problème de déploiement ont été appliquées et testées :

### 1. Détection Robuste de l'Environnement ✓
- Utilise `REPLIT_DEPLOYMENT=1` (automatiquement défini par Replit)
- Fallback vers `NODE_ENV=production`
- Logs clairs au démarrage

### 2. Validation des Variables d'Environnement ✓
- Nouveau fichier `server/env-validation.ts`
- Vérifie toutes les variables critiques au démarrage
- Messages d'erreur clairs si manquantes
- Exit propre en production si variables critiques absentes

### 3. Configuration CORS Optimisée ✓
- Production : Permet tous les domaines (Replit gère)
- Développement : Uniquement localhost

### 4. Build Production Testé ✓
- Frontend : Vite → `dist/public/`
- Backend : esbuild → `dist/index.js`
- Tous les fichiers générés correctement

## 📋 Checklist de Déploiement

### Variables d'Environnement Requises

#### ✅ Déjà Configurées (Vérifiées)
- `DATABASE_URL` - PostgreSQL (Neon)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
- `SESSION_SECRET` - JWT signing
- `STRIPE_SECRET_KEY` - Clés Stripe test configurées
- `VITE_STRIPE_PUBLIC_KEY` - Clé publique Stripe
- `PORT` - Port 5000

#### ⚠️ À Configurer pour Production
- `STRIPE_SECRET_KEY` → Remplacer par `sk_live_...` (clé production)
- `VITE_STRIPE_PUBLIC_KEY` → Remplacer par `pk_live_...` (clé production)
- `STRIPE_WEBHOOK_SECRET` → Configurer après création webhook production

## 🎯 Processus de Déploiement

### Étape 1 : Préparation des Secrets Production

Dans l'interface Replit Secrets, mettez à jour :

```bash
# Stripe Production
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx

# Les autres restent identiques
DATABASE_URL=postgresql://...
SESSION_SECRET=your_session_secret_32chars+
```

### Étape 2 : Déploiement via Replit

1. Cliquez sur le bouton **"Deploy"** dans l'interface Replit
2. Sélectionnez le type de déploiement (Reserved VM ou Autoscale)
3. Le système va automatiquement :
   - Définir `REPLIT_DEPLOYMENT=1`
   - Exécuter `npm run build`
   - Démarrer avec `npm run start`

### Étape 3 : Configuration Webhook Stripe Production

Une fois l'application déployée :

1. Récupérez l'URL de déploiement : `https://your-app.replit.app`

2. Allez sur le [Dashboard Stripe](https://dashboard.stripe.com/webhooks)

3. Créez un nouveau webhook :
   - **URL** : `https://your-app.replit.app/api/webhooks/stripe`
   - **Événements à écouter** :
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`

4. Copiez le **Signing Secret** (commence par `whsec_`)

5. Ajoutez-le dans Replit Secrets :
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

6. Redéployez l'application pour prendre en compte le nouveau secret

### Étape 4 : Test de Paiement Production

⚠️ **Important** : Testez avec un petit montant réel

1. Connectez-vous à l'application déployée
2. Sélectionnez un pack (Budget - $299/mois)
3. Cliquez sur "Subscribe Now"
4. Utilisez une vraie carte bancaire
5. Vérifiez que :
   - Le paiement passe
   - L'abonnement est créé dans la DB
   - Le webhook est bien reçu (logs Stripe)
   - L'utilisateur est redirigé vers le dashboard

## 🔍 Vérification du Déploiement

### Logs à Vérifier

Après le déploiement, les logs devraient afficher :

```
✓ Environment: PRODUCTION
✓ Port: 5000
✓ Database: Connected
✓ Stripe: Configured
Running in production mode - serving static files
serving on port 5000
```

### En Cas d'Erreur

Si vous voyez :
```
❌ FATAL: Missing required environment variables:
   - STRIPE_SECRET_KEY (required in production)
```

**Solution** : Vérifiez que la variable est bien définie dans Replit Secrets pour le déploiement (pas seulement pour le développement)

## 📊 Architecture de Production

```
┌─────────────────────────────────────────┐
│   Client Browser                        │
│   https://your-app.replit.app          │
└──────────────┬──────────────────────────┘
               │ HTTPS
               ↓
┌─────────────────────────────────────────┐
│   Replit Deployment                     │
│   REPLIT_DEPLOYMENT=1                   │
│   ┌───────────────────────────────┐    │
│   │  dist/index.js                │    │
│   │  (Express + serveStatic)      │    │
│   │  ├─ Security (Helmet + CORS)  │    │
│   │  ├─ Rate Limiting (3 levels)  │    │
│   │  └─ API Routes (/api/*)       │    │
│   └───────────────────────────────┘    │
│   ┌───────────────────────────────┐    │
│   │  dist/public/                 │    │
│   │  (Frontend build - React)     │    │
│   └───────────────────────────────┘    │
└──────────┬──────────────┬───────────────┘
           │              │
           │              ↓
           │      ┌──────────────────┐
           │      │  Stripe          │
           │      │  (Webhooks)      │
           │      └──────────────────┘
           ↓
   ┌──────────────────┐
   │  Neon PostgreSQL │
   │  (Serverless)    │
   └──────────────────┘
```

## 🔒 Sécurité en Production

### Headers HTTP (Helmet.js)
- ✓ Content-Security-Policy
- ✓ Strict-Transport-Security (HSTS 1 an)
- ✓ X-Frame-Options: DENY
- ✓ X-Content-Type-Options: nosniff

### Rate Limiting
- Auth : 5 req / 15min (anti brute-force)
- API générale : 100 req / 15min
- Admin : 50 req / 15min

### Stripe
- Webhook signature HMAC-SHA256 vérifiée
- Idempotence (pas de doublons)
- 3D Secure activé
- PCI DSS Level 1 compliant

## 📝 Commandes Utiles

### Build Local (Test)
```bash
npm run build
# Vérifie que dist/ et dist/public/ sont créés
```

### Simulation Production Locale
```bash
export REPLIT_DEPLOYMENT=1
npm run build
npm run start
# Doit afficher : "Running in production mode"
```

### Vérification Variables
```bash
# Dans le shell Replit
echo $DATABASE_URL
echo $STRIPE_SECRET_KEY
# Ne devrait PAS afficher les secrets si correctement configurés
```

## 🐛 Dépannage

### Problème : "Missing required environment variables"
**Cause** : Variable non définie dans Replit Secrets  
**Solution** : Ajoutez-la via l'interface Secrets

### Problème : "Could not find the build directory"
**Cause** : Build non exécuté ou échoué  
**Solution** : Vérifiez les logs de build, exécutez `npm run build` manuellement

### Problème : "Webhook signature verification failed"
**Cause** : STRIPE_WEBHOOK_SECRET incorrect ou absent  
**Solution** : Vérifiez le secret dans Stripe Dashboard → Webhooks

### Problème : Page blanche après déploiement
**Cause** : Fichiers statiques non servis correctement  
**Solution** : Vérifiez les logs, doit afficher "Running in production mode"

## 📚 Documentation Technique

- **Architecture** : `replit.md` (section Deployment Configuration)
- **Sécurité** : `SECURITY.md`
- **Stripe** : `cahier_des_charges_carflex.tex` (section Module de Paiement)
- **Corrections** : `DEPLOYMENT_FIX.md`

## 🎉 Prêt pour la Production

L'application Carflex est maintenant **100% prête pour le déploiement** avec :

- ✅ Détection environnement robuste (REPLIT_DEPLOYMENT)
- ✅ Validation variables au démarrage
- ✅ Build production testé et fonctionnel
- ✅ Sécurité niveau entreprise
- ✅ Intégration Stripe complète et idempotente
- ✅ Tests E2E validés
- ✅ Documentation complète

**Vous pouvez maintenant cliquer sur "Deploy" en toute confiance !**

---

**Dernière mise à jour** : 28 Octobre 2025  
**Version** : Carflex v2.1 - Production Ready  
**Statut** : ✅ Toutes corrections appliquées et testées
