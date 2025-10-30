
# mkexpensecollectionfigma

This is a Vite + React code bundle for mkexpensecollectionfigma. The original project is available at https://www.figma.com/design/uvXXQ7u8q69o1TnBCP0aEr/mkexpensecollectionfigma.

## Prerequisites

- Node.js 18+
- npm 9+
- Firebase CLI (`npm install -g firebase-tools`) or use `npx firebase`

## Setup

1. Install dependencies: `npm install`
2. Create a `.env` file (if required by Supabase or other services) and ensure the values are prefixed with `VITE_` so Vite exposes them to the client.
3. Update `.firebaserc` with your Firebase project id:
   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```

## Development

- Start the dev server: `npm run dev`
- Preview a production build locally: `npm run preview`

## Build

The production build outputs to the `build/` directory, which is already configured for Firebase Hosting.

```
npm run build
```

## Deploy to Firebase Hosting

1. Log in to Firebase (only needed once): `firebase login`
2. Verify the target project: `firebase projects:list`
3. Run the deployment script (builds and deploys): `npm run deploy`

The included `firebase.json` handles SPA rewrites so that client-side routing works on Firebase Hosting.
