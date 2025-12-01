# Carflex Security Documentation

## Vue d'ensemble

Carflex implémente une sécurité de niveau entreprise pour protéger les données des utilisateurs et prévenir les attaques courantes.

## Mesures de sécurité implémentées

### 1. Protection des en-têtes HTTP (Helmet.js)

- **Content Security Policy (CSP)**: Prévient les attaques XSS en contrôlant les sources de contenu
- **HSTS**: Force HTTPS avec `max-age` de 1 an et préchargement
- **X-Frame-Options**: DENY pour prévenir le clickjacking
- **X-Content-Type-Options**: nosniff pour prévenir le MIME sniffing
- **X-XSS-Protection**: Protection XSS du navigateur activée
- **Referrer-Policy**: Contrôle strict des informations de référence
- **Permissions-Policy**: Désactive les APIs sensibles (géolocalisation, microphone, caméra)

### 2. Rate Limiting

Trois niveaux de rate limiting sont implémentés :

#### Auth Rate Limiter
- **Limite**: 5 requêtes par 15 minutes par IP
- **Routes protégées**: `/api/auth/register`, `/api/auth/login`
- **Protection contre**: Brute force, credential stuffing

#### General Rate Limiter
- **Limite**: 100 requêtes par 15 minutes par IP
- **Scope**: Toutes les routes API
- **Protection contre**: DoS, abus de l'API

#### Admin Rate Limiter
- **Limite**: 50 requêtes par 15 minutes par IP
- **Routes protégées**: Toutes les routes `/api/admin/*`
- **Protection contre**: Abus des privilèges admin

### 3. Authentification et autorisation

#### JWT (JSON Web Tokens)
- Tokens signés avec clé secrète
- Expiration automatique après 7 jours
- Validation obligatoire sur toutes les routes protégées

#### Middleware d'authentification
- Vérification du token Bearer dans chaque requête
- Extraction et validation de l'utilisateur
- Blocage des requêtes non authentifiées

#### Middleware administrateur
- Double vérification : authentification + role admin
- Séparation stricte des privilèges
- Logging de toutes les actions admin

### 4. Gestion des mots de passe

#### Validation de la force
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre

#### Hachage
- Algorithme: bcrypt
- Cost factor: 10 (2^10 itérations)
- Salage automatique

#### Stockage
- Jamais en clair
- Exclusion des réponses API
- Vérification par comparaison de hash

### 5. Validation et sanitization des entrées

#### Validation email
- Format RFC 5322
- Longueur maximale: 254 caractères
- Vérification de structure

#### Détection de patterns suspects
- Patterns SQL injection (OR, AND, UNION, DROP, etc.)
- Commentaires SQL (-- , /*, */)
- Points-virgules malveillants

#### Sanitization automatique
- Trim des espaces
- Limite de longueur: 10KB par champ
- Protection contre parameter pollution

### 6. Protection CORS (Cross-Origin Resource Sharing)

#### Configuration
- **Development**: localhost:5000, 127.0.0.1:5000
- **Production**: Domaine spécifique uniquement
- **Credentials**: Activés
- **Méthodes**: GET, POST, PUT, PATCH, DELETE
- **Headers**: Content-Type, Authorization uniquement

### 7. Protection contre les injections

#### SQL Injection
- ORM Drizzle avec requêtes préparées
- Validation Zod des inputs
- Détection de patterns suspects
- Pas de SQL brut dans le code métier

#### XSS (Cross-Site Scripting)
- Content Security Policy
- X-XSS-Protection header
- Sanitization des inputs
- Échappement automatique dans le frontend

### 8. Logging et monitoring

#### Actions sensibles loggées
- Connexions/déconnexions
- Créations de compte
- Actions administrateur (CRUD users, packs, subscriptions)
- Modifications de rôles
- Accès aux données sensibles

#### Format des logs
```
[SECURITY] {operation} - User: {email} - IP: {ip}
[SESSION] Active - User: {email} - IP: {ip}
```

### 9. Limites de taille

- **Payload JSON**: 10MB maximum
- **Champs texte**: 10KB maximum
- **Requêtes**: Validation de Content-Length

### 10. Protection des sessions

- Tokens JWT avec expiration
- Pas de sessions serveur (stateless)
- Révocation automatique en cas d'erreur
- Vérification à chaque requête

## Routes sécurisées

### Routes publiques
- `GET /api/packs` - Liste des packs
- `POST /api/auth/register` - Inscription (rate limited)
- `POST /api/auth/login` - Connexion (rate limited)

### Routes authentifiées
- `GET /api/auth/me` - Profil utilisateur
- `GET /api/subscriptions` - Abonnements de l'utilisateur
- `POST /api/subscriptions` - Créer un abonnement
- `POST /api/messages` - Envoyer un message

### Routes administrateur
- `GET /api/admin/stats` - Statistiques (rate limited, logged)
- `GET /api/admin/users` - Liste utilisateurs (rate limited, logged)
- `PATCH /api/admin/users/:id` - Modifier utilisateur (rate limited, logged)
- `GET /api/admin/subscriptions` - Liste abonnements (rate limited, logged)
- `PATCH /api/admin/subscriptions/:id` - Modifier abonnement (rate limited, logged)
- `GET /api/admin/packs` - Liste packs (rate limited, logged)
- `POST /api/admin/packs` - Créer pack (rate limited, logged)
- `PATCH /api/admin/packs/:id` - Modifier pack (rate limited, logged)
- `DELETE /api/admin/packs/:id` - Supprimer pack (rate limited, logged)

## Bonnes pratiques à suivre

### Pour les développeurs

1. **Ne jamais** stocker de secrets dans le code
2. **Toujours** valider les inputs côté serveur
3. **Toujours** utiliser les middlewares de sécurité
4. **Ne jamais** désactiver les rate limiters en production
5. **Toujours** logger les actions sensibles
6. **Ne jamais** exposer les erreurs détaillées aux clients

### Pour le déploiement

1. Configurer `SESSION_SECRET` avec une valeur forte (>32 caractères aléatoires)
2. Mettre à jour les domaines CORS autorisés
3. Activer HTTPS en production
4. Configurer les variables d'environnement de production
5. Monitorer les logs de sécurité
6. Mettre en place des alertes pour les tentatives d'attaque

### Pour les administrateurs

1. Utiliser des mots de passe forts
2. Ne jamais partager les credentials admin
3. Surveiller les logs d'activité admin
4. Révoquer immédiatement les comptes compromis
5. Auditer régulièrement les utilisateurs admin

## Tests de sécurité recommandés

1. **Penetration testing**: Tests d'intrusion réguliers
2. **OWASP Top 10**: Vérification de conformité
3. **Dependency scanning**: Audit des dépendances npm
4. **Code review**: Révision de code orientée sécurité
5. **Rate limit testing**: Vérifier les limites de requêtes
6. **Authentication testing**: Tests de bypass d'authentification

## Conformité

Cette implémentation suit les standards de sécurité :
- OWASP Top 10 (2021)
- CWE/SANS Top 25
- GDPR (protection des données)
- PCI DSS (si traitement de paiements)

## Mises à jour de sécurité

- Mettre à jour les dépendances régulièrement
- Surveiller les CVE (Common Vulnerabilities and Exposures)
- Appliquer les patches de sécurité immédiatement
- Tester après chaque mise à jour

## Contact sécurité

En cas de découverte de vulnérabilité, contacter immédiatement l'équipe de développement.

---

**Dernière mise à jour**: 2025-10-28
**Version**: 1.0.0
