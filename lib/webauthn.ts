
import { 
  startRegistration, 
  startAuthentication 
} from '@simplewebauthn/browser';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * HATI AUTHENTICATOR SERVICE
 * Premium Feature: WebAuthn for verified users
 * Free Tier: Email/Password login
 */

// ==================== FREE TIER: EMAIL/PASSWORD ====================

export const registerWithEmail = async (email: string, password: string, name: string) => {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCred.user.uid;

    // Store user profile immediately
    const now = new Date();
    await setDoc(doc(db, 'users', userId), {
      email,
      name,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
      plan: 'free',
      webauthnEnabled: false,
      biometricRequired: false
    });

    console.log('User profile created successfully:', userId);
    return { success: true, userId };
  } catch (err) {
    console.error('REGISTRATION_FAILED:', err);
    throw err;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, userId: userCred.user.uid };
  } catch (err) {
    console.error('LOGIN_FAILED:', err);
    throw err;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    console.error('LOGOUT_FAILED:', err);
    throw err;
  }
};

// ==================== PREMIUM FEATURE: WebAuthn ====================

export const registerPasskey = async (userId: string) => {
  try {
    // Check if user has premium
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    
    if (userData?.plan !== 'premium') {
      throw new Error('WebAuthn requires premium subscription');
    }

    const options = {
      challenge: new Uint8Array(32),
      rp: { name: 'HATI Medical Registry', id: 'hati-certified.web.app' },
      user: { 
        id: new TextEncoder().encode(userId),
        name: userData.email,
        displayName: userData.name 
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: { 
        authenticatorAttachment: 'platform',
        userVerification: 'preferred' 
      },
      timeout: 60000,
      attestation: 'none'
    };

    const regResponse = await startRegistration(options as any);

    // Store credential
    await setDoc(doc(db, 'users', userId, 'credentials', 'passkey'), {
      credentialID: regResponse.id,
      credentialPublicKey: regResponse.response.publicKey,
      credentialCounter: 0,
      transports: regResponse.response.transports,
      createdAt: new Date(),
      verified: true
    });

    // Update user to enable WebAuthn
    await setDoc(doc(db, 'users', userId), { webauthnEnabled: true }, { merge: true });

    return { verified: true };
  } catch (err) {
    console.error('PASSKEY_REG_FAILED:', err);
    throw err;
  }
};

export const loginWithPasskey = async (userId: string) => {
  try {
    const credentialDoc = await getDoc(doc(db, 'users', userId, 'credentials', 'passkey'));
    if (!credentialDoc.exists()) throw new Error('No passkey registered');

    const options = {
      challenge: new Uint8Array(32),
      timeout: 60000,
      userVerification: 'preferred'
    };

    const authResponse = await startAuthentication(options as any);

    // Simplified verification (in future, use Cloud Functions for secure verification)
    if (authResponse) {
      return { verified: true };
    }

    return { verified: false };
  } catch (err) {
    console.error('PASSKEY_AUTH_FAILED:', err);
    throw err;
  }
};
