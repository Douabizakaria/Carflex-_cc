# ❓ Pourquoi y a-t-il un Placeholder SHA-256 ?

## Question Fréquente

Vous voyez dans `public/.well-known/assetlinks.json` :

```json
"sha256_cert_fingerprints": [
  "PLACEHOLDER_SHA256_FINGERPRINT"
]
```

**Pourquoi ce placeholder ?**

## 🔐 Explication Technique

L'empreinte SHA-256 est **générée à partir de votre clé de signature Android** (keystore).

**Problème** : Cette clé n'existe pas encore ! Elle sera créée par **VOUS** lors du processus de déploiement.

## 📋 Le Workflow Correct

### Étape 1 : Code Source (MAINTENANT)
- ✅ Le code source contient un placeholder
- ✅ C'est **normal** et **attendu**
- ✅ Le placeholder sera remplacé par VOUS plus tard

### Étape 2 : Générer Votre Keystore
```bash
# Cette commande crée VOTRE clé unique
keytool -genkey -v -keystore android.keystore \
  -alias carflex-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### Étape 3 : Extraire Votre SHA-256
```bash
# Cette commande affiche VOTRE empreinte unique
keytool -list -v -keystore android.keystore -alias carflex-key
```

### Étape 4 : Remplacer le Placeholder
```json
// Avant
"sha256_cert_fingerprints": [
  "PLACEHOLDER_SHA256_FINGERPRINT"  // ❌ Temporaire
]

// Après (avec VOTRE empreinte)
"sha256_cert_fingerprints": [
  "A1B2C3D4E5F6..."  // ✅ Votre empreinte réelle
]
```

### Étape 5 : Redéployer
```bash
npm run build
# Puis déployer sur Replit
```

### Étape 6 : Vérifier
```bash
curl https://VOTRE-URL.replit.app/.well-known/assetlinks.json
# Doit afficher VOTRE empreinte, pas le placeholder
```

## ⚠️ Pourquoi C'est Impossible de Fournir une Vraie Empreinte Maintenant

1. **Sécurité** : Chaque développeur DOIT avoir sa propre clé unique
2. **Propriété** : VOUS seul devez contrôler la clé de signature
3. **Play Store** : Google vérifie que la clé appartient au bon développeur
4. **Mises à jour** : Sans VOTRE clé, vous ne pourrez jamais mettre à jour l'app

## 🔒 Sécurité de la Clé

**IMPORTANT** :
- ⚠️ **Ne JAMAIS partager** votre keystore
- ⚠️ **Ne JAMAIS commiter** android.keystore dans Git
- ⚠️ **Sauvegarder** le keystore et le mot de passe en lieu sûr
- ⚠️ **Sans cette clé**, vous ne pourrez JAMAIS mettre à jour l'app sur Play Store

## ✅ Résumé

| Statut | Description |
|--------|-------------|
| **Code Source** | Placeholder → Normal et attendu |
| **Avant Déploiement** | Générer keystore → Extraire SHA-256 |
| **Mise à jour** | Remplacer placeholder par vraie empreinte |
| **Après Déploiement** | Vraie empreinte → Application validée |

## 🎯 Action Requise

**Quand le moment viendra** de déployer sur Play Store :

1. Suivre `CRITICAL_SETUP_STEPS.md`
2. Générer votre keystore
3. Extraire l'empreinte SHA-256
4. Remplacer le placeholder
5. Redéployer
6. Vérifier avec curl
7. Builder l'APK avec Bubblewrap

**Pour l'instant** : Le placeholder est correct, ne le modifiez pas tant que vous n'avez pas généré votre keystore !

## 📞 Besoin d'Aide ?

Consultez :
- `CRITICAL_SETUP_STEPS.md` - Checklist complète
- `ANDROID_DEPLOYMENT_GUIDE.md` - Guide détaillé étape par étape
- `QUICK_START_ANDROID.md` - Guide rapide 5 minutes
