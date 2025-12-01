# 🚀 Guide Rapide - Déployer Carflex sur Android

## En 5 Minutes

### Étape 1 : Déployer l'Application Web

1. Dans Replit, cliquez sur **"Deploy"**
2. Sélectionnez **"Autoscale"**
3. Notez votre URL : `https://[votre-nom].replit.app`

### Étape 2 : Mettre à Jour la Configuration

Modifiez `twa-manifest.json` :

```json
{
  "host": "VOTRE-URL.replit.app",  // ← Remplacez ici
  ...
}
```

### Étape 3 : Installer Bubblewrap

```bash
npm install -g @bubblewrap/cli
```

### Étape 4 : Générer l'APK

```bash
# Initialiser
bubblewrap init --manifest=https://VOTRE-URL.replit.app/manifest.json

# Builder
bubblewrap build
```

### Étape 5 : Soumettre au Play Store

1. Créer un compte développeur : https://play.google.com/console (25 USD)
2. Créer une nouvelle application
3. Télécharger `app-release-bundle.aab`
4. Remplir les informations du store
5. Soumettre pour révision

## 📋 Ce Qu'il Vous Faut

- [ ] Compte Google Play Console (25 USD)
- [ ] 8 screenshots de l'application
- [ ] 1 feature graphic (1024x500px)
- [ ] Politique de confidentialité
- [ ] Description de l'application

## 📖 Documentation Complète

Consultez `ANDROID_DEPLOYMENT_GUIDE.md` pour toutes les étapes détaillées.

## ⚡ Raccourci

Si vous voulez juste **tester** l'APK avant le Play Store :

```bash
bubblewrap build
adb install app-release.apk
```

## 🎯 Résultat

Votre application Carflex sera sur le Play Store en **1-7 jours** après soumission !
