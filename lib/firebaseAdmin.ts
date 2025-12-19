
import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

/**
 * HATI Financial Security Layer - Firebase Admin
 * Handles authoritative writes for user subscription status.
 */
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig),
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

/**
 * ELEVATION SCRIPT (To be run manually or via internal API)
 * 
 * async function elevateToAdmin(email: string) {
 *   const user = await adminAuth.getUserByEmail(email);
 *   // Set Custom Claims for RBAC security
 *   await adminAuth.setCustomUserClaims(user.uid, { role: 'super_admin' });
 *   // Update Firestore record for UI persistence
 *   await adminDb.collection('users').doc(user.uid).update({ role: 'super_admin' });
 *   console.log(`HATI_AUTHORITY: Elevated ${email} to Super Admin.`);
 * }
 */
