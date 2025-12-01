# ⚡ Démarrage Rapide - Carflex sur Hostinger VPS

Guide ultra-rapide pour déployer Carflex sur Hostinger en 30 minutes.

## 📋 Ce dont vous avez besoin

1. **VPS Hostinger** (KVM 1 minimum - ~5€/mois)
   - Commander sur : https://www.hostinger.fr/serveur-vps
   - Choisir : Ubuntu 22.04

2. **Clés Stripe**
   - Récupérer sur : https://dashboard.stripe.com/apikeys

3. **Fichiers Carflex**
   - Tous les fichiers de ce projet

---

## 🚀 Installation en 7 étapes

### 1️⃣ Se connecter au VPS

```bash
ssh root@VOTRE-IP-VPS
# Entrer le mot de passe reçu par email
```

### 2️⃣ Lancer l'installation automatique

```bash
# Télécharger et exécuter le script
wget https://raw.githubusercontent.com/VOTRE-REPO/carflex/main/hostinger-install.sh
chmod +x hostinger-install.sh
sudo bash hostinger-install.sh
```

Le script installe automatiquement :
- Node.js 20
- PostgreSQL
- Nginx
- PM2
- Git

**⚠️ IMPORTANT** : Notez les informations de base de données affichées !

### 3️⃣ Uploader le code

**Option A : Via SFTP (Recommandé pour débutants)**

1. Télécharger FileZilla : https://filezilla-project.org/
2. Se connecter :
   - Hôte : `sftp://VOTRE-IP-VPS`
   - Utilisateur : `root`
   - Mot de passe : Votre mot de passe VPS
   - Port : `22`
3. Uploader tous les fichiers vers `/var/www/carflex/`

**Option B : Via Git**

```bash
cd /var/www/carflex
git clone https://github.com/VOTRE-USERNAME/carflex.git .
```

### 4️⃣ Configurer les variables

```bash
cd /var/www/carflex

# Créer le fichier .env
cp .env.hostinger.example .env

# Éditer avec vos vraies valeurs
nano .env
```

Remplacer :
- `VOTRE_MOT_DE_PASSE` → Voir `/root/carflex-db-info.txt`
- `GENERER_UN_SECRET...` → Exécuter : `openssl rand -base64 32`
- `sk_live_...` → Votre clé Stripe secrète
- `pk_live_...` → Votre clé Stripe publique

Sauvegarder : `Ctrl+X`, `Y`, `Entrée`

### 5️⃣ Installer et builder

```bash
cd /var/www/carflex

# Installer les dépendances
npm install

# Builder l'application
npm run build

# Initialiser la base de données
npm run db:push
```

### 6️⃣ Démarrer avec PM2

```bash
# Démarrer l'application
pm2 start dist/index.js --name carflex

# Sauvegarder la config
pm2 save

# Démarrer au boot
pm2 startup
# Copier-coller et exécuter la commande affichée

# Vérifier
pm2 status
```

### 7️⃣ Configurer Nginx

```bash
# Copier la configuration
cp /var/www/carflex/hostinger-nginx.conf /etc/nginx/sites-available/carflex

# Éditer pour mettre votre IP/domaine
nano /etc/nginx/sites-available/carflex
# Remplacer "server_name _;" par "server_name VOTRE-IP;"

# Activer
ln -s /etc/nginx/sites-available/carflex /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Tester et redémarrer
nginx -t
systemctl restart nginx
```

---

## ✅ C'est terminé !

Votre application est maintenant accessible : **http://VOTRE-IP-VPS**

---

## 🔒 Activer HTTPS (Optionnel - si vous avez un domaine)

```bash
# Installer Certbot
apt install -y certbot python3-certbot-nginx

# Obtenir le certificat
certbot --nginx -d carflex.ma -d www.carflex.ma

# Suivre les instructions
```

Votre site sera en HTTPS : **https://carflex.ma** 🔐

---

## 📊 Commandes Utiles

```bash
# Voir les logs
pm2 logs carflex

# Redémarrer l'app
pm2 restart carflex

# Arrêter l'app
pm2 stop carflex

# Voir le statut
pm2 status
```

---

## 🆘 Problèmes ?

### L'application ne démarre pas

```bash
# Voir les erreurs
pm2 logs carflex --err

# Tester manuellement
cd /var/www/carflex
node dist/index.js
```

### Nginx affiche une erreur

```bash
# Voir les logs Nginx
tail -f /var/log/nginx/error.log

# Tester la config
nginx -t
```

### Variables d'environnement incorrectes

```bash
# Vérifier le fichier .env
cat /var/www/carflex/.env

# Éditer
nano /var/www/carflex/.env

# Redémarrer après modification
pm2 restart carflex
```

---

## 📖 Documentation Complète

Pour plus de détails, consultez **HOSTINGER_DEPLOYMENT_GUIDE.md**

---

**Besoin d'aide ?**
- Support Hostinger : https://www.hostinger.fr/contact
- Documentation Carflex : Voir fichiers README

🎉 **Félicitations ! Votre application est en ligne !**
