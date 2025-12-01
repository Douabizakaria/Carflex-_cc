# 🚀 Guide de Déploiement Carflex sur Hostinger VPS

Ce guide explique comment déployer l'application Carflex sur un serveur VPS Hostinger.

## 📋 Prérequis

### 1. Compte Hostinger VPS
- Plan VPS requis (minimum KVM 1 - ~5€/mois)
- **L'hébergement partagé ne supporte PAS Node.js**
- Lien : https://www.hostinger.fr/serveur-vps

### 2. Nom de domaine (optionnel)
- Peut être acheté sur Hostinger ou ailleurs
- Exemple : `carflex.ma` ou `votredomaine.com`

### 3. Fichiers de l'application
- Code source complet de Carflex
- Variables d'environnement (clés Stripe, secrets)

---

## 🎯 Étape 1 : Préparer le VPS

### A. Commander le VPS sur Hostinger

1. Aller sur https://www.hostinger.fr/serveur-vps
2. Choisir un plan (recommandé : **KVM 2** - 8 GB RAM)
3. Lors de la configuration, sélectionner :
   - **Système** : Ubuntu 22.04 64bit
   - **Template** : Ubuntu 22.04 with Node.js (si disponible)
   - **Localisation** : Europe (plus proche du Maroc)

### B. Accéder au VPS

Vous recevrez par email :
- **IP du serveur** : `123.456.789.10`
- **Mot de passe root** : `xxxxxxxxxx`

```bash
# Se connecter via SSH
ssh root@123.456.789.10
# Entrer le mot de passe reçu par email
```

---

## 🛠️ Étape 2 : Installer les Dépendances

### A. Mettre à jour le système

```bash
# Mettre à jour les paquets
sudo apt update && sudo apt upgrade -y
```

### B. Installer Node.js 20 (LTS)

```bash
# Télécharger et installer Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier l'installation
node -v  # Doit afficher v20.x.x
npm -v   # Doit afficher 10.x.x
```

### C. Installer PostgreSQL

```bash
# Installer PostgreSQL 14
sudo apt install -y postgresql postgresql-contrib

# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Vérifier le statut
sudo systemctl status postgresql
```

### D. Installer Nginx (serveur web)

```bash
# Installer Nginx
sudo apt install -y nginx

# Démarrer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### E. Installer PM2 (gestionnaire de processus)

```bash
# Installer PM2 globalement
sudo npm install -g pm2

# Vérifier l'installation
pm2 -v
```

### F. Installer Git (pour télécharger le code)

```bash
# Installer Git
sudo apt install -y git

# Vérifier
git --version
```

---

## 💾 Étape 3 : Configurer PostgreSQL

### A. Créer la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Dans psql, créer la base de données et l'utilisateur
CREATE DATABASE carflex_db;
CREATE USER carflex_user WITH PASSWORD 'MOT_DE_PASSE_SECURISE_ICI';
GRANT ALL PRIVILEGES ON DATABASE carflex_db TO carflex_user;

# Sortir de psql
\q
```

### B. Noter les informations de connexion

```
PGHOST=localhost
PGPORT=5432
PGUSER=carflex_user
PGPASSWORD=MOT_DE_PASSE_SECURISE_ICI
PGDATABASE=carflex_db
DATABASE_URL=postgresql://carflex_user:MOT_DE_PASSE_SECURISE_ICI@localhost:5432/carflex_db
```

---

## 📦 Étape 4 : Uploader l'Application

### Option A : Via Git (Recommandé)

```bash
# Créer le répertoire de l'application
sudo mkdir -p /var/www/carflex
cd /var/www/carflex

# Si votre code est sur GitHub/GitLab
git clone https://github.com/VOTRE-USERNAME/carflex.git .

# Sinon, passez à l'Option B
```

### Option B : Via SFTP/SCP (depuis votre ordinateur)

