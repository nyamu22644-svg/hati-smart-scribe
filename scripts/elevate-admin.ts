
import { adminAuth, adminDb } from '../lib/firebaseAdmin';

/**
 * HATI AUTHORITY: ELEVATION UTILITY
 * Usage: Run via local node environment with valid service account credentials.
 * 
 * Example: elevateToAdmin('your@email.com');
 */
export async function elevateToAdmin(email: string) {
  try {
    console.log(`HATI_AUTHORITY: Initiating elevation for ${email}...`);
    
    // 1. Fetch user from Auth
    const user = await adminAuth.getUserByEmail(email);
    
    // 2. Set Custom Claims (RBAC Security Layer)
    // Custom claims are persistent and included in the JWT
    await adminAuth.setCustomUserClaims(user.uid, { 
      role: 'admin',
      elevatedAt: Date.now() 
    });
    
    // 3. Update Firestore (UI Visibility Layer)
    await adminDb.collection('users').doc(user.uid).set({
      role: 'admin',
      updatedAt: Date.now()
    }, { merge: true });

    console.log(`HATI_AUTHORITY: SUCCESS. ${email} has been granted Admin clearance.`);
    console.log(`HATI_AUTHORITY: User must logout and back in for claims to refresh.`);
    
  } catch (error: any) {
    console.error(`HATI_AUTHORITY: ELEVATION_FAILED`, error.message);
  }
}
