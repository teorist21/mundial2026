# Mundial 2026 — Οδηγίες Deploy

## Βήματα

### 1. Εγκατάσταση dependencies
```
npm install
```

### 2. Test τοπικά (προαιρετικό)
```
npm start
```
Ανοίγει στο http://localhost:3000

### 3. Build για production
```
npm run build
```
Δημιουργεί φάκελο `build/`

### 4. Deploy στο Netlify
- Πήγαινε στο **netlify.com** → Sign up/Login με GitHub ή email
- Κλικ **"Add new site"** → **"Deploy manually"**
- Drag & drop τον φάκελο `build/` στη σελίδα
- Παίρνεις URL: `https://random-name.netlify.app`
- (Προαιρετικό) Άλλαξε το URL: Site settings → Change site name → π.χ. `mundial2026`

### 5. Firebase Security Rules
Στο Firebase Console → Realtime Database → Rules:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
(Ασφαλές γιατί μόνο οι 3 χρήστες γνωρίζουν το URL)

## PINs
- Teo: 1111 (admin)
- Νίκος: 2222
- Τάσος: 3333

## Προσθήκη στην αρχική οθόνη
- **iPhone**: Safari → Share → "Add to Home Screen"
- **Samsung**: Chrome → ⋮ → "Add to Home screen"
