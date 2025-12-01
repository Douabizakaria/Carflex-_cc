#!/bin/bash

# Script d'installation automatique de Carflex sur Hostinger VPS
# Utilisation: sudo bash hostinger-install.sh

set -e

echo "🚀 Installation de Carflex sur Hostinger VPS"
echo "============================================"
echo ""

# Vérifier que le script est exécuté en root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Ce script doit être exécuté en tant que root"
  echo "   Utilisez: sudo bash hostinger-install.sh"
  exit 1
fi

echo "✓ Exécution en root"

# Mise à jour du système
echo ""
echo "📦 Mise à jour du système..."
apt update && apt upgrade -y

# Installation de Node.js 20
echo ""
echo "📦 Installation de Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo "   Node.js déjà installé"
fi

node_version=$(node -v)
echo "   ✓ Node.js $node_version installé"

# Installation de PostgreSQL
echo ""
echo "📦 Installation de PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
else
    echo "   PostgreSQL déjà installé"
fi
echo "   ✓ PostgreSQL installé"

# Installation de Nginx
echo ""
echo "📦 Installation de Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
else
    echo "   Nginx déjà installé"
fi
echo "   ✓ Nginx installé"

# Installation de PM2
echo ""
echo "📦 Installation de PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
else
    echo "   PM2 déjà installé"
fi
pm2_version=$(pm2 -v)
echo "   ✓ PM2 $pm2_version installé"

# Installation de Git
echo ""
echo "📦 Installation de Git..."
if ! command -v git &> /dev/null; then
    apt install -y git
else
    echo "   Git déjà installé"
fi
git_version=$(git --version)
echo "   ✓ $git_version"

# Créer le répertoire de l'application
echo ""
echo "📁 Création du répertoire /var/www/carflex..."
mkdir -p /var/www/carflex
echo "   ✓ Répertoire créé"

# Configuration de PostgreSQL
echo ""
echo "💾 Configuration de PostgreSQL..."
echo ""
echo "⚠️  ATTENTION: Notez ces informations !"
echo ""

# Générer un mot de passe aléatoire
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)

# Créer la base de données et l'utilisateur
sudo -u postgres psql << EOF
CREATE DATABASE carflex_db;
CREATE USER carflex_user WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE carflex_db TO carflex_user;
\q
EOF

echo ""
echo "✓ Base de données créée"
echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│ INFORMATIONS DE BASE DE DONNÉES            │"
echo "├─────────────────────────────────────────────┤"
echo "│ Base de données: carflex_db                 │"
echo "│ Utilisateur: carflex_user                   │"
echo "│ Mot de passe: $DB_PASSWORD │"
echo "│ Host: localhost                             │"
echo "│ Port: 5432                                  │"
echo "└─────────────────────────────────────────────┘"
echo ""
echo "⚠️  COPIEZ CES INFORMATIONS - Vous en aurez besoin !"
echo ""

# Sauvegarder les infos dans un fichier
cat > /root/carflex-db-info.txt << EOF
Base de données Carflex
=======================

DATABASE_URL=postgresql://carflex_user:$DB_PASSWORD@localhost:5432/carflex_db
PGHOST=localhost
PGPORT=5432
PGUSER=carflex_user
PGPASSWORD=$DB_PASSWORD
PGDATABASE=carflex_db
EOF

echo "📄 Informations sauvegardées dans /root/carflex-db-info.txt"

# Firewall (UFW)
echo ""
echo "🔒 Configuration du firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    echo "y" | ufw enable
    echo "   ✓ Firewall configuré"
else
    echo "   UFW non installé (optionnel)"
fi

# Installation complète
echo ""
echo "============================================"
echo "✅ Installation terminée avec succès !"
echo "============================================"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo ""
echo "1. Uploader votre code dans /var/www/carflex"
echo "   - Via Git: cd /var/www/carflex && git clone ..."
echo "   - Via SFTP: Utilisez FileZilla ou SCP"
echo ""
echo "2. Configurer les variables d'environnement"
echo "   - cd /var/www/carflex"
echo "   - nano .env"
echo "   - Copier les infos de /root/carflex-db-info.txt"
echo ""
echo "3. Installer les dépendances"
echo "   - npm install"
echo ""
echo "4. Builder l'application"
echo "   - npm run build"
echo ""
echo "5. Initialiser la base de données"
echo "   - npm run db:push"
echo ""
echo "6. Démarrer avec PM2"
echo "   - pm2 start dist/index.js --name carflex"
echo "   - pm2 save"
echo "   - pm2 startup"
echo ""
echo "7. Configurer Nginx"
echo "   - Copier hostinger-nginx.conf vers /etc/nginx/sites-available/carflex"
echo "   - ln -s /etc/nginx/sites-available/carflex /etc/nginx/sites-enabled/"
echo "   - nginx -t && systemctl restart nginx"
echo ""
echo "📖 Guide complet: Voir HOSTINGER_DEPLOYMENT_GUIDE.md"
echo ""
