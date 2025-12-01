# 📦 Fichiers pour Déploiement Hostinger

Ce document liste tous les fichiers créés pour faciliter le déploiement de Carflex sur Hostinger VPS.

## 📁 Structure des Fichiers

```
carflex/
├── HOSTINGER_DEPLOYMENT_GUIDE.md    ⭐ Guide complet étape par étape
├── QUICK_START_HOSTINGER.md         ⚡ Guide rapide (30 minutes)
├── hostinger-install.sh             🤖 Script d'installation automatique
├── hostinger-nginx.conf             🌐 Configuration Nginx
├── .env.hostinger.example           🔐 Template variables d'environnement
├── dist/                            📦 Application compilée (après npm run build)
│   ├── index.js                     Backend Node.js
│   └── public/                      Frontend React
└── [autres fichiers du projet]
```

---

## 📄 Description des Fichiers

### 1. HOSTINGER_DEPLOYMENT_GUIDE.md ⭐

**Le guide le plus complet** pour déployer sur Hostinger VPS.

**Contenu :**
- Prérequis détaillés
- Installation complète de toutes les dépendances
- Configuration PostgreSQL
- Upload du code (3 méthodes)
- Configuration Nginx
- Activation HTTPS
- Commandes de gestion
- Dépannage complet
- Checklist finale

**Quand l'utiliser :**
- Première installation
- Si vous rencontrez des problèmes
- Pour comprendre chaque étape en détail

---

### 2. QUICK_START_HOSTINGER.md ⚡

**Guide ultra-rapide** pour une installation en 30 minutes.

**Contenu :**
- 7 étapes simples
- Commandes essentielles
- Dépannage rapide

**Quand l'utiliser :**
- Si vous avez déjà de l'expérience avec Linux
- Installation rapide
- Référence rapide

---

### 3. hostinger-install.sh 🤖

**Script Bash d'installation automatique** qui installe toutes les dépendances.

**Ce qu'il fait :**
- ✅ Met à jour Ubuntu
- ✅ Installe Node.js 20
- ✅ Installe PostgreSQL
- ✅ Installe Nginx
- ✅ Installe PM2
- ✅ Installe Git
- ✅ Crée la base de données
- ✅ Génère un mot de passe sécurisé
- ✅ Configure le firewall
- ✅ Sauvegarde les infos dans `/root/carflex-db-info.txt`

**Comment l'utiliser :**

```bash
# Sur le VPS Hostinger
chmod +x hostinger-install.sh
sudo bash hostinger-install.sh
```

**⚠️ Important :** Notez les informations de base de données affichées à la fin !

---

### 4. hostinger-nginx.conf 🌐

**Configuration Nginx** pour faire le lien entre le domaine et l'application Node.js.

**Ce qu'elle fait :**
- Proxy HTTP vers Node.js (port 5000)
- Headers de sécurité
- Logs d'accès et d'erreur
- Limite de taille d'upload (10MB)

**Comment l'utiliser :**

