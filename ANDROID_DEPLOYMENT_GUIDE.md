# 📱 Guide de Déploiement Android - Carflex

Ce guide vous explique comment déployer l'application Carflex sur le Google Play Store.

## 🎯 Architecture de l'Application

L'application Android Carflex utilise la technologie **TWA (Trusted Web Activity)** qui permet de :
- ✅ Publier votre application web sur le Play Store
- ✅ Offrir une expérience 100% native (pas de barre d'URL)
- ✅ Réutiliser 100% du code existant
- ✅ Synchronisation automatique avec l'application web

## 📋 Prérequis

### 1. Compte Google Play Console
- Créer un compte développeur : https://play.google.com/console
- Coût unique : 25 USD
- Validation sous 48h

### 2. Outils Requis

```bash
# Installer Node.js (déjà installé sur Replit)
node --version  # v20.x ou supérieur

# Installer Bubblewrap CLI (outil officiel Google pour TWA)
npm install -g @bubblewrap/cli

# Installer Java Development Kit (pour signer l'APK)
# Sur Replit, déjà disponible
java -version
```

### 3. URL de Production Déployée

Avant de générer l'APK, vous **DEVEZ** déployer l'application web sur Replit :

1. Cliquez sur **"Deploy"** dans Replit
2. Sélectionnez **"Autoscale"**
3. Récupérez votre URL : `https://[votre-nom].replit.app`
4. Mettez à jour `twa-manifest.json` avec cette URL

## 🚀 Étapes de Génération de l'APK

### Étape 1 : Déployer l'Application Web

```bash
# 1. Builder l'application
npm run build

# 2. Déployer sur Replit (via l'interface)
# Récupérer l'URL de production
```

### Étape 2 : Initialiser le Projet TWA

```bash
# Depuis le répertoire racine du projet
bubblewrap init --manifest=https://[VOTRE-URL].replit.app/manifest.json

# Répondre aux questions :
# - Application name: Carflex
# - Package name: com.carflex.app
# - Signing key: Créer nouvelle clé
```

### Étape 3 : Générer la Clé de Signature

```bash
# Créer un keystore pour signer l'application
keytool -genkey -v -keystore android.keystore \
  -alias carflex-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Informations à fournir :
# - Password: [CHOISIR MOT DE PASSE SÉCURISÉ]
# - First and Last Name: Carflex
# - Organization: [VOTRE ENTREPRISE]
# - City: [VOTRE VILLE]
# - Country: MA (Maroc)
```

⚠️ **IMPORTANT** : Sauvegardez le fichier `android.keystore` et le mot de passe en lieu sûr !
Sans cette clé, vous ne pourrez jamais mettre à jour votre application.

### Étape 4 : Obtenir l'Empreinte SHA-256

```bash
# Extraire l'empreinte SHA-256 de votre clé
keytool -list -v -keystore android.keystore -alias carflex-key

# Copier la valeur "SHA256:" (sans les deux-points)
# Exemple : A1:B2:C3:D4:... → A1B2C3D4...
```

⚠️ **CRITIQUE** : Vous DEVEZ mettre à jour `public/.well-known/assetlinks.json` avec votre vraie empreinte SHA-256 :

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.carflex.app",
      "sha256_cert_fingerprints": [
        "REMPLACER_PAR_VOTRE_EMPREINTE_SHA256_COMPLETE"
      ]
    }
  }
]
```

**Sans cette empreinte correcte, Google Play refusera votre application !**

Après avoir mis à jour le fichier :

```bash
# Re-déployer l'application pour que assetlinks.json soit accessible
npm run build
# Puis déployer sur Replit

# Vérifier que le fichier est accessible
curl https://VOTRE-URL.replit.app/.well-known/assetlinks.json
```

### Étape 5 : Builder l'APK

```bash
# Builder l'application Android (App Bundle)
bubblewrap build

# Le fichier sera généré dans :
# ./app-release-bundle.aab
```

### Étape 6 : Tester l'APK Localement

```bash
# Installer ADB (Android Debug Bridge)
# Sur Replit, utiliser l'émulateur en ligne ou appareil physique

# Installer l'APK sur un appareil Android
adb install app-release.apk

