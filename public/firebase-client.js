// Firebase Client Initializer & Google Workspace Auth Provider
let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let googleAccessToken = null;

const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/meetings.space.created'
];

function handleFirestoreError(error, operation, collection) {
  const code = error?.code || 'unknown';
  let message = 'An unexpected database error occurred.';
  if (code === 'permission-denied') {
    message = `Permission denied: You do not have permission to ${operation} in ${collection}.`;
  } else if (code === 'not-found') {
    message = `Document not found in ${collection}.`;
  } else if (code === 'already-exists') {
    message = `Document already exists in ${collection}.`;
  } else if (code === 'unauthenticated') {
    message = 'Please sign in to perform this action.';
  } else if (error?.message) {
    message = error.message;
  }
  console.error(`[Firestore Error] ${operation} on ${collection}:`, error);
  return { code, message, operation, collection };
}

async function initFirebase() {
  if (firebaseApp) return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
  try {
    const res = await fetch('/api/firebase-config');
    if (!res.ok) return null;
    const config = await res.json();
    if (!window.firebase) {
      console.warn('Firebase SDK scripts not loaded yet');
      return null;
    }
    if (!window.firebase.apps.length) {
      firebaseApp = window.firebase.initializeApp(config);
    } else {
      firebaseApp = window.firebase.app();
    }
    firebaseAuth = window.firebase.auth();
    firestoreDb = window.firebase.firestore();
    return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
  } catch (err) {
    console.error('Could not initialize Firebase:', err);
    return null;
  }
}

async function signInWithGoogleWorkspace() {
  const fb = await initFirebase();
  if (!fb || !fb.auth) throw new Error('Firebase Auth is not available.');
  
  const provider = new window.firebase.auth.GoogleAuthProvider();
  WORKSPACE_SCOPES.forEach(scope => provider.addScope(scope));

  const result = await fb.auth.signInWithPopup(provider);
  const credential = result.credential;
  if (credential && credential.accessToken) {
    googleAccessToken = credential.accessToken;
    window.googleWorkspaceAccessToken = googleAccessToken;
    // Notify server to remember session token
    await fetch('/api/google/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: googleAccessToken })
    }).catch(() => {});
  }

  const user = result.user;
  // Sync with local backend
  const syncRes = await fetch('/api/auth/firebase-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      token: googleAccessToken
    })
  });
  const syncData = await syncRes.json();
  if (!syncRes.ok) throw new Error(syncData.error || 'Server sync failed.');

  // Also sync to Cloud Firestore
  try {
    if (fb.db) {
      await fb.db.collection('users').doc(user.uid).set({
        uid: user.uid,
        name: user.displayName || 'Google User',
        email: user.email,
        role: syncData.user?.role || 'user',
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (fsErr) {
    handleFirestoreError(fsErr, 'update', 'users');
  }

  return { user: syncData.user, token: googleAccessToken };
}

window.initFirebase = initFirebase;
window.signInWithGoogleWorkspace = signInWithGoogleWorkspace;
window.handleFirestoreError = handleFirestoreError;
