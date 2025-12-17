# Waqt Lkhair - وقت الخير

> Application mobile de gestion des initiatives de bienfaisance locales

![React Native](https://img.shields.io/badge/React_Native-Expo-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📱 Description

**Waqt Lkhair** (وقت الخير - "Le Temps du Bien") est une application mobile permettant aux individus et associations de :

- 🎯 Créer des campagnes de bienfaisance locales
- 📦 Gérer des besoins matériels et humains
- 📊 Suivre l'avancement en temps réel
- 🗺️ Localiser les points de collecte
- 🤝 Coordonner dons et bénévolat
- 💬 Communiquer de manière transparente

### Cas d'usage

- 🌙 Ramadan
- 🎁 Aïd
- ❄️ Hiver
- 🏘️ Actions de quartier

## 🚀 Installation

### Prérequis

- Node.js (v18+)
- npm ou yarn
- Expo CLI
- iOS Simulator ou Android Emulator (optionnel)

### Étapes

```bash
# Cloner le projet
git clone <repository-url>
cd waqt-lkhair

# Installer les dépendances
npm install

# Lancer l'application
npx expo start
```

### Options de lancement

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Web
npx expo start --web
```

## 🛠️ Stack Technique

### Core
- **React Native** (Expo SDK 50)
- **TypeScript** 5.1

### Navigation
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`

### State Management
- **Zustand** - État global
- **AsyncStorage** - Persistance locale

### Carte & Localisation
- `expo-location`
- `react-native-maps`

### Notifications
- `expo-notifications`

### UI
- `@expo/vector-icons`
- Custom components

## 📂 Structure du Projet

```
src/
├── app/
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainTabs.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── campaigns/
│   │   │   ├── CampaignListScreen.tsx
│   │   │   ├── CampaignDetailsScreen.tsx
│   │   │   ├── CreateCampaignScreen.tsx
│   │   │   └── EngagementScreen.tsx
│   │   ├── map/
│   │   │   └── MapScreen.tsx
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   ├── components/
│   │   ├── CampaignCard.tsx
│   │   ├── ProgressBar.tsx
│   │   └── PrimaryButton.tsx
│   ├── store/
│   │   ├── auth.store.ts
│   │   └── campaign.store.ts
│   ├── services/
│   │   ├── fakeApi.ts
│   │   └── notification.service.ts
│   ├── types/
│   │   └── models.ts
│   └── utils/
│       ├── theme.ts
│       └── helpers.ts
├── assets/
└── App.tsx
```

## 👥 Modèle Utilisateur

### Utilisateur Standard
- Consulter les campagnes
- S'engager (don ou bénévolat)
- Recevoir des rappels

### Créateur de Campagne
- Créer / modifier / supprimer des campagnes
- Publier des mises à jour
- Suivre l'avancement

## 🎨 Design

- **Couleurs principales** : Vert doux (#2D5A3D), Beige (#D4A574), Blanc
- **Style** : Spirituel, moderne, épuré
- **Typographie** : System fonts avec hiérarchie claire

## 📱 Fonctionnalités

### 1. Gestion des Campagnes
- Création avec titre, description, objectif
- Dates de début/fin
- Liste des besoins (matériel/bénévolat)
- Points de collecte

### 2. Suivi des Besoins
- Barre de progression dynamique
- Engagement avec quantité
- Créneaux horaires pour bénévolat

### 3. Carte Interactive
- Points de collecte
- Zones de distribution
- Géolocalisation utilisateur

### 4. Notifications
- Rappels d'engagement
- Mises à jour de campagne
- Messages de remerciement

### 5. Communication
- Section "Mises à jour"
- Historique des engagements

## 🔐 Authentification

L'application utilise une authentification simulée (fake auth) :
- Écran de connexion
- Bouton "Connexion rapide" pour la démo
- Session persistée via AsyncStorage

## 📄 License

MIT License - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤲 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

**Fait avec ❤️ au Maroc**