# Ou utiliser Firebase App Distribution pour tester
```

## 📤 Soumission au Play Store

### 1. Créer l'Application sur Play Console

1. Aller sur https://play.google.com/console
2. Cliquer sur **"Créer une application"**
3. Informations :
   - **Nom** : Carflex - Abonnement Automobile
   - **Langue par défaut** : Français (France)
   - **Type** : Application
   - **Gratuit ou payant** : Gratuit

### 2. Remplir les Informations de l'Application

#### Fiche du Store

**Titre** (max 30 caractères) :
```
Carflex - Abonnement Auto
```

**Description courte** (max 80 caractères) :
```
Abonnez-vous à une voiture flexible au Maroc. Budget, Confort ou Premium.
```

**Description complète** (max 4000 caractères) :
```
🚗 Carflex - La nouvelle façon de conduire au Maroc

Carflex révolutionne l'accès à l'automobile avec des abonnements flexibles sans engagement. 
Choisissez votre véhicule selon vos besoins du moment.

✨ 3 FORMULES AU CHOIX

🔹 ESSENTIEL - 2 499 DH/mois
• Dacia Sandero, Logan, Renault Clio
• 1 500 km par mois
• Assurance tous risques incluse
• 1 changement de véhicule par mois

🔹 CONFORT - 3 999 DH/mois
• Peugeot 208, Hyundai i10, Kia Picanto
• 2 500 km par mois
• Assistance VIP 24/7
• 2 changements de véhicule par mois

🔹 PREMIUM - 6 999 DH/mois
• BMW Série 3, Mercedes Classe A, Audi A3
• Kilométrage illimité
• Service conciergerie 24/7
• Changements illimités

🎁 TOUT INCLUS DANS VOTRE ABONNEMENT

✅ Assurance tous risques
✅ Entretien et réparations
✅ Assistance routière 24/7
✅ Véhicule de remplacement
✅ Changement de véhicule flexible
✅ Livraison et reprise incluses
✅ Paiement sécurisé CB et Apple Pay

💡 POURQUOI CHOISIR CARFLEX ?

• Pas d'achat, pas d'engagement long terme
• Changez de voiture selon vos besoins
• Tout est inclus, aucun frais caché
• Service client réactif
• Application simple et intuitive

📱 FONCTIONNALITÉS DE L'APP

• Consultation des forfaits disponibles
• Souscription en ligne sécurisée
• Gestion de votre abonnement
• Historique des paiements
• Demande de changement de véhicule
• Support client intégré

🇲🇦 SERVICE DÉDIÉ AU MAROC

Carflex est spécialement conçu pour le marché marocain avec des prix adaptés 
et un service client basé au Maroc.

Téléchargez l'application et roulez dès aujourd'hui !

---
Contact : support@carflex.ma
Site web : https://carflex.replit.app
```

#### Captures d'Écran Requises

**Téléphone** (au moins 2, recommandé 8) :
- Format : PNG ou JPEG
- Dimensions : 320px à 3840px
- Ratio : 16:9 ou 9:16

Vous devrez créer des screenshots de :
1. Page d'accueil
2. Liste des packs
3. Détails d'un pack
4. Formulaire d'inscription
5. Dashboard utilisateur
6. Page de paiement
7. Profil utilisateur
8. Page À propos

#### Icône de l'Application

- **Fichier** : `public/icons/icon-512x512.png`
- **Dimensions** : 512x512 pixels
- **Format** : PNG 32-bit
- **Taille max** : 1 MB

#### Bannière Graphique (Feature Graphic)

- **Dimensions** : 1024x500 pixels
- **Format** : PNG ou JPEG
- **Contenu** : Logo Carflex + slogan

### 3. Classification du Contenu

- **Catégorie** : Auto et véhicules
- **Étiquettes** : Automobile, Abonnement, Location
- **Public cible** : 18+
- **Classification de contenu** : 
  - Pas de violence
  - Pas de contenu explicite
  - Services de paiement intégrés (Stripe)

### 4. Politique de Confidentialité

Vous devez fournir une URL vers votre politique de confidentialité.

Créer une page `/privacy-policy` dans votre application ou héberger sur un site séparé.

**Exemple de contenu minimum** :
```
Politique de Confidentialité - Carflex

Dernière mise à jour : [DATE]

1. Collecte de données
Nous collectons : email, nom, téléphone, adresse pour la gestion des abonnements.

2. Utilisation des données
Les données sont utilisées uniquement pour gérer votre abonnement et vous contacter.

3. Paiements
Les paiements sont traités par Stripe. Nous ne stockons pas vos informations bancaires.

4. Sécurité
Vos données sont chiffrées et stockées de manière sécurisée.