```bash
# Copier vers la config Nginx
cp hostinger-nginx.conf /etc/nginx/sites-available/carflex

# Éditer pour mettre votre IP/domaine
nano /etc/nginx/sites-available/carflex
# Remplacer "server_name _;" par votre IP ou domaine

# Activer
ln -s /etc/nginx/sites-available/carflex /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

### 5. .env.hostinger.example 🔐

**Template du fichier .env** avec toutes les variables nécessaires.

**Variables incluses :**
- Configuration Node.js (environnement, port)
- Connexion PostgreSQL (host, user, password, database)
- JWT Secret
- Clés Stripe (production et test)
- Webhook Stripe

**Comment l'utiliser :**

```bash
# Sur le VPS
cd /var/www/carflex
cp .env.hostinger.example .env
nano .env
# Remplacer toutes les valeurs VOTRE_... par vos vraies valeurs
```

**⚠️ Où trouver les valeurs :**
- PostgreSQL : Voir `/root/carflex-db-info.txt` (créé par le script)
- JWT Secret : `openssl rand -base64 32`
- Stripe : https://dashboard.stripe.com/apikeys

---

### 6. dist/ 📦

**Dossier contenant l'application compilée** (créé après `npm run build`).

**Contenu :**
- `dist/index.js` - Backend Node.js/Express compilé
- `dist/public/` - Frontend React compilé (HTML, CSS, JS, images)

**Comment le générer :**

```bash
npm run build
```

**⚠️ Important :** Ce dossier doit être créé **avant** de démarrer l'app avec PM2 !

---

## 🚀 Processus de Déploiement Complet

### Étape par étape :

1. **Commander un VPS Hostinger**
   - Plan : KVM 1 minimum (~5€/mois)
   - OS : Ubuntu 22.04

2. **Se connecter au VPS**
   ```bash
   ssh root@VOTRE-IP-VPS
   ```

3. **Uploader les fichiers**
   - Via SFTP (FileZilla) vers `/var/www/carflex/`
   - OU via Git clone

4. **Lancer le script d'installation**
   ```bash
   cd /var/www/carflex
   chmod +x hostinger-install.sh
   sudo bash hostinger-install.sh
   ```

5. **Configurer les variables**
   ```bash
   cp .env.hostinger.example .env
   nano .env
   # Remplacer les valeurs
   ```

6. **Installer et builder**
   ```bash
   npm install
   npm run build
   npm run db:push
   ```

7. **Démarrer avec PM2**
   ```bash
   pm2 start dist/index.js --name carflex
   pm2 save
   pm2 startup
   ```

8. **Configurer Nginx**
   ```bash
   cp hostinger-nginx.conf /etc/nginx/sites-available/carflex
   nano /etc/nginx/sites-available/carflex  # Mettre votre IP
   ln -s /etc/nginx/sites-available/carflex /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

9. **Tester**
   - Ouvrir : `http://VOTRE-IP-VPS`

10. **Activer HTTPS** (si domaine)
    ```bash
    certbot --nginx -d votre-domaine.com
    ```

---

## 📊 Fichiers à NE PAS Uploader

Ces fichiers restent sur votre ordinateur ou Replit :

- ❌ `node_modules/` - Sera recréé par `npm install`
- ❌ `.env` - À créer manuellement sur le serveur
- ❌ `.git/` - Optionnel (sauf si vous utilisez Git)
- ❌ `README.md`, `replit.md` - Documentation (optionnel)

---

## 📁 Fichiers à ABSOLUMENT Uploader

- ✅ Tout le code source (`client/`, `server/`, `shared/`)
- ✅ `package.json` et `package-lock.json`
- ✅ `vite.config.ts`, `tsconfig.json`
- ✅ `drizzle.config.ts`
- ✅ `tailwind.config.ts`, `postcss.config.js`
- ✅ `public/` (fichiers statiques)
- ✅ `hostinger-install.sh`
- ✅ `hostinger-nginx.conf`
- ✅ `.env.hostinger.example`

---

## 💡 Conseils

### Pour débutants
1. Commencez par **QUICK_START_HOSTINGER.md**
2. Si vous bloquez, consultez **HOSTINGER_DEPLOYMENT_GUIDE.md**
3. Utilisez FileZilla pour uploader (plus simple que Git)

### Pour avancés
1. Utilisez Git pour le déploiement
2. Configurez un webhook Git pour auto-déploiement
3. Activez les backups automatiques PostgreSQL

---

## 🆘 Besoin d'Aide ?

1. **Problème d'installation** → Voir section "Dépannage" dans HOSTINGER_DEPLOYMENT_GUIDE.md
2. **Erreur Nginx** → Vérifier les logs : `tail -f /var/log/nginx/error.log`
3. **App ne démarre pas** → Voir les logs PM2 : `pm2 logs carflex`
4. **Base de données** → Infos dans `/root/carflex-db-info.txt`

---

## 📞 Support

- **Hostinger VPS :** https://www.hostinger.fr/contact
- **Stripe :** https://support.stripe.com/
- **PostgreSQL :** https://www.postgresql.org/support/

---

✅ **Tous les fichiers sont prêts pour le déploiement sur Hostinger VPS !**
