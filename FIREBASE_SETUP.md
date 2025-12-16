# 🔥 Firebase Setup Guide

## Quick Start

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter a project name (e.g., "FashionStoreApp")
4. Follow the wizard to create the project

### Step 2: Enable Authentication
1. In your project, go to **Build → Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **Email/Password** provider

### Step 3: Create Firestore Database
1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select a location closest to your users

### Step 4: Add Security Rules
1. In Firestore, go to **"Rules"** tab
2. Copy the rules from `app/config/firestore.rules.js`
3. Paste and click **"Publish"**

### Step 5: Get Your Config
1. Go to **Project settings** (gear icon ⚙️)
2. Scroll down to **"Your apps"**
3. Click **"Web"** icon (</>) to add a web app
4. Register the app and copy the config values

### Step 6: Add Config to Your App

Edit the `.env` file and add your values:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 7: Restart the App
```bash
npx expo start --clear
```

---

## 🔒 Security Features

### ✅ Built-in Protections:
- **Rate Limiting**: 5 login attempts/minute, 3 registration attempts/5 minutes
- **Input Sanitization**: Prevents XSS and injection attacks
- **Secure Password Storage**: Hashed passwords with salt
- **Token Management**: Secure storage with expo-secure-store
- **HTTPS Only**: All Firebase communications are encrypted

### ✅ Firestore Security Rules:
- Users can only read/write their own data
- Products are read-only for customers
- Orders cannot be deleted (audit trail)
- Admin-only operations for product management

---

## 📱 How It Works

### With Firebase (Production Mode):
- Real-time authentication via Firebase Auth
- Cloud database with Firestore
- Secure user data management
- Order synchronization across devices

### Without Firebase (Demo Mode):
- Local authentication using SecureStore
- Offline-first with local data
- Works on simulators/emulators
- Great for testing and development

---

## 🚀 Seeding Initial Data

Once Firebase is configured, you can seed your product data:

```javascript
// In any component or screen
import { seedProductsToFirestore, seedCategoriesToFirestore } from '../services/firestoreProducts';

// Call once to populate database
await seedCategoriesToFirestore();
await seedProductsToFirestore();
```

---

## 🛠️ Troubleshooting

### "Firebase not configured" warning
- Check that your `.env` file has the correct values
- Make sure values don't contain quotes
- Restart the development server with `--clear`

### Auth errors
- Verify Email/Password is enabled in Firebase console
- Check your API key is correct
- Ensure your domain is whitelisted

### Firestore permission errors
- Check your security rules are published
- Verify user is authenticated for protected operations
- Check Firestore indexes if using complex queries

---

## 📞 Support

Need help? Create an issue or contact support@yourstore.com