5. Contact
support@carflex.ma
```

### 5. Tarification et Distribution

- **Pays** : Maroc (ajoutez d'autres pays si souhaité)
- **Prix** : Gratuit (l'abonnement se fait dans l'app)
- **Distribution** : Public

### 6. Télécharger l'App Bundle

1. Aller dans **"Production"** → **"Créer une nouvelle version"**
2. Télécharger le fichier `app-release-bundle.aab`
3. Remplir les notes de version :

```
Version 1.0.0 - Première version

• Consultation des forfaits Essentiel, Confort et Premium
• Inscription et connexion sécurisées
• Souscription en ligne avec paiement CB et Apple Pay
• Tableau de bord utilisateur
• Gestion de l'abonnement
• Historique des paiements
• Support client intégré
```

### 7. Soumettre pour Révision

1. Vérifier tous les éléments de la checklist
2. Cliquer sur **"Envoyer pour révision"**
3. Délai de révision : 1 à 7 jours généralement

## 🔄 Mises à Jour Futures

Pour publier une nouvelle version :

```bash
# 1. Incrémenter la version dans twa-manifest.json
"appVersionName": "1.0.1",
"appVersionCode": 2,

# 2. Rebuild l'app bundle
bubblewrap update
bubblewrap build

# 3. Télécharger sur Play Console
# Dans "Production" → "Créer une nouvelle version"
```

## 🎨 Assets Graphiques à Créer

### Liste des Assets Nécessaires

1. **Icône de l'application** : ✅ Déjà créée
   - `public/icons/icon-512x512.png`

2. **Screenshots** (À créer) :
   - Utilisez votre téléphone ou un émulateur
   - Capturez 8 écrans différents de l'application
   - Résolution recommandée : 1080x1920

3. **Feature Graphic** (Bannière) :
   - Dimensions : 1024x500 px
   - Outil : Canva, Figma, Photoshop
   - Contenu : Logo + "Abonnement Automobile Flexible"

4. **Vidéo Promo** (Optionnel) :
   - 30 secondes max
   - Démo de l'application
   - Upload sur YouTube

## 🔐 Sécurité et Conformité

### Digital Asset Links

Le fichier `public/.well-known/assetlinks.json` **DOIT** être accessible à :
```
https://[votre-url].replit.app/.well-known/assetlinks.json
```

Google vérifie automatiquement ce fichier pour valider votre application.

### Permissions Android

L'application TWA demande automatiquement ces permissions :
- INTERNET (obligatoire)
- ACCESS_NETWORK_STATE (vérifier la connectivité)

Aucune permission supplémentaire n'est requise.

## 📊 Suivi et Analytics

### Intégrer Google Analytics (Optionnel)

```typescript
// client/src/analytics.ts
export const trackPageView = (page: string) => {
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: page,
    });
  }
};
```

### Firebase Analytics pour Mobile

Pour des analytics spécifiques Android, considérez Firebase plus tard.

## 🐛 Dépannage

### Problème : "App not verified"

**Solution** : Vérifier que `assetlinks.json` est accessible et que l'empreinte SHA-256 est correcte.

### Problème : "Payment declined"

**Solution** : Stripe fonctionne identiquement sur mobile. Vérifier les clés API.

### Problème : "Service Worker not registered"

**Solution** : Le service worker est seulement actif en production (`import.meta.env.PROD`).

### Problème : "Icons not found"

**Solution** : Vérifier que les fichiers existent dans `public/icons/`.

## 📞 Support

Pour toute question :
- Documentation TWA : https://developer.chrome.com/docs/android/trusted-web-activity/
- Bubblewrap : https://github.com/GoogleChromeLabs/bubblewrap
- Play Console Help : https://support.google.com/googleplay/android-developer

## ✅ Checklist Finale

Avant de soumettre au Play Store :

- [ ] Application web déployée sur Replit
- [ ] Manifest.json accessible publiquement
- [ ] Service worker fonctionnel
- [ ] Icons générées (toutes tailles)
- [ ] Keystore créée et sauvegardée
- [ ] SHA-256 dans assetlinks.json
- [ ] App bundle buildée (.aab)
- [ ] Screenshots créées (minimum 2, recommandé 8)
- [ ] Feature graphic créée (1024x500)
- [ ] Description du store rédigée
- [ ] Politique de confidentialité publiée
- [ ] Compte Play Console créé (25 USD)
- [ ] Classification de contenu complétée

## 🎉 Félicitations !

Une fois approuvée, votre application sera disponible sur le Play Store sous 1 à 7 jours !

Les utilisateurs pourront la télécharger en recherchant "Carflex" sur le Play Store.
