# 🎵 Music Academy

Application web développée avec Next.js permettant de gérer une académie de musique.

## Fonctionnalités

- Authentification (Admin / Student)
- Gestion des étudiants
- Gestion des cours
- Gestion des inscriptions
- Création et gestion d’événements
- Paiement en ligne avec Stripe
- Génération de tickets avec QR code
- Scan et validation des tickets

---

## 🛠️ Technologies utilisées

- Next.js (App Router)
- Prisma
- PostgreSQL (Neon)
- Stripe
- Tailwind CSS

---

## ⚙️ Installation

1. Cloner le projet :

```bash
git clone <repo-url>
cd music-academy
```



2. Installer les dépendances :

```
pnpm install
```


3. Créer un fichier .env :

```
# ======================
# DATABASE
# ======================

DATABASE_URL=""
DIRECT_URL=""

# ======================
# STRIPE
# ======================

STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# ======================
# EMAIL (Resend)
# ======================

RESEND_API_KEY=""

# ======================
# APP URL=""
# ======================

APP_URL=""
SESSION_SECRET=""
```


4. Lancer le serveur :

```
pnpm dev
```

```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