```bash
# Depuis votre ordinateur local (pas le VPS)
# D'abord, créer une archive du projet

# Sur Replit, télécharger le projet complet
# Puis depuis votre ordinateur :

scp -r carflex-project.zip root@123.456.789.10:/var/www/

# Sur le VPS, décompresser
cd /var/www
unzip carflex-project.zip
mv carflex-project carflex
```

### Option C : Via FileZilla (Interface graphique)

1. Télécharger FileZilla : https://filezilla-project.org/
2. Se connecter au VPS :
   - **Hôte** : `sftp://123.456.789.10`
   - **Utilisateur** : `root`
   - **Mot de passe** : Votre mot de passe VPS
   - **Port** : `22`
3. Naviguer vers `/var/www/`
4. Créer dossier `carflex`
5. Uploader tous les fichiers du projet

---

## ⚙️ Étape 5 : Configurer l'Application

### A. Créer le fichier .env

```bash
cd /var/www/carflex

# Créer le fichier .env
nano .env
```

Copier-coller et remplacer les valeurs :

```env
# Environnement
NODE_ENV=production
PORT=5000

# Base de données PostgreSQL
DATABASE_URL=postgresql://carflex_user:MOT_DE_PASSE_SECURISE_ICI@localhost:5432/carflex_db
PGHOST=localhost
PGPORT=5432
PGUSER=carflex_user
PGPASSWORD=MOT_DE_PASSE_SECURISE_ICI
PGDATABASE=carflex_db

# JWT Secret (générer un secret aléatoire)
SESSION_SECRET=GENERER_UN_SECRET_ALEATOIRE_DE_32_CARACTERES_MINIMUM

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_STRIPE_PRODUCTION
VITE_STRIPE_PUBLIC_KEY=pk_live_VOTRE_CLE_PUBLIQUE_STRIPE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_WEBHOOK_STRIPE

# Stripe Test (pour tests)
TESTING_STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_TEST
TESTING_VITE_STRIPE_PUBLIC_KEY=pk_test_VOTRE_CLE_PUBLIQUE_TEST

# Replit (laisser vide sur Hostinger)
REPLIT_DEPLOYMENT=
```

Sauvegarder : `Ctrl+X`, puis `Y`, puis `Entrée`

### B. Installer les dépendances

```bash
cd /var/www/carflex

# Installer les packages npm
npm install --production

# Ou si vous voulez aussi les devDependencies pour builder
npm install
```

### C. Build de l'application

```bash
# Builder le frontend et backend
npm run build

# Vérifier que le dossier dist/ a été créé
ls -la dist/
```

### D. Initialiser la base de données

```bash
# Créer les tables dans la base de données
npm run db:push
```

---

## 🚀 Étape 6 : Démarrer l'Application avec PM2

```bash
cd /var/www/carflex

# Démarrer l'application avec PM2
pm2 start dist/index.js --name carflex

# Vérifier que l'app tourne
pm2 status

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Copier-coller et exécuter la commande affichée

# Voir les logs en temps réel
pm2 logs carflex
```

---

## 🌐 Étape 7 : Configurer Nginx

### A. Créer la configuration Nginx

```bash
# Créer le fichier de configuration
sudo nano /etc/nginx/sites-available/carflex
```

Copier-coller cette configuration :

```nginx
server {
    listen 80;
    server_name votre-ip-vps;  # Remplacer par votre IP ou domaine
    
    # Taille max upload (pour images, etc.)
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Sauvegarder : `Ctrl+X`, puis `Y`, puis `Entrée`

### B. Activer la configuration

```bash
# Créer un lien symbolique
sudo ln -s /etc/nginx/sites-available/carflex /etc/nginx/sites-enabled/

# Supprimer la config par défaut
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### C. Tester l'application

```bash
# Ouvrir dans le navigateur
http://VOTRE-IP-VPS

# Exemple : http://123.456.789.10
```

Vous devriez voir la page d'accueil de Carflex ! 🎉

---

## 🔒 Étape 8 : Configurer HTTPS (SSL)

### A. Installer Certbot

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### B. Obtenir un certificat SSL (si vous avez un domaine)

```bash
# Remplacer par votre domaine
sudo certbot --nginx -d carflex.ma -d www.carflex.ma

# Suivre les instructions
# Entrer votre email
# Accepter les conditions
```

### C. Renouvellement automatique

```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Le renouvellement automatique est configuré
```

Votre site sera accessible en HTTPS : `https://carflex.ma` 🔐

---

## 📊 Commandes Utiles

### Gestion de l'application

```bash
# Voir le statut
pm2 status

# Redémarrer l'app
pm2 restart carflex

# Arrêter l'app
pm2 stop carflex

# Voir les logs
pm2 logs carflex

# Voir les logs en temps réel
pm2 logs carflex --lines 100
```

### Mise à jour de l'application

```bash
cd /var/www/carflex

# Arrêter l'app
pm2 stop carflex

# Sauvegarder l'ancienne version (optionnel)
cp -r /var/www/carflex /var/www/carflex-backup-$(date +%Y%m%d)

# Uploader les nouveaux fichiers (via git ou SFTP)
git pull  # Si vous utilisez Git

# Installer les nouvelles dépendances
npm install

# Rebuild
npm run build

# Mettre à jour la base de données si besoin
npm run db:push

# Redémarrer l'app
pm2 restart carflex

# Vérifier les logs
pm2 logs carflex
```

### Base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql -d carflex_db

# Sauvegarder la base de données
pg_dump -U carflex_user carflex_db > backup-$(date +%Y%m%d).sql

# Restaurer une sauvegarde
psql -U carflex_user carflex_db < backup-20250130.sql
```

---

## 🔍 Dépannage

### L'application ne démarre pas

```bash
# Voir les erreurs
pm2 logs carflex --err

# Vérifier les variables d'environnement
cat /var/www/carflex/.env

# Tester manuellement
cd /var/www/carflex
node dist/index.js
```

### Nginx ne fonctionne pas

```bash
# Voir les logs d'erreur Nginx
sudo tail -f /var/log/nginx/error.log

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Impossible de se connecter à PostgreSQL

```bash
# Vérifier que PostgreSQL tourne
sudo systemctl status postgresql

# Se connecter manuellement
sudo -u postgres psql

# Dans psql, lister les bases
\l

# Vérifier les permissions
\du
```

### Port 5000 déjà utilisé

```bash
# Voir quel processus utilise le port
sudo lsof -i :5000

# Tuer le processus si besoin
sudo kill -9 PID

# Ou changer le port dans .env
nano /var/www/carflex/.env
# Changer PORT=5000 en PORT=5001
```

---

## 💰 Coûts Mensuels Estimés

| Service | Coût |
|---------|------|
| VPS Hostinger (KVM 2) | 5-10€/mois |
| Nom de domaine | 10-15€/an |
| Stripe (commissions) | 1.4% + 0.25€ par transaction |
| **TOTAL** | **~6-12€/mois** |

---

## 🎯 Checklist Finale

Avant de passer en production :

- [ ] L'application fonctionne sur http://VOTRE-IP
- [ ] PostgreSQL est configuré et sécurisé
- [ ] Les variables d'environnement sont correctes
- [ ] PM2 démarre automatiquement au boot
- [ ] Nginx est configuré correctement
- [ ] HTTPS est activé (si domaine)
- [ ] Stripe webhooks sont configurés
- [ ] Sauvegardes automatiques activées
- [ ] Monitoring activé (PM2 Plus optionnel)

---

## 📞 Support

**Hostinger VPS :**
- Chat en direct : https://www.hostinger.fr/contact
- Base de connaissances : https://support.hostinger.com/

**Carflex :**
- Documentation : Voir fichiers README dans le projet

---

✅ **Félicitations !** Votre application Carflex est maintenant en ligne sur Hostinger VPS !

Pour accéder à votre application : `http://VOTRE-IP-VPS` ou `https://votre-domaine.com`
